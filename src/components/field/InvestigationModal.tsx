import React, { useState } from 'react';
import { useSurveillanceStore } from '../../store/surveillanceStore';
import { ResponseMission } from '../../types/surveillance';
import { CANONICAL_SYMPTOMS } from '../../data/mockData';
import { I18nService } from '../../services/i18nService';
import { 
  X, 
  MapPin, 
  CheckCircle2, 
  FlaskConical, 
  ClipboardCheck, 
  Camera, 
  ShieldAlert,
  UploadCloud,
  Check
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  mission: ResponseMission;
}

export const InvestigationModal: React.FC<Props> = ({ isOpen, onClose, mission }) => {
  const { state, submitFieldInvestigation, showToast } = useSurveillanceStore();
  const lang = state.language;
  const t = (k: any) => I18nService.get(lang, k);

  const [examinedCount, setExaminedCount] = useState<number>(18);
  const [sickCount, setSickCount] = useState<number>(6);
  const [deadCount, setDeadCount] = useState<number>(1);
  const [observedSymptoms, setObservedSymptoms] = useState<string[]>([
    'High Fever',
    'Blisters / Vesicles on Tongue & Muzzle',
    'Excessive Drooling / Salivation',
    'Severe Lameness / Inability to Stand'
  ]);
  const [vaccinationAudited, setVaccinationAudited] = useState<boolean>(true);
  const [treatmentHistory, setTreatmentHistory] = useState<string>(
    'Farmer applied potassium permanganate wash on oral sores 2 days ago; no formal antibiotic or antiviral therapy administered.'
  );
  const [fieldNotes, setFieldNotes] = useState<string>(
    'Observed ruptured vesicles on dental pad and tongue. 6 animals salivating heavily and reluctant to stand. Herd density high; recommended immediate temporary isolation stall.'
  );
  
  // Real Photo Upload State
  const [photoUrl, setPhotoUrl] = useState<string>(
    'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&q=80&w=600'
  );
  const [photoFileName, setPhotoFileName] = useState<string>('field_lesion_audit.jpg');

  // Biological Sample Collection
  const [sampleRequired, setSampleRequired] = useState<boolean>(true);
  const [sampleType, setSampleType] = useState<
    'Oral Vesicle Swab' | 'Whole Blood' | 'Serum' | 'Nasal Swab' | 'Tissue Biopsy'
  >('Oral Vesicle Swab');
  const [targetLab, setTargetLab] = useState('Regional Disease Diagnostic Laboratory (RDDL)');

  if (!isOpen) return null;

  const toggleSymptom = (sym: string) => {
    setObservedSymptoms(prev => 
      prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym]
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitFieldInvestigation({
      missionId: mission.id,
      examinedCount,
      sickCount,
      deadCount,
      observedSymptoms,
      vaccinationAudited,
      treatmentHistory,
      fieldNotes,
      sampleRequired,
      sampleType: sampleRequired ? sampleType : undefined,
      targetLabName: targetLab
    });
    showToast('success', `Field Investigation Report (${mission.id}) submitted and sample dispatched to RDDL.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
              🔍
            </div>
            <div>
              <h3 className="text-base font-bold text-white">On-Site Field Investigation</h3>
              <p className="text-xs text-slate-400">Mission {mission.id} • Village: {mission.targetVillage}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Tally Numbers */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <label className="gov-label">Examined</label>
              <input
                type="number"
                min={1}
                value={examinedCount}
                onChange={(e) => setExaminedCount(parseInt(e.target.value) || 0)}
                className="gov-input text-center font-bold text-base"
              />
            </div>

            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <label className="gov-label text-amber-400">Confirmed Sick</label>
              <input
                type="number"
                min={0}
                value={sickCount}
                onChange={(e) => setSickCount(parseInt(e.target.value) || 0)}
                className="gov-input text-center font-bold text-base text-amber-400"
              />
            </div>

            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <label className="gov-label text-rose-400">Mortality</label>
              <input
                type="number"
                min={0}
                value={deadCount}
                onChange={(e) => setDeadCount(parseInt(e.target.value) || 0)}
                className="gov-input text-center font-bold text-base text-rose-400"
              />
            </div>
          </div>

          {/* Clinician Verified Symptoms */}
          <div>
            <label className="gov-label">Verified Clinical Lesions & Symptoms</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CANONICAL_SYMPTOMS.map((sym) => {
                const isSelected = observedSymptoms.includes(sym);
                return (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => toggleSymptom(sym)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-amber-600/20 border-amber-400 text-amber-300 font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span>{sym}</span>
                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-amber-500 border-amber-400 text-slate-950' : 'border-slate-700'
                    }`}>
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Biological Sample Collection Card */}
          <div className="gov-card space-y-3 border-purple-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-white">Biological Specimen Collection (RDDL)</span>
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sampleRequired}
                  onChange={(e) => setSampleRequired(e.target.checked)}
                  className="rounded border-slate-700 text-purple-600 focus:ring-purple-500"
                />
                <span>Sample Harvested</span>
              </label>
            </div>

            {sampleRequired && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <div>
                  <label className="gov-label">Specimen Matrix</label>
                  <select
                    value={sampleType}
                    onChange={(e: any) => setSampleType(e.target.value)}
                    className="gov-select"
                  >
                    <option value="Oral Vesicle Swab">Oral Vesicle Swab (Vesicular Fluid)</option>
                    <option value="Whole Blood">Whole Blood (EDTA Tube)</option>
                    <option value="Serum">Serum (Red Top Tube)</option>
                    <option value="Nasal Swab">Nasal Swab</option>
                    <option value="Tissue Biopsy">Epithelial Tissue Biopsy</option>
                  </select>
                </div>

                <div>
                  <label className="gov-label">Cold-Chain Receiving Laboratory</label>
                  <input
                    type="text"
                    value={targetLab}
                    readOnly
                    className="gov-input bg-slate-900 text-slate-300 cursor-not-allowed text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Field Notes & Verification */}
          <div>
            <label className="gov-label">Field Examination Observations & Clinical Notes</label>
            <textarea
              rows={3}
              value={fieldNotes}
              onChange={(e) => setFieldNotes(e.target.value)}
              className="gov-textarea"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="gov-btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="gov-btn-primary text-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Submit Ground Report & Sample
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
