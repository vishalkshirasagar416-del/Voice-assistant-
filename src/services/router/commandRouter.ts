import { RouteResult, ToolRequest } from '../../types';
import { registry } from '../tools/toolRegistry';

export class LocalIntentClassifier {
  classify(input: string): { intent: string; requiresLLM: boolean; toolRequest?: ToolRequest | null; confidence: number } {
    const text = input.trim();
    if (!text) {
      return { intent: 'CONVERSATION', requiresLLM: true, confidence: 0 };
    }

    const normalized = text.toLowerCase();

    // Time
    if (this.hasAny(normalized, 'what time', 'current time', 'time is it', 'what is the time')) {
      return {
        intent: 'SYSTEM_STATUS',
        requiresLLM: false,
        toolRequest: { tool: 'get_time', arguments: {} },
        confidence: 0.98,
      };
    }

    // Battery
    if (this.hasAny(normalized, 'battery', 'power level', 'how much battery', "what's my battery", 'battery status')) {
      return {
        intent: 'SYSTEM_STATUS',
        requiresLLM: false,
        toolRequest: { tool: 'get_battery_status', arguments: {} },
        confidence: 0.97,
      };
    }

    // Date
    if (this.hasAny(normalized, "today's date", 'what date', 'day is it', 'current date', 'what day')) {
      return {
        intent: 'SYSTEM_STATUS',
        requiresLLM: false,
        toolRequest: { tool: 'get_date', arguments: {} },
        confidence: 0.95,
      };
    }

    // Network
    if (this.hasAny(normalized, 'network', 'signal', 'wifi', 'mobile data', 'internet connection')) {
      return {
        intent: 'SYSTEM_STATUS',
        requiresLLM: false,
        toolRequest: { tool: 'get_network_status', arguments: {} },
        confidence: 0.94,
      };
    }

    // Storage
    if (this.hasAny(normalized, 'storage', 'disk space', 'available storage', 'memory space')) {
      return {
        intent: 'SYSTEM_STATUS',
        requiresLLM: false,
        toolRequest: { tool: 'get_storage_status', arguments: {} },
        confidence: 0.93,
      };
    }

    // Device
    if (this.hasAny(normalized, 'device info', 'what phone', 'what device', 'tell me about this device', 'specs')) {
      return {
        intent: 'SYSTEM_STATUS',
        requiresLLM: false,
        toolRequest: { tool: 'get_device_info', arguments: {} },
        confidence: 0.92,
      };
    }

    // Search Web
    if (this.hasAny(normalized, 'search for', 'find the latest', 'look up', 'search web', 'google')) {
      const query = this.extractSearchQuery(text);
      return {
        intent: 'WEB_SEARCH',
        requiresLLM: false,
        toolRequest: { tool: 'search_web', arguments: { query } },
        confidence: 0.91,
      };
    }

    // Open App
    if (this.hasAny(normalized, 'open youtube', 'launch youtube', 'start youtube') ||
        (normalized.startsWith('open ') && !normalized.includes('settings') && !normalized.includes('calendar') && !normalized.includes('dialer') && !normalized.includes('maps') && !normalized.includes('whatsapp'))) {
      const appName = text.replace(/^open\s+/i, '').trim();
      return {
        intent: 'ANDROID_ACTION',
        requiresLLM: false,
        toolRequest: { tool: 'open_app', arguments: { package_name: appName } },
        confidence: 0.9,
      };
    }

    // Open Settings
    if (this.hasAny(normalized, 'open settings', 'go to settings', 'settings app', 'configure')) {
      return {
        intent: 'ANDROID_ACTION',
        requiresLLM: false,
        toolRequest: { tool: 'open_settings', arguments: {} },
        confidence: 0.95,
      };
    }

    // Dialer / Call
    if (this.hasAny(normalized, 'open dialer', 'open phone', 'dial pad', 'keypad')) {
      return {
        intent: 'ANDROID_ACTION',
        requiresLLM: false,
        toolRequest: { tool: 'open_dialer', arguments: {} },
        confidence: 0.93,
      };
    }

    if (this.hasAny(normalized, 'call ', 'dial ', 'make a call', 'phone ')) {
      const target = text.replace(/^(?:call|dial|phone|make a call to)\s+/i, '').trim();
      return {
        intent: 'CALL',
        requiresLLM: false,
        toolRequest: { tool: 'make_call', arguments: { contact_name: target, phone_number: target } },
        confidence: 0.89,
      };
    }

    // WhatsApp / Message
    if (this.hasAny(normalized, 'whatsapp', 'send a message', 'text message', 'open chat')) {
      return {
        intent: 'MESSAGE',
        requiresLLM: false,
        toolRequest: { tool: 'open_whatsapp', arguments: {} },
        confidence: 0.88,
      };
    }

    // Maps
    if (this.hasAny(normalized, 'open maps', 'show me directions', 'directions to', 'navigate to', 'map of')) {
      const query = text.replace(/^(?:open maps|show me directions|directions to|navigate to|map of)\s*/i, '').trim();
      return {
        intent: 'ANDROID_ACTION',
        requiresLLM: false,
        toolRequest: { tool: 'open_maps', arguments: { query } },
        confidence: 0.9,
      };
    }

    // Calendar
    if (this.hasAny(normalized, 'open calendar', 'my schedule', 'upcoming events', 'calendar')) {
      return {
        intent: 'CALENDAR',
        requiresLLM: false,
        toolRequest: { tool: 'open_calendar', arguments: {} },
        confidence: 0.9,
      };
    }

    // Alarm
    if (this.hasAny(normalized, 'set alarm', 'wake me up', 'alarm at')) {
      const time = this.extractClockTime(text);
      return {
        intent: 'ALARM',
        requiresLLM: false,
        toolRequest: {
          tool: 'set_alarm',
          arguments: {
            hour: String(time ? time[0] : 8),
            minute: String(time ? time[1] : 0),
            label: 'Priya alarm',
          },
        },
        confidence: 0.9,
      };
    }

    if (this.hasAny(normalized, 'cancel alarm', 'stop alarm', 'delete alarm')) {
      return {
        intent: 'ALARM',
        requiresLLM: false,
        toolRequest: { tool: 'cancel_alarm', arguments: { label: 'Priya alarm' } },
        confidence: 0.92,
      };
    }

    // Timer
    if (this.hasAny(normalized, 'set timer', 'start timer', 'timer for', 'countdown')) {
      const seconds = this.extractDurationSeconds(text) || 60;
      return {
        intent: 'REMINDER',
        requiresLLM: false,
        toolRequest: { tool: 'create_timer', arguments: { seconds: String(seconds) } },
        confidence: 0.91,
      };
    }

    // Reminder
    if (this.hasAny(normalized, 'cancel reminder', 'delete reminder', 'forget reminder')) {
      const title = this.extractReminderTitle(text);
      return {
        intent: 'REMINDER',
        requiresLLM: false,
        toolRequest: { tool: 'delete_reminder', arguments: { title } },
        confidence: 0.9,
      };
    }

    if (this.hasAny(normalized, 'remind me', 'set a reminder', 'create reminder')) {
      const title = this.extractReminderTitle(text);
      return {
        intent: 'REMINDER',
        requiresLLM: false,
        toolRequest: {
          tool: 'create_reminder',
          arguments: {
            title,
            time: '09:00',
          },
        },
        confidence: 0.88,
      };
    }

    // Memory
    if (this.hasAny(normalized, 'remember', 'what do you remember', 'forget that', 'clear memories', 'my memories')) {
      return {
        intent: 'MEMORY',
        requiresLLM: false,
        toolRequest: { tool: 'memory_query', arguments: { text } },
        confidence: 0.88,
      };
    }

    // Coding
    if (this.hasAny(normalized, 'write code', 'debug', 'fix bug', 'implement', 'refactor', 'javascript', 'python', 'kotlin', 'react')) {
      return {
        intent: 'CODING',
        requiresLLM: true,
        confidence: 0.75,
      };
    }

    // Study
    if (this.hasAny(normalized, 'study', 'learn', 'quiz', 'teach me', 'explain', 'what is', 'how does', 'why is')) {
      return {
        intent: 'STUDY',
        requiresLLM: true,
        confidence: 0.78,
      };
    }

    return {
      intent: 'CONVERSATION',
      requiresLLM: true,
      confidence: 0.5,
    };
  }

