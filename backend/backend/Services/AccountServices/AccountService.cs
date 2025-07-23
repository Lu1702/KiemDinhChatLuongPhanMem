using backend.Data;
using backend.Enum;
using backend.Helper;
using backend.ModelDTO.Account.AccountRequest;
using backend.ModelDTO.Account.AccountRespond;
using backend.ModelDTO.GenericRespond;
using Microsoft.Identity.Client;
using backend.Interface.Account;
using backend.ModelDTO.Account;
using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;

namespace backend.Services.AccountServices;

public class AccountService(DataContext _injectionContext , HashHelper hashHelper) : IAccountService
{
    private readonly DataContext _context = _injectionContext;
    
    private readonly HashHelper _hashHelper = hashHelper;
    public GenericRespondWithObjectDTO<ProfileRespond> getProfileRespond(string id)
    {
       
        var getProfileInformation = _context.Customers
            .FirstOrDefault(x => x.userID == id);
        if (getProfileInformation != null)
        {
            var convertHash = _hashHelper.GetData(getProfileInformation.IdentityCode);
            return new GenericRespondWithObjectDTO<ProfileRespond>()
            {
                Status = GenericStatusEnum.Success.ToString(),
                message = "Profile Information Retrieved",
                data = new ProfileRespond()
                {
                    CustomerId = getProfileInformation.Id,
                    DayOfBirth = getProfileInformation.dateOfBirth,
                    IdentityCode = convertHash,
                    PhoneNumber = getProfileInformation.phoneNumber,
                    UserName = getProfileInformation.Name
                },
            };
        }
        
        return new GenericRespondWithObjectDTO<ProfileRespond>()
        {
            Status = GenericStatusEnum.Failure.ToString(),
            message = "Error",
        };

    }

    public GenericRespondDTOs editProfileRequest(string id, profileRequest profileRequest)
    {
        try
        {
            // tao ccac truong data
            var getProfileInformation = _context.Customers
                .FirstOrDefault(x => x.userID == id);
            if (getProfileInformation != null)
            {
                string phoneNumber = 
                    String.IsNullOrEmpty(profileRequest.phoneNumber) ? getProfileInformation.phoneNumber : profileRequest.phoneNumber;
                DateTime dateOfBirth = profileRequest.dateOfBirth ?? getProfileInformation.dateOfBirth;
                string userName = String.IsNullOrEmpty(profileRequest.userName) ? getProfileInformation.Name : profileRequest.userName;
                string identityCode = string.Empty; 
                getProfileInformation.phoneNumber = phoneNumber;
                getProfileInformation.dateOfBirth = dateOfBirth;
                getProfileInformation.IdentityCode = identityCode;
                getProfileInformation.Name = userName;
                _context.Customers.Update(getProfileInformation);
                _context.SaveChanges();

                return new GenericRespondDTOs()
                {
                    Status = GenericStatusEnum.Success.ToString(),
                    message = "Profile Information Updated",
                };
            }

            return new GenericRespondDTOs()
            {
                Status = GenericStatusEnum.Failure.ToString(),
                message = "Error Can't Find Profile",
            };
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            return new GenericRespondDTOs()
            {
                Status = GenericStatusEnum.Failure.ToString(),
                message = "Error Updating Profile Information --- Details : " + e.Message,
            };
        }
    }

