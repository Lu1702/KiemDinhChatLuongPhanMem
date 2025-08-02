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

interface DetailedRevenue {
  cinemaId: string;
  cinemaName: string;
  totalRevenue: number;
  // Thêm các trường khác nếu API trả về thêm dữ liệu
}

const RevenueList: React.FC = () => {
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [selectedCinemaId, setSelectedCinemaId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRevenue = async () => {
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
      console.log('API Response (Detail):', data);

      if (data.data) {
        const detail = data.data;
        alert(`Chi tiết doanh thu cho rạp ${detail.cinemaName}:\n- Mã rạp: ${detail.cinemaId}\n- Doanh thu: ${detail.totalRevenue}`);
      } else {
        throw new Error('Dữ liệu chi tiết không hợp lệ');
      }
    } catch (err) {
      setError('Lỗi khi lấy chi tiết doanh thu: ' + (err as Error).message);
    }
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
            color: #090909;
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
            box-shadow: inset 4px 4px 12px #c5c5c5, inset -4px -4px 12px #ffffff;
          }

          .button2:hover {
            color: #ffffff;
            background-color: #4C28DB;
            border: 1px solid #4C28DB;
          }

          /* From Uiverse.io by Tsiangana */ 
          .dot-spinner {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            --uib-speed: 0.9s;
            height: 2.8rem;
            width: 2.8rem;
          }

          @keyframes float {
            0% {
              transform: rotate(0deg) translate(100px) rotate(0deg);
            }
            100% {
              transform: rotate(360deg) translate(100px) rotate(-360deg);
            }
          }

          .dot-spinner__dot::before {
            content: '';
            height: 20%;
            width: 20%;
            border-radius: 50%;
            background-color: #fff;
            filter: drop-shadow(0 0 10px rgb(95, 150, 202));
            box-shadow: -6px -6px 11px #c1c1c1,
                       6px 6px 11px #ffffff;
            transform: scale(0);
            opacity: 0.5;
            animation: pulse0112 calc(var(--uib-speed) * 1.111) ease-in-out infinite;
            box-shadow: 0 0 20px rgba(18, 31, 53, 0.3);
          }

          .dot-spinner__dot {
            position: absolute;
            top: 0;
            left: 0;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            height: 100%;
            width: 100%;
          }

          .dot-spinner__dot:nth-child(2) {
            transform: rotate(45deg);
          }

          .dot-spinner__dot:nth-child(2)::before {
            animation-delay: calc(var(--uib-speed) * -0.875);
          }

          .dot-spinner__dot:nth-child(3) {
            transform: rotate(90deg);
          }

          .dot-spinner__dot:nth-child(3)::before {
            animation-delay: calc(var(--uib-speed) * -0.75);
          }

          .dot-spinner__dot:nth-child(4) {
            transform: rotate(135deg);
          }

          .dot-spinner__dot:nth-child(4)::before {
            animation-delay: calc(var(--uib-speed) * -0.625);
          }

          .dot-spinner__dot:nth-child(5) {
            transform: rotate(180deg);
          }

          .dot-spinner__dot:nth-child(5)::before {
            animation-delay: calc(var(--uib-speed) * -0.5);
          }

          .dot-spinner__dot:nth-child(6) {
            transform: rotate(225deg);
          }

          .dot-spinner__dot:nth-child(6)::before {
            animation-delay: calc(var(--uib-speed) * -0.375);
          }

          .dot-spinner__dot:nth-child(7) {
            transform: rotate(270deg);
          }

          .dot-spinner__dot:nth-child(7)::before {
            animation-delay: calc(var(--uib-speed) * -0.25);
          }

          .dot-spinner__dot:nth-child(8) {
            transform: rotate(315deg);
          }

          .dot-spinner__dot:nth-child(8)::before {
            animation-delay: calc(var(--uib-speed) * -0.125);
          }

          @keyframes pulse0112 {
            0%,
            100% {
              transform: scale(0);
              opacity: 0.5;
            }
            50% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}
      </style>
      <h1>Danh sách doanh thu</h1>
      <button className="button2" onClick={fetchRevenue}>REFRESH</button>
      <select
        value={selectedCinemaId || ''}
        onChange={(e) => setSelectedCinemaId(e.target.value || null)}
        style={{ marginLeft: '10px', padding: '5px' }}
      >
        <option value="">Tất cả các rạp</option>
        {Array.isArray(cinemas) && cinemas.map((cinema) => (
          <option key={cinema.cinemaId} value={cinema.cinemaId}>
            {cinema.cinemaName}
          </option>
        ))}
      </select>
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
    </div>
  );
};

export default RevenueList;