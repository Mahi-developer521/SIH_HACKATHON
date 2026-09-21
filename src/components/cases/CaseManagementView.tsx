import React, { useState, useMemo } from 'react';
import { useSurveillanceStore } from '../../store/surveillanceStore';
import { CaseReport, RiskLevel, CaseStatus } from '../../types/surveillance';
import { I18nService } from '../../services/i18nService';
import { CaseDetailModal } from '../common/CaseDetailModal';
import { CreateMissionModal } from '../vet/CreateMissionModal';
import { InterventionModal } from '../vet/InterventionModal';
import { 
  Button, 
  RiskBadge, 
  StatusBadge, 
  Card, 
  CardHeader, 
  CardBody, 
  EmptyState, 
  Input, 
  Select 
} from '../ui';
import { 
  Search, 
  Filter, 
  Eye, 
  Syringe, 
  MapPin, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Send,
  Calendar,
  Layers,
  ArrowUpDown,
  RefreshCw
} from 'lucide-react';

export const CaseManagementView: React.FC = () => {
  const { state } = useSurveillanceStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedVillage, setSelectedVillage] = useState<string>('ALL');
  const [selectedSpecies, setSelectedSpecies] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'id' | 'reportedAt' | 'riskScore'>('reportedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modal states
  const [viewingCase, setViewingCase] = useState<CaseReport | null>(null);
  const [missionModalCase, setMissionModalCase] = useState<{
    id: string;
    village: string;
    clusterId?: string;
    coords: { lat: number; lng: number };
  } | null>(null);
  const [isInterventionOpen, setIsInterventionOpen] = useState(false);

  const lang = state.language;
  const t = (k: any) => I18nService.get(lang, k);

  const uniqueVillages = useMemo(() => {
    return Array.from(new Set(state.cases.map(c => c.village))).filter(Boolean);
  }, [state.cases]);

  const uniqueSpecies = useMemo(() => {
    return Array.from(new Set(state.cases.map(c => c.animalType))).filter(Boolean);
  }, [state.cases]);

  const filteredCases = useMemo(() => {
    return state.cases.filter((c) => {
      // Search
      const matchesSearch = 
        c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.symptoms.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
        c.aiReasons.some(r => r.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      // Risk Filter
      if (selectedRisk !== 'ALL' && c.riskLevel !== selectedRisk) return false;

      // Status Filter
      if (selectedStatus !== 'ALL' && c.status !== selectedStatus) return false;

      // Village Filter
      if (selectedVillage !== 'ALL' && c.village !== selectedVillage) return false;

      // Species Filter
      if (selectedSpecies !== 'ALL' && c.animalType !== selectedSpecies) return false;

      return true;
    }).sort((a, b) => {
      if (sortField === 'riskScore') {
        return sortOrder === 'asc' ? a.riskScore - b.riskScore : b.riskScore - a.riskScore;
      }
      if (sortField === 'id') {
        return sortOrder === 'asc' ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id);
      }
      // default: submittedAt
      const dateA = new Date(a.submittedAt).getTime();
      const dateB = new Date(b.submittedAt).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }, [state.cases, searchTerm, selectedRisk, selectedStatus, selectedVillage, selectedSpecies, sortField, sortOrder]);

  const toggleSort = (field: 'id' | 'reportedAt' | 'riskScore') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {t('caseManagement') || 'Epidemiological Case Directory'}
            </h1>
            <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
              {state.cases.length} Total Registered
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            District-wide real-time disease case registry, clinical triage, and field response tracking.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Syringe className="w-4 h-4" />}
            onClick={() => setIsInterventionOpen(true)}
          >
            Emergency Intervention
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card>
        <CardBody className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search Input */}
            <div className="lg:col-span-2">
              <Input
                placeholder="Search by Case ID, Village, Symptoms, Disease..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>

            {/* Risk Filter */}
            <div>
              <Select
                value={selectedRisk}
                onChange={(e) => setSelectedRisk(e.target.value)}
              >
                <option value="ALL">All Risk Levels</option>
                <option value="HIGH">🔴 High Risk</option>
                <option value="MEDIUM">🟡 Moderate Risk</option>
                <option value="LOW">🟢 Low Risk</option>
              </Select>
            </div>

            {/* Status Filter */}
            <div>
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="ALL">All Case Statuses</option>
                <option value="REPORTED">Reported</option>
                <option value="TRIAGED">Triaged</option>
                <option value="INVESTIGATING">Investigating</option>
                <option value="SAMPLE_COLLECTED">Sample Collected</option>
                <option value="LAB_CONFIRMED">Lab Confirmed</option>
                <option value="INTERVENED">Intervened</option>
                <option value="RESOLVED">Resolved</option>
              </Select>
            </div>

            {/* Village Filter */}
            <div>
              <Select
                value={selectedVillage}
                onChange={(e) => setSelectedVillage(e.target.value)}
              >
                <option value="ALL">All Villages</option>
                {uniqueVillages.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <span>
              Showing <b>{filteredCases.length}</b> of {state.cases.length} cases
            </span>
            {(searchTerm || selectedRisk !== 'ALL' || selectedStatus !== 'ALL' || selectedVillage !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedRisk('ALL');
                  setSelectedStatus('ALL');
                  setSelectedVillage('ALL');
                  setSelectedSpecies('ALL');
                }}
                className="text-emerald-400 hover:underline flex items-center gap-1 font-medium"
              >
                <RefreshCw className="w-3 h-3" /> Reset Filters
              </button>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Case Directory Table */}
      <Card>
        <div className="overflow-x-auto">
          {filteredCases.length === 0 ? (
            <EmptyState
              title="No cases match your filters"
              description="Try adjusting your search query, risk tier, or village filter to view matching records."
              actionText="Reset Filters"
              onAction={() => {
                setSearchTerm('');
                setSelectedRisk('ALL');
                setSelectedStatus('ALL');
                setSelectedVillage('ALL');
              }}
            />
          ) : (
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200 text-[11px]">
                <tr>
                  <th 
                    className="py-3 px-4 cursor-pointer hover:text-slate-900"
                    onClick={() => toggleSort('id')}
                  >
                    <div className="flex items-center gap-1">
                      Case ID <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Location / Village</th>
                  <th className="py-3 px-4">Species & Morbidity</th>
                  <th 
                    className="py-3 px-4 cursor-pointer hover:text-slate-900"
                    onClick={() => toggleSort('riskScore')}
                  >
                    <div className="flex items-center gap-1">
                      AI Risk <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th 
                    className="py-3 px-4 cursor-pointer hover:text-slate-900"
                    onClick={() => toggleSort('reportedAt')}
                  >
                    <div className="flex items-center gap-1">
                      Reported At <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCases.map((c) => {
                  const isHigh = c.riskLevel === 'HIGH';
                  return (
                    <tr 
                      key={c.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isHigh ? 'bg-rose-50/40' : ''
                      }`}
                    >
                      {/* Case ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 flex items-center gap-2">
                        {isHigh && <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />}
                        <span>{c.id}</span>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{c.village}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 block pl-5 font-mono">
                          {c.coordinates.lat.toFixed(3)}, {c.coordinates.lng.toFixed(3)}
                        </span>
                      </td>

                      {/* Species & Morbidity */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 capitalize">
                          {c.animalType} ({c.totalAnimals} herd)
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="text-amber-700 font-semibold">{c.sickCount} sick</span>
                          <span>•</span>
                          <span className={c.deadCount > 0 ? 'text-rose-700 font-bold' : 'text-slate-500'}>
                            {c.deadCount} dead
                          </span>
                        </div>
                      </td>

                      {/* AI Risk */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <RiskBadge risk={c.riskLevel} size="sm" />
                          <div className="text-[10px] font-mono text-slate-500">
                            Score: <b className="text-slate-900">{c.riskScore}</b>/100
                          </div>
                        </div>
                      </td>

                      {/* Reported At */}
                      <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{new Date(c.submittedAt).toLocaleDateString()}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 block">
                          {new Date(c.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <StatusBadge status={c.status} size="sm" />
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="secondary"
                            size="sm"
                            leftIcon={<Eye className="w-3.5 h-3.5" />}
                            onClick={() => setViewingCase(c)}
                          >
                            Dossier
                          </Button>

                          {c.status !== 'CONTAINED' && (
                            <Button
                              variant="outline"
                              size="sm"
                              leftIcon={<Send className="w-3.5 h-3.5" />}
                              onClick={() => setMissionModalCase({
                                id: c.id,
                                village: c.village,
                                clusterId: c.clusterId,
                                coords: c.coordinates
                              })}
                            >
                              Dispatch
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* Modals */}
      {viewingCase && (
        <CaseDetailModal
          isOpen={true}
          caseItem={viewingCase}
          onClose={() => setViewingCase(null)}
        />
      )}

      {missionModalCase && (
        <CreateMissionModal
          isOpen={true}
          caseId={missionModalCase.id}
          village={missionModalCase.village}
          clusterId={missionModalCase.clusterId}
          coords={missionModalCase.coords}
          onClose={() => setMissionModalCase(null)}
        />
      )}

      {isInterventionOpen && (
        <InterventionModal
          isOpen={true}
          defaultVillage="Village B (Kalyanpur)"
          onClose={() => setIsInterventionOpen(false)}
        />
      )}
    </div>
  );
};
