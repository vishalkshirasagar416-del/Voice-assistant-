import {
  AIConfig,
  AssistantMessage,
  MemoryRecord,
  ScheduledTask,
  VoiceSettings,
} from '../../types';

const STORAGE_KEYS = {
  AI_CONFIG: 'priya_ai_config',
  VOICE_SETTINGS: 'priya_voice_settings',
  MEMORIES: 'priya_memories',
  MESSAGES: 'priya_messages',
  SCHEDULED_TASKS: 'priya_scheduled_tasks',
  PERMISSIONS: 'priya_permissions',
  WAKE_WORD_ENABLED: 'priya_wake_word_enabled',
  BACKGROUND_ENABLED: 'priya_background_enabled',
};

const DEFAULT_AI_CONFIG: AIConfig = {
  geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
  openRouterApiKey: import.meta.env.VITE_OPENROUTER_API_KEY || '',
  elevenLabsApiKey: import.meta.env.VITE_ELEVENLABS_API_KEY || '',
  primaryProvider: 'GEMINI',
  setupCompleted: false,
};

const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  selectedVoiceEngine: 'AUTO',
  kokoroVoice: 'af_heart',
  voiceSpeed: 1.0,
  voicePitch: 1.0,
};

export const storageService = {
  getAIConfig(): AIConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AI_CONFIG);
      if (!data) return DEFAULT_AI_CONFIG;
      return { ...DEFAULT_AI_CONFIG, ...JSON.parse(data) };
    } catch {
      return DEFAULT_AI_CONFIG;
    }
  },

  saveAIConfig(config: AIConfig): void {
    localStorage.setItem(STORAGE_KEYS.AI_CONFIG, JSON.stringify(config));
  },

  getVoiceSettings(): VoiceSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.VOICE_SETTINGS);
      if (!data) return DEFAULT_VOICE_SETTINGS;
      return { ...DEFAULT_VOICE_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_VOICE_SETTINGS;
    }
  },

  saveVoiceSettings(settings: VoiceSettings): void {
    localStorage.setItem(STORAGE_KEYS.VOICE_SETTINGS, JSON.stringify(settings));
  },

  getMemories(): MemoryRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEMORIES);
      if (!data) {
        // Seed default initial memories if empty
        const initial: MemoryRecord[] = [
          {
            id: 'mem_1',
            type: 'PREFERENCE',
            key: 'preferred_language',
            value: 'English',
            importance: 0.8,
            createdAt: Date.now() - 86400000,
            updatedAt: Date.now() - 86400000,
          },
          {
            id: 'mem_2',
            type: 'ROUTINE',
            key: 'morning_briefing',
            value: 'Enabled at 8:00 AM',
            importance: 0.7,
            createdAt: Date.now() - 43200000,
            updatedAt: Date.now() - 43200000,
          },
        ];
        this.saveMemories(initial);
        return initial;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveMemories(memories: MemoryRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(memories));
  },

  addMemory(key: string, value: string, type: MemoryRecord['type'] = 'GENERAL'): MemoryRecord {
    const memories = this.getMemories();
    const existingIndex = memories.findIndex((m) => m.key.toLowerCase() === key.toLowerCase());
    const now = Date.now();
    let record: MemoryRecord;

    if (existingIndex >= 0) {
      record = {
        ...memories[existingIndex],
        value,
        type,
        updatedAt: now,
      };
      memories[existingIndex] = record;
    } else {
      record = {
        id: `mem_${now}_${Math.random().toString(36).substring(2, 7)}`,
        type,
        key,
        value,
        importance: 0.6,
        createdAt: now,
        updatedAt: now,
      };
      memories.push(record);
    }

    this.saveMemories(memories);
    return record;
  },

  deleteMemory(id: string): void {
    const memories = this.getMemories().filter((m) => m.id !== id);
    this.saveMemories(memories);
  },

  clearAllMemories(): void {
    this.saveMemories([]);
  },

  getMessages(): AssistantMessage[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveMessages(messages: AssistantMessage[]): void {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  },

  addMessage(message: AssistantMessage): void {
    const messages = this.getMessages();
    messages.push(message);
    this.saveMessages(messages.slice(-50)); // Keep last 50
  },

  clearMessages(): void {
    localStorage.removeItem(STORAGE_KEYS.MESSAGES);
  },

  getScheduledTasks(): ScheduledTask[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SCHEDULED_TASKS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveScheduledTasks(tasks: ScheduledTask[]): void {
    localStorage.setItem(STORAGE_KEYS.SCHEDULED_TASKS, JSON.stringify(tasks));
  },

  addScheduledTask(task: Omit<ScheduledTask, 'id' | 'createdAtEpochMillis' | 'status'>): ScheduledTask {
    const tasks = this.getScheduledTasks();
    const newTask: ScheduledTask = {
      ...task,
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      status: 'PENDING',
      createdAtEpochMillis: Date.now(),
    };
    tasks.push(newTask);
    this.saveScheduledTasks(tasks);
    return newTask;
  },

  cancelScheduledTask(type: ScheduledTask['type'], titleMatch?: string): boolean {
    const tasks = this.getScheduledTasks();
    let cancelled = false;
    const updated = tasks.map((t) => {
      if (t.type === type && t.status === 'PENDING') {
        if (!titleMatch || t.title.toLowerCase().includes(titleMatch.toLowerCase())) {
          cancelled = true;
          return { ...t, status: 'CANCELLED' as const };
        }
      }
      return t;
    });
    this.saveScheduledTasks(updated);
    return cancelled;
  },

  getPermissions(): Record<string, boolean> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PERMISSIONS);
      return data
        ? JSON.parse(data)
        : {
            Microphone: true,
            Notifications: true,
            'Contacts and phone': true,
            Location: true,
            Calendar: true,
          };
    } catch {
      return {};
    }
  },

  setPermission(name: string, granted: boolean): void {
    const perms = this.getPermissions();
    perms[name] = granted;
    localStorage.setItem(STORAGE_KEYS.PERMISSIONS, JSON.stringify(perms));
  },

  getWakeWordEnabled(): boolean {
    return localStorage.getItem(STORAGE_KEYS.WAKE_WORD_ENABLED) === 'true';
  },

  setWakeWordEnabled(val: boolean): void {
    localStorage.setItem(STORAGE_KEYS.WAKE_WORD_ENABLED, String(val));
  },

  getBackgroundEnabled(): boolean {
    return localStorage.getItem(STORAGE_KEYS.BACKGROUND_ENABLED) === 'true';
  },

  setBackgroundEnabled(val: boolean): void {
    localStorage.setItem(STORAGE_KEYS.BACKGROUND_ENABLED, String(val));
  },
};
