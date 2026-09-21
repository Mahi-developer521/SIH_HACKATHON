import React, { useState } from 'react';
import { useSurveillanceStore } from '../../store/surveillanceStore';
import { CaseReport } from '../../types/surveillance';
import { CaseDetailModal } from '../common/CaseDetailModal';
import { CreateMissionModal } from '../vet/CreateMissionModal';
import { 
  Button, 
  Badge, 
  RiskBadge, 
  Card, 
  CardHeader, 
  CardBody, 
  EmptyState 
} from '../ui';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Bell, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Send, 
  Eye, 
  Volume2, 
  Check, 
  Radio, 
  Flame 
} from 'lucide-react';
import { VoiceAlertButton } from '../common/VoiceAlertButton';

export const AlertCenterView: React.FC = () => {
  const { state, triageCase } = useSurveillanceStore();
  const [activeTier, setActiveTier] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'WARNING' | 'INFO'>('ALL');
  const [viewingCase, setViewingCase] = useState<CaseReport | null>(null);
  const [missionCase, setMissionCase] = useState<CaseReport | null>(null);
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Set<string>>(new Set());

  // Derive alert items from state cases and proximity alerts
  const allAlerts = React.useMemo(() => {
    const list: Array<{
      id: string;
      tier: 'CRITICAL' | 'HIGH' | 'WARNING' | 'INFO';
      title: string;
      message: string;
      village: string;
      timestamp: string;
      affectedAnimals: string;
      source: string;
      recommendedAction: string;
      caseId?: string;
      coords?: { lat: number; lng: number };
      clusterId?: string;
    }> = [];

    // Outbreak Clusters -> Critical
    state.clusters.forEach(cl => {
      if (cl.status !== 'CONTAINED') {
        list.push({
          id: `ALT-CL-${cl.id}`,
          tier: 'CRITICAL',
          title: `Active Spatio-Temporal Outbreak Cluster: ${cl.id}`,
          message: `${cl.totalCases} active cases across ${cl.villages.join(', ')}. Primary symptoms: ${cl.primarySymptoms.join(', ')}. Immediate perimeter containment enforced.`,
          village: cl.villages.join(', '),
          timestamp: new Date().toISOString(),
          affectedAnimals: 'Cattle, Buffalo, Sheep',
          source: 'Automated AI Spatio-Temporal Engine',
          recommendedAction: 'Deploy rapid response team, enforce ring vaccination within 6.5 km buffer, restrict livestock transport.',
          clusterId: cl.id
        });
      }
    });

    // High Risk Cases -> High
    state.cases.forEach(c => {
      if (c.riskLevel === 'HIGH') {
        list.push({
          id: `ALT-CASE-${c.id}`,
          tier: 'HIGH',
          title: `High Risk Clinical Case: ${c.id} (${c.animalType.toUpperCase()})`,
          message: `${c.sickCount} sick, ${c.deadCount} dead reported in ${c.village}. AI Risk Score: ${c.riskScore}/100. Symptoms: ${c.symptoms.join(', ')}.`,
          village: c.village,
          timestamp: c.submittedAt,
          affectedAnimals: `${c.sickCount} sick / ${c.totalAnimals} herd`,
          source: 'Farmer Ingestion & AI Risk Model',
          recommendedAction: 'Assign field para-vet for physical verification and biological swab collection.',
          caseId: c.id,
          coords: c.coordinates,
          clusterId: c.clusterId
        });
      } else if (c.riskLevel === 'MEDIUM') {
        list.push({
          id: `ALT-CASE-${c.id}`,
          tier: 'WARNING',
          title: `Moderate Risk Alert: ${c.id} (${c.animalType})`,
          message: `Symptom onset reported in ${c.village}. Morbidity rate monitored against 5-year seasonal baseline.`,
          village: c.village,
          timestamp: c.submittedAt,
          affectedAnimals: `${c.sickCount} sick / ${c.totalAnimals} herd`,
          source: 'Algorithmic Surveillance Engine',
          recommendedAction: 'Monitor clinical trajectory; issue biosecurity advisory to adjacent holdings.',
          caseId: c.id,
          coords: c.coordinates
        });
      }
    });

    // Proximity alerts from state
    state.alerts.forEach(a => {
      list.push({
        id: `ALT-PRX-${a.id}`,
        tier: a.alertLevel === 'RED_ALERT' ? 'CRITICAL' : 'WARNING',
        title: `Nearby Outbreak Perimeter: ${a.distanceKm} km`,
        message: a.message,
        village: 'Proximity Perimeter',
        timestamp: a.sentAt,
        affectedAnimals: 'Registered Local Herds',
        source: 'Haversine Geospatial Buffer Engine',
        recommendedAction: 'Isolate sick livestock, disinfect water troughs, dial 1962.'
      });
    });

    return list;
  }, [state.clusters, state.cases, state.alerts]);

  const filteredAlerts = allAlerts.filter(a => {
    if (activeTier === 'ALL') return true;
    return a.tier === activeTier;
  });

  const handleAcknowledge = (id: string) => {
    setAcknowledgedAlerts(prev => new Set(prev).add(id));
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'CRITICAL':
        return <Badge variant="danger" size="sm" icon={<Flame className="w-3 h-3 text-rose-600" />}>Critical Outbreak</Badge>;
      case 'HIGH':
        return <Badge variant="danger" size="sm" icon={<ShieldAlert className="w-3 h-3 text-rose-600" />}>High Priority</Badge>;
      case 'WARNING':
        return <Badge variant="warning" size="sm" icon={<AlertTriangle className="w-3 h-3 text-amber-600" />}>Warning / Advisory</Badge>;
      default:
        return <Badge variant="info" size="sm" icon={<Bell className="w-3 h-3 text-blue-600" />}>Surveillance Notice</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Center Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <Bell className="w-6 h-6 text-blue-600" /> Alert Command Center
            </h1>
            <span className="bg-rose-50 text-rose-700 border border-rose-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
              {allAlerts.filter(a => a.tier === 'CRITICAL' || a.tier === 'HIGH').length} Urgent
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Real-time geospatial early warning signals, epidemic cluster triggers, and priority response directives.
          </p>
        </div>

        {/* Spoken Alert Audio */}
        <div className="flex items-center gap-2">
          <VoiceAlertButton
            textTe="హెచ్చరిక: జిల్లాలో అంటువ్యాధి వ్యాప్తి చెందుతోంది. తక్షణ జాగ్రత్తలు పాటించండి."
            textEn="Alert: Disease outbreak detected in the district. Observe immediate biosecurity precautions."
            size="xs"
          />
        </div>
      </div>

      {/* Tier Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTier('ALL')}
          className={`px-3 py-1.5 rounded-xl transition-all ${
            activeTier === 'ALL'
              ? 'bg-blue-600 text-white font-bold shadow-sm'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          All Alerts ({allAlerts.length})
        </button>
        <button
          onClick={() => setActiveTier('CRITICAL')}
          className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTier === 'CRITICAL'
              ? 'bg-blue-600 text-white font-bold shadow-sm'
              : 'bg-white text-blue-700 hover:bg-blue-50 border border-blue-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-blue-600" />
          Critical ({allAlerts.filter(a => a.tier === 'CRITICAL').length})
        </button>
        <button
          onClick={() => setActiveTier('HIGH')}
          className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTier === 'HIGH'
              ? 'bg-blue-600 text-white font-bold shadow-sm'
              : 'bg-white text-blue-700 hover:bg-blue-50 border border-blue-200'
          }`}
        >
          High ({allAlerts.filter(a => a.tier === 'HIGH').length})
        </button>
        <button
          onClick={() => setActiveTier('WARNING')}
          className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTier === 'WARNING'
              ? 'bg-amber-600 text-white font-bold shadow-sm'
              : 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200'
          }`}
        >
          Warning ({allAlerts.filter(a => a.tier === 'WARNING').length})
        </button>
      </div>

      {/* Alert Feed */}
      <div className="space-y-3.5">
        {filteredAlerts.length === 0 ? (
          <EmptyState
            title="No alerts in this category"
            description="There are currently no active alerts matching the selected priority filter."
            actionText="View All Alerts"
            onAction={() => setActiveTier('ALL')}
          />
        ) : (
          filteredAlerts.map((alert) => {
            const isAck = acknowledgedAlerts.has(alert.id);
            const isCritical = alert.tier === 'CRITICAL';
            const relatedCase = alert.caseId ? state.cases.find(c => c.id === alert.caseId) : null;

            return (
              <div
                key={alert.id}
                className={`bg-white rounded-2xl border p-5 shadow-sm transition-all ${
                  isCritical
                    ? 'border-rose-300 bg-rose-50/20'
                    : 'border-slate-200'
                } ${isAck ? 'opacity-65' : ''}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {getTierBadge(alert.tier)}
                      <span className="font-mono text-xs font-bold text-slate-800">{alert.id}</span>
                      <span className="text-[11px] text-slate-400">•</span>
                      <span className="text-[11px] text-slate-600 flex items-center gap-1 font-medium">
                        <MapPin className="w-3 h-3 text-emerald-600" /> {alert.village}
                      </span>
                      <span className="text-[11px] text-slate-400">•</span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" /> {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                      {alert.title}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {alert.message}
                    </p>

                    <div className="pt-2 flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
                      <span><b className="text-slate-700">Target:</b> {alert.affectedAnimals}</span>
                      <span>•</span>
                      <span><b className="text-slate-700">Trigger:</b> {alert.source}</span>
                    </div>

                    {/* Action directive box */}
                    <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                      <b className="text-blue-700">Recommended Action:</b> {alert.recommendedAction}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 pt-2 sm:pt-0">
                    {relatedCase && (
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                        onClick={() => setViewingCase(relatedCase)}
                      >
                        View Case
                      </Button>
                    )}

                    {relatedCase && relatedCase.status !== 'CONTAINED' && (
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<Send className="w-3.5 h-3.5" />}
                        onClick={() => setMissionCase(relatedCase)}
                      >
                        Dispatch Mission
                      </Button>
                    )}

                    <Button
                      variant={isAck ? 'ghost' : 'outline'}
                      size="sm"
                      leftIcon={<Check className="w-3.5 h-3.5" />}
                      onClick={() => handleAcknowledge(alert.id)}
                    >
                      {isAck ? 'Acknowledged' : 'Acknowledge'}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modals */}
      {viewingCase && (
        <CaseDetailModal
          isOpen={true}
          caseItem={viewingCase}
          onClose={() => setViewingCase(null)}
        />
      )}

      {missionCase && (
        <CreateMissionModal
          isOpen={true}
          caseId={missionCase.id}
          village={missionCase.village}
          clusterId={missionCase.clusterId}
          coords={missionCase.coordinates}
          onClose={() => setMissionCase(null)}
        />
      )}
    </div>
  );
};
