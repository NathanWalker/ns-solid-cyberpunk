import { createSignal } from 'solid-js';

/* All HUD state lives here, outside the component tree, so a Vite HMR remount
   of any component rebuilds the view against the same running mission. */

export type Phase = 'boot' | 'idle' | 'thinking' | 'awaiting' | 'executing';
export type LineKind = 'sys' | 'agent' | 'user' | 'ok' | 'warn' | 'err';
export type Risk = 'LOW' | 'MEDIUM' | 'HIGH';
export type Decision = 'approve' | 'deny' | 'timeout';

export interface StreamLine {
  id: number;
  text: string;
  kind: LineKind;
  time: string;
}

export interface Approval {
  id: number;
  title: string;
  detail: string;
  risk: Risk;
  ttl: number;
  onDecision: (d: Decision) => void;
}

export interface Metrics {
  cpu: number;
  mem: number;
  net: number;
  pwr: number;
  therm: number;
}

const MAX_LINES = 7;
let nextId = 1;

const pad = (n: number) => (n < 10 ? '0' : '') + n;
export const stamp = () => {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const [phase, setPhase] = createSignal<Phase>('boot');
const [lines, setLines] = createSignal<StreamLine[]>([]);
const [approval, setApproval] = createSignal<Approval | null>(null);
const [metrics, setMetrics] = createSignal<Metrics>({ cpu: 0.08, mem: 0.12, net: 0.05, pwr: 0.2, therm: 0.18 });
const [clock, setClock] = createSignal(stamp());
const [contacts, setContacts] = createSignal(3);
const [level, setLevel] = createSignal(0);
const [latency, setLatency] = createSignal(12);
const [listening, setListening] = createSignal(false);
const [sound, setSound] = createSignal(true);
const [activeIntent, setActiveIntent] = createSignal<string | null>(null);
const [hudVisible, setHudVisible] = createSignal(false);
const [booted, setBooted] = createSignal(false);
const [bootLines, setBootLines] = createSignal<string[]>([]);
const [bootProgress, setBootProgress] = createSignal(0);
const [eventCount, setEventCount] = createSignal(0);

function say(text: string, kind: LineKind = 'agent') {
  setLines((prev) => [...prev, { id: nextId++, text, kind, time: stamp() }].slice(-MAX_LINES));
  setEventCount((n) => n + 1);
}

function requestApproval(a: Omit<Approval, 'id'>) {
  setPhase('awaiting');
  setApproval({ ...a, id: nextId++ });
}

function resolveApproval(d: Decision) {
  const a = approval();
  if (!a) return;
  setApproval(null);
  a.onDecision(d);
}

/* Telemetry drifts toward a per-phase target with a little noise, so the
   meters always look alive but clearly react to what the agent is doing. */
const TARGETS: Record<Phase, Metrics> = {
  boot: { cpu: 0.6, mem: 0.45, net: 0.3, pwr: 0.5, therm: 0.3 },
  idle: { cpu: 0.21, mem: 0.42, net: 0.16, pwr: 0.34, therm: 0.29 },
  thinking: { cpu: 0.86, mem: 0.61, net: 0.42, pwr: 0.66, therm: 0.47 },
  awaiting: { cpu: 0.33, mem: 0.58, net: 0.22, pwr: 0.4, therm: 0.41 },
  executing: { cpu: 0.7, mem: 0.64, net: 0.88, pwr: 0.79, therm: 0.58 },
};

setInterval(() => {
  const t = TARGETS[phase()];
  setMetrics((m) => {
    const next = { ...m };
    for (const k of Object.keys(next) as (keyof Metrics)[]) {
      const v = next[k] + (t[k] - next[k]) * 0.11 + (Math.random() - 0.5) * 0.035;
      next[k] = Math.min(0.99, Math.max(0.02, v));
    }
    return next;
  });
  setLatency((l) => Math.max(6, Math.min(48, Math.round(l + (Math.random() - 0.5) * 4))));
}, 140);

setInterval(() => setClock(stamp()), 1000);

export const agent = {
  phase,
  setPhase,
  lines,
  say,
  approval,
  requestApproval,
  resolveApproval,
  metrics,
  clock,
  contacts,
  setContacts,
  level,
  setLevel,
  latency,
  listening,
  setListening,
  sound,
  setSound,
  activeIntent,
  setActiveIntent,
  hudVisible,
  setHudVisible,
  booted,
  setBooted,
  bootLines,
  setBootLines,
  bootProgress,
  setBootProgress,
  eventCount,
};
