import React, { useState, useEffect } from "react";
import axios from "axios";
import Nav from "../Header/nav";
import Bottom from "../Footer/bottom";
import bg from "../image/bg.png";
import { Navigate, useNavigate } from "react-router";

// Interfaces (Không thay đổi)
interface Genre {
    genreId: string;
    genreName: string;
}

interface AgeOption {
    minimumAgeID: string;
    minimumAgeInfo: number;
    minimumAgeDescription: string;
}

interface Language {
    languageId: string;
    languageDetail: string;
}

interface VisualFormat {
    movieVisualId: string;
    movieVisualFormatDetail: string;
}

interface Movie {
    movieId?: string;
    name: string;
    image: string | null;
    description?: string;
    director?: string;
    cast?: string;
    trailer: string;
    duration: number;
    ageLimit?: string;
    language: string;
    releaseDate: string;
    genres: string[];
    dinhdang: string[];
}

interface ErrorResponse {
    thongTinLoi?: {
        status: string;
        message: string;
    };
    errors?: string | string[];
}

interface CreateMovieResponse {
    movieID?: string;
    movieImage?: string;
    message?: string;
}

interface FormState {
    name: string;
    description: string;
    duration: string;
    actor: string;
    director: string;
    trailer: string;
    releaseDate: string;
    languageId: string;
    ageId: string;
}

const TOKEN = localStorage.getItem('authToken');

