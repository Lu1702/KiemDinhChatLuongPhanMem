import React from "react";
import Nav from "../Header/nav";
import Bottom from "../Footer/bottom";
import { useLocation, useNavigate } from "react-router-dom";

export default function PaymentPage() {
    const navigate = useNavigate();
    const handleShowtimes = () => {
        navigate("/showtimes");
    }
    const location = useLocation();
    const ticketInfo = location.state || {};
    
    console.log(ticketInfo.time);

    return (
        <div className="min-h-screen bg-fixed w-full bg-cover bg-center top-0" style={{ backgroundImage: "url('https://images8.alphacoders.com/136/thumb-1920-1368754.jpeg')" }}>
            <div className="sticky top-0 z-50 bg-slate-900 shadow-md mb-28">
                <div className="max-w-screen-xl mx-auto px-8">
                    <Nav />
                </div>
            </div>
            <div className="flex flex-col lg:flex-row justify-center gap-10 items-start px-4">
                <div className="flex-1 max-w-md w-full">
                    <h2 className="text-3xl font-bold mb-6 text-center text-white">THANH TOÁN</h2>
                    <div className="flex flex-col gap-4">
                        <div className="relative group w-full">
                            <div
                                className="relative h-14 opacity-90 overflow-hidden rounded-xl bg-black z-10 w-full">
                                <div
                                    className="absolute z-10 -translate-x-44 group-hover:translate-x-[30rem] ease-in transistion-all duration-700 h-full w-44 bg-gradient-to-r from-gray-500 to-white/10 opacity-30 -skew-x-12">
                                </div>
                                <div
                                    className="absolute flex items-center justify-center text-white z-[1] opacity-90 rounded-2xl inset-0.5 bg-black w-full h-[90%]">
                                    <button
                                        name="text"
                                        className="input text-lg h-full opacity-90 w-full px-16 bg-black py-3 font-semibold rounded flex items-center justify-center gap-2 hover:opacity-90">
                                        <img src="https://stcd02206177151.cloud.edgevnpay.vn/assets/images/logo-icon/logo-primary.svg" alt="momo" className="w-24" />
                                        Thanh toán qua VNPay
                                    </button>
                                </div>
                                <div
                                    className="absolute duration-1000 group-hover:animate-spin w-full h-[100px] bg-gradient-to-r from-green-500 to-yellow-500 blur-[30px]">
                                </div>
                            </div>
                        </div>
                        <div onClick={handleShowtimes} className="relative group w-full gap-4 mt-6">
                            <button className="bg-gray-950 text-gray-400 border border-gray-400 border-b-4 font-medium overflow-hidden relative px-4 py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group">
                                <span className="bg-gray-400 shadow-gray-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
                                Quay lại
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex-1 max-w-md w-full">
    <h2 className="text-3xl font-bold mb-6 text-center text-white">THÔNG TIN VÉ XEM</h2>
    <div className="bg-white text-black rounded-xl p-6 shadow-lg space-y-3">
        {/* Thông tin người đặt và ngày đặt */}
        <p>Email người đặt: <span className="font-bold">{ticketInfo.email || ""}</span></p>
        <p>Ngày đặt: <span className="font-bold">{ticketInfo.bookingDate || ""}</span></p>

        <hr className="my-2 border-black" />

        {/* Thông tin vé */}
        <h3 className="font-bold text-lg uppercase">Thông tin vé</h3>
        <p><span className="font-bold">Tên phim:</span> {ticketInfo.movieName || "Tên phim"}</p>
        <p>Địa điểm: <span className="font-bold">{ticketInfo.location || ""}</span></p>
        <p>Phòng số: <span className="font-bold">{ticketInfo.roomNumber || ""}</span></p>
        <p>Định dạng hình ảnh: <span className="font-bold">{ticketInfo.imageFormat || ""}</span></p>
        <p>Ngày xem: <span className="font-bold">{ticketInfo.viewingDate || ""}</span></p>
        <p>Số ghế: <span className="font-bold">{ticketInfo.seats || ""}</span></p>
        <p>Loại vé: <span className="font-bold">{ticketInfo.ticketType || ""}</span></p>
        <p>Giờ xem: <span className="font-bold">{ticketInfo.viewingTime || ""}</span></p>
        <p>Giá vé: <span className="font-bold">{ticketInfo.ticketPrice || ""} VND</span></p>
        <p className="font-bold">Tổng giá vé: <span className="text-right block">{ticketInfo.totalTicketPrice?.toLocaleString() || "0"} VND</span></p>

        <hr className="my-2 border-black" />

        {/* Thông tin dịch vụ đi kèm */}
        <h3 className="font-bold text-lg uppercase">Thông tin dịch vụ</h3>
        <p>Dịch vụ đi kèm: <span className="font-bold">{ticketInfo.serviceName || ""}</span></p>
        <p>Số lượng: <span className="font-bold">{ticketInfo.serviceQuantity || ""}</span></p>
        <p>Đơn giá: <span className="font-bold">{ticketInfo.servicePrice || ""} VND</span></p>
        <p className="font-bold">Tổng giá dịch vụ: <span className="text-right block">{ticketInfo.totalServicePrice?.toLocaleString() || "0"} VND</span></p>

        <hr className="my-2 border-black" />

        {/* Tổng cộng */}
        <p className="font-bold text-lg">
            TỔNG CỘNG: <span className="text-right block">{ticketInfo.totalAmount?.toLocaleString() || "0"} VND</span>
        </p>
    </div>
</div>
            </div>
            <div className="mt-52">
                <Bottom />
            </div>
        </div>
    );
}
