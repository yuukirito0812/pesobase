# PESOBASE assistant

## Connect or repair AI

1. Sign in to PESOBASE and open **Assistant → AI settings**.
2. Choose Gemini or Groq, enter your own provider key, accept the data-sharing scope, and select **Connect & verify**.
3. For an existing connection, choose **Refresh & verify**. This keeps your key and discovers and tests available models. A model that stops working during chat is refreshed automatically.

A model list alone does not prove that a key can generate a response. PESOBASE now tests alternatives instead of repeatedly selecting the same unavailable model. Quota, key-access and model errors have separate messages. Provider account limits still apply. Built-in summaries and expense entry work without a key, including in device mode.

## Add a list of expenses

Send a list using an existing wallet name:

```text
Add expenses from GCash:
Lunch 150
Coffee 75
Transport 50
```

Use **Review all & add together** to check amounts, dates, wallets and categories, omit items, and save the list in one step. Up to 50 entries are supported. Use one total amount per line; an undated expense uses today. A shared date such as “yesterday” or `2026-11-07` can go in the header.

To save complete expense requests directly, turn on **Auto-add expenses** and choose a default expense wallet in AI settings. This preference starts off and is scoped to this tab and user. Unknown wallets, incomplete rows and likely duplicates pause for review. Exact simple lists are parsed on the device; a provider connection enables open-ended English/Taglish requests.

Each batch has **Undo this batch**. Undo moves its unchanged records to **Recently deleted**, where they can be restored. If any batch record has since changed, inspect it in Transactions before removing it.

## Use the microphone

In **AI settings → Voice input**, choose:

- **Browser dictation** for your browser's speech service. No provider key is required.
- **AI recording** for transcription through your connected Gemini or Groq key. This needs separate audio-sharing consent.

Tap the microphone, allow microphone access, speak, then tap again to finish. AI recordings stop after 60 seconds and upload only after recording stops. **Cancel voice** releases the microphone and discards pending transcription. The transcript appears in the message box; review it and press Send. Voice alone never saves records.

If browser dictation fails, use **Try AI recording** or change the mode in AI settings. Permission errors explain which browser/device setting needs attention. Open PESOBASE directly over HTTPS if an embedded preview blocks microphone access.

## Other supported actions

Ask for summaries, balances, upcoming bills, or drafts to create/edit transactions, wallets, categories, funds, bills, budgets and debt plans. Transfers, edits, deletions and non-expense entries retain their review steps. The assistant updates PESOBASE records; it cannot send bank payments. Card images, themes, backup import and planner settings remain in their existing pages.

## Privacy and verification

Keys and chats stay in sessionStorage for the current tab/user and are excluded from finance backups. Disconnect or sign out to clear the key. Live chat shares the stated scoped finance context; recording transcription shares the audio without finance records. Provider data terms apply. Gemini requests use stateless mode where supported.

Automated checks use the shipped code and real form handlers with mocked providers, cloud responses and microphone APIs. Real-key availability and physical microphone transcription still need verification in your browser. Final visual browser QA was blocked by the session's automatic approval review usage limit.

## Money Studio integration

AI commands and batch amounts use PHP reporting values. A foreign-currency wallet converts the value using its saved rate, retains the exact PHP amount and marks the native amount as a conversion. Reviewed transaction drafts show the native amount and PHP equivalent. Change the original amount/rate in the transaction form when the bank supplied an exact foreign-currency charge. New uncategorized entries use matching categorization rules. AI batches are attributed in change history; a restore point is kept before financial changes.
