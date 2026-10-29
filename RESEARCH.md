# Banana Beater: Research Report (v0, Oct 29 2026)
Research only, not legal advice. Prices and specs come from the cited sources. Where no source was found, the entry says **unknown**. Battery estimates are my arithmetic: 50 Wh × ~0.85 conversion efficiency ≈ 42 Wh usable, divided by the board's measured draw **plus ~3 W** for the display, codec, radios and fan. Treat them as rough.

## 1) Dream-tier compute module comparison

| # | Module | CPU / RAM | Idle / load W (measured or spec) | Cooling | Fedora | KVM | Price (source) | Est. on 50 Wh (idle-ish jam / sustained load) |
|---|---|---|---|---|---|---|---|---|
| 1 | **LattePanda Mu (Intel N100 / i3-N305)** | 4C/4T N100 or 8C/8T N305; 8 or 16 GB LPDDR5 | TDP configurable 6–35 W (N100), 9–35 W (N305). Measured idle unknown | Passive at 6 W, active above | Standard x86 UEFI, so stock Fedora should work. Vendor lists only Windows and Ubuntu | Yes (Intel VT-x, mature KVM) | $359 module (DFRobot listing); earlier ~$139 reported. Carrier board extra | ~4.5 h at 6 W cap / ~2.3 h at 15 W |
| 2 | **Radxa ROCK 5B / RK3588 (CM: Radxa CM5, etc.)** | 4×A76 + 4×A55; 4–32 GB | 1.7–5 W idle; 9.5–13 W load; 19 W peak (Linpack) | Needs a heatsink; throttles at 85 °C in ~4 min without one | Not mainline-first; Armbian is official. Fedora is possible on newer kernels but **unverified** | Arm KVM works on RK3588 (community); the A76/A55 mixed cores complicate vCPU pinning | $159.90 for 8 GB (sbc.compare, Oct 2026), $100 RRP | ~5.5 h / ~3.3 h |
| 3 | **Raspberry Pi CM5 (baseline)** | 4×A76 @ 2.4 GHz; 2–8 GB (16 GB variants exist; price unknown) | 2.3–2.65 W idle; 8–10 W load | Passive OK at stock; active cooling plus a low-profile heatsink for sustained load | Fedora supports the Pi 5/CM5 only partially (graphics and peripherals are still maturing). Pi OS is the primary OS | KVM is available on Pi 5 kernels | $75 for 8 GB Lite, $95 for 8 GB/64 GB eMMC with Wi-Fi (MSRP) | ~7.5 h / ~3.5 h |
| 4 | **NVIDIA Jetson Orin Nano Super (dev kit)** | 6×A78AE @ 1.7 GHz; 8 GB LPDDR5; 1024-core Ampere GPU, 67 TOPS | 7 / 15 / 25 W power modes | Active (fan included) | **Not supported**: JetPack is Ubuntu-based, so running Fedora means losing the CUDA stack | KVM is not a supported JetPack feature (unknown/limited) | $249 (NVIDIA) | ~4.2 h at 7 W / ~1.5 h at 25 W |
| 5 | **Jetson Orin NX 16 GB** | 8×A78AE; 16 GB | 10–25 W modes (plus a 40 W MAXN mode on the Super refresh) | Active | Same as Orin Nano (Ubuntu/JetPack) | Same | Not found this session: **unknown** | ~3 h / ~1.5 h |
| 6 | **Radxa Orion O6 (CIX P1, Armv9)** | 12-core Armv9.2; 8–64 GB | 14.2 W idle, 24.9 W stress, 35.7 W HPL (Geerling); newer firmware reportedly 6–8 W idle | Active; Mini-ITX size, **too large for a handheld** | Radxa ships a Fedora image; it boots but is less optimized than Debian | Armv9 virtualization; KVM status **unverified** | From $200 for 8 GB (Tom's Hardware); US price rose after tariffs | ~2.5 h / ~1.5 h |
| 7 | **Qualcomm Snapdragon X Elite Dev Kit** | 12-core Oryon | ~11 W idle (reported) | Active, desktop box | Linux/Fedora support **immature**/unknown | Unknown | $855.42 (reported listing); the kit was cancelled by Qualcomm in late 2024, so availability is doubtful | n/a |

AMD Ryzen embedded (e.g. Ryzen 7840HS/8840U SoMs or mini boards): no sourced price or power figures were found this session, so they are left **unknown**. Typical cTDP is 15–28 W, which makes battery life worse than the N100.

### Ranked recommendation
1. **LattePanda Mu N100 (capped at 6–10 W)**. It's x86, so stock Fedora and KVM are first-class, Docker inside a VM is easy, and you get PCIe/USB for an I2S/USB codec. Its battery life on 50 Wh is the best of any module that runs a real VM well. The N305 is the upgrade if the VM load needs it. Main con: a custom carrier board, and a ~$359 retail module.
2. **RK3588 module (e.g. Radxa CM5 / ROCK 5B class)**. Strongest Arm performance per watt, an NPU, and about $100–160. Con: Fedora and KVM are not well trodden, so plan on Armbian or Debian, or budget for bring-up time.
3. **Raspberry Pi CM5**. Lowest power and cost, with the best ecosystem (I2S HATs, audio community). It's the right board for the prototype tier, but with 8 GB and four cores it's tight for a VM plus Docker plus ArtCraft.
4. **Jetson Orin Nano Super**. Choose it only if on-device AI generation is required. It conflicts with the Fedora + VM requirement.
5. Orion O6 / Snapdragon X: not handheld-viable.

**Design note:** the VM layer adds overhead and latency jitter that hurt real-time audio. Consider running the audio engine (PipeWire/JACK with a PREEMPT_RT kernel) on the host and keeping only ArtCraft in Docker (rootless Podman is native to Fedora), with no VM.

Sources: sbc.compare ROCK 5B https://sbc.compare/radxa-rock-5b · bret.dk review https://bret.dk/radxa-rock-5b-review-powerful-rk3588-sbc/ · CM5 power (Geerling) https://github.com/geerlingguy/sbc-reviews/issues/58 · CM5 pricing https://boardor.com/blog/raspberry-pi-cm5-review-same-appearance-enhanced-performance · https://www.jeffgeerling.com/blog/2024/raspberry-pi-cm5-2-3x-faster-drop-upgrade-mostly/ · Jetson https://developer.nvidia.com/blog/nvidia-jetson-orin-nano-developer-kit-gets-a-super-boost/ · LattePanda Mu specs https://docs.lattepanda.com/content/mu%5Fedition/specification/ · price https://www.dfrobot.com/category-184.html · Orion O6 https://www.tomshardware.com/pc-components/motherboards/worlds-first-open-source-armv9-motherboard-surfaces-radxa-orion-o6s-pricing-starts-at-usd200-for-the-8gb-ram-model · https://github.com/geerlingguy/sbc-reviews/issues/62 · https://forum.radxa.com/t/idle-power-on-the-orion-o6-status-progress-how-configure/27261?page=2

## 2) Prior art
Prices weren't verified this session, so none are listed here.
| Product | What it is | Overlap with Banana Beater |
|---|---|---|
| Teenage Engineering OP-1 / OP-1 field, OP-Z, EP-133 K.O. II | Battery handheld synth/sampler/sequencers on closed firmware | Form factor and "jam anywhere"; no AI, no marketplace |
| Synthstrom Deluge | Portable battery groovebox; firmware now open-source (community) | Hackable handheld sequencer |
| Polyend Tracker / Tracker+ | Portable tracker/sampler | Sampling workflow |
| Zynthian | Open-source Raspberry Pi synth platform (Linux, plugins) | Closest architecture analogue (Pi + Linux audio + knobs); not handheld, no cloud AI |
| MOD Dwarf (MOD Audio) | Linux-based pedalboard running LV2 plugins | Linux plugin host plus a web UI/marketplace for plugins |
| Critter & Guitari Organelle | Linux computer instrument running Pure Data patches | "Computer as instrument" with a patch library |
| Bela (Bela.io) | Ultra-low-latency embedded audio platform (BeagleBone) | Reference for sub-ms I/O latency |
| Native Instruments Maschine+ | Standalone groovebox running an embedded x86 computer | Proves x86 standalone works; mains-powered, no battery |
| AI generative tools (Suno, Udio, Google Lyria/MusicFX, Splice's AI tools) | Cloud/app-based generation | Banana Beater would put generation plus voice control into dedicated hardware; no well-known AI-first handheld instrument was confirmed this session |
| Marketplaces: Splice (royalty-free samples by subscription credits), Tracklib (sample clearance for real records), BandLab (free DAW plus community), Audius (decentralized streaming; had a token) | Licensing and distribution | Splice credits are the closest precedent for fixed-price, non-transferable credits, and they have not been treated as securities |

**What Banana Beater does differently:** hardware, AI and a licence marketplace in one device; voice-driven car mode with offline safety commands; an agent-native REST API over CC sources; per-use remix licences with lineage (graph).
**Gaps/risks:** real-time latency on a VM stack; battery under AI load; the CC licence passthrough limits noted by Opensource Bot (NC/ND are hard blocks); "Songcraft" is not verified as a released product; incumbents (Splice, TE) own the brand trust; driver distraction and liability in car mode.

## 3) Legal risk of the remix-credit token (research, not legal advice)
**Framework.** Under *SEC v. W.J. Howey* (1946), something is an investment contract if it involves (1) an investment of money (2) in a common enterprise (3) with an expectation of profit (4) from the efforts of others. The SEC's 2019 "Framework for 'Investment Contract' Analysis of Digital Assets" treats consumptive use, fixed pricing, immediate usability and restricted transferability as factors weighing against a security.
**No-action letters:** *TurnKey Jet* (Apr 2019) covered tokens fixed at $1, redeemable only for charter flights, usable immediately, and transferable only within the platform. *Pocketful of Quarters* (Jul 2020) covered gaming "Quarters" at a fixed price, used only for consumption, with no secondary trading beyond the platform. Both letters required no marketing of profit.
**2025–2026:** SEC staff said meme coins aren't securities (Feb 27 2025, https://www.sec.gov/newsroom/speeches-statements/staff-statement-meme-coins). In **March 2026** the SEC adopted an interpretive release (Rel. 33-11412) creating a taxonomy in which digital commodities, digital **collectibles**, digital **tools** and GENIUS Act stablecoins are not securities. A token can still be sold *subject to* an investment contract, and the release says promises must be explicit to create Howey reliance (https://www.sec.gov/files/rules/interp/2026/33-11412.pdf; Atkins remarks https://www.sec.gov/newsroom/speeches-statements/atkins-remarks-regulation-crypto-assets-031726). The GENIUS Act (2025) regulates payment stablecoins only; it's relevant only if tokens are pegged and redeemable for USD. The **CLARITY Act** (H.R. 3633) passed the House 294–134 on Jul 17 2025, but Senate cloture failed 49–50 on Sep 15 2026, so it is **not law** (https://www.senate.gov/legislative/cloture/119.htm, https://cryptoticker.io/en/clarity-act-explained/).
**Non-securities risk:** if credits are bought with fiat, held, and creators are paid out in fiat, the platform may be a **money transmitter** (FinCEN MSB rules, state MTL licences) or issuer of **stored value / prepaid access** (FinCEN prepaid-access rule, state gift-card/escheat laws). Closed-loop credits redeemable only for the platform's own licences usually fall outside money transmission. Creator cash-outs push toward needing a payments partner (e.g. Stripe Connect as merchant of record or payout agent).

| Design | Securities risk | MSB/stored-value risk |
|---|---|---|
| A. Closed-loop, non-transferable, fixed-price in-app credits (off-chain like Splice credits), no refunds to cash, creators paid fiat royalties via payments processor | **Low** | **Low–Med** (escheat/prepaid rules; outsource payouts) |
| B. On-chain token, fixed price, transferable only within the platform, no secondary market (TurnKey/PoQ-style) | **Low–Med** | **Med** |
| C. Freely tradable token on exchanges, capped or variable supply | **Med–High**, and High if marketed for appreciation | **Med–High** |
| D. Token that earns a revenue share or "staking" from the marketplace's fees, or is sold presale to fund development | **High** (classic investment contract) | High |

**Ways to lower risk:** call them "credits", not tokens or crypto. Keep them off-chain, at a fixed $ price, non-transferable, with no resale and no buyback. Make them usable immediately at launch, with no presale and no supply cap hype. Make no profit or appreciation language anywhere in marketing. Pay creators fiat via a licensed processor. Add expiry and escheat handling. Get counsel to review before launch. Design A gets roughly 90% of the UX with the least exposure.

Sources: TurnKey Jet NAL https://www.sec.gov/divisions/corpfin/cf-noaction/2019/turnkey-jet-040219-2a1.htm · Pocketful of Quarters NAL https://www.sec.gov/divisions/corpfin/cf-noaction/2020/pocketful-of-quarters-inc-072320-2a1.pdf · 2019 Framework https://www.sec.gov/corpfin/framework-investment-contract-analysis-digital-assets · plus the 2025–26 links above.
