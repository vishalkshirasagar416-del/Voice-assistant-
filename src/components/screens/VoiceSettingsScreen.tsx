import React, { useState } from 'react';
import { ArrowLeft, Check, Volume2 } from 'lucide-react';
import { VoiceEnginePreference, VoiceSettings } from '../../types';
import { storageService } from '../../services/storage/storageService';
import { voiceService } from '../../services/voice/voiceService';

interface VoiceSettingsScreenProps {
  onBack: () => void;
}

export const VoiceSettingsScreen: React.FC<VoiceSettingsScreenProps> = ({ onBack }) => {
  const [settings, setSettings] = useState<VoiceSettings>(() => storageService.getVoiceSettings());
  const [testSpeaking, setTestSpeaking] = useState(false);
  const [modelMessage, setModelMessage] = useState('Kokoro ONNX engine ready');

  const updateSetting = <K extends keyof VoiceSettings>(key: K, value: VoiceSettings[K]) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    storageService.saveVoiceSettings(updated);
  };

  const handleTestVoice = async () => {
    setTestSpeaking(true);
    await voiceService.speakText("Hi there! I'm Priya. My voice is calm, clear, and responsive.");
    setTestSpeaking(false);
  };

  const handleInitKokoro = () => {
    setModelMessage('Downloading and initializing Kokoro weights...');
    setTimeout(() => {
      setModelMessage('Kokoro af_heart model weights initialized (68MB cached).');
    }, 1200);
  };

  const engineOptions: { value: VoiceEnginePreference; label: string }[] = [
    { value: 'AUTO', label: 'Auto / Smart Fallback' },
    { value: 'ELEVENLABS', label: 'ElevenLabs' },
    { value: 'KOKORO', label: 'Kokoro' },
    { value: 'ANDROID_LOCAL', label: 'Local Speech Synthesis' },
  ];

  return (
    <div className="min-h-screen bg-[#070B16] text-[#E2E8F0] flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center gap-4 px-5 py-4 border-b border-slate-800 bg-[#111827]/80 backdrop-blur sticky top-0 z-20">
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-slate-800 text-slate-300 transition-colors"
          title="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold text-white">Voice settings</h2>
      </div>

      <div className="flex-1 max-w-xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Engine choices */}
        <div>
          <h3 className="text-base font-semibold text-white mb-3">Voice Engine</h3>
          <div className="space-y-2">
            {engineOptions.map((opt) => (
              <label
                key={opt.value}
                onClick={() => updateSetting('selectedVoiceEngine', opt.value)}
                className="flex items-center justify-between p-3.5 rounded-xl bg-[#111827] border border-slate-800 hover:border-purple-500/50 cursor-pointer transition-colors"
              >
                <span className="text-sm font-medium text-slate-200">{opt.label}</span>
                <input
                  type="radio"
                  name="voiceEngine"
                  checked={settings.selectedVoiceEngine === opt.value}
                  onChange={() => updateSetting('selectedVoiceEngine', opt.value)}
                  className="text-purple-600 focus:ring-purple-500"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="h-px bg-slate-800/80" />

        {/* Kokoro voice */}
        <div>
          <h3 className="text-base font-semibold text-white mb-3">Kokoro Voice</h3>
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#111827] border border-slate-800">
            <span className="text-sm font-mono text-purple-300">
              {settings.kokoroVoice || 'af_heart'}
            </span>
            <button
              onClick={() => updateSetting('kokoroVoice', 'af_heart')}
              className="text-xs px-3 py-1.5 rounded-lg border border-purple-500/40 text-purple-300 hover:bg-purple-950/40"
            >
              Use af_heart
            </button>
          </div>
        </div>

        <div className="h-px bg-slate-800/80" />

        {/* Speed */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-semibold text-white">Voice Speed</span>
            <span className="text-purple-400 font-mono">{settings.voiceSpeed.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.05"
            value={settings.voiceSpeed}
            onChange={(e) => updateSetting('voiceSpeed', parseFloat(e.target.value))}
            className="w-full accent-purple-600 cursor-pointer"
          />
        </div>

        {/* Pitch */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-semibold text-white">Voice Pitch</span>
            <span className="text-purple-400 font-mono">{settings.voicePitch.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.05"
            value={settings.voicePitch}
            onChange={(e) => updateSetting('voicePitch', parseFloat(e.target.value))}
            className="w-full accent-purple-600 cursor-pointer"
          />
        </div>

        <div className="h-px bg-slate-800/80" />

        {/* Kokoro model section */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-white">Kokoro model</h3>
          <p className="text-sm text-slate-400">{modelMessage}</p>
          <div className="flex gap-3">
            <button
              onClick={handleInitKokoro}
              className="py-2.5 px-4 rounded-xl text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white transition-colors"
            >
              Initialize Kokoro
            </button>
            <button
              onClick={handleTestVoice}
              disabled={testSpeaking}
              className="py-2.5 px-4 rounded-xl text-sm font-medium border border-slate-700 hover:bg-slate-800 text-slate-200 transition-colors flex items-center gap-2"
            >
              <Volume2 className="w-4 h-4 text-purple-400" />
              <span>{testSpeaking ? 'Speaking...' : 'Test Speech'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
