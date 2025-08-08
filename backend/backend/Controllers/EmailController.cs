using backend.Enum;
using backend.Interface.EmailInterface;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmailController : ControllerBase
{
    private readonly IEmailService _emailService;

    public EmailController(IEmailService emailService)
    {
        _emailService = emailService;
    }

    [HttpPost("send")]
    public async Task<IActionResult> SendEmail([FromQuery] string email)
    {
        var getStatus = await _emailService.SendOtp(email);
        if (getStatus.Status.Equals(GenericStatusEnum.Failure.ToString()))
        {
            return BadRequest(getStatus);
        }
        return Ok(getStatus);
    }
}