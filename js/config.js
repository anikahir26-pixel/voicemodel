/**
 * Configuration & Metadata for ElevenLabs Narration Studio
 */

const CONFIG = {
  // ElevenLabs API Base URL
  API_BASE_URL: 'https://api.elevenlabs.io/v1',

  // Official ElevenLabs Models
  MODELS: [
    {
      id: 'eleven_multilingual_v2',
      name: 'Eleven Multilingual v2',
      tag: 'Flagship • 29 Languages',
      badge: 'Multilingual v2',
      description: 'The premier model for rich emotional range, storytelling, long-form narration, and expressive nuance across 29 languages.'
    },
    {
      id: 'eleven_flash_v2_5',
      name: 'Eleven Flash v2.5',
      tag: 'Ultra-Fast • ~75ms Latency',
      badge: 'Flash v2.5',
      description: 'Revolutionary ultra-low latency model (~75ms) supporting 32 languages. Optimized for instantaneous real-time voice streaming.'
    },
    {
      id: 'eleven_turbo_v2_5',
      name: 'Eleven Turbo v2.5',
      tag: 'High Speed • 32 Languages',
      badge: 'Turbo v2.5',
      description: 'Combines premier acoustic quality with low latency (~250ms) across 32 languages. Perfect for fast audio generation.'
    },
    {
      id: 'eleven_turbo_v2',
      name: 'Eleven Turbo v2',
      tag: 'English Optimized • Low Latency',
      badge: 'Turbo v2',
      description: 'High-speed English model tuned for low latency and crisp verbal delivery in dynamic applications.'
    },
    {
      id: 'eleven_monolingual_v1',
      name: 'Eleven Monolingual v1',
      tag: 'Classic English • Stable',
      badge: 'Monolingual v1',
      description: 'The foundational ElevenLabs English model, renowned for stability and classic narrator tones.'
    }
  ],

  // Curated ElevenLabs Standard Voices
  DEFAULT_VOICES: [
    {
      voice_id: '21m00Tcm4TlvDq8ikWAM',
      name: 'Rachel',
      category: 'premade',
      labels: { accent: 'American', gender: 'female', age: 'young', descriptive: 'calm, conversational' },
      description: 'Rachel • Calm, natural, and expressive American female voice. Ideal for narration and audiobooks.'
    },
    {
      voice_id: 'pNInz6obpgDQGcFmaJgB',
      name: 'Adam',
      category: 'premade',
      labels: { accent: 'American', gender: 'male', age: 'middle-aged', descriptive: 'deep, narrative' },
      description: 'Adam • Deep, resonant, and commanding male voice. Perfect for documentaries and storytelling.'
    },
    {
      voice_id: 'AZnzlk1XvdvUeBnXmlld',
      name: 'Domi',
      category: 'premade',
      labels: { accent: 'American', gender: 'female', age: 'young', descriptive: 'strong, emphatic' },
      description: 'Domi • Confident, clear, and emphatic young female voice.'
    },
    {
      voice_id: 'EXAVITQu4vr4xnSDxMaL',
      name: 'Bella',
      category: 'premade',
      labels: { accent: 'American', gender: 'female', age: 'young', descriptive: 'soft, pleasant' },
      description: 'Bella • Soft, gentle, and warm female tone with nuanced pacing.'
    },
    {
      voice_id: 'ErXwobaYiN019PkySvjV',
      name: 'Antoni',
      category: 'premade',
      labels: { accent: 'American', gender: 'male', age: 'young', descriptive: 'warm, friendly' },
      description: 'Antoni • Warm, friendly, and well-rounded male voice. Great for explainers and guides.'
    },
    {
      voice_id: 'TxGEqnHWrfWFTfGW9XjX',
      name: 'Josh',
      category: 'premade',
      labels: { accent: 'American', gender: 'male', age: 'young', descriptive: 'deep, youthful' },
      description: 'Josh • Deep, smooth, and engaging male voice, well suited for modern media.'
    },
    {
      voice_id: 'VR6AewLTigWG4xSOukaG',
      name: 'Arnold',
      category: 'premade',
      labels: { accent: 'American', gender: 'male', age: 'middle-aged', descriptive: 'crisp, authoritative' },
      description: 'Arnold • Crisp, articulate, and authoritative narrator.'
    },
    {
      voice_id: 'onwK4e9ZLuTAKqWW03F9',
      name: 'Daniel',
      category: 'premade',
      labels: { accent: 'British', gender: 'male', age: 'middle-aged', descriptive: 'authoritative, news' },
      description: 'Daniel • British broadcaster voice, formal and authoritative.'
    },
    {
      voice_id: 'LcfcDJNUP1GQjkzn1xUU',
      name: 'Emily',
      category: 'premade',
      labels: { accent: 'American', gender: 'female', age: 'young', descriptive: 'meditation, soothing' },
      description: 'Emily • Gentle, empathetic, and meditative voice.'
    }
  ],

  // Sample Presets for instantaneous testing
  PRESETS: {
    documentary: `Deep beneath the turquoise waters of the Mariana Trench, life thrives in perpetual darkness. Here, bioluminescent creatures illuminate the abyssal depths like flickering stars in an ocean cosmos. Through immense pressure and sub-zero temperatures, nature crafts its most wondrous masterpieces.`,
    
    scifi: `The navigation telemetry blinked amber as the starship Horizon cleared the rings of Saturn. Captain Vance leaned forward, watching the solar winds shimmer against the electromagnetic deflector shields. "Set sub-light propulsion to maximum," he ordered quietly. "We have arrived."`,
    
    keynote: `Today, we are fundamentally redefining how humans interact with digital intelligence. By harmonizing neural generative models with contextual acoustic awareness, we bring you speech that breathes, pauses, and expresses real human emotional depth.`,
    
    meditation: `Close your eyes and take a slow, deep breath in through your nose. Hold for a gentle moment, and exhale completely. Feel the tension melt away from your shoulders as you allow yourself to be fully present in this very moment.`
  },

  // Storage Keys
  STORAGE_KEYS: {
    API_KEY: 'elevenlabs_api_key',
    HISTORY: 'elevenlabs_history_v1',
    SETTINGS: 'elevenlabs_user_settings'
  }
};
