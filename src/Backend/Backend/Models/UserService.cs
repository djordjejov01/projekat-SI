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
            
        }

        public async Task<bool> ApproveSupplierAsync(int userId)
        {
            
        }
    }
} 