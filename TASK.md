# A01 — AgentTown

Build a WORKING, visually memorable 2D pixel-art command center for coding agents. This is a 110-minute implementation sprint, not a full product. Read ./AGENTS.md first. Work only in this repository. Do not ask clarifying questions: implement the P0 scope and tests.

## Stack and boundaries
- Existing Vite/React/TypeScript client; Express/Node/tsx server; native EventSource/SSE; CSS or inline SVG pixel sprites, no canvas game engine.
- Input event schema `{ts, agentId, type: "planning"|"writing"|"testing"|"idle"|"error", message, source?: "live"|"replay"|"imported", file?}`. Validate schema, truncate messages, cap events to 500.
- POST `/api/events` injects LOCAL demo events; GET `/api/events/stream` provides SSE; GET `/api/events/history` returns state. Localhost only; no arbitrary command execution.
- `fixtures/agent-trace.jsonl` is replayable and must be labelled REPLAY. When using a real forwarded agent event, show LIVE. Never synthesize a live coding event.

## P0 happy path
1. Four pixel agent desks and characters. Agent names/status/last tool or file appear in crisp cards.
2. Start with a replay source visibly marked REPLAY; hit 'Replay trace' and watch characters animate from planning to writing to testing, synchronized to events.
3. Switch to live local source; POST two genuine events via a script or curl and watch those desk states update without refresh. Derive state solely from the received messages.
4. After P0, consume events imported from REAL Codex JSONL sprint logs by the root `scripts/import_codex_events.py` bridge. Imported old logs are labelled `RUN REPLAY`, not `LIVE`; map actual turn, command and file-change events to animation. The other 9 coding agents ARE the demo use case. Do not directly read arbitrary sibling repos.

## Must prove
- `tests/flow.spec.ts` opens the UI, POSTs a `testing` event to backend, asserts status `Testing` on matching agent, then POSTs `idle`, asserts it changes to Idle. Test includes absence of invented events.
- Unit test validates malformed events are rejected and history is capped.
- `tests/demo.spec.ts` records the REAL replay + a live event and saves screenshot/video.
- README declares that Codex/Claude native trace adapters are NOT implemented unless actually working, explains POST/SSE bridge.

## Visual narrative / X video
0–3s: tiny pixel office labelled 'Your agents have desks now.'; 3–12s: nine avatars switch statuses as sprint JSONL events replay; 12–19s: one genuine imported test event appears in timeline; 19–24s: zoom on synchronized event and status. Navy canvas, 8-bit typography accents, legible labels.

STOP building features once end-to-end test passes. Record truthful status.json with evidence.


Execute within this directory only. Run npm install, implement, then build/test/e2e/demo. Preserve real logs and status.json.

This is an authorized independent sprint execution. Start implementing now, no confirmation. Do not spawn subagents. All writes limited to this app directory; use npm install --cache .npm-cache and keep .npm-cache ignored. Existing Playwright browsers may be read from ~/Library/Caches/ms-playwright; if install required use PLAYWRIGHT_BROWSERS_PATH inside this project. Install dependencies, replace starter tests with meaningful behavior tests, run build/test/e2e/demo and preserve actual logs, screenshot and video. Do not read user credentials or other project data. Missing model keys: runnable clearly labelled fixture and PARTIAL status. Add LICENSE. Verify and finish, not merely plan.
