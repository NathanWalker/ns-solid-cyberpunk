import type { JSX as NSJSX } from '@nativescript-dom/solidjs-types/jsx-runtime';

type ViewAttrs = NSJSX.IntrinsicElements['contentview'];

declare module '@nativescript-dom/solidjs-types/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements {
      hudbackdrop: ViewAttrs;
      hudring: ViewAttrs & { mode?: string; level?: number };
      hudarc: ViewAttrs & { progress?: number; seconds?: number; tint?: string; thickness?: number };
      hudradar: ViewAttrs & { contacts?: number; tint?: string };
    }
  }
}
