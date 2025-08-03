import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

interface Booking {
  Rap: string;
  Phong: string;
  TenPhim: string;
  NgayChieu: string;
  GioChieu: string;
  TrangThai: string;
}

const BookingHistory: React.FC = () => {
  const { userId } = useParams<{ userId?: string }>();
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        console.error("No userId provided");
        return;
      }
      const url = `http://localhost:5229/api/BookingHistory/getBookingHistory/${userId}`;
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'accept': '*/*'
          }
        });
        const data = await response.json();
        setBookings(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [userId]);

  const handleButtonClick = (index: number) => {
    alert(`Button clicked for row ${index + 1}`);
    // Add your button click logic here
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Booking History</h1>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Rạp</th>
            <th className="border p-2">Phòng</th>
            <th className="border p-2">Tên phim</th>
            <th className="border p-2">Ngày chiếu</th>
            <th className="border p-2">Giờ chiếu</th>
            <th className="border p-2">Trạng thái</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((item, index) => (
            <tr key={index} className="hover:bg-gray-100">
              <td className="border p-2">{item.Rap}</td>
              <td className="border p-2">{item.Phong}</td>
              <td className="border p-2">{item.TenPhim}</td>
              <td className="border p-2">{item.NgayChieu}</td>
              <td className="border p-2">{item.GioChieu}</td>
              <td className="border p-2">{item.TrangThai}</td>
              <td className="border p-2">
                <button
                  className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                  onClick={() => handleButtonClick(index)}
                >
                  Click
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookingHistory;