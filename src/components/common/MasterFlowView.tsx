import React, { useState } from 'react';
import { useSurveillanceStore } from '../../store/surveillanceStore';
import { 
  CheckCircle2, 
  ArrowRight, 
  Bot, 
  Map, 
  Bell, 
  Stethoscope, 
  ClipboardCheck, 
  FlaskConical, 
  Syringe, 
  RefreshCw, 
  Radio
} from 'lucide-react';

interface StepNode {
  step: number;
  title: string;
  role: string;
  category: 'FARMER' | 'AI' | 'GIS' | 'VET' | 'FIELD' | 'LAB' | 'MONITORING';
  description: string;
  inputs: string;
  outputs: string;
}

const MASTER_STEPS: StepNode[] = [
  {
    step: 1,
    title: 'Basic Assumption & Problem Setup',
    role: 'System',
    category: 'FARMER',
    description: 'Farmer detects abnormal animal symptoms and triggers the surveillance chain.',
    inputs: 'Clinical observations in herd',
    outputs: 'Surveillance readiness'
  },
  {
    step: 2,
    title: 'Home & Role Selection',
    role: 'All Roles',
    category: 'FARMER',
    description: 'Role-based access gateway for Farmer, Vet Officer, Field Worker, and Lab Staff.',
    inputs: 'User credentials / PIN',
    outputs: 'Authenticated persona dashboard'
  },
  {
    step: 3,
    title: 'Farmer Dashboard Overview',
    role: 'Farmer',
    category: 'FARMER',
    description: 'Farmer accesses My Herd, vaccination records, case status, and nearby alerts.',
    inputs: 'Farm profile & herd data',
    outputs: 'Service navigation'
  },
  {
    step: 4,
    title: 'Farmer Reports a Case (Signal 1)',
    role: 'Farmer',
    category: 'FARMER',
    description: 'Farmer submits animal type, counts (sick/dead), symptoms, photo, voice recording & GPS.',
    inputs: 'Species, counts, symptoms, media, GPS',
    outputs: 'Raw Case Submission'
  },
  {
    step: 5,
    title: 'Data Validation & Standardization',
    role: 'Validation Engine',
    category: 'AI',
    description: 'Validates required fields, GPS limits, duplicate reports, and standardizes symptoms.',
    inputs: 'Raw case payload',
    outputs: 'Clean standardized case record (CASE-1024)'
  },
  {
    step: 6,
    title: 'AI Analysis Ingestion',
    role: 'AI Engine',
    category: 'AI',
    description: 'Combines current case with symptoms, animal type, historical baseline, and environment.',
    inputs: 'Case report + baseline epidemiological data',
    outputs: 'Consolidated feature vector'
  },
  {
    step: 7,
    title: 'Multi-Factor AI Analytics',
    role: 'AI Engine',
    category: 'AI',
    description: 'Performs Symptom Analysis, Anomaly Velocity Detection, Spatio-Temporal Clustering & Risk Engine.',
    inputs: 'Feature vector + surrounding cases',
    outputs: 'Calculated Risk Score (0-100)'
  },
  {
    step: 8,
    title: 'Risk Level Classification',
    role: 'AI Engine',
    category: 'AI',
    description: 'Stratifies case into LOW (<40), MEDIUM (40-69), or HIGH (70-100) with auditable reasons.',
    inputs: 'Risk score & factor breakdown',
    outputs: 'Risk category & prioritized next action'
  },
  {
    step: 9,
    title: 'Low-Risk Workflow (Precautions)',
    role: 'Farmer & Dispensary',
    category: 'FARMER',
    description: 'If Low Risk: farmer receives immediate preventive precautions, nutrition/hygiene advisory.',
    inputs: 'Low Risk Score',
    outputs: 'Farmer advisory & passive monitoring'
  },
  {
    step: 10,
    title: 'High-Risk Workflow (AI Alert)',
    role: 'AI Engine',
    category: 'VET',
    description: 'If High Risk: generates high-priority AI Alert for Veterinary Officer review.',
    inputs: 'High Risk Score (>=70)',
    outputs: 'Urgent AI Alert ticket'
  },
  {
    step: 11,
    title: 'Spatio-Temporal Cluster Detection',
    role: 'AI Engine',
    category: 'AI',
    description: 'Groups multiple village cases within 10km and 7 days with similar acute symptoms (e.g. Cluster CL-001).',
    inputs: 'Cross-village case timestamps & GPS',
    outputs: 'Cluster Record (e.g. CL-001, 21 Cases, 3 Villages)'
  },
  {
    step: 12,
    title: 'GIS Integration & Risk Zone Creation',
    role: 'GIS Engine',
    category: 'GIS',
    description: 'Plots active cases, connects AI risk scores, and generates dynamic Red Zones on the GIS map.',
    inputs: 'Cluster coordinates & risk score',
    outputs: 'Red Danger Zone overlay'
  },
  {
    step: 13,
    title: 'Multi-Layer GIS Visualization',
    role: 'GIS Engine',
    category: 'GIS',
    description: 'Interactive map with 9 layers: Cases, Clusters, Red Zones, Villages, Farmers, Clinics, Labs, Vaccination Gaps, Weather.',
    inputs: 'Geospatial datasets',
    outputs: 'Comprehensive situational map'
  },
  {
    step: 14,
    title: 'Geospatial Proximity & Alert Engine',
    role: 'Alert Engine',
    category: 'GIS',
    description: 'Calculates Haversine distance from Red Zone to registered farmers (0-3km: Red Alert, 3-8km: Amber Advisory).',
    inputs: 'Farmer GPS & cluster radius',
    outputs: 'Targeted SMS, IVR audio & App warnings'
  },
  {
    step: 15,
    title: 'Veterinary Command Dashboard',
    role: 'Veterinary Officer',
    category: 'VET',
    description: 'Veterinarian monitors active AI Alerts, clusters, hot-spots, and pending investigations.',
    inputs: 'AI alerts, GIS risk map, case feed',
    outputs: 'Command triage desk'
  },
  {
    step: 16,
    title: 'Veterinary Alert Review & Triage',
    role: 'Veterinary Officer',
    category: 'VET',
    description: 'Vet inspects explainable AI evidence, historical deviations, and selects action: Investigate, Monitor, Escalate.',
    inputs: 'AI evidence & cluster telemetry',
    outputs: 'Clinical triage decision'
  },
  {
    step: 17,
    title: 'Create Mission & Assign Field Worker',
    role: 'Veterinary Officer',
    category: 'VET',
    description: 'Generates Response Mission (RM-001), assigns Field Worker (FW-04), sets priority and sampling protocol.',
    inputs: 'Target village, instructions, priority',
    outputs: 'Dispatched Mission Order'
  },
  {
    step: 18,
    title: 'Field Worker Dashboard',
    role: 'Field Worker',
    category: 'FIELD',
    description: 'Field Worker receives mission, views village location, farmer contacts, and navigation routes.',
    inputs: 'Assigned mission notification',
    outputs: 'Field operational readiness'
  },
  {
    step: 19,
    title: 'On-Site Field Investigation',
    role: 'Field Worker',
    category: 'FIELD',
    description: 'Visits premises, tallies sick/dead, verifies oral/foot lesions, audits vaccination, captures photo/GPS.',
    inputs: 'Clinical physical examination',
    outputs: 'Verified Field Investigation Report'
  },
  {
    step: 20,
    title: 'Biological Sample Collection',
    role: 'Field Worker',
    category: 'FIELD',
    description: 'Collects swab/blood/tissue, generates Sample ID (SMP-2045) with barcode, and dispatches to RDDL lab.',
    inputs: 'Sample specimen & cold chain',
    outputs: 'Dispatched Lab Sample'
  },
  {
    step: 21,
    title: 'Laboratory Staff Intake Dashboard',
    role: 'Lab Staff',
    category: 'LAB',
    description: 'Lab receives sample, verifies custody chain, barcode, and registers sample in testing queue.',
    inputs: 'Arriving biological specimen',
    outputs: 'Sample intake log'
  },
  {
    step: 22,
    title: 'Diagnostic Laboratory Workflow',
    role: 'Lab Staff',
    category: 'LAB',
    description: 'Conducts RT-PCR / ELISA / Antigen tests to isolate pathogen and determine viral/bacterial strains.',
    inputs: 'Laboratory molecular testing',
    outputs: 'Test metrics (CT value, titers)'
  },
  {
    step: 23,
    title: 'Digital Result Transmission',
    role: 'Lab Staff',
    category: 'LAB',
    description: 'Uploads certified test certificate (Positive/Negative/Inconclusive) directly to Central DB & Vet Dashboard.',
    inputs: 'Verified test outcome',
    outputs: 'Certified Lab Certificate'
  },
  {
    step: 24,
    title: 'Veterinary Diagnostic Verification',
    role: 'Veterinary Officer',
    category: 'VET',
    description: 'Vet synthesizes Farmer Report + AI + GIS + Field Notes + Lab Result to issue official confirmation.',
    inputs: 'Multi-source verified dossier',
    outputs: 'Official Outbreak Confirmation'
  },
  {
    step: 25,
    title: 'Intervention Execution',
    role: 'Intervention Module',
    category: 'VET',
    description: 'Authorizes Ring Vaccination, emergency therapy, herd quarantine, and authorized movement restrictions.',
    inputs: 'Intervention protocol',
    outputs: 'Active response deployment'
  },
  {
    step: 26,
    title: 'Vaccination Coverage Tracking',
    role: 'Veterinary Officer',
    category: 'VET',
    description: 'Monitors village herd immunity and flags critical coverage gaps (e.g. Village B at 44% vs Village A at 90%).',
    inputs: 'Village census & vaccine doses',
    outputs: 'Vaccination vulnerability heatmap'
  },
  {
    step: 27,
    title: 'Preventive Farmer Broadcasts',
    role: 'Alert Engine',
    category: 'GIS',
    description: 'Delivers actionable biosecurity alerts to nearby herds to halt transmission into uninfected villages.',
    inputs: 'Active danger perimeters',
    outputs: 'Targeted SMS / Voice warnings'
  },
  {
    step: 28,
    title: 'Outcome Monitoring',
    role: 'Monitoring Module',
    category: 'MONITORING',
    description: 'Tracks post-intervention epidemiological curve: new cases drop from 21 to 12 to 3, mortality halts.',
    inputs: 'Follow-up field telemetry',
    outputs: 'Epidemiological outcome curves'
  },
  {
    step: 29,
    title: 'Containment vs Escalation Check',
    role: 'Veterinary Officer',
    category: 'MONITORING',
    description: 'Evaluates trend: if cases increase, escalate containment; if decreasing, verify containment criteria.',
    inputs: 'Velocity differentials',
    outputs: 'Containment authorization'
  },
  {
    step: 30,
    title: 'Continuous AI + GIS Feedback Loop',
    role: 'AI & GIS Engine',
    category: 'AI',
    description: 'AI re-analyzes fresh reports, downgrades risk score (86 -> 42 -> 18), updates GIS zones from Red to Green.',
    inputs: 'Updated surveillance stream',
    outputs: 'Real-time updated risk map'
  },
  {
    step: 31,
    title: 'Full Role Responsibilities Matrix',
    role: 'All Personas',
    category: 'MONITORING',
    description: 'Multi-role synergy: Farmer (signal), AI (risk), GIS (location), Vet (decision), Field (ground), Lab (testing).',
    inputs: 'System governance',
    outputs: 'Coordinated disease management'
  },
  {
    step: 32,
    title: 'Unified Master Surveillance Loop',
    role: 'Complete Platform',
    category: 'MONITORING',
    description: 'One integrated, unbroken platform connecting livestock owners to state veterinary authorities.',
    inputs: 'End-to-end telemetry',
    outputs: 'National animal biosecurity'
  }
];

