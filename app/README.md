# Synthesis (Banana Beater) — phone test app

Plain HTML/JS/Web Audio PWA. No keys, no paid services, no build step.

## Run locally
    cd app && python3 -m http.server 8765
Open http://127.0.0.1:8765/ (phone on same Wi-Fi: http://<computer-ip>:8765 — note mic, MIDI and service worker need HTTPS or localhost).

## Features
- Play tab: 8 synthesized pads (kick, snare, hat, clap, bass, lead, chord, zap), knobs for filter/tempo/volume/FX (drag up/down), 16-step sequencer, Play/Stop/Rec (Rec writes pad hits into the loop), Clear.
- Car tab: hold-to-talk (Web Speech API) — play, stop, record, remix, mute/unmute, volume up/down, spoken confirmation. Big buttons as fallback.
- Web MIDI input: notes from 36 up map to pads.
- Library: **stub** — Freesound and Jamendo need API keys, so a demo list is shown. Only CC0/CC-BY allowed; NC/ND filtered; attribution always displayed. Emoji 🥁 🎹 🔥 in the search box trigger kick/chord/remix.
- manifest.webmanifest + sw.js: offline cache, Add to Home Screen.
