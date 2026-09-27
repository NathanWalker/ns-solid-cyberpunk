import { onSettled, Show } from 'solid-js';
import type { Page } from '@nativescript/core';
import { agent } from '../state/agent';
import { runBoot } from '../state/scenarios';
import { Header } from './header';
import { Core } from './core';
import { Stream } from './stream';
import { Proximity, Telemetry } from './telemetry';
import { CommandDeck } from './command-deck';
import { ApprovalCard } from './approval';
import { Boot } from './boot';

export default function Home() {
  onSettled(() => runBoot());

  const onLoaded = (args: { object: any }) => {
    const page = args.object.page as Page | undefined;
    if (page) {
      page.statusBarStyle = 'light';
      page.backgroundColor = '#04070d';
    }
  };

  return (
    <gridlayout class="hud-root" rows="*" iosOverflowSafeArea={true} on:loaded={onLoaded}>
      <hudbackdrop />

      <Show when={agent.hudVisible()}>
        <gridlayout rows="auto, 254, *, 140, auto" padding="6 14 0 14" iosOverflowSafeArea={false} iosOverflowSafeAreaEnabled={false}>
          <Header row={0} />
          <Core row={1} />
          <Stream row={2} />
          <gridlayout row={3} columns="*, 8, 128" marginTop={8}>
            <Telemetry col={0} />
            <Proximity col={2} />
          </gridlayout>
          <CommandDeck row={4} />

          <Show when={agent.approval()} keyed>
            {(a) => (
              <gridlayout row={2} rowSpan={3} class="scrim">
                <ApprovalCard approval={a} />
              </gridlayout>
            )}
          </Show>
        </gridlayout>
      </Show>

      <Show when={!agent.booted()}>
        <Boot />
      </Show>
    </gridlayout>
  );
}
