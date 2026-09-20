# Pashu-Suraksha AI | Livestock Disease Surveillance & Response Platform

An end-to-end, AI-assisted livestock disease surveillance, early warning, and field response platform designed for national veterinary health authorities, field para-vets, diagnostic laboratories, and livestock farmers.

---

## 🌟 Key Architecture & Highlights

The platform implements the complete **32-Step Closed-Loop Master Architecture**:

1. **Farmer (Signal Ingestion)**:
   - Species, herd size, sick/dead count, standardized symptom checklist.
   - Multi-modal reporting with photo preview and interactive voice memo audio recording with automated speech-to-text transcript.
   - GPS coordinate capture and automatic case generation (`CASE-1024`).
2. **Data Validation Engine (Step 5)**:
   - Enforces schema validity, herd count bounds, duplicate submission suppression within 12 hours, and symptom canonicalization.
3. **AI Intelligence Engine (Steps 6-11)**:
   - Multi-factor risk engine: Clinical symptom weighting, mortality impact, anomaly velocity calculation against 5-year historical baselines.
   - Spatio-temporal cluster detection (e.g. `CL-001` across Rampur, Kalyanpur, and Shivpuri).
   - Generates auditable explainability factors and categorizes risk into **LOW**, **MEDIUM**, and **HIGH**.
   - **Low-Risk Branch (Step 9)**: Immediate farmer biosecurity advisory and preventive care guidance.
   - **High-Risk Branch (Step 10)**: Priority AI alert dispatch to Veterinary Officers.
4. **GIS Risk Map & 9 Layer Intelligence (Steps 12-13)**:
   - Interactive Leaflet GIS mapping with dark geospatial theme.
   - 9 toggleable layers:
     - 🔴 High-Risk Red Zones (pulsing circular buffer)
     - ⭕ Disease Clusters (`CL-001`)
     - 📍 Reported Disease Cases
     - 💉 Village Vaccination Gaps (e.g. Kalyanpur at 44% critical deficit)
     - 🏘️ Villages & Demographics
     - 👨‍🌾 Registered Livestock Owners
     - 🏥 Veterinary Polyclinics & Dispensaries
     - 🧪 Diagnostic Laboratories (RDDL)
     - 🌦️ Environmental, Weather & Vector Risk Layer
5. **Geospatial Proximity & Alert Engine (Step 14 & 27)**:
   - Haversine distance calculations from high-risk zones to registered herds:
     - $\le 4\text{ km}$: 🔴 **Urgent Red Alert** (SMS broadcast & IVR voice advisory)
     - $4-8\text{ km}$: 🟠 **Amber Advisory**
     - $> 8\text{ km}$: 🟢 Normal surveillance
6. **Veterinary Command Center (Steps 15-17, 24-26)**:
   - AI alert review desk with explainable epidemiological factors.
   - Response mission dispatch (`RM-001`) assigning field inspectors (`FW-04`).
   - Official clinical verification synthesising Farmer + AI + GIS + Field + Lab data.
   - Emergency intervention authorization: Ring vaccination, movement controls, herd quarantine.
   - Village vaccination coverage tracking.
7. **Field Worker Operations (Steps 18-20)**:
   - On-site physical inspection: animal examination, symptom confirmation, vaccination audit.
   - Protocol-driven biological sample collection (Sample ID `SMP-2045` barcode, oral swabs, whole blood).
8. **Diagnostic Laboratory Workflow (Steps 21-23)**:
   - Sample intake, custody tracking, molecular assays (RT-PCR, ELISA, Antigen).
   - Positive/Negative certification, CT values, and instant digital transmission to Veterinary Officer.
9. **Outcome Monitoring & Continuous Epidemiological Loop (Steps 28-30)**:
   - Tracks post-intervention decline in case velocity (21 $\rightarrow$ 12 $\rightarrow$ 3 cases).
   - AI re-analysis engine downgrades risk score (86 $\rightarrow$ 42 $\rightarrow$ 18) and updates GIS zones from Red to Green.
10. **Interactive 32-Step Master Flow Inspector**:
    - Embedded real-time pipeline visualizing every single step, current system state, inputs, outputs, and role responsibilities.

---

## 🏛️ Full-Stack Architecture (React + Express + PostgreSQL)

The platform is a production-grade full-stack distributed system:

