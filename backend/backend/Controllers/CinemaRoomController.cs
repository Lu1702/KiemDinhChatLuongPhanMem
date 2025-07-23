using backend.Enum;
using backend.Interface.RoomInferface;
using backend.ModelDTO.RoomDTOS;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers; 

[ApiController]
[Route("api/[controller]")] // URL cơ sở cho controller này sẽ là /api/CinemaRoom
public class CinemaRoomController : ControllerBase
{
    private readonly IRoomService _roomService;

    // Constructor injection: Cách hiện đại và được khuyến nghị trong .NET 6+
    public CinemaRoomController(IRoomService roomService)
    {
        _roomService = roomService;
    }

    // GET: api/CinemaRoom/GetRoomInfo?movieID=...&scheduleDate=...&HourId=...&movieVisualID=...
    [HttpGet("GetRoomInfo")]
    public IActionResult GetRoomInfo(
        [FromQuery] string movieID,
        [FromQuery] DateTime scheduleDate,
        [FromQuery] string HourId,
        [FromQuery] string movieVisualID)
    {
        var result = _roomService.getRoomInfo(movieID, scheduleDate, HourId, movieVisualID);
        if (result.Status.Equals(GenericStatusEnum.Failure.ToString()))
        {
            return BadRequest(result);
        }
        return Ok(result);
    }


    // POST: api/CinemaRoom/CreateRoom
    [HttpPost("CreateRoom")]
    [Authorize(Policy = "FacilitiesManager")]
    public async Task<IActionResult> CreateRoom([FromBody] RoomCreateRequestDTO roomCreateRequestDTO)
    {
        var result = await _roomService.CreateRoom(roomCreateRequestDTO);
        if (result.Status.Equals(GenericStatusEnum.Failure.ToString()))
        {
            return BadRequest(result);
        }
        return Ok(result);
    }


    // PUT: api/CinemaRoom/UpdateRoom/{RoomId}
    [HttpPut("UpdateRoom/{RoomId}")]
    [Authorize(Policy = "FacilitiesManager")]
    public async Task<IActionResult> UpdateRoom(
        [FromRoute] string RoomId, // Lấy RoomId từ URL Segment
        [FromBody] RoomEditRequestDTO roomEditRequestDTO)
    {
        var result = await _roomService.UpdateRoom(RoomId, roomEditRequestDTO);
        if (result.Status.Equals(GenericStatusEnum.Failure.ToString()))
        {
            return BadRequest(result);
        }
        return Ok(result);
    }


    // DELETE: api/CinemaRoom/DeleteRoom/{RoomId}
    [HttpDelete("DeleteRoom/{RoomId}")]
    [Authorize(Policy = "FacilitiesManager")]
    public async Task<IActionResult> DeleteRoom([FromRoute] string RoomId)
    {
        var result = await _roomService.DeleteRoom(RoomId);
        if (result.Status.Equals(GenericStatusEnum.Failure.ToString()))
        {
            return BadRequest(result);
        }
        return Ok(result);
    }


    // GET: api/CinemaRoom/GetRoomList
    [HttpGet("GetRoomList")]
    public IActionResult GetRoomList()
    {
        var result = _roomService.GetRoomList();
        if (result.Status.Equals(GenericStatusEnum.Failure.ToString()))
        {
            return BadRequest(result);
        }
        return Ok(result);
    }


    // GET: api/CinemaRoom/SearchRoomByCinemaId?CinemaId=...
    [HttpGet("SearchRoomByCinemaId")]
    public IActionResult SearchRoomByCinemaId([FromQuery] string CinemaId)
    {
        var result = _roomService.SearchRoomByCinemaId(CinemaId);
        if (result.Status.Equals(GenericStatusEnum.Failure.ToString()))
        {
            return BadRequest(result);
        }
        return Ok(result);
    }


    // GET: api/CinemaRoom/GetRoomDetail/{roomId}
    [HttpGet("GetRoomDetail/{roomId}")]
    public IActionResult GetRoomDetail([FromRoute] string roomId)
    {
        var result = _roomService.GetRoomDetail(roomId);
        if (result.Status.Equals(GenericStatusEnum.Failure.ToString()))
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpGet("GetRoomByCinemaIdAndVisualId")]
    public IActionResult GetRoomByCinemaIdAndVisualId(string cinemaId, string visualId)
    {
        var result = _roomService.GetRoomListByVisualAndCinemaId(cinemaId, visualId);
        if (result.Status.Equals(GenericStatusEnum.Failure.ToString()))
        {
            return BadRequest(result);
        }
        return Ok(result);
    }
}