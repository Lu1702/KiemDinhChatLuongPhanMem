    using backend.Data;
    using backend.Enum;
    using backend.Interface.RoomInferface;
    using backend.Model.CinemaRoom;
    using backend.ModelDTO.GenericRespond;
    using backend.ModelDTO.RoomDTOS;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.IdentityModel.Tokens;
    using Seats = backend.Model.CinemaRoom.Seats;

    namespace backend.Services.RoomServices;

    public class RoomService : IRoomService
    {
        private readonly DataContext _context;

        public RoomService(DataContext context)
        {
            _context = context;
        }
        
        public GenericRespondWithObjectDTO<RoomRequestGetListDTO> getRoomInfo(string movieID , DateTime scheduleDate ,  string HourId , string movieVisualID)
        {
            // Truy van toi bang MovieSchedule de lay data
            
            var getRoomID = _context.movieSchedule
                .FirstOrDefault(x => x.movieVisualFormatID == movieVisualID
                && x.ScheduleDate == scheduleDate
                && x.HourScheduleID == HourId
                && x.movieId == movieID
                && x.ScheduleDate > DateTime.Now
                && !x.IsDelete);

            if (getRoomID != null)
            {
                // Tiep tuc truy van toi bang room
                var getSeatsNumber = _context.Seats
                    .Include(x => x.cinemaRoom)
                    .Where(x => x.cinemaRoomId.Equals(getRoomID.cinemaRoomId) && !x.isDelete
                    && !x.cinemaRoom.isDeleted);
                
                List<SeatsDTO> seatsDTO = new List<SeatsDTO>();
                foreach (var seats in getSeatsNumber)
                {
                    seatsDTO.Add
                        (new SeatsDTO()
                        {
                            SeatsId = seats.seatsId,
                            SeatsNumber = seats.seatsNumber,
                            IsTaken = seats.isTaken,
                        });
                }
                // Truyen Thong Tin Vao DTO
                var newGenericRespond = new GenericRespondWithObjectDTO<RoomRequestGetListDTO>()
                {
                    Status = GenericStatusEnum.Success.ToString(),
                    message = "Room Information",
                    data = new RoomRequestGetListDTO()
                    {
                        CinemaRoomId = getSeatsNumber.Select(x => x.cinemaRoom.cinemaRoomId).FirstOrDefault(),
                        CinemaRoomNumber = getSeatsNumber.Select(x => x.cinemaRoom.cinemaRoomNumber).FirstOrDefault(),
                        Seats = seatsDTO
                    }
                };
                return newGenericRespond;
            }

            return new GenericRespondWithObjectDTO<RoomRequestGetListDTO>()
            {
                Status = GenericStatusEnum.Failure.ToString(),
                message = "Room Request Failed",
            };
        }

        public async Task<GenericRespondDTOs> CreateRoom(RoomCreateRequestDTO roomCreateRequestDTO)
        {
            // Tien Hanh Tao Phong
            if (roomCreateRequestDTO.RoomNumber == 0 ||
                String.IsNullOrEmpty(roomCreateRequestDTO.CinemaID) ||
                String.IsNullOrEmpty(roomCreateRequestDTO.VisualFormatID) ||
                !roomCreateRequestDTO.SeatsNumber.Any())
            {
                return new GenericRespondDTOs()
                {
                    Status = GenericStatusEnum.Failure.ToString(),
                    message = "Bạn Nhập Thiếu Thông Tin Rồi Kìa !"
                };
            }
            
            await using var transaction = await _context.Database.BeginTransactionAsync();
            {
                try
                {
                    // Kiem Tra Xem Phong Co ton tai hay chua
                    if (!_context.cinemaRoom.Any(x => x.cinemaRoomNumber.Equals(roomCreateRequestDTO.RoomNumber)
                                                     && x.cinemaId.Equals(roomCreateRequestDTO.CinemaID)))
                    {
                        var generateCinemaRoomId = Guid.NewGuid().ToString();
                        // Tien Hanh Them
                        await _context.cinemaRoom.AddAsync(new cinemaRoom()
                        {
                            cinemaRoomId = generateCinemaRoomId,
                            cinemaRoomNumber = roomCreateRequestDTO.RoomNumber,
                            cinemaId = roomCreateRequestDTO.CinemaID,
                            movieVisualFormatID = roomCreateRequestDTO.VisualFormatID
                        });
                        
                        List<Seats> SeatsList = new List<Seats>();
                        // TienHanhThem Ghe
                        foreach (var seatsNumber in roomCreateRequestDTO.SeatsNumber)
                        {
                            var SeatsId = Guid.NewGuid().ToString();
                            SeatsList.Add(new Seats()
                            {
                                seatsId = SeatsId,
                                seatsNumber = seatsNumber,
                                cinemaRoomId = generateCinemaRoomId,
                                isTaken = false,
                                isDelete = false
                            });
                        }
                        
                        await _context.Seats.AddRangeAsync(SeatsList);
                        
                        await _context.SaveChangesAsync();
                        
                        await transaction.CommitAsync();
                        
                        return new GenericRespondDTOs()
                        {
                            Status = GenericStatusEnum.Success.ToString(),
                            message = "Tao Phong Thanh Cong",
                        };
                    }

                    return new GenericRespondDTOs()
                    {
                        Status = GenericStatusEnum.Failure.ToString(),
                        message = "Lỗi Phòng Đã tồn tại"
                    };
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                    return new GenericRespondDTOs()
                    {
                        Status = GenericStatusEnum.Failure.ToString(),
                        message = "Loi Database",
                    };
                }
            }
        }

        public async Task<GenericRespondDTOs> UpdateRoom(string RoomId, RoomEditRequestDTO roomEditRequestDTO)
        {
             // Tien Hanh Tao Phong
            await using var transaction = await _context.Database.BeginTransactionAsync();
            {
                try
                {
                    // Bắt tổng cộng 2 Case
                    // Tieens hanh kiem tra xem phong co nguoi dat hay chua
                    var getCinemaInfo = _context.cinemaRoom.FirstOrDefault(x => x.cinemaRoomId == RoomId);
                    
                    
                    if (getCinemaInfo != null)
                    {
                        // Timf kiem lich chieu chua duoc xoa 
                        var getMovieScheduleInfo = _context.movieSchedule
                            .Where(x => x.cinemaRoomId == RoomId).Select(x => x.movieScheduleId);
                        // Tiep tuc tien hanh kiem tra xem phong co nguoi dat hay chua
                        var getOrderTicketInfo
                            = _context.TicketOrderDetail.Where(x => getMovieScheduleInfo.Contains
                                (x.movieScheduleID)).Select(x => x.orderId);
                        var getOrderInfo =
                            _context.Order.Where(x => getOrderTicketInfo.Contains(x.orderId) &&
                                                      x.PaymentStatus.Equals(PaymentStatus.PaymentSuccess.ToString()));
                        if (getOrderInfo.Any())
                        {
                            return new GenericRespondDTOs()
                            {
                                Status = GenericStatusEnum.Failure.ToString(),
                                message = "Lỗi Không xóa được phòng do phòng đã có người đặt"
                            };
                        }
                        var findSeats = _context.Seats.Where(x => x.cinemaRoomId == RoomId);
                        if (roomEditRequestDTO.RoomNumber.HasValue && roomEditRequestDTO.CinemaID.IsNullOrEmpty())
                        {
                            var getCinemaId =
                                getCinemaInfo.cinemaId;
                            // Kiểm tra
                            if (_context.cinemaRoom.Any(x => !x.cinemaRoomId.Equals(RoomId)
                                                             && x.cinemaId.Equals(getCinemaId) &&
                                                             x.cinemaRoomNumber.Equals(roomEditRequestDTO.RoomNumber)))
                            {
                                return new GenericRespondDTOs()
                                {
                                    Status = GenericStatusEnum.Failure.ToString(),
                                    message = "Phòng đã tồn tại"
                                };
                            }else
                            {
                                if (findSeats.Any())
                                {
                                   int cinemaRoomNumber = roomEditRequestDTO.RoomNumber ?? getCinemaInfo.cinemaRoomNumber;
                                   string movieVisualId = String.IsNullOrEmpty(roomEditRequestDTO.VisualFormatID) ? getCinemaInfo.movieVisualFormatID : roomEditRequestDTO.VisualFormatID;

                                   if (roomEditRequestDTO.SeatsNumber.Any())
                                   {
                                       _context.Seats.RemoveRange(findSeats);

                                       List<Seats> seatsList = new List<Seats>();
                                       foreach (var newSeat in roomEditRequestDTO.SeatsNumber)
                                       {
                                           var SeatId = Guid.NewGuid().ToString();
                                           seatsList.Add(new Seats()
                                           {
                                               seatsId = SeatId,
                                               isDelete = false,
                                               isTaken = false,
                                               seatsNumber = newSeat,
                                               cinemaRoomId = getCinemaInfo.cinemaRoomId,
                                           });
                                       }
                                       
                                       await _context.Seats.AddRangeAsync(seatsList);
                                   }
                                   
                                   getCinemaInfo.cinemaRoomNumber = cinemaRoomNumber;
                                   getCinemaInfo.movieVisualFormatID = movieVisualId;
                                   
                                   _context.cinemaRoom.Update(getCinemaInfo);

                                   await _context.SaveChangesAsync();
                                   
                                   await transaction.CommitAsync();
                                   
                                   return new GenericRespondDTOs()
                                   {
                                       Status = GenericStatusEnum.Success.ToString(),
                                       message = "Chỉnh sửa phòng thành công",
                                   };
                                }
                            }
                        }else if (!roomEditRequestDTO.CinemaID.IsNullOrEmpty() && !roomEditRequestDTO.RoomNumber.HasValue)
                        {
                            var getRoomNumber =
                                getCinemaInfo.cinemaRoomNumber;
                            // Kiểm tra
                            if (_context.cinemaRoom.Any(x => !x.cinemaRoomId.Equals(RoomId)
                                                             && x.cinemaId.Equals(roomEditRequestDTO.CinemaID) &&
                                                             x.cinemaRoomNumber.Equals(getRoomNumber)))
                            {
                                return new GenericRespondDTOs()
                                {
                                    Status = GenericStatusEnum.Failure.ToString(),
                                    message = "Phòng đã tồn tại"
                                };
                            }
                            else
                            {
                                if (findSeats.Any())
                                {
                                    int cinemaRoomNumber =
                                        roomEditRequestDTO.RoomNumber ?? getCinemaInfo.cinemaRoomNumber;
                                    string cinemaId = String.IsNullOrEmpty(
                                        roomEditRequestDTO.CinemaID)
                                        ? getCinemaInfo.cinemaId
                                        : roomEditRequestDTO.CinemaID;
                                    string movieVisualId = String.IsNullOrEmpty(roomEditRequestDTO.VisualFormatID)
                                        ? getCinemaInfo.movieVisualFormatID
                                        : roomEditRequestDTO.VisualFormatID;

                                    if (roomEditRequestDTO.SeatsNumber.Any())
                                    {
                                        _context.Seats.RemoveRange(findSeats);

                                        List<Seats> seatsList = new List<Seats>();
                                        foreach (var newSeat in roomEditRequestDTO.SeatsNumber)
                                        {
                                            var SeatId = Guid.NewGuid().ToString();
                                            seatsList.Add(new Seats()
                                            {
                                                seatsId = SeatId,
                                                isDelete = false,
                                                isTaken = false,
                                                seatsNumber = newSeat,
                                                cinemaRoomId = getCinemaInfo.cinemaRoomId,
                                            });
                                        }

                                        await _context.Seats.AddRangeAsync(seatsList);
                                    }

                                    getCinemaInfo.cinemaId = cinemaId;
                                    getCinemaInfo.cinemaRoomNumber = cinemaRoomNumber;
                                    getCinemaInfo.movieVisualFormatID = movieVisualId;

                                    _context.cinemaRoom.Update(getCinemaInfo);

                                    await _context.SaveChangesAsync();

                                    await transaction.CommitAsync();

                                    return new GenericRespondDTOs()
                                    {
                                        Status = GenericStatusEnum.Success.ToString(),
                                        message = "Chỉnh sửa phòng thành công",
                                    };
                                }
                            }
                        }else if (roomEditRequestDTO.RoomNumber.HasValue && !roomEditRequestDTO.CinemaID.IsNullOrEmpty())
                        {
                            if (
                                _context.cinemaRoom.Any
                                (x => !x.cinemaRoomId.Equals(RoomId) && x.cinemaRoomNumber.Equals
                                    (roomEditRequestDTO.RoomNumber) && x.cinemaId.Equals(roomEditRequestDTO
                                    .CinemaID)))
                            {
                                return new GenericRespondDTOs()
                                {
                                    Status = GenericStatusEnum.Failure.ToString(),
                                    message = "Phòng đã tồn tại"
                                };
                            }
                            else
                            {
                                if (findSeats.Any())
                                {
                                    int cinemaRoomNumber =
                                        roomEditRequestDTO.RoomNumber ?? getCinemaInfo.cinemaRoomNumber;
                                    string cinemaId = String.IsNullOrEmpty(
                                        roomEditRequestDTO.CinemaID)
                                        ? getCinemaInfo.cinemaId
                                        : roomEditRequestDTO.CinemaID;
                                    string movieVisualId = String.IsNullOrEmpty(roomEditRequestDTO.VisualFormatID)
                                        ? getCinemaInfo.movieVisualFormatID
                                        : roomEditRequestDTO.VisualFormatID;

                                    if (roomEditRequestDTO.SeatsNumber.Any())
                                    {
                                        _context.Seats.RemoveRange(findSeats);

                                        List<Seats> seatsList = new List<Seats>();
                                        foreach (var newSeat in roomEditRequestDTO.SeatsNumber)
                                        {
                                            var SeatId = Guid.NewGuid().ToString();
                                            seatsList.Add(new Seats()
                                            {
                                                seatsId = SeatId,
                                                isDelete = false,
                                                isTaken = false,
                                                seatsNumber = newSeat,
                                                cinemaRoomId = getCinemaInfo.cinemaRoomId,
                                            });
                                        }

                                        await _context.Seats.AddRangeAsync(seatsList);
                                    }

                                    getCinemaInfo.cinemaId = cinemaId;
                                    getCinemaInfo.cinemaRoomNumber = cinemaRoomNumber;
                                    getCinemaInfo.movieVisualFormatID = movieVisualId;

                                    _context.cinemaRoom.Update(getCinemaInfo);

                                    await _context.SaveChangesAsync();

                                    await transaction.CommitAsync();

                                    return new GenericRespondDTOs()
                                    {
                                        Status = GenericStatusEnum.Success.ToString(),
                                        message = "Chỉnh sửa phòng thành công",
                                    };
                                }
                            }
                        }
                    }

                    return new GenericRespondDTOs()
                    {
                        Status = GenericStatusEnum.Failure.ToString(),
                        message = "Không tìm thấy phòng"
                    };
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                    return new GenericRespondDTOs()
                    {
                        Status = GenericStatusEnum.Failure.ToString(),
                        message = "Lỗi Database",
                    };
                }
            }
        }

        public async Task<GenericRespondDTOs> DeleteRoom(string RoomId)
        {
            await using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    var findRoom = _context.cinemaRoom
                        .FirstOrDefault(x => x.cinemaRoomId == RoomId);
                    var findSeats = _context.Seats.Where(x => x.cinemaRoomId == RoomId);
                    if (findRoom != null && findSeats.Any())
                    {
                        var findSchedule = _context.movieSchedule.Where(x => x.cinemaRoomId == RoomId
                         && !x.IsDelete);
                        var selectSchedule = findSchedule.Select(x => x.movieScheduleId).ToList();
                        var findOrder =
                            _context.TicketOrderDetail.Where(y => selectSchedule.Contains(y.movieScheduleID))
                                .Include(x => x.Order);

                        // Nếu có người đã thanh toán rồi thì không cho phép xóa phòng
                        
                        if (findOrder.Any(x => x.Order.PaymentStatus.Equals(PaymentStatus.PaymentSuccess.ToString())))
                        {
                            return new GenericRespondDTOs()
                            {
                                Status = GenericStatusEnum.Failure.ToString(),
                                message = "Lỗi đã có người đặt vé không xóa được phòng"
                            };
                        }
                        
                        foreach (var schedules in findSchedule)
                        {
                            schedules.IsDelete = true;
                        }
                        
                        findRoom.isDeleted = true;
                        foreach (var seats in findSeats)
                        {
                            seats.isDelete = true;
                        }

                        _context.cinemaRoom.Update(findRoom);
                        _context.Seats.UpdateRange(findSeats);
                        _context.movieSchedule.UpdateRange(findSchedule);

                        await _context.SaveChangesAsync();

                        await transaction.CommitAsync();

                        return new GenericRespondDTOs()
                        {
                            Status = GenericStatusEnum.Success.ToString(),
                            message = "Xóa Phòng Thành Công"
                        };
                    }

                    return new GenericRespondDTOs()
                    {
                        Status = GenericStatusEnum.Failure.ToString(),
                        message = "Lỗi Không tìm thấy phòng"
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
        }

        public GenericRespondWithObjectDTO<List<RoomRequestGetListDTO>> GetRoomList()
        {
            var roomList = _context.cinemaRoom
                .Include(r => r.Seats) // Vẫn cần Include để tải ghế
                .Where(x => !x.isDeleted)
                .Select(room => new RoomRequestGetListDTO
                {
                    CinemaRoomId = room.cinemaRoomId,
                    CinemaRoomNumber = room.cinemaRoomNumber,
                    Seats = room.Seats.Select(seat => new SeatsDTO // Chuyển đổi ghế thành SeatsDTO
                    {
                        SeatsId = seat.seatsId,
                        SeatsNumber = seat.seatsNumber,
                        IsTaken = seat.isTaken,
                    }).ToList()
                })
                .ToList(); // Thực thi truy vấn và nhận danh sách DTO

            if (roomList.Any())
            {
                return new GenericRespondWithObjectDTO<List<RoomRequestGetListDTO>>()
                {
                    message = "Lấy danh sách thành công",
                    Status = GenericStatusEnum.Success.ToString(),
                    data = roomList
                };
            }
            return new GenericRespondWithObjectDTO<List<RoomRequestGetListDTO>>()
            {
                message = "Lấy danh sách thất bại , Danh sách phòng trống",
                Status = GenericStatusEnum.Failure.ToString(),
            };
        }

        public GenericRespondWithObjectDTO<List<RoomRequestGetListDTO>> SearchRoomByCinemaId(string CinemaId)
        {
            var roomList = _context.cinemaRoom
                .Where(x => x.cinemaId == CinemaId && !x.isDeleted)
                .Include(r => r.Seats)
                .Select(room => new RoomRequestGetListDTO
                {
                    CinemaRoomId = room.cinemaRoomId,
                    CinemaRoomNumber = room.cinemaRoomNumber,
                    Seats = room.Seats.Select(seat => new SeatsDTO // Chuyển đổi ghế thành SeatsDTO
                    {
                        SeatsId = seat.seatsId,
                        SeatsNumber = seat.seatsNumber,
                        IsTaken = seat.isTaken,
                    }).ToList()
                })
                .ToList();

            if (roomList.Any())
            {
                return new GenericRespondWithObjectDTO<List<RoomRequestGetListDTO>>()
                {
                    message = "Lấy danh sách thành công",
                    Status = GenericStatusEnum.Success.ToString(),
                    data = roomList
                };
            }
            return new GenericRespondWithObjectDTO<List<RoomRequestGetListDTO>>()
            {
                message = "Lấy danh sách thất bại , Danh sách phòng trống",
                Status = GenericStatusEnum.Failure.ToString(),
            };
        }
        
        public GenericRespondWithObjectDTO<RoomRequestGetListDTO> GetRoomDetail(string roomId)
        {
            var roomList = _context.cinemaRoom
                .Where(x => x.cinemaRoomId == roomId && !x.isDeleted)
                .Include(r => r.Seats)
                .Select(room => new RoomRequestGetListDTO
                {
                    CinemaRoomId = room.cinemaRoomId,
                    CinemaRoomNumber = room.cinemaRoomNumber,
                    Seats = room.Seats.Select(seat => new SeatsDTO // Chuyển đổi ghế thành SeatsDTO
                    {
                        SeatsId = seat.seatsId,
                        SeatsNumber = seat.seatsNumber,
                        IsTaken = seat.isTaken,
                    }).ToList()
                })
                .FirstOrDefault();

            if (roomList != null)
            {
                return new GenericRespondWithObjectDTO<RoomRequestGetListDTO>()
                {
                    message = "Lấy danh sách thành công",
                    Status = GenericStatusEnum.Success.ToString(),
                    data = roomList
                };
            }
            return new GenericRespondWithObjectDTO<RoomRequestGetListDTO>()
            {
                message = "Lấy danh sách thất bại , Danh sách phòng trống",
                Status = GenericStatusEnum.Failure.ToString(),
                data = roomList
            };
        }

        public GenericRespondWithObjectDTO<List<RoomRequestGetRoomListByVisualFormatIDDTO>> GetRoomListByVisualAndCinemaId(string CinemaId,
            string VisualFormatId)
        {
            // Tim kiem Phong
            if (String.IsNullOrEmpty(CinemaId))
            {
                return new GenericRespondWithObjectDTO<List<RoomRequestGetRoomListByVisualFormatIDDTO>>()
                {
                    Status = GenericStatusEnum.Failure.ToString(),
                    message = "Vui lòng cung cấp ID rạp."
                };
            }

            if (String.IsNullOrEmpty(VisualFormatId))
            {
                return new GenericRespondWithObjectDTO<List<RoomRequestGetRoomListByVisualFormatIDDTO>>()
                {
                    Status = GenericStatusEnum.Failure.ToString(),
                    message = "Vui lòng cung cấp ID định dạng hình ảnh."
                };
            }
            
            var findRoomList =
                _context.cinemaRoom.Where(x => x.cinemaId.Equals(CinemaId) && x.movieVisualFormatID.Equals(VisualFormatId)
                    && !x.isDeleted)
                    .Include(r => r.movieVisualFormat).GroupBy(x => x.movieVisualFormatID);
            if (findRoomList.Any())
            {
                // Loc ra thong tin
                return new GenericRespondWithObjectDTO<List<RoomRequestGetRoomListByVisualFormatIDDTO>>()
                {
                    Status = GenericStatusEnum.Success.ToString(),
                    message = "Lấy danh sách phòng thành công." ,
                    data = findRoomList.Select(x => new RoomRequestGetRoomListByVisualFormatIDDTO()
                    {
                        movieVisualFormatId = x.Key,
                        movieVisualFormatName = x.FirstOrDefault()!.movieVisualFormat.movieVisualFormatName,
                        roomList = x.Select(y => new RoomRequestGetRoomListVisualFormatDTO()
                        {
                            RoomId = y.cinemaRoomId,
                            RoomNumber = y.cinemaRoomNumber
                        }).ToList()
                    }).ToList()
                };
            }

            return new GenericRespondWithObjectDTO<List<RoomRequestGetRoomListByVisualFormatIDDTO>>()
            {
                Status = GenericStatusEnum.Failure.ToString(),
                message = "Lỗi Không thấy phòng chiếu"
            };
        }
    }