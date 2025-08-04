import React from "react";
import logo from '../image/logocinema1.png';

function Bottom() {
    return (
        <footer className="relative text-center py-8 bg-black bg-opacity-90 text-gray-200 w-full overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
            <div className="relative flex flex-col justify-center items-center gap-8">
                <div className="flex flex-row items-center justify-center gap-8 flex-wrap">
                    <img
                        src={logo}
                        alt="Cinema Logo"
                        className="w-48 h-20 animate-pulse hover:scale-110 transition-transform duration-700 ease-in-out"
                    />
                    <ul className="flex flex-col items-center gap-4 font-cinzel text-sm tracking-wide ">
                        <li>
                            <a
                                className="relative underline hover:text-amber-300 transition-colors duration-300 before:content-[''] before:absolute before:bottom-0 before:left-0 before:w-0 before:h-[2px] before:bg-amber-300 before:transition-all before:duration-300 hover:before:w-full"
                                href="https://cinestar.com.vn/chinh-sach-bao-mat/"
                            >
                                Chính sách bảo mật
                            </a>
                        </li>
                        <li>
                            <a
                                className="relative underline hover:text-amber-300 transition-colors duration-300 before:content-[''] before:absolute before:bottom-0 before:left-0 before:w-0 before:h-[2px] before:bg-amber-300 before:transition-all before:duration-300 hover:before:w-full"
                                href="https://cinestar.com.vn/chinh-sach-bao-mat/"
                            >
                                Điều khoản sử dụng
                            </a>
                        </li>
                        <li>
                            <a
                                className="relative underline hover:text-amber-300 transition-colors duration-300 before:content-[''] before:absolute before:bottom-0 before:left-0 before:w-0 before:h-[2px] before:bg-amber-300 before:transition-all before:duration-300 hover:before:w-full"
                                href="https://cinestar.com.vn/chinh-sach-bao-mat/"
                            >
                                Chính sách khách hàng thường xuyên
                            </a>
                        </li>
                    </ul>
                    <ul className="space-y-4 font-cinzel text-sm tracking-wide pl-36">
                        <li>
                            <span className="text-amber-200 font-bold text-xl animate-pulse hover:scale-110 transition-transform duration-700 ease-in-out">CÔNG TY TNHH BỘ TỨ CINEMA VIỆT NAM</span>
                        </li>
                        <li>
                            <span className="text-gray-300">Giấy CNĐKDN: 9999999999, đăng ký lần đầu ngày 20/02/2002, cấp bởi Sở KHĐT Thành phố Hồ Chí Minh</span>
                        </li>
                        <li>
                            <span className="text-gray-300">Địa chỉ: Tầng 6, 828 Sư Vạn Hạnh, Phường Hòa Hưng, Thành phố Hồ Chí Minh, Việt Nam</span>
                        </li>
                        <li>
                            <span className="text-gray-300">Hotline: (028) 7777 8888</span>
                        </li>
                        <li>
                            <span className="text-gray-400 text-sm tracking-tight">COPYRIGHT © CINEMA.COM - ALL RIGHTS RESERVED.</span>
                        </li>
                    </ul>
                </div>

            </div>
        </footer>
    );
}

export default Bottom;