using backend.Enum;

namespace backend.Interface.PDFInterface;

public interface IPDFService
{
    byte[] GetPDF(string T);
}