using backend.Data;
using backend.Enum;
using backend.Interface.BookingInterface;
using backend.Interface.VnpayInterface;
using backend.Model.Booking;
using backend.ModelDTO.BookingsDTO;
using backend.ModelDTO.GenericRespond;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.BookingServices;

public class StaffOrderService : IStaffOrderService
{
    private readonly DataContext _context;

    private readonly IVnpayService _vnpayService;

    public StaffOrderService(DataContext context , IVnpayService vnpayService)
    {
        _context = context;
        
        _vnpayService = vnpayService;
    }
    
    public async Task<GenericRespondWithObjectDTO<Dictionary<string , string>>> StaffOrder(string UserId, 
        StaffOrderRequestDTO request ,
        HttpContext context)
    {
        // Kiem Tra Validate
        if (String.IsNullOrEmpty(UserId))
        {
            return new GenericRespondWithObjectDTO<Dictionary<string , string>>
            {
                Status = GenericStatusEnum.Failure.ToString(),
                message = "Staff Id Bi Trong"
            };
        }

        if (String.IsNullOrEmpty(request.CustomerEmail))
        {
            return new GenericRespondWithObjectDTO<Dictionary<string , string>>
            {
                Status = GenericStatusEnum.Failure.ToString(),
                message = "Email Khach Hang Khong Duoc De Trong"
            };
        }

        if (!request.orderRequestItems.Any())
        {
            return new GenericRespondWithObjectDTO<Dictionary<string , string>>
            {
                Status = GenericStatusEnum.Failure.ToString(),
                message = "Danh Sach Order Dang Bi Trong"
            };
        }

        if (request.orderRequestItems.Any(x => x.Quanlity == 0))
        {
            return new GenericRespondWithObjectDTO<Dictionary<string, string>>
            {
                Status = GenericStatusEnum.Failure.ToString(),
                message = "Số lượng không thể bằng 0 được"
            };
        }
        
        // Kiem Tra Validate id co ton tai hay ko 
        // Check Validate StaffId coi co ton tai hay khong
        var checkStaff = await _context.Staff.FirstOrDefaultAsync(x => x.userID.Equals(UserId));
        if (checkStaff == null)
        {
            return new GenericRespondWithObjectDTO<Dictionary<string , string>>
            {
                Status = GenericStatusEnum.Failure.ToString(),
                message = "Khong Tim Thay Nhan Vien"
            };
        }
        
        // Tiep Tuc Truy Van Toi Bang Food De Lay Gia
        var getFoodInfo = await _context.foodInformation.ToDictionaryAsync(x => x.foodInformationId , x => x.foodPrice);
        if (!getFoodInfo.Any())
        {
            return new GenericRespondWithObjectDTO<Dictionary<string , string>>
            {
                Status = GenericStatusEnum.Failure.ToString(),
                message = "Lay Data Product That Bai"
            };
        }

        long TotalAmount = 0;
        foreach (var tryGetFoodInfo in request.orderRequestItems)
        {
            if (getFoodInfo.TryGetValue(tryGetFoodInfo.ProductId, out long price))
            {
                TotalAmount += price * tryGetFoodInfo.Quanlity;
            }
        }
         
        await using var Transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            List<StaffOrderDetailFood> staffOrderDetailFoods = new List<StaffOrderDetailFood>();
            // Luu Data vao trong Database
            // Truoc Het luu vao bang Staff truoc
            var generateOrderId = Guid.NewGuid().ToString();
            // Luu vao bang StaffOrder truoc
            var getStaffOrder = new StaffOrder()
            {
                StaffID = checkStaff.Id,
                CustomerName = request.CustomerEmail,
                orderId = generateOrderId,
                paymentMethod = "Vnpay",
                paymentRequestCreatedDate = DateTime.Now,
                PaymentStatus = PaymentStatus.Pending.ToString(),
                totalAmount = TotalAmount
            };
            await _context.StaffOrder.AddAsync(getStaffOrder);
            foreach (var item in request.orderRequestItems)
            {
                staffOrderDetailFoods.Add(new StaffOrderDetailFood()
                {
                    orderId = generateOrderId,
                    foodInformationId = item.ProductId,
                    quanlity = item.Quanlity
                });
            }

            await _context.StaffOrderDetailFoods.AddRangeAsync(staffOrderDetailFoods);

            string url = _vnpayService.createURL(TotalAmount, generateOrderId, context);

            await _context.SaveChangesAsync();

            await Transaction.CommitAsync();

            return new GenericRespondWithObjectDTO<Dictionary<string, string>>()
            {
                Status = GenericStatusEnum.Success.ToString(),
                message = "Ghi nhan Thanh Cong",
                data = new Dictionary<string, string>()
                {
                    {"TotalAmount", TotalAmount.ToString()},
                    {"VnpayURL" , url} 
                }
            };
        }
        catch (Exception ex)
        {
            return new GenericRespondWithObjectDTO<Dictionary<string, string>>()
            {
                Status = GenericStatusEnum.Failure.ToString(),
                message = "Loi Database"
            };
        }
    }

}