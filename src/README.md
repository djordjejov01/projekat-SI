# SyncUp

**SyncUp** je aplikacija za upravljanje događajima, sa backendom (.NET), web frontendom (Angular) i mobilnom aplikacijom (React Native/Expo).

---

## Sadržaj

- [Zahtevi](#zahtevi)
- [Podešavanje okruženja](#podešavanje-okruženja)
- [Pokretanje Backend-a](#pokretanje-backend-a)
- [Pokretanje Web aplikacije](#pokretanje-web-aplikacije)
- [Pokretanje Mobilne aplikacije](#pokretanje-mobilne-aplikacije)
- [Dodatne napomene](#dodatne-napomene)

---

## Zahtevi

### Opšti softver
- **Git** (za kloniranje repozitorijuma)
- **Node.js** (verzija 18+ preporučeno)
- **npm** (dolazi uz Node.js)
- **.NET 9.0 SDK**
- **PostgreSQL**
- **Expo CLI** (za mobilnu aplikaciju)

---

## Podešavanje okruženja

### 1. Kloniraj repozitorijum

```bash
git clone <URL_DO_REPOZITORIJUMA>
cd syncup/src
```

### 2. Podesi environment varijable i konfiguracije

#### Backend (`src/Backend/Backend/appsettings.json`)

- Podesi konekcioni string za bazu podataka:
  ```json
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=syncupdb;Username=postgres;Password=lozinka"
  }
  ```
- Po potrebi podesi port (default je 5000 ili 5001 za HTTPS).
- Proveri da li su vrednosti u `"Jwt"` sekciji u `appsettings.json` ispravne (npr. `"Key"`, `"Issuer"`, `"Audience"`).
  Ova sekcija je već podešena za autentifikaciju, ali po potrebi izmeni vrednosti za svoje okruženje.

  **Primer:**
  ```json
  "Jwt": {
    "Key": "tajni_kljuc",
    "Issuer": "localhost",
    "Audience": "localhost"
  }
  ```
  > **Napomena:** U produkciji koristi environment varijable ili tajne menadžere za ove vrednosti i nikada ne deli pravi tajni ključ javno.

#### WebApp (Angular)

- API URL za backend je definisan kao privatno polje u fajlu:
  `src/app/Services/api.service.ts`
  ```typescript
  private apiUrl = 'https://localhost:<BACKEND_PORT>/api';
  ```
- Izmeni ovu vrednost prema svom okruženju (localhost, produkcija, IP adresa).

#### MobileApp (React Native/Expo)

- API URL je definisan u fajlu:
  `MobileApp/config.ts`
  ```typescript
  const LOCAL_IP = "<YOUR_LOCAL_IP>";
  export const API_URL = `http://${LOCAL_IP}:<BACKEND_PORT>/api`;
  ```
- Izmeni `LOCAL_IP` i port prema svom okruženju (posebno ako testiraš na fizičkom uređaju).
---

## Pokretanje Backend-a

```bash
cd Backend/Backend
dotnet restore
dotnet build
dotnet ef database update   # (prvi put, za migracije)
dotnet run
```

- Backend će biti dostupan na `https://localhost:5001` ili `http://localhost:5000` (proveri u konzoli).

---

## Pokretanje Web aplikacije (Angular)

```bash
cd WebApp
npm install
npm run start
```
ili
```bash
ng serve
```

- Web aplikacija će biti dostupna na `http://localhost:4200` (ili drugi port, vidi u konzoli).

---

## Pokretanje Mobilne aplikacije (React Native/Expo)

```bash
cd MobileApp
npm install
npx expo start
```

- Prati uputstva u terminalu za pokretanje na emulatoru ili fizičkom uređaju (Expo Go aplikacija).
- Ako koristiš fizički uređaj, proveri da li je API URL u `config.ts` postavljen na tvoju lokalnu IP adresu.

---

## Dodatne napomene

- **Development vs. Production:**  
  - Za development koristi default komande iznad.
  - Za produkciju koristi build komande:
    - Backend: `dotnet publish`
    - Web: `ng build --prod`
    - Mobile: `expo build` ili `eas build`
- **Migracije baze:**  
  - Ako menjaš modele, koristi:
    ```bash
    dotnet ef migrations add ImeMigracije
    dotnet ef database update
    ```
- **ENV varijable:**  
  - Za sigurnost, koristi `.env` fajlove ili environment varijable za lozinke i API ključeve.
- **API URL:**  
  - Prilagodi API URL u frontend i mobilnoj aplikaciji prema okruženju (localhost, produkcija, IP adresa).

---