using System.Data.Common;
using backend.Data;
using backend.Enum;
using backend.Interface.StaffInterface;
using backend.Model.Auth;
using backend.Model.Staff_Customer;
using backend.ModelDTO.GenericRespond;
using backend.ModelDTO.StaffDTOs;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.StaffService;

public class StaffService(DataContext dbContext) : IStaffService
{
    private readonly DataContext _context = dbContext;
    public async Task<GenericRespondDTOs> addStaff(CreateStaffDTO createStaffDTO)
    {
        var transition = await _context.Database.BeginTransactionAsync();
        try
        {
            var generateUserId = Guid.NewGuid().ToString();
            var generateStaffId = Guid.NewGuid().ToString();

            var bcryptStaffPassword = BCrypt.Net.BCrypt.HashPassword(createStaffDTO.LoginUserPassword);

            await _context.userRoleInformation.AddAsync(new userRoleInformation()
            {
                userId = generateUserId,
                roleId = "1a8f7b9c-d4e5-4f6a-b7c8-9d0e1f2a3b4c"
            });
            
            // Them Tai khoan
            await _context.userInformation.AddAsync(new userInformation()
            {
                userId = generateUserId,
                loginUserEmail = createStaffDTO.LoginUserEmail,
                loginUserPassword = bcryptStaffPassword,
            });

            await _context.Staff.AddAsync(new Staff()
            {
                Name = createStaffDTO.StaffName ,
                cinemaID = createStaffDTO.CinemaId ,
                dateOfBirth = createStaffDTO.DateOfBirth,
                phoneNumber = createStaffDTO.PhoneNumer ,
                userID = generateUserId ,
                Id = generateStaffId
            });
            
            await _context.SaveChangesAsync();
            
            await transition.CommitAsync();

            return new GenericRespondDTOs()
            {
                Status = GenericStatusEnum.Success.ToString(),
                message = "Staff created successfully!"
            };
        }
        catch(Exception ex)
        {
            await transition.RollbackAsync();
            return new GenericRespondDTOs()
            {
                Status = GenericStatusEnum.Failure.ToString(),
                message = "Staff creation failed! + Error : " + ex.Message
            };
        }
    }

    public async Task<GenericRespondDTOs> EditStaff(string id, EditStaffDTO editStaffDTO)
    {
        if (!String.IsNullOrEmpty(id))
        {
            var findStaff = await _context.Staff.FindAsync(id);
            if (findStaff != null)
            {
                string StaffName = 
                    String.IsNullOrEmpty(editStaffDTO.StaffName) ? findStaff.Name : editStaffDTO.StaffName;
                string PhoneNumber = 
                    string.IsNullOrEmpty(editStaffDTO.PhoneNumer) ? findStaff.phoneNumber : editStaffDTO.PhoneNumer;
                string CinemaId = 
                    string.IsNullOrEmpty(editStaffDTO.CinemaId) ? findStaff.cinemaID : editStaffDTO.CinemaId;
                DateTime staffDateOfBirth = editStaffDTO.DateOfBirth ?? findStaff.dateOfBirth;

                try
                {
                    findStaff.Name = StaffName;
                    findStaff.phoneNumber = PhoneNumber;
                    findStaff.cinemaID = CinemaId;
                    findStaff.dateOfBirth = staffDateOfBirth;
                    _context.Staff.Update(findStaff);
                    await _context.SaveChangesAsync();
                    
                    return new GenericRespondDTOs()
                    {
                        Status = GenericStatusEnum.Success.ToString(),
                        message = "The Staff updated successfully!"
                    };
                }
                catch (Exception ex)
                {
                    return new GenericRespondDTOs()
                    {
                        Status = GenericStatusEnum.Failure.ToString(),
                        message = "Loi DB"
                    };
                }
                
            }
            return new GenericRespondDTOs()
            {
                Status = GenericStatusEnum.Failure.ToString(),
                message = "Staff edited Failed , Error : " + $"Khong Tim Thay Staff Co ID {id}"
            };
        }

        return new GenericRespondDTOs()
        {
            Status = GenericStatusEnum.Failure.ToString(),
            message = "Ban Chua Co ID"
        };
    }

