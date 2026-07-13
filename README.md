# Atómáčik

Responzívna Vue 3 + Vite edukačná webová hra v slovenčine o odoberaní vzoriek vody,
laboratórnom meraní a vyhodnocovaní izotopov. Hráč si na mape Slovenska vyberie
výpravu pri Mochovciach alebo Jaslovských Bohuniciach.

## Čo je v hre

- výber lokality na zjednodušenej mape Slovenska,
- postup s bodmi, úrovňami a odznakmi,
- šesť logických minihier pri odbere vzorky,
- náučné vysvetlenie po každej odberovej úlohe,
- laboratórna minihra so spektrometrom a čítaním izotopov,
- výsledková tabuľka, záver misie a finálny odznak.

## Spustenie

```bash
pnpm install
pnpm dev
```

Lokálna adresa:

```text
http://127.0.0.1:5174/atomacik/
```

## Build

```bash
pnpm build
```

## Kontroly pred vydaním

```bash
pnpm test
pnpm lint
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

End-to-end test prejde nový nástup, obnovenie uloženej misie, laboratórne merania,
výsledky a záverečný odznak. Samostatne overuje aj offline stav Spotify playlistu.

## PWA a zdieľanie

Aplikácia obsahuje ikony pre Android a iOS, maskable PWA ikonu a náhľadový obrázok
pre zdieľanie na sociálnych sieťach. Spotify je jediná časť, ktorá počas offline režimu
vyžaduje internetové pripojenie; hra zostáva dostupná.

## GitHub Pages

Vo `vite.config.js` je nastavené:

```js
base: '/atomacik/'
```

Ak sa repozitár bude volať inak ako `atomacik`, upravte hodnotu `base` podľa názvu repozitára.
