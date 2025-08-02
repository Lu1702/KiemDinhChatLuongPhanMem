import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Nav from "../Header/nav";
import Footer from "../Footer/bottom";
import filmszone from "../image/filmszone.jpg";

interface Movie {
    movieID: string;
    title: string;
    image: string;
    trailer: string;
}

interface Cinema {
    cinemaId: string;
    cinemaName: string;
    cinemaLocation: string;
}

interface ApiResponse {
    movieRespondDTOs: {
        movieID: string;
        movieName: string;
        movieImage: string;
        movieTrailerUrl: string;
    }[];
    pageSize: number;
    page: number;
    totalCount: number;
}

const upcomingMovies: Movie[] = [
    { movieID: "1", title: "NĂM MƯƠI (T18)", image: "https://th.bing.com/th/id/R.4b3f8ee56b9334f4958f75a5f45362a9?rik=JkvbTUiZTAlZYQ&pid=ImgRaw&r=0", trailer: "https://youtu.be/miUjcCPpVGo" },
    { movieID: "2", title: "BUÔN THẦN BÁN THÁNH (T16)", image: "https://bloganchoi.com/wp-content/uploads/2019/03/tam-cam-chuyen-chua-ke.jpg", trailer: "https://www.youtube.com/watch?v=Ud-YVnRK_kY" },
    { movieID: "3", title: "TRƯỜNG NGUYỆT TẪN MINH", image: "https://bazaarvietnam.vn/wp-content/uploads/2023/04/harper-bazaar-review-phim-truong-nguyet-tan-minh-till-the-end-of-the-moon-101-e1680702014162.jpg", trailer: "https://youtu.be/7kRzVm_umc0?si=bjoPQPcEVgsWZ2AL" },
    { movieID: "4", title: "Tấm Cám chuyện Quỳnh Lập kể", image: "https://cdn.eva.vn/upload/2-2017/images/2017-05-10/tam-cam-chuyen-huynh-lap-ke-hay-chuyen-ai-cho-tao-luong-thien-cua-me-ghe-ac-nhat-hanh-tinh-tamcam-huynh-lap-1494403229-width500height683.jpg", trailer: "https://youtu.be/I5SL4kNC7rk?si=HSB1PYMD2C6x6N0p" },
    { movieID: "5", title: "BÍ KÍP LUYỆN RỒNG (K)", image: "https://cinestar.com.vn/_next/image/?url=https%3A%2F%2Fapi-website.cinestar.com.vn%2Fmedia%2Fwysiwyg%2FPosters%2F06-2025%2Fbi-kip-luyen-rong_1.jpg&w=1200&q=75", trailer: "https://youtu.be/JD-idNoeiPE" },
    { movieID: "10", title: "LÂM GIANG TIÊN (T18)", image: "https://static2.vieon.vn/vieplay-image/poster_v4/2025/06/02/djtoaqo5_660x946-lamgiangtien2.png", trailer: "https://youtu.be/-hTr-NBoDnU?si=idCRW93f3kx6j7ZV" },
];

