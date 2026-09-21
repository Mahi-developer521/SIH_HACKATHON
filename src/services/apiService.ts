import { 
  CaseReport, 
  ResponseMission, 
  FieldInvestigation, 
  LabSample, 
  LabResult, 
  Intervention, 
  AnimalHerdItem,
  CurrentUser
} from '../types/surveillance';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';
const TOKEN_KEY = 'PASHU_SURAKSHA_AUTH_TOKEN';

export class ApiService {
  /**
   * Token Management
   */
  static setAuthToken(token: string) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      // ignore
    }
  }

  static getAuthToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  static clearAuthToken() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // ignore
    }
  }

  private static getHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = { ...customHeaders };
    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

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
  // AUTHENTICATION & RBAC
  // ==========================================
  static async login(emailOrId: string, pass: string): Promise<{ token: string; user: CurrentUser }> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailOrId, password: pass })
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Authentication failed. Please verify credentials.');
    }

    if (result.token) {
      this.setAuthToken(result.token);
    }

    return {
      token: result.token,
      user: {
        id: result.user.id,
        name: result.user.name,
        role: result.user.role,
        phoneOrEmail: result.user.email || result.user.phone_or_email,
        designation: result.user.designation || '',
        location: result.user.location || ''
      }
    };
  }

  static async getMe(): Promise<CurrentUser | null> {
    const token = this.getAuthToken();
    if (!token) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: this.getHeaders()
      });
      if (!response.ok) {
        this.clearAuthToken();
        return null;
      }
      const result = await response.json();
      return result.user || null;
    } catch {
      return null;
    }
  }

  static async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: this.getHeaders()
      });
    } catch {
      // ignore
    } finally {
      this.clearAuthToken();
    }
  }

  // ==========================================
  // IMAGE UPLOAD
  // ==========================================
  static async uploadImage(file: File): Promise<{ imageUrl: string; filename: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const token = this.getAuthToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/reports/upload-image`, {
      method: 'POST',
      headers,
      body: formData
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Failed to upload lesion image.');
    }

    return {
      imageUrl: result.data.imageUrl,
      filename: result.data.filename
    };
  }

  // ==========================================
  // DISEASE REPORTS
  // ==========================================
  static async getReports(): Promise<CaseReport[]> {
    const response = await fetch(`${API_BASE_URL}/reports`, {
      headers: this.getHeaders()
    });
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const result = await response.json();
    return result.data || [];
  }

  static async getReportById(id: string): Promise<CaseReport> {
    const response = await fetch(`${API_BASE_URL}/reports/${encodeURIComponent(id)}`, {
      headers: this.getHeaders()
    });
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
    imageUrl?: string;
    imageFilename?: string;
    voiceTranscript?: string;
    voiceLanguage?: string;
    reportedLanguage?: string;
    coordinates?: { lat: number; lng: number };
  }): Promise<CaseReport> {
    const response = await fetch(`${API_BASE_URL}/reports`, {
      method: 'POST',
      headers: this.getHeaders({ 'Content-Type': 'application/json' }),
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
    const response = await fetch(`${API_BASE_URL}/missions`, {
      headers: this.getHeaders()
    });
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
      headers: this.getHeaders({ 'Content-Type': 'application/json' }),
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
      headers: this.getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ status })
    });
    const result = await response.json();
    return result.data;
  }

  // ==========================================
  // FIELD INVESTIGATIONS
  // ==========================================
  static async getInvestigations(): Promise<FieldInvestigation[]> {
    const response = await fetch(`${API_BASE_URL}/investigations`, {
      headers: this.getHeaders()
    });
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
      headers: this.getHeaders({ 'Content-Type': 'application/json' }),
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
    const response = await fetch(`${API_BASE_URL}/lab/samples`, {
      headers: this.getHeaders()
    });
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
      headers: this.getHeaders({ 'Content-Type': 'application/json' }),
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
    const response = await fetch(`${API_BASE_URL}/lab/results`, {
      headers: this.getHeaders()
    });
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
      headers: this.getHeaders({ 'Content-Type': 'application/json' }),
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
    const response = await fetch(`${API_BASE_URL}/interventions`, {
      headers: this.getHeaders()
    });
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
      headers: this.getHeaders({ 'Content-Type': 'application/json' }),
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
      method: 'PUT',
      headers: this.getHeaders()
    });
    const result = await response.json();
    return result.data;
  }

  // ==========================================
  // ANIMAL HERD REGISTRY
  // ==========================================
  static async getAnimals(): Promise<AnimalHerdItem[]> {
    const response = await fetch(`${API_BASE_URL}/animals`, {
      headers: this.getHeaders()
    });
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const result = await response.json();
    return result.data || [];
  }

  static async createAnimal(data: Omit<AnimalHerdItem, 'id'>): Promise<AnimalHerdItem> {
    const response = await fetch(`${API_BASE_URL}/animals`, {
      method: 'POST',
      headers: this.getHeaders({ 'Content-Type': 'application/json' }),
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
