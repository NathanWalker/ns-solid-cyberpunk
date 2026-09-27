import { agent, Decision, LineKind, Risk } from './agent';
import { audio } from '../utils/audio';
import { haptics } from '../utils/haptics';

/* Each intent is a small timeline. Steps land as timed beats so the HUD
   narrates what the agent is doing; the approval gate hands control to the
   operator and the timeline resumes on whichever branch they pick. */

interface Beat {
  at: number;
  run: () => void;
}

let cancelCurrent: (() => void) | null = null;

function play(beats: Beat[], done?: () => void) {
  cancelCurrent?.();
  const timers: ReturnType<typeof setTimeout>[] = [];
  const last = Math.max(0, ...beats.map((b) => b.at));
  for (const b of beats) timers.push(setTimeout(b.run, b.at));
  if (done) timers.push(setTimeout(done, last + 10));
  cancelCurrent = () => timers.forEach(clearTimeout);
}

const line = (text: string, kind: LineKind = 'agent') => () => {
  agent.say(text, kind);
  audio.play(kind === 'warn' || kind === 'err' ? 'blip' : 'tick');
};

interface Gate {
  title: string;
  detail: string;
  risk: Risk;
  ttl: number;
  approve: Beat[];
  deny: Beat[];
  timeout: Beat[];
}

const gate = (g: Gate) => () => {
  audio.play('alert');
  haptics.warning();
  agent.requestApproval({
    title: g.title,
    detail: g.detail,
    risk: g.risk,
    ttl: g.ttl,
    onDecision: (d: Decision) => {
      const branch = d === 'approve' ? g.approve : d === 'deny' ? g.deny : g.timeout;
      play(branch, finish);
    },
  });
};

const finish = () => {
  agent.setPhase('idle');
  agent.setActiveIntent(null);
  setTimeout(() => agent.setLevel(0), 900);
};

const start = (intent: string, spoken: string, kind: LineKind = 'user') => () => {
  agent.setActiveIntent(intent);
  agent.setPhase('thinking');
  agent.setLevel(0);
  agent.say(spoken, kind);
  audio.play('key');
};

const phase = (p: 'thinking' | 'executing', level?: number) => () => {
  agent.setPhase(p);
  if (level !== undefined) agent.setLevel(level);
};
const level = (v: number) => () => agent.setLevel(v);

