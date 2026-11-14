# PESOBASE Plus

An expanded version of your original personal finance manager. Open `dist/index.html`, or use the private hosted site.

## Added
- Payday planner with cutoff allocations and over-allocation warnings.
- Six-month cash-flow scenarios including scheduled recurring bills.
- Debt payoff estimates, planned vs minimum payments, and estimated interest.
- Dashboard spending comparisons, budget alerts, and overdue bill summaries.
- Copy last month's budget and print the current view.
- Independent device-only mode; no account required.
- Revised responsive sage-and-forest design.

## Existing features retained
Accounts, transfers, editable transaction types, categories, payment methods, monthly budgets, savings, emergency funds, allowances, goals, recurring bills, analytics, monthly review, JSON backup, CSV export, and Supabase email/password login.

## Upgrade safely
1. Export JSON from the old app's Settings before making changes.
2. Close the old app. Open this version and log in with the same Supabase account to load the existing cloud record.
3. For device-only data, select Use on this device, then Settings > Import JSON. A different website address has separate browser storage, so import your backup when moving hosts.
4. Do not edit the same finance record in the old and new app concurrently. The old version does not have the improved conflict handling.
5. Keep JSON backups regularly. Device mode survives reloads in the same browser but clearing browser data removes it.

The existing Supabase URL and publishable key are retained. The supplied SQL already defines per-user RLS. Finance features live inside the existing JSON state. Optional push reminders use separate private tables, a capability-authenticated Edge Function and a scheduled dispatcher; see MONEY-STUDIO.md. If configuring a new project, apply the included `supabase_cloud_setup.sql` and enable email authentication.

## Calculation conventions
Money is stored as integer centavos. Expenses include Expense, Bill Payment and Allowance Payment, minus Refund. Savings contributions move value from tracked wallets into virtual savings funds, which are included in tracked net worth. Avoid separately adding the same savings balance as an account: it would count twice. Debt planner entries are scenarios and do not reduce tracked net worth; track actual liabilities using your accounts. Forecasts start with current non-credit-card wallet balances and cover the next six full months, adding scheduled bills separately. They do not automatically include planned debts, savings or unrecorded expenses—include those in the other-spending assumption. Goal and payday plans never create transactions.

## Cloud behavior
Caches are separated by authenticated user. Pending edits are retained across reloads. A conditional update detects concurrent changes; conflicts are shown rather than overwritten. Export pending edits before choosing Reload cloud copy. Manual sync does not reload over a failed upload. Local caches can be encrypted with an opt-in device PIN under Money Studio → Security. Exports remain readable backups.

## Verification
The 180 automated checks cover the ledger, forms, AI actions and voice events, offline reopening and synchronization, receipts, dashboard controls and service-worker caching. Desktop and 390-pixel mobile layouts were reviewed in a browser. Provider, cloud and microphone APIs are mocked in tests; physical phone installation/camera use and live account synchronization were not exercised.

## Files
Deploy the complete `dist/` directory, including all JavaScript/CSS files, `manifest.webmanifest`, `sw.js`, and `icons/`. On GitHub/Vercel its contents live at the repository root. Keep relative asset paths intact. HTTPS (or localhost for development) is required for installation and offline caching. The app is buildless. AES-GCM is bundled locally; pinned OCR and PDF readers download on first use. Run `npm ci && npm test` for verification and `npm run build:cipher` to reproduce the cipher bundle.

## Premium money workspace update

- My money categories replaces the fixed Parent, Date, Emergency, Savings and Goals navigation. Existing allocations remain editable records; use Edit to rename, recolor, change targets or icons. New allocations can be allowances, savings, emergency reserves or dated goals. Archive preserves linked history and balances. Unused allocations can be deleted.
- Spending categories support names, icons, colors and monthly budgets. Renaming migrates linked transactions, bills and historical budgets. Removal can move records to another category and combines existing budgets. At least one category remains.
- Wallets support bank/e-wallet text badge presets, custom raster logo upload, three card styles, accent color, network label and last four digits. Logos are resized locally and saved in the same JSON state. These are manual tracking accounts, not connections to banking systems.
- Wallet activity shows money in/out and running balances, with search, month/all-time selection and filtered CSV export. Monthly movement reports distinguish new income from transfers between wallets.
- Wallet reconciliation adds a signed Adjustment transaction. Use negative opening balances for credit-card debt; card spending increases the negative balance and transfers into the card reduce the amount owed. Credit limit utilization is shown when a limit is set.
- Wallet archiving keeps balances and history. Move linked recurring bills before archiving. Delete is available only for unused zero-balance wallets; at least one active wallet remains.
- Payday bucket names are editable. Renaming a bucket starts its planned allocation at zero; unchanged names retain their amounts. It does not affect transactions.
- No Supabase schema migration is needed. Existing account and state formats are preserved. Back up JSON before replacing an older app version.

Validation: `npm ci && npm test`. Calculation and data migration checks are included in the full suite. Auth and private finance records are simulated.


