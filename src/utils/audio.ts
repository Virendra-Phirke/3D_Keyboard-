/**
 * Web Audio API based mechanical keyboard sound synthesizer
 * Zero external audio files required, runs 100% offline and instantaneously.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export type SwitchType = 'linear' | 'clicky' | 'silent';

export function playSwitchSound(type: SwitchType = 'linear', pitchVariation: number = 0) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const randPitch = (Math.random() - 0.5) * 0.15 + pitchVariation;

    if (type === 'clicky') {
      // High-pitched tactile mechanical click (Blue Switch)
      // 1. High click burst
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = 'triangle';
      clickOsc.frequency.setValueAtTime(3200 * (1 + randPitch), now);
      clickOsc.frequency.exponentialRampToValueAtTime(800, now + 0.015);

      clickGain.gain.setValueAtTime(0.35, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

      clickOsc.connect(clickGain);
      clickGain.connect(ctx.destination);
      clickOsc.start(now);
      clickOsc.stop(now + 0.02);

      // 2. Bottom out thock
      const thockOsc = ctx.createOscillator();
      const thockGain = ctx.createGain();
      thockOsc.type = 'sine';
      thockOsc.frequency.setValueAtTime(260 * (1 + randPitch), now + 0.005);
      thockOsc.frequency.exponentialRampToValueAtTime(60, now + 0.06);

      thockGain.gain.setValueAtTime(0.3, now + 0.005);
      thockGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      thockOsc.connect(thockGain);
      thockGain.connect(ctx.destination);
      thockOsc.start(now + 0.005);
      thockOsc.stop(now + 0.07);

    } else if (type === 'silent') {
      // Muffled dampening soft thud (Silent Switch)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(140 * (1 + randPitch), now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.04);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);

    } else {
      // Deep creamy thock (Custom Lubed Linear / Red Switch)
      // 1. Initial transient pop
      const popOsc = ctx.createOscillator();
      const popGain = ctx.createGain();
      popOsc.type = 'sine';
      popOsc.frequency.setValueAtTime(680 * (1 + randPitch), now);
      popOsc.frequency.exponentialRampToValueAtTime(120, now + 0.025);

      popGain.gain.setValueAtTime(0.4, now);
      popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      popOsc.connect(popGain);
      popGain.connect(ctx.destination);
      popOsc.start(now);
      popOsc.stop(now + 0.035);

      // 2. Deep body resonance (brass plate & foam acoustics)
      const bodyOsc = ctx.createOscillator();
      const bodyGain = ctx.createGain();
      bodyOsc.type = 'triangle';
      bodyOsc.frequency.setValueAtTime(220 * (1 + randPitch), now + 0.004);
      bodyOsc.frequency.exponentialRampToValueAtTime(70, now + 0.08);

      bodyGain.gain.setValueAtTime(0.35, now + 0.004);
      bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      bodyOsc.connect(bodyGain);
      bodyGain.connect(ctx.destination);
      bodyOsc.start(now + 0.004);
      bodyOsc.stop(now + 0.09);
    }
  } catch {
    // Ignore audio context errors if user hasn't interacted with DOM yet
  }
}
