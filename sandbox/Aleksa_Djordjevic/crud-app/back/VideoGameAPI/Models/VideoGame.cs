namespace VideoGameAPI.Models
{
    public class VideoGame
    {
        public int Id { get; set; }
        public string Naziv { get; set; } = string.Empty;
        public string Opis { get; set; } = string.Empty;
        public int Godina { get; set; }
    }
}
