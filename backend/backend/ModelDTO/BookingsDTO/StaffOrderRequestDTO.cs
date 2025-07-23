using backend.Model.Staff_Customer;

namespace backend.ModelDTO.BookingsDTO;

public class StaffOrderRequestDTO
{
    public string CustomerEmail { get; set; } = string.Empty;
    
    public DateTime OrderDate { get; set; } 
    
    public List<StaffOrderRequestItemsDTO> orderRequestItems { get; set; } = new List<StaffOrderRequestItemsDTO>();
}

public class StaffOrderRequestItemsDTO
{
    public string ProductId { get; set; } = string.Empty;
    
    public int Quanlity {get; set;} 
}