/**
 * Main Application Orchestrator for ElevenLabs Narration Studio
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const textInput = document.getElementById('textInput');
  const charCountEl = document.getElementById('charCount');
  const wordCountEl = document.getElementById('wordCount');
  const estDurationEl = document.getElementById('estDuration');
  const btnPasteClipboard = document.getElementById('btnPasteClipboard');
  const btnClearText = document.getElementById('btnClearText');
  const presetButtons = document.querySelectorAll('.chip-btn');

  const modelSelect = document.getElementById('modelSelect');
  const modelTagBadge = document.getElementById('modelTagBadge');
  const modelDescription = document.getElementById('modelDescription');

  const voiceSelect = document.getElementById('voiceSelect');
  const voiceDescription = document.getElementById('voiceDescription');
  const btnRefreshVoices = document.getElementById('btnRefreshVoices');

  const accordionToggle = document.getElementById('accordionToggle');
  const settingsAccordion = document.getElementById('settingsAccordion');

  const stabilitySlider = document.getElementById('stabilitySlider');
  const stabilityVal = document.getElementById('stabilityVal');
  const similaritySlider = document.getElementById('similaritySlider');
  const similarityVal = document.getElementById('similarityVal');
  const styleSlider = document.getElementById('styleSlider');
  const styleVal = document.getElementById('styleVal');
  const speakerBoostToggle = document.getElementById('speakerBoostToggle');

  const btnPlayNarration = document.getElementById('btnPlayNarration');
  const playBtnText = document.getElementById('playBtnText');
  const playBtnIcon = document.getElementById('playBtnIcon');
  const playSpinner = document.getElementById('playSpinner');

  const btnPauseResume = document.getElementById('btnPauseResume');
  const pauseResumeIcon = document.getElementById('pauseResumeIcon');
  const btnStopNarration = document.getElementById('btnStopNarration');
  const liveStatusDot = document.getElementById('liveStatusDot');
  const liveStatusText = document.getElementById('liveStatusText');

  const nativeAudio = document.getElementById('nativeAudioPlayer');
  const currentTimeEl = document.getElementById('currentTime');
  const totalDurationEl = document.getElementById('totalDuration');
  const seekBarContainer = document.getElementById('seekBarContainer');
  const seekProgress = document.getElementById('seekProgress');
  const seekHandle = document.getElementById('seekHandle');

  const volumeSlider = document.getElementById('volumeSlider');
  const btnMuteToggle = document.getElementById('btnMuteToggle');
  const volumeIcon = document.getElementById('volumeIcon');
  const playbackRateSelect = document.getElementById('playbackRateSelect');
  const btnDownloadAudio = document.getElementById('btnDownloadAudio');

  const historyList = document.getElementById('historyList');
  const historyEmpty = document.getElementById('historyEmpty');
  const btnClearHistory = document.getElementById('btnClearHistory');

  const apiStatusBadge = document.getElementById('apiStatusBadge');
  const apiStatusDot = document.getElementById('apiStatusDot');
  const apiStatusLabel = document.getElementById('apiStatusLabel');
  const btnOpenApiKeyModal = document.getElementById('btnOpenApiKeyModal');

  const apiKeyModal = document.getElementById('apiKeyModal');
  const btnCloseApiKeyModal = document.getElementById('btnCloseApiKeyModal');
  const apiKeyInput = document.getElementById('apiKeyInput');
  const btnToggleApiKeyVisibility = document.getElementById('btnToggleApiKeyVisibility');
  const eyeIcon = document.getElementById('eyeIcon');
  const btnTestApiKey = document.getElementById('btnTestApiKey');
  const btnSaveApiKey = document.getElementById('btnSaveApiKey');
  const btnRemoveApiKey = document.getElementById('btnRemoveApiKey');
  const apiTestResult = document.getElementById('apiTestResult');

  // Application State
  const state = {
    voices: CONFIG.DEFAULT_VOICES,
    currentBlob: null,
    currentAudioUrl: null,
    activeDemoUtterance: null,
    isDemoRunning: false,
    history: JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.HISTORY) || '[]'),
    visualizer: new AudioVisualizer('audioVisualizer', nativeAudio)
  };

  /* =========================================================================
     1. Initialization & UI Populating
     ========================================================================= */

  function initApp() {
    updateApiStatusBadge();
    populateModelDescriptions();
    populateVoiceDropdown(state.voices);
    renderHistory();
    updateTextStats();

    // Default to documentary preset if empty
    if (!textInput.value.trim()) {
      textInput.value = CONFIG.PRESETS.documentary;
      updateTextStats();
    }
  }

  function updateApiStatusBadge() {
    if (window.elevenLabsService.hasApiKey()) {
      apiStatusDot.classList.add('connected');
      apiStatusLabel.textContent = 'API Key Connected';
      apiStatusBadge.title = 'ElevenLabs API Key configured and active.';
    } else {
      apiStatusDot.classList.remove('connected');
      apiStatusLabel.textContent = 'Demo Mode (No Key)';
      apiStatusBadge.title = 'Click to configure your ElevenLabs API Key';
    }
  }

  function populateModelDescriptions() {
    const selectedModelId = modelSelect.value;
    const model = CONFIG.MODELS.find(m => m.id === selectedModelId);
    if (model) {
      modelTagBadge.textContent = model.badge;
      modelDescription.textContent = model.description;
    }
  }

  function populateVoiceDropdown(voices) {
    voiceSelect.innerHTML = '';
    voices.forEach(voice => {
      const option = document.createElement('option');
      option.value = voice.voice_id;
      const gender = voice.labels?.gender ? ` (${voice.labels.gender})` : '';
      const category = voice.category === 'cloned' ? ' ✦ Cloned' : '';
      option.textContent = `${voice.name}${gender}${category}`;
      voiceSelect.appendChild(option);
    });

    updateVoiceDescription();
  }

  function updateVoiceDescription() {
    const selectedVoiceId = voiceSelect.value;
    const voice = state.voices.find(v => v.voice_id === selectedVoiceId);
    if (voice) {
      voiceDescription.textContent = voice.description || `${voice.name} voice`;
    }
  }

  /* =========================================================================
     2. Text Input & Preset Management
     ========================================================================= */

  function updateTextStats() {
    const text = textInput.value || '';
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    
    // Average speech rate is ~140 words per minute => ~2.3 words/sec
    const estSec = Math.round((words / 140) * 60);

    charCountEl.textContent = `${chars.toLocaleString()} character${chars === 1 ? '' : 's'}`;
    wordCountEl.textContent = `${words.toLocaleString()} word${words === 1 ? '' : 's'}`;
    
    if (estSec < 60) {
      estDurationEl.textContent = `~${estSec}s audio`;
    } else {
      const mins = Math.floor(estSec / 60);
      const secs = estSec % 60;
      estDurationEl.textContent = `~${mins}m ${secs}s audio`;
    }
  }

  textInput.addEventListener('input', updateTextStats);

  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const presetKey = btn.dataset.preset;
      if (CONFIG.PRESETS[presetKey]) {
        textInput.value = CONFIG.PRESETS[presetKey];
        updateTextStats();
        showToast(`Loaded "${btn.textContent.trim()}" preset.`, 'info');
      }
    });
  });

  btnPasteClipboard.addEventListener('click', async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        textInput.value = clipText;
        updateTextStats();
        showToast('Pasted content from clipboard.', 'success');
      } else {
        showToast('Clipboard is empty.', 'info');
      }
    } catch (_) {
      // Fallback
      showToast('Please press Ctrl+V to paste your script.', 'info');
    }
  });

  btnClearText.addEventListener('click', () => {
    textInput.value = '';
    updateTextStats();
    textInput.focus();
  });

  /* =========================================================================
     3. Model & Voice Selection Handlers
     ========================================================================= */

  modelSelect.addEventListener('change', () => {
    populateModelDescriptions();
  });

  voiceSelect.addEventListener('change', () => {
    updateVoiceDescription();
  });

  btnRefreshVoices.addEventListener('click', async () => {
    btnRefreshVoices.disabled = true;
    btnRefreshVoices.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Syncing...';

    try {
      const voices = await window.elevenLabsService.fetchVoices();
      state.voices = voices;
      populateVoiceDropdown(voices);
      showToast(`Synchronized ${voices.length} voices from ElevenLabs.`, 'success');
    } catch (err) {
      showToast('Could not sync voices: ' + err.message, 'error');
    } finally {
      btnRefreshVoices.disabled = false;
      btnRefreshVoices.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> Sync Voices';
    }
  });

  /* =========================================================================
     4. Settings Accordion & Sliders
     ========================================================================= */

  accordionToggle.addEventListener('click', () => {
    settingsAccordion.classList.toggle('expanded');
  });

  stabilitySlider.addEventListener('input', (e) => {
    stabilityVal.textContent = `${e.target.value}%`;
  });

  similaritySlider.addEventListener('input', (e) => {
    similarityVal.textContent = `${e.target.value}%`;
  });

  styleSlider.addEventListener('input', (e) => {
    styleVal.textContent = `${e.target.value}%`;
  });

  /* =========================================================================
     5. Narration Generation & Playback Trigger
     ========================================================================= */

  btnPlayNarration.addEventListener('click', async () => {
    const text = textInput.value.trim();
    if (!text) {
      showToast('Please enter text content before starting narration.', 'error');
      textInput.focus();
      return;
    }

    // If already playing native audio, resume or restart
    if (nativeAudio.paused && nativeAudio.src && !nativeAudio.ended && !state.isDemoRunning) {
      try {
        await nativeAudio.play();
        setPlaybackUiState('playing');
        return;
      } catch (_) {}
    }

    // Start Generation
    setGeneratingState(true);
    updateStatus('Synthesizing speech with ElevenLabs model...', 'loading');

    const voiceId = voiceSelect.value;
    const modelId = modelSelect.value;
    const voiceSettings = {
      stability: Number(stabilitySlider.value) / 100,
      similarity_boost: Number(similaritySlider.value) / 100,
      style: Number(styleSlider.value) / 100,
      use_speaker_boost: speakerBoostToggle.checked
    };

    try {
      const result = await window.elevenLabsService.generateSpeech({
        text,
        voiceId,
        modelId,
        settings: voiceSettings
      });

      if (result.isDemo) {
        // Run Demo Audio via SpeechSynthesis
        handleDemoPlayback(result.utterance, text, modelId);
      } else {
        // Run Real ElevenLabs Audio Blob
        handleElevenLabsAudio(result.audioUrl, result.blob, text, modelId, voiceId);
      }
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
      updateStatus('Generation failed', 'error');
      setGeneratingState(false);
    }
  });

  function setGeneratingState(isGenerating) {
    if (isGenerating) {
      btnPlayNarration.disabled = true;
      playSpinner.style.display = 'inline-block';
      playBtnIcon.style.display = 'none';
      playBtnText.textContent = 'Synthesizing...';
    } else {
      btnPlayNarration.disabled = false;
      playSpinner.style.display = 'none';
      playBtnIcon.style.display = 'inline-block';
      playBtnText.textContent = 'Play Narration';
    }
  }

  function updateStatus(text, type = 'idle') {
    liveStatusText.textContent = text;
    liveStatusDot.className = 'live-status-dot';
    if (type === 'active') {
      liveStatusDot.classList.add('active');
    } else if (type === 'loading') {
      liveStatusDot.classList.add('loading');
    }
  }

  function setPlaybackUiState(state) {
    if (state === 'playing') {
      btnPauseResume.disabled = false;
      btnStopNarration.disabled = false;
      pauseResumeIcon.className = 'fa-solid fa-pause';
      updateStatus('Playing narration...', 'active');
      playBtnIcon.className = 'fa-solid fa-rotate-right';
      playBtnText.textContent = 'Replay Narration';
    } else if (state === 'paused') {
      btnPauseResume.disabled = false;
      pauseResumeIcon.className = 'fa-solid fa-play';
      updateStatus('Playback paused', 'idle');
    } else if (state === 'stopped') {
      btnPauseResume.disabled = true;
      btnStopNarration.disabled = true;
      pauseResumeIcon.className = 'fa-solid fa-pause';
      updateStatus('Ready to narrate', 'idle');
      playBtnIcon.className = 'fa-solid fa-play';
      playBtnText.textContent = 'Play Narration';
    }
  }

  /* =========================================================================
     6. ElevenLabs Real Audio Playback Handler
     ========================================================================= */

  async function handleElevenLabsAudio(audioUrl, blob, text, modelId, voiceId) {
    // Revoke previous URL if any
    if (state.currentAudioUrl && state.currentAudioUrl !== audioUrl) {
      URL.revokeObjectURL(state.currentAudioUrl);
    }

    state.currentAudioUrl = audioUrl;
    state.currentBlob = blob;

    nativeAudio.src = audioUrl;
    btnDownloadAudio.disabled = false;

    // Connect Web Audio API visualizer
    state.visualizer.setupAudioContext();

    try {
      await nativeAudio.play();
      setGeneratingState(false);
      setPlaybackUiState('playing');
      state.visualizer.start();

      // Add to history
      const selectedVoice = state.voices.find(v => v.voice_id === voiceId);
      addToHistory({
        text,
        modelId,
        voiceName: selectedVoice ? selectedVoice.name : 'ElevenLabs Voice',
        audioUrl,
        blob,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      showToast('Narration generated successfully with ElevenLabs!', 'success');
    } catch (playErr) {
      console.warn('Auto-play blocked or failed:', playErr);
      setGeneratingState(false);
      setPlaybackUiState('paused');
      showToast('Audio ready. Click Play to listen.', 'info');
    }
  }

  /* =========================================================================
     7. Demo Mode Fallback Handler
     ========================================================================= */

  function handleDemoPlayback(utterance, text, modelId) {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    state.isDemoRunning = true;
    state.activeDemoUtterance = utterance;

    utterance.onstart = () => {
      setGeneratingState(false);
      setPlaybackUiState('playing');
      state.visualizer.startSimulation();
      showToast('Playing in Demo Mode. Add your ElevenLabs API Key to unlock neural voice models!', 'info');
    };

    utterance.onend = () => {
      state.isDemoRunning = false;
      state.activeDemoUtterance = null;
      setPlaybackUiState('stopped');
      state.visualizer.stop();
    };

    utterance.onerror = (err) => {
      console.warn('SpeechSynthesis error:', err);
      state.isDemoRunning = false;
      setGeneratingState(false);
      setPlaybackUiState('stopped');
      state.visualizer.stop();
    };

    window.speechSynthesis.speak(utterance);

    // Save demo to history
    addToHistory({
      text,
      modelId: `${modelId} (Demo)`,
      voiceName: 'Browser TTS (Demo)',
      isDemo: true,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  }

  /* =========================================================================
     8. Audio Player & Timeline Scrubber Controls
     ========================================================================= */

  btnPauseResume.addEventListener('click', () => {
    if (state.isDemoRunning) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setPlaybackUiState('playing');
        state.visualizer.startSimulation();
      } else {
        window.speechSynthesis.pause();
        setPlaybackUiState('paused');
        state.visualizer.stop();
      }
      return;
    }

    if (nativeAudio.src) {
      if (nativeAudio.paused) {
        nativeAudio.play();
        setPlaybackUiState('playing');
        state.visualizer.start();
      } else {
        nativeAudio.pause();
        setPlaybackUiState('paused');
        state.visualizer.stop();
      }
    }
  });

  btnStopNarration.addEventListener('click', () => {
    if (state.isDemoRunning) {
      window.speechSynthesis.cancel();
      state.isDemoRunning = false;
    }

    if (nativeAudio.src) {
      nativeAudio.pause();
      nativeAudio.currentTime = 0;
    }

    state.visualizer.stop();
    setPlaybackUiState('stopped');
  });

  nativeAudio.addEventListener('timeupdate', () => {
    if (!nativeAudio.duration) return;
    const progress = (nativeAudio.currentTime / nativeAudio.duration) * 100;
    seekProgress.style.width = `${progress}%`;
    seekHandle.style.left = `${progress}%`;

    currentTimeEl.textContent = formatTime(nativeAudio.currentTime);
    totalDurationEl.textContent = formatTime(nativeAudio.duration);
  });

  nativeAudio.addEventListener('ended', () => {
    state.visualizer.stop();
    setPlaybackUiState('stopped');
  });

  seekBarContainer.addEventListener('click', (e) => {
    if (!nativeAudio.duration) return;
    const rect = seekBarContainer.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    nativeAudio.currentTime = ratio * nativeAudio.duration;
  });

  volumeSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    nativeAudio.volume = val;
    updateVolumeIcon(val);
  });

  btnMuteToggle.addEventListener('click', () => {
    if (nativeAudio.volume > 0) {
      nativeAudio.dataset.lastVol = nativeAudio.volume;
      nativeAudio.volume = 0;
      volumeSlider.value = 0;
      updateVolumeIcon(0);
    } else {
      const restore = parseFloat(nativeAudio.dataset.lastVol || '1');
      nativeAudio.volume = restore;
      volumeSlider.value = restore;
      updateVolumeIcon(restore);
    }
  });

  function updateVolumeIcon(vol) {
    if (vol === 0) {
      volumeIcon.className = 'fa-solid fa-volume-xmark';
    } else if (vol < 0.5) {
      volumeIcon.className = 'fa-solid fa-volume-low';
    } else {
      volumeIcon.className = 'fa-solid fa-volume-high';
    }
  }

  playbackRateSelect.addEventListener('change', () => {
    nativeAudio.playbackRate = parseFloat(playbackRateSelect.value);
  });

  btnDownloadAudio.addEventListener('click', () => {
    if (!state.currentBlob && !state.currentAudioUrl) {
      showToast('No audio file available for download.', 'error');
      return;
    }

    const a = document.createElement('a');
    a.href = state.currentAudioUrl;
    a.download = `elevenlabs-narration-${Date.now()}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Download started (MP3).', 'success');
  });

  function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  /* =========================================================================
     9. Generation History Management
     ========================================================================= */

  function renderHistory() {
    if (!state.history.length) {
      historyEmpty.style.display = 'flex';
      historyList.querySelectorAll('.history-item').forEach(el => el.remove());
      return;
    }

    historyEmpty.style.display = 'none';
    historyList.querySelectorAll('.history-item').forEach(el => el.remove());

    state.history.slice(0, 10).forEach((item, index) => {
      const itemEl = document.createElement('div');
      itemEl.className = 'history-item';
      
      const snippet = item.text.length > 36 ? item.text.substring(0, 36) + '...' : item.text;
      const modelShort = item.modelId.replace('eleven_', '');

      itemEl.innerHTML = `
        <div class="history-item-left">
          <span class="history-text" title="${item.text.replace(/"/g, '&quot;')}">${snippet}</span>
          <div class="history-meta">
            <span class="history-badge">${modelShort}</span>
            <span>${item.voiceName}</span>
            <span>• ${item.date}</span>
          </div>
        </div>
        <div class="history-actions">
          ${item.audioUrl ? `
            <button type="button" class="btn-icon-subtle replay-btn" title="Play clip">
              <i class="fa-solid fa-play"></i>
            </button>
            <button type="button" class="btn-icon-subtle download-clip-btn" title="Download">
              <i class="fa-solid fa-arrow-down"></i>
            </button>
          ` : `
            <button type="button" class="btn-icon-subtle reuse-text-btn" title="Insert script">
              <i class="fa-solid fa-arrow-up-right-from-square"></i>
            </button>
          `}
        </div>
      `;

      // Handlers
      const replayBtn = itemEl.querySelector('.replay-btn');
      if (replayBtn) {
        replayBtn.addEventListener('click', () => {
          textInput.value = item.text;
          updateTextStats();
          handleElevenLabsAudio(item.audioUrl, item.blob, item.text, item.modelId, voiceSelect.value);
        });
      }

      const downloadClipBtn = itemEl.querySelector('.download-clip-btn');
      if (downloadClipBtn) {
        downloadClipBtn.addEventListener('click', () => {
          const a = document.createElement('a');
          a.href = item.audioUrl;
          a.download = `elevenlabs-${Date.now()}.mp3`;
          a.click();
        });
      }

      const reuseBtn = itemEl.querySelector('.reuse-text-btn');
      if (reuseBtn) {
        reuseBtn.addEventListener('click', () => {
          textInput.value = item.text;
          updateTextStats();
        });
      }

      historyList.appendChild(itemEl);
    });
  }

  function addToHistory(item) {
    state.history.unshift(item);
    if (state.history.length > 20) {
      state.history.pop();
    }
    // We save items without large Blobs to localStorage
    const serializable = state.history.map(h => ({
      text: h.text,
      modelId: h.modelId,
      voiceName: h.voiceName,
      date: h.date,
      isDemo: h.isDemo
    }));
    try {
      localStorage.setItem(CONFIG.STORAGE_KEYS.HISTORY, JSON.stringify(serializable));
    } catch (_) {}

    renderHistory();
  }

  btnClearHistory.addEventListener('click', () => {
    state.history = [];
    localStorage.removeItem(CONFIG.STORAGE_KEYS.HISTORY);
    renderHistory();
    showToast('Narration history cleared.', 'info');
  });

  /* =========================================================================
     10. API Key Modal & Key Management
     ========================================================================= */

  btnOpenApiKeyModal.addEventListener('click', () => {
    apiKeyInput.value = window.elevenLabsService.apiKey || '';
    apiTestResult.style.display = 'none';
    apiKeyModal.style.display = 'flex';
  });

  btnCloseApiKeyModal.addEventListener('click', () => {
    apiKeyModal.style.display = 'none';
  });

  apiKeyModal.addEventListener('click', (e) => {
    if (e.target === apiKeyModal) {
      apiKeyModal.style.display = 'none';
    }
  });

  btnToggleApiKeyVisibility.addEventListener('click', () => {
    const isPass = apiKeyInput.type === 'password';
    apiKeyInput.type = isPass ? 'text' : 'password';
    eyeIcon.className = isPass ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
  });

  btnTestApiKey.addEventListener('click', async () => {
    const candidate = apiKeyInput.value.trim();
    if (!candidate) {
      apiTestResult.className = 'api-test-result error';
      apiTestResult.textContent = 'Please enter an API key to test.';
      apiTestResult.style.display = 'flex';
      return;
    }

    btnTestApiKey.disabled = true;
    btnTestApiKey.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Testing...';
    apiTestResult.style.display = 'none';

    try {
      const res = await window.elevenLabsService.testConnection(candidate);
      apiTestResult.className = 'api-test-result success';
      const quota = res.characterLimit > 0 
        ? `${res.characterCount.toLocaleString()} / ${res.characterLimit.toLocaleString()} chars used`
        : 'Valid subscription';
      apiTestResult.innerHTML = `<i class="fa-solid fa-circle-check"></i> Connection verified! ${quota}`;
      apiTestResult.style.display = 'flex';
    } catch (err) {
      apiTestResult.className = 'api-test-result error';
      apiTestResult.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${err.message}`;
      apiTestResult.style.display = 'flex';
    } finally {
      btnTestApiKey.disabled = false;
      btnTestApiKey.innerHTML = '<i class="fa-solid fa-plug"></i> Test Connection';
    }
  });

  btnSaveApiKey.addEventListener('click', async () => {
    const key = apiKeyInput.value.trim();
    window.elevenLabsService.setApiKey(key);
    updateApiStatusBadge();
    apiKeyModal.style.display = 'none';

    if (key) {
      showToast('ElevenLabs API Key saved securely.', 'success');
      // Fetch custom voices from account
      try {
        const voices = await window.elevenLabsService.fetchVoices();
        state.voices = voices;
        populateVoiceDropdown(voices);
      } catch (_) {}
    } else {
      showToast('API Key removed. Switched to demo mode.', 'info');
    }
  });

  btnRemoveApiKey.addEventListener('click', () => {
    apiKeyInput.value = '';
    window.elevenLabsService.clearApiKey();
    updateApiStatusBadge();
    apiTestResult.style.display = 'none';
    apiKeyModal.style.display = 'none';
    showToast('ElevenLabs API Key removed.', 'info');
  });

  /* =========================================================================
     11. Toast Notifications
     ========================================================================= */

  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'fa-solid fa-circle-info';
    if (type === 'success') icon = 'fa-solid fa-circle-check';
    if (type === 'error') icon = 'fa-solid fa-triangle-exclamation';

    toast.innerHTML = `
      <i class="${icon}"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // Initialize
  initApp();
});
