import React, { useEffect, useState } from 'react';
import Nav from '../Header/nav';
import Bottom from '../Footer/bottom';
import { useNavigate } from "react-router-dom";
import Clock from '../Components/Clock';

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
  foodName?: string;
  foodPrice?: number;
}

interface SeatRequestDTO {
  seatID: string;
  seatsNumber?: string;
}

interface UserTypeRequestDTO {
  userTypeID: string;
  quantity: number;
  seatsList: SeatRequestDTO[];
  userTypeName?: string;
  price?: number;
}

interface BookingPayload {
  userId: string;
  movieScheduleId: string;
  foodRequestDTOs: FoodRequestDTO[];
  userTypeRequestDTO: UserTypeRequestDTO[];
}

// Define BookingDetails interface
interface BookingDetails {
  userId: string;
  movieScheduleId: string;
  foodRequestDTOs: FoodRequestDTO[];
  userTypeRequestDTO: UserTypeRequestDTO[];
  movieName?: string;
  cinemaName?: string;
  showTime?: string;
  showDate?: string;
  roomNumber?: number;
}

const MovieDetails: React.FC = () => {
  const [movie, setMovie] = useState<MovieData | null>(null);
  const [visualFormats, setVisualFormats] = useState<MovieVisualFormat[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const [selectedVisualId, setSelectedVisualId] = useState<string>('');
  const [bookingInfo, setBookingInfo] = useState<BookingApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingProcessingError, setBookingProcessingError] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedShowTime, setSelectedShowTime] = useState<string | null>(null);
  const [selectedCinemaId, setSelectedCinemaId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isBookingSectionOpen, setIsBookingSectionOpen] = useState<boolean>(false);
  const [roomInfo, setRoomInfo] = useState<RoomData | null>(null);
  const [roomLoading, setRoomLoading] = useState<boolean>(false);
  const [roomError, setRoomError] = useState<string | null>(null);
  const [priceInfo, setPriceInfo] = useState<PriceItem[] | null>(null);
  const [selectedTickets, setSelectedTickets] = useState<{ [key: string]: number }>({});
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [foodInfo, setFoodInfo] = useState<FoodItem[] | null>(null);
  const [selectedFoods, setSelectedFoods] = useState<{ [key: string]: number }>({});
  const [totalFoodPrice, setTotalFoodPrice] = useState<number>(0);
  const [showTrailer, setShowTrailer] = useState<boolean>(false);
  const [trailerUrl, setTrailerUrl] = useState<string>('');
  const [startCountdown, setStartCountdown] = useState(false);
  const [commentCount, setCommentCount] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    const storedCommentCount = localStorage.getItem('commentCount');
    if (storedCommentCount) {
      setCommentCount(parseInt(storedCommentCount, 10));
    }
  }, []);

  const handleComments = () => {
    navigate("/comments");
  };

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

  useEffect(() => {
    if (selectedSeats.length > 0 && !startCountdown) {
      setStartCountdown(true);
    }
  }, [selectedSeats, startCountdown]);

  const handleTimeout = () => {
    setSelectedSeats([]);
    setStartCountdown(false);
    alert("⏰ Hết giờ! Bạn sẽ được chuyển hướng về trang chủ.");
    navigate("/movies");
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
      setIsBookingSectionOpen(true);
      fetchRoomInfo();
      fetchPriceInfo();
      fetchFoodInfo();
    } else {
      alert('Vui lòng chọn một suất chiếu để thanh toán.');
    }
  };

  const closeBookingSection = () => {
    setIsBookingSectionOpen(false);
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
      setSelectedSeats(prev => prev.filter(id => id !== seatId));
    } else {
      if (selectedSeats.length < totalTicketsCount) {
        setSelectedSeats(prev => [...prev, seatId]);
      } else {
        alert(`Bạn đã chọn đủ ${totalTicketsCount} ghế. Vui lòng bỏ chọn một ghế để chọn ghế khác.`);
      }
    }
  };

  const handleOpenTrailer = (url: string) => {
    const embedUrl = url.includes('watch?v=')
      ? url.replace('watch?v=', 'embed/')
      : url.includes('youtu.be/')
        ? `https://www.youtube.com/embed/${url.split('youtu.be/')[1].split('?')[0]}`
        : url;
    setTrailerUrl(embedUrl);
    setShowTrailer(true);
  };

  const totalTickets = Object.values(selectedTickets).reduce((sum, count) => sum + count, 0);
  const finalTotalPrice = totalPrice + totalFoodPrice;

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
      const scheduleResponse = await fetch(
        `http://localhost:5229/api/Schedule/getMovieScheduleId?movieId=${movieId}&HourId=${selectedShowTime}&cinemaRooomId=${roomInfo.cinemaRoomId}&showDate=${selectedDate}&movieVisualID=${visualId}`,
        {
          method: 'GET',
          headers: {
            accept: '*/*',
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

      const seatsToBook = [...selectedSeats];
      const foodRequestDTOs: FoodRequestDTO[] = Object.keys(selectedFoods)
        .filter(foodId => selectedFoods[foodId] > 0)
        .map(foodId => ({
          foodID: foodId,
          quantity: selectedFoods[foodId],
          foodName: foodInfo?.find(f => f.foodId === foodId)?.foodName,
          foodPrice: foodInfo?.find(f => f.foodId === foodId)?.foodPrice,
        }));
      const userTypeRequestDTOs: UserTypeRequestDTO[] = [];
      const sortedUserTypeIds = Object.keys(selectedTickets).sort();

      for (const userTypeId of sortedUserTypeIds) {
        const quantity = selectedTickets[userTypeId];
        if (quantity > 0) {
          const seatsForThisType: SeatRequestDTO[] = [];
          for (let i = 0; i < quantity; i++) {
            const seatId = seatsToBook.shift();
            if (seatId) {
              seatsForThisType.push({
                seatID: seatId,
                seatsNumber: roomInfo?.seats.find(s => s.seatsId === seatId)?.seatsNumber,
              });
            }
          }
          userTypeRequestDTOs.push({
            userTypeID: userTypeId,
            quantity,
            seatsList: seatsForThisType,
            userTypeName: priceInfo?.find(p => p.userTypeId === userTypeId)?.userTypeWithPriceDTO.userTypeName,
            price: priceInfo?.find(p => p.userTypeId === userTypeId)?.userTypeWithPriceDTO.price,
          });
        }
      }

      const bookingDetails: BookingDetails = {
        userId,
        movieScheduleId,
        foodRequestDTOs,
        userTypeRequestDTO: userTypeRequestDTOs,
        movieName: movie?.movieName,
        cinemaName: bookingInfo?.data.find(d => d.scheduleDate === selectedDate)?.cinemaBookings.find(c => c.cinemaID === selectedCinemaId)?.cinemaName,
        showTime: bookingInfo?.data.find(d => d.scheduleDate === selectedDate)?.cinemaBookings.find(c => c.cinemaID === selectedCinemaId)?.scheduleShowTimeWithCinemaDtos.find(s => s.hourScheduleID === selectedShowTime)?.hourScheduleDetail,
        showDate: selectedDate,
        roomNumber: roomInfo?.cinemaRoomNumber,
      };

      console.log('Saving bookingDetails:', bookingDetails); // Debug log
      localStorage.setItem('bookingDetails', JSON.stringify(bookingDetails));

      const payload: BookingPayload = {
        userId,
        movieScheduleId,
        foodRequestDTOs,
        userTypeRequestDTO: userTypeRequestDTOs,
      };

      const bookingResponse = await fetch('http://localhost:5229/api/Booking/Booking', {
        method: 'POST',
        headers: {
          accept: '*/*',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });
      const bookingResult = await bookingResponse.json();
      localStorage.setItem("respondInfoBooking", JSON.stringify(bookingResult))

      if (bookingResponse.ok && bookingResult.status === 'Success') {
        alert('Đặt vé thành công!');
        console.log('Navigating to /payment'); // Debug log
        closeBookingSection();
        navigate('/payment');
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

  return (
    <div
      className="flex flex-col min-h-screen bg-fixed w-full bg-cover bg-center"
      style={{ backgroundImage: "url('https://images8.alphacoders.com/136/thumb-1920-1368754.jpeg')" }}
    >
      <div className="sticky top-0 z-50 bg-slate-950 shadow-md">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-8">
          <Nav />
        </div>
      </div>
      <main className="flex-grow flex flex-col items-center">
        <div className="pt-3 w-full max-w-screen-xl mx-auto px-4 sm:px-8 py-12">
          {loading && (
            <div className="flex-col gap-4 w-full flex items-center justify-center">
              <div
                className="w-20 h-20 border-4 border-transparent text-blue-400 text-4xl animate-spin flex items-center justify-center border-t-blue-400 rounded-full"
              >
                <div
                  className="w-16 h-16 border-4 border-transparent text-red-400 text-2xl animate-spin flex items-center justify-center border-t-red-400 rounded-full"
                ></div>
              </div>
            </div>
          )}
          {error && (
            <div className="text-red-500 text-center p-4">{error}</div>
          )}
          {movie && (
            <div className="p-4 text-white">
              <div className="flex flex-col md:flex-row gap-6 mb-6 justify-center items-start">
                <div className="flex-shrink-0">
                  <img
                    src={movie.movieImage}
                    alt={movie.movieName}
                    className="w-full max-w-[400px] rounded-lg shadow-lg object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-yellow-400 mb-4 uppercase">{movie.movieName}</h1>
                  <ul className="text-white mb-4 space-y-2">
                    <li>
                      <span className="text-yellow-400 font-bold">Thể loại:</span>{' '}
                      <span className="pl-6">{movie.movieGenre.map(genre => genre.movieGenreName).join(', ')}</span>
                    </li>
                    <li>
                      <span className="text-yellow-400 font-bold">Thời lượng:</span>{' '}
                      <span className="pl-6">{movie.movieDuration} phút</span>
                    </li>
                    <li>
                      <span className="text-yellow-400 font-bold">Ngôn ngữ:</span>{' '}
                      <span className="pl-6">{Object.values(movie.movieLanguage)[0]}</span>
                    </li>
                    <li>
                      <span className="text-yellow-400 font-bold">Độ tuổi:</span>{' '}
                      <span className="pl-6">{Object.values(movie.movieMinimumAge)[0]}</span>
                    </li>
                    <li>
                      <span className="text-yellow-400 font-bold">Đạo diễn:</span>{' '}
                      <span className="pl-6">{movie.movieDirector || 'Không có thông tin'}</span>
                    </li>
                    <li>
                      <span className="text-yellow-400 font-bold">Diễn viên:</span>{' '}
                      <span className="pl-6">{movie.movieActor || 'Không có thông tin'}</span>
                    </li>
                    <li>
                      <span className="text-yellow-400 font-bold">Khởi chiếu:</span>{' '}
                      <span className="pl-6">{new Date(movie.releaseDate).toLocaleDateString('vi-VN')}</span>
                    </li>
                  </ul>
                  <p className="max-w-[600px] mb-6 text-white">{movie.movieDescription}</p>
                  <div className="flex gap-3 flex-col">
                    <div>
                      <button
                        onClick={() => handleOpenTrailer(movie.movieTrailerUrl)}
                        className="p-3 rounded-full backdrop-blur-lg border border-red-500/20 bg-gradient-to-tr from-black/60 to-black/40 shadow-lg hover:shadow-2xl hover:shadow-red-500/30 hover:scale-110 hover:rotate-2 active:scale-95 active:rotate-0 transition-all duration-300 ease-out cursor-pointer group relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                        <div className="relative z-10">
                          <svg
                            className="w-7 h-7 fill-current text-red-500 group-hover:text-red-400 transition-colors duration-300"
                            viewBox="0 0 576 512"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"
                            ></path>
                          </svg>
                        </div>
                      </button>
                    </div>
                    <div>
                      <p
                        onClick={handleComments}
                        className="text-white pl-32 py-9 text-lg font-bold flex items-center gap-2 cursor-pointer hover:text-yellow-400 transition-colors duration-300"
                      >
                        <img
                          className="w-9"
                          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAB00lEQVR4nO3au0oDQRiG4cGIhZ029l6EhcROBDsRLBQFwdbSzsrGqKUgKN6C9xBJtLQURWyUxGvwhK8k+ZA15LAJk8NM/qfSmSHZeYm7G1nnjDHGGGMEmACOgTfiUQaOKntz7VBbGKtcmgBlLZ53kQCy2lM5zeIqF5nU+yLtwsBYAPFXKjAWQPyVCowFEH+lAmMBxF+pwFgA8VcqMBZA/JUKjAWQjktRu9f/dw8e6FjXAaravViIYw3VLxymAx5UgGL9t7BAx7oLEItOApS1NusiASxoT6U0i3MMh2sg4/k/UYdpH5TMJT4Jg7Te4jg/OnidUmXzqR6UHAbAtg688rTqVJM1L1oz62IDjAF32uBlkzV5zS+7GAFzwCfwA2w0mD9RgAMXK2BPm3wHFuvmVjSXdzEDzhMR1hLj0xr7BmZcrIAMcKEIlT+HU2BSc1ca33WxA/aBL234CdgEVvX7Y6t7hthOjA+J6/tr4uctNwqo3ajtAM91Nzv3bpQA48AScKZPQtxXA2OM64Vff3q7PXoJEkoAAAAASUVORK5CYII="
                          alt="comments"
                        />
                        Bình luận
                        <span className="text-yellow-400 ml-2">({commentCount})</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center items-center mb-7">
                <div className="mt-6 w-72">
                  <select
                    value={selectedFormat}
                    onChange={handleVisualFormatChange}
                    className="w-full max-w-[300px] p-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:outline-none focus:border-yellow-400"
                  >
                    {visualFormats.map((format) => (
                      <option
                        key={format.movieVisualId}
                        value={format.movieVisualFormatDetail}
                        className="text-white bg-gray-800"
                      >
                        {format.movieVisualFormatDetail}
                      </option>
                    ))}
                  </select>
                  <div className='flex justify-center items-center'>
                    <button
                      onClick={handleGetBookingInfo}
                      className="group/button mt-4 p-3 relative inline-flex items-center justify-center overflow-hidden rounded-md bg-gray-800/30 backdrop-blur-lg px-6 py-2 text-base font-semibold text-white transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-xl hover:shadow-gray-600/50 border border-white/20"
                    >
                      <span className="text-lg">Xem xuất chiếu</span>
                      <div
                        className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-13deg)_translateX(-100%)] group-hover/button:duration-1000 group-hover/button:[transform:skew(-13deg)_translateX(100%)]"
                      >
                        <div className="relative h-full w-10 bg-white/20"></div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
              {bookingError && (
                <div className="text-center text-red-500 mb-6">{bookingError}</div>
              )}
              {bookingInfo && (
                <>
                  <div className="flex justify-center items-center flex-col">
                    <div className="text-white bg-gray-800 p-4 rounded-md space-y-4 w-96">
                      {bookingInfo.data.length > 0 ? (
                        bookingInfo.data.map((schedule, index) => (
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
                        ))
                      ) : (
                        <div className="flex flex-row justify-center items-center py-10">
                          <img
                            src="data:image/png;base64,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"
                            alt="film-reel"
                            className="h-12"
                          />
                          <p className="text-center text-4xl font-bold text-white uppercase pl-4">Hiện chưa có lịch chiếu</p>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handlePayment}
                      disabled={!selectedShowTime}
                      className={`group/button mt-4 p-3 relative inline-flex items-center justify-center overflow-hidden rounded-md bg-gray-800/30 backdrop-blur-lg px-6 py-2 text-base font-semibold text-white transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-xl hover:shadow-gray-600/50 border border-white/20
                      ${selectedShowTime
                          ? 'bg-green-600 hover:bg-purple-700 shadow-lg'
                          : 'bg-gray-500 cursor-not-allowed'
                        }`}>
                      <span className="text-lg">Chọn Ghế và Bắp nước</span>
                      <div
                        className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-13deg)_translateX(-100%)] group-hover/button:duration-1000 group-hover/button:[transform:skew(-13deg)_translateX(100%)]"
                      >
                        <div className="relative h-full w-10 bg-white/20"></div>
                      </div>
                    </button>
                  </div>

                  {isBookingSectionOpen && (
                    <div className="mt-6 p-5 border rounded-md bg-white/10 text-white max-w-screen-md mx-auto">
                      <div className="flex justify-center items-center mb-7">
                        <h3 className="text-2xl font-bold text-yellow-400">Thông tin đặt vé</h3>
                      </div>
                      <div className="mb-6">
                        <h4 className="font-semibold text-lg mb-2">Chọn loại vé và số lượng</h4>
                        {priceInfo && priceInfo.length > 0 ? (
                          <div className="space-y-2">
                            {priceInfo.map((item) => (
                              <div key={item.userTypeId} className="flex justify-between items-center bg-transparent p-3 rounded-md">
                                <div className="flex-1">
                                  <p className="font-medium text-lg text-yellow-400">{item.userTypeWithPriceDTO.userTypeName}</p>
                                  <p className="text-base text-white">Giá: {item.userTypeWithPriceDTO.price.toLocaleString('vi-VN')} VNĐ</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleTicketCountChange(item.userTypeId, -1)}
                                    className="bg-gray-600 hover:bg-yellow-300 hover:text-black p-2 rounded-full w-8 h-8 flex items-center justify-center"
                                  >
                                    -
                                  </button>
                                  <span className="w-8 text-center">{selectedTickets[item.userTypeId] || 0}</span>
                                  <button
                                    onClick={() => handleTicketCountChange(item.userTypeId, 1)}
                                    className="bg-gray-600 hover:bg-yellow-300 hover:text-black p-2 rounded-full w-8 h-8 flex items-center justify-center"
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
                        <div className="mt-4 p-3 bg-transparent rounded-md font-bold text-lg text-yellow-400">
                          Tổng số vé đã chọn: {totalTickets}
                        </div>
                      </div>
                      <div className="my-5">
                        <h4 className="font-semibold text-lg mb-2">Sơ đồ ghế</h4>
                        {(roomLoading || !roomInfo) && <p className="text-center">Đang tải thông tin phòng chiếu...</p>}
                        {roomError && <p className="text-center text-red-500">{roomError}</p>}
                        {roomInfo && (
                          <div className="mt-4">
                            <p className="text-white uppercase font-medium text-center">Phòng chiếu: {roomInfo.cinemaRoomNumber}</p>
                            <div className="grid grid-cols-5 gap-2 mt-4">
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
                                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
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
                      <div className="mb-6">
                        <h4 className="font-semibold text-lg mb-2">Chọn đồ ăn & thức uống</h4>
                        {foodInfo && foodInfo.length > 0 ? (
                          <div className="grid grid-cols-2 gap-4">
                            {foodInfo.map((food) => (
                              <div key={food.foodId} className="border p-3 rounded-md flex flex-row items-center bg-white/10">
                                <div className='px-5'>
                                  <img src={food.foodImageURL} alt={food.foodName} className="w-20 h-20 object-cover rounded-md mb-2" />
                                </div>
                                <div className="mr-5">
                                  <p className="font-medium text-center">{food.foodName}</p>
                                  <p className="text-sm text-slate-200 mb-2">{food.foodPrice.toLocaleString('vi-VN')} VNĐ</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleFoodCountChange(food.foodId, -1)}
                                    className="bg-gray-600 hover:bg-yellow-300 hover:text-black p-1 rounded-full w-6 h-6 flex items-center justify-center"
                                  >
                                    -
                                  </button>
                                  <span className="w-6 text-center">{selectedFoods[food.foodId] || 0}</span>
                                  <button
                                    onClick={() => handleFoodCountChange(food.foodId, 1)}
                                    className="bg-gray-600 hover:bg-yellow-300 hover:text-black p-1 rounded-full w-6 h-6 flex items-center justify-center"
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
                      <div className="mt-6 flex justify-between items-center">
                        <div className="text-xl font-bold">
                          Tổng cộng: {finalTotalPrice.toLocaleString('vi-VN')} VNĐ
                        </div>
                        <div className="flex flex-row px-5">
                          {startCountdown && <Clock seconds={300} onTimeout={handleTimeout} />}
                          {bookingProcessingError && (
                            <p className="text-red-500 text-sm mb-2">{bookingProcessingError}</p>
                          )}
                          <button
                            onClick={closeBookingSection}
                            className="bg-red-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mx-3"
                          >
                            Đóng
                          </button>
                          <button
                            onClick={handleBooking}
                            disabled={selectedSeats.length !== totalTickets || totalTickets === 0 || bookingLoading}
                            className={`py-2 px-4 rounded font-bold text-white
                              ${selectedSeats.length === totalTickets && totalTickets > 0 && !bookingLoading
                                ? 'bg-green-600 hover:bg-green-700'
                                : 'bg-gray-600 cursor-not-allowed'
                              }`}
                          >
                            {bookingLoading ? 'Đang xử lý...' : 'Đặt vé'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
          {showTrailer && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
              <div className="bg-black rounded-lg p-4 relative w-[90%] sm:w-[80%] md:w-[60%] aspect-video">
                <button
                  onClick={() => setShowTrailer(false)}
                  className="absolute top-2 right-2 text-white text-xl sm:text-2xl font-bold"
                >
                  ✕
                </button>
                <iframe src={trailerUrl} title="Trailer" className="w-full h-full rounded-md" allowFullScreen />
              </div>
            </div>
          )}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 z-50 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all border cursor-pointer"
          >
            ↑
          </button>
        </div>
      </main>
      <footer>
        <Bottom />
      </footer>
    </div>
  );
};

export default MovieDetails;