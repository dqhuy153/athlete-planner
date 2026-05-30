// apps/web/lib/workout-alerts.ts

let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)();
  }
  return audioCtx;
}

function playTone(
  frequency: number,
  durationMs: number,
  delayMs = 0,
  volume = 0.25,
) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = frequency;
    osc.type = 'sine';
    const start = ctx.currentTime + delayMs / 1000;
    const end = start + durationMs / 1000;
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.001, end);
    osc.start(start);
    osc.stop(end);
  } catch {
    // silently ignore — no audio device or permission denied
  }
}

function vibrate(pattern: number | number[]) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // vibrate not supported on this device
    }
  }
}

export function playSetComplete() {
  playTone(880, 100);
}

export function playRestDone() {
  playTone(880, 150);
  playTone(1047, 150, 200);
}

export function playWorkoutComplete() {
  playTone(523, 150);
  playTone(659, 150, 200);
  playTone(784, 150, 400);
  playTone(1047, 300, 600);
}

export function vibrateSetComplete() {
  vibrate([150]);
}

export function vibrateRestDone() {
  vibrate([200, 100, 200]);
}

export function vibrateWorkoutComplete() {
  vibrate([300, 100, 300, 100, 500]);
}

export function triggerSetComplete(sound: boolean, vibration: boolean) {
  if (sound) playSetComplete();
  if (vibration) vibrateSetComplete();
}

export function triggerRestDone(sound: boolean, vibration: boolean) {
  if (sound) playRestDone();
  if (vibration) vibrateRestDone();
}

export function triggerWorkoutComplete(sound: boolean, vibration: boolean) {
  if (sound) playWorkoutComplete();
  if (vibration) vibrateWorkoutComplete();
}
