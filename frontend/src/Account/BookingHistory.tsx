import React from "react";

const BookingHistory = () => {
    const userEmail = localStorage.getItem("userEmail")
    const bookings = [
        {
            cinema: "1",
            room: "A2",
            movie: "Ngôi nhà ma ám",
            date: "11/07/2025",
            time: "20:00",
            status: "Đang chiếu",
        },
        {
            cinema: "1",
            room: "A3",
            movie: "Doraemon",
            date: "14/05/2025",
            time: "16:30",
            status: "Đang chiếu",
        },
        {
            cinema: "1",
            room: "A3",
            movie: "Doraemon",
            date: "14/05/2025",
            time: "16:30",
            status: "Đang chiếu",
        },
    ];

    return (
        <div className=" py-16 px-4 flex flex-col items-center">
            <h2 className="text-white uppercase text-3xl font-bold mb-8">Lịch sử đặt vé</h2>

            <div className="bg-white p-8 rounded-2xl w-full shadow-lg">
                <div className="mb-6 text-lg text-black font-medium">
                    Tên khách hàng: {userEmail}
                </div>
                <table className="w-full text-sm text-center border-collapse">
                    <thead>
                        <tr className="border-b border-black text-black font-semibold">
                            <th className="py-2">Rạp</th>
                            <th>Phòng</th>
                            <th>Tên phim</th>
                            <th>Ngày chiếu</th>
                            <th>Giờ chiếu</th>
                            <th>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((item, index) => (
                            <tr key={index} className="border-t border-black text-black">
                                <td className="py-2">{item.cinema}</td>
                                <td>{item.room}</td>
                                <td>{item.movie}</td>
                                <td>{item.date}</td>
                                <td>{item.time}</td>
                                <td>{item.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BookingHistory;
