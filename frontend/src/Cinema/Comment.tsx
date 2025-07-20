import React, { useState } from "react";
import { ChatBubbleLeftEllipsisIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";
import Nav from "../Header/nav";
import Bottom from "../Footer/bottom";

function Commnent() {
    const navigate = useNavigate();
    const handleshowtimes = () => {
        navigate("/showtimes");
    };
    const [showTrailer, setShowTrailer] = useState(false);
    const [trailerUrl, setTrailerUrl] = useState("");
    const [comments, setComments] = useState([
        { name: "Bạn", content: "Bộ phim này thật sự rất hay!" },
        { name: "Người dùng khác", content: "Tôi rất thích diễn xuất của các diễn viên." }
    ]);
    const [input, setInput] = useState("");

    const handleSubmit = () => {
        if (input.trim()) {
            setComments([...comments, { name: "Bạn", content: input }]);
            setInput("");
        }
    };
    const movieInfo = {
        name: "Úc Lan Oán Linh Giữ Của",
        genre: "Kinh dị",
        duration: 111,
        country: "Việt Nam",
        director: "Trần Trọng Dần",
        actors: "Quốc Trường, Mạc Văn Khoa,...",
        releaseDate: "20/06/2025",
        description: "Sau sự ra đi của cha, Lan (Phương Thanh) về một vùng quê và ở đợ cho nhà ông Danh (Mạc Văn Khoa)...",
        poster: "https://cinestar.com.vn/_next/image/?url=https%3A%2F%2Fapi-website.cinestar.com.vn%2Fmedia%2Fwysiwyg%2FPosters%2F06-2025%2Fut-lan-poster.jpg&w=3840&q=75",
        trailer: "https://www.youtube.com/watch?v=7kRzVm_umc0"
    };

    const trailerRawUrl = "https://www.youtube.com/watch?v=7kRzVm_umc0";

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

    return (
        <div className="min-h-screen bg-fixed w-full bg-cover bg-center top-0" style={{ backgroundImage: "url('https://images8.alphacoders.com/136/thumb-1920-1368754.jpeg')" }}>
            <div className="sticky top-0 z-50 bg-slate-900 shadow-md mb-4">
                <div className="max-w-screen-xl mx-auto px-8">
                    <Nav />
                </div>
            </div>

            <div className="flex flex-col items-center px-10">
                {/* Movie Info */}
                <div className="flex flex-col md:flex-row gap-6 mb-6 justify-center items-center">
                    <div>
                        <div>
                            <img src={movieInfo.poster} alt="Poster" className="w-full max-w-[400px] rounded-lg shadow-lg" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-yellow-400 mb-2 uppercase">{movieInfo.name}</h1>
                        <ul className="text-white mb-4">
                            <li><span className="text-yellow-400 font-bold">Thể loại:</span> <span className="pl-6">{movieInfo.genre}</span></li>
                            <li><span className="text-yellow-400 font-bold">Thời lượng:</span> <span className="pl-6">{movieInfo.duration}'</span></li>
                            <li><span className="text-yellow-400 font-bold">Quốc gia:</span> <span className="pl-6">{movieInfo.country}</span></li>
                            <li><span className="text-yellow-400 font-bold">Đạo diễn:</span> <span className="pl-6">{movieInfo.director}</span></li>
                            <li><span className="text-yellow-400 font-bold">Diễn viên:</span> <span className="pl-6">{movieInfo.actors}</span></li>
                            <li><span className="text-yellow-400 font-bold">Khởi chiếu:</span> <span className="pl-6">{movieInfo.releaseDate}</span></li>
                        </ul>
                        <p className="max-w-[600px] mb-4 text-white">{movieInfo.description}</p>
                        <div className="px-6 pt-6">
                            <button onClick={() => handleOpenTrailer(trailerRawUrl)}
                                className="p-3 rounded-full backdrop-blur-lg border border-red-500/20 bg-gradient-to-tr from-black/60 to-black/40 shadow-lg hover:shadow-2xl hover:shadow-red-500/30 hover:scale-110 hover:rotate-2 active:scale-95 active:rotate-0 transition-all duration-300 ease-out cursor-pointer group relative overflow-hidden">
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
                    </div>
                </div>
                <div className="w-full relative max-w-5xl px-5 py-5">
                    <div
                        onClick={(handleshowtimes)}
                        className="flex items-center gap-2 text-white text-lg font-bold mb-5 cursor-pointer hover:text-yellow-400 transition-colors duration-300">
                        <ChatBubbleLeftEllipsisIcon className="w-6 h-6 text-yellow-400" />
                        Bình luận
                    </div>

                    <div className="bg-gray-900 rounded-xl overflow-hidden mb-9">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Viết bình luận"
                            className="w-full bg-gray-900 text-white p-4 resize-none focus:outline-none"
                            rows={3}
                        ></textarea>
                        <div className="text-right p-3 flex justify-end items-end mr-5">
                            <button
                                onClick={handleSubmit}
                                type="submit"
                                className="flex items-center bg-yellow-500  gap-1 px-4 py-2 cursor-pointer text-gray-800 font-semibold tracking-widest rounded-md hover:bg-yellow-400 duration-300 hover:gap-2 hover:translate-x-3"
                            >
                                Send
                                <svg
                                    className="w-5 h-5"
                                    stroke="currentColor"
                                    stroke-width="1.5"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                                        stroke-linejoin="round"
                                        stroke-linecap="round"
                                    ></path>
                                </svg>
                            </button>
                        </div>
                    </div>

                    {comments.map((cmt, index) => (
                        <div
                            key={index}
                            className="bg-gray-600 text-white px-6 py-4 rounded-xl flex justify-between items-start mb-4"
                        >
                            <div>
                                <div className="font-semibold">{cmt.name}</div>
                                <div className="text-sm">{cmt.content}</div>
                            </div>
                            <div className="text-xl text-white">...</div>
                        </div>
                    ))}
                </div>
            </div>
            {/* Trailer Modal */}
            {showTrailer && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50" onClick={() => setShowTrailer(false)}>
                    <div className="relative w-full max-w-3xl aspect-video">
                        <iframe width="100%" height="100%" src={trailerUrl} title="Trailer" frameBorder="0" allowFullScreen />
                        <button onClick={() => setShowTrailer(false)} className="absolute top-2 right-2 text-white text-2xl">✕</button>
                    </div>
                </div>
            )}

            <footer className="mt-56">
                <Bottom />
            </footer>
        </div>
    );
}

export default Commnent;
