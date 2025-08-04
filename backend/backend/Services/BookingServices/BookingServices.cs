using backend.Data;
using backend.Enum;
using backend.Interface.BookingInterface;
using backend.Interface.VnpayInterface;
using backend.Model.Booking;
using backend.Model.Price;
using backend.Model.Product;
using backend.ModelDTO.Customer.OrderRequest;
using backend.ModelDTO.Customer.OrderRespond;
using backend.ModelDTO.GenericRespond;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Http; // Ensure this namespace is present

namespace backend.Services.BookingServices
{
    public class BookingServices : IBookingServices
    {
        private readonly DataContext _dataContext;
        private readonly IVnpayService _vnpayService; // Renamed for convention

        public BookingServices(DataContext dataContext, IVnpayService vnpayService)
        {
            _dataContext = dataContext;
            _vnpayService = vnpayService; 
        }

        public async Task<GenericRespondWithObjectDTO<OrderRespondDTO>> booking(OrderRequestDTO orderRequestDTO, HttpContext httpContext)
        {
            // Phần Booking vé
            if (String.IsNullOrEmpty(orderRequestDTO.movieScheduleId))
            {
                return new GenericRespondWithObjectDTO<OrderRespondDTO>()
                {
                    Status = GenericStatusEnum.Failure.ToString(),
                    message = "Lỗi lịch chiếu đã bị xóa"
                };
            }

            if (_dataContext.movieSchedule.Any(x => x.movieScheduleId.Equals
                    (orderRequestDTO.movieScheduleId) && x.IsDelete))
            {
                return new GenericRespondWithObjectDTO<OrderRespondDTO>()
                {
                    Status = GenericStatusEnum.Failure.ToString(),
                    message = "Lỗi không tìm thấy lịch chiếu"
                };
            }

            var getData =
                await _dataContext.Customers.FirstOrDefaultAsync(x => x.userID.Equals(orderRequestDTO.userId));
            if (getData == null)
            {
                return new GenericRespondWithObjectDTO<OrderRespondDTO>()
                {
                    Status = GenericStatusEnum.Failure.ToString(),
                    message = "Khong Tim Thay Nguoi Dung"
                };
            }
            
            var Schedules = await _dataContext.movieSchedule.FirstOrDefaultAsync(x => x.movieScheduleId.Equals(orderRequestDTO.movieScheduleId));
    
            bool checkSeats = false;
            if (Schedules != null)
            {
                var selectCinemaRoomID = Schedules.cinemaRoomId;
        
                // **CRITICAL FIX HERE:** Materialize the seats list using ToListAsync()
                var getSeatsListsInRoom = await _dataContext.Seats
                    .Where(x => x.cinemaRoomId.Equals(selectCinemaRoomID)).ToListAsync(); // <--- This closes the DataReader
        
                // Improved logic for checking if selected seats belong to the room
                // Assuming orderRequestDTO.userTypeRequestDTO contains selected seats:
                var selectedSeatIdsInRequest = orderRequestDTO.userTypeRequestDTO
                    .SelectMany(x => x.SeatsList)
                    .Select(s => s.seatID)
                    .ToHashSet(); // Using HashSet for efficient lookups

                // Check if all selected seats exist in the room's seats
                checkSeats = selectedSeatIdsInRequest.All(seatId => 
                    getSeatsListsInRoom.Any(s => s.seatsId.Equals(seatId)));
            }

            if (!checkSeats)
            {
                return new GenericRespondWithObjectDTO<OrderRespondDTO>()
                {
                    Status = GenericStatusEnum.Failure.ToString(),
                    message = "Loi , Ghe Khong Thuoc Ve Phong"
                };
            }

            if (!orderRequestDTO.userTypeRequestDTO.Any())
            {
                return new GenericRespondWithObjectDTO<OrderRespondDTO>()
                {
                    Status = GenericStatusEnum.Failure.ToString(),
                    message = "Loi Chưa có chọn thể loại người dùng"
                };
            }

            if (orderRequestDTO.userTypeRequestDTO.Any(x => !x.SeatsList.Any()))
            {
                return new GenericRespondWithObjectDTO<OrderRespondDTO>()
                {
                    Status = GenericStatusEnum.Failure.ToString(),
                    message = "Ban Chua Chon Ghe"
                };
            }
            
            // Tien Hanh Lay data
            var getMovieScheduleData = _dataContext.movieSchedule
                .FirstOrDefault(x => x.movieScheduleId == orderRequestDTO.movieScheduleId && !x.IsDelete);
            if (getMovieScheduleData == null)
            {
                return new GenericRespondWithObjectDTO<OrderRespondDTO>()
                {
                    Status = GenericStatusEnum.Failure.ToString(),
                    message = "Khong Tim Thay Lich Chieu"
                };
            }

            var selectMovieVisualFormat = getMovieScheduleData.movieVisualFormatID;
            if (String.IsNullOrEmpty(selectMovieVisualFormat))
            {
                return new GenericRespondWithObjectDTO<OrderRespondDTO>()
                {
                    Status = GenericStatusEnum.Failure.ToString(),
                    message = "Khong Tim Thay Dinh Dang Hinh Anh"
                };
            }
            
            // Bắt lôix
            if(orderRequestDTO.userTypeRequestDTO.Any(x => x.quantity > x.SeatsList.Count))
            {
                return new GenericRespondWithObjectDTO<OrderRespondDTO>()
                {
                    Status = GenericStatusEnum.Failure.ToString(),
                    message = "Ban Dat Thiếu Ghe Roi"
                };
            }
            
            if(orderRequestDTO.userTypeRequestDTO.Any(x => x.quantity < x.SeatsList.Count))
            {
                return new GenericRespondWithObjectDTO<OrderRespondDTO>()
                {
                    Status = GenericStatusEnum.Failure.ToString(),
                    message = "Ban Dat Du Ghe Roi"
                };
            }

            var checkValidSeats = true;
            foreach (var seat in orderRequestDTO.userTypeRequestDTO.Select(x => x.SeatsList.Select(x => x.seatID)))
            {
                foreach (var seatId in seat)
                {
                    var getInfo = _dataContext.Seats.Any(x => x.seatsId.Equals(seatId) && (x.isDelete || x.isTaken ));
                    if (getInfo)
                    {
                        checkValidSeats = false;
                    }
                }
            }

            if (!checkValidSeats)
            {
                return new GenericRespondWithObjectDTO<OrderRespondDTO>()
                {
                    Status = GenericStatusEnum.Failure.ToString(),
                    message = "Ghế Không tồn tại rồi baạn ơi"
                };
            }
            
            // Chon ra nhung the loai nguoi dung kem gia
            var ToDictionayDataPriceWithUserType
                = _dataContext.priceInformationForEachUserFilmType
                    .Where(x => x.movieVisualFormatId.Equals(selectMovieVisualFormat)
                    && orderRequestDTO.userTypeRequestDTO
                        .Select(x => x.userTypeID)
                        .Contains(x.userTypeId)).ToDictionary(x => 
                        x.userTypeId , x => x.priceInformationID);
            if (!ToDictionayDataPriceWithUserType.Any())
            {
                return new GenericRespondWithObjectDTO<OrderRespondDTO>()
                {
                    Status = GenericStatusEnum.Failure.ToString(),
                    message = "Loi Khong Tim Thay Gia"
                };
            }
            
            Dictionary<string , long> PriceForUserType = new Dictionary<string , long>();
            var selectedPriceForEachUserType = _dataContext.priceInformation.ToList();
            foreach (var getSelectedPrice in selectedPriceForEachUserType)
            {
                foreach (var getKey in ToDictionayDataPriceWithUserType)
                {
                    if (getKey.Value == getSelectedPrice.priceInformationId)
                    {
                        PriceForUserType.Add(getKey.Key, getSelectedPrice.priceAmount);
                    }
                }
            }
            
            // Tiep Tuc Cong Tru

            long TotalAmount = 0;

            foreach (var userTypeId in orderRequestDTO.userTypeRequestDTO)
            {
                if (PriceForUserType.TryGetValue(userTypeId.userTypeID , out long price))
                {
                    TotalAmount += price * userTypeId.quantity;
                }
            }

            
            if (orderRequestDTO.foodRequestDTOs.Any())
            {
                var getFoodInfo = await _dataContext.foodInformation.ToDictionaryAsync(x => x.foodInformationId , x => x.foodPrice);
                if (!getFoodInfo.Any())
                {
                    return new GenericRespondWithObjectDTO<OrderRespondDTO>()                    {
                        Status = GenericStatusEnum.Failure.ToString(),
                        message = "Lay Data Product That Bai"
                    };
                }

                foreach (var tryGetFoodInfo in orderRequestDTO.foodRequestDTOs)
                {
                    if (getFoodInfo.TryGetValue(tryGetFoodInfo.foodID, out long price))
                    {
                        TotalAmount += price * tryGetFoodInfo.quantity;
                    }
                }
            }
            
            using var Transaction = await _dataContext.Database.BeginTransactionAsync();
            try
            {
                // Tien Hanh Them Vao Database Va Cap Nhat
                // Thu Nhat Them Vao Bang order
                var generateOrderId = Guid.NewGuid().ToString();
                await _dataContext.Order.AddAsync(new Order()
                {
                    orderId = generateOrderId,
                    customerID = getData.Id,
                    PaymentStatus = PaymentStatus.Pending.ToString(),
                    totalAmount = TotalAmount ,
                    paymentRequestCreatedDate = DateTime.Now
                });
                
                // Sau Do Tien Hanh Update Database

                var ListFood = new List<orderDetailFood>();
                if (orderRequestDTO.foodRequestDTOs.Any())
                {
                    foreach (var foodItems in orderRequestDTO.foodRequestDTOs)
                    {
                        ListFood.Add(new orderDetailFood()
                        {
                            orderId = generateOrderId,
                            foodInformationId = foodItems.foodID,
                            quanlity = foodItems.quantity,
                            PriceEach = _dataContext.foodInformation
                                .FirstOrDefault(x => x.foodInformationId.Equals(
                                    foodItems.foodID))!.foodPrice
                        });
                    }
                }

                var ListTickets = new List<orderDetailTicket>();
                var SeatsLists = new List<string>();

                foreach (var getUserType in orderRequestDTO.userTypeRequestDTO)
                {
                    foreach (var getSeats in getUserType.SeatsList)
                    {
                        ListTickets.Add(new orderDetailTicket()
                        {
                            seatsId = getSeats.seatID,
                            orderId = generateOrderId,
                            movieScheduleID = orderRequestDTO.movieScheduleId,
                            PriceEach = 
                                _dataContext.priceInformationForEachUserFilmType.FirstOrDefault
                                    (x => x.userTypeId.Equals(getUserType.userTypeID) &&
                                          x.movieVisualFormatId.Equals(Schedules.movieVisualFormatID)).PriceInformation.priceAmount
                        });
                        SeatsLists.Add(getSeats.seatID);
                    }
                }
                
                // Tien Hanh Set Trang Thai Ghe
                
                var getSeatsListsInDB =  
                    _dataContext.Seats.Where(x => SeatsLists.Contains(x.seatsId)).ToList();
                foreach (var setSeats in getSeatsListsInDB)
                {
                    setSeats.isTaken = true;
                }
                // Tien Hanh Luu
                if (orderRequestDTO.foodRequestDTOs.Any())
                {
                    await _dataContext.FoodOrderDetail.AddRangeAsync(ListFood);
                }
                await _dataContext.TicketOrderDetail.AddRangeAsync(ListTickets);
                _dataContext.Seats.UpdateRange(getSeatsListsInDB);
                await _dataContext.SaveChangesAsync();
                await Transaction.CommitAsync();

                var generateVnpayUrl = _vnpayService
                    .createURL(TotalAmount, generateOrderId, httpContext);

                var findMovieId = await _dataContext.movieSchedule
                    .Include(movieSchedule => movieSchedule.movieVisualFormat)
                    .FirstOrDefaultAsync(x => x.movieScheduleId.Equals(orderRequestDTO.movieScheduleId));
                if (findMovieId != null)
                {
                    var findRoomInfo = findMovieId.cinemaRoomId;
                    var getMovieInfo =  
                        await _dataContext.movieInformation
                            .FirstOrDefaultAsync(x => x.movieId.Equals(findMovieId.movieId));
                    var selectCinemaInfo =
                        await _dataContext.cinemaRoom.Include(cinemaRoom => cinemaRoom.Cinema).FirstOrDefaultAsync(x => x.cinemaRoomId.Equals(findRoomInfo));
                    if (selectCinemaInfo != null && getMovieInfo != null)
                    {
                        var cinemaLocation =
                            selectCinemaInfo.Cinema.cinemaLocation;
                        var roomNumber = selectCinemaInfo.cinemaRoomNumber;
                        var movieName =
                            getMovieInfo.movieName;
                        var getShowedDate =
                            findMovieId.ScheduleDate;
                        var getVisualInfo =
                            findMovieId.movieVisualFormat.movieVisualFormatName;
                        
                        // Tieeps tuc Tiem Kiem Thong tin UserType (Có sẵn trong DTO)
                        List<OrderRespondUserTypeInfo> orderRespondUserType = new List<OrderRespondUserTypeInfo>();
                        foreach (var userType in orderRequestDTO.userTypeRequestDTO)
                        {
                            long getPrice = 0;
                            var PricesInfo = _dataContext.priceInformationForEachUserFilmType
                                .FirstOrDefault(x => x.userTypeId == userType.userTypeID && x.movieVisualFormatId
                                    .Equals(findMovieId.movieVisualFormatID))!.PriceInformation
                                .priceAmount;
                            getPrice += PricesInfo * userType.quantity;
                            orderRespondUserType.Add(new OrderRespondUserTypeInfo()
                            {
                                UserType = _dataContext.userType.FirstOrDefault(x
                                => x.userTypeId.Equals(userType.userTypeID)).userTypeDescription ,
                                SeatsNumber = String.Join("," , 
                                    _dataContext.Seats.Where(x => userType.SeatsList.Select(x => x.seatID).Contains(x.seatsId)).Select(x => x.seatsNumber)) ,
                                PriceTicket = getPrice
                            });
                        }

                        OrderRespondUserTypeWithPrices orderRespondUserTypeWithPrices =
                            new OrderRespondUserTypeWithPrices()
                            {
                                OrderRespondUserTypeInfos = orderRespondUserType ,
                                TotalPriceTicket = orderRespondUserType.Sum(x => x.PriceTicket)
                            };
                        
                        List<OrderRespondProductsInfo> orderRespondProducts = new List<OrderRespondProductsInfo>();
                        if (orderRequestDTO.foodRequestDTOs.Any())
                        {
                            foreach (var foodRequestInfo in orderRequestDTO.foodRequestDTOs)
                            {
                                var findFoodInfo =
                                    _dataContext.foodInformation.FirstOrDefault(x => x.foodInformationId.Equals(foodRequestInfo.foodID));
                                if (findFoodInfo != null)
                                {
                                    var foodName =
                                        findFoodInfo.foodInformationName;
                                    var foodPrice =
                                        findFoodInfo.foodPrice;
                                    orderRespondProducts.Add(new OrderRespondProductsInfo()
                                    {
                                        ProductName = foodName,
                                        productSinglePrice = foodPrice,
                                        productTotalAmount = foodPrice * foodRequestInfo.quantity,
                                        Quantity = foodRequestInfo.quantity
                                    });
                                    // Tinh toan
                                }
                            }

                            OrderRespondProductsInfoWithTotalPrice orderRespondProductsInfoWithTotalPrice
                                = new OrderRespondProductsInfoWithTotalPrice()
                                {
                                    OrderRespondProductsInfos = orderRespondProducts,
                                    TotalPrice = orderRespondProducts.Sum(x => x.productTotalAmount)
                                };
                            
                            return new GenericRespondWithObjectDTO<OrderRespondDTO>()
                            {
                                Status = GenericStatusEnum.Success.ToString(),
                                message = "Thông tin checkOut Order" ,
                                data = new OrderRespondDTO()
                                {
                                    VnpayInfo  = new Dictionary<string, string>()
                                    {
                                        {"VnpayURL" , generateVnpayUrl}
                                    },
                                    OrderRespondDtoInfo = new OrderRespondDTOInfo()
                                    {
                                        MovieName = movieName ,
                                        CinemaLocation = cinemaLocation ,
                                        RoomNumber = roomNumber.ToString() ,
                                        ShowedDate = getShowedDate ,
                                        VisualFormat = getVisualInfo,
                                        OrderRespondUserTypeWithPrices = orderRespondUserTypeWithPrices ,
                                        OrderRespondProductsInfoWithTotalPrice = orderRespondProductsInfoWithTotalPrice ,
                                        TotalPrice = orderRespondUserTypeWithPrices.TotalPriceTicket + orderRespondProductsInfoWithTotalPrice.TotalPrice
                                    }
                                }
                            };
                        }
                        
                        return new GenericRespondWithObjectDTO<OrderRespondDTO>()
                        {
                            Status = GenericStatusEnum.Success.ToString(),
                            message = "Thông tin checkout Order" ,
                            data = new OrderRespondDTO()
                            {
                                VnpayInfo  = new Dictionary<string, string>()
                                {
                                    {"VnpayURL" , generateVnpayUrl}
                                },
                                OrderRespondDtoInfo = new OrderRespondDTOInfo()
                                {
                                    MovieName = movieName ,
                                    CinemaLocation = cinemaLocation ,
                                    RoomNumber = roomNumber.ToString() ,
                                    ShowedDate = getShowedDate ,
                                    VisualFormat = getVisualInfo,
                                    OrderRespondUserTypeWithPrices = orderRespondUserTypeWithPrices ,
                                    TotalPrice = orderRespondUserTypeWithPrices.TotalPriceTicket 
                                }
                            }
                        };
                    }

                    return new GenericRespondWithObjectDTO<OrderRespondDTO>()
                    {
                        Status = GenericStatusEnum.Failure.ToString(),
                        message = "Khng tìm thấy thông tin rạp hoặc thông tin phim"
                    };
                }
                return new GenericRespondWithObjectDTO<OrderRespondDTO>()
                {
                    Status = GenericStatusEnum.Failure.ToString(),
                    message = "Không tìm thấy thông tin Lịch chiếu"
                };
                
            }
            catch (Exception e)
            {
                await Transaction.RollbackAsync();
                return new GenericRespondWithObjectDTO<OrderRespondDTO>()
                {
                    Status = GenericStatusEnum.Failure.ToString(),
                    message = "Loi Databases"
                };
            }
        }
    }
}