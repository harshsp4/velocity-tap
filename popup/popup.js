// Popup script for Velocity Tap

const SOUND_PACKS = [
  { id: 'nkcream2', name: 'NK Cream (By Kbs.Im)', events: true },
  { id: 'nkcream3', name: 'NK Cream (By MonkeyType)', events: false },
  { id: 'alpacas', name: 'Alpacas (By kbs.im)', events: true },
  { id: 'blackink', name: 'Gateron Black Inks (By kbs.im)', events: true },
  { id: 'bluealps', name: 'Blue Alps (By kbs.im)', events: true },
  { id: 'boxnavy', name: 'Kailh Box Navies (By kbs.im)', events: true },
  { id: 'buckling', name: 'Buckling Spring (By kbs.im)', events: true },
  { id: 'cherrymxblue', name: 'Cherry Mx Blue', events: true },
  { id: 'holypanda', name: 'Holy Pandas (By kbs.im)', events: true },
  { id: 'mxblack', name: 'Cherry Mx Blacks (By kbs.im)', events: true },
  { id: 'mxblue', name: 'Cherry Mx Blue (By kbs.im)', events: true },
  { id: 'mxbrown', name: 'Cherry Mx Browns (By kbs.im)', events: true },
  { id: 'osu', name: 'osu (by monkeytype)', events: false },
  { id: 'redink', name: 'Gateron Red Inks (By kbs.im)', events: true },
  { id: 'topre', name: 'Topre (By kbs.im)', events: true },
  { id: 'turquoise', name: 'Turquoise Tealios (By kbs.im)', events: true },
  { id: 'typewriter', name: 'Typewriter (By monkeytype)', events: false }
];

document.addEventListener('DOMContentLoaded', async () => {
  const select = document.getElementById('sound-pack');
  const enabledToggle = document.getElementById('enabled-toggle');
  const volumeSlider = document.getElementById('volume');
  const volumeValue = document.getElementById('volume-value');

  // Load settings
  try {
    const result = await browser.storage.sync.get(['enabled', 'soundPack', 'volume']);
    const enabled = result.enabled !== false;
    const soundPack = result.soundPack || 'nkcream2';
    const volume = result.volume !== undefined ? result.volume : 0.5;

    // Set UI values
    enabledToggle.checked = enabled;
    volumeSlider.value = Math.round(volume * 100);
    volumeValue.textContent = `${Math.round(volume * 100)}%`;

    // Populate sound pack dropdown
    SOUND_PACKS.forEach(pack => {
      const option = document.createElement('option');
      option.value = pack.id;
      option.textContent = pack.name + (pack.events ? '' : ' (no release sounds)');
      select.appendChild(option);
    });
    select.value = soundPack;
  } catch (e) {
    console.error('Failed to load settings:', e);
  }

  // Event listeners
  enabledToggle.addEventListener('change', (e) => {
    browser.storage.sync.set({ enabled: e.target.checked });
  });

  select.addEventListener('change', (e) => {
    browser.storage.sync.set({ soundPack: e.target.value });
  });

  volumeSlider.addEventListener('input', (e) => {
    const value = parseInt(e.target.value) / 100;
    volumeValue.textContent = `${e.target.value}%`;
    browser.storage.sync.set({ volume: value });
  });
});