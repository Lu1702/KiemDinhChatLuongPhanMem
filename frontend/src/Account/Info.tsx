import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Nav from "../Header/nav";
import Bottom from "../Footer/bottom";
import BookingHistory from "./BookingHistory";

const Info: React.FC = () => {
    const userEmail = localStorage.getItem("userEmail");
    const navigate = useNavigate();

    const [userName, setUserName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message1, setMessage1] = useState('');
    const [activeTab, setActiveTab] = useState<"info" | "history" | "password">("info");
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem("userEmail");
        navigate("/login");
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleChangeAccountInfo = async () => {
        setMessage1('');
        setShowModal(false);
        setLoading(true);

        if (!userName || !dateOfBirth || !phoneNumber) {
            setMessage1("Vui lòng nhập đầy đủ tất cả các trường!");
            setShowModal(true);
            setLoading(false);
            return;
        }

        if (!/^[0-9]{10}$/.test(phoneNumber)) {
            setMessage1("Số điện thoại phải có đúng 10 chữ số!");
            setShowModal(true);
            setLoading(false);
            return;
        }

        const payload = {
            userName,
            dateOfBirth: dateOfBirth.toISOString(),
            phoneNumber,
        };

        const apiUrl = `http://localhost:5229/api/Account/ChangeAccountInformation?Userid=${localStorage.getItem('IDND')}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'accept': '*/*',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (data.status === "Success") {
                setMessage1(data.message || "Cập nhật thông tin thành công!");
                setShowModal(true);
            } else {
                setMessage1(data.message || "Cập nhật thông tin thất bại. Vui lòng kiểm tra lại thông tin.");
                setShowModal(true);
            }
        } catch (error) {
            console.error("Lỗi cập nhật thông tin:", error);
            setMessage1("Đã xảy ra lỗi khi kết nối đến máy chủ. Vui lòng thử lại sau.");
            setShowModal(true);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        setMessage1('');

        if (newPassword !== confirmPassword) {
            setMessage1('Mật khẩu mới và xác nhận mật khẩu không khớp!');
            return;
        }

        const payload = {
            oldPassword,
            newPassword,
            confirmPassword,
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
        <div className="min-h-screen w-full bg-cover bg-center"
            style={{ backgroundImage: "url('https://images8.alphacoders.com/136/thumb-1920-1368754.jpeg')" }}>
            <div className="sticky top-0 z-50 bg-gradient-to-r from-gray-800 to-gray-900 shadow-xl">
                <div className="max-w-6xl mx-auto px-8">
                    <Nav />
                </div>
            </div>
            <div className="max-w-6xl mx-auto py-10 px-4 md:flex gap-8 sticky">
                <div className="sticky top-24 h-fit self-start bg-gradient-to-b from-gray-800 to-gray-900 p-4 rounded-xl w-full md:w-1/4 space-y-4 shadow-xl border border-yellow-500/30">
                    <button
                        className={`w-full px-4 py-3 rounded-lg text-left font-semibold text-lg transition-all duration-200 ${activeTab === "info"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "text-gray-200 hover:bg-gray-700"
                            }`}
                        onClick={() => setActiveTab("info")}>
                        Thông tin cá nhân
                    </button>
                    <button
                        className={`w-full px-4 py-3 rounded-lg text-left font-semibold text-lg transition-all duration-200 ${activeTab === "history"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "text-gray-200 hover:bg-gray-700"
                            }`}
                        onClick={() => setActiveTab("history")}>
                        Lịch sử đặt vé
                    </button>
                    <button
                        className={`w-full px-4 py-3 rounded-lg text-left font-semibold text-lg transition-all duration-200 ${activeTab === "password"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "text-gray-200 hover:bg-gray-700"
                            }`}
                        onClick={() => setActiveTab("password")}>
                        Đổi mật khẩu
                    </button>
                </div>
                <div className="flex-1 space-y-8 mt-8 md:mt-0">
                    <h1 className="text-yellow-400 text-4xl font-extrabold text-center uppercase tracking-wide">
                        Cinema xin chào! {userEmail}
                    </h1>
                    {activeTab === "info" && (
                        <div className="max-w-4xl mx-auto bg-gray-800/80 rounded-xl shadow-xl p-8 border border-yellow-500/30">
                            <h2 className="text-center text-3xl font-extrabold text-yellow-400 mb-6 tracking-wide">
                                Cập nhật thông tin cá nhân
                            </h2>
                            <p className="text-center text-gray-300 mb-8">
                                Thay đổi thông tin tài khoản của bạn
                            </p>
                            <form onSubmit={(e) => { e.preventDefault(); handleChangeAccountInfo(); }} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="relative">
                                        <input
                                            id="userName"
                                            name="userName"
                                            type="text"
                                            placeholder=""
                                            value={userName}
                                            onChange={(e) => setUserName(e.target.value)}
                                            disabled={loading}
                                            className="peer w-full px-4 py-3 border-b-2 border-gray-700 bg-transparent text-gray-200 placeholder-gray-400 focus:outline-none focus:border-yellow-500 rounded-md text-lg transition-all duration-200"
                                            required
                                        />
                                        <label
                                            htmlFor="userName"
                                            className="absolute left-4 -top-2 text-gray-300 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2 peer-focus:text-yellow-400"
                                        >
                                            Họ và tên
                                        </label>
                                    </div>
                                    <div className="relative">
                                        <DatePicker
                                            selected={dateOfBirth}
                                            onChange={(date: Date | null) => setDateOfBirth(date)}
                                            dateFormat="dd/MM/yyyy"
                                            isClearable
                                            showYearDropdown
                                            scrollableMonthYearDropdown
                                            placeholderText="Chọn ngày sinh"
                                            className="peer w-full px-4 py-3 border-b-2 border-gray-700 bg-transparent text-gray-200 placeholder-gray-400 focus:outline-none focus:border-yellow-500 rounded-md text-lg transition-all duration-200"
                                            disabled={loading}
                                        />
                                        <label
                                            htmlFor="date"
                                            className="absolute left-4 -top-2 text-gray-300 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2 peer-focus:text-yellow-400"
                                        >
                                            Ngày sinh
                                        </label>
                                    </div>
                                    <div className="relative md:col-span-2">
                                        <input
                                            id="phoneNumber"
                                            name="phoneNumber"
                                            type="tel"
                                            maxLength={10}
                                            pattern="[0-9]{10}"
                                            placeholder=""
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            disabled={loading}
                                            className="peer w-full px-4 py-3 border-b-2 border-gray-700 bg-transparent text-gray-200 placeholder-gray-400 focus:outline-none focus:border-yellow-500 rounded-md text-lg transition-all duration-200"
                                            required
                                        />
                                        <label
                                            htmlFor="phoneNumber"
                                            className="absolute left-4 -top-2 text-gray-300 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2 peer-focus:text-yellow-400"
                                        >
                                            Số điện thoại
                                        </label>
                                    </div>
                                </div>
                                <div className="flex justify-center items-center">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="relative cursor-pointer py-4 px-8 text-center font-barlow inline-flex justify-center text-base uppercase text-white rounded-lg border-solid transition-transform duration-300 ease-in-out group outline-offset-4 focus:outline focus:outline-2 focus:outline-white focus:outline-offset-4 overflow-hidden"
                                    >
                                        {loading ? (
                                            <div className="flex flex-row gap-2">
                                                <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce"></div>
                                                <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce [animation-delay:-.3s]"></div>
                                                <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce [animation-delay:-.5s]"></div>
                                            </div>
                                        ) : (
                                            'Cập nhật thông tin'
                                        )}
                                        <span
                                            className="absolute left-[-75%] top-0 h-full w-[50%] bg-white/20 rotate-12 z-10 blur-lg group-hover:left-[125%] transition-all duration-1000 ease-in-out"
                                        ></span>
                                        <span
                                            className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#D4EDF9] absolute h-[20%] rounded-tl-lg border-l-2 border-t-2 top-0 left-0"
                                        ></span>
                                        <span
                                            className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#D4EDF9] absolute group-hover:h-[90%] h-[60%] rounded-tr-lg border-r-2 border-t-2 top-0 right-0"
                                        ></span>
                                        <span
                                            className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#D4EDF9] absolute h-[60%] group-hover:h-[90%] rounded-bl-lg border-l-2 border-b-2 left-0 bottom-0"
                                        ></span>
                                        <span
                                            className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#D4EDF9] absolute h-[20%] rounded-br-lg border-r-2 border-b-2 right-0 bottom-0"
                                        ></span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                    {activeTab === "history" && (
                        <div>
                            <BookingHistory />
                        </div>
                    )}
                    {activeTab === "password" && (
                        <div className="max-w-4xl mx-auto bg-gray-800/80 rounded-xl shadow-xl p-8 border border-yellow-500/30">
                            <h2 className="text-2xl font-extrabold text-yellow-400 mb-6 text-center tracking-wide">
                                Đổi mật khẩu
                            </h2>
                            <div className="space-y-6">
                                <div className="relative">
                                    <input
                                        type="password"
                                        className="peer w-full px-4 py-3 border-b-2 border-gray-700 bg-transparent text-gray-200 placeholder-gray-400 focus:outline-none focus:border-yellow-500 rounded-md text-lg transition-all duration-200"
                                        placeholder=""
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                    />
                                    <label
                                        className="absolute left-4 -top-2 text-gray-300 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2 peer-focus:text-yellow-400"
                                    >
                                        Mật khẩu cũ
                                    </label>
                                </div>
                                <div className="relative">
                                    <input
                                        type="password"
                                        className="peer w-full px-4 py-3 border-b-2 border-gray-700 bg-transparent text-gray-200 placeholder-gray-400 focus:outline-none focus:border-yellow-500 rounded-md text-lg transition-all duration-200"
                                        placeholder=""
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                    <label
                                        className="absolute left-4 -top-2 text-gray-300 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2 peer-focus:text-yellow-400"
                                    >
                                        Mật khẩu mới
                                    </label>
                                </div>
                                <div className="relative">
                                    <input
                                        type="password"
                                        className="peer w-full px-4 py-3 border-b-2 border-gray-700 bg-transparent text-gray-200 placeholder-gray-400 focus:outline-none focus:border-yellow-500 rounded-md text-lg transition-all duration-200"
                                        placeholder=""
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                    <label
                                        className="absolute left-4 -top-2 text-gray-300 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2 peer-focus:text-yellow-400"
                                    >
                                        Xác nhận mật khẩu mới
                                    </label>
                                </div>
                                {message1 && (
                                    <p
                                        className={`text-center font-semibold text-lg ${message1.includes('Lỗi:') ? 'text-red-500' : 'text-green-400'
                                            }`}
                                    >
                                        {message1}
                                    </p>
                                )}
                                <div className="flex justify-center">
                                    <button
                                        onClick={handleChangePassword}
                                        type="submit"
                                        disabled={loading}
                                        className="relative cursor-pointer py-4 px-8 text-center font-barlow inline-flex justify-center text-base uppercase text-white rounded-lg border-solid transition-transform duration-300 ease-in-out group outline-offset-4 focus:outline focus:outline-2 focus:outline-white focus:outline-offset-4 overflow-hidden"
                                    >
                                        {loading ? (
                                            'Đang cập nhật mật khẩu...'
                                        ) : (
                                            'Cập nhật mật khẩu'
                                        )}
                                        <span
                                            className="absolute left-[-75%] top-0 h-full w-[50%] bg-white/20 rotate-12 z-10 blur-lg group-hover:left-[125%] transition-all duration-1000 ease-in-out"
                                        ></span>
                                        <span
                                            className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#D4EDF9] absolute h-[20%] rounded-tl-lg border-l-2 border-t-2 top-0 left-0"
                                        ></span>
                                        <span
                                            className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#D4EDF9] absolute group-hover:h-[90%] h-[60%] rounded-tr-lg border-r-2 border-t-2 top-0 right-0"
                                        ></span>
                                        <span
                                            className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#D4EDF9] absolute h-[60%] group-hover:h-[90%] rounded-bl-lg border-l-2 border-b-2 left-0 bottom-0"
                                        ></span>
                                        <span
                                            className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#D4EDF9] absolute h-[20%] rounded-br-lg border-r-2 border-b-2 right-0 bottom-0"
                                        ></span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex justify-center mt-10">
                <button
                    className="group flex items-center justify-start w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full cursor-pointer relative overflow-hidden transition-all duration-200 shadow-lg hover:w-32 hover:rounded-lg active:translate-x-1 active:translate-y-1"
                    onClick={handleLogout}
                >
                    <div className="flex items-center justify-center w-full transition-all duration-300 group-hover:justify-start group-hover:px-3">
                        <svg className="w-5 h-5" viewBox="0 0 512 512" fill="white">
                            <path
                                d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"
                            ></path>
                        </svg>
                    </div>
                    <div className="absolute right-3 transform translate-x-full opacity-0 text-white text-lg font-semibold transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                        Đăng xuất
                    </div>
                </button>
            </div>
            <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="fixed bottom-6 right-6 z-50 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 border"
            >
                ↑
            </button>
            <div className="mt-28 bg-gradient-to-r from-gray-800 to-gray-900">
                <Bottom />
            </div>
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 transition-opacity duration-300">
                    <div className="max-w-lg w-full bg-gradient-to-b from-gray-900 to-gray-800 rounded-xl shadow-2xl p-8 border border-yellow-500/30">
                        <p className="text-xl font-semibold text-gray-200 text-center">{message1}</p>
                        <div className="mt-6 flex justify-center">
                            <button
                                onClick={handleCloseModal}
                                className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 font-semibold rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 shadow-md"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Info;