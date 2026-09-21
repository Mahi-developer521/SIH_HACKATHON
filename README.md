# Pashu-Suraksha AI | Livestock Disease Surveillance & Response Platform

An end-to-end, AI-assisted livestock disease surveillance, early warning, and field response platform designed for national veterinary health authorities, field para-vets, diagnostic laboratories, and livestock farmers.

---

## 🌟 Key Architecture & Highlights

The platform implements the complete **32-Step Closed-Loop Master Architecture**:

1. **Farmer (Signal Ingestion)**:
   - Species, herd size, sick/dead count, standardized symptom checklist.
   - Multi-modal reporting: Camera capture & device photo upload, multilingual voice-based reporting with speech-to-text, and GPS coordinates (`CASE-1024`).
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

```
┌────────────────────────────────────────────────────────┐
│               React Frontend (Vite + TS)               │
│  - Role Portals (Farmer, Vet, Field Worker, Lab, Admin)│
│  - Offline Outbox (PWA + localStorage sync on online)  │
│  - Interactive 9-Layer Leaflet GIS Risk Map            │
│  - Multilingual Support (English, తెలుగు, हिंदी)      │
│  - Live Device Camera & Voice Speech-to-Text Input     │
└──────────────────────────┬─────────────────────────────┘
                           │ REST API (/api/* with Bearer JWT)
                           ▼
┌────────────────────────────────────────────────────────┐
│            Node.js + Express Backend API               │
│  - Real RBAC Auth (bcrypt password hashes + JWT)       │
│  - Strict Data Validation & Canonicalization           │
│  - Multi-Factor AI Risk Scoring Engine                 │
│  - Multer Image Uploads (/api/reports/upload-image)    │
│  - Dual-Mode Resilience (PostgreSQL + Demo Fallback)   │
└──────────────────────────┬─────────────────────────────┘
                           │ pg Connection Pool
                           ▼
┌────────────────────────────────────────────────────────┐
│              PostgreSQL Relational DB                  │
│  - Relational Schema (14 Tables, Constraints, Indexes) │
│  - Users, Reports, Disease Clusters, Audit Logs        │
│  - Full ACID Audit Trail & Epidemiological History     │
└────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ (Tested on Node v20/v22/v24)
- npm v9+
- [PostgreSQL](https://www.postgresql.org/) v14+ (Local PostgreSQL, pgAdmin 4, or Cloud PostgreSQL like Supabase/Neon/RDS)

---

### Step 1: Database Setup (PostgreSQL)

1. Open **pgAdmin 4** or `psql` and create a new database:
   ```sql
   CREATE DATABASE livestock_db;
   ```

2. Configure environment variables in `backend/.env` (copy from `backend/.env.example`):
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/livestock_db
   PORT=5000
   JWT_SECRET=sih-2026-pashu-suraksha-secure-jwt-key
   NODE_ENV=development
   ```

3. Run the schema creation and demo seed script:
   ```bash
   cd backend
   npm run db:init
   ```
   *This executes `backend/sql/schema.sql` and `backend/sql/seed.sql` to initialize all 14 tables and demo users with secure bcrypt hashes.*

> **Dual-Mode Fallback**: If PostgreSQL is temporarily offline during quick hackathon evaluation, the backend automatically operates in an in-memory resilient mode with seed data and bcrypt verification, ensuring zero crashes. When PostgreSQL is connected, all queries execute directly on the database.

---

### Step 2: Start Backend (Express + PostgreSQL)

```bash
cd backend

# Install backend dependencies
npm install

# Start Express server
npm start
```
*Backend runs on `http://localhost:5000` with static uploads served at `http://localhost:5000/uploads`.*

---

### Step 3: Start Frontend (React + Vite)

In a new terminal window at the project root:

```bash
# Install frontend dependencies
npm install

# Start Vite dev server
npm run dev
```
*Frontend runs on `http://localhost:3000`. Requests to `/api/*` and `/uploads/*` are automatically proxied to the Express backend on port 5000.*

---

### Production Build
```bash
npm run build     # Runs tsc and vite build (0 errors)
npm run preview   # Previews production bundle
```

---

## 🔐 Real Role-Based Access Control (RBAC) & Demo Credentials

The platform enforces true backend-driven authentication using JWT tokens and bcrypt password hashing. Login is performed via a unified email/password form with automatic role dispatching.

For evaluation, 1-click quick-fill buttons are provided on the login gateway:

