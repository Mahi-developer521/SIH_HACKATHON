import React, { useState } from 'react';
import { useSurveillanceStore } from '../../store/surveillanceStore';
import { X, Send, MapPin, AlertCircle, ShieldAlert } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
  village: string;
  clusterId?: string;
  coords: { lat: number; lng: number };
}

export const CreateMissionModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  caseId, 
  village, 
  clusterId,
  coords 
}) => {
  const { createMission, showToast } = useSurveillanceStore();

  const [workerId, setWorkerId] = useState('FW-04');
  const [workerName, setWorkerName] = useState('Pooja Patil (Field Inspector)');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY'>('HIGH');
  const [instructions, setInstructions] = useState(
    'Inspect herd for oral mucosal erosion and coronary band vesicles. Verify local vaccination cards, tally mortality and collect biological swab samples for RDDL.'
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMission({
      caseId,
      clusterId,
      workerId,
      workerName,
      priority,
      instructions,
      targetVillage: village,
      coordinates: coords
    });
    showToast('success', `Response Mission dispatched to ${workerName}.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold">
              📋
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Create Response Mission</h3>
              <p className="text-xs text-slate-400">Dispatch Field Para-Vet for Ground Investigation</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-xs flex justify-between items-center">
            <div>
              <span className="text-slate-400 block text-[11px] uppercase font-bold">Target Case & Village:</span>
              <span className="text-white font-bold">{caseId} • {village}</span>
            </div>
            {clusterId && (
              <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-black px-2 py-0.5 rounded-full">
                Cluster {clusterId}
              </span>
            )}
          </div>

          <div>
            <label className="gov-label">
              Assigned Field Inspector
            </label>
            <select
              value={workerId}
              onChange={(e) => {
                const id = e.target.value;
                setWorkerId(id);
                setWorkerName(id === 'FW-04' ? 'Pooja Patil (Field Inspector)' : 'Rajesh Kumar (Senior Para-Vet)');
              }}
              className="gov-select"
            >
              <option value="FW-04">FW-04: Pooja Patil (Field Inspector, Kalyanpur Block)</option>
              <option value="FW-02">FW-02: Rajesh Kumar (Senior Para-Vet, Rampur Block)</option>
              <option value="FW-07">FW-07: Anita Deshmukh (Rapid Response Officer)</option>
            </select>
          </div>

          <div>
            <label className="gov-label">Mission Operational Priority</label>
            <div className="grid grid-cols-4 gap-2">
              {(['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY'] as const).map((p) => {
                const isSelected = priority === p;
                const colors = {
                  LOW: 'text-emerald-300 border-emerald-500/50 bg-emerald-950/40',
                  MEDIUM: 'text-amber-300 border-amber-500/50 bg-amber-950/40',
                  HIGH: 'text-rose-300 border-rose-500/50 bg-rose-950/40',
                  EMERGENCY: 'text-rose-400 border-rose-600 bg-rose-900/60 font-black animate-pulse'
                };
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-2 text-[10px] sm:text-xs rounded-xl border font-bold transition-all ${
                      isSelected 
                        ? `${colors[p]} ring-1 ring-white/50` 
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="gov-label">Clinical Protocols & Sampling Instructions</label>
            <textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
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
              <Send className="w-3.5 h-3.5" /> Dispatch Mission Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
