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
  const { submitLabResult, showToast } = useSurveillanceStore();

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
    showToast('success', `Diagnostic Certificate for Sample ${sample.id} certified and transmitted.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 font-bold">
              🧪
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Enter Laboratory Test Result</h3>
              <p className="text-xs text-slate-400">Sample ID: {sample.id} • {sample.sampleType}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="gov-label">Diagnostic Assay</label>
              <select
                value={testType}
                onChange={(e) => setTestType(e.target.value as any)}
                className="gov-select"
              >
                <option value="RT-PCR">Real-Time RT-PCR</option>
                <option value="ELISA">Antibody Sandwich ELISA</option>
                <option value="Rapid Antigen">Lateral Flow Rapid Antigen</option>
                <option value="Virus Isolation">Primary Bovine Thyroid Cell Culture</option>
              </select>
            </div>

            <div>
              <label className="gov-label">Test Outcome</label>
              <div className="grid grid-cols-3 gap-1">
                {(['POSITIVE', 'NEGATIVE', 'INCONCLUSIVE'] as const).map((res) => {
                  const isSelected = result === res;
                  const activeColor = res === 'POSITIVE'
                    ? 'bg-rose-600 text-white border-rose-500'
                    : res === 'NEGATIVE'
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-amber-600 text-white border-amber-500';
                  return (
                    <button
                      type="button"
                      key={res}
                      onClick={() => setResult(res)}
                      className={`text-[10px] py-2.5 rounded-xl font-extrabold border transition-all ${
                        isSelected ? `${activeColor} ring-1 ring-white/40` : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      {res}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <label className="gov-label">Pathogen Confirmed / Identified</label>
            <input
              type="text"
              value={pathogen}
              onChange={(e) => setPathogen(e.target.value)}
              className="gov-input font-semibold text-emerald-300"
            />
          </div>

          {testType === 'RT-PCR' && (
            <div>
              <label className="gov-label">Cycle Threshold (CT Value)</label>
              <input
                type="number"
                step="0.1"
                value={cycleThreshold}
                onChange={(e) => setCycleThreshold(parseFloat(e.target.value) || 0)}
                className="gov-input"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                CT values &lt; 29 indicate strong viral genome copy concentration.
              </span>
            </div>
          )}

          <div>
            <label className="gov-label">Laboratory Diagnostic Remarks & Signature</label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
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
              <ShieldCheck className="w-3.5 h-3.5" /> Certify & Transmit to Officer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
