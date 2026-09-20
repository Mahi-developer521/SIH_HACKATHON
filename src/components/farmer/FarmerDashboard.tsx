import React, { useState } from 'react';
import { useSurveillanceStore } from '../../store/surveillanceStore';
import { ReportCaseModal } from './ReportCaseModal';
import { AddAnimalModal } from './AddAnimalModal';
import { CameraScanner } from './CameraScanner';
import { CaseDetailModal } from '../common/CaseDetailModal';
import { CaseReport } from '../../types/surveillance';
import { I18nService } from '../../services/i18nService';
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
  Camera
} from 'lucide-react';

export const FarmerDashboard: React.FC = () => {
  const { state, syncOfflineOutbox } = useSurveillanceStore();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAddAnimalOpen, setIsAddAnimalOpen] = useState(false);
  const [viewingCase, setViewingCase] = useState<CaseReport | null>(null);
  const [activeTab, setActiveTab] = useState<'cases' | 'scanner' | 'herd' | 'alerts' | 'advisories'>('cases');
  const [scannerPhoto, setScannerPhoto] = useState<{ url: string; fileName: string; symptoms: string[] } | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const lang = state.language;
  const t = (k: any) => I18nService.get(lang, k);

  const activeFarmer = state.farmers[0]; // Ramesh Patel
  const myCases = state.cases.filter(c => c.farmerId === activeFarmer.id);
  const myAlerts = state.alerts.filter(a => a.farmerId === activeFarmer.id);
  const outbox = state.offlineOutbox;

  // Real Speech Synthesis for Spoken Regional Voice Advisory
  const playSpokenAdvisory = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any active speech
      setIsPlayingAudio(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      alert(`Spoken Voice Warning: ${text}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Farmer Profile & Welcome Header */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-800/40 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-3xl shadow-inner">
              👨‍🌾
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{activeFarmer.name}</h2>
                <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-0.5 rounded font-semibold border border-emerald-500/30">
                  {t('farmer')}
                </span>
                {state.isOffline && (
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] px-2 py-0.5 rounded font-bold flex items-center gap-1">
                    <WifiOff className="w-3 h-3" /> OFFLINE
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                <span>📍 {activeFarmer.village}</span>
                <span>•</span>
                <span>📞 {activeFarmer.phone}</span>
                <span>•</span>
                <span>{t('totalHerd')}: {state.herd.length} Registered Livestock</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('scanner')}
              className="bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-bold px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition-all flex items-center gap-2 shadow-md"
            >
              <Camera className="w-4 h-4" /> {t('cameraUpload')}
            </button>

            <button
              onClick={() => {
                setScannerPhoto(null);
                setIsReportModalOpen(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" /> {t('reportSickAnimal')}
            </button>
          </div>
        </div>
      </div>

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

      {/* Proximity Warning Banner if farmer is in high risk radius */}
      {myAlerts.length > 0 && (
        <div className="bg-rose-950/50 border border-rose-600/50 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-600/20 text-rose-400 shrink-0">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-rose-600 text-white text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded">
                  {myAlerts[0].alertLevel}
                </span>
                <span className="text-xs text-rose-300 font-semibold">
                  Active Disease Cluster {myAlerts[0].distanceKm} km from your herd
                </span>
              </div>
              <p className="text-xs text-slate-200 mt-1 max-w-2xl">
                {myAlerts[0].message}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('alerts')}
              className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" /> View SMS / Voice Alert
            </button>
          </div>
        </div>
      )}

      {/* Dashboard Sub-Tabs */}
      <div className="flex border-b border-slate-800 space-x-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('cases')}
          className={`pb-3 px-1 transition-all ${
            activeTab === 'cases'
              ? 'border-b-2 border-emerald-400 text-emerald-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {t('myCases')} ({myCases.length + outbox.length})
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
          <span>{t('cameraUpload')}</span>
          <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-bold px-1.5 py-0.2 rounded border border-emerald-500/30">
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
          {t('myHerd')} ({state.herd.length})
        </button>

        <button
          onClick={() => setActiveTab('alerts')}
          className={`pb-3 px-1 transition-all flex items-center gap-1.5 ${
            activeTab === 'alerts'
              ? 'border-b-2 border-emerald-400 text-emerald-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>{t('nearbyAlerts')}</span>
          {myAlerts.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('advisories')}
          className={`pb-3 px-1 transition-all ${
            activeTab === 'advisories'
              ? 'border-b-2 border-emerald-400 text-emerald-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {t('advisories')}
        </button>
      </div>

      {/* Tab 1: My Reported Cases (Supports multiple reports & sequential tracking) */}
      {activeTab === 'cases' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {myCases.length + outbox.length} Reported Incidents Tracked (Click any case to inspect full dossier)
            </h4>
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 border border-slate-700"
            >
              <PlusCircle className="w-3.5 h-3.5" /> {t('reportAnotherCase')}
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
                    ⏳ {t('outboxCount')} (Offline)
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
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center">
              <span className="text-4xl block mb-2">📋</span>
              <h4 className="text-white font-semibold text-sm">No sick animals currently reported</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                If any cattle, buffalo, sheep or goat shows loss of appetite, fever, mouth lesions or lameness, click Report above.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myCases.map((c) => (
                <div 
                  key={c.id}
                  onClick={() => setViewingCase(c)}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3 hover:border-emerald-500/60 cursor-pointer transition-all hover:bg-slate-900/90"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm text-white flex items-center gap-1.5">
                        {c.id} <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                      </span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${
                        c.riskLevel === 'HIGH' 
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}>
                        AI RISK: {c.riskScore}/100 ({c.riskLevel})
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
                      <span className="text-slate-400 block text-[11px]">{t('species')} & Counts</span>
                      <span className="text-white font-medium">
                        {c.animalType} • {c.sickCount} Sick, {c.deadCount} Dead ({c.totalAnimals} herd)
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">{t('symptomsTitle')}</span>
                      <span className="text-slate-200">
                        {c.symptoms.join(', ')}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Next Protocol</span>
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

      {/* Tab: Camera & Photo Scanner */}
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

      {/* Tab 2: My Animals / Herd (With Add Animal action) */}
      {activeTab === 'herd' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {state.herd.length} Registered Livestock in Herd
            </h4>
            <button
              onClick={() => setIsAddAnimalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition-all shadow-md shadow-emerald-600/30 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Register New Animal to Herd
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {state.herd.map((animal) => (
              <div 
                key={animal.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3"
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
                    <div className="bg-slate-950 p-2 rounded border border-slate-800/80 text-[11px] text-slate-300">
                      {animal.treatmentHistory.join(' • ')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Nearby Alerts & Warnings (With real Web Speech Synthesis) */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" /> Proximity-Based Alert Delivery Channels
            </h4>

            {myAlerts.map((alt) => (
              <div key={alt.id} className="space-y-3">
                {/* Simulated SMS Card */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 font-mono text-emerald-400">
                      📱 SMS Broadcast to {alt.farmerPhone}
                    </span>
                    <span>Sent: {alt.sentAt}</span>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-700/60 font-sans text-xs text-slate-100">
                    {alt.message}
                  </div>
                </div>

                {/* Automated Regional Spoken IVR Voice Call */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                      <PhoneCall className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-xs text-white">Automated Regional Voice Advisory (IVR)</h5>
                      <p className="text-[11px] text-slate-400">
                        {isPlayingAudio ? '🔊 Spoken audio advisory playing...' : 'Real audio speech broadcast in regional language'}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => playSpokenAdvisory(
                      `Attention livestock owner Ramesh Patel. Urgent Animal Health Alert. An active outbreak of foot and mouth disease has been detected within ${alt.distanceKm} kilometers of your village in Rampur. Please isolate all milking cows, do not share grazing fields, and call emergency number 1962 immediately if mouth blisters or drooling are noticed.`
                    )}
                    className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs px-3.5 py-2 rounded-lg transition-colors font-bold shrink-0 flex items-center gap-1.5 shadow-md shadow-emerald-700/20"
                  >
                    <Volume2 className="w-4 h-4" />
                    {isPlayingAudio ? 'Speaking Audio...' : '▶ Listen to Voice Advisory'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Preventive Advisories */}
      {activeTab === 'advisories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
            <h4 className="font-bold text-sm text-emerald-400 flex items-center gap-2">
              🛡️ On-Farm Biosecurity Guidelines
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Restrict livestock movement during regional outbreaks. Do not share grazing commons or open watering ponds with unknown herds.
            </p>
            <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside pt-1">
              <li>Spray shed floors daily with slaked lime or 2% sodium carbonate.</li>
              <li>Wash milking equipment with hot potassium permanganate solution (1:1000).</li>
              <li>Quarantine any newly purchased cattle for a mandatory 21 days.</li>
            </ul>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
            <h4 className="font-bold text-sm text-blue-400 flex items-center gap-2">
              📞 Emergency Veterinary Support
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              National Animal Health Toll-Free Helpline: <b>1962</b> (24/7 Mobile Veterinary Clinic).
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
