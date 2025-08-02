using backend.Enum;
using backend.ModelDTO.GenericRespond;

namespace backend.Interface.PDFInterface;

public interface IPDFService<T>
{
    GenericRespondDTOs GeneratePdfUserOrder(T userOrder);
    
    GenericRespondDTOs GeneratePdfStaffOrder(T staffOrder);
}