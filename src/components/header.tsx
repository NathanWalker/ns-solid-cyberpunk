import { agent } from '../state/agent';
import { audio } from '../utils/audio';
import { haptics } from '../utils/haptics';

export function Header(props: { row?: number }) {
  const dot = () => {
    switch (agent.phase()) {
      case 'thinking':
        return 'dot dot-amber pulse';
      case 'awaiting':
        return 'dot dot-magenta pulse';
      case 'executing':
        return 'dot dot-cyan pulse';
      default:
        return 'dot pulse';
    }
  };
  const link = () => (agent.phase() === 'boot' ? 'LINKING' : 'SYNCED');
  const toggleSound = () => {
    const next = !agent.sound();
    agent.setSound(next);
    audio.setEnabled(next);
    haptics.tick();
    if (next) audio.play('key');
  };

  return (
    <gridlayout row={props.row ?? 0} class="intro intro-1" rows="auto, auto, auto" columns="*, auto">
      <stacklayout row={0} col={0} orientation="horizontal">
        <label class="wordmark" text="AEGIS" />
        <label class="wordmark-suffix" text="// OPS · 5.1" verticalAlignment="bottom" />
      </stacklayout>
      <label row={0} col={1} class="clock" text={agent.clock()} verticalAlignment="bottom" />

      <stacklayout row={1} col={0} orientation="horizontal" marginTop={7}>
        <gridlayout class={dot()} verticalAlignment="center" />
        <label class="eyebrow eyebrow-bright" text={`NEURAL LINK · ${link()}`} verticalAlignment="center" />
        <label class="eyebrow" text={`  ·  ${agent.latency()} MS`} verticalAlignment="center" />
      </stacklayout>
      <label
        row={1}
        col={1}
        class="eyebrow eyebrow-bright"
        text={agent.sound() ? 'AUDIO ● ON' : 'AUDIO ○ OFF'}
        marginTop={7}
        on:tap={toggleSound}
      />

      <gridlayout row={2} colSpan={2} class="rule" marginTop={9} />
    </gridlayout>
  );
}
