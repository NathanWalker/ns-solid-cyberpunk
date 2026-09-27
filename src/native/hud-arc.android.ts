import { Color } from '@nativescript/core';
import { HudArcBase } from './hud-arc.common';

export * from './hud-arc.common';

export class HudArc extends HudArcBase {
  createNativeView() {
    const v = new android.view.View(this._context);
    const d = new android.graphics.drawable.GradientDrawable();
    d.setShape(android.graphics.drawable.GradientDrawable.OVAL);
    d.setColor(0);
    d.setStroke(3, new Color(this.tint).android);
    v.setBackground(d);
    return v;
  }
}
