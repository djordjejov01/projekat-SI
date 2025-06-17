namespace backend_crud.Models
{
    public class Anime
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Type { get; set; }

        public string? Episodes { get; set; }

        public double? Score { get; set; }
    }
}
