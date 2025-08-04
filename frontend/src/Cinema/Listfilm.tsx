import React, { useState, useEffect } from "react";
import Nav from "../Header/nav";
import Bottom from "../Footer/bottom";
import { useNavigate } from "react-router-dom";

// Define the Movie interface for TypeScript
interface Movie {
    movieID: string;
    movieName: string;
    movieImage: string;
    movieTrailerUrl: string;
    isRelease: boolean; // Added isRelease to the interface
}

function Listfilm() {
    const [showTrailer, setShowTrailer] = useState(false);
    const [trailerUrl, setTrailerUrl] = useState("");
    const [movies, setMovies] = useState<Movie[]>([]);
    const navigate = useNavigate();

    // Fetch all movies from paginated API
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
                    const moviesData = data.movieRespondDTOs || data;

                    if (!Array.isArray(moviesData) || moviesData.length === 0) {
                        hasMore = false;
                    } else {
                        // Filter movies where isRelease is true
                        const releasedMovies = moviesData.filter((item: Movie) => item.isRelease === true);
                        allMovies = [...allMovies, ...releasedMovies];
                        page++;
                    }
                }
                setMovies(allMovies);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách phim:", error);
                setMovies([]);
            }
        };
        fetchAllMovies();
    }, []);

    const handleShowtimes = (id: string) => {
        let idphim = id;
        localStorage.setItem('movieId', id)
        navigate("/movies");
    };

    const handleOpenTrailer = (url: string) => {
        let embedUrl = url;

        if (url.includes("watch?v=")) {
            embedUrl = url.replace("watch?v=", "embed/");
        } else if (url.includes("youtu.be/")) {
            const videoId = url.split("youtu.be/")[1];
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
        }
        setTrailerUrl(embedUrl);
        setShowTrailer(true);
    };

    return (
        <div className="App bg-fixed w-full min-h-screen bg-cover bg-center"
            style={{ backgroundImage: "url('https://images8.alphacoders.com/136/thumb-1920-1368754.jpeg')" }}>
            <div className="sticky top-0 z-50 bg-slate-900 shadow-md">
                <header>
                    <div className="max-w-screen-xl mx-auto px-8">
                        <Nav />
                    </div>
                </header>
            </div>
            <div>
                <main className="max-w-screen-xl mx-auto px-8 py-12 top-0">
                    <h2 className="text-3xl text-white font-bold mb-8 uppercase">-- Phim đang chiếu --</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {movies.length > 0 ? (
                            movies.map((movie) => (
                                <div
                                    key={movie.movieID}
                                    className="bg-transparent rounded-xl shadow-lg p-4 flex flex-col items-center object-cover">
                                    <img
                                        src={movie.movieImage}
                                        alt={movie.movieName}
                                        className="w-full h-[420px] object-cover rounded-md cursor-pointer hover:scale-105 transition"
                                        onClick={() => handleOpenTrailer(movie.movieTrailerUrl)}
                                    />
                                    <h3 className="text-white font-semibold text-center mt-4 min-h-[48px] line-clamp-2">
                                        {movie.movieName}
                                    </h3>
                                    <div className="mt-3 flex flex-col sm:flex-row gap-3 items-center justify-center w-full">
                                        <button
                                            onClick={() => handleOpenTrailer(movie.movieTrailerUrl)}
                                            className="w-12 h-12 p-3 flex items-center justify-center rounded-full backdrop-blur-lg border border-red-500/20 bg-gradient-to-tr from-black/60 to-black/40 shadow-lg hover:shadow-2xl hover:shadow-red-500/30 hover:scale-110 hover:rotate-2 active:scale-95 active:rotate-0 transition-all duration-300 ease-out cursor-pointer group relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                                            <div className="relative z-10">
                                                <svg
                                                    className="w-7 h-7 fill-current text-red-500 group-hover:text-red-400 transition-colors duration-300"
                                                    viewBox="0 0 576 512"
                                                    xmlns="http://www.w3.org/2000/svg">
                                                    <path
                                                        d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"
                                                    ></path>
                                                </svg>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => handleShowtimes(movie.movieID)}
                                            className="relative w-[160px] h-12 px-4 bg-purple-600 text-white border-none rounded-md text-base font-bold cursor-pointer z-10 group overflow-hidden flex items-center justify-center">
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
                            ))
                        ) : (
                            <p className="text-white text-center col-span-4">Không có phim nào để hiển thị.</p>
                        )}
                    </div>
                </main>
                {/* Trailer Popup */}
                {showTrailer && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                        <div className="bg-black rounded-lg p-4 relative w-[90%] md:w-[60%] aspect-video">
                            <button
                                onClick={() => setShowTrailer(false)}
                                className="absolute top-2 right-2 text-white text-2xl font-bold">
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
            </div>
            <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="fixed bottom-6 right-6 z-50 px-4 py-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all border cursor-pointer"
            >
                ↑
            </button>
            <footer className="pt-32">
                <Bottom />
            </footer>
        </div>
    );
}

export default Listfilm;