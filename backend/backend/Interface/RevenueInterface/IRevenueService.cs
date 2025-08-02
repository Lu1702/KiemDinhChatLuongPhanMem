using backend.ModelDTO.GenericRespond;
using backend.ModelDTO.RevenueDTO;

namespace backend.Interface.RevenueInterface;

public interface IRevenueService
{
    Task<GenericRespondWithObjectDTO<List<GetRevenueList>>> GetAllRevenue();

    Task<GenericRespondWithObjectDTO<GetRevenueInfoByCinemaIdDTO>> GetRevenueByCinemaId(string cinemaId);
}