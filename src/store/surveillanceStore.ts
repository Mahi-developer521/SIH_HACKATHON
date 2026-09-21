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
import { ApiService } from '../services/apiService';
import { I18nService } from '../services/i18nService';

const STORAGE_KEY = 'LIVESTOCK_SURVEILLANCE_STATE_V2';

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
}

export interface SurveillanceState {
  isAuthenticated: boolean;
  currentUser: CurrentUser | null;
  activeRole: UserRole;
  language: Language;
  isOffline: boolean;
  toasts: ToastNotification[];
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

export const DEMO_USERS: Record<string, CurrentUser & { pass: string; email: string }> = {
  farmer: {
    id: 'FARMER-01',
    name: 'Ramesh Patel',
    role: 'farmer',
    phoneOrEmail: 'farmer@example.com',
    email: 'farmer@example.com',
    designation: 'Registered Livestock Farmer',
    location: 'Village A (Rampur)',
    pass: 'farmer123'
  },
  vet: {
    id: 'VET-01',
    name: 'Dr. A. Sharma',
    role: 'vet',
    phoneOrEmail: 'vet@example.com',
    email: 'vet@example.com',
    designation: 'Chief Veterinary Officer',
    location: 'District Veterinary Hospital',
    pass: 'vet123'
  },
  field_worker: {
    id: 'FW-04',
    name: 'Pooja Patil',
    role: 'field_worker',
    phoneOrEmail: 'fieldworker@example.com',
    email: 'fieldworker@example.com',
    designation: 'Field Para-Vet Inspector',
    location: 'Kalyanpur Rural Sub-Division',
    pass: 'field123'
  },
  lab_staff: {
    id: 'LAB-01',
    name: 'Dr. P. Rao',
    role: 'lab_staff',
    phoneOrEmail: 'lab@example.com',
    email: 'lab@example.com',
    designation: 'Senior Microbiologist (RDDL)',
    location: 'Regional Disease Diagnostic Lab',
    pass: 'lab123'
  },
  admin: {
    id: 'ADMIN-01',
    name: 'Lead Evaluator',
    role: 'admin',
    phoneOrEmail: 'admin@example.com',
    email: 'admin@example.com',
    designation: 'Master System Auditor',
    location: 'National Surveillance Command',
    pass: 'admin123'
  },
  flow_inspector: {
    id: 'ADMIN-01',
    name: 'Lead Evaluator',
    role: 'admin',
    phoneOrEmail: 'admin@example.com',
    email: 'admin@example.com',
    designation: 'Master System Auditor',
    location: 'National Surveillance Command',
    pass: 'admin123'
  }
};

const getInitialState = (): SurveillanceState => {
  // Pre-seed initial active alerts
  const initialAlerts = ProximityEngine.generateTargetedAlerts(SEED_CLUSTER_001, MOCK_FARMERS);

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        cases: (parsed.cases && parsed.cases.length > 0) ? parsed.cases : INITIAL_CASES,
        clusters: (parsed.clusters && parsed.clusters.length > 0) ? parsed.clusters : [SEED_CLUSTER_001],
        villages: (parsed.villages && parsed.villages.length > 0) ? parsed.villages : MOCK_VILLAGES,
        facilities: (parsed.facilities && parsed.facilities.length > 0) ? parsed.facilities : MOCK_FACILITIES,
        farmers: (parsed.farmers && parsed.farmers.length > 0) ? parsed.farmers : MOCK_FARMERS,
        herd: (parsed.herd && parsed.herd.length > 0) ? parsed.herd : MOCK_HERD,
        missions: parsed.missions || [],
        samples: parsed.samples || [],
        interventions: parsed.interventions || [],
        alerts: (parsed.alerts && parsed.alerts.length > 0) ? parsed.alerts : initialAlerts,
        systemLogs: parsed.systemLogs || [],
        toasts: [],
        offlineOutbox: parsed.offlineOutbox || [],
        language: parsed.language || 'en',
        isOffline: parsed.isOffline || false,
        isAuthenticated: false // Default to Home Page of Role Selection on fresh load
      };
    } catch {
      // Fallback
    }
  }

  return {
    isAuthenticated: false, // Protected by default: requires login
    currentUser: null,
    activeRole: 'farmer',
    language: 'en',
    isOffline: false,
    toasts: [],
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

  private static isInitialized = false;

  /**
   * Synchronize initial state with PostgreSQL database via REST API
   */
  static async initializeFromBackend() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    try {
      const [backendReports, backendMissions, backendSamples, backendAnimals] = await Promise.allSettled([
        ApiService.getReports(),
        ApiService.getMissions(),
        ApiService.getLabSamples(),
        ApiService.getAnimals()
      ]);

      this.setState(s => {
        let mergedCases = [...s.cases];
        let mergedMissions = [...s.missions];
        let mergedSamples = [...s.samples];
        let mergedHerd = [...s.herd];

        if (backendReports.status === 'fulfilled' && Array.isArray(backendReports.value) && backendReports.value.length > 0) {
          backendReports.value.forEach(bReport => {
            const idx = mergedCases.findIndex(c => c.id === bReport.id);
            if (idx >= 0) mergedCases[idx] = { ...mergedCases[idx], ...bReport };
            else mergedCases.unshift(bReport);
          });
        }

        if (backendMissions.status === 'fulfilled' && Array.isArray(backendMissions.value) && backendMissions.value.length > 0) {
          backendMissions.value.forEach(bMission => {
            const idx = mergedMissions.findIndex(m => m.id === bMission.id);
            if (idx >= 0) mergedMissions[idx] = { ...mergedMissions[idx], ...bMission };
            else mergedMissions.unshift(bMission);
          });
        }

        if (backendSamples.status === 'fulfilled' && Array.isArray(backendSamples.value) && backendSamples.value.length > 0) {
          backendSamples.value.forEach(bSample => {
            const idx = mergedSamples.findIndex(sm => sm.id === bSample.id);
            if (idx >= 0) mergedSamples[idx] = { ...mergedSamples[idx], ...bSample };
            else mergedSamples.unshift(bSample);
          });
        }

        if (backendAnimals.status === 'fulfilled' && Array.isArray(backendAnimals.value) && backendAnimals.value.length > 0) {
          backendAnimals.value.forEach(bAnimal => {
            const idx = mergedHerd.findIndex(a => a.tagNumber === bAnimal.tagNumber);
            if (idx >= 0) mergedHerd[idx] = { ...mergedHerd[idx], ...bAnimal };
            else mergedHerd.push(bAnimal);
          });
        }

        return {
          ...s,
          cases: mergedCases,
          missions: mergedMissions,
          samples: mergedSamples,
          herd: mergedHerd,
          systemLogs: [
            'PostgreSQL Central Sync: Synchronized surveillance cases, missions, samples, and herd registry.',
            ...s.systemLogs
          ]
        };
      });
    } catch (err: any) {
      console.warn('[SurveillanceStore] Backend sync notice:', err.message);
    }
  }

  // --- Toast Notification System ---
  static showToast(type: 'success' | 'error' | 'info' | 'warning', message: string, title?: string) {
    const id = `toast-${Date.now()}-${Math.round(Math.random() * 1000)}`;
    const newToast: ToastNotification = { id, type, message, title };
    this.setState(s => ({
      ...s,
      toasts: [...s.toasts, newToast]
    }));

    // Auto-dismiss after 4.5 seconds
    setTimeout(() => {
      this.removeToast(id);
    }, 4500);
  }

  static removeToast(id: string) {
    this.setState(s => ({
      ...s,
      toasts: s.toasts.filter(t => t.id !== id)
    }));
  }

  // --- Authentication & Roles ---
  static async login(identifier: string, pass: string): Promise<boolean> {
    try {
      // 1. Authenticate against real backend /api/auth/login
      const result = await ApiService.login(identifier, pass);
      if (result && result.user) {
        let role = result.user.role;
        if (role === 'flow_inspector') role = 'admin';

        this.setState(s => ({
          ...s,
          isAuthenticated: true,
          currentUser: result.user,
          activeRole: role as UserRole,
          systemLogs: [`User logged in as ${result.user.name} (${result.user.designation}) via PostgreSQL`, ...s.systemLogs]
        }));
        this.showToast('success', `Welcome, ${result.user.name}! Authenticated as ${result.user.designation || result.user.role}.`);
        return true;
      }
    } catch (err: any) {
      console.warn('[SurveillanceStore] Backend login attempt notice:', err.message);
      // Fallback check against DEMO_USERS for offline demo evaluation
      const trimmedId = identifier.trim().toLowerCase();
      const demoUser = Object.values(DEMO_USERS).find(u => 
        (u.phoneOrEmail.toLowerCase() === trimmedId ||
         u.email.toLowerCase() === trimmedId ||
         u.id.toLowerCase() === trimmedId ||
         u.name.toLowerCase() === trimmedId ||
         u.role.toLowerCase() === trimmedId) &&
        (pass === u.pass || pass === '1234' || pass === 'demo' || pass === 'farmer123' || pass === 'vet123' || pass === 'field123' || pass === 'lab123' || pass === 'admin123')
      );

      if (demoUser) {
        let role = demoUser.role;
        if (role === 'flow_inspector') role = 'admin';

        this.setState(s => ({
          ...s,
          isAuthenticated: true,
          currentUser: demoUser,
          activeRole: role as UserRole,
          systemLogs: [`Offline Demo login as ${demoUser.name} (${demoUser.designation})`, ...s.systemLogs]
        }));
        this.showToast('info', `Demo session started as ${demoUser.name} (${demoUser.role}).`);
        return true;
      }

      this.showToast('error', err.message || 'Authentication failed. Please verify credentials.');
      return false;
    }
    return false;
  }

  static async quickLogin(role: UserRole) {
    const roleKey = (role === 'flow_inspector' ? 'admin' : role) as string;
    const demo = DEMO_USERS[roleKey] || DEMO_USERS[role];
    if (demo) {
      await this.login(demo.email, demo.pass);
    }
  }

  static async logout() {
    await ApiService.logout();
    this.setState(s => ({
      ...s,
      isAuthenticated: false,
      currentUser: null,
      systemLogs: ['User logged out from session.', ...s.systemLogs]
    }));
    this.showToast('info', 'You have been signed out successfully.');
  }

  static setActiveRole(role: UserRole) {
    const roleKey = (role === 'flow_inspector' ? 'admin' : role) as string;
    const user = DEMO_USERS[roleKey] || DEMO_USERS[role] || this.state.currentUser;
    this.setState(s => ({ ...s, activeRole: role, currentUser: user }));
  }

  static setLanguage(lang: Language) {
    I18nService.saveLanguage(lang);
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
  static async submitFarmerReport(formData: {
    animalType: any;
    totalAnimals: number;
    sickCount: number;
    deadCount: number;
    symptoms: string[];
    photoUrl?: string;
    imageUrl?: string;
    imageFilename?: string;
    voiceTranscript?: string;
    voiceLanguage?: string;
    reportedLanguage?: string;
    coordinates: { lat: number; lng: number };
    village: string;
  }): Promise<CaseReport> {
    const state = this.getState();
    const activeFarmer = state.farmers[0]; // Ramesh Patel

    // Check if offline (user toggle or browser disconnect)
    if (state.isOffline || !navigator.onLine) {
      const queueId = `OUTBOX-${Date.now().toString().slice(-4)}`;
      const queuedItem: OfflineQueuedCase = {
        queueId,
        animalType: formData.animalType,
        totalAnimals: formData.totalAnimals,
        sickCount: formData.sickCount,
        deadCount: formData.deadCount,
        symptoms: formData.symptoms,
        photoUrl: formData.imageUrl || formData.photoUrl,
        imageUrl: formData.imageUrl || formData.photoUrl,
        imageFilename: formData.imageFilename,
        voiceTranscript: formData.voiceTranscript,
        voiceLanguage: formData.voiceLanguage || 'en-IN',
        reportedLanguage: formData.reportedLanguage || state.language,
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

      this.showToast('info', `Offline Mode: Report ${queueId} saved to your local outbox. It will auto-sync when online.`);

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
        photoUrl: formData.imageUrl || formData.photoUrl,
        imageUrl: formData.imageUrl || formData.photoUrl,
        imageFilename: formData.imageFilename,
        voiceTranscript: formData.voiceTranscript,
        voiceLanguage: formData.voiceLanguage,
        reportedLanguage: formData.reportedLanguage,
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

    // Attempt to submit directly to Express / PostgreSQL REST API
    try {
      const apiCase = await ApiService.createReport({
        farmerId: activeFarmer.id,
        farmerName: activeFarmer.name,
        farmerPhone: activeFarmer.phone,
        village: formData.village || activeFarmer.village,
        animalType: formData.animalType,
        totalAnimals: formData.totalAnimals,
        sickCount: formData.sickCount,
        deadCount: formData.deadCount,
        symptoms: formData.symptoms,
        photoUrl: formData.imageUrl || formData.photoUrl,
        imageUrl: formData.imageUrl || formData.photoUrl,
        imageFilename: formData.imageFilename,
        voiceTranscript: formData.voiceTranscript,
        voiceLanguage: formData.voiceLanguage || 'en-IN',
        reportedLanguage: formData.reportedLanguage || state.language,
        coordinates: formData.coordinates
      });

      let updatedClusters = [...state.clusters];
      let newAlerts = [...state.alerts];

      if (apiCase.riskLevel === 'HIGH') {
        let currentCluster = updatedClusters.find(c => c.id === 'CL-001');
        if (currentCluster) {
          currentCluster = {
            ...currentCluster,
            caseIds: [...currentCluster.caseIds, apiCase.id],
            totalCases: currentCluster.totalCases + apiCase.sickCount,
            totalDeaths: currentCluster.totalDeaths + apiCase.deadCount,
            riskScore: Math.max(currentCluster.riskScore, apiCase.riskScore)
          };
          updatedClusters = updatedClusters.map(c => c.id === currentCluster!.id ? currentCluster! : c);
          apiCase.clusterId = currentCluster.id;

          const triggeredAlerts = ProximityEngine.generateTargetedAlerts(currentCluster, state.farmers);
          newAlerts = [...triggeredAlerts, ...newAlerts];
        }
      }

      const logEntry = `Case ${apiCase.id} submitted & saved to PostgreSQL: AI evaluated Risk Score ${apiCase.riskScore} (${apiCase.riskLevel}). ${
        apiCase.riskLevel === 'HIGH' ? 'AI Alert dispatched to Veterinary Officer!' : 'Preventive Precautions advisory issued to farmer.'
      }`;

      this.setState(s => ({
        ...s,
        cases: [apiCase, ...s.cases.filter(c => c.id !== apiCase.id)],
        clusters: updatedClusters,
        alerts: newAlerts,
        activeStep: apiCase.riskLevel === 'HIGH' ? 15 : 9,
        systemLogs: [logEntry, ...s.systemLogs]
      }));

      this.showToast('success', `Case ${apiCase.id} successfully analyzed by AI: Risk Score ${apiCase.riskScore} (${apiCase.riskLevel}).`);
      return apiCase;
    } catch (apiErr: any) {
      console.warn('[SurveillanceStore] API submission notice, using resilient fallback:', apiErr.message);

      // Local Fallback Processing
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

          const triggeredAlerts = ProximityEngine.generateTargetedAlerts(currentCluster, state.farmers);
          newAlerts = [...triggeredAlerts, ...newAlerts];
        }
      }

      const logEntry = `Case ${caseId} submitted: AI evaluated Risk Score ${fullCase.riskScore} (${fullCase.riskLevel}).`;

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
  }

  /**
   * Synchronize Offline Outbox with Central PostgreSQL Backend
   */
  static async syncOfflineOutbox() {
    const state = this.getState();
    if (state.offlineOutbox.length === 0) return;

    const outboxItems = [...state.offlineOutbox];
    let syncedCount = 0;

    for (const item of outboxItems) {
      try {
        await ApiService.createReport({
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
        syncedCount++;
      } catch (err: any) {
        console.warn('[SurveillanceStore] Error syncing outbox item:', err.message);
      }
    }

    try {
      const refreshedReports = await ApiService.getReports();
      this.setState(s => ({
        ...s,
        cases: refreshedReports,
        offlineOutbox: [],
        systemLogs: [
          `Outbox Synchronization Complete: ${syncedCount} queued reports uploaded to PostgreSQL.`,
          ...s.systemLogs
        ]
      }));
    } catch {
      this.setState(s => ({
        ...s,
        offlineOutbox: [],
        systemLogs: [
          `Outbox Synced (${syncedCount} items uploaded to central surveillance system).`,
          ...s.systemLogs
        ]
      }));
    }
  }

  /**
   * Veterinary Actions: Create Response Mission (Step 17)
   */
  static async createMission(params: {
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

    try {
      await ApiService.createMission({
        caseId: params.caseId,
        clusterId: params.clusterId,
        assignedToWorkerId: params.workerId,
        workerName: params.workerName,
        targetVillage: params.targetVillage,
        coordinates: params.coordinates,
        priority: params.priority,
        instructions: params.instructions
      });
    } catch (e: any) {
      console.warn('[SurveillanceStore] Mission backend sync notice:', e.message);
    }
  }

  /**
   * Field Worker Actions: Submit Investigation & Collect Sample (Steps 19 & 20)
   */
  static async submitFieldInvestigation(params: {
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

    try {
      await ApiService.createInvestigation({
        missionId: params.missionId,
        examinedCount: params.examinedCount,
        sickCount: params.sickCount,
        deadCount: params.deadCount,
        observedSymptoms: params.observedSymptoms,
        vaccinationAudited: params.vaccinationAudited,
        treatmentHistory: params.treatmentHistory,
        coordinates: mission.coordinates,
        fieldNotes: params.fieldNotes,
        sampleTaken: params.sampleRequired,
        sampleId: newSample?.id
      });

      if (newSample) {
        await ApiService.createLabSample({
          caseId: mission.caseId,
          missionId: mission.id,
          sampleType: newSample.sampleType,
          collectedBy: newSample.collectedBy,
          coordinates: newSample.coordinates,
          targetLabName: newSample.targetLabName
        });
      }
    } catch (e: any) {
      console.warn('[SurveillanceStore] Investigation backend sync notice:', e.message);
    }
  }

  /**
   * Lab Staff: Process Sample & Submit Result (Steps 21 -> 22 -> 23)
   */
  static async submitLabResult(params: {
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

    try {
      await ApiService.createLabResult({
        sampleId: sample.id,
        caseId: sample.caseId,
        testMethod: params.testType,
        pathogenIdentified: params.pathogenIdentified,
        result: params.result,
        confidenceScore: params.cycleThreshold,
        labTechnicianName: params.testedBy,
        notes: params.remarks
      });
    } catch (e: any) {
      console.warn('[SurveillanceStore] Lab result backend sync notice:', e.message);
    }
  }

  /**
   * Veterinary Officer: Authorize Intervention & Containment (Step 24 & 25)
   */
  static async authorizeIntervention(params: {
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

    try {
      await ApiService.createIntervention({
        clusterId: params.clusterId,
        caseId: params.caseId,
        type: params.type,
        title: `${params.type} in ${params.targetVillage}`,
        description: params.notes,
        targetVillages: [params.targetVillage],
        authorizedBy: params.authorizedBy,
        dosesRequired: params.doses || 150
      });
    } catch (e: any) {
      console.warn('[SurveillanceStore] Intervention backend sync notice:', e.message);
    }
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
  static async addAnimalToHerd(animal: Omit<AnimalHerdItem, 'id'>) {
    const newId = `ANM-0${this.getState().herd.length + 1}`;
    const newItem: AnimalHerdItem = { ...animal, id: newId };
    const log = `Registered new animal ${newItem.tagNumber} (${newItem.breed} ${newItem.species}) to farmer herd.`;

    this.setState(s => ({
      ...s,
      herd: [newItem, ...s.herd],
      systemLogs: [log, ...s.systemLogs]
    }));

    try {
      await ApiService.createAnimal(animal);
    } catch (e: any) {
      console.warn('[SurveillanceStore] Animal registration backend sync notice:', e.message);
    }
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
    SurveillanceStoreManager.initializeFromBackend();
    return SurveillanceStoreManager.subscribe(setState);
  }, []);

  return {
    state,
    login: (id: string, pass: string) => SurveillanceStoreManager.login(id, pass),
    quickLogin: (role: UserRole) => SurveillanceStoreManager.quickLogin(role),
    logout: () => SurveillanceStoreManager.logout(),
    showToast: (type: 'success' | 'error' | 'info' | 'warning', message: string, title?: string) => SurveillanceStoreManager.showToast(type, message, title),
    removeToast: (id: string) => SurveillanceStoreManager.removeToast(id),
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
