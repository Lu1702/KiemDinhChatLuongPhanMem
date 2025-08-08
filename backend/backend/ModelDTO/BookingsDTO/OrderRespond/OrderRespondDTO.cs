using backend.Model.Auth;
using backend.Model.Booking;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
// ReSharper disable All

namespace backend.ModelDTO.Customer.OrderRespond
{
    public class OrderRespondDTO
    {
        public Dictionary<string, string> VnpayInfo { get; set; } = new Dictionary<string, string>();

        public OrderRespondDTOInfo OrderRespondDtoInfo { get; set; } = null!;
    }


    public class OrderRespondDTOInfo
    {
        public string MovieName { get; set; } = string.Empty;

        public string CinemaLocation { get; set; } = string.Empty;

        public string RoomNumber { get; set; } = string.Empty;

        public string VisualFormat { get; set; } = string.Empty;

        public DateTime ShowedDate { get; set; }

        public OrderRespondUserTypeWithPrices OrderRespondUserTypeWithPrices { get; set; } = null!;

        public OrderRespondProductsInfoWithTotalPrice OrderRespondProductsInfoWithTotalPrice { get; set; } = null!;
        
        public decimal TotalPrice { get; set; }
    }

    public class OrderRespondUserTypeInfo
    {
        public string UserType { get; set; } = string.Empty;

        public string SeatsNumber { get; set; } = string.Empty;

        public decimal PriceTicket { get; set; }
    }

    public class OrderRespondUserTypeWithPrices
    {
        public List<OrderRespondUserTypeInfo> OrderRespondUserTypeInfos { get; set; } =
            new List<OrderRespondUserTypeInfo>();

        public decimal TotalPriceTicket { get; set; }
    }



    public class OrderRespondProductsInfo
    {
        public string ProductName { get; set; } = string.Empty;

        public decimal productTotalAmount { get; set; } 
        
        // ReSharper disable once InconsistentNaming
        public decimal productSinglePrice { get; set; }
        
        public int Quantity { get; set; }
    }

    public class OrderRespondProductsInfoWithTotalPrice
    {
        public List<OrderRespondProductsInfo> OrderRespondProductsInfos { get; set; } =
            new List<OrderRespondProductsInfo>();

        public decimal TotalPrice { get; set; }
    }
}