import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// Assuming Nav and Bottom are correctly imported from their respective paths
// import Nav from '../Header/nav';
// import Bottom from '../Footer/bottom';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false); // State to manage loading status
    const [showModal, setShowModal] = useState(false); // State to control modal visibility
    const [modalMessage, setModalMessage] = useState(''); // State to hold modal message

    const navigate = useNavigate();

    // Function to handle login form submission
    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // Prevent default form submission behavior
        setLoading(true); // Set loading to true when login process starts
        setModalMessage(''); // Clear any previous modal messages
        setShowModal(false); // Hide any previous modal

        // Basic input validation
        if (!email || !password) {
            setModalMessage("Vui lòng nhập đầy đủ Email và Mật khẩu!");
            setShowModal(true);
            setLoading(false); // Stop loading
            return;
        }

        try {
            // Make the API call to your backend login endpoint
            const response = await fetch('http://localhost:5229/api/Auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    loginUserName: email,
                    loginUserPassword: password
                }), // Send email and password in the request body
            });

            // Check if the response was successful (status code 2xx)
            if (response.ok) {
                const data = await response.json(); // Parse the JSON response
                if (data.tokenID) {
                    localStorage.setItem('authToken', data.tokenID);
                    localStorage.setItem('role',data.roleName);
                    localStorage.setItem('Password',password)
                    localStorage.setItem('Email',email)
                }
                // Assuming your API returns a token or user data upon successful login
                // You might want to store a token here, e.g., localStorage.setItem('authToken', data.token);
                localStorage.setItem('userEmail', email); // Storing email as an example, replace with token if available
                setModalMessage("Đăng nhập thành công!");
                setShowModal(true);
                // Navigate to the home page or dashboard after successful login
                navigate('/');
            } else {
                // Handle API errors (e.g., invalid credentials, server error)
                const errorData = await response.json(); // Attempt to parse error message from response
                setModalMessage(errorData.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại Email và Mật khẩu.");
                setShowModal(true);
            }
        } catch (error) {
            // Handle network errors or other exceptions
            console.error("Lỗi đăng nhập:", error);
            setModalMessage("Đã xảy ra lỗi khi kết nối đến máy chủ. Vui lòng thử lại sau.");
            setShowModal(true);
        } finally {
            setLoading(false); // Always set loading to false after the process completes
        }
    };

    // Function to navigate to the registration page
    const handleRegister = () => {
        navigate('/register');
    };

    // Function to navigate to the forgot password page
    const handleForgotpassword = () => {
        navigate('/Forgotpassword');
    };

    return (
        <div className="min-h-screen w-full bg-cover bg-center top-0"
            style={{ backgroundImage: "url('https://images8.alphacoders.com/136/thumb-1920-1368754.jpeg')" }}>
            <div className="sticky top-0 z-50 shadow-md" style={{ backgroundImage: "url('https://th.bing.com/th/id/R.9e8b6083d2c56afe3e37c99a0d008551?rik=MgANzjo9WJbFrA&riu=http%3a%2f%2fgetwallpapers.com%2fwallpaper%2ffull%2f5%2f0%2f3%2f718692-amazing-dark-purple-backgrounds-1920x1200.jpg&ehk=QVn3JWJ991bU4NaIVD9w8hngTuAZ1AHehPjBWxqpDUE%3d&risl=&pid=ImgRaw&r=0')" }}>
                <header>
                    <div className="content-wrapper max-w-screen-xl text-base mx-auto px-8">
                        {/* <Nav /> */} {/* Uncomment if Nav component is available */}
                    </div>
                </header>
            </div>
            <div className="content-wrapper max-w-screen-2xl text-base mx-auto px-8 min-h-screen pt-24">
                <div>
                    <div className="flex justify-center items-center h-full w-full">
                        <div className="grid gap-8 border-4 border-double border-indigo-500 backdrop-blur-sm rounded-3xl">
                            <section id="back-div" className="bg-transparent rounded-3xl">
                                <div className="border-transparent rounded-xl bg-slate-300 shadow-2xl p-8 m-2">
                                    <h2 className="text-2xl font-bold text-center cursor-default text-[#12213c]">
                                        ĐĂNG NHẬP
                                    </h2>
                                    <form onSubmit={handleLogin} method="post" className="space-y-6">
                                        <div className="w-96">
                                            <label htmlFor="email" className="flex justify-start items-start mb-2 text-base text-[#12213c] font-bold px-4 pt-3">Email</label>
                                            <input
                                                id="email"
                                                className="placeholder:text-slate-500 border p-3 shadow-md bg-transparent text-[#12213c] dark:border-gray-700 border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 transition transform hover:scale-105 duration-300"
                                                type="email"
                                                placeholder="Email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                disabled={loading} // Disable input when loading
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="password" className="flex justify-start items-start mb-2 text-base text-[#12213c] font-bold px-4 ">Mật khẩu</label>
                                            <input
                                                id="password"
                                                className="placeholder:text-slate-500 border p-3 shadow-md bg-transparent text-[#12213c] dark:border-gray-700 border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 transition transform hover:scale-105 duration-300"
                                                type="password"
                                                placeholder="Password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                disabled={loading} // Disable input when loading
                                            />
                                        </div>
                                        <div>
                                            <span onClick={handleForgotpassword} className="text-[#12213c] text-sm font-bold transition hover:underline flex justify-end items-end cursor-pointer ">Quên mật khẩu?</span>
                                        </div>
                                        <button
                                            className="text-xl w-full font-bold p-3 mt-4 text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg hover:scale-105 transition transform duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                            type="submit"
                                            disabled={loading} // Disable button when loading
                                        >
                                            {loading ? 'Đang đăng nhập...' : 'ĐĂNG NHẬP'}
                                        </button>
                                    </form>
                                    <div className="flex justify-center items-center flex-col mt-4 text-sm text-center text-[#12213c] font-bold">
                                        <p>
                                            Chưa có tài khoản?
                                            <span onClick={handleRegister} className="text-blue-400 transition hover:underline cursor-pointer pl-3">Đăng ký</span>
                                        </p>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
            <footer className="pt-32">
                {/* <Bottom /> */} {/* Uncomment if Bottom component is available */}
            </footer>

            {/* Custom Modal for messages */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
                        <p className="text-lg font-semibold text-[#12213c] mb-4">{modalMessage}</p>
                        <button
                            onClick={() => setShowModal(false)}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
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
