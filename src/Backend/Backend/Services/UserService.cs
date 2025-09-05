using Backend.Helpers;
using Backend.Models;
using Backend.Models.Dto;
using Backend.Services.Email;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
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
        private readonly IEmailVerificationService _emailVerificationService;
        private readonly IStringLocalizer<SharedResource> _localizer;

        public UserService(AppDbContext context, IEmailVerificationService emailVerificationService, IStringLocalizer<SharedResource> localizer)
        {
            _context = context;
            _emailVerificationService = emailVerificationService;
            _localizer = localizer;
        }

        public async Task<UserDto> RegisterAsync(RegisterDto registerDto)
        {
            if (!CommonHelpers.IsPasswordStrong(registerDto.Password))
                throw new Exception(_localizer["user.password_policy_failed"].ToString());

            if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email))
            {
                throw new Exception(_localizer["common.email_exists"].ToString());
            }


            if (registerDto.Role != UserRole.Organizer && registerDto.Role != UserRole.Supplier && registerDto.Role!=UserRole.MobileUser)
            {
                throw new Exception(_localizer["user.role_not_allowed"].ToString());
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
            await _emailVerificationService.SendVerificationAsync(user,CancellationToken.None);
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
                IsActive = user.IsActive,
                IsEmailVerified = user.IsEmailVerified
            };
            return userDto;
        }

        public async Task<UserDto> RegisterWebAsync(RegisterWebDto registerWebDto)
        {
            if (!CommonHelpers.IsPasswordStrong(registerWebDto.Password))
                throw new Exception(_localizer["user.password_policy_failed"].ToString());

            if (await _context.Users.AnyAsync(u => u.Email == registerWebDto.Email))
                throw new Exception(_localizer["common.email_exists"].ToString());

            if (registerWebDto.Role != UserRole.Organizer && registerWebDto.Role != UserRole.Supplier)
                throw new Exception(_localizer["user.role_not_allowed"].ToString());

            

            if (await _context.Users.AnyAsync(u => u.Username == registerWebDto.Username))
                throw new Exception(_localizer["organizer.username_exists"].ToString());

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
            await _emailVerificationService.SendVerificationAsync(user, CancellationToken.None);

            if (user.Role == UserRole.Organizer)
            {
                var o = new Organizer
                {
                    Id = user.UserId,
                    Username = user.Username,
                    Email = user.Email,
                    Name = user.FirstName + " " + user.LastName,
                    PhoneNumber = "",
                    Image = "images/default-pfp.png"
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
                    Image = "images/default-pfp.png"
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
                IsActive = user.IsActive,
                IsEmailVerified = user.IsEmailVerified
            };
        }

        public async Task<UserDto> LoginAsync(LoginDto loginDto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginDto.Email);
            if (user == null)
            {
                throw new Exception(_localizer["user.not_found"].ToString());
            }

            string hashedInputPassword = CommonHelpers.HashPassword(loginDto.Password);
            if (user.Password != hashedInputPassword)
            {
                throw new Exception(_localizer["user.invalid_credentials"].ToString());
            }

            if (!user.IsEmailVerified)
            {
                throw new Exception(_localizer["user.email_not_verified"].ToString());
            }

            if (user.Role == UserRole.Supplier && !user.IsActive)
            {
                throw new Exception(_localizer["supplier.not_approved"].ToString());
            }

            if (!user.IsActive)
            {
                throw new Exception(_localizer["user.not_active"].ToString());
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
                IsActive = user.IsActive,
                IsEmailVerified = user.IsEmailVerified
            };

            return userDto;
        }

        private string GenerateBaseUsername(string firstName, string lastName)
        {
            
            string cleanFirstName = RemoveSpecialCharacters(firstName.ToLower());
            string cleanLastName = RemoveSpecialCharacters(lastName.ToLower());

            
            return $"{cleanFirstName}{cleanLastName}";
        }

        private async Task<string> GenerateUniqueUsername(string baseUsername)
        {
            string candidateUsername = baseUsername;
            int counter = 1;

            
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
