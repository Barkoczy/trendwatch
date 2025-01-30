# TrendWatch

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

Pre YouTube API v3 parameter `chart` má momentálne iba jedinú dostupnú hodnotu:

- `mostPopular`: Získa najpopulárnejšie videá pre danú krajinu

Je to jediná možnosť, ktorá je momentálne podporovaná v YouTube Data API v3. V minulosti existovali aj iné hodnoty ako napríklad 'top_rated' alebo 'most_viewed', ale tie boli odstránené v novších verziách API.

Ak by ste chceli filtrovať videá iným spôsobom, museli by ste použiť iné API endpointy a parametre:

1. Namiesto `videos` endpointu by ste mohli použiť `search` endpoint s parametrami:

- `order` parameter s hodnotami:
  - `date` (najnovšie)
  - `rating` (najlepšie hodnotené)
  - `relevance` (najrelevantnejšie)
  - `title` (abecedne podľa názvu)
  - `videoCount` (podľa počtu videí)
  - `viewCount` (podľa počtu zhliadnutí)

2. Alebo môžete použiť dodatočné parametre pre `videos` endpoint:

- `videoCategoryId` (pre filtrovanie podľa kategórie)
- `regionCode` (ktorý už používame)
- `maxResults` (ktorý už používame)
