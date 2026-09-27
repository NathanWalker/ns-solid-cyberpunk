import { agent, Phase } from '../state/agent';

const VALUE: Record<Phase, string> = {
  boot: 'BOOT',
  idle: 'IDLE',
  thinking: 'THINK',
  awaiting: 'HOLD',
  executing: '',
};

const SUB: Record<Phase, string> = {
  boot: 'INITIALIZING',
  idle: 'AWAITING INTENT',
  thinking: 'PARSING INTENT',
  awaiting: 'OPERATOR INPUT',
  executing: 'EXECUTING',
};

function KV(props: { k: string; v: string; right?: boolean }) {
  return (
    <stacklayout class="core-kv">
      <label class="readout-key" text={props.k} textAlignment={props.right ? 'right' : 'left'} />
      <label class="readout" text={props.v} textAlignment={props.right ? 'right' : 'left'} />
    </stacklayout>
  );
}

export function Core(props: { row?: number }) {
  const value = () => (agent.phase() === 'executing' ? `${Math.round(agent.level() * 100)}%` : VALUE[agent.phase()]);
  const threat = () => (agent.contacts() > 4 ? 'ELEVATED' : 'LOW');

  return (
    <gridlayout row={props.row ?? 0} class="intro intro-2" columns="*, 250, *" rows="254">
      <hudring col={1} mode={agent.phase()} level={agent.level()} width={250} height={250} verticalAlignment="center" horizontalAlignment="center" />
      <stacklayout col={1} verticalAlignment="center" horizontalAlignment="center">
        <label class="core-value" text={value()} />
        <label class="core-sub" text={SUB[agent.phase()]} />
      </stacklayout>

      <stacklayout col={0} class="core-side" verticalAlignment="top">
        <KV k="INTENT" v={agent.activeIntent() ?? '—'} />
        <KV k="NODES" v="12 / 12" />
        <KV k="LINK" v={`${agent.latency()} MS`} />
      </stacklayout>
      <stacklayout col={2} class="core-side core-side-right" verticalAlignment="top">
        <KV k="CONTACTS" v={String(agent.contacts())} right />
        <KV k="THREAT" v={threat()} right />
        <KV k="EVENTS" v={String(agent.eventCount())} right />
      </stacklayout>
    </gridlayout>
  );
}
