export type AssistantStatus =
  | 'IDLE'
  | 'LISTENING'
  | 'PROCESSING'
  | 'THINKING'
  | 'SPEAKING'
  | 'ERROR'
  | 'OFFLINE';

export type AudioState = 'IDLE' | 'RECORDING' | 'PROCESSING' | 'ERROR';

export interface AssistantMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: number;
  status?: AssistantStatus;
}

export type MemoryType = 'PREFERENCE' | 'ROUTINE' | 'STUDY' | 'GENERAL' | 'SYSTEM';

export interface MemoryRecord {
  id: string;
  type: MemoryType;
  key: string;
  value: string;
  importance: number;
  createdAt: number;
  updatedAt: number;
}

export type TaskType = 'REMINDER' | 'ALARM' | 'TIMER' | 'NOTIFICATION';

export type ScheduledTaskStatus = 'PENDING' | 'DISPATCHED' | 'CANCELLED' | 'MISSED';

export interface ScheduledTask {
  id: string;
  type: TaskType;
  title: string;
  description?: string;
  scheduledAtEpochMillis: number;
  status: ScheduledTaskStatus;
  createdAtEpochMillis: number;
  isExact?: boolean;
  isRecurring?: boolean;
}

export type AIProviderType = 'GEMINI' | 'OPENROUTER' | 'NONE';

export interface AIConfig {
  geminiApiKey: string;
  openRouterApiKey: string;
  elevenLabsApiKey: string;
  primaryProvider: AIProviderType;
  setupCompleted: boolean;
}

export type VoiceEnginePreference = 'AUTO' | 'ELEVENLABS' | 'KOKORO' | 'ANDROID_LOCAL';

export interface VoiceSettings {
  selectedVoiceEngine: VoiceEnginePreference;
  kokoroVoice: string;
  voiceSpeed: number;
  voicePitch: number;
  selectedVoiceURI?: string;
}

export type PriyaScreen =
  | 'splash'
  | 'ai_setup'
  | 'main_assistant'
  | 'settings'
  | 'permissions'
  | 'memory'
  | 'voice_settings';

export interface ToolParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface ToolResult {
  success: boolean;
  message?: string | null;
  error?: string | null;
  data?: Record<string, unknown>;
}

export interface ToolRequest {
  tool: string;
  arguments: Record<string, string>;
}

export interface RouteResult {
  intent: string;
  requiresLLM: boolean;
  toolRequest?: ToolRequest | null;
  toolResult?: ToolResult | null;
  finalResponse?: string | null;
}
