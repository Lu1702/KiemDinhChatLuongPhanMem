import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setModalMessage('');
        setShowModal(false);

        if (!email || !password) {
            setModalMessage("Vui lòng nhập đầy đủ Email và Mật khẩu!");
            setShowModal(true);
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:5229/api/Auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    loginUserName: email,
                    loginUserPassword: password
                }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.tokenID) {
                    localStorage.setItem('authToken', data.tokenID);
                    localStorage.setItem('role', data.roleName);
                    localStorage.setItem('Password', password);
                    localStorage.setItem('Email', email);
                    localStorage.setItem('IDND', data.userID);
                }
                console.log(localStorage.getItem('IDND'));
                localStorage.setItem('userEmail', email);
                setModalMessage("Đăng nhập thành công!");
                setShowModal(true);
                navigate('/');
            } else {
                const errorData = await response.json();
                setModalMessage(errorData.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại Email và Mật khẩu.");
                setShowModal(true);
            }
        } catch (error) {
            console.error("Lỗi đăng nhập:", error);
            setModalMessage("Đã xảy ra lỗi khi kết nối đến máy chủ. Vui lòng thử lại sau.");
            setShowModal(true);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = () => {
        navigate('/register');
    };

    const handleForgotpassword = () => {
        navigate('/Forgotpassword');
    };

    return (
        <div className="min-h-screen w-full bg-cover bg-center"
            style={{ backgroundImage: "url('https://images8.alphacoders.com/136/thumb-1920-1368754.jpeg')" }}>
            <div className="sticky top-0 z-50 shadow-xl bg-[url('https://th.bing.com/th/id/R.9e8b6083d2c56afe3e37c99a0d008551?rik=MgANzjo9WJbFrA&riu=http%3a%2f%2fgetwallpapers.com%2fwallpaper%2ffull%2f5%2f0%2f3%2f718692-amazing-dark-purple-backgrounds-1920x1200.jpg&ehk=QVn3JWJ991bU4NaIVD9w8hngTuAZ1AHehPjBWxqpDUE%3d&risl=&pid=ImgRaw&r=0')]">
                <header>
                    <div className="max-w-7xl mx-auto px-8">
                        {/* <Nav /> */}
                    </div>
                </header>
            </div>
            <div className="max-w-7xl mx-auto px-8 min-h-screen pt-24 flex justify-center items-center">
                <div
                    className="max-w-lg w-full bg-gradient-to-r from-blue-800 to-purple-600 rounded-xl shadow-2xl overflow-hidden p-10 space-y-8 animate-[slideInFromLeft_1s_ease-out]"
                >
                    <h2 className="text-center text-4xl font-extrabold text-white animate-[appear_2s_ease-out]">
                        Đăng nhập
                    </h2>
                    <p className="text-center text-gray-200 animate-[appear_3s_ease-out]">
                        Đăng nhập vào tài khoản của bạn
                    </p>
                    <form onSubmit={handleLogin} className="space-y-6">
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
                        <div className="flex items-center justify-between">
                            <label className="flex items-center text-base text-gray-200">
                                <input
                                    type="checkbox"
                                    className="form-checkbox h-5 w-5 text-purple-600 bg-gray-800 border-gray-300 rounded"
                                />
                                <span className="ml-2">Ghi nhớ tôi</span>
                            </label>
                            <span
                                onClick={handleForgotpassword}
                                className="text-base text-purple-200 hover:underline cursor-pointer"
                            >
                                Quên mật khẩu?
                            </span>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-purple-500 hover:bg-purple-700 rounded-md shadow-lg text-white text-lg font-semibold transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                        </button>
                    </form>
                    <div className="text-center text-gray-300 text-base">
                        Chưa có tài khoản?
                        <span
                            onClick={handleRegister}
                            className="text-purple-300 hover:underline cursor-pointer pl-2"
                        >
                            Đăng ký
                        </span>
                    </div>
                </div>
            </div>
            <footer className="pt-32">
                {/* <Bottom /> */}
            </footer>
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="max-w-lg w-full bg-gradient-to-r from-blue-800 to-purple-600 rounded-xl shadow-2xl overflow-hidden p-10 space-y-8">
                        <p className="text-xl font-semibold text-white text-center">{modalMessage}</p>
                        <button
                            onClick={() => setShowModal(false)}
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

export default Login;