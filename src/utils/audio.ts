import { isIOS } from '@nativescript/core';

/* Tiny procedural synth: every UI sound is rendered to a 16-bit PCM WAV at
   startup and handed to AVAudioPlayer, so the app ships zero audio assets and
   a sound can be tuned by editing numbers. */

type Wave = 'sine' | 'tri' | 'saw' | 'square';

interface Segment {
  f0: number;
  f1?: number;
  ms: number;
  gain?: number;
  wave?: Wave;
  attack?: number;
  release?: number;
}

const RATE = 22050;

const osc: Record<Wave, (p: number) => number> = {
  sine: (p) => Math.sin(p * Math.PI * 2),
  tri: (p) => 1 - 4 * Math.abs(Math.round(p - 0.25) - (p - 0.25)),
  saw: (p) => 2 * (p - Math.floor(p + 0.5)),
  square: (p) => (p % 1 < 0.5 ? 1 : -1),
};

function renderSegments(segments: Segment[]): Int16Array {
  const total = segments.reduce((n, s) => n + Math.round((s.ms / 1000) * RATE), 0);
  const out = new Int16Array(total);
  let cursor = 0;
  for (const s of segments) {
    const n = Math.round((s.ms / 1000) * RATE);
    const gain = s.gain ?? 0.2;
    const wave = osc[s.wave ?? 'sine'];
    const attack = Math.max(1, Math.round(((s.attack ?? 4) / 1000) * RATE));
    const release = Math.max(1, Math.round(((s.release ?? Math.min(s.ms * 0.6, 60)) / 1000) * RATE));
    const f1 = s.f1 ?? s.f0;
    let phase = 0;
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const f = s.f0 * Math.pow(f1 / s.f0 || 1, t);
      phase += f / RATE;
      let env = 1;
      if (i < attack) env = i / attack;
      if (n - i < release) env = Math.min(env, (n - i) / release);
      out[cursor + i] = s.f0 === 0 ? 0 : Math.round(wave(phase) * env * gain * 32767);
    }
    cursor += n;
  }
  return out;
}

function wavBytes(pcm: Int16Array): Uint8Array {
  const dataLen = pcm.length * 2;
  const buf = new ArrayBuffer(44 + dataLen);
  const v = new DataView(buf);
  const str = (o: number, s: string) => {
    for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i));
  };
  str(0, 'RIFF');
  v.setUint32(4, 36 + dataLen, true);
  str(8, 'WAVE');
  str(12, 'fmt ');
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, RATE, true);
  v.setUint32(28, RATE * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  str(36, 'data');
  v.setUint32(40, dataLen, true);
  new Int16Array(buf, 44).set(pcm);
  return new Uint8Array(buf);
}

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function base64(bytes: Uint8Array): string {
  const parts: string[] = [];
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i];
    const b = bytes[i + 1] ?? 0;
    const c = bytes[i + 2] ?? 0;
    const n = (a << 16) | (b << 8) | c;
    parts.push(
      B64[(n >> 18) & 63],
      B64[(n >> 12) & 63],
      i + 1 < bytes.length ? B64[(n >> 6) & 63] : '=',
      i + 2 < bytes.length ? B64[n & 63] : '='
    );
  }
  return parts.join('');
}

const library = {
  tick: [{ f0: 2400, ms: 22, gain: 0.08, attack: 1, release: 14 }],
  key: [{ f0: 1500, f1: 2100, ms: 40, gain: 0.12 }],
  blip: [{ f0: 1050, f1: 1700, ms: 70, gain: 0.16 }],
  alert: [
    { f0: 660, ms: 70, gain: 0.22, wave: 'tri' as Wave },
    { f0: 0, ms: 45 },
    { f0: 990, ms: 110, gain: 0.22, wave: 'tri' as Wave },
  ],
  approve: [
    { f0: 740, f1: 1480, ms: 90, gain: 0.24 },
    { f0: 1480, f1: 1975, ms: 140, gain: 0.2, release: 90 },
  ],
  deny: [{ f0: 420, f1: 170, ms: 170, gain: 0.2, wave: 'tri' as Wave, release: 80 }],
  boot: [
    { f0: 82, f1: 330, ms: 950, gain: 0.22, wave: 'saw' as Wave, attack: 220, release: 420 },
    { f0: 1320, f1: 2640, ms: 220, gain: 0.14, release: 160 },
  ],
  online: [
    { f0: 880, ms: 60, gain: 0.18 },
    { f0: 0, ms: 30 },
    { f0: 1320, ms: 60, gain: 0.18 },
    { f0: 0, ms: 30 },
    { f0: 1760, ms: 140, gain: 0.18, release: 100 },
  ],
} satisfies Record<string, Segment[]>;

export type SoundName = keyof typeof library;

const players = new Map<SoundName, AVAudioPlayer>();
let enabled = true;
let ready = false;

function prepare() {
  if (ready || !isIOS) return;
  ready = true;
  try {
    AVAudioSession.sharedInstance().setCategoryError(AVAudioSessionCategoryAmbient);
  } catch (e) {
    console.log('[audio] session', e);
  }
  for (const name of Object.keys(library) as SoundName[]) {
    const data = NSData.alloc().initWithBase64EncodedStringOptions(base64(wavBytes(renderSegments(library[name]))), NSDataBase64DecodingOptions.IgnoreUnknownCharacters);
    const player = AVAudioPlayer.alloc().initWithDataError(data, null as any);
    player.prepareToPlay();
    players.set(name, player);
  }
}

export const audio = {
  get enabled() {
    return enabled;
  },
  setEnabled(v: boolean) {
    enabled = v;
  },
  play(name: SoundName) {
    if (!enabled || !isIOS) return;
    prepare();
    const p = players.get(name);
    if (!p) return;
    p.currentTime = 0;
    p.play();
  },
};
