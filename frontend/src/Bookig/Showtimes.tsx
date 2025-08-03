import React, { useState, useEffect } from "react";
import Nav from "../Header/nav";
import Bottom from "../Footer/bottom";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Clock from "../Components/Clock";
import Choose from "./Choose";

// Định nghĩa các interface cho TypeScript
interface Movie {
  movieId: string;
  movieName: string;
  movieImage: string;
  movieDescription: string;
  movieMinimumAge: string;
  movieDirector: string;
  movieActor: string;
  movieTrailerUrl: string;
  movieDuration: number;
  releaseDate: string;
  movieLanguage: string;
  movieVisualFormat: string[];
  movieGenre: string[];
  isRelease: boolean;
}

interface Listcinema {
  id: string;
  name: string;
  address: string;
  cinema: string;
}

interface ApiMovieMinimumAge {
  [key: string]: string;
}

interface ApiMovieLanguage {
  [key: string]: string;
}

interface ApiMovieVisualFormat {
  movieVisualFormatId: string;
  movieVisualFormatName: string;
}

interface ApiMovieGenre {
  movieGenreId: string;
  movieGenreName: string;
}

interface ApiResponse {
  status: string;
  message: string;
  data: {
    movieId: string;
    movieName: string;
    movieImage: string;
    movieDescription: string;
    movieMinimumAge: ApiMovieMinimumAge;
    movieDirector: string;
    movieActor: string;
    movieTrailerUrl: string;
    movieDuration: number;
    releaseDate: string;
    movieLanguage: ApiMovieLanguage;
    movieVisualFormat: ApiMovieVisualFormat[];
    movieGenre: ApiMovieGenre[];
    isRelease: boolean;
  };
}

interface ApiMovieListResponse {
  status?: string;
  message?: string;
  data?: {
    movieRespondDTOs?: {
      movieId: string;
      movieName: string;
      movieImage: string;
      movieTrailerUrl: string;
      isRelease: boolean;
    }[];
  };
  movieRespondDTOs?: {
    movieId: string;
    movieName: string;
    movieImage: string;
    movieTrailerUrl: string;
    isRelease: boolean;
  }[];
}

