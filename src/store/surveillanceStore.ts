import { useState, useEffect } from 'react';
import { 
  UserRole, 
  Language, 
  CurrentUser, 
  CaseReport, 
  OfflineQueuedCase, 
  DiseaseCluster, 
  RegisteredFarmer, 
  VillageData, 
  VeterinaryFacility, 
  AnimalHerdItem, 
  ResponseMission, 
  LabSample, 
  LabResult, 
  Intervention, 
  ProximityAlert 
} from '../types/surveillance';
import { 
  INITIAL_CASES, 
  SEED_CLUSTER_001, 
  MOCK_VILLAGES, 
  MOCK_FACILITIES, 
  MOCK_FARMERS, 
  MOCK_HERD 
} from '../data/mockData';
import { ValidationService } from '../services/validationService';
import { AiEngine } from '../services/aiEngine';
import { ProximityEngine } from '../services/proximityEngine';

const STORAGE_KEY = 'LIVESTOCK_SURVEILLANCE_STATE_V2';

export interface SurveillanceState {
  isAuthenticated: boolean;
  currentUser: CurrentUser | null;
  activeRole: UserRole;
  language: Language;
  isOffline: boolean;
  offlineOutbox: OfflineQueuedCase[];
  cases: CaseReport[];
  clusters: DiseaseCluster[];
  villages: VillageData[];
  facilities: VeterinaryFacility[];
  farmers: RegisteredFarmer[];
  herd: AnimalHerdItem[];
  missions: ResponseMission[];
  samples: LabSample[];
  interventions: Intervention[];
  alerts: ProximityAlert[];
  activeStep: number;
  containmentStatus: 'ACTIVE_OUTBREAK' | 'CONTROLLED' | 'CONTAINED';
  systemLogs: string[];
}

export const DEMO_USERS: Record<UserRole, CurrentUser & { pass: string }> = {
  farmer: {
    id: 'FARMER-01',
    name: 'Ramesh Patel',
    role: 'farmer',
    phoneOrEmail: '9423144556',
    designation: 'Registered Livestock Farmer',
    location: 'Village A (Rampur)',
    pass: '1234'
  },
  vet: {
    id: 'VET-01',
    name: 'Dr. A. Sharma',
    role: 'vet',
    phoneOrEmail: 'vet.sharma@surveillance.gov.in',
    designation: 'Chief Veterinary Officer',
    location: 'District Veterinary Hospital',
    pass: 'vet123'
  },
  field_worker: {
    id: 'FW-04',
    name: 'Pooja Patil',
    role: 'field_worker',
    phoneOrEmail: 'FW-04',
    designation: 'Field Para-Vet Inspector',
    location: 'Kalyanpur Rural Sub-Division',
    pass: 'field123'
  },
  lab_staff: {
    id: 'LAB-01',
    name: 'Dr. P. Rao',
    role: 'lab_staff',
    phoneOrEmail: 'lab.rddl@surveillance.gov.in',
    designation: 'Senior Microbiologist (RDDL)',
    location: 'Regional Disease Diagnostic Lab',
    pass: 'lab123'
  },
  flow_inspector: {
    id: 'ADMIN-01',
    name: 'Lead Evaluator',
    role: 'flow_inspector',
    phoneOrEmail: 'evaluator@sih.gov.in',
    designation: 'Master System Auditor',
    location: 'National Surveillance Command',
    pass: 'admin123'
  }
};

