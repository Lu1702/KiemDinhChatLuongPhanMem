using System.Data.Common;
using backend.Data;
using backend.Enum;
using backend.Interface.CinemaInterface;
using backend.Migrations;
using backend.Model.Cinemas;
using backend.ModelDTO.CinemaDTOs;
using backend.ModelDTO.GenericRespond;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace backend.Services.CinemaServices;

public class CinemaService : ICinemaService
{
    private readonly DataContext _context;

    public CinemaService(DataContext context)
    {
        _context = context;
    }
    
    public GenericRespondWithObjectDTO<List<GetCinemaDetailBookingDTO>> GetCinemaDetailBooking(string movieID , string movieVisualId)
    {
        // Truy Van De Lay Thong Tin
        var getCinemaInfo =
            _context.movieSchedule
                .Where(x => x.movieId == movieID
                && x.ScheduleDate > DateTime.Now
                && x.movieVisualFormatID.Equals(movieVisualId))
                .Include(x => x.HourSchedule)
                .Include(x => x.movieVisualFormat)
                .Include(x => x.cinemaRoom)
                    .ThenInclude(x => x.Cinema);
        if (getCinemaInfo.Any())
        {
           // Tiến hành truy vấn theo movieScheduleDate
           var getMovieScheduleDate 
               = getCinemaInfo.Select(x => x.ScheduleDate);
           var getCinemaInfoByScheduleDate = 
               getCinemaInfo
                   .GroupBy(x => x.ScheduleDate)
                   .Select(x => new GetCinemaDetailBookingDTO()
                   {
                       ScheduleDate = x.Key ,
                       CinemaBookings = x.Select
                           (y => new CinemaBookingDTO()
                           {
                               CinemaID = y.cinemaRoom.cinemaId,
                               CinemaName = y.cinemaRoom.Cinema.cinemaName,
                               CinemaLocation = y.cinemaRoom.Cinema.cinemaLocation,
                               ScheduleShowTimeWithCinemaDtos = x.Select
                                   (c => new ScheduleShowTimeWithCinemaDTO()
                                   {
                                       HourScheduleDetail = c.HourSchedule.HourScheduleShowTime ,
                                       HourScheduleID = c.HourSchedule.HourScheduleID,
                                   }).ToList()
                           }).ToList()
                   }).ToList();
           return new GenericRespondWithObjectDTO<List<GetCinemaDetailBookingDTO>>()
           {
               data = getCinemaInfoByScheduleDate,
               message = "Success",
               Status = GenericStatusEnum.Success.ToString()
           };
        }
        return new GenericRespondWithObjectDTO<List<GetCinemaDetailBookingDTO>>()
        {
            message = "Null Rồi Không có data",
            Status = GenericStatusEnum.Failure.ToString()
        };
    }

    public async Task<GenericRespondDTOs> AddCinema(CreateCinemaDTO cinema)
    {
        
        if (String.IsNullOrEmpty(cinema.CinemaName) || 
            String.IsNullOrEmpty(cinema.CinemaLocation)
            || String.IsNullOrEmpty(cinema.CinemaDescription) ||
            String.IsNullOrEmpty(cinema.CinemaContactNumber)
            )
        {
            return new GenericRespondDTOs()
            {
                Status = GenericStatusEnum.Failure.ToString(),
                message = "Nhap Thieu Thong Tin"
            };
        }
        if (_context.Cinema.Any(x => 
                                     cinema.CinemaLocation.Equals(x.cinemaLocation)))
        {
            return new GenericRespondDTOs()
            {
                Status = GenericStatusEnum.Failure.ToString(),
                message = "Địa chỉ đã tồn tại trong Database"
            };
        }else if (_context.Cinema.Any(x =>  
                                           cinema.CinemaName.Equals(x.cinemaName)))
        {
            return new GenericRespondDTOs()
            {
                Status = GenericStatusEnum.Failure.ToString(),
                message = "Tên rạp đã tồn tại trong Database"
            };
        }else if (_context.Cinema.Any(x => cinema.CinemaContactNumber.Equals(x.cinemaContactHotlineNumber)))
        {
            return new GenericRespondDTOs()
            {
                Status = GenericStatusEnum.Failure.ToString(),
                message = "Lỗi số điện thoại đã tồn tại trong Database"
            };
        }
        
        try
        {
            var newCinemaId = Guid.NewGuid().ToString();
            await _context.AddAsync(new Cinema()
            {
                cinemaName = cinema.CinemaName,
                cinemaLocation = cinema.CinemaLocation,
                cinemaDescription = cinema.CinemaDescription,
                cinemaId = newCinemaId,
                cinemaContactHotlineNumber = cinema.CinemaContactNumber
            });
            await _context.SaveChangesAsync();
           
            return new GenericRespondDTOs()
            {
                Status = GenericStatusEnum.Success.ToString(),
                message = "Thêm Thành Công"
            };
        }
        catch (Exception e)
        {
            return new GenericRespondDTOs()
            {
                Status = GenericStatusEnum.Failure.ToString(),
                message = "Lỗi DataBase"
            };
        }
    }

