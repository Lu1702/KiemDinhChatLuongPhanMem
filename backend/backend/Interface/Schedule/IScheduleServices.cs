using backend.ModelDTO.GenericRespond;
using backend.ModelDTO.ScheduleDTO;
using backend.ModelDTO.ScheduleDTO.Request;

namespace backend.Interface.Schedule
{
    public interface IScheduleServices
    {
        Task<GenericRespondDTOs> add(string cinemaId ,ScheduleRequestDTO scheduleRequestDTO);

        Task<GenericRespondDTOs> edit(string movieScheduleId, EditScheduleDTO editScheduleDto);

        Task<GenericRespondDTOs> delete(string id);

        GenericRespondWithObjectDTO<string> getScheduleId(string cinemaRoomId , DateTime ShowDate , string HourId , string movieId);

        GenericRespondWithObjectDTO<List<GetListScheduleDTO>> getAlSchedulesByMovieName(string movieName);
        
        GenericRespondWithObjectDTO<GetVisualFormatListByMovieIdDTO> getVisualFormatListByMovieId(string movieId);

    }
}
