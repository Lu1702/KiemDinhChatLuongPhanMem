namespace backend.ModelDTO.FoodDTOS;

public class FoodGetListRequestDTO
{
    public string FoodId {get;set;} = String.Empty;
    
    public string FoodName {get;set;} = String.Empty;

    public string FoodImageURL { get; set; } = string.Empty;
    
    public long FoodPrice {get;set;} 
}