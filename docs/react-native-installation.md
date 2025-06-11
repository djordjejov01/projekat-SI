# React Native
## Preduslovi

- Instaliran **Visual Studio Code**
- Instaliran **Node.js**
- Internet konekcija

---

## 1. Instalacija Node.js

### Zašto je potreban:
Node.js omogućava korišćenje `npm` komandi koje su ključne za instalaciju React Native alata (kao što je Expo).

### Kako instalirati:
1. Poseti zvaničnu stranicu: https://nodejs.org
2. Preuzmi **LTS verziju** (Long Term Support)
3. Pokreni instalaciju i prati korake:
   - Prihvati uslove korišćenja (License Agreement)
   - Obeleži opciju **"Automatically install the necessary tools"**
   - Ostavi ostala podešavanja po defaultu

### Provera instalacije:
Otvori **Command Prompt** (cmd) i ukucaj:
```bash
node -v
npm -v
```

Ako se prikažu verzije Node i npm, sve je uspešno instalirano.

---

## 2. Instalacija Expo CLI (preporučeni novi način)

### Zašto je potreban:
Expo omogućava jednostavno pokretanje i testiranje React Native aplikacija bez potrebe za Android Studio ili Xcode.

### Novi preporučeni način:
Expo tim je **zvanično preporučio korišćenje `create-expo-app`** umesto starog `expo-cli`, jer je stabilniji i kompatibilniji sa novijim verzijama Node.js.

### Kako instalirati i kreirati projekat:
```bash
npm install -g create-expo-app
npx create-expo-app mojProjekat
```

Otvoriće se lokalni Expo server u browseru. Tu možeš:
- Pokrenuti aplikaciju na telefonu (povezanom sa istom WiFi mrežom)
- Pokrenuti aplikaciju u emulatoru (ako je podešen)

---

## 3. (Zastareli metod - samo informativno)

```bash
npm install -g expo-cli
expo init mojProjekat
```

> !! **Ova metoda je zastarela i ne preporučuje se.** Može izazvati greške sa novim verzijama Node.js.

---

## 4. Pokretanje aplikacije

Pristupamo ili ulazimo u folder projekta koristeći sledeću komandu:
```bash
cd mojProjekat
```
Kada si unutar foldera aplikacije:
<!-- dodati komandu ulaska u folder-->
```bash
npx expo start
```

Pojaviće se QR kod koji možeš skenirati putem Expo Go aplikacije na svom telefonu.

> Ako koristiš samo računar bez telefona, možeš izabrati opciju "Run in Web" da vidiš aplikaciju u browseru.

---

## 5. Preporučeni editor: Visual Studio Code

Preporučuje se korišćenje **Visual Studio Code** kao glavnog editora za kodiranje:
- Podrška za JavaScript/TypeScript
- Veliki broj ekstenzija (npr. React Native Tools)
- Debugging integracija

Možeš preuzeti sa: https://code.visualstudio.com

---

