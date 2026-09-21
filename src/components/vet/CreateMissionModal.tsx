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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-xl overflow-hidden my-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold">
              📋
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Create Response Mission</h3>
              <p className="text-xs text-slate-500">Dispatch Field Para-Vet for Ground Investigation</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs flex justify-between items-center">
            <div>
              <span className="text-slate-500 block text-[11px] uppercase font-bold">Target Case & Village:</span>
              <span className="text-slate-900 font-bold">{caseId} • {village}</span>
            </div>
            {clusterId && (
              <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
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
                  LOW: 'text-emerald-800 border-emerald-300 bg-emerald-50',
                  MEDIUM: 'text-amber-800 border-amber-300 bg-amber-50',
                  HIGH: 'text-rose-700 border-rose-300 bg-rose-50',
                  EMERGENCY: 'text-rose-800 border-rose-400 bg-rose-100 font-black'
                };
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-2 text-[10px] sm:text-xs rounded-xl border font-bold transition-all ${
                      isSelected 
                        ? `${colors[p]} ring-1 ring-blue-600 shadow-sm` 
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
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

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
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
