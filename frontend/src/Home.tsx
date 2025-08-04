import './App.css';
import Nav from './Header/nav';
import Bottom from './Footer/bottom';
import MovieSlider from './Components/MovieSlider';
import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import { useNavigate } from 'react-router-dom';

interface Movie {
  movieId: string;
  movieName: string;
  movieImage: string;
  trailerUrl: string;
  isRelease: boolean;
}

function Home() {
  const navigate = useNavigate();
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerUrl, setTrailerUrl] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch currently showing movies with isRelease: true
  useEffect(() => {
    const fetchAllMovies = async () => {
      let allMovies: Movie[] = [];
      let page = 1;
      let hasMore = true;

      try {
        while (hasMore) {
          const response = await fetch(`http://localhost:5229/api/movie/getAllMoviesPagniation/${page}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          const moviesData = data.movieRespondDTOs || data.data || data;
          if (!Array.isArray(moviesData) || moviesData.length === 0) {
            hasMore = false;
          } else {
            const formattedMovies = moviesData
              .filter((item: any) => item.isRelease === true)
              .map((item: any) => ({
                movieId: item.movieID || item.movieId || '',
                movieName: item.movieName || '',
                movieImage: item.movieImage || '',
                trailerUrl: item.movieTrailerUrl || item.trailerURL || '',
                isRelease: item.isRelease || false,
              }));
            allMovies = [...allMovies, ...formattedMovies];
            page++;
          }
        }
        setMovies(allMovies);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách phim:', error);
        setMovies([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllMovies();
  }, []);

  // Fetch upcoming movies
  useEffect(() => {
    setIsLoading(true);
    fetch('http://localhost:5229/api/movie/GetUnShowedMovie')
      .then((response) => response.json())
      .then((data) => {
        console.log('Dữ liệu API phim sắp chiếu:', JSON.stringify(data, null, 2));
        if (data.status === 'Success' && Array.isArray(data.data)) {
          const formattedMovies = data.data.map((item: any) => ({
            movieId: item.movieID || item.movieId || '',
            movieName: item.movieName || '',
            movieImage: item.movieImage || '',
            trailerUrl: item.movieTrailerUrl || item.trailerURL || '',
            isRelease: item.isRelease || false,
          }));
          setUpcomingMovies(formattedMovies);
        } else {
          console.error('Dữ liệu API không đúng định dạng:', data);
          setUpcomingMovies([]);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Lỗi khi lấy danh sách phim sắp chiếu:', error);
        setUpcomingMovies([]);
        setIsLoading(false);
      });
  }, []);

  const handleListfilm = () => {
    navigate('/listfilm');
  };

  const handleComingmovies = () => {
    navigate('/Comingmovies');
  };

  const handleMovies = (movieId: string) => {
    localStorage.setItem('movieId', movieId);
    navigate('/movies');
  };

  const handleMoviedetail = (movieId: string) => {
    navigate(`/moviedetail/${movieId}`);
  };

  const handleOpenTrailer = (url: string) => {
    let embedUrl = url;
    if (url.includes('watch?v=')) {
      embedUrl = url.replace('watch?v=', 'embed/');
    } else if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1].split('?')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }
    setTrailerUrl(embedUrl);
    setShowTrailer(true);
  };

  const renderMovieSlide = (movie: Movie, index: number) => (
    <SwiperSlide key={movie.movieId}>
      <div className="flex flex-col items-center">
        <img
          src={movie.movieImage}
          alt={movie.movieName}
          onClick={() => handleOpenTrailer(movie.trailerUrl)}
          className="w-80 h-[400px] object-cover rounded shadow-xl hover:scale-105 transition-transform duration-300 cursor-pointer"
        />
        <p className="text-white mt-4 font-semibold text-center max-w-[280px] truncate">{movie.movieName}</p>
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => handleOpenTrailer(movie.trailerUrl)}
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
          <button
            onClick={() => handleMovies(movie.movieId)}
            className="overflow-hidden relative w-50 p-2 h-12 bg-purple-600 text-white border-none rounded-md text-base font-bold cursor-pointer z-10 group"
          >
            🎟 Đặt vé ngay
            <span className="absolute w-60 h-40 -top-12 -left-10 bg-white rotate-12 transform scale-x-0 group-hover:scale-x-100 transition-transform group-hover:duration-500 duration-1000 origin-left"></span>
            <span className="absolute w-60 h-40 -top-12 -left-10 bg-orange-400 rotate-12 transform scale-x-0 group-hover:scale-x-100 transition-transform group-hover:duration-700 duration-700 origin-left"></span>
            <span className="absolute w-60 h-40 -top-12 -left-10 bg-orange-600 rotate-12 transform scale-x-0 group-hover:scale-x-100 transition-transform group-hover:duration-1000 duration-500 origin-left"></span>
            <span className="flex flex-row items-center justify-center group-hover:opacity-100 group-hover:duration-1000 duration-100 opacity-0 absolute z-10 inset-0">
              🎟 Đặt vé ngay
            </span>
          </button>
        </div>
      </div>
    </SwiperSlide>
  );

  const renderMovieSlide1 = (movie: Movie, index: number) => (
    <SwiperSlide key={movie.movieId}>
      <div className="flex flex-col items-center">
        <img
          src={movie.movieImage}
          alt={movie.movieName}
          onClick={() => handleOpenTrailer(movie.trailerUrl)}
          className="w-80 h-[400px] object-cover rounded shadow-xl hover:scale-105 transition-transform duration-300 cursor-pointer"
        />
        <p className="text-white mt-4 font-semibold text-center">{movie.movieName}</p>
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => handleOpenTrailer(movie.trailerUrl)}
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
          <button
            onClick={() => handleMoviedetail(movie.movieId)}
            className="overflow-hidden relative w-50 p-2 h-12 bg-purple-600 text-white border-none rounded-md text-base font-bold cursor-pointer z-10 group"
          >
            🎟 Tìm hiểu thêm
            <span className="absolute w-60 h-40 -top-12 -left-10 bg-white rotate-12 transform scale-x-0 group-hover:scale-x-100 transition-transform group-hover:duration-500 duration-1000 origin-left"></span>
            <span className="absolute w-60 h-40 -top-12 -left-10 bg-orange-400 rotate-12 transform scale-x-0 group-hover:scale-x-100 transition-transform group-hover:duration-700 duration-700 origin-left"></span>
            <span className="absolute w-60 h-40 -top-12 -left-10 bg-orange-600 rotate-12 transform scale-x-0 group-hover:scale-x-100 transition-transform group-hover:duration-1000 duration-500 origin-left"></span>
            <span className="flex flex-row items-center justify-center group-hover:opacity-100 group-hover:duration-1000 duration-100 opacity-0 absolute z-10 inset-0">
              🎟 Tìm hiểu thêm
            </span>
          </button>
        </div>
      </div>
    </SwiperSlide>
  );

  return (
    <div
      className="relative min-h-screen w-full bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('https://images8.alphacoders.com/136/thumb-1920-1368754.jpeg')" }}
    >
      <div className="relative z-10">
        <div className="sticky top-0 z-50 bg-slate-950 shadow-md">
          <header>
            <div className="content-wrapper max-w-screen-xl text-base mx-auto px-8">
              <Nav />
            </div>
          </header>
        </div>

        <div className="content-wrapper max-w-screen-xl text-base mx-auto px-8 min-h-screen top-0">
          <main className="flex flex-col gap-6 p-4">
            <MovieSlider />
            <section>
              <h2 className="text-3xl text-white font-bold pt-10 mb-5 uppercase text-center">-- Phim đang chiếu --</h2>
              <div className="px-4 sm:px-6 lg:px-8">
                {isLoading ? (
                  <p className="text-white text-center">Đang tải...</p>
                ) : (
                  <Swiper
                    breakpoints={{
                      320: { slidesPerView: 1, spaceBetween: 10 },
                      640: { slidesPerView: 2, spaceBetween: 20 },
                      1024: { slidesPerView: 3, spaceBetween: 30 },
                      1280: { slidesPerView: 4, spaceBetween: 30 },
                    }}
                    navigation
                    modules={[Navigation]}
                    className="mySwiper"
                  >
                    {movies?.length > 0 ? (
                      movies.map(renderMovieSlide)
                    ) : (
                      <p className="text-white text-center">Không có phim nào để hiển thị</p>
                    )}
                  </Swiper>
                )}
              </div>
            </section>
            <div className="pt-12">
              <button
                onClick={handleListfilm}
                type="submit"
                className="flex justify-center gap-2 items-center mx-auto shadow-xl text-base bg-purple-600 backdrop-blur-md lg:font-semibold isolation-auto border-gray-50 before:absolute before:w-full before:transition-all before:duration-700 before:hover:w-full before:-left-full before:hover:left-0 before:rounded-full before:bg-orange-500 hover:text-gray-50 before:-z-10 before:aspect-square before:hover:scale-150 before:hover:duration-700 relative z-10 px-4 py-2 overflow-hidden border-2 rounded-full group text-white"
              >
                Xem thêm
                <svg
                  className="w-6 h-6 justify-end group-hover:rotate-90 group-hover:bg-gray-50 text-gray-50 ease-linear duration-300 rounded-full border border-gray-700 group-hover:border-none p-2 rotate-45"
                  viewBox="0 0 16 19"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7 18C7 18.5523 7.44772 19 8 19C8.55228 19 9 18.5523 9 18H7ZM8.70711 0.292893C8.31658 -0.0976311 7.68342 -0.0976311 7.29289 0.292893L0.928932 6.65685C0.538408 7.04738 0.538408 7.68054 0.928932 8.07107C1.31946 8.46159 1.95262 8.46159 2.34315 8.07107L8 2.41421L13.6569 8.07107C14.0474 8.46159 14.6805 8.46159 15.0711 8.07107C15.4616 7.68054 15.4616 7.04738 15.0711 6.65685L8.70711 0.292893ZM9 18L9 1H7L7 18H9Z"
                    className="fill-gray-800 group-hover:fill-gray-800"
                  ></path>
                </svg>
              </button>
            </div>
            <section>
              <h2 className="text-3xl text-white font-bold pt-10 mb-5 uppercase text-center">-- Phim sắp chiếu --</h2>
              <div className="px-4 sm:px-6 lg:px-8">
                {isLoading ? (
                  <p className="text-white text-center">Đang tải...</p>
                ) : (
                  <Swiper
                    breakpoints={{
                      320: { slidesPerView: 1, spaceBetween: 10 },
                      640: { slidesPerView: 2, spaceBetween: 20 },
                      1024: { slidesPerView: 3, spaceBetween: 30 },
                      1280: { slidesPerView: 4, spaceBetween: 30 },
                    }}
                    navigation
                    modules={[Navigation]}
                    className="mySwiper"
                  >
                    {upcomingMovies?.length > 0 ? (
                      upcomingMovies.map(renderMovieSlide1)
                    ) : (
                      <p className="text-white text-center">Không có phim nào để hiển thị</p>
                    )}
                  </Swiper>
                )}
              </div>
            </section>
            <div className="pt-12">
              <button
                onClick={handleComingmovies}
                type="submit"
                className="flex justify-center gap-2 items-center mx-auto shadow-xl text-base bg-purple-600 backdrop-blur-md lg:font-semibold isolation-auto border-gray-50 before:absolute before:w-full before:transition-all before:duration-700 before:hover:w-full before:-left-full before:hover:left-0 before:rounded-full before:bg-orange-500 hover:text-gray-50 before:-z-10 before:aspect-square before:hover:scale-150 before:hover:duration-700 relative z-10 px-4 py-2 overflow-hidden border-2 rounded-full group"
              >
                Xem thêm
                <svg
                  className="w-6 h-6 justify-end group-hover:rotate-90 group-hover:bg-gray-50 text-gray-50 ease-linear duration-300 rounded-full border border-gray-700 group-hover:border-none p-2 rotate-45"
                  viewBox="0 0 16 19"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7 18C7 18.5523 7.44772 19 8 19C8.55228 19 9 18.5523 9 18H7ZM8.70711 0.292893C8.31658 -0.0976311 7.68342 -0.0976311 7.29289 0.292893L0.928932 6.65685C0.538408 7.04738 0.538408 7.68054 0.928932 8.07107C1.31946 8.46159 1.95262 8.46159 2.34315 8.07107L8 2.41421L13.6569 8.07107C14.0474 8.46159 14.6805 8.46159 15.0711 8.07107C15.4616 7.68054 15.4616 7.04738 15.0711 6.65685L8.70711 0.292893ZM9 18L9 1H7L7 18H9Z"
                    className="fill-gray-800 group-hover:fill-gray-800"
                  ></path>
                </svg>
              </button>
            </div>
            {showTrailer && (
              <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
                <div className="bg-black rounded-lg p-4 relative w-[90%] md:w-[60%] aspect-video">
                  <button
                    onClick={() => setShowTrailer(false)}
                    className="absolute top-2 right-2 text-white text-2xl font-bold"
                  >
                    ✕
                  </button>
                  <iframe src={trailerUrl} title="Trailer" className="w-full h-full rounded-md" allowFullScreen />
                </div>
              </div>
            )}
          </main>
        </div>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-50 px-4 py-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all border cursor-pointer"
        >
          ↑
        </button>
        <footer className="pt-32">
          <Bottom />
        </footer>
      </div>
    </div>
  );
}

export default Home;