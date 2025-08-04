import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface Booking {
  bookingId: string;
  cinemaRoomNumber: string;
  cinemaName: string;
  movieName: string;
  trangThai: string;
  ngayChieu: string;
  hourSchedule: string;
}

interface BookingDetail {
  customerName: string;
  phoneNumber: string;
  movieName: string;
  movieScheduleDate: string;
  cinemaName: string;
  cinemaRoomNumber: number;
  seatsNumber: string;
  productList: { [key: string]: number };
}

const BookingHistory: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingDetail | null>(null);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();

  useEffect(() => {
    const fetchData = async () => {
      let finalUserId = userId;
      if (!finalUserId || finalUserId === 'undefined') {
        finalUserId = localStorage.getItem('IDND') || '';
      }

      const authToken = localStorage.getItem('authToken');
      const url = `http://localhost:5229/api/BookingHistory/getBookingHistory/${finalUserId}`;
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            accept: '*/*',
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            setError('Không được phép truy cập. Vui lòng đăng nhập lại.');
            localStorage.removeItem('authToken');
            localStorage.removeItem('IDND');
            navigate('/login');
            return;
          }
          if (response.status === 404) {
            setError('Không tìm thấy lịch sử đặt vé cho người dùng này.');
            setLoading(false);
            return;
          }
          throw new Error(`Lỗi ${response.status}: Không thể tải dữ liệu từ API`);
        }

        const data = await response.json();
        const bookingsArray = Array.isArray(data.data) ? data.data : [data.data];
        const validBookings = bookingsArray.filter(
          (item: any): item is Booking => typeof item.bookingId === 'string' && item.bookingId
        );
        if (validBookings.length === 0) {
          setError('Không có vé nào trong lịch sử đặt vé.');
        }
        setBookings(validBookings);
        setLoading(false);
      } catch (error: unknown) {
        setError(error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định');
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, navigate]);

  const fetchBookingDetail = async (bookingId: string) => {
    setModalLoading(true);
    setModalError(null);
    const authToken = localStorage.getItem('authToken');
    const url = `http://localhost:5229/api/BookingHistory/getBookingHistoryDetail/${bookingId}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          accept: '*/*',
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setModalError('Không được phép truy cập. Vui lòng đăng nhập lại.');
          localStorage.removeItem('authToken');
          localStorage.removeItem('IDND');
          navigate('/login');
          return;
        }
        throw new Error(`Lỗi ${response.status}: Không thể tải chi tiết vé`);
      }

      const data = await response.json();
      setSelectedBooking(data);
      setModalLoading(false);
    } catch (error: unknown) {
      setModalError(error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định');
      setModalLoading(false);
    }
  };

  const handleButtonClick = (bookingId: string) => {
    fetchBookingDetail(bookingId);
  };

  const closeModal = () => {
    setSelectedBooking(null);
    setModalError(null);
  };

  return (
    <div className="container mx-auto p-6 bg-gradient-to-b from-gray-900/90 to-gray-800/80 min-h-screen font-sans border border-yellow-400 rounded-2xl">
      <h1 className="text-4xl font-extrabold text-center mb-10 text-yellow-400 tracking-wide">
        Lịch Sử Đặt Vé Xem Phim
      </h1>

      {loading && (
        <div className="text-center text-lg text-gray-300 animate-pulse">
          Đang tải dữ liệu...
        </div>
      )}

      {error && (
        <div className="text-center text-lg text-red-500 bg-red-900/20 p-4 rounded-lg border border-red-500/50 max-w-md mx-auto">
          Lỗi: {error}
        </div>
      )}

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full bg-gray-800/80 shadow-xl rounded-xl border border-gray-700/50">
            <thead>
              <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <th className="py-4 px-6 text-left font-semibold">Mã Đặt Vé</th>
                <th className="py-4 px-6 text-left font-semibold">Rạp</th>
                <th className="py-4 px-6 text-left font-semibold">Phòng</th>
                <th className="py-4 px-6 text-left font-semibold">Tên Phim</th>
                <th className="py-4 px-6 text-left font-semibold">Ngày Chiếu</th>
                <th className="py-4 px-6 text-left font-semibold">Giờ Chiếu</th>
                <th className="py-4 px-6 text-left font-semibold">Trạng Thái</th>
                <th className="py-4 px-6 text-left font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {bookings.length > 0 ? (
                bookings.map((item, index) => (
                  <tr
                    key={`${item.bookingId}-${index}`}
                    className="border-b border-gray-700/50 hover:bg-gray-700 transition-colors duration-200 text-gray-200"
                  >
                    <td className="py-4 px-6">{item.bookingId}</td>
                    <td className="py-4 px-6">{item.cinemaName}</td>
                    <td className="py-4 px-6">{item.cinemaRoomNumber}</td>
                    <td className="py-4 px-6">{item.movieName}</td>
                    <td className="py-4 px-6">{item.ngayChieu}</td>
                    <td className="py-4 px-6">{item.hourSchedule}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${item.trangThai === 'Đã chiếu'
                          ? ' text-green-400'
                          : ' text-yellow-400'
                          }`}
                      >
                        {item.trangThai}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleButtonClick(item.bookingId)}
                        className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 font-semibold rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 shadow-md"
                      >
                        Xem vé
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-6 px-6 text-center text-gray-400">
                    Không có dữ liệu lịch sử đặt vé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 transition-opacity duration-300">
          <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-xl p-8 w-full max-w-md shadow-2xl border border-yellow-500/30 transform transition-all duration-300 scale-100 hover:scale-105">
            <h2 className="text-3xl font-extrabold text-yellow-400 mb-6 text-center tracking-wide">
              Chi Tiết Vé Phim
            </h2>
            {modalLoading ? (
              <div className="text-center text-lg text-gray-300 animate-pulse">
                Đang tải chi tiết...
              </div>
            ) : modalError ? (
              <div className="text-center text-lg text-red-500 bg-red-900/20 p-4 rounded-lg border border-red-500/50">
                Lỗi: {modalError}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 text-gray-200">
                <div className="py-2">
                  <span className="font-semibold">Tên khách hàng:</span>
                </div>
                <div className="py-2">{selectedBooking.customerName}</div>
                <div className="py-2">
                  <span className="font-semibold">Số điện thoại:</span>
                </div>
                <div className="py-2">{selectedBooking.phoneNumber}</div>
                <div className="py-2">
                  <span className="font-semibold">Tên phim:</span>
                </div>
                <div className="py-2">{selectedBooking.movieName}</div>
                <div className="py-2">
                  <span className="font-semibold">Ngày chiếu:</span>
                </div>
                <div className="py-2">{new Date(selectedBooking.movieScheduleDate).toLocaleDateString('vi-VN')}</div>
                <div className="py-2">
                  <span className="font-semibold">Rạp:</span>
                </div>
                <div className="py-2">{selectedBooking.cinemaName}</div>
                <div className="py-2">
                  <span className="font-semibold">Phòng:</span>
                </div>
                <div className="py-2">{selectedBooking.cinemaRoomNumber}</div>
                <div className="py-2">
                  <span className="font-semibold">Ghế:</span>
                </div>
                <div className="py-2">{selectedBooking.seatsNumber}</div>
                <div className="py-2 col-span-2">
                  <span className="font-semibold block mb-2">Sản phẩm:</span>
                  <ul className="list-disc pl-6 text-gray-300">
                    {Object.entries(selectedBooking.productList).map(([item, quantity]) => (
                      <li key={item} className="py-1">{item}: {quantity}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            <div className="mt-8 flex justify-center">
              <button
                onClick={closeModal}
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

export default BookingHistory;