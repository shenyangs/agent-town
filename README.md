# AgentTown

Your agents have desks now. A dark pixel office driven by validated local events over SSE, with four initial desks and additional desks for received agent IDs.

## Run

Requires Node.js 22.12+ and npm. This repository is standalone.

```sh
npm ci --cache .npm-cache
npm run dev
```

Open http://127.0.0.1:4201. The API listens on 127.0.0.1:5201. No API key or model is needed; `.env.example` documents the optional test-browser setting. No `.env` loader is needed by the application.

## Three-step demo

1. Open the office and click **Replay trace**. The committed fixture animates planning, writing, testing and idle states. It is visibly labelled **REPLAY · FIXTURE**.
2. Click **Live local**. In another terminal in this repository, run `node scripts/observe-tests.mjs`. It actually starts `npm run test`, forwards its start and observed exit code, and updates Atlas through SSE.
3. Click **Run replay** to inspect any historical events forwarded with `source: "imported"`. Empty is expected until a bridge submits records. This view is labelled **RUN REPLAY**, never LIVE.

The live demo video uses genuine observations from the running Playwright test process. It does not depict a language model writing code. The fixture trace is synthetic and contains no real agent output.

## Event bridge

POST `/api/events` accepts one object. GET `/api/events/history` returns up to 500 events; GET `/api/events/stream` sends an initial `history` event, subsequent event messages and heartbeat comments. Reconnection restores the current retained history.

```json
{"ts":"2026-10-26T10:00:00Z","agentId":"atlas","type":"testing","message":"Actual observed test start","source":"live","file":"tests/events.test.ts"}
```

Valid types: planning, writing, testing, idle, error. Source: live (default), replay, imported. Messages are truncated to 500 characters and optional file labels to 200. Invalid schema returns HTTP 400. `file` is only a displayed label and is never read. POST `/api/replay` schedules the bundled fixture, with concurrent replays rejected (409).

Native Codex/Claude trace adapters are **not implemented**. A separate producer can map observations into the documented schema and POST them. This project does not read sprint logs, sibling projects or user files. Real nine-agent sprint replay is unverified. Live indicates receipt from a producer, not authenticated provenance or proof of AI inference.

## Verification

Install a project-local browser once:

```sh
PLAYWRIGHT_BROWSERS_PATH="$PWD/.browsers" npx playwright install chromium
npm run build
npm run test
npm run e2e
npm run demo
```

Tests launch and stop both servers; stop `npm run dev` before running browser tests. Browser configuration defaults to `.browsers/` and supports an explicit `PLAYWRIGHT_BROWSERS_PATH`. All tests use real HTTP, SSE and Chromium; the flow asserts Testing → Idle without generated events, and imported events retain their provenance label. Unit tests cover malformed input, bounded history and truncation.

Local evidence is written under `artifacts/`: build/test/e2e/demo logs, replay/live/flow screenshots, and real videos under `artifacts/playwright/e2e/` and `artifacts/playwright/demo/`. These files are deliberately excluded from Git. Initial browser attempts failed because Chromium and FFmpeg versions were missing; their logs are retained locally. Playwright is now pinned to 1.59.1. Verification on the development machine used an explicitly selected existing compatible browser cache (read-only). A subsequent demo failure exposed an accessible button-name mismatch; an explicit aria-label fixed it, and the failed run is retained as `e2e-accessible-name-failure.log`.

## Scope and safety

Status: **PARTIAL** against the full sprint narrative; the local event-to-office vertical slice is implemented. No model inference, native agent integration or real nine-agent historical trace has been verified. No benchmark or AI activity is invented. Data is in memory, capped at 500 events and reset on API restart. The journal shows the last 30 events for the selected source. Replay timestamps remain historical fixture timestamps. The UI shows the latest retained event per agent and source, not an inferred worker state.

Local development tool only: no authentication, persistence, accounts or cloud deployment. Never expose these ports publicly. Producers are trusted local callers and must redact secrets before sending events. The backend executes no commands and does not accept filesystem paths to open. The optional observation script runs only the fixed local test command with a 60-second timeout. MIT licensed.
