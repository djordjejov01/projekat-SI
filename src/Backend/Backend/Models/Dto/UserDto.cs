using System.Text.Json.Serialization;

namespace Backend.Models.Dto
{
    public class UserDto
    {
        public int UserId { get; set; }
        public string Username { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }

        [JsonConverter(typeof(JsonStringEnumConverter))]
        public UserRole Role { get; set; }
        public bool IsActive { get; set; }
    }
}