    public async Task<GenericRespondDTOs> DeleteStaff(string id)
    {
        if (!String.IsNullOrEmpty(id))
        {
            var findStaff = await _context.Staff.FindAsync(id);
            if (findStaff != null)
            {
                var findUserInfo = await _context.userInformation.FirstOrDefaultAsync(x => x.userId.Equals(findStaff.userID));
                if (findUserInfo != null)
                {
                    await using var transaction = await _context.Database.BeginTransactionAsync();
                    try
                    {
                        _context.userInformation.Remove
                            (findUserInfo);
                        _context.Staff.Remove(findStaff);
                        await _context.SaveChangesAsync();
                        await transaction.CommitAsync();
                        
                        return new GenericRespondDTOs()
                        {
                            Status = GenericStatusEnum.Success.ToString(),
                            message = "Removed Staff successfully!"
                        };
                    }
                    catch (DbException ex)
                    {
                        await transaction.RollbackAsync();
                        return new GenericRespondDTOs()
                        {
                            Status = GenericStatusEnum.Failure.ToString(),
                            message = "Loi DB"
                        };
                    }
                }
                return new GenericRespondDTOs()
                {
                    Status = GenericStatusEnum.Failure.ToString(),
                    message = "Khong Tim thay Nguoi Dung"
                };
            }
            return new GenericRespondDTOs()
            {
                Status = GenericStatusEnum.Failure.ToString(),
                message = "Khong Tim Thay Staff Co Id" + id
            };
        }
        
        return new GenericRespondDTOs()
        {
            Status = GenericStatusEnum.Failure.ToString(),
            message = "Ban Chua Co ID"
        };
    }

    public GenericRespondWithObjectDTO<List<GetStaffInfoDTO>> GetStaffListInfo()
    {
        try
        {
            var staffList = _context.Staff
                .Include(x => x.Cinema).ToList();

            if (staffList.Count > 0)
            {
                List<GetStaffInfoDTO> staffInfoList = new List<GetStaffInfoDTO>();
                foreach (var staffInfo in staffList)
                {
                    var getStaffRole = _context.userRoleInformation
                        .Where(x => x.userId.Equals(staffInfo.userID))
                        .Include(x => x.roleInformation);
                    staffInfoList.Add(new GetStaffInfoDTO
                    {
                        StaffName = staffInfo.Name,
                        CinenaName = staffInfo.Cinema.cinemaName,
                        DayOfBirth = staffInfo.dateOfBirth,
                        StaffId = staffInfo.Id,
                        CinemaId = staffInfo.Cinema.cinemaId,
                        StaffPhoneNumber = staffInfo.phoneNumber,
                        StaffRole = String.Join(",", getStaffRole.Select(x => x.roleInformation.roleName)),
                    });
                }

                return new GenericRespondWithObjectDTO<List<GetStaffInfoDTO>>()
                {
                    Status = GenericStatusEnum.Success.ToString(),
                    message = "Staff List",
                    data = staffInfoList
                };
            }

            return new GenericRespondWithObjectDTO<List<GetStaffInfoDTO>>()
            {
                Status = GenericStatusEnum.Failure.ToString(),
                message = "Error"
            };
        }
        catch (DbException db)
        {
            return new GenericRespondWithObjectDTO<List<GetStaffInfoDTO>>()
            {
                Status = GenericStatusEnum.Failure.ToString(),
                message = $"Database Error + {db.ToString()}"
            };
        }
    }

    public GenericRespondWithObjectDTO<GetStaffInfoDTO> GetStaffInfo(string id)
    {
        try
        {
            var findStaff = _context.Staff.Include(x => x.Cinema).FirstOrDefault(x => x.Id.Equals(id));
            if (findStaff != null)
            {
                var staffRole = _context.userRoleInformation
                    .Where(x => x.userId.Equals(findStaff.userID))
                    .Include(x => x.roleInformation);
                if (staffRole.Any())
                {
                    return new GenericRespondWithObjectDTO<GetStaffInfoDTO>()
                    {
                        Status = GenericStatusEnum.Success.ToString(),
                        message = "Staff Info",
                        data = new GetStaffInfoDTO()
                        {
                            StaffName = findStaff.Name,
                            CinenaName = findStaff.Cinema.cinemaName,
                            DayOfBirth = findStaff.dateOfBirth,
                            StaffId = findStaff.Id,
                            CinemaId = findStaff.Cinema.cinemaId,
                            StaffPhoneNumber = findStaff.phoneNumber,
                            StaffRole = String.Join(",", staffRole.Select(x => x.roleInformation.roleName))
                        }
                    };
                }

                return new GenericRespondWithObjectDTO<GetStaffInfoDTO>()
                {
                    Status = GenericStatusEnum.Failure.ToString(),
                    message = "Error Staff Info Staff Don't Have Role",
                };
            }
            return new GenericRespondWithObjectDTO<GetStaffInfoDTO>()
            {
                Status = GenericStatusEnum.Failure.ToString(),
                message = "Can not Find Staff , Staff Does not Exist",
            };
        }
        catch (DbException db)
        {
            return new GenericRespondWithObjectDTO<GetStaffInfoDTO>()
            {
                Status = GenericStatusEnum.Failure.ToString(),
                message = "Database Error",
            };
        }
    }
}