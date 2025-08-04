using backend.Model.Product;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace backend.Model.Booking
{
    public partial class StaffOrderDetailFood
    {
        [Required]
        [ForeignKey("StaffOrder")]
        public string orderId { get; set; } = "";

        [Required]
        [ForeignKey("foodInformation")]
        public string foodInformationId { get; set; } = "";
        
        public decimal foodEachPrice { get; set; }

        public int quanlity { get; set; }

        public StaffOrder StaffOrder { get; set; } = null!;

        public foodInformation foodInformation { get; set; } = null!;
    }

    [PrimaryKey(nameof(orderId), nameof(foodInformationId))]
    public partial class StaffOrderDetailFood
    {

    }
}
