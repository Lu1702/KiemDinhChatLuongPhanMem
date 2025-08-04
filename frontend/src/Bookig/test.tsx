import React, { useEffect, useState } from 'react';
import Nav from '../Header/nav';
import Bottom from '../Footer/bottom';
import { useNavigate } from "react-router-dom";

// Define interfaces for the movie details API response
interface MovieMinimumAge {
  [key: string]: string;
}

interface MovieLanguage {
  [key: string]: string;
}

interface MovieGenre {
  movieGenreId: string;
  movieGenreName: string;
}

interface MovieData {
  movieId: string;
  movieName: string;
  movieImage: string;
  movieDescription: string;
  movieMinimumAge: MovieMinimumAge;
  movieDirector: string;
  movieActor: string;
  movieTrailerUrl: string;
  movieDuration: number;
  releaseDate: string;
  movieLanguage: MovieLanguage;
  movieVisualFormat: string[];
  movieGenre: MovieGenre[];
}

interface MovieApiResponse {
  status: string;
  message: string;
  data: MovieData;
}

// Define interface for the visual formats API response
interface MovieVisualFormat {
  movieVisualId: string;
  movieVisualFormatDetail: string;
}

// Define interfaces for the booking API response
interface ScheduleShowTime {
  hourScheduleID: string;
  hourScheduleDetail: string;
}

interface CinemaBooking {
  cinemaID: string;
  cinemaName: string;
  cinemaLocation: string;
  scheduleShowTimeWithCinemaDtos: ScheduleShowTime[];
}

interface Schedule {
  scheduleDate: string;
  cinemaBookings: CinemaBooking[];
}

interface BookingApiResponse {
  status: string;
  message: string;
  data: Schedule[];
}

// Interface for Room Info API response
interface Seat {
  seatsId: string;
  seatsNumber: string;
  isTaken: boolean;
}

interface RoomData {
  cinemaRoomId: string;
  cinemaRoomNumber: number;
  seats: Seat[];
}

interface RoomInfoApiResponse {
  status: string;
  message: string;
  data: RoomData;
}

// Interface for Price Info API response
interface UserTypePrice {
  userTypeName: string;
  price: number;
}

interface PriceItem {
  userTypeId: string;
  userTypeWithPriceDTO: UserTypePrice;
}

interface PriceApiResponse {
  status: string;
  message: string;
  data: PriceItem[];
}

// Interface for Food Info API response
interface FoodItem {
  foodId: string;
  foodName: string;
  foodImageURL: string;
  foodPrice: number;
}

interface FoodApiResponse {
  status: string;
  message: string;
  data: FoodItem[];
}

// Interface for Booking API Payload
interface FoodRequestDTO {
  foodID: string;
  quantity: number;
}

interface SeatRequestDTO {
  seatID: string;
}

interface UserTypeRequestDTO {
  userTypeID: string;
  quantity: number;
  seatsList: SeatRequestDTO[];
}

interface BookingPayload {
  userId: string;
  movieScheduleId: string;
  foodRequestDTOs: FoodRequestDTO[];
  userTypeRequestDTO: UserTypeRequestDTO[];
}