const AddMovie: React.FC = () => {
    const [theloaiOptions, setTheloaiOptions] = useState<Genre[]>([]);
    const [dinhDangOptions, setDinhDangOptions] = useState<VisualFormat[]>([]);
    const [ageOptions, setAgeOptions] = useState<AgeOption[]>([]);
    const [languageOptions, setLanguageOptions] = useState<Language[]>([]);
    const [movies, setMovies] = useState<Movie[]>([]);
    const [form, setForm] = useState<FormState>({
        name: "",
        description: "",
        duration: "",
        actor: "",
        director: "",
        trailer: "",
        releaseDate: "",
        languageId: "",
        ageId: "",
    });
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [selectedDinhdang, setSelectedDinhdang] = useState<string[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [loi, setLoi] = useState("");
    const [thanhCong, setThanhCong] = useState("");
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [showConfirm, setShowConfirm] = useState<boolean>(false);
    const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();
    const handleHome = () => {
        navigate('/HomeAdmin');
    }
    useEffect(() => {
        return () => {
            movies.forEach((movie) => {
                if (movie.image && movie.image.startsWith("blob:")) {
                    URL.revokeObjectURL(movie.image);
                }
            });
        };
    }, [movies]);

    const fetchData = async (url: string, setData: (data: any) => void, errorMessage: string) => {
        try {
            const res = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${TOKEN}`,
                },
            });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(
                    `${errorMessage}: ${errorData.message || `HTTP ${res.status}`}`
                );
            }
            const data = await res.json();
            console.log(`${errorMessage.split(":")[0]}:`, data);
            setData(data);
        } catch (err: any) {
            console.error("Lỗi chi tiết:", err);
            setLoi(`${errorMessage}: ${err.message}`);
        } finally {
            if (url.includes("getAllMoviesPagniation")) {
                setLoading(false);
            }
        }
    };

    const fetchMovies = (page: number) => {
        fetchData(
            `http://localhost:5229/api/movie/getAllMoviesPagniation/${page}`,
            (data) => {
                const formattedMovies = (Array.isArray(data.movieRespondDTOs) ? data.movieRespondDTOs : []).map((item: any) => ({
                    movieId: item.movieID || undefined,
                    name: item.movieName || "Không có tên",
                    image: item.movieImage || null,
                    description: item.movieDescription || "Không có mô tả",
                    director: item.movieDirector || "Không có đạo diễn",
                    cast: item.movieActor || "Không có diễn viên",
                    trailer: item.movieTrailerUrl || "",
                    duration: item.movieDuration || 0,
                    ageLimit: item.minimumAgeID || "",
                    language: item.listLanguageName || "Không có ngôn ngữ",
                    releaseDate: item.releaseDate ? new Date(item.releaseDate).toLocaleDateString() : "Không có ngày",
                    genres: item.movieGenres || [],
                    dinhdang: item.movieVisualFormat || [],
                }));
                setMovies(formattedMovies);
                setTotalPages(Math.ceil(data.totalCount / data.pageSize));
            },
            "Không thể tải danh sách phim"
        );
    };

    useEffect(() => {
        if (!TOKEN) {
            setLoi("Không tìm thấy token xác thực");
            setLoading(false);
            return;
        }

        fetchData(
            "http://localhost:5229/api/MovieGenre/GetMovieGenreList",
            setTheloaiOptions,
            "Không thể tải danh sách thể loại"
        );
        fetchData(
            "http://localhost:5229/api/MovieVisualFormat/GetMovieVisualFormatList",
            setDinhDangOptions,
            "Không thể tải danh sách định dạng"
        );
        fetchData(
            "http://localhost:5229/api/MinimumAge/GetMinimumAge",
            setAgeOptions,
            "Không thể tải danh sách độ tuổi"
        );
        fetchData(
            "http://localhost:5229/api/Language/GetLanguage",
            setLanguageOptions,
            "Không thể tải danh sách ngôn ngữ"
        );
        fetchMovies(page);
    }, [page]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = e.target.value;
        if (selected && !selectedGenres.includes(selected)) {
            setSelectedGenres((prev) => [...prev, selected]);
        }
    };

    const handleDinhDangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const d = e.target.value;
        if (d && !selectedDinhdang.includes(d)) {
            setSelectedDinhdang((prev) => [...prev, d]);
        }
    };

    const removeDinhdang = (toRemove: string) => {
        setSelectedDinhdang(selectedDinhdang.filter((item) => item !== toRemove));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoi("");
        setThanhCong("");
        setIsSubmitting(true);

        // Validation logic (Không thay đổi)
        if (!form.name) {
            setLoi("Vui lòng nhập tên phim");
            setIsSubmitting(false);
            return;
        }
        if (!form.description) {
            setLoi("Vui lòng nhập mô tả phim");
            setIsSubmitting(false);
            return;
        }
        if (!form.duration || isNaN(parseInt(form.duration)) || parseInt(form.duration) <= 0) {
            setLoi("Vui lòng nhập thời lượng hợp lệ (số phút lớn hơn 0)");
            setIsSubmitting(false);
            return;
        }
        if (!form.actor) {
            setLoi("Vui lòng nhập diễn viên");
            setIsSubmitting(false);
            return;
        }
        if (!form.director) {
            setLoi("Vui lòng nhập đạo diễn");
            setIsSubmitting(false);
            return;
        }
        if (!form.trailer) {
            setLoi("Vui lòng nhập URL trailer");
            setIsSubmitting(false);
            return;
        }
        const urlPattern = /^(https?:\/\/[^\s$.?#].[^\s]*)$/;
        if (!urlPattern.test(form.trailer)) {
            setLoi("URL trailer không hợp lệ");
            setIsSubmitting(false);
            return;
        }
        if (!form.releaseDate) {
            setLoi("Vui lòng chọn ngày ra mắt");
            setIsSubmitting(false);
            return;
        }
        const parsedDate = new Date(form.releaseDate);
        if (isNaN(parsedDate.getTime())) {
            setLoi("Ngày ra mắt không hợp lệ");
            setIsSubmitting(false);
            return;
        }
        if (!form.languageId) {
            setLoi("Vui lòng chọn ngôn ngữ");
            setIsSubmitting(false);
            return;
        }
        if (!form.ageId) {
            setLoi("Vui lòng chọn độ tuổi");
            setIsSubmitting(false);
            return;
        }
        if (selectedGenres.length === 0) {
            setLoi("Vui lòng chọn ít nhất một thể loại");
            setIsSubmitting(false);
            return;
        }
        if (selectedDinhdang.length === 0) {
            setLoi("Vui lòng chọn ít nhất một định dạng");
            setIsSubmitting(false);
            return;
        }
        if (!selectedFile && editIndex === null) {
            setLoi("Vui lòng chọn poster phim");
            setIsSubmitting(false);
            return;
        }
        if (selectedFile && !["image/jpeg", "image/png"].includes(selectedFile.type)) {
            setLoi("Poster phim phải là file JPEG hoặc PNG");
            setIsSubmitting(false);
            return;
        }
        if (selectedFile && selectedFile.size > 5 * 1024 * 1024) {
            setLoi("Poster phim không được vượt quá 5MB");
            setIsSubmitting(false);
            return;
        }
        
        const formData = new FormData();
        formData.append("movieName", form.name);
        formData.append("movieDescription", form.description);
        formData.append("movieDuration", form.duration);
        formData.append("movieActor", form.actor);
        formData.append("movieDirector", form.director);
        formData.append("movieTrailerUrl", form.trailer);
        formData.append("releaseDate", parsedDate.toISOString());
        formData.append("languageId", form.languageId);
        formData.append("minimumAgeID", form.ageId);
        selectedGenres.forEach((genreId) => formData.append("movieGenreList", genreId));
        selectedDinhdang.forEach((formatId) => formData.append("visualFormatList", formatId));
        if (selectedFile) {
            formData.append("movieImage", selectedFile);
        }

        try {
            const url = editIndex !== null
                ? `http://localhost:5229/api/movie/editMovie?movieID=${movies[editIndex].movieId}`
                : "http://localhost:5229/api/movie/createMovie";
            const method = editIndex !== null ? "patch" : "post";
            const res = await axios.request<CreateMovieResponse>({
                method,
                url,
                headers: {
                    Authorization: `Bearer ${TOKEN}`,
                    "Content-Type": "multipart/form-data",
                },
                data: formData as any,
                timeout: 30000,
            });
            
            console.log("Phản hồi từ API (create/update):", res.data);

            if (res.status === 200 || res.status === 201 || res.status === 204) {
                setThanhCong(editIndex !== null ? "Cập nhật phim thành công!" : "Tạo phim thành công!");
                fetchMovies(page);
                setForm({
                    name: "",
                    description: "",
                    duration: "",
                    actor: "",
                    director: "",
                    trailer: "",
                    releaseDate: "",
                    languageId: "",
                    ageId: "",
                });
                setSelectedFile(null);
                setSelectedGenres([]);
                setSelectedDinhdang([]);
                setEditIndex(null);
            } else {
                throw new Error(`Lỗi từ server: ${res.status}`);
            }
        } catch (err: any) {
            let errorMessage = "Lỗi không xác định";
            if (err.response) {
                const errorData = err.response.data;
                errorMessage =
                    errorData?.thongTinLoi?.message ||
                    (Array.isArray(errorData?.errors) ? errorData.errors.join(", ") : errorData?.errors || `Lỗi từ server: ${err.response.status}`);
            } else if (err.request) {
                errorMessage = "Không nhận được phản hồi từ server. Vui lòng kiểm tra kết nối mạng.";
            } else {
                errorMessage = err.message || "Lỗi không xác định";
            }
            setLoi("Lỗi: " + errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // =================================================================
    // ================== HÀM HANDLEEDIT ĐÃ CẬP NHẬT ==================
    // =================================================================
    const handleEdit = async (index: number) => {
        const movie = movies[index];
        if (!movie.movieId) {
            setLoi("Không tìm thấy ID phim để chỉnh sửa.");
            return;
        }

        setLoi("");
        setThanhCong("");
        setLoading(true);
        window.scrollTo(0, 0); // Cuộn lên đầu trang để xem biểu mẫu

        try {
            const res = await fetch(`http://localhost:5229/api/movie/getMovieDetail/${movie.movieId}`, {
                headers: {
                    Authorization: `Bearer ${TOKEN}`,
                },
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(`Không thể tải chi tiết phim: ${errorData.message || `HTTP ${res.status}`}`);
            }

            const result = await res.json();
            if (result.status !== "Success") {
                 throw new Error(`Lỗi từ API: ${result.message}`);
            }

            const movieDetails = result.data;

            // Trích xuất ID từ phản hồi chi tiết
            const languageId = movieDetails.movieLanguage ? Object.keys(movieDetails.movieLanguage)[0] : "";
            const ageId = movieDetails.movieMinimumAge ? Object.keys(movieDetails.movieMinimumAge)[0] : "";
            const genreIds = movieDetails.movieGenre.map((g: any) => g.movieGenreId);
            const formatIds = movieDetails.movieVisualFormat.map((f: any) => f.movieVisualFormatId);

            setForm({
                name: movieDetails.movieName || "",
                description: movieDetails.movieDescription || "",
                duration: movieDetails.movieDuration?.toString() || "",
                actor: movieDetails.movieActor || "",
                director: movieDetails.movieDirector || "",
                trailer: movieDetails.movieTrailerUrl || "",
                // Định dạng ngày thành YYYY-MM-DD cho <input type="date">
                releaseDate: movieDetails.releaseDate ? new Date(movieDetails.releaseDate).toISOString().split('T')[0] : "",
                languageId: languageId,
                ageId: ageId,
            });

            setSelectedGenres(genreIds);
            setSelectedDinhdang(formatIds);
            setSelectedFile(null); // Xóa lựa chọn tệp trước đó
            setEditIndex(index); // Theo dõi chỉ mục để gửi đi
            
        } catch (err: any) {
            setLoi(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (index: number) => {
        setDeleteIndex(index);
        setShowConfirm(true);
    };

    const confirmDelete = async () => {
        if (deleteIndex !== null) {
            const movieId = movies[deleteIndex].movieId;
            if (movieId) {
                try {
                    await axios.delete(`http://localhost:5229/api/movie/DeleteMovie/${movieId}`, {
                        headers: {
                            Authorization: `Bearer ${TOKEN}`,
                            accept: '*/*'
                        },
                    });
                    setThanhCong("Xóa phim thành công!");
                    fetchMovies(page);
                } catch (err: any) {
                    setLoi("Lỗi khi xóa phim: " + (err.response?.data?.message || err.message));
                }
            } else {
                setLoi("Không tìm thấy movieId để xóa");
            }
        }
        setShowConfirm(false);
        setDeleteIndex(null);
    };

    const cancelDelete = () => {
        setShowConfirm(false);
        setDeleteIndex(null);
    };

    return (
        <div className="flex flex-col min-h-screen bg-cover bg-fixed bg-center" style={{ backgroundImage: `url(${bg})` }}>
            <header className="sticky top-0 z-50 bg-slate-950 shadow-md mb-4">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-8"><Nav /></div>
            </header>

            <main className="flex-grow">
                <h2 className="text-2xl sm:text-4xl font-bold text-yellow-400 text-center uppercase mt-8 sm:mt-14 mb-6">
                    {editIndex !== null ? "Cập nhật phim" : "Thêm phim"}
                </h2>

                <form onSubmit={handleSubmit}>
                    <div className="flex justify-start items-start ml-[440px]">
                        <button className="cursor-pointer duration-200 hover:scale-125 active:scale-100" title="Go Back"
                            onClick={handleHome}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="50px" height="50px" viewBox="0 0 24 24" className="stroke-blue-300">
                                <path stroke-linejoin="round" stroke-linecap="round" stroke-width="1.5" d="M11 6L5 12M5 12L11 18M5 12H19"></path>
                            </svg>
                        </button>
                    </div>
                    <div className="flex justify-center px-4 sm:px-0">
                        <div
                            className="w-full sm:w-3/4 md:w-2/3 max-w-4xl backdrop-blur-md p-4 sm:p-6 rounded-xl shadow-xl space-y-4 relative z-10"
                            style={{
                                backgroundImage:
                                    "url('https://www.lfs.com.my/images/cinema%20background.jpg')",
                            }}
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleInputChange}
                                    placeholder="Tên phim"
                                    className="p-2 border rounded bg-transparent text-white font-medium placeholder:font-normal placeholder:text-slate-300 w-full"
                                />
                                <input
                                    name="director"
                                    value={form.director}
                                    onChange={handleInputChange}
                                    placeholder="Đạo diễn"
                                    className="p-2 border rounded bg-transparent text-white font-medium placeholder:font-normal placeholder:text-slate-300 w-full"
                                />
                                <input
                                    name="actor"
                                    value={form.actor}
                                    onChange={handleInputChange}
                                    placeholder="Diễn viên"
                                    className="p-2 border rounded bg-transparent text-white font-medium placeholder:font-normal placeholder:text-slate-300 w-full"
                                />
                                <input
                                    name="duration"
                                    value={form.duration}
                                    onChange={handleInputChange}
                                    type="number"
                                    placeholder="Thời lượng (phút)"
                                    className="p-2 border rounded bg-transparent text-white font-medium placeholder:font-normal placeholder:text-slate-300 w-full"
                                />
                                <select
                                    name="languageId"
                                    value={form.languageId}
                                    onChange={handleInputChange}
                                    className="p-2 border rounded bg-transparent text-slate-300 font-normal w-full"
                                >
                                    <option className="text-black bg-slate-600" value="">
                                        Chọn ngôn ngữ gốc
                                    </option>
                                    {languageOptions.map((lang) => (
                                        <option
                                            key={lang.languageId}
                                            value={lang.languageId}
                                            className="text-black bg-slate-600"
                                        >
                                            {lang.languageDetail}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    name="ageId"
                                    value={form.ageId}
                                    onChange={handleInputChange}
                                    className="p-2 border rounded bg-transparent text-slate-300 font-normal w-full"
                                >
                                    <option className="text-black bg-slate-600" value="">
                                        Chọn độ tuổi
                                    </option>
                                    {ageOptions.length > 0 ? (
                                        ageOptions.map((age) => (
                                            <option
                                                key={age.minimumAgeID}
                                                value={age.minimumAgeID}
                                                className="text-black bg-slate-600"
                                            >
                                                {age.minimumAgeInfo} - {age.minimumAgeDescription}
                                            </option>
                                        ))
                                    ) : (
                                        <option className="text-black bg-slate-600" value="" disabled>
                                            Không có độ tuổi
                                        </option>
                                    )}
                                </select>
                                <div className="flex flex-row rounded border py-2 px-2 w-full">
                                    <p className="border-e-2 pr-3 text-slate-300 shrink-0">Chọn poster phim</p>
                                    <input
                                        name="image"
                                        type="file"
                                        onChange={handleFileChange}
                                        className="pl-3 bg-transparent text-slate-300 file:hidden w-full"
                                    />
                                </div>
                                <div className="flex flex-row rounded border py-2 px-2 w-full">
                                    <p className="border-e-2 pr-3 text-slate-300 shrink-0">Chọn thời gian ra mắt</p>
                                    <input
                                        name="releaseDate"
                                        value={form.releaseDate}
                                        onChange={handleInputChange}
                                        type="date"
                                        className="pl-3 bg-transparent text-slate-300 w-full"
                                    />
                                </div>
                                <input
                                    type="url"
                                    name="trailer"
                                    value={form.trailer}
                                    onChange={handleInputChange}
                                    placeholder="Chèn URL Trailer"
                                    className="p-2 border rounded bg-transparent text-white font-medium placeholder:font-normal placeholder:text-slate-300 col-span-1 sm:col-span-2 w-full"
                                />
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleInputChange}
                                    rows={5}
                                    placeholder="Mô tả phim"
                                    className="p-2 border rounded col-span-1 sm:col-span-2 bg-transparent placeholder:font-normal placeholder:text-slate-300 font-medium text-white w-full"
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="block text-white font-semibold">Thể loại</label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {selectedGenres.length > 0 ? (
                                        selectedGenres.map((id) => {
                                            const genre = theloaiOptions.find((g) => g.genreId === id);
                                            return (
                                                <span
                                                    key={id}
                                                    className="bg-slate-500 px-3 py-1 rounded text-white flex items-center"
                                                >
                                                    {genre?.genreName || "Unknown Genre"}
                                                    <button
                                                        className="text-yellow-300 ml-2"
                                                        onClick={() =>
                                                            setSelectedGenres((prev) => prev.filter((gid) => gid !== id))
                                                        }
                                                    >
                                                        ✕
                                                    </button>
                                                </span>
                                            );
                                        })
                                    ) : (
                                        <span className="text-slate-300">Chưa chọn thể loại</span>
                                    )}
                                </div>
                                <select
                                    onChange={handleGenreChange}
                                    className="w-full p-2 border rounded bg-transparent text-white"
                                >
                                    <option className="text-black bg-slate-600" value="">
                                        -- Chọn thể loại --
                                    </option>
                                    {theloaiOptions.length > 0 ? (
                                        theloaiOptions
                                            .filter((g) => !selectedGenres.includes(g.genreId))
                                            .map((g) => (
                                                <option
                                                    className="text-black bg-slate-600"
                                                    key={g.genreId}
                                                    value={g.genreId}
                                                >
                                                    {g.genreName}
                                                </option>
                                            ))
                                    ) : (
                                        <option className="text-black bg-slate-600" value="" disabled>
                                            Không có thể loại
                                        </option>
                                    )}
                                </select>
                                <label className="font-semibold block mt-4 text-white">Định dạng</label>
                                <div className="flex flex-wrap gap-2">
                                    {selectedDinhdang.length > 0 ? (
                                        selectedDinhdang.map((id) => {
                                            const format = dinhDangOptions.find((d) => d.movieVisualId === id);
                                            return (
                                                <span
                                                    key={id}
                                                    className="bg-slate-500 px-3 py-1 rounded text-white flex items-center"
                                                >
                                                    {format?.movieVisualFormatDetail || "Unknown Format"}
                                                    <button
                                                        className="text-yellow-300 ml-2"
                                                        onClick={() => removeDinhdang(id)}
                                                    >
                                                        ✕
                                                    </button>
                                                </span>
                                            );
                                        })
                                    ) : (
                                        <span className="text-slate-300">Chưa chọn định dạng</span>
                                    )}
                                </div>
                                <select
                                    onChange={handleDinhDangChange}
                                    className="w-full p-2 border rounded bg-transparent text-white"
                                >
                                    <option className="text-black bg-slate-600" value="">
                                        -- Chọn định dạng --
                                    </option>
                                    {dinhDangOptions.length > 0 ? (
                                        dinhDangOptions
                                            .filter((d) => !selectedDinhdang.includes(d.movieVisualId))
                                            .map((d) => (
                                                <option
                                                    className="text-black bg-slate-600"
                                                    key={d.movieVisualId}
                                                    value={d.movieVisualId}
                                                >
                                                    {d.movieVisualFormatDetail}
                                                </option>
                                            ))
                                    ) : (
                                        <option className="text-black bg-slate-600" value="" disabled>
                                            Không có định dạng
                                        </option>
                                    )}
                                </select>
                            </div>

                            <div className="text-right mt-4 py-5">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`cursor-pointer bg-gradient-to-b from-indigo-500 to-indigo-600 shadow-[0px_4px_32px_0_rgba(99,102,241,.70)] px-6 py-3 rounded-xl border-[1px] border-slate-500 text-white font-medium group ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                    <div className="relative overflow-hidden">
                                        <p className="group-hover:-translate-y-7 duration-[1.125s] ease-[cubic-bezier(0.19,1,0.22,1)]">
                                            {editIndex !== null ? "Cập nhật" : isSubmitting ? <div className="flex-col gap-4 w-full flex items-center justify-center">
                                                <div
                                                    className="w-20 h-20 border-4 border-transparent text-blue-400 text-4xl animate-spin flex items-center justify-center border-t-blue-400 rounded-full"
                                                >
                                                    <div
                                                        className="w-16 h-16 border-4 border-transparent text-red-400 text-2xl animate-spin flex items-center justify-center border-t-red-400 rounded-full"
                                                    ></div>
                                                </div>
                                            </div> : "Thêm phim"}
                                        </p>
                                        <p className="absolute top-7 left-0 group-hover:top-0 duration-[1.125s] ease-[cubic-bezier(0.19,1,0.22,1)]">
                                            {editIndex !== null ? "Cập nhật" : isSubmitting ? "Đang thêm..." : "Thêm phim"}
                                        </p>
                                    </div>
                                </button>
                            </div>
                            {loi && <p className="text-red-500 text-center">{loi}</p>}
                            {thanhCong && <p className="text-green-500 text-center">{thanhCong}</p>}
                        </div>
                    </div>
                </form>

                <div className="mt-10 px-4 sm:px-10">
                    <h3 className="text-2xl sm:text-3xl font-semibold text-white mb-4 text-center sm:text-left">Danh sách phim</h3>
                    {loading && editIndex === null ? ( // Chỉ hiển thị loading chính khi không ở chế độ edit
                        <p className="text-white text-center">Đang tải...</p>
                    ) : loi && movies.length === 0 ? (
                        <p className="text-red-500 text-center">{loi}</p>
                    ) : movies.length === 0 ? (
                        <p className="text-white text-center">Chưa có phim nào</p>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table
                                    className="w-full backdrop-blur-md p-6 rounded-xl shadow-xl space-y-4 relative z-10"
                                    style={{
                                        backgroundImage: "url('https://www.lfs.com.my/images/cinema%20background.jpg')",
                                    }}
                                >
                                    <thead className="bg-slate-600 text-white text-sm sm:text-base">
                                        <tr>
                                            <th className="px-2 sm:px-4 py-2">STT</th>
                                            <th className="px-2 sm:px-4 py-2">Poster</th>
                                            <th className="px-2 sm:px-4 py-2 w-48 sm:w-72">Tên</th>
                                            <th className="px-2 sm:px-4 py-2">Thể loại</th>
                                            <th className="px-2 sm:px-4 py-2">Trailer</th>
                                            <th className="px-2 sm:px-4 py-2">Ngày ra mắt</th>
                                            <th className="px-2 sm:px-4 py-2">Ngôn ngữ</th>
                                            <th className="px-2 sm:px-4 py-2">Định dạng</th>
                                            <th className="px-2 sm:px-4 py-2">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {movies.map((m, i) => (
                                            <tr key={m.movieId || m.name + i} className="text-center border-b text-sm sm:text-base">
                                                <td className="text-white px-2 sm:px-4 py-2">{i + 1 + (page - 1) * 1}</td>
                                                <td className="text-white px-2 sm:px-4 py-2">
                                                    {m.image ? (
                                                        <img
                                                            src={m.image}
                                                            alt={m.name}
                                                            className="w-16 sm:w-20 h-16 sm:h-20 object-cover mx-auto"
                                                        />
                                                    ) : (
                                                        <span>Không có poster</span>
                                                    )}
                                                </td>
                                                <td className="text-white px-2 sm:px-4 py-2">{m.name || "Không có tên"}</td>
                                                <td className="text-white px-2 sm:px-4 py-2">
                                                    {m.genres?.length > 0 ? m.genres.join(", ") : "Không có thể loại"}
                                                </td>
                                                <td className="text-white px-2 sm:px-4 py-2">
                                                    {m.trailer ? (
                                                        <a
                                                            href={m.trailer}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-500 hover:underline"
                                                        >
                                                            Xem Trailer
                                                        </a>
                                                    ) : (
                                                        <span>Không có trailer</span>
                                                    )}
                                                </td>
                                                <td className="text-white px-2 sm:px-4 py-2">{m.releaseDate || "Không có ngày"}</td>
                                                <td className="text-white px-2 sm:px-4 py-2">{m.language || "Không có ngôn ngữ"}</td>
                                                <td className="text-white px-2 sm:px-4 py-2">
                                                    {m.dinhdang?.length > 0 ? m.dinhdang.join(", ") : "Không có định dạng"}
                                                </td>
                                                <td className="text-white px-2 sm:px-4 py-2 flex flex-row gap-2 justify-center items-center h-24">
                                                    <button
                                                        onClick={() => handleEdit(i)}
                                                        className="inline-flex items-center justify-center px-2 sm:px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium rounded-md hover:-translate-y-0.5 hover:scale-105 active:scale-95 transition-all duration-200"
                                                    >
                                                        <svg
                                                            className="h-4 w-4 mr-0.5 self-center items-center"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                        >
                                                            <path
                                                                d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325"
                                                            ></path>
                                                        </svg>
                                                        Sửa
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(i)}
                                                        className="group relative flex h-8 sm:h-10 w-8 sm:w-10 flex-col items-center justify-center overflow-hidden rounded-md border-2 border-red-800 bg-red-400 hover:bg-red-600"
                                                    >
                                                        <svg
                                                            viewBox="0 0 1.625 1.625"
                                                            className="absolute -top-5 fill-white delay-100 group-hover:top-4 group-hover:animate-[spin_1.4s] group-hover:duration-1000"
                                                            height="10"
                                                            width="10"
                                                        >
                                                            <path
                                                                d="M.471 1.024v-.52a.1.1 0 0 0-.098.098v.618c0 .054.044.098.098.098h.487a.1.1 0 0 0 .098-.099h-.39c-.107 0-.195 0-.195-.195"
                                                            ></path>
                                                            <path
                                                                d="M1.219.601h-.163A.1.1 0 0 1 .959.504V.341A.033.033 0 0 0 .926.309h-.26a.1.1 0 0 0-.098.098v.618c0 .054.044.098.098.098h.487a.1.1 0 0 0 .098-.099v-.39a.033.033 0 0 0-.032-.033"
                                                            ></path>
                                                            <path
                                                                d="m1.245.465-.15-.15a.02.02 0 0 0-.016-.006.023.023 0 0 0-.023.022v.108c0 .036.029.065.065.065h.107a.023.023 0 0 0 .023-.023.02.02 0 0 0-.007-.016"
                                                            ></path>
                                                        </svg>
                                                        <svg
                                                            width="10"
                                                            fill="none"
                                                            viewBox="0 0 39 7"
                                                            className="origin-right duration-500 group-hover:rotate-90"
                                                        >
                                                            <line stroke-width="3" stroke="white" y2="5" x2="39" y1="5"></line>
                                                            <line
                                                                stroke-width="2"
                                                                stroke="white"
                                                                y2="1.5"
                                                                x2="26.0357"
                                                                y1="1.5"
                                                                x1="12"
                                                            ></line>
                                                        </svg>
                                                        <svg
                                                            width="10"
                                                            fill="none"
                                                            viewBox="0 0 33 39"
                                                            className=""
                                                        >
                                                            <mask fill="white" id="path-1-inside-1_8_19">
                                                                <path
                                                                    d="M0 0H33V35C33 37.2091 31.2091 39 29 39H4C1.79086 39 0 37.2091 0 35V0Z"
                                                                ></path>
                                                            </mask>
                                                            <path
                                                                mask="url(#path-1-inside-1_8_19)"
                                                                fill="white"
                                                                d="M0 0H33H0ZM37 35C37 39.4183 33.4183 43 29 43H4C-0.418278 43 -4 39.4183 -4 35H4H29H37ZM4 43C-0.418278 43 -4 39.4183 -4 35V0H4V35V43ZM37 0V35C37 39.4183 33.4183 43 29 43V35V0H37Z"
                                                            ></path>
                                                            <path stroke-width="3" stroke="white" d="M12 6L12 29"></path>
                                                            <path stroke-width="3" stroke="white" d="M21 6V29"></path>
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex justify-center mt-4 gap-2 sm:gap-4 flex-wrap">
                                <button
                                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={page === 1}
                                    className="group/button relative inline-flex items-center justify-center overflow-hidden rounded-md bg-transparent backdrop-blur-lg px-4 sm:px-6 py-2 text-sm sm:text-base text-white transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-xl hover:shadow-blue-600/50 border border-white/20"
                                >
                                    <span>Trang trước</span>
                                    <div
                                        className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-13deg)_translateX(-100%)] group-hover/button:duration-1000 group-hover/button:[transform:skew(-13deg)_translateX(100%)]"
                                    >
                                        <div className="relative h-full w-10 bg-white/30"></div>
                                    </div>
                                </button>
                                <span className="px-4 py-2 text-white text-sm sm:text-lg">Trang {page} / {totalPages}</span>
                                <button
                                    onClick={() => setPage((prev) => prev + 1)}
                                    disabled={page === totalPages}
                                    className="group/button relative inline-flex items-center justify-center overflow-hidden rounded-md bg-transparent backdrop-blur-lg px-4 sm:px-6 py-2 text-sm sm:text-base text-white transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-xl hover:shadow-blue-600/50 border border-white/20"
                                >
                                    <span>Trang sau</span>
                                    <div
                                        className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-13deg)_translateX(-100%)] group-hover/button:duration-1000 group-hover/button:[transform:skew(-13deg)_translateX(100%)]"
                                    >
                                        <div className="relative h-full w-10 bg-white/30"></div>
                                    </div>
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {showConfirm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                        <div className="group select-none w-[250px] flex flex-col p-4 relative items-center justify-center bg-gray-800 border border-gray-800 shadow-lg rounded-2xl">
                            <div className="text-center p-3 flex-auto justify-center">
                                <svg
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                    className="group-hover:animate-bounce w-12 h-12 flex items-center text-gray-600 fill-red-500 mx-auto"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        clipRule="evenodd"
                                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                        fillRule="evenodd"
                                    ></path>
                                </svg>
                                <h2 className="text-xl font-bold py-4 text-gray-200">Bạn chắc chắn chứ?</h2>
                                <p className="text-xl font-bold py-4 text-gray-200">Suy nghĩ kĩ nha bro ☺️</p>
                                <p className="font-bold text-sm text-gray-500 px-2">
                                    Bạn có chắc chắn muốn xóa phim này? </p>
                            </div>
                            <div className="p-2 mt-2 text-center space-x-1 md:block">
                                <button
                                    onClick={confirmDelete}
                                    className="bg-red-500 hover:bg-transparent px-5 ml-4 py-2 text-sm shadow-sm hover:shadow-lg font-medium tracking-wider border-2 border-red-500 hover:border-red-500 text-white hover:text-red-500 rounded-full transition ease-in duration-300"
                                >
                                    Xóa
                                </button>
                                <button
                                    onClick={cancelDelete}
                                    className="mb-2 md:mb-0 bg-gray-700 px-5 py-2 text-sm shadow-sm font-medium tracking-wider border-2 border-gray-600 hover:border-gray-700 text-gray-300 rounded-full hover:shadow-lg hover:bg-gray-800 transition ease-in duration-300"
                                >
                                    Hủy
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <Bottom />
        </div>
    );
};

export default AddMovie;