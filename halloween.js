/* Small local synthesizer; the draw and coupon storage are independent. */
const HalloweenAudio = (() => {
  let context, master, ambience, enabled = true;
  try { enabled = localStorage.getItem('soundEnabled') !== 'false'; } catch {}
  const allowed = () => enabled && context?.state === 'running' && !document.hidden;
  function tone(frequency, duration, volume, offset = 0, endFrequency = frequency) {
    if (!allowed()) return;
    const at = context.currentTime + offset;
    const oscillator = context.createOscillator(), gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, at);
    oscillator.frequency.exponentialRampToValueAtTime(endFrequency, at + duration);
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(volume, at + .025);
    gain.gain.exponentialRampToValueAtTime(.0001, at + duration);
    oscillator.connect(gain).connect(master);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    oscillator.start(at); oscillator.stop(at + duration + .02);
  }
  function noise(duration, volume, frequency, endFrequency) {
    if (!allowed()) return;
    const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const source = context.createBufferSource(), filter = context.createBiquadFilter(), gain = context.createGain();
    source.buffer = buffer; filter.type = 'bandpass'; filter.Q.value = .8;
    filter.frequency.setValueAtTime(frequency, context.currentTime);
    filter.frequency.exponentialRampToValueAtTime(endFrequency, context.currentTime + duration);
    gain.gain.setValueAtTime(volume, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + duration);
    source.connect(filter).connect(gain).connect(master);
    source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); };
    source.start();
  }
  function startAmbience() {
    if (!allowed() || ambience || !document.querySelector('.home')) return;
    // Original 16-second minor-key music-box loop with soft wind and a warm pad.
    const duration = 16, rate = context.sampleRate;
    const buffer = context.createBuffer(1, rate * duration, rate);
    const samples = buffer.getChannelData(0);
    const melody = [69, 72, 76, 75, 76, 72, 71, 64, 69, 72, 77, 76, 72, 71, 68, 71];
    let wind = 0;
    for (let i = 0; i < samples.length; i++) {
      const t = i / rate, beat = Math.floor(t), age = t - beat;
      const f = 440 * Math.pow(2, (melody[beat] - 69) / 12);
      const envelope = Math.min(age / .018, 1) * Math.exp(-age * 5);
      const bell = (Math.sin(2 * Math.PI * f * age) + .22 * Math.sin(2 * Math.PI * f * 2 * age)) * envelope * .15;
      const pad = (Math.sin(2 * Math.PI * 110 * t) + .4 * Math.sin(2 * Math.PI * 165 * t)) * .023;
      wind = wind * .995 + (Math.random() * 2 - 1) * .005;
      samples[i] = bell + pad + wind * .2;
    }
    const oscillator = context.createBufferSource(), gain = context.createGain();
    oscillator.buffer = buffer; oscillator.loop = true;
    gain.gain.setValueAtTime(0, context.currentTime);
    gain.gain.linearRampToValueAtTime(2.5, context.currentTime + .6);
    oscillator.connect(gain).connect(master); oscillator.start();
    ambience = { oscillator, gain };
  }
  function stopAmbience() {
    if (!ambience) return;
    ambience.oscillator.stop(); ambience.oscillator.disconnect(); ambience.gain.disconnect(); ambience = null;
  }
  async function unlock() {
    if (!enabled || document.hidden) return;
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    try {
      if (!context) { context = new Audio(); master = context.createGain(); master.gain.value = .12; master.connect(context.destination); }
      await context.resume(); startAmbience();
    } catch (error) { console.warn('Halloween audio unavailable:', error); }
  }
  function play(name, prize) {
    if (name === 'shake') noise(.35, .2, 1800, 1100);
    if (name === 'tear') noise(.38, .35, 4200, 650);
    if (name === 'light') { noise(.5, .22, 250, 2600); tone(220, .5, .15, 0, 880); }
    if (name === 'rise') [660, 880, 1100].forEach((f, i) => tone(f, .45, .13, i * .13));
    if (name === 'flip') noise(.2, .25, 1600, 500);
    if (name === 'reward') {
      if (prize.win === false) tone(220, .3, .17, 0, 165);
      else (prize.rare ? [660, 880, 1100, 1320] : [660, 880, 1100]).forEach((f, i) => tone(f, .4, prize.rare ? .34 : .25, i * .09));
    }
  }
  function toggle() {
    enabled = !enabled;
    try { localStorage.setItem('soundEnabled', String(enabled)); } catch {}
    if (master) master.gain.value = enabled ? .12 : 0;
    enabled ? unlock() : stopAmbience();
    refreshButton();
  }
  function refreshButton() {
    const button = document.querySelector('.sound-toggle');
    if (!button) return;
    button.textContent = enabled ? '🔊' : '🔇';
    button.setAttribute('aria-label', enabled ? '소리 끄기' : '소리 켜기');
    button.setAttribute('aria-pressed', String(enabled));
  }
  document.addEventListener('pointerdown', event => { if (!event.target.closest('.sound-toggle')) unlock(); });
  document.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') unlock(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { stopAmbience(); context?.suspend().catch(() => {}); }
    else if (enabled && context) unlock();
  });
  function syncScreen() {
    if (document.querySelector('.home')) startAmbience();
    else stopAmbience();
  }
  return { play, toggle, refreshButton, syncScreen };
})();

function decorateHalloweenScreen() {
  HalloweenAudio.syncScreen();
  const screen = document.querySelector('.home, .opening');
  if (!screen) return;
  const decorations = document.createElement('div');
  decorations.className = 'halloween-atmosphere'; decorations.setAttribute('aria-hidden', 'true');
  decorations.innerHTML = '<i class="moon"></i><i class="bat bat-one">🦇</i><i class="bat bat-two">🦇</i><i class="bat bat-three">🦇</i><i class="fog"></i><i class="ambient-halo"></i><i class="ember ember-one"></i><i class="ember ember-two"></i><i class="ember ember-three"></i>';
  screen.prepend(decorations);
  const button = document.createElement('button'); button.className = 'sound-toggle'; button.type = 'button';
  button.onclick = HalloweenAudio.toggle; screen.append(button); HalloweenAudio.refreshButton();
}
