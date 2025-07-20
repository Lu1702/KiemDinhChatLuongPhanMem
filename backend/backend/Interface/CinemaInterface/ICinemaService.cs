using backend.ModelDTO.CinemaDTOs;
using backend.ModelDTO.GenericRespond;

namespace backend.Interface.CinemaInterface;

public interface ICinemaService
{
    GenericRespondWithObjectDTO<List<GetCinemaDetailBookingDTO>> GetCinemaDetailBooking(string movieID , string movieVisualId);

    GenericRespondDTOs AddCinema(CreateCinemaDTO cinema);
    
    GenericRespondDTOs EditCinema(string cinemaId ,EditCinemaDTO cinema);
    
    GenericRespondDTOs DeleteCinema(string cinemaId);
    
    GenericRespondWithObjectDTO<GetCinemaListDTO> GetCinemaList();

    GenericRespondWithObjectDTO<GetCinemaDetailDTO> GetCinemaDetail(string cinemaId);

}