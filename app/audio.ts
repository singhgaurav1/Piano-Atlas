/** A short additive tone for inspecting a note. Not a sampled piano. */
let ctx: AudioContext | null = null;

function context() {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

export function playPitch(frequency: number, seconds = 1.7) {
  const ac = context();
  const now = ac.currentTime;
  const master = ac.createGain();
  const filter = ac.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(Math.min(4200, frequency * 8), now);
  filter.frequency.exponentialRampToValueAtTime(Math.max(600, frequency * 2.2), now + seconds);
  filter.Q.value = 0.7;
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.2, now + 0.016);
  master.gain.exponentialRampToValueAtTime(0.07, now + 0.14);
  master.gain.exponentialRampToValueAtTime(0.0001, now + seconds);
  filter.connect(master);
  master.connect(ac.destination);
  const harmonics = [1, 2, 3, 4, 5, 6, 8];
  for (const h of harmonics) {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'sine';
    osc.frequency.value = frequency * h;
    gain.gain.value = (h === 1 ? 0.55 : 0.42 / (h * h)) * Math.exp(-h * frequency / 12000);
    osc.connect(gain);
    gain.connect(filter);
    osc.start(now);
    osc.stop(now + seconds + 0.05);
  }
}
