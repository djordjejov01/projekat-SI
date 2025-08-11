namespace Backend.Models.Dto
{
    public class EventResourceDto
    {
        public int? ID { get; set; }
        public int SupplierID { get; set; }
        public int EventID { get; set; }
        public int ResourceID { get; set; }
        public int Quantity { get; set; }
        public bool IsReservable { get; set; }
        public EventResourceStatus Status { get; set; }
        public DateTime? StartDateTimeBooked { get; set; }
        public DateTime? EndDateTimeBooked { get; set; }
    }

}
