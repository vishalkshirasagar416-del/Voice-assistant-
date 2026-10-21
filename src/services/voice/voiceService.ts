import { storageService } from '../storage/storageService';

/* eslint-disable @typescript-eslint/no-explicit-any */
type SpeechRecognitionType = any;

export class VoiceService {
  private recognition: SpeechRecognitionType | null = null;
  private isListening = false;
  private onResultCallback: ((text: string) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;
  private onSpeakingChangeCallback: ((speaking: boolean) => void) | null = null;
  private onMouthVisemeCallback: ((openAmount: number) => void) | null = null;
  private audioContext: AudioContext | null = null;

  constructor() {
    this.initSpeechRecognition();
  }

  private initSpeechRecognition() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (this.onResultCallback && transcript) {
            this.onResultCallback(transcript);
          }
        };

        this.recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          this.isListening = false;
          if (this.onErrorCallback) {
            this.onErrorCallback(event.error);
          }
        };

        this.recognition.onend = () => {
          this.isListening = false;
        };
      } catch (e) {
        console.warn('Could not initialize SpeechRecognition:', e);
      }
    }
  }

  startListening(onResult: (text: string) => void, onError: (error: string) => void): boolean {
    if (!this.recognition) {
      onError('Speech recognition is not supported in this browser.');
      return false;
    }

    this.onResultCallback = onResult;
    this.onErrorCallback = onError;

    try {
      if (this.isListening) {
        this.recognition.abort();
      }
      this.isListening = true;
      this.recognition.start();
      return true;
    } catch (e: any) {
      console.warn('Error starting speech recognition:', e);
      this.isListening = false;
      onError(e?.message || 'Failed to start microphone');
      return false;
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
    }
    this.isListening = false;
  }

  setSpeakingCallbacks(
    onSpeakingChange: (speaking: boolean) => void,
    onMouthViseme: (amount: number) => void
  ) {
    this.onSpeakingChangeCallback = onSpeakingChange;
    this.onMouthVisemeCallback = onMouthViseme;
  }

  async speakText(text: string): Promise<void> {
    if (!text || text.trim() === '') return;

    const settings = storageService.getVoiceSettings();
    const config = storageService.getAIConfig();

    // Check if ElevenLabs is selected and key is present
    if (settings.selectedVoiceEngine === 'ELEVENLABS' && config.elevenLabsApiKey) {
      try {
        await this.speakWithElevenLabs(text, config.elevenLabsApiKey);
        return;
      } catch (err) {
        console.warn('ElevenLabs TTS failed, falling back to Web Speech Synthesis...', err);
      }
    }

    // Default: Web Speech Synthesis with mouth movement simulation
    this.speakWithSpeechSynthesis(text, settings.voiceSpeed, settings.voicePitch);
  }

  private speakWithSpeechSynthesis(text: string, speed = 1.0, pitch = 1.0) {
    if (!('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis not available');
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = Math.max(0.6, Math.min(1.8, speed));
    utterance.pitch = Math.max(0.6, Math.min(1.5, pitch));

    // Try to pick a natural female voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) =>
        (v.name.includes('Female') ||
          v.name.includes('Samantha') ||
          v.name.includes('Victoria') ||
          v.name.includes('Google UK English Female') ||
          v.name.includes('Google US English')) &&
        v.lang.startsWith('en')
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    let mouthInterval: number | null = null;

    utterance.onstart = () => {
      if (this.onSpeakingChangeCallback) this.onSpeakingChangeCallback(true);

      // Animate mouth opening and closing synchronized to speech
      mouthInterval = window.setInterval(() => {
        if (this.onMouthVisemeCallback) {
          const openAmount = 0.2 + Math.random() * 0.7;
          this.onMouthVisemeCallback(openAmount);
        }
      }, 120);
    };

    utterance.onend = () => {
      if (mouthInterval) clearInterval(mouthInterval);
      if (this.onMouthVisemeCallback) this.onMouthVisemeCallback(0);
      if (this.onSpeakingChangeCallback) this.onSpeakingChangeCallback(false);
    };

    utterance.onerror = () => {
      if (mouthInterval) clearInterval(mouthInterval);
      if (this.onMouthVisemeCallback) this.onMouthVisemeCallback(0);
      if (this.onSpeakingChangeCallback) this.onSpeakingChangeCallback(false);
    };

    window.speechSynthesis.speak(utterance);
  }

  private async speakWithElevenLabs(text: string, apiKey: string): Promise<void> {
    const voiceId = '21m00Tcm4TlvDq8ikWAM'; // Rachel voice
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs error ${response.status}`);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);

    if (this.onSpeakingChangeCallback) this.onSpeakingChangeCallback(true);

    const mouthInterval = window.setInterval(() => {
      if (this.onMouthVisemeCallback) {
        this.onMouthVisemeCallback(0.2 + Math.random() * 0.7);
      }
    }, 120);

    return new Promise((resolve) => {
      audio.onended = () => {
        clearInterval(mouthInterval);
        if (this.onMouthVisemeCallback) this.onMouthVisemeCallback(0);
        if (this.onSpeakingChangeCallback) this.onSpeakingChangeCallback(false);
        URL.revokeObjectURL(url);
        resolve();
      };
      audio.onerror = () => {
        clearInterval(mouthInterval);
        if (this.onMouthVisemeCallback) this.onMouthVisemeCallback(0);
        if (this.onSpeakingChangeCallback) this.onSpeakingChangeCallback(false);
        URL.revokeObjectURL(url);
        resolve();
      };
      audio.play();
    });
  }

  stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (this.onSpeakingChangeCallback) {
      this.onSpeakingChangeCallback(false);
    }
    if (this.onMouthVisemeCallback) {
      this.onMouthVisemeCallback(0);
    }
  }
}

export const voiceService = new VoiceService();
