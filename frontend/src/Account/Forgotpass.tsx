import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Define API response interfaces
interface EmailSendResponse {
    status: string;
    message: string;
}

interface VerifyCodeResponse {
    status: string;
    message: string;
    data: {
        Token: string;
    };
}

interface ResetPasswordResponse {
    status: string;
    message: string;
}

const ForgotPassword: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<"email" | "code" | "reset">("email");
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [reNewPassword, setReNewPassword] = useState("");
    const [token, setToken] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSendEmail = async () => {
        setMessage("");
        setLoading(true);
        try {
            const response = await fetch(
                `http://localhost:5229/api/Email/send?email=${encodeURIComponent(email)}`,
                {
                    method: "POST",
                    headers: { "accept": "*/*" },
                }
            );
            const data: EmailSendResponse = await response.json();
            if (data.status === "Success") {
                setMessage("Gửi Email Thành Công. Vui lòng kiểm tra hộp thư.");
                setStep("code");
            } else {
                setMessage("Gửi Email thất bại. Vui lòng thử lại.");
            }
        } catch (error) {
            setMessage("Lỗi kết nối. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        setMessage("");
        setLoading(true);
        try {
            const response = await fetch(
                `http://localhost:5229/api/Auth/VerifyEmailCode?EmailAddress=${encodeURIComponent(email)}&code=${code}`,
                {
                    method: "POST",
                    headers: { "accept": "*/*" },
                }
            );
            const data: VerifyCodeResponse = await response.json();
            if (data.status === "Success") {
                setToken(data.data.Token);
                setMessage("Vui lòng đặt mật khẩu mới của bạn!");
                setStep("reset");
            } else {
                setMessage("Mã xác nhận không đúng. Vui lòng thử lại.");
            }
        } catch (error) {
            setMessage("Lỗi xác nhận mã. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        setMessage("");
        setLoading(true);
        if (newPassword !== reNewPassword) {
            setMessage("Mật khẩu mới và xác nhận không khớp!");
            setLoading(false);
            return;
        }
        try {
            const response = await fetch(`http://localhost:5229/api/Account/ResetPassword`, {
                method: "POST",
                headers: { "accept": "*/*", "Content-Type": "application/json" },
                body: JSON.stringify({
                    resetToken: token,
                    newPassword,
                    reNewPassword,
                }),
            });
            const data: ResetPasswordResponse = await response.json();
            if (data.status === "Success") {
                setMessage("Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập lại.");
                setTimeout(() => navigate("/login"), 2000);
            } else {
                setMessage("Đặt lại mật khẩu thất bại. Vui lòng thử lại.");
            }
        } catch (error) {
            setMessage("Lỗi đặt lại mật khẩu. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-fixed bg-cover bg-center" style={{ backgroundImage: "url('https://images8.alphacoders.com/136/thumb-1920-1368754.jpeg')" }}>
            <div className="flex items-center justify-center min-h-screen">
                <div className="max-w-md w-full bg-gradient-to-r from-blue-800 to-purple-600 rounded-xl shadow-2xl overflow-hidden p-8 animate-[slideInFromLeft_1s_ease-out]">
                    <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg">
                        <h2 className="text-center text-3xl font-bold text-white mb-6">Quên Mật Khẩu</h2>
                        <h3 className="text-white py-5 text-center">Hãy nhập vào khung email của bạn để chúng tôi có thể gửi code cho bạn nhá! </h3>
                        {message && <p className={`text-center mb-4 ${message.includes("thất bại") ? "text-red-400" : "text-green-400"}`}>{message}</p>}
                        {step === "email" && (
                            <form onSubmit={(e) => { e.preventDefault(); handleSendEmail(); }} className="space-y-6">
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder=""
                                        className="peer w-full px-4 py-3 border-b-2 border-gray-300 bg-transparent text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 rounded-md text-lg transition-all duration-200"
                                        required
                                    />
                                    <label className="absolute left-4 -top-2 text-gray-400 text-base transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3 peer-focus:-top-2 peer-focus:text-purple-300">
                                        Nhập Email của bạn
                                    </label>
                                </div>
                                <div className="flex justify-center items-center">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="relative px-8 py-3 bg-black text-white font-semibold rounded-lg border-2 border-purple-500 hover:border-purple-400 transition-all duration-300 hover:shadow-[0_0_20px_10px_rgba(168,85,247,0.6)] active:scale-95 active:shadow-[0_0_10px_5px_rgba(168,85,247,0.4)] group">
                                        <span className="flex items-center space-x-2">
                                            {loading ? "Đang gửi..." : "Gửi Email"}
                                        </span>
                                        <span
                                            className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-purple-500/20 to-indigo-500/20"
                                        ></span>
                                    </button>
                                </div>

                            </form>
                        )}
                        {step === "code" && (
                            <form onSubmit={(e) => { e.preventDefault(); handleVerifyCode(); }} className="space-y-6">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        placeholder=""
                                        className="peer w-full px-4 py-3 border-b-2 border-gray-300 bg-transparent text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 rounded-md text-lg transition-all duration-200"
                                        required
                                    />
                                    <label className="absolute left-4 -top-2 text-gray-400 text-base transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3 peer-focus:-top-2 peer-focus:text-purple-300">
                                        Bạn hãy nhập mã xác nhận
                                    </label>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full mt-6 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? "Đang xác nhận..." : "Xác nhận mã"}
                                </button>
                            </form>
                        )}
                        {step === "reset" && (
                            <form onSubmit={(e) => { e.preventDefault(); handleResetPassword(); }} className="space-y-6">
                                <div className="relative">
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder=""
                                        className="peer w-full px-4 py-3 border-b-2 border-gray-300 bg-transparent text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 rounded-md text-lg transition-all duration-200"
                                        required
                                    />
                                    <label className="absolute left-4 -top-2 text-gray-400 text-base transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3 peer-focus:-top-2 peer-focus:text-purple-300">
                                        Bạn hãy nhập mật khẩu mới
                                    </label>
                                </div>
                                <div className="relative">
                                    <input
                                        type="password"
                                        value={reNewPassword}
                                        onChange={(e) => setReNewPassword(e.target.value)}
                                        placeholder=""
                                        className="peer w-full px-4 py-3 border-b-2 border-gray-300 bg-transparent text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 rounded-md text-lg transition-all duration-200"
                                        required
                                    />
                                    <label className="absolute left-4 -top-2 text-gray-400 text-base transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3 peer-focus:-top-2 peer-focus:text-purple-300">
                                        Xác nhận mật khẩu mới !
                                    </label>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full mt-6 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;