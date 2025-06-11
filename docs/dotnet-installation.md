# Uputstvo za instalaciju i podešavanje .NET core

## Šta je .NET?  
.NET je platforma za razvoj softvera koju je razvio Microsoft. Ona omogućava kreiranje različitih tipova aplikacija:

- Web aplikacije
- Desktop aplikacije
- Mobilne aplikacije
- Cloud servisi
- IoT (Internet of Things) aplikacije
- AI i Machine Learning projekti

### Ključne karakteristike .NET-a:  
- **Cross-platform**: Radi na Windows, macOS i Linux sistemima
- **Open Source**: Dostupan je kao open source projekat
- **Modern**: Podržava moderne programerske paradigme i funkcionalnosti
- **Performant**: Brz i efikasan u izvršavanju
- **Bezbedan**: Ugrađene bezbednosne karakteristike
- **Velika zajednica**: Aktivna zajednica developera i mnogo dostupnih resursa

### Šta sve obuhvata .NET platforma?  
- **.NET Runtime** – okruženje koje izvršava .NET aplikacije.

- **C# jezik** – najčešće korišćen jezik u .NET okruženju (ali mogu se koristiti i VB.NET, F#...).

- **.NET Libraries (biblioteke)** – kolekcije već napisanog koda koje pomažu u radu s datotekama, mrežom, bazama podataka, grafikom itd.

- **ASP.NET** – deo .NET-a za pravljenje web aplikacija.

- **Entity Framework** – biblioteka za rad s bazama podataka.

- **Visual Studio** – najčešće korišćeno razvojno okruženje (IDE) za rad s .NET-om.



## Sadržaj

1. [Instalacija .NET Core](#instalacija-net-core)
2. [Verifikacija instalacije](#verifikacija-instalacije)
3. [Osnovna podešavanja](#osnovna-podešavanja)
4. [Kreiranje prvog projekta](#kreiranje-prvog-projekta)

## Instalacija .NET Core

### Windows
1. Posetite zvaničnu .NET stranicu: https://dotnet.microsoft.com/download
2. Preuzmite .NET SDK installer za Windows
3. Pokrenite preuzeti installer
4. Pratite korake instalacionog vodiča
5. Prihvatite sve predložene opcije

### macOS
1. Koristite Homebrew:
```bash
brew install dotnet
```

### Linux (Ubuntu)
```bash
wget https://packages.microsoft.com/config/ubuntu/20.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
sudo apt-get update
sudo apt-get install -y dotnet-sdk-7.0
```

## Verifikacija instalacije

Otvorite terminal/komandnu liniju i unesite:
```bash
dotnet --version
```

Takođe možete proveriti sve instalirane komponente:
```bash
dotnet --info
```

## Osnovna podešavanja

### 1. Podešavanje PATH varijable
- Windows će automatski dodati .NET u PATH
- Za macOS/Linux, dodajte u ~/.bashrc ili ~/.zshrc:
```bash
export PATH=$PATH:$HOME/.dotnet
```

### 2. Podešavanje editora
Preporučeni editori:
- Visual Studio Code sa C# ekstenzijom
- Visual Studio Community Edition


## Kreiranje prvog projekta

1. Kreirajte novi projekat:
- Otvoriti Terminal ili Command Prompt

- Navigirati do direktorijuma u kojem želimo da kreiramo projekat

- Pokrenuti komandu:
```bash
dotnet new console -n MojPrviProjekat
```  
- console – tip projekta (može biti i web, mvc, blazor, classlib, itd.)

- -n – ime projekta

2. Uđite u direktorijum projekta:
```bash
cd MojPrviProjekat
```

3. Pokrenite projekat:
```bash
dotnet run
```

## Kreiranje HelloWorld projekta  
- Otvoriti **Command Promt**
- Navigirati do direktorijuma u kojem želimo da kreiramo projekat
- Pokrenuti komandu:
```bash
dotnet new console -n helloworld
```  
- U datom direktorijumu kreiran je direktorijum **helloworld**
- Automatski je kreiran fajl Program.cs
```bash
// See https://aka.ms/new-console-template for more information
Console.WriteLine("Hello, World!");
```  
- U **Command Promt** unesemo:
```bash
cd helloworld
``` 
- Pokrenemo program
```bash
dotnet run
``` 
- Ispis:
```bash
Hello, World!
``` 

## Korisne komande

- `dotnet new` - Kreira novi projekat
- `dotnet new list` - Prikazuje sve dostupne šablone za kreiranje projekata
- `dotnet build` - Kompajlira projekat
- `dotnet run` - Pokreće projekat
- `dotnet test` - Pokreće testove
- `dotnet add package` - Dodaje NuGet paket
- `dotnet restore` - Restoruje zavisnosti



## Dodatni resursi

- [Zvanična .NET dokumentacija](https://docs.microsoft.com/dotnet/)
- [.NET Core Tutorial](https://dotnet.microsoft.com/learn)
- [C# Programming Guide](https://docs.microsoft.com/dotnet/csharp/programming-guide/)