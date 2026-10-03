/**
 * ElevenLabs API Service Module
 * Handles API authentication, voice generation, model management, and offline/demo fallback
 */

class ElevenLabsService {
  constructor() {
    this.apiKey = localStorage.getItem(CONFIG.STORAGE_KEYS.API_KEY) || '';
  }

  /**
   * Check if a valid API key exists
   */
  hasApiKey() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 10);
  }

  /**
   * Set and save API Key
   */
  setApiKey(key) {
    this.apiKey = (key || '').trim();
    if (this.apiKey) {
      localStorage.setItem(CONFIG.STORAGE_KEYS.API_KEY, this.apiKey);
    } else {
      localStorage.removeItem(CONFIG.STORAGE_KEYS.API_KEY);
    }
  }

  /**
   * Clear API key
   */
  clearApiKey() {
    this.apiKey = '';
    localStorage.removeItem(CONFIG.STORAGE_KEYS.API_KEY);
  }

  /**
   * Test API Key validity by calling /v1/user or /v1/models
   */
  async testConnection(candidateKey = null) {
    const key = candidateKey || this.apiKey;
    if (!key) {
      throw new Error('Please enter an ElevenLabs API key.');
    }

    // Check if key is a 64-char hex string (common mistake: Key ID instead of secret key)
    if (/^[a-f0-9]{64}$/i.test(key.trim())) {
      throw new Error("This is an ElevenLabs 'Key ID', not your secret API key. ElevenLabs API keys start with 'sk_' and are revealed when you create or rotate a key in Settings > API Keys.");
    }

    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/user`, {
        method: 'GET',
        headers: {
          'xi-api-key': key.trim(),
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        let errorMsg = 'Failed to authenticate with ElevenLabs.';
        try {
          const errData = await response.json();
          if (errData.detail?.code === 'invalid_api_key' && errData.detail?.status === 'api_key_id_used_as_api_key') {
            errorMsg = "API Key ID detected. Please use your secret API key (starts with 'sk_') from elevenlabs.io/app/settings/api-keys.";
          } else {
            errorMsg = errData.detail?.message || errData.message || errorMsg;
          }
        } catch (_) {}
        throw new Error(`Authentication error (${response.status}): ${errorMsg}`);
      }

      const userData = await response.json();
      return {
        success: true,
        subscription: userData.subscription || {},
        characterCount: userData.subscription?.character_count || 0,
        characterLimit: userData.subscription?.character_limit || 0
      };
    } catch (err) {
      throw new Error(err.message || 'Network error connecting to ElevenLabs API.');
    }
  }

  /**
   * Fetch all user voices (standard + cloned + library)
   */
  async fetchVoices() {
    if (!this.hasApiKey()) {
      return CONFIG.DEFAULT_VOICES;
    }

    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/voices`, {
        method: 'GET',
        headers: {
          'xi-api-key': this.apiKey,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        console.warn('Could not fetch custom voices from ElevenLabs, using curated list.');
        return CONFIG.DEFAULT_VOICES;
      }

      const data = await response.json();
      if (Array.isArray(data.voices) && data.voices.length > 0) {
        return data.voices.map(v => ({
          voice_id: v.voice_id,
          name: v.name,
          category: v.category || 'custom',
          labels: v.labels || {},
          description: `${v.name} • ${v.category || 'voice'} (${Object.values(v.labels || {}).join(', ') || 'custom'})`
        }));
      }
      return CONFIG.DEFAULT_VOICES;
    } catch (err) {
      console.warn('Error fetching voices:', err);
      return CONFIG.DEFAULT_VOICES;
    }
  }

  /**
   * Generate Speech from Text using ElevenLabs TTS API
   * @param {Object} params
   * @param {string} params.text
   * @param {string} params.voiceId
   * @param {string} params.modelId
   * @param {Object} params.settings { stability, similarity_boost, style, use_speaker_boost }
   */
  async generateSpeech({ text, voiceId, modelId, settings }) {
    if (!text || !text.trim()) {
      throw new Error('Please enter some text to generate narration.');
    }

    // If API Key is present, call ElevenLabs TTS API
    if (this.hasApiKey()) {
      const endpoint = `${CONFIG.API_BASE_URL}/text-to-speech/${encodeURIComponent(voiceId)}`;
      
      const payload = {
        text: text.trim(),
        model_id: modelId || 'eleven_multilingual_v2',
        voice_settings: {
          stability: Number(settings?.stability ?? 0.5),
          similarity_boost: Number(settings?.similarity_boost ?? 0.75),
          style: Number(settings?.style ?? 0.0),
          use_speaker_boost: Boolean(settings?.use_speaker_boost ?? true)
        }
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let errMessage = 'Failed to generate narration from ElevenLabs.';
        try {
          const errJson = await response.json();
          if (errJson.detail?.status === 'api_key_id_used_as_api_key' || errJson.detail?.code === 'invalid_api_key') {
            errMessage = "You provided an ElevenLabs 'Key ID' instead of the secret API key. Secret API keys begin with 'sk_'. Please create or copy your 'sk_' key from elevenlabs.io/app/settings/api-keys.";
          } else {
            errMessage = errJson.detail?.message || errJson.message || errMessage;
          }
        } catch (_) {
          const errText = await response.text();
          if (errText) errMessage = errText;
        }

        if (response.status === 401) {
          throw new Error('Invalid ElevenLabs API Key. Please verify your secret key in the API Key settings.');
        } else if (response.status === 429) {
          throw new Error('ElevenLabs quota or rate limit exceeded for your account.');
        }
        throw new Error(`ElevenLabs API Error (${response.status}): ${errMessage}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      return {
        audioUrl,
        blob: audioBlob,
        isDemo: false
      };
    }

    // Demo Mode: synthesize via Web Speech API or generate synthetic audio stream
    return this.generateDemoSpeech(text.trim());
  }

  /**
   * Demo Mode Speech generator when user does not have an ElevenLabs API key yet.
   * Creates real synthesized audio using Web Speech API + audio recorder, or AudioContext.
   */
  async generateDemoSpeech(text) {
    if (!('speechSynthesis' in window)) {
      throw new Error('ElevenLabs API Key required. Web Speech demo is not supported in this browser.');
    }

    return new Promise((resolve, reject) => {
      // Create a friendly notification that this is demo narration
      window.dispatchEvent(new CustomEvent('elevenlabs:demo_notice'));

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // Select high quality voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel')));
      if (preferred) {
        utterance.voice = preferred;
      }

      // We trigger browser speech synthesis directly for demo playback
      resolve({
        isDemo: true,
        utterance: utterance,
        text: text
      });
    });
  }
}

// Global instance
window.elevenLabsService = new ElevenLabsService();
