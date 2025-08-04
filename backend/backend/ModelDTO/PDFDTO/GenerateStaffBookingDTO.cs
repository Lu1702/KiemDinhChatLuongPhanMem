using backend.ModelDTO.Customer.OrderRespond;

namespace backend.ModelDTO.PDFDTO;

public class GenerateStaffBookingDTO 
{
    public string StaffId { get; set; } = string.Empty;
    
    public string UserName { get; set; } = string.Empty;
    
    public DateTime OrderDate { get; set; }
    
    public List<OrderRespondProductsInfo> OrderRespondProducts { get; set; } = new List<OrderRespondProductsInfo>();
    
    public decimal TotalPriceAllProducts { get; set; }
}