const getInitialState = (): SurveillanceState => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        offlineOutbox: parsed.offlineOutbox || [],
        language: parsed.language || 'en',
        isOffline: parsed.isOffline || false
      };
    } catch {
      // Fallback
    }
  }

  // Pre-seed initial active alerts
  const initialAlerts = ProximityEngine.generateTargetedAlerts(SEED_CLUSTER_001, MOCK_FARMERS);

  return {
    isAuthenticated: true, // Default to demo-ready state logged in as Farmer
    currentUser: DEMO_USERS.farmer,
    activeRole: 'farmer',
    language: 'en',
    isOffline: false,
    offlineOutbox: [],
    cases: INITIAL_CASES,
    clusters: [SEED_CLUSTER_001],
    villages: MOCK_VILLAGES,
    facilities: MOCK_FACILITIES,
    farmers: MOCK_FARMERS,
    herd: MOCK_HERD,
    missions: [
      {
        id: 'RM-001',
        caseId: 'CASE-1021',
        clusterId: 'CL-001',
        assignedToWorkerId: 'FW-04',
        workerName: 'Pooja Patil (Field Inspector)',
        targetVillage: 'Village B (Kalyanpur)',
        coordinates: { lat: 18.5140, lng: 73.8880 },
        priority: 'HIGH',
        instructions: 'Investigate oral blisters and sudden mortality in cattle herd. Verify vaccination records and collect epithelial tissue/swab samples.',
        status: 'ASSIGNED',
        dispatchedAt: '2026-09-19 15:00'
      }
    ],
    samples: [
      {
        id: 'SMP-2045',
        caseId: 'CASE-1021',
        missionId: 'RM-001',
        sampleType: 'Oral Vesicle Swab',
        collectedBy: 'Pooja Patil (FW-04)',
        collectedAt: '2026-09-19 16:30',
        coordinates: { lat: 18.5140, lng: 73.8880 },
        targetLabName: 'Regional Disease Diagnostic Laboratory (RDDL)',
        status: 'DISPATCHED',
        dispatchedAt: '2026-09-19 17:00'
      }
    ],
    interventions: [],
    alerts: initialAlerts,
    activeStep: 12,
    containmentStatus: 'ACTIVE_OUTBREAK',
    systemLogs: [
      'System initialized with regional surveillance baselines.',
      'Spatio-temporal cluster CL-001 active in Village A, B, and C.',
      'Geospatial proximity engine dispatched 3 urgent alerts to nearby farmers.'
    ]
  };
};

export class SurveillanceStoreManager {
  private static state: SurveillanceState = getInitialState();
  private static listeners: Array<(s: SurveillanceState) => void> = [];

  static getState(): SurveillanceState {
    return this.state;
  }

