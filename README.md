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

Open `index.html` in a modern browser.

For the most reliable behavior on phones, deploy it to Vercel (or another static HTTPS host) rather than relying on a local file URL.

## 5. Deploy

Recommended:

1. Put the folder in a private GitHub repository.
2. Import that repository into Vercel.
3. Deploy the site.
4. Add the Vercel URL in Supabase Authentication → URL Configuration.
5. Open the same URL on your phone.
6. Log into the same PESOBASE account.

## Cloud model

This personal version stores one JSON application-state record per authenticated user in `user_app_state`. RLS limits access to the authenticated user's own row.

This keeps the existing advanced app intact while allowing the same data to be used from multiple devices.
