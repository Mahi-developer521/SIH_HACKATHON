import React, { useState } from 'react';
import { useSurveillanceStore } from '../../store/surveillanceStore';
import { LabSample } from '../../types/surveillance';
import { X, CheckCircle2, FlaskConical, AlertCircle, ShieldCheck } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sample: LabSample;
}

export const EnterResultModal: React.FC<Props> = ({ isOpen, onClose, sample }) => {
  const { submitLabResult } = useSurveillanceStore();

  const [testType, setTestType] = useState<'RT-PCR' | 'ELISA' | 'Rapid Antigen' | 'Virus Isolation'>('RT-PCR');
  const [pathogen, setPathogen] = useState('Foot and Mouth Disease Virus (FMDV Serotype O)');
  const [result, setResult] = useState<'POSITIVE' | 'NEGATIVE' | 'INCONCLUSIVE'>('POSITIVE');
  const [cycleThreshold, setCycleThreshold] = useState<number>(21.4);
  const [remarks, setRemarks] = useState(
    'Strong amplification signal in 3D RNA polymerase target. High viral load detected. Urgent biosecurity quarantine and ring vaccination recommended.'
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitLabResult({
      sampleId: sample.id,
      testType,
      pathogenIdentified: pathogen,
      result,
      cycleThreshold: testType === 'RT-PCR' ? cycleThreshold : undefined,
      remarks,
      testedBy: 'Dr. P. Rao (Senior Microbiologist, RDDL)'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-purple-500/10 text-purple-400 text-lg">
              🧪
            </span>
            <div>
              <h3 className="text-base font-bold text-white">Enter Laboratory Test Result (Step 22 & 23)</h3>
              <p className="text-xs text-slate-400">Sample ID: {sample.id} • {sample.sampleType}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Diagnostic Assay</label>
              <select
                value={testType}
                onChange={(e) => setTestType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="RT-PCR">Real-Time RT-PCR</option>
                <option value="ELISA">Antibody Sandwich ELISA</option>
                <option value="Rapid Antigen">Lateral Flow Rapid Antigen</option>
                <option value="Virus Isolation">Primary Bovine Thyroid Cell Culture</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Test Outcome</label>
              <div className="grid grid-cols-3 gap-1">
                {(['POSITIVE', 'NEGATIVE', 'INCONCLUSIVE'] as const).map((res) => (
                  <button
                    type="button"
                    key={res}
                    onClick={() => setResult(res)}
                    className={`text-[10px] py-2 rounded-lg font-bold border transition-all ${
                      result === res
                        ? res === 'POSITIVE'
                          ? 'bg-rose-600 text-white border-rose-500'
                          : res === 'NEGATIVE'
                            ? 'bg-emerald-600 text-white border-emerald-500'
                            : 'bg-amber-600 text-white border-amber-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    {res}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Pathogen Confirmed / Suspected
            </label>
            <input
              type="text"
              value={pathogen}
              onChange={(e) => setPathogen(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          {testType === 'RT-PCR' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Cycle Threshold (CT Value)
              </label>
              <input
                type="number"
                step="0.1"
                value={cycleThreshold}
                onChange={(e) => setCycleThreshold(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">CT &lt; 29 indicates high pathogen concentration</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Laboratory Technician Remarks & Molecular Findings
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> Certify & Transmit Result to Vet Officer (Step 23)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
