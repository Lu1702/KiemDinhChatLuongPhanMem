using backend.Data;
using backend.Enum;
using backend.Interface.Schedule;
using backend.Model.Movie;
using backend.ModelDTO.GenericRespond;
using backend.ModelDTO.ScheduleDTO.Request;
using CloudinaryDotNet.Actions;
using Microsoft.EntityFrameworkCore;
using System.Collections.Concurrent;
using System.Globalization;
using System.Linq;
using backend.Model.Booking;
using backend.ModelDTO.ScheduleDTO;
using Microsoft.Identity.Client;

namespace backend.Services.Schedule
{
    public class ScheduleServices : IScheduleServices
    {
        private readonly DataContext _dataContext;

        public ScheduleServices(DataContext dataContext)
        {
            _dataContext = dataContext;
        }

        public async Task<GenericRespondDTOs> add(string cinemaId , ScheduleRequestDTO scheduleRequestDTO)
        {
            // Thêm lịch chiếu
            // Các điều kiện lần lượt và luồng chạy lần lượt  là
            // Nhập tên phim 
            // Sau do Ngay -> Định dạng -> Gi
            
            // Lấy Data nếu Đã có phim chiếu trong gi x ngày x thì sẽ bắt
            var getMovieVisualInfo = _dataContext.movieVisualFormatDetails
                .Where(x => x.movieId.Equals(scheduleRequestDTO.movieID))
                .Select(x => x.movieVisualFormatId).ToList();

            if (String.IsNullOrEmpty(cinemaId))
            {
                return new GenericRespondDTOs()
                {
                    Status = GenericStatusEnum.Failure.ToString(),
                    message = "Chưa có CinemaID"
                };
            }

            if (String.IsNullOrEmpty(scheduleRequestDTO.movieID))
            {
                return new GenericRespondDTOs()
                {
                    Status = GenericStatusEnum.Failure.ToString(),
                    message = "Ban Chưa nhập ID của phim"
                };
            }

            if (!scheduleRequestDTO.scheduleDateDTOs.Any())
            {
                return new GenericRespondDTOs()
                {
                    Status = GenericStatusEnum.Failure.ToString(),
                    message = "Ban Chua Nhap Ngay"
                };
            }

            using (var Transaction = await _dataContext.Database.BeginTransactionAsync())
            {
                try
                {
                    var movieScheduleList = new List<movieSchedule>();
                    foreach (var movieScheduleDTO in scheduleRequestDTO.scheduleDateDTOs)
                    {
                        if (!movieScheduleDTO.ScheduleVisualFormatDTOs.Any())

                        {
                            return new GenericRespondDTOs()
                            {
                                Status = GenericStatusEnum.Failure.ToString(),
                                message = "Chua Nhap Dinh Dang Hinh Anh"
                            };
                        }

                        foreach (var movieVisualFormatDTO in movieScheduleDTO.ScheduleVisualFormatDTOs)
                        {
                            if (!getMovieVisualInfo.Contains(movieVisualFormatDTO.visualFormatID))
                            {
                                return new GenericRespondDTOs()
                                {
                                    Status = GenericStatusEnum.Failure.ToString(),
                                    message = "Lỗi Định dạng , Phim không Hỗ trợ định dạng"
                                };
                            }

                            foreach (var movieShowTime in movieVisualFormatDTO.scheduleShowTimeDTOs)
                            {
                                if (_dataContext.movieSchedule.Any(x => x.movieId.Equals(scheduleRequestDTO.movieID)
                                                                        && x.ScheduleDate.Equals(movieScheduleDTO
                                                                            .startDate)
                                                                        && x.HourScheduleID.Equals(movieShowTime
                                                                            .showTimeID)
                                                                        && !x.IsDelete))
                                {
                                    return new GenericRespondDTOs()
                                    {
                                        Status = GenericStatusEnum.Failure.ToString(),
                                        message =
                                            "Lịch chiếu đã tồn tại trong Database Note : Lịch chiếu Không được trùng " +
                                            "Bạn không thể tạo lịch chiếu này vì đã có một lịch chiếu đang hoạt động khác cho bộ phim này vào cùng ngày và giờ."
                                    };
                                }

                                if (_dataContext.movieSchedule.Any(x =>
                                        x.HourScheduleID.Equals(movieShowTime.showTimeID)
                                        && x.cinemaRoomId.Equals(movieShowTime.RoomId)
                                        && x.ScheduleDate.Equals(movieScheduleDTO.startDate)
                                        && !x.IsDelete))
                                {
                                    return new GenericRespondDTOs()
                                    {
                                        Status = GenericStatusEnum.Failure.ToString(),
                                        message =  "Phòng chiếu này đã có một bộ phim khác được lên lịch vào đúng thời gian bạn chọn.\n\nVui lòng chọn một phòng chiếu khác hoặc một giờ chiếu khác cho lịch trình của bạn."
                                    };
                                }

                                if (!_dataContext.cinemaRoom
                                    .Any(x => x.cinemaId.Equals(cinemaId)
                                              && x.movieVisualFormatID.Equals(movieVisualFormatDTO.visualFormatID)
                                              && x.cinemaRoomId.Equals(movieShowTime.RoomId)
                                              && !x.isDeleted))
                                {
                                    return new GenericRespondDTOs()
                                    {
                                        Status = GenericStatusEnum.Failure.ToString(),
                                        message =
                                            "Phòng chiếu được chọn không tồn tại, không thuộc về rạp này, hoặc không hỗ trợ định dạng phim đã chọn."
                                    };
                                }

                                // Tien Hanh Luu Vao Trong Database
                                var generateMovieScheduleId = Guid.NewGuid().ToString();
                                movieScheduleList.Add(new movieSchedule()
                                {
                                    movieScheduleId = generateMovieScheduleId ,
                                    cinemaRoomId = movieShowTime.RoomId ,
                                    ScheduleDate = movieScheduleDTO.startDate ,
                                    movieVisualFormatID = movieVisualFormatDTO.visualFormatID ,
                                    movieId = scheduleRequestDTO.movieID ,
                                    HourScheduleID = movieShowTime.showTimeID
                                });
                            }
                        }
                    }
                    await _dataContext.movieSchedule.AddRangeAsync(movieScheduleList);
                    await _dataContext.SaveChangesAsync();
                    await Transaction.CommitAsync();

                    return new GenericRespondDTOs()
                    {
                        Status = GenericStatusEnum.Success.ToString() ,
                        message = "Đã thêm lịch chiếu thành công"
                    };
                }
                catch (Exception e)
                {
                    await Transaction.RollbackAsync();
                    return new GenericRespondDTOs()
                    {
                        Status = GenericStatusEnum.Failure.ToString(),
                        message = "Đã có lỗi xãy ra khi lưu Data vui lòng kiểm tra lại" +
                                  "1. Là lỗi Database" +
                                  "2. Là Lỗi đã tồn tại lịch chiếu"
                    };
                }
            }
        }

