using backend.Data;
using backend.Enum;
using backend.Interface.RevenueInterface;
using backend.Migrations;
using backend.ModelDTO.GenericRespond;
using backend.ModelDTO.RevenueDTO;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.RevenueServices;

public class RevenueService : IRevenueService
{
    private readonly DataContext _context;

    public RevenueService(DataContext context)
    {
        _context = context;
    }
    public async Task<GenericRespondWithObjectDTO<List<GetRevenueList>>> GetAllRevenue()
    {
        var allCinemasWithRevenue = await _context.Cinema
            .Select(c => new
            {
                Cinema = c,
                TotalRevenueAmount = _context.TicketOrderDetail
                    .Where(tod => tod.movieSchedule.cinemaRoom.cinemaId == c.cinemaId &&
                                  tod.Order.PaymentStatus.Equals(PaymentStatus.PaymentSuccess.ToString()))
                    .Sum(tod => tod.Order.totalAmount)
            })
            .Select(result => new GetRevenueList
            {
                BaseCinemaInfoRevenue = new BaseCinemaInfoRevenue()
                {
                    CinemaId = result.Cinema.cinemaId,
                    CinemaName = result.Cinema.cinemaName
                },
                TotalRevenue = result.TotalRevenueAmount
            })
            .ToListAsync();
        if (!allCinemasWithRevenue.Any())
        {
            return new GenericRespondWithObjectDTO<List<GetRevenueList>>()
            {
                Status = GenericStatusEnum.Success.ToString(),
                message = "Không có thông tin rạp nào trong hệ thống.",
                data = new List<GetRevenueList>()
            };
        }

        return new GenericRespondWithObjectDTO<List<GetRevenueList>>()
        {
            Status = GenericStatusEnum.Success.ToString(),
            message = "Thông tin doanh thu của tất cả các rạp",
            data = allCinemasWithRevenue
        };
    }

    public async Task<GenericRespondWithObjectDTO<GetRevenueInfoByCinemaIdDTO>> GetRevenueByCinemaId(string cinemaId)
    {
        // Tiến hành tìm kiếm doanh thu bởi ID rạp
        // Trước tiên truy vấn trong OrderDetailTicket
        if (String.IsNullOrEmpty(cinemaId))
        {
            return new GenericRespondWithObjectDTO<GetRevenueInfoByCinemaIdDTO>()
            {
                Status = GenericStatusEnum.Failure.ToString(),
                message = "Bạn Chưa Có Đưa CinemaID"
            };
        }

        var selectOrderId =
            _context.TicketOrderDetail
                .Where(x =>
                    x.movieSchedule.cinemaRoom.cinemaId.Equals(cinemaId))
                .Select(x => x.orderId)
                .Distinct();
        
        // Tieeps tuc tìm kiếm doanh thu
        
        var findOrderInfo = await 
            _context.Order
                .Where
                (x => selectOrderId.Contains(x.orderId)
                      && x.PaymentStatus.Equals(PaymentStatus.PaymentSuccess.ToString()))
                .GroupBy(x => x.paymentRequestCreatedDate)
                .Select(x => new BaseRevenueInfo()
                {
                    Date = x.Key ,
                    TotalAmount = x.Sum(y => y.totalAmount)
                }).ToListAsync();
        return new GenericRespondWithObjectDTO<GetRevenueInfoByCinemaIdDTO>()
        {
            Status = GenericStatusEnum.Success.ToString(),
            message = $"Thông tin doanh thu của rạp {cinemaId}" ,
            data = new GetRevenueInfoByCinemaIdDTO()
            {
                BaseCinemaInfoRevenue = new BaseCinemaInfoRevenue()
                {
                    CinemaId = cinemaId,
                    CinemaName = _context.Cinema.FirstOrDefault(x => x.cinemaId.Equals(cinemaId))?.cinemaName,
                }
                , BaseRevenueInfo = findOrderInfo
            }
        };

    }
}