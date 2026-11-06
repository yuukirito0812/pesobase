# PESOBASE AI assistant

Deploy index.html, assistant-core.js, assistant.js, and assistant.css together at the web root. The source of the deployed authenticated relay is in supabase/functions/pesobase-ai.



The right-hand assistant matches EstateFlow's dock, voice-input control, context selector, session history, and minimized launcher. It adapts to the four existing appearance themes. Built-in summaries and supported commands run without an API key. English expense shorthand can be entered on separate lines; open-ended English/Taglish interpretation requires a provider connection.

In a signed-in workspace, open **Assistant → AI settings**, select Gemini or Groq, enter a provider key, accept the displayed data-sharing scope, then choose **Connect & verify**. Verification discovers an available text model and requests a real response. Quotas and charges depend on the provider account; PESOBASE does not enable billing or provide a shared key. Device mode supports only built-in tools.

Each provider key is kept in sessionStorage for that tab and user, never in finance state, backups, GitHub, or server storage. Disconnect or sign out to remove it. Chats are scoped to the user and tab. Voice input uses the browser's speech service; dictated text is reviewed before sending.

The authenticated Supabase Edge Function `pesobase-ai` relays requests to the selected provider. Its source is under `supabase/functions/pesobase-ai/`; the function validates a Supabase user session on each request, permits the listed production PESOBASE origins, limits request size, and applies best-effort per-isolate burst control. It does not write to the database. Provider quotas remain the durable rate limit. A different frontend domain needs an explicit origin added to the function and a redeployment. No database schema migration is needed.

The assistant sends calculated summaries and up to 40 transaction details for the selected period and wallet, up to 12 monthly summary rows, and bounded wallet/fund/bill/debt metadata. Profile, notes, card digits, logos and deleted items are excluded. Email addresses and long number strings are masked in descriptions and chat. Avoid typing secrets into chat; redaction cannot identify every sensitive phrase. Free-provider data terms apply.

Supported reviewed drafts cover transactions (including income, refunds, transfers and savings), wallet/category/fund/bill/debt creation and edits, category budgets, monthly targets, payment methods and transaction types. The existing forms perform validation and save. Removal opens existing confirmation/recovery flows. The model cannot execute code, silently save, send payments, or move money at a bank. Cards/images, theme, backup and planner settings remain available in their existing pages. Ambiguous or stale records require a fresh review. The draft is marked completed only after the form changes state.

Validation: `npm ci --prefix tests && npm test --prefix tests`. The tests include original finance/catalog checks, 32 prior interaction regressions, assistant form flows and provider-relay security/error cases. Provider and cloud responses are mocked; these checks do not prove real-key model availability or live user sign-in. Desktop browser QA uses disposable device data. Microphone transcription depends on browser permissions and its speech service.
