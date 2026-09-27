import { Color } from '@nativescript/core';
import { HudRadarBase } from './hud-radar.common';

export * from './hud-radar.common';

export class HudRadar extends HudRadarBase {
  createNativeView() {
    const v = new android.view.View(this._context);
    const d = new android.graphics.drawable.GradientDrawable();
    d.setShape(android.graphics.drawable.GradientDrawable.OVAL);
    d.setColor(0);
    d.setStroke(2, new Color(this.tint).android);
    v.setBackground(d);
    return v;
  }
}
