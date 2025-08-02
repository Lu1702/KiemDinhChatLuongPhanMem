namespace backend.ModelDTO.RevenueDTO;

public class GetRevenueList
{
    public BaseCinemaInfoRevenue BaseCinemaInfoRevenue { get; set; } = null!;
    
    public double TotalRevenue { get; set; }
}