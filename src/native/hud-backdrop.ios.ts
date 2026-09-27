import { Utils } from '@nativescript/core';
import { HudBackdropBase } from './hud-backdrop.common';
import { center, line, radial, shape, tint, vertical } from './ca.ios';

export * from './hud-backdrop.common';

const CYAN = '#3af0ff';
const GRID = 30;

/* Full-bleed stage: deep gradient, faint grid, a cyan wash at the top, a slow
   scanline and an edge vignette. All CoreAnimation, nothing ticks in JS. */
export class HudBackdrop extends HudBackdropBase {
  private w = 0;
  private h = 0;
  private layers: CALayer[] = [];

  createNativeView() {
    const v = UIView.new();
    v.backgroundColor = UIColor.clearColor;
    v.userInteractionEnabled = false;
    v.clipsToBounds = true;
    return v;
  }

  onLayout(left: number, top: number, right: number, bottom: number) {
    super.onLayout(left, top, right, bottom);
    const w = Utils.layout.toDeviceIndependentPixels(right - left);
    const h = Utils.layout.toDeviceIndependentPixels(bottom - top);
    if (w > 0 && h > 0 && (w !== this.w || h !== this.h)) {
      this.w = w;
      this.h = h;
      this.build(w, h);
    }
  }

  disposeNativeView() {
    for (const l of this.layers) l.removeFromSuperlayer();
    this.layers = [];
    super.disposeNativeView();
  }

  private add(l: CALayer) {
    this.nativeViewProtected.layer.addSublayer(l);
    this.layers.push(l);
    return l;
  }

  private build(w: number, h: number) {
    for (const l of this.layers) l.removeFromSuperlayer();
    this.layers = [];

    const base = vertical([tint('#0a1730'), tint('#050a14'), tint('#04070d')], [0, 0.45, 1]);
    base.frame = CGRectMake(0, 0, w, h);
    this.add(base);

    const wash = radial([tint(CYAN, 0.16), tint(CYAN, 0.04), tint(CYAN, 0)], [0, 0.45, 1]);
    center(wash, w / 2, h * 0.16, w * 1.7);
    this.add(wash);

    let path: UIBezierPath | undefined;
    for (let x = (w % GRID) / 2; x <= w; x += GRID) path = line(x, 0, x, h, path);
    for (let y = (h % GRID) / 2; y <= h; y += GRID) path = line(0, y, w, y, path);
    const grid = shape({ path, stroke: tint(CYAN, 0.055), width: 0.5 });
    grid.frame = CGRectMake(0, 0, w, h);
    this.add(grid);

    const scan = vertical([tint(CYAN, 0), tint(CYAN, 0.075), tint(CYAN, 0)]);
    scan.bounds = CGRectMake(0, 0, w, 220);
    scan.position = CGPointMake(w / 2, -110);
    this.add(scan);
    const sweep = CABasicAnimation.animationWithKeyPath('position.y');
    sweep.fromValue = -110;
    sweep.toValue = h + 110;
    sweep.duration = 9;
    sweep.repeatCount = Infinity;
    sweep.timingFunction = CAMediaTimingFunction.functionWithName(kCAMediaTimingFunctionLinear);
    scan.addAnimationForKey(sweep, 'scan');

    const vignette = radial([tint('#000000', 0), tint('#000000', 0), tint('#000000', 0.62)], [0, 0.55, 1]);
    center(vignette, w / 2, h / 2, Math.max(w, h) * 1.35);
    this.add(vignette);
  }
}
