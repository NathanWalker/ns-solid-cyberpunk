import { Color } from '@nativescript/core';
import { HudRingBase, MODE_TINT, modeProperty } from './hud-ring.common';

export * from './hud-ring.common';

export class HudRing extends HudRingBase {
  private ring?: android.graphics.drawable.GradientDrawable;

  createNativeView() {
    const v = new android.view.View(this._context);
    this.ring = new android.graphics.drawable.GradientDrawable();
    this.ring.setShape(android.graphics.drawable.GradientDrawable.OVAL);
    this.ring.setColor(0);
    this.ring.setStroke(4, new Color(MODE_TINT[this.mode] ?? MODE_TINT.idle).android);
    v.setBackground(this.ring);
    return v;
  }

  [modeProperty.setNative]() {
    this.ring?.setStroke(4, new Color(MODE_TINT[this.mode] ?? MODE_TINT.idle).android);
  }
}
