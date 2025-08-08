using backend.Data;
using backend.Interface.MovieGenreInterface;
using backend.ModelDTO.MovieVisualFormatDTOs;

namespace backend.Services.MovieGenreServices;

public class MovieGenreService : IMovieGenreService
{
    private readonly DataContext _context;

    public MovieGenreService(DataContext context)
    {
        _context = context;
    }
    
    public List<GetMovieGenreListDTO> GetMovieGenres()
    {
        return _context.movieGenre.Select(x => new GetMovieGenreListDTO()
        {
            GenreId = x.movieGenreId ,
            GenreName = x.movieGenreName
        }).ToList();
    }
}