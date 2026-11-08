# PESOBASE mobile and dashboard guide

## Install and prepare offline access

1. Open your deployed HTTPS app in a supported browser and choose **Install app**. If the browser does not offer an install prompt, PESOBASE shows instructions. On iPhone/iPad, use Safari → Share → Add to Home Screen.
2. Open the app online once and wait for **Available offline** in the status bar. Keep the same website address and browser profile for future visits.
3. Choose **Use on this device**, or sign in online and allow your account data to load. The saved workspace can then reopen offline.
4. Add expenses normally, including optional receipt photos. Local changes are saved immediately. For signed-in workspaces, tap the status text to see waiting changes and available recovery actions.
5. Reconnect with PESOBASE open. Account changes upload after authentication succeeds. A competing cloud change is shown as a conflict; your pending local copy is retained. Export its backup before choosing **Reload cloud copy**, which replaces local pending changes.

Device mode stays on that device and does not upload. Sync requires the app to be open; this release does not promise uploads while the browser is closed. First-time sign-in and live AI require internet. Built-in summaries, supported expense commands and normal finance entry remain available offline. Speech dictation availability depends on the browser and may require a connection.

Offline account access uses a previously verified identity and that account's saved cache. Network reads and writes still require a valid Supabase session and RLS. Signing out stops automatic account reopening. Browser caches are not encrypted; use a trusted device. Clearing browser storage removes device records and offline access, so keep JSON backups.

When **Update ready** appears, finish or close any open form and tap it. PESOBASE persists the workspace before activating the downloaded update. Updates do not silently reload an open form.

## Receipt photos

Use **Take photo** or **Choose image** in a transaction form. JPEG, PNG and WebP inputs up to 12 MB are supported. Photos are resized to a maximum 1,600-pixel edge and compressed to roughly 180 KB or less before storage. If processing or storage fails, the form explains the problem and keeps your typed details.

Review the preview, enter the amount/category/details and save. This is a photo attachment feature, not OCR. Open transaction details to view/download the photo; edit the transaction to replace or remove it. Attachments stay with cloud state, offline copies, JSON backups and recoverable deleted transactions. Large collections can reach browser storage limits; an explicit storage warning tells you when a backup is needed.

## Make the dashboard yours

**Dashboard → Customize** supports 11 sections: wallets, spending overview, quick actions, spending calendar, period comparison, recent transactions, budget, funds, bills, insights and payday overview.

Drag to reorder or use the up/down buttons, toggle sections, and choose Standard/Wide. Save applies and persists the layout; Cancel discards the draft. Reset layout resets the draft and needs Save to apply. On phones the sections use one column. Layout preferences are included in account sync and JSON backups.

Charts and budget rows open their exact source transactions. Calendar days with entries are clickable even when refunds bring their net spending to zero. The detail panel shows the selected total, paginated records, transaction links and **Export these rows** for a scoped CSV.

Period comparison supports the previous month or the same month last year. **Same elapsed days** compares equal day counts for the current month, clamped to the shorter month's length; **Full months** uses each recorded month and may include an incomplete current month. Date ranges are always displayed. Expenses include bill and allowance payments, less refunds; transfers are excluded. Negative net spending represents net refunds.

## Deploy and validate

Publish the entire static app directory: `index.html`, all `assistant*`, `workspace*` and `offline.js` assets, `sw.js`, `manifest.webmanifest`, and `icons/`. In the Sites checkout these are under `dist/`; in the GitHub/Vercel repository they are at the root. Preserve relative paths. No database migration or AI-relay change is needed for these additions.

Bump the service-worker cache version in `sw.js` whenever publishing changed shell assets in a later release. The worker caches only explicitly listed static files. API responses, authentication, AI requests, receipts and other origins are not cached by it; finance data remains in the existing per-device/per-account storage.

Run `npm ci --prefix tests && npm test --prefix tests`. This release passes 130 automated checks. Browser QA covered desktop dashboard controls and a 390-pixel phone layout, including the receipt form. Live provider calls, private account sync, physical camera capture and phone installation were not exercised by these tests.
