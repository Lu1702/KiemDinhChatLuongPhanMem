namespace backend.ModelDTO.Customer.OrderRequest
{
    public class OrderRequestDTO
    {
        public string userId { get; set; } = "";

        public string movieScheduleId { get; set; } = string.Empty;

        
        public List<FoodRequestDTO> foodRequestDTOs { get; set; } = [];

        public List<userTypeRequestDTO> userTypeRequestDTO { get; set; } = [];
    }

    public class userTypeRequestDTO
    {
        public string userTypeID { get; set; } = string.Empty;
        public int quantity { get; set; }

        public List<SeatsRequestDTO> SeatsList { get; set; } = [];
    }

    public class SeatsRequestDTO
    {
        public string seatID { get; set; } = string.Empty;

    }

    public class FoodRequestDTO
    {
        public string foodID { get; set; } = string.Empty;
        public int quantity { get; set; } 

    }
}
