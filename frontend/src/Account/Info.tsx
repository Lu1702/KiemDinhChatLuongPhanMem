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

    const [userName, setUserName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState(''); // Định dạng YYYY-MM-DD từ input type="date"
    const [phoneNumber, setPhoneNumber] = useState('');

    // 2. Hàm xử lý khi người dùng click nút "Lưu thông tin"
    const handleChangeAccountInfo = async () => {
        setMessage1(''); // Xóa thông báo cũ

        // Kiểm tra cơ bản các trường không rỗng (có thể thêm validation phức tạp hơn)
        if (!userName || !dateOfBirth || !phoneNumber) {
            setMessage1('Vui lòng điền đầy đủ tất cả các trường thông tin.');
            return;
        }

        // Chuyển đổi dateOfBirth sang định dạng ISO 8601 (ví dụ: "2025-07-23T00:00:00.000Z")
        // Nếu dateOfBirth là chuỗi rỗng hoặc không hợp lệ, new Date() sẽ trả về Invalid Date
        // Nên cần kiểm tra trước khi gọi toISOString()
        let formattedDateOfBirth = null;
        try {
            const dateObj = new Date(dateOfBirth);
            if (!isNaN(dateObj.getTime())) { // Kiểm tra xem ngày có hợp lệ không
                formattedDateOfBirth = dateObj.toISOString();
            } else {
                setMessage1('Ngày sinh không hợp lệ. Vui lòng kiểm tra lại.');
                return;
            }
        } catch (error) {
            setMessage1('Lỗi định dạng ngày sinh. Vui lòng kiểm tra lại.');
            console.error('Date parsing error:', error);
            return;
        }

        // Tạo payload dữ liệu theo định dạng API yêu cầu
        const payload = {
            userName: userName,
            dateOfBirth: formattedDateOfBirth,
            phoneNumber: phoneNumber,
        };

        // URL API của bạn, sử dụng userID được truyền vào và Userid (chữ U viết hoa)
        const apiUrl = `http://localhost:5229/api/Account/ChangeAccountInformation?Userid=${localStorage.getItem('IDND')}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'accept': '*/*',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload), // Chuyển đổi payload thành chuỗi JSON
            });

            if (response.ok) {
                // API trả về thành công (status 2xx)
                // Có thể không cần đọc response.json() nếu API không trả về dữ liệu cụ thể
                setMessage1('Thông tin cá nhân đã được cập nhật thành công!');
                console.log('API Response: Thông tin đã được cập nhật.');
                // Giữ lại giá trị trong form hoặc reset tùy ý
            } else {
                // API trả về lỗi (status 4xx, 5xx)
                const errorData = await response.json(); // Thử đọc lỗi dưới dạng JSON
                setMessage1(`Lỗi: ${errorData.message || 'Có lỗi xảy ra khi cập nhật thông tin.'}`);
                console.error('API Error:', response.status, errorData);
            }
        } catch (error) {
            // Lỗi mạng hoặc lỗi không xác định
            setMessage1('Đã xảy ra lỗi kết nối. Vui lòng thử lại sau.');
            console.error('Network or unexpected error:', error);
        }
    };
    const [activeTab, setActiveTab] = useState<"info" | "history" | "password">("info");

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Đã đổi tên biến trạng thái và hàm cập nhật
    const [message1, setMessage1] = useState(''); 

    const handleChangePassword = async () => {
        setMessage1(''); // Xóa thông báo cũ

        if (newPassword !== confirmPassword) {
            setMessage1('Mật khẩu mới và xác nhận mật khẩu không khớp!');
            return;
        }

        const payload = {
            oldPassword: oldPassword,
            newPassword: newPassword,
            confirmPassword: confirmPassword,
        };

        const apiUrl = `http://localhost:5229/api/Account/changePassword?userID=${localStorage.getItem('IDND')}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'accept': '*/*',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                setMessage1('Mật khẩu đã được cập nhật thành công!');
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
                console.log('API Response:', await response.json());
            } else {
                const errorData = await response.json();
                setMessage1(`Lỗi: ${errorData.message || 'Có lỗi xảy ra khi đổi mật khẩu.'}`);
                console.error('API Error:', response.status, errorData);
            }
        } catch (error) {
            setMessage1('Đã xảy ra lỗi kết nối. Vui lòng thử lại sau.');
            console.error('Network or unexpected error:', error);
        }
    };
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
                    {/* Input Họ và tên (userName) */}
                    <div>
                        <label className="block mb-2 font-semibold">Họ và tên:</label>
                        <input
                            type="text"
                            className="w-full border rounded-md px-4 py-2 bg-white/50"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                        />
                    </div>
                    {/* Input Ngày sinh (dateOfBirth) */}
                    <div>
                        <label className="block mb-2 font-semibold">Ngày sinh:</label>
                        <input
                            type="date"
                            className="w-full border rounded-md px-4 py-2 bg-white/50"
                            value={dateOfBirth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                        />
                    </div>
                    {/* Input Số điện thoại (phoneNumber) - Đã thêm mới */}
                    <div>
                        <label className="block mb-2 font-semibold">Số điện thoại:</label>
                        <input
                            type="tel" // Sử dụng type="tel" cho số điện thoại
                            className="w-full border rounded-md px-4 py-2 bg-white/50"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                    </div>
                    {/* Các input Email, Địa chỉ, CCCD đã được xóa bỏ */}
                </div>
                {/* Hiển thị thông báo */}
                {message1 && (
                    <p className={`mt-4 text-center font-semibold ${message1.includes('Lỗi:') ? 'text-red-500' : 'text-green-600'}`}>
                        {message1}
                    </p>
                )}
                <div className="mt-6 text-center">
                    <button
                        className="bg-yellow-950 text-yellow-400 border border-yellow-400 border-b-4 font-medium overflow-hidden relative px-4 py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group"
                        onClick={handleChangeAccountInfo} // Gắn hàm xử lý vào đây
                    >
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
                        <input
                            type="password"
                            className="w-full border rounded-md px-4 py-2 bg-white/50"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block mb-2 font-semibold">Mật khẩu mới</label>
                        <input
                            type="password"
                            className="w-full border rounded-md px-4 py-2 bg-white/50"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block mb-2 font-semibold">Xác nhận mật khẩu mới</label>
                        <input
                            type="password"
                            className="w-full border rounded-md px-4 py-2 bg-white/50"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                </div>
                {/* Đã sử dụng biến mới message1 để hiển thị */}
                {message1 && (
                    <p className={`mt-4 text-center font-semibold ${message1.includes('Lỗi:') ? 'text-red-500' : 'text-green-600'}`}>
                        {message1}
                    </p>
                )}
                <div className="mt-6 text-center">
                    <button
                        className="bg-yellow-950 text-yellow-400 border border-yellow-400 border-b-4 font-medium overflow-hidden relative px-4 py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group"
                        onClick={handleChangePassword}
                    >
                        <span className="bg-yellow-400 shadow-yellow-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>Cập nhật mật khẩu
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
