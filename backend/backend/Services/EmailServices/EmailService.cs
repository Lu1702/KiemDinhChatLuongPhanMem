using System.Net;
using System.Net.Mail;
using System.Runtime.InteropServices.JavaScript;
using backend.Data;
using backend.Enum;
using backend.Helper;
using backend.Interface.EmailInterface;
using backend.Model.Email;
using backend.ModelDTO.GenericRespond;
using backend.ModelDTO.PDFDTO;

namespace backend.Services.EmailServices;

public class EmailService : IEmailService
{
    private readonly DataContext _context;
    
    private readonly IConfiguration _configuration;
    
    private readonly HashHelper _hashHelper;

    public EmailService(DataContext context , IConfiguration configuration , HashHelper hashHelper)
    {
        _context = context;
        _configuration = configuration;
        _hashHelper = hashHelper;
    }
    
    public async Task<GenericRespondDTOs> SendOtp(string to)
    {
        // Tien Hanh Gui Email
        if (String.IsNullOrEmpty(to))
        {
            return new GenericRespondDTOs()
            {
                Status = GenericStatusEnum.Failure.ToString() ,
                message = "Bạn chưa nhập Email"
            };
        }
        
        // Kiểm tra email hop le hay ko
        var checkUser = _context.userInformation.FirstOrDefault(x => x.loginUserEmail.Equals(to));
        if (checkUser == null)
        {
            return new GenericRespondDTOs()
            {
                Status = GenericStatusEnum.Failure.ToString() ,
                message = "Lỗi Không thấy Tài khoản"
            };
        }

        var getEmailOTP = GenerateEmailCodeHelper.GenerateEmailCode();
        // Tiep Tuc Toi Buoc Tiep Theo
        string subject = "Đây là mã OTP";

        using (var message = new MailMessage())
        {
            message.From = new MailAddress("duc19092005k@gmail.com");
            message.To.Add(to);
            message.Subject = subject;
            message.Body = $"Đây là ma xac thuc OTP {getEmailOTP}";

            using (var smtp = new SmtpClient("smtp.gmail.com", 587))
            {
                smtp.EnableSsl = true; 
                smtp.UseDefaultCredentials = false;
                smtp.Credentials = new NetworkCredential("duc19092005k@gmail.com", _configuration["Google:AppPassword"]);
                await using var Transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    
                    // Tien Hanh Luu Trong Database
                    var convertEmailCode = _hashHelper.Hash(getEmailOTP);
                    
                    var createNewGuid = Guid.NewGuid().ToString();
                    
                    // Kiem tra co ton tai hay chua
                    var checkContext = _context.EmailList.Where(x => x.UserId.Equals(checkUser.userId)).ToList();
                    foreach (var email in checkContext)
                    {
                        email.isUsed = true;
                    }
                    _context.UpdateRange(checkContext);
                    await smtp.SendMailAsync(message);
                    var newEmailObject = new EmailList()
                    {
                        EmailId = createNewGuid,
                        EmailCode = convertEmailCode,
                        CreatedDate = DateTime.Now,
                        ExpirationDate = DateTime.Now.AddMinutes(2),
                        UserId = checkUser.userId ,
                        isUsed = false
                    };
                    
                    await _context.EmailList.AddAsync(newEmailObject);
                    await _context.SaveChangesAsync();
                    await Transaction.CommitAsync();
                    
                    return new GenericRespondDTOs()
                    {
                        Status = GenericStatusEnum.Success.ToString(),
                        message = "Gửi Email Thành Công"
                    };
                    
                }
                catch (Exception e)
                {
                    await Transaction.RollbackAsync();
                    return new GenericRespondDTOs()
                    {
                        Status = GenericStatusEnum.Failure.ToString(),
                        message = $"Gửi Email Thất bại lỗi {e.Message}"
                    };
                }
            }
        }
    }
    
    // 

    public async Task<GenericRespondDTOs> SendPdf(string to, PDFRespondDTO pdf)
    {
        string subject = "Đây là thông tin đặt vé của bạn";

        using (var message = new MailMessage())
        {
            message.From = new MailAddress("duc19092005k@gmail.com");
            message.To.Add(to);
            message.Subject = subject;
            message.Attachments.Add
                (new Attachment(new MemoryStream(pdf.data) , pdf.FileName));

            using (var smtp = new SmtpClient("smtp.gmail.com", 587))
            {
                smtp.EnableSsl = true;
                smtp.UseDefaultCredentials = false;
                smtp.Credentials =
                    new NetworkCredential("duc19092005k@gmail.com", _configuration["Google:AppPassword"]);
                await smtp.SendMailAsync(message);

                return new GenericRespondDTOs()
                {
                    Status = GenericStatusEnum.Success.ToString(),
                    message = "Email Đã gửi thành công"
                };
            }
        }
    }
}