// Content script for Neptune Keyboard Sounds
// Captures keydown/keyup on editable elements and plays sounds via Web Audio API

// Key code to sound filename mapping
const KEY_MAP = {
  'Backspace': 'backspace',
  'Enter': 'enter',
  ' ': 'spacebar',
  'Space': 'spacebar',
  'Tab': 'tab',
  'Escape': 'escape',
  'Delete': 'delete',
  'ArrowUp': 'up',
  'ArrowDown': 'down',
  'ArrowLeft': 'left',
  'ArrowRight': 'right',
  'Shift': 'shift',
  'Control': 'ctrl',
  'Alt': 'alt',
  'Meta': 'meta',
  'CapsLock': 'capslock',
  'F1': 'f1', 'F2': 'f2', 'F3': 'f3', 'F4': 'f4',
  'F5': 'f5', 'F6': 'f6', 'F7': 'f7', 'F8': 'f8',
  'F9': 'f9', 'F10': 'f10', 'F11': 'f11', 'F12': 'f12',
  '`': 'backtick', '~': 'tilde',
  '1': '1', '2': '2', '3': '3', '4': '4', '5': '5',
  '6': '6', '7': '7', '8': '8', '9': '9', '0': '0',
  '-': 'minus', '_': 'underscore',
  '=': 'equals', '+': 'plus',
  '[': 'bracketleft', '{': 'braceleft',
  ']': 'bracketright', '}': 'braceright',
  '\\': 'backslash', '|': 'pipe',
  ';': 'semicolon', ':': 'colon',
  '\'': 'quote', '"': 'doublequote',
  ',': 'comma', '<': 'less',
  '.': 'period', '>': 'greater',
  '/': 'slash', '?': 'question'
};

// Audio context and buffers
let audioContext = null;
let soundBuffers = new Map();
let currentSettings = {
  enabled: true,
  soundPack: 'nkcream2',
  volume: 0.5
};
let packSupportsEvents = true;

// Initialize audio context on first user interaction
function initAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
}

// Load sound pack metadata
async function loadPackMetadata(packName) {
  try {
    const response = await fetch(browser.runtime.getURL(`sounds/${packName}/config.json`));
    const config = await response.json();
    return config['support-events'] || false;
  } catch (e) {
    return false;
  }
}

// Load a sound file into buffer
async function loadSound(packName, soundName) {
  const key = `${packName}/${soundName}`;
  if (soundBuffers.has(key)) {
    return soundBuffers.get(key);
  }
  
  try {
    const url = browser.runtime.getURL(`sounds/${packName}/${soundName}.wav`);
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = await audioContext.decodeAudioData(arrayBuffer);
    soundBuffers.set(key, buffer);
    return buffer;
  } catch (e) {
    return null;
  }
}

// Play a sound
async function playSound(soundName, isRelease = false) {
  if (!currentSettings.enabled) return;
  
  initAudioContext();
  
  const packName = currentSettings.soundPack;
  const suffix = isRelease ? '-up' : '';
  const soundNameWithSuffix = `${soundName}${suffix}`;
  
  // Try specific sound first
  let buffer = await loadSound(packName, soundNameWithSuffix);
  
  // If release sound not found and pack supports events, try without suffix
  if (!buffer && isRelease && packSupportsEvents) {
    buffer = await loadSound(packName, soundName);
  }
  
  // Fallback to generic fallback sounds
  if (!buffer) {
    const fallbackNames = ['fallback', 'fallback2', 'fallback3', 'fallback4', 'fallback5', 'fallback6'];
    for (const fallback of fallbackNames) {
      const fallbackWithSuffix = `${fallback}${suffix}`;
      buffer = await loadSound(packName, fallbackWithSuffix);
      if (buffer) break;
      // Try without suffix for release
      if (isRelease && packSupportsEvents) {
        buffer = await loadSound(packName, fallback);
        if (buffer) break;
      }
    }
  }
  
  if (!buffer) return;
  
  // Play the sound
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  
  const gainNode = audioContext.createGain();
  gainNode.gain.value = currentSettings.volume;
  
  source.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  source.start(0);
}

// Check if element is editable
function isEditableElement(element) {
  if (!element) return false;
  const tagName = element.tagName.toLowerCase();
  if (['input', 'textarea', 'select'].includes(tagName)) {
    const type = element.type?.toLowerCase();
    // Exclude non-text inputs
    if (['checkbox', 'radio', 'button', 'submit', 'reset', 'file', 'image', 'color', 'range'].includes(type)) {
      return false;
    }
    return !element.readOnly && !element.disabled;
  }
  if (element.isContentEditable) return true;
  return false;
}

// Handle keydown
async function handleKeyDown(event) {
  if (!currentSettings.enabled) return;
  
  const target = event.target;
  if (!isEditableElement(target)) return;
  
  // Don't play for modifier keys alone (they'll play on the actual key)
  if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(event.key)) return;
  
  const soundName = KEY_MAP[event.key] || event.key.toLowerCase();
  await playSound(soundName, false);
}

// Handle keyup
async function handleKeyUp(event) {
  if (!currentSettings.enabled) return;
  
  const target = event.target;
  if (!isEditableElement(target)) return;
  
  if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(event.key)) return;
  
  const soundName = KEY_MAP[event.key] || event.key.toLowerCase();
  await playSound(soundName, true);
}

// Load settings from storage
async function loadSettings() {
  const result = await browser.storage.sync.get(['enabled', 'soundPack', 'volume']);
  currentSettings = {
    enabled: result.enabled !== false,
    soundPack: result.soundPack || 'nkcream2',
    volume: result.volume !== undefined ? result.volume : 0.5
  };
  
  packSupportsEvents = await loadPackMetadata(currentSettings.soundPack);
  
  // Preload common sounds
  const commonSounds = ['fallback', 'fallback2', 'spacebar', 'enter', 'backspace'];
  for (const sound of commonSounds) {
    await loadSound(currentSettings.soundPack, sound);
    if (packSupportsEvents) {
      await loadSound(currentSettings.soundPack, `${sound}-up`);
    }
  }
}

// Listen for settings changes
browser.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync') {
    if (changes.enabled) currentSettings.enabled = changes.enabled.newValue;
    if (changes.volume) currentSettings.volume = changes.volume.newValue;
    if (changes.soundPack) {
      currentSettings.soundPack = changes.soundPack.newValue;
      soundBuffers.clear(); // Clear cache when pack changes
      loadPackMetadata(currentSettings.soundPack).then(supports => {
        packSupportsEvents = supports;
      });
    }
  }
});

// Initialize
loadSettings();

// Attach event listeners
document.addEventListener('keydown', handleKeyDown, true);
document.addEventListener('keyup', handleKeyUp, true);