import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Cinema {
  cinemaId: string;
  cinemaName: string;
  cinemaLocation: string;
  cinemaDescription?: string;
  cinemaContactNumber?: string;
}

interface ApiResponse {
  status: string;
  message: string;
  data: Cinema[];
}

const CinemaPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cinema' | 'room'>('cinema');
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newCinema, setNewCinema] = useState({
    cinemaName: '',
    cinemaLocation: '',
    cinemaDescription: '',
    cinemaContactNumber: '',
  });

  useEffect(() => {
    if (activeTab === 'cinema') {
      fetchCinemas();
    }
  }, [activeTab]);

  const fetchCinemas = async () => {
    setLoading(true);
    try {
      const response = await axios.get<ApiResponse>('http://localhost:5229/api/Cinema/getCinemaList');
      console.log('API Response:', response.data);
      const cinemaData = response.data.data;
      if (Array.isArray(cinemaData)) {
        setCinemas(cinemaData);
      } else {
        setError('API response data is not an array');
        setCinemas([]);
      }
    } catch (err) {
      setError('Failed to fetch cinema list');
      setCinemas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewCinema((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveCinema = async () => {
    try {
      const response = await fetch('http://localhost:5229/api/Cinema/addCinema', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(newCinema),
      });

      if (!response.ok) {
        throw new Error('Failed to add cinema');
      }

      setIsModalOpen(false);
      setNewCinema({
        cinemaName: '',
        cinemaLocation: '',
        cinemaDescription: '',
        cinemaContactNumber: '',
      });
      fetchCinemas(); // Refresh the cinema list
    } catch (err) {
      setError('Failed to add cinema');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Quản lý</h2>
          <ul>
            <li
              className={`p-2 cursor-pointer ${activeTab === 'cinema' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`}
              onClick={() => setActiveTab('cinema')}
            >
              Rạp
            </li>
            <li
              className={`p-2 cursor-pointer ${activeTab === 'room' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`}
              onClick={() => setActiveTab('room')}
            >
              Phòng chiếu
            </li>
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {activeTab === 'cinema' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Danh sách rạp</h2>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={() => setIsModalOpen(true)}
              >
                Thêm Rạp
              </button>
            </div>
            {loading && <p>Đang tải...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !error && cinemas.length === 0 && <p>Không có rạp nào để hiển thị.</p>}
            {cinemas.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cinemas.map((cinema) => (
                  <div key={cinema.cinemaId} className="bg-white p-4 rounded shadow">
                    <h3 className="text-lg font-semibold">{cinema.cinemaName}</h3>
                    <p className="text-gray-600">{cinema.cinemaLocation}</p>
                    {cinema.cinemaDescription && <p className="text-gray-500">{cinema.cinemaDescription}</p>}
                    {cinema.cinemaContactNumber && (
                      <p className="text-gray-500">Số điện thoại: {cinema.cinemaContactNumber}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === 'room' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Danh sách phòng chiếu</h2>
            <p>Chưa có dữ liệu phòng chiếu.</p>
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Thêm Rạp Mới</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tên Rạp</label>
                  <input
                    type="text"
                    name="cinemaName"
                    value={newCinema.cinemaName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Địa điểm</label>
                  <input
                    type="text"
                    name="cinemaLocation"
                    value={newCinema.cinemaLocation}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                  <textarea
                    name="cinemaDescription"
                    value={newCinema.cinemaDescription}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                  <input
                    type="text"
                    name="cinemaContactNumber"
                    value={newCinema.cinemaContactNumber}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-2">
                <button
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                  onClick={() => setIsModalOpen(false)}
                >
                  Hủy
                </button>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  onClick={handleSaveCinema}
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CinemaPage;