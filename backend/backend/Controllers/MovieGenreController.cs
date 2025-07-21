using backend.Interface.MovieGenreInterface;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MovieGenreController : Controller
{
    private readonly IMovieGenreService _movieGenreService;

    public MovieGenreController(IMovieGenreService movieGenreService)
    {
        _movieGenreService = movieGenreService;
    }

    [HttpGet("GetMovieGenreList")]
    public IActionResult GetMovieGenreList()
    {
        var getMovieGenre = _movieGenreService.GetMovieGenres();
        if (getMovieGenre.Any())
        {
            return Ok(getMovieGenre);
        }

        return NotFound();
    }
}