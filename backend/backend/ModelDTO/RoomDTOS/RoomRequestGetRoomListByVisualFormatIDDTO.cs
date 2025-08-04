namespace backend.ModelDTO.RoomDTOS;

public class RoomRequestGetRoomListByVisualFormatIDDTO
{
    public string movieVisualFormatId { get; set; } = string.Empty;
    
    public string movieVisualFormatName { get; set; } = string.Empty;

    public List<RoomRequestGetRoomListVisualFormatDTO>
        roomList { get; set; } = [];
}

public class RoomRequestGetRoomListVisualFormatDTO
{
    public string RoomId { get; set; }= string.Empty;
    
    public int RoomNumber { get; set; }
}