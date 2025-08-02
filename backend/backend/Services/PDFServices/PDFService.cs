using backend.Interface.PDFInterface;
using backend.ModelDTO.GenericRespond;
using backend.ModelDTO.PDFDTO;

namespace backend.Services.PDFServices;

public class PDFService : IPDFService<GenerateCustomerBookingDTO,GenerateStaffBookingDTO>{

    public GenericRespondWithObjectDTO<PDFRespondDTO> GeneratePdfUserOrder(GenerateCustomerBookingDTO userOrder)
    {
        return null!;
    }

    public GenericRespondWithObjectDTO<PDFRespondDTO> GeneratePdfStaffOrder(GenerateStaffBookingDTO staffOrder)
    {
        return null!;
    }
}