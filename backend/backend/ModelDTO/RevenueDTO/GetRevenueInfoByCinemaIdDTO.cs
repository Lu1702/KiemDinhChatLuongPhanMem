namespace backend.ModelDTO.RevenueDTO;

public class GetRevenueInfoByCinemaIdDTO
{
    public BaseCinemaInfoRevenue BaseCinemaInfoRevenue { get; set; } = null!;
    public List<BaseRevenueInfo> BaseRevenueInfo { get; set; } = new List<BaseRevenueInfo>();

}
