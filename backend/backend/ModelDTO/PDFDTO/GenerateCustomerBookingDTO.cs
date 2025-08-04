using backend.ModelDTO.Customer.OrderRespond;

namespace backend.ModelDTO.PDFDTO;

public class GenerateCustomerBookingDTO
{
    public string CustomerEmail { get; set; } = string.Empty;
    
    public DateTime BookingDate { get; set; }

    public GenerateCustomerBookingTicketInfo BookingInfo { get; set; } = null!;

}

public class GenerateCustomerBookingTicketInfo
{
    public string MovieName { get; set; } = string.Empty;

    public string CinemaLocation { get; set; } = string.Empty;

    public int RoomNumber { get; set; } 

    public string VisualFormat { get; set; } = string.Empty;

    public DateTime ShowedDate { get; set; }
    
    public List<GenerateCustomerBookingTicketSeatsInfo> Seats { get; set; } = new List<GenerateCustomerBookingTicketSeatsInfo>();

    public List<GenerateCustomerBookingProductsInfo> Products { get; set; } = new
        List<GenerateCustomerBookingProductsInfo>();
    
    public decimal TotalPrice { get; set; }

}

public class GenerateCustomerBookingTicketSeatsInfo
{
    public string SeatsNumber { get; set; } = string.Empty;
    
    public decimal PriceEachSeat { get; set; }
}

public class GenerateCustomerBookingProductsInfo
{
    public string ProductName { get; set; } = string.Empty;

    public int Quality { get; set; }
    
    public decimal PriceEachProduct { get; set; }
}