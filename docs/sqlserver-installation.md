# Kako postaviti razvojno okruženje za Microsoft SQL Server

## Preduslovi

Pre nego što instalirate Microsoft SQL Server, preporučuje se sledeće:

1. Windows operativni sistem (SQL Server radi i na Linuxu, ali za razvoj je najčešće korišćen na Windows-u)
2. Administrator privilegije (za instalaciju servera)
3. Stabilna internet konekcija (za preuzimanje i aktivaciju)

---

## Šta je Microsoft SQL Server?

**Microsoft SQL Server** je sistem za upravljanje relacionim bazama podataka (RDBMS) koji koristi Transact-SQL (T-SQL) – Microsoftovu implementaciju SQL jezika. Namenjen je za rad sa velikim količinama podataka, poslovnim aplikacijama i odličan je izbor za .NET aplikacije zbog bliske integracije sa Microsoft okruženjem.

---

## Zašto Microsoft SQL Server?

- **Odlična integracija sa .NET/ASP.NET aplikacijama**
- Pouzdanost i skalabilnost
- Visual Studio podrška
- Besplatna verzija SQL Server Express
- Performanse i sigurnost
- Prethodno iskustvo u radu i upoznatost sa sistemom

---

## Instalacija Microsoft SQL Server-a i SSMS-a

### Korak 1: Preuzimanje Microsoft SQL Server-a

- Otvorite [zvaničnu stranicu za preuzimanje SQL Server-a](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)
- Preuzmite **SQL Server 2022 Express** ili **Developer Edition**:
  - **Express** – besplatna, ograničena verzija za male aplikacije (preporuceno)
  - **Developer** – puna funkcionalnost, namenjena za razvoj (nije za produkciju)

### Korak 2: Instalacija SQL Server-a

1. Pokrenite preuzeti instalacioni fajl (`SQLServer2022-SSEI-Dev.exe` ili sličan)
2. Izaberite opciju **Basic Installation** (ili **Custom** ako želite detaljna podešavanja)
3. Pratite standardnu proceduru za instalaciju
4. Zapamtite ime SQL instance (npr. `SQLEXPRESS`) ako ga ne ostavljate podrazumevano

> **Napomena:** Možete kreirati **Default instance** ili **Named instance**. Ako ne znate razliku, preporučuje se default.

---

### Korak 3: Instalacija SSMS (SQL Server Management Studio)

**SSMS** je alat za upravljanje SQL Server-om.

1. Otvorite [zvaničnu stranicu za preuzimanje SSMS-a](https://aka.ms/ssmsfullsetup)
2. Preuzmite i pokrenite instalaciju
3. Pratite standardnu proceduru za instalaciju - Next do kraja

---

## Pokretanje SSMS-a i kreiranje baze

1. Pokrenite **SQL Server Management Studio**
2. Prijavite se na server:
   - **Server name:** `localhost` ili `localhost\SQLEXPRESS` (ako je instalirana named instance)
   - **Authentication:** Windows Authentication (ili SQL Server Authentication ako ste kreirali SQL korisnika)
3. Kada se povežete, desni klik na **Databases** → **New Database**
4. Unesite ime baze (npr. `MyAppDb`) i kliknite **OK**

---

## Connection String – šta je i kako se koristi

**Connection string** je tekst koji omogućava aplikaciji da se poveže sa bazom podataka. Sadrži podatke kao što su naziv servera, ime baze, autentikacija i drugo.

### Primer za Windows Authentication:

```csharp
string connectionString = "Server=localhost\\SQLEXPRESS;Database=MyAppDb;Trusted_Connection=True;";
```

### Primer za SQL Server Authentication:

```csharp
string connectionString = "Server=localhost\\SQLEXPRESS;Database=MyAppDb;User Id=sa;Password=your_password;";
```

> **Napomena 1:** Ako ste tokom instalacije podesili SQL Authentication, vodite računa da korisničko ime i lozinka budu ispravno uneseni.  
>**Napomena 2:** Connection string varira u odnosu na to kako ste konfigurisali prethodne korake u toku instalacije. 

### Gde se koristi?

U .NET projektima, connection string se najčešće dodaje u fajl `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=MyAppDb;Trusted_Connection=True;"
  }
}
```

I pristupa mu se u kodu:

```csharp
var connectionString = Configuration.GetConnectionString("DefaultConnection");
```

---

## Kratak pregled SQL Server Management Studio (SSMS)

- **Object Explorer:** Pregled svih baza, tabela, stored procedura
- **New Query:** Pisanje i izvršavanje SQL upita
- **Table Design:** Dodavanje kolona, tipova podataka, primarnih ključeva kroz GUI
- **Backup/Restore:** Pravimo rezervne kopije baza 
- **Security:** Upravljanje korisnicima i pristupom

---

## Zaključak i cilj

Praćenjem ovih koraka imaćemo podešeno sve što nam je potrebno za dalji rad sa samom bazom. Konkretno, imaćemo funkcionalno okruženje za razvoj i rad na bazi, i što je najbitnije moćićemo da uz pomoć Connection string-a i ApplicationDbContext-a ostvarimo konekciju između same aplikacije i baze, i da na vrlo čist i elegantan način upotpunimo čitav sistem.