```
┌────────────────────────────────────────────────────────┐
│               React Frontend (Vite + TS)               │
│  - Role Portals (Farmer, Vet, Field Worker, Lab, Admin)│
│  - Offline Outbox (PWA + localStorage sync on online)  │
│  - Interactive 9-Layer Leaflet GIS Risk Map            │
└──────────────────────────┬─────────────────────────────┘
                           │ REST API (/api/*)
                           ▼
┌────────────────────────────────────────────────────────┐
│            Node.js + Express Backend API               │
│  - Strict Data Validation & Canonicalization           │
│  - Multi-Factor AI Risk Scoring Engine                 │
│  - Dual-Mode Resilience (PostgreSQL + Seed Fallback)   │
└──────────────────────────┬─────────────────────────────┘
                           │ pg Connection Pool
                           ▼
┌────────────────────────────────────────────────────────┐
│              PostgreSQL Relational DB                  │
│  - Relational Schema (14 Tables, Constraints, Indexes) │
│  - Full ACID Audit Trail & Epidemiological History     │
└────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ (Tested on Node v24)
- npm v9+
- [PostgreSQL](https://www.postgresql.org/) v14+ (Local instance or Cloud PostgreSQL e.g. Neon, Supabase, Aiven, RDS)

---

### Step 1: Start Backend (Express + PostgreSQL)

```bash
cd backend

# 1. Install backend dependencies
npm install

# 2. Configure Database URL in backend/.env
# (Copy from backend/.env.example)
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/livestock_db
# PORT=5000

# 3. Initialize PostgreSQL schema and seed demonstration data
npm run db:init

# 4. Start the Express API server
npm start
# (Backend runs on http://localhost:5000 with health check at http://localhost:5000/api/health)
```

> **Note on Resilient Dual-Mode**: If PostgreSQL is temporarily offline or not yet configured, the backend automatically operates in in-memory fallback mode with seed data, ensuring zero developer friction or crashes. Once PostgreSQL is started, all queries execute directly on PostgreSQL.

---

### Step 2: Start Frontend (React + Vite)

In a new terminal window at the project root:

```bash
# 1. Install frontend dependencies (if not already done)
npm install

# 2. Start Vite development server
npm run dev

