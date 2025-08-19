using Backend.Models.Dto;
using System.Threading.Tasks;

namespace Backend.Services
{
    public interface IUserService
    {
        Task<UserDto> RegisterAsync(RegisterDto registerDto);
        Task<UserDto> RegisterWebAsync(RegisterWebDto registerWebDto);
        Task<UserDto> LoginAsync(LoginDto loginDto);
        
    }
} 