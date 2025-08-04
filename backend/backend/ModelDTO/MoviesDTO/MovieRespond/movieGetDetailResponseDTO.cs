using backend.Model.MinimumAge;
using backend.Model.Movie;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace backend.ModelDTO.MoviesDTO.MovieRespond
{
    public class movieGetDetailResponseDTO
    {

        public string movieId { get; set; } = "";
        public string movieName { get; set; } = "";
        public string movieImage { get; set; } = string.Empty;
        public string movieDescription { get; set; } = "";
        
        public Dictionary<string , string> MovieMinimumAge { get; set; } =  new Dictionary<string , string>();
        public string movieDirector { get; set; } = "";
        public string movieActor { get; set; } = "";
        public string movieTrailerUrl { get; set; } = "";
        public int movieDuration { get; set; }

        public DateTime ReleaseDate { get; set; }
        
        public Dictionary<string , string> MovieLanguage {get; set;} = new Dictionary<string , string>();
        
        public List<MovieVisualFormatGetDetailResponseDTO> movieVisualFormat { get; set; } = new List<MovieVisualFormatGetDetailResponseDTO>();
        
        public List<MovieGenreGetDetailResponseDTO> movieGenre { get; set; } = new List<MovieGenreGetDetailResponseDTO>();

    }

    public class MovieVisualFormatGetDetailResponseDTO
    {
        public string movieVisualFormatId { get; set; } = string.Empty;
        
        public string movieVisualFormatName { get; set; } = string.Empty;
    }

    public class MovieGenreGetDetailResponseDTO
    {
        public string movieGenreId { get; set; } = "";
        public string movieGenreName { get; set; } = "";
    }
    
}
