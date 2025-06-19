# Kako postaviti development sredinu za PostgreSQL

## Preduslovi

Pre nego što instalirate **PostgreSQL**, preporučuje se sledeće:

1. Operativni sistem (Windows / macOS / Linux) – PostgreSQL je potpuno višeplatformski
2. Administratorske privilegije (za instalaciju servera)
3. Stabilna internet konekcija (za preuzimanje i aktivaciju dodatnih komponenti)

---

## Šta je PostgreSQL?

**PostgreSQL** je moćan, open‑source sistem za upravljanje relacionim bazama podataka (RDBMS) koji koristi standardni SQL i proširuje ga sopstvenim proceduralnim jezikom **PL/pgSQL**. Poznat je po pouzdanosti, bogatom setu funkcija (CTE‑ovi, JSONB, replikacija, ekstenzije poput PostGIS‑a) i licenci koja dozvoljava slobodnu upotrebu u komercijalnim aplikacijama.

---

## Zašto PostgreSQL?

* **Open‑source** – bez troškova licence i velika zajednica
* **Odlična integracija sa .NET** preko ADO.NET drajvera **Npgsql** i Entity Framework Core providera
* **Performanse i skalabilnost** (MVCC, paralelna izvršavanja, particije)
* **Napredne funkcije** (JSONB, GiST/Gin indeksi, replikacija, ekstenzije)
* **Kros‑platformska podrška** (razvoj na Windows‑u, deployment na Linux‑u ili obrnuto)

---

## Instalacija PostgreSQL‑a i pgAdmin‑a

### Korak 1: Preuzimanje i instalacija PostgreSQL‑a

1. Otvorite [zvaničnu stranicu za preuzimanje](https://www.postgresql.org/download/)
2. Izaberite **PostgreSQL 16** (ili noviju LTS verziju) i svoj operativni sistem
3. Pokrenite instalacioni fajl (npr. `postgresql-16.2-1-windows-x64.exe`)
4. U toku instalacije:

   * Izaberite direktorijum za instalaciju
   * Postavite lozinku za super user‑a **postgres** (obavezno zapamtiti!)
   * Ostavite podrazumevani port `5432` (ili promenite ako je zauzet)
   * Izaberite komponente **pgAdmin 4**, **Stack Builder** ako su vam potrebni
5. Završite instalaciju i sačekajte da servis startuje

> **Napomena:** Port i lozinku možete menjati kasnije u `postgresql.conf` i `pg_hba.conf`, ali je najbolje da ih odmah pravilno podesite.

### Korak 2: (Opciono) Instalacija pgAdmin‑a

Ako niste čekirali pgAdmin tokom instalacije:

1. Preuzmite [pgAdmin 4](https://www.pgadmin.org/download/)
2. Instalirajte i sledite „Next‑Next‑Finish“ proceduru

pgAdmin je grafički alat za upravljanje PostgreSQL serverima – nešto poput SSMS‑a za SQL Server.

---

## Pokretanje pgAdmin‑a i kreiranje baze

1. Pokrenite **pgAdmin 4**
2. Prvi put unesite email i lozinku za pgAdmin GUI (nije isto što i `postgres` lozinka)
3. U **Object Explorer‑u** kliknite desni klik na **Servers** → **Create** → **Server…**

   * **Name:** Localhost
   * **Connection** tab:

     * **Host name / address:** `localhost`
     * **Port:** `5432`
     * **Maintenance database:** `postgres`
     * **Username:** `postgres`
     * **Password:** *lozinka koju ste setovali* (čekirajte *Save Password*)
4. Kada se povežete, desni klik na **Databases** → **Create** → **Database…**

   * Unesite ime baze (npr. `MyAppDb`) i kliknite **Save**

---

## Connection string – šta je i kako se koristi

**Connection string** je tekst koji omogućava aplikaciji da se poveže sa bazom. Za PostgreSQL u .NET svetu se koristi Npgsql format.

### Primer za korisničko ime i lozinku (najčešći slučaj):

```csharp
string connectionString = "Host=localhost;Port=5432;Database=MyAppDb;Username=postgres;Password=your_password;";
```

### Primer za Windows Integrated Security (SSPI):

```csharp
string connectionString = "Host=localhost;Port=5432;Database=MyAppDb;Integrated Security=true;";
```

> **Napomena 1:** `Integrated Security=true` radi samo na Windows‑u sa PostgreSQL servisom konfigurisanim za SSPI autentikaciju.
>
> **Napomena 2:** Ako izmenite port ili ime korisnika, obavezno ažurirajte connection string.

### `appsettings.json` primer u ASP.NET Core projektu:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=MyAppDb;Username=postgres;Password=your_password;"
  }
}
```

I pristup iz C# koda:

```csharp
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));
```

(Ne zaboravite `dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL`.)

---

## Kratak pregled pgAdmin‑a

* **Browser / Object Explorer:** Pregled servera, baza, šema, tabela i funkcija
* **Query Tool:** Pisanje i izvršavanje SQL upita (Ctrl + Enter za execute)
* **ERD Tool (Query Tool > Graph):** Vizuelni prikaz relacija
* **Backup/Restore:** Kreiranje rezervnih kopija baza
* **Extensions:** Aktiviranje ekstenzija (npr. `uuid-ossp`, `postgis`)

---

## Zaključak i cilj

Praćenjem ovih koraka dobićete kompletno razvojno okruženje za PostgreSQL, spremno za integraciju sa vašom .NET aplikacijom. Definisani **connection string** omogućava `ApplicationDbContext`‑u da komunicira sa bazom, čime se zaokružuje backend‑storage sloj vaše aplikacije na čist i elegantan način.
