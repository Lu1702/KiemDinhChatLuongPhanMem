using backend.Enum;
using backend.Interface.CinemaInterface;
using backend.ModelDTO.CinemaDTOs;
using Microsoft.AspNetCore.Authorization;
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

    [HttpGet("getCinemaInfoBookingService")]
    public async Task<IActionResult> GetCinemaInfoBookingService([FromQuery] string MovieID, [FromQuery] string movieVisualFormatID)
    {
        // Kiểm tra đầu vào cơ bản
        if (string.IsNullOrEmpty(MovieID) || string.IsNullOrEmpty(movieVisualFormatID))
        {
            return BadRequest(new { Status = GenericStatusEnum.Failure.ToString(), message = "MovieID và movieVisualFormatID không được để trống." });
        }

        var getStatus = _cinemaService.GetCinemaDetailBooking(MovieID, movieVisualFormatID);
        
        // Kiểm tra phản hồi từ service và trả về kết quả tương ứng
        if (getStatus.Status.Equals(GenericStatusEnum.Failure.ToString()))
        {
            return BadRequest(getStatus); // Có thể là NotFound nếu không tìm thấy, tùy thuộc vào message
        }
        return Ok(getStatus);
    }

    // Thêm rạp chiếu phim mới
    [HttpPost("addCinema")]
    [Authorize(Policy = "FacilitiesManager")]
    public async Task<IActionResult> AddCinema([FromBody] CreateCinemaDTO cinema)
    {
        if (cinema == null)
        {
            return BadRequest(new { Status = GenericStatusEnum.Failure.ToString(), message = "Dữ liệu rạp chiếu không được để trống." });
        }

        var result = await _cinemaService.AddCinema(cinema);

        if (result.Status.Equals(GenericStatusEnum.Failure.ToString()))
        {
            return BadRequest(result); // Trả về lỗi nếu service báo thất bại
        }
        return Ok(result); // Trả về thành công
    }

    // Chỉnh sửa thông tin rạp chiếu phim
    [HttpPut("editCinema/{cinemaId}")]
    [Authorize(Policy = "FacilitiesManager")]
    public async Task<IActionResult> EditCinema(string cinemaId, [FromBody] EditCinemaDTO cinema)
    {
        // Kiểm tra ID rạp và DTO đầu vào
        if (string.IsNullOrEmpty(cinemaId))
        {
            return BadRequest(new { Status = GenericStatusEnum.Failure.ToString(), message = "ID rạp không được để trống." });
        }
        if (cinema == null)
        {
            return BadRequest(new { Status = GenericStatusEnum.Failure.ToString(), message = "Dữ liệu rạp chiếu không được để trống." });
        }
        // Có thể thêm các kiểm tra validation khác cho cinema DTO ở đây

        var result = await _cinemaService.EditCinema(cinemaId, cinema);

        if (result.Status.Equals(GenericStatusEnum.Failure.ToString()))
        {
            // Trả về BadRequest cho các lỗi nghiệp vụ hoặc lỗi không tìm thấy
            // Tùy thuộc vào message từ service mà bạn có thể trả về NotFound() nếu lỗi là "Không tìm thấy rạp"
            return BadRequest(result);
        }
        return Ok(result);
    }

    // Xóa rạp chiếu phim (soft delete)
    [HttpDelete("deleteCinema/{cinemaId}")]
    [Authorize(Policy = "FacilitiesManager")]
    public async Task<IActionResult> DeleteCinema(string cinemaId)
    {
        if (string.IsNullOrEmpty(cinemaId))
        {
            return BadRequest(new { Status = GenericStatusEnum.Failure.ToString(), message = "ID rạp không được để trống." });
        }

        var result = await _cinemaService.DeleteCinema(cinemaId);

        if (result.Status.Equals(GenericStatusEnum.Failure.ToString()))
        {
            // Tương tự, tùy thuộc vào message từ service mà có thể trả về NotFound()
            return BadRequest(result);
        }
        return Ok(result);
    }
    
    // Lấy danh sách rạp chiếu phim
    [HttpGet("getCinemaList")]
    public async Task<IActionResult> GetCinemaList()
    {
        var getStatus = _cinemaService.GetCinemaList();

        if (getStatus.Status.Equals(GenericStatusEnum.Failure.ToString()))
        {
            return BadRequest(getStatus);
        }
        return Ok(getStatus);
    }

    // Lấy chi tiết rạp chiếu phim theo ID
    [HttpGet("getCinemaDetail/{cinemaId}")]
    public async Task<IActionResult> GetCinemaDetail(string cinemaId)
    {
        if (string.IsNullOrEmpty(cinemaId))
        {
            return BadRequest(new { Status = GenericStatusEnum.Failure.ToString(), message = "ID rạp không được để trống." });
        }

        var getStatus = _cinemaService.GetCinemaDetail(cinemaId);

        if (getStatus.Status.Equals(GenericStatusEnum.Failure.ToString()))
        {
            // Nếu không tìm thấy, có thể trả về NotFound thay vì BadRequest
            return NotFound(getStatus); 
        }
        
        return Ok(getStatus);
    }
}