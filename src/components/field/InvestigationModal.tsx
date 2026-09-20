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
  UploadCloud
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  mission: ResponseMission;
}

export const InvestigationModal: React.FC<Props> = ({ isOpen, onClose, mission }) => {
  const { state, submitFieldInvestigation } = useSurveillanceStore();
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

  // Section 20: Sample Collection
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
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 text-lg">
              🔍
            </span>
            <div>
              <h3 className="text-base font-bold text-white">Field Investigation & Sample Protocol (Steps 19 & 20)</h3>
              <p className="text-xs text-slate-400">Mission: {mission.id} • Target: {mission.targetVillage}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Mission Context */}
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs text-slate-300">
            <span className="font-semibold text-slate-400 block text-[10px] uppercase">Vet Directives:</span>
            {mission.instructions}
          </div>

          {/* Counts */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Animals Examined</label>
              <input
                type="number"
                min="1"
                value={examinedCount}
                onChange={(e) => setExaminedCount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-rose-400 mb-1">Confirmed Sick</label>
              <input
                type="number"
                min="0"
                value={sickCount}
                onChange={(e) => setSickCount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-rose-400 mb-1">Confirmed Dead</label>
              <input
                type="number"
                min="0"
                value={deadCount}
                onChange={(e) => setDeadCount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Symptoms Checklist */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Clinically Verified Lesions & Symptoms
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CANONICAL_SYMPTOMS.map((sym) => {
                const isSelected = observedSymptoms.includes(sym);
                return (
                  <button
                    type="button"
                    key={sym}
                    onClick={() => toggleSymptom(sym)}
                    className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 font-semibold'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}{sym}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Field Photo Evidence Upload */}
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-amber-400" /> On-Site Clinical Lesion Photo
              </span>
              <label className="text-[10px] text-amber-400 hover:underline cursor-pointer flex items-center gap-1">
                <UploadCloud className="w-3 h-3" /> Choose Photo File
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                <img src={photoUrl} alt="Lesion inspection" className="w-full h-full object-cover" />
              </div>
              <div className="truncate">
                <span className="text-xs font-semibold text-white block truncate">{photoFileName}</span>
                <span className="text-[10px] text-slate-400">Captured at {mission.targetVillage}</span>
              </div>
            </div>
          </div>

          {/* Observation & Treatment */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Field Observations & Epidemiological Notes
            </label>
            <textarea
              rows={2}
              value={fieldNotes}
              onChange={(e) => setFieldNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Section 20: Sample Collection Module */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <FlaskConical className="w-4 h-4 text-purple-400" /> Section 20: Biological Sample Collection
              </span>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                <input
                  type="checkbox"
                  checked={sampleRequired}
                  onChange={(e) => setSampleRequired(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-purple-500 focus:ring-0"
                />
                <span>Sample Required by Protocol</span>
              </label>
            </div>

            {sampleRequired && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-900">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Specimen / Sample Type
                  </label>
                  <select
                    value={sampleType}
                    onChange={(e) => setSampleType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Oral Vesicle Swab">Oral Vesicle / Epithelial Swab</option>
                    <option value="Whole Blood">Whole Blood (EDTA Vacutainer)</option>
                    <option value="Serum">Clotted Blood / Serum</option>
                    <option value="Nasal Swab">Nasal Swab (VTM)</option>
                    <option value="Tissue Biopsy">Coronary Band Tissue Biopsy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Designated Diagnostic Laboratory
                  </label>
                  <input
                    type="text"
                    disabled
                    value={targetLab}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400"
                  />
                </div>

                <div className="col-span-full bg-purple-950/20 p-2.5 rounded-xl border border-purple-800/40 text-[11px] text-purple-200 flex items-center justify-between">
                  <span>Auto-Generated Sample Barcode ID: <b>SMP-2046</b></span>
                  <span className="font-mono text-[10px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    Cold Chain: 4°C Maintained
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> Save Investigation & Dispatch Sample to Lab
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
