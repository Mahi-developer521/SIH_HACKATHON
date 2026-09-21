/**
 * VoiceService: Real-world Web Speech Synthesis engine for Multilingual Voice Alerts.
 * Supports authentic Telugu (te-IN), English (en-IN), and Hindi (hi-IN) voice playback.
 */

export type SupportedVoiceLang = 'te' | 'en' | 'hi';

type VoiceStateListener = (isSpeaking: boolean, speakingText: string | null) => void;

class VoiceServiceManager {
  private synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private listeners: Set<VoiceStateListener> = new Set();
  private isCurrentlySpeaking: boolean = false;
  private activeText: string | null = null;

  constructor() {
    if (this.synth) {
      // Chrome/Edge sometimes delays voice loading; prime voices
      window.addEventListener('beforeunload', () => this.stop());
    }
  }

  public subscribe(listener: VoiceStateListener): () => void {
    this.listeners.add(listener);
    listener(this.isCurrentlySpeaking, this.activeText);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(fn => fn(this.isCurrentlySpeaking, this.activeText));
  }

  /**
   * Speak a given message in specified regional language
   */
  public speak(
    text: string, 
    lang: SupportedVoiceLang = 'te', 
    onStart?: () => void,
    onEnd?: () => void, 
    onError?: () => void
  ) {
    if (!this.synth) {
      alert(`[Voice Warning]: ${text}`);
      if (onEnd) onEnd();
      return;
    }

    // Stop any ongoing speech first
    this.stop();

    if (!text || text.trim().length === 0) return;

    const utterance = new SpeechSynthesisUtterance(text.trim());
    
    // Set appropriate BCP-47 language tag
    if (lang === 'te') {
      utterance.lang = 'te-IN';
    } else if (lang === 'hi') {
      utterance.lang = 'hi-IN';
    } else {
      utterance.lang = 'en-IN';
    }

    // Attempt to match best regional voice
    const voices = this.synth.getVoices();
    const matchingVoice = voices.find(v => 
      v.lang.toLowerCase().startsWith(utterance.lang.toLowerCase()) || 
      v.lang.toLowerCase().startsWith(lang.toLowerCase())
    );
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.rate = 0.92; // Slightly measured rate for clear rural comprehension
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      this.isCurrentlySpeaking = true;
      this.activeText = text;
      this.notify();
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.isCurrentlySpeaking = false;
      this.activeText = null;
      this.currentUtterance = null;
      this.notify();
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('[VoiceService] Speech synthesis event notice:', e);
      this.isCurrentlySpeaking = false;
      this.activeText = null;
      this.currentUtterance = null;
      this.notify();
      if (onError) onError();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isCurrentlySpeaking = false;
    this.activeText = null;
    this.currentUtterance = null;
    this.notify();
  }

  public getStatus(): { isSpeaking: boolean; activeText: string | null } {
    return {
      isSpeaking: this.isCurrentlySpeaking,
      activeText: this.activeText
    };
  }
}

export const VoiceService = new VoiceServiceManager();
