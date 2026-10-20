# PLAN: Bårdshaugen Barnehage v2, seks retninger og en velger

Skrevet av designansvarlig før koding. Faktagrunnlaget er `../facts.md` og ingenting annet. Alt som mangler vises som `[Fylles inn: …]`.

## Felles grunnmur (alle versjoner)

| Område | Beslutning |
|---|---|
| Struktur | `site/<versjon>/index.html`, `styles.css`, `main.js`. Ingen byggesteg, ingen rammeverk og ingen biblioteker. |
| Fonter | Selvhostet woff2 i `site/fonts/` (Latin-subset, hver fil ≤ 60 KB, OFL). `@font-face` står i hver versjons `styles.css`, og hoved-displayfonten preloades. Den gamle `fonts.css` med base64 (101 KB, render-blokkerende) brukes **ikke** i v2. |
| Logo | `../assets/logo.svg` / `../assets/logo-mark.svg` som `<img>` med alt-tekst. Den finnes i alle versjoner. |
| Personvern | `noindex` på alle sider, `robots.txt` med Disallow: /. Ingen cookies, ingen localStorage, ingen tredjepartsforespørsler. Kart lenkes til OpenStreetMap, men bygges ikke inn. |
| UU | WCAG 2.2 AA: landemerker, skip-lenke, synlig fokus, kontrast ≥ 4.5:1 (≥ 3:1 for stor tekst og UI-elementer), og alle leker/maskoter er `<button>` med `aria-label`. Dekor har `aria-hidden="true"`. |
| Bevegelse | Alt ikke-essensielt ligger bak `@media (prefers-reduced-motion: no-preference)` eller sjekkes med `matchMedia` i JS. Scrollanimasjoner bruker `animation-timeline: view()/scroll()` inne i `@supports`, med IntersectionObserver (klassen `.is-in`) som fallback. |
| Lyd | Kun Web Audio generert i kode. Bryteren er AV som standard, med `aria-pressed`. Ingen lydfiler. |
| «Åpent nå» | `Intl.DateTimeFormat('nb-NO',{timeZone:'Europe/Oslo',…})`, man–fre 06:45–17:15. Ansvarsfraskrivelsen sier at helligdager og planleggingsdager ikke er tatt med: `[Fylles inn: stengte dager]`. |
| Budsjett | ≤ 250 KB per versjon (uten delte fonter), JS ≤ 15 KB. |
| Påkrevde seksjoner | hero · om oss/visjon · avdelinger (Revehiet småbarn, Bjørnehiet storbarn, Sæterlia friluft ved alpinanlegget) · en dag hos oss · foreldreundersøkelsen (n=12, svarprosent 28 %) · jobb hos oss · søk plass (samordnet opptak, frist 15. februar, Visma-lenke, kommune-lenke) · kontakt og åpningstid · Instagram-polaroider (plassholdere og lenke) · footer med org.nr. 972 179 760 |

### Faktapunkter som brukes ordrett
Visjon «Trygg på neste steg». Målsetting «Et godt sted å være for barn og voksne». 46 barn, 1–5 år. 3 avdelinger. Privat og foreldreeid uten utbytte: «Midlene brukes i barnehagen – til økt bemanning, miljø og innhold». Sentrum på Skei. Bårdshaugvegen 25, 6650 Surnadal. Kontor 957 67 873. post@baardshaugen.no. Revehiet 954 97 759. Bjørnehiet 954 94 816. Sæterlia 410 79 426. Daglig leder Reetta Järvinen 411 22 302, reetta@baardshaugen.no. Styreleder Espen Røv 932 68 352. 15 faste ansatte. 57 % barnehagelærere, og pedagognormen er oppfylt. Kostpenger 405 kr/mnd. Foreldreundersøkelsen 2026: total 4,9 · trivsel 4,9 · utvikling 4,9 · ute-/innemiljø 4,4 · informasjon 4,4, med 12 svar og svarprosent 28 % (27,9 %).

---

