import { createEffect, For } from 'solid-js';
import type { View } from '@nativescript/core';
import { agent } from '../state/agent';

export function Boot() {
  let root: View | undefined;
  createEffect(
    () => agent.hudVisible(),
    (visible) => {
      if (visible) root?.animate({ opacity: 0, duration: 650, delay: 200 }).catch(() => {});
    }
  );
  const fill = () => `${Math.max(1, Math.round(agent.bootProgress() * 100))}%`;

  return (
    <gridlayout class="boot" rows="*, auto, auto, *" ref={(el: View) => (root = el)}>
      <stacklayout row={1}>
        <label class="boot-mark" text="AEGIS" />
        <label class="boot-sub" text="AUTONOMOUS OPERATIONS INTERFACE" />
      </stacklayout>
      <stacklayout row={2}>
        <gridlayout class="boot-track">
          <gridlayout class="boot-fill" width={fill()} horizontalAlignment="left" />
        </gridlayout>
        <stacklayout height={110}>
          <For each={agent.bootLines()}>
            {(l) => <label class={`boot-line ${l.startsWith('ALL') ? 'boot-ok' : ''}`} text={`▸ ${l}`} />}
          </For>
        </stacklayout>
      </stacklayout>
    </gridlayout>
  );
}
