import { createSignal, For, onCleanup } from 'solid-js';
import { agent } from '../state/agent';
import { IntentName, intents, runIntent, runVoice } from '../state/scenarios';
import { audio } from '../utils/audio';
import { haptics } from '../utils/haptics';

const NAMES = Object.keys(intents) as IntentName[];
const BARS = [0, 1, 2, 3, 4, 5, 6, 7, 8];

/* Input stays tiny on purpose: four intents and a hold-to-speak orb. The
   agent does the work; the rest of the screen is output. */
export function CommandDeck(props: { row?: number }) {
  const busy = () => agent.phase() !== 'idle';
  const [wave, setWave] = createSignal<number[]>(BARS.map(() => 4));
  let waveTimer: ReturnType<typeof setInterval> | undefined;

  const startListen = () => {
    if (busy() || agent.listening()) return;
    agent.setListening(true);
    haptics.tap();
    audio.play('key');
    waveTimer = setInterval(() => setWave(BARS.map(() => 4 + Math.random() * 24)), 70);
  };
  const stopListen = () => {
    if (!agent.listening()) return;
    clearInterval(waveTimer);
    agent.setListening(false);
    setWave(BARS.map(() => 4));
    haptics.tick();
    runVoice();
  };
  onCleanup(() => clearInterval(waveTimer));

  const onTouch = (args: { action: string }) => {
    if (args.action === 'down') startListen();
    else if (args.action === 'up' || args.action === 'cancel') stopListen();
  };

  const chip = (name: IntentName) =>
    `chip ${agent.activeIntent() === name ? 'chip-active' : busy() ? 'chip-disabled' : ''}`;
  const hint = () => (agent.listening() ? 'LISTENING' : busy() ? 'AGENT BUSY' : 'HOLD TO SPEAK');

  return (
    <gridlayout row={props.row ?? 0} class="intro intro-5" rows="auto, 72" paddingTop={8}>
      <gridlayout row={0} columns="*, *, *, *">
        <For each={NAMES}>
          {(name, i) => (
            <label
              col={i()}
              class={chip(name)}
              text={name}
              on:tap={() => {
                if (busy()) return;
                haptics.tap();
                runIntent(name);
              }}
            />
          )}
        </For>
      </gridlayout>

      <gridlayout row={1} columns="*, 58, *">
        <stacklayout col={0} orientation="horizontal" horizontalAlignment="right" verticalAlignment="center" marginRight={14}>
          <For each={BARS}>
            {(i) => <gridlayout class={`wave-bar ${agent.listening() ? 'wave-bar-hot' : ''}`} height={wave()[i]} verticalAlignment="center" />}
          </For>
        </stacklayout>
        <gridlayout col={1} class={`orb ${agent.listening() ? 'orb-hot' : ''}`} verticalAlignment="center" on:touch={onTouch}>
          <gridlayout class={`orb-core ${agent.listening() ? 'orb-core-hot' : ''}`} horizontalAlignment="center" verticalAlignment="center" />
        </gridlayout>
        <label col={2} class="eyebrow eyebrow-bright" text={hint()} verticalAlignment="center" marginLeft={14} />
      </gridlayout>
    </gridlayout>
  );
}
