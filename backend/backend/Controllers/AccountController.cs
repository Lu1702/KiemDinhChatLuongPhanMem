using backend.Enum;
using backend.Interface.Account;
using backend.ModelDTO.Account;
using backend.ModelDTO.Account.AccountRequest;
using backend.ModelDTO.Account.AccountRespond;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AccountController(IAccountService IAccount) : ControllerBase
{
    private readonly IAccountService _IAccount = IAccount;

    [HttpGet("getAccountInfo")]
    [Authorize(Policy = "Customer")]
    public IActionResult GetAccountInfo(string userID)
    {
        var getUserInfoStatus = _IAccount.getProfileRespond(userID);
        if (getUserInfoStatus.Status.Equals(GenericStatusEnum.Failure.ToString()))
        {
            return BadRequest(getUserInfoStatus);
        }
        return Ok(getUserInfoStatus);
    }

    [HttpPost("changePassword")]
    [Authorize]
    public IActionResult ChangePassword(string userID, ChangePasswordDTO changePasswordDTO)
    {
        var status = _IAccount.ChangePassword(userID, changePasswordDTO);
        if (status.Status.Equals(GenericStatusEnum.Failure.ToString()))
        {
            return BadRequest(status);
        }
        return Ok(status);
    }

    [HttpPost("ChangeAccountInformation")]
    public IActionResult ChangeAccountInfo(string Userid ,profileRequest profileRequest )
    {
        // git switch -c TranHoaiDuc_Branch_From_FE_BE_Branch
        
        var getstatus = _IAccount.editProfileRequest(Userid, profileRequest);
        if (getstatus.Status.Equals(GenericStatusEnum.Failure.ToString()))
        {
            return BadRequest(getstatus);
        }
        return Ok(getstatus);
    }

    [HttpPost("ResetPassword")]
    public async Task<IActionResult> ResetPassword(ReNewPasswordDTO dtos)
    {
        var status = await _IAccount.ResetPassword(dtos);
        if (status.Status.Equals(GenericStatusEnum.Failure.ToString()))
        {
            return BadRequest(status);
        }
        return Ok(status);
    }
}