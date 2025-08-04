import React, { useState, useEffect, useMemo, useRef } from 'react';
import { TicketIcon, MapPinIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid';
import user from "../image/user.png";
import logo from '../image/logocinema1.png';
import { useNavigate, useLocation } from 'react-router-dom';

// Định nghĩa interface cho rạp chiếu phim
interface Cinema {
    cinemaId: string;
    cinemaName: string;
    cinemaLocation: string;
}

// Định nghĩa interface cho phim dựa trên phản hồi API
interface Movie {
    movieID: string;
    movieName: string;
    movieImage: string;
    movieTrailerUrl: string;
    movieDuration: number;
    isRelease: boolean;
    releaseDate: string;
    listLanguageName: string;
    movieVisualFormat: string[];
    movieGenres: string[];
}

function Nav() {
    const userEmail = localStorage.getItem('userEmail');
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Thêm trạng thái để kiểm soát dropdown
    const [cinemas, setCinemas] = useState<Cinema[]>([]);
    const [allMovies, setAllMovies] = useState<Movie[]>([]);
    const [searchResults, setSearchResults] = useState<Movie[]>([]);
    const [filteredCinemas, setFilteredCinemas] = useState<Cinema[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const location = useLocation(); // Hook để lấy thông tin về URL hiện tại
    const searchRef = useRef<HTMLDivElement>(null); // Ref cho vùng tìm kiếm và dropdown

    // Lấy danh sách rạp từ API
    useEffect(() => {
        fetch('http://localhost:5229/api/Cinema/getCinemaList')
            .then((response) => response.json())
            .then((data) => {
                if (data.status === 'Success') {
                    setCinemas(data.data);
                }
            })
            .catch((error) => console.error('Lỗi khi lấy danh sách rạp:', error));
    }, []);

    // Cache kết quả tìm kiếm
    const cache = useMemo(() => new Map<string, Movie[]>(), []);

    // Hàm gọi API lấy tất cả phim khi click vào input tìm kiếm
    const fetchAllMovies = () => {
        setIsLoading(true);
        setError(null);

        const cachedResults = cache.get('allMovies');
        if (cachedResults) {
            setAllMovies(cachedResults);
            setSearchResults(cachedResults);
            setFilteredCinemas(cinemas);
            setIsLoading(false);
            return;
        }

        let retries = 0;
        const maxRetries = 3;
        const retryDelay = 2000;

        const fetchData = () => {
            const url = 'http://localhost:5229/api/movie/getAllMoviesPagniation/1';
            console.log('URL yêu cầu:', url);

            fetch(url, {
                method: 'GET',
                headers: {
                    'accept': '*/*'
                }
            })
                .then((response) => {
                    console.log('Trạng thái HTTP:', response.status);
                    if (!response.ok) {
                        throw new Error(`Lỗi HTTP: ${response.status}`);
                    }
                    return response.json();
                })
                .then((data) => {
                    console.log('Dữ liệu API:', data);
                    if (data.movieRespondDTOs && Array.isArray(data.movieRespondDTOs)) {
                        const results = data.movieRespondDTOs;
                        cache.set('allMovies', results);
                        setAllMovies(results);
                        setSearchResults(results);
                        setFilteredCinemas(cinemas);
                    } else {
                        setAllMovies([]);
                        setSearchResults([]);
                        setFilteredCinemas([]);
                        setError('Không tìm thấy phim hoặc rạp.');
                    }
                })
                .catch((error) => {
                    console.error('Lỗi khi gọi API:', error.message);
                    if (retries < maxRetries) {
                        retries++;
                        console.log(`Thử lại lần ${retries}/${maxRetries} sau ${retryDelay}ms...`);
                        setTimeout(fetchData, retryDelay);
                    } else {
                        setError('Không thể kết nối đến server. Sử dụng dữ liệu mẫu.');
                        setFilteredCinemas(cinemas);
                    }
                })
                .finally(() => setIsLoading(false));
        };

        fetchData();
    };

    // Lọc phim và rạp khi searchTerm thay đổi
    useEffect(() => {
        if (!allMovies.length && !cinemas.length) {
            setSearchResults([]);
            setFilteredCinemas([]);
            return;
        }

        if (!searchTerm.trim()) {
            setSearchResults(allMovies);
            setFilteredCinemas(cinemas);
            return;
        }

        const filteredMovies = allMovies.filter((movie) =>
            movie.movieName.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const filtered = cinemas.filter(
            (cinema) =>
                cinema.cinemaName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cinema.cinemaLocation.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setSearchResults(filteredMovies);
        setFilteredCinemas(filtered);
    }, [searchTerm, allMovies, cinemas]);

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false); // Đóng dropdown
                setSearchResults([]);
                setFilteredCinemas([]);
                setSearchTerm('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleInfo = () => {
        const roleName = localStorage.getItem('role') || '';
        const roles: string[] = roleName ? roleName.split(',') : [];

        if (roles.includes('Cashier') || roles.includes('TheaterManager') || roles.includes('Director') || roles.includes('MovieManager') || roles.includes('FacilitiesManager')) {
            navigate('/HomeAdmin');
        } else if (roles.includes('Customer')) {
            navigate('/info');
        }
    };

    const handleBooking = () => {
        navigate('/booking');
    };

    const handleMovieClick = (movieID: string) => {
        // Lưu movieID vào localStorage
        localStorage.setItem('movieId', movieID);

        // Đóng dropdown và xóa kết quả tìm kiếm
        setSearchTerm('');
        setSearchResults([]);
        setFilteredCinemas([]);
        setIsDropdownOpen(false);

        // Kiểm tra xem người dùng có đang ở trang /movies hay không
        if (location.pathname === '/movies') {
            // Nếu đang ở trang /movies, reload lại trang
            window.location.reload();
        } else {
            // Nếu không, chuyển hướng đến trang /movies
            navigate('/movies');
        }
    };

    return (
        <nav className="shadow-md text-white relative z-50">
            <div className="flex items-center justify-between px-4 py-2">
                <div className="flex justify-start items-start">
                    <button onClick={() => navigate("/")} className="flex items-center space-x-2">
                        <img src={logo} alt="logo" className="h-20 hover:scale-105 transition-transform duration-300" />
                    </button>

                    <div className="md:hidden flex items-center space-x-3">
                        <button onClick={() => setIsOpen(!isOpen)} className="border rounded px-3 py-1 text-yellow-400 font-bold border-white flex items-center gap-1">
                            Chọn Rạp <span className="rotate-90">▼</span>
                        </button>
                        <button onClick={() => setIsMenuOpen(true)}>
                            <Bars3Icon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-6">
                    <div className="flex justify-center items-center">
                        <button
                            onClick={handleBooking}
                            className="relative inline-flex items-center justify-center px-4 py-2 overflow-hidden text-white bg-purple-800 rounded-md group"
                        >
                            <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-amber-400 rounded-full group-hover:w-56 group-hover:h-56"></span>
                            <span className="relative text-base font-semibold flex items-center gap-2 uppercase">
                                <TicketIcon className="w-6 h-6 text-white" />
                                Đặt vé ngay
                            </span>
                        </button>
                    </div>
                </div>
                <div className="flex justify-center flex-row">
                    <div className="relative mr-7" ref={searchRef}>
                        <form
                            onSubmit={(e) => e.preventDefault()}
                            className="flex items-center bg-gray-800 text-gray-400 border border-gray-700 rounded-full px-4 py-2 w-[300px] focus-within:border-indigo-500 transition duration-300"
                        >
                            <input
                                type="text"
                                placeholder="Tìm phim, rạp"
                                className="w-full bg-transparent outline-none text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onClick={() => {
                                    fetchAllMovies(); // Gọi API lấy tất cả phim
                                    setIsDropdownOpen(true); // Hiển thị dropdown khi nhấp vào input
                                }}
                            />
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="ml-2"
                            >
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </form>
                        {isLoading && isDropdownOpen && (
                            <div className="absolute top-full mt-2 bg-gray-800 text-white rounded shadow-md w-[300px] z-50 p-2 text-center">
                                Đang tải...
                            </div>
                        )}
                        {(searchResults.length > 0 || filteredCinemas.length > 0) && !isLoading && !error && isDropdownOpen && (
                            <div className="absolute top-full mt-2 bg-white text-black rounded shadow-md w-[300px] z-50 max-h-48 overflow-y-auto">
                                {searchResults.length > 0 && (
                                    <div>
                                        <div className="px-4 py-2 font-bold bg-gray-100">Phim</div>
                                        {searchResults.map((movie) => (
                                            <div
                                                key={movie.movieID}
                                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                                onClick={() => handleMovieClick(movie.movieID)} // Gọi hàm handleMovieClick
                                            >
                                                {movie.movieName}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {filteredCinemas.length > 0 && (
                                    <div>
                                        <div className="px-4 py-2 font-bold bg-gray-100">Rạp</div>
                                        {filteredCinemas.map((cinema) => (
                                            <div
                                                key={cinema.cinemaId}
                                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                                onClick={() => {
                                                    setSearchTerm('');
                                                    setSearchResults([]);
                                                    setFilteredCinemas([]);
                                                    setIsDropdownOpen(false);
                                                    navigate(`/cinezone/${cinema.cinemaId}`);
                                                }}
                                            >
                                                {cinema.cinemaName} ({cinema.cinemaLocation})
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        {error && !isLoading && isDropdownOpen && (
                            <div className="absolute top-full mt-2 bg-gray-800 text-white rounded shadow-md w-[300px] z-50 p-2 text-center">
                                {error}
                            </div>
                        )}
                    </div>
                    {userEmail ? (
                        <div className="flex items-center gap-2">
                            <img src={user} alt="user" className="w-7" />
                            <span onClick={handleInfo} className="text-white text-sm font-semibold cursor-pointer hover:text-yellow-300">
                                {userEmail}
                            </span>
                        </div>
                    ) : (
                        <button onClick={() => navigate('/login')} className="flex items-center px-3 py-2 border border-white rounded-full hover:scale-90 transition">
                            <img src={user} alt="account" className="w-7" />
                        </button>
                    )}
                </div>
            </div>

            {isMenuOpen && (
                <div className="fixed inset-0 bg-slate-900/90 text-white p-6 z-50" style={{ backgroundImage: "url('https://images8.alphacoders.com/136/thumb-1920-1368754.jpeg')" }}>
                    <div className="flex justify-between items-center mb-6">
                        <img src={logo} alt="logo" className="h-12" />
                        <div className="flex items-center space-x-2">
                            <button onClick={() => setIsMenuOpen(false)} className="text-white border border-white rounded-full p-1">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                    <ul className="space-y-4 text-lg font-bold">
                        <li className="text-white">Xin chào {userEmail || 'Khách'}</li>
                        <li className="text-yellow-400 cursor-pointer" onClick={() => navigate('/')}>
                            TRANG CHỦ
                        </li>
                        <li className="cursor-pointer" onClick={() => navigate('/booking')}>
                            ĐẶT VÉ
                        </li>
                        <li className="cursor-pointer" onClick={() => navigate('/info')}>
                            LỊCH CHIẾU
                        </li>
                        <li className="cursor-pointer" onClick={() => navigate('/info')}>
                            THÀNH VIÊN
                        </li>
                    </ul>
                </div>
            )}

            <div className={`md:flex justify-between items-center px-4 py-2 text-sm ${isMenuOpen ? 'hidden' : 'block'} md:block`}>
                <div className="flex flex-wrap gap-4 w-full md:w-1/2">
                    <span onClick={() => setIsOpen(!isOpen)} className="cursor-pointer flex items-center gap-1 hover:text-purple-300">
                        <MapPinIcon className="w-5 h-5 text-purple-400" />
                        Chọn rạp
                    </span>
                    {isOpen && (
                        <div className="absolute left-4 top-[131px] z-50 bg-slate-900 rounded shadow-lg p-4 grid grid-cols-3 md:grid-cols-3 gap-3">
                            {cinemas.map((cinema) => (
                                <div
                                    key={cinema.cinemaId}
                                    onClick={() => navigate(`/cinezone/${cinema.cinemaId}`)}
                                    className="text-slate-200 font-bold cursor-pointer"
                                >
                                    {cinema.cinemaName} ({cinema.cinemaLocation})
                                </div>
                            ))}
                        </div>
                    )}
                    <span onClick={() => navigate('/listfilm')} className="cursor-pointer flex items-center gap-1 hover:text-purple-300">
                        <MapPinIcon className="w-5 h-5 text-purple-400" />
                        Chọn phim đang chiếu
                    </span>
                </div>
                <div className="w-full md:w-1/2 text-right mt-2 md:mt-0 text-sm mr-10">
                    <span onClick={() => navigate('/introduce')} className="cursor-pointer hover:text-purple-300">
                        Giới thiệu
                    </span>
                </div>
            </div>
        </nav>
    );
}

export default Nav;