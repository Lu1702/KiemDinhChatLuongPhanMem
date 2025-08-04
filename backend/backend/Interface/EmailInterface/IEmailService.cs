using backend.Enum;
using backend.ModelDTO.GenericRespond;
using backend.ModelDTO.PDFDTO;

namespace backend.Interface.EmailInterface;

public interface IEmailService
{
    Task<GenericRespondDTOs> SendOtp(string to);

    Task<GenericRespondDTOs> SendPdf(string to, PDFRespondDTO pdf);
}