using backend.Data;
using backend.Model.CinemaRoom; // Đảm bảo các model của bạn ở đây
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection; // Cần thiết cho IServiceProvider và CreateScope
using System;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;
using backend.Enum; // Cần thiết cho các phương thức LINQ như ToList()

namespace backend.Hosted;

// Đổi tên HostedService thành MovieScheduleCleanupService cho rõ ràng
// Lưu ý: MyTimedHostedService trong ILogger và tên lớp là khác nhau,
// tôi sẽ giữ lại theo tên lớp là MovieScheduleCleanupService cho nhất quán.
public class HostedService : BackgroundService
{
    private readonly ILogger<HostedService> _logger;
    private readonly IServiceProvider _serviceProvider; // Thêm IServiceProvider
    private Timer? _timer = null; // Sử dụng nullable reference type cho _timer

    // Constructor: Thay DataContext bằng IServiceProvider
    public HostedService(ILogger<HostedService> logger, IServiceProvider serviceProvider)
    {
        _logger = logger;
        _serviceProvider = serviceProvider; // Lưu trữ service provider
    }

    protected override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("MovieScheduleCleanupService đang chạy.");

        // Khởi tạo Timer để chạy mỗi 1 phút (60000 ms)
        // state: đối tượng được truyền vào callback (null vì không dùng)
        // dueTime: thời gian chờ trước khi chạy lần đầu (TimeSpan.Zero để chạy ngay lập tức)
        // period: khoảng thời gian giữa các lần chạy (TimeSpan.FromMinutes(1) = 1 phút)
        _timer = new Timer(DoWork, null, TimeSpan.Zero, TimeSpan.FromMinutes(1));

        return Task.CompletedTask;
    }

    private void DoWork(object? state) // Sử dụng nullable object cho state
    {
        _logger.LogInformation($"MovieScheduleCleanupService đang thực hiện kiểm tra tại: {DateTimeOffset.Now}");

        _ = Task.Run(async () =>
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var _context = scope.ServiceProvider.GetRequiredService<DataContext>();

                using (var transaction = await _context.Database.BeginTransactionAsync())
                {
                    try
                    {
                        var movieScheduleList = await _context.movieSchedule
                            .Where(x => !x.IsDelete)
                            .Include(x => x.HourSchedule) 
                            .Include(x => x.cinemaRoom)
                            .ThenInclude(x => x.Seats).Include(movieSchedule => movieSchedule.movieInformation)
                            .ToListAsync(); // Thực thi truy vấn và đưa vào bộ nhớ

                        if (!movieScheduleList.Any())
                        {
                            _logger.LogInformation("Không có lịch chiếu nào cần cập nhật trạng thái lúc này.");
                            return; // Thoát nếu không có gì để làm
                        }

                        _logger.LogInformation($"Tìm thấy {movieScheduleList.Count} lịch chiếu để kiểm tra.");

                        // Tiến hành kiểm tra điều kiện và cập nhật
                        foreach (var movieSchedule in movieScheduleList)
                        {
                            // GIỮ LẠI LOGIC CHUYỂN ĐỔI TimeSpan của bạn
                            TimeSpan? timeSpanConvert = null;
                            try
                            {
                                // Đảm bảo movieSchedule.HourSchedule có thể chuyển đổi sang chuỗi và parse được
                                // Nếu movieSchedule.HourSchedule đã là TimeSpan, bạn chỉ cần dùng nó trực tiếp:
                                // timeSpanConvert = movieSchedule.HourSchedule;
                                timeSpanConvert = TimeSpan.ParseExact(
                                    movieSchedule.HourSchedule.HourScheduleShowTime.ToString() ?? string.Empty,
                                    "h\\:mm",
                                    null);
                            }
                            catch (FormatException ex)
                            {
                                _logger.LogError(ex, $"Lỗi định dạng HourSchedule cho lịch chiếu ID {movieSchedule.movieScheduleId}. Skipped.");
                                continue; // Bỏ qua lịch chiếu này nếu lỗi định dạng
                            }
                            
                            if (timeSpanConvert == null) continue; // Bỏ qua nếu không parse được

                            var dateTimeToShow = movieSchedule.ScheduleDate.Add(timeSpanConvert.Value);

                            // Kiểm tra nếu thời gian hiện tại ĐÃ QUA thời gian chiếu
                            if (DateTime.Now > dateTimeToShow)
                            {
                                movieSchedule.IsDelete = true;
                                _logger.LogInformation($"Lịch chiếu ID: {movieSchedule.movieScheduleId} ('{movieSchedule.movieInformation.movieName}') đã kết thúc. Đánh dấu IsDelete = true.");
                            }

                            // Nếu lịch chiếu đã bị đánh dấu IsDelete (do vừa được đánh dấu hoặc đã bị đánh dấu từ trước)
                            // thì đưa ghế về isTaken = false
                            if (movieSchedule.IsDelete)
                            {
                                foreach (var seat in movieSchedule.cinemaRoom.Seats) // Đổi tên biến 'seats' thành 'seat' cho rõ ràng
                                {
                                    if (seat.isTaken) // Chỉ cập nhật nếu nó đang là true
                                    {
                                        seat.isTaken = false; // Đặt trạng thái ghế là trống
                                        _logger.LogDebug($"Ghế '{seat.seatsNumber}' trong phòng '{movieSchedule.cinemaRoom.cinemaRoomNumber}' đã được đặt isTaken = false.");
                                    }
                                }
                            }
                        }
                        var seatsToUpdate = movieScheduleList
                                            .SelectMany(x => x.cinemaRoom.Seats)
                                            .Distinct() // Quan trọng để tránh lỗi khi một ghế được cập nhật nhiều lần
                                            .ToList();
                        
                        if (seatsToUpdate.Any())
                        {
                            _context.Seats.UpdateRange(seatsToUpdate); 
                        }

                        await _context.SaveChangesAsync(); 
                        await transaction.CommitAsync(); 
                        _logger.LogInformation("Hoàn tất cập nhật trạng thái lịch chiếu và ghế.");
                        
                        // Kiểm tratrangjgj thaái thanh toán

                        var selectAllPayment = _context.Order
                            .Where(x => x.PaymentStatus.Equals(PaymentStatus.Pending.ToString()));
                        foreach (var paymentStatus in selectAllPayment)
                        {
                            // Neeus Pending >5 thi la rejected
                            var checkDateTime = DateTime.Now.Minute - paymentStatus.paymentRequestCreatedDate.Minute;
                            if (checkDateTime >= 5)
                            {
                                paymentStatus.PaymentStatus = PaymentStatus.PaymentFailure.ToString();
                                paymentStatus.message = "Thời gian thanh toán quá hạn rồi =(";
                                _logger.LogInformation("Chỉnh sửa Thông tin thanh toan thành công");
                            }
                        }
                        _context.Order.UpdateRange(selectAllPayment);
                        await _context.SaveChangesAsync();
                        _logger.LogInformation("Chỉnh sửa Thông tin thanh toan thành công");
                    }
                    catch (Exception ex)
                    {
                        await transaction.RollbackAsync(); // Rollback transaction nếu có lỗi
                        _logger.LogError(ex, "Lỗi trong quá trình xử lý lịch chiếu kết thúc: {Message}", ex.Message);
                    }
                }
            }
        }).ConfigureAwait(false); // Thêm ConfigureAwait(false) để tránh deadlocks và tối ưu hiệu suất
    }

    public override Task StopAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("MovieScheduleCleanupService đang dừng.");

        _timer?.Change(Timeout.Infinite, 0); // Ngừng timer
        return base.StopAsync(stoppingToken);
    }

    public override void Dispose()
    {
        _timer?.Dispose(); // Giải phóng tài nguyên của timer
        base.Dispose();
    }
}