  private hasAny(text: string, ...phrases: string[]): boolean {
    return phrases.some((p) => text.includes(p));
  }

  private extractSearchQuery(text: string): string {
    const after = text
      .replace(/^(?:search for|find the latest|latest|look up|search web for|google)\s*/i, '')
      .trim();
    return after.replace(/[.]+$/, '').trim() || text;
  }

  private extractReminderTitle(text: string): string {
    const cleaned = text
      .replace(/^(?:remind me to|set a reminder to|set a reminder for|cancel reminder|delete reminder)\s*/i, '')
      .trim();
    return cleaned.replace(/[.]+$/, '').slice(0, 100) || 'Reminder';
  }

  private extractClockTime(text: string): [number, number] | null {
    const match = text.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i);
    if (!match) return null;
    let hour = parseInt(match[1], 10);
    const minute = match[2] ? parseInt(match[2], 10) : 0;
    const meridiem = (match[3] || '').toLowerCase();
    if (isNaN(hour) || hour < 0 || hour > 23 || isNaN(minute) || minute < 0 || minute > 59) return null;
    if (meridiem === 'pm' && hour < 12) hour += 12;
    if (meridiem === 'am' && hour === 12) hour = 0;
    return [hour, minute];
  }

  private extractDurationSeconds(text: string): number | null {
    const match = text.match(/\b(\d+(?:\.\d+)?)\s*(second|seconds|minute|minutes|hour|hours)\b/i);
    if (!match) return null;
    const val = parseFloat(match[1]);
    if (isNaN(val)) return null;
    const unit = match[2].toLowerCase();
    if (unit.startsWith('sec')) return Math.round(val);
    if (unit.startsWith('min')) return Math.round(val * 60);
    if (unit.startsWith('hour')) return Math.round(val * 3600);
    return null;
  }
}

export class CommandRouter {
  private classifier = new LocalIntentClassifier();

  async route(input: string): Promise<RouteResult> {
    const decision = this.classifier.classify(input);

    if (decision.toolRequest) {
      const tool = registry.getTool(decision.toolRequest.tool);
      if (tool) {
        try {
          const result = await tool.execute(decision.toolRequest.arguments);
          return {
            intent: decision.intent,
            requiresLLM: false,
            toolRequest: decision.toolRequest,
            toolResult: result,
            finalResponse: result.message || result.error || 'Done.',
          };
        } catch (e: unknown) {
          const err = e instanceof Error ? e.message : 'Tool execution failed.';
          return {
            intent: decision.intent,
            requiresLLM: false,
            toolRequest: decision.toolRequest,
            toolResult: { success: false, error: err },
            finalResponse: err,
          };
        }
      }
    }

    return {
      intent: decision.intent,
      requiresLLM: true,
      toolRequest: null,
      toolResult: null,
      finalResponse: null,
    };
  }
}

export const commandRouter = new CommandRouter();
