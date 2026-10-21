import React from 'react';
import { AssistantStatus } from '../../types';
import { WifiOff, AlertCircle } from 'lucide-react';

interface VisualizerProps {
  status: AssistantStatus;
}

export const AssistantWaveVisualizer: React.FC<VisualizerProps> = ({ status }) => {
  if (status === 'LISTENING') {
    return (
      <div className="flex items-end justify-center gap-1.5 h-16 w-32 py-2">
        {[0, 1, 2, 3, 4, 5].map((idx) => (
          <div
            key={idx}
            className="w-2.5 bg-emerald-400 rounded-full animate-pulse"
            style={{
              height: `${20 + ((idx * 7) % 35)}px`,
              animationDelay: `${idx * 0.15}s`,
              animationDuration: '0.9s',
            }}
          />
        ))}
      </div>
    );
  }

  if (status === 'PROCESSING' || status === 'THINKING') {
    return (
      <div className="relative flex items-center justify-center w-20 h-20">
        <div className="absolute inset-0 rounded-full bg-purple-500/10 animate-ping" />
        <svg className="w-16 h-16 animate-spin text-purple-400" viewBox="0 0 50 50">
          <circle
            className="opacity-25"
            cx="25"
            cy="25"
            r="20"
            stroke="currentColor"
            strokeWidth="5"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 25a21 21 0 0121-21v4a17 17 0 00-17 17H4z"
          />
        </svg>
      </div>
    );
  }

  if (status === 'SPEAKING') {
    return (
      <div className="relative flex items-center justify-center w-20 h-20">
        <div className="absolute w-16 h-16 rounded-full bg-amber-400/20 animate-ping" />
        <div className="w-12 h-12 rounded-full bg-amber-400/30 flex items-center justify-center text-amber-300 font-bold text-lg">
          ♪
        </div>
      </div>
    );
  }

  if (status === 'ERROR') {
    return (
      <div className="w-14 h-14 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400">
        <AlertCircle className="w-8 h-8" />
      </div>
    );
  }

  if (status === 'OFFLINE') {
    return (
      <div className="w-14 h-14 rounded-full bg-slate-500/20 flex items-center justify-center text-slate-400">
        <WifiOff className="w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="w-14 h-14 rounded-full bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-white font-bold text-xl">
      P
    </div>
  );
};
