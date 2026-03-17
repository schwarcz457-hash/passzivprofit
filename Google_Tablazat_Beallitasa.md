# Hogyan kössük be a Google Táblázatot a Weboldalhoz

Ezt a folyamatot egyszer kell megcsinálni a Google fiókodban, utána a weboldal onnantól kezdve minden új jelentkezőt automatikusan bele fog írni a táblázatodba!

## 1. Lépés: Hozz létre egy új Google Táblázatot
1. Nyisd meg a [Google Táblázatokat](https://docs.google.com/spreadsheets).
2. Hozz létre egy új, üres táblázatot.
3. Nevezd el (pl. "Arany Landing Page Jelentkezők").
4. Az első sor celláiba (A1, B1, C1, D1, E1) írd be fejlécnek ezeket pontosan így (kisbetűvel, ahogy a kód küldi):
   - A1: `id`
   - B1: `timestamp`
   - C1: `name`
   - D1: `email`
   - E1: `phone`

## 2. Lépés: Készíts hozzá egy Google Apps Scriptet
1. Nyomj rá a felső menüben a **Kiterjesztések** -> **Apps Script** (Extensions -> Apps Script) gombra.
2. Egy új oldal nyílik meg. Töröld ki az ott lévő kódrészt (`function myFunction() { ... }`), és másold be helyette az alábbit:

```javascript
function doPost(e) {
  // Megnyitja az aktuális táblázatot és munkalapot
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  try {
    // Kinyerjük az adatokat a bejövő kérésből
    const data = JSON.parse(e.postData.contents);
    
    // Hozzáadjuk a táblázat legalsó sorához az adatokat (ügyelve a fejléc sorrendjére)
    sheet.appendRow([
      data.id || "",
      data.timestamp || new Date().toISOString(),
      data.name || "",
      data.email || "",
      data.phone || ""
    ]);
    
    // Sikeres visszajelzés
    return ContentService.createTextOutput(JSON.stringify({ "status": "success" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Hiba esetén
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

## 3. Lépés: Publikálás Webalkalmazásként (Webhook)
1. A jobb felső sarokban kattints a kék **Telepítés** / **Új telepítés...** (Deploy -> New deployment) gombra.
2. A fogaskerék ikonra kattintva válaszd ki, hogy a típus: **Webalkalmazás** (Web app).
3. **Leírás:** Pl. "Landing page form fogadó".
4. **Végrehajtás mint:** "Én" (Me). *(Ez fontos, így fog a te nevedben beírni a táblázatba).*
5. **Kinek van hozzáférése:** "Bárkinek" (Anyone). *(Ez teszi lehetővé, hogy a weboldalad beküldhesse az adatot).*
6. Kattints a kék **Telepítés** (Deploy) gombra.
7. *Megjegyzés: Ha ez az első alkalom, a Google egy felugró ablakban kérni fogja, hogy hagyj jóvá jogosultságokat. Itt válaszd az Advanced/Speciális gombot, és Engedélyezd (Allow) a hozzáférést a saját táblázatodhoz.*
8. Miután lefutott, kapsz egy dobozt, benne egy hosszú **Webalkalmazás URL** (Web app URL) linkkel, ami valahogy így néz ki: `https://script.google.com/macros/s/.../exec`.
9. **MÁSOLD KI EZT AZ URL-t!**

## 4. Lépés: Kösd be a letöltött weboldalba
Most, hogy megvan a link, már csak meg kell mondanunk a landing oldalnak, hogy hova lője fel az adatokat.

Létre kell hoznod egy fájlt a weboldal fő könyvtárában (`gold-landing-page`), aminek a neve `.env.local` lesz. Ebbe egyetlen sort kell beleírnod:
`GOOGLE_SHEETS_WEBHOOK_URL="ide-illeszd-be-a-kimasolt-hosszu-linkedet"`

Ezután, ha bárki kitölti az űrlapot a weblapodon, egy másodperc múlva ott fognak megjelenni a friss adatok a telefonodon vagy a gépeden nyitott Google Táblázatban!