        // Lưu ý : Nghiệp vụ ở đây có chút khác biệt so với các nghiệp vụ sửa khác 

        public async Task<GenericRespondDTOs> edit(string movieScheduleId, EditScheduleDTO editScheduleDto)
        {
            if (String.IsNullOrEmpty(movieScheduleId))
            {
                // Check Xem no co bị null hay không
                return new GenericRespondDTOs()
                {
                    Status = GenericStatusEnum.Failure.ToString(),
                    message = "Ban chưa nhập Id"
                };
            }
            
            // Tiếp tục tìm Lich Chieu Bang Id
            
            var findMovieSchedule = 
               await _dataContext.movieSchedule.FirstOrDefaultAsync(x => x.movieScheduleId == movieScheduleId);
            if (findMovieSchedule == null)
            {
                return new GenericRespondDTOs()
                {
                    Status = GenericStatusEnum.Failure.ToString(),
                    message = "Không tìm thấy lịch chiếu "
                };
            }
            
            // Tiếp tục chek qua bên các bangr liên quan
            var checkTicketOrder =
                _dataContext.TicketOrderDetail
                    .Where(x => x.movieScheduleID.Equals(movieScheduleId))
                    .Include(x => x.Order).ToList()
                    .Where(x => x.Order.PaymentStatus.Equals
                        (PaymentStatus.Pending.ToString()) && 
                                x.Order.PaymentStatus.Equals
                                    (PaymentStatus.PaymentSuccess.ToString()));
            if (checkTicketOrder.Any())
            {
                return new GenericRespondDTOs()
                {
                    Status = GenericStatusEnum.Failure.ToString(),
                    message = "Lỗi Không thể chỉnh sửa do đã có người đã đặt vé hoặc đang chờ thanh toán"
                };
            }
            
            // Tien Hanh chỉnh sửa
            
            findMovieSchedule.cinemaRoomId = String.IsNullOrEmpty(editScheduleDto.CinemaRoomId) 
                ? findMovieSchedule.cinemaRoomId : editScheduleDto.CinemaRoomId;
            
            findMovieSchedule.movieId = String.IsNullOrEmpty(editScheduleDto.MovieId) ? findMovieSchedule.movieId : editScheduleDto.MovieId;
            
            findMovieSchedule.DayInWeekendSchedule = String.IsNullOrEmpty(editScheduleDto.DayInWeekendSchedule) 
                ? findMovieSchedule.DayInWeekendSchedule : editScheduleDto.DayInWeekendSchedule;
            
            findMovieSchedule.movieVisualFormatID = String.IsNullOrEmpty
                (editScheduleDto.MovieVisualFormatId) ? findMovieSchedule.movieVisualFormatID
                : editScheduleDto.MovieVisualFormatId;
            
            findMovieSchedule.HourScheduleID = 
                String.IsNullOrEmpty(editScheduleDto.HourScheduleId) ? findMovieSchedule.HourScheduleID : editScheduleDto.HourScheduleId;
            
            findMovieSchedule.ScheduleDate = editScheduleDto.ScheduleDate
                ?? findMovieSchedule.ScheduleDate;
            
            await using var Transaction = await _dataContext.Database.BeginTransactionAsync();
            try
            {
                // TIến hành lưu vào trong Database
                _dataContext.movieSchedule.Update(findMovieSchedule);
                await _dataContext.SaveChangesAsync();
                await Transaction.CommitAsync();
                
                return new GenericRespondDTOs()
                {
                    Status = GenericStatusEnum.Success.ToString(),
                    message = "Chinrh sửa thành công"
                };
            }
            catch (Exception e)
            {
                await Transaction.RollbackAsync();
                return new GenericRespondDTOs()
                {
                    Status = GenericStatusEnum.Failure.ToString(),
                    message = "Lỗi Khi Thêm Vào Trong Database"
                };
            }
        }