    public async Task<GenericRespondDTOs> EditCinema(string cinemaId, EditCinemaDTO cinema)
    {
        if (!String.IsNullOrEmpty(cinemaId))
        {
            // Chỉ được sửa thông tin rạp khi chưa có ai đặt vé 
            // Kiểm tra xem có lịch chua

            if (!cinema.CinemaLocation.IsNullOrEmpty())
            {
                if (_context.Cinema.Any(x => !x.cinemaId.Equals(cinemaId) &&
                                             cinema.CinemaLocation.Equals(x.cinemaLocation)))
                {
                    return new GenericRespondDTOs()
                    {
                        Status = GenericStatusEnum.Failure.ToString(),
                        message = "Địa chỉ đã tồn tại trong Database"
                    };
                }
            }

            if (!cinema.CinemaName.IsNullOrEmpty())
            {
                if (_context.Cinema.Any(x => !x.cinemaId.Equals(cinemaId) &&
                                                  cinema.CinemaName.Equals(x.cinemaName)))
                {
                    return new GenericRespondDTOs()
                    {
                        Status = GenericStatusEnum.Failure.ToString(),
                        message = "Tên rạp đã tồn tại trong Database"
                    };
                }
            }

            if (!cinema.CinemaContactNumber.IsNullOrEmpty())
            {
                if (_context.Cinema.Any(x => !x.cinemaId.Equals(cinemaId) &&
                                              cinema.CinemaContactNumber.Equals(x.cinemaContactHotlineNumber)))
                {
                    return new GenericRespondDTOs()
                    {
                        Status = GenericStatusEnum.Failure.ToString(),
                        message = "Lỗi số điện thoại đã tồn tại trong Database"
                    };
                }
            }
            var movieSchedule =
                _context.movieSchedule.Where(x => x.cinemaRoom.cinemaId == cinemaId && !x.IsDelete);
    
            var checkOrder = await _context.TicketOrderDetail
                .Where(x => movieSchedule.Select(x => x.movieScheduleId).Contains(x.movieScheduleID))
                .Include(x => x.Order)
                .FirstOrDefaultAsync(x => x.Order.PaymentStatus.Equals(PaymentStatus.PaymentSuccess.ToString()));
            
            if (checkOrder != null)
            {
                return new GenericRespondDTOs()
                {
                    Status = GenericStatusEnum.Failure.ToString(),
                    message = "Lỗi Đang có lịch chiếu hiện đang chiếu và đã có người đặt"
                };
            }
            
            var findCinema = _context.Cinema.FirstOrDefault(x => x.cinemaId == cinemaId);
            if (findCinema != null)
            {
                string cinemaName = String.IsNullOrEmpty(cinema.CinemaName) ? findCinema.cinemaName : cinema.CinemaName;
                string cinemaLocation = String.IsNullOrEmpty(cinema.CinemaLocation)
                    ? findCinema.cinemaLocation
                    : cinema.CinemaLocation;
                string cinemaHotLineNUmber =
                    String.IsNullOrEmpty(cinema.CinemaContactNumber)
                        ? findCinema.cinemaContactHotlineNumber
                        : cinema.CinemaContactNumber;
                string cinemaDescription =
                    String.IsNullOrEmpty(cinema.CinemaDescription)
                        ? findCinema.cinemaDescription
                        : cinema.CinemaDescription;
                findCinema.cinemaName = cinemaName;
                findCinema.cinemaLocation = cinemaLocation;
                findCinema.cinemaDescription = cinemaDescription;
                findCinema.cinemaContactHotlineNumber = cinemaHotLineNUmber;
                await using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    _context.Cinema.Update(findCinema);
                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();
                    return new GenericRespondDTOs()
                    {
                        Status = GenericStatusEnum.Success.ToString(),
                        message = "Chỉnh sửa Rạp thành công"
                    };
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                    return new GenericRespondDTOs()
                    {
                        Status = GenericStatusEnum.Failure.ToString(),
                        message = "Chỉnh sửa Rạp thất bại lỗi Database"
                    };
                }
            }

            return new GenericRespondDTOs()
            {
                Status = GenericStatusEnum.Failure.ToString(),
                message = "Lỗi Không tìm thấy Rạp"
            };
        }
        return new GenericRespondDTOs()
        {
            Status = GenericStatusEnum.Failure.ToString(),
            message = "Chưa có ID rạp"
        };
    }

    public async Task<GenericRespondDTOs> DeleteCinema(string cinemaId)
    {
        if (!String.IsNullOrEmpty(cinemaId))
        {
            // Chỉ được sửa thông tin rạp khi chưa có ai đặt vé 
            // Kiểm tra xem có lịch chua
            var movieSchedule =
                _context.movieSchedule.Where(x => x.cinemaRoom.cinemaId == cinemaId && !x.IsDelete);

            var checkOrder = await _context.TicketOrderDetail
                .Where(x => movieSchedule.Select(x => x.movieScheduleId).Contains(x.movieScheduleID))
                .Include(x => x.Order)
                .FirstOrDefaultAsync(x => x.Order.PaymentStatus.Equals(PaymentStatus.PaymentSuccess.ToString()));

            if (checkOrder != null)
            {
                return new GenericRespondDTOs()
                {
                    Status = GenericStatusEnum.Failure.ToString(),
                    message = "Lỗi Đã có người Order"
                };
            }
            
            // Tiến hành xóa các Data Liên quan
            
            var cinemaInfo = await _context.Cinema.FirstOrDefaultAsync(x => x.cinemaId == cinemaId);
            var findRoom = _context.cinemaRoom.Where(x => x.cinemaId == cinemaId);

            if (cinemaInfo != null)
            {
                await using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    cinemaInfo.isDeleted = true;
                    _context.Cinema.Update(cinemaInfo);

                    if (findRoom.Any())
                    {
                        foreach (var rooms in findRoom)
                        {
                            rooms.isDeleted = true;
                        }

                        _context.cinemaRoom.UpdateRange(findRoom);
                    }

                    if (movieSchedule.Any())
                    {
                        foreach (var movieScheduleItem in movieSchedule)
                        {
                            movieScheduleItem.IsDelete = true;
                        }

                        _context.movieSchedule.UpdateRange(movieSchedule);
                    }

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();
                    return new GenericRespondDTOs()
                    {
                        Status = GenericStatusEnum.Success.ToString(),
                        message = "Xóa rạp thành công"
                    };
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                    return new GenericRespondDTOs()
                    {
                        Status = GenericStatusEnum.Failure.ToString(),
                        message = "Lỗi Database"
                    };
                }
            }
            return new GenericRespondDTOs()
            {
                Status = GenericStatusEnum.Failure.ToString(),
                message = "Lỗi Không tìm thấy rạp"
            };
        }
        return new GenericRespondDTOs()
        {
            Status = GenericStatusEnum.Failure.ToString(),
            message = "Lỗi Id rạp bị trống"
        };
    }
    

    public GenericRespondWithObjectDTO<List<GetCinemaListDTO>> GetCinemaList()
    {
        var findCinema = _context.Cinema.Where(x => !x.isDeleted).ToList();
        if (findCinema.Any())
        {
            return new GenericRespondWithObjectDTO<List<GetCinemaListDTO>>()
            {
                Status = GenericStatusEnum.Success.ToString(),
                message = "Lấy Danh Sách thành công",
                data = findCinema.Select(x => new GetCinemaListDTO()
                {
                    CinemaId = x.cinemaId,
                    CinemaLocation = x.cinemaLocation,
                    CinemaDescription = x.cinemaDescription,
                    CinemaContactNumber = x.cinemaContactHotlineNumber,
                    CinemaName = x.cinemaName
                }).ToList()
            };
        }
        return new GenericRespondWithObjectDTO<List<GetCinemaListDTO>>()
        {
            Status = GenericStatusEnum.Failure.ToString(),
            message = "Không tìm thấy danh sách"
        };
    }

    public GenericRespondWithObjectDTO<GetCinemaDetailDTO> GetCinemaDetail(string cinemaId)
    {
        if (!String.IsNullOrEmpty(cinemaId))
        {
            var findCinema = _context.Cinema.FirstOrDefault
                (x => x.cinemaId == cinemaId && x.isDeleted == false);
            if (findCinema != null)
            {
                return new GenericRespondWithObjectDTO<GetCinemaDetailDTO>()
                {
                    Status = GenericStatusEnum.Success.ToString(),
                    message = "Thông tin rạp",
                    data = new GetCinemaDetailDTO()
                    {
                        CinemaId = findCinema.cinemaId,
                        CinemaContactNumber = findCinema.cinemaContactHotlineNumber,
                        CinemaLocation = findCinema.cinemaLocation,
                        CinemaName = findCinema.cinemaName,
                        CinemaDescription = findCinema.cinemaDescription,
                    }
                };
            }
            return new GenericRespondWithObjectDTO<GetCinemaDetailDTO>()
            {
                Status = GenericStatusEnum.Failure.ToString(),
                message = "Lỗi Không tìm thấy rạp"
            };
        }

        return new GenericRespondWithObjectDTO<GetCinemaDetailDTO>()
        {
            Status = GenericStatusEnum.Failure.ToString(),
            message = "Lỗi Chưa có CinemaID"
        };
    }
}