export const MasterFlowView: React.FC = () => {
  const { state, setActiveStep } = useSurveillanceStore();
  const [selectedStep, setSelectedStep] = useState<StepNode>(MASTER_STEPS[state.activeStep - 1] || MASTER_STEPS[0]);

  const categoryColors = {
    FARMER: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    AI: 'border-purple-200 bg-purple-50 text-purple-800',
    GIS: 'border-blue-200 bg-blue-50 text-blue-800',
    VET: 'border-indigo-200 bg-indigo-50 text-indigo-800',
    FIELD: 'border-amber-200 bg-amber-50 text-amber-800',
    LAB: 'border-rose-200 bg-rose-50 text-rose-800',
    MONITORING: 'border-teal-200 bg-teal-50 text-teal-800'
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'FARMER': return '👨‍🌾';
      case 'AI': return <Bot className="w-4 h-4 text-purple-600" />;
      case 'GIS': return <Map className="w-4 h-4 text-blue-600" />;
      case 'VET': return <Stethoscope className="w-4 h-4 text-indigo-600" />;
      case 'FIELD': return <ClipboardCheck className="w-4 h-4 text-amber-600" />;
      case 'LAB': return <FlaskConical className="w-4 h-4 text-rose-600" />;
      default: return <RefreshCw className="w-4 h-4 text-teal-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border border-blue-200">
                Master Architecture View
              </span>
              <span className="text-slate-500 text-xs">All 32 Steps in One Living Flowchart</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              End-to-End Surveillance & Response Pipeline
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              This interactive inspector tracks how an individual disease signal travels from the farmer's mobile report through AI validation, spatio-temporal clustering, GIS risk zones, veterinary review, field investigation, lab testing, ring vaccination intervention, and continuous monitoring loops.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-xl">
            <div className="text-right">
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Active State Step</div>
              <div className="text-lg font-bold text-blue-700 flex items-center gap-2 justify-end">
                <span className="inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
                Step {state.activeStep} of 32
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Steps + Detail Inspector Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Step Grid */}
        <div className="lg:col-span-2 space-y-3 max-h-[750px] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MASTER_STEPS.map((stepNode) => {
              const isCurrent = state.activeStep === stepNode.step;
              const isSelected = selectedStep.step === stepNode.step;
              const isPast = stepNode.step < state.activeStep;

              return (
                <div
                  key={stepNode.step}
                  onClick={() => {
                    setSelectedStep(stepNode);
                    setActiveStep(stepNode.step);
                  }}
                  className={`cursor-pointer rounded-xl border p-3.5 transition-all relative overflow-hidden ${
                    isSelected 
                      ? 'border-blue-600 bg-blue-50/50 shadow-sm ring-1 ring-blue-600' 
                      : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50/50'
                  }`}
                >
                  {isCurrent && (
                    <div className="absolute top-0 right-0 bg-blue-600 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-bl">
                      Active Now
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border ${
                        isCurrent 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : isPast 
                            ? 'bg-blue-50 text-blue-700 border-blue-200' 
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {stepNode.step}
                      </span>
                      <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                        {getCategoryIcon(stepNode.category)} {stepNode.role}
                      </span>
                    </div>

                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${categoryColors[stepNode.category]}`}>
                      {stepNode.category}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mb-1 line-clamp-1">
                    {stepNode.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2">
                    {stepNode.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Deep Step Details Card */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sticky top-24 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded border ${categoryColors[selectedStep.category]}`}>
                Step {selectedStep.step} Detail
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                {getCategoryIcon(selectedStep.category)} Role: {selectedStep.role}
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-3">
              {selectedStep.title}
            </h3>

            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              {selectedStep.description}
            </p>

            <div className="space-y-4 border-t border-slate-200 pt-4 text-xs">
              <div>
                <span className="font-semibold text-slate-500 uppercase tracking-wider text-[11px] block mb-1">
                  Inputs & Signals:
                </span>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-800">
                  {selectedStep.inputs}
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-500 uppercase tracking-wider text-[11px] block mb-1">
                  Outputs & Generated Artifacts:
                </span>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-blue-700 font-semibold">
                  {selectedStep.outputs}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setActiveStep(selectedStep.step)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-sm text-xs flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> Set as Current Active Step
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