# 3. Open your browser:
# http://localhost:3000
```
*(Requests to `/api/*` are automatically proxied from port 3000 to the Express backend on port 5000).*

---

### Production Build
```bash
# Build React frontend
npm run build

# Preview build
npm run preview
```

---

## 📁 Project Structure

```
livestock-surveillance-platform/
├── backend/
│   ├── .env.example            # Sample environment config
│   ├── package.json            # Express, pg, cors, dotenv dependencies
│   ├── server.js               # Express API entry point & route registration
│   ├── db.js                   # PostgreSQL connection pool with fallback
│   ├── middleware/
│   │   └── errorHandler.js     # Centralized API error response handler
│   ├── controllers/
│   │   ├── reportController.js # Disease reports & AI risk evaluation
│   │   ├── missionController.js# Vet response missions
│   │   ├── investigationController.js # Field inspections
│   │   ├── labController.js    # Diagnostic samples & molecular results
│   │   ├── interventionController.js # Quarantines & ring vaccination
│   │   └── animalController.js # Herd registry
│   ├── routes/                 # Express REST route definitions
│   ├── scripts/
│   │   └── initDb.js           # Automated schema & seed migration runner
│   └── sql/
│       ├── schema.sql          # 14 Relational PostgreSQL DDL tables
│       └── seed.sql            # Demonstration baseline epidemiological seed
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── types/
│   │   └── surveillance.ts     # Domain types & interfaces
│   ├── data/
│   │   └── mockData.ts         # Baseline epidemiological seed data
│   ├── services/
│   │   ├── apiService.ts       # Full-stack REST API client
│   │   ├── validationService.ts# Data validation & duplicate detection
│   │   ├── aiEngine.ts         # Symptom scoring & anomaly detection
│   │   └── proximityEngine.ts  # Haversine distance & alert engine
│   ├── store/
│   │   └── surveillanceStore.ts# Full-stack state store with PostgreSQL sync
│   ├── components/
│   │   ├── common/
│   │   │   ├── Navbar.tsx          # Universal role switcher & status bar
│   │   │   └── MasterFlowView.tsx  # Interactive 32-step pipeline inspector
│   │   ├── gis/
│   │   │   └── GisMap.tsx          # 9-layer Leaflet GIS risk map
│   │   ├── auth/
│   │   │   └── AuthGateway.tsx     # Role-based login gateway with demo credentials
│   │   ├── farmer/
│   │   │   ├── FarmerDashboard.tsx # Farmer dashboard with multi-report & speech audio
│   │   │   ├── ReportCaseModal.tsx # Multi-modal reporting + voice + GPS
│   │   │   └── AddAnimalModal.tsx  # Register new animal to herd
│   │   ├── vet/
│   │   │   ├── VetDashboard.tsx
│   │   │   ├── CreateMissionModal.tsx
│   │   │   └── InterventionModal.tsx
│   │   ├── field/
│   │   │   ├── FieldWorkerDashboard.tsx
│   │   │   └── InvestigationModal.tsx
│   │   ├── lab/
│   │   │   ├── LabDashboard.tsx
│   │   │   └── EnterResultModal.tsx
│   │   └── monitoring/
│   │       └── OutcomeMonitoringView.tsx
│   └── styles/
│       └── index.css
```

---

## 🔐 Role-Based Demo Credentials

The platform features an enterprise role-based authentication portal with 1-click Quick Login and manual credential verification:

| Role | Name / Title | Phone / Email / ID | Password / PIN | Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **👨‍🌾 Farmer** | Ramesh Patel | `9423144556` | `1234` | Multi-case reporting, voice memos, GPS auto-detect, herd registry, proximity alerts, spoken audio advisories |
| **👨‍⚕️ Veterinarian** | Dr. A. Sharma | `vet.sharma@surveillance.gov.in` | `vet123` | AI Alert triage, mission dispatch, clinical verification, intervention authorization (Ring vaccination/quarantine) |
| **👷 Field Worker** | Pooja Patil | `FW-04` | `field123` | Field missions, herd examination, lesion verification, photo capture, sample collection & lab dispatch |
| **🧪 Lab Staff** | Dr. P. Rao (RDDL) | `lab.rddl@surveillance.gov.in` | `lab123` | Sample intake, RT-PCR / ELISA / Antigen assays, CT value reporting, result certification & transmission |

---

## 🌐 Multilingual Support (English, Hindi, Marathi)

Switch effortlessly between languages anytime via the language selector in the top navbar or login gateway:
- **English (`en`)**: Complete terminology, clinical scoring, and field workflows.
- **हिन्दी (`hi`)**: Full vernacular translation for symptoms, triage status, advisories, and actions.
- **मराठी (`mr`)**: Native regional language support for Maharashtra rural livestock belts.

---

## ⚡ Multi-Reporting for Farmers

Farmers can report sick animals multiple times sequentially without being blocked by duplicate filters:
1. Click **"Report Sick Animal"** on the Farmer Dashboard.
2. Enter animal details, symptoms, voice memo, and photos.
3. Review the instant AI risk score and next actions.
4. Click **"Report Another Case"** to immediately report a second or third animal.
5. All reported cases (`CASE-1024`, `CASE-1025`, etc.) are tracked simultaneously in the **My Cases** feed.
6. Click any case card to view its complete 6-stage lifecycle dossier.

---

## 📴 Offline Mode & Auto-Sync Engine

Designed for rural areas with intermittent connectivity:
- **Offline Simulation Toggle**: Click the `ONLINE / OFFLINE` button in the top navbar or login screen to simulate loss of cellular network.
- **Outbox Queue**: Any reports filed while offline are saved to the browser's local persistent outbox (`OUTBOX-001`, etc.).
- **Automatic Sync**: As soon as connectivity is restored (or when clicking **Sync Now**), all queued reports are processed through the validation pipeline, AI risk engine, and cluster detection.
- **PWA Ready**: Includes `manifest.json` and service worker (`sw.js`) for progressive web app caching.

---

## 📸 Live Camera & Lesion Photo Upload Scanner

Integrated directly into the Farmer Dashboard for immediate lesion assessment:
- **Live Device Camera Viewfinder**: Accesses the webcam or phone camera with a real-time HUD scanning reticle, facing-mode toggle (front/rear), and 1-click snapshot capture.
- **Photo Upload from File**: Select image files directly from local storage or mobile gallery (`capture="environment"`).
- **Clinical Pathology Reference Library**: Instant test samples for Foot & Mouth Disease (oral vesicles and hoof ulcerations), Lumpy Skin Disease (cutaneous nodules), and healthy controls.
- **Instant AI Computer Vision Screening**: Classifies lesions with confidence scores (e.g., 94% FMD suspicion), summarizes visual examination findings, and automatically correlates symptoms.
- **Direct Case Reporting**: Click **"Report Case With This Photo"** to open the reporting form with the photo and symptoms automatically pre-filled.
- **In-Modal Camera**: The report modal also includes an integrated camera viewfinder for taking snapshots on the spot.


