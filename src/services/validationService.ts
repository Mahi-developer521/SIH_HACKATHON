import { CaseReport } from '../types/surveillance';
import { CANONICAL_SYMPTOMS } from '../data/mockData';

export interface ValidationResult {
  isValid: boolean;
  notes: string[];
  standardizedSymptoms: string[];
  cleanCase?: Partial<CaseReport>;
}

export class ValidationService {
  /**
   * Validates a raw farmer case submission before AI processing
   * Allows multiple distinct reports from the same farmer across different herds/pens/events.
   */
  static validateReport(raw: {
    farmerId: string;
    animalType: string;
    totalAnimals: number;
    sickCount: number;
    deadCount: number;
    symptoms: string[];
    coordinates: { lat: number; lng: number };
    existingCases?: CaseReport[];
  }): ValidationResult {
    const errors: string[] = [];
    const notes: string[] = [];

    // 1. Required fields check
    if (!raw.animalType) {
      errors.push('Missing animal type.');
    }

    if (raw.totalAnimals <= 0) {
      errors.push('Total herd size must be greater than 0.');
    }

    if (raw.sickCount < 0) {
      errors.push('Sick count cannot be negative.');
    }

    if (raw.sickCount > raw.totalAnimals) {
      errors.push('Sick count exceeds declared total herd size.');
    }

    if (raw.deadCount < 0) {
      errors.push('Dead count cannot be negative.');
    }

    if (raw.deadCount > raw.totalAnimals) {
      errors.push('Dead count exceeds declared total herd size.');
    }

    if (raw.sickCount === 0 && raw.deadCount === 0) {
      errors.push('At least one animal must be reported sick or dead.');
    }

    // 2. GPS validation
    const { lat, lng } = raw.coordinates;
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      errors.push('Invalid GPS coordinates.');
    }

    // 3. Multi-Report / Sequential Report Support
    // Notice: We allow farmers to report multiple times. We tag sequential reports rather than blocking them.
    if (raw.existingCases && raw.existingCases.length > 0) {
      const existingFarmerReports = raw.existingCases.filter(c => c.farmerId === raw.farmerId);
      if (existingFarmerReports.length > 0) {
        notes.push(`Sequential observation: Farmer report #${existingFarmerReports.length + 1} logged.`);
      }
    }

    // 4. Standardize symptoms
    const standardizedSymptoms: string[] = [];
    if (!raw.symptoms || raw.symptoms.length === 0) {
      errors.push('At least one symptom must be selected.');
    } else {
      raw.symptoms.forEach(sym => {
        const match = CANONICAL_SYMPTOMS.find(c => 
          c.toLowerCase().includes(sym.toLowerCase()) || sym.toLowerCase().includes(c.toLowerCase())
        );
        if (match && !standardizedSymptoms.includes(match)) {
          standardizedSymptoms.push(match);
        } else if (!standardizedSymptoms.includes(sym)) {
          standardizedSymptoms.push(sym);
        }
      });
    }

    const isValid = errors.length === 0;

    return {
      isValid,
      notes: errors.length > 0 ? errors : notes.length > 0 ? notes : ['Data integrity verified: clean coordinates, valid counts, standardized symptoms.'],
      standardizedSymptoms
    };
  }
}
