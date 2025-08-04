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

const RevenueList: React.FC = () => {
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [selectedCinemaId, setSelectedCinemaId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

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
    } finally {
      setLoading(false);
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
      localStorage.setItem('RAPID', cinemaId);
      console.log('Fetching revenue for cinemaId:', cinemaId);

      const response = await fetch(`http://localhost:5229/api/Revenue/GetRevenueByCinemaId?cinemaId=${localStorage.getItem('RAPID')}`, {
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

      if (data.data && data.data.baseCinemaInfoRevenue) {
        const detail = data.data.baseCinemaInfoRevenue;
        alert(`Chi tiết doanh thu cho rạp ${detail.cinemaName}:\n- Mã rạp: ${detail.cinemaId}\n- Doanh thu: ${data.data.totalRevenue ?? 'N/A'}`);
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
    <div className="min-h-screen bg-gradient-to-b from-gray-700/70 to-gray-500/50 font-sans py-10 px-4 rounded-2xl">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-yellow-400 text-center mb-8 tracking-wide">
          Danh Sách Doanh Thu
        </h1>

        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-xl mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1">
              <label className="block text-base font-medium text-gray-300 mb-1">Chọn Rạp</label>
              <select
                value={selectedCinemaId || ''}
                onChange={(e) => setSelectedCinemaId(e.target.value || null)}
                disabled={loading}
                className="w-full bg-gray-800 text-white border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value="">Tất cả các rạp</option>
                {Array.isArray(cinemas) && cinemas.map((cinema) => (
                  <option key={cinema.cinemaId} value={cinema.cinemaId}>
                    {cinema.cinemaName}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={fetchRevenue}
              disabled={loading}
              className="relative bg-yellow-950 text-yellow-400 border border-yellow-400 rounded-md px-6 py-2 font-medium overflow-hidden transition-all duration-300 hover:bg-yellow-900 hover:border-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed group mt-6 sm:mt-0"
            >
              <span className="absolute inset-0 bg-yellow-400 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></span>
              {loading ? (
                <div className="flex flex-row gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-300 animate-bounce"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-300 animate-bounce [animation-delay:-.3s]"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-300 animate-bounce [animation-delay:-.5s]"></div>
                </div>
              ) : (
                'Tải lại'
              )}
            </button>
          </div>
        </div>

        {error && <p className="text-red-400 text-center mb-4">{error}</p>}

        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-6">Kết Quả Doanh Thu</h2>
          <div className="overflow-x-auto">
            <table className="w-full bg-white/10 rounded-lg shadow-md">
              <thead>
                <tr className="bg-yellow-950 text-white">
                  <th className="px-4 py-3 text-left text-sm font-semibold">Mã Rạp</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Tên Rạp</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Doanh Thu</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(filteredRevenues) && filteredRevenues.length > 0 ? (
                  filteredRevenues.map((item, index) => (
                    <tr key={index} className="border-t border-gray-600 hover:bg-gray-700/20 transition">
                      <td className="px-4 py-2 text-white">{item.baseCinemaInfoRevenue.cinemaId ?? 'N/A'}</td>
                      <td className="px-4 py-2 text-white">{item.baseCinemaInfoRevenue.cinemaName ?? 'N/A'}</td>
                      <td className="px-4 py-2 text-white">{item.totalRevenue ?? 'N/A'}</td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => fetchRevenueDetail(item.baseCinemaInfoRevenue.cinemaId)}
                          className="relative bg-blue-600 text-white rounded-md px-4 py-1 font-medium transition-all duration-300 hover:bg-blue-700"
                        >
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-2 text-white text-center">
                      Không có dữ liệu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueList;