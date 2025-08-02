import React from "react";
import { useNavigate } from "react-router-dom";
import Nav from "../Header/nav";
import Bottom from "../Footer/bottom";

function Forgotpassword() {
    const navigate = useNavigate();

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
            <div className="max-w-7xl mx-auto px-8 min-h-screen flex justify-center items-center">
                <div
                    className="max-w-lg w-full bg-gradient-to-r from-blue-800 to-purple-600 rounded-xl shadow-2xl overflow-hidden p-10 space-y-8 animate-[slideInFromLeft_1s_ease-out]"
                >
                    <div className="flex justify-start w-full">
                        <button
                            onClick={handleLogin}
                            className="cursor-pointer transition-transform duration-200 hover:scale-125 active:scale-100"
                            title="Go Back"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="50px"
                                height="50px"
                                viewBox="0 0 24 24"
                                className="stroke-purple-300"
                            >
                                <path
                                    strokeLinejoin="round"
                                    strokeLinecap="round"
                                    strokeWidth="1.5"
                                    d="M11 6L5 12M5 12L11 18M5 12H19"
                                ></path>
                            </svg>
                        </button>
                    </div>
                    <h2 className="text-center text-4xl font-extrabold text-white animate-[appear_2s_ease-out]">
                        Quên mật khẩu
                    </h2>
                    <p className="text-center text-gray-200 animate-[appear_3s_ease-out]">
                        -- Nhập email của bạn vào đây nha ☺️ --
                    </p>
                    <form action="#" method="post" className="space-y-6">
                        <div className="relative">
                            <input
                                id="resetpass"
                                name="resetpass"
                                type="email"
                                placeholder="email@example.com"
                                className="peer h-12 w-full border-b-2 border-gray-300 text-white bg-transparent placeholder-transparent focus:outline-none focus:border-purple-500 text-lg"
                                required
                            />
                            <label
                                htmlFor="resetpass"
                                className="absolute left-0 -top-4 text-gray-500 text-base transition-all peer-placeholder-shown:text-lg peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-4 peer-focus:text-purple-500 peer-focus:text-base"
                            >
                                Địa chỉ Email
                            </label>
                        </div>
                        <button
                            type="submit"
                            onClick={handleLogin}
                            className="w-full py-3 px-4 bg-purple-500 hover:bg-purple-700 rounded-md shadow-lg text-white text-lg font-semibold transition duration-200 uppercase"
                        >
                            Thay đổi mật khẩu
                        </button>
                    </form>
                </div>
            </div>
            <footer className="pt-32">
                <Bottom />
            </footer>
        </div>
    );
}

export default Forgotpassword;