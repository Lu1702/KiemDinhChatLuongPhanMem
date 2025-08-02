import React, { useState, useEffect } from "react";
import Nav from "../Header/nav";
import Footer from "../Footer/bottom";
import filmszone from "../image/filmszone.jpg";
import { useNavigate, useParams } from "react-router-dom";

// Define interfaces
interface Movie {
  movieId: string;
  movieName: string;
  movieImage: string;
  trailerUrl: string;
}

interface Cinema {
  cinemaId: string;
  cinemaName: string;
  cinemaLocation: string;
}

function Cinezone() {
  const navigate = useNavigate();
  const { cinemaId } = useParams<{ cinemaId: string }>();
  const [cinema, setCinema] = useState<Cinema | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [activeTab, setActiveTab] = useState<"tab1" | "tab2">("tab1");
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerUrl, setTrailerUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch cinema details
  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5229/api/Cinema/getCinemaById/${cinemaId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log('Dữ liệu rạp:', JSON.stringify(data, null, 2)); // Debug
        if (data.status === 'Success' && data.data) {
          setCinema(data.data);
        } else {
          setError('Không tìm thấy rạp.');
        }
      })
      .catch((err) => {
        console.error('Lỗi khi tải dữ liệu rạp:', err);
        setError('Lỗi khi tải dữ liệu rạp. Vui lòng thử lại.');
      })
      .finally(() => setLoading(false));
  }, [cinemaId]);

  // Fetch movies for the cinema
  useEffect(() => {
    if (!cinemaId) return;
    setLoading(true);
    fetch(`http://localhost:5229/api/Movie/GetMoviesByCinema/${cinemaId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log('Dữ liệu phim:', JSON.stringify(data, null, 2)); // Debug
        if (data.status === 'Success' && Array.isArray(data.data)) {
          const formattedMovies = data.data.map((item: any) => ({
            movieId: item.movieID || item.movieId || '',
            movieName: item.movieName || '',
            movieImage: item.movieImage || '',
            trailerUrl: item.movieTrailerUrl || item.trailerURL || '',
          }));
          setMovies(formattedMovies);
        } else {
          setMovies([]);
        }
      })
      .catch((err) => {
        console.error('Lỗi khi tải danh sách phim:', err);
        setMovies([]);
      })
      .finally(() => setLoading(false));
  }, [cinemaId]);

  // Mock data for upcoming movies (replace with API call later)
  const upcomingMovies: Movie[] = [
    {
      movieId: "1",
      movieName: "NĂM MƯƠI (T18)",
      movieImage: "https://th.bing.com/th/id/R.buoi-than-ban-thanh.jpg",
      trailerUrl: "https://youtu.be/miUjcCPpVGo",
    },
    {
      movieId: "2",
      movieName: "BUÔN THẦN BÁN THÁNH (T16)",
      movieImage: "https://bloganchoi.com/wp-content/uploads/2019/03/tam-cam-chuyen-chua-ke.jpg",
      trailerUrl: "https://www.youtube.com/watch?v=Ud-YVnRK_kY",
    },
    {
      movieId: "3",
      movieName: "TRƯỜNG NGUYỆT TẪN MINH",
      movieImage: "https://bazaarvietnam.vn/wp-content/uploads/2023/04/harper-bazaar-review-phim-truong-nguyet-tan-minh-till-the-end-of-the-moon-101-e1680702014162.jpg",
      trailerUrl: "https://youtu.be/7kRzVm_umc0?si=bjoPQPcEVgsWZ2AL",
    },
    // ... (giữ nguyên các phim khác, nhưng cập nhật tên thuộc tính)
  ];

  const handleShowTimes = () => {
    navigate("/showtimes");
  };

  const handleFutureFilm = () => {
    navigate("/futurefilm");
  };

  const handleOpenTrailer = (url: string) => {
    let embedUrl = url;
    if (url.includes("watch?v=")) {
      embedUrl = url.replace("watch?v=", "embed/");
    } else if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1].split("?")[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }
    setTrailerUrl(embedUrl);
    setShowTrailer(true);
  };

  if (loading) return <div className="text-white text-center p-4">Đang tải...</div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;
  if (!cinema) return <div className="text-white text-center p-4">Không tìm thấy rạp.</div>;

  return (
    <div
      className="flex flex-col min-h-screen bg-fixed w-full bg-cover bg-center"
      style={{ backgroundImage: "url('https://images8.alphacoders.com/136/thumb-1920-1368754.jpeg')" }}
    >
      <div className="top-0 z-50 bg-slate-950 shadow-md sticky">
        <div className="max-w-screen-xl text-base mx-auto px-4 sm:px-8">
          <Nav />
        </div>
      </div>
      <main className="flex-grow flex flex-col items-center">
        <div className="pt-3 w-full max-w-screen-xl mx-auto px-4 sm:px-8">
          <div
            className="h-48 w-full bg-cover bg-center rounded-xl pt-10"
            style={{ backgroundImage: `url(${filmszone})` }}
          >
            <div className="flex h-full text-white p-4">
              <div className="p-4">
                <h1 className="text-3xl font-bold">{cinema.cinemaName}</h1>
                <p>Địa điểm: {cinema.cinemaLocation}</p>
              </div>
            </div>
          </div>
          {/* Tab header */}
          <div className="flex border-b border-gray-300 justify-center items-center mb-4 space-x-10 sm:space-x-40 text-lg pt-5">
            <button
              onClick={() => setActiveTab("tab1")}
              className={`text-white font-medium text-base sm:text-xl px-4 py-2 ${
                activeTab === "tab1" ? "border-b-2 border-yellow-500 font-semibold px-6 sm:px-10 text-yellow-500" : ""
              }`}
            >
              Phim đang chiếu
            </button>
            <button
              onClick={() => setActiveTab("tab2")}
              className={`text-white font-medium text-base sm:text-xl px-4 py-2 ${
                activeTab === "tab2" ? "border-b-2 border-yellow-500 font-semibold px-6 sm:px-10 text-yellow-500" : ""
              }`}
            >
              Phim sắp chiếu
            </button>
          </div>
          {/* Tab content */}
          <div className="p-4 text-white max-w-screen-xl mx-auto px-4 sm:px-8 py-12">
            {activeTab === "tab1" && (
              <div>
                {loading ? (
                  <p className="text-center">Đang tải...</p>
                ) : error ? (
                  <p className="text-center text-red-500">{error}</p>
                ) : movies.length === 0 ? (
                  <p className="text-center">Không có phim nào</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
                    {movies.map((movie) => (
                      <div
                        key={movie.movieId}
                        className="bg-transparent rounded-xl shadow-lg p-4 flex flex-col min-h-[450px] sm:min-h-[550px]"
                      >
                        <img
                          src={movie.movieImage}
                          alt={movie.movieName}
                          className="w-full h-[320px] sm:h-[420px] object-cover rounded-md cursor-pointer hover:scale-105 transition"
                          onClick={() => handleOpenTrailer(movie.trailerUrl)}
                        />
                        <h3 className="font-semibold text-center mt-4 text-sm sm:text-base flex-grow">
                          {movie.movieName}
                        </h3>
                        <div className="mt-3 flex gap-3 justify-center">
                          <button
                            onClick={() => handleOpenTrailer(movie.trailerUrl)}
                            className="p-2 sm:p-3 rounded-full backdrop-blur-lg border border-red-500/20 bg-gradient-to-tr from-black/60 to-black/40 shadow-lg hover:shadow-2xl hover:shadow-red-500/30 hover:scale-110 hover:rotate-2 active:scale-95 active:rotate-0 transition-all duration-300 ease-out cursor-pointer group relative overflow-hidden"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                            <div className="relative z-10">
                              <svg
                                className="w-6 sm:w-7 h-6 sm:h-7 fill-current text-red-500 group-hover:text-red-400 transition-colors duration-300"
                                viewBox="0 0 576 512"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"></path>
                              </svg>
                            </div>
                          </button>
                          <button
                            onClick={handleShowTimes}
                            className="w-32 sm:w-40 h-10 sm:h-12 bg-purple-600 text-white border-none rounded-md text-xs sm:text-base font-bold cursor-pointer z-10 group relative overflow-hidden flex items-center justify-center"
                          >
                            <span className="absolute w-60 h-40 -top-12 -left-10 bg-white rotate-12 transform scale-x-0 group-hover:scale-x-100 transition-transform group-hover:duration-500 duration-1000 origin-left"></span>
                            <span className="absolute w-60 h-40 -top-12 -left-10 bg-orange-400 rotate-12 transform scale-x-0 group-hover:scale-x-100 transition-transform group-hover:duration-700 duration-700 origin-left"></span>
                            <span className="absolute w-60 h-40 -top-12 -left-10 bg-orange-600 rotate-12 transform scale-x-0 group-hover:scale-x-100 transition-transform group-hover:duration-1000 duration-500 origin-left"></span>
                            <span className="relative z-10 flex items-center gap-2">
                              🎟 Đặt vé ngay
                            </span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {activeTab === "tab2" && (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
                  {upcomingMovies.map((movie) => (
                    <div
                      key={movie.movieId}
                      className="bg-transparent rounded-xl shadow-lg p-4 flex flex-col min-h-[450px] sm:min-h-[550px]"
                    >
                      <img
                        src={movie.movieImage}
                        alt={movie.movieName}
                        className="w-full h-[320px] sm:h-[420px] object-cover rounded-md cursor-pointer hover:scale-105 transition"
                        onClick={() => handleOpenTrailer(movie.trailerUrl)}
                      />
                      <h3 className="font-semibold text-center mt-4 text-sm sm:text-base flex-grow">
                        {movie.movieName}
                      </h3>
                      <div className="mt-3 flex gap-3 justify-center">
                        <button
                          onClick={() => handleOpenTrailer(movie.trailerUrl)}
                          className="w-32 sm:w-40 h-10 sm:h-12 bg-red-600 text-white border-none rounded-md text-xs sm:text-base font-bold cursor-pointer z-10 group relative overflow-hidden flex items-center justify-center"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                          <div className="relative z-10 flex items-center gap-2">
                            <svg
                              className="w-5 sm:w-6 h-5 sm:h-6 fill-current text-white group-hover:text-red-200 transition-colors duration-300"
                              viewBox="0 0 576 512"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"></path>
                            </svg>
                            Xem trailer
                          </div>
                        </button>
                        <button
                          onClick={handleFutureFilm}
                          className="w-32 sm:w-40 h-10 sm:h-12 bg-purple-600 text-white border-none rounded-md text-xs sm:text-base font-bold cursor-pointer z-10 group relative overflow-hidden flex items-center justify-center"
                        >
                          <span className="absolute w-60 h-40 -top-12 -left-10 bg-white rotate-12 transform scale-x-0 group-hover:scale-x-100 transition-transform group-hover:duration-500 duration-1000 origin-left"></span>
                          <span className="absolute w-60 h-40 -top-12 -left-10 bg-orange-400 rotate-12 transform scale-x-0 group-hover:scale-x-100 transition-transform group-hover:duration-700 duration-700 origin-left"></span>
                          <span className="absolute w-60 h-40 -top-12 -left-10 bg-orange-600 rotate-12 transform scale-x-0 group-hover:scale-x-100 transition-transform group-hover:duration-1000 duration-500 origin-left"></span>
                          <span className="relative z-10 flex items-center gap-2">
                            🎟 Tìm hiểu thêm
                          </span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Trailer Popup */}
            {showTrailer && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                <div className="bg-black rounded-lg p-4 relative w-[90%] sm:w-[80%] md:w-[60%] aspect-video">
                  <button
                    onClick={() => setShowTrailer(false)}
                    className="absolute top-2 right-2 text-white text-xl sm:text-2xl font-bold"
                  >
                    ✕
                  </button>
                  <iframe
                    src={trailerUrl}
                    title="Trailer"
                    className="w-full h-full rounded-md"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="fixed bottom-6 right-6 z-50 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all border cursor-pointer"
            >
              ↑
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Cinezone;