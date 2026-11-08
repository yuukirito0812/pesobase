# PESOBASE Personal Cloud

PESOBASE is a private personal finance application designed to work on a laptop and phone with the **same login and synchronized data**.

## What this version does

- Email/password login through Supabase Auth
- Same PESOBASE account can be used on multiple devices
- Cloud-saved application state
- Editable accounts/banks/wallets
- Editable transaction types
- Editable categories/payment methods
- Editable monthly budgets and targets
- Savings, emergency fund, parent allowance, date allowance, bills, goals
- Exact centavo-based money storage in the app
- Local cache for faster loading/offline continuity
- Manual sync and visible sync status

## 1. Supabase database

The main database SQL creates the finance tables. After that, run:

`supabase_cloud_setup.sql`

in **Supabase → SQL Editor**.

## 2. Supabase authentication

Enable **Email** under:

**Authentication → Providers → Email**

Create your personal PESOBASE account.

## 3. Supabase project values

`index.html` currently contains:

- SUPABASE_URL
- SUPABASE_PUBLISHABLE_KEY

The included values are the project values supplied during setup. Do not add a service-role/secret key to the browser app.

## 4. Run locally

Serve the repository root with a local HTTP server for development. Installable/offline behavior requires HTTPS or localhost.

For the most reliable behavior on phones, deploy it to Vercel (or another static HTTPS host) rather than relying on a local file URL.

## 5. Deploy

Recommended:

1. Put the folder in a private GitHub repository.
2. Import that repository into Vercel.
3. Deploy the complete app: `index.html`, all JavaScript/CSS files, `sw.js`, `manifest.webmanifest`, and `icons/`. Preserve relative asset paths.
4. Add the Vercel URL in Supabase Authentication → URL Configuration.
5. Open the same URL on your phone.
6. Log into the same PESOBASE account.

## Cloud model

This personal version stores one JSON application-state record per authenticated user in `user_app_state`. RLS limits access to the authenticated user's own row.

This keeps the existing advanced app intact while allowing the same data to be used from multiple devices.

## Mobile and dashboard upgrades (November 2026)

- Installable app with a home-screen expense shortcut, cached app shell and account-scoped offline entries.
- Visible waiting changes, authenticated reconnect/sync, conflict preservation and device backup access.
- Receipt photo capture/upload, local compression and attachments included in cloud state and JSON backups. Enter transaction details manually; OCR is not included.
- Dashboard customization for 11 sections: reorder, hide/show and choose widths.
- Clickable charts, budget rows and spending calendar with exact transaction drill-downs and scoped CSV export.
- Previous-month/year comparisons with equal elapsed days or full recorded months.

Use **Install app** and open online once until **Available offline** appears. Sync requires the app to be open and connected; live AI and first-time login require internet. Use **Dashboard → Customize** to personalize your layout. See [MOBILE-DASHBOARD.md](MOBILE-DASHBOARD.md) for usage, privacy/storage limits and deployment details, and [AI-ASSISTANT.md](AI-ASSISTANT.md) for AI setup and expense commands.

Validation: `npm ci --prefix tests && npm test --prefix tests` — 130 checks passed. Desktop controls and a 390-pixel phone layout were reviewed in a browser. Cloud/provider/microphone APIs are mocked; physical phone installation/camera use and live private-account synchronization were not exercised.