Card catalog: 17 Philippine providers, 16 embedded official-source logo assets, eight original PESOBASE card themes, searchable bank/e-wallet filters, custom logo overrides. LANDBANK uses a text badge. GrabPay uses the Grab mark. Sources: assets/brand-sources.json. Themes are illustrative, not issued product replicas.

## AI assistant (November 2026)

The right-hand assistant matches EstateFlow's dock, voice-input control, context selector, session history, and minimized launcher. It adapts to the four existing appearance themes. Built-in summaries and supported commands run without an API key. English expense shorthand can be entered on separate lines; open-ended English/Taglish interpretation requires a provider connection.

In a signed-in workspace, open **Assistant → AI settings**, select Gemini or Groq, enter a provider key, accept the displayed data-sharing scope, then choose **Connect & verify**. Verification discovers models and tests a real response, trying alternatives if a listed model is unavailable to the key. A retired cached model triggers discovery and retry during chat. **Refresh & verify** reuses the same key; **Verify selected model** checks a manual choice without discarding a working connection on failure. Quotas and charges depend on the provider account; PESOBASE does not enable billing or provide a shared key. Device mode supports built-in tools, expense batches and browser dictation.

Each provider key is kept in sessionStorage for that tab and user, never in finance state, backups, GitHub, or server storage. Disconnect or sign out to remove it. Chats and preferences are scoped to the user and tab. Voice supports browser dictation and, after separate audio-sharing consent, AI recording with the connected provider. Clips stop after 60 seconds, are limited to 2 MB, and upload only after recording stops. Cancel releases the microphone and ignores late results. Transcripts go into the composer for review and are never sent as chat automatically.

The authenticated Supabase Edge Function `pesobase-ai` relays requests to the selected provider. Its source is under `supabase/functions/pesobase-ai/`; the function validates a Supabase user session on each request, permits the listed production PESOBASE origins, limits request size, and applies best-effort per-isolate burst control. It does not write to the database. Provider quotas remain the durable rate limit. A different frontend domain needs an explicit origin added to the function and a redeployment. No database schema migration is needed.

The assistant sends calculated summaries and up to 40 transaction details for the selected period and wallet, up to 12 monthly summary rows, and bounded wallet/fund/bill/debt metadata. Profile, notes, card digits, logos and deleted items are excluded. Email addresses and long number strings are masked in descriptions and chat. Avoid typing secrets into chat; redaction cannot identify every sensitive phrase. Free-provider data terms apply.

Supported reviewed drafts cover transactions (including income, refunds, transfers and savings), wallet/category/fund/bill/debt creation and edits, category budgets, monthly targets, payment methods and transaction types. The existing forms perform validation and save. Removal opens existing confirmation/recovery flows. Cards/images, theme, backup and planner settings remain available in their existing pages. Ambiguous or stale records require a fresh review. The model cannot execute code, send payments, or move money at a bank.

Expense lists support up to 50 entries, including numbered lines, exact centavos, a shared wallet/date and per-row overrides. **Review all & add together** lets you edit or omit rows and saves a validated batch in one step. Enable **Auto-add expenses** and select a default wallet to save complete new expense requests automatically. This setting starts off. Missing details, unknown wallets and likely duplicates pause automatic entry. Edits, transfers, deletions and other transaction types retain their review step. Each batch has Undo, which refuses to remove records edited after saving; removed entries remain recoverable in Recently deleted. See `AI-ASSISTANT.md` for examples.

Validation: `npm ci && npm test`. Checks cover finance/catalog regressions, real form and button handlers, automatic and reviewed expense batches, exact totals, duplicate handling, Undo, model discovery/recovery, provider errors, consent, speech events, recording cleanup and late-result cancellation. Provider, cloud and microphone APIs are mocked; passing these checks does not prove real-key access, physical microphone transcription or live user sign-in.

## Mobile, offline and interactive dashboard

Install PESOBASE from **Install app**, or use Safari's **Share → Add to Home Screen**. Open the app online once and wait for **Available offline**. Device records reopen automatically; previously signed-in accounts can reopen their saved account copy offline. The status bar shows waiting changes, retries and conflicts. Sync resumes while the app is open and connected. First-time sign-in and live AI still need internet.

Expense forms include **Take photo** and **Choose image**. Receipts are compressed locally, attached to the transaction and included in cloud state and JSON backups. Use Money Studio → Capture or Read receipt details to extract merchant, date and total on your device, then review before saving.

Use **Dashboard → Customize** to arrange, hide or widen 11 sections. Tap chart categories, daily chart points, calendar days, comparison amounts or budget rows to inspect the matching transactions and export that selection. Compare the previous month or the same month last year, using equal elapsed days or full recorded months. See [MOBILE-DASHBOARD.md](MOBILE-DASHBOARD.md) for usage, offline limits and deployment details.

## Money Studio

Open **Money Studio** from the dashboard banner, navigation or Settings. The ten-feature release adds receipt OCR, reviewed CSV/text-PDF import, categorization rules, push reminders, available-until-payday planning, credit-card cycles/installments, category/person splits, change history/restore points, encrypted device storage, and multi-currency wallets. See [MONEY-STUDIO.md](MONEY-STUDIO.md) for use, calculations, device support, backend setup and verification limits.