        public async Task<GenericRespondDTOs> delete(string id)
        {
             // Tieens hanh CheckId
            if (String.IsNullOrEmpty(id))
            {
                return new GenericRespondDTOs()
                {
                    Status = GenericStatusEnum.Failure.ToString(),
                    message = "Lỗi Chưa Có ID"
                };
            }

            await using var transaction = await _dataContext.Database.BeginTransactionAsync();

    try
    {
        var movieSchedule = await _dataContext.movieSchedule
            .FirstOrDefaultAsync(x => x.movieScheduleId.Equals(id));

        if (movieSchedule == null)
        {
            return new GenericRespondDTOs()
            {
                Status = GenericStatusEnum.Failure.ToString(),
                message = "Lịch chiếu không tồn tại."
            };
        }

        var hasTickets = await _dataContext.TicketOrderDetail
            .AnyAsync(x => x.movieScheduleID.Equals(id));

        var hasActiveOrders = await _dataContext.TicketOrderDetail
            .Where(x => x.movieScheduleID.Equals(id))
            .Join(_dataContext.Order,
                ticket => ticket.orderId,
                order => order.orderId,
                (ticket, order) => order)
            .AnyAsync(order => order.PaymentStatus.Equals(PaymentStatus.PaymentSuccess.ToString()) ||
                               order.PaymentStatus.Equals(PaymentStatus.Pending.ToString()));
        
        var getTime =await _dataContext.HourSchedule.FirstOrDefaultAsync(x => x.HourScheduleID.Equals(movieSchedule.HourScheduleID));
        Console.WriteLine(getTime.HourScheduleShowTime);
        var time = TimeSpan.ParseExact(getTime.HourScheduleShowTime.ToString(), @"hh\:mm", CultureInfo.InvariantCulture);
        bool isAired = movieSchedule.ScheduleDate.Add(time) < DateTime.Now; 

        if (isAired)
        {
            if (hasActiveOrders)
            {
                movieSchedule.IsDelete = true;
                _dataContext.movieSchedule.Update(movieSchedule);
                await _dataContext.SaveChangesAsync();
                await transaction.CommitAsync();
                return new GenericRespondDTOs()
                {
                    Status = GenericStatusEnum.Success.ToString(),
                    message = "Đã xóa mềm lịch chiếu thành công (lịch đã chiếu và có người đặt)."
                };
            }
            else
            {
                // Case 2: If the schedule has aired AND has no active orders (either no tickets or all failed payments)
                // -> Hard delete the movie schedule and associated data.
                var ticketsToDelete = await _dataContext.TicketOrderDetail
                    .Where(x => x.movieScheduleID.Equals(id))
                    .ToListAsync();
                var ordersToDelete = new List<Order>();
                if (ticketsToDelete.Any())
                {
                    var orderIds = ticketsToDelete.Select(t => t.orderId).ToList();
                    ordersToDelete = await _dataContext.Order
                        .Where(o => orderIds.Contains(o.orderId) && o.PaymentStatus.Equals(PaymentStatus.PaymentFailure.ToString()))
                        .ToListAsync();
                }

                _dataContext.movieSchedule.Remove(movieSchedule);
                _dataContext.TicketOrderDetail.RemoveRange(ticketsToDelete);
                _dataContext.Order.RemoveRange(ordersToDelete); // Only remove orders with failed payments if they exist.

                await _dataContext.SaveChangesAsync();
                await transaction.CommitAsync();
                return new GenericRespondDTOs()
                {
                    Status = GenericStatusEnum.Success.ToString(),
                    message = "Đã xóa cứng lịch chiếu thành công (lịch đã chiếu và không có người đặt)."
                };
            }
        }
        else 
        {
            if (hasActiveOrders)
            {
                return new GenericRespondDTOs()
                {
                    Status = GenericStatusEnum.Failure.ToString(),
                    message = "Không thể xóa lịch chiếu do lịch chiếu chưa diễn ra và đã có người đặt vé thành công hoặc đang chờ thanh toán."
                };
            }
            else
            {
                var ticketsToDelete = await _dataContext.TicketOrderDetail
                    .Where(x => x.movieScheduleID.Equals(id))
                    .ToListAsync();
                var ordersToDelete = new List<Order>();
                if (ticketsToDelete.Any())
                {
                    var orderIds = ticketsToDelete.Select(t => t.orderId).ToList();
                    ordersToDelete = await _dataContext.Order
                        .Where(o => orderIds.Contains(o.orderId)) // For not aired and no active orders, any order linked can be removed.
                        .ToListAsync();
                }

                _dataContext.movieSchedule.Remove(movieSchedule);
                _dataContext.TicketOrderDetail.RemoveRange(ticketsToDelete);
                _dataContext.Order.RemoveRange(ordersToDelete);

                await _dataContext.SaveChangesAsync();
                await transaction.CommitAsync();
                return new GenericRespondDTOs()
                {
                    Status = GenericStatusEnum.Success.ToString(),
                    message = "Đã xóa cứng lịch chiếu thành công (lịch chưa chiếu và không có người đặt)."
                };
            }
        }
    }
    catch (Exception e)
    {
        await transaction.RollbackAsync();
        return new GenericRespondDTOs()
        {
            Status = GenericStatusEnum.Failure.ToString(),
            message = $"Lỗi Database Vui Lòng liên hệ dev để giải quyết Chi tiết lỗi: {e.Message}"
        };
    }
        }