export const intents = {
  SCAN: {
    label: 'SCAN',
    spoken: 'run a perimeter scan',
    beats: (spoken: string, kind: LineKind): Beat[] => [
      { at: 0, run: start('SCAN', spoken, kind) },
      { at: 380, run: line('intent → PERIMETER_SCAN · confidence 0.97') },
      { at: 900, run: line('sensor mesh online · 12/12 nodes', 'sys') },
      { at: 1000, run: phase('executing', 0.18) },
      { at: 1600, run: line('sweeping 360° · 2.4 – 5.8 GHz') },
      { at: 1700, run: level(0.42) },
      { at: 2500, run: () => agent.setContacts(5) },
      { at: 2500, run: line('5 contacts · 1 unclassified @ 214°', 'warn') },
      { at: 2600, run: level(0.64) },
      { at: 3300, run: line('active probe would classify it · needs you') },
      {
        at: 3900,
        run: gate({
          title: 'ENGAGE ACTIVE PROBE',
          detail: 'Ping the unclassified contact at 214° / 1.8 km. Reveals our position for ~2 s.',
          risk: 'MEDIUM',
          ttl: 15,
          approve: [
            { at: 0, run: line('operator approved · probing', 'ok') },
            { at: 0, run: phase('executing', 0.8) },
            { at: 1100, run: line('contact classified · civilian drone', 'ok') },
            { at: 1100, run: level(1) },
            { at: 2000, run: line('perimeter secure · resuming passive watch') },
          ],
          deny: [
            { at: 0, run: line('operator withheld · passive tracking only', 'warn') },
            { at: 0, run: phase('executing', 0.8) },
            { at: 1200, run: line('contact drifting NE · 2.3 km') },
            { at: 1200, run: level(1) },
            { at: 2000, run: line('watch continues', 'sys') },
          ],
          timeout: [{ at: 0, run: line('no operator input · action withheld', 'warn') }],
        }),
      },
    ],
  },
  OPTIMIZE: {
    label: 'OPTIMIZE',
    spoken: 'optimize the compute budget',
    beats: (spoken: string, kind: LineKind): Beat[] => [
      { at: 0, run: start('OPTIMIZE', spoken, kind) },
      { at: 380, run: line('intent → OPTIMIZE_COMPUTE · confidence 0.93') },
      { at: 950, run: line('profiling 4 clusters · 38 workloads', 'sys') },
      { at: 1050, run: phase('executing', 0.22) },
      { at: 1800, run: line('cluster B saturated 91% · A idle at 27%', 'warn') },
      { at: 1900, run: level(0.48) },
      { at: 2700, run: line('proposal: shift 40% inference B → A') },
      { at: 2800, run: level(0.62) },
      {
        at: 3400,
        run: gate({
          title: 'REROUTE 40% INFERENCE',
          detail: 'Migrate 14 workloads B → A. Est. latency −31%, thermal −12%. Rollback window 90 s.',
          risk: 'LOW',
          ttl: 12,
          approve: [
            { at: 0, run: line('rerouting · 14 workloads in flight', 'ok') },
            { at: 0, run: phase('executing', 0.82) },
            { at: 1300, run: line('migration complete · latency −29%', 'ok') },
            { at: 1300, run: level(1) },
            { at: 2100, run: line('budget balanced · monitoring') },
          ],
          deny: [
            { at: 0, run: line('holding current allocation', 'warn') },
            { at: 0, run: phase('executing', 1) },
            { at: 1000, run: line('will re-propose if B exceeds 95%', 'sys') },
          ],
          timeout: [{ at: 0, run: line('no operator input · allocation unchanged', 'warn') }],
        }),
      },
    ],
  },
  DEPLOY: {
    label: 'DEPLOY',
    spoken: 'ship build 5.1.0',
    beats: (spoken: string, kind: LineKind): Beat[] => [
      { at: 0, run: start('DEPLOY', spoken, kind) },
      { at: 380, run: line('intent → DEPLOY · confidence 0.99') },
      { at: 950, run: line('build 5.1.0 · 1,248 tests passed · 0 failed', 'sys') },
      { at: 1050, run: phase('executing', 0.3) },
      { at: 1800, run: line('canary 2% healthy · p99 212 ms', 'ok') },
      { at: 1900, run: level(0.55) },
      { at: 2600, run: line('prod change window closes in 6 min', 'warn') },
      {
        at: 3200,
        run: gate({
          title: 'PROMOTE 5.1.0 TO PROD',
          detail: '100% traffic cutover · blue/green · auto-rollback if error rate > 0.5%.',
          risk: 'HIGH',
          ttl: 10,
          approve: [
            { at: 0, run: line('promoting · draining blue', 'ok') },
            { at: 0, run: phase('executing', 0.78) },
            { at: 1400, run: line('5.1.0 live · error rate 0.02%', 'ok') },
            { at: 1400, run: level(1) },
            { at: 2200, run: line('watching p99 for 10 min') },
          ],
          deny: [
            { at: 0, run: line('holding at canary 2%', 'warn') },
            { at: 0, run: phase('executing', 1) },
            { at: 1000, run: line('window closes in 6 min · will not auto-promote', 'sys') },
          ],
          timeout: [{ at: 0, run: line('no operator input · canary held', 'warn') }],
        }),
      },
    ],
  },
  STATUS: {
    label: 'STATUS',
    spoken: 'status report',
    beats: (spoken: string, kind: LineKind): Beat[] => [
      { at: 0, run: start('STATUS', spoken, kind) },
      { at: 380, run: line('all systems nominal') },
      { at: 400, run: phase('executing', 0.35) },
      { at: 1000, run: line('uptime 14d 06h · 0 incidents', 'sys') },
      { at: 1100, run: level(0.7) },
      { at: 1600, run: line('link 12 ms · packet loss 0.0%', 'sys') },
      { at: 1700, run: level(1) },
      { at: 2300, run: line("nothing needs you · I'll flag anything that does") },
    ],
  },
};

export type IntentName = keyof typeof intents;

const GATED: Record<IntentName, boolean> = { SCAN: true, OPTIMIZE: true, DEPLOY: true, STATUS: false };

export function runIntent(name: IntentName, spoken = intents[name].spoken, kind: LineKind = 'user') {
  if (agent.phase() !== 'idle') return;
  const beats = intents[name].beats(spoken, kind);
  play(beats, GATED[name] ? undefined : () => setTimeout(finish, 700));
}

export function runVoice() {
  const names = Object.keys(intents) as IntentName[];
  const name = names[(Math.random() * names.length) | 0];
  runIntent(name, `voice › "${intents[name].spoken}"`, 'user');
}

let bootStarted = false;

export function runBoot() {
  if (agent.phase() !== 'boot' || bootStarted) return;
  bootStarted = true;
  const step = (text: string, progress: number) => () => {
    agent.setBootLines((l) => [...l, text]);
    agent.setBootProgress(progress);
    audio.play('tick');
  };
  audio.play('boot');
  play([
    { at: 250, run: step('KERNEL 5.1 · AEGIS OS', 0.14) },
    { at: 600, run: step('NEURAL LINK · HANDSHAKE OK', 0.34) },
    { at: 950, run: step('SENSOR MESH · 12 NODES', 0.52) },
    { at: 1300, run: step('TELEMETRY · STREAMING', 0.71) },
    { at: 1650, run: step('OPERATOR · AUTHENTICATED', 0.9) },
    { at: 2000, run: step('ALL SYSTEMS NOMINAL', 1) },
    {
      at: 2050,
      run: () => {
        agent.setHudVisible(true);
        agent.setPhase('idle');
        audio.play('online');
        haptics.success();
        agent.say('AEGIS online · awaiting intent', 'sys');
      },
    },
    { at: 2900, run: () => agent.setBooted(true) },
  ]);
}
