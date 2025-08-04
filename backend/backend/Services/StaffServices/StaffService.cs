using System.Data.Common;
using System.Runtime.InteropServices.JavaScript;
using backend.Data;
using backend.Enum;
using backend.Helper;
using backend.Interface.StaffInterface;
using backend.Model.Auth;
using backend.Model.Staff_Customer;
using backend.ModelDTO.GenericRespond;
using backend.ModelDTO.StaffDTOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace backend.Services.StaffService;

public class StaffService(DataContext dbContext) : IStaffService
{
    private readonly DataContext _context = dbContext;
    public async Task<GenericRespondDTOs> addStaff(CreateStaffDTO createStaffDTO)
    {
        var transition = await _context.Database.BeginTransactionAsync();
        try
        {
            DateTime dateTime = DateTime.Now;
            int age = dateTime.Year - createStaffDTO.DateOfBirth.Year;
            if (createStaffDTO.DateOfBirth.Date < dateTime.AddYears(-age))
            {
                age--;
            }

            if (age < 18)
            {
                return new GenericRespondDTOs()
                {
                    message = "Tuoi Khong Hop Le Vui Long Nhap Tuoi tren 18",
                    Status = GenericStatusEnum.Failure.ToString()
                };
            }
            
            // Check điều kiện ã có Staff Toonf tại chưa
            if (_context
                .Staff.Any(x => x.Name.Equals(createStaffDTO.StaffName)
                                && x.cinemaID.Equals(createStaffDTO.CinemaId)))
            {
                return new GenericRespondDTOs()
                {
                    Status = GenericStatusEnum.Failure.ToString(),
                    message = "Nhân viên đã tồn tại"
                };
            }
            
            // Truy Van Thong Tin Staff Neu Staff
            var generateUserId = Guid.NewGuid().ToString();
            var generateStaffId = Guid.NewGuid().ToString();

            var bcryptStaffPassword = BCrypt.Net.BCrypt.HashPassword(createStaffDTO.LoginUserPassword);
            
            var findExitsUser = _context.userInformation.FirstOrDefault(x => x.loginUserEmail.ToLower().Equals(createStaffDTO.LoginUserEmail.ToLower()));
            if (findExitsUser != null)
            {
                return new GenericRespondDTOs()
                {
                    message = "User already exists!",
                    Status = GenericStatusEnum.Failure.ToString()
                };
            }

            var checkExitsStaff = _context.Staff.Where
                (x => x.Name.ToLower().Equals(createStaffDTO.StaffName.ToLower())
                && x.cinemaID.Equals(createStaffDTO.CinemaId));
            if (checkExitsStaff.Any())
            {
                return new GenericRespondDTOs()
                {
                    Status = GenericStatusEnum.Failure.ToString(),
                    message = "Nhan Vien Nay Da Ton Tai",
                };
            }

            if (createStaffDTO.LoginUserPassword != createStaffDTO.LoginUserPasswordConfirm)
            {
                return new GenericRespondDTOs()
                {
                    message = "Passwords do not match!",
                    Status = GenericStatusEnum.Failure.ToString()
                };
            }
            List<userRoleInformation> userRoles = new List<userRoleInformation>();
            
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

            var getRoles = _context.roleInformation.Where(x =>
                x.roleName.Equals("Cashier"));
            foreach (var roleID in createStaffDTO.RoleID)
            {
                if (!getRoles.Any(x => x.roleId == roleID))
                {
                    return new GenericRespondDTOs()
                    {
                        Status = GenericStatusEnum.Failure.ToString(),
                        message = "Lỗi : Khi Thêm Role chỉ được chứa Role Nhân Viên Thôi !"
                    };
                }
                userRoles.Add(new userRoleInformation()
                {
                    userId = generateUserId,
                    roleId = roleID
                });
            }
            
            await _context.userRoleInformation.AddRangeAsync(userRoles);
            
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
            if (ex.Message.ToLower().Replace
                    (" ", "").Contains("phoneNumber"))
            {
                return new GenericRespondDTOs()
                {
                    Status = GenericStatusEnum.Failure.ToString(),
                    message = "Số điện thoại không được trùng"
                };
            }

            return new GenericRespondDTOs()
            {
                Status = GenericStatusEnum.Failure.ToString(),
                message = "Lỗi Database"
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
                await using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    if (editStaffDTO.StaffName != null &&
                        editStaffDTO.CinemaId.IsNullOrEmpty())
                    {
                        // Kieemr tra thong tin nhan vien coi da ton tai thong tin chua
                        if (_context.Staff
                            .Any(x => !x.Id.Equals(findStaff.Id)
                                      && x.Name.Equals(editStaffDTO.StaffName)
                                      && x.cinemaID.Equals(findStaff.cinemaID)))
                        {
                            return new GenericRespondDTOs()
                            {
                                Status = GenericStatusEnum.Failure.ToString(),
                                message = "Lỗi nhân viên đã tồn tại"
                            };
                        }

                        findStaff.Name = editStaffDTO.StaffName;
                        findStaff.phoneNumber = String.IsNullOrEmpty(editStaffDTO.PhoneNumer)
                            ? findStaff.phoneNumber
                            : editStaffDTO.PhoneNumer;
                        findStaff.dateOfBirth = editStaffDTO.DateOfBirth ?? findStaff.dateOfBirth;

                        if (editStaffDTO.RoleID != null && editStaffDTO.RoleID.Any())
                        {
                            _context.userRoleInformation.RemoveRange(
                                _context.userRoleInformation.Where(x => x.userId.Equals(findStaff.userID)));
                            List<userRoleInformation> userRoles = new List<userRoleInformation>();
                            var getRoles = _context.roleInformation.Where(x =>
                                x.roleName.Equals("Director") &&
                                x.roleName.Equals("FacilitiesManager") &&
                                x.roleName.Equals("MovieManager") &&
                                x.roleName.Equals("TheaterManager") &&
                                x.roleName.Equals("Customer"));
                            foreach (var roleID in editStaffDTO.RoleID)
                            {
                                if (getRoles.Any(x => x.roleId == roleID))
                                {
                                    return new GenericRespondDTOs()
                                    {
                                        Status = GenericStatusEnum.Failure.ToString(),
                                        message = "Lỗi : Khi Thêm Role chỉ được chứa Role Nhân Viên Thôi !"
                                    };
                                }

                                userRoles.Add(new userRoleInformation()
                                {
                                    userId = findStaff.userID,
                                    roleId = roleID
                                });
                            }

                            await _context.userRoleInformation.AddRangeAsync(userRoles);
                        }

                        _context.Staff.Update(findStaff);
                        await _context.SaveChangesAsync();
                        await transaction.CommitAsync();

                        return new GenericRespondDTOs()
                        {
                            Status = GenericStatusEnum.Success.ToString(),
                            message = "The Staff updated successfully!"
                        };

                        // Thêm các hàm xử lý ở đây

                    }
                    else if (editStaffDTO.CinemaId != null && editStaffDTO.StaffName.IsNullOrEmpty())
                    {
                        if (_context.Staff
                            .Any(x => !x.Id.Equals(findStaff.Id)
                                      && x.Name.Equals(editStaffDTO.StaffName)
                                      && x.cinemaID.Equals(findStaff.cinemaID)))
                        {
                            return new GenericRespondDTOs()
                            {
                                Status = GenericStatusEnum.Failure.ToString(),
                                message = "Lỗi nhân viên đã tồn tại"
                            };
                        }

                        // Hàm xử lý ở đây

                        findStaff.cinemaID = editStaffDTO.CinemaId;
                        findStaff.phoneNumber = String.IsNullOrEmpty(editStaffDTO.PhoneNumer)
                            ? findStaff.phoneNumber
                            : editStaffDTO.PhoneNumer;
                        findStaff.dateOfBirth = editStaffDTO.DateOfBirth ?? findStaff.dateOfBirth;

                        if (editStaffDTO.RoleID != null && editStaffDTO.RoleID.Any())
                        {
                            _context.userRoleInformation.RemoveRange(
                                _context.userRoleInformation.Where(x => x.userId.Equals(findStaff.userID)));
                            List<userRoleInformation> userRoles = new List<userRoleInformation>();
                            var getRoles = _context.roleInformation.Where(x =>
                                x.roleName.Equals("Director") &&
                                x.roleName.Equals("FacilitiesManager") &&
                                x.roleName.Equals("MovieManager") &&
                                x.roleName.Equals("TheaterManager") &&
                                x.roleName.Equals("Customer"));
                            foreach (var roleID in editStaffDTO.RoleID)
                            {
                                if (getRoles.Any(x => x.roleId == roleID))
                                {
                                    return new GenericRespondDTOs()
                                    {
                                        Status = GenericStatusEnum.Failure.ToString(),
                                        message = "Lỗi : Khi Thêm Role chỉ được chứa Role Nhân Viên Thôi !"
                                    };
                                }

                                userRoles.Add(new userRoleInformation()
                                {
                                    userId = findStaff.userID,
                                    roleId = roleID
                                });
                            }

                            await _context.userRoleInformation.AddRangeAsync(userRoles);
                        }

                        _context.Staff.Update(findStaff);
                        await _context.SaveChangesAsync();
                        await transaction.CommitAsync();

                        return new GenericRespondDTOs()
                        {
                            Status = GenericStatusEnum.Success.ToString(),
                            message = "The Staff updated successfully!"
                        };
                    }
                    else if (editStaffDTO.StaffName != null && editStaffDTO.CinemaId != null)
                    {
                        // Kieemr tra xem da co thong tin nhan vien chua
                        if (_context.Staff
                            .Any(x => !x.Id.Equals(id) && editStaffDTO.StaffName.Equals(x.Name)
                                                       && editStaffDTO.CinemaId.Equals(x.cinemaID)))
                        {
                            return new GenericRespondDTOs()
                            {
                                Status = GenericStatusEnum.Failure.ToString(),
                                message = "Lỗi nhân viên đã tồn tại"
                            };
                        }

                        findStaff.cinemaID = editStaffDTO.CinemaId;
                        findStaff.Name = editStaffDTO.StaffName;
                        findStaff.phoneNumber = String.IsNullOrEmpty(editStaffDTO.PhoneNumer)
                            ? findStaff.phoneNumber
                            : editStaffDTO.PhoneNumer;
                        findStaff.dateOfBirth = editStaffDTO.DateOfBirth ?? findStaff.dateOfBirth;

                        if (editStaffDTO.RoleID != null && editStaffDTO.RoleID.Any())
                        {
                            _context.userRoleInformation.RemoveRange(
                                _context.userRoleInformation.Where(x => x.userId.Equals(findStaff.userID)));
                            List<userRoleInformation> userRoles = new List<userRoleInformation>();
                            var getRoles = _context.roleInformation.Where(x =>
                                x.roleName.Equals("Director") &&
                                x.roleName.Equals("FacilitiesManager") &&
                                x.roleName.Equals("MovieManager") &&
                                x.roleName.Equals("TheaterManager") &&
                                x.roleName.Equals("Customer"));
                            foreach (var roleID in editStaffDTO.RoleID)
                            {
                                if (getRoles.Any(x => x.roleId == roleID))
                                {
                                    return new GenericRespondDTOs()
                                    {
                                        Status = GenericStatusEnum.Failure.ToString(),
                                        message = "Lỗi : Khi Thêm Role chỉ được chứa Role Nhân Viên Thôi !"
                                    };
                                }

                                userRoles.Add(new userRoleInformation()
                                {
                                    userId = findStaff.userID,
                                    roleId = roleID
                                });
                            }

                            await _context.userRoleInformation.AddRangeAsync(userRoles);
                        }

                        _context.Staff.Update(findStaff);
                        await _context.SaveChangesAsync();
                        await transaction.CommitAsync();

                        return new GenericRespondDTOs()
                        {
                            Status = GenericStatusEnum.Success.ToString(),
                            message = "The Staff updated successfully!"
                        };
                    }
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                    if (e.Message.ToLower().Replace
                            (" ", "").Contains("phoneNumber"))
                    {
                        return new GenericRespondDTOs()
                        {
                            Status = GenericStatusEnum.Failure.ToString(),
                            message = "Số điện thoại không được trùng"
                        };
                    }

                    return new GenericRespondDTOs()
                    {
                        Status = GenericStatusEnum.Failure.ToString(),
                        message = "Lỗi Database"
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
                var findUserRole = _context.userRoleInformation.Where(x => x.userId.Equals(findStaff.userID));
                if (findUserInfo != null && findUserRole.Any())
                {
                    await using var transaction = await _context.Database.BeginTransactionAsync();
                    try
                    {
                        _context.userInformation.Remove
                            (findUserInfo);
                        _context.Staff.Remove(findStaff);
                        _context.userRoleInformation.RemoveRange(findUserRole);
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
                .Include(x => x.Cinema)
                .Include(x => x.userInformation)
                .ThenInclude(x => x.userRoleInformation)
                .ThenInclude(x => x.roleInformation)
                .AsSplitQuery()
                .Where(x => x.userInformation.userRoleInformation
                    .Select(x => x.roleInformation).Any(y => y.roleName.Equals("Cashier")))
                .ToList();

            if (staffList.Count > 0)
            {
                List<GetStaffInfoDTO> staffInfoList = new List<GetStaffInfoDTO>();
                foreach (var staffInfo in staffList)
                {
                    staffInfoList.Add(new GetStaffInfoDTO
                    {
                        StaffName = staffInfo.Name,
                        CinenaName = staffInfo.Cinema.cinemaName,
                        DayOfBirth = staffInfo.dateOfBirth,
                        StaffId = staffInfo.Id,
                        CinemaId = staffInfo.Cinema.cinemaId,
                        StaffPhoneNumber = staffInfo.phoneNumber,
                        StaffRole = String.Join(",", staffInfo.userInformation.userRoleInformation.Select(x => x.roleInformation.roleName)),
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

    public GenericRespondWithObjectDTO<List<RoleInfoListDTO>> getRoles()
    {
        var getRoles = _context.roleInformation.Where(x => 
                !x.roleName.Equals("Director") && 
                !x.roleName.Equals("FacilitiesManager") &&
                !x.roleName.Equals("MovieManager") &&
                !x.roleName.Equals("TheaterManager") &&
                !x.roleName.Equals("Customer"))
            .ToList();
        if (getRoles.Any())
        {
            return new GenericRespondWithObjectDTO<List<RoleInfoListDTO>>()
            {
                Status = GenericStatusEnum.Success.ToString(),
                message = "Role List",
                data = getRoles.Select(x => new RoleInfoListDTO()
                {
                    RoleId = x.roleId,
                    RoleName = x.roleName
                }).ToList()
            };
        }

        return new GenericRespondWithObjectDTO<List<RoleInfoListDTO>>()
        {
            Status = GenericStatusEnum.Failure.ToString(),
            message = "Error Ko có data về các Role"
        };
    }

}