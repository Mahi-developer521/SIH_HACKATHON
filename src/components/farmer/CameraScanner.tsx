import React, { useState, useRef, useEffect } from 'react';
import { useSurveillanceStore } from '../../store/surveillanceStore';
import { I18nService } from '../../services/i18nService';
import { 
  Camera, 
  UploadCloud, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  X, 
  Maximize2, 
  ArrowRight,
  ShieldAlert,
  SwitchCamera
} from 'lucide-react';

interface Props {
  onSelectPhotoForReport: (photoUrl: string, fileName: string, detectedSymptoms: string[]) => void;
  onClose?: () => void;
  isModal?: boolean;
}

interface ClinicalPreset {
  id: string;
  name: string;
  url: string;
  pathogen: string;
  confidence: number;
  symptoms: string[];
  findings: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
}

const PRESETS: ClinicalPreset[] = [
  {
    id: 'preset-fmd-mouth',
    name: 'Oral Vesicles & Blisters (FMD Suspect)',
    url: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&q=80&w=600',
    pathogen: 'Foot and Mouth Disease Virus (FMDV Serotype O)',
    confidence: 94,
    symptoms: ['Blisters / Vesicles on Tongue & Muzzle', 'Excessive Drooling / Salivation', 'High Fever'],
    findings: 'Erosive stomatitis with denuded tongue epithelium and profuse ropy salivation.',
    severity: 'HIGH'
  },
  {
    id: 'preset-fmd-hoof',
    name: 'Coronary Band Ulceration (Hoof Lesions)',
    url: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&q=80&w=600',
    pathogen: 'FMD / Interdigital Pododermatitis',
    confidence: 89,
    symptoms: ['Blisters on Hooves / Coronary Band', 'Severe Lameness / Inability to Stand'],
    findings: 'Interdigital cleft ulceration with coronary swelling and reluctance to bear weight.',
    severity: 'HIGH'
  },
  {
    id: 'preset-lsd-skin',
    name: 'Cutaneous Nodules (Lumpy Skin Suspect)',
    url: 'https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?auto=format&fit=crop&q=80&w=600',
    pathogen: 'Lumpy Skin Disease Virus (Capripoxvirus)',
    confidence: 91,
    symptoms: ['Skin Nodules / Lumps (Lumpy Skin Pattern)', 'High Fever', 'Reduced Milk Yield'],
    findings: 'Circumscribed 2-5cm round cutaneous nodules with necrotic centers across dermis.',
    severity: 'HIGH'
  },
  {
    id: 'preset-normal',
    name: 'Healthy Cattle Mucosa (Normal Baseline)',
    url: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&q=80&w=600',
    pathogen: 'No Pathogen Detected',
    confidence: 98,
    symptoms: [],
    findings: 'Moist muzzle, intact pink oral mucosa, clear ocular and nasal passages.',
    severity: 'LOW'
  }
];

