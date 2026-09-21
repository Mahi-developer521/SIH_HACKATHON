import React from 'react';
import { useSurveillanceStore } from '../../store/surveillanceStore';
import { 
  X, 
  Bell, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  FlaskConical, 
  Syringe, 
  Trash2 
} from 'lucide-react';
import { Badge } from '../ui';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToCase?: (caseId: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateToCase
}) => {
  const { state } = useSurveillanceStore();

  if (!isOpen) return null;

  // Build notifications feed from alerts & high risk cases
  const notifications = [
    ...state.clusters.filter(c => c.status !== 'CONTAINED').map(cl => ({
      id: `NOTIF-CL-${cl.id}`,
      title: `Epidemic Cluster Alert: ${cl.id}`,
      description: `${cl.totalCases} cases detected across ${cl.villages.join(', ')}.`,
      time: 'Just now',
      tier: 'CRITICAL',
      type: 'cluster'
    })),
    ...state.cases.filter(c => c.riskLevel === 'HIGH').slice(0, 4).map(c => ({
      id: `NOTIF-CASE-${c.id}`,
      title: `High Risk Clinical Case: ${c.id}`,
      description: `${c.sickCount} sick ${c.animalType} in ${c.village}. AI Score: ${c.riskScore}/100.`,
      time: '15m ago',
      tier: 'HIGH',
      type: 'case',
      caseId: c.id
    })),
    ...state.cases.filter(c => c.labResult).slice(0, 3).map(c => ({
      id: `NOTIF-LAB-${c.id}`,
      title: `Lab Result Certified: Case ${c.id}`,
      description: `Molecular assay certified: ${c.labResult?.testType} (${c.labResult?.result}).`,
      time: '1h ago',
      tier: 'INFO',
      type: 'lab',
      caseId: c.id
    }))
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-950 border-l border-slate-800 p-6 flex flex-col shadow-2xl">
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Surveillance Activity</h3>
                <p className="text-[11px] text-slate-400">Live operational events & alerts</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg border border-slate-800 hover:border-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="flex-1 py-4 space-y-3 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No active notifications.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 rounded-xl border text-xs space-y-1 transition-all ${
                    n.tier === 'CRITICAL'
                      ? 'bg-rose-950/20 border-rose-600/40 text-rose-200'
                      : n.tier === 'HIGH'
                      ? 'bg-amber-950/20 border-amber-600/40 text-amber-200'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{n.title}</span>
                    <span className="text-[10px] text-slate-400">{n.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    {n.description}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer */}
          <div className="pt-4 border-t border-slate-800 text-center text-[11px] text-slate-500">
            System synchronized with central district registry.
          </div>
        </div>
      </div>
    </div>
  );
};
