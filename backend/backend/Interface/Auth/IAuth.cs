
using backend.ModelDTO.Auth.AuthRespond;
using backend.ModelDTO.Auth.AuthRequest;
using backend.ModelDTO.GenericRespond;

namespace backend.Interface.Auth
{
    // Các Interfaces Authentication , author
    public interface IAuth
    {
        // Tạm thời để boolean

        Task<registerRespondDTO> Register(registerRequestDTO registerRequest);

        // Trả về một token nếu đăng nhập thành công
        // Tạm thời chưa trả về model

        loginRespondDTO Login(loginRequestDTO loginRequest);

        GenericRespondWithObjectDTO<Dictionary<string , string>> VerifyEmailCode(string EmailAddress ,string code);

        Task SaveChanges();
    }
}
