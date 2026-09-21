import React, { useState, useRef, useEffect } from 'react';
import { useSurveillanceStore } from '../../store/surveillanceStore';
import { AnimalType, CaseReport } from '../../types/surveillance';
import { CANONICAL_SYMPTOMS } from '../../data/mockData';
import { I18nService } from '../../services/i18nService';
import { ApiService } from '../../services/apiService';
import { 
  X, 
  UploadCloud, 
  Mic, 
  MicOff,
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Volume2, 
  PlusCircle,
  Camera,
  Navigation,
  RefreshCw,
  Trash2,
  Edit3,
  Check,
  RotateCcw,
  Sparkles,
  WifiOff
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
  const { state, submitFarmerReport, showToast } = useSurveillanceStore();
  const lang = state.language;
  const t = (k: any) => I18nService.get(lang, k);

  const [animalType, setAnimalType] = useState<AnimalType>('Cattle');
  const [totalAnimals, setTotalAnimals] = useState<number>(12);
  const [sickCount, setSickCount] = useState<number>(2);
  const [deadCount, setDeadCount] = useState<number>(0);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(
    initialSymptoms && initialSymptoms.length > 0
      ? initialSymptoms
      : ['High Fever', 'Blisters / Vesicles on Tongue & Muzzle', 'Excessive Drooling / Salivation']
  );
  
  // Voice Recording State (Web Speech API)
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState<string>('');
  const [voiceTranscript, setVoiceTranscript] = useState<string>(
    lang === 'te' 
      ? 'ఆవుకు తీవ్రమైన జ్వరం ఉంది మరియు నోటిలో బొబ్బలు వచ్చి మేత తినడం లేదు.'
      : lang === 'hi'
      ? 'गाय को तेज बुखार है, मुंह में छाले हैं और चारा नहीं खा रही है।'
      : 'My cow has high fever, oral blisters and stopped eating since yesterday.'
  );
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Photo Upload & Camera State
  const [photoUrl, setPhotoUrl] = useState<string>(
    initialPhotoUrl || 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&q=80&w=600'
  );
  const [photoFileName, setPhotoFileName] = useState<string>(initialPhotoFileName || 'oral_vesicles_sample.jpg');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  // Live Camera
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedSnapshot, setCapturedSnapshot] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // GPS Coordinates & Auto-Detection
  const [coords, setCoords] = useState({ lat: 18.5362, lng: 73.8741 });
  const [village, setVillage] = useState('Village A (Rampur)');
  const [isLocating, setIsLocating] = useState(false);

  // Submission Result State
  const [submittedCase, setSubmittedCase] = useState<CaseReport | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialPhotoUrl) setPhotoUrl(initialPhotoUrl);
    if (initialPhotoFileName) setPhotoFileName(initialPhotoFileName);
    if (initialSymptoms && initialSymptoms.length > 0) setSelectedSymptoms(initialSymptoms);
  }, [initialPhotoUrl, initialPhotoFileName, initialSymptoms]);

  useEffect(() => {
    return () => {
      stopCamera();
      stopVoiceRecording();
    };
  }, []);

  if (!isOpen) return null;

  const toggleSymptom = (sym: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym]
    );
  };

  // ==========================================
  // VOICE RECORDING (WEB SPEECH API)
  // ==========================================
  const startVoiceRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported by this browser. Please use text input or Chrome/Edge.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      // Select speech recognition language matching UI language
      if (lang === 'te') {
        recognition.lang = 'te-IN'; // Telugu
      } else if (lang === 'hi') {
        recognition.lang = 'hi-IN'; // Hindi
      } else {
        recognition.lang = 'en-IN'; // English
      }

      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsRecording(true);
        setRecordingStatus(t('listening'));
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setRecordingStatus(t('voiceSuccess'));
        setVoiceTranscript(prev => (prev ? `${prev} ${transcript}` : transcript));
        setIsRecording(false);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition notice:', event.error);
        setIsRecording(false);
        setRecordingStatus('Microphone finished or permission needed.');
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (err: any) {
      console.error('Error starting recognition:', err);
      setIsRecording(false);
    }
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsRecording(false);
  };

  const handleVoiceRecordToggle = () => {
    if (isRecording) {
      stopVoiceRecording();
    } else {
      startVoiceRecording();
    }
  };

  // ==========================================
  // IMAGE FILE UPLOAD
  // ==========================================
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate MIME type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setImageUploadError('Invalid format. Please select JPG, PNG, or WebP image.');
      return;
    }

    // Validate size (max 5 MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setImageUploadError(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Max limit: 5 MB.`);
      return;
    }

    setSelectedFile(file);
    setPhotoFileName(file.name);

    // Create local object URL for instant preview
    const objectUrl = URL.createObjectURL(file);
    setPhotoUrl(objectUrl);
    setCapturedSnapshot(null);
    stopCamera();
  };

  const handleRemoveImage = () => {
    setPhotoUrl('');
    setPhotoFileName('');
    setSelectedFile(null);
    setCapturedSnapshot(null);
    setImageUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ==========================================
  // LIVE DEVICE CAMERA
  // ==========================================
  const startCamera = async () => {
    setCameraError(null);
    stopCamera();
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not available on this device/browser.');
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
      setCapturedSnapshot(null);
    } catch (err: any) {
      setCameraError(t('cameraError'));
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
        setCapturedSnapshot(dataUrl);
        stopCamera();
      }
    }
  };

  const confirmCapturedPhoto = () => {
    if (capturedSnapshot) {
      setPhotoUrl(capturedSnapshot);
      setPhotoFileName(`camera_capture_${Date.now()}.jpg`);
      setCapturedSnapshot(null);
      showToast('success', 'Camera photo confirmed and attached to report.');
    }
  };

  const retakeCameraPhoto = () => {
    setCapturedSnapshot(null);
    startCamera();
  };

  // ==========================================
  // GPS LOCATION
  // ==========================================
  const handleDetectLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: Number(pos.coords.latitude.toFixed(4)),
            lng: Number(pos.coords.longitude.toFixed(4))
          });
          setIsLocating(false);
          showToast('info', 'GPS location accurately detected.');
        },
        () => {
          setCoords({ lat: 18.5362, lng: 73.8741 });
          setIsLocating(false);
        },
        { timeout: 5000 }
      );
    } else {
      setIsLocating(false);
    }
  };

  // ==========================================
  // SUBMISSION
  // ==========================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let finalImageUrl = photoUrl;
      let finalFilename = photoFileName;

      // If user uploaded a physical File, upload to backend /api/reports/upload-image
      if (selectedFile) {
        try {
          setIsUploadingImage(true);
          const uploadRes = await ApiService.uploadImage(selectedFile);
          finalImageUrl = uploadRes.imageUrl;
          finalFilename = uploadRes.filename;
        } catch (uploadErr: any) {
          console.warn('Backend file upload notice, saving with data URI:', uploadErr.message);
        } finally {
          setIsUploadingImage(false);
        }
      }

      const voiceLangCode = lang === 'te' ? 'te-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';

      const result = await submitFarmerReport({
        animalType,
        totalAnimals,
        sickCount,
        deadCount,
        symptoms: selectedSymptoms,
        photoUrl: finalImageUrl,
        imageUrl: finalImageUrl,
        imageFilename: finalFilename,
        voiceTranscript,
        voiceLanguage: voiceLangCode,
        reportedLanguage: lang,
        coordinates: coords,
        village
      });

      setSubmittedCase(result);
    } catch (err: any) {
      console.error('Submission error:', err);
      showToast('error', err.message || 'Failed to submit case report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForAnotherReport = () => {
    setSubmittedCase(null);
    setSickCount(1);
    setDeadCount(0);
    setPhotoUrl('');
    setPhotoFileName('');
    setSelectedFile(null);
    setCapturedSnapshot(null);
    setVoiceTranscript('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {t('reportSickAnimal')}
              </h3>
              <p className="text-[11px] text-slate-400">
                {t('brandTitle')} • Integrated Multi-Modal (Voice + Image + Form) Submission
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        {submittedCase ? (
          /* Post-Submission AI Feedback */
          <div className="p-6 space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-white">Report Successfully Submitted & Analyzed</h4>
                  <span className="text-[11px] text-emerald-400 font-mono">Case ID: {submittedCase.id}</span>
                </div>
              </div>
              <p className="text-xs text-slate-300">
                AI decision-support analysis has evaluated the reported symptoms, image, and spatial clustering.
              </p>
            </div>

            {/* AI Decision Support Badge */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">AI Decision Support</span>
                </div>
                <span className={`text-xs font-black px-2.5 py-0.5 rounded-full uppercase ${
                  submittedCase.riskLevel === 'HIGH'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                }`}>
                  {submittedCase.riskLevel === 'HIGH' ? t('highRisk') : t('mediumRisk')} (Score: {submittedCase.riskScore}/100)
                </span>
              </div>

              <div className="text-xs space-y-1">
                <span className="font-semibold text-slate-400 block text-[11px]">Key Contributing Risk Indicators:</span>
                {submittedCase.aiReasons?.map((reason, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-slate-300">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{reason}</span>
                  </div>
                ))}
              </div>

              <div className="text-xs bg-slate-900 p-2.5 rounded-xl border border-slate-800 mt-2">
                <span className="font-semibold text-slate-300 block mb-0.5 text-[11px]">Recommended Clinical Action:</span>
                <p className="text-slate-200">{submittedCase.recommendedAction}</p>
              </div>

              <p className="text-[10px] text-slate-500 italic pt-1">
                * Note: AI outputs are provided for decision support. Final diagnosis requires clinical verification by Veterinary Officer and Laboratory Testing.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleResetForAnotherReport}
                className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700"
              >
                <PlusCircle className="w-4 h-4" /> {t('reportAnotherCase')}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs"
              >
                Done & View on Dashboard
              </button>
            </div>
          </div>
        ) : (
          /* Submission Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* 1. Animal Species & Counts */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('species')}</label>
                <select
                  value={animalType}
                  onChange={(e) => setAnimalType(e.target.value as AnimalType)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
                >
                  <option value="Cattle">Cattle (ఆవు / गाय)</option>
                  <option value="Buffalo">Buffalo (గేదె / भैंस)</option>
                  <option value="Sheep">Sheep (గొర్రె / भेड़)</option>
                  <option value="Goat">Goat (మేక / बकरी)</option>
                  <option value="Poultry">Poultry (కోడి / मुर्गी)</option>
                  <option value="Pig">Pig (పంది / सुअर)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('totalHerd')}</label>
                <input
                  type="number"
                  min="1"
                  value={totalAnimals}
                  onChange={(e) => setTotalAnimals(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-rose-400 mb-1">{t('sickCount')}</label>
                <input
                  type="number"
                  min="0"
                  value={sickCount}
                  onChange={(e) => setSickCount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-rose-400 mb-1">{t('deadCount')}</label>
                <input
                  type="number"
                  min="0"
                  value={deadCount}
                  onChange={(e) => setDeadCount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
                />
              </div>
            </div>

            {/* 2. Observed Symptoms Checklist */}
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
                      className={`text-[11px] px-3 py-1.5 rounded-full border transition-all ${
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

            {/* 3. MULTILINGUAL VOICE-BASED REPORTING */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">{t('voiceMemo')}</span>
                    <span className="text-[10px] text-slate-400">
                      Language: <b className="text-emerald-400">{lang === 'te' ? 'తెలుగు (te-IN)' : lang === 'hi' ? 'हिन्दी (hi-IN)' : 'English (en-IN)'}</b>
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleVoiceRecordToggle}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
                    isRecording
                      ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                      : 'bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40'
                  }`}
                >
                  {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  <span>{isRecording ? t('listening') : t('recordVoice')}</span>
                </button>
              </div>

              {/* Recording Animation */}
              {isRecording && (
                <div className="bg-rose-950/30 border border-rose-800/40 p-2.5 rounded-xl flex items-center justify-between">
                  <span className="text-xs text-rose-300 font-medium animate-pulse flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    {recordingStatus || t('listening')}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="w-1 h-3 bg-rose-500 animate-bounce"></span>
                    <span className="w-1 h-5 bg-rose-500 animate-bounce delay-75"></span>
                    <span className="w-1 h-7 bg-rose-500 animate-bounce delay-150"></span>
                    <span className="w-1 h-4 bg-rose-500 animate-bounce delay-100"></span>
                    <span className="w-1 h-2 bg-rose-500 animate-bounce"></span>
                  </div>
                </div>
              )}

              {/* Recognized Speech Transcript (Editable) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-slate-400">
                    {t('autoTranscript')}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditingTranscript(!isEditingTranscript)}
                    className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    {isEditingTranscript ? t('useTranscript') : t('editTranscript')}
                  </button>
                </div>

                {isEditingTranscript ? (
                  <textarea
                    rows={2}
                    value={voiceTranscript}
                    onChange={(e) => setVoiceTranscript(e.target.value)}
                    className="w-full bg-slate-900 border border-cyan-500/50 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                    placeholder="Type or edit animal symptom description..."
                  />
                ) : (
                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 text-xs text-slate-300 italic">
                    "{voiceTranscript || 'No voice transcript recorded yet. Speak in Telugu or English.'}"
                  </div>
                )}
              </div>
            </div>

            {/* 4. DUAL-METHOD LESION PHOTO (UPLOAD FILE + LIVE CAMERA) */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">{t('cameraUpload')}</span>
                    <span className="text-[10px] text-slate-400">Oral Vesicles / Hooves / Skin Nodules (JPG, PNG, WebP max 5MB)</span>
                  </div>
                </div>

                {/* Explicit Two Options */}
                <div className="flex items-center gap-2">
                  {/* Option A: Upload from Device */}
                  <label className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold px-3 py-1.5 rounded-xl text-xs cursor-pointer flex items-center gap-1.5 transition-all">
                    <UploadCloud className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{t('uploadFromDevice')}</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>

                  {/* Option B: Take Photo with Camera */}
                  {!isCameraActive ? (
                    <button
                      type="button"
                      onClick={startCamera}
                      className="bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/40 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{t('takePhoto')}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="text-rose-400 hover:text-rose-300 text-xs font-semibold px-2 py-1"
                    >
                      {t('closeCamera')}
                    </button>
                  )}
                </div>
              </div>

              {imageUploadError && (
                <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{imageUploadError}</span>
                </div>
              )}

              {cameraError && (
                <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{cameraError}</span>
                </div>
              )}

              {/* Active Camera Viewfinder */}
              {isCameraActive && (
                <div className="space-y-2">
                  <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-black aspect-video max-h-56 flex items-center justify-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-36 h-36 border-2 border-dashed border-emerald-400/80 rounded-2xl animate-pulse flex items-center justify-center">
                        <span className="text-[10px] text-emerald-300 bg-black/60 px-2 py-0.5 rounded">Center Lesion</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-2 shadow"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{t('captureSnapshot')}</span>
                  </button>
                </div>
              )}

              {/* Captured Snapshot Review */}
              {capturedSnapshot && (
                <div className="p-3 bg-slate-900 rounded-2xl border border-emerald-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Snapshot Captured
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={retakeCameraPhoto}
                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-lg"
                      >
                        <RotateCcw className="w-3 h-3" /> {t('retakePhoto')}
                      </button>
                      <button
                        type="button"
                        onClick={confirmCapturedPhoto}
                        className="text-xs text-white bg-emerald-600 hover:bg-emerald-500 font-bold px-3 py-1 rounded-lg flex items-center gap-1 shadow"
                      >
                        <Check className="w-3 h-3" /> {t('confirmPhoto')}
                      </button>
                    </div>
                  </div>
                  <img src={capturedSnapshot} alt="Preview" className="w-full h-40 object-cover rounded-xl border border-slate-800" />
                </div>
              )}

              {/* Confirmed Photo Preview */}
              {!isCameraActive && !capturedSnapshot && photoUrl && (
                <div className="flex items-center justify-between p-3 bg-slate-900 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-3 truncate">
                    <img
                      src={photoUrl}
                      alt="Lesion"
                      className="w-14 h-14 rounded-xl object-cover border border-slate-700 shrink-0"
                    />
                    <div className="truncate">
                      <span className="text-xs font-bold text-white block truncate">{photoFileName || 'lesion_photo.jpg'}</span>
                      <span className="text-[10px] text-emerald-400 block font-medium">✓ Ready for AI Analysis</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="text-rose-400 hover:text-rose-300 p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800"
                    title={t('removePhoto')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* 5. GPS Coordinates */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-300 block">{t('gpsVerified')}</span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {coords.lat.toFixed(4)}° N, {coords.lng.toFixed(4)}° E ({village})
                </span>
              </div>

              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={isLocating}
                className="bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1.5"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>{isLocating ? 'Locating...' : 'Auto-Detect GPS'}</span>
              </button>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${
                  isSubmitting
                    ? 'opacity-70 cursor-not-allowed bg-slate-700 text-slate-300'
                    : state.isOffline
                      ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> {t('submittingReport')}
                  </>
                ) : state.isOffline ? (
                  <>
                    <WifiOff className="w-4 h-4" /> {t('saveOffline')}
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" /> {t('submitReport')}
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
