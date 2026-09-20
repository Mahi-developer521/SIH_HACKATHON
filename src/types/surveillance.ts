export type UserRole = 'farmer' | 'vet' | 'field_worker' | 'lab_staff' | 'flow_inspector';

export type Language = 'en' | 'hi' | 'mr';

export interface CurrentUser {
  id: string;
  name: string;
  role: UserRole;
  phoneOrEmail: string;
  designation: string;
  location: string;
}

export type AnimalType = 'Cattle' | 'Buffalo' | 'Sheep' | 'Goat' | 'Poultry' | 'Pig';

export type CaseStatus = 
  | 'SUBMITTED' 
  | 'VALIDATED' 
  | 'AI_ANALYZED' 
  | 'VET_REVIEW' 
  | 'MISSION_ASSIGNED' 
  | 'INVESTIGATED' 
  | 'SAMPLE_COLLECTED' 
  | 'LAB_TESTING' 
  | 'CONFIRMED' 
  | 'INTERVENED' 
  | 'CONTAINED' 
  | 'MONITORING';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface CaseReport {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  village: string;
  animalType: AnimalType;
  totalAnimals: number;
  sickCount: number;
  deadCount: number;
  symptoms: string[];
  photoUrl?: string;
  voiceRecordingUrl?: string;
  voiceTranscript?: string;
  coordinates: Coordinates;
  submittedAt: string;
  status: CaseStatus;
  
  // Validation Results
  validationNotes?: string[];
  isValid: boolean;

  // AI Analysis Results
  riskScore: number;
  riskLevel: RiskLevel;
  aiReasons: string[];
  clusterId?: string;
  recommendedAction: string;

  // Field & Lab References
  missionId?: string;
  sampleId?: string;
  labResult?: LabResult;
  verifiedByVet?: boolean;
  vetNotes?: string;
  interventionIds?: string[];
}

export interface OfflineQueuedCase {
  queueId: string;
  animalType: AnimalType;
  totalAnimals: number;
  sickCount: number;
  deadCount: number;
  symptoms: string[];
  photoUrl?: string;
  voiceTranscript?: string;
  coordinates: Coordinates;
  village: string;
  queuedAt: string;
}

export interface DiseaseCluster {
  id: string; // e.g. CL-001
  name: string;
  caseIds: string[];
  villages: string[];
  totalCases: number;
  totalDeaths: number;
  riskScore: number;
  riskLevel: RiskLevel;
  primarySymptoms: string[];
  centerCoordinates: Coordinates;
  radiusKm: number;
  createdAt: string;
  status: 'ACTIVE_OUTBREAK' | 'CONTROLLED' | 'CONTAINED';
  containmentNotes?: string;
}

export interface RegisteredFarmer {
  id: string;
  name: string;
  phone: string;
  village: string;
  coordinates: Coordinates;
  animals: {
    species: AnimalType;
    count: number;
    vaccinatedCount: number;
  }[];
}

export interface VillageData {
  name: string;
  coordinates: Coordinates;
  totalLivestock: number;
  vaccinatedLivestock: number;
  coveragePercent: number;
  activeRiskZone?: RiskLevel;
}

export interface ProximityAlert {
  id: string;
  clusterId: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  distanceKm: number;
  alertLevel: 'RED_ALERT' | 'AMBER_ADVISORY' | 'NORMAL';
  message: string;
  channel: 'SMS' | 'IVR' | 'APP';
  sentAt: string;
}

export interface ResponseMission {
  id: string; // e.g. RM-001
  caseId: string;
  clusterId?: string;
  assignedToWorkerId: string;
  workerName: string;
  targetVillage: string;
  coordinates: Coordinates;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';
  instructions: string;
  status: 'ASSIGNED' | 'EN_ROUTE' | 'ON_SITE' | 'COMPLETED';
  dispatchedAt: string;
  completedAt?: string;

  // Investigation output
  investigationDetails?: FieldInvestigation;
}

export interface FieldInvestigation {
  missionId: string;
  examinedCount: number;
  sickCount: number;
  deadCount: number;
  observedSymptoms: string[];
  vaccinationAudited: boolean;
  treatmentHistory: string;
  photos: string[];
  gpsConfirmed: Coordinates;
  fieldNotes: string;
  sampleTaken: boolean;
  sampleId?: string;
  timestamp: string;
}

export interface LabSample {
  id: string; // e.g. SMP-2045
  caseId: string;
  missionId: string;
  sampleType: 'Whole Blood' | 'Serum' | 'Nasal Swab' | 'Oral Vesicle Swab' | 'Tissue Biopsy' | 'Milk';
  collectedBy: string;
  collectedAt: string;
  coordinates: Coordinates;
  targetLabName: string;
  status: 'REQUESTED' | 'COLLECTED' | 'DISPATCHED' | 'RECEIVED' | 'TESTING' | 'COMPLETED';
  dispatchedAt?: string;
  receivedAt?: string;
}

export interface LabResult {
  id: string;
  sampleId: string;
  caseId: string;
  testType: 'RT-PCR' | 'ELISA' | 'Rapid Antigen' | 'Virus Isolation' | 'Bacterial Culture';
  pathogenIdentified: string;
  result: 'POSITIVE' | 'NEGATIVE' | 'INCONCLUSIVE';
  cycleThreshold?: number;
  remarks: string;
  testedBy: string;
  testedAt: string;
}

export interface Intervention {
  id: string;
  clusterId?: string;
  caseId?: string;
  type: 'RING_VACCINATION' | 'EMERGENCY_TREATMENT' | 'HERD_QUARANTINE' | 'MOVEMENT_RESTRICTION' | 'BIOSECURITY_ADVISORY';
  targetVillage: string;
  dosesAdministered?: number;
  animalsQuarantined?: number;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
  authorizedByVet: string;
  notes: string;
  initiatedAt: string;
}

export interface VeterinaryFacility {
  id: string;
  name: string;
  type: 'VETERINARY_HOSPITAL' | 'DISPENSARY' | 'DIAGNOSTIC_LAB';
  coordinates: Coordinates;
  contactPerson: string;
  phone: string;
}

export interface AnimalHerdItem {
  id: string;
  tagNumber: string;
  species: AnimalType;
  breed: string;
  ageYears: number;
  vaccinationStatus: 'UP_TO_DATE' | 'DUE_SOON' | 'OVERDUE';
  lastVaccinationDate: string;
  lastVaccineName: string;
  treatmentHistory: string[];
}
