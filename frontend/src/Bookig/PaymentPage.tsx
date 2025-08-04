import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from '../Header/nav';
import Bottom from '../Footer/bottom';

// Define interfaces for payment data
interface FoodRequestDTO {
    foodID: string;
    quantity: number;
    foodName?: string;
    foodPrice?: number;
}

interface SeatRequestDTO {
    seatID: string;
    seatsNumber?: string;
}

interface UserTypeRequestDTO {
    userTypeID: string;
    quantity: number;
    seatsList: SeatRequestDTO[];
    userTypeName?: string;
    price?: number;
}

interface BookingDetails {
    userId: string;
    movieScheduleId: string;
    foodRequestDTOs: FoodRequestDTO[];
    userTypeRequestDTO: UserTypeRequestDTO[];
    movieName?: string;
    cinemaName?: string;
    showTime?: string;
    showDate?: string;
    roomNumber?: number;
    totalPrice?: number;
}

const Payment: React.FC = () => {
    const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [paymentProcessing, setPaymentProcessing] = useState<boolean>(false);
    const navigate = useNavigate();

    const handlelistfilm = () => {
        navigate('/listfilm')
    }

    useEffect(() => {
        // Retrieve booking details from localStorage
        const storedBooking = localStorage.getItem('bookingDetails');
        if (storedBooking) {
            setBookingDetails(JSON.parse(storedBooking));
        } else {
            setError('Không tìm thấy thông tin đặt vé.');
        }
        setLoading(false);
    }, []);

    const handleConfirmPayment = async () => {
        if (!bookingDetails) {
            setError('Không có thông tin đặt vé để xử lý thanh toán.');
            return;
        }

        setPaymentProcessing(true);
        setError(null);

        var respondInfoBookingString = localStorage.getItem("respondInfoBooking");

        if (respondInfoBookingString) {
            try {
                // Chuyển đổi chuỗi JSON thành đối tượng JavaScript
                const respondInfoBooking = JSON.parse(respondInfoBookingString);

                // Bây giờ bạn có thể truy cập thuộc tính 'data'
                const vnpayURL = respondInfoBooking.data.vnpayInfo.VnpayURL;

                window.location.href = vnpayURL

                // ... Các logic khác để hiển thị modal của bạn ...

            } catch (e) {
                console.error("Lỗi khi phân tích cú pháp JSON từ localStorage:", e);
            }
        } else {
            console.log("Không tìm thấy 'respondInfoBooking' trong localStorage.");
        }
    };

    const calculateTotalPrice = () => {
        if (!bookingDetails) return 0;

        let total = 0;
        // Calculate ticket price
        bookingDetails.userTypeRequestDTO.forEach(type => {
            if (type.price) {
                total += type.quantity * type.price;
            }
        });
        // Calculate food price
        bookingDetails.foodRequestDTOs.forEach(food => {
            if (food.foodPrice) {
                total += food.quantity * food.foodPrice;
            }
        });
        return total;
    };

    return (
        <div className="flex flex-col min-h-screen bg-fixed w-full bg-cover bg-center"
            style={{ backgroundImage: "url('https://images8.alphacoders.com/136/thumb-1920-1368754.jpeg')" }}>
            <div className="sticky top-0 z-50 bg-slate-950 shadow-md">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-8">
                    <Nav />
                </div>
            </div>
            <main className="flex-grow flex flex-col items-center">
                <div className="flex-1 max-w-md w-full">
                    {loading && (
                        <div className="flex-col gap-4 w-full flex items-center justify-center">
                            <div className="w-20 h-20 border-4 border-transparent text-blue-400 text-4xl animate-spin flex items-center justify-center border-t-blue-400 rounded-full">
                                <div className="w-16 h-16 border-4 border-transparent text-red-400 text-2xl animate-spin flex items-center justify-center border-t-red-400 rounded-full"></div>
                            </div>
                        </div>
                    )}
                    {error && (
                        <div className="text-red-500 text-center p-4">{error}</div>
                    )}
                    {bookingDetails && (
                        <div className="p-4 text-white">
                            <h1 className="text-3xl font-bold text-yellow-400 mb-6 text-center">Xác nhận thanh toán</h1>
                            <div className="bg-white/10 p-6 rounded-md max-w-screen-md mx-auto">
                                <h2 className="text-xl font-semibold mb-4 border-b pb-4 border-black">Thông tin đặt vé</h2>
                                <div className="space-y-4">
                                    <p><span className="font-bold text-yellow-400">Phim:</span> {bookingDetails.movieName}</p>
                                    <p><span className="font-bold text-yellow-400">Rạp:</span> {bookingDetails.cinemaName}</p>
                                    <p><span className="font-bold text-yellow-400">Suất chiếu:</span> {bookingDetails.showTime} - {new Date(bookingDetails.showDate || '').toLocaleDateString('vi-VN')}</p>
                                    <p><span className="font-bold text-yellow-400">Phòng chiếu:</span> {bookingDetails.roomNumber}</p>

                                    <h3 className="font-semibold text-lg mt-4">Vé đã chọn</h3>
                                    {bookingDetails.userTypeRequestDTO.map((type, index) => (
                                        <div key={index} className="flex justify-between">
                                            <span>{type.userTypeName} x {type.quantity} (Ghế: {type.seatsList.map(seat => seat.seatsNumber).join(', ')})</span>
                                            <span>{(type.quantity * (type.price || 0)).toLocaleString('vi-VN')} VNĐ</span>
                                        </div>
                                    ))}

                                    <h3 className="font-semibold text-lg mt-4">Đồ ăn & thức uống</h3>
                                    {bookingDetails.foodRequestDTOs.length > 0 ? (
                                        bookingDetails.foodRequestDTOs.map((food, index) => (
                                            food.quantity > 0 && (
                                                <div key={index} className="flex justify-between">
                                                    <span>{food.foodName} x {food.quantity}</span>
                                                    <span>{(food.quantity * (food.foodPrice || 0)).toLocaleString('vi-VN')} VNĐ</span>
                                                </div>
                                            )
                                        ))
                                    ) : (
                                        <p>Không có đồ ăn/thức uống được chọn</p>
                                    )}

                                    <div className="border-t border-gray-600 pt-4 mt-4">
                                        <div className="flex justify-between font-bold text-lg text-yellow-400">
                                            <span>Tổng cộng:</span>
                                            <span>{calculateTotalPrice().toLocaleString('vi-VN')} VNĐ</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
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
                                        onClick={handleConfirmPayment}
                                        disabled={paymentProcessing}
                                        className="input text-lg h-full opacity-90 w-full px-16 bg-black py-3 font-semibold rounded flex items-center justify-center gap-2 hover:opacity-90 disabled:cursor-not-allowed">
                                        <img src="https://stcd02206177151.cloud.edgevnpay.vn/assets/images/logo-icon/logo-primary.svg" alt="vnpay" className="w-24" />
                                        Thanh toán qua VNPay
                                    </button>
                                </div>
                                <div
                                    className="absolute duration-1000 group-hover:animate-spin w-full h-[100px] bg-gradient-to-r from-green-500 to-yellow-500 blur-[30px]">
                                </div>
                            </div>
                        </div>
                        <div className="relative group w-full gap-4 mt-6">
                            <button onClick={handlelistfilm} className="bg-gray-950 text-gray-400 border border-gray-400 border-b-4 font-medium overflow-hidden relative px-4 py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group">
                                <span className="bg-gray-400 shadow-gray-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
                                Quay lại
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            <footer>
                <Bottom />
            </footer>
        </div>
    );
};

export default Payment;
