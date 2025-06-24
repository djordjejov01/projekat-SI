using Backend.Models.Dto;
using System.Threading.Tasks;

namespace Backend.Models
{
    public interface IUserService
    {
        Task<UserDto> RegisterAsync(RegisterDto registerDto);
        Task<UserDto> LoginAsync(LoginDto loginDto);
        Task<bool> ApproveSupplierAsync(int userId); // samo admin koristi
    }
} 