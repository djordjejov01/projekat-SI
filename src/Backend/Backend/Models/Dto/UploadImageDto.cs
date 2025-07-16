namespace Backend.Models.Dto
{
    public class UploadImageDto
    {
        public IFormFile Image { get; set; }
        public int OrganizerId { get; set; }

    }
}
