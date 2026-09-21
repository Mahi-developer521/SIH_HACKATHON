import React, { useState } from 'react';
import { useSurveillanceStore } from '../../store/surveillanceStore';
import { X, ShieldAlert, Syringe, Lock, ShieldCheck, AlertTriangle } from 'lucide-react';

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
  const { state, authorizeIntervention, showToast } = useSurveillanceStore();

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
    showToast('success', `Intervention (${type.replace('_', ' ')}) authorized and deployed.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
              🛡️
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Authorize Disease Intervention</h3>
              <p className="text-xs text-slate-400">Enact Containment, Vaccination & Movement Controls</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="gov-label">
              Intervention Containment Strategy
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('RING_VACCINATION')}
                className={`text-xs p-3 rounded-2xl border text-left font-semibold flex items-center gap-2 transition-all ${
                  type === 'RING_VACCINATION'
                    ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500 ring-1 ring-emerald-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                <Syringe className="w-4 h-4 text-emerald-400 shrink-0" /> Ring Vaccination
              </button>

              <button
                type="button"
                onClick={() => setType('HERD_QUARANTINE')}
                className={`text-xs p-3 rounded-2xl border text-left font-semibold flex items-center gap-2 transition-all ${
                  type === 'HERD_QUARANTINE'
                    ? 'bg-rose-600/20 text-rose-300 border-rose-500 ring-1 ring-rose-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                <Lock className="w-4 h-4 text-rose-400 shrink-0" /> Herd Quarantine
              </button>

              <button
                type="button"
                onClick={() => setType('MOVEMENT_RESTRICTION')}
                className={`text-xs p-3 rounded-2xl border text-left font-semibold flex items-center gap-2 transition-all ${
                  type === 'MOVEMENT_RESTRICTION'
                    ? 'bg-amber-600/20 text-amber-300 border-amber-500 ring-1 ring-amber-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" /> Transit Restriction
              </button>

              <button
                type="button"
                onClick={() => setType('BIOSECURITY_ADVISORY')}
                className={`text-xs p-3 rounded-2xl border text-left font-semibold flex items-center gap-2 transition-all ${
                  type === 'BIOSECURITY_ADVISORY'
                    ? 'bg-blue-600/20 text-blue-300 border-blue-500 ring-1 ring-blue-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" /> Biosecurity Order
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="gov-label">Target Village Perimeter</label>
              <select
                value={targetVillage}
                onChange={(e) => setTargetVillage(e.target.value)}
                className="gov-select"
              >
                <option value="Village B (Kalyanpur)">Village B (Kalyanpur - 44% Vulnerable)</option>
                <option value="Village A (Rampur)">Village A (Rampur - Epicenter)</option>
                <option value="Village C (Shivpuri)">Village C (Shivpuri - Buffer)</option>
              </select>
            </div>

            {type === 'RING_VACCINATION' ? (
              <div>
                <label className="gov-label">Vaccine Doses (Cold Chain)</label>
                <input
                  type="number"
                  value={doses}
                  onChange={(e) => setDoses(parseInt(e.target.value) || 0)}
                  className="gov-input"
                />
              </div>
            ) : (
              <div>
                <label className="gov-label">Quarantined Livestock Count</label>
                <input
                  type="number"
                  value={quarantineCount}
                  onChange={(e) => setQuarantineCount(parseInt(e.target.value) || 0)}
                  className="gov-input"
                />
              </div>
            )}
          </div>

          <div>
            <label className="gov-label">Administrative Directives & Quarantine Mandate</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
              <ShieldCheck className="w-3.5 h-3.5" /> Authorize & Deploy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
