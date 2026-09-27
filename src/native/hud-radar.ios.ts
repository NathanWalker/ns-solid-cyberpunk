import { Utils } from '@nativescript/core';
import { contactsProperty, HudRadarBase } from './hud-radar.common';
import { center, circle, conic, deg, line, shape, spin, tint } from './ca.ios';

export * from './hud-radar.common';

/* Proximity sweep: concentric range rings, a conic-gradient sweep that spins
   on the render server, and one pinging blip per contact. Blip positions are
   a deterministic spread so the same contact count always looks the same. */
export class HudRadar extends HudRadarBase {
  private size = 0;
  private cx = 0;
  private cy = 0;
  private layers: CALayer[] = [];
  private blips: CALayer[] = [];

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
      this.cx = w / 2;
      this.cy = h / 2;
      this.build(s);
    }
  }

  disposeNativeView() {
    this.clear(this.layers);
    this.clear(this.blips);
    super.disposeNativeView();
  }

  [contactsProperty.setNative]() {
    if (this.size) this.placeBlips();
  }

  private clear(list: CALayer[]) {
    for (const l of list) l.removeFromSuperlayer();
    list.length = 0;
  }

  private add(l: CALayer, list = this.layers) {
    this.nativeViewProtected.layer.addSublayer(l);
    list.push(l);
    return l;
  }

  private build(s: number) {
    this.clear(this.layers);
    const R = s / 2 - 3;
    const side = R * 2;
    const c = R;
    const accent = this.tint;

    const rings = UIBezierPath.bezierPath();
    for (const f of [1, 0.66, 0.33]) rings.appendPath(circle(c, c, R * f));
    const ringLayer = shape({ path: rings, stroke: tint(accent, 0.28), width: 0.75 });
    this.add(ringLayer);
    center(ringLayer, this.cx, this.cy, side);

    let cross = line(c, 0, c, side);
    cross = line(0, c, side, c, cross);
    const crossLayer = shape({ path: cross, stroke: tint(accent, 0.18), width: 0.5 });
    this.add(crossLayer);
    center(crossLayer, this.cx, this.cy, side);

    const sweep = conic([tint(accent, 0), tint(accent, 0), tint(accent, 0.12), tint(accent, 0.5)], [0, 0.55, 0.85, 1]);
    const mask = shape({ path: circle(c, c, R), fill: UIColor.whiteColor });
    mask.frame = CGRectMake(0, 0, side, side);
    sweep.mask = mask;
    this.add(sweep);
    center(sweep, this.cx, this.cy, side);

    const edge = shape({ path: line(c, c, side, c), stroke: tint(accent, 0.95), width: 1.2, glow: { color: tint(accent), radius: 4 } });
    this.add(edge);
    center(edge, this.cx, this.cy, side);

    spin(sweep, 4);
    spin(edge, 4);

    this.placeBlips();
  }

  private placeBlips() {
    this.clear(this.blips);
    const R = this.size / 2 - 3;
    const n = Math.max(0, this.contacts | 0);
    const now = CACurrentMediaTime();
    for (let i = 0; i < n; i++) {
      const angle = deg((i * 137.5 + 40) % 360);
      const dist = R * (0.28 + ((i * 0.37) % 0.62));
      const x = this.cx + Math.cos(angle) * dist;
      const y = this.cy + Math.sin(angle) * dist;

      const dot = shape({ path: circle(4, 4, 2.2), fill: tint(this.tint) });
      this.add(dot, this.blips);
      center(dot, x, y, 8);

      const ping = shape({ path: circle(4, 4, 2.2), stroke: tint(this.tint, 0.9), width: 1 });
      this.add(ping, this.blips);
      center(ping, x, y, 8);

      const grow = CABasicAnimation.animationWithKeyPath('transform.scale');
      grow.fromValue = 1;
      grow.toValue = 4.5;
      const fade = CABasicAnimation.animationWithKeyPath('opacity');
      fade.fromValue = 0.9;
      fade.toValue = 0;
      const group = CAAnimationGroup.new();
      group.animations = [grow, fade] as any;
      group.duration = 2.1;
      group.repeatCount = Infinity;
      group.beginTime = now + i * 0.5;
      group.timingFunction = CAMediaTimingFunction.functionWithName(kCAMediaTimingFunctionEaseOut);
      ping.addAnimationForKey(group, 'ping');
    }
  }
}
