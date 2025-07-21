using backend.Enum;
using backend.Interface.StaffInterface;
using backend.Model.Staff_Customer;
using backend.ModelDTO.StaffDTOs;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StaffController(IStaffService staffService) : Controller
{
    private readonly IStaffService _staffService = staffService;

    [HttpPost("AddStaff")]
    public async Task<IActionResult> addStaff(CreateStaffDTO dtos)
    {
        var getStaffStatus = await _staffService.addStaff(dtos);
        if (getStaffStatus.Status.Equals(GenericStatusEnum.Failure.ToString()))
        {
            return BadRequest(getStaffStatus);
        }
        return Ok(getStaffStatus);
    }

    [HttpPatch("editStaff")]
    public async Task<IActionResult> editStaff(string id, EditStaffDTO dtos)
    {
        var getEditStaffStatus = await _staffService.EditStaff(id , dtos);
        if (getEditStaffStatus.Status.Equals(GenericStatusEnum.Failure.ToString()))
        {
            return BadRequest(getEditStaffStatus);
        }
        return Ok(getEditStaffStatus);
    }

    [HttpDelete("DeleteStaff")]
    public async Task<IActionResult> deleteStaff(string id)
    {
        var getDeleteStaffStatus = await _staffService.DeleteStaff(id);
        if(getDeleteStaffStatus.Status.Equals(GenericStatusEnum.Failure.ToString()))
        {
            return BadRequest(getDeleteStaffStatus);
        } 
        return Ok(getDeleteStaffStatus);
    }

    [HttpGet("GetStaffList")]
    public IActionResult GetStaffList()
    {
        var getStaffList = _staffService.GetStaffListInfo();
        if (getStaffList.Status.Equals(GenericStatusEnum.Failure.ToString()))
        {
            return BadRequest(getStaffList);
        }
        return Ok(getStaffList);
    }

    [HttpGet("GetStaffByID")]
    public IActionResult GetStaffByID(string id)
    {
        var getStaffById = _staffService.GetStaffInfo(id);
        if (getStaffById.Status.Equals(GenericStatusEnum.Failure.ToString()))
        {
            return BadRequest(getStaffById);
        }
        return Ok(getStaffById);
    }

    [HttpGet("GetRoleList")]
    public IActionResult GetRoleList()
    {
        var getRoleListStatus = _staffService.getRoles();
        if (getRoleListStatus.Status.Equals(GenericStatusEnum.Failure.ToString()))
        {
            return BadRequest(getRoleListStatus);
        }
        return Ok(getRoleListStatus);
    }
}