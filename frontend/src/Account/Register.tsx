import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Nav from '../Header/nav';
import Bottom from '../Footer/bottom';

function Register() {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rePassword, setRePassword] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [identityCode, setIdentityCode] = useState('');
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const handleLogin = () => {
        navigate('/Login');
    };

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setModalMessage('');
        setShowModal(false);
        setIsSuccess(false);

        // Validate inputs
        if (!userName || !email || !password || !rePassword || !dateOfBirth || !phoneNumber || !identityCode) {
            setModalMessage("Vui lòng nhập đầy đủ tất cả các trường!");
            setShowModal(true);
            setLoading(false);
            return;
        }

        if (password !== rePassword) {
            setModalMessage("Mật khẩu và xác nhận mật khẩu không khớp!");
            setShowModal(true);
            setLoading(false);
            return;
        }

        if (!agreeTerms) {
            setModalMessage("Vui lòng đồng ý với các điều khoản của Cinema!");
            setShowModal(true);
            setLoading(false);
            return;
        }

        // Validate phone number (10 digits)
        if (!/^[0-9]{10}$/.test(phoneNumber)) {
            setModalMessage("Số điện thoại phải có đúng 10 chữ số!");
            setShowModal(true);
            setLoading(false);
            return;
        }

        // Validate identity code (12 digits)
        if (!/^[0-9]{12}$/.test(identityCode)) {
            setModalMessage("Số Căn cước công dân phải có đúng 12 chữ số!");
            setShowModal(true);
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:5229/api/Auth/register', {
                method: 'POST',
                headers: {
                    'accept': '*/*',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    loginEmail: email,
                    loginUserPassword: password,
                    reLoginUserPassword: rePassword,
                    dateOfBirth: dateOfBirth.toISOString(),
                    phoneNumber: phoneNumber,
                    userName: userName,
                    identityCode: identityCode
                }),
            });

            const data = await response.json();

            if (response.status === 201) {
                setModalMessage(data.message || "Đăng ký thành công!");
                setShowModal(true);
                setIsSuccess(true); // Mark as success for modal close redirect
            } else {
                setModalMessage(data.message || "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.");
                setShowModal(true);
            }
        } catch (error) {
            console.error("Lỗi đăng ký:", error);
            setModalMessage("Đã xảy ra lỗi khi kết nối đến máy chủ. Vui lòng thử lại sau.");
            setShowModal(true);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        if (isSuccess) {
            navigate('/Login'); // Redirect to /Login only on success
        }
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
                    <form onSubmit={handleRegister} className="space-y-6">
                        <div className="relative">
                            <input
                                id="userName"
                                name="userName"
                                type="text"
                                placeholder="Tên đăng nhập"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                disabled={loading}
                                className="peer h-12 w-full border-b-2 border-gray-300 text-white bg-transparent placeholder-transparent focus:outline-none focus:border-purple-500 text-lg"
                                required
                            />
                            <label
                                htmlFor="userName"
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
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
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
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
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
                            <input
                                id="rePassword"
                                name="rePassword"
                                type="password"
                                placeholder="Xác nhận mật khẩu"
                                value={rePassword}
                                onChange={(e) => setRePassword(e.target.value)}
                                disabled={loading}
                                className="peer h-12 w-full border-b-2 border-gray-300 text-white bg-transparent placeholder-transparent focus:outline-none focus:border-purple-500 text-lg"
                                required
                            />
                            <label
                                htmlFor="rePassword"
                                className="absolute left-0 -top-4 text-gray-500 text-base transition-all peer-placeholder-shown:text-lg peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-4 peer-focus:text-purple-500 peer-focus:text-base"
                            >
                                Xác nhận mật khẩu
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
                                placeholderText="Chọn ngày sinh của bạn 🎂"
                                className="peer h-12 w-full border-b-2 border-gray-300 text-white bg-transparent placeholder-transparent focus:outline-none focus:border-purple-500 text-lg"
                                disabled={loading}
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
                                id="phoneNumber"
                                name="phoneNumber"
                                type="tel"
                                maxLength={10}
                                pattern="[0-9]{10}"
                                placeholder="Số điện thoại"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                disabled={loading}
                                className="peer h-12 w-full border-b-2 border-gray-300 text-white bg-transparent placeholder-transparent focus:outline-none focus:border-purple-500 text-lg"
                                required
                            />
                            <label
                                htmlFor="phoneNumber"
                                className="absolute left-0 -top-4 text-gray-500 text-base transition-all peer-placeholder-shown:text-lg peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-4 peer-focus:text-purple-500 peer-focus:text-base"
                            >
                                Số điện thoại
                            </label>
                        </div>
                        <div className="relative">
                            <input
                                id="identityCode"
                                name="identityCode"
                                type="tel"
                                maxLength={12}
                                pattern="[0-9]{12}"
                                placeholder="Số Căn cước công dân"
                                value={identityCode}
                                onChange={(e) => setIdentityCode(e.target.value)}
                                disabled={loading}
                                className="peer h-12 w-full border-b-2 border-gray-300 text-white bg-transparent placeholder-transparent focus:outline-none focus:border-purple-500 text-lg"
                                required
                            />
                            <label
                                htmlFor="identityCode"
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
                                    checked={agreeTerms}
                                    onChange={(e) => setAgreeTerms(e.target.checked)}
                                    className="form-checkbox h-5 w-5 text-purple-600 bg-gray-800 border-gray-300 rounded"
                                    disabled={loading}
                                />
                                <span className="ml-2">Đồng ý với các điều khoản của Cinema</span>
                            </label>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-purple-500 hover:bg-purple-700 rounded-md shadow-lg text-white text-lg font-semibold transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
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
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="max-w-lg w-full bg-gradient-to-r from-blue-800 to-purple-600 rounded-xl shadow-2xl overflow-hidden p-10 space-y-8">
                        <p className="text-xl font-semibold text-white text-center">{modalMessage}</p>
                        <button
                            onClick={handleCloseModal}
                            className="w-full py-3 px-4 bg-purple-500 hover:bg-purple-700 rounded-md shadow-lg text-white text-lg font-semibold transition duration-200"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Register;