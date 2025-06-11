# Kako postaviti development sredinu za Angular

### Preduslovi

1. Instalirati **NodeJs**
2. Instalirati **Angular CLI** globalno

## NodeJs

**Zašto je potreban:**

Angular se oslanja na Node.js za pokretanje razvojnih servera, upravljanje paketima i kompajliranje koda.

**Kako instalirati:**

- Posetiti zvaničnu stranicu [NodeJs-a](https://nodejs.org/en)
- Preuzeti **Node.js (LTS)** (preporučeno zato što LTS označava da je to Long Term Support verzija)
- Pokrenuti installer i pratiti uputstva za instalaciju za vaš operativni sistem
  - Porebno je prihvatiti **License Agreement**
  - U sekciji **Tools for Native Modules** čekirati **Automatically install the necessary tools**
  - Ostala podešavanja mogu da ostanu kako je prvobitno ponuđeno

**Provera instalacije**

Kako bi verifikovali da je **NodeJs** uspešno instaliran na vašoj mašini možete uraditi sledeće

- Otvoriti **Command Prompt (cmd)**
- Ukucati komandu `node --version` ili `node -v`, ovo će prikazati koja verzija **NodeJS-a** je instalirana

### **Node Package Manager - npm**

**Zašto je potreban:**

Koristi se za instalaciju **Angular CLI-a** i drugih biblioteka potrebnih za razvoj u Angularu.

**Provera instalacije**

Dolazi zajedno sa **NodeJs-om** tako da ako ste ispratili prethodne korake samo je potrebno verifikovati da jeste instaliran na sledeći način

- Otvoriti **Command Prompt (cmd)**
- Ukucati komandu `npm --version` ili `npm -v`

## Angular CLI

**Zašto je potreban:**

**Angular CLI** je interfejs komandne linije koji koristimo za kreiranje novih **Angular** projekata ili generisanje šablonskog (boiler plate) koda, kao i za kreiranje paketa spremnih za postavljanje na server (deployable packages)

**Kako instalirati:**

Da bi instalirali **Angular CLI** biće nam potrebna `npm` komanda, zbog ovoga nam je bio potreban **NodeJS** i **NPM** koji dolazi sa njim. Sada je samo potrebno ispratiti sledeće korake:

- Otvoriti **Command Prompt (cmd)**
- Ukucati komandu `npm install -g @angular/cli@latest`
  - `-g | -global` - ovo označava da želimo da se paket instalira globalno na našoj mašini
  - `@angular/cli` - ime paketa koji želimo da instaliramo
  - `@latest` - ovaj argument je **opcioni** ako bi pokrenuli komandu `npm install -g @angular/cli` svakako bi se instalirala poslednja stabilna verzija

**Provera instalacije:**

Kako bi verifikovali da je **Angular CLI** uspešno instaliran na vašoj mašini možete uraditi sledeće

- Otvoriti **Command Prompt (cmd)**
- Ukucati komandu `ng version`

## Pravljenje projekta

**Kreacija:**

Novi **Angular** projekat možemo napraviti praćenjem sledećih koraka:

- Potrebno je u **Command Prompt (cmd)** otvoriti lokaciju na kojoj želimo kreirati projekat. Ovo možemo uraditi tako što u **File Explorer-u** odemo na željenu lokaciju, kliknemo desni klik miša (ukoliko je potrebno posle toga kliknemo **Show more options**) i izaberemo **Open in terminal**

- Sada samo treba da ukucamo komandu za kreaciju `ng new project-name`, **project-name** zameniti imenom koje želimo za projekat npr. `ng new test-project`

- Kada izvršimo komandu iznad dobićemo par pitanja na kojem treba dati odgovor kako bi projekat bio uspešno konfigurisan.

  - **Da li želite da delite pseudonimne podatke o korišćenju sa Angular timom?** - Angular tim koristi anonimne podatke kako bi poboljšao alatke. <br> **Preporuka:** N ako želite privatnost, Y ako želite da doprinesete.

  - **Da li želite da kreirate aplikaciju bez zone.js (“zoneless”)? (Developer Preview)** - Napredno podešavanje koje omogućava veću kontrolu i bolju optimizaciju performansi, ali nije za početnike. <br> **Preporuka:** N (osim ako tačno znate šta radite).

  - **Koji format stilova želite da koristite? (CSS/SCSS/SASS/LESS/Stylus)** - Odaberite način pisanja stilova (dizajna) za vašu aplikaciju.

  - **Da li želite da omogućite Server-Side Rendering (SSR) i Static Site Generation (SSG)?** - Omogućava bolje performanse i SEO (Search Engine Optimization) jer se stranice generišu na serveru. <br> **Preporuka:** N ako pravite aplikaciju za unutrašnju upotrebu ili SPA (Single Page Application); Y ako pravite sajt koji treba da bude brzo indeksiran na Google-u.

  - **Da li želite da koristite standalone strukturu aplikacije?** - Koristi moderniji pristup bez NgModule-a — jednostavniji i preporučen. <br> **Preporuka:** Y (Angular tim preporučuje od verzije 15+).

  - **Da li želite da dodate Angular routing?** - Omogućava navigaciju između različitih stranica u aplikaciji. <br> **Preporuka:** Y ako planirate više stranica, N ako aplikacija ima samo jednu stranicu.

Pitanja koja se dobiju kada se pokrene komanda `ng new` zavise od verzije **Angular-CLI-a** i toga da li su korišćeni **flagovi** tako da ukoliko se ne dobiju sva navedena pitanja projekat je idalje uspešno kreiran.

**Pokretanje:**

Da bi uspešno pokrenuli projekat potrebno je uraditi sledeće

- U terminalu otvorimo lokaciju na kojoj se nalazi projekat (opisano na početku objašnjena za kreaciju projekta)

- Zatim ukucamo komandu `ng serve` - ona će **kompajlirati projekat** i generisati potrebne **bundle-ove** a zatim otvoriti **live-development server** na kome možemo otvoriti projekat

- Kada se projekat kompajlira možemo ga pokrenuti tako što otvorimo link sa **localhost-om**
