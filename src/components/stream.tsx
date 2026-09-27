import { For } from 'solid-js';
import { agent, StreamLine } from '../state/agent';
import { createDecodedText } from '../utils/decode-text';
import { Panel } from './panel';

function StreamRow(props: { line: StreamLine }) {
  const text = createDecodedText(() => props.line.text);
  return (
    <gridlayout columns="auto, *" rows="auto" class="stream-row">
      <label col={0} class="stream-time" text={props.line.time} />
      <label col={1} class={`stream-line stream-${props.line.kind}`} text={text()} textWrap={true} />
    </gridlayout>
  );
}

export function Stream(props: { row?: number }) {
  const prompt = () => (agent.phase() === 'idle' ? 'listening' : agent.phase() === 'awaiting' ? 'waiting on operator' : '');
  return (
    <Panel row={props.row ?? 0} title="AGENT STREAM" meta={`${agent.eventCount()} EVENTS`} class="intro intro-3">
      <stacklayout class="stream-body" verticalAlignment="bottom">
        <For each={agent.lines()}>{(line) => <StreamRow line={line} />}</For>
        <gridlayout columns="auto, auto, *" rows="auto" class="stream-row">
          <label col={0} class="stream-time" text={agent.clock()} />
          <label col={1} class="cursor" text="▌" />
          <label col={2} class="stream-line stream-sys" text={prompt()} marginLeft={4} />
        </gridlayout>
      </stacklayout>
    </Panel>
  );
}
