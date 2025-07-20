using backend.Enum;
using backend.Interface.CinemaInterface;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CinemaController : ControllerBase
{
    private readonly ICinemaService _cinemaService;

    public CinemaController(ICinemaService cinemaService)
    {
        _cinemaService = cinemaService;
    }
    // Lấy danh sách lịch chiếu dựa vào phim id và thể loại
    [HttpGet("getCinemaInfoBookingService")]
    public IActionResult getCinemaInfoBookingService(string MovieID , string movieVisualFormatID)
    {
        var getStatus = _cinemaService.GetCinemaDetailBooking(MovieID,movieVisualFormatID);
        if (getStatus.Status.Equals(GenericStatusEnum.Failure.ToString()))
        {
            return BadRequest(getStatus);
        }
        return Ok(getStatus);
    }
}