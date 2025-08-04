using backend.ModelDTO.BookingsDTO;
using backend.ModelDTO.GenericRespond;

namespace backend.Interface.BookingInterface;

public interface IStaffOrderService
{
    Task<GenericRespondWithObjectDTO<Dictionary<string, string>>> StaffOrder(string UserId,
        StaffOrderRequestDTO request,
        HttpContext context);
}