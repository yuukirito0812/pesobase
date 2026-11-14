# Money Studio

Open **Money Studio** from the dashboard banner, the navigation menu, or Settings. On mobile, use **More → Money Studio**. All entries remain manual financial records; the app does not initiate bank payments.

## Features

| Feature | How to use it | Behavior |
| --- | --- | --- |
| Receipt OCR | Capture → Scan receipt, or Read receipt details on an attached photo | Reads merchant, date and total locally. Review before saving an expense. |
| Statement import | Capture → Import CSV / PDF | Map columns, review rows, exclude duplicates, and confirm matching transfers. |
| Categorization rules | Rules → Add rule | First enabled match wins for new uncategorized entries. Preview before changing older entries. |
| Bill and card reminders | Reminders → Enable push reminders | Opt-in Web Push while closed, with review/snooze actions and in-app payment forms. Calendar export also works without push. |
| Available until payday | Overview → Set next payday | Cash wallets minus recorded bills, card statements and an additional reserve. Shows a daily guide and breakdown. |
| Card cycles and installments | Credit cards → Billing settings / Add installment | Actual statement overrides, minimum tracking, and schedules linked to an existing purchase. Payments are transfers. |
| Category and person splits | Transaction form → Split categories or track money owed | Exact category allocation and named shares; linked refunds reduce outstanding reimbursements. |
| Change history and restore points | History | Recent changes with source labels; up to 10 device restore points, export and review-before-restore. |
| PIN and biometric device lock | Security → Enable device lock | AES-GCM encryption, an 8–12 digit PIN, recovery code, idle lock, and supported platform-authenticator unlock. |
| Multi-currency wallets | Currencies → Add wallet / Currency & rate | PHP, USD, EUR, GBP, SGD, AUD, CAD, HKD, JPY, KRW and AED with saved conversion rates. Reports stay in PHP. |

## Capture and import

The OCR engine is Tesseract.js 7.0.0 with the English language data. The PDF reader is PDF.js 6.5.438. Both are pinned and lazy-loaded from jsDelivr; first use needs internet. Recognition is performed on the device, and source statements are not uploaded. Saved receipt photos follow normal transaction storage and account sync.

OCR can misread text, dates and amounts. The editable review is required. For receipts in a foreign currency, choose the matching wallet and check the native total.

CSV/TSV statements support quoted fields, multiline descriptions, comma/semicolon/tab separators, signed amounts or separate debit/credit columns, optional wallet names and reference numbers. Choose DMY or MDY explicitly. Limit: 5 MB / 1,000 data rows. A mapped wallet name must exist. Invalid rows are shown for correction and cannot be imported.

PDF support is for selectable text with recognizable Date, Description and Amount (or Debit/Credit) columns. Limit: 15 MB / 25 pages. Scanned, encrypted and complex bank-specific layouts may require CSV export. Repeated headers are skipped. Duplicate detection compares references and transaction fingerprints; review genuinely separate purchases with the same amount/date/description. Transfer suggestions require matching currency/value in different wallets within two days and always require confirmation. Review transfers separately when fees or exchange rates differ.

## Money calculations

Ledger amounts remain integer PHP centavos. Foreign wallets additionally store native minor units and PHP-per-unit rates (up to six decimals). JPY/KRW use whole units. A saved transaction retains its original rate; changing a wallet's valuation rate changes its current PHP balance, not historical expense totals. Transfers keep the actual amount received in the destination currency.

AI commands, bill forms, savings allocations and reimbursements use PHP amounts. Their native conversion is marked `basis: PHP`, retaining the exact reporting amount even where rounding cannot round-trip. Edit a transaction's native amount and rate when the bank supplied an exact foreign charge. Wallet activity translates running native balances at the wallet's current valuation rate. Rates are entered manually.

Category splits must sum exactly to the purchase. Person shares may not exceed it. Repayments are refunds linked to the purchase/person, with proportional category allocation. Editing a purchase cannot reduce a share below already recorded repayments. Editing a linked repayment cannot exceed the person's outstanding amount. Removing a repayment reopens the share.

Card cycles use the latest completed close date, clamp month ends and subtract subsequent payments/credits. Enter actual statement balance/minimum when available, particularly for installment purchases, interest and fees. Installments split an existing purchase into repayment terms without recording more expenses. This is a principal schedule; record bank fees/interest separately. A payment is a transfer from another tracked wallet.

