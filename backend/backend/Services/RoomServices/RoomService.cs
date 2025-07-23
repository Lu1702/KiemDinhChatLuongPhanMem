    using backend.Data;
    using backend.Enum;
    using backend.Interface.RoomInferface;
    using backend.Model.CinemaRoom;
    using backend.ModelDTO.GenericRespond;
    using backend.ModelDTO.RoomDTOS;
    using Microsoft.EntityFrameworkCore;
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
                && x.ScheduleDate > DateTime.Now);

            if (getRoomID != null)
            {
                // Tiep tuc truy van toi bang room
                var getSeatsNumber = _context.Seats.Include
                    (x => x.cinemaRoom)
                    .Where(x => x.cinemaRoomId.Equals(getRoomID.cinemaRoomId) && !x.isDelete);
                
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
                    message = "Nhap Thieu Thong Tin"
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
                        message = "Phong Da Ton Tai Ko tao duoc",
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
                    var findRoom = _context.cinemaRoom.
                        FirstOrDefault(x => x.cinemaRoomId == RoomId);
                    var findSeats = _context.Seats.Where(x => x.cinemaRoomId == RoomId);
                    if (findRoom != null && findSeats.Any())
                    {
                        // Kiem Tra Xem Phong Co ton tai hay chua
                        if (!_context.cinemaRoom.Any(x => x.cinemaRoomNumber.Equals(roomEditRequestDTO.RoomNumber)
                                                          && x.cinemaId.Equals(roomEditRequestDTO.CinemaID)))
                        {
                           // Neu Chua co ai thanh toan ghe thi duoc thay doi
                           if (!_context.TicketOrderDetail
                                   .Any(x => findSeats.Select(x => x.seatsId).Contains(x.seatsId)))
                           {
                               string CinemaId = String.IsNullOrEmpty(roomEditRequestDTO.CinemaID) ? findRoom.cinemaId : roomEditRequestDTO.CinemaID;
                               int CinemaRoomNumber = roomEditRequestDTO.RoomNumber ?? findRoom.cinemaRoomNumber;
                               string movieVisualID = String.IsNullOrEmpty(roomEditRequestDTO.VisualFormatID) ? findRoom.movieVisualFormatID : roomEditRequestDTO.VisualFormatID;

                               if (roomEditRequestDTO.SeatsNumber.Any())
                               {
                                   _context.Seats.RemoveRange(findSeats);

                                   List<Seats> SeatsList = new List<Seats>();
                                   foreach (var newSeat in roomEditRequestDTO.SeatsNumber)
                                   {
                                       var SeatId = Guid.NewGuid().ToString();
                                       SeatsList.Add(new Seats()
                                       {
                                           seatsId = SeatId,
                                           isDelete = false,
                                           isTaken = false,
                                           seatsNumber = newSeat,
                                           cinemaRoomId = findRoom.cinemaRoomId,
                                       });
                                   }
                                   
                                   await _context.Seats.AddRangeAsync(SeatsList);
                               }
                               
                               findRoom.cinemaId = CinemaId;
                               findRoom.cinemaRoomNumber = CinemaRoomNumber;
                               findRoom.movieVisualFormatID = movieVisualID;
                               
                               _context.cinemaRoom.Update(findRoom);

                               await _context.SaveChangesAsync();
                               
                               await transaction.CommitAsync();
                               
                               return new GenericRespondDTOs()
                               {
                                   Status = GenericStatusEnum.Success.ToString(),
                                   message = "Chinhr Sua thanh cong",
                               };
                           }
                           return new GenericRespondDTOs()
                           {
                               Status = GenericStatusEnum.Failure.ToString(),
                               message = "Khong Sua Thong Tin Phong Duoc Do Da Co Nguoi Dat",
                           };
                        }
                        return new GenericRespondDTOs()
                        {
                            Status = GenericStatusEnum.Failure.ToString(),
                            message = "Phong Da Ton Tai Ko Edit Duoc",
                        };
                    }
                    return new GenericRespondDTOs()
                    {
                        Status = GenericStatusEnum.Failure.ToString(),
                        message = "Khong Tim Thay Phong",
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
                        
                        if (findOrder.Any(x => x.Order.PaymentStatus.Equals(PaymentStatus.PaymentSuccess)))
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