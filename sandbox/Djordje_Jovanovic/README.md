# Pokretanje baze - ASP.NET Core + PostgreSQL

Ovaj backend koristi PostgreSQL bazu i Entity Framework Core migracije za kreiranje šeme baze.

---

##  1. Podesi konekciju ka bazi

U fajlu `appsettings.json` pronađi sekciju `ConnectionStrings` i izmeni lozinku za svoj PostgreSQL nalog:

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5432;Database=Baza;Username=postgres;Password=ovdeUnesiSvojuLozinku"
}
```

---

##  2. Kreiranje baze putem migracija

Postoje dva načina da kreiraš bazu:

---

###  Način 1 – Putem komandne linije

1. Otvori terminal (npr. VS Code terminal, PowerShell ili CMD) u folderu gde se nalazi `.csproj` fajl backend projekta (npr. `crud.api`).

2. Pokreni sledeće komande:

```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```

> Ovo će generisati migraciju i primeniti je nad bazom — tabele će biti kreirane u tvojoj `Baza` bazi.

---

###  Način 2 – Iz Visual Studio okruženja

1. Otvori **Package Manager Console** u Visual Studiju:
   - Tools → NuGet Package Manager → Package Manager Console

2. U donjem delu Visual Studija otvoriće se konzola. Tu upiši sledeće komande:

```powershell
Add-Migration InitialCreate
Update-Database
```

> Nakon ovoga će Entity Framework generisati migracije i primeniti ih — baze i tabele biće spremne za rad.

---


