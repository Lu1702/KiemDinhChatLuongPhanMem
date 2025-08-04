using backend.Enum;
using backend.Interface.CommentInterface;
using backend.ModelDTO.CommentDTO.CommentRequest;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CommentController : ControllerBase
    {
        private readonly ICommentServices _services;

        public CommentController(ICommentServices services)
        {
            _services = services;
        }

        [HttpGet("getComment/{movieID}")]
        [AllowAnonymous]
        public IActionResult getCommentList(string movieID)
        {
            var listComment = _services.getAllComent(movieID);
            if (listComment.Status.Equals(GenericStatusEnum.Success.ToString()))
            {
                return Ok(listComment);
            }
            return BadRequest(listComment);
        }

        [HttpGet("getCommentDetail/{commentID}")]
        public IActionResult getCommentDetail(string commentID)
        {
            var getComment = _services.getCommentDetails(commentID);
            if (getComment.Status.Equals(GenericStatusEnum.Success.ToString()))
            {
                return Ok(getComment);
            }
            return BadRequest(getComment);
        }

        [HttpPost("uploadComment/{userID}/{movieID}")]
        [Authorize(Policy = "Customer")]
        public async Task<IActionResult> postComment(string userID , string movieID , string commentDetail)
        {
            var getStatus = await _services.uploadComment(userID, movieID, commentDetail);
            if (getStatus.Status.Equals(GenericStatusEnum.Failure.ToString()))
            {
                return BadRequest(getStatus);
            }
            return Ok(getStatus);
        }

        [HttpPatch("editComment/{commentID}")]
        [Authorize(Policy = "Customer")]
        public async Task<IActionResult> editComment(string commentID, string commentDetail)
        {
            var getStatus = await _services.editComment(commentID, commentDetail);
            if (getStatus.Status.Equals(GenericStatusEnum.Failure.ToString()))
            {
                return BadRequest(getStatus);
            }
            return Ok(getStatus);
        }

        [HttpDelete("deleteComment/{commentID}")]
        [Authorize(Policy = "Customer")]
        public async Task<IActionResult> deleteComment(string commentID)
        {
            var getStatus = await _services.deleteComment(commentID);
            if (getStatus.Status.Equals(GenericStatusEnum.Failure.ToString()))
            {
                return NotFound(getStatus);
            }
            return Ok(getStatus);
        }
    }
}