        public GenericRespondWithObjectDTO<List<GetListScheduleDTO>> getAlSchedulesByMovieName(string movieName)
        {
            if (!String.IsNullOrEmpty(movieName))
            {
                var findMovie = _dataContext.movieInformation
                    .FirstOrDefault(x => x.movieName.Contains(movieName) && !x.isDelete);
                if (findMovie != null)
                {
                    try
                    {
                        var findSchedule = _dataContext.movieSchedule
                            .Where(x => x.movieId.Equals(findMovie.movieId))
                            .Include(x => x.cinemaRoom)
                            .ThenInclude(x => x.Cinema)
                            .Include(x => x.HourSchedule)
                            .AsSplitQuery();
                        if (findSchedule.Any())
                        {
                            var convertToGetList = findSchedule.GroupBy(x => x.movieInformation.movieName)
                                .Select(x => new GetListScheduleDTO()
                                {
                                    MovieName = x.Key,
                                    getListSchedule = x.Select(y => new GetMovieScheduleDTO()
                                    {
                                        ScheduleId = y.movieScheduleId,
                                        CinemaName = y.cinemaRoom.Cinema.cinemaName,
                                        MovieVisualFormatInfo = y.movieVisualFormat.movieVisualFormatName,
                                        ShowTime = y.HourSchedule.HourScheduleShowTime,
                                        ShowDate = y.ScheduleDate,
                                        CinemaRoom = y.cinemaRoom.cinemaRoomNumber
                                    }).ToList()
                                }).ToList();

                            return new GenericRespondWithObjectDTO<List<GetListScheduleDTO>>()
                            {
                                Status = GenericStatusEnum.Success.ToString(),
                                message = "Tim Kiem Thanh Cong",
                                data = convertToGetList
                            };
                        }

                        return new GenericRespondWithObjectDTO<List<GetListScheduleDTO>>()
                        {
                            Status = GenericStatusEnum.Failure.ToString(),
                            message = $"Không tìm thấy lịch chiếu"
                        };
                    }
                    catch (Exception e)
                    {
                        return new GenericRespondWithObjectDTO<List<GetListScheduleDTO>>()
                        {
                            Status = GenericStatusEnum.Failure.ToString(),
                            message = $"Lỗi Database Lỗi : {e.Message}"
                        };
                    }
                }

                return new GenericRespondWithObjectDTO<List<GetListScheduleDTO>>()
                {
                    Status = GenericStatusEnum.Failure.ToString(),
                    message = $"Không tìm thaasy Phim Co Ten la {movieName}"
                };

            }

            return new GenericRespondWithObjectDTO<List<GetListScheduleDTO>>()
            {
                Status = GenericStatusEnum.Failure.ToString(),
                message = "Bạn Chưa Nhap Ten Phim"
            };
        }

