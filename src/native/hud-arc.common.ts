import { Property, View } from '@nativescript/core';

/* Drains from full to empty over `seconds` once laid out; a countdown dial. */
export const secondsProperty = new Property<HudArcBase, number>({
  name: 'seconds',
  defaultValue: 0,
  valueConverter: (v) => parseFloat(v),
});
export const tintProperty = new Property<HudArcBase, string>({ name: 'tint', defaultValue: '#ff3fa4' });
export const thicknessProperty = new Property<HudArcBase, number>({
  name: 'thickness',
  defaultValue: 2.5,
  valueConverter: (v) => parseFloat(v),
});

export abstract class HudArcBase extends View {
  declare seconds: number;
  declare tint: string;
  declare thickness: number;
}

secondsProperty.register(HudArcBase);
tintProperty.register(HudArcBase);
thicknessProperty.register(HudArcBase);
