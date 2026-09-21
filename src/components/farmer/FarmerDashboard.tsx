import React, { useState } from 'react';
import { useSurveillanceStore } from '../../store/surveillanceStore';
import { ReportCaseModal } from './ReportCaseModal';
import { AddAnimalModal } from './AddAnimalModal';
import { CameraScanner } from './CameraScanner';
import { CaseDetailModal } from '../common/CaseDetailModal';
import { CaseReport } from '../../types/surveillance';
import { I18nService } from '../../services/i18nService';
import { VoiceAlertButton } from '../common/VoiceAlertButton';
import { 
  PlusCircle, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  PhoneCall, 
  MessageSquare, 
  Syringe, 
  FileText, 
  MapPin, 
  HelpCircle,
  WifiOff,
  RefreshCw,
  Plus,
  Volume2,
  ExternalLink,
  Camera,
  Mic,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

export const FarmerDashboard: React.FC = () => {
  const { state, syncOfflineOutbox } = useSurveillanceStore();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAddAnimalOpen, setIsAddAnimalOpen] = useState(false);
  const [viewingCase, setViewingCase] = useState<CaseReport | null>(null);
  const [activeTab, setActiveTab] = useState<'cases' | 'scanner' | 'herd' | 'alerts' | 'advisories'>('cases');
  const [scannerPhoto, setScannerPhoto] = useState<{ url: string; fileName: string; symptoms: string[] } | null>(null);

  const lang = state.language;
  const t = (k: any) => I18nService.get(lang, k);

  const activeFarmer = state.farmers[0]; // Ramesh Patel
  const myCases = state.cases.filter(c => c.farmerId === activeFarmer?.id);
  const myAlerts = state.alerts.filter(a => a.farmerId === activeFarmer?.id);
  const outbox = state.offlineOutbox;

  return (
    <div className="space-y-6">
      {/* Farmer Profile & Quick Actions Banner */}
      <div className="bg-gradient-to-r from-emerald-950/90 via-slate-900 to-slate-900 border border-emerald-800/40 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-3xl shadow-inner shrink-0">
              👨‍🌾
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{activeFarmer?.name || 'Ramesh Patel'}</h2>
                <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/40">
                  {t('farmer') || 'Livestock Owner'}
                </span>
                {state.isOffline && (
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] px-2 py-0.5 rounded font-bold flex items-center gap-1">
                    <WifiOff className="w-3 h-3" /> OFFLINE
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                <span>📍 {activeFarmer?.village || 'Village A (Rampur)'}</span>
                <span>•</span>
                <span>📞 {activeFarmer?.phone || '+91 94231 44556'}</span>
                <span>•</span>
                <span>{t('totalHerd')}: <b>{state.herd.length} Registered Livestock</b></span>
              </p>
            </div>
          </div>

          {/* Primary Farmer Priority Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setActiveTab('scanner')}
              className="bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 font-bold px-4 py-3 rounded-2xl text-xs sm:text-sm transition-all flex items-center gap-2 shadow-md active:scale-95"
            >
              <Camera className="w-4 h-4 text-emerald-400" />
              <span>{t('cameraUpload') || 'Camera / Photo Scanner'}</span>
            </button>

            <button
              onClick={() => {
                setScannerPhoto(null);
                setIsReportModalOpen(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-5 py-3 rounded-2xl text-xs sm:text-sm transition-all shadow-xl shadow-emerald-600/30 flex items-center gap-2 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('reportSickAnimal') || 'Report Sick Animal'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Emergency Proximity Alert Banner with Real Telugu Voice Broadcast */}
      {myAlerts.length > 0 && (
        <div className="bg-rose-950/60 border-2 border-rose-600/60 rounded-3xl p-5 shadow-2xl space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-600/20 text-rose-400 shrink-0 mt-0.5">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-rose-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md">
                    🔴 HIGH RISK ALERT
                  </span>
                  <span className="text-xs text-rose-300 font-bold">
                    Active Disease Cluster {myAlerts[0].distanceKm} km from your herd
                  </span>
                </div>
                <p className="text-xs text-slate-200 mt-1 max-w-2xl leading-relaxed">
                  {myAlerts[0].message}
                </p>
              </div>
            </div>

            {/* Telugu & English Spoken Voice Playback Button */}
            <div className="flex items-center gap-2 shrink-0">
              <VoiceAlertButton
                textTe={`హెచ్చరిక. మీ ప్రాంతంలో పశువులకు సంబంధించిన వ్యాధి కేసులు పెరుగుతున్నాయి. మీ గ్రామానికి ${myAlerts[0].distanceKm} కిలోమీటర్ల దూరంలో చురుకైన వ్యాప్తి గుర్తించబడింది. దయచేసి మీ పశువులను ఇతర మందలతో కలవకుండా ఉంచండి. నోటిలో బొబ్బలు లేదా అధిక లాలాజలం గమనిస్తే వెంటనే అత్యవసర హెల్ప్‌లైన్ 1962 కు కాల్ చేయండి.`}
                textEn={`High Risk Alert. Active disease outbreak confirmed within ${myAlerts[0].distanceKm} kilometers of your village. Please isolate milking cattle and notify local veterinary clinic if any oral blisters or drooling are observed.`}
                size="md"
                variant="danger"
                label="వినండి / Listen (Telugu Voice)"
              />
            </div>
          </div>
        </div>
      )}

      {/* Offline Outbox Queue Banner */}
      {outbox.length > 0 && (
        <div className="bg-amber-950/50 border border-amber-500/50 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
              <WifiOff className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                Local Offline Outbox ({outbox.length} {t('outboxCount')})
              </span>
              <p className="text-xs text-slate-300">
                You reported cases while offline. They are safely cached on this device and ready to sync.
              </p>
            </div>
          </div>

          <button
            onClick={() => syncOfflineOutbox()}
            className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-amber-600/30 flex items-center gap-1.5 shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" /> {t('syncNow')}
          </button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-800 space-x-5 text-xs font-bold">
        <button
          onClick={() => setActiveTab('cases')}
          className={`pb-3 px-1 transition-all ${
            activeTab === 'cases'
              ? 'border-b-2 border-emerald-400 text-emerald-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {t('myCases') || 'My Reported Cases'} ({myCases.length + outbox.length})
        </button>

        <button
          onClick={() => setActiveTab('scanner')}
          className={`pb-3 px-1 transition-all flex items-center gap-1.5 ${
            activeTab === 'scanner'
              ? 'border-b-2 border-emerald-400 text-emerald-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>{t('cameraUpload') || 'Camera Scanner'}</span>
          <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-black px-1.5 py-0.2 rounded border border-emerald-500/30">
            Live AI
          </span>
        </button>

        <button
          onClick={() => setActiveTab('herd')}
          className={`pb-3 px-1 transition-all ${
            activeTab === 'herd'
              ? 'border-b-2 border-emerald-400 text-emerald-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {t('myHerd') || 'My Animals & Herd'} ({state.herd.length})
        </button>

        <button
          onClick={() => setActiveTab('alerts')}
          className={`pb-3 px-1 transition-all flex items-center gap-1.5 ${
            activeTab === 'alerts'
              ? 'border-b-2 border-emerald-400 text-emerald-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>{t('nearbyAlerts') || 'Nearby Alerts'}</span>
          {myAlerts.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('advisories')}
          className={`pb-3 px-1 transition-all flex items-center gap-1.5 ${
            activeTab === 'advisories'
              ? 'border-b-2 border-emerald-400 text-emerald-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>{t('advisories') || 'Preventive Guidelines'}</span>
          <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
        </button>
      </div>

      {/* TAB 1: My Reported Cases Feed */}
      {activeTab === 'cases' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {myCases.length + outbox.length} Reported Incident Dossiers
            </h4>
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 border border-slate-700"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Report Another Animal
            </button>
          </div>

          {/* Pending Offline Outbox Items */}
          {outbox.map(item => (
            <div 
              key={item.queueId}
              className="bg-slate-900 border-2 border-amber-500/60 rounded-2xl p-4 shadow-lg space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-xs">{item.queueId}</span>
                  <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/40">
                    ⏳ Outbox (Offline)
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">{item.queuedAt}</span>
              </div>
              <p className="text-xs text-slate-300">
                <b>{item.animalType}</b> • {item.sickCount} Sick, {item.deadCount} Dead ({item.totalAnimals} herd)
              </p>
              <p className="text-xs text-slate-400">
                Symptoms: {item.symptoms.join(', ')}
              </p>
            </div>
          ))}

          {/* Active Synced Cases */}
          {myCases.length === 0 && outbox.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-10 text-center space-y-2">
              <span className="text-4xl block">📋</span>
              <h4 className="text-white font-bold text-sm">No sick animals currently reported</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                If your cattle, buffalo, sheep, or goats show fever, mouth blisters, or lameness, click Report above.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myCases.map((c) => (
                <div 
                  key={c.id}
                  onClick={() => setViewingCase(c)}
                  className="gov-card-interactive space-y-3 hover:border-emerald-500/50"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm text-white flex items-center gap-1.5">
                        {c.id} <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                      </span>
                      <span className={c.riskLevel === 'HIGH' ? 'risk-badge-high' : 'risk-badge-low'}>
                        {c.riskLevel === 'HIGH' ? '🔴 HIGH RISK' : '🟢 LOW RISK'} • Score {c.riskScore}/100
                      </span>
                      <span className="text-xs text-slate-400">{c.submittedAt}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Status:</span>
                      <span className="bg-slate-800 text-emerald-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-slate-700">
                        {c.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Species & Counts</span>
                      <span className="text-white font-medium">
                        {c.animalType} • {c.sickCount} Sick, {c.deadCount} Dead ({c.totalAnimals} herd)
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Reported Symptoms</span>
                      <span className="text-slate-200">
                        {c.symptoms.join(', ')}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Recommended Protocol</span>
                      <span className="text-emerald-400 font-medium">
                        {c.recommendedAction}
                      </span>
                    </div>
                  </div>

                  {/* Lifecycle Tracker Bar */}
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-[10px] text-slate-400 overflow-x-auto gap-2">
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">✓ Submitted</span>
                    <span>→</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">✓ AI Validated</span>
                    <span>→</span>
                    <span className={`${c.status !== 'SUBMITTED' && c.status !== 'AI_ANALYZED' ? 'text-emerald-400 font-semibold' : 'text-slate-500'}`}>
                      Vet Review
                    </span>
                    <span>→</span>
                    <span className={`${c.missionId ? 'text-emerald-400 font-semibold' : 'text-slate-500'}`}>
                      Field Inspection
                    </span>
                    <span>→</span>
                    <span className={`${c.labResult ? 'text-emerald-400 font-semibold' : 'text-slate-500'}`}>
                      Lab Verification
                    </span>
                    <span>→</span>
                    <span className={`${c.status === 'INTERVENED' || c.status === 'CONTAINED' ? 'text-emerald-400 font-semibold' : 'text-slate-500'}`}>
                      Intervention
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: Camera Scanner */}
      {activeTab === 'scanner' && (
        <div className="space-y-4">
          <CameraScanner
            onSelectPhotoForReport={(photoUrl, fileName, detectedSymptoms) => {
              setScannerPhoto({ url: photoUrl, fileName, symptoms: detectedSymptoms });
              setIsReportModalOpen(true);
            }}
          />
        </div>
      )}

      {/* TAB 2: My Animals & Herd */}
      {activeTab === 'herd' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {state.herd.length} Registered Livestock in Herd
            </h4>
            <button
              onClick={() => setIsAddAnimalOpen(true)}
              className="gov-btn-primary text-xs"
            >
              <Plus className="w-4 h-4" /> Register New Animal
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {state.herd.map((animal) => (
              <div 
                key={animal.id}
                className="gov-card space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-emerald-400">{animal.tagNumber}</span>
                    <h4 className="font-bold text-sm text-white">{animal.breed} ({animal.species})</h4>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    animal.vaccinationStatus === 'UP_TO_DATE'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}>
                    {animal.vaccinationStatus.replace('_', ' ')}
                  </span>
                </div>

                <div className="text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Age:</span>
                    <span>{animal.ageYears} Years</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Last Vaccine:</span>
                    <span>{animal.lastVaccineName} ({animal.lastVaccinationDate})</span>
                  </div>
                  <div className="pt-1">
                    <span className="text-slate-400 block text-[11px] mb-1">Treatment History:</span>
                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 text-[11px] text-slate-300">
                      {animal.treatmentHistory.join(' • ')}
                    </div>
                  </div>
                </div>

                {/* Telugu Spoken Reminder */}
                {animal.vaccinationStatus !== 'UP_TO_DATE' && (
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-amber-400 font-semibold">⚠️ వ్యాక్సినేషన్ గడువు సమీపిస్తోంది</span>
                    <VoiceAlertButton
                      textTe={`గుర్తుచేయడం. మీ పశువు ట్యాగ్ నంబర్ ${animal.tagNumber} కు ఎఫ్.ఎమ్.డి బూస్టర్ వ్యాక్సినేషన్ గడువు సమీపిస్తోంది. దయచేసి స్థానిక పశువైద్యశాలలో టీకా వేయించండి.`}
                      textEn={`Reminder. Livestock tag number ${animal.tagNumber} is due for FMD booster vaccination. Please visit the local dispensary.`}
                      size="xs"
                      variant="warning"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Proximity Alerts & Warnings */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          <div className="gov-card space-y-4">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" /> Proximity-Based Disease Broadcasts
            </h4>

            {myAlerts.map((alt) => (
              <div key={alt.id} className="space-y-3">
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 font-mono text-emerald-400 font-bold">
                      📱 SMS Broadcast to {alt.farmerPhone}
                    </span>
                    <span>Sent: {alt.sentAt}</span>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs text-slate-100 leading-relaxed">
                    {alt.message}
                  </div>
                </div>

                {/* Spoken IVR Voice Call Broadcast */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 shrink-0">
                      <PhoneCall className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-white">Automated Spoken Voice Advisory (IVR)</h5>
                      <p className="text-[11px] text-slate-400">
                        High-priority regional voice advisory delivered directly in Telugu / English
                      </p>
                    </div>
                  </div>

                  <VoiceAlertButton
                    textTe={`హెచ్చరిక. రైతు రమేష్ పటేల్ గారికి జంతు ఆరోగ్య అత్యవసర హెచ్చరిక. మీ గ్రామానికి ${alt.distanceKm} కిలోమీటర్ల దూరంలో గాలికుంటు వ్యాధి వ్యాప్తి చురుకుగా ఉంది. దయచేసి పశువులను ఇతర మందలతో కలపవద్దు మరియు నోటిలో బొబ్బలు ఉంటే 1962 కి సంప్రదించండి.`}
                    textEn={`Attention livestock owner. Foot and mouth disease confirmed within ${alt.distanceKm} kilometers. Isolate animals and contact emergency number 1962.`}
                    size="sm"
                    variant="danger"
                    label="వినండి / Listen"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Preventive Guidelines & Biosecurity (With individual Telugu voice buttons) */}
      {activeTab === 'advisories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="gov-card space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-emerald-400 flex items-center gap-2">
                🛡️ ఆన్-ఫార్మ్ బయోసెక్యూరిటీ మార్గదర్శకాలు
              </h4>
              <VoiceAlertButton
                textTe="వ్యాధి వ్యాప్తి సమయంలో పశువుల కదలికలను నియంత్రించండి. తెలియని మందలతో మేత భూములు లేదా నీటి తొట్టెలను పంచుకోవద్దు. పశువుల కొట్టాల నేలపై రోజుకు ఒకసారి సున్నం లేదా 2 శాతం సోడియం కార్బోనేట్ ద్రావణాన్ని పిచికారీ చేయండి."
                textEn="Restrict livestock movement during outbreaks. Do not share common grazing or water troughs. Spray shed floors daily with slaked lime or 2 percent sodium carbonate."
                size="xs"
                variant="emerald"
              />
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Restrict livestock movement during regional outbreaks. Do not share grazing commons or open watering ponds with unknown herds.
            </p>
            <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside pt-1">
              <li>Spray shed floors daily with slaked lime or 2% sodium carbonate.</li>
              <li>Wash milking equipment with potassium permanganate solution (1:1000).</li>
              <li>Quarantine newly purchased cattle for a mandatory 21 days.</li>
            </ul>
          </div>

          <div className="gov-card space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-blue-400 flex items-center gap-2">
                📞 అత్యవసర పశువైద్య సేవలు & హెల్ప్‌లైన్
              </h4>
              <VoiceAlertButton
                textTe="జాతీయ పశు ఆరోగ్య టోల్ ఫ్రీ హెల్ప్‌లైన్ నంబర్ 1962. ఇది 24 గంటలు పనిచేసే మొబైల్ పశువైద్య సేవ. ఏదైనా అనారోగ్యం ఉంటే వెంటనే కాల్ చేయండి."
                textEn="National Animal Health toll free helpline is 1962, a 24/7 mobile veterinary service. Call immediately if any sickness is observed."
                size="xs"
                variant="primary"
              />
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              National Animal Health Toll-Free Helpline: <b className="text-emerald-400 text-sm">1962</b> (24/7 Mobile Veterinary Clinic).
            </p>
            <p className="text-xs text-slate-400">
              Assigned Block Dispensary: Sub-Divisional Veterinary Dispensary Kalyanpur (Dr. Neha Verma: +91 98220 55667).
            </p>
          </div>
        </div>
      )}

      {/* Modals */}
      <ReportCaseModal 
        isOpen={isReportModalOpen} 
        onClose={() => {
          setIsReportModalOpen(false);
          setScannerPhoto(null);
        }}
        initialPhotoUrl={scannerPhoto?.url}
        initialPhotoFileName={scannerPhoto?.fileName}
        initialSymptoms={scannerPhoto?.symptoms}
      />

      <AddAnimalModal
        isOpen={isAddAnimalOpen}
        onClose={() => setIsAddAnimalOpen(false)}
      />

      {viewingCase && (
        <CaseDetailModal
          isOpen={true}
          onClose={() => setViewingCase(null)}
          caseItem={viewingCase}
        />
      )}
    </div>
  );
};
