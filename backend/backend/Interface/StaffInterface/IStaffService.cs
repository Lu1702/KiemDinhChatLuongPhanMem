using backend.ModelDTO.GenericRespond;
using backend.ModelDTO.StaffDTOs;

namespace backend.Interface.StaffInterface;

public interface IStaffService
{
    Task<GenericRespondDTOs> addStaff(CreateStaffDTO createStaffDTO);
    
    Task<GenericRespondDTOs> EditStaff(string id , EditStaffDTO editStaffDTO);
    
    Task<GenericRespondDTOs> DeleteStaff(string id);
    
    GenericRespondWithObjectDTO<List<RoleInfoListDTO>> getRoles();
    
    GenericRespondWithObjectDTO<List<GetStaffInfoDTO>> GetStaffListInfo();
    
    GenericRespondWithObjectDTO<GetStaffInfoDTO> GetStaffInfo(string id);
}