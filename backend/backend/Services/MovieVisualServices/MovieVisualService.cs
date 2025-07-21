using backend.Data;
using backend.Interface.VisualFormatInterface;
using backend.ModelDTO.MovieVisualFormatDTOs;

namespace backend.Services.MovieVisualServices;

public class MovieVisualService : IMovieVisualFormatService
{
    private readonly DataContext _context;

    public MovieVisualService(DataContext context)
    {
        _context = context;
    }
    public List<GetMovieVisualListDTO> GetMovieVisualListDTO()
    {
        return _context.movieVisualFormat.Select(x => new GetMovieVisualListDTO()
        {
            MovieVisualId = x.movieVisualFormatId ,
            MovieVisualFormatDetail = x.movieVisualFormatName
        }).ToList();
    }

}