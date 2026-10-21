import React from 'react';
import { ArrowLeft, Mic, Cpu, Bot, Volume2 } from 'lucide-react';
import { PriyaScreen } from '../../types';

interface SettingsScreenProps {
  onBack: () => void;
  onNavigate: (screen: PriyaScreen) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack, onNavigate }) => {
  const settingsItems = [
    {
      title: 'Permissions',
      subtitle: 'Microphone and app access',
      icon: Mic,
      action: () => onNavigate('permissions'),
    },
    {
      title: 'Memory',
      subtitle: 'Conversation memory and context',
      icon: Cpu,
      action: () => onNavigate('memory'),
    },
    {
      title: 'AI provider',
      subtitle: 'Model and provider configuration',
      icon: Bot,
      action: () => onNavigate('ai_setup'),
    },
    {
      title: 'Voice settings',
      subtitle: 'Speaker and recognition preferences',
      icon: Volume2,
      action: () => onNavigate('voice_settings'),
    },
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
        <h2 className="text-xl font-semibold text-white">Settings</h2>
      </div>

      {/* Settings list */}
      <div className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6 space-y-2">
        {settingsItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <React.Fragment key={item.title}>
              <div
                onClick={item.action}
                className="flex items-center gap-4 p-4 rounded-2xl hover:bg-[#1E293B]/70 cursor-pointer transition-colors border border-transparent hover:border-slate-800/80"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="text-base font-medium text-white">{item.title}</div>
                  <div className="text-sm text-slate-400">{item.subtitle}</div>
                </div>
              </div>
              {index < settingsItems.length - 1 && <div className="h-px bg-slate-800/60 my-1" />}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
