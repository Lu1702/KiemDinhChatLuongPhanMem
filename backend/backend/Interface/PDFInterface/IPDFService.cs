using backend.Enum;
using backend.ModelDTO.GenericRespond;
using backend.ModelDTO.PDFDTO;

namespace backend.Interface.PDFInterface;

public interface IPDFService<TCustomerOrder , TStaffOrder>
{
    GenericRespondWithObjectDTO<PDFRespondDTO> GeneratePdfUserOrder(TCustomerOrder userOrder);
    
    GenericRespondWithObjectDTO<PDFRespondDTO> GeneratePdfStaffOrder(TStaffOrder staffOrder);
}