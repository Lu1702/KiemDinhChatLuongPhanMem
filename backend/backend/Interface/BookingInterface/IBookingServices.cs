using backend.ModelDTO.Customer.OrderRequest;
using backend.ModelDTO.Customer.OrderRespond;
using backend.ModelDTO.GenericRespond;

namespace backend.Interface.BookingInterface
{
    public interface IBookingServices
    {
        Task<GenericRespondWithObjectDTO<OrderRespondDTO>> booking(OrderRequestDTO orderRequestDTO , HttpContext httpContext);
    }
}
