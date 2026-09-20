import React, { useState } from 'react';
import { useSurveillanceStore } from '../../store/surveillanceStore';
import { X, ShieldAlert, Syringe, Lock, ShieldCheck } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  clusterId?: string;
  defaultVillage: string;
}

export const InterventionModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  clusterId, 
  defaultVillage 
}) => {
  const { state, authorizeIntervention } = useSurveillanceStore();

  const [type, setType] = useState<
    'RING_VACCINATION' | 'EMERGENCY_TREATMENT' | 'HERD_QUARANTINE' | 'MOVEMENT_RESTRICTION' | 'BIOSECURITY_ADVISORY'
  >('RING_VACCINATION');
  const [targetVillage, setTargetVillage] = useState(defaultVillage || 'Village B (Kalyanpur)');
  const [doses, setDoses] = useState(250);
  const [quarantineCount, setQuarantineCount] = useState(45);
  const [notes, setNotes] = useState(
    'Enact 5km radius ring vaccination perimeter. Restrict inter-village cattle transit and establish antiseptic footbaths at village entry points.'
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    authorizeIntervention({
      clusterId,
      type,
      targetVillage,
      doses,
      quarantinedCount: quarantineCount,
      notes,
      authorizedBy: 'Dr. A. Sharma (Chief Veterinary Officer)'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-lg">
              🛡️
            </span>
            <div>
              <h3 className="text-base font-bold text-white">Authorize Disease Intervention (Step 25)</h3>
              <p className="text-xs text-slate-400">Enact Containment, Vaccination & Movement Controls</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Select Intervention Strategy
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('RING_VACCINATION')}
                className={`text-xs p-2.5 rounded-xl border text-left font-medium flex items-center gap-2 ${
                  type === 'RING_VACCINATION'
                    ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500 font-bold'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                <Syringe className="w-4 h-4 text-emerald-400 shrink-0" /> Ring Vaccination
              </button>

              <button
                type="button"
                onClick={() => setType('HERD_QUARANTINE')}
                className={`text-xs p-2.5 rounded-xl border text-left font-medium flex items-center gap-2 ${
                  type === 'HERD_QUARANTINE'
                    ? 'bg-rose-600/20 text-rose-300 border-rose-500 font-bold'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                <Lock className="w-4 h-4 text-rose-400 shrink-0" /> Herd Quarantine
              </button>

              <button
                type="button"
                onClick={() => setType('MOVEMENT_RESTRICTION')}
                className={`text-xs p-2.5 rounded-xl border text-left font-medium flex items-center gap-2 ${
                  type === 'MOVEMENT_RESTRICTION'
                    ? 'bg-amber-600/20 text-amber-300 border-amber-500 font-bold'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" /> Movement Controls
              </button>

              <button
                type="button"
                onClick={() => setType('EMERGENCY_TREATMENT')}
                className={`text-xs p-2.5 rounded-xl border text-left font-medium flex items-center gap-2 ${
                  type === 'EMERGENCY_TREATMENT'
                    ? 'bg-blue-600/20 text-blue-300 border-blue-500 font-bold'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" /> Emergency Therapy
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Village</label>
              <select
                value={targetVillage}
                onChange={(e) => setTargetVillage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {state.villages.map(v => (
                  <option key={v.name} value={v.name}>{v.name}</option>
                ))}
              </select>
            </div>

            {type === 'RING_VACCINATION' ? (
              <div>
                <label className="block text-xs font-semibold text-emerald-400 mb-1">Doses to Deploy</label>
                <input
                  type="number"
                  value={doses}
                  onChange={(e) => setDoses(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-rose-400 mb-1">Animals Quarantined</label>
                <input
                  type="number"
                  value={quarantineCount}
                  onChange={(e) => setQuarantineCount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Official Veterinary Order & Biosecurity Directives
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" /> Sign & Authorize Emergency Intervention
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
