using Backend.Helpers;
using Backend.Models;
using Backend.Models.Dto;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Backend.Services
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
            if (!CommonHelpers.IsPasswordStrong(registerDto.Password))
                throw new Exception("Lozinka mora imati najmanje 8 karaktera, jedno veliko slovo, jedno malo slovo i jedan broj.");

            if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email))
            {
                throw new Exception("Korisnik sa datim emailom već postoji.");
            }


            if (registerDto.Role != UserRole.Organizer && registerDto.Role != UserRole.Supplier && registerDto.Role!=UserRole.MobileUser)
            {
                throw new Exception("Nedozvoljena rola za javnu registraciju.");
            }


            string hashedPassword = CommonHelpers.HashPassword(registerDto.Password);

            string baseUsername = GenerateBaseUsername(registerDto.FirstName, registerDto.LastName);
            string uniqueUsername = await GenerateUniqueUsername(baseUsername);

            UserRole role = registerDto.Role;
            bool isActive = role == UserRole.Supplier ? false : true;

            var user = new User
            {
                Username = uniqueUsername,
                Email = registerDto.Email,
                Password = hashedPassword,
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName,
                Role = role,
                IsActive = isActive,
                ProfilePicture = "",
                Language = "",
                PhoneNumber = "",
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            if (user.Role == UserRole.Organizer)
            {
                Organizer o = new Organizer
                {
                    Id = _context.Users.Where(u => u.Username == user.Username).First().UserId,
                    Username = user.Username,
                    Email = user.Email,
                    Name = user.FirstName + " " + user.LastName,
                    PhoneNumber = "",
                    Image = "",
                };
                _context.Organizers.Add(o);
                await _context.SaveChangesAsync();
            }
            if (user.Role == UserRole.Supplier)
            {
                Supplier s = new Supplier
                {
                    Id = user.UserId,
                    Username = user.Username,
                    CompanyName="",
                    Email = user.Email,
                    PhoneNumber = "",
                    Website="",
                    CompanyBio="",
                    Image = "",
                };
                _context.Suppliers.Add(s);
                await _context.SaveChangesAsync();
            }

            var userDto = new UserDto
            {
                UserId = user.UserId,
                Username = user.Username,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Role = user.Role,
                IsActive = user.IsActive
            };
            return userDto;
        }

        public async Task<UserDto> RegisterWebAsync(RegisterWebDto registerWebDto)
        {
            if (!CommonHelpers.IsPasswordStrong(registerWebDto.Password))
                throw new Exception("Lozinka mora imati najmanje 8 karaktera, jedno veliko slovo, jedno malo slovo i jedan broj.");

            if (await _context.Users.AnyAsync(u => u.Email == registerWebDto.Email))
                throw new Exception("Korisnik sa datim emailom već postoji.");

            if (registerWebDto.Role != UserRole.Organizer && registerWebDto.Role != UserRole.Supplier)
                throw new Exception("Nedozvoljena rola za javnu registraciju.");

            

            if (await _context.Users.AnyAsync(u => u.Username == registerWebDto.Username))
                throw new Exception("Korisničko ime je zauzeto.");

            string hashedPassword = CommonHelpers.HashPassword(registerWebDto.Password);

            var role = registerWebDto.Role;
            bool isActive = role == UserRole.Supplier ? false : true;

            var user = new User
            {
                Username = registerWebDto.Username,
                Email = registerWebDto.Email,
                Password = hashedPassword,
                FirstName = "",
                LastName = "",
                Role = role,
                IsActive = isActive,
                ProfilePicture = "",
                Language = "",
                PhoneNumber = ""
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            if (user.Role == UserRole.Organizer)
            {
                var o = new Organizer
                {
                    Id = user.UserId,
                    Username = user.Username,
                    Email = user.Email,
                    Name = user.FirstName + " " + user.LastName,
                    PhoneNumber = "",
                    Image = ""
                };
                _context.Organizers.Add(o);
                await _context.SaveChangesAsync();
            }

            if (user.Role == UserRole.Supplier)
            {
                var s = new Supplier
                {
                    Id = user.UserId,
                    Username = user.Username,
                    CompanyName = "",
                    Email = user.Email,
                    PhoneNumber = "",
                    Website = "",
                    CompanyBio = "",
                    Image = ""
                };
                _context.Suppliers.Add(s);
                await _context.SaveChangesAsync();
            }

            return new UserDto
            {
                UserId = user.UserId,
                Username = user.Username,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Role = user.Role,
                IsActive = user.IsActive
            };
        }

        public async Task<UserDto> LoginAsync(LoginDto loginDto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginDto.Email);
            if (user == null)
            {
                throw new Exception("Korisnik sa datim emailom ne postoji.");
            }

            string hashedInputPassword = CommonHelpers.HashPassword(loginDto.Password);
            if (user.Password != hashedInputPassword)
            {
                throw new Exception("Pogrešna lozinka.");
            }

            if (user.Role == UserRole.Supplier && !user.IsActive)
            {
                throw new Exception("Dobavljač još nije odobren od strane admina.");
            }

            if (!user.IsActive)
            {
                throw new Exception("Korisnik nije aktivan.");
            }

            user.LastLoginTime = DateTime.UtcNow;
            _context.Users.Update(user);
            _context.SaveChanges();

            var userDto = new UserDto
            {
                UserId = user.UserId,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role,
                IsActive = user.IsActive
            };

            return userDto;
        }

        private string GenerateBaseUsername(string firstName, string lastName)
        {
            // Ukloni specijalne karaktere i pretvori u lowercase
            string cleanFirstName = RemoveSpecialCharacters(firstName.ToLower());
            string cleanLastName = RemoveSpecialCharacters(lastName.ToLower());

            // Generiši base username (ime + prezime)
            return $"{cleanFirstName}{cleanLastName}";
        }

        private async Task<string> GenerateUniqueUsername(string baseUsername)
        {
            string candidateUsername = baseUsername;
            int counter = 1;

            // Proverava da li username već postoji, ako da, dodaje broj
            while (await _context.Users.AnyAsync(u => u.Username == candidateUsername))
            {
                candidateUsername = $"{baseUsername}{counter}";
                counter++;
            }

            return candidateUsername;
        }

        private string RemoveSpecialCharacters(string input)
        {
            return System.Text.RegularExpressions.Regex.Replace(input, @"[^a-zA-Z0-9]", "");
        }


    }
}
