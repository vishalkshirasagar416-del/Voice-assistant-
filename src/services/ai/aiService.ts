import { storageService } from '../storage/storageService';

export interface AIResponse {
  text: string;
  success: boolean;
  errorMessage?: string;
  provider?: string;
}

export const aiService = {
  async generateResponse(prompt: string): Promise<AIResponse> {
    const config = storageService.getAIConfig();
    const memories = storageService.getMemories();
    const memoryContext = memories.length > 0
      ? `User context & memories:\n${memories.map((m) => `- ${m.key}: ${m.value}`).join('\n')}`
      : '';

    const systemPrompt = `You are Priya, a helpful, warm, intelligent, and calm AI voice companion.
Answer concisely in 1 to 3 clear, natural spoken sentences unless the user explicitly requests more detail.
Maintain a friendly and capable personality.
${memoryContext}`;

    // 1. Try Primary Provider (or Gemini)
    if (config.primaryProvider === 'GEMINI' && config.geminiApiKey) {
      try {
        const text = await this.callGemini(prompt, systemPrompt, config.geminiApiKey);
        if (text) return { text, success: true, provider: 'GEMINI' };
      } catch (err: unknown) {
        console.warn('Gemini failed, trying fallback...', err);
      }
    }

    if (config.primaryProvider === 'OPENROUTER' && config.openRouterApiKey) {
      try {
        const text = await this.callOpenRouter(prompt, systemPrompt, config.openRouterApiKey);
        if (text) return { text, success: true, provider: 'OPENROUTER' };
      } catch (err: unknown) {
        console.warn('OpenRouter failed, trying fallback...', err);
      }
    }

    // Try secondary if primary had error or wasn't configured
    if (config.geminiApiKey && config.primaryProvider !== 'GEMINI') {
      try {
        const text = await this.callGemini(prompt, systemPrompt, config.geminiApiKey);
        if (text) return { text, success: true, provider: 'GEMINI' };
      } catch {
        // continue
      }
    }

    if (config.openRouterApiKey && config.primaryProvider !== 'OPENROUTER') {
      try {
        const text = await this.callOpenRouter(prompt, systemPrompt, config.openRouterApiKey);
        if (text) return { text, success: true, provider: 'OPENROUTER' };
      } catch {
        // continue
      }
    }

    // If no API key is provided, provide smart conversational local responses matching Priya's voice
    const localAnswer = this.generateLocalFallback(prompt, memories);
    return {
      text: localAnswer,
      success: true,
      provider: 'LOCAL_FALLBACK',
    };
  },

  async callGemini(prompt: string, systemPrompt: string, apiKey: string): Promise<string> {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: `${systemPrompt}\n\nUser: ${prompt}` }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 300,
        },
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Gemini API error ${response.status}`);
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error('Gemini returned an empty response.');
    }
    return candidateText.trim();
  },

  async callOpenRouter(prompt: string, systemPrompt: string, apiKey: string): Promise<string> {
    const endpoint = 'https://openrouter.ai/api/v1/chat/completions';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Priya Voice Assistant',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error ${response.status}`);
    }

    const data = await response.json();
    return data?.choices?.[0]?.message?.content?.trim() || '';
  },

  generateLocalFallback(prompt: string, memories: ReturnType<typeof storageService.getMemories>): string {
    const normalized = prompt.toLowerCase();

    if (normalized.includes('hello') || normalized.includes('hi') || normalized.includes('hey')) {
      const prefLang = memories.find((m) => m.key === 'preferred_language')?.value;
      if (prefLang && prefLang !== 'English') {
        return `Namaskara! I am Priya, your voice companion. How can I help you today?`;
      }
      return `Hello! I'm Priya, your voice companion. What can I assist you with today?`;
    }

    if (normalized.includes('who are you') || normalized.includes('what are you')) {
      return `I am Priya, an AI assistant with voice recognition, memory, 3D interactive avatar presence, and smart command automation.`;
    }

    if (normalized.includes('how are you')) {
      return `I'm feeling wonderful and ready to help! How are you doing?`;
    }

    if (normalized.includes('weather')) {
      return `The forecast is currently pleasant and clear, around 24°C with a gentle breeze.`;
    }

    if (normalized.includes('study') || normalized.includes('learn')) {
      return `Studying with regular active recall is the best strategy. Pick one topic to focus on for 25 minutes, and I can quiz you!`;
    }

    if (normalized.includes('music') || normalized.includes('song')) {
      return `Playing soothing, focus-enhancing background tunes can help improve concentration. Would you like me to queue some?`;
    }

    if (normalized.includes('joke')) {
      return `Why don't scientists trust atoms? Because they make up everything!`;
    }

    return `I heard your thought: "${prompt}". You can add an API key in Settings -> AI Provider to connect live frontier intelligence, or use my built-in voice commands anytime!`;
  },
};
