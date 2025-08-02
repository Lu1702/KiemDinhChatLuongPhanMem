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

            // Tieesn hanh Check Trong các trương
            // Tìm kiếm Thông tin phim nếu phim có lịch chieeus chưa bị xóa và có người đang đặt thì ko cho
            // Xóa phòng tiếp tục check nếu chưa đc xóa
            // Logic xóa có Logic như sau :
            // Nếu lịch đã chiếu và đã có người đặt THÌ sẽ xóa mềm
            // Nếu lịch đã chiếu chưa có người đặt THÌ sẽ xóa cứng
            // Neesu lịch chưa chiếu và đã có người đặt thì kooong được xóa
            // Nếu lịch chưa chiếu và chưa cos người đặt thì sẽ dd xóa cứng // Tổng cộng có 4 case

            // Case thứ nhất : Nếu lịch đã chiếu và đã có người đặt THÌ sẽ xóa mềm
            var findMovieScheduleCase1 = _dataContext
                .movieSchedule.Where
                (x => x.movieScheduleId.Equals(id)
                      && x.IsDelete).ToList();
            // Tiếp tục tìm tới thông tin vé
            var Case1SelectTicket = _dataContext
                .TicketOrderDetail.Where
                    (x => findMovieScheduleCase1.Select(x => x.movieScheduleId).Contains(x.movieScheduleID))
                .Select(x => x.orderId);
            // Check điều kiện
            await using var Transaction = await _dataContext.Database.BeginTransactionAsync();

            // Nếu lịch đã chiếu nhưng chưa có ai đặt thì sẽ khóa cứng tổng cộng sex 2 lượt logic
            try
            {
                if (Case1SelectTicket.Any())
                {
                    var Case1Checking =
                        _dataContext.Order.Any
                        (x => Case1SelectTicket.Contains(x.orderId) &&
                              (x.PaymentStatus
                                   .Equals(PaymentStatus.PaymentSuccess.ToString()) ||
                               x.PaymentStatus.Equals(PaymentStatus.Pending.ToString())));

                    // Case 1
                    if (Case1Checking)
                    {
                        // Xóa mềm
                        // Tien Hanh Duyet Vong Lap De Xoa Mem
                        foreach (var Schedule in findMovieScheduleCase1)
                        {
                            Schedule.IsDelete = true;
                        }

                        _dataContext.movieSchedule.UpdateRange(findMovieScheduleCase1);
                        await _dataContext.SaveChangesAsync();
                        await Transaction.CommitAsync();
                        return new GenericRespondDTOs()
                        {
                            Status = GenericStatusEnum.Success.ToString(),
                            message = "Đã xóa lịch chiếu thành công"
                        };
                    }

                    // Case Thứ 2 : Nếu lịch đã chiếu chưa có người đặt THÌ sẽ xóa cứng

                    // Tận dụng phần của Case1
                    if (!Case1Checking)
                    {
                        // Tien Hanh Xoa Cung Thong TIn
                        var Case2Checking =
                            _dataContext.TicketOrderDetail.Where
                                (x => Case1SelectTicket.Contains(x.orderId)).ToList();
                        var findOrder =
                            _dataContext.Order.Where
                            (x => Case2Checking.Select
                                      (x => x.orderId).Contains(x.orderId) &&
                                  x.PaymentStatus.Equals(GenericStatusEnum.Failure.ToString())).ToList();

                        // Tien Hanh Xoa Cung
                        
                        _dataContext.movieSchedule.RemoveRange(findMovieScheduleCase1);
                        _dataContext.TicketOrderDetail.RemoveRange(Case2Checking);
                        _dataContext.Order.RemoveRange(findOrder);

                        await _dataContext.SaveChangesAsync();
                        await Transaction.CommitAsync();
                        return new GenericRespondDTOs()
                        {
                            Status = GenericStatusEnum.Success.ToString(),
                            message = "Đã xóa lịch chiếu thành công"
                        };
                    }
                }
                else
                {
                    _dataContext.movieSchedule
                        .RemoveRange(findMovieScheduleCase1);
                    await _dataContext.SaveChangesAsync();
                    await Transaction.CommitAsync();
                    
                    return new GenericRespondDTOs()
                    {
                        Status = GenericStatusEnum.Success.ToString(),
                        message = "Đã xóa lịch chiếu thành công"
                    };
                }

                // Case Thứ 3 : Neesu lịch chưa chiếu và đã có người đặt thì kooong được xóa
                // Tieeps tucj Case 3
                var findMovieScheduleCase3 = _dataContext
                    .movieSchedule.Where
                        (x => x.movieScheduleId.Equals(id));
                // Thêm If else Logic
                var case3SelectTicket = _dataContext
                    .TicketOrderDetail.Where
                        (x => findMovieScheduleCase3.Select(x => x.movieScheduleId).Contains(x.movieScheduleID));
                // Đây là Logic kiểm tra xem có TỒN TẠI VÉ HAY KO neesy không tồn tại thì sẽ dùng Logic của thằng xóa cungws
                if (case3SelectTicket.Any())
                {
                    //
                    var Case3Checking =
                        _dataContext.Order.Any
                        (x => case3SelectTicket.Select(x => x.orderId).Contains(x.orderId) &&
                              (x.PaymentStatus
                                   .Equals(PaymentStatus.PaymentSuccess.ToString()) ||
                               x.PaymentStatus.Equals(PaymentStatus.Pending.ToString())));
                    // Case 3
                    //Neesu lịch chưa chiếu và đã có người đặt thì kooong được xóa
                    if (Case3Checking)
                    {
                        // Tien Hanh khong cho xoa
                        return new GenericRespondDTOs()
                        {
                            Status = GenericStatusEnum.Failure.ToString(),
                            message = "Không thể xóa lịch chiếu do lịch chiếu đã có người đặt"
                        };
                    }

                    // Case thứ 4 : Nếu lịch chưa chiếu và chưa cos người đặt thì sẽ dd xóa cứng 
                    if (!Case3Checking)
                    {
                        // Tieens hanh Kiem Tra
                        var findTicketCase4 = 
                            _dataContext.TicketOrderDetail
                                .Where(x => findMovieScheduleCase3
                                    .Select(x => x.movieScheduleId).Contains(x.movieScheduleID));
                        // Tien Hanh Tim Thong Tin Giao Dich
                        var findOrder = 
                            _dataContext
                                .Order.Where(x => findTicketCase4.Select(x => x.orderId).Contains(x.orderId));
                        
                        // Tien hanh xoa cung
                        _dataContext.movieSchedule.RemoveRange(findMovieScheduleCase3);
                        _dataContext.TicketOrderDetail.RemoveRange(findTicketCase4);
                        _dataContext.Order.RemoveRange(findOrder);
                        
                        await _dataContext.SaveChangesAsync();
                        await Transaction.CommitAsync();
                        
                        return new GenericRespondDTOs()
                        {
                            Status = GenericStatusEnum.Success.ToString(),
                            message = "Đã xóa lịch chiếu thành công"
                        };
                    }
                }
                else
                {
                    // Truong Hop Khong AI Dat ve // Van Xoa
                    _dataContext.movieSchedule.RemoveRange(findMovieScheduleCase3);
                    await _dataContext.SaveChangesAsync();
                    await Transaction.CommitAsync();
                   
                    return new GenericRespondDTOs()
                    {
                        Status = GenericStatusEnum.Success.ToString(),
                        message = "Đã xóa lịch chiếu thành công"
                    };
                }
            }
            catch (Exception e)
            {
                // Rollback Transaction
                await Transaction.RollbackAsync();
                return new GenericRespondDTOs()
                {
                    Status = GenericStatusEnum.Failure.ToString(),
                    message = $"Lỗi Database Vui Lòng liên hệ dev để giải quyết Chi tiết lỗi + {e.Message}"
                };
            }
            return null!;
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
