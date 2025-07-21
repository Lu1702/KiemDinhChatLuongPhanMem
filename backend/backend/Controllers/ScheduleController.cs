using backend.Enum;
using backend.Interface.Schedule;
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

        public ScheduleController(IScheduleServices scheduleServices)
        {
            this.scheduleServices = scheduleServices;
        }
        [HttpPost("addSchedule")]
        [Authorize(Policy = "TheaterManager")]
        public async Task<IActionResult> addSchedule(ScheduleRequestDTO scheduleRequestDTO)
        {
            var status = await scheduleServices.add(scheduleRequestDTO);
            if (status.Status.StartsWith("F"))
            {
                return BadRequest(status);
            }
            return Ok(status);
        }

        [HttpPatch("editSchedule/{id}")]
        [Authorize(Policy = "TheaterManager")]
        public async Task<IActionResult> editSchedule(string id, ScheduleRequestDTO scheduleRequestDTO)
        {
            var status = await scheduleServices.edit(id, scheduleRequestDTO);
            if (status)
            {
                return Ok(new { message = "Đã thay đổi thành công" });
            }
            return BadRequest(new { message = "thay đổi thất bại do có lỗi =(" });
        }

        [HttpDelete("removeSchedule/{id}")]
        [Authorize(Policy = "TheaterManager")]
        public async Task<IActionResult> removeSchedule(string id, string options)
        {
            var status = await scheduleServices.delete(id, options);
            if (status) 
            {
                return Ok(new { message = "Đã xóa thành công" });
            }
            return BadRequest(new {message = "Xóa thất bại do có người đã đặt lịch này"});
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
        
    }
}