## 1. `v-minimal` · «Nordisk stillhet»
- **Retning:** Sveitsisk og skandinavisk minimalisme. Et strengt 12-kolonners grid, mye luft, hårfine linjer og tall som typografiske objekter.
- **Typografi:** *Schibsted Grotesk* (en norsk grotesk, tegnet for Schibsted) fra 700 til 800 med stram sporing som display. Brødteksten er samme familie i 400, liten og presis (15–16 px), med tabulære tall.
- **Palett:** `--paper #f7f4ee` · `--ink #141414` · `--ink-2 #5b5b58` · `--rule #d9d4ca` · `--accent #d6322b` (logo-rød, kun stor tekst og UI) · `--accent-text #b3251f` (≥ 4.5:1 på papir).
- **Signaturøyeblikk:** én sammenhengende linje, fjellet opp mot Sæterlia, som tegnes mens du scroller (`stroke-dashoffset` drevet av `animation-timeline: scroll()`).
- **Wow-effekter:** 4 («åpent nå» som en diskret rød/grå prikk), 5 (subtile `clip-path`-avdekkinger på seksjonstitler) og 9 (polaroidene står som et stille grid).
- **Bevegelse:** linjetegning og avdekkinger. *Redusert bevegelse:* linjen vises ferdig tegnet og avdekkingene er av. JS < 2 KB.

## 2. `v-maximal` · «Barnehagens store bildebok» (SHOWCASE)
- **Retning:** Maksimalistisk collage. Mettede fargeblokker i alle logofargene, klistremerker, håndtegnede doodles, mønstre (prikker, striper, bølger), overlappende lag og asymmetri.
- **Typografi:** *Fraunces* 900 med optisk størrelse (`fraunces-opsz-heavy.woff2`, opsz 9–144 og wght 500–900) i kjempestørrelse. Brødteksten er *Nunito* 400–800.
- **Palett:** `--lime #c4de62` · `--blue #2e3f8f` · `--red #d6322b` · `--brown #805c44` · `--stone #a9acaa` · `--cream #fff4dc` · `--sun #ffc93c` · `--ink #1c1a2e`. Tekst på rød/blå/brun er krem eller hvit, tekst på lime/sol/krem er blekk.
- **Signaturøyeblikk:** en hero-collage der rev, bjørn og skiløper titter fram bak papirlag, og øynene følger markøren (eller fingeren og helningen på mobil).
- **Wow-effekter:** 2 (øyne), 3 (levende maskoter med idle-animasjon og et triks når du trykker, som `<button>`), 5 (pop-up-avdekking), 6 (View Transitions fra avdelingskort til detalj), 8 (klistremerker/løv du kan dra, også med tastatur via piltaster), 9 (polaroider på snor som svaier) og 7 (lyd, AV som standard).
- **Bevegelse:** idle-animasjoner, svai og pop-up. *Redusert bevegelse:* alt står stille, øynene ser rett fram, og view transitions er av (innholdet byttes direkte).

## 3. `v-animert` · «Reisen opp til Sæterlia» (SHOWCASE)
- **Retning:** en scrollstyrt animasjonsfilm. Én sammenhengende illustrert verden (lagdelt SVG-parallakse) går fra Skei sentrum (Revehiet) via Bjørnehiet og opp til alpinanlegget (Sæterlia). Himmelen går fra morgen 06.45 til kveld 17.15, og en klokke i hjørnet følger reisen. Seksjonene står som veiskilt underveis.
- **Typografi:** *Fraunces* (wght) til skiltene og *Nunito* 600–800 til tekst.
- **Palett:** himmelstopp via `@property --sky-top/--sky-bottom` fra daggry (`#f6c9a0 → #9fc7e8`) via dag (`#6fb3e6 → #dff1fb`) til kveld (`#2b2f6b → #f08a5d`). Bakkene er `--lime #c4de62`, `--hill #7fae3e`, `--forest #2f5d34` og `--stone #a9acaa`. Skiltene er `--board #fffaf0` med `--ink #1d2433`.
- **Signaturøyeblikk:** hele reisen, med en kompis-maskot som går med deg og et akebrett-løp til slutt.
- **Wow-effekter:** 1 (scrollreise), 3 (rev/bjørn/skiløper som knapper), 4 (dag til natt plus et ekte «åpent nå»-merke), 6 (avdelingsskilt åpner detalj), 7 (lyd AV), 8 (aking nedover bakken til slutt) og 9 (polaroider på snor).
- **Bevegelse:** `animation-timeline: scroll()` på verdenslagene, IntersectionObserver og rAF-fallback for nettlesere uten støtte. *Redusert bevegelse:* verden deles opp i statiske illustrerte paneler per seksjon, uten parallakse og uten autoplay.

