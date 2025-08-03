namespace backend.ModelDTO.PDFDTO;

public class PDFRespondDTO
{
    public string FileName { get; set; } = string.Empty;
    
    public byte [] data { get; set; }
}