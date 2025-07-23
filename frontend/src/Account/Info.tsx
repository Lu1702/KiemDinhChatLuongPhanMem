import React, { useState } from "react";
import Nav from "../Header/nav";
import Bottom from "../Footer/bottom";
import { useNavigate } from "react-router-dom";
import BookingHistory from "./BookingHistory";

const Info: React.FC = () => {
    const userEmail = localStorage.getItem("userEmail");
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("userEmail");
        navigate("/login");
    };
    const handleaddmovie = () => {
        navigate('/Addmovie')
    }

    const [activeTab, setActiveTab] = useState<"info" | "history" | "password">("info");

    return (
        <div
            className="min-h-screen bg-fixed bg-cover bg-center"
            style={{
                backgroundImage:
                    "url('https://images8.alphacoders.com/136/thumb-1920-1368754.jpeg')",
            }}>
            <div className="sticky top-0 z-50 bg-slate-900 shadow-md mb-4">
                <div className="max-w-screen-xl mx-auto px-8">
                    <Nav />
                </div>
            </div>
            <div className="max-w-6xl mx-auto py-10 px-4 md:flex gap-8">
                {/* Sidebar */}
                <div className="sticky top-32 h-fit self-start bg-white/20 backdrop-blur-md p-4 rounded-xl w-full md:w-1/4 space-y-4 shadow-lg">
                    <button
                        className={`w-full px-4 py-2 rounded-lg text-left font-medium ${activeTab === "info"
                            ? "bg-yellow-300 text-black"
                            : "hover:bg-white/30 text-white"
                            }`}
                        onClick={() => setActiveTab("info")}>
                        Thông tin cá nhân
                    </button>
                    <button
                        className={`w-full px-4 py-2 rounded-lg text-left font-medium ${activeTab === "history"
                            ? "bg-yellow-300 text-black"
                            : "hover:bg-white/30 text-white"
                            }`}
                        onClick={() => setActiveTab("history")}>
                        Lịch sử đặt vé
                    </button>
                    <button
                        className={`w-full px-4 py-2 rounded-lg text-left font-medium ${activeTab === "password"
                            ? "bg-yellow-300 text-black"
                            : "hover:bg-white/30 text-white"
                            }`}
                        onClick={() => setActiveTab("password")}>
                        Đổi mật khẩu
                    </button>
                    <button
                        className={`w-full px-4 py-2 rounded-lg text-left font-medium ${activeTab === "history"
                            ? "bg-yellow-300 text-black"
                            : "hover:bg-white/30 text-white"
                            }`}
                        onClick={handleaddmovie}>
                        Lịch sử đặt vé
                    </button>
                </div>
                <div className="flex-1 space-y-8 mt-8 md:mt-0">
                    <h1 className="text-white text-3xl font-bold text-center uppercase">
                        Cinema xin chào! {userEmail}
                    </h1>
                    {activeTab === "info" && (
                        <div className="bg-[#f7eaff]/50 p-6 rounded-2xl shadow-xl">
                            <h2 className="text-2xl font-bold mb-6">Thông tin cá nhân</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block mb-2 font-semibold">Họ và tên:</label>
                                    <input type="text" className="w-full border rounded-md px-4 py-2 bg-white/50" />
                                </div>
                                <div>
                                    <label className="block mb-2 font-semibold">Ngày sinh:</label>
                                    <input type="date" className="w-full border rounded-md px-4 py-2 bg-white/50" />
                                </div>
                                <div>
                                    <label className="block mb-2 font-semibold">Email:</label>
                                    <input type="email" className="w-full border rounded-md px-4 py-2 bg-white/50" />
                                </div>
                                <div>
                                    <label className="block mb-2 font-semibold">Địa chỉ:</label>
                                    <input type="text" className="w-full border rounded-md px-4 py-2 bg-white/50" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block mb-2 font-semibold">CCCD:</label>
                                    <input type="number" className="w-full border rounded-md px-4 py-2 bg-white/50" />
                                </div>
                            </div>
                            <div className="mt-6 text-center">
                                <button className="bg-yellow-950 text-yellow-400 border border-yellow-400 border-b-4 font-medium overflow-hidden relative px-4 py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group">
                                    <span className="bg-yellow-400 shadow-yellow-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
                                    Lưu thông tin
                                </button>
                            </div>
                        </div>
                    )}
                    {activeTab === "history" && (
                        <div className="bg-[#f7eaff]/50 p-6 rounded-2xl shadow-xl">
                            <BookingHistory />
                        </div>
                    )}
                    {activeTab === "password" && (
                        <div className="bg-[#f7eaff]/50 p-6 rounded-2xl shadow-xl">
                            <h2 className="text-2xl font-bold mb-6">Đổi mật khẩu</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block mb-2 font-semibold">Mật khẩu cũ</label>
                                    <input type="password" className="w-full border rounded-md px-4 py-2 bg-white/50" />
                                </div>
                                <div>
                                    <label className="block mb-2 font-semibold">Mật khẩu mới</label>
                                    <input type="password" className="w-full border rounded-md px-4 py-2 bg-white/50" />
                                </div>
                                <div>
                                    <label className="block mb-2 font-semibold">Xác nhận mật khẩu mới</label>
                                    <input type="password" className="w-full border rounded-md px-4 py-2 bg-white/50" />
                                </div>
                            </div>
                            <div className="mt-6 text-center">
                                <button className="bg-yellow-950 text-yellow-400 border border-yellow-400 border-b-4 font-medium overflow-hidden relative px-4 py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group">
                                    <span className="bg-yellow-400 shadow-yellow-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
                                    Cập nhật mật khẩu
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex justify-center mt-10">
                <button
                    className="group flex items-center justify-start w-11 h-11 bg-red-600 rounded-full cursor-pointer relative overflow-hidden transition-all duration-200 shadow-lg hover:w-32 hover:rounded-lg active:translate-x-1 active:translate-y-1">
                    <div
                        className="flex items-center justify-center w-full transition-all duration-300 group-hover:justify-start group-hover:px-3">
                        <svg className="w-4 h-4" viewBox="0 0 512 512" fill="white">
                            <path
                                d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"
                            ></path>
                        </svg>
                    </div>
                    <div
                        onClick={handleLogout}
                        className=" absolute right-3 transform translate-x-full opacity-0 text-white text-lg font-semibold transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                        Đăng xuất
                    </div>
                </button>
            </div>
            <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="fixed bottom-6 right-6 z-50 px-4 py-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all border cursor-pointers">
                ↑
            </button>
            <div className="sticky mx-auto mt-28">
                <Bottom />
            </div>
        </div>
    );
};

export default Info;