  private static setState(updater: (prev: SurveillanceState) => SurveillanceState) {
    this.state = updater(this.state);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // ignore storage quota error
    }
    this.listeners.forEach(l => l(this.state));
  }

  static subscribe(listener: (s: SurveillanceState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // --- Authentication & Roles ---
  static login(role: UserRole, identifier: string, pass: string): boolean {
    const user = DEMO_USERS[role];
    if (user && (identifier === user.phoneOrEmail || identifier.toLowerCase() === user.name.toLowerCase() || identifier === 'demo') && (pass === user.pass || pass === 'demo' || pass === '1234')) {
      this.setState(s => ({
        ...s,
        isAuthenticated: true,
        currentUser: user,
        activeRole: role,
        systemLogs: [`User logged in as ${user.name} (${user.designation})`, ...s.systemLogs]
      }));
      return true;
    }
    return false;
  }

  static quickLogin(role: UserRole) {
    const user = DEMO_USERS[role];
    this.setState(s => ({
      ...s,
      isAuthenticated: true,
      currentUser: user,
      activeRole: role,
      systemLogs: [`Quick login as ${user.name} (${user.designation})`, ...s.systemLogs]
    }));
  }

  static logout() {
    this.setState(s => ({
      ...s,
      isAuthenticated: false,
      currentUser: null,
      systemLogs: ['User logged out from session.', ...s.systemLogs]
    }));
  }

  static setActiveRole(role: UserRole) {
    const user = DEMO_USERS[role] || this.state.currentUser;
    this.setState(s => ({ ...s, activeRole: role, currentUser: user }));
  }

  static setLanguage(lang: Language) {
    this.setState(s => ({ ...s, language: lang }));
  }

  static setIsOffline(isOffline: boolean) {
    const log = isOffline 
      ? 'Network status: OFFLINE mode activated. New reports will be saved in local outbox.'
      : 'Network status: ONLINE. Central connectivity restored.';
    this.setState(s => ({ ...s, isOffline, systemLogs: [log, ...s.systemLogs] }));
    
    // If coming back online, auto-sync outbox
    if (!isOffline && this.state.offlineOutbox.length > 0) {
      this.syncOfflineOutbox();
    }
  }

  static setActiveStep(step: number) {
    this.setState(s => ({ ...s, activeStep: step }));
  }

  /**
   * Complete Farmer Case Submission Pipeline (Supports Multiple Reports & Offline Outbox)
   */
  static submitFarmerReport(formData: {
    animalType: any;
    totalAnimals: number;
    sickCount: number;
    deadCount: number;
    symptoms: string[];
    photoUrl?: string;
    voiceTranscript?: string;
    coordinates: { lat: number; lng: number };
    village: string;
  }) {
    const state = this.getState();
    const activeFarmer = state.farmers[0]; // Ramesh Patel

    // Check if offline
    if (state.isOffline) {
      const queueId = `OUTBOX-${Date.now().toString().slice(-4)}`;
      const queuedItem: OfflineQueuedCase = {
        queueId,
        animalType: formData.animalType,
        totalAnimals: formData.totalAnimals,
        sickCount: formData.sickCount,
        deadCount: formData.deadCount,
        symptoms: formData.symptoms,
        photoUrl: formData.photoUrl,
        voiceTranscript: formData.voiceTranscript,
        coordinates: formData.coordinates,
        village: formData.village || activeFarmer.village,
        queuedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };

      const log = `Offline Report Queued (${queueId}) for ${formData.animalType}. Stored locally in Outbox.`;
      this.setState(s => ({
        ...s,
        offlineOutbox: [queuedItem, ...s.offlineOutbox],
        systemLogs: [log, ...s.systemLogs]
      }));

      // Return a provisional offline case representation
      const provisionalCase: CaseReport = {
        id: queueId,
        farmerId: activeFarmer.id,
        farmerName: activeFarmer.name,
        farmerPhone: activeFarmer.phone,
        village: formData.village || activeFarmer.village,
        animalType: formData.animalType,
        totalAnimals: formData.totalAnimals,
        sickCount: formData.sickCount,
        deadCount: formData.deadCount,
        symptoms: formData.symptoms,
        coordinates: formData.coordinates,
        submittedAt: queuedItem.queuedAt,
        status: 'SUBMITTED',
        isValid: true,
        riskScore: 50,
        riskLevel: 'MEDIUM',
        aiReasons: ['Offline report stored in outbox awaiting sync'],
        recommendedAction: 'Keep animals isolated. Report will be analyzed immediately upon network reconnect.'
      };
      return provisionalCase;
    }

    // Step 5: Data Validation (supports multiple sequential reports)
    const validation = ValidationService.validateReport({
      farmerId: activeFarmer.id,
      animalType: formData.animalType,
      totalAnimals: formData.totalAnimals,
      sickCount: formData.sickCount,
      deadCount: formData.deadCount,
      symptoms: formData.symptoms,
      coordinates: formData.coordinates,
      existingCases: state.cases
    });

    const caseId = `CASE-${1024 + state.cases.length}`;
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const baseCase: Omit<CaseReport, 'riskScore' | 'riskLevel' | 'aiReasons' | 'recommendedAction'> = {
      id: caseId,
      farmerId: activeFarmer.id,
      farmerName: activeFarmer.name,
      farmerPhone: activeFarmer.phone,
      village: formData.village || activeFarmer.village,
      animalType: formData.animalType,
      totalAnimals: formData.totalAnimals,
      sickCount: formData.sickCount,
      deadCount: formData.deadCount,
      symptoms: validation.standardizedSymptoms,
      photoUrl: formData.photoUrl,
      voiceTranscript: formData.voiceTranscript,
      coordinates: formData.coordinates,
      submittedAt: timestamp,
      status: 'SUBMITTED',
      validationNotes: validation.notes,
      isValid: validation.isValid
    };

    // Step 6 & 7: AI Analysis Engine
    const aiResult = AiEngine.analyzeCase(baseCase, state.cases);

    const fullCase: CaseReport = {
      ...baseCase,
      status: aiResult.riskLevel === 'HIGH' ? 'VET_REVIEW' : 'AI_ANALYZED',
      riskScore: aiResult.riskScore,
      riskLevel: aiResult.riskLevel,
      aiReasons: aiResult.aiReasons,
      recommendedAction: aiResult.recommendedAction
    };

    let updatedClusters = [...state.clusters];
    let newAlerts = [...state.alerts];

    if (fullCase.riskLevel === 'HIGH') {
      // Step 11 & 12: Cluster & GIS Risk Zone Update
      let currentCluster = updatedClusters.find(c => c.id === 'CL-001');
      if (currentCluster) {
        currentCluster = {
          ...currentCluster,
          caseIds: [...currentCluster.caseIds, fullCase.id],
          totalCases: currentCluster.totalCases + fullCase.sickCount,
          totalDeaths: currentCluster.totalDeaths + fullCase.deadCount,
          riskScore: Math.max(currentCluster.riskScore, fullCase.riskScore)
        };
        updatedClusters = updatedClusters.map(c => c.id === currentCluster!.id ? currentCluster! : c);
        fullCase.clusterId = currentCluster.id;

        // Step 14: Geospatial Proximity Alerts for nearby farmers
        const triggeredAlerts = ProximityEngine.generateTargetedAlerts(currentCluster, state.farmers);
        newAlerts = [...triggeredAlerts, ...newAlerts];
      }
    }

    const logEntry = `Case ${caseId} submitted: AI evaluated Risk Score ${fullCase.riskScore} (${fullCase.riskLevel}). ${
      fullCase.riskLevel === 'HIGH' ? 'AI Alert dispatched to Veterinary Officer!' : 'Preventive Precautions advisory issued to farmer.'
    }`;

    this.setState(s => ({
      ...s,
      cases: [fullCase, ...s.cases],
      clusters: updatedClusters,
      alerts: newAlerts,
      activeStep: fullCase.riskLevel === 'HIGH' ? 15 : 9,
      systemLogs: [logEntry, ...s.systemLogs]
    }));

    return fullCase;
  }

  /**
   * Synchronize Offline Outbox with Central System
   */
  static syncOfflineOutbox() {
    const state = this.getState();
    if (state.offlineOutbox.length === 0) return;

    const outboxItems = [...state.offlineOutbox];
    let addedCount = 0;

    outboxItems.forEach(item => {
      this.submitFarmerReport({
        animalType: item.animalType,
        totalAnimals: item.totalAnimals,
        sickCount: item.sickCount,
        deadCount: item.deadCount,
        symptoms: item.symptoms,
        photoUrl: item.photoUrl,
        voiceTranscript: item.voiceTranscript,
        coordinates: item.coordinates,
        village: item.village
      });
      addedCount++;
    });

    const syncLog = `Outbox Synchronization Complete: ${addedCount} offline reports processed and merged into surveillance database.`;
    this.setState(s => ({
      ...s,
      offlineOutbox: [],
      systemLogs: [syncLog, ...s.systemLogs]
    }));
  }

  /**
   * Veterinary Actions: Create Response Mission (Step 17)
   */
  static createMission(params: {
    caseId: string;
    clusterId?: string;
    workerId: string;
    workerName: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';
    instructions: string;
    targetVillage: string;
    coordinates: { lat: number; lng: number };
  }) {
    const missionId = `RM-00${this.getState().missions.length + 1}`;
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const newMission: ResponseMission = {
      id: missionId,
      caseId: params.caseId,
      clusterId: params.clusterId,
      assignedToWorkerId: params.workerId,
      workerName: params.workerName,
      targetVillage: params.targetVillage,
      coordinates: params.coordinates,
      priority: params.priority,
      instructions: params.instructions,
      status: 'ASSIGNED',
      dispatchedAt: timestamp
    };

    const log = `Mission ${missionId} created by Veterinary Officer. Dispatched ${params.workerName} to ${params.targetVillage}.`;

    this.setState(s => ({
      ...s,
      missions: [newMission, ...s.missions],
      cases: s.cases.map(c => c.id === params.caseId ? { ...c, status: 'MISSION_ASSIGNED', missionId } : c),
      activeStep: 18,
      systemLogs: [log, ...s.systemLogs]
    }));
  }

  /**
   * Field Worker Actions: Submit Investigation & Collect Sample (Steps 19 & 20)
   */
  static submitFieldInvestigation(params: {
    missionId: string;
    examinedCount: number;
    sickCount: number;
    deadCount: number;
    observedSymptoms: string[];
    vaccinationAudited: boolean;
    treatmentHistory: string;
    fieldNotes: string;
    sampleRequired: boolean;
    sampleType?: any;
    targetLabName?: string;
  }) {
    const state = this.getState();
    const mission = state.missions.find(m => m.id === params.missionId);
    if (!mission) return;

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    let newSample: LabSample | undefined;

    if (params.sampleRequired && params.sampleType) {
      newSample = {
        id: `SMP-${2045 + state.samples.length}`,
        caseId: mission.caseId,
        missionId: mission.id,
        sampleType: params.sampleType,
        collectedBy: mission.workerName,
        collectedAt: timestamp,
        coordinates: mission.coordinates,
        targetLabName: params.targetLabName || 'Regional Disease Diagnostic Laboratory (RDDL)',
        status: 'DISPATCHED',
        dispatchedAt: timestamp
      };
    }

    const log = `Field Worker completed on-site investigation for ${mission.id} at ${mission.targetVillage}.${
      newSample ? ` Collected and dispatched sample ${newSample.id} (${newSample.sampleType}) to lab.` : ''
    }`;

    this.setState(s => ({
      ...s,
      missions: s.missions.map(m => m.id === params.missionId ? {
        ...m,
        status: 'COMPLETED',
        completedAt: timestamp,
        investigationDetails: {
          missionId: m.id,
          examinedCount: params.examinedCount,
          sickCount: params.sickCount,
          deadCount: params.deadCount,
          observedSymptoms: params.observedSymptoms,
          vaccinationAudited: params.vaccinationAudited,
          treatmentHistory: params.treatmentHistory,
          photos: [],
          gpsConfirmed: m.coordinates,
          fieldNotes: params.fieldNotes,
          sampleTaken: params.sampleRequired,
          sampleId: newSample?.id,
          timestamp
        }
      } : m),
      samples: newSample ? [newSample, ...s.samples] : s.samples,
      cases: s.cases.map(c => c.id === mission.caseId ? {
        ...c,
        status: newSample ? 'SAMPLE_COLLECTED' : 'INVESTIGATED',
        sampleId: newSample?.id
      } : c),
      activeStep: newSample ? 21 : 24,
      systemLogs: [log, ...s.systemLogs]
    }));
  }

  /**
   * Lab Staff: Process Sample & Submit Result (Steps 21 -> 22 -> 23)
   */
  static submitLabResult(params: {
    sampleId: string;
    testType: any;
    pathogenIdentified: string;
    result: 'POSITIVE' | 'NEGATIVE' | 'INCONCLUSIVE';
    cycleThreshold?: number;
    remarks: string;
    testedBy: string;
  }) {
    const state = this.getState();
    const sample = state.samples.find(s => s.id === params.sampleId);
    if (!sample) return;

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const resultId = `RES-${Date.now().toString().slice(-4)}`;

    const labResult: LabResult = {
      id: resultId,
      sampleId: sample.id,
      caseId: sample.caseId,
      testType: params.testType,
      pathogenIdentified: params.pathogenIdentified,
      result: params.result,
      cycleThreshold: params.cycleThreshold,
      remarks: params.remarks,
      testedBy: params.testedBy,
      testedAt: timestamp
    };

    const log = `Laboratory confirmed test result for ${sample.id}: ${labResult.result} for ${labResult.pathogenIdentified} (${labResult.testType}). Transmitted to Veterinary Officer.`;

    this.setState(s => ({
      ...s,
      samples: s.samples.map(sItem => sItem.id === params.sampleId ? {
        ...sItem,
        status: 'COMPLETED'
      } : sItem),
      cases: s.cases.map(c => c.id === sample.caseId ? {
        ...c,
        status: 'CONFIRMED',
        labResult
      } : c),
      activeStep: 24, // Veterinary Verification
      systemLogs: [log, ...s.systemLogs]
    }));
  }

  /**
   * Veterinary Officer: Authorize Intervention & Containment (Step 24 & 25)
   */
  static authorizeIntervention(params: {
    clusterId?: string;
    caseId?: string;
    type: 'RING_VACCINATION' | 'EMERGENCY_TREATMENT' | 'HERD_QUARANTINE' | 'MOVEMENT_RESTRICTION' | 'BIOSECURITY_ADVISORY';
    targetVillage: string;
    notes: string;
    doses?: number;
    quarantinedCount?: number;
    authorizedBy: string;
  }) {
    const interventionId = `INT-${Date.now().toString().slice(-4)}`;
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const newIntervention: Intervention = {
      id: interventionId,
      clusterId: params.clusterId,
      caseId: params.caseId,
      type: params.type,
      targetVillage: params.targetVillage,
      dosesAdministered: params.doses || 150,
      animalsQuarantined: params.quarantinedCount || 35,
      status: 'IN_PROGRESS',
      authorizedByVet: params.authorizedBy,
      notes: params.notes,
      initiatedAt: timestamp
    };

    // Update village vaccination coverage if ring vaccination
    let updatedVillages = [...this.getState().villages];
    if (params.type === 'RING_VACCINATION') {
      updatedVillages = updatedVillages.map(v => {
        if (v.name === params.targetVillage) {
          const newVacc = Math.min(v.totalLivestock, v.vaccinatedLivestock + (params.doses || 150));
          return {
            ...v,
            vaccinatedLivestock: newVacc,
            coveragePercent: Math.round((newVacc / v.totalLivestock) * 100)
          };
        }
        return v;
      });
    }

    const log = `Intervention ${newIntervention.type} authorized by ${params.authorizedBy} in ${params.targetVillage}. Emergency response teams active.`;

    this.setState(s => ({
      ...s,
      interventions: [newIntervention, ...s.interventions],
      villages: updatedVillages,
      cases: s.cases.map(c => (c.clusterId === params.clusterId || c.id === params.caseId) ? {
        ...c,
        status: 'INTERVENED'
      } : c),
      activeStep: 28, // Outcome Monitoring
      systemLogs: [log, ...s.systemLogs]
    }));
  }

  /**
   * Continuous AI + GIS Feedback Loop: Outcome Monitoring (Steps 28, 29, 30)
   */
  static simulateOutcomeProgression() {
    const state = this.getState();
    const currentStatus = state.containmentStatus;

    if (currentStatus === 'ACTIVE_OUTBREAK') {
      const updatedClusters = state.clusters.map(cl => ({
        ...cl,
        status: 'CONTROLLED' as const,
        riskScore: 42,
        riskLevel: 'MEDIUM' as const,
        containmentNotes: 'Ring vaccination established. Daily new case velocity decreased by 65%.'
      }));

      const updatedVillages = state.villages.map(v => ({
        ...v,
        activeRiskZone: (v.activeRiskZone === 'HIGH' ? 'MEDIUM' : v.activeRiskZone) as any
      }));

      const log = 'Continuous AI Loop: Re-analysis indicates sharp decline in new case transmission. Risk downgraded to MEDIUM (Score 42).';

      this.setState(s => ({
        ...s,
        clusters: updatedClusters,
        villages: updatedVillages,
        containmentStatus: 'CONTROLLED',
        activeStep: 29,
        systemLogs: [log, ...s.systemLogs]
      }));
    } else {
      const updatedClusters = state.clusters.map(cl => ({
        ...cl,
        status: 'CONTAINED' as const,
        riskScore: 18,
        riskLevel: 'LOW' as const,
        containmentNotes: 'Zero new mortality for 5 consecutive days. Herd immunity reached 92%. Outbreak successfully contained.'
      }));

      const updatedVillages = state.villages.map(v => ({
        ...v,
        activeRiskZone: 'LOW' as const
      }));

      const log = 'Surveillance Outcome: Outbreak CL-001 declared CONTAINED! Risk score at 18 (LOW). GIS zones returned to Green.';

      this.setState(s => ({
        ...s,
        clusters: updatedClusters,
        villages: updatedVillages,
        containmentStatus: 'CONTAINED',
        activeStep: 30,
        systemLogs: [log, ...s.systemLogs]
      }));
    }
  }

  /**
   * Add a new animal to the farmer's registered herd
   */
  static addAnimalToHerd(animal: Omit<AnimalHerdItem, 'id'>) {
    const newId = `ANM-0${this.getState().herd.length + 1}`;
    const newItem: AnimalHerdItem = { ...animal, id: newId };
    const log = `Registered new animal ${newItem.tagNumber} (${newItem.breed} ${newItem.species}) to farmer herd.`;

    this.setState(s => ({
      ...s,
      herd: [newItem, ...s.herd],
      systemLogs: [log, ...s.systemLogs]
    }));
  }

  /**
   * Veterinary Triage Decision (Section 16: Investigate / Monitor / Escalate)
   */
  static triageCase(caseId: string, decision: 'MONITOR' | 'INVESTIGATE' | 'ESCALATE', notes?: string) {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const log = `Veterinary Triage Decision for ${caseId}: ${decision}. ${notes || ''}`;

    this.setState(s => ({
      ...s,
      cases: s.cases.map(c => c.id === caseId ? {
        ...c,
        status: decision === 'MONITOR' ? 'MONITORING' : c.status,
        vetNotes: notes || `Triaged as ${decision} on ${timestamp}`
      } : c),
      activeStep: decision === 'INVESTIGATE' ? 17 : decision === 'ESCALATE' ? 10 : 9,
      systemLogs: [log, ...s.systemLogs]
    }));
  }

  /**
   * Complete an ongoing intervention
   */
  static completeIntervention(interventionId: string) {
    const log = `Intervention ${interventionId} marked as COMPLETED by Veterinary Authority.`;
    this.setState(s => ({
      ...s,
      interventions: s.interventions.map(i => i.id === interventionId ? { ...i, status: 'COMPLETED' } : i),
      systemLogs: [log, ...s.systemLogs]
    }));
  }

  /**
   * Reset store to original demonstration baseline
   */
  static resetToDefault() {
    localStorage.removeItem(STORAGE_KEY);
    this.state = getInitialState();
    this.listeners.forEach(l => l(this.state));
  }
}

export function useSurveillanceStore() {
  const [state, setState] = useState<SurveillanceState>(SurveillanceStoreManager.getState());

  useEffect(() => {
    return SurveillanceStoreManager.subscribe(setState);
  }, []);

  return {
    state,
    login: (role: UserRole, id: string, pass: string) => SurveillanceStoreManager.login(role, id, pass),
    quickLogin: (role: UserRole) => SurveillanceStoreManager.quickLogin(role),
    logout: () => SurveillanceStoreManager.logout(),
    setActiveRole: (r: UserRole) => SurveillanceStoreManager.setActiveRole(r),
    setLanguage: (lang: Language) => SurveillanceStoreManager.setLanguage(lang),
    setIsOffline: (isOffline: boolean) => SurveillanceStoreManager.setIsOffline(isOffline),
    syncOfflineOutbox: () => SurveillanceStoreManager.syncOfflineOutbox(),
    setActiveStep: (step: number) => SurveillanceStoreManager.setActiveStep(step),
    submitFarmerReport: (data: any) => SurveillanceStoreManager.submitFarmerReport(data),
    addAnimalToHerd: (animal: Omit<AnimalHerdItem, 'id'>) => SurveillanceStoreManager.addAnimalToHerd(animal),
    triageCase: (caseId: string, decision: 'MONITOR' | 'INVESTIGATE' | 'ESCALATE', notes?: string) => SurveillanceStoreManager.triageCase(caseId, decision, notes),
    completeIntervention: (interventionId: string) => SurveillanceStoreManager.completeIntervention(interventionId),
    createMission: (params: any) => SurveillanceStoreManager.createMission(params),
    submitFieldInvestigation: (params: any) => SurveillanceStoreManager.submitFieldInvestigation(params),
    submitLabResult: (params: any) => SurveillanceStoreManager.submitLabResult(params),
    authorizeIntervention: (params: any) => SurveillanceStoreManager.authorizeIntervention(params),
    simulateOutcomeProgression: () => SurveillanceStoreManager.simulateOutcomeProgression(),
    resetToDefault: () => SurveillanceStoreManager.resetToDefault()
  };
}
