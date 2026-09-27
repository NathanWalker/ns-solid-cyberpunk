import { View } from '@nativescript/core';

export abstract class HudBackdropBase extends View {
  constructor() {
    super();
    this.iosOverflowSafeArea = true;
  }
}
