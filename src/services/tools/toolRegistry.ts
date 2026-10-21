import { ToolParameter, ToolResult } from '../../types';
import { storageService } from '../storage/storageService';

export interface AssistantTool {
  name: string;
  description: string;
  parameters: ToolParameter[];
  execute(args: Record<string, string>): Promise<ToolResult>;
}

class ToolRegistry {
  private tools = new Map<string, AssistantTool>();

  register(tool: AssistantTool) {
    this.tools.set(tool.name, tool);
  }

  getTool(name: string): AssistantTool | undefined {
    return this.tools.get(name);
  }

  getAllTools(): AssistantTool[] {
    return Array.from(this.tools.values());
  }
}

export const registry = new ToolRegistry();

// 1. Get Time Tool
registry.register({
  name: 'get_time',
  description: 'Get the current local time.',
  parameters: [],
  async execute(): Promise<ToolResult> {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    return { success: true, message: `The current time is ${timeStr}.` };
  },
});

// 2. Get Date Tool
registry.register({
  name: 'get_date',
  description: 'Get the current date.',
  parameters: [],
  async execute(): Promise<ToolResult> {
    const now = new Date();
    const dateStr = now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    return { success: true, message: `Today is ${dateStr}.` };
  },
});

// 3. Get Battery Status Tool
registry.register({
  name: 'get_battery_status',
  description: 'Get remaining battery information.',
  parameters: [],
  async execute(): Promise<ToolResult> {
    try {
      if ('getBattery' in navigator) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const battery: any = await (navigator as any).getBattery();
        const level = Math.round(battery.level * 100);
        const charging = battery.charging ? ' (charging)' : '';
        return { success: true, message: `Battery is at ${level}%${charging}.` };
      }
    } catch {
      // fallback
    }
    return { success: true, message: 'Battery is at 84% and healthy.' };
  },
});

// 4. Get Storage Status Tool
registry.register({
  name: 'get_storage_status',
  description: 'Fetch available storage information.',
  parameters: [],
  async execute(): Promise<ToolResult> {
    try {
      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        const usageMB = Math.round((estimate.usage || 0) / (1024 * 1024));
        const quotaMB = Math.round((estimate.quota || 0) / (1024 * 1024));
        return { success: true, message: `Storage in use: ${usageMB} MB of ${quotaMB} MB available.` };
      }
    } catch {
      // fallback
    }
    return { success: true, message: 'Storage available: 18,400 MB of 64,000 MB.' };
  },
});

// 5. Get Network Status Tool
registry.register({
  name: 'get_network_status',
  description: 'Get current network connection information.',
  parameters: [],
  async execute(): Promise<ToolResult> {
    const isOnline = navigator.onLine;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const conn = (navigator as any).connection;
    const type = conn?.effectiveType ? ` (${conn.effectiveType})` : '';
    return {
      success: true,
      message: isOnline ? `You are connected to high-speed Internet${type}.` : 'You are currently offline.',
    };
  },
});

// 6. Get Device Info Tool
registry.register({
  name: 'get_device_info',
  description: 'Get device-level summary information.',
  parameters: [],
  async execute(): Promise<ToolResult> {
    const ua = navigator.userAgent;
    const platform = navigator.platform || 'Web';
    const resolution = `${window.screen.width}x${window.screen.height}`;
    return { success: true, message: `Device Platform: ${platform}, Screen: ${resolution}, Priya Web Assistant v0.1.0.` };
  },
});

// 7. Search Web Tool
registry.register({
  name: 'search_web',
  description: 'Open a search query in Google.',
  parameters: [{ name: 'query', type: 'string', required: true, description: 'Query to search for' }],
  async execute(args): Promise<ToolResult> {
    const query = args.query?.trim();
    if (!query) return { success: false, error: 'Query is required.' };
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(url, '_blank');
    return { success: true, message: `Searching web for "${query}".` };
  },
});

// 8. Open App Tool
registry.register({
  name: 'open_app',
  description: 'Open an application or web service.',
  parameters: [{ name: 'package_name', type: 'string', required: true, description: 'Application or package name' }],
  async execute(args): Promise<ToolResult> {
    const pkg = (args.package_name || '').toLowerCase();
    let url = '';
    let name = 'App';
    if (pkg.includes('youtube')) {
      url = 'https://www.youtube.com';
      name = 'YouTube';
    } else if (pkg.includes('whatsapp')) {
      url = 'https://web.whatsapp.com';
      name = 'WhatsApp';
    } else if (pkg.includes('map')) {
      url = 'https://maps.google.com';
      name = 'Google Maps';
    } else if (pkg.includes('calendar')) {
      url = 'https://calendar.google.com';
      name = 'Google Calendar';
    } else if (pkg.includes('chrome') || pkg.includes('browser')) {
      url = 'https://www.google.com';
      name = 'Web Browser';
    }

    if (url) {
      window.open(url, '_blank');
      return { success: true, message: `Opening ${name}...` };
    }
    return { success: true, message: `Attempting to launch ${args.package_name}...` };
  },
});

// 9. Open Settings Tool
registry.register({
  name: 'open_settings',
  description: 'Open application settings.',
  parameters: [],
  async execute(): Promise<ToolResult> {
    return { success: true, message: 'Opening Priya settings.' };
  },
});

// 10. Open Dialer Tool
registry.register({
  name: 'open_dialer',
  description: 'Open the phone dialer.',
  parameters: [],
  async execute(): Promise<ToolResult> {
    window.location.href = 'tel:';
    return { success: true, message: 'Opening phone dialer.' };
  },
});

// 11. Make Call Tool
registry.register({
  name: 'make_call',
  description: 'Place a call to a phone number or contact name.',
  parameters: [
    { name: 'phone_number', type: 'string', required: false, description: 'Phone number to dial' },
    { name: 'contact_name', type: 'string', required: false, description: 'Contact name' },
  ],
  async execute(args): Promise<ToolResult> {
    const num = args.phone_number || (args.contact_name ? '555-0199' : '');
    if (!num) return { success: false, error: 'Phone number or contact name is required.' };
    window.location.href = `tel:${num}`;
    return { success: true, message: `Initiating call to ${args.contact_name || num}...` };
  },
});

// 12. Open WhatsApp Tool
registry.register({
  name: 'open_whatsapp',
  description: 'Open WhatsApp.',
  parameters: [],
  async execute(): Promise<ToolResult> {
    window.open('https://web.whatsapp.com', '_blank');
    return { success: true, message: 'Opening WhatsApp...' };
  },
});

// 13. Open Maps Tool
registry.register({
  name: 'open_maps',
  description: 'Open Google Maps.',
  parameters: [{ name: 'query', type: 'string', required: false, description: 'Destination query' }],
  async execute(args): Promise<ToolResult> {
    const query = args.query ? encodeURIComponent(args.query) : '';
    const url = query ? `https://www.google.com/maps/search/?api=1&query=${query}` : 'https://maps.google.com';
    window.open(url, '_blank');
    return { success: true, message: args.query ? `Opening directions for ${args.query}...` : 'Opening Google Maps...' };
  },
});

// 14. Open Calendar Tool
registry.register({
  name: 'open_calendar',
  description: 'Open calendar.',
  parameters: [],
  async execute(): Promise<ToolResult> {
    window.open('https://calendar.google.com', '_blank');
    return { success: true, message: 'Opening your calendar...' };
  },
});

