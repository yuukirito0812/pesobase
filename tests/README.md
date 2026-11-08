# PESOBASE regression checks

Install and run the interaction tests with Node.js 20 or later:

```sh
npm ci --prefix tests
npm test --prefix tests
```

The suite loads the actual standalone HTML in jsdom and submits its real forms and button handlers. It tests the ledger, create/edit/delete/restore flows, saved device data, wallet transfers, custom transaction behaviors, categories, budgets, allocations, recurring bills, planners, themes, catalog controls, import/export, authentication error UI, and mocked optimistic cloud saves.

No live financial records are used. Network access is mocked, so passing these tests does not prove delivery of signup emails or an authenticated end-to-end Supabase session. Browser checks should also cover rendered layout, keyboard access, file uploads, and the primary create/edit/delete/restore flow.


The assistant suites load the shipped scripts and exercise proposal review/save, deletion confirmation, stale actions, bulk expense review, opt-in automatic entries, exact totals, duplicate checks, batch Undo and restore, user scoping, session-key storage, connection refresh, stop/error/fallback controls, and mobile overlay logic. Relay tests cover authentication, allowed origins, body/schema limits, key isolation, both providers, model verification and automatic recovery, audio transcription validation and burst limiting. Voice tests simulate speech recognition and MediaRecorder, covering consent, permissions, stop/cancel, track cleanup, transcript review, provider failures and late-result cancellation. No real provider calls, private cloud data or physical microphones are used during tests.

The workspace suites cover persisted dashboard ordering, visibility and width; exact chart/calendar/comparison drill-downs and CSV selection; matched period dates; keyboard controls; receipt preservation, removal and validation; account-scoped offline reopening; authenticated reconnection; optimistic-write conflicts; new edits made during an upload; and visible storage failures. Service-worker checks verify the static precache, navigation shortcuts, explicit update activation, real icon files, and exclusion of API/auth/other-origin requests.

Latest full run: **130 passed, 0 failed**. Desktop interactions and a 390-pixel mobile viewport were also reviewed in the browser. Physical phone installation, camera capture and live Supabase synchronization still require checks on real devices/accounts; mocked success does not establish those outcomes.
