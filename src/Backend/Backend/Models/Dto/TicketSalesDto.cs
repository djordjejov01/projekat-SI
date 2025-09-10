namespace Backend.Models.Dto
{
    public class TicketSalesDto
    {
        public int TicketId { get; set; }
        public string TypeName { get; set; }
        public decimal Price { get; set; }
        public int Quota { get; set; }
        public int Sold { get; set; }
        public int Unsold { get; set; }
        public decimal Revenue { get; set; }
        public List<BuyerDto> Buyers { get; set; }
    }
}
