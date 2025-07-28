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
        public Dictionary<string , string> movieVisualFormat { get; set; } = new Dictionary<string , string>();
        public Dictionary<string , string> movieGenre { get; set; } = new Dictionary<string , string>();

    }
    
}
