import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Cinema {
  cinemaId: string;
  cinemaName: string;
  cinemaLocation: string;
  cinemaDescription?: string;
  cinemaContactNumber?: string;
}

interface VisualFormat {
  movieVisualId: string;
  movieVisualFormatDetail: string;
}

interface CinemaRoom {
  roomNumber: number;
  cinemaID: string;
  visualFormatID: string;
  seatsNumber: string[];
}

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

const CinemaPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'cinema' | 'room'>('cinema');
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [visualFormats, setVisualFormats] = useState<VisualFormat[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [newCinema, setNewCinema] = useState({
    cinemaName: '',
    cinemaLocation: '',
    cinemaDescription: '',
    cinemaContactNumber: '',
  });
  const [selectedCinemaId, setSelectedCinemaId] = useState<string>('');
  const [newRoom, setNewRoom] = useState<CinemaRoom>({
    roomNumber: 0,
    cinemaID: '',
    visualFormatID: '',
    seatsNumber: [],
  });
  const [seatInput, setSeatInput] = useState<string>('');

  useEffect(() => {
    if (activeTab === 'cinema' || activeTab === 'room') {
      fetchCinemas();
      fetchVisualFormats();
    }
  }, [activeTab]);

  const fetchCinemas = async () => {
    setLoading(true);
    try {
      const response = await axios.get<ApiResponse<Cinema[]>>('http://localhost:5229/api/Cinema/getCinemaList', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      console.log('Cinema API Response:', response.data);
      const cinemaData = response.data.data;
      if (Array.isArray(cinemaData)) {
        setCinemas(cinemaData);
      } else {
        setError('Cinema API response data is not an array');
        setCinemas([]);
      }
    } catch (err) {
      setError('Failed to fetch cinema list');
      setCinemas([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchVisualFormats = async () => {
    setLoading(true);
    try {
      const response = await axios.get<VisualFormat[]>(
        'http://localhost:5229/api/MovieVisualFormat/GetMovieVisualFormatList',
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );
      console.log('Visual Format API Response:', response.data);
      if (Array.isArray(response.data)) {
        setVisualFormats(response.data);
      } else {
        setError('Visual Format API response data is not an array');
        setVisualFormats([]);
      }
    } catch (err) {
      setError('Failed to fetch visual format list');
      setVisualFormats([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCinemaInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewCinema((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoomInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setNewRoom((prev) => ({
      ...prev,
      [name]: name === 'roomNumber' ? Number(value) : value,
    }));
  };

  const handleAddSeat = () => {
    if (seatInput.trim()) {
      setNewRoom((prev) => ({
        ...prev,
        seatsNumber: [...prev.seatsNumber, seatInput.trim()],
      }));
      setSeatInput('');
    }
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

      setIsAddModalOpen(false);
      setNewCinema({
        cinemaName: '',
        cinemaLocation: '',
        cinemaDescription: '',
        cinemaContactNumber: '',
      });
      fetchCinemas();
      setSuccessMessage('Đã tạo rạp thành công');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Failed to add cinema');
    }
  };

  const handleDeleteCinema = async () => {
    if (!selectedCinemaId) {
      setError('Vui lòng chọn một rạp để xóa');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5229/api/Cinema/deleteCinema/${selectedCinemaId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete cinema');
      }

      setIsDeleteModalOpen(false);
      setSelectedCinemaId('');
      fetchCinemas();
      setSuccessMessage('Đã xóa rạp thành công');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Failed to delete cinema');
    }
  };

  const handleSaveRoom = async () => {
    if (!newRoom.cinemaID || !newRoom.visualFormatID || newRoom.roomNumber < 0) {
      setError('Vui lòng điền đầy đủ thông tin phòng chiếu');
      return;
    }

    try {
      const response = await fetch('http://localhost:5229/api/CinemaRoom/CreateRoom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(newRoom),
      });

      if (!response.ok) {
        throw new Error('Failed to create room');
      }

      setNewRoom({
        roomNumber: 0,
        cinemaID: '',
        visualFormatID: '',
        seatsNumber: [],
      });
      setSeatInput('');
      setSuccessMessage('Đã tạo phòng chiếu thành công');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Failed to create room');
    }
  };

  const handleNavigateToStaff = () => {
    navigate('/HomeAdmin');
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat font-sans"
      style={{ backgroundImage: "url('/images/bg.png')" }}
    >
      <div className="max-w-6xl mx-auto py-10 px-4 md:flex gap-8">
        {/* Sidebar */}
        <div className="sticky top-32 h-fit self-start bg-gray-900 p-4 rounded-xl w-full md:w-1/4 space-y-4 shadow-lg border border-yellow-500/30">
          <h2 className="text-xl font-bold text-yellow-400 mb-4">Bạn muốn chỉnh sửa:</h2>
          <ul>
            <li
              className={`p-2 cursor-pointer rounded-lg text-white font-medium ${activeTab === 'cinema' ? 'bg-yellow-950 text-yellow-400' : 'hover:bg-yellow-900/20'}`}
              onClick={() => setActiveTab('cinema')}
            >
              Rạp
            </li>
            <li
              className={`p-2 cursor-pointer rounded-lg text-white font-medium ${activeTab === 'room' ? 'bg-yellow-950 text-yellow-400' : 'hover:bg-yellow-900/20'}`}
              onClick={() => setActiveTab('room')}
            >
              Phòng chiếu
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-8 mt-8 md:mt-0">
          {activeTab === 'cinema' && (
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-yellow-500/30">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Danh sách rạp</h2>
                <div className="space-x-2">
                  <button
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
                    onClick={() => setIsAddModalOpen(true)}
                  >
                    Thêm Rạp
                  </button>
                  <button
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
                    onClick={() => setIsDeleteModalOpen(true)}
                  >
                    Xóa Rạp
                  </button>
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                    onClick={handleNavigateToStaff}
                  >
                    Quay lại
                  </button>
                </div>
              </div>
              {loading && <p className="text-white text-center">Đang tải...</p>}
              {error && <p className="text-red-400 text-center mb-4">{error}</p>}
              {successMessage && <p className="text-green-600 text-center mb-4">{successMessage}</p>}
              {!loading && !error && cinemas.length === 0 && <p className="text-white text-center">Không có rạp nào để hiển thị.</p>}
              {cinemas.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cinemas.map((cinema) => (
                    <div key={cinema.cinemaId} className="bg-white/10 p-4 rounded-lg shadow-md border border-yellow-500/30">
                      <h3 className="text-lg font-semibold text-white">{cinema.cinemaName}</h3>
                      <p className="text-gray-300">{cinema.cinemaLocation}</p>
                      {cinema.cinemaDescription && <p className="text-gray-300">{cinema.cinemaDescription}</p>}
                      {cinema.cinemaContactNumber && (
                        <p className="text-gray-300">Số điện thoại: {cinema.cinemaContactNumber}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {activeTab === 'room' && (
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-yellow-500/30">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Thêm Phòng Chiếu</h2>
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                  onClick={handleNavigateToStaff}
                >
                  Quay lại
                </button>
              </div>
              <div className="max-w-md mx-auto space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Số Phòng</label>
                  <input
                    type="number"
                    name="roomNumber"
                    value={newRoom.roomNumber}
                    onChange={handleRoomInputChange}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Rạp</label>
                  <select
                    name="cinemaID"
                    value={newRoom.cinemaID}
                    onChange={handleRoomInputChange}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    required
                  >
                    <option value="">-- Chọn rạp --</option>
                    {cinemas.map((cinema) => (
                      <option key={cinema.cinemaId} value={cinema.cinemaId}>
                        {cinema.cinemaName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Định dạng hình ảnh</label>
                  <select
                    name="visualFormatID"
                    value={newRoom.visualFormatID}
                    onChange={handleRoomInputChange}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    required
                  >
                    <option value="">-- Chọn định dạng --</option>
                    {visualFormats.map((format) => (
                      <option key={format.movieVisualId} value={format.movieVisualId}>
                        {format.movieVisualFormatDetail}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Số Ghế</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={seatInput}
                      onChange={(e) => setSeatInput(e.target.value)}
                      className="w-full bg-gray-800 text-white border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="Nhập số ghế (VD: A1)"
                    />
                    <button
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
                      onClick={handleAddSeat}
                    >
                      Thêm Ghế
                    </button>
                  </div>
                  {newRoom.seatsNumber.length > 0 && (
                    <ul className="mt-2 list-disc list-inside text-white bg-white/10 rounded-md p-2">
                      {newRoom.seatsNumber.map((seat, index) => (
                        <li key={index}>{seat}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                  onClick={handleSaveRoom}
                >
                  Lưu Phòng
                </button>
              </div>
              {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
              {successMessage && <p className="text-green-600 mt-4 text-center">{successMessage}</p>}
            </div>
          )}

          {/* Add Cinema Modal */}
          {isAddModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-2xl w-full max-w-md border border-yellow-500/30">
                <h3 className="text-xl font-bold text-white mb-4">Thêm Rạp Mới</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Tên Rạp</label>
                    <input
                      type="text"
                      name="cinemaName"
                      value={newCinema.cinemaName}
                      onChange={handleCinemaInputChange}
                      className="w-full bg-gray-800 text-white border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Địa điểm</label>
                    <input
                      type="text"
                      name="cinemaLocation"
                      value={newCinema.cinemaLocation}
                      onChange={handleCinemaInputChange}
                      className="w-full bg-gray-800 text-white border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Mô tả</label>
                    <textarea
                      name="cinemaDescription"
                      value={newCinema.cinemaDescription}
                      onChange={handleCinemaInputChange}
                      className="w-full bg-gray-800 text-white border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Số điện thoại</label>
                    <input
                      type="text"
                      name="cinemaContactNumber"
                      value={newCinema.cinemaContactNumber}
                      onChange={handleCinemaInputChange}
                      className="w-full bg-gray-800 text-white border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-2">
                  <button
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition"
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    Hủy
                  </button>
                  <button
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
                    onClick={handleSaveCinema}
                  >
                    Lưu
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Cinema Modal */}
          {isDeleteModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-2xl w-full max-w-md border border-yellow-500/30">
                <h3 className="text-xl font-bold text-white mb-4">Xóa Rạp</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Chọn Rạp</label>
                    <select
                      value={selectedCinemaId}
                      onChange={(e) => setSelectedCinemaId(e.target.value)}
                      className="w-full bg-gray-800 text-white border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    >
                      <option value="">-- Chọn rạp để xóa --</option>
                      {cinemas.map((cinema) => (
                        <option key={cinema.cinemaId} value={cinema.cinemaId}>
                          {cinema.cinemaName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-2">
                  <button
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition"
                    onClick={() => {
                      setIsDeleteModalOpen(false);
                      setSelectedCinemaId('');
                    }}
                  >
                    Hủy
                  </button>
                  <button
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleDeleteCinema}
                    disabled={!selectedCinemaId}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-6 right-6 z-50 px-4 py-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all"
      >
        ↑
      </button>
    </div>
  );
};

export default CinemaPage;