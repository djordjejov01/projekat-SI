using Backend.Models.Dto;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System;
using System.Security.Cryptography;
using System.Text;
using System.Linq;
using Backend.Models;
using Backend.Helpers;

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

            if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email || u.Username == registerDto.Username))
            {
                throw new Exception("Korisnik sa datim emailom ili korisničkim imenom već postoji.");
            }

            string hashedPassword = CommonHelpers.HashPassword(registerDto.Password);

            UserRole role = registerDto.Role;
            bool isActive = role == UserRole.Supplier ? false : true;

            var user = new User
            {
                Username = registerDto.Username,
                Email = registerDto.Email,
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
                Organizer o = new Organizer
                {
                    Id = _context.Users.Where(u => u.Username == user.Username).First().UserId,
                    Username = user.Username,
                    Email = user.Email,
                    Name = user.FirstName + " " + user.LastName,
                    PhoneNumber = ""
                };
                _context.Organizers.Add(o);
                await _context.SaveChangesAsync();
            }

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

        public async Task<bool> ApproveSupplierAsync(int userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null)
            {
                throw new Exception("Korisnik nije pronađen.");
            }

            if (user.Role != UserRole.Supplier)
            {
                throw new Exception("Korisnik nije dobavljač.");
            }

            if (user.IsActive)
            {
                throw new Exception("Dobavljač je već odobren.");
            }

            user.IsActive = true;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
