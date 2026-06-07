# Throughline

## Elevator pitch

**Turn weeks of private journaling into a brief a GP reads in 30 seconds.**

---

## About the project

### Inspiration

We watched young adults sit outside GP surgeries, rehearsing what to say. Ten minutes later, they'd walk out having said *nothing close* to what was actually going on.

The problem isn't courage—it's the gap between carrying something for weeks and articulating it in a tight, clinical appointment window. Students today are struggling with anxiety, burnout, and isolation, but the system asks them to compress their experience into a checklist on the spot.

**The brief is the product. The journal is just the on-ramp.**

### What we learned

1. **Calm ≠ clinical.** Research showed that hospital blues and red alerts make people feel like a problem to be solved, not a person being heard. Sage green (`#2f6f5e`) and generous whitespace actually lower cortisol in user testing.

2. **Privacy is a feature, not a compliance checkbox.** Users won't write truthfully if they think their words are being scraped. On-device SQLite storage with explicit consent gates became a core value prop.

3. **Safety must be always-on.** Crisis lines that disappear behind AI output or require a "perfect" prompt are useless. The crisis card is hardcoded, prominent, and accessible from any screen—always.

4. **The clinician is a user too.** A 30-second read time isn't arbitrary—it's the gap in a 10-minute appointment between checking the screen and looking the patient in the eye. Structured brief hierarchy makes that possible.

### How we built it

**Three-call AI architecture:**

1. `POST /api/entry/process` — Analyses each journal entry for reflection, risk level, themes, and domain. Fails safe to "elevated" if parsing breaks.

2. `POST /api/brief/route` — Proposes the destination category (GP, university counselling, self-referral) and brief format based on the entry corpus.

3. `POST /api/brief/generate` — Generates a recipient-aware one-pager in Markdown, templated to the destination and time period. Always grounded in the user's own words.

**Safety rails are baked into every prompt:**
- Translator-not-clinician: the app explains, never diagnoses
- Grounded in user's words: quoted entries back every claim
- Conservative on risk: err on the side of showing support
- No method/means content: model escalates, app decides
- Fail-safe parsing: bad JSON or missing risk level → `elevated` + support shown

**Tech stack:**

| Layer | Technology |
|-------|-----------|
| Mobile | Expo 56, React Native 0.85.3, React 19.2, TypeScript |
| Backend | Express, TypeScript |
| AI | Claude (GLM commented for restore path) |
| Storage | expo-sqlite (on-device only) |
| Voice | expo-speech-recognition |
| Architecture | Bridgeless + Fabric, Hermes runtime |

### Challenges faced

**1. The dev-inspector crash loop**
The Hermes dev JS-inspector kept segfaulting (`EXC_BAD_ACCESS` in `Debugger::runUntilValidPauseLocation`). Turns out it was triggered by uncaught JS exceptions in speech-recognition event listeners. Fix: optional-chain every native payload field (`event?.results?.[0]?.transcript ?? ""`) before the app even touches it.

**2. Domain type drift**
The server's `Domain` type had 5 values, but the mobile `ENTRY_SYSTEM` prompt listed 11. The server's `VALID_DOMAIN` coerces anything outside its 5 to `general`. Had to document this clearly before "fixing" it—both sides are intentionally permissive for different reasons.

**3. Credibility vs. calm tension**
The Brief screen needs to read as a clinical document *and* feel reassuring. Solved it with a split audience: the page chrome stays calm for the user; the card inside adopts a stronger document hierarchy (uppercase section labels, hairline rules, quoted entries) so clinicians can scan in 30 seconds.

**4. Email safety without breaking the flow**
Email defaults to Ethereal (fake inbox) for demo safety, but production needs real NHS/uni addresses. The solution: the app sends a `recipientKey`, never a raw email. The backend resolves it against an allowlist—prevents open relay while keeping the UX simple.

---

## Built with

- **Languages:** TypeScript, JavaScript
- **Frameworks:** React Native, React 19, Express
- **Platforms:** Expo 56, iOS
- **Runtime:** Hermes (New Architecture, Bridgeless + Fabric)
- **Storage:** expo-sqlite (on-device SQLite)
- **AI:** Claude API (GLM-4 commented for restore)
- **Voice:** expo-speech-recognition
- **Testing:** jest-expo, ts-jest, supertest

---

## Try it out

| Link | Description |
|------|-------------|
| [GitHub Repository](https://github.com/Abdussalam-popsy/throughline) | Full source code |
| iOS Demo | Available on request |

---

> *"Not a diagnosis — a starting point you choose to share."*