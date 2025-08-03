using backend.ModelDTO.Customer.OrderRespond;

namespace backend.ModelDTO.PDFDTO;

public class GenerateStaffBookingDTO 
{
    public string StaffId { get; set; } = string.Empty;
    
    public string UserName { get; set; } = string.Empty;
    
    public string OrderDate { get; set; } = string.Empty;
    
    public List<OrderRespondProductsInfo> OrderRespondProducts { get; set; } = new List<OrderRespondProductsInfo>();
    
    public decimal TotalPriceAllProducts { get; set; }
}