export const CameraScanner: React.FC<Props> = ({ onSelectPhotoForReport, onClose, isModal = false }) => {
  const { state } = useSurveillanceStore();
  const lang = state.language;
  const t = (k: any) => I18nService.get(lang, k);

  const [activeMode, setActiveMode] = useState<'camera' | 'upload' | 'preset'>('camera');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  // Captured Image & AI Analysis
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string>(PRESETS[0].url);
  const [currentFileName, setCurrentFileName] = useState<string>('mouth_blisters_fmd.jpg');
  const [analysis, setAnalysis] = useState<ClinicalPreset>(PRESETS[0]);
  const [isScanning, setIsScanning] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Start Camera Stream
  const startCamera = async (faceMode: 'environment' | 'user' = facingMode) => {
    setCameraError(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported in this browser environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: faceMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      setCameraError(
        err.message || 'Camera permission denied or camera device unavailable. You can upload an image or select a clinical preset below.'
      );
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    if (isCameraActive) {
      startCamera(nextMode);
    }
  };

  useEffect(() => {
    // Auto-attempt camera start when in camera tab
    if (activeMode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [activeMode]);

  // Capture Frame from Video
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
        const fileName = `camera_capture_${Date.now()}.jpg`;

        setCurrentPhotoUrl(dataUrl);
        setCurrentFileName(fileName);
        stopCamera();
        runAiScreening(dataUrl, fileName);
      }
    }
  };

  // Handle Local File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileName = file.name;
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          const dataUrl = uploadEvent.target.result as string;
          setCurrentPhotoUrl(dataUrl);
          setCurrentFileName(fileName);
          runAiScreening(dataUrl, fileName);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Run AI Lesion Screening Simulation
  const runAiScreening = (url: string, filename: string) => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      // Determine simulated AI prediction based on filename or random matching
      const lower = filename.toLowerCase();
      let matched = PRESETS[0];
      if (lower.includes('hoof') || lower.includes('lameness') || lower.includes('leg')) {
        matched = PRESETS[1];
      } else if (lower.includes('lsd') || lower.includes('lump') || lower.includes('nodule') || lower.includes('skin')) {
        matched = PRESETS[2];
      } else if (lower.includes('normal') || lower.includes('healthy')) {
        matched = PRESETS[3];
      }
      setAnalysis(matched);
    }, 700);
  };

  const handleSelectPreset = (preset: ClinicalPreset) => {
    setCurrentPhotoUrl(preset.url);
    setCurrentFileName(`${preset.id}.jpg`);
    setAnalysis(preset);
  };

  const handleProceedToReport = () => {
    onSelectPhotoForReport(currentPhotoUrl, currentFileName, analysis.symptoms);
  };

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden ${isModal ? 'max-w-3xl w-full mx-auto' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">{t('cameraUpload')}</h3>
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                AI Vision 2.0
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Capture or upload animal lesions for instant visual epidemiological screening.
            </p>
          </div>
        </div>

        {onClose && (
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 max-w-md">
          <button
            onClick={() => setActiveMode('camera')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeMode === 'camera'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" /> {t('openCamera')}
          </button>

          <button
            onClick={() => {
              setActiveMode('upload');
              stopCamera();
              fileInputRef.current?.click();
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeMode === 'upload'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UploadCloud className="w-4 h-4" /> {t('uploadPhoto')}
          </button>

          <button
            onClick={() => {
              setActiveMode('preset');
              stopCamera();
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeMode === 'preset'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" /> Presets
          </button>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Viewport: Live Camera Feed OR Image Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left / Top: Camera Viewfinder or Photo Frame */}
          <div className="lg:col-span-7 bg-slate-950 rounded-2xl border border-slate-800 p-3 relative flex flex-col justify-between min-h-[320px] overflow-hidden">
            {activeMode === 'camera' && isCameraActive ? (
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                {/* Real Video Stream */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 object-cover rounded-xl border border-slate-800"
                />

                {/* AI HUD Scanner Reticle Overlay */}
                <div className="absolute inset-4 pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-dashed border-emerald-400/70 rounded-2xl animate-pulse flex flex-col items-center justify-between p-2">
                    <span className="text-[10px] font-bold text-emerald-400 bg-slate-950/80 px-2 py-0.5 rounded">
                      LESION SCANNING RETICLE
                    </span>
                    <span className="text-[9px] text-emerald-300 bg-slate-950/80 px-2 py-0.5 rounded">
                      CENTER LESION HERE
                    </span>
                  </div>
                </div>

                {/* Floating Viewfinder Controls */}
                <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-3">
                  <button
                    onClick={toggleFacingMode}
                    className="p-2.5 rounded-full bg-slate-900/80 text-white border border-slate-700 hover:bg-slate-800 shadow-lg"
                    title="Switch Camera (Front/Back)"
                  >
                    <SwitchCamera className="w-4 h-4" />
                  </button>

                  <button
                    onClick={capturePhoto}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-2.5 rounded-full shadow-xl shadow-emerald-500/40 flex items-center gap-2 text-xs transition-transform active:scale-95"
                  >
                    <Camera className="w-4 h-4" /> {t('takeSnapshot')}
                  </button>

                  <button
                    onClick={stopCamera}
                    className="p-2.5 rounded-full bg-slate-900/80 text-rose-400 border border-slate-700 hover:bg-slate-800 shadow-lg"
                    title="Stop Camera"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Photo Display Frame */
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                <div className="w-full h-64 rounded-xl overflow-hidden border border-slate-800 relative bg-slate-900 flex items-center justify-center">
                  <img
                    src={currentPhotoUrl}
                    alt="Current Lesion"
                    className="w-full h-full object-cover"
                  />

                  {/* AI Scanning Progress Wave */}
                  {isScanning && (
                    <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-[2px] flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mb-2"></div>
                      <span className="text-xs font-bold text-emerald-300">
                        Running AI Neural Lesion Classifier...
                      </span>
                    </div>
                  )}

                  {/* Top-Right Badge */}
                  <div className="absolute top-2.5 right-2.5">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-lg border ${
                      analysis.severity === 'HIGH'
                        ? 'bg-rose-600 text-white border-rose-500'
                        : 'bg-emerald-600 text-white border-emerald-500'
                    }`}>
                      {analysis.severity === 'HIGH' ? '⚠️ High Concern' : '✓ Normal'}
                    </span>
                  </div>
                </div>

                {/* Subtext info */}
                <div className="flex items-center justify-between w-full pt-2 text-[11px] text-slate-400">
                  <span className="truncate max-w-[200px]">{currentFileName}</span>
                  <button
                    onClick={() => {
                      setActiveMode('camera');
                      startCamera();
                    }}
                    className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <RefreshCw className="w-3 h-3" /> Retake Photo
                  </button>
                </div>
              </div>
            )}

            {/* Error or Fallback Warning */}
            {cameraError && activeMode === 'camera' && !isCameraActive && (
              <div className="bg-amber-950/50 border border-amber-600/50 p-3 rounded-xl text-xs text-amber-200 mt-2 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Camera Notice
                </div>
                <p className="text-[11px] text-amber-300">
                  {cameraError}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-3 py-1 rounded text-[11px]"
                  >
                    Upload Image File
                  </button>
                  <button
                    onClick={() => setActiveMode('preset')}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-3 py-1 rounded text-[11px]"
                  >
                    Use Clinical Preset
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right / Bottom: Instant AI Screening Dossier & Action */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> {t('aiVisualDiagnosis')}
                </span>
                <span className="text-xs font-bold text-emerald-400">
                  {analysis.confidence}% Confidence
                </span>
              </div>

              {/* Diagnosis Card */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div>
                  <span className="text-[11px] text-slate-400 block">Identified Condition:</span>
                  <h4 className="text-sm font-bold text-white leading-tight">
                    {analysis.pathogen}
                  </h4>
                </div>

                <div className="text-xs text-slate-300 space-y-1">
                  <span className="text-[11px] text-slate-400 block">Visual Examination Findings:</span>
                  <p className="text-slate-200 text-[11px] leading-relaxed bg-slate-900 p-2 rounded-lg border border-slate-800">
                    "{analysis.findings}"
                  </p>
                </div>

                {analysis.symptoms.length > 0 && (
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Correlated Clinical Signs:</span>
                    <div className="flex flex-wrap gap-1">
                      {analysis.symptoms.map((s, idx) => (
                        <span key={idx} className="bg-emerald-500/10 text-emerald-300 text-[10px] font-semibold px-2 py-0.5 rounded border border-emerald-500/30">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Clinical Preset Selector */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400 block">
                Clinical Pathology Reference Library:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPreset(p)}
                    className={`text-left p-2 rounded-xl text-[11px] border transition-all ${
                      currentPhotoUrl === p.url
                        ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500 font-bold'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <span className="block font-medium truncate">{p.name}</span>
                    <span className="text-[10px] text-slate-500 block truncate">{p.pathogen}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Main CTA: Report Case with this Photo */}
            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={handleProceedToReport}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-2xl text-xs sm:text-sm transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 group"
              >
                <span>{t('reportWithThisPhoto')}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
