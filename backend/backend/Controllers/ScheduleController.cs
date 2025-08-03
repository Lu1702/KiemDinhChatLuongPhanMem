using backend.Data;
using backend.Enum;
using backend.Interface.Schedule;
using backend.ModelDTO.ScheduleDTO;
using backend.ModelDTO.ScheduleDTO.Request;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ScheduleController : ControllerBase
    {
        private readonly IScheduleServices scheduleServices;
        
        private readonly DataContext dataContext;

        public ScheduleController(IScheduleServices scheduleServices , DataContext dataContext)
        {
            this.scheduleServices = scheduleServices;
            this.dataContext = dataContext;
        }
        [HttpPost("addSchedule")]
        [Authorize(Policy = "TheaterManager")]
        public async Task<IActionResult> addSchedule(string cinemaId ,ScheduleRequestDTO scheduleRequestDTO)
        {
            var status = await scheduleServices.add(cinemaId, scheduleRequestDTO);
            if (status.Status.Equals(GenericStatusEnum.Failure.ToString()))
            {
                return BadRequest(status);
            }
            return Ok(status);
        }

        [HttpPatch("editSchedule/{id}")]
        [Authorize(Policy = "TheaterManager")]
        public async Task<IActionResult> editSchedule(string id, EditScheduleDTO edit)
        {
            var status = await scheduleServices.edit(id, edit);
            if (status.Status.Equals(GenericStatusEnum.Failure.ToString()))
            {
                return BadRequest(new { message = "thay đổi thất bại do có lỗi =(" });
            }
            return Ok(new { message = "Đã thay đổi thành công" });
        }

        [HttpDelete("removeSchedule/{id}")]
        [Authorize(Policy = "TheaterManager")]
        public async Task<IActionResult> removeSchedule(string id)
        {
            var status = await scheduleServices.delete(id);
            if (status.Status.Equals(GenericStatusEnum.Success.ToString())) 
            {
                return Ok(status);
            }
            return BadRequest(status);
        }

        [HttpGet("getScheduleByName")]
        public IActionResult getScheduleByName([FromQuery] string name)
        {
            var findStatus = scheduleServices.getAlSchedulesByMovieName(name);
            if (findStatus.Status.Equals(GenericStatusEnum.Failure.ToString()))
            {
                return BadRequest(findStatus);
            }
            return Ok(findStatus);
        }
        
        
        [Authorize(Policy = "TheaterManager")]
        [HttpGet("GetMovieVisualFormatByMovieId")]
        public IActionResult getMovieVisualFormatById(string movieId)
        {
            var getStatus = scheduleServices.getVisualFormatListByMovieId(movieId);
            if (getStatus.Status.Equals(GenericStatusEnum.Failure.ToString()))
            {
                return BadRequest(getStatus);
            }
            return Ok(getStatus);
        }

        [HttpGet("GetAllTimes")]
        public IActionResult GetAllTimes()
        {
            var getAllTimes = dataContext.HourSchedule
                .Select(x => new
                {
                    HourScheduleID = x.HourScheduleID,
                    HourScheduleShowTime = x.HourScheduleShowTime
                });
            return Ok(getAllTimes);
        }

        [HttpGet("getMovieScheduleId")]
        public IActionResult GetMovieScheduleId(string movieId , string HourId , string cinemaRooomId , DateTime showDate)
        {
            var getStatus = scheduleServices.getScheduleId
                (cinemaRooomId, showDate, HourId, movieId);
            if (getStatus.Status.Equals(GenericStatusEnum.Success.ToString()))
            {
                return Ok(getStatus);
            }
            return NotFound(getStatus);
        }
    }
}
