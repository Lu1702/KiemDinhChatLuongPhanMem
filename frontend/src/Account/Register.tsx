import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Nav from '../Header/nav';
import Bottom from '../Footer/bottom';

function Register() {
    const navigate = useNavigate();
    const [startDate, setStartDate] = useState<Date | null>(null);

    const handleLogin = () => {
        navigate('/Login');
    };

    return (
        <div className="min-h-screen w-full bg-cover bg-center"
             style={{ backgroundImage: "url('https://images8.alphacoders.com/136/thumb-1920-1368754.jpeg')" }}>
            <div className="sticky top-0 z-50 shadow-xl bg-[url('https://th.bing.com/th/id/R.9e8b6083d2c56afe3e37c99a0d008551?rik=MgANzjo9WJbFrA&riu=http%3a%2f%2fgetwallpapers.com%2fwallpaper%2ffull%2f5%2f0%2f3%2f718692-amazing-dark-purple-backgrounds-1920x1200.jpg&ehk=QVn3JWJ991bU4NaIVD9w8hngTuAZ1AHehPjBWxqpDUE%3d&risl=&pid=ImgRaw&r=0')]">
                <header>
                    <div className="max-w-7xl mx-auto px-8">
                        <Nav />
                    </div>
                </header>
            </div>
            <div className="max-w-7xl mx-auto px-8 min-h-screen pt-24 flex justify-center items-center">
                <div
                    className="max-w-lg w-full bg-gradient-to-r from-blue-800 to-purple-600 rounded-xl shadow-2xl overflow-hidden p-10 space-y-8 animate-[slideInFromLeft_1s_ease-out]"
                >
                    <h2 className="text-center text-4xl font-extrabold text-white animate-[appear_2s_ease-out]">
                        Đăng ký
                    </h2>
                    <p className="text-center text-gray-200 animate-[appear_3s_ease-out]">
                        Tạo tài khoản của bạn
                    </p>
                    <form action="#" method="post" className="space-y-6">
                        <div className="relative">
                            <input
                                id="TenDN"
                                name="TenDN"
                                type="text"
                                placeholder="Tên đăng nhập"
                                className="peer h-12 w-full border-b-2 border-gray-300 text-white bg-transparent placeholder-transparent focus:outline-none focus:border-purple-500 text-lg"
                                required
                            />
                            <label
                                htmlFor="TenDN"
                                className="absolute left-0 -top-4 text-gray-500 text-base transition-all peer-placeholder-shown:text-lg peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-4 peer-focus:text-purple-500 peer-focus:text-base"
                            >
                                Tên đăng nhập
                            </label>
                        </div>
                        <div className="relative">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="email@example.com"
                                className="peer h-12 w-full border-b-2 border-gray-300 text-white bg-transparent placeholder-transparent focus:outline-none focus:border-purple-500 text-lg"
                                required
                            />
                            <label
                                htmlFor="email"
                                className="absolute left-0 -top-4 text-gray-500 text-base transition-all peer-placeholder-shown:text-lg peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-4 peer-focus:text-purple-500 peer-focus:text-base"
                            >
                                Địa chỉ Email
                            </label>
                        </div>
                        <div className="relative">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Mật khẩu"
                                className="peer h-12 w-full border-b-2 border-gray-300 text-white bg-transparent placeholder-transparent focus:outline-none focus:border-purple-500 text-lg"
                                required
                            />
                            <label
                                htmlFor="password"
                                className="absolute left-0 -top-4 text-gray-500 text-base transition-all peer-placeholder-shown:text-lg peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-4 peer-focus:text-purple-500 peer-focus:text-base"
                            >
                                Mật khẩu
                            </label>
                        </div>
                        <div className="relative">
                            <DatePicker
                                selected={startDate}
                                onChange={(date) => setStartDate(date)}
                                dateFormat="dd/MM/yyyy"
                                isClearable
                                showYearDropdown
                                scrollableMonthYearDropdown
                                placeholderText="Chọn ngày sinh của bạn 🎂"
                                className="peer h-12 w-full border-b-2 border-gray-300 text-white bg-transparent placeholder-transparent focus:outline-none focus:border-purple-500 text-lg"
                            />
                            <label
                                htmlFor="date"
                                className="absolute left-0 -top-4 text-gray-500 text-base transition-all peer-placeholder-shown:text-lg peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-4 peer-focus:text-purple-500 peer-focus:text-base"
                            >
                                Ngày sinh
                            </label>
                        </div>
                        <div className="relative">
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                maxLength={10}
                                pattern="[0-9]{10}"
                                placeholder="Số điện thoại"
                                className="peer h-12 w-full border-b-2 border-gray-300 text-white bg-transparent placeholder-transparent focus:outline-none focus:border-purple-500 text-lg"
                                required
                            />
                            <label
                                htmlFor="phone"
                                className="absolute left-0 -top-4 text-gray-500 text-base transition-all peer-placeholder-shown:text-lg peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-4 peer-focus:text-purple-500 peer-focus:text-base"
                            >
                                Số điện thoại
                            </label>
                        </div>
                        <div className="relative">
                            <input
                                id="TenKH"
                                name="TenKH"
                                type="text"
                                placeholder="Họ và tên"
                                className="peer h-12 w-full border-b-2 border-gray-300 text-white bg-transparent placeholder-transparent focus:outline-none focus:border-purple-500 text-lg"
                                required
                            />
                            <label
                                htmlFor="TenKH"
                                className="absolute left-0 -top-4 text-gray-500 text-base transition-all peer-placeholder-shown:text-lg peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-4 peer-focus:text-purple-500 peer-focus:text-base"
                            >
                                Họ và tên
                            </label>
                        </div>
                        <div className="relative">
                            <input
                                id="CCCD"
                                name="CCCD"
                                type="tel"
                                maxLength={12}
                                pattern="[0-9]{12}"
                                placeholder="Số Căn cước công dân"
                                className="peer h-12 w-full border-b-2 border-gray-300 text-white bg-transparent placeholder-transparent focus:outline-none focus:border-purple-500 text-lg"
                                required
                            />
                            <label
                                htmlFor="CCCD"
                                className="absolute left-0 -top-4 text-gray-500 text-base transition-all peer-placeholder-shown:text-lg peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-4 peer-focus:text-purple-500 peer-focus:text-base"
                            >
                                Số Căn cước công dân
                            </label>
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="flex items-center text-base text-gray-200">
                                <input
                                    id="agree"
                                    type="checkbox"
                                    className="form-checkbox h-5 w-5 text-purple-600 bg-gray-800 border-gray-300 rounded"
                                />
                                <span className="ml-2">Đồng ý với các điều khoản của Cinema</span>
                            </label>
                        </div>
                        <button
                            type="submit"
                            className="w-full py-3 px-4 bg-purple-500 hover:bg-purple-700 rounded-md shadow-lg text-white text-lg font-semibold transition duration-200"
                        >
                            Đăng ký
                        </button>
                    </form>
                    <div className="text-center text-gray-300 text-base">
                        Bạn đã có tài khoản?
                        <span
                            onClick={handleLogin}
                            className="text-purple-300 hover:underline cursor-pointer pl-2"
                        >
                            Đăng nhập
                        </span>
                    </div>
                </div>
            </div>
            <footer className="pt-32">
                <Bottom />
            </footer>
        </div>
    );
}

export default Register;