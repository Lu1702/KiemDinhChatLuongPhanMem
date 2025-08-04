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

interface Seat {
  seatsId: string;
  seatsNumber: string;
  isTaken: boolean;
}

interface CinemaRoom {
  cinemaRoomId: string;
  cinemaRoomNumber: number;
  seats: Seat[];
}

interface RoomDetailResponseData {
  cinemaRoomId: string;
  cinemaRoomNumber: number;
  seats: Seat[];
  cinemaId?: string;
  visualFormatId?: string;
}

// Kiểu dữ liệu linh hoạt cho API, có thể là một mảng hoặc một đối tượng duy nhất
type RoomApiResponseData = CinemaRoom[] | CinemaRoom;

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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isEditRoomModalOpen, setIsEditRoomModalOpen] = useState<boolean>(false);
  const [isDeleteRoomModalOpen, setIsDeleteRoomModalOpen] = useState<boolean>(false);
  const [editingCinema, setEditingCinema] = useState<Cinema | null>(null);
  const [editingRoom, setEditingRoom] = useState<RoomDetailResponseData | null>(null);
  const [roomToDeleteId, setRoomToDeleteId] = useState<string | null>(null);

  const [newCinema, setNewCinema] = useState({
    cinemaName: '',
    cinemaLocation: '',
    cinemaDescription: '',
    cinemaContactNumber: '',
  });
  const [selectedCinemaId, setSelectedCinemaId] = useState<string>('');
  const [newRoom, setNewRoom] = useState<{
    roomNumber: string;
    cinemaID: string;
    visualFormatID: string;
    seatsNumber: string[];
  }>({
    roomNumber: '',
    cinemaID: '',
    visualFormatID: '',
    seatsNumber: [],
  });
  const [roomsByCinema, setRoomsByCinema] = useState<CinemaRoom[]>([]);

  useEffect(() => {
    if (activeTab === 'cinema' || activeTab === 'room') {
      fetchCinemas();
      fetchVisualFormats();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'room' && newRoom.cinemaID) {
      fetchRoomsByCinema(newRoom.cinemaID);
    } else {
      setRoomsByCinema([]);
    }
  }, [activeTab, newRoom.cinemaID]);

  const fetchCinemas = async () => {
    setLoading(true);
    try {
      const response = await axios.get<ApiResponse<Cinema[]>>(
        'http://localhost:5229/api/Cinema/getCinemaList',
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        },
      );
      const cinemaData = response.data.data;
      if (Array.isArray(cinemaData)) {
        setCinemas(cinemaData);
      } else {
        alert('Dữ liệu rạp phim không hợp lệ.');
        setCinemas([]);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách rạp:', err);
      alert('Không thể tải danh sách rạp.');
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
        },
      );
      if (Array.isArray(response.data)) {
        setVisualFormats(response.data);
      } else {
        alert('Dữ liệu định dạng hình ảnh không hợp lệ.');
        setVisualFormats([]);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách định dạng hình ảnh:', err);
      alert('Không thể tải danh sách định dạng hình ảnh.');
      setVisualFormats([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomsByCinema = async (cinemaId: string) => {
    setLoading(true);
    try {
      const response = await axios.get<ApiResponse<RoomApiResponseData>>(
        `http://localhost:5229/api/CinemaRoom/SearchRoomByCinemaId?CinemaId=${cinemaId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        },
      );
      const roomData = response.data.data;
      
      if (Array.isArray(roomData)) {
        setRoomsByCinema(roomData);
      } else if (roomData && typeof roomData === 'object') {
        setRoomsByCinema([roomData]);
      } else {
        setRoomsByCinema([]);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách phòng chiếu:', err);
      alert('Không thể tải danh sách phòng chiếu.');
      setRoomsByCinema([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomDetail = async (roomId: string) => {
    setLoading(true);
    try {
      const response = await axios.get<ApiResponse<RoomDetailResponseData>>(
        `http://localhost:5229/api/CinemaRoom/GetRoomDetail/${roomId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        },
      );
      if (response.data.status === 'Success') {
        const roomDetail = response.data.data;
        setEditingRoom({
          ...roomDetail,
          cinemaId: newRoom.cinemaID,
          visualFormatId: newRoom.visualFormatID,
        });
        setIsEditRoomModalOpen(true);
      } else {
        alert(response.data.message || 'Không thể lấy chi tiết phòng chiếu.');
      }
    } catch (err) {
      console.error('Lỗi khi lấy chi tiết phòng chiếu:', err);
      alert('Không thể lấy chi tiết phòng chiếu.');
    } finally {
      setLoading(false);
    }
  };

  const handleCinemaInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setNewCinema((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditCinemaInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    if (editingCinema) {
      setEditingCinema((prev) => (prev ? { ...prev, [name]: value } : null));
    }
  };

  const handleRoomInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setNewRoom((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditRoomInputChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    if (editingRoom) {
      setEditingRoom((prev) => (prev ? { ...prev, [name]: value } : null));
    }
  };

  const handleGenerateSeats = () => {
    const newSeats: string[] = [];
    const rows = ['A', 'B', 'C', 'D', 'E'];
    const seatsPerRow = 10;
    for (let i = 0; i < rows.length; i++) {
      for (let j = 1; j <= seatsPerRow; j++) {
        newSeats.push(`${rows[i]}${j}`);
      }
    }
    setNewRoom((prev) => ({
      ...prev,
      seatsNumber: newSeats,
    }));
  };

  const handleGenerate25Seats = () => {
    const newSeats: string[] = [];
    const rows = ['A', 'B', 'C', 'D', 'E'];
    const seatsPerRow = 5;
    for (let i = 0; i < rows.length; i++) {
      for (let j = 1; j <= seatsPerRow; j++) {
        newSeats.push(`${rows[i]}${j}`);
      }
    }
    setNewRoom((prev) => ({
      ...prev,
      seatsNumber: newSeats,
    }));
  };

  const handleGenerate15Seats = () => {
    const newSeats: string[] = [];
    const rows = ['A', 'B', 'C'];
    const seatsPerRow = 5;
    for (let i = 0; i < rows.length; i++) {
      for (let j = 1; j <= seatsPerRow; j++) {
        newSeats.push(`${rows[i]}${j}`);
      }
    }
    setNewRoom((prev) => ({
      ...prev,
      seatsNumber: newSeats,
    }));
  };

  const handleSaveCinema = async () => {
    try {
      const response = await fetch(
        'http://localhost:5229/api/Cinema/addCinema',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
          body: JSON.stringify(newCinema),
        },
      );
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to add cinema');
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
      console.error('Lỗi khi thêm rạp:', err);
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('Không thể thêm rạp.');
      }
    }
  };

  const handleUpdateCinema = async () => {
    if (!editingCinema || !editingCinema.cinemaId) {
      alert('Không có rạp nào được chọn để sửa.');
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:5229/api/Cinema/editCinema/${editingCinema.cinemaId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
          body: JSON.stringify({
            cinemaName: editingCinema.cinemaName,
            cinemaLocation: editingCinema.cinemaLocation,
            cinemaDescription: editingCinema.cinemaDescription,
            cinemaContactNumber: editingCinema.cinemaContactNumber,
          }),
        },
      );
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to update cinema');
      }
      closeModal('edit');
      fetchCinemas();
      setSuccessMessage('Đã cập nhật rạp thành công');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Lỗi khi cập nhật rạp:', err);
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('Không thể cập nhật rạp.');
      }
    }
  };

  const handleDeleteCinema = async () => {
    if (!selectedCinemaId) {
      alert('Vui lòng chọn một rạp để xóa');
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:5229/api/Cinema/deleteCinema/${selectedCinemaId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        },
      );
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to delete cinema');
      }
      setIsDeleteModalOpen(false);
      setSelectedCinemaId('');
      fetchCinemas();
      setSuccessMessage('Đã xóa rạp thành công');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Lỗi khi xóa rạp:', err);
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('Không thể xóa rạp.');
      }
    }
  };

  const handleSaveRoom = async () => {
    if (!newRoom.cinemaID || !newRoom.visualFormatID || newRoom.roomNumber === '' || newRoom.seatsNumber.length === 0) {
      alert('Vui lòng điền đầy đủ thông tin phòng chiếu và tạo số ghế.');
      return;
    }
    try {
      const response = await fetch(
        'http://localhost:5229/api/CinemaRoom/CreateRoom',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
          body: JSON.stringify({
            ...newRoom,
            roomNumber: Number(newRoom.roomNumber),
          }),
        },
      );
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to create room');
      }

      const currentCinemaID = newRoom.cinemaID;
      setNewRoom({
        roomNumber: '',
        cinemaID: currentCinemaID,
        visualFormatID: '',
        seatsNumber: [],
      });
      
      fetchRoomsByCinema(currentCinemaID);
      
      setSuccessMessage('Đã tạo phòng chiếu thành công');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Lỗi khi tạo phòng chiếu:', err);
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('Không thể tạo phòng chiếu.');
      }
    }
  };

  const handleUpdateRoom = async () => {
    if (!editingRoom || !editingRoom.cinemaRoomId || !editingRoom.cinemaId || !editingRoom.visualFormatId) {
      alert('Không có đủ thông tin để cập nhật phòng.');
      return;
    }

    const seatsNumberArray = editingRoom.seats.map(seat => seat.seatsNumber);

    try {
      const response = await fetch(
        `http://localhost:5229/api/CinemaRoom/UpdateRoom/${editingRoom.cinemaRoomId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
          body: JSON.stringify({
            roomNumber: editingRoom.cinemaRoomNumber,
            cinemaID: editingRoom.cinemaId,
            visualFormatID: editingRoom.visualFormatId,
            seatsNumber: seatsNumberArray,
          }),
        },
      );
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to update room');
      }
      closeModal('editRoom');
      fetchRoomsByCinema(editingRoom.cinemaId);
      setSuccessMessage('Đã cập nhật phòng chiếu thành công');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Lỗi khi cập nhật phòng:', err);
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('Không thể cập nhật phòng.');
      }
    }
  };

  const handleDeleteRoom = async () => {
    if (!roomToDeleteId) {
      alert('Không có phòng nào được chọn để xóa.');
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:5229/api/CinemaRoom/DeleteRoom/${roomToDeleteId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        },
      );
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to delete room');
      }
      closeModal('deleteRoom');
      if (newRoom.cinemaID) {
        fetchRoomsByCinema(newRoom.cinemaID);
      }
      setSuccessMessage('Đã xóa phòng chiếu thành công');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Lỗi khi xóa phòng:', err);
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('Không thể xóa phòng.');
      }
    }
  };

  const handleNavigateToStaff = () => {
    navigate('/HomeAdmin');
  };

  const closeModal = (modalType: 'add' | 'delete' | 'edit' | 'editRoom' | 'deleteRoom') => {
    if (modalType === 'add') {
      setIsAddModalOpen(false);
      setNewCinema({
        cinemaName: '',
        cinemaLocation: '',
        cinemaDescription: '',
        cinemaContactNumber: '',
      });
    } else if (modalType === 'delete') {
      setIsDeleteModalOpen(false);
      setSelectedCinemaId('');
    } else if (modalType === 'edit') {
      setIsEditModalOpen(false);
      setEditingCinema(null);
    } else if (modalType === 'editRoom') {
      setIsEditRoomModalOpen(false);
      setEditingRoom(null);
    } else if (modalType === 'deleteRoom') {
      setIsDeleteRoomModalOpen(false);
      setRoomToDeleteId(null);
    }
  };

  return (
    <div
      className="flex h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/images/bg.png')" }}
    >
      <style>
        {`
          .button2 {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease-in;
            position: relative;
            overflow: hidden;
            z-index: 1;
            color: #000;
            padding: 0.7em 1.7em;
            cursor: pointer;
            font-size: 18px;
            font-weight: 500;
            border-radius: 0.5em;
            background: #CAFF38;
            border: 1px solid #CAFF38;
            text-align: center;
          }
          .button2:active {
            color: #666;
            box-shadow: inset 4px 4px 12px #c5c5c5, inset -4px -4px 12px #044119;
          }
          .button2:hover {
            color: #ffffff;
            background-color: #7e57c2;
            border: 1px solid #7e57c2;
          }
          .button2.blue {
            background-color: #4C28DB;
            border-color: #4C28DB;
            color: #fff;
          }
          .button2.blue:hover {
            background-color: #7e57c2;
            border-color: #7e57c2;
          }
          .button2.red {
            background-color: #ff4d4d;
            border-color: #ff4d4d;
            color: #fff;
          }
          .button2.red:hover {
            background-color: #cc0000;
            border-color: #cc0000;
          }
          .button2.green {
            background-color: #4CAF50;
            border-color: #4CAF50;
            color: #fff;
          }
          .button2.green:hover {
            background-color: #45a049;
            border-color: #45a049;
          }
          .button2.yellow {
            background-color: #fdd835;
            border-color: #fdd835;
            color: #000;
          }
          .button2.yellow:hover {
            background-color: #fbc02d;
            border-color: #fbc02d;
          }
          .button2.gray {
            background-color: #ccc;
            border-color: #ccc;
            color: #000;
          }
          .button2.gray:hover {
            background-color: #a0a0a0;
            border-color: #a0a0a0;
          }
          .uiverse-pixel-input-wrapper {
            display: flex;
            flex-direction: column;
            gap: 0.5em;
            font-family: "Courier New", monospace;
            color: #fff;
            font-size: 1em;
            width: 100%;
            max-width: 18em;
          }
          .uiverse-pixel-label {
            text-shadow: 1px 1px #000;
            font-weight: bold;
            letter-spacing: 0.05em;
            color: #333;
            font-family: Arial, sans-serif;
          }
          .uiverse-pixel-input {
            appearance: none;
            border: none;
            padding: 0.6em;
            font-size: 1em;
            font-family: "Courier New", monospace;
            color: #fff;
            background: #7e57c2;
            image-rendering: pixelated;
            box-shadow:
              0 0 0 0.15em #000,
              0 0 0 0.3em #fff,
              0 0 0 0.45em #000,
              0 0.3em 0 0 #5e35b1,
              0 0.3em 0 0.15em #000;
            outline: none;
            transition: all 0.15s steps(1);
            text-shadow: 1px 1px #000;
            width: 100%;
          }
          .uiverse-pixel-input::placeholder {
            color: #fff;
            opacity: 0.6;
          }
          .uiverse-pixel-input:focus {
            background: #9575cd;
            box-shadow:
              0 0 0 0.15em #000,
              0 0 0 0.3em #fff,
              0 0 0 0.45em #000,
              0 0.2em 0 0 #7e57c2,
              0 0.2em 0 0.15em #000;
          }
          .uiverse-pixel-input:hover {
            animation: uiverse-glitch-input 0.3s steps(2) infinite;
          }
          @keyframes uiverse-glitch-input {
            0% { transform: translate(0); }
            25% { transform: translate(-1px, 1px); }
            50% { transform: translate(1px, -1px); }
            75% { transform: translate(-1px, -1px); }
            100% { transform: translate(0); }
          }
        `}
      </style>
      {/* Sidebar */}
      <div
        className="w-64 shadow-md text-white"
        style={{ backgroundColor: '#231C60' }}
      >
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Bạn muốn chỉnh sửa: </h2>
          <ul>
            <li
              className={`p-2 cursor-pointer ${
                activeTab === 'cinema'
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-gray-200 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab('cinema')}
            >
              Rạp
            </li>
            <li
              className={`p-2 cursor-pointer ${
                activeTab === 'room'
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-gray-200 hover:text-gray-800'
              }`}
              onClick={() => {
                setActiveTab('room');
              }}
            >
              Phòng chiếu
            </li>
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 flex space-x-6">
        {activeTab === 'cinema' && (
          <div className="flex-1">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl text-white font-bold">Danh sách rạp</h2>
              <div className="space-x-2">
                <button
                  className="button2 blue"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  Thêm Rạp
                </button>
                <button
                  className="button2 red"
                  onClick={() => setIsDeleteModalOpen(true)}
                >
                  Xóa Rạp
                </button>
                <button
                  className="button2 green"
                  onClick={handleNavigateToStaff}
                >
                  Back
                </button>
              </div>
            </div>
            {loading && <p>Đang tải...</p>}
            {successMessage && (
              <p className="text-green-500">{successMessage}</p>
            )}
            {!loading && cinemas.length === 0 && (
              <p>Không có rạp nào để hiển thị.</p>
            )}
            {cinemas.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cinemas.map((cinema) => (
                  <div key={cinema.cinemaId} className="bg-white p-4 rounded shadow">
                    <h3 className="text-lg font-semibold">{cinema.cinemaName}</h3>
                    <p className="text-gray-600">{cinema.cinemaLocation}</p>
                    {cinema.cinemaDescription && (
                      <p className="text-gray-500">{cinema.cinemaDescription}</p>
                    )}
                    {cinema.cinemaContactNumber && (
                      <p className="text-gray-500">
                        Số điện thoại: {cinema.cinemaContactNumber}
                      </p>
                    )}
                    <button
                      className="button2 yellow mt-2"
                      onClick={() => {
                        setEditingCinema(cinema);
                        setIsEditModalOpen(true);
                      }}
                    >
                      Sửa Rạp
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === 'room' && (
          <>
            <div className="flex flex-col items-start w-1/2">
              <div className="flex justify-between items-center mb-4 w-full">
                <h2 className="text-2xl text-white font-bold">Thêm Phòng Chiếu</h2>
                <div className="space-x-2">
                  <button className="button2 green" onClick={handleNavigateToStaff}>
                    Back
                  </button>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg w-full">
                <div className="space-y-4">
                  <div className="uiverse-pixel-input-wrapper w-full">
                    <label htmlFor="roomNumber" className="uiverse-pixel-label">
                      Số Phòng
                    </label>
                    <input
                      id="roomNumber"
                      type="text"
                      name="roomNumber"
                      value={newRoom.roomNumber}
                      onChange={handleRoomInputChange}
                      className="uiverse-pixel-input w-full"
                      required
                    />
                  </div>
                  <div className="uiverse-pixel-input-wrapper w-full">
                    <label htmlFor="cinemaID" className="uiverse-pixel-label">
                      Rạp
                    </label>
                    <select
                      id="cinemaID"
                      name="cinemaID"
                      value={newRoom.cinemaID}
                      onChange={handleRoomInputChange}
                      className="uiverse-pixel-input w-full"
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
                  <div className="uiverse-pixel-input-wrapper w-full">
                    <label htmlFor="visualFormatID" className="uiverse-pixel-label">
                      Định dạng hình ảnh
                    </label>
                    <select
                      id="visualFormatID"
                      name="visualFormatID"
                      value={newRoom.visualFormatID}
                      onChange={handleRoomInputChange}
                      className="uiverse-pixel-input w-full"
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
                  <div className="uiverse-pixel-input-wrapper w-full">
                    <label className="uiverse-pixel-label">Số Ghế</label>
                    <div className="flex space-x-2 mb-4">
                      <button
                        className="button2 blue"
                        onClick={handleGenerateSeats}
                      >
                        Tạo 50 Ghế
                      </button>
                      <button
                        className="button2 blue"
                        onClick={handleGenerate25Seats}
                      >
                        Tạo 25 Ghế
                      </button>
                      <button
                        className="button2 blue"
                        onClick={handleGenerate15Seats}
                      >
                        Tạo 15 Ghế
                      </button>
                    </div>
                    {newRoom.seatsNumber.length > 0 && (
                      <div className="mt-2 text-black p-4 bg-gray-100 rounded-lg">
                        <p className="font-semibold">Đã tạo {newRoom.seatsNumber.length} ghế:</p>
                        <div className="grid grid-cols-10 md:grid-cols-15 lg:grid-cols-20 gap-2 mt-2">
                          {newRoom.seatsNumber.map((seat, index) => (
                            <span key={index} className="bg-gray-200 text-center rounded p-1 text-sm font-mono">
                              {seat}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    className="button2 blue"
                    onClick={handleSaveRoom}
                  >
                    Lưu Phòng
                  </button>
                </div>
              </div>
            </div>
            {/* Display existing rooms */}
            <div className="flex flex-col w-1/2">
              <h2 className="text-2xl text-white font-bold mb-4">Danh sách phòng chiếu</h2>
              {loading && <p>Đang tải danh sách phòng...</p>}
              {!loading && roomsByCinema.length === 0 && newRoom.cinemaID && (
                <p className="text-white">Rạp này chưa có phòng chiếu nào.</p>
              )}
              {!loading && !newRoom.cinemaID && (
                <p className="text-white">Vui lòng chọn một rạp để xem danh sách phòng chiếu.</p>
              )}
              {!loading && roomsByCinema.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roomsByCinema.map((room) => (
                    <div key={room.cinemaRoomId} className="bg-white p-4 rounded shadow">
                      <h3 className="text-lg font-semibold">Phòng số: {room.cinemaRoomNumber}</h3>
                      <p className="text-gray-600">Tổng số ghế: {room.seats.length}</p>
                      <button
                        className="button2 yellow mt-2"
                        onClick={() => fetchRoomDetail(room.cinemaRoomId)}
                      >
                        Sửa Phòng
                      </button>
                      <button
                        className="button2 red mt-2 ml-2"
                        onClick={() => {
                          setRoomToDeleteId(room.cinemaRoomId);
                          setIsDeleteRoomModalOpen(true);
                        }}
                      >
                        Xóa Phòng
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Add Cinema Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Thêm Rạp Mới</h3>
              <div className="space-y-4">
                <div className="uiverse-pixel-input-wrapper">
                  <label htmlFor="cinemaName" className="uiverse-pixel-label">
                    Tên Rạp
                  </label>
                  <input
                    id="cinemaName"
                    type="text"
                    name="cinemaName"
                    value={newCinema.cinemaName}
                    onChange={handleCinemaInputChange}
                    className="uiverse-pixel-input"
                    required
                  />
                </div>
                <div className="uiverse-pixel-input-wrapper">
                  <label htmlFor="cinemaLocation" className="uiverse-pixel-label">
                    Địa điểm
                  </label>
                  <input
                    id="cinemaLocation"
                    type="text"
                    name="cinemaLocation"
                    value={newCinema.cinemaLocation}
                    onChange={handleCinemaInputChange}
                    className="uiverse-pixel-input"
                    required
                  />
                </div>
                <div className="uiverse-pixel-input-wrapper">
                  <label htmlFor="cinemaDescription" className="uiverse-pixel-label">
                    Mô tả
                  </label>
                  <textarea
                    id="cinemaDescription"
                    name="cinemaDescription"
                    value={newCinema.cinemaDescription}
                    onChange={handleCinemaInputChange}
                    className="uiverse-pixel-input"
                  />
                </div>
                <div className="uiverse-pixel-input-wrapper">
                  <label htmlFor="cinemaContactNumber" className="uiverse-pixel-label">
                    Số điện thoại
                  </label>
                  <input
                    id="cinemaContactNumber"
                    type="text"
                    name="cinemaContactNumber"
                    value={newCinema.cinemaContactNumber}
                    onChange={handleCinemaInputChange}
                    className="uiverse-pixel-input"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-2">
                <button
                  className="button2 gray"
                  onClick={() => closeModal('add')}
                >
                  Hủy
                </button>
                <button
                  className="button2 blue"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Xóa Rạp</h3>
              <div className="space-y-4">
                <div className="uiverse-pixel-input-wrapper">
                  <label htmlFor="deleteCinema" className="uiverse-pixel-label">
                    Chọn Rạp
                  </label>
                  <select
                    id="deleteCinema"
                    value={selectedCinemaId}
                    onChange={(e) => setSelectedCinemaId(e.target.value)}
                    className="uiverse-pixel-input"
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
                  className="button2 gray"
                  onClick={() => closeModal('delete')}
                >
                  Hủy
                </button>
                <button
                  className="button2 red"
                  onClick={handleDeleteCinema}
                  disabled={!selectedCinemaId}
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Cinema Modal */}
        {isEditModalOpen && editingCinema && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Sửa Rạp: {editingCinema.cinemaName}</h3>
              <div className="space-y-4">
                <div className="uiverse-pixel-input-wrapper">
                  <label htmlFor="editCinemaName" className="uiverse-pixel-label">
                    Tên Rạp
                  </label>
                  <input
                    id="editCinemaName"
                    type="text"
                    name="cinemaName"
                    value={editingCinema.cinemaName}
                    onChange={handleEditCinemaInputChange}
                    className="uiverse-pixel-input"
                    required
                  />
                </div>
                <div className="uiverse-pixel-input-wrapper">
                  <label htmlFor="editCinemaLocation" className="uiverse-pixel-label">
                    Địa điểm
                  </label>
                  <input
                    id="editCinemaLocation"
                    type="text"
                    name="cinemaLocation"
                    value={editingCinema.cinemaLocation}
                    onChange={handleEditCinemaInputChange}
                    className="uiverse-pixel-input"
                    required
                  />
                </div>
                <div className="uiverse-pixel-input-wrapper">
                  <label htmlFor="editCinemaDescription" className="uiverse-pixel-label">
                    Mô tả
                  </label>
                  <textarea
                    id="editCinemaDescription"
                    name="cinemaDescription"
                    value={editingCinema.cinemaDescription}
                    onChange={handleEditCinemaInputChange}
                    className="uiverse-pixel-input"
                  />
                </div>
                <div className="uiverse-pixel-input-wrapper">
                  <label htmlFor="editCinemaContactNumber" className="uiverse-pixel-label">
                    Số điện thoại
                  </label>
                  <input
                    id="editCinemaContactNumber"
                    type="text"
                    name="cinemaContactNumber"
                    value={editingCinema.cinemaContactNumber}
                    onChange={handleEditCinemaInputChange}
                    className="uiverse-pixel-input"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-2">
                <button
                  className="button2 gray"
                  onClick={() => closeModal('edit')}
                >
                  Hủy
                </button>
                <button
                  className="button2 yellow"
                  onClick={handleUpdateCinema}
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Room Modal */}
        {isEditRoomModalOpen && editingRoom && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Sửa Phòng Chiếu: {editingRoom.cinemaRoomNumber}</h3>
              <div className="space-y-4">
                <div className="uiverse-pixel-input-wrapper">
                  <label className="uiverse-pixel-label">Số Phòng</label>
                  <div className="uiverse-pixel-input text-white">{editingRoom.cinemaRoomNumber}</div>
                </div>
                <div className="uiverse-pixel-input-wrapper w-full">
                  <label className="uiverse-pixel-label">Rạp</label>
                  <div className="uiverse-pixel-input text-white">{cinemas.find(c => c.cinemaId === editingRoom.cinemaId)?.cinemaName || 'N/A'}</div>
                </div>
                <div className="uiverse-pixel-input-wrapper w-full">
                  <label htmlFor="editVisualFormatID" className="uiverse-pixel-label">
                    Định dạng hình ảnh
                  </label>
                  <select
                    id="editVisualFormatID"
                    name="visualFormatId"
                    value={editingRoom.visualFormatId}
                    onChange={handleEditRoomInputChange}
                    className="uiverse-pixel-input w-full"
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
                <div className="uiverse-pixel-input-wrapper">
                  <label className="uiverse-pixel-label">Danh sách ghế ({editingRoom.seats.length} ghế)</label>
                  <div className="grid grid-cols-10 md:grid-cols-15 lg:grid-cols-20 gap-2 mt-2 p-4 bg-gray-100 rounded-lg">
                    {editingRoom.seats.map((seat) => (
                      <span key={seat.seatsId} className={`text-center rounded p-1 text-sm font-mono ${seat.isTaken ? 'bg-red-500 text-white' : 'bg-gray-200 text-black'}`}>
                        {seat.seatsNumber}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-2">
                <button
                  className="button2 gray"
                  onClick={() => closeModal('editRoom')}
                >
                  Hủy
                </button>
                <button
                  className="button2 yellow"
                  onClick={handleUpdateRoom}
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Room Confirmation Modal */}
        {isDeleteRoomModalOpen && roomToDeleteId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-black">
              <h3 className="text-xl font-bold mb-4">Xác nhận xóa phòng</h3>
              <p>Bạn có chắc chắn muốn xóa phòng chiếu này không? Thao tác này không thể hoàn tác.</p>
              <div className="mt-6 flex justify-end space-x-2">
                <button
                  className="button2 gray"
                  onClick={() => closeModal('deleteRoom')}
                >
                  Hủy
                </button>
                <button
                  className="button2 red"
                  onClick={handleDeleteRoom}
                >
                  Xóa
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