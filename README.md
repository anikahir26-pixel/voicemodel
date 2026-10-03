# 🎙️ ElevenLabs AI Narration Studio

A sleek, high-fidelity web application to transform any text content into hyper-realistic neural voice narration powered by the **ElevenLabs API**.

![ElevenLabs Studio](assets/preview.png)

---

## ✨ Features

- **Dynamic Text Input Canvas**:
  - Paste or write any length text content.
  - Live character count, word count, and estimated audio playback duration.
  - Quick-start presets: *Documentary*, *Sci-Fi Tale*, *Product Keynote*, and *Mindfulness*.
  - Instant clipboard paste and clear tools.

- **ElevenLabs Model Selection Dropdown**:
  - Choose between official ElevenLabs narration models:
    - `eleven_multilingual_v2`: Flagship model for high emotional depth & long-form narration (29 languages).
    - `eleven_flash_v2_5`: Ultra-fast model (~75ms latency) supporting 32 languages.
    - `eleven_turbo_v2_5`: High quality + low latency (~250ms).
    - `eleven_turbo_v2`: High-speed English delivery.
    - `eleven_monolingual_v1`: Classic stable narrator model.

- **Narrator Voice Selector & Sync**:
  - Preloaded with ElevenLabs' top standard voices (*Rachel, Adam, Bella, Antoni, Domi, Josh, Arnold, Daniel, Emily*).
  - **"Sync Voices"** button: Automatically queries your ElevenLabs account to load all your custom cloned voices and library voices!

- **Advanced Voice Fine-Tuning**:
  - Stability slider (0% to 100%)
  - Clarity / Similarity boost slider (0% to 100%)
  - Style Exaggeration slider (0% to 100%)
  - Speaker Boost toggle

- **Interactive Audio Player & Real-time Canvas Visualizer**:
  - Real-time frequency spectrum visualizer rendered via HTML5 Web Audio API.
  - Interactive audio scrubber timeline.
  - Playback speed control (0.75x, 1.0x, 1.25x, 1.5x, 2.0x).
  - Volume control and mute toggle.
  - **Download MP3** button for offline storage.

- **Narration History**:
  - Saves your recent audio generations with timestamp and model used.
  - One-click instant replay and re-download.

- **Instant Demo Mode**:
  - Test the entire interface right out of the box with browser voice synthesis even before entering your ElevenLabs API key.

---

## 🚀 Quick Start

### Option 1: Run with Python (Recommended)
You can start the built-in local server:

```powershell
py server.py
```

Then open your browser at:
```
http://localhost:8000
```

### Option 2: Open Directly in Browser
You can directly open `index.html` in any modern web browser (Google Chrome, Edge, Firefox, Brave, Safari).

---

## 🔑 Adding Your ElevenLabs API Key

1. Click the **API Key** button in the top navigation bar.
2. Paste your ElevenLabs API Key (starts with `xi-...` or `sk_...`).
   - If you don't have one, get 10,000 free characters every month at [elevenlabs.io](https://elevenlabs.io).
3. Click **Test Connection** to verify your subscription and quota.
4. Click **Save Key**. The studio is now connected directly to your ElevenLabs account!

---

## 🛠️ Technology Stack

- **Frontend**: Semantic HTML5, Modern ES6+ JavaScript, Web Audio API, Canvas API.
- **Styling**: Vanilla CSS3 with custom CSS variables, Glassmorphism, smooth animations, and responsive flex/grid layouts.
- **Backend / Server**: Lightweight Python HTTP server (`server.py`) with full CORS support.
