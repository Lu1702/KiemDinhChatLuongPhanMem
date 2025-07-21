using backend.ModelDTO.MovieVisualFormatDTOs;

namespace backend.Interface.MovieGenreInterface;

public interface IMovieGenreService
{
    List<GetMovieGenreListDTO> GetMovieGenres();

}