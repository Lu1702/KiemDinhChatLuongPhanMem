using backend.ModelDTO.MovieVisualFormatDTOs;

namespace backend.Interface.VisualFormatInterface;

public interface IMovieVisualFormatService
{
    List<GetMovieVisualListDTO> GetMovieVisualListDTO();
}