const MovieDetails: React.FC = () => {
  const [movie, setMovie] = useState<MovieData | null>(null);
  const [visualFormats, setVisualFormats] = useState<MovieVisualFormat[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const [selectedVisualId, setSelectedVisualId] = useState<string>('');
  const [bookingInfo, setBookingInfo] = useState<BookingApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedShowTime, setSelectedShowTime] = useState<string | null>(null);
  const [selectedCinemaId, setSelectedCinemaId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  // States for modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [roomInfo, setRoomInfo] = useState<RoomData | null>(null);
  const [roomLoading, setRoomLoading] = useState<boolean>(false);
  const [roomError, setRoomError] = useState<string | null>(null);
  // States for price selection
  const [priceInfo, setPriceInfo] = useState<PriceItem[] | null>(null);
  const [selectedTickets, setSelectedTickets] = useState<{[key: string]: number}>({});
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  // States for food selection
  const [foodInfo, setFoodInfo] = useState<FoodItem[] | null>(null);
  const [selectedFoods, setSelectedFoods] = useState<{[key: string]: number}>({});
  const [totalFoodPrice, setTotalFoodPrice] = useState<number>(0);
  const navigate = useNavigate();
  // States for booking process
  const [bookingLoading, setBookingLoading] = useState<boolean>(false);
  const [bookingProcessingError, setBookingProcessingError] = useState<string | null>(null);
  console.log('idphim là',localStorage.getItem('movieId'))
  
  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        
        const movieId = localStorage.getItem('movieId');
        if (!movieId) {
          setError('Missing movie ID.');
          setLoading(false);
          return;
        }

        const response = await fetch(
          `http://localhost:5229/api/movie/getMovieDetail/${movieId}`,
          {
            method: 'GET',
            headers: {
              accept: '*/*',
            },
          }
        );
        const result: MovieApiResponse = await response.json();
        if (result.status === 'Success') {
          setMovie(result.data);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError('Failed to load movie details.');
      }
    };

    const fetchVisualFormats = async () => {
      try {
        const response = await fetch(
          'http://localhost:5229/api/MovieVisualFormat/GetMovieVisualFormatList',
          {
            method: 'GET',
            headers: {
 
              accept: '*/*',
            },
          }
        );
        const result: MovieVisualFormat[] = await response.json();
        setVisualFormats(result);
        if (result.length > 0) {
          setSelectedFormat(result[0].movieVisualFormatDetail);
          setSelectedVisualId(result[0].movieVisualId);
          localStorage.setItem('VSID', result[0].movieVisualId);
        }
      } catch (err) {
        setError('Failed to load visual formats.');
      }
    };

    const fetchData = async () => {
      await Promise.all([fetchMovieDetails(), fetchVisualFormats()]);
      setLoading(false);
    };

    fetchData();
  }, []);
  
  useEffect(() => {
    if (priceInfo) {
      let total = 0;
      for (const userTypeId in selectedTickets) {
        const priceItem = priceInfo.find(item => item.userTypeId === userTypeId);
        if (priceItem) {
          total += selectedTickets[userTypeId] * priceItem.userTypeWithPriceDTO.price;
        }
      }
      setTotalPrice(total);
    }
  }, [selectedTickets, priceInfo]);

  useEffect(() => {
    if (foodInfo) {
      let total = 0;
      for (const foodId in selectedFoods) {
        const foodItem = foodInfo.find(item => item.foodId === foodId);
        if (foodItem) {
          total += selectedFoods[foodId] * foodItem.foodPrice;
        }
      }
      setTotalFoodPrice(total);
    }
  }, [selectedFoods, foodInfo]);
  const handleVisualFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedDetail = e.target.value;
    setSelectedFormat(selectedDetail);
    const selectedFormatObj = visualFormats.find(
      (format) => format.movieVisualFormatDetail === selectedDetail
    );
    if (selectedFormatObj) {
      setSelectedVisualId(selectedFormatObj.movieVisualId);
      localStorage.setItem('VSID', selectedFormatObj.movieVisualId);
    }
  };
  const handleGetBookingInfo = async () => {
    const movieId = localStorage.getItem('movieId');
    const visualId = localStorage.getItem('VSID');
    if (!movieId || !visualId) {
      setError('Missing movie ID or visual format ID.');
      return;
    }

    setBookingError(null);
    try {
      const response = await fetch(
        `http://localhost:5229/api/Cinema/getCinemaInfoBookingService?MovieID=${movieId}&movieVisualFormatID=${visualId}`,
        {
          method: 'GET',
          headers: {
            accept: '*/*',
          },
        }
      );
      if (!response.ok) {
        if (response.status === 400) {
          setBookingError('Lỗi định dạng không phù hợp với phim');
          setBookingInfo(null);
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } else {
        const result: BookingApiResponse = await response.json();
        if (result.status === 'Success') {
          setBookingInfo(result);
          setError(null);
          setSelectedShowTime(null);
        } else {
          setError(result.message);
          setBookingInfo(null);
          setSelectedShowTime(null);
        }
      }
    } catch (err) {
      setError('Failed to load booking information.');
      setBookingInfo(null);
    }
  };

  const handleShowTimeClick = (showTimeId: string, cinemaId: string, scheduleDate: string) => {
    setSelectedShowTime(showTimeId);
    setSelectedCinemaId(cinemaId);
    setSelectedDate(scheduleDate);
  };
  
  const fetchRoomInfo = async () => {
    setRoomLoading(true);
    setRoomError(null);
    try {
      const movieId = localStorage.getItem('movieId');
      const visualId = localStorage.getItem('VSID');
      if (!movieId || !selectedDate || !selectedShowTime || !visualId) {
        setRoomError('Missing required booking information.');
        setRoomLoading(false);
        return;
      }
      
      const response = await fetch(
        `http://localhost:5229/api/CinemaRoom/GetRoomInfo?movieID=${movieId}&scheduleDate=${selectedDate}&HourId=${selectedShowTime}&movieVisualID=${visualId}`,
        {
          method: 'GET',
          headers: {
            accept: '*/*',
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: RoomInfoApiResponse = await response.json();
      if (result.status === 'Success') {
        setRoomInfo(result.data);
      } else {
        setRoomError(result.message);
      }
    } catch (err) {
      setRoomError('Failed to load room information.');
    } finally {
      setRoomLoading(false);
    }
  };
  const fetchPriceInfo = async () => {
    const visualId = localStorage.getItem('VSID');
    if (!visualId) {
      console.error('Missing visual format ID for price info.');
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5229/api/Price/getPrices/${visualId}`,
        {
          method: 'GET',
          headers: {
            accept: '*/*',
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result: PriceApiResponse = await response.json();
      if (result.status === 'Success') {
        setPriceInfo(result.data);
      }
    } catch (err) {
      console.error('Failed to load price information.', err);
    }
  };
  
  const fetchFoodInfo = async () => {
    try {
      const response = await fetch(
        'http://localhost:5229/api/Food/GetFoodInformation',
        {
          method: 'GET',
          headers: {
            accept: '*/*',
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: FoodApiResponse = await response.json();
      if (result.status === 'Success') {
        setFoodInfo(result.data);
      }
    } catch (err) {
      console.error('Failed to load food information.', err);
    }
  };

  const handlePayment = () => {
    if (selectedShowTime && selectedCinemaId && selectedDate) {
      setIsModalOpen(true);
      fetchRoomInfo();
      fetchPriceInfo();
      fetchFoodInfo();
    } else {
      alert('Vui lòng chọn một suất chiếu để thanh toán.');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setRoomInfo(null);
    setPriceInfo(null);
    setFoodInfo(null);
    setSelectedTickets({});
    setSelectedFoods({});
    setTotalPrice(0);
    setTotalFoodPrice(0);
    setSelectedSeats([]);
    setBookingProcessingError(null);
  };

  const handleTicketCountChange = (userTypeId: string, increment: number) => {
    setSelectedTickets(prev => {
      const newCount = (prev[userTypeId] || 0) + increment;
      if (newCount < 0) return prev;
      
      const totalTickets = Object.values(prev).reduce((sum, count) => sum + count, 0);
      const totalSeats = roomInfo?.seats.filter(seat => !seat.isTaken).length || 0;
      
      if (increment > 0 && totalTickets + 1 > totalSeats) {
   
        alert('Số lượng vé không được vượt quá số ghế còn trống.');
        return prev;
      }

      return {
        ...prev,
        [userTypeId]: newCount
      };
    });
  };
  
  const handleFoodCountChange = (foodId: string, increment: number) => {
    setSelectedFoods(prev => {
      const newCount = (prev[foodId] || 0) + increment;
      if (newCount < 0) return prev;
      return {
        ...prev,
        [foodId]: newCount
      };
    });
  };

  const handleSeatClick = (seatId: string) => {
    const totalTicketsCount = Object.values(selectedTickets).reduce((sum, count) => sum + count, 0);
    const isSelected = selectedSeats.includes(seatId);

    if (isSelected) {
      // Deselect seat
      setSelectedSeats(prev => prev.filter(id => id !== seatId));
    } else {
      // Select seat, but only if ticket count is not exceeded
      if (selectedSeats.length < totalTicketsCount) {
        setSelectedSeats(prev => [...prev, seatId]);
      } else {
        alert(`Bạn đã chọn đủ ${totalTicketsCount} ghế. Vui lòng bỏ chọn một ghế để chọn ghế khác.`);
      }
    }
  };
  
  const totalTickets = Object.values(selectedTickets).reduce((sum, count) => sum + count, 0);
  const handleBooking = async () => {
    if (selectedSeats.length !== totalTickets || totalTickets === 0) {
      setBookingProcessingError('Vui lòng chọn đủ số lượng ghế đã đặt.');
      return;
    }

    setBookingLoading(true);
    setBookingProcessingError(null);
    
    const movieId = localStorage.getItem('movieId');
    const visualId = localStorage.getItem('VSID');
    const userId = localStorage.getItem('IDND');
    const authToken = localStorage.getItem('authToken');

    if (!userId || !authToken || !movieId || !selectedShowTime || !selectedDate || !roomInfo?.cinemaRoomId || !visualId) {
      setBookingProcessingError('Thiếu thông tin cần thiết để đặt vé. Vui lòng thử lại.');
      setBookingLoading(false);
      return;
    }
    
    let movieScheduleId = '';
    try {
      // Bước 1: Lấy movieScheduleId từ API
      const scheduleResponse = await fetch(
        `http://localhost:5229/api/Schedule/getMovieScheduleId?movieId=${movieId}&HourId=${selectedShowTime}&cinemaRooomId=${roomInfo.cinemaRoomId}&showDate=${selectedDate}&movieVisualID=${visualId}`,
        {
          method: 'GET',
          headers: {
            'accept': '*/*',
          },
        }
      );
      if (!scheduleResponse.ok) {
        const errorResult = await scheduleResponse.json();
        setBookingProcessingError(errorResult.message || 'Lỗi khi lấy ID lịch chiếu.');
        setBookingLoading(false);
        return;
      }
      
      const scheduleData = await scheduleResponse.json();
      movieScheduleId = scheduleData.data;
      if (!movieScheduleId) {
        setBookingProcessingError('Không tìm thấy ID lịch chiếu.');
        setBookingLoading(false);
        return;
      }

      // Bước 2: Chuẩn bị payload và gọi API Booking
      const seatsToBook = [...selectedSeats];
      const foodRequestDTOs: FoodRequestDTO[] = Object.keys(selectedFoods)
        .filter(foodId => selectedFoods[foodId] > 0)
        .map(foodId => ({
          foodID: foodId,
          quantity: selectedFoods[foodId]
        }));
      const userTypeRequestDTOs: UserTypeRequestDTO[] = [];
      const sortedUserTypeIds = Object.keys(selectedTickets).sort();

      for (const userTypeId of sortedUserTypeIds) {
        const quantity = selectedTickets[userTypeId];
        if (quantity > 0) {
          const seatsForThisType = [];
          for (let i = 0; i < quantity; i++) {
            const seatId = seatsToBook.shift();
            if (seatId) {
              seatsForThisType.push({ seatID: seatId });
            }
          }
          userTypeRequestDTOs.push({
            userTypeID: userTypeId,
            quantity: quantity,
            seatsList: seatsForThisType
          });
        }
      }
      
      const payload: BookingPayload = {
        userId: userId,
        movieScheduleId: movieScheduleId,
        foodRequestDTOs: foodRequestDTOs,
        userTypeRequestDTO: userTypeRequestDTOs,
      };
      console.log('Payload gửi đi:', payload);
      
      const bookingResponse = await fetch('http://localhost:5229/api/Booking/Booking', {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });
      const bookingResult = await bookingResponse.json();
      console.log(bookingResult)
      if (bookingResponse.ok && bookingResult.status === 'Success') {
        alert('Đặt vé thành công!');
        localStorage.removeItem('movieId')
        localStorage.removeItem('VSID')
        closeModal();
        navigate('/listfilm')
      } else {
        setBookingProcessingError(bookingResult.message || 'Đặt vé thất bại. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('Booking error:', err);
      setBookingProcessingError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setBookingLoading(false);
    }
  };
  const finalTotalPrice = totalPrice + totalFoodPrice;

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images8.alphacoders.com/136/thumb-1920-1368754.jpeg')",
      }}
    >
      <div className="sticky top-0 z-50 shadow-xl bg-[url('https://th.bing.com/th/id/R.9e8b6083d2c56afe3e37c99a0d008551?rik=MgANzjo9WJbFrA&riu=http%3a%2f%2fgetwallpapers.com%2fwallpaper%2ffull%2f5%2f0%2f3%2f718692-amazing-dark-purple-backgrounds-1920x1200.jpg&ehk=QVn3JWJ991bU4NaIVD9w8hngTuAZ1AHehPjBWxqpDUE%3d&risl=&pid=ImgRaw&r=0')]">
        <header>
          <div className="max-w-7xl mx-auto px-8">
            <Nav />
 
          </div>
        </header>
      </div>
      <div className="max-w-7xl mx-auto px-8 min-h-screen pt-24 flex justify-center items-center">
        <div className="max-w-lg w-full bg-gradient-to-r from-blue-800 to-purple-600 rounded-xl shadow-2xl overflow-hidden p-10 space-y-6 animate-[slideInFromLeft_1s_ease-out]">
          <h2 className="text-center text-4xl font-extrabold text-white animate-[appear_2s_ease-out]">
            Chi tiết phim
          </h2>
     
          {loading && (
            <p className="text-center text-gray-200 animate-[appear_3s_ease-out]">
              Đang tải...
            </p>
          )}
          {error && (
            <p className="text-center text-red-300 animate-[appear_3s_ease-out]">
              {error}
            </p>
          )}
          {movie && (
            <div className="space-y-6">
              <img
                src={movie.movieImage}
                alt={movie.movieName}
       
                className="w-full h-64 object-cover rounded-md"
              />
              <div className="relative">
                <p className="text-white text-lg">{movie.movieName}</p>
                <label className="absolute left-0 -top-4 text-gray-500 text-base">
                  Tên phim
 
                </label>
              </div>
              <div className="relative">
                <p className="text-white text-lg break-words">{movie.movieDescription}</p>
                <label className="absolute left-0 -top-4 text-gray-500 text-base">
                
                  Mô tả
                </label>
              </div>
              <div className="relative">
                <p className="text-white text-lg break-words">{movie.movieDirector}</p>
                <label className="absolute left-0 -top-4 text-gray-500 text-base">
            
                  Đạo diễn
                </label>
              </div>
              <div className="relative">
                <p className="text-white text-lg break-words">{movie.movieActor}</p>
                <label className="absolute left-0 -top-4 text-gray-500 text-base">
        
                  Diễn viên
                </label>
              </div>
              <div className="relative">
                <p className="text-white text-lg">{movie.movieDuration} phút</p>
                <label className="absolute left-0 -top-4 text-gray-500 text-base">
    
                  Thời lượng
                </label>
              </div>
              <div className="relative">
                <p className="text-white text-lg">
                  {new Date(movie.releaseDate).toLocaleDateString('vi-VN')}
   
                </p>
                <label className="absolute left-0 -top-4 text-gray-500 text-base">
                  Ngày phát hành
                </label>
              </div>
              <div className="relative">
 
                <p className="text-white text-lg">
                  {Object.values(movie.movieLanguage)[0]}
                </p>
                <label className="absolute left-0 -top-4 text-gray-500 text-base">
                  Ngôn ngữ
         
                </label>
              </div>
              <div className="relative">
                <p className="text-white text-lg">
                  {Object.values(movie.movieMinimumAge)[0]}
                </p>
            
                <label className="absolute left-0 -top-4 text-gray-500 text-base">
                  Độ tuổi tối thiểu
                </label>
              </div>
              <div className="relative">
                <p className="text-white text-lg">
       
                  {movie.movieGenre.map((genre) => genre.movieGenreName).join(', ')}
                </p>
                <label className="absolute left-0 -top-4 text-gray-500 text-base">
                  Thể loại
                </label>
              
              </div>
              <div className="relative">
                <a
                  href={movie.movieTrailerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
              
                  className="text-purple-300 hover:underline text-lg"
                >
                  Xem Trailer
                </a>
                <label className="absolute left-0 -top-4 text-gray-500 text-base">
                  Trailer
    
                </label>
              </div>
              <div className="relative">
                <select
                  value={selectedFormat}
                  onChange={handleVisualFormatChange}
       
                  className="peer h-12 w-full border-b-2 border-gray-300 text-white bg-transparent focus:outline-none focus:border-purple-500 text-lg"
                >
                  {visualFormats.map((format) => (
                    <option
                      key={format.movieVisualId}
  
                      value={format.movieVisualFormatDetail}
                      className="text-black"
                    >
                      {format.movieVisualFormatDetail}
                
                    </option>
                  ))}
                </select>
                <label className="absolute left-0 -top-4 text-gray-500 text-base transition-all peer-placeholder-shown:text-lg peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-4 peer-focus:text-purple-500 peer-focus:text-base">
                  Định dạng hình ảnh
             
                </label>
              </div>
              <button
                onClick={handleGetBookingInfo}
                className="w-full py-3 px-4 bg-purple-500 hover:bg-purple-700 rounded-md shadow-lg text-white text-lg font-semibold transition duration-200"
              >
            
                Xem xuất chiếu khả dụng
              </button>
              {bookingError && (
                <div className="text-center text-red-300 mt-4">
                  {bookingError}
                </div>
         
              )}
              {bookingInfo && (
                <>
                  <div className="relative">
                    <div className="text-white text-lg bg-gray-800 p-4 rounded-md space-y-4">
                  
                      {bookingInfo.data.map((schedule, index) => (
                        <div key={index} className="border-b border-gray-600 pb-2">
                          <p className="font-semibold">
                            Ngày: {new Date(schedule.scheduleDate).toLocaleDateString('vi-VN')}
        
                          </p>
                          {schedule.cinemaBookings.map((cinema) => (
                            <div key={cinema.cinemaID} className="ml-4 mt-2">
                       
                              <p className="font-medium">{cinema.cinemaName}</p>
                              <p className="text-sm text-gray-300">Địa điểm: {cinema.cinemaLocation}</p>
                              <div className="flex flex-wrap gap-2 mt-2">
                        
                                {cinema.scheduleShowTimeWithCinemaDtos.map((show) => (
                                  <button
                                    key={show.hourScheduleID}
                    
                                    onClick={() => handleShowTimeClick(show.hourScheduleID, cinema.cinemaID, schedule.scheduleDate)}
                                    className={`px-4 py-2 rounded-md transition-colors duration-200 
                                      ${selectedShowTime === show.hourScheduleID
                                        ? 'bg-purple-500 text-white shadow-md'
                                        : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                                      }`}
                 
                                  >
                                    {show.hourScheduleDetail}
                                  </button>
             
                                ))}
                              </div>
                            </div>
                       
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
             
                  <button
                    onClick={handlePayment}
                    disabled={!selectedShowTime}
                    className={`w-full py-3 px-4 rounded-md text-white text-lg font-semibold transition duration-200 mt-4
                      ${selectedShowTime
    
                        ? 'bg-green-600 hover:bg-green-700 shadow-lg'
                        : 'bg-gray-500 cursor-not-allowed'
                      }`}
                  >
                    Thanh toán
           
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      <footer className="pt-32">
        <Bottom />
      </footer>
     
      
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="relative p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white text-black">
            <h3 className="text-xl font-bold mb-4">Thông tin đặt vé</h3>
            
            {/* Ticket Selection Section */}
            <div className="mb-6">
              <h4 className="font-semibold text-lg mb-2">Chọn loại vé và số lượng</h4>
              {priceInfo && priceInfo.length > 0 ? (
                <div className="space-y-2">
                  {priceInfo.map((item) => (
                    <div key={item.userTypeId} className="flex justify-between items-center bg-gray-100 p-3 rounded-md">
                      <div className="flex-1">
             
                        <p className="font-medium">{item.userTypeWithPriceDTO.userTypeName}</p>
                        <p className="text-sm text-gray-600">Giá: {item.userTypeWithPriceDTO.price.toLocaleString('vi-VN')} VNĐ</p>
                      </div>
                      <div className="flex items-center space-x-2">
             
                        <button
                          onClick={() => handleTicketCountChange(item.userTypeId, -1)}
                          className="bg-gray-300 hover:bg-gray-400 p-2 rounded-full w-8 h-8 flex items-center justify-center"
                        >
  
                          -
                        </button>
                        <span className="w-8 text-center">{selectedTickets[item.userTypeId] || 0}</span>
                        <button
                          onClick={() => handleTicketCountChange(item.userTypeId, 1)}
                          className="bg-gray-300 hover:bg-gray-400 p-2 rounded-full w-8 h-8 flex items-center justify-center"
             
                        >
                          +
                        </button>
                      </div>
                 
                    </div>
                  ))}
                </div>
              ) : (
                <p>Đang tải giá vé...</p>
              )}
              
              <div className="mt-4 p-3 bg-gray-200 rounded-md font-bold text-lg">
                Tổng số vé đã chọn: {totalTickets}
              </div>
            </div>

            {/* Food Selection Section */}
            <div className="mb-6">
              <h4 className="font-semibold text-lg mb-2">Chọn đồ ăn & thức uống</h4>
              {foodInfo && foodInfo.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {foodInfo.map((food) => (
                    <div key={food.foodId} className="border p-3 rounded-md flex flex-col items-center">
                      <img src={food.foodImageURL} alt={food.foodName} className="w-20 h-20 object-cover rounded-md mb-2" />
    
                      <p className="font-medium text-center">{food.foodName}</p>
                      <p className="text-sm text-gray-600 mb-2">{food.foodPrice.toLocaleString('vi-VN')} VNĐ</p>
                      <div className="flex items-center space-x-2">
                        <button
     
                          onClick={() => handleFoodCountChange(food.foodId, -1)}
                          className="bg-gray-300 hover:bg-gray-400 p-1 rounded-full w-6 h-6 flex items-center justify-center"
                        >
                  
                          -
                        </button>
                        <span className="w-6 text-center">{selectedFoods[food.foodId] || 0}</span>
                        <button
                          onClick={() => handleFoodCountChange(food.foodId, 1)}
                          className="bg-gray-300 hover:bg-gray-400 p-1 rounded-full w-6 h-6 flex items-center justify-center"
             
                        >
                          +
                        </button>
                      </div>
                 
                    </div>
                  ))}
                </div>
              ) : (
                <p>Đang tải danh sách đồ ăn...</p>
              )}
            
            </div>

            {/* Seat Selection Section */}
            <div>
              <h4 className="font-semibold text-lg mb-2">Sơ đồ ghế</h4>
              {(roomLoading || !roomInfo) && <p className="text-center">Đang tải thông tin phòng chiếu...</p>}
              {roomError && <p className="text-center text-red-500">{roomError}</p>}
           
              {roomInfo && (
                <div className="mt-4">
                  <p>Phòng chiếu: {roomInfo.cinemaRoomNumber}</p>
                  <div className="grid grid-cols-8 gap-2 mt-4">
                    {roomInfo.seats.map((seat) => (
              
                      <button
                        key={seat.seatsId}
                        onClick={() => handleSeatClick(seat.seatsId)}
                        className={`py-2 px-4 rounded-md text-sm font-semibold transition-colors duration-200
            
                          ${seat.isTaken 
                            ? 'bg-red-500 text-white cursor-not-allowed' 
                            : selectedSeats.includes(seat.seatsId)
                            ? 'bg-blue-500 text-white'
                            : totalTickets === 0
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-green-500 text-white hover:bg-green-600'
                          }`}
                        disabled={seat.isTaken || totalTickets === 0}
                      >
                        {seat.seatsNumber}
                      </button>
                    ))}
          
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-between items-center">
              <div className="text-xl font-bold">
                Tổng cộng: {finalTotalPrice.toLocaleString('vi-VN')} VNĐ
              </div>
              <div>
                {bookingProcessingError && (
                  <p className="text-red-500 text-sm mb-2">{bookingProcessingError}</p>
                )}
                
                <button
                  onClick={closeModal}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                >
                  Đóng
                </button>
       
                <button
                  onClick={handleBooking}
                  disabled={selectedSeats.length !== totalTickets || totalTickets === 0 || bookingLoading}
                  className={`py-2 px-4 rounded font-bold text-white
                    ${selectedSeats.length === totalTickets && totalTickets > 0 && !bookingLoading
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-gray-500 cursor-not-allowed'
                    }`}
                >
                  {bookingLoading ? 'Đang xử lý...' : 'Đặt vé'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetails;