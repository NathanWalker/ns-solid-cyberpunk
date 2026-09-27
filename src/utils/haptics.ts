import { isIOS, Utils } from '@nativescript/core';

let light: UIImpactFeedbackGenerator | null = null;
let medium: UIImpactFeedbackGenerator | null = null;
let selection: UISelectionFeedbackGenerator | null = null;
let notify: UINotificationFeedbackGenerator | null = null;

function androidVibrate(ms: number, amplitude = 80) {
  const ctx = Utils.android.getApplicationContext();
  const v = ctx.getSystemService(android.content.Context.VIBRATOR_SERVICE) as android.os.Vibrator;
  if (v?.hasVibrator()) v.vibrate(android.os.VibrationEffect.createOneShot(ms, amplitude));
}

export const haptics = {
  tick() {
    isIOS ? (selection ??= UISelectionFeedbackGenerator.new()).selectionChanged() : androidVibrate(8, 40);
  },
  tap() {
    isIOS
      ? (light ??= UIImpactFeedbackGenerator.alloc().initWithStyle(UIImpactFeedbackStyle.Light)).impactOccurred()
      : androidVibrate(12, 80);
  },
  thud() {
    isIOS
      ? (medium ??= UIImpactFeedbackGenerator.alloc().initWithStyle(UIImpactFeedbackStyle.Medium)).impactOccurred()
      : androidVibrate(25, 160);
  },
  success() {
    isIOS
      ? (notify ??= UINotificationFeedbackGenerator.new()).notificationOccurred(UINotificationFeedbackType.Success)
      : androidVibrate(40, 200);
  },
  warning() {
    isIOS
      ? (notify ??= UINotificationFeedbackGenerator.new()).notificationOccurred(UINotificationFeedbackType.Warning)
      : androidVibrate(60, 220);
  },
};
