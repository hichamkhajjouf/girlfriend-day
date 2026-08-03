# Voor jou ❤️

Een kleine, statische verrassingswebsite voor International Girlfriend Day.
Mobiel-first, voelt als een appje. Geen build-stap, geen framework — alleen
HTML/CSS/JS en Google Fonts.

## Wat je zelf invult

Alles wat je wilt aanpassen staat **bovenin `app.js`** in het `CONFIG`-blok:

- **naam** — de naam van je vriendin
- **reveal** — de boodschap in de envelop + de polaroid-foto
- **briefjes** — de lijst met briefjes (elke regel = één briefje)
- **soundboard** — koppel elk mp3-bestand aan een label
- **credit** — de regel onderaan

## Bestanden neerzetten

- Polaroid-foto → map `photo/` (standaard `ons.jpg`) — zie `photo/LEES-MIJ.txt`
- Spraakberichten → map `audio/` (mp3) — zie `audio/LEES-MIJ.txt`

## Lokaal bekijken

Open niet zomaar `index.html` (audio/fetch werkt dan soms niet). Start een
klein lokaal servertje in deze map:

```bash
python -m http.server 8000
```

Ga dan naar http://localhost:8000 op je computer.

## Live zetten (Vercel)

Dit is een puur statische site, dus Vercel heeft geen configuratie nodig:

1. Zet de map op GitHub (of gebruik `vercel` CLI).
2. In Vercel: **New Project** → importeer de repo → **Deploy**.
   Framework preset: *Other*. Build command: leeg. Output directory: `./`.

## Op het beginscherm zetten (iPhone)

In Safari: tik op het deel-icoon → **Zet op beginscherm**. De site opent dan
schermvullend als appje, met het hart-icoon. Op de hub verschijnt hier ook
een klein tipje voor.

---
Gemaakt met liefde. 🤍
