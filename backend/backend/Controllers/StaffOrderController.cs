using backend.Enum;
using backend.Interface.BookingInterface;
using backend.ModelDTO.BookingsDTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StaffOrderController : ControllerBase
{
    private readonly IStaffOrderService _staffOrderService;

    public StaffOrderController(IStaffOrderService staffOrderService)
    {
        _staffOrderService = staffOrderService;
    }

    [HttpPost("StaffOrder")]
    [Authorize(Policy = "Cashier")]
    public async Task<IActionResult> StaffOrder
        (string UserId,
            StaffOrderRequestDTO request
            )
    {
        var getStatus = await _staffOrderService.StaffOrder(UserId
            , request, HttpContext);
        if (getStatus.Status.Equals(GenericStatusEnum.Failure.ToString()))
        {
            return BadRequest(getStatus);
        }
        return Ok(getStatus);
    }
}