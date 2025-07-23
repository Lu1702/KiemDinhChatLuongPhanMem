using backend.ModelDTO.GenericRespond;
using backend.ModelDTO.RoomDTOS;

namespace backend.Interface.RoomInferface;

public interface IRoomService
{
    GenericRespondWithObjectDTO<RoomRequestGetListDTO>  getRoomInfo(string movieID , DateTime scheduleDate ,  string HourId , string movieVisualID);

    Task<GenericRespondDTOs> CreateRoom(RoomCreateRequestDTO roomCreateRequestDTO);

    Task<GenericRespondDTOs> UpdateRoom(string RoomId , RoomEditRequestDTO roomEditRequestDTO);
    
    Task<GenericRespondDTOs> DeleteRoom(string RoomId);
    
    GenericRespondWithObjectDTO<List<RoomRequestGetListDTO>> GetRoomList();
    
    GenericRespondWithObjectDTO<List<RoomRequestGetListDTO>> SearchRoomByCinemaId(string CinemaId);

    GenericRespondWithObjectDTO<RoomRequestGetListDTO> GetRoomDetail(string roomId);
    
    GenericRespondWithObjectDTO<List<RoomRequestGetRoomListByVisualFormatIDDTO>> GetRoomListByVisualAndCinemaId(string CinemaId , string VisualFormatId);
}