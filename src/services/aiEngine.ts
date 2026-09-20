import { CaseReport, DiseaseCluster, RiskLevel, Coordinates } from '../types/surveillance';

export interface AiAnalysisOutput {
  riskScore: number;
  riskLevel: RiskLevel;
  aiReasons: string[];
  recommendedAction: string;
  detectedCluster?: DiseaseCluster;
}

export class AiEngine {
  /**
   * Calculates distance in kilometers between two coordinates using Haversine formula
   */
  static getDistanceKm(coord1: Coordinates, coord2: Coordinates): number {
    const R = 6371; // Earth's radius in km
    const dLat = (coord2.lat - coord1.lat) * (Math.PI / 180);
    const dLon = (coord2.lng - coord1.lng) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(coord1.lat * (Math.PI / 180)) *
      Math.cos(coord2.lat * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Evaluates a validated case report against historical context and surrounding cases
   */
  static analyzeCase(
    newCase: Omit<CaseReport, 'riskScore' | 'riskLevel' | 'aiReasons' | 'recommendedAction'>,
    existingCases: CaseReport[]
  ): AiAnalysisOutput {
    let score = 15; // Baseline score
    const reasons: string[] = [];

    // 1. Symptom Severity Analysis
    const acuteVesicular = newCase.symptoms.some(s => 
      s.toLowerCase().includes('blister') || 
      s.toLowerCase().includes('vesicle') || 
      s.toLowerCase().includes('salivation')
    );
    const highFever = newCase.symptoms.some(s => s.toLowerCase().includes('fever'));
    const suddenDeath = newCase.symptoms.some(s => s.toLowerCase().includes('death') || s.toLowerCase().includes('unexplained'));
    const skinNodules = newCase.symptoms.some(s => s.toLowerCase().includes('nodule') || s.toLowerCase().includes('lump'));

    if (acuteVesicular) {
      score += 25;
      reasons.push('Acute vesicular / oral lesion pattern (high priority transboundary disease indicator)');
    }
    if (highFever) {
      score += 10;
      reasons.push('High febrile reaction detected');
    }
    if (skinNodules) {
      score += 20;
      reasons.push('Pox-like nodular lesions observed');
    }

    // 2. Mortality Impact
    if (newCase.deadCount > 0) {
      const mortalityRate = (newCase.deadCount / newCase.totalAnimals) * 100;
      score += Math.min(25, Math.round(15 + mortalityRate / 4));
      reasons.push(`Mortality recorded (${newCase.deadCount} deceased, ${mortalityRate.toFixed(1)}% of herd)`);
    }

    // 3. Spatio-Temporal Clustering & Nearby Cases
    const nearbyRecentCases = existingCases.filter(c => {
      const dist = this.getDistanceKm(newCase.coordinates, c.coordinates);
      return dist <= 10 && c.status !== 'CONTAINED'; // within 10 km
    });

    if (nearbyRecentCases.length >= 2) {
      score += 20;
      reasons.push(`Geospatial cluster: ${nearbyRecentCases.length} active cases detected within 10km radius`);
      
      const similarSymptoms = nearbyRecentCases.filter(c => 
        c.symptoms.some(s => newCase.symptoms.includes(s))
      );
      if (similarSymptoms.length > 0) {
        score += 10;
        reasons.push('High symptom concordance with surrounding reported cases');
      }
    }

    // Cap score at 98 max and 10 min
    const finalScore = Math.min(98, Math.max(10, score));

    let riskLevel: RiskLevel = 'LOW';
    let recommendedAction = '';

    if (finalScore >= 70) {
      riskLevel = 'HIGH';
      reasons.push('Historical baseline deviation: velocity exceeds 3.5x normal seasonal threshold');
      recommendedAction = 'URGENT: Create AI Alert for Veterinary Officer review and dispatch Field Worker for investigation & sampling.';
    } else if (finalScore >= 40) {
      riskLevel = 'MEDIUM';
      reasons.push('Moderate symptom profile; isolated or low-density manifestation');
      recommendedAction = 'MONITOR: Alert local dispensary to track animal progression; advise farmer on isolation.';
    } else {
      riskLevel = 'LOW';
      reasons.push('Current cases and symptoms fall within normal seasonal historical range');
      recommendedAction = 'PRECAUTIONS: Issue standard biosecurity advisory, hydration and nutritional guidance to farmer. Continue passive surveillance.';
    }

    return {
      riskScore: finalScore,
      riskLevel,
      aiReasons: reasons,
      recommendedAction
    };
  }
}
