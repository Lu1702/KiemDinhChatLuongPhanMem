import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Navigate } from 'react-router-dom';

interface PaymentParams {
    success: string | null;
    code: string | null;
    message: string | null;
    transactionNo: string | null;
    orderInfo: string | null;
    bankCode: string | null;
}

function PaymentStatus() {
    const location = useLocation();
    const [paymentParams, setPaymentParams] = useState<PaymentParams>({
        success: null,
        code: null,
        message: null,
        transactionNo: null,
        orderInfo: null,
        bankCode: null,
    });

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        setPaymentParams({
            success: queryParams.get('success'),
            code: queryParams.get('code'),
            message: queryParams.get('message'),
            transactionNo: queryParams.get('transactionNo'),
            orderInfo: queryParams.get('orderInfo'),
            bankCode: queryParams.get('bankCode'),
        });
    }, [location.search]);
  const navigate = useNavigate();
    const handleHome = () => 
    {
        navigate('/');
    }
    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="relative bg-gray-800 w-full max-w-lg rounded-lg shadow-2xl p-6 border-4 border-red-600 overflow-hidden">
                {/* Nền  */}
                <div className="absolute inset-0 bg-gradient-to-b from-red-600/20 to-transparent opacity-50"></div>
                <div className="absolute top-0 left-0 w-full h-2 bg-red-600"></div>
                <div className="relative bg-gray-700 rounded-md p-6 border-l-4 border-r-4 border-dashed border-yellow-400">
                    <h1 className="text-3xl font-bold text-yellow-400 text-center mb-6 tracking-wider">
                        {paymentParams.success === 'true' ? 'THANH TOÁN THÀNH CÔNG' : 'THANH TOÁN THẤT BẠI'}
                    </h1>
                    <div className={`p-6 rounded-lg ${paymentParams.success === 'true' ? 'bg-green-900/50 border-2 border-green-500' : 'bg-red-900/50 border-2 border-red-500'}`}>
                        <p className="text-lg text-white mb-3">
                            <strong className="text-yellow-400">Trạng thái:</strong> {paymentParams.success === 'true' ? 'Thành công' : 'Thất bại'}
                        </p>
                        {paymentParams.code && (
                            <p className="text-lg text-white mb-3">
                                <strong className="text-yellow-400">Mã:</strong> {paymentParams.code}
                            </p>
                        )}
                        {paymentParams.message && (
                            <p className="text-lg text-white mb-3">
                                <strong className="text-yellow-400">Thông báo:</strong> {decodeURIComponent(paymentParams.message)}
                            </p>
                        )}
                        {paymentParams.transactionNo && (
                            <p className="text-lg text-white mb-3">
                                <strong className="text-yellow-400">Mã giao dịch:</strong> {paymentParams.transactionNo}
                            </p>
                        )}
                        {paymentParams.orderInfo && (
                            <p className="text-lg text-white mb-3">
                                <strong className="text-yellow-400">Thông tin đơn hàng:</strong> {decodeURIComponent(paymentParams.orderInfo)}
                            </p>
                        )}
                        {paymentParams.bankCode && (
                            <p className="text-lg text-white mb-3">
                                <strong className="text-yellow-400">Mã ngân hàng:</strong> {paymentParams.bankCode}
                            </p>
                        )}
                    </div>
                    <div className="absolute -left-4 top-0 h-full w-4 bg-gray-800 flex items-center justify-center">
                        <div className="w-2 h-2 bg-gray-900 rounded-full my-2"></div>
                        <div className="w-2 h-2 bg-gray-900 rounded-full my-2"></div>
                        <div className="w-2 h-2 bg-gray-900 rounded-full my-2"></div>
                    </div>
                    <div className="absolute -right-4 top-0 h-full w-4 bg-gray-800 flex items-center justify-center">
                        <div className="w-2 h-2 bg-gray-900 rounded-full my-2"></div>
                        <div className="w-2 h-2 bg-gray-900 rounded-full my-2"></div>
                        <div className="w-2 h-2 bg-gray-900 rounded-full my-2"></div>
                    </div>
                    <div className='flex justify-center items-center mt-5'>
                        <button 
                        onClick={handleHome}
                        className="cursor-pointer font-semibold overflow-hidden relative z-100 border border-green-500 group px-8 py-2">
                            <span className="relative z-10 text-green-500 group-hover:text-white text-xl duration-500">Quay lại !</span>
                            <span className="absolute w-full h-full bg-green-500 -left-32 top-0 -rotate-45 group-hover:rotate-0 group-hover:left-0 duration-500"></span>
                            <span className="absolute w-full h-full bg-green-500 -right-32 top-0 -rotate-45 group-hover:rotate-0 group-hover:right-0 duration-500"></span>
                        </button>
                    </div>
                </div>
                {/* Tạo hiệu ứng ánh sáng */}
                <div className="absolute inset-0 shadow-[0_0_20px_rgba(234,179,8,0.5)] pointer-events-none"></div>
            </div>
        </div>
    );
}

export default PaymentStatus;