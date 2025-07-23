using backend.ModelDTO.GenericRespond;
using backend.ModelDTO.ScheduleDTO;
using backend.ModelDTO.ScheduleDTO.Request;

namespace backend.Interface.Schedule
{
    public interface IScheduleServices
    {
        Task<GenericRespondDTOs> add(string cinemaId ,ScheduleRequestDTO scheduleRequestDTO);

        Task<bool> edit(string id ,ScheduleRequestDTO scheduleRequestDTO);

        Task<GenericRespondDTOs> delete(string id);

        GenericRespondWithObjectDTO<List<GetListScheduleDTO>> getAlSchedulesByMovieName(string movieName);
        
        GenericRespondWithObjectDTO<GetVisualFormatListByMovieIdDTO> getVisualFormatListByMovieId(string movieId);

    }
}
