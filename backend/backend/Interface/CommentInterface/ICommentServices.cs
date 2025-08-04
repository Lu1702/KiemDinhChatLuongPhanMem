using backend.Enum;
using backend.ModelDTO.CommentDTO.CommentRequest;
using backend.ModelDTO.CommentDTO.CommentRespond;
using backend.ModelDTO.GenericRespond;

namespace backend.Interface.CommentInterface
{
    public interface ICommentServices
    {
        GenericRespondWithObjectDTO<List<CommentRequestGetListDTO>> getAllComent(string movieID);

        GenericRespondWithObjectDTO<CommentRequestDTO> getCommentDetails(string commentID);

        Task<GenericRespondDTOs> uploadComment(string userID, string movieID, string commentDetail);

        Task<GenericRespondDTOs> editComment(string commentID, string commentDetail);

        Task<GenericRespondDTOs> deleteComment(string commentID);
    }
}
