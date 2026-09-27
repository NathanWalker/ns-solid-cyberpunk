import { For } from 'solid-js';
import { agent, Metrics } from '../state/agent';
import { Panel } from './panel';

const KEYS: { k: keyof Metrics; label: string }[] = [
  { k: 'cpu', label: 'CPU' },
  { k: 'mem', label: 'MEM' },
  { k: 'net', label: 'NET' },
  { k: 'pwr', label: 'PWR' },
  { k: 'therm', label: 'THM' },
];

function Meter(props: { label: string; value: () => number }) {
  const pct = () => Math.round(props.value() * 100);
  const cls = () => `meter-fill ${pct() > 90 ? 'meter-crit' : pct() > 75 ? 'meter-hot' : ''}`;
  return (
    <gridlayout columns="26, *, 24" rows="auto" class="meter-row">
      <label col={0} class="meter-key" text={props.label} verticalAlignment="center" />
      <gridlayout col={1} class="meter-track" verticalAlignment="center">
        <gridlayout class={cls()} width={`${Math.max(1, pct())}%`} horizontalAlignment="left" />
      </gridlayout>
      <label col={2} class="meter-val" text={String(pct())} verticalAlignment="center" />
    </gridlayout>
  );
}

export function Telemetry(props: { row?: number; col?: number }) {
  return (
    <Panel row={props.row ?? 0} col={props.col ?? 0} title="TELEMETRY" meta={`${Math.round(agent.metrics().cpu * 100)}% LOAD`} class="intro intro-4">
      <stacklayout padding="10 10 2 10" verticalAlignment="center">
        <For each={KEYS}>{(m) => <Meter label={m.label} value={() => agent.metrics()[m.k]} />}</For>
      </stacklayout>
    </Panel>
  );
}

export function Proximity(props: { row?: number; col?: number }) {
  return (
    <Panel row={props.row ?? 0} col={props.col ?? 0} title="PROXIMITY" meta={`${agent.contacts()}`} class="intro intro-4">
      <gridlayout padding="4">
        <hudradar contacts={agent.contacts()} tint="#3af0ff" />
      </gridlayout>
    </Panel>
  );
}
