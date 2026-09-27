import { Color } from '@nativescript/core';

/* Small CoreAnimation toolkit shared by the HUD views. Everything here runs on
   the render server, so the rings keep spinning even while JS is busy. */

export const deg = (d: number) => (d * Math.PI) / 180;

export function tint(hex: string, alpha = 1): UIColor {
  const c = new Color(hex);
  return UIColor.colorWithRedGreenBlueAlpha(c.r / 255, c.g / 255, c.b / 255, alpha);
}

export function cgColors(...colors: UIColor[]): NSMutableArray<any> {
  const arr = NSMutableArray.alloc<any>().initWithCapacity(colors.length);
  for (const c of colors) arr.addObject(c.CGColor);
  return arr;
}

export function circle(cx: number, cy: number, r: number): UIBezierPath {
  return UIBezierPath.bezierPathWithArcCenterRadiusStartAngleEndAngleClockwise(CGPointMake(cx, cy), r, 0, Math.PI * 2, true);
}

export function arc(cx: number, cy: number, r: number, fromDeg: number, toDeg: number): UIBezierPath {
  return UIBezierPath.bezierPathWithArcCenterRadiusStartAngleEndAngleClockwise(CGPointMake(cx, cy), r, deg(fromDeg), deg(toDeg), true);
}

export function arcs(cx: number, cy: number, r: number, spans: [number, number][]): UIBezierPath {
  const path = UIBezierPath.bezierPath();
  for (const [a, b] of spans) path.appendPath(arc(cx, cy, r, a, b));
  return path;
}

export function line(x1: number, y1: number, x2: number, y2: number, into?: UIBezierPath): UIBezierPath {
  const path = into ?? UIBezierPath.bezierPath();
  path.moveToPoint(CGPointMake(x1, y1));
  path.addLineToPoint(CGPointMake(x2, y2));
  return path;
}

export interface ShapeOptions {
  path?: UIBezierPath;
  stroke?: UIColor | null;
  fill?: UIColor | null;
  width?: number;
  dash?: number[];
  round?: boolean;
  glow?: { color: UIColor; radius: number; opacity?: number };
}

export function shape(o: ShapeOptions): CAShapeLayer {
  const l = CAShapeLayer.new();
  if (o.path) l.path = o.path.CGPath;
  l.strokeColor = o.stroke ? o.stroke.CGColor : null;
  l.fillColor = o.fill ? o.fill.CGColor : null;
  l.lineWidth = o.width ?? 1;
  if (o.dash) l.lineDashPattern = o.dash as any;
  if (o.round) l.lineCap = kCALineCapRound;
  if (o.glow) {
    l.shadowColor = o.glow.color.CGColor;
    l.shadowRadius = o.glow.radius;
    l.shadowOpacity = o.glow.opacity ?? 0.9;
    l.shadowOffset = CGSizeZero;
  }
  l.contentsScale = UIScreen.mainScreen.scale;
  return l;
}

/* Places a layer as a square centred on (cx, cy) so rotation pivots on the
   centre without any anchor-point math at the call site. */
export function center(l: CALayer, cx: number, cy: number, side: number) {
  l.bounds = CGRectMake(0, 0, side, side);
  l.position = CGPointMake(cx, cy);
}

export function spin(l: CALayer, seconds: number, clockwise = true) {
  const a = CABasicAnimation.animationWithKeyPath('transform.rotation.z');
  a.fromValue = 0;
  a.toValue = clockwise ? Math.PI * 2 : -Math.PI * 2;
  a.duration = seconds;
  a.repeatCount = Infinity;
  a.timingFunction = CAMediaTimingFunction.functionWithName(kCAMediaTimingFunctionLinear);
  l.addAnimationForKey(a, 'spin');
}

export function pulse(l: CALayer, from: number, to: number, seconds: number) {
  const a = CABasicAnimation.animationWithKeyPath('transform.scale');
  a.fromValue = from;
  a.toValue = to;
  a.duration = seconds;
  a.autoreverses = true;
  a.repeatCount = Infinity;
  a.timingFunction = CAMediaTimingFunction.functionWithName(kCAMediaTimingFunctionEaseInEaseOut);
  l.addAnimationForKey(a, 'pulse');
}

/* Retimes a layer's running animations without a visible jump: local time is
   frozen at the moment of the change, then resumes at the new rate. */
export function setSpeed(l: CALayer, speed: number) {
  const now = CACurrentMediaTime();
  const local = l.convertTimeFromLayer(now, null);
  l.speed = speed;
  l.timeOffset = local;
  l.beginTime = now;
}

export function animated(seconds: number, fn: () => void) {
  CATransaction.begin();
  CATransaction.setAnimationDuration(seconds);
  fn();
  CATransaction.commit();
}

export function immediate(fn: () => void) {
  CATransaction.begin();
  CATransaction.setDisableActions(true);
  fn();
  CATransaction.commit();
}

export function radial(colors: UIColor[], locations?: number[]): CAGradientLayer {
  const g = CAGradientLayer.new();
  g.type = kCAGradientLayerRadial;
  g.colors = cgColors(...colors);
  if (locations) g.locations = locations as any;
  g.startPoint = CGPointMake(0.5, 0.5);
  g.endPoint = CGPointMake(1, 1);
  return g;
}

export function vertical(colors: UIColor[], locations?: number[]): CAGradientLayer {
  const g = CAGradientLayer.new();
  g.colors = cgColors(...colors);
  if (locations) g.locations = locations as any;
  g.startPoint = CGPointMake(0.5, 0);
  g.endPoint = CGPointMake(0.5, 1);
  return g;
}

export function conic(colors: UIColor[], locations?: number[]): CAGradientLayer {
  const g = CAGradientLayer.new();
  g.type = kCAGradientLayerConic;
  g.colors = cgColors(...colors);
  if (locations) g.locations = locations as any;
  g.startPoint = CGPointMake(0.5, 0.5);
  g.endPoint = CGPointMake(1, 0.5);
  return g;
}
