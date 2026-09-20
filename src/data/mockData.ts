import { 
  RegisteredFarmer, 
  VillageData, 
  VeterinaryFacility, 
  AnimalHerdItem, 
  CaseReport,
  DiseaseCluster
} from '../types/surveillance';

export const DISTRICT_CENTER = { lat: 18.5204, lng: 73.8567 }; // Central coordinates for surveillance map

export const MOCK_VILLAGES: VillageData[] = [
  {
    name: 'Village A (Rampur)',
    coordinates: { lat: 18.5350, lng: 73.8720 },
    totalLivestock: 500,
    vaccinatedLivestock: 450,
    coveragePercent: 90,
    activeRiskZone: 'HIGH'
  },
  {
    name: 'Village B (Kalyanpur)',
    coordinates: { lat: 18.5120, lng: 73.8900 },
    totalLivestock: 500,
    vaccinatedLivestock: 220,
    coveragePercent: 44, // Vaccination gap noted in prompt
    activeRiskZone: 'HIGH'
  },
  {
    name: 'Village C (Shivpuri)',
    coordinates: { lat: 18.4980, lng: 73.8350 },
    totalLivestock: 420,
    vaccinatedLivestock: 340,
    coveragePercent: 81,
    activeRiskZone: 'HIGH'
  },
  {
    name: 'Village D (Belur)',
    coordinates: { lat: 18.5800, lng: 73.8100 },
    totalLivestock: 610,
    vaccinatedLivestock: 560,
    coveragePercent: 92,
    activeRiskZone: 'LOW'
  },
  {
    name: 'Village E (Sonpur)',
    coordinates: { lat: 18.4600, lng: 73.9100 },
    totalLivestock: 380,
    vaccinatedLivestock: 350,
    coveragePercent: 92,
    activeRiskZone: 'LOW'
  }
];

export const MOCK_FACILITIES: VeterinaryFacility[] = [
  {
    id: 'FAC-01',
    name: 'District Veterinary Polyclinic & Hospital',
    type: 'VETERINARY_HOSPITAL',
    coordinates: { lat: 18.5280, lng: 73.8650 },
    contactPerson: 'Dr. A. Sharma (Chief Vet Officer)',
    phone: '+91 98220 11223'
  },
  {
    id: 'FAC-02',
    name: 'Regional Disease Diagnostic Laboratory (RDDL)',
    type: 'DIAGNOSTIC_LAB',
    coordinates: { lat: 18.5190, lng: 73.8480 },
    contactPerson: 'Dr. P. Rao (Senior Microbiologist)',
    phone: '+91 98220 33445'
  },
  {
    id: 'FAC-03',
    name: 'Sub-Divisional Veterinary Dispensary - Kalyanpur',
    type: 'DISPENSARY',
    coordinates: { lat: 18.5090, lng: 73.8950 },
    contactPerson: 'Dr. Neha Verma (Veterinary Officer)',
    phone: '+91 98220 55667'
  }
];

export const MOCK_FARMERS: RegisteredFarmer[] = [
  {
    id: 'FARMER-01',
    name: 'Ramesh Patel (Active User)',
    phone: '+91 94231 44556',
    village: 'Village A (Rampur)',
    coordinates: { lat: 18.5362, lng: 73.8741 },
    animals: [
      { species: 'Cattle', count: 8, vaccinatedCount: 7 },
      { species: 'Buffalo', count: 4, vaccinatedCount: 4 }
    ]
  },
  {
    id: 'FARMER-02',
    name: 'Suresh More',
    phone: '+91 94231 66778',
    village: 'Village A (Rampur)',
    coordinates: { lat: 18.5320, lng: 73.8710 },
    animals: [
      { species: 'Cattle', count: 12, vaccinatedCount: 10 }
    ]
  },
  {
    id: 'FARMER-03',
    name: 'Ganesh Shinde',
    phone: '+91 94231 77889',
    village: 'Village B (Kalyanpur)',
    coordinates: { lat: 18.5140, lng: 73.8880 },
    animals: [
      { species: 'Cattle', count: 15, vaccinatedCount: 6 },
      { species: 'Goat', count: 20, vaccinatedCount: 8 }
    ]
  },
  {
    id: 'FARMER-04',
    name: 'Kavita Jadhav',
    phone: '+91 94231 88990',
    village: 'Village C (Shivpuri)',
    coordinates: { lat: 18.4990, lng: 73.8380 },
    animals: [
      { species: 'Cattle', count: 6, vaccinatedCount: 5 },
      { species: 'Sheep', count: 25, vaccinatedCount: 20 }
    ]
  },
  {
    id: 'FARMER-05',
    name: 'Baburao Pawar',
    phone: '+91 94231 99001',
    village: 'Village D (Belur)',
    coordinates: { lat: 18.5790, lng: 73.8120 },
    animals: [
      { species: 'Cattle', count: 10, vaccinatedCount: 10 }
    ]
  }
];

