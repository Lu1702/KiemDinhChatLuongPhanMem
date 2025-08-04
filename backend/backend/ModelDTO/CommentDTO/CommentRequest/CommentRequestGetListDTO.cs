namespace backend.ModelDTO.CommentDTO.CommentRequest
{
    public class CommentRequestGetListDTO
    {
        public string CommentId { get; set; } = string.Empty;
        public string customerEmail { get; set; } = string.Empty;
        public string commentDetail { get; set; } = string.Empty;

        public DateTime commentDate { get; set; }

    }
}
