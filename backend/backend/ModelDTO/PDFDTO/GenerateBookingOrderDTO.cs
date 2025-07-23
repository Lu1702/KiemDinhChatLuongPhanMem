namespace backend.ModelDTO.PDFDTO;

public class GenerateBookingOrderDTO
{
    public string CustomerName { get; set; }
    
    public string CustomerEmail { get; set; }
    
    public DateTime BookingDate { get; set; }
    
    public DateTime ShowTimeDate { get; set; }
    
    public string MovieName { get; set; }
    
    public string ShowLocation { get; set; }
    
    
}


public class OrderListGeneratePDF
{
    public string MovieName { get; set; }
    
    public string ShowLocation { get; set; }
    
    public string CinemaRoomNumber { get; set; }
    
    public string MovieVisualFormat { get; set; }
    
    public DateTime ShowDate { get; set; }
    
}