    public GenericRespondDTOs ChangePassword(string userId , ChangePasswordDTO dtos)
    {
        try
        {
            var findUser = _context.userInformation.FirstOrDefault(x => x.userId == userId);
            // Validate Dung Thu Vien Brypt
            if (!String.IsNullOrEmpty(dtos.NewPassword) && !String.IsNullOrEmpty(dtos.NewPassword) && !String.IsNullOrEmpty(dtos.NewPassword))
            {
                if (findUser != null)
                {
                    if (dtos.NewPassword.Equals(dtos.ConfirmPassword))
                    {
                        var checkPassword = BCrypt.Net.BCrypt.Verify(dtos.OldPassword, findUser.loginUserPassword);
                        if (checkPassword)
                        {
                            var convertNewPasswordToHash = BCrypt.Net.BCrypt.HashPassword(dtos.NewPassword);
                            findUser.loginUserPassword = convertNewPasswordToHash;
                            _context.Update(findUser);
                            _context.SaveChanges();
                            
                            return new GenericRespondDTOs()
                            {
                                Status = GenericStatusEnum.Success.ToString(),
                                message = "Change Password Successful",
                            };
                        }
                        return new GenericRespondDTOs()
                        {
                            Status = GenericStatusEnum.Failure.ToString(),
                            message = "Password Change Failed , Old Password does not match with Old Password In Database",
                        };
                    }
                    return new GenericRespondDTOs()
                    {
                        Status = GenericStatusEnum.Failure.ToString(),
                        message = "Password Change Failed , New Password does not match with Confirmed Password",
                    };
                
                }

                return new GenericRespondDTOs()
                {
                    Status = GenericStatusEnum.Failure.ToString(),
                    message = "Can not Find User",
                };
            }

            return new GenericRespondDTOs()
            {
                Status = GenericStatusEnum.Failure.ToString(),
                message = "Password Change Failed , Password is required",
            };
        }
        catch (Exception e)
        {
            return new GenericRespondDTOs()
            {
                Status = GenericStatusEnum.Failure.ToString(),
                message = "Database Error",
            };
        }
    }

    public async Task<GenericRespondDTOs> ResetPassword(ReNewPasswordDTO dtos)
    {
        // Check Null
        if (String.IsNullOrEmpty(dtos.NewPassword))
        {
            return new GenericRespondDTOs()
            {
                Status = GenericStatusEnum.Failure.ToString(),
                message = "Khong Duoc De Trong Mat Khau Moi"
            };
        }

        if (String.IsNullOrEmpty(dtos.ReNewPassword))
        {
            return new GenericRespondDTOs()
            {
                Status = GenericStatusEnum.Failure.ToString(),
                message = "Khong Duoc De Trong Mat Khau Xac Nhan"
            };
        }

        if (String.IsNullOrEmpty(dtos.ResetToken))
        {
            return new GenericRespondDTOs()
            {
                Status = GenericStatusEnum.Failure.ToString(),
                message = "Loi Thieu Token"
            };
        }

        if (dtos.NewPassword != dtos.ReNewPassword)
        {
            return new GenericRespondDTOs()
            {
                Status = GenericStatusEnum.Failure.ToString(),
                message = "Mat Khau Xac Nhan Khong Giong Mat Khau Moi"
            };
        }
        
        await using var Transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // Tim Token
            var findValidToken = _context.EmailList.FirstOrDefault
                (x => x.ResetToken.Equals(dtos.ResetToken));
            if (findValidToken != null)
            {
                // Tien Hanh Cho Doi Mat Khau
                var findUser = await _context.userInformation.FirstOrDefaultAsync
                    (x => x.userId.Equals(findValidToken.UserId));
                if (findUser != null)
                {
                    var convertToBrcypt = BCrypt.Net.BCrypt.HashPassword(dtos.NewPassword);
                    findUser.loginUserPassword = convertToBrcypt;
                    findValidToken.isUsed = true;
                    _context.EmailList.Update(findValidToken);
                    _context.userInformation.Update(findUser);
                    await _context.SaveChangesAsync();
                    await Transaction.CommitAsync();
                    return new GenericRespondDTOs()
                    {
                        Status = GenericStatusEnum.Success.ToString(),
                        message = "Thay Doi Mat Khau Thanh Cong"
                    };
                }

                return new GenericRespondDTOs()
                {
                    Status = GenericStatusEnum.Failure.ToString(),
                    message = "Khong Tim Thay Nguoi Dung"
                };
            }
            return new GenericRespondDTOs()
            {
                Status = GenericStatusEnum.Failure.ToString(),
                message = "Khong Tim Thay Token"
            };
        }
        catch (Exception e)
        {
            await Transaction.RollbackAsync();
            return new GenericRespondDTOs()
            {
                Status = GenericStatusEnum.Failure.ToString(),
                message = "Loi Database"
            };
        }
        
        
    }

    
}