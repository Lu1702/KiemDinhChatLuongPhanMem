import React, { useState, useEffect } from "react";
import axios from "axios";
import Nav from "../Header/nav";
import Bottom from "../Footer/bottom";
import bg from "../image/bg.png";

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
    visualFormatId: string;
    movieVisualFormatDetail: string;
}

interface Movie {
    name: string;
    image: File | null;
    description: string;
    director: string;
    cast: string;
    trailer: string;
    duration: number;
    ageLimit: string;
    language: string;
    releaseDate: string;
    genres: string[];
    dinhdang: string[];
}

const AddMovie: React.FC = () => {
    const [theloaiOptions, setTheloaiOptions] = useState<Genre[]>([]);
    const [dinhDangOptions, setDinhDangOptions] = useState<VisualFormat[]>([]);
    const [ageOptions, setAgeOptions] = useState<AgeOption[]>([]);
    const [languageOptions, setLanguageOptions] = useState<Language[]>([]);
    const [movies, setMovies] = useState<Movie[]>([]);
    const [form, setForm] = useState({
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

    // Lấy danh sách thể loại
    useEffect(() => {
        fetch("http://localhost:5229/api/MovieGenre/GetMovieGenreList")
            .then((res) => {
                if (!res.ok) throw new Error("Không thể tải danh sách thể loại");
                return res.json();
            })
            .then((data: Genre[]) => setTheloaiOptions(data))
            .catch((err) => {
                console.error("Lỗi khi gọi API thể loại:", err);
                setLoi("Không thể tải danh sách thể loại");
            });
    }, []);

    // Lấy danh sách định dạng
    useEffect(() => {
        fetch("http://localhost:5229/api/MovieVisualFormat/GetMovieVisualFormatList")
            .then((res) => {
                if (!res.ok) throw new Error("Không thể tải danh sách định dạng");
                return res.json();
            })
            .then((data: VisualFormat[]) => setDinhDangOptions(data))
            .catch((err) => {
                console.error("Lỗi khi gọi API định dạng:", err);
                setLoi("Không thể tải danh sách định dạng");
            });
    }, []);

    // Lấy danh sách độ tuổi
    useEffect(() => {
        fetch("http://localhost:5229/api/MinimumAge/GetMinimumAge")
            .then((res) => {
                if (!res.ok) throw new Error("Không thể tải danh sách độ tuổi");
                return res.json();
            })
            .then((data: AgeOption[]) => setAgeOptions(data))
            .catch((err) => {
                console.error("Lỗi khi gọi API độ tuổi:", err);
                setLoi("Không thể tải danh sách độ tuổi");
            });
    }, []);

    // Lấy danh sách ngôn ngữ
    useEffect(() => {
        fetch("http://localhost:5229/api/Language/GetLanguage")
            .then((res) => {
                if (!res.ok) throw new Error("Không thể tải danh sách ngôn ngữ");
                return res.json();
            })
            .then((data: Language[]) => setLanguageOptions(data))
            .catch((err) => {
                console.error("Lỗi khi gọi API ngôn ngữ:", err);
                setLoi("Không thể tải danh sách ngôn ngữ");
            });
    }, []);

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

        const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJNb3ZpZU1hbmFnZXIiLCJuYmYiOjE3NTMzNzQ1NjQsImV4cCI6MTc1MzM3ODE2NCwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo1MjI5IiwiYXVkIjoiaHR0cDovL2xvY2FsaG9zdDo1MjI5In0.jEhKmGi3NeEctpLZIEHG8sCS740zSNxP4RcO5uuPcxA";

        const formData = new FormData();
        formData.append("movieName", form.name);
        formData.append("movieDescription", form.description);
        formData.append("movieDuration", form.duration);
        formData.append("movieActor", form.actor);
        formData.append("movieDirector", form.director);
        formData.append("movieTrailerUrl", form.trailer);
        formData.append("releaseDate", form.releaseDate);
        formData.append("languageId", form.languageId);
        formData.append("minimumAgeID", form.ageId);
        selectedGenres.forEach((genreId) => formData.append("movieGenreList", genreId));
        selectedDinhdang.forEach((formatId) => formData.append("visualFormatList", formatId));
        if (selectedFile) {
            formData.append("movieImage", selectedFile);
        }

        try {
            const res = await axios.post("http://localhost:5229/api/movie/createMovie", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            if (res.status === 200 || res.status === 201) {
                setThanhCong("Tạo phim thành công!");
                const newMovie: Movie = {
                    name: form.name,
                    image: selectedFile,
                    description: form.description,
                    director: form.director,
                    cast: form.actor,
                    trailer: form.trailer,
                    duration: parseInt(form.duration) || 0,
                    ageLimit: form.ageId,
                    language: languageOptions.find((lang) => lang.languageId === form.languageId)?.languageDetail || form.languageId,
                    releaseDate: form.releaseDate,
                    genres: selectedGenres.map((id) => theloaiOptions.find((g) => g.genreId === id)?.genreName || id),
                    dinhdang: selectedDinhdang.map((id) => dinhDangOptions.find((d) => d.visualFormatId === id)?.movieVisualFormatDetail || id),
                };

                if (editIndex !== null) {
                    const updatedMovies = [...movies];
                    updatedMovies[editIndex] = newMovie;
                    setMovies(updatedMovies);
                    setEditIndex(null);
                } else {
                    setMovies((prev) => [...prev, newMovie]);
                }

                // Reset form
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
            } else {
                setLoi(`Lỗi khi tạo phim: ${res.status}`);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Lỗi không xác định";
            setLoi("Lỗi mạng: " + errorMessage);
        }
    };

    const handleEdit = (index: number) => {
        const movie = movies[index];
        setForm({
            name: movie.name,
            description: movie.description,
            duration: movie.duration.toString(),
            actor: movie.cast,
            director: movie.director,
            trailer: movie.trailer,
            releaseDate: movie.releaseDate,
            languageId: movie.language,
            ageId: movie.ageLimit,
        });
        setSelectedGenres(movie.genres.map((name) => theloaiOptions.find((g) => g.genreName === name)?.genreId || name));
        setSelectedDinhdang(movie.dinhdang.map((detail) => dinhDangOptions.find((d) => d.movieVisualFormatDetail === detail)?.visualFormatId || detail));
        setSelectedFile(movie.image);
        setEditIndex(index);
    };

    const handleDelete = (index: number) => {
        setDeleteIndex(index);
        setShowConfirm(true);
    };

    const confirmDelete = () => {
        if (deleteIndex !== null) {
            setMovies((prev) => prev.filter((_, i) => i !== deleteIndex));
        }
        setShowConfirm(false);
        setDeleteIndex(null);
    };

    const cancelDelete = () => {
        setShowConfirm(false);
        setDeleteIndex(null);
    };

    return (
        <div className="min-h-screen bg-cover bg-fixed bg-center" style={{ backgroundImage: `url(${bg})` }}>
            <header className="sticky top-0 z-50 bg-slate-950 shadow-md mb-4">
                <div className="max-w-screen-xl mx-auto px-8"><Nav /></div>
            </header>

            <main>
                <h2 className="text-3xl font-bold text-white text-center uppercase mt-14 mb-6">
                    {editIndex !== null ? "Cập nhật phim" : "Thêm phim"}
                </h2>

                <form onSubmit={handleSubmit}>
                    <div className="flex justify-center">
                        <div
                            className="w-2/3 backdrop-blur-md p-6 rounded-xl shadow-xl space-y-4 relative z-10"
                            style={{
                                backgroundImage:
                                    "url('https://www.lfs.com.my/images/cinema%20background.jpg')",
                            }}
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleInputChange}
                                    placeholder="Tên phim"
                                    className="p-2 border rounded bg-transparent text-white font-medium placeholder:font-normal placeholder:text-slate-300"
                                />
                                <input
                                    name="director"
                                    value={form.director}
                                    onChange={handleInputChange}
                                    placeholder="Đạo diễn"
                                    className="p-2 border rounded bg-transparent text-white font-medium placeholder:font-normal placeholder:text-slate-300"
                                />
                                <input
                                    name="actor"
                                    value={form.actor}
                                    onChange={handleInputChange}
                                    placeholder="Diễn viên"
                                    className="p-2 border rounded bg-transparent text-white font-medium placeholder:font-normal placeholder:text-slate-300"
                                />
                                <input
                                    name="duration"
                                    value={form.duration}
                                    onChange={handleInputChange}
                                    type="number"
                                    placeholder="Thời lượng"
                                    className="p-2 border rounded bg-transparent text-white font-medium placeholder:font-normal placeholder:text-slate-300"
                                />
                                <select
                                    name="languageId"
                                    value={form.languageId}
                                    onChange={handleInputChange}
                                    className="p-2 border rounded bg-transparent text-slate-300 font-normal"
                                >
                                    <option className="text-black bg-slate-600" value="">
                                        Chọn ngôn ngữ
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
                                    className="p-2 border rounded bg-transparent text-slate-300 font-normal"
                                >
                                    <option className="text-black bg-slate-600" value="">
                                        Chọn độ tuổi
                                    </option>
                                    {ageOptions.map((age) => (
                                        <option
                                            key={age.minimumAgeID}
                                            value={age.minimumAgeID}
                                            className="text-black bg-slate-600"
                                        >
                                            {age.minimumAgeInfo} - {age.minimumAgeDescription}
                                        </option>
                                    ))}
                                </select>
                                <div className="flex flex-row rounded border py-2 px-2">
                                    <p className="border-e-2 pr-3 text-slate-300">Chọn poster phim</p>
                                    <input
                                        name="image"
                                        type="file"
                                        onChange={handleFileChange}
                                        className="pl-10 bg-transparent text-slate-300 file:hidden"
                                    />
                                </div>
                                <div className="flex flex-row rounded border py-2 px-2">
                                    <p className="border-e-2 pr-3 text-slate-300">Chọn thời gian ra mắt</p>
                                    <input
                                        name="releaseDate"
                                        value={form.releaseDate}
                                        onChange={handleInputChange}
                                        type="date"
                                        className="pl-20 bg-transparent text-slate-300"
                                    />
                                </div>
                                <input
                                    type="url"
                                    name="trailer"
                                    value={form.trailer}
                                    onChange={handleInputChange}
                                    placeholder="Chèn URL Trailer"
                                    className="p-2 border rounded bg-transparent text-white font-medium placeholder:font-normal placeholder:text-slate-300 col-span-2"
                                />
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleInputChange}
                                    rows={5}
                                    placeholder="Mô tả phim"
                                    className="p-2 border rounded col-span-2 bg-transparent placeholder:font-normal placeholder:text-slate-300 font-medium text-white"
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="block text-white mb-2">Thể loại</label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {selectedGenres.map((id) => {
                                        const genre = theloaiOptions.find((g) => g.genreId === id);
                                        return (
                                            <span
                                                key={id}
                                                className="bg-slate-500 px-3 py-1 rounded text-white flex items-center"
                                            >
                                                {genre?.genreName}
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
                                    })}
                                </div>
                                <select
                                    onChange={handleGenreChange}
                                    className="w-full p-2 border rounded bg-transparent text-white"
                                >
                                    <option className="text-black bg-slate-600" value="">
                                        -- Chọn thể loại --
                                    </option>
                                    {theloaiOptions
                                        .filter((g) => !selectedGenres.includes(g.genreId))
                                        .map((g) => (
                                            <option
                                                className="text-black bg-slate-600"
                                                key={g.genreId}
                                                value={g.genreId}
                                            >
                                                {g.genreName}
                                            </option>
                                        ))}
                                </select>
                                <label className="font-semibold block mt-4 text-white">Định dạng</label>
                                <div className="flex flex-wrap gap-2">
                                    {selectedDinhdang.map((id) => {
                                        const format = dinhDangOptions.find((d) => d.visualFormatId === id);
                                        return (
                                            <span
                                                key={id}
                                                className="bg-slate-500 px-3 py-1 rounded text-white flex items-center"
                                            >
                                                {format?.movieVisualFormatDetail}
                                                <button
                                                    className="text-yellow-300 ml-2"
                                                    onClick={() => removeDinhdang(id)}
                                                >
                                                    ✕
                                                </button>
                                            </span>
                                        );
                                    })}
                                </div>
                                <select
                                    onChange={handleDinhDangChange}
                                    className="w-full p-2 border rounded bg-transparent text-white"
                                >
                                    <option className="text-black bg-slate-600" value="">
                                        -- Chọn định dạng --
                                    </option>
                                    {dinhDangOptions
                                        .filter((d) => !selectedDinhdang.includes(d.visualFormatId))
                                        .map((d) => (
                                            <option
                                                className="text-black bg-slate-600"
                                                key={d.visualFormatId}
                                                value={d.visualFormatId}
                                            >
                                                {d.movieVisualFormatDetail}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div className="text-right mt-4 py-5">
                                <button
                                    type="submit"
                                    className="cursor-pointer bg-gradient-to-b from-indigo-500 to-indigo-600 shadow-[0px_4px_32px_0_rgba(99,102,241,.70)] px-6 py-3 rounded-xl border-[1px] border-slate-500 text-white font-medium group"
                                >
                                    <div className="relative overflow-hidden">
                                        <p
                                            className="group-hover:-translate-y-7 duration-[1.125s] ease-[cubic-bezier(0.19,1,0.22,1)]"
                                        >
                                            {editIndex !== null ? "Cập nhật" : "Thêm phim"}
                                        </p>
                                        <p
                                            className="absolute top-7 left-0 group-hover:top-0 duration-[1.125s] ease-[cubic-bezier(0.19,1,0.22,1)]"
                                        >
                                            {editIndex !== null ? "Cập nhật" : "Thêm phim"}
                                        </p>
                                    </div>
                                </button>
                            </div>
                            {loi && <p className="text-red-500">{loi}</p>}
                            {thanhCong && <p className="text-green-500">{thanhCong}</p>}
                        </div>
                    </div>
                </form>

                <div className="mt-10 px-10">
                    <h3 className="text-3xl font-semibold text-white mb-4">Danh sách phim</h3>
                    <table
                        className="w-full backdrop-blur-md p-6 rounded-xl shadow-xl space-y-4 relative z-10 overflow-hidden py-5"
                        style={{
                            backgroundImage:
                                "url('https://www.lfs.com.my/images/cinema%20background.jpg')",
                        }}
                    >
                        <thead className="bg-slate-800 text-white">
                            <tr>
                                <th className="px-4 py-2">#</th>
                                <th className="px-4 py-2">Tên</th>
                                <th className="px-4 py-2 w-72">Thể loại</th>
                                <th className="px-4 py-2">Định dạng</th>
                                <th className="px-4 py-2">Ngày ra mắt</th>
                                <th className="px-4 py-2">Thời lượng</th>
                                <th className="px-4 py-2">Ngôn ngữ</th>
                                <th className="px-4 py-2">Đạo diễn</th>
                                <th className="px-4 py-2 w-56">Diễn viên</th>
                                <th className="px-4 py-2 w-80">Mô tả</th>
                                <th className="px-4 py-2">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {movies.map((m, i) => (
                                <tr key={i} className="text-center border-b">
                                    <td className="text-white">{i + 1}</td>
                                    <td className="text-white">{m.name}</td>
                                    <td className="text-white">{m.genres.join(", ")}</td>
                                    <td className="text-white">{m.dinhdang.join(", ")}</td>
                                    <td className="text-white">{m.releaseDate}</td>
                                    <td className="text-white">{m.duration}</td>
                                    <td className="text-white">{m.language}</td>
                                    <td className="text-white">{m.director}</td>
                                    <td className="text-white">{m.cast}</td>
                                    <td className="text-white">{m.description}</td>
                                    <td className="text-white">
                                        <button onClick={() => handleEdit(i)} className="text-blue-500 mr-2">
                                            Sửa
                                        </button>
                                        <button onClick={() => handleDelete(i)} className="text-red-500">
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
                                    Bạn có chắc chắn muốn xóa phim này?
                                </p>
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
            <footer className="pt-32"><Bottom /></footer>
        </div>
    );
};

export default AddMovie;