export const MOCK_HERD: AnimalHerdItem[] = [
  {
    id: 'ANM-01',
    tagNumber: 'IND-9021-001',
    species: 'Cattle',
    breed: 'Gir Cow',
    ageYears: 4,
    vaccinationStatus: 'UP_TO_DATE',
    lastVaccinationDate: '2026-03-15',
    lastVaccineName: 'FMD Oil Adjuvant Vaccine',
    treatmentHistory: ['Routine deworming (Feb 2026)', 'Mastitis treatment (Nov 2025)']
  },
  {
    id: 'ANM-02',
    tagNumber: 'IND-9021-002',
    species: 'Cattle',
    breed: 'Sahiwal Cross',
    ageYears: 3,
    vaccinationStatus: 'UP_TO_DATE',
    lastVaccinationDate: '2026-03-15',
    lastVaccineName: 'FMD Oil Adjuvant Vaccine',
    treatmentHistory: ['Calcium deficiency supplement (Jan 2026)']
  },
  {
    id: 'ANM-03',
    tagNumber: 'IND-9021-003',
    species: 'Cattle',
    breed: 'HF Cross',
    ageYears: 5,
    vaccinationStatus: 'DUE_SOON',
    lastVaccinationDate: '2025-10-10',
    lastVaccineName: 'HS + BQ Combined Vaccine',
    treatmentHistory: ['Minor hoof trim (Dec 2025)']
  },
  {
    id: 'ANM-04',
    tagNumber: 'IND-9021-004',
    species: 'Buffalo',
    breed: 'Murrah',
    ageYears: 6,
    vaccinationStatus: 'UP_TO_DATE',
    lastVaccinationDate: '2026-02-20',
    lastVaccineName: 'FMD Vaccine',
    treatmentHistory: ['Annual health check passed']
  }
];

export const SEED_CLUSTER_001: DiseaseCluster = {
  id: 'CL-001',
  name: 'Multi-Village Acute Febrile & Vesicular Cluster',
  caseIds: ['CASE-1020', 'CASE-1021', 'CASE-1022', 'CASE-1023'],
  villages: ['Village A (Rampur)', 'Village B (Kalyanpur)', 'Village C (Shivpuri)'],
  totalCases: 21,
  totalDeaths: 2,
  riskScore: 86,
  riskLevel: 'HIGH',
  primarySymptoms: ['High Fever', 'Blisters / Vesicles on Tongue & Muzzle', 'Excessive Salivation', 'Lameness', 'Reduced Feeding'],
  centerCoordinates: { lat: 18.5200, lng: 73.8680 },
  radiusKm: 6.5,
  createdAt: '2026-09-18 10:30',
  status: 'ACTIVE_OUTBREAK'
};

export const INITIAL_CASES: CaseReport[] = [
  {
    id: 'CASE-1020',
    farmerId: 'FARMER-02',
    farmerName: 'Suresh More',
    farmerPhone: '+91 94231 66778',
    village: 'Village A (Rampur)',
    animalType: 'Cattle',
    totalAnimals: 12,
    sickCount: 3,
    deadCount: 0,
    symptoms: ['High Fever', 'Excessive Salivation', 'Lameness'],
    coordinates: { lat: 18.5320, lng: 73.8710 },
    submittedAt: '2026-09-17 08:30',
    status: 'AI_ANALYZED',
    isValid: true,
    riskScore: 78,
    riskLevel: 'HIGH',
    aiReasons: ['Rapid increase in local incidence', 'Acute vesicular symptoms', 'High cluster density'],
    clusterId: 'CL-001',
    recommendedAction: 'Immediate field inspection and biological sample collection required.'
  },
  {
    id: 'CASE-1021',
    farmerId: 'FARMER-03',
    farmerName: 'Ganesh Shinde',
    farmerPhone: '+91 94231 77889',
    village: 'Village B (Kalyanpur)',
    animalType: 'Cattle',
    totalAnimals: 15,
    sickCount: 6,
    deadCount: 1,
    symptoms: ['High Fever', 'Oral Blisters', 'Severe Lameness', 'Reduced Feeding'],
    coordinates: { lat: 18.5140, lng: 73.8880 },
    submittedAt: '2026-09-18 09:15',
    status: 'AI_ANALYZED',
    isValid: true,
    riskScore: 88,
    riskLevel: 'HIGH',
    aiReasons: ['Mortality reported', 'Low village vaccination coverage (44%)', 'Spatio-temporal alignment with Village A'],
    clusterId: 'CL-001',
    recommendedAction: 'Urgent veterinary containment team dispatch and quarantine protocol.'
  },
  {
    id: 'CASE-1022',
    farmerId: 'FARMER-04',
    farmerName: 'Kavita Jadhav',
    farmerPhone: '+91 94231 88990',
    village: 'Village C (Shivpuri)',
    animalType: 'Cattle',
    totalAnimals: 6,
    sickCount: 8,
    deadCount: 1,
    symptoms: ['Oral Blisters', 'Excessive Salivation', 'High Fever'],
    coordinates: { lat: 18.4990, lng: 73.8380 },
    submittedAt: '2026-09-19 14:20',
    status: 'AI_ANALYZED',
    isValid: true,
    riskScore: 84,
    riskLevel: 'HIGH',
    aiReasons: ['Cross-village transmission pattern detected', 'Multiple fatalities', 'High symptom concordance'],
    clusterId: 'CL-001',
    recommendedAction: 'Establish 5km ring vaccination perimeter and dispatch field teams.'
  }
];

export const CANONICAL_SYMPTOMS = [
  'High Fever',
  'Blisters / Vesicles on Tongue & Muzzle',
  'Blisters on Hooves / Coronary Band',
  'Excessive Drooling / Salivation',
  'Severe Lameness / Inability to Stand',
  'Skin Nodules / Lumps (Lumpy Skin Pattern)',
  'Respiratory Distress / Nasal Discharge',
  'Reduced Milk Yield',
  'Sudden Anorexia / Reduced Feeding',
  'Abdominal Pain / Diarrhea',
  'Unexplained Sudden Death'
];
