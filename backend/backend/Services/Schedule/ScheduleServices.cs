using backend.Data;
using backend.Enum;
using backend.Interface.Schedule;
using backend.Model.Movie;
using backend.ModelDTO.GenericRespond;
using backend.ModelDTO.ScheduleDTO.Request;
using CloudinaryDotNet.Actions;
using Microsoft.EntityFrameworkCore;
using System.Collections.Concurrent;
using System.Linq;
using backend.Model.Booking;
using backend.ModelDTO.ScheduleDTO;

namespace backend.Services.Schedule
{
    public class ScheduleServices : IScheduleServices
    {
        public readonly DataContext _dataContext;

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
                                        message =
                                            "Phòng chiếu này đã có một bộ phim khác được lên lịch vào đúng thời gian bạn chọn.\n\nVui lòng chọn một phòng chiếu khác hoặc một giờ chiếu khác cho lịch trình của bạn."
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
         
        public async Task<GenericRespondDTOs> edit(string Movieid, ScheduleRequestDTO scheduleRequestDTO)
        {
            if (String.IsNullOrEmpty(Movieid))
            {
                return new GenericRespondDTOs()
                {
                    Status = GenericStatusEnum.Failure.ToString(),
                    message = "Bạn chưa có thông tin veef phim cần xóa"
                };
            }
            // Tim Kiem Lich Chieu 
            // Logic nghiệp vụ :
            // Nếu có người đã đặt vé hoặc dang trong trạng thái Pending thì sẽ không được chỉnh sửa
            
        }

        public async Task<GenericRespondDTOs> delete(string id)
        {
            if (String.IsNullOrEmpty(id))
            {
                return new GenericRespondDTOs()
                {
                    Status = GenericStatusEnum.Failure.ToString(),
                    message = "Id Bi Thieu"
                };
            }
            
            var findMovieSchedule = await _dataContext.movieSchedule.FindAsync(id);
            if (findMovieSchedule == null)
            {
                return new GenericRespondDTOs()
                {
                    Status = GenericStatusEnum.Failure.ToString(),
                    message = "Không tìm thấy lịch chiếu phim"
                };
            }
            
            // Tiep Tuc Tim Kiem Trong Bảng OrderTicket
        var findTickets = _dataContext
            .TicketOrderDetail
            .Where(x => x.movieScheduleID == id)
            .Include(x => x.Order);
        
            // TIep Tuc Tiem Kiem Trong Bang 
            // Neu Co Khong Duoc Xoa
            if (findTickets.Any(x =>
                    x.Order.PaymentStatus.Equals(PaymentStatus.PaymentSuccess.ToString())
                    && x.Order.PaymentStatus.Equals(PaymentStatus.Pending.ToString())))
            {
                return new GenericRespondDTOs()
                {
                    Status = GenericStatusEnum.Failure.ToString(),
                    message = "Không xóa được , Đã có người đặt vé hoặc đang trong thoi gian chờ đặt vé"
                };
            }
            // Nếu chưa có ai mua thì sẽ được xóa // Tiến hành xóa các Order Lieen quan
            await using var Transaction = await _dataContext.Database.BeginTransactionAsync();
            try
            {
                var findOrder = _dataContext.Order
                    .Where(x => findTickets.Select(x => x.orderId).Contains(x.orderId));
                _dataContext.movieSchedule.Remove(findMovieSchedule);
                _dataContext.Order.RemoveRange(findOrder);
                _dataContext.TicketOrderDetail.RemoveRange(findTickets);
                await _dataContext.SaveChangesAsync();
                await Transaction.CommitAsync();
                
                return new GenericRespondDTOs()
                {
                    Status = GenericStatusEnum.Success.ToString(),
                    message = "Xoa thanh cong"
                };
            }
            catch (Exception e)
            {
                await Transaction.RollbackAsync();
                return new GenericRespondDTOs()
                {
                    Status = GenericStatusEnum.Failure.ToString(),
                    message = "Loi Database"
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

    }
}
