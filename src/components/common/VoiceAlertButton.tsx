import React, { useState, useEffect } from 'react';
import { VoiceService, SupportedVoiceLang } from '../../services/voiceService';
import { useSurveillanceStore } from '../../store/surveillanceStore';
import { Volume2, Square, VolumeX } from 'lucide-react';

interface VoiceAlertButtonProps {
  textTe: string;
  textEn: string;
  textHi?: string;
  label?: string;
  size?: 'xs' | 'sm' | 'md';
  variant?: 'primary' | 'danger' | 'warning' | 'emerald' | 'subtle';
  className?: string;
  forceLang?: SupportedVoiceLang;
}

export const VoiceAlertButton: React.FC<VoiceAlertButtonProps> = ({
  textTe,
  textEn,
  textHi,
  label,
  size = 'sm',
  variant = 'emerald',
  className = '',
  forceLang
}) => {
  const { state } = useSurveillanceStore();
  const [isPlaying, setIsPlaying] = useState(false);

  // Determine speech text and language
  const targetLang: SupportedVoiceLang = forceLang || (state.language as SupportedVoiceLang) || 'te';
  const textToSpeak = targetLang === 'te' 
    ? textTe 
    : targetLang === 'hi' 
    ? (textHi || textEn) 
    : textEn;

  useEffect(() => {
    const textSafe = (textToSpeak || '').trim();
    const unsubscribe = VoiceService.subscribe((isSpeaking, speakingText) => {
      setIsPlaying(isSpeaking && speakingText === textSafe);
    });
    return () => unsubscribe();
  }, [textToSpeak]);

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      VoiceService.stop();
    } else {
      VoiceService.speak(textToSpeak, targetLang);
    }
  };

  // Button size styles
  const sizeClasses = {
    xs: 'text-[10px] px-2 py-1 gap-1',
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-3.5 py-2 gap-2'
  }[size];

  // Button variant styles
  const variantClasses = {
    emerald: isPlaying
      ? 'bg-blue-700 text-white font-bold border-blue-600 shadow-sm'
      : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-700 shadow-xs',
    danger: isPlaying
      ? 'bg-blue-700 text-white font-bold border-blue-600 shadow-sm'
      : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-700 shadow-xs',
    warning: isPlaying
      ? 'bg-blue-700 text-white font-bold border-blue-600 shadow-sm'
      : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-700 shadow-xs',
    primary: isPlaying
      ? 'bg-blue-700 text-white font-bold border-blue-600 shadow-sm'
      : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-700 shadow-xs',
    subtle: isPlaying
      ? 'bg-slate-200 text-slate-900 font-bold border-slate-300'
      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
  }[variant];

  const defaultLabel = targetLang === 'te' 
    ? 'వినండి / Listen' 
    : targetLang === 'hi' 
    ? 'सुनें / Listen' 
    : 'Listen';

  const displayLabel = label || defaultLabel;

  return (
    <button
      type="button"
      onClick={handleTogglePlay}
      className={`inline-flex items-center rounded-xl border font-bold shadow-md transition-all active:scale-95 shrink-0 ${sizeClasses} ${variantClasses} ${className}`}
      title={isPlaying ? 'Click to stop speech playback' : 'Click to hear spoken audio in regional language'}
    >
      {isPlaying ? (
        <>
          {/* Animated sound wave bars */}
          <div className="flex items-center gap-0.5 h-3.5 px-0.5">
            <span className="w-1 bg-current rounded-full animate-sound-1"></span>
            <span className="w-1 bg-current rounded-full animate-sound-2"></span>
            <span className="w-1 bg-current rounded-full animate-sound-3"></span>
            <span className="w-1 bg-current rounded-full animate-sound-4"></span>
          </div>
          <span>{targetLang === 'te' ? 'ఆపండి / Stop' : 'Stop'}</span>
        </>
      ) : (
        <>
          <Volume2 className={size === 'xs' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          <span>{displayLabel}</span>
        </>
      )}
    </button>
  );
};
