using backend.Interface.VisualFormatInterface;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MovieVisualFormatController : ControllerBase
{
    private IMovieVisualFormatService _movieVisualFormatService;

    public MovieVisualFormatController(IMovieVisualFormatService movieVisualFormatService)
    {
        _movieVisualFormatService = movieVisualFormatService;
    }

    [HttpGet("GetMovieVisualFormatList")]
    public IActionResult GetMovieVisualFormatList()
    {
        var getMovieVisualFormatList = _movieVisualFormatService.GetMovieVisualListDTO();
        if (getMovieVisualFormatList.Any())
        {
            return Ok(getMovieVisualFormatList);
        }
        return NotFound();
    }
}