import React, { useState, useEffect, useRef } from 'react';
import {
  Settings as SettingsIcon,
  Mic,
  Send,
  CloudSun,
  BellRing,
  BatteryCharging,
  GraduationCap,
  Music,
  WifiOff,
} from 'lucide-react';
import { AssistantMessage, AssistantStatus, PriyaScreen } from '../../types';
import { PriyaAvatar } from '../avatar/PriyaAvatar';
import { storageService } from '../../services/storage/storageService';
import { voiceService } from '../../services/voice/voiceService';
import { aiService } from '../../services/ai/aiService';
import { commandRouter } from '../../services/router/commandRouter';

interface MainAssistantScreenProps {
  onOpenSettings: () => void;
  onNavigateToPermissions: () => void;
}

export const MainAssistantScreen: React.FC<MainAssistantScreenProps> = ({
  onOpenSettings,
  onNavigateToPermissions,
}) => {
  const [status, setStatus] = useState<AssistantStatus>('IDLE');
  const [messages, setMessages] = useState<AssistantMessage[]>(() => storageService.getMessages());
  const [inputText, setInputText] = useState('');
  const [requireWakeWord, setRequireWakeWord] = useState(() => storageService.getWakeWordEnabled());
  const [backgroundEnabled, setBackgroundEnabled] = useState(() => storageService.getBackgroundEnabled());
  const [mouthOpenAmount, setMouthOpenAmount] = useState(0);
  const [isSpeakingState, setIsSpeakingState] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Status labels and messages matching MainAssistantScreen.kt
  const statusLabel = (() => {
    switch (status) {
      case 'ERROR':
        return 'Error';
      case 'OFFLINE':
        return 'Offline';
      case 'SPEAKING':
        return 'Speaking';
      case 'LISTENING':
        return 'Listening';
      case 'PROCESSING':
      case 'THINKING':
        return 'Thinking';
      default:
        return 'Idle';
    }
  })();

  const statusMessage = (() => {
    switch (status) {
      case 'ERROR':
        return "Something interrupted the moment. Let's try that again.";
      case 'OFFLINE':
        return "You're offline. Priya will reconnect automatically when the connection is back.";
      case 'LISTENING':
        return 'Listening for your next request...';
      case 'PROCESSING':
      case 'THINKING':
        return 'Thinking through the best response...';
      case 'SPEAKING':
        return 'Priya is responding with a calm, natural voice.';
      default:
        return 'Ready when you are.';
    }
  })();

  // Microphone button color matching Kotlin Compose
  const micButtonBg = (() => {
    switch (status) {
      case 'ERROR':
        return 'bg-[#F87171] hover:bg-rose-500 shadow-rose-500/30';
      case 'OFFLINE':
        return 'bg-[#94A3B8] hover:bg-slate-400 shadow-slate-500/20';
      case 'LISTENING':
        return 'bg-[#34D399] hover:bg-emerald-400 shadow-emerald-400/30';
      case 'SPEAKING':
        return 'bg-[#FBBF24] hover:bg-amber-400 shadow-amber-400/30';
      case 'PROCESSING':
      case 'THINKING':
        return 'bg-[#8B5CF6] hover:bg-purple-500 shadow-purple-500/30';
      default:
        return 'bg-[#7C3AED] hover:bg-purple-600 shadow-purple-600/30';
    }
  })();

  // Status Dot Color
  const statusDotBg = (() => {
    switch (status) {
      case 'ERROR':
        return 'bg-[#F87171]';
      case 'OFFLINE':
        return 'bg-[#94A3B8]';
      case 'LISTENING':
        return 'bg-[#34D399] animate-ping';
      case 'SPEAKING':
        return 'bg-[#FBBF24]';
      case 'PROCESSING':
      case 'THINKING':
        return 'bg-[#A78BFA] animate-pulse';
      default:
        return 'bg-[#22C55E]';
    }
  })();

  const quickActions = [
    { label: 'Weather', icon: CloudSun },
    { label: 'Reminders', icon: BellRing },
    { label: 'Battery', icon: BatteryCharging },
    { label: 'Study', icon: GraduationCap },
    { label: 'Music', icon: Music },
  ];

  // Auto scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Voice callbacks
  useEffect(() => {
    voiceService.setSpeakingCallbacks(
      (speaking) => {
        setIsSpeakingState(speaking);
        if (speaking) {
          setStatus('SPEAKING');
        } else {
          setStatus('IDLE');
        }
      },
      (amount) => {
        setMouthOpenAmount(amount);
      }
    );

    // Online/offline listeners
    const handleOnline = () => setStatus('IDLE');
    const handleOffline = () => setStatus('OFFLINE');
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      voiceService.stopSpeaking();
      voiceService.stopListening();
    };
  }, []);

  const addMessage = (text: string, isUser: boolean) => {
    const newMsg: AssistantMessage = {
      id: `${isUser ? 'user' : 'assistant'}_${Date.now()}`,
      text,
      isUser,
      timestamp: Date.now(),
    };
    storageService.addMessage(newMsg);
    setMessages((prev) => [...prev, newMsg]);
  };

  const handleSendMessage = async (textToSend: string) => {
    const query = textToSend.trim();
    if (!query || status === 'PROCESSING' || status === 'THINKING') return;

    addMessage(query, true);
    setInputText('');
    setStatus('PROCESSING');

    try {
      // 1. Try local Command Router first (for battery, storage, time, reminders, search, apps)
      const routeResult = await commandRouter.route(query);

      let reply = '';
      if (!routeResult.requiresLLM && routeResult.finalResponse) {
        reply = routeResult.finalResponse;
      } else {
        // 2. Call AI service
        setStatus('THINKING');
        const aiRes = await aiService.generateResponse(query);
        reply = aiRes.text || "I'm not quite sure how to answer that yet, but I'm learning!";
      }

      addMessage(reply, false);
      setStatus('SPEAKING');
      await voiceService.speakText(reply);
      setStatus('IDLE');
    } catch (e: unknown) {
      console.error('Error handling message:', e);
      addMessage("Something interrupted the moment. Let's try that again.", false);
      setStatus('ERROR');
    }
  };

  const handleToggleListening = () => {
    if (status === 'OFFLINE') {
      onNavigateToPermissions();
      return;
    }

    if (status === 'ERROR') {
      setStatus('IDLE');
      return;
    }

    if (status === 'LISTENING') {
      voiceService.stopListening();
      setStatus('IDLE');
      return;
    }

    setStatus('LISTENING');
    const started = voiceService.startListening(
      (transcript) => {
        setStatus('PROCESSING');
        // Wake word check if enabled
        if (requireWakeWord) {
          const lower = transcript.toLowerCase();
          if (!lower.includes('priya')) {
            setStatus('IDLE');
            return;
          }
          // strip "priya", "hey priya", "hi priya"
          const cleaned = transcript.replace(/^(?:hey\s+|hi\s+)?priya[,.]?\s*/i, '').trim();
          if (cleaned) {
            handleSendMessage(cleaned);
          } else {
            const greeting = 'Yes, I am listening!';
            addMessage(greeting, false);
            voiceService.speakText(greeting);
          }
          return;
        }

        handleSendMessage(transcript);
      },
      (error) => {
        console.warn('Speech error:', error);
        setStatus('ERROR');
      }
    );

    if (!started) {
      onNavigateToPermissions();
    }
  };

  const handleQuickAction = async (label: string) => {
    addMessage(label, true);
    setStatus('THINKING');

    setTimeout(async () => {
      let response = '';
      switch (label) {
        case 'Weather':
          response = 'The forecast is clear with a mild breeze and 24°C today.';
          break;
        case 'Reminders':
          response = 'Your 7:30 PM reminder is scheduled and ready.';
          break;
        case 'Battery':
          response = 'Battery is at 84% and charging normally.';
          break;
        case 'Study':
          response = 'You have three study tasks left. Want a quick revision plan?';
          break;
        case 'Music':
          response = 'I found a calm focus playlist and queued it for you.';
          break;
        default:
          response = 'I can help with that.';
      }
      addMessage(response, false);
      setStatus('SPEAKING');
      await voiceService.speakText(response);
      setStatus('IDLE');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#070B16] via-[#0B1020] to-[#111827] text-[#E2E8F0] flex flex-col p-4 sm:p-6 max-w-2xl mx-auto space-y-4">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight text-white">Priya</h1>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${statusDotBg}`} />
            <span className="text-sm font-medium text-purple-400">{statusLabel}</span>
          </div>
        </div>

        <button
          onClick={onOpenSettings}
          className="w-11 h-11 rounded-full bg-[#1E293B]/80 hover:bg-[#1E293B] text-slate-200 flex items-center justify-center transition-colors border border-slate-700/50"
          title="Open settings"
        >
          <SettingsIcon className="w-5 h-5" />
        </button>
      </div>

      {/* 3D Avatar Card */}
      <div className="w-full rounded-3xl bg-gradient-to-br from-purple-900/25 via-sky-950/20 to-[#111827]/95 border border-purple-500/20 p-4 sm:p-5 flex flex-col items-center shadow-xl shadow-purple-950/30">
        <PriyaAvatar
          isSpeaking={status === 'SPEAKING' || isSpeakingState}
          isListening={status === 'LISTENING'}
          isProcessing={status === 'PROCESSING' || status === 'THINKING'}
          emotion={status === 'SPEAKING' ? 'happy' : status === 'THINKING' ? 'thinking' : 'neutral'}
          mouthOpenAmount={mouthOpenAmount}
        />
        <div className="text-center mt-2 px-4">
          <p className="text-sm sm:text-base font-medium text-slate-200 transition-all duration-300">
            {statusMessage}
          </p>
        </div>
      </div>

      {/* Quick Actions Card */}
      <div className="w-full rounded-2xl bg-[#111827]/90 border border-slate-800/80 p-4 space-y-3">
        <h2 className="text-sm font-semibold text-slate-200">Quick actions</h2>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={() => handleQuickAction(action.label)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1E293B]/70 hover:bg-purple-900/30 hover:border-purple-500/40 border border-slate-700/60 text-xs font-medium text-slate-200 shrink-0 transition-colors"
              >
                <Icon className="w-4 h-4 text-purple-400" />
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Large Center Microphone Button */}
      <div className="flex justify-center py-2">
        <button
          onClick={handleToggleListening}
          className={`w-24 h-24 rounded-full flex items-center justify-center text-white transition-all transform active:scale-95 shadow-xl ${micButtonBg}`}
          title="Toggle microphone"
        >
          <Mic className={`w-9 h-9 ${status === 'LISTENING' ? 'animate-bounce' : ''}`} />
        </button>
      </div>

      {/* Background Assistant & Wake Word Controls */}
      <div className="space-y-3 px-1">
        <button
          onClick={() => {
            const next = !backgroundEnabled;
            setBackgroundEnabled(next);
            storageService.setBackgroundEnabled(next);
          }}
          className="w-full py-2.5 rounded-xl border border-slate-700/80 hover:bg-[#1E293B] text-xs font-medium text-slate-300 transition-colors"
        >
          {backgroundEnabled ? 'Stop background assistant' : 'Start background assistant'}
        </button>

        <div className="flex items-center justify-between p-1">
          <div>
            <div className="text-xs font-semibold text-slate-200">Require wake word</div>
            <div className="text-[11px] text-slate-400">
              Only act after hearing Priya, Hey Priya, or Hi Priya.
            </div>
          </div>
          <button
            onClick={() => {
              const next = !requireWakeWord;
              setRequireWakeWord(next);
              storageService.setWakeWordEnabled(next);
            }}
            className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
              requireWakeWord ? 'bg-purple-600' : 'bg-slate-700'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                requireWakeWord ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Conversation Card */}
      <div className="flex-1 rounded-3xl bg-[#111827]/95 border border-slate-800/90 p-4 sm:p-5 flex flex-col space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-slate-800/60">
          <h3 className="text-sm font-semibold text-white">Conversation</h3>
          {status === 'OFFLINE' && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <WifiOff className="w-3.5 h-3.5" />
              <span>Offline</span>
            </div>
          )}
        </div>

        {/* Message bubble stream */}
        <div className="flex-1 max-h-56 overflow-y-auto space-y-2.5 pr-1">
          {messages.length === 0 ? (
            <div className="h-28 flex items-center justify-center rounded-2xl bg-[#1E293B]/40 p-4 text-center">
              <p className="text-xs sm:text-sm text-slate-400">
                No messages yet. Ask Priya something to get started.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.isUser
                      ? 'bg-purple-600 text-white rounded-br-sm'
                      : 'bg-[#1E293B] text-slate-200 border border-slate-700/50 rounded-bl-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputText);
          }}
          className="flex items-center gap-2 pt-2 border-t border-slate-800/80"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Message Priya"
            className="flex-1 bg-[#070B16] border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || status === 'PROCESSING' || status === 'THINKING'}
            className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:hover:bg-purple-600 text-white transition-colors"
            title="Send"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
