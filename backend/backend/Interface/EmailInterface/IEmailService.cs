using backend.Enum;
using backend.ModelDTO.GenericRespond;

namespace backend.Interface.EmailInterface;

public interface IEmailService
{
    Task<GenericRespondDTOs> SendOtp(string to);
    
    GenericRespondDTOs SendPdf(string to, string subject, string body , string pdfPath);
}