The payday estimate includes recorded cash-wallet balances through today, recurring/overdue bills before payday, outstanding card statements due before payday, and your extra reserve. It excludes archived cash wallets, credit limits, future income and separate savings pots. It is a planning estimate based on entered records.

## Device security and recovery

The optional device vault encrypts PESOBASE local storage (including saved account sessions/caches) and restore-point contents. AES-GCM uses the bundled @noble/ciphers 2.1.1 implementation. A random data key is wrapped with PBKDF2-SHA-256 (600,000 iterations), an 8–12 digit PIN and a separately generated recovery key. Save the recovery code shown at setup. Encryption is specific to this browser/device and does not replace account sign-in or make cloud sync end-to-end encrypted.

Platform device unlock requires WebAuthn PRF support and user verification. The app enables it only after it obtains a usable encryption key; unsupported browsers/authenticators keep PIN unlock. No biometric template is collected by PESOBASE. Physical fingerprint/Face ID verification depends on the actual device and was not exercised in browser QA.

The app locks after the selected idle period and after one minute in the background. Locking closes unsaved forms and clears tab-local chat sessions. JSON exports and downloaded recovery codes are readable files: store them privately. Clearing browser data deletes device-only records and restore points. Without the PIN, recovery code or configured authenticator, the app cannot decrypt a device-only vault.

Restore points are scoped to the current local/account workspace and saved before financial changes. A restore first saves the current workspace. The change journal syncs in account state; restore points stay on the device. The journal is a convenience history, not a tamper-proof audit log.

## Push reminder service

Client enrollment requires an explicit notification permission and a supported browser. Installed iOS apps may require Add to Home Screen before enabling Web Push. The service stores the push subscription and reminder titles/dates, not transaction amounts. Lock-screen notifications use generic wording. Open the app to review and record a payment; notification actions never make a payment. Snooze opens a date picker. Delivery depends on browser/OS support, permission, connectivity and service availability.

Backend source: `supabase/functions/pesobase-reminders`. Private tables and the named 15-minute cron job are in `supabase_reminders_setup.sql`. The existing finance table and per-user RLS are unchanged. The function authenticates device operations using a random per-device capability and scheduled dispatch using a separate Vault secret. It restricts browser origins and push-service endpoints, rate-limits test requests, deduplicates deliveries, and removes expired subscriptions. RLS on the private service tables intentionally has no client policies, and public/anon/authenticated privileges are revoked.

Deployment steps for a different Supabase project:
1. Apply the existing account schema and the reminder setup SQL, updating only the project URL in the cron job.
2. Generate VAPID keys with `web-push` 3.6.7 and insert them into `private.pesobase_push_config` through a private administrative channel. Never commit private keys.
3. Deploy the reminder function with its `deno.json`, `verify_jwt: false` (the handler performs its own capability authentication), and the intended frontend origins.
4. Verify public-key retrieval, unauthorized dispatch rejection, and authenticated empty dispatch before enrolling devices.

The live PESOBASE function and 15-minute job were verified with successful public-key and authenticated empty-dispatch responses. Physical-device push delivery was not exercised; use **Send test notification** after enabling reminders on your phone. Existing Supabase Auth leaked-password protection remains an independent account setting; [Supabase guidance](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

## Verification and dependencies

Run `npm ci && npm test`. Tests cover exact FX/rounding, imports and duplicates, rule priority, categories/repayments, statement dates, installments, payday math, restore ownership, AES authentication, wrong PIN/recovery, mocked PRF support, AI action/Undo integration, reminder authorization, private notification wording, and existing app behavior. Provider, microphone, authenticator and cloud-sync APIs use fixtures. Browser QA covers desktop, 390 px and 320 px layouts and the import/history flow. A real synthetic receipt and two-page PDF were processed with the pinned readers.

Run `npm run build:cipher` to reproduce the vendored encryption bundle. `package-lock.json` pins development dependencies. The app remains buildless; deploy all static assets together and bump `sw.js`'s shell version when releasing changes. Existing installed clients should use **Update ready** when offered. No APK or Play Store submission is part of this release.
