import { Utils } from '@nativescript/core';
import { HudArcBase } from './hud-arc.common';
import { arc, center, circle, shape, tint } from './ca.ios';

export * from './hud-arc.common';

export class HudArc extends HudArcBase {
  private size = 0;
  private layers: CALayer[] = [];

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
    for (const l of this.layers) l.removeFromSuperlayer();
    this.layers = [];
    super.disposeNativeView();
  }

  private build(cx: number, cy: number, s: number) {
    for (const l of this.layers) l.removeFromSuperlayer();
    this.layers = [];
    const R = s / 2 - this.thickness;
    const side = s;
    const c = s / 2;

    const track = shape({ path: circle(c, c, R), stroke: tint(this.tint, 0.18), width: this.thickness });
    const fill = shape({ path: arc(c, c, R, -90, 270), stroke: tint(this.tint), width: this.thickness, round: true });
    for (const l of [track, fill]) {
      center(l, cx, cy, side);
      this.nativeViewProtected.layer.addSublayer(l);
      this.layers.push(l);
    }

    if (this.seconds > 0) {
      fill.strokeEnd = 0;
      const drain = CABasicAnimation.animationWithKeyPath('strokeEnd');
      drain.fromValue = 1;
      drain.toValue = 0;
      drain.duration = this.seconds;
      drain.timingFunction = CAMediaTimingFunction.functionWithName(kCAMediaTimingFunctionLinear);
      fill.addAnimationForKey(drain, 'drain');
    }
  }
}
