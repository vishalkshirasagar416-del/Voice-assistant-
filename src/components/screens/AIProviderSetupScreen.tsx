import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
import { AIConfig, AIProviderType } from '../../types';
import { storageService } from '../../services/storage/storageService';

interface AIProviderSetupScreenProps {
  onBack?: () => void;
  onComplete: () => void;
  allowSkip?: boolean;
}

export const AIProviderSetupScreen: React.FC<AIProviderSetupScreenProps> = ({
  onBack,
  onComplete,
  allowSkip = false,
}) => {
  const [config, setConfig] = useState<AIConfig>(() => storageService.getAIConfig());
  const [geminiKey, setGeminiKey] = useState('');
  const [openRouterKey, setOpenRouterKey] = useState('');
  const [elevenLabsKey, setElevenLabsKey] = useState('');
  const [primary, setPrimary] = useState<AIProviderType>(config.primaryProvider);

  const [showGemini, setShowGemini] = useState(false);
  const [showOpenRouter, setShowOpenRouter] = useState(false);
  const [showElevenLabs, setShowElevenLabs] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    const updated: AIConfig = {
      geminiApiKey: geminiKey.trim() || config.geminiApiKey,
      openRouterApiKey: openRouterKey.trim() || config.openRouterApiKey,
      elevenLabsApiKey: elevenLabsKey.trim() || config.elevenLabsApiKey,
      primaryProvider: primary,
      setupCompleted: true,
    };
    storageService.saveAIConfig(updated);
    setConfig(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      onComplete();
    }, 600);
  };

  const handleRemove = (provider: AIProviderType) => {
    const updated = { ...config };
    if (provider === 'GEMINI') updated.geminiApiKey = '';
    if (provider === 'OPENROUTER') updated.openRouterApiKey = '';
    if (provider === 'NONE') updated.elevenLabsApiKey = '';
    storageService.saveAIConfig(updated);
    setConfig(updated);
  };

  return (
    <div className="min-h-screen bg-[#070B16] text-[#E2E8F0] flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center gap-4 px-5 py-4 border-b border-slate-800 bg-[#111827]/80 backdrop-blur sticky top-0 z-20">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-300 transition-colors"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <h2 className="text-xl font-semibold text-white">
          {allowSkip ? 'Welcome to Priya' : 'AI Providers'}
        </h2>
      </div>

      <div className="flex-1 max-w-xl w-full mx-auto p-4 sm:p-6 space-y-6">
        <div>
          <h3 className="text-2xl font-semibold text-white">
            {allowSkip ? "Let's connect your AI providers" : 'Update provider keys'}
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            {allowSkip
              ? 'Priya needs your own AI API keys to use live intelligence models. Your keys are kept securely in browser storage.'
              : 'Existing keys are masked. Enter a new value only when replacing one.'}
          </p>
        </div>

        {/* Gemini API Key */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Gemini API key</label>
          <div className="relative">
            <input
              type={showGemini ? 'text' : 'password'}
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder={config.geminiApiKey ? '•••••••••••••••• (Configured)' : 'Enter Gemini API key'}
              className="w-full bg-[#111827] border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowGemini(!showGemini)}
              className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-200"
            >
              {showGemini ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <div className="flex items-center justify-between text-xs px-1">
            <span className="flex items-center gap-1.5 text-slate-400">
              {config.geminiApiKey ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Gemini: Configured</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-slate-500" />
                  <span>Gemini: Not configured</span>
                </>
              )}
            </span>
            {config.geminiApiKey && (
              <button
                onClick={() => handleRemove('GEMINI')}
                className="text-rose-400 hover:underline cursor-pointer"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        {/* OpenRouter API Key */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">OpenRouter API key</label>
          <div className="relative">
            <input
              type={showOpenRouter ? 'text' : 'password'}
              value={openRouterKey}
              onChange={(e) => setOpenRouterKey(e.target.value)}
              placeholder={config.openRouterApiKey ? '•••••••••••••••• (Configured)' : 'Enter OpenRouter API key'}
              className="w-full bg-[#111827] border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowOpenRouter(!showOpenRouter)}
              className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-200"
            >
              {showOpenRouter ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <div className="flex items-center justify-between text-xs px-1">
            <span className="flex items-center gap-1.5 text-slate-400">
              {config.openRouterApiKey ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>OpenRouter: Configured</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-slate-500" />
                  <span>OpenRouter: Not configured</span>
                </>
              )}
            </span>
            {config.openRouterApiKey && (
              <button
                onClick={() => handleRemove('OPENROUTER')}
                className="text-rose-400 hover:underline cursor-pointer"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        {/* ElevenLabs API Key */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">ElevenLabs API key (optional)</label>
          <div className="relative">
            <input
              type={showElevenLabs ? 'text' : 'password'}
              value={elevenLabsKey}
              onChange={(e) => setElevenLabsKey(e.target.value)}
              placeholder={config.elevenLabsApiKey ? '•••••••••••••••• (Configured)' : 'Enter ElevenLabs API key'}
              className="w-full bg-[#111827] border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowElevenLabs(!showElevenLabs)}
              className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-200"
            >
              {showElevenLabs ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <div className="flex items-center justify-between text-xs px-1">
            <span className="flex items-center gap-1.5 text-slate-400">
              {config.elevenLabsApiKey ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>ElevenLabs: Configured</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-slate-500" />
                  <span>ElevenLabs: Not configured</span>
                </>
              )}
            </span>
            {config.elevenLabsApiKey && (
              <button
                onClick={() => handleRemove('NONE')}
                className="text-rose-400 hover:underline cursor-pointer"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        {/* Primary AI Provider */}
        <div className="pt-2 border-t border-slate-800 space-y-3">
          <label className="text-sm font-semibold text-white">Primary AI provider</label>
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 rounded-xl bg-[#111827] border border-slate-700/80 cursor-pointer hover:border-purple-500/50">
              <input
                type="radio"
                name="primaryProvider"
                checked={primary === 'GEMINI'}
                onChange={() => setPrimary('GEMINI')}
                className="text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-white">Gemini</span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl bg-[#111827] border border-slate-700/80 cursor-pointer hover:border-purple-500/50">
              <input
                type="radio"
                name="primaryProvider"
                checked={primary === 'OPENROUTER'}
                onChange={() => setPrimary('OPENROUTER')}
                className="text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-white">OpenRouter</span>
            </label>
          </div>
          <p className="text-xs text-slate-400">
            The selected provider is tried first. The other configured provider remains available as fallback.
          </p>
        </div>

        {/* Buttons */}
        <div className="pt-4 space-y-2">
          <button
            onClick={handleSave}
            className="w-full py-3.5 px-4 rounded-xl font-medium bg-purple-600 hover:bg-purple-700 text-white transition-colors shadow-lg shadow-purple-600/30"
          >
            {savedSuccess ? 'Saved!' : allowSkip ? 'Save & Continue' : 'Save Changes'}
          </button>

          {allowSkip && (
            <button
              onClick={onComplete}
              className="w-full py-3 px-4 rounded-xl font-medium border border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors"
            >
              Skip for now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