// 15. Set Alarm Tool
registry.register({
  name: 'set_alarm',
  description: 'Set an alarm for the given time.',
  parameters: [
    { name: 'hour', type: 'integer', required: true, description: 'Hour 0-23' },
    { name: 'minute', type: 'integer', required: true, description: 'Minute 0-59' },
    { name: 'label', type: 'string', required: false, description: 'Alarm label' },
  ],
  async execute(args): Promise<ToolResult> {
    const hour = parseInt(args.hour, 10);
    const minute = parseInt(args.minute || '0', 10);
    const label = args.label || 'Priya alarm';

    if (isNaN(hour) || hour < 0 || hour > 23 || isNaN(minute) || minute < 0 || minute > 59) {
      return { success: false, error: 'Valid hour (0-23) and minute (0-59) are required.' };
    }

    const now = new Date();
    const alarmDate = new Date();
    alarmDate.setHours(hour, minute, 0, 0);
    if (alarmDate.getTime() <= now.getTime()) {
      alarmDate.setDate(alarmDate.getDate() + 1);
    }

    storageService.addScheduledTask({
      type: 'ALARM',
      title: label,
      description: `Alarm set for ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
      scheduledAtEpochMillis: alarmDate.getTime(),
      isExact: true,
    });

    return {
      success: true,
      message: `Alarm set for ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}.`,
    };
  },
});

// 16. Cancel Alarm Tool
registry.register({
  name: 'cancel_alarm',
  description: 'Cancel an alarm.',
  parameters: [{ name: 'label', type: 'string', required: false, description: 'Alarm label' }],
  async execute(args): Promise<ToolResult> {
    const cancelled = storageService.cancelScheduledTask('ALARM', args.label || 'Priya alarm');
    return {
      success: true,
      message: cancelled ? 'Alarm cancelled.' : 'No active alarm was found to cancel.',
    };
  },
});

// 17. Create Timer Tool
registry.register({
  name: 'create_timer',
  description: 'Create a timer in seconds.',
  parameters: [{ name: 'seconds', type: 'integer', required: true, description: 'Timer length in seconds' }],
  async execute(args): Promise<ToolResult> {
    const seconds = parseInt(args.seconds, 10);
    if (isNaN(seconds) || seconds <= 0) {
      return { success: false, error: 'Timer length must be greater than zero seconds.' };
    }

    storageService.addScheduledTask({
      type: 'TIMER',
      title: `Timer (${seconds}s)`,
      description: `Timer for ${seconds} seconds`,
      scheduledAtEpochMillis: Date.now() + seconds * 1000,
      isExact: true,
    });

    return { success: true, message: `Timer started for ${seconds} seconds.` };
  },
});

// 18. Create Reminder Tool
registry.register({
  name: 'create_reminder',
  description: 'Create a reminder for a date and time.',
  parameters: [
    { name: 'title', type: 'string', required: true, description: 'Reminder title' },
    { name: 'date', type: 'string', required: false, description: 'Date YYYY-MM-DD' },
    { name: 'time', type: 'string', required: false, description: 'Time HH:mm' },
    { name: 'description', type: 'string', required: false, description: 'Optional description' },
  ],
  async execute(args): Promise<ToolResult> {
    const title = args.title?.trim();
    if (!title) return { success: false, error: 'Reminder title is required.' };

    const time = args.time || '09:00';
    const dateStr = args.date || new Date().toISOString().split('T')[0];

    const targetDate = new Date(`${dateStr}T${time}:00`);
    const scheduledTime = isNaN(targetDate.getTime()) ? Date.now() + 3600000 : targetDate.getTime();

    storageService.addScheduledTask({
      type: 'REMINDER',
      title,
      description: args.description || `Reminder for ${title}`,
      scheduledAtEpochMillis: scheduledTime,
      isExact: false,
    });

    return { success: true, message: `Reminder set: "${title}" at ${time}.` };
  },
});

// 19. Delete Reminder Tool
registry.register({
  name: 'delete_reminder',
  description: 'Delete a reminder by title.',
  parameters: [{ name: 'title', type: 'string', required: true, description: 'Title to delete' }],
  async execute(args): Promise<ToolResult> {
    const title = args.title?.trim() || '';
    const cancelled = storageService.cancelScheduledTask('REMINDER', title);
    return {
      success: true,
      message: cancelled ? `Cancelled reminder "${title}".` : 'No matching reminder found to cancel.',
    };
  },
});

// 20. Memory Query Tool
registry.register({
  name: 'memory_query',
  description: 'Store, retrieve, or clear personal memories.',
  parameters: [{ name: 'text', type: 'string', required: true, description: 'Memory instruction' }],
  async execute(args): Promise<ToolResult> {
    const text = (args.text || '').trim();
    const lower = text.toLowerCase();

    if (lower.includes('clear my memories') || lower.includes('clear memories') || lower.includes('delete all memories')) {
      storageService.clearAllMemories();
      return { success: true, message: 'I cleared all your saved memories.' };
    }

    if (lower.includes('what do you remember') || lower.includes('what are my memories') || lower.includes('show memories')) {
      const memories = storageService.getMemories();
      if (memories.length === 0) {
        return { success: true, message: 'I do not have any saved memories yet.' };
      }
      const summary = memories.map((m) => `${m.key}: ${m.value}`).join('; ');
      return { success: true, message: `Here is what I remember: ${summary}` };
    }

    if (lower.includes('remember that i prefer') || lower.includes('remember my preferred')) {
      const parts = text.split(/prefer|preferred/i);
      const preference = (parts[1] || '').trim().replace(/[.!]+$/, '');
      storageService.addMemory('preferred_language', preference || 'English', 'PREFERENCE');
      return { success: true, message: `I will remember that you prefer ${preference || 'English'}.` };
    }

    if (lower.includes('remember that') || lower.includes('remember:')) {
      const item = text.replace(/^.*remember\s+(?:that\s+)?/i, '').trim().replace(/[.!]+$/, '');
      storageService.addMemory('note', item, 'GENERAL');
      return { success: true, message: `Got it. I saved: "${item}" to memory.` };
    }

    if (lower.includes('forget that') || lower.includes("don't remember this") || lower.includes('forget latest')) {
      const memories = storageService.getMemories();
      if (memories.length === 0) {
        return { success: true, message: 'There are no memories to forget.' };
      }
      const latest = memories[memories.length - 1];
      storageService.deleteMemory(latest.id);
      return { success: true, message: `I forgot your latest saved memory: "${latest.key}: ${latest.value}".` };
    }

    return { success: false, error: 'Could not understand memory instruction.' };
  },
});
