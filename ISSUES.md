# Issue log

Running log of issues raised during development. Status: `open` / `deferred` / `fixed`.

| # | Issue | Status | Notes |
|---|-------|--------|-------|
| 1 | **Data durability** — entries are local-only SQLite; lost/wiped device without an OS backup loses the journal | deferred | Plan agreed 2026-07-02: (a) document that iCloud/Android Auto Backup already covers the DB by default, (b) build passphrase-encrypted export/import via the share sheet, (c) E2EE sync post-pilot. Plain server-side storage ruled out (GDPR special-category data + kills the privacy positioning). |
| 2 | `classifyDomainApi` threw instead of failing safe to `"general"`, stranding submit on backend outage | fixed | Removed leftover `throw` in `mobile/src/services/api.ts` (2026-07-02). |
| 3 | 7 stale server tests in `server/__tests__/ai.test.ts` — still mocked the GLM fetch transport; code now calls Claude via the Anthropic SDK | fixed | 2026-07-02: tests now mock the Anthropic SDK (`claudeReplies` helper); 32/32 green. |
| 4 | `POST /api/brief/send` missing on server — `useBriefSender.send()` calls it but the route is unbuilt (build-order step 3: pdf/email/consent UI) | open | Unreachable from current UI (Brief screen only generates + PDF export), so dead code for now. |
| 5 | `generateBriefApi` `console.log`ged full journal entries | fixed | 2026-07-02: removed all console noise from `mobile/src/services/api.ts`; error handling unified (quiet fail-safe or throw-to-caller). |
| 6 | Domain type drift — server `Domain` has 5 values, mobile + prompts list 11; server coerces the extra 6 to `general`, silently discarding signal | open | Documented in CLAUDE.md; decide which side is canonical before "fixing". |
| 7 | No auth or rate limiting on the API — anyone reaching the endpoint can burn Anthropic credit | open | Fine for demo; must gate before any deployment. |
| 8 | Regulatory / clinical-safety exposure — LLM risk classification + routing flirts with UK medical-device territory (MHRA/DTAC, DCB0129) | open | Product-level; needed before any real deployment or uni pilot. |
| 9 | UI reads as generic/boring | fixed | 2026-07-02: two-voice type system (Fraunces serif + IBM Plex Mono record voice, tokens in `mobile/src/lib/theme.ts`), typographic date hero on Today replacing the stock-photo card. Palette/radii/flatness unchanged (locked by DESIGN.md §2). |
