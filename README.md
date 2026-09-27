# AEGIS: a JARVIS-style operations HUD in NativeScript + Solid 2

A one-screen "human-in-the-loop" interface: an AI agent narrates what it is
doing, telemetry reacts to its phase, and when an action needs an operator the
screen hands over a gate with a draining dial and two large targets. Input is
four intents and a hold-to-speak orb; everything else is output.

Exploring futuristic UI's.

https://github.com/user-attachments/assets/6a771209-21ff-4331-a032-ef60d978773c

## Run

```sh
npm install
ns debug ios
# or
ns debug android
```

Edit `src/hud.css` while it runs to restyle the live app (CSS hot updates do
not remount). Edit any component to remount the tree against the same running
mission; the agent state lives in `src/state/`, outside the component tree.

## Stack

| Layer | What |
| --- | --- |
| UI runtime | `solid-js` 2.0 rc through `@nativescript-community/solid-js` (universal renderer over dominative) |
| Bundler | `@nativescript/vite` with `@solidjs/vite-plugin`, Solid pinned to its browser bundles (see `vite.config.mts`) |
| Motion | CoreAnimation layers driven from TypeScript (`src/native/*.ios.ts`): instrument rings, radar sweep, countdown dial, backdrop grid + scanline. Zero JS per frame. |
| Sound | Procedural 16-bit WAVs rendered at startup and played through `AVAudioPlayer` (`src/utils/audio.ts`). No audio assets. |
| Haptics | `UIImpactFeedbackGenerator` family (`src/utils/haptics.ts`) |
| Type | Orbitron (display) + JetBrains Mono (data), variable fonts via `font-variation-settings` |

## Layout

```
src/
  components/   header · core · stream · telemetry · command-deck · approval · boot
  native/       hud-ring · hud-radar · hud-arc · hud-backdrop  (common / ios / android / d.ts)
  state/        agent.ts (signals)  ·  scenarios.ts (timed intent scripts + boot)
  utils/        audio · haptics · decode-text
  hud.css       design tokens + every HUD class
```

## Notes

* `patches/solid-navigation*.patch` ports the router to Solid 2 primitives
  (`onSettled`, context-as-provider, mutable stores).
* Keep `solid-js`, `@solidjs/signals`, `@solidjs/universal` and `@solidjs/web` on the
  same rc. `solid-js` only declares `^2.0.0-rc.0` for signals, so trying a newer rc and
  reverting leaves a newer signals in the lockfile; the app then boots to a black screen
  with "Trying to navigate to a route \"Home\" that does not exist". `package.json` pins
  and overrides signals for that reason.
