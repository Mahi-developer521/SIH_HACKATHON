import React, { useState, useRef, useEffect } from 'react';
import { useSurveillanceStore } from '../../store/surveillanceStore';
import { AnimalType, CaseReport } from '../../types/surveillance';
import { CANONICAL_SYMPTOMS } from '../../data/mockData';
import { I18nService } from '../../services/i18nService';
import { 
  X, 
  UploadCloud, 
  Mic, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Volume2,
  WifiOff,
  PlusCircle,
  Camera,
  Navigation,
  RefreshCw
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialPhotoUrl?: string;
  initialPhotoFileName?: string;
  initialSymptoms?: string[];
}

export const ReportCaseModal: React.FC<Props> = ({ 
  isOpen, 
  onClose,
  initialPhotoUrl,
  initialPhotoFileName,
  initialSymptoms
}) => {
  const { state, submitFarmerReport } = useSurveillanceStore();
  const lang = state.language;
  const t = (k: any) => I18nService.get(lang, k);

  const [animalType, setAnimalType] = useState<AnimalType>('Cattle');
  const [totalAnimals, setTotalAnimals] = useState<number>(12);
  const [sickCount, setSickCount] = useState<number>(2);
  const [deadCount, setDeadCount] = useState<number>(0);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(
    initialSymptoms && initialSymptoms.length > 0
      ? initialSymptoms
      : [
          'High Fever',
          'Blisters / Vesicles on Tongue & Muzzle',
          'Excessive Drooling / Salivation'
        ]
  );
  
  // Voice Simulation & Real Web Speech Recognition
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState(
    'My two milking cows have developed severe mouth sores and cannot eat. Foam is drooling from mouth since yesterday morning.'
  );

  // Photo Upload & Live Camera State
  const [photoUrl, setPhotoUrl] = useState<string>(
    initialPhotoUrl || 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&q=80&w=600'
  );
  const [photoFileName, setPhotoFileName] = useState<string>(initialPhotoFileName || 'mouth_blisters_01.jpg');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (initialPhotoUrl) setPhotoUrl(initialPhotoUrl);
    if (initialPhotoFileName) setPhotoFileName(initialPhotoFileName);
    if (initialSymptoms && initialSymptoms.length > 0) setSelectedSymptoms(initialSymptoms);
  }, [initialPhotoUrl, initialPhotoFileName, initialSymptoms]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    stopCamera();
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      setCameraError('Camera access denied or unavailable. Use file upload.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setPhotoUrl(dataUrl);
        setPhotoFileName(`camera_capture_${Date.now()}.jpg`);
        stopCamera();
      }
    }
  };

  // GPS Coordinates & Auto-Detection
  const [coords, setCoords] = useState({ lat: 18.5362, lng: 73.8741 });
  const [village, setVillage] = useState('Village A (Rampur)');
  const [isLocating, setIsLocating] = useState(false);

  // Submission Result State
  const [submittedCase, setSubmittedCase] = useState<CaseReport | null>(null);

  if (!isOpen) return null;

  const toggleSymptom = (sym: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym]
    );
  };

  // Real Image Upload Handler
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFileName(file.name);
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setPhotoUrl(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Real Web Speech API or Fallback
  const handleVoiceRecordToggle = () => {
    if (!isRecording) {
      setIsRecording(true);
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.lang = lang === 'hi' ? 'hi-IN' : lang === 'mr' ? 'mr-IN' : 'en-IN';
          recognition.interimResults = false;
          recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setVoiceTranscript(transcript);
            setIsRecording(false);
          };
          recognition.onerror = () => {
            // Fallback simulation
            fallbackVoiceSimulation();
          };
          recognition.start();
          return;
        } catch {
          // fallback
        }
      }
      fallbackVoiceSimulation();
    } else {
      setIsRecording(false);
    }
  };

  const fallbackVoiceSimulation = () => {
    setTimeout(() => {
      setIsRecording(false);
      setVoiceTranscript(
        lang === 'hi' 
          ? 'गाय के मुंह और खुर में फफोले दिख रहे हैं। बहुत लार गिर रही है और बुखार है।'
          : lang === 'mr'
            ? 'गायीच्या तोंडावर आणि खुरांवर फोड आले आहेत. सतत लाळ गळत आहे आणि ताप आहे.'
            : 'Two cows in shed #2 show blistering around coronary band and excessive drooling. High fever noticed today.'
      );
    }, 2000);
  };

  // Real Geolocation Auto-Detection
  const handleDetectLocation = () => {
    if ('geolocation' in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsLocating(false);
        },
        () => {
          setIsLocating(false);
        },
        { timeout: 5000 }
      );
    }
  };

  const handleResetForAnotherReport = () => {
    setSubmittedCase(null);
    setAnimalType('Goat');
    setTotalAnimals(15);
    setSickCount(3);
    setDeadCount(0);
    setSelectedSymptoms(['Severe Lameness / Inability to Stand', 'High Fever']);
    setVoiceTranscript('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = submitFarmerReport({
      animalType,
      totalAnimals,
      sickCount,
      deadCount,
      symptoms: selectedSymptoms,
      photoUrl,
      voiceTranscript,
      coordinates: coords,
      village
    });
    setSubmittedCase(result);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-lg">
              🐮
            </span>
            <div>
              <h3 className="text-lg font-bold text-white">{t('reportSickAnimal')}</h3>
              <p className="text-xs text-slate-400">
                {t('step')} 4: {t('brandSubtitle')}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Offline Mode Alert Banner if active */}
        {state.isOffline && !submittedCase && (
          <div className="bg-amber-950/60 border-b border-amber-800/60 px-6 py-2 text-xs text-amber-200 flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{t('offlineAlert')}</span>
          </div>
        )}

        {submittedCase ? (
          /* Submission Result */
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                state.isOffline
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : submittedCase.riskLevel === 'HIGH' 
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' 
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              }`}>
                {state.isOffline ? (
                  <WifiOff className="w-7 h-7" />
                ) : submittedCase.riskLevel === 'HIGH' ? (
                  <AlertTriangle className="w-7 h-7" />
                ) : (
                  <ShieldCheck className="w-7 h-7" />
                )}
              </div>
              <div>
                <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
                  Case ID: {submittedCase.id} • Status: {submittedCase.status}
                </span>
                <h4 className="text-xl font-bold text-white">
                  {state.isOffline 
                    ? 'Report Saved to Offline Outbox'
                    : submittedCase.riskLevel === 'HIGH' 
                      ? 'AI High-Risk Pattern Detected' 
                      : 'Report Logged - Low Risk Situation'}
                </h4>
              </div>
            </div>

            {/* AI / Offline Result Card */}
            <div className={`p-4 rounded-2xl border ${
              state.isOffline
                ? 'bg-amber-950/30 border-amber-800/60 text-amber-200'
                : submittedCase.riskLevel === 'HIGH'
                  ? 'bg-rose-950/30 border-rose-800/60 text-rose-200'
                  : 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">
                  {state.isOffline ? 'Offline Queue Item' : `AI Risk Engine Score: ${submittedCase.riskScore}/100 (${submittedCase.riskLevel})`}
                </span>
                <span className="text-xs px-2 py-0.5 rounded font-bold bg-slate-900/80">
                  {state.isOffline 
                    ? '⏳ QUEUED FOR SYNC' 
                    : submittedCase.riskLevel === 'HIGH' 
                      ? '🚨 VET OFFICER ALERTED' 
                      : '🌿 PREVENTIVE ADVISORY'}
                </span>
              </div>

              <div className="text-xs space-y-1 mb-3">
                <span className="font-semibold block text-slate-300">Analysis Breakdown:</span>
                {submittedCase.aiReasons.map((reason, idx) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{reason}</span>
                  </div>
                ))}
              </div>

              <div className="text-xs bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                <span className="font-semibold text-slate-300 block mb-0.5">Recommended Next Action:</span>
                <p className="text-slate-200">{submittedCase.recommendedAction}</p>
              </div>
            </div>

            {/* Multi-Report Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={handleResetForAnotherReport}
                className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 border border-slate-700"
              >
                <PlusCircle className="w-4 h-4" /> {t('reportAnotherCase')}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-2.5 rounded-xl text-xs transition-colors"
              >
                {t('close')} & View on Dashboard
              </button>
            </div>
          </div>
        ) : (
          /* Submission Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Animal Type & Counts */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('species')}</label>
                <select
                  value={animalType}
                  onChange={(e) => setAnimalType(e.target.value as AnimalType)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Cattle">Cattle (गाय)</option>
                  <option value="Buffalo">Buffalo (भैंस)</option>
                  <option value="Sheep">Sheep (भेड़)</option>
                  <option value="Goat">Goat (बकरी)</option>
                  <option value="Poultry">Poultry (मुर्गी)</option>
                  <option value="Pig">Pig (सुअर)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('totalHerd')}</label>
                <input
                  type="number"
                  min="1"
                  value={totalAnimals}
                  onChange={(e) => setTotalAnimals(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-rose-400 mb-1">{t('sickCount')}</label>
                <input
                  type="number"
                  min="0"
                  value={sickCount}
                  onChange={(e) => setSickCount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-rose-400 mb-1">{t('deadCount')}</label>
                <input
                  type="number"
                  min="0"
                  value={deadCount}
                  onChange={(e) => setDeadCount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Symptoms Checklist with Multilingual Support */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t('symptomsTitle')}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CANONICAL_SYMPTOMS.map((sym) => {
                  const isSelected = selectedSymptoms.includes(sym);
                  const symKey = sym.includes('Fever') ? 'symptom_fever'
                    : sym.includes('Tongue') ? 'symptom_oralBlisters'
                    : sym.includes('Hooves') ? 'symptom_hoofBlisters'
                    : sym.includes('Salivation') || sym.includes('Drooling') ? 'symptom_drooling'
                    : sym.includes('Lameness') ? 'symptom_lameness'
                    : sym.includes('Nodule') ? 'symptom_nodules'
                    : sym.includes('Respiratory') ? 'symptom_respiratory'
                    : sym.includes('Milk') ? 'symptom_milkDrop'
                    : sym.includes('Anorexia') ? 'symptom_anorexia'
                    : sym.includes('Diarrhea') ? 'symptom_diarrhea'
                    : 'symptom_death';

                  const localizedSym = t(symKey) || sym;

                  return (
                    <button
                      type="button"
                      key={sym}
                      onClick={() => toggleSymptom(sym)}
                      className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                        isSelected
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/60 font-semibold'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}{localizedSym}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Voice Recording Simulation & Speech-to-Text */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-emerald-400" /> {t('voiceMemo')}
                </span>
                <button
                  type="button"
                  onClick={handleVoiceRecordToggle}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    isRecording
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  {isRecording ? t('listening') : t('recordVoice')}
                </button>
              </div>

              {isRecording && (
                <div className="flex items-center justify-center gap-1 py-2">
                  <span className="w-1 h-3 bg-rose-500 animate-bounce"></span>
                  <span className="w-1 h-6 bg-rose-500 animate-bounce delay-75"></span>
                  <span className="w-1 h-8 bg-rose-500 animate-bounce delay-150"></span>
                  <span className="w-1 h-4 bg-rose-500 animate-bounce delay-100"></span>
                  <span className="w-1 h-2 bg-rose-500 animate-bounce"></span>
                </div>
              )}

              {voiceTranscript && (
                <div className="text-[11px] text-slate-300 bg-slate-900 p-2.5 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400 font-medium block text-[10px] uppercase">{t('autoTranscript')}:</span>
                  "{voiceTranscript}"
                </div>
              )}
            </div>

            {/* Real Photo Upload & Real GPS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Photo Upload & Live Camera Section */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-300">
                    {t('lesionPhoto')}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    {!isCameraActive ? (
                      <>
                        <button
                          type="button"
                          onClick={startCamera}
                          className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800"
                        >
                          <Camera className="w-3 h-3" /> Camera
                        </button>
                        <label className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          <UploadCloud className="w-3 h-3" /> Upload
                          <input 
                            type="file" 
                            accept="image/*" 
                            capture="environment"
                            onChange={handleImageFileChange}
                            className="hidden" 
                          />
                        </label>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="text-[10px] text-rose-400 hover:underline"
                      >
                        Cancel Camera
                      </button>
                    )}
                  </div>
                </div>

                {isCameraActive ? (
                  <div className="space-y-2">
                    <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-900">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-36 object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-24 h-24 border border-dashed border-emerald-400/80 rounded-lg animate-pulse"></div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-1.5 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow"
                    >
                      <Camera className="w-3.5 h-3.5" /> {t('takeSnapshot')}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center text-slate-500 shrink-0">
                      {photoUrl ? (
                        <img 
                          src={photoUrl} 
                          alt="Lesion" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <UploadCloud className="w-5 h-5" />
                      )}
                    </div>
                    <div className="truncate flex-1">
                      <span className="text-[11px] text-emerald-400 font-semibold block truncate">{photoFileName}</span>
                      <span className="text-[10px] text-slate-400 block">Attached & AI Ready</span>
                    </div>
                  </div>
                )}

                {cameraError && (
                  <p className="text-[10px] text-rose-400 mt-1">{cameraError}</p>
                )}
              </div>

              {/* GPS coordinates & Detection */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-300">
                    {t('gpsVerified')}
                  </span>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <Navigation className="w-3 h-3" />
                    {isLocating ? 'Locating...' : 'Detect GPS'}
                  </button>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-mono text-[11px] text-slate-200">
                      {coords.lat.toFixed(4)}° N, {coords.lng.toFixed(4)}° E
                    </span>
                    <span className="block text-[10px] text-slate-400">{village}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className={`w-full font-bold py-3 rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${
                  state.isOffline
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                }`}
              >
                {state.isOffline ? (
                  <>
                    <WifiOff className="w-4 h-4" /> {t('saveOffline')}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> {t('submitReport')}
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
