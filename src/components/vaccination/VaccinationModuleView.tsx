import React, { useState } from 'react';
import { useSurveillanceStore } from '../../store/surveillanceStore';
import { 
  Button, 
  Badge, 
  Card, 
  CardHeader, 
  CardBody, 
  KPICard, 
  EmptyState 
} from '../ui';
import { 
  Syringe, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  Plus, 
  Search, 
  ArrowUpRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import { VoiceAlertButton } from '../common/VoiceAlertButton';

export const VaccinationModuleView: React.FC = () => {
  const { state } = useSurveillanceStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'VACCINATED' | 'DUE' | 'OVERDUE'>('ALL');

  const herd = state.herd;

  // Village coverage breakdown
  const villageCoverage = [
    { village: 'Village A (Rampur)', total: 420, vaccinated: 345, coverage: 82, status: 'NORMAL' },
    { village: 'Village B (Kalyanpur)', total: 580, vaccinated: 255, coverage: 44, status: 'CRITICAL_DEFICIT' },
    { village: 'Village C (Shivpuri)', total: 310, vaccinated: 214, coverage: 69, status: 'MODERATE_DEFICIT' },
    { village: 'Village D (Fatehpur)', total: 290, vaccinated: 261, coverage: 90, status: 'OPTIMAL' },
  ];

  // Derived herd vaccination records
  const vaccineSchedule = React.useMemo(() => {
    return herd.map((h, idx) => {
      const isDue = h.vaccinationStatus === 'DUE_SOON';
      const isOverdue = h.vaccinationStatus === 'OVERDUE';
      const status = isOverdue ? 'OVERDUE' : isDue ? 'DUE' : 'VACCINATED';
      const vaccineName = h.species === 'Cattle' ? 'FMD-Trivalent Oil Adjuvant' : h.species === 'Sheep' ? 'PPR Live Attenuated' : 'Brucellosis S19';
      const dueDate = isOverdue ? '2026-02-15' : isDue ? '2026-04-10' : '2026-09-30';

      return {
        tagId: h.tagNumber,
        species: h.species,
        age: `${h.ageYears} years`,
        vaccine: h.lastVaccineName || vaccineName,
        lastDate: h.lastVaccinationDate,
        dueDate,
        status
      };
    });
  }, [herd]);

  const filteredRecords = vaccineSchedule.filter(v => {
    const matchesSearch = v.tagId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.vaccine.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (filterStatus !== 'ALL' && v.status !== filterStatus) return false;
    return true;
  });

  const totalVaccinated = vaccineSchedule.filter(v => v.status === 'VACCINATED').length;
  const dueSoon = vaccineSchedule.filter(v => v.status === 'DUE').length;
  const overdue = vaccineSchedule.filter(v => v.status === 'OVERDUE').length;
  const overallCoverage = Math.round((totalVaccinated / (vaccineSchedule.length || 1)) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Syringe className="w-6 h-6 text-emerald-400" /> District Vaccination Surveillance
            </h1>
            <span className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs px-2.5 py-0.5 rounded-full font-bold">
              NADCP Phase-III Protocol
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            District prophylaxis coverage, cold-chain deployment tracking, and ring-vaccination perimeter enforcement.
          </p>
        </div>

        {/* Telugu Voice Advisory */}
        <div className="flex items-center gap-2">
          <VoiceAlertButton
            textTe="గమనిక: కళ్యాణపూర్ గ్రామంలో టీకాల కవరేజ్ తక్కువగా ఉంది. సమీప పశువైద్య కేంద్రాన్ని సంప్రదించి బూస్టర్ డోస్ ఇప్పించండి."
            textEn="Notice: Vaccination coverage is deficient in Kalyanpur village. Contact the nearest veterinary centre for booster doses."
            size="xs"
          />
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <KPICard
          title="Overall Coverage"
          value={`${overallCoverage}%`}
          subtext="Target: 85% Herd Immunity"
          icon={<ShieldCheck className="w-5 h-5" />}
          accentColor="emerald"
        />

        <KPICard
          title="Total Vaccinated"
          value={totalVaccinated}
          subtext="Certified within 6 months"
          icon={<CheckCircle2 className="w-5 h-5" />}
          accentColor="blue"
        />

        <KPICard
          title="Due for Booster"
          value={dueSoon}
          subtext="Scheduled within 30 days"
          icon={<Clock className="w-5 h-5" />}
          accentColor="amber"
        />

        <KPICard
          title="Critical Overdue"
          value={overdue}
          subtext="Requires immediate field visit"
          icon={<AlertTriangle className="w-5 h-5" />}
          accentColor="rose"
        />
      </div>

      {/* Village Vaccination Gap Analytics */}
      <Card>
        <CardHeader
          title="District Village Prophylaxis Coverage"
          subtitle="Real-time epidemiological gap analysis identifying high-vulnerability transmission pockets"
          icon={<Activity className="w-5 h-5 text-emerald-400" />}
        />
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {villageCoverage.map((vc) => {
              const isDeficit = vc.coverage < 60;
              return (
                <div
                  key={vc.village}
                  className={`p-4 rounded-xl border space-y-2 ${
                    isDeficit
                      ? 'bg-rose-950/20 border-rose-600/50 shadow-md shadow-rose-950/20'
                      : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white truncate">{vc.village}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        isDeficit
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {vc.coverage}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isDeficit ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${vc.coverage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>{vc.vaccinated} / {vc.total} vaccinated</span>
                    {isDeficit && (
                      <span className="text-rose-400 font-bold flex items-center gap-0.5">
                        <AlertTriangle className="w-3 h-3" /> Deficit
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Livestock Vaccine Schedule Table */}
      <Card>
        <CardHeader
          title="Registered Herd Vaccination Ledger"
          subtitle="Individual electronic ear-tag records and booster due dates"
          icon={<Calendar className="w-5 h-5 text-blue-400" />}
          action={
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter tag, species..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          }
        />
        <div className="overflow-x-auto">
          {filteredRecords.length === 0 ? (
            <EmptyState
              title="No vaccination records found"
              description="No livestock records match your current search criteria."
            />
          ) : (
            <table className="w-full text-left text-xs text-slate-200">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800 text-[11px]">
                <tr>
                  <th className="py-3 px-4">Tag ID / Ear Tag</th>
                  <th className="py-3 px-4">Species & Age</th>
                  <th className="py-3 px-4">Vaccine Formulation</th>
                  <th className="py-3 px-4">Last Administered</th>
                  <th className="py-3 px-4">Booster Due Date</th>
                  <th className="py-3 px-4">Immunity Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredRecords.map((rec) => {
                  const isOver = rec.status === 'OVERDUE';
                  const isDue = rec.status === 'DUE';
                  return (
                    <tr
                      key={rec.tagId}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isOver ? 'bg-rose-950/10' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        {rec.tagId}
                      </td>

                      <td className="py-3.5 px-4 capitalize">
                        <span className="font-semibold text-slate-200">{rec.species}</span>
                        <span className="text-slate-500 text-[11px] block">{rec.age}</span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300 font-medium">
                        {rec.vaccine}
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 font-mono">
                        {rec.lastDate}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-semibold">
                        <span className={isOver ? 'text-rose-400' : isDue ? 'text-amber-400' : 'text-slate-400'}>
                          {rec.dueDate}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {isOver ? (
                          <Badge variant="danger" size="sm" icon={<AlertTriangle className="w-3 h-3" />}>
                            Overdue
                          </Badge>
                        ) : isDue ? (
                          <Badge variant="warning" size="sm" icon={<Clock className="w-3 h-3" />}>
                            Due Soon
                          </Badge>
                        ) : (
                          <Badge variant="success" size="sm" icon={<CheckCircle2 className="w-3 h-3" />}>
                            Vaccinated
                          </Badge>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Button variant="outline" size="sm">
                          Log Dose
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
};