## 4. `v-stilistisk` · «Folkekunst og rosemaling»
- **Retning:** norsk folkekunst. Rosemalingsornamenter (C-svunger og akantus) som SVG, åklebånd-mønstre som bårder, en malt treplate-følelse og utskårne rammer.
- **Typografi:** *Alegreya* (kalligrafisk og ekspressiv serif) til tekst og overskrifter, og *Alegreya SC* 700 som kapiteler til etiketter og eyebrows.
- **Palett:** `--teal #0f4c4a` · `--teal-deep #0a3534` · `--oxblood #6b1e23` · `--ochre #c98a1b` · `--lime #c4de62` · `--linen #f4ecd8` · `--ink #22201c`.
- **Signaturøyeblikk:** ornamenter som «blomstrer» ut (stilker tegnes, blader skaleres inn) når en seksjon kommer til syne.
- **Wow-effekter:** 5 (seksjoner avdekkes bak bueformede masker), 6 (avdelingstavle til detalj) og 9 (polaroider i utskårne rammer).
- **Bevegelse:** blomstring og avdekking. *Redusert bevegelse:* ornamentene vises fullt utsprunget.

## 5. `v-premium` · «Lun eksklusivitet»
- **Retning:** redaksjonell og stille luksus, som et skandinavisk designhotell. Tynne linjer, mye luft, store elegante tall og et mørkt skogsgrønt rom med krem.
- **Typografi:** *Fraunces* 300 i stor størrelse (wght-filen) og *Instrument Sans* 400–600 til tekst og etiketter med versaler og sporing.
- **Palett:** `--forest #14231c` · `--forest-2 #1c3127` · `--cream #efe7d8` · `--cream-2 #d9cfbd` · `--brass #c8a96e` (dekor og stor tekst) · `--muted #a9b3a8`.
- **Signaturøyeblikk:** hero-teksten settes bokstav for bokstav, og «åpent nå» står som en elegant statuslinje («Åpent nå · stenger 17.15»).
- **Wow-effekter:** 4 (statuslinje), 5 (myke maske-avdekkinger), 6 (avdelinger til detalj) og 9 (polaroider som innrammet kunst), pluss mikrointeraksjoner: magnetiske knapper og et mykt lys som følger markøren.
- **Bevegelse:** settingen, lyset og magnetene. *Redusert bevegelse:* teksten står ferdig, og lyset og magnetene er av.

## 6. `v-wacky` · «Totalt tullball»
- **Retning:** en blanding av Memphis og neo-brutalisme. Tykke svarte konturer, skjeve bokser, harde skygger, googly eyes over alt, en markør som blir en liten rev og knapper som vagger.
- **Typografi:** *Bricolage Grotesque* 800 til display og 400–600 til tekst.
- **Palett:** `--ink #111` · `--paper #fffdf5` · `--yellow #ffe14d` · `--pink #ff8fc8` · `--cyan #6fe3ea` · `--lime #c4de62` · `--red #d6322b` (bare med hvit tekst ≥ 18,66 px fet, eller som flate) · `--blue #2e3f8f`.
- **Signaturøyeblikk:** et uendelig akeløp-minispill i footeren. Det starter bare når du trykker, styres med mellomrom/trykk og har en pauseknapp.
- **Wow-effekter:** 2 (googly eyes følger markøren), 3 (maskoter med triks), 7 (lyd AV), 8 («Ikke trykk!»-knappen slipper løs snøballer) og 9 (polaroider på en snor du kan dra).
- **Bevegelse:** vagging, øyne og snøballer. *Redusert bevegelse:* ingen vagging eller svai, snøballene vises statisk, og spillet startes bare manuelt med rolig fart.

## Velgeren · `site/index.html`
En nøytral, vakker side med overskriften «Velg retning». Den har seks kort med miniatyr (`shots/thumbs/*.webp` ≤ 40 KB), navn, konsept i én setning og lenke, og en lenke til `v1/`.

---

## Prosess
1. PLAN (denne filen) → bygg → skjermbildesløyfe (390×844 og 1440×900, normal og redusert bevegelse) med automatiske sjekker (`tools/shoot.js`: overflyt, konsollfeil, tredjepart, cookies, fokus og påkrevd innhold).
2. Kritiker-subagent per versjon (ser bare skjermbilder og brief) → topp 5 problemer → rettinger. To runder.
3. Lighthouse (mobilprofil, `tools/lh.js`), kjørt én om gangen.

## Lighthouse-resultater
*(fylles ut etter siste runde)*
