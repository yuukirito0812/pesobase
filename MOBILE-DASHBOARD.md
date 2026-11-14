# PESOBASE mobile and dashboard guide

## Install and prepare offline access

1. Open your deployed HTTPS app in a supported browser and choose **Install app**. If the browser does not offer an install prompt, PESOBASE shows instructions. On iPhone/iPad, use Safari → Share → Add to Home Screen.
2. Open the app online once and wait for **Available offline** in the status bar. Keep the same website address and browser profile for future visits.
3. Choose **Use on this device**, or sign in online and allow your account data to load. The saved workspace can then reopen offline.
4. Add expenses normally, including optional receipt photos. Local changes are saved immediately. For signed-in workspaces, tap the status text to see waiting changes and available recovery actions.
5. Reconnect with PESOBASE open. Account changes upload after authentication succeeds. A competing cloud change is shown as a conflict; your pending local copy is retained. Export its backup before choosing **Reload cloud copy**, which replaces local pending changes.

Device mode stays on that device and does not upload. Sync requires the app to be open; this release does not promise uploads while the browser is closed. First-time sign-in and live AI require internet. Built-in summaries, supported expense commands and normal finance entry remain available offline. Speech dictation availability depends on the browser and may require a connection.

Offline account access uses a previously verified identity and that account's saved cache. Network reads and writes still require a valid Supabase session and RLS. Signing out stops automatic account reopening. Enable PIN-encrypted local storage under Money Studio → Security. The lock is per device and separate from account sign-in. Clearing browser storage removes device records and offline access, so keep JSON backups.

When **Update ready** appears, finish or close any open form and tap it. PESOBASE persists the workspace before activating the downloaded update. Updates do not silently reload an open form.

## Receipt photos

Use **Take photo** or **Choose image** in a transaction form. JPEG, PNG and WebP inputs up to 12 MB are supported. Photos are resized to a maximum 1,600-pixel edge and compressed to roughly 180 KB or less before storage. If processing or storage fails, the form explains the problem and keeps your typed details.

Review the preview, enter the amount/category/details and save. Use Read receipt details or Money Studio → Scan receipt for on-device OCR, then check the suggested fields. Open transaction details to view/download the photo; edit the transaction to replace or remove it. Attachments stay with cloud state, offline copies, JSON backups and recoverable deleted transactions. Large collections can reach browser storage limits; an explicit storage warning tells you when a backup is needed.

## Make the dashboard yours

**Dashboard → Customize** supports 11 sections: wallets, spending overview, quick actions, spending calendar, period comparison, recent transactions, budget, funds, bills, insights and payday overview.

Drag to reorder or use the up/down buttons, toggle sections, and choose Standard/Wide. Save applies and persists the layout; Cancel discards the draft. Reset layout resets the draft and needs Save to apply. On phones the sections use one column. Layout preferences are included in account sync and JSON backups.

Charts and budget rows open their exact source transactions. Calendar days with entries are clickable even when refunds bring their net spending to zero. The detail panel shows the selected total, paginated records, transaction links and **Export these rows** for a scoped CSV.

Period comparison supports the previous month or the same month last year. **Same elapsed days** compares equal day counts for the current month, clamped to the shorter month's length; **Full months** uses each recorded month and may include an incomplete current month. Date ranges are always displayed. Expenses include bill and allowance payments, less refunds; transfers are excluded. Negative net spending represents net refunds.

## Mobile wallets and search

The wallet starts in Stack view: one card at a time at a physical bank-card ratio of 1.586:1. Swipe the card up/down, use the arrow buttons, or tap its name to choose another wallet. Tap the upward chevron to collapse the card into a balance row. Stack/Grid/List, selected wallet and collapse preferences persist in account state and backups. Grid uses two columns on most phones and one column on narrow screens for legibility.

Expense, Income, Transfer and Activity controls below a card always use that wallet. The more button customizes it. Four new finishes—Holographic, Sunset, Botanical and Circuit—bring the total to twelve. The header offers balance privacy, the design catalog and Add wallet. Card artwork and wallet names do not imply bank connectivity.

The home search lists only matching transactions, six per page, across all dates. Terms are combined; quoted phrases, exact peso amounts and ISO dates are supported. Incidental notes do not create matches. Tap a result for that transaction's details, or **Open matching transactions** for a ledger containing those matches with unrelated filters cleared. The ledger's additional filters are tucked behind **Filters**.

## Floating assistant

Tap the bubble for a compact conversation. Drag the bubble, or drag the handle at the top of the open panel, to reposition it; keyboard arrow keys also move either control. Positions stay on the device and remain within the visible viewport after resizing. Minimize preserves the conversation and unsent draft. Opening a workspace form minimizes chat so the form remains accessible.

The options button contains wallet focus, AI mode, auto-add preference, New chat, AI settings and Reset bubble position. Microphone and Send stay beside the message field. The chat leaves the rest of the workspace interactive. Microphone permissions and speech/recording support depend on the actual phone/browser; no live microphone capture was performed in this release's browser checks.

## Deploy and validate

Publish the entire static app directory: `index.html`, all `assistant*`, `workspace*`, `mobile-ui*` and `offline.js` assets, `sw.js`, `manifest.webmanifest`, and `icons/`. In the Sites checkout these are under `dist/`; in the GitHub/Vercel repository they are at the root. Preserve relative paths. No database migration or AI-relay change is needed for these additions.

Bump the service-worker cache version in `sw.js` whenever publishing changed shell assets in a later release. The worker caches only explicitly listed static files. API responses, authentication, AI requests, receipts and other origins are not cached by it; finance data remains in the existing per-device/per-account storage.

Run `npm ci --prefix tests && npm test --prefix tests`. This release passes 143 automated checks. Browser QA covered 390-pixel and 320-pixel phone layouts, focused transaction search and details, wallet customization/actions, stacked and grid cards, collapse controls, and compact movable chat. Live provider calls, private account sync, physical camera capture and phone installation were not exercised by these tests.

## Brand artwork

The website, SVG favicon and installation icons share the connected folded P in `icons/pesobase.svg`. Its gold coin arc, clipped paper corner and sage fold bring together money and a stable base. Filled vector shapes keep the complete P legible at small sizes; emerald, ivory and gold remain consistent across app themes. The PNG icons are rendered from that vector at 32, 180, 192, 512 and 1024 pixels, with a separate maskable version that keeps the mark inside the central safe area. `scripts/render-icons.cjs` regenerates them and both inline website marks; it requires Node.js and `sharp`. The `pesobase-ribbon-*` icon filenames and shell cache version allow updated artwork to replace previously cached assets. Installed home-screen icons may refresh later than the web interface, depending on the operating system.
