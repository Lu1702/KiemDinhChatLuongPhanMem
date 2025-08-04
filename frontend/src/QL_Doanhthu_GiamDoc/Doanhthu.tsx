import React, { useState, useEffect } from 'react';

interface Cinema {
  cinemaId: string;
  cinemaName: string;
  cinemaLocation: string;
  cinemaDescription: string;
  cinemaContactNumber: string;
}

interface Revenue {
  baseCinemaInfoRevenue: {
    cinemaId: string;
    cinemaName: string;
  };
  totalRevenue: number;
}

// Cập nhật interface để phù hợp với cấu trúc response chi tiết
interface DetailedRevenueData {
  baseCinemaInfoRevenue: {
    cinemaId: string;
    cinemaName: string;
  };
  baseRevenueInfo: {
    date: string;
    totalAmount: number;
  }[];
  totalRevenue: number;
}
const RevenueList: React.FC = () => {
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [selectedCinemaId, setSelectedCinemaId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // State mới để quản lý modal chi tiết
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [detailedRevenue, setDetailedRevenue] = useState<DetailedRevenueData | null>(null);

  const fetchRevenue = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5229/api/Revenue/GetAllRevenue', {
        method: 'GET',
        headers: {
          'Accept': '*/*',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response (Revenue):', data);

      if (Array.isArray(data.data)) {
        setRevenues(data.data);
        setError(null);
      } else {
        throw new Error('Dữ liệu trả về không phải là mảng hoặc không chứa mảng trong thuộc tính "data"');
      }
    } catch (err) {
      setError('Lỗi khi lấy dữ liệu doanh thu: ' + (err as Error).message);
      setRevenues([]);
    }
  };

  const fetchCinemas = async () => {
    try {
      const response = await fetch('http://localhost:5229/api/Cinema/getCinemaList', {
        method: 'GET',
        headers: {
          'Accept': '*/*',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response (Cinema):', data);

      if (Array.isArray(data.data)) {
        setCinemas(data.data);
        setError(null);
      } else {
        throw new Error('Dữ liệu trả về không phải là mảng hoặc không chứa mảng trong thuộc tính "data"');
      }
    } catch (err) {
      setError('Lỗi khi lấy danh sách rạp: ' + (err as Error).message);
    }
  };

  const fetchRevenueDetail = async (cinemaId: string) => {
    try {
      console.log('Fetching revenue for cinemaId:', cinemaId);

      const response = await fetch(`http://localhost:5229/api/Revenue/GetRevenueByCinemaId?cinemaId=${cinemaId}`, {
        method: 'GET',
        headers: {
          'Accept': '*/*',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // LOG TOÀN BỘ PHẢN HỒI CỦA API
      console.log('API Response (Detail):', data);

      if (data.data) {
        setDetailedRevenue(data.data);
        setIsDetailModalOpen(true);
      } else {
        throw new Error('Dữ liệu chi tiết không hợp lệ');
      }
    } catch (err) {
      setError('Lỗi khi lấy chi tiết doanh thu: ' + (err as Error).message);
    }
  };

  const closeModal = () => {
    setIsDetailModalOpen(false);
    setDetailedRevenue(null);
  };

  useEffect(() => {
    fetchRevenue();
    fetchCinemas();
  }, []);

  const filteredRevenues = selectedCinemaId
    ? revenues.filter(revenue => revenue.baseCinemaInfoRevenue.cinemaId === selectedCinemaId)
    : revenues;

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', margin: '20px', backgroundColor: 'white', padding: '20px' }}>
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
            background: #CAFF38; /* Changed from #ddd to lightgreen */
            border: 1px solid #CAFF38; /* Changed from #ddd to lightgreen for consistency */
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

          /* Provided CSS for uiverse-pixel-input */
          .uiverse-pixel-input-wrapper {
            display: flex;
            flex-direction: column;
            gap: 0.5em;
            font-family: "Courier New", monospace; /* This font applies to the input wrapper, not the label directly */
            color: #fff;
            font-size: 1em;
            width: 100%; /* Adjusted for responsiveness */
            max-width: 18em; /* Original max width */
          }

          .uiverse-pixel-label {
            text-shadow: 1px 1px #000;
            font-weight: bold;
            letter-spacing: 0.05em;
            color: #333; /* Adjusted for better contrast on light background */
            font-family: Arial, sans-serif; /* Changed to Arial */
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
            width: 100%; /* Ensure it takes full width of its wrapper */
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
          
          .modal {
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: auto;
            background-color: rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .modal-content {
            background-color: #fefefe;
            padding: 20px;
            border: 1px solid #888;
            width: 80%;
            max-width: 600px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            position: relative;
          }

          .close {
            color: #aaa;
            float: right;
            font-size: 28px;
            font-weight: bold;
          }

          .close:hover,
          .close:focus {
            color: black;
            text-decoration: none;
            cursor: pointer;
          }
        `}
      </style>
      <h1>Danh sách doanh thu</h1>
      <button className="button2" onClick={fetchRevenue}>REFRESH</button>
      
      {/* Áp dụng CSS cho dropdown */}
      <div className="uiverse-pixel-input-wrapper" style={{ display: 'inline-block', marginLeft: '10px' }}>
        <label>Chọn rạp:</label>
        <select
          className="uiverse-pixel-input"
          value={selectedCinemaId || ''}
          onChange={(e) => setSelectedCinemaId(e.target.value || null)}
        >
          <option value="">Tất cả các rạp</option>
          {Array.isArray(cinemas) && cinemas.map((cinema) => (
            <option key={cinema.cinemaId} value={cinema.cinemaId}>
              {cinema.cinemaName}
            </option>
          ))}
        </select>
      </div>

      {error && <div style={{ color: 'red' }}>{error}</div>}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', textAlign: 'left' }}>
              Mã rạp
            </th>
            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', textAlign: 'left' }}>
              Tên rạp
            </th>
            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', textAlign: 'left' }}>
              Doanh thu
            </th>
            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', textAlign: 'left' }}>
              Hành động
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(filteredRevenues) && filteredRevenues.length > 0 ? (
            filteredRevenues.map((item, index) => (
              <tr key={index}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.baseCinemaInfoRevenue.cinemaId ?? 'N/A'}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.baseCinemaInfoRevenue.cinemaName ?? 'N/A'}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.totalRevenue ?? 'N/A'}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  <button className="button2" onClick={() => fetchRevenueDetail(item.baseCinemaInfoRevenue.cinemaId)}>Chi tiết</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                Không có dữ liệu
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal hiển thị chi tiết doanh thu */}
      {isDetailModalOpen && detailedRevenue && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>&times;</span>
            <h2>Chi tiết doanh thu rạp: {detailedRevenue.baseCinemaInfoRevenue.cinemaName}</h2>
            <p><strong>Mã rạp:</strong> {detailedRevenue.baseCinemaInfoRevenue.cinemaId}</p>
            <p><strong>Tổng doanh thu:</strong> {detailedRevenue.totalRevenue}</p>
            <h3>Doanh thu theo ngày:</h3>
            {detailedRevenue.baseRevenueInfo.length > 0 ? (
              <ul>
                {detailedRevenue.baseRevenueInfo.map((item, index) => (
                  <li key={index}>
                    <strong>Ngày:</strong> {new Date(item.date).toLocaleDateString()} - <strong>Doanh thu:</strong> {item.totalAmount}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Không có dữ liệu doanh thu theo ngày.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueList;