# Banana Beater: Raspberry Pi 5 tier parts list and power budget (v0)
MVP concept credit: Cow (Instagram). Prices marked "verified" were checked Oct 29, 2026; others are TBD, and nothing has been bought.

## Parts
| Part | Pick | Price | Note |
|---|---|---|---|
| Compute | Raspberry Pi 5 8GB | $80 launch price (verify current) | 16GB is $305 now, overkill when generation runs in the cloud |
| Cooling | Raspberry Pi Active Cooler | TBD | Required: Pi 5 throttles within seconds at full load without it |
| Audio | HiFiBerry DAC+ ADC Pro (I2S, 24-bit, 48 kHz) | $64.90 (verified, HiFiBerry) | Superseded by DAC2 ADC Pro; on Pi 5 set `force_eeprom_read=0` and `dtoverlay=hifiberry-dacplusadcpro`; draws under 0.3 W |
| Bench power | Raspberry Pi 27W USB-C PSU (5.1V/5A) | $12 (launch) | Needed so the USB ports get 1.6 A for MIDI gear |
| Storage | microSD (A2) or M.2 HAT + NVMe | TBD | NVMe is better for sample libraries |
| Display | Small SPI/DSI OLED or LCD | TBD | |
| Controls | Rotary encoders, buttons, push-to-talk | TBD | Over GPIO |
| MIDI | USB host (built in) + BLE (built in) | $0 | |
| Battery | 5V/5A USB-C PD pack, or 2S Li-ion + BMS + 5V/5A buck | TBD | Must hold 5 A or the Pi caps USB at 600 mA |
| Car input | 12V to 5V/5A USB-C PD car adapter | TBD | |

## Power budget (Pi 5 8GB, measured figures from CNX Software and Jeff Geerling)
| State | Pi 5 | Codec | Display, fan, controls (estimate) | Total |
|---|---|---|---|---|
| Idle | 3.5 W | 0.3 W | ~1.5 W | ~5.3 W |
| Typical jam (audio + light CPU) | ~8 W | 0.3 W | ~2 W | ~10 W |
| Peak (stress test) | 13.8 W | 0.3 W | ~2 W | ~16 W |

Battery runtime math: a 74 Wh pack (20,000 mAh at 3.7 V) at about 85% conversion efficiency gives ~63 Wh usable, which is about 6 h typical and 4 h at peak. A 10,000 mAh pack gives roughly half that.
Display, fan and controls are estimates until the parts are chosen. The supply has to deliver 5 A, so plan on 25 W of headroom.