function Cinezone() {
    const { cinemaId } = useParams<{ cinemaId: string }>();
    const navigate = useNavigate();
    const [cinemas, setCinemas] = useState<Cinema[]>([]);
    const [selectedCinemaId, setSelectedCinemaId] = useState<string | null>(null);
    const [movies, setMovies] = useState<Movie[]>([]);
    const [activeTab, setActiveTab] = useState<"tab1" | "tab2">("tab1");
    const [showTrailer, setShowTrailer] = useState(false);
    const [trailerUrl, setTrailerUrl] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch cinemas
    useEffect(() => {
        setLoading(true);
        fetch("http://localhost:5229/api/Cinema/getCinemaList")
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
                return res.json();
            })
            .then((data) => {
                if (data.status === "Success" && Array.isArray(data.data)) {
                    const formattedCinemas = data.data.map((item: any) => ({
                        cinemaId: item.cinemaId || item.cinemaID || "",
                        cinemaName: item.cinemaName || "",
                        cinemaLocation: item.cinemaLocation || "",
                    }));
                    setCinemas(formattedCinemas);
                    const validCinema = formattedCinemas.find((c: Cinema) => c.cinemaId === cinemaId);
                    setSelectedCinemaId(validCinema ? cinemaId : formattedCinemas[0]?.cinemaId || null);
                    if (cinemaId && !validCinema) setError("Rạp không tồn tại. Vui lòng chọn rạp khác.");
                } else {
                    setError("Không tìm thấy danh sách rạp.");
                }
            })
            .catch((err) => setError(`Lỗi tải danh sách rạp: ${err.message}`))
            .finally(() => setLoading(false));
    }, [cinemaId]);

    // Fetch all movies
    useEffect(() => {
        const fetchAllMovies = async () => {
            setLoading(true);
            try {
                let allMovies: Movie[] = [];
                let page = 1;
                let totalPages = 1;
                while (page <= totalPages) {
                    const res = await fetch(`http://localhost:5229/api/movie/getAllMoviesPagniation/${page}`);
                    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
                    const data: ApiResponse = await res.json();
                    allMovies = [
                        ...allMovies,
                        ...data.movieRespondDTOs.map((item) => ({
                            movieID: item.movieID,
                            title: item.movieName,
                            image: item.movieImage,
                            trailer: item.movieTrailerUrl,
                        })),
                    ];
                    totalPages = Math.ceil(data.totalCount / data.pageSize);
                    page++;
                }
                setMovies(allMovies);
            } catch (err: any) {
                setError(`Lỗi tải danh sách phim: ${err.message}`);
                setMovies([]);
            } finally {
                setLoading(false);
            }
        };
        fetchAllMovies();
    }, []);

    const handleOpenTrailer = (url: string) => {
        const embedUrl = url.includes("watch?v=")
            ? url.replace("watch?v=", "embed/")
            : url.includes("youtu.be/")
                ? `https://www.youtube.com/embed/${url.split("youtu.be/")[1].split("?")[0]}`
                : url;
        setTrailerUrl(embedUrl);
        setShowTrailer(true);
    };




    const renderMovie = (movie: Movie) => (
        <div key={movie.movieID} className="bg-transparent rounded-xl shadow-lg p-4 flex flex-col min-h-[450px] sm:min-h-[550px]">
            <img
                src={movie.image}
                alt={movie.title}
                className="w-full h-[320px] sm:h-[420px] object-cover rounded-md cursor-pointer hover:scale-105 transition"
                onClick={() => handleOpenTrailer(movie.trailer)}
            />
            <h3 className="font-semibold text-center mt-4 text-sm sm:text-base flex-grow text-white">{movie.title}</h3>
            <div className="mt-3 flex gap-3 justify-center">
                <button
                    onClick={() => handleOpenTrailer(movie.trailer)}
                    className="p-2 sm:p-3 rounded-full backdrop-blur-lg border border-red-500/20 bg-gradient-to-tr from-black/60 to-black/40 shadow-lg hover:shadow-2xl hover:shadow-red-500/30 hover:scale-110 hover:rotate-2 active:scale-95 active:rotate-0 transition-all duration-300 ease-out cursor-pointer group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                    <div className="relative z-10">
                        <svg className="w-6 sm:w-7 h-6 sm:h-7 fill-current text-red-500 group-hover:text-red-400 transition-colors duration-300" viewBox="0 0 576 512" xmlns="http://www.w3.org/2000/svg">
                            <path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"></path>
                        </svg>
                    </div>
                </button>
                <button
                    onClick={activeTab === "tab1" ? () => navigate("/showtimes") : () => navigate("/futurefilm")}
                    className="w-32 sm:w-40 h-10 sm:h-12 bg-purple-600 text-white border-none rounded-md text-xs sm:text-base font-bold cursor-pointer z-10 group relative overflow-hidden flex items-center justify-center"
                >
                    <span className="absolute w-60 h-40 -top-12 -left-10 bg-white rotate-12 transform scale-x-0 group-hover:scale-x-100 transition-transform group-hover:duration-500 duration-1000 origin-left"></span>
                    <span className="absolute w-60 h-40 -top-12 -left-10 bg-orange-400 rotate-12 transform scale-x-0 group-hover:scale-x-100 transition-transform group-hover:duration-700 duration-700 origin-left"></span>
                    <span className="absolute w-60 h-40 -top-12 -left-10 bg-orange-600 rotate-12 transform scale-x-0 group-hover:scale-x-100 transition-transform group-hover:duration-1000 duration-500 origin-left"></span>
                    <span className="relative z-10 flex items-center gap-2">🎟 {activeTab === "tab1" ? "Đặt vé ngay" : "Tìm hiểu thêm"}</span>
                </button>
            </div>
        </div>
    );

    if (loading) return <div className="text-white text-center p-4">Đang tải...</div>;
    if (error) return <div className="text-red-500 text-center p-4">{error}</div>;
    if (cinemas.length === 0) return <div className="text-white text-center p-4">Không tìm thấy rạp.</div>;

    return (
        <div className="flex flex-col min-h-screen bg-fixed w-full bg-cover bg-center" style={{ backgroundImage: "url('https://images8.alphacoders.com/136/thumb-1920-1368754.jpeg')" }}>
            <div className="top-0 z-50 bg-slate-950 shadow-md sticky">
                <div className="max-w-screen-xl text-base mx-auto px-4 sm:px-8">
                    <Nav />
                </div>
            </div>
            <main className="flex-grow flex flex-col items-center">
                <div className="pt-3 w-full max-w-screen-xl mx-auto px-4 sm:px-8">

                    {/* Selected Cinema Info */}
                    {selectedCinemaId && (
                        <div className="h-48 w-full bg-cover bg-center rounded-xl pt-10 mb-4" style={{ backgroundImage: `url(${filmszone})` }}>
                            <div className="flex h-full text-white p-4">
                                <div className="p-4">
                                    <h1 className="text-3xl font-bold">{cinemas.find((c: Cinema) => c.cinemaId === selectedCinemaId)?.cinemaName}</h1>
                                    <p>Địa điểm: {cinemas.find((c: Cinema) => c.cinemaId === selectedCinemaId)?.cinemaLocation}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Tab Header */}
                    <div className="flex border-b border-gray-300 justify-center items-center mb-4 space-x-10 sm:space-x-40 text-lg pt-5">
                        <button
                            onClick={() => setActiveTab("tab1")}
                            className={`text-white font-medium text-base sm:text-xl px-4 py-2 ${activeTab === "tab1" ? "border-b-2 border-yellow-500 font-semibold px-6 sm:px-10 text-yellow-500" : ""}`}
                        >
                            Phim đang chiếu
                        </button>
                        <button
                            onClick={() => setActiveTab("tab2")}
                            className={`text-white font-medium text-base sm:text-xl px-4 py-2 ${activeTab === "tab2" ? "border-b-2 border-yellow-500 font-semibold px-6 sm:px-10 text-yellow-500" : ""}`}
                        >
                            Phim sắp chiếu
                        </button>
                    </div>
                    {/* Tab Content */}
                    <div className="p-4 text-white max-w-screen-xl mx-auto px-4 sm:px-8 py-12">
                        {activeTab === "tab1" && (
                            <div>
                                {loading ? (
                                    <p className="text-center text-white">Đang tải...</p>
                                ) : error ? (
                                    <p className="text-center text-red-500">{error}</p>
                                ) : movies.length === 0 ? (
                                    <p className="text-center text-white">Không có phim nào</p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">{movies.map(renderMovie)}</div>
                                )}
                            </div>
                        )}
                        {activeTab === "tab2" && <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">{upcomingMovies.map(renderMovie)}</div>}
                        {/* Trailer Popup */}
                        {showTrailer && (
                            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                                <div className="bg-black rounded-lg p-4 relative w-[90%] sm:w-[80%] md:w-[60%] aspect-video">
                                    <button onClick={() => setShowTrailer(false)} className="absolute top-2 right-2 text-white text-xl sm:text-2xl font-bold">
                                        ✕
                                    </button>
                                    <iframe src={trailerUrl} title="Trailer" className="w-full h-full rounded-md" allowFullScreen />
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