| Role | Email / Identifier | Password | Access Scope & Primary Capabilities |
| :--- | :--- | :--- | :--- |
| **👨‍🌾 Farmer** | `farmer@example.com` | `farmer123` | Multi-case reporting, camera photo capture, multilingual voice reporting, offline outbox, herd registry, proximity alerts, spoken voice advisories |
| **👨‍⚕️ Veterinary Officer** | `vet@example.com` | `vet123` | AI Alert triage, mission dispatch, clinical verification, intervention authorization (Ring vaccination/quarantine), village coverage |
| **👷 Field Worker** | `fieldworker@example.com` | `field123` | Field missions, herd examination, lesion verification, photo capture, sample collection & lab dispatch |
| **🧪 Lab Staff** | `lab@example.com` | `lab123` | Biological sample intake, molecular assays (RT-PCR, ELISA, Antigen), CT value reporting, result certification & transmission |
| **🛡️ System Admin** | `admin@example.com` | `admin123` | 32-step master architecture pipeline inspector, national surveillance audit logs, system health & user management |

---

## 🌐 First-Class Telugu, Hindi & English Localization

The application provides accurate, respectful localization across the entire platform:
- **English (`en`)**: Complete terminology, clinical scoring, and field workflows (`src/i18n/en.json`).
- **తెలుగు (`te`)**: Natural, respectful, and accurate Telugu Unicode for rural Andhra Pradesh and Telangana livestock owners (`src/i18n/te.json`).
- **हिंदी (`hi`)**: Complete vernacular translation for northern livestock belts (`src/i18n/hi.json`).

The language switcher in the navbar allows instant toggling: `English | తెలుగు | हिंदी`. The user's language preference is automatically persisted across reloads in `localStorage`.

---

## 📸 Camera Capture & Image Upload

Integrated directly into the Farmer Case Reporting workflow (`src/components/farmer/ReportCaseModal.tsx`):
- **Method A: Upload from Device**:
  - File picker accepting `.jpg`, `.jpeg`, `.png`, `.webp`.
  - Client-side validation enforcing a 5MB size limit.
  - Image preview with file size badge, remove, and replace controls.
- **Method B: Live Device Camera**:
  - Direct access to device camera stream via `navigator.mediaDevices.getUserMedia`.
  - Live viewfinder with reticle overlay.
  - Instant snapshot capture with review, retake, and confirm actions.
- **Backend Storage**:
  - Uploaded images are sent via `POST /api/reports/upload-image` with `multipart/form-data`.
  - Stored securely in `backend/uploads/` with timestamped unique filenames.
  - Tracked in PostgreSQL `disease_reports` via `image_url`, `image_filename`, and `image_uploaded_at`.

---

## 🎙️ Multilingual Voice-Based Reporting

Empowers rural farmers who prefer speaking over typing:
- **Dynamic Speech Recognition**: Utilizes browser Web Speech API dynamically configured for the active language:
  - Telugu: `te-IN`
  - English: `en-IN`
  - Hindi: `hi-IN`
- **Interactive Controls**:
  - Pulsing recording indicator with elapsed time counter.
  - Real-time live transcription stream.
  - Editable transcript textarea so farmers can review, amend, or add additional notes.
- **AI Decision Support**:
  - Smart symptom extraction suggestions from the spoken voice transcript.
  - Explicit advisory badge indicating that AI suggestions assist decision-making and final diagnosis requires veterinary confirmation.
- **Persistence**: Voice transcript and language metadata (`voice_transcript`, `voice_language`, `reported_language`) are saved directly in the case report and synced to PostgreSQL.

---

## 📴 Offline Mode & Resilient Auto-Sync

Designed for rural areas with intermittent connectivity:
- **Offline Simulation Toggle**: Click the `ONLINE / OFFLINE` button in the top navbar or login screen to simulate loss of cellular network.
- **Outbox Queue**: Any reports filed while offline are saved to the browser's local persistent outbox (`OUTBOX-001`, etc.).
- **Automatic Sync**: As soon as connectivity is restored (or when clicking **Sync Now**), all queued reports are processed through the validation pipeline, AI risk engine, and cluster detection.
- **PWA Ready**: Includes `manifest.json` and service worker (`sw.js`) for progressive web app caching.

---

## 📡 REST API Reference

All protected endpoints accept a `Bearer <token>` in the `Authorization` header.

### Authentication (`/api/auth`)
- `POST /api/auth/login`: Authenticate user with `{ email, password }`. Returns JWT token and user profile.
- `GET /api/auth/me`: Retrieve current authenticated user profile from token.
- `POST /api/auth/logout`: Invalidate session.

### Case Reports (`/api/reports`)
- `GET /api/reports`: List all disease reports.
- `GET /api/reports/:id`: Get report by ID.
- `POST /api/reports`: Create new disease report (includes validation, AI risk evaluation, and cluster check).
- `POST /api/reports/upload-image`: Upload case image file (Multipart form, max 5MB).
- `PATCH /api/reports/:id/status`: Update case status.

### Missions (`/api/missions`)
- `GET /api/missions`: List field missions.
- `POST /api/missions`: Create response mission.
- `PATCH /api/missions/:id/status`: Update mission status.

