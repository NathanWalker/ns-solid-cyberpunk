import { Utils } from '@nativescript/core';
import { HudRingBase, levelProperty, modeProperty, MODE_SPEED, MODE_TINT } from './hud-ring.common';
import { animated, arc, arcs, center, cgColors, circle, immediate, pulse, radial, setSpeed, shape, spin, tint } from './ca.ios';

export * from './hud-ring.common';

const CYAN = '#3af0ff';

/* Concentric instrument rings. Layer geometry is rebuilt only when the view's
   size changes; mode and level changes just retint / retime what exists. */
export class HudRing extends HudRingBase {
  private size = 0;
  private layers: CALayer[] = [];
  private trio?: CAShapeLayer;
  private sweep?: CAShapeLayer;
  private levelArc?: CAShapeLayer;
  private glow?: CAGradientLayer;
  private core?: CAShapeLayer;
  private spinning: CALayer[] = [];

  createNativeView() {
    const v = UIView.new();
    v.backgroundColor = UIColor.clearColor;
    v.userInteractionEnabled = false;
    return v;
  }

  onLayout(left: number, top: number, right: number, bottom: number) {
    super.onLayout(left, top, right, bottom);
    const w = Utils.layout.toDeviceIndependentPixels(right - left);
    const h = Utils.layout.toDeviceIndependentPixels(bottom - top);
    const s = Math.min(w, h);
    if (s > 0 && s !== this.size) {
      this.size = s;
      this.build(w / 2, h / 2, s);
    }
  }

  disposeNativeView() {
    this.teardown();
    super.disposeNativeView();
  }

  [modeProperty.setNative]() {
    this.applyMode();
  }

  [levelProperty.setNative]() {
    this.applyLevel();
  }

  private teardown() {
    for (const l of this.layers) l.removeFromSuperlayer();
    this.layers = [];
    this.spinning = [];
    this.size = 0;
  }

  private add(l: CALayer, cx: number, cy: number, side: number) {
    center(l, cx, cy, side);
    this.nativeViewProtected.layer.addSublayer(l);
    this.layers.push(l);
    return l;
  }

  private build(cx: number, cy: number, s: number) {
    this.teardown();
    this.size = s;
    const R = s / 2 - 6;
    const side = R * 2;
    const c = R;
    const accent = tint(MODE_TINT[this.mode]);

    const ticks = shape({
      path: circle(c, c, R),
      stroke: tint(CYAN, 0.38),
      width: 1,
      dash: [1.5, (Math.PI * 2 * R) / 72 - 1.5],
    });
    this.add(ticks, cx, cy, side);
    spin(ticks, 120);

    this.trio = shape({
      path: arcs(c, c, R - 13, [
        [0, 64],
        [120, 184],
        [240, 304],
      ]),
      stroke: accent,
      width: 3,
      round: true,
    });
    this.add(this.trio, cx, cy, side);
    spin(this.trio, 18, false);

    const dashes = shape({ path: circle(c, c, R - 26), stroke: tint(CYAN, 0.5), width: 1.5, dash: [16, 6] });
    this.add(dashes, cx, cy, side);
    spin(dashes, 45);

    this.sweep = shape({
      path: arc(c, c, R - 40, 0, 200),
      stroke: accent,
      width: 5,
      glow: { color: accent, radius: 9 },
    });
    this.add(this.sweep, cx, cy, side);
    spin(this.sweep, 7);

    const track = shape({ path: circle(c, c, R - 54), stroke: tint(CYAN, 0.12), width: 2.5 });
    this.add(track, cx, cy, side);

    this.levelArc = shape({ path: arc(c, c, R - 54, -90, 270), stroke: tint(CYAN), width: 2.5, round: true });
    this.levelArc.strokeEnd = 0;
    this.add(this.levelArc, cx, cy, side);

    const coreR = R - 66;
    this.glow = radial([tint(MODE_TINT[this.mode], 0.42), tint(MODE_TINT[this.mode], 0)], [0.1, 1]);
    this.add(this.glow, cx, cy, coreR * 2 * 1.55);
    pulse(this.glow, 0.88, 1.1, 2.4);

    this.core = shape({ path: circle(c, c, coreR), fill: tint(MODE_TINT[this.mode], 0.07), stroke: tint(MODE_TINT[this.mode], 0.6), width: 1 });
    this.add(this.core, cx, cy, side);

    this.spinning = [ticks, this.trio, dashes, this.sweep];
    this.applyMode();
    this.applyLevel();
  }

  private applyMode() {
    if (!this.trio) return;
    const hex = MODE_TINT[this.mode] ?? CYAN;
    const accent = tint(hex);
    animated(0.6, () => {
      this.trio!.strokeColor = accent.CGColor;
      this.sweep!.strokeColor = accent.CGColor;
      this.sweep!.shadowColor = accent.CGColor;
      this.core!.strokeColor = tint(hex, 0.6).CGColor;
      this.core!.fillColor = tint(hex, 0.07).CGColor;
      this.glow!.colors = cgColors(tint(hex, 0.42), tint(hex, 0));
    });
    const speed = MODE_SPEED[this.mode] ?? 1;
    for (const l of this.spinning) setSpeed(l, speed);
    setSpeed(this.glow!, this.mode === 'awaiting' ? 2.4 : 1);
  }

  private applyLevel() {
    if (!this.levelArc) return;
    const v = Math.max(0, Math.min(1, this.level || 0));
    if (v === 0) {
      immediate(() => (this.levelArc!.strokeEnd = 0));
      return;
    }
    animated(0.7, () => (this.levelArc!.strokeEnd = v));
  }
}
