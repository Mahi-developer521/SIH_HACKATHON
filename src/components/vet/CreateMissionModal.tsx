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
  const { createMission } = useSurveillanceStore();

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
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-blue-500/10 text-blue-400 text-lg">
              📋
            </span>
            <div>
              <h3 className="text-base font-bold text-white">Create Response Mission (Step 17)</h3>
              <p className="text-xs text-slate-400">Dispatch Field Worker for Ground Investigation</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs flex justify-between items-center">
            <div>
              <span className="text-slate-400 block text-[11px]">Target Case & Location:</span>
              <span className="text-white font-bold">{caseId} • {village}</span>
            </div>
            {clusterId && (
              <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold px-2 py-0.5 rounded">
                Cluster {clusterId}
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Select Field Worker (Personnel)
            </label>
            <select
              value={workerId}
              onChange={(e) => {
                const id = e.target.value;
                setWorkerId(id);
                setWorkerName(id === 'FW-04' ? 'Pooja Patil (Field Inspector)' : 'Rajesh Kumar (Senior Para-Vet)');
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="FW-04">FW-04: Pooja Patil (Field Inspector, Kalyanpur Block)</option>
              <option value="FW-02">FW-02: Rajesh Kumar (Senior Para-Vet, Rampur Block)</option>
              <option value="FW-07">FW-07: Anita Deshmukh (Rapid Response Officer)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Mission Priority</label>
            <div className="grid grid-cols-4 gap-2">
              {(['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY'] as const).map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`text-xs py-1.5 rounded-lg border font-semibold transition-all ${
                    priority === p
                      ? p === 'EMERGENCY' || p === 'HIGH'
                        ? 'bg-rose-600 text-white border-rose-500'
                        : 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Field Investigation Instructions & Sampling Protocol
            </label>
            <textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> Authorize & Dispatch Response Mission
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
