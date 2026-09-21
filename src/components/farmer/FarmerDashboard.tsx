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
  WifiOff, 
  RefreshCw, 
  Plus, 
  Volume2, 
  ExternalLink, 
  Camera 
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

  const activeFarmer = (state.farmers && state.farmers.length > 0)
    ? (state.farmers.find(f => f.id === state.currentUser?.id) || state.farmers[0])
    : {
        id: state.currentUser?.id || 'FARMER-01',
        name: state.currentUser?.name || 'Ramesh Patel',
        phone: '+91 94231 44556',
        village: 'Village A (Rampur)',
        coordinates: { lat: 18.5362, lng: 73.8741 },
        animals: []
      };

  const myCases = (state.cases || []).filter(c => 
    c.farmerId === activeFarmer.id || 
    c.farmerId === 'FARMER-01' || 
    c.farmerId === state.currentUser?.id ||
    c.farmerName === activeFarmer.name
  );

  const myAlerts = (state.alerts || []).filter(a => 
    a.farmerId === activeFarmer.id || 
    a.farmerId === 'FARMER-01' || 
    a.farmerId === state.currentUser?.id
  );

  const outbox = state.offlineOutbox || [];
  const herd = state.herd || [];

  const topAlert = myAlerts.length > 0 ? myAlerts[0] : null;
  const topAlertDist = topAlert?.distanceKm ?? 2.8;
  const topAlertMsg = topAlert?.message || 'Active disease outbreak confirmed in nearby area. Please isolate livestock and report symptoms immediately.';

  return (
    <div className="space-y-6">
      {/* Farmer Profile & Quick Actions Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-3xl shrink-0">
              👨‍🌾
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{activeFarmer?.name || 'Ramesh Patel'}</h2>
                <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-0.5 rounded-full font-bold border border-blue-200">
                  {t('farmer') || 'Livestock Owner'}
                </span>
                {state.isOffline && (
                  <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] px-2 py-0.5 rounded font-bold flex items-center gap-1">
                    <WifiOff className="w-3 h-3 text-amber-600" /> OFFLINE
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                <span>📍 {activeFarmer?.village || 'Village A (Rampur)'}</span>
                <span>•</span>
                <span>📞 {activeFarmer?.phone || '+91 94231 44556'}</span>
                <span>•</span>
                <span>{t('totalHerd')}: <b className="text-slate-800">{herd.length} Registered Livestock</b></span>
              </p>
            </div>
          </div>

          {/* Primary Farmer Priority Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setActiveTab('scanner')}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-colors flex items-center gap-2 shadow-sm"
            >
              <Camera className="w-4 h-4 text-blue-600" />
              <span>{t('cameraUpload') || 'Camera / Photo Scanner'}</span>
            </button>

            <button
              onClick={() => {
                setScannerPhoto(null);
                setIsReportModalOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition-colors shadow-sm flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('reportSickAnimal') || 'Report Sick Animal'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Emergency Proximity Alert Banner with Real Telugu Voice Broadcast */}
      {topAlert && (
        <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700 shrink-0 mt-0.5">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-blue-600 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-md">
                    PRIORITY BIOSECURITY ALERT
                  </span>
                  <span className="text-xs text-blue-900 font-bold">
                    Active Disease Cluster {topAlertDist} km from your herd
                  </span>
                </div>
                <p className="text-xs text-slate-700 mt-1 max-w-2xl leading-relaxed">
                  {topAlertMsg}
                </p>
              </div>
            </div>

            {/* Telugu & English Spoken Voice Playback Button */}
            <div className="flex items-center gap-2 shrink-0">
              <VoiceAlertButton
                textTe={`హెచ్చరిక. మీ ప్రాంతంలో పశువులకు సంబంధించిన వ్యాధి కేసులు పెరుగుతున్నాయి. మీ గ్రామానికి ${topAlertDist} కిలోమీటర్ల దూరంలో చురుకైన వ్యాప్తి గుర్తించబడింది. దయచేసి మీ పశువులను ఇతర మందలతో కలవకుండా ఉంచండి. నోటిలో బొబ్బలు లేదా అధిక లాలాజలం గమనిస్తే వెంటనే అత్యవసర హెల్ప్‌లైన్ 1962 కు కాల్ చేయండి.`}
                textEn={`High Risk Alert. Active disease outbreak confirmed within ${topAlertDist} kilometers of your village. Please isolate milking cattle and notify local veterinary clinic if any oral blisters or drooling are observed.`}
                size="md"
                variant="primary"
                label="వినండి / Listen (Telugu Voice)"
              />
            </div>
          </div>
        </div>
      )}

      {/* Offline Outbox Queue Banner */}
      {outbox.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-600 shrink-0">
              <WifiOff className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                Local Offline Outbox ({outbox.length} {t('outboxCount')})
              </span>
              <p className="text-xs text-slate-600">
                You reported cases while offline. They are safely cached on this device and ready to sync.
              </p>
            </div>
          </div>

          <button
            onClick={() => syncOfflineOutbox()}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-sm flex items-center gap-1.5 shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" /> {t('syncNow')}
          </button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 space-x-5 text-xs font-bold">
        <button
          onClick={() => setActiveTab('cases')}
          className={`pb-3 px-1 transition-colors ${
            activeTab === 'cases'
              ? 'border-b-2 border-blue-600 text-blue-700'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {t('myCases') || 'My Reported Cases'} ({myCases.length + outbox.length})
        </button>

        <button
          onClick={() => setActiveTab('scanner')}
          className={`pb-3 px-1 transition-colors flex items-center gap-1.5 ${
            activeTab === 'scanner'
              ? 'border-b-2 border-blue-600 text-blue-700'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Camera className="w-3.5 h-3.5 text-blue-600" />
          <span>{t('cameraUpload') || 'Camera Scanner'}</span>
          <span className="bg-blue-50 text-blue-700 text-[9px] font-bold px-1.5 py-0.2 rounded border border-blue-200">
            Live AI
          </span>
        </button>

        <button
          onClick={() => setActiveTab('herd')}
          className={`pb-3 px-1 transition-colors ${
            activeTab === 'herd'
              ? 'border-b-2 border-blue-600 text-blue-700'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {t('myHerd') || 'My Animals & Herd'} ({state.herd.length})
        </button>

        <button
          onClick={() => setActiveTab('alerts')}
          className={`pb-3 px-1 transition-colors flex items-center gap-1.5 ${
            activeTab === 'alerts'
              ? 'border-b-2 border-blue-600 text-blue-700'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>{t('nearbyAlerts') || 'Nearby Alerts'}</span>
          {myAlerts.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('advisories')}
          className={`pb-3 px-1 transition-colors flex items-center gap-1.5 ${
            activeTab === 'advisories'
              ? 'border-b-2 border-blue-600 text-blue-700'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>{t('advisories') || 'Preventive Guidelines'}</span>
          <Volume2 className="w-3.5 h-3.5 text-blue-600" />
        </button>
      </div>

      {/* TAB 1: My Reported Cases Feed */}
      {activeTab === 'cases' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {myCases.length + outbox.length} Reported Incident Dossiers
            </h4>
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="text-xs bg-white hover:bg-slate-50 text-blue-700 font-bold px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1 border border-slate-300 shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Report Another Animal
            </button>
          </div>

          {/* Pending Offline Outbox Items */}
          {outbox.map(item => (
            <div 
              key={item.queueId}
              className="bg-white border-2 border-amber-300 rounded-2xl p-4 shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-xs">{item.queueId}</span>
                  <span className="bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200">
                    ⏳ Outbox (Offline)
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">{item.queuedAt}</span>
              </div>
              <p className="text-xs text-slate-800">
                <b>{item.animalType}</b> • {item.sickCount} Sick, {item.deadCount} Dead ({item.totalAnimals} herd)
              </p>
              <p className="text-xs text-slate-500">
                Symptoms: {item.symptoms.join(', ')}
              </p>
            </div>
          ))}

          {/* Active Synced Cases */}
          {myCases.length === 0 && outbox.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center space-y-2 shadow-xs">
              <span className="text-4xl block">📋</span>
              <h4 className="text-slate-900 font-bold text-sm">No sick animals currently reported</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                If your cattle, buffalo, sheep, or goats show fever, mouth blisters, or lameness, click Report above.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myCases.map((c) => (
                <div 
                  key={c.id}
                  onClick={() => setViewingCase(c)}
                  className="bg-white border border-slate-200 hover:border-blue-400 p-5 rounded-2xl shadow-xs space-y-3 cursor-pointer transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                        {c.id} <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      </span>
                      <span className={c.riskLevel === 'HIGH' ? 'risk-badge-high' : 'risk-badge-low'}>
                        {c.riskLevel === 'HIGH' ? '🔴 HIGH RISK' : '🟢 LOW RISK'} • Score {c.riskScore}/100
                      </span>
                      <span className="text-xs text-slate-500">{c.submittedAt}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Status:</span>
                      <span className="bg-slate-100 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-slate-200">
                        {c.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Species & Counts</span>
                      <span className="text-slate-900 font-semibold">
                        {c.animalType} • {c.sickCount} Sick, {c.deadCount} Dead ({c.totalAnimals} herd)
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[11px]">Reported Symptoms</span>
                      <span className="text-slate-700">
                        {c.symptoms.join(', ')}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[11px]">Recommended Protocol</span>
                      <span className="text-blue-700 font-semibold">
                        {c.recommendedAction}
                      </span>
                    </div>
                  </div>

                  {/* Lifecycle Tracker Bar */}
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-[10px] text-slate-500 overflow-x-auto gap-2">
                    <span className="text-blue-700 font-bold flex items-center gap-1">✓ Submitted</span>
                    <span>→</span>
                    <span className="text-blue-700 font-bold flex items-center gap-1">✓ AI Validated</span>
                    <span>→</span>
                    <span className={`${c.status !== 'SUBMITTED' && c.status !== 'AI_ANALYZED' ? 'text-blue-700 font-bold' : 'text-slate-400'}`}>
                      Vet Review
                    </span>
                    <span>→</span>
                    <span className={`${c.missionId ? 'text-blue-700 font-bold' : 'text-slate-400'}`}>
                      Field Inspection
                    </span>
                    <span>→</span>
                    <span className={`${c.labResult ? 'text-blue-700 font-bold' : 'text-slate-400'}`}>
                      Lab Verification
                    </span>
                    <span>→</span>
                    <span className={`${c.status === 'INTERVENED' || c.status === 'CONTAINED' ? 'text-blue-700 font-bold' : 'text-slate-400'}`}>
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
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {herd.length} Registered Livestock in Herd
            </h4>
            <button
              onClick={() => setIsAddAnimalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Register New Animal
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {herd.map((animal) => (
              <div 
                key={animal.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-blue-700">{animal.tagNumber}</span>
                    <h4 className="font-bold text-sm text-slate-900">{animal.breed} ({animal.species})</h4>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    animal.vaccinationStatus === 'UP_TO_DATE'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {animal.vaccinationStatus.replace('_', ' ')}
                  </span>
                </div>

                <div className="text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-700">
                    <span className="text-slate-500">Age:</span>
                    <span>{animal.ageYears} Years</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span className="text-slate-500">Last Vaccine:</span>
                    <span>{animal.lastVaccineName} ({animal.lastVaccinationDate})</span>
                  </div>
                  <div className="pt-1">
                    <span className="text-slate-500 block text-[11px] mb-1">Treatment History:</span>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 text-[11px] text-slate-700">
                      {(animal.treatmentHistory || []).join(' • ')}
                    </div>
                  </div>
                </div>

                {/* Telugu Spoken Reminder */}
                {animal.vaccinationStatus !== 'UP_TO_DATE' && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-amber-700 font-semibold">⚠️ వ్యాక్సినేషన్ గడువు సమీపిస్తోంది</span>
                    <VoiceAlertButton
                      textTe={`గుర్తుచేయడం. మీ పశువు ట్యాగ్ నంబర్ ${animal.tagNumber} కు ఎఫ్.ఎమ్.డి బూస్టర్ వ్యాక్సినేషన్ గడువు సమీపిస్తోంది. దయచేసి స్థానిక పశువైద్యశాలలో టీకా వేయించండి.`}
                      textEn={`Reminder. Livestock tag number ${animal.tagNumber} is due for FMD booster vaccination. Please visit the local dispensary.`}
                      size="xs"
                      variant="primary"
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
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" /> Proximity-Based Disease Broadcasts
            </h4>

            {myAlerts.map((alt) => {
              const altDist = alt.distanceKm ?? 2.8;
              const phone = alt.farmerPhone || activeFarmer.phone || '+91 94231 44556';
              return (
                <div key={alt.id} className="space-y-3">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 font-mono text-blue-700 font-bold">
                        📱 SMS Broadcast to {phone}
                      </span>
                      <span>Sent: {alt.sentAt || 'Recently'}</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed shadow-xs">
                      {alt.message}
                    </div>
                  </div>

                  {/* Spoken IVR Voice Call Broadcast */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-blue-100 text-blue-600 shrink-0">
                        <PhoneCall className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-bold text-xs text-slate-900">Automated Spoken Voice Advisory (IVR)</h5>
                        <p className="text-[11px] text-slate-500">
                          High-priority regional voice advisory delivered directly in Telugu / English
                        </p>
                      </div>
                    </div>

                    <VoiceAlertButton
                      textTe={`హెచ్చరిక. రైతు రమేష్ పటేల్ గారికి జంతు ఆరోగ్య అత్యవసర హెచ్చరిక. మీ గ్రామానికి ${altDist} కిలోమీటర్ల దూరంలో గాలికుంటు వ్యాధి వ్యాప్తి చురుకుగా ఉంది. దయచేసి పశువులను ఇతర మందలతో కలపవద్దు మరియు నోటిలో బొబ్బలు ఉంటే 1962 కి సంప్రదించండి.`}
                      textEn={`Attention livestock owner. Foot and mouth disease confirmed within ${altDist} kilometers. Isolate animals and contact emergency number 1962.`}
                      size="sm"
                      variant="primary"
                      label="వినండి / Listen"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: Preventive Guidelines & Biosecurity */}
      {activeTab === 'advisories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                🛡️ ఆన్-ఫార్మ్ బయోసెక్యూరిటీ మార్గదర్శకాలు
              </h4>
              <VoiceAlertButton
                textTe="వ్యాధి వ్యాప్తి సమయంలో పశువుల కదలికలను నియంత్రించండి. తెలియని మందలతో మేత భూములు లేదా నీటి తొట్టెలను పంచుకోవద్దు. పశువుల కొట్టాల నేలపై రోజుకు ఒకసారి సున్నం లేదా 2 శాతం సోడియం కార్బోనేట్ ద్రావణాన్ని పిచికారీ చేయండి."
                textEn="Restrict livestock movement during outbreaks. Do not share common grazing or water troughs. Spray shed floors daily with slaked lime or 2 percent sodium carbonate."
                size="xs"
                variant="primary"
              />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Restrict livestock movement during regional outbreaks. Do not share grazing commons or open watering ponds with unknown herds.
            </p>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside pt-1">
              <li>Spray shed floors daily with slaked lime or 2% sodium carbonate.</li>
              <li>Wash milking equipment with potassium permanganate solution (1:1000).</li>
              <li>Quarantine newly purchased cattle for a mandatory 21 days.</li>
            </ul>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-blue-700 flex items-center gap-2">
                📞 అత్యవసర పశువైద్య సేవలు & హెల్ప్‌లైన్
              </h4>
              <VoiceAlertButton
                textTe="జాతీయ పశు ఆరోగ్య టోల్ ఫ్రీ హెల్ప్‌లైన్ నంబర్ 1962. ఇది 24 గంటలు పనిచేసే మొబైల్ పశువైద్య సేవ. ఏదైనా అనారోగ్యం ఉంటే వెంటనే కాల్ చేయండి."
                textEn="National Animal Health toll free helpline is 1962, a 24/7 mobile veterinary service. Call immediately if any sickness is observed."
                size="xs"
                variant="primary"
              />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Restrict livestock movement during regional outbreaks. Do not share grazing commons or open watering ponds with unknown herds.
            </p>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside pt-1">
              <li>Spray shed floors daily with slaked lime or 2% sodium carbonate.</li>
              <li>Wash milking equipment with potassium permanganate solution (1:1000).</li>
              <li>Quarantine newly purchased cattle for a mandatory 21 days.</li>
            </ul>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-blue-700 flex items-center gap-2">
                📞 అత్యవసర పశువైద్య సేవలు & హెల్ప్‌లైన్
              </h4>
              <VoiceAlertButton
                textTe="జాతీయ పశు ఆరోగ్య టోల్ ఫ్రీ హెల్ప్‌లైన్ నంబర్ 1962. ఇది 24 గంటలు పనిచేసే మొబైల్ పశువైద్య సేవ. ఏదైనా అనారోగ్యం ఉంటే వెంటనే కాల్ చేయండి."
                textEn="National Animal Health toll free helpline is 1962, a 24/7 mobile veterinary service. Call immediately if any sickness is observed."
                size="xs"
              />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              National Animal Health Toll-Free Helpline: <b className="text-blue-700 text-sm">1962</b> (24/7 Mobile Veterinary Clinic).
            </p>
            <p className="text-xs text-slate-500">
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