        public GenericRespondWithObjectDTO<GetVisualFormatListByMovieIdDTO> getVisualFormatListByMovieId(string movieId)
        {
            var getVisualFormatListByMovieId = _dataContext.movieVisualFormatDetails
                .Where(x => x.movieId.Equals(movieId))
                .Include(x => x.movieVisualFormat);
            if (getVisualFormatListByMovieId.Any())
            {
                return new GenericRespondWithObjectDTO<GetVisualFormatListByMovieIdDTO>()
                {
                    Status = GenericStatusEnum.Success.ToString(),
                    message = "Thong Tin",
                    data = new GetVisualFormatListByMovieIdDTO()
                    {
                        MovieId = movieId,
                        VisualFormatLists = getVisualFormatListByMovieId.Select(x => new VisualFormatListDTO()
                        {
                            VisualFormatId = x.movieVisualFormatId,
                            VisualFormatName = x.movieVisualFormat.movieVisualFormatName
                        }).ToList()
                    }
                };
            }

            return new GenericRespondWithObjectDTO<GetVisualFormatListByMovieIdDTO>()
            {
                Status = GenericStatusEnum.Failure.ToString(),
                message = "Data bị null"
            };
        }

        public GenericRespondWithObjectDTO<string> getScheduleId(string cinemaRoomId, DateTime ShowDate, string HourId, string movieId)
        {
            var findMovieScheduleId =
                _dataContext.movieSchedule
                .FirstOrDefault
                (x => x.cinemaRoomId.Equals(cinemaRoomId)
                && x.ScheduleDate == ShowDate && x.HourScheduleID.Equals(HourId)
                && x.movieId.Equals(movieId) && !x.IsDelete);
            if (findMovieScheduleId != null) 
            {
                return new GenericRespondWithObjectDTO<string>
                {
                    Status = GenericStatusEnum.Success.ToString(),
                    message = "Lấy data thành công",
                    data = findMovieScheduleId.movieScheduleId
                };
            }
            return new GenericRespondWithObjectDTO<string>
            {
                Status = GenericStatusEnum.Failure.ToString(),
                message = "Lấy data thất bại ko có lịch chiếu nào hết",
            };
        }


    }
}
