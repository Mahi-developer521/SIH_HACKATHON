import { 
  CaseReport, 
  ResponseMission, 
  FieldInvestigation, 
  LabSample, 
  LabResult, 
  Intervention, 
  AnimalHerdItem 
} from '../types/surveillance';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';

export class ApiService {
  /**
   * Health check for backend and PostgreSQL database
   */
  static async checkHealth(): Promise<{ status: string; database: { status: string; error?: string } }> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      return await response.json();
    } catch (err: any) {
      return {
        status: 'offline',
        database: { status: 'disconnected', error: err.message }
      };
    }
  }

  // ==========================================
  // DISEASE REPORTS
  // ==========================================
  static async getReports(): Promise<CaseReport[]> {
    const response = await fetch(`${API_BASE_URL}/reports`);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const result = await response.json();
    return result.data || [];
  }

  static async getReportById(id: string): Promise<CaseReport> {
    const response = await fetch(`${API_BASE_URL}/reports/${encodeURIComponent(id)}`);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const result = await response.json();
    return result.data;
  }

  static async createReport(reportData: {
    farmerId?: string;
    farmerName?: string;
    farmerPhone?: string;
    village: string;
    animalType: string;
    totalAnimals: number;
    sickCount: number;
    deadCount: number;
    symptoms: string[];
    photoUrl?: string;
    voiceTranscript?: string;
    coordinates?: { lat: number; lng: number };
  }): Promise<CaseReport> {
    const response = await fetch(`${API_BASE_URL}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData)
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Server returned ${response.status}`);
    }
    const result = await response.json();
    return result.data;
  }

  // ==========================================
  // RESPONSE MISSIONS
  // ==========================================
  static async getMissions(): Promise<ResponseMission[]> {
    const response = await fetch(`${API_BASE_URL}/missions`);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const result = await response.json();
    return result.data || [];
  }

  static async createMission(missionData: {
    caseId: string;
    clusterId?: string;
    assignedToWorkerId?: string;
    workerName?: string;
    targetVillage?: string;
    coordinates?: { lat: number; lng: number };
    priority?: string;
    instructions: string;
  }): Promise<ResponseMission> {
    const response = await fetch(`${API_BASE_URL}/missions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(missionData)
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Server returned ${response.status}`);
    }
    const result = await response.json();
    return result.data;
  }

  static async updateMissionStatus(id: string, status: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/missions/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const result = await response.json();
    return result.data;
  }

  // ==========================================
  // FIELD INVESTIGATIONS
  // ==========================================
  static async getInvestigations(): Promise<FieldInvestigation[]> {
    const response = await fetch(`${API_BASE_URL}/investigations`);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const result = await response.json();
    return result.data || [];
  }

  static async createInvestigation(data: {
    missionId: string;
    examinedCount: number;
    sickCount: number;
    deadCount: number;
    observedSymptoms: string[];
    vaccinationAudited: boolean;
    treatmentHistory?: string;
    photos?: string[];
    coordinates?: { lat: number; lng: number };
    fieldNotes: string;
    sampleTaken?: boolean;
    sampleId?: string;
  }): Promise<FieldInvestigation> {
    const response = await fetch(`${API_BASE_URL}/investigations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Server returned ${response.status}`);
    }
    const result = await response.json();
    return result.data;
  }

  // ==========================================
  // LABORATORY SAMPLES & RESULTS
  // ==========================================
  static async getLabSamples(): Promise<LabSample[]> {
    const response = await fetch(`${API_BASE_URL}/lab/samples`);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const result = await response.json();
    return result.data || [];
  }

  static async createLabSample(data: {
    caseId: string;
    missionId?: string;
    sampleType: string;
    collectedBy?: string;
    coordinates?: { lat: number; lng: number };
    targetLabName?: string;
  }): Promise<LabSample> {
    const response = await fetch(`${API_BASE_URL}/lab/samples`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Server returned ${response.status}`);
    }
    const result = await response.json();
    return result.data;
  }

  static async getLabResults(): Promise<LabResult[]> {
    const response = await fetch(`${API_BASE_URL}/lab/results`);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const result = await response.json();
    return result.data || [];
  }

  static async createLabResult(data: {
    sampleId: string;
    caseId: string;
    testMethod?: string;
    pathogenIdentified?: string;
    strainVariant?: string;
    result: string;
    confidenceScore?: number;
    labTechnicianName?: string;
    notes?: string;
  }): Promise<LabResult> {
    const response = await fetch(`${API_BASE_URL}/lab/results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Server returned ${response.status}`);
    }
    const result = await response.json();
    return result.data;
  }

  // ==========================================
  // INTERVENTIONS
  // ==========================================
  static async getInterventions(): Promise<Intervention[]> {
    const response = await fetch(`${API_BASE_URL}/interventions`);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const result = await response.json();
    return result.data || [];
  }

  static async createIntervention(data: {
    clusterId?: string;
    caseId?: string;
    type: string;
    title: string;
    description?: string;
    targetVillages?: string[];
    authorizedBy?: string;
    dosesRequired?: number;
  }): Promise<Intervention> {
    const response = await fetch(`${API_BASE_URL}/interventions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Server returned ${response.status}`);
    }
    const result = await response.json();
    return result.data;
  }

  static async completeIntervention(id: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/interventions/${encodeURIComponent(id)}/complete`, {
      method: 'PUT'
    });
    const result = await response.json();
    return result.data;
  }

  // ==========================================
  // ANIMAL HERD REGISTRY
  // ==========================================
  static async getAnimals(): Promise<AnimalHerdItem[]> {
    const response = await fetch(`${API_BASE_URL}/animals`);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const result = await response.json();
    return result.data || [];
  }

  static async createAnimal(data: Omit<AnimalHerdItem, 'id'>): Promise<AnimalHerdItem> {
    const response = await fetch(`${API_BASE_URL}/animals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Server returned ${response.status}`);
    }
    const result = await response.json();
    return result.data;
  }
}
