# Banana Beater Streaming API — draft v0

Agent-native REST API over legal free music sources. JSON, versioned under `/v1`. Auth: API key (`Authorization: Bearer`) per app/device/agent.

## Licensing rules (enforced server-side)
- Every track carries its **original** source license (CC0, CC-BY, CC-BY-SA, CC-BY-NC, CC-BY-ND, CC-BY-NC-SA, CC-BY-NC-ND, PD, or creator-owned) plus attribution text. Never rewritten.
- `commercial=true` filter excludes NC. `derivatives=true` excludes ND. Both are hard blocks, not ranking hints.
- Marketplace remix licenses can be sold **only** for `source = marketplace` (creator-uploaded) tracks.
- Every stream/download writes a `license_events` row (who, what, license at time of use, purpose).

## Endpoints
| Method | Path | Purpose |
|---|---|---|
| GET | `/v1/search?q=&mode=hybrid\|keyword\|semantic&license=&commercial=&derivatives=&source=&genre=&bpm_min=&bpm_max=&limit=&cursor=` | Hybrid search (BM25 + pgvector + graph), merged and reranked |
| GET | `/v1/tracks/{id}` | Track detail: metadata, license, attribution, sources, remix lineage |
| GET | `/v1/tracks/{id}/related?rel=remix_of\|remixes\|same_artist&commercial=` | Graph traversal |
| GET | `/v1/tracks/{id}/stream` | Signed short-lived URL (R2 or upstream); logs `license_events` purpose=stream |
| POST | `/v1/tracks/{id}/download` | Body `{purpose}`; checks license vs purpose, returns signed URL + attribution; logs event |
| GET | `/v1/sources` | Source status: last sync, track count, health (FMA, Jamendo, ccMixter, Freesound, Internet Archive) |
| GET | `/v1/licenses/{code}` | License terms summary + canonical URL |
| GET | `/v1/attribution/{id}?format=text\|html\|json` | Ready-to-paste credit line |
| POST | `/v1/marketplace/listings` | Creator lists own track/sound (must own rights) |
| POST | `/v1/marketplace/purchases` | Spend platform credits for a one-use remix license on a marketplace track; returns license grant |
| GET | `/v1/marketplace/grants/{id}` | Check a remix license grant |
| POST | `/v1/webhooks` | Subscribe to `purchase.completed`, `source.synced`, `track.takedown` |

## Actions taxonomy hook
`POST /v1/actions` with `{action: play|stop|record|remix|explain|mute|humor, target, via: device|car|chat}` so device, car mode and chat share one control surface.

## Notes
- Freesound API terms require attribution and their own API key; Jamendo has a separate commercial licensing program, so default Jamendo tracks to non-commercial unless verified.
- Takedowns: `track.takedown` hides a track everywhere within minutes and keeps the ledger.
- "Platform credits" are not tokens/securities until legal review.
