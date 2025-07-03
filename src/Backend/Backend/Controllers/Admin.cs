/*using Backend.Models;
using Backend.Models.Dto;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]

    public class Admin : ControllerBase
    {
        private readonly IUserService _userService;

        [HttpGet]
        public List<UserDto> GetAllUsers()
        {
            return new List<UserDto>();
        }
        [HttpGet]
        public List<UserDto> GetAllUsersByRole(UserRole role)
        {

            return new List<UserDto>();
        }
        [HttpGet]
        public List<UserDto> GetNUsersStartingFromKthId(int n, int k)
        {
            return new List<UserDto>();
        }
        [HttpGet]
        public List<UserDto> GetDormandtUsers()
        {
            return new List<UserDto>();
        }
        //[HttpGet]
        //public List
    }
}*/