### Field Investigations (`/api/investigations`)
- `GET /api/investigations`: List investigations.
- `POST /api/investigations`: Submit on-site investigation details.

### Diagnostics & Lab (`/api/lab`)
- `GET /api/lab/samples`: List lab samples.
- `POST /api/lab/samples`: Dispatch biological sample.
- `POST /api/lab/results`: Upload certified lab result.

### Interventions (`/api/interventions`)
- `GET /api/interventions`: List interventions (ring vaccination, quarantine).
- `POST /api/interventions`: Authorize new intervention.

### Herd Registry (`/api/animals`)
- `GET /api/animals`: List registered livestock.
- `POST /api/animals`: Register new animal to herd.

---

## 📁 Repository Directory Layout

```
livestock-surveillance-platform/
├── backend/
│   ├── controllers/
│   │   ├── authController.js        # JWT login, me, logout
│   │   ├── reportController.js      # Reports, AI scoring & image upload
│   │   ├── missionController.js     # Vet response missions
│   │   ├── investigationController.js # Field investigations
│   │   ├── labController.js         # Lab samples & results
│   │   ├── interventionController.js# Ring vaccination & quarantines
│   │   └── animalController.js      # Herd registry
│   ├── middleware/
│   │   ├── auth.js                  # verifyToken & requireRole RBAC middleware
│   │   ├── upload.js                # Multer 5MB file upload validation
│   │   └── errorHandler.js          # Centralized error responses
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── reportRoutes.js
│   │   ├── missionRoutes.js
│   │   ├── investigationRoutes.js
│   │   ├── labRoutes.js
│   │   ├── interventionRoutes.js
│   │   └── animalRoutes.js
│   ├── scripts/
│   │   └── initDb.js                # Database initialization runner
│   ├── sql/
│   │   ├── schema.sql               # 14 Relational DDL tables with constraints
│   │   └── seed.sql                 # Demo users with bcrypt hashes & baseline cases
│   ├── uploads/
│   │   └── .gitkeep                 # Upload directory tracking (images gitignored)
│   ├── db.js                        # PostgreSQL connection pool with memory fallback
│   ├── server.js                    # Express app entrypoint & static serving
│   ├── .env.example                 # Example configuration
│   └── package.json
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   └── AuthGateway.tsx      # Professional government login portal
│   │   ├── common/
│   │   │   ├── Navbar.tsx           # Language switcher (EN/TE/HI) & user badge
│   │   │   └── MasterFlowView.tsx   # 32-step surveillance pipeline inspector
│   │   ├── farmer/
│   │   │   ├── FarmerDashboard.tsx  # Farmer-first priority layout
│   │   │   ├── ReportCaseModal.tsx  # Camera capture, image upload & voice reporting
│   │   │   ├── CameraScanner.tsx    # Dedicated AI visual lesion scanner
│   │   │   └── AddAnimalModal.tsx   # Herd animal registration
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
│   │   ├── gis/
│   │   │   └── GisMap.tsx           # 9-layer Leaflet GIS risk map
│   │   └── monitoring/
│   │       └── OutcomeMonitoringView.tsx
│   ├── i18n/
│   │   ├── en.json                  # English localization dictionary
│   │   ├── te.json                  # First-class Telugu Unicode dictionary
│   │   └── hi.json                  # Hindi localization dictionary
│   ├── services/
│   │   ├── apiService.ts            # Frontend REST client with JWT header
│   │   ├── i18nService.ts           # Language loader & persistent storage
│   │   ├── aiEngine.ts              # Symptom weighting & anomaly velocity
│   │   ├── validationService.ts     # Duplicate check & canonicalization
│   │   └── proximityEngine.ts       # Haversine distance & alert engine
│   ├── store/
│   │   └── surveillanceStore.ts     # Global state, toasts & backend sync
│   ├── types/
│   │   └── surveillance.ts          # TypeScript domain interfaces
│   ├── App.tsx                      # Root component with toast container
│   ├── main.tsx
│   └── styles/
│       └── index.css
├── .gitignore
├── package.json
├── vite.config.ts
└── README.md
```

---

## 🏆 Smart India Hackathon 2026 Ready
- **Government Visual Standards**: Built with modern, clean UI, clear visual hierarchy, accessible color coding, and responsive design.
- **Complete Closed Loop**: Signals travel seamlessly from Farmer $\rightarrow$ AI Validation $\rightarrow$ GIS Zones $\rightarrow$ Vet Triage $\rightarrow$ Field Mission $\rightarrow$ Lab Verification $\rightarrow$ Intervention $\rightarrow$ Outcome Monitoring.
- **Multilingual & Offline**: Accessible in Telugu, Hindi, and English; resilient to rural connectivity drops.
