import { Property, View } from '@nativescript/core';

export const contactsProperty = new Property<HudRadarBase, number>({
  name: 'contacts',
  defaultValue: 0,
  valueConverter: (v) => parseInt(v, 10),
});
export const tintProperty = new Property<HudRadarBase, string>({ name: 'tint', defaultValue: '#3af0ff' });

export abstract class HudRadarBase extends View {
  declare contacts: number;
  declare tint: string;
}

contactsProperty.register(HudRadarBase);
tintProperty.register(HudRadarBase);
