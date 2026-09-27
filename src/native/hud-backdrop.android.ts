import { Color } from '@nativescript/core';
import { HudBackdropBase } from './hud-backdrop.common';

export * from './hud-backdrop.common';

export class HudBackdrop extends HudBackdropBase {
  createNativeView() {
    const v = new android.view.View(this._context);
    // GradientDrawable(Orientation, int[]) is overloaded on the array type, so the
    // colours must be a typed Java array; a JS array literal cannot be marshalled.
    const colors = Array.create('int', 2) as androidNative.Array<number>;
    colors[0] = new Color('#0a1730').android;
    colors[1] = new Color('#04070d').android;
    const g = new android.graphics.drawable.GradientDrawable(
      android.graphics.drawable.GradientDrawable.Orientation.TOP_BOTTOM,
      colors
    );
    v.setBackground(g);
    return v;
  }
}
