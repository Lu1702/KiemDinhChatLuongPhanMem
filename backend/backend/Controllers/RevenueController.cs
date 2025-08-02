using backend.Enum;
using backend.Interface.RevenueInterface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RevenueController : ControllerBase
{
    private readonly IRevenueService _revenueService;

    public RevenueController(IRevenueService revenueService)
    {
        this._revenueService = revenueService;
    }

    [HttpGet("GetRevenueByCinemaId")]
    [Authorize(Policy = "Director")]
    public async Task<IActionResult> GetRevenueByCinemaId(string cinemaId)
    {
        var getData = await _revenueService.GetRevenueByCinemaId(cinemaId);
        if (getData.Status.Equals(GenericStatusEnum.Failure.ToString()))
        {
            return BadRequest(getData);
        }
        return Ok(getData);
    }

    [HttpGet("GetAllRevenue")]
    [Authorize(Policy = "Director")]
    public async Task<IActionResult> GetAllRevenue()
    {
        var getData = await _revenueService.GetAllRevenue();
        if (getData.Status.Equals(GenericStatusEnum.Failure.ToString()))
        {
            return BadRequest(getData);
        }
        return Ok(getData);
    }
}