function Showtimes() {
  const { movieId } = useParams<{ movieId?: string }>();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [movieInfo, setMovieInfo] = useState<Movie | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerUrl, setTrailerUrl] = useState("");
  const [startCountdown, setStartCountdown] = useState(false);
  const [seatLimitMsg, setSeatLimitMsg] = useState<string>("");
  const [selectedShowtime, setSelectedShowtime] = useState<string>("");
  const [foodCounts, setFoodCounts] = useState<{ [key: string]: number }>({});
  const [drinkCounts, setDrinkCounts] = useState<{ [key: string]: number }>({});
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [commentCount, setCommentCount] = useState<number>(0);
  const [selectedCinemaTime, setSelectedCinemaTime] = useState<string>("");
  const [ticketCounts, setTicketCounts] = useState<{ [key: string]: number }>({});
  const [comboCounts, setComboCounts] = useState<{ [key: string]: number }>({});
  const [selectedCinema, setSelectedCinema] = useState<Listcinema | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isMovieSelectorOpen, setIsMovieSelectorOpen] = useState(false);

  // Lấy tất cả phim đã phát hành
  useEffect(() => {
    const fetchAllMovies = async () => {
      let allMovies: Movie[] = [];
      let page = 1;
      let hasMore = true;

      try {
        while (hasMore) {
          const response = await fetch(`http://localhost:5229/api/movie/getAllMoviesPagniation/${page}`);
          if (!response.ok) {
            throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
          }
          const data: ApiMovieListResponse = await response.json();
          const moviesData = data.movieRespondDTOs || (data.data && data.data.movieRespondDTOs) || [];
          if (!Array.isArray(moviesData) || moviesData.length === 0) {
            hasMore = false;
          } else {
            const formattedMovies = moviesData
              .filter((item) => item.isRelease === true)
              .map((item) => ({
                movieId: item.movieId || "",
                movieName: item.movieName || "",
                movieImage: item.movieImage || "",
                movieTrailerUrl: item.movieTrailerUrl || "",
                isRelease: item.isRelease || false,
                movieDescription: "",
                movieMinimumAge: "",
                movieDirector: "",
                movieActor: "",
                movieDuration: 0,
                releaseDate: "",
                movieLanguage: "",
                movieVisualFormat: [],
                movieGenre: [],
              }));
            allMovies = [...allMovies, ...formattedMovies];
            page++;
          }
        }
        setMovies(allMovies);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách phim:", error);
        setMovies([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllMovies();
  }, []);

  // Lấy chi tiết phim dựa trên movieId được chọn
  useEffect(() => {
    setIsLoading(true);
    if (movieId) {
      fetch(`http://localhost:5229/api/movie/getMovieDetail/${movieId}`)
        .then((res) => {
          if (!res.ok) throw new Error(`Lỗi HTTP: ${res.status}`);
          return res.json();
        })
        .then((result: ApiResponse) => {
          if (result.status === "Success" && result.data) {
            const data = result.data;
            if (data.isRelease === false) {
              setMovieInfo(null);
              return;
            }
            setMovieInfo({
              movieId: data.movieId,
              movieName: data.movieName || "",
              movieImage: data.movieImage || "",
              movieDescription: data.movieDescription || "Không có mô tả",
              movieMinimumAge: Object.values(data.movieMinimumAge)[0] || "Không xác định",
              movieDirector: data.movieDirector || "Không có thông tin",
              movieActor: data.movieActor || "Không có thông tin",
              movieTrailerUrl: data.movieTrailerUrl || "",
              movieDuration: data.movieDuration || 0,
              releaseDate: new Date(data.releaseDate).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              }),
              movieLanguage: Object.values(data.movieLanguage)[0] || "Không xác định",
              movieVisualFormat: data.movieVisualFormat.map((v) => v.movieVisualFormatName) || [],
              movieGenre: data.movieGenre.map((g) => g.movieGenreName) || [],
              isRelease: data.isRelease ?? true,
            });
          } else {
            setMovieInfo(null);
          }
        })
        .catch((err) => {
          console.error("Lỗi khi lấy chi tiết phim:", err);
          setMovieInfo(null);
        })
        .finally(() => setIsLoading(false));
    }
  }, [movieId]);

  useEffect(() => {
    if (selectedSeats.length > 0 && !startCountdown) {
      setStartCountdown(true);
    }
  }, [selectedSeats, startCountdown]);

  const handleComment = () => {
    navigate("/comment");
  };

  const handlePayment = () => {
    if (!movieInfo) return;
    const ticketInfo = {
      movie: movieInfo.movieName,
      cinema: selectedCinema?.name,
      address: selectedCinema?.address,
      time: selectedCinemaTime,
      seats: selectedSeats,
      ticketType: ticketTypes.filter((t) => ticketCounts[t.key] > 0).map((t) => t.label).join(", "),
      combos: combos.filter((c) => comboCounts[c.key] > 0).map((c) => `${c.label} x${comboCounts[c.key]}`).join(", "),
      total: total,
      drink: Object.values(drinkCounts).reduce((a, b) => a + b, 0),
      food: Object.values(foodCounts).reduce((a, b) => a + b, 0),
      drinkCount,
      snackCount,
    };
    navigate("/payment", { state: ticketInfo });
  };

  const handleTimeout = () => {
    setTicketCounts({});
    setComboCounts({});
    setSelectedSeats([]);
    setStartCountdown(false);
    alert("⏰ Hết giờ! Bạn sẽ được chuyển hướng về trang chủ.");
    navigate("/");
  };

  const handleOpenTrailer = (url: string) => {
    let embedUrl = "";
    if (url.includes("watch?v=")) {
      const videoId = url.split("watch?v=")[1].split("&")[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1].split("?")[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else {
      embedUrl = url;
    }
    setTrailerUrl(embedUrl);
    setShowTrailer(true);
  };

  const handleSelect = (cinema: Listcinema) => {
    setSelectedCinema(cinema);
    setIsOpen(false);
  };

  const handleMovieSelect = (movie: Movie) => {
    navigate(`/showtimes/${movie.movieId}`, { state: { movie } });
    setIsMovieSelectorOpen(false);
  };

  const toggleSeat = (seatId: string) => {
    const totalTickets = Object.values(ticketCounts).reduce((a, b) => a + b, 0);
    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) {
        setSeatLimitMsg("");
        return prev.filter((seat) => seat !== seatId);
      } else {
        if (prev.length < totalTickets) {
          setSeatLimitMsg("");
          return [...prev, seatId];
        }
        setSeatLimitMsg("Bạn chỉ có thể chọn ghế bằng với số vé đã mua!");
        return prev;
      }
    });
  };

  const ticketTypes = [
    { key: "adult", label: "Người lớn", price: 75000 },
    { key: "student", label: "Học sinh/Sinh viên", price: 45000 },
  ];

  const combos = [
    {
      key: "combo2",
      img: "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/PICCONNEW/CNS035_COMBO_GAU.png?rand=1723084117",
      label: "Combo 2 Ô",
      price: 109000,
    },
    {
      key: "comboNhaGau",
      img: "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/PICCONNEW/CNS037_COMBO_NHA_GAU.png?rand=1723084117",
      label: "Combo Nhà Gấu",
      price: 129000,
    },
    {
      key: "comboCoGau",
      img: "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/PICCONNEW/CNS034_COMBO_PARTY.png?rand=1723084117",
      label: "Combo Cỏ Gấu",
      price: 129000,
    },
  ];

  const drink = [
    {
      key: "Coke",
      img: "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/HinhQuayconnew/coca.png?rand=1719572301",
      label: "Coca 32oz",
      price: 109000,
    },
    {
      key: "Fanta",
      img: "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/HinhQuayconnew/fanta.jpg?rand=1719572506",
      label: "Fanta 32oz",
      price: 129000,
    },
    {
      key: "CokeZero",
      img: "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/PICCONNEW/CNS034_COMBO_PARTY.png?rand=1723084117",
      label: "Coca Zero 32oz",
      price: 129000,
    },
    {
      key: "Sprite",
      img: "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/PICCONNEW/CNS034_COMBO_PARTY.png?rand=1723084117",
      label: "Sprite 32oz",
      price: 129000,
    },
  ];

  const food = [
    {
      key: "Popcorn",
      img: "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/HinhQuayconnew/baprang.jpg?rand=1719572360",
      label: "Bắp rang",
      price: 50000,
    },
  ];

  const showtimes = [
    { id: "1", label: "Thứ Tư", date: "15/7" },
    { id: "2", label: "Thứ Năm", date: "16/7" },
    { id: "3", label: "Thứ Sáu", date: "17/7" },
  ];

  const listcinema = [
    { id: "rap1", name: "Cinema Hòa Hưng", address: "P. Hòa Hưng (TP HCM)", cinema: "Rạp 03" },
    { id: "rap2", name: "Cinema Vũng Tàu", address: "P. Khánh Hội (TP HCM)", cinema: "Rạp 08" },
    { id: "rap3", name: "Cinema Bờ Tây", address: "P. Sài Gòn (TP HCM)", cinema: "Rạp 01" },
  ];

  const totalTicket = Object.entries(ticketCounts).reduce(
    (sum, [key, count]) => sum + (ticketTypes.find((t) => t.key === key)?.price || 0) * count,
    0
  );

  const totalCombo = Object.entries(comboCounts).reduce(
    (sum, [key, count]) => sum + (combos.find((c) => c.key === key)?.price || 0) * count,
    0
  );

  const totalDrink = Object.entries(drinkCounts).reduce(
    (sum, [key, count]) => sum + (drink.find((c) => c.key === key)?.price || 0) * count,
    0
  );

  const totalFood = Object.entries(foodCounts).reduce(
    (sum, [key, count]) => sum + (food.find((c) => c.key === key)?.price || 0) * count,
    0
  );

  const total = totalTicket + totalCombo + totalDrink + totalFood;

  const drinkCount = drink.reduce((sum, item) => sum + (drinkCounts[item.key] || 0), 0);
  const snackCount = food.reduce((sum, item) => sum + (foodCounts[item.key] || 0), 0);

  return (
    <div
      className="flex flex-col min-h-screen bg-fixed w-full bg-cover bg-center top-0"
      style={{ backgroundImage: "url('https://images8.alphacoders.com/136/thumb-1920-1368754.jpeg')" }}
    >
      <div className="sticky top-0 z-50 bg-slate-900 shadow-md mb-4">
        <div className="max-w-screen-xl mx-auto px-8">
          <Nav />
        </div>
      </div>
      <main className="flex-grow flex flex-col items-center">
        {/* Chọn phim */}
        <div className="mb-6 flex flex-col items-center">
          <h2 className="text-3xl font-bold text-yellow-400 mb-4 uppercase">Chọn Phim</h2>
          <div className="relative w-[500px] max-w-xl mx-auto">
            <button
              onClick={() => setIsMovieSelectorOpen(!isMovieSelectorOpen)}
              className="w-full bg-transparent text-left border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300"
            >
              {movieInfo ? (
                <div>
                  <p className="font-semibold text-white text-xl">{movieInfo.movieName}</p>
                </div>
              ) : (
                <span className="text-zinc-50 flex justify-center items-center">-- Chọn phim --</span>
              )}
            </button>
            {isMovieSelectorOpen && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
                {isLoading ? (
                  <p className="px-4 py-2 text-black">Đang tải danh sách phim...</p>
                ) : movies.length > 0 ? (
                  movies.map((movie) => (
                    <div
                      key={movie.movieId}
                      onClick={() => handleMovieSelect(movie)}
                      className="px-4 py-2 hover:bg-yellow-100 cursor-pointer"
                    >
                      <p className="font-semibold text-black">{movie.movieName}</p>
                    </div>
                  ))
                ) : (
                  <p className="px-4 py-2 text-black">Không có phim để hiển thị.</p>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Chi tiết phim */}
        {movieInfo ? (
          <div className="flex flex-col md:flex-row gap-6 mb-6 justify-center items-center">
            <div>
              <div>
                <img src={movieInfo.movieImage} alt={movieInfo.movieName} className="w-full max-w-[400px] rounded-lg shadow-lg" />
              </div>
              <div>
                <p
                  onClick={handleComment}
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
            <div>
              <h1 className="text-3xl font-bold text-yellow-400 mb-2 uppercase">{movieInfo.movieName}</h1>
              <ul className="text-white mb-4">
                <li>
                  <span className="text-yellow-400 font-bold">Thể loại:</span> <span className="pl-6">{movieInfo.movieGenre.join(", ")}</span>
                </li>
                <li>
                  <span className="text-yellow-400 font-bold">Thời lượng:</span> <span className="pl-6">{movieInfo.movieDuration}'</span>
                </li>
                <li>
                  <span className="text-yellow-400 font-bold">Ngôn ngữ:</span> <span className="pl-6">{movieInfo.movieLanguage}</span>
                </li>
                <li>
                  <span className="text-yellow-400 font-bold">Đạo diễn:</span> <span className="pl-6">{movieInfo.movieDirector}</span>
                </li>
                <li>
                  <span className="text-yellow-400 font-bold">Diễn viên:</span> <span className="pl-6">{movieInfo.movieActor}</span>
                </li>
                <li>
                  <span className="text-yellow-400 font-bold">Ngày phát hành:</span> <span className="pl-6">{movieInfo.releaseDate}</span>
                </li>
              </ul>
              <p className="max-w-[600px] mb-4 text-white">{movieInfo.movieDescription}</p>
              <div className="px-6 pt-6">
                <button
                  onClick={() => handleOpenTrailer(movieInfo.movieTrailerUrl)}
                  className="p-3 rounded-full backdrop-blur-lg border border-red-500/20 bg-gradient-to-tr from-black/60 to-black/40 shadow-lg hover:shadow-2xl hover:shadow-red-500/30 hover:scale-110 hover:rotate-2 active:scale-95 active:rotate-0 transition-all duration-300 ease-out cursor-pointer group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                  <div className="relative z-10">
                    <svg
                      className="w-7 h-7 fill-current text-red-500 group-hover:text-red-400 transition-colors duration-300"
                      viewBox="0 0 576 512"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"></path>
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-white text-center">Đang tải thông tin phim...</p>
        )}
        <div className="mb-6 flex flex-col items-center">
          <h2 className="text-3xl font-bold text-yellow-400 mb-4 uppercase">Chọn Suất Chiếu</h2>
          <div className="flex justify-center items-center flex-col md:flex-row gap-4">
            {showtimes.map((st) => (
              <label
                key={st.id}
                className={`flex flex-col items-center gap-2 cursor-pointer px-4 py-2 text-base rounded border transition-all w-40
                  ${selectedShowtime === st.id ? "bg-yellow-400 text-purple-600 font-bold uppercase ring-2 ring-yellow-300 border-yellow-300" : "bg-transparent text-white hover:bg-yellow-400 border-zinc-100"}`}
              >
                <input
                  type="radio"
                  name="showtime"
                  value={st.id}
                  checked={selectedShowtime === st.id}
                  onChange={() => setSelectedShowtime(st.id)}
                  className="hidden"
                />
                <span>{st.label}</span>
                <span>{st.date}</span>
              </label>
            ))}
          </div>
        </div>
        {selectedShowtime && (
          <>
            <div className="mb-6 flex flex-col items-center">
              <div className="relative w-[500px] max-w-xl mx-auto">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="w-full bg-transparent text-left border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                >
                  {selectedCinema ? (
                    <div>
                      <p className="font-semibold text-white text-xl">{selectedCinema.name}</p>
                      <p className="text-sm text-gray-500">{selectedCinema.address}</p>
                    </div>
                  ) : (
                    <span className="text-zinc-50 flex justify-center items-center">-- Chọn rạp --</span>
                  )}
                </button>
                {isOpen && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
                    {listcinema.map((cinema) => (
                      <div key={cinema.id} onClick={() => handleSelect(cinema)} className="px-4 py-2 hover:bg-yellow-100 cursor-pointer">
                        <p className="font-semibold text-black">{cinema.name}</p>
                        <p className="text-sm text-gray-500">{cinema.address}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="mb-6 flex flex-col items-center">
              {selectedCinema && (
                <div className="text-center text-yellow-400 mb-4">
                  <Choose />
                </div>
              )}
            </div>
            <div className="mb-6 flex flex-col items-center">
              <h2 className="text-3xl font-bold text-yellow-400 mb-4 uppercase">Chọn Loại Vé</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                {ticketTypes.map((t) => (
                  <div key={t.key} className="bg-transparent p-4 rounded border border-zinc-100 max-w-xs w-full mx-auto">
                    <p className="text-white uppercase font-bold hover:text-yellow-300 transition-colors">{t.label}</p>
                    <p className="text-yellow-400">{t.price.toLocaleString()} VND</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => setTicketCounts((prev) => ({ ...prev, [t.key]: Math.max((prev[t.key] || 0) - 1, 0) }))}
                        className="bg-slate-300 rounded px-2 hover:bg-yellow-300 flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="text-white">{ticketCounts[t.key] || 0}</span>
                      <button
                        onClick={() => {
                          const totalTickets = Object.values(ticketCounts).reduce((a, b) => a + b, 0);
                          if (totalTickets < 8) {
                            setTicketCounts((prev) => ({ ...prev, [t.key]: (prev[t.key] || 0) + 1 }));
                          } else {
                            setSeatLimitMsg("Bạn chỉ có thể mua tối đa 8 vé!");
                          }
                        }}
                        className="bg-slate-300 rounded px-2 hover:bg-yellow-300 flex items-center justify-center"
                        disabled={Object.values(ticketCounts).reduce((a, b) => a + b, 0) >= 8}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mb-6 flex flex-col items-center">
              <h2 className="text-3xl font-bold text-yellow-400 mb-4 uppercase">Chọn Ghế {selectedCinema ? `- ${selectedCinema.cinema}` : ""}</h2>
              <p className="text-yellow-400 mb-4">Ghế đã chọn: {selectedSeats.join(", ")}</p>
              <div className="relative w-full flex justify-center items-center mb-10 pb-5">
                <svg viewBox="0 0 600 120" className="w-full max-w-5xl h-24">
                  <path d="M 30 100 Q 300 10 570 100" stroke="#ffffff" strokeWidth="5" fill="transparent" />
                  <text x="300" y="120" textAnchor="middle" fill="#ffffff" fontSize="36" fontWeight="bold">
                    Màn hình
                  </text>
                </svg>
              </div>
              <div className="flex flex-col gap-2">
                {Array.from({ length: 14 }).map((_, rowIndex) => {
                  const rowLabel = String.fromCharCode(65 + rowIndex);
                  return (
                    <div key={rowLabel} className="flex items-center gap-2">
                      <div className="w-6 text-right font-bold text-white">{rowLabel}</div>
                      {Array.from({ length: 12 }).map((_, colIndex) => {
                        const seatId = `${rowLabel}${(colIndex + 1).toString().padStart(2, "0")}`;
                        const isSelected = selectedSeats.includes(seatId);
                        const disabled = Object.values(ticketCounts).reduce((a, b) => a + b, 0) === 0;
                        return (
                          <button
                            key={seatId}
                            onClick={() => !disabled && toggleSeat(seatId)}
                            className={`w-10 h-10 text-sm rounded transition-all ${isSelected ? "bg-yellow-400 text-black" : "bg-white text-purple-600 hover:bg-yellow-300"} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                            disabled={disabled}
                          >
                            {seatId}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
              {seatLimitMsg && (
                <div className="flex justify-center items-center text-red-500 mt-4 font-semibold rounded bg-slate-50 px-4 py-2">
                  {seatLimitMsg}
                </div>
              )}
            </div>
            <div className="mb-6 flex flex-col items-center">
              <h2 className="text-3xl font-bold text-yellow-400 mb-4 uppercase">Chọn Đồ Ăn và Đồ Uống</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {combos.map((c) => (
                  <div key={c.key} className="bg-transparent p-4 rounded border border-zinc-100 w-96 flex flex-row justify-center items-center gap-16">
                    <div>
                      <img src={c.img} alt={c.label} className="w-full h-32 object-cover mb-2 rounded" />
                    </div>
                    <div>
                      <p className="text-white uppercase font-bold hover:text-yellow-300 transition-colors">{c.label}</p>
                      <p className="text-yellow-400">{c.price.toLocaleString()} VND</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => setComboCounts((prev) => ({ ...prev, [c.key]: Math.max((prev[c.key] || 0) - 1, 0) }))}
                          className="bg-slate-300 px-2 hover:bg-yellow-300"
                        >
                          -
                        </button>
                        <span className="text-white">{comboCounts[c.key] || 0}</span>
                        <button
                          onClick={() => setComboCounts((prev) => ({ ...prev, [c.key]: (prev[c.key] || 0) + 1 }))}
                          className="bg-slate-300 px-2 hover:bg-yellow-300"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-6 flex flex-col items-center">
                <p className="text-xl font-bold text-yellow-400 mb-4 uppercase">Đồ uống</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {drink.map((c) => (
                    <div key={c.key} className="bg-transparent p-4 rounded border border-zinc-100 w-96 flex flex-row justify-center items-center gap-16">
                      <div>
                        <img src={c.img} alt={c.label} className="w-full h-32 object-cover mb-2 rounded" />
                      </div>
                      <div>
                        <p className="text-white uppercase font-bold hover:text-yellow-300 transition-colors">{c.label}</p>
                        <p className="text-yellow-400">{c.price.toLocaleString()} VND</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => setDrinkCounts((prev) => ({ ...prev, [c.key]: Math.max((prev[c.key] || 0) - 1, 0) }))}
                            className="bg-slate-300 px-2 hover:bg-yellow-300"
                          >
                            -
                          </button>
                          <span className="text-white">{drinkCounts[c.key] || 0}</span>
                          <button
                            onClick={() => setDrinkCounts((prev) => ({ ...prev, [c.key]: (prev[c.key] || 0) + 1 }))}
                            className="bg-slate-300 px-2 hover:bg-yellow-300"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mb-6 flex flex-col items-center">
                <p className="text-xl font-bold text-yellow-400 mb-4 uppercase">Đồ ăn</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {food.map((c) => (
                    <div key={c.key} className="bg-transparent p-4 rounded border border-zinc-100 w-96 flex flex-row justify-center items-center gap-16">
                      <div>
                        <img src={c.img} alt={c.label} className="w-full h-32 object-cover mb-2 rounded" />
                      </div>
                      <div>
                        <p className="text-white uppercase font-bold hover:text-yellow-300 transition-colors">{c.label}</p>
                        <p className="text-yellow-400">{c.price.toLocaleString()} VND</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => setFoodCounts((prev) => ({ ...prev, [c.key]: Math.max((prev[c.key] || 0) - 1, 0) }))}
                            className="bg-slate-300 px-2 hover:bg-yellow-300"
                          >
                            -
                          </button>
                          <span className="text-white">{foodCounts[c.key] || 0}</span>
                          <button
                            onClick={() => setFoodCounts((prev) => ({ ...prev, [c.key]: (prev[c.key] || 0) + 1 }))}
                            className="bg-slate-300 px-2 hover:bg-yellow-300"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 w-full bg-gray-900 p-4 flex justify-between items-center text-white border-t border-gray-700 z-40">
              <div>
                <h2 className="text-xl font-bold uppercase">Thông tin vé</h2>
                <p className="text-yellow-400">Rạp: {selectedCinema?.name || "Chưa chọn"}</p>
                <ul className="text-yellow-400 flex flex-row">
                  <li className="flex flex-row">
                    {ticketTypes.map((type) => {
                      const count = ticketCounts[type.key] || 0;
                      return count > 0 ? (
                        <li className="pr-2" key={type.key}>
                          {type.label}: {count} vé ,
                        </li>
                      ) : null;
                    })}
                  </li>
                  <li>
                    <p className="text-yellow-400">
                      {selectedCinema?.cinema} | Ghế đã chọn: {selectedSeats.join(", ")}
                    </p>
                  </li>
                </ul>
                <p className="text-yellow-400">
                  Số lượng combo: {Object.values(comboCounts).reduce((a, b) => a + b, 0)} | Số lượng đồ ăn: {Object.values(foodCounts).reduce((a, b) => a + b, 0)} | Số lượng đồ uống:{" "}
                  {Object.values(drinkCounts).reduce((a, b) => a + b, 0)}
                </p>
              </div>
              <div>
                <ul className="flex flex-row gap-2 items-center">
                  <li>{startCountdown && <Clock seconds={300} onTimeout={handleTimeout} />}</li>
                  <li>
                    <p>
                      Tạm tính: <span className="text-yellow-400">{total.toLocaleString()} VND</span>
                    </p>
                    <button
                      onClick={handlePayment}
                      className="relative inline-flex items-center justify-center px-8 py-2.5 overflow-hidden tracking-tighter text-white bg-gray-800 rounded-md group"
                    >
                      <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-yellow-600 rounded-full group-hover:w-56 group-hover:h-56"></span>
                      <span className="absolute bottom-0 left-0 h-full -ml-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-auto h-full opacity-100 object-stretch"
                          viewBox="0 0 487 487"
                        >
                          <path
                            fill-opacity=".1"
                            fill-rule="nonzero"
                            fill="#FFF"
                            d="M0 .3c67 2.1 134.1 4.3 186.3 37 52.2 32.7 89.6 95.8 112.8 150.6 23.2 54.8 32.3 101.4 61.2 149.9 28.9 48.4 77.7 98.8 126.4 149.2H0V.3z"
                          ></path>
                        </svg>
                      </span>
                      <span className="absolute top-0 right-0 w-12 h-full -mr-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="object-cover w-full h-full"
                          viewBox="0 0 487 487"
                        >
                          <path
                            fill-opacity=".1"
                            fill-rule="nonzero"
                            fill="#FFF"
                            d="M487 486.7c-66.1-3.6-132.3-7.3-186.3-37s-95.9-85.3-126.2-137.2c-30.4-51.8-49.3-99.9-76.5-151.4C70.9 109.6 35.6 54.8.3 0H487v486.7z"
                          ></path>
                        </svg>
                      </span>
                      <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-gray-200"></span>
                      <span className="relative text-base font-semibold">Thanh toán</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </>
        )}
        {showTrailer && (
          <div
            className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50"
            onClick={() => setShowTrailer(false)}
          >
            <div className="relative w-full max-w-3xl aspect-video">
              <iframe width="100%" height="100%" src={trailerUrl} title="Trailer" frameBorder="0" allowFullScreen />
              <button onClick={() => setShowTrailer(false)} className="absolute top-2 right-2 text-white text-2xl">
                ✕
              </button>
            </div>
          </div>
        )}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-40 right-6 z-50 px-4 py-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all border cursor-pointer"
        >
          ↑
        </button>
      </main>
      <Bottom />
    </div>
  );
}

export default Showtimes;