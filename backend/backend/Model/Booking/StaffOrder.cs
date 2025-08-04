using backend.Model.Staff_Customer;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace backend.Model.Booking
{
    public class StaffOrder
    {
        [Key]
        [Column(TypeName = "varchar(100)")]
        public string orderId { get; set; } = "";

        [Required]
        [Column(TypeName = "varchar(50)")]
        public string paymentMethod { get; set; } = "VNPAY";

        [Required]
        [Column(TypeName = "nvarchar(50)")]
        public string PaymentStatus { get; set; } = string.Empty;

        [Required]
        public long totalAmount { get; set; }

        [Column(TypeName = "nvarchar(200)")]
        public string message { get; set; } = string.Empty;

        public DateTime paymentRequestCreatedDate { get; set; }

        [Column(TypeName = "varchar(100)")]
        [ForeignKey("Staff")]
        [Required]
        public string StaffID { get; set; } = "";


        [Column(TypeName = "nvarchar(40)")]
        public string? CustomerName { get; set; } = string.Empty;

        public Staff Staff { get; set; } = null!;

        public List<StaffOrderDetailFood> StaffOrderDetailFood = [];
    }
}
