# PESOBASE regression checks

Install and run the interaction tests with Node.js 20 or later:

```sh
npm ci --prefix tests
npm test --prefix tests
```

The suite loads the actual standalone HTML in jsdom and submits its real forms and button handlers. It tests the ledger, create/edit/delete/restore flows, saved device data, wallet transfers, custom transaction behaviors, categories, budgets, allocations, recurring bills, planners, themes, catalog controls, import/export, authentication error UI, and mocked optimistic cloud saves.

No live financial records are used. Network access is mocked, so passing these tests does not prove delivery of signup emails or an authenticated end-to-end Supabase session. Browser checks should also cover rendered layout, keyboard access, file uploads, and the primary create/edit/delete/restore flow.
