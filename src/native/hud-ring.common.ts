import { Property, View } from '@nativescript/core';

export type HudMode = 'boot' | 'idle' | 'thinking' | 'awaiting' | 'executing';

export const modeProperty = new Property<HudRingBase, HudMode>({ name: 'mode', defaultValue: 'idle' });
export const levelProperty = new Property<HudRingBase, number>({
  name: 'level',
  defaultValue: 0,
  valueConverter: (v) => parseFloat(v),
});

export const MODE_TINT: Record<HudMode, string> = {
  boot: '#3af0ff',
  idle: '#3af0ff',
  thinking: '#ffb53a',
  awaiting: '#ff3fa4',
  executing: '#46ffa6',
};

export const MODE_SPEED: Record<HudMode, number> = {
  boot: 3.5,
  idle: 1,
  thinking: 3.2,
  awaiting: 0.5,
  executing: 2.2,
};

export abstract class HudRingBase extends View {
  declare mode: HudMode;
  declare level: number;
}

modeProperty.register(HudRingBase);
levelProperty.register(HudRingBase);
