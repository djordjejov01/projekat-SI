using Backend.Models.Dto;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System;
using System.Security.Cryptography;
using System.Text;
using System.Linq;

namespace Backend.Models
{
    public class UserService : IUserService
    {
        private readonly AppDbContext _context;

        public UserService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<UserDto> RegisterAsync(RegisterDto registerDto)
        {
            // Provera jacine lozinke
            if (!IsPasswordStrong(registerDto.Password))
                throw new Exception("Lozinka mora imati najmanje 8 karaktera, jedno veliko slovo, jedno malo slovo, jedan broj i jedan specijalni karakter.");

            // Proverava da li vec postoji korisnik sa tim Email ili UserName
            if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email || u.Username == registerDto.Username))
            {
                throw new Exception("Korisnik sa datim emailom ili korisničkim imenom već postoji.");
            }

            // Hashuje lozinku
            string hashedPassword = HashPassword(registerDto.Password);

            // Dodeljuje ulogu (na osnovu registerDto.Role)
            UserRole role;
            if (!Enum.TryParse(registerDto.Role, true, out role))
            {
                role = UserRole.Guest; // fallback
            }

            //Postavlja isActive(Dobavljac: false, Organizator/Admin: true)
            bool isActive = (role == UserRole.Supplier) ? false : true;

            // Upisuje korisnika u bazu
            var user = new User
            {
                Username = registerDto.Username,
                Email = registerDto.Email,
                Password = hashedPassword,
                FirstName = "",
                LastName = "",
                Role = role,
                IsActive = isActive
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            //Mapiraj User -> UserDto i vrati rezultat
            var userDto = new UserDto
            {
                UserId = user.UserId,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role.ToString(),
                IsActive = user.IsActive
            };
            return userDto;
        }
        private bool IsPasswordStrong(string password)
        {
            if (string.IsNullOrEmpty(password) || password.Length < 8)
                return false;
            if (!password.Any(char.IsUpper))
                return false;
            if (!password.Any(char.IsLower))
                return false;
            if (!password.Any(char.IsDigit))
                return false;
            if (!password.Any(ch => "!@#$%^&*-_+=./?".Contains(ch)))
                return false;
            return true;
        }

        // Pomocna metoda za hešovanje lozinke (SHA256)
        private string HashPassword(string password)
        {
            using (var sha256 = System.Security.Cryptography.SHA256.Create())
            {
                var bytes = System.Text.Encoding.UTF8.GetBytes(password);
                var hash = sha256.ComputeHash(bytes);
                return Convert.ToBase64String(hash);
            }
        }

        public async Task<UserDto> LoginAsync(LoginDto loginDto)
        {
            //trazi korisnika po email
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginDto.Email);
            if (user == null)
            {
                throw new Exception("Korisnik sa datim emailom ne postoji.");
            }

            //provera lozinke(uporedi hash)
            string hashedInputPassword = HashPassword(loginDto.Password);
            if (user.Password != hashedInputPassword)
            {
                throw new Exception("Pogrešna lozinka.");
            }

            //Proveri IsActive (Dobavljac mora biti odobren)
            if (user.Role == UserRole.Supplier && !user.IsActive)
            {
                throw new Exception("Dobavljač još nije odobren od strane admina.");
            }

            //Mapiraj User -> UserDto i vrati rezultat
            var userDto = new UserDto
            {
                UserId = user.UserId,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role.ToString(),
                IsActive = user.IsActive
            };
            return userDto;
        }

        public async Task<bool> ApproveSupplierAsync(int userId)
        {
            // Pronadji korisnika po ID-u
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null)
            {
                throw new Exception("Korisnik nije pronađen.");
            }

            // Proveri da li je dobavljac
            if (user.Role != UserRole.Supplier)
            {
                throw new Exception("Korisnik nije dobavljač.");
            }

            // Proveri da li je vec aktivan
            if (user.IsActive)
            {
                throw new Exception("Dobavljač je već odobren.");
            }

            // Setuj IsActive = true
            user.IsActive = true;
            await _context.SaveChangesAsync();
            return true;
        }
    }
} 