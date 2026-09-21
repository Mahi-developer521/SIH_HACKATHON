import React, { useState, useRef, useEffect } from 'react';
import { useSurveillanceStore } from '../../store/surveillanceStore';
import { AnimalType, CaseReport } from '../../types/surveillance';
import { CANONICAL_SYMPTOMS } from '../../data/mockData';
import { I18nService } from '../../services/i18nService';
import { ApiService } from '../../services/apiService';
import { VoiceAlertButton } from '../common/VoiceAlertButton';
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
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Info,
  Layers,
  MapPin
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

  // 7 Wizard Steps: 1 = Animal, 2 = Symptoms, 3 = Mortality, 4 = Evidence, 5 = Location, 6 = Review, 7 = Submit/AI Result
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Step 1: Animal & Herd
  const [animalType, setAnimalType] = useState<AnimalType>('Cattle');
  const [totalAnimals, setTotalAnimals] = useState<number>(12);
  const [sickCount, setSickCount] = useState<number>(2);

  // Step 2: Symptoms
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(
    initialSymptoms && initialSymptoms.length > 0
      ? initialSymptoms
      : ['High Fever', 'Blisters / Vesicles on Tongue & Muzzle', 'Excessive Drooling / Salivation']
  );
  const [customSymptom, setCustomSymptom] = useState<string>('');

  // Step 3: Mortality & Spread
  const [deadCount, setDeadCount] = useState<number>(0);
  const [onsetTime, setOnsetTime] = useState<'today' | '1-2days' | '3-5days' | '>5days'>('1-2days');
  const [spreadVelocity, setSpreadVelocity] = useState<'isolated' | 'moderate' | 'rapid'>('moderate');

  // Step 4: Evidence (Photo + Camera + Voice)
  const [photoUrl, setPhotoUrl] = useState<string>(
    initialPhotoUrl || 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&q=80&w=600'
  );
  const [photoFileName, setPhotoFileName] = useState<string>(initialPhotoFileName || 'oral_lesion_sample.jpg');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  // Camera
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedSnapshot, setCapturedSnapshot] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Voice
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

  // Step 5: Location & GPS
  const [coords, setCoords] = useState({ lat: 18.5362, lng: 73.8741 });
  const [village, setVillage] = useState('Village A (Rampur)');
  const [isLocating, setIsLocating] = useState(false);

  // Step 6: Confirmation check
  const [declarationConfirmed, setDeclarationConfirmed] = useState(true);

  // Step 7: Submission Result
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedCase, setSubmittedCase] = useState<CaseReport | null>(null);

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

  // --- Step Validation ---
  const validateAndProceed = () => {
    setValidationError(null);

    if (currentStep === 1) {
      if (totalAnimals < 1) {
        setValidationError('Total herd count must be at least 1 animal.');
        return;
      }
      if (sickCount < 1) {
        setValidationError('Number of sick animals must be at least 1.');
        return;
      }
      if (sickCount > totalAnimals) {
        setValidationError('Sick count cannot exceed the total herd size.');
        return;
      }
    }

    if (currentStep === 2) {
      if (selectedSymptoms.length === 0) {
        setValidationError('Please select at least 1 observed symptom.');
        return;
      }
    }

    if (currentStep === 3) {
      if (deadCount < 0) {
        setValidationError('Dead animals count cannot be negative.');
        return;
      }
      if (deadCount > totalAnimals) {
        setValidationError('Dead count cannot exceed total herd size.');
        return;
      }
    }

    if (currentStep === 5) {
      if (!village.trim()) {
        setValidationError('Please specify or confirm the village location.');
        return;
      }
    }

    if (currentStep === 6) {
      if (!declarationConfirmed) {
        setValidationError('Please check the confirmation declaration before submitting.');
        return;
      }
      handleSubmitReport();
      return;
    }

    setCurrentStep(prev => prev + 1);
  };

  const goBack = () => {
    setValidationError(null);
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const toggleSymptom = (sym: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym]
    );
  };

  const handleAddCustomSymptom = () => {
    if (customSymptom.trim() && !selectedSymptoms.includes(customSymptom.trim())) {
      setSelectedSymptoms(prev => [...prev, customSymptom.trim()]);
      setCustomSymptom('');
    }
  };

  // --- Voice Controls ---
  const startVoiceRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported by this browser. Please use text input.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = lang === 'te' ? 'te-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsRecording(true);
        setRecordingStatus(t('listening'));
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setVoiceTranscript(transcript);
        setIsRecording(false);
        setRecordingStatus('');
      };

      recognition.onerror = () => {
        setIsRecording(false);
        setRecordingStatus('');
      };

      recognition.onend = () => {
        setIsRecording(false);
        setRecordingStatus('');
      };

      recognition.start();
    } catch (err) {
      setIsRecording(false);
    }
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
    setRecordingStatus('');
  };

  // --- Camera Controls ---
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      setCameraError('Camera access not granted or unavailable on this device.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedSnapshot(dataUrl);
      stopCamera();
    }
  };

  const confirmCapturedSnapshot = () => {
    if (capturedSnapshot) {
      setPhotoUrl(capturedSnapshot);
      setPhotoFileName(`camera_snapshot_${Date.now()}.jpg`);
      setCapturedSnapshot(null);
      showToast('success', 'Camera snapshot confirmed and attached to report.');
    }
  };

  // --- File Upload ---
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setImageUploadError('File size exceeds 5MB limit.');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setImageUploadError('Only JPEG, PNG, and WebP images are supported.');
      return;
    }

    setImageUploadError(null);
    setSelectedFile(file);
    setIsUploadingImage(true);

    try {
      const uploadRes = await ApiService.uploadImage(file);
      if (uploadRes && uploadRes.imageUrl) {
        setPhotoUrl(uploadRes.imageUrl);
        setPhotoFileName(uploadRes.filename || file.name);
        showToast('success', 'Image uploaded successfully to server.');
      } else {
        const previewUrl = URL.createObjectURL(file);
        setPhotoUrl(previewUrl);
        setPhotoFileName(file.name);
      }
    } catch (err: any) {
      const previewUrl = URL.createObjectURL(file);
      setPhotoUrl(previewUrl);
      setPhotoFileName(file.name);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // --- Auto-GPS ---
  const handleAutoLocate = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: Number(pos.coords.latitude.toFixed(4)),
          lng: Number(pos.coords.longitude.toFixed(4))
        });
        setIsLocating(false);
        showToast('success', 'GPS coordinates acquired from mobile device.');
      },
      () => {
        setIsLocating(false);
        showToast('warning', 'Unable to retrieve exact GPS location. Defaulting to village center.');
      },
      { timeout: 8000 }
    );
  };

  // --- Final Submit Action ---
  const handleSubmitReport = async () => {
    setIsSubmitting(true);
    try {
      const result = await submitFarmerReport({
        animalType,
        totalAnimals,
        sickCount,
        deadCount,
        symptoms: selectedSymptoms,
        photoUrl,
        imageUrl: photoUrl,
        imageFilename: photoFileName,
        voiceTranscript,
        voiceLanguage: lang === 'te' ? 'te-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN',
        reportedLanguage: lang,
        coordinates: coords,
        village
      });

      setSubmittedCase(result);
      setCurrentStep(7); // Show AI Assessment result step
    } catch (err: any) {
      showToast('error', 'Report submission failed. Please check network or try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepTitles = [
    t('step1') || 'Animal & Herd',
    t('step2') || 'Clinical Symptoms',
    t('step3') || 'Mortality & Spread',
    t('step4') || 'Evidence Capture',
    t('step5') || 'Location & GPS',
    t('step6') || 'Review & Declare',
    t('step7') || 'AI Assessment'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl shadow-xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Header Ribbon */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold">
              📋
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  {t('reportSickAnimal')}
                </h3>
                <span className="bg-blue-50 text-blue-700 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border border-blue-200">
                  Step {currentStep} of 7
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {stepTitles[currentStep - 1]}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 7-Step Progress Stepper Indicator */}
        <div className="px-6 pt-3 pb-2 bg-slate-50/70 border-b border-slate-200">
          <div className="flex items-center justify-between mb-1.5 text-[11px] font-semibold text-slate-500">
            <span>Progress: {Math.round((currentStep / 7) * 100)}%</span>
            <span className="text-blue-600 font-bold">{stepTitles[currentStep - 1]}</span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${(currentStep / 7) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Body (Step-specific content) */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {validationError && (
            <div className="bg-rose-50 border border-rose-300 rounded-xl p-3 text-xs text-rose-800 flex items-center gap-2 animate-in shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* STEP 1: Animal & Herd Information */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <label className="gov-label">1. Select Animal Species</label>
                <div className="grid grid-cols-3 gap-2.5">
                  {(['Cattle', 'Buffalo', 'Sheep', 'Goat', 'Poultry', 'Pig'] as AnimalType[]).map((species) => {
                    const icons: Record<string, string> = {
                      Cattle: '🐄', Buffalo: '🐃', Sheep: '🐑', Goat: '🐐', Poultry: '🐔', Pig: '🐖'
                    };
                    const isSelected = animalType === species;
                    return (
                      <button
                        key={species}
                        type="button"
                        onClick={() => setAnimalType(species)}
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          isSelected
                            ? 'bg-blue-50 border-blue-300 text-blue-900 ring-1 ring-blue-600 shadow-sm'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-2xl block mb-1">{icons[species]}</span>
                        <span className="text-xs font-bold">{species}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <label className="gov-label">Total Herd Size</label>
                  <p className="text-[11px] text-slate-500">Total count of this species owned</p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTotalAnimals(Math.max(1, totalAnimals - 1))}
                      className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-lg hover:bg-slate-100 shadow-sm"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={totalAnimals}
                      onChange={(e) => setTotalAnimals(parseInt(e.target.value) || 1)}
                      className="gov-input text-center font-bold text-base"
                    />
                    <button
                      type="button"
                      onClick={() => setTotalAnimals(totalAnimals + 1)}
                      className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-lg hover:bg-slate-100 shadow-sm"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <label className="gov-label">Number of Sick Animals</label>
                  <p className="text-[11px] text-slate-500">Showing symptoms currently</p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSickCount(Math.max(1, sickCount - 1))}
                      className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-lg hover:bg-slate-100 shadow-sm"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={totalAnimals}
                      value={sickCount}
                      onChange={(e) => setSickCount(parseInt(e.target.value) || 1)}
                      className="gov-input text-center font-bold text-base text-amber-700"
                    />
                    <button
                      type="button"
                      onClick={() => setSickCount(Math.min(totalAnimals, sickCount + 1))}
                      className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 font-bold text-lg hover:bg-slate-200 border border-slate-200"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Clinical Symptoms */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <label className="gov-label">2. Observed Clinical Symptoms</label>
                <p className="text-xs text-slate-500 mb-3">
                  Select all abnormal signs noticed in the affected livestock:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CANONICAL_SYMPTOMS.map((sym) => {
                    const isSelected = selectedSymptoms.includes(sym);
                    return (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => toggleSymptom(sym)}
                        className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'bg-blue-50 border-blue-500 text-blue-900 font-semibold'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300'
                        }`}
                      >
                        <span>{sym}</span>
                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Add Custom Symptom */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <label className="text-xs font-bold text-slate-700">Other Specific Symptom (Optional)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customSymptom}
                    onChange={(e) => setCustomSymptom(e.target.value)}
                    placeholder="e.g. Swollen joints, shivering, blood in milk"
                    className="gov-input"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSymptom}
                    className="gov-btn-secondary shrink-0"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Morbidity & Mortality Information */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <label className="gov-label">Number of Dead Animals (If Any)</label>
                <p className="text-xs text-slate-500">Mortality is a primary indicator for emergency veterinary dispatch</p>
                <div className="flex items-center gap-2 max-w-xs">
                  <button
                    type="button"
                    onClick={() => setDeadCount(Math.max(0, deadCount - 1))}
                    className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 font-bold text-lg hover:bg-slate-200 border border-slate-200"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={0}
                    max={totalAnimals}
                    value={deadCount}
                    onChange={(e) => setDeadCount(parseInt(e.target.value) || 0)}
                    className="gov-input text-center font-bold text-base text-rose-700"
                  />
                  <button
                    type="button"
                    onClick={() => setDeadCount(deadCount + 1)}
                    className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 font-bold text-lg hover:bg-slate-200 border border-slate-200"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <label className="gov-label">When Did Symptoms Start?</label>
                  <select 
                    value={onsetTime} 
                    onChange={(e: any) => setOnsetTime(e.target.value)}
                    className="gov-select"
                  >
                    <option value="today">Today (Within 24 hours)</option>
                    <option value="1-2days">1 to 2 days ago</option>
                    <option value="3-5days">3 to 5 days ago</option>
                    <option value=">5days">More than 5 days ago</option>
                  </select>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <label className="gov-label">Spread Rate in Pen / Shed</label>
                  <select 
                    value={spreadVelocity} 
                    onChange={(e: any) => setSpreadVelocity(e.target.value)}
                    className="gov-select"
                  >
                    <option value="isolated">Single animal affected</option>
                    <option value="moderate">Spreading to adjacent stalls</option>
                    <option value="rapid">Rapid transmission across whole herd</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Photographic, Camera & Voice Evidence */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <label className="gov-label">4. Clinical Media & Spoken Evidence</label>

              {/* Photo Options: Method A File Picker + Method B Live Camera */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-700 block">Lesion Photograph (Mouth, Hoof, or Skin)</span>
                
                {imageUploadError && (
                  <p className="text-xs text-rose-600 font-semibold">{imageUploadError}</p>
                )}

                {/* Live Camera Viewfinder */}
                {isCameraActive && (
                  <div className="space-y-2 bg-slate-900 rounded-xl p-2 border border-slate-300">
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center">
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                      {/* Reticle Overlay */}
                      <div className="absolute inset-0 border-2 border-dashed border-blue-400/80 rounded m-6 pointer-events-none flex items-center justify-center">
                        <span className="text-[10px] text-white font-mono bg-black/70 px-2 py-0.5 rounded">
                          Target Lesion
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={captureSnapshot}
                        className="gov-btn-primary flex-1"
                      >
                        <Camera className="w-4 h-4" /> Capture Snapshot
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="gov-btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Captured Snapshot Review */}
                {capturedSnapshot && (
                  <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-xs text-blue-700 font-bold block">Snapshot Captured:</span>
                    <img src={capturedSnapshot} alt="Snapshot" className="h-36 rounded-lg object-cover mx-auto border border-slate-200" />
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={confirmCapturedSnapshot}
                        className="gov-btn-primary flex-1"
                      >
                        <Check className="w-4 h-4" /> Confirm & Attach
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCapturedSnapshot(null);
                          startCamera();
                        }}
                        className="gov-btn-secondary"
                      >
                        <RotateCcw className="w-4 h-4" /> Retake
                      </button>
                    </div>
                  </div>
                )}

                {/* Attached Photo Preview */}
                {!isCameraActive && !capturedSnapshot && photoUrl && (
                  <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200">
                    <img src={photoUrl} alt="Attached Lesion" className="w-14 h-14 rounded-lg object-cover border border-slate-200 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-slate-800 block truncate">{photoFileName}</span>
                      <span className="text-[11px] text-blue-700 font-semibold">✓ Attached for Veterinary Inspection</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoUrl('');
                        setPhotoFileName('');
                      }}
                      className="text-slate-400 hover:text-rose-600 p-1.5"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Action Buttons for Media */}
                {!isCameraActive && !capturedSnapshot && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="gov-btn-secondary text-xs flex-1"
                    >
                      {isUploadingImage ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                      <span>{t('uploadFromDevice')} (5MB)</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileSelect}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={startCamera}
                      className="gov-btn-secondary text-xs flex-1"
                    >
                      <Camera className="w-3.5 h-3.5 text-blue-600" />
                      <span>{t('openCamera')}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Method C: Multilingual Voice Recording */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-700 block">Voice Description (Speech-to-Text)</span>
                    <span className="text-[11px] text-slate-500">Speak in {lang === 'te' ? 'Telugu (తెలుగు)' : lang === 'hi' ? 'Hindi (हिंदी)' : 'English'}</span>
                  </div>

                  <button
                    type="button"
                    onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                      isRecording 
                        ? 'bg-rose-600 text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    <span>{isRecording ? 'Stop Recording' : 'Start Voice'}</span>
                  </button>
                </div>

                {isRecording && (
                  <p className="text-xs text-amber-700 font-semibold">{recordingStatus}</p>
                )}

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-600">
                    <span>Voice Transcript:</span>
                    <button
                      type="button"
                      onClick={() => setIsEditingTranscript(!isEditingTranscript)}
                      className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Edit3 className="w-3 h-3" /> {isEditingTranscript ? 'Done Editing' : 'Edit Text'}
                    </button>
                  </div>

                  {isEditingTranscript ? (
                    <textarea
                      rows={3}
                      value={voiceTranscript}
                      onChange={(e) => setVoiceTranscript(e.target.value)}
                      className="gov-textarea"
                    />
                  ) : (
                    <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed italic">
                      "{voiceTranscript || 'No voice transcript recorded yet.'}"
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Location & GPS Coordinates */}
          {currentStep === 5 && (
            <div className="space-y-4 animate-in fade-in">
              <label className="gov-label">5. Farm Location & GPS Coordinates</label>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Village & Mandal</label>
                  <select
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    className="gov-select"
                  >
                    <option value="Village A (Rampur)">Village A (Rampur) - Focus Outbreak Belt</option>
                    <option value="Village B (Kalyanpur)">Village B (Kalyanpur) - Vaccination Buffer Zone</option>
                    <option value="Village C (Shivpuri)">Village C (Shivpuri) - Surrounding Periphery</option>
                  </select>
                </div>

                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">GPS Geo-Coordinates</span>
                    <button
                      type="button"
                      onClick={handleAutoLocate}
                      disabled={isLocating}
                      className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
                    >
                      {isLocating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
                      <span>Auto-Detect GPS</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                      <span className="text-[10px] text-slate-500 block uppercase font-medium">Latitude</span>
                      <span className="font-mono font-bold text-slate-900">{coords.lat}° N</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                      <span className="text-[10px] text-slate-500 block uppercase font-medium">Longitude</span>
                      <span className="font-mono font-bold text-slate-900">{coords.lng}° E</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Review Information & Declaration */}
          {currentStep === 6 && (
            <div className="space-y-4 animate-in fade-in">
              <label className="gov-label">6. Review Dossier Before AI Submission</label>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-medium">Species & Herd</span>
                    <span className="font-bold text-slate-900">{animalType} ({totalAnimals} total)</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-medium">Morbidity / Mortality</span>
                    <span className="font-bold text-amber-700">{sickCount} Sick, {deadCount} Dead</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 uppercase block mb-1 font-medium">Symptoms Checklist</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedSymptoms.map(s => (
                      <span key={s} className="bg-white border border-slate-200 text-slate-800 text-[11px] px-2.5 py-1 rounded font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-3">
                  <span className="text-[10px] text-slate-500 uppercase block mb-0.5 font-medium">Location & Voice Evidence</span>
                  <p className="text-slate-800 font-medium">📍 {village} ({coords.lat}° N, {coords.lng}° E)</p>
                  <p className="text-slate-600 italic text-[11px] mt-1">"{voiceTranscript}"</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-2xl flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="declaration"
                  checked={declarationConfirmed}
                  onChange={(e) => setDeclarationConfirmed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="declaration" className="text-xs text-slate-700 leading-snug cursor-pointer font-medium">
                  I certify that these clinical symptoms and animal counts were observed directly on my premises, and I consent to emergency veterinary field inspection.
                </label>
              </div>
            </div>
          )}

          {/* STEP 7: Submission Outcome & AI Decision-Support */}
          {currentStep === 7 && submittedCase && (
            <div className="space-y-5 animate-in zoom-in-95">
              <div className="text-center space-y-2 py-2">
                <div className="w-14 h-14 rounded-full bg-blue-50 border-2 border-blue-600 flex items-center justify-center text-2xl mx-auto text-blue-600 shadow-sm">
                  ✓
                </div>
                <h4 className="text-lg font-bold text-slate-900">
                  Report Registered: {submittedCase.id}
                </h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Your incident has been securely transmitted to the National Livestock Disease Surveillance Engine.
                </p>
              </div>

              {/* AI Risk Stratification Card */}
              <div className={`p-4 rounded-2xl border space-y-3 ${
                submittedCase.riskLevel === 'HIGH'
                  ? 'bg-rose-50 border-rose-200 shadow-sm'
                  : 'bg-emerald-50 border-emerald-200 shadow-sm'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full border ${
                    submittedCase.riskLevel === 'HIGH'
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  }`}>
                    {submittedCase.riskLevel === 'HIGH' ? '🔴 HIGH RISK' : '🟢 LOW RISK'} • Score {submittedCase.riskScore}/100
                  </span>

                  {/* Spoken Telugu Voice Alert for this outcome */}
                  <VoiceAlertButton
                    textTe={`నివేదిక సమర్పించబడింది. AI ప్రమాద స్కోరు 100 కి ${submittedCase.riskScore} గా లెక్కించబడింది. సిఫార్సు చేయబడిన చర్య: ${submittedCase.recommendedAction}. పశువైద్య అధికారి సమీక్ష కోసం సమాచారం పంపబడింది.`}
                    textEn={`Report registered. AI risk score is ${submittedCase.riskScore} out of 100. Recommended action: ${submittedCase.recommendedAction}. Information has been dispatched for veterinary review.`}
                    size="sm"
                    variant={submittedCase.riskLevel === 'HIGH' ? 'danger' : 'emerald'}
                  />
                </div>

                <div className="text-xs text-slate-800 space-y-1 pt-1">
                  <p><b>Recommended Action:</b> <span className="text-blue-700 font-semibold">{submittedCase.recommendedAction}</span></p>
                  <p className="text-slate-600"><b>Primary Symptoms:</b> {submittedCase.symptoms.join(', ')}</p>
                </div>

                <div className="pt-2 border-t border-slate-200 space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">Algorithmic Factors:</span>
                  {submittedCase.aiReasons.map((r, idx) => (
                    <div key={idx} className="text-xs text-slate-700 flex items-start gap-1.5">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>

                {/* Important Decision-Support Notice */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600 leading-relaxed flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    <b>Decision-Support Notice:</b> This AI assessment is for early warning and rapid prioritization. Final clinical diagnosis is confirmed by the attending Veterinary Officer and accredited diagnostic laboratory testing.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          {currentStep < 7 ? (
            <>
              <button
                type="button"
                onClick={goBack}
                disabled={currentStep === 1}
                className="gov-btn-secondary text-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> {t('prevStep') || 'Back'}
              </button>

              <button
                type="button"
                onClick={validateAndProceed}
                disabled={isSubmitting}
                className="gov-btn-primary text-xs"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : currentStep === 6 ? (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Submit Report</span>
                  </>
                ) : (
                  <>
                    <span>{t('nextStep') || 'Continue'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </>
          ) : (
            <div className="w-full flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setCurrentStep(1);
                  setSubmittedCase(null);
                }}
                className="gov-btn-secondary text-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Report Another Animal
              </button>

              <button
                type="button"
                onClick={onClose}
                className="gov-btn-primary text-xs"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
