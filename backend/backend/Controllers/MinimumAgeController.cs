using backend.Data;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;
[ApiController]
[Route("api/[controller]")]
public class MinimumAgeController : ControllerBase
{
    private readonly DataContext _context;

    public MinimumAgeController(DataContext context)
    {
        _context = context;
    }
    
    [HttpGet("GetMinimumAge")]
    public IActionResult Index()
    {
        return Ok(_context.minimumAges.Select(x => new
        {
            minimumAgeID = x.minimumAgeID,
            minimumAgeInfo = x.minimumAgeInfo ,
            minimumAgeDescription = x.minimumAgeDescription
        }));
    }
}