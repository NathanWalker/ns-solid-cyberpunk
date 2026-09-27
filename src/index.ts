import { render } from "@nativescript-community/solid-js";
import { Application, Frame, TouchManager } from "@nativescript/core";
import { document, registerElement } from "dominative";
import { startSolidApp } from "@nativescript/vite/solid-bootstrap";
import { HudBackdrop } from "./native/hud-backdrop";
import { HudRing } from "./native/hud-ring";
import { HudRadar } from "./native/hud-radar";
import { HudArc } from "./native/hud-arc";
import { App } from "./app";

registerElement("hudbackdrop", HudBackdrop);
registerElement("hudring", HudRing);
registerElement("hudradar", HudRadar);
registerElement("hudarc", HudArc);

TouchManager.enableGlobalTapAnimations = true;

if (__DEV__) {
  (globalThis as any).__NS_HMR_OVERLAY_POSITION__ = "bottom";
}

startSolidApp({
  Application,
  render,
  document,
  Frame,
  root: App,
  rootModule: "/src/app",
});
