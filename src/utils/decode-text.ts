import { createEffect, createSignal, onCleanup } from 'solid-js';

const GLYPHS = '!<>-_\\/[]{}=+*^?#%&@01';

function scramble(target: string, reveal: number): string {
  let out = target.slice(0, reveal);
  for (let i = reveal; i < target.length; i++) {
    out += target[i] === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0];
  }
  return out;
}

/* Text materializes left-to-right out of glyph noise whenever `source` changes. */
export function createDecodedText(source: () => string, opts: { steps?: number; interval?: number; onStep?: () => void } = {}) {
  const steps = opts.steps ?? 12;
  const interval = opts.interval ?? 28;
  const [text, setText] = createSignal(scramble(source(), 0));
  let timer: ReturnType<typeof setInterval> | undefined;

  createEffect(
    () => source(),
    (target) => {
      clearInterval(timer);
      let step = 0;
      const run = () => {
        step++;
        if (step >= steps) {
          clearInterval(timer);
          setText(target);
          return;
        }
        setText(scramble(target, Math.floor((step / steps) * target.length)));
        opts.onStep?.();
      };
      timer = setInterval(run, interval);
      return () => clearInterval(timer);
    }
  );
  onCleanup(() => clearInterval(timer));
  return text;
}
