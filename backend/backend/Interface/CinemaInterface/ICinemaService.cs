using backend.ModelDTO.CinemaDTOs;
using backend.ModelDTO.GenericRespond;

namespace backend.Interface.CinemaInterface;

public interface ICinemaService
{
    GenericRespondWithObjectDTO<List<GetCinemaDetailBookingDTO>> GetCinemaDetailBooking(string movieID , string movieVisualId);

    Task<GenericRespondDTOs> AddCinema(CreateCinemaDTO cinema);
    
    Task<GenericRespondDTOs> EditCinema(string cinemaId ,EditCinemaDTO cinema);
    
    Task<GenericRespondDTOs> DeleteCinema(string cinemaId);
    
    GenericRespondWithObjectDTO<List<GetCinemaListDTO>> GetCinemaList();

    GenericRespondWithObjectDTO<GetCinemaDetailDTO> GetCinemaDetail(string cinemaId);

}