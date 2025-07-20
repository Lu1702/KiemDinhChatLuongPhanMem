using backend.Data;
using backend.Enum;
using backend.Interface.CinemaInterface;
using backend.Model.Cinemas;
using backend.ModelDTO.CinemaDTOs;
using backend.ModelDTO.GenericRespond;
using Microsoft.EntityFrameworkCore;

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

    public GenericRespondDTOs AddCinema(CreateCinemaDTO cinema)
    {
        return null!;
    }

    public GenericRespondDTOs EditCinema(string cinemaId, EditCinemaDTO cinema)
    {
        return null!;
    }

    public GenericRespondDTOs DeleteCinema(string cinemaId)
    {
        return null!;
    }

    public GenericRespondWithObjectDTO<GetCinemaListDTO> GetCinemaList()
    {
        return null!;
    }

    public GenericRespondWithObjectDTO<GetCinemaDetailDTO> GetCinemaDetail(string cinemaId)
    {
        return null!;
    }
}