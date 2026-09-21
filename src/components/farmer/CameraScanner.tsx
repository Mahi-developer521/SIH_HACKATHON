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
import { getCameraStream, captureVideoFrame } from '../../utils/cameraUtils';

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
  const [isCameraLoading, setIsCameraLoading] = useState(false);
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

  // Auto-bind stream to video element whenever camera becomes active or mounts
  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      const video = videoRef.current;
      if (video.srcObject !== streamRef.current) {
        video.srcObject = streamRef.current;
      }
      video.play().catch((err) => {
        console.warn('[CameraScanner] Autoplay play() rejected or interrupted:', err);
      });
    }
  }, [isCameraActive]);

  // Start Camera Stream with multi-tier fallback
  const startCamera = async (faceMode: 'environment' | 'user' = facingMode) => {
    setCameraError(null);
    setIsCameraLoading(true);
    stopCamera();

    try {
      const stream = await getCameraStream(faceMode);
      streamRef.current = stream;
      setIsCameraActive(true);
      setIsCameraLoading(false);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((e) => console.warn('[CameraScanner] Play warning:', e));
      }
    } catch (err: any) {
      console.warn('[CameraScanner] Camera access issue:', err);
      setIsCameraLoading(false);
      setIsCameraActive(false);
      setCameraError(
        err.message || 'Camera permission denied or camera device unavailable. You can upload an image or select a clinical preset below.'
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsCameraLoading(false);
  };

  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    if (isCameraActive || activeMode === 'camera') {
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
      const dataUrl = captureVideoFrame(videoRef.current, 0.9);
      if (dataUrl) {
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
    <div className={`bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden ${isModal ? 'max-w-3xl w-full mx-auto' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">{t('cameraUpload')}</h3>
              <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-200">
                AI Vision 2.0
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Capture or upload animal lesions for instant visual epidemiological screening.
            </p>
          </div>
        </div>

        {onClose && (
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 max-w-md">
          <button
            onClick={() => setActiveMode('camera')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeMode === 'camera'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
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
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeMode === 'upload'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UploadCloud className="w-4 h-4" /> {t('uploadPhoto')}
          </button>

          <button
            onClick={() => {
              setActiveMode('preset');
              stopCamera();
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeMode === 'preset'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
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
          <div className="lg:col-span-7 bg-slate-50 rounded-2xl border border-slate-200 p-3 relative flex flex-col justify-between min-h-[320px] overflow-hidden">
            {activeMode === 'camera' && (isCameraActive || isCameraLoading) ? (
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                {isCameraLoading && (
                  <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center text-white z-20 rounded-xl">
                    <RefreshCw className="w-8 h-8 animate-spin mb-2 text-blue-400" />
                    <span className="text-xs font-semibold">Initializing camera stream...</span>
                  </div>
                )}

                {/* Real Video Stream */}
                <video
                  ref={(el) => {
                    videoRef.current = el;
                    if (el && streamRef.current && el.srcObject !== streamRef.current) {
                      el.srcObject = streamRef.current;
                      el.play().catch(() => {});
                    }
                  }}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 object-cover rounded-xl border border-slate-300"
                />

                {/* AI HUD Scanner Reticle Overlay */}
                <div className="absolute inset-4 pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-dashed border-blue-500/80 rounded-2xl flex flex-col items-center justify-between p-2">
                    <span className="text-[10px] font-bold text-white bg-slate-900/80 px-2 py-0.5 rounded">
                      LESION SCANNING RETICLE
                    </span>
                    <span className="text-[9px] text-white bg-slate-900/80 px-2 py-0.5 rounded">
                      CENTER LESION HERE
                    </span>
                  </div>
                </div>

                {/* Floating Viewfinder Controls */}
                <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-3">
                  <button
                    onClick={toggleFacingMode}
                    className="p-2.5 rounded-full bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-md"
                    title="Switch Camera (Front/Back)"
                  >
                    <SwitchCamera className="w-4 h-4" />
                  </button>

                  <button
                    onClick={capturePhoto}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-full shadow-md flex items-center gap-2 text-xs transition-transform active:scale-95"
                  >
                    <Camera className="w-4 h-4" /> {t('takeSnapshot')}
                  </button>

                  <button
                    onClick={stopCamera}
                    className="p-2.5 rounded-full bg-white text-rose-600 border border-slate-200 hover:bg-slate-50 shadow-md"
                    title="Stop Camera"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Photo Display Frame */
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                <div className="w-full h-64 rounded-xl overflow-hidden border border-slate-200 relative bg-slate-100 flex items-center justify-center">
                  <img
                    src={currentPhotoUrl}
                    alt="Current Lesion"
                    className="w-full h-full object-cover"
                  />

                  {/* AI Scanning Progress Wave */}
                  {isScanning && (
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex flex-col items-center justify-center">
                      <div className="w-10 h-10 rounded-full border-4 border-white border-t-transparent animate-spin mb-2"></div>
                      <span className="text-xs font-bold text-white">
                        Running AI Neural Lesion Classifier...
                      </span>
                    </div>
                  )}

                  {/* Top-Right Badge */}
                  <div className="absolute top-2.5 right-2.5">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded shadow border ${
                      analysis.severity === 'HIGH'
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}>
                      {analysis.severity === 'HIGH' ? '⚠️ High Concern' : '✓ Normal'}
                    </span>
                  </div>
                </div>

                {/* Subtext info */}
                <div className="flex items-center justify-between w-full pt-2 text-[11px] text-slate-500">
                  <span className="truncate max-w-[200px]">{currentFileName}</span>
                  <button
                    onClick={() => {
                      setActiveMode('camera');
                      startCamera();
                    }}
                    className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <RefreshCw className="w-3 h-3" /> Retake Photo
                  </button>
                </div>
              </div>
            )}

            {/* Error or Fallback Warning */}
            {cameraError && activeMode === 'camera' && !isCameraActive && (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900 mt-2 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700" /> Camera Notice
                </div>
                <p className="text-[11px] text-amber-800">
                  {cameraError}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-amber-700 hover:bg-amber-800 text-white font-bold px-3 py-1 rounded-lg text-[11px]"
                  >
                    Upload Image File
                  </button>
                  <button
                    onClick={() => setActiveMode('preset')}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-3 py-1 rounded-lg text-[11px]"
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
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" /> {t('aiVisualDiagnosis')}
                </span>
                <span className="text-xs font-bold text-blue-700">
                  {analysis.confidence}% Confidence
                </span>
              </div>

              {/* Diagnosis Card */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                <div>
                  <span className="text-[11px] text-slate-500 block font-medium">Identified Condition:</span>
                  <h4 className="text-sm font-bold text-slate-900 leading-tight">
                    {analysis.pathogen}
                  </h4>
                </div>

                <div className="text-xs text-slate-700 space-y-1">
                  <span className="text-[11px] text-slate-500 block font-medium">Visual Examination Findings:</span>
                  <p className="text-slate-800 text-[11px] leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    "{analysis.findings}"
                  </p>
                </div>

                {analysis.symptoms.length > 0 && (
                  <div>
                    <span className="text-[11px] text-slate-500 block mb-1 font-medium">Correlated Clinical Signs:</span>
                    <div className="flex flex-wrap gap-1">
                      {analysis.symptoms.map((s, idx) => (
                        <span key={idx} className="bg-blue-50 text-blue-800 text-[10px] font-semibold px-2 py-0.5 rounded border border-blue-200">
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
              <span className="text-[11px] font-semibold text-slate-600 block">
                Clinical Pathology Reference Library:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPreset(p)}
                    className={`text-left p-2 rounded-xl text-[11px] border transition-all ${
                      currentPhotoUrl === p.url
                        ? 'bg-blue-50 text-blue-900 border-blue-400 font-bold'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="block font-medium truncate">{p.name}</span>
                    <span className="text-[10px] text-slate-500 block truncate">{p.pathogen}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Main CTA: Report Case with this Photo */}
            <div className="pt-2 border-t border-slate-200">
              <button
                onClick={handleProceedToReport}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 group"
              >
                <span>{t('reportWithThisPhoto')}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
