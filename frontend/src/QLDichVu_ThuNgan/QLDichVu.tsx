import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css'; // Đảm bảo rằng file CSS này chứa các style cho uiverse-pixel-input và button2

interface Service {
  id: number;
  name: string;
  quantity: number;
  orderID: string;
}

const QuanLy: React.FC = () => {
  const [employeeId] = useState('123456789');
  const [filterText, setFilterText] = useState(''); // filterText sẽ lưu OrderID được chọn để lọc
  // Khởi tạo dịch vụ với orderID mặc định
  const [services, setServices] = useState<Service[]>([
    { id: 1, name: 'Bắp caramel', quantity: 1, orderID: 'ORD001' },
    { id: 2, name: 'Pepsi', quantity: 2, orderID: 'ORD001' },
    { id: 3, name: 'Coca', quantity: 1, orderID: 'ORD002' },
    { id: 4, name: 'Yêu cầu thêm dịch vụ', quantity: 0, orderID: 'ORD003' },
  ]);
  const [isAddingService, setIsAddingService] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  // State for loading spinner
  const [isLoading, setIsLoading] = useState(false);

  // Danh sách các dịch vụ có sẵn để chọn
  const availableServices = ['Pepsi', 'Coca', '7up', 'Bắp phô mai', 'Bắp origin', 'Bắp Carameo'];

  // State cho ô chọn dịch vụ và số lượng khi thêm
  const [newServiceName, setNewServiceName] = useState(availableServices[0]);
  const [newServiceQuantity, setNewServiceQuantity] = useState(1);
  // State mới cho OrderID được chọn khi thêm dịch vụ
  const [selectedOrderID, setSelectedOrderID] = useState('');
  const navigate = useNavigate();

  // Lấy danh sách các OrderID duy nhất từ các dịch vụ đã có
  const existingOrderIDs = Array.from(new Set(services.map(service => service.orderID)));

  const handleAddService = () => {
    setIsAddingService(true);
    setNewServiceName(availableServices[0]);
    setNewServiceQuantity(1);
    // Nếu có OrderID nào đã tồn tại, chọn cái đầu tiên làm mặc định, ngược lại để trống
    setSelectedOrderID(existingOrderIDs.length > 0 ? existingOrderIDs[0] : '');
  };

  const handleSubmitService = (e: React.FormEvent) => {
    e.preventDefault();
    if (newServiceName.trim() && selectedOrderID.trim()) {
      const newService: Service = {
        id: services.length + 1,
        name: newServiceName,
        quantity: newServiceQuantity,
        orderID: selectedOrderID
      };
      setServices([...services, newService]);
      setNewServiceName(availableServices[0]);
      setNewServiceQuantity(1);
      setSelectedOrderID('');
      setIsAddingService(false);
    } else {
      alert('Vui lòng chọn Tên dịch vụ và Order ID.');
    }
  };

  const handleSave = () => {
    setIsLoading(true); // Show spinner when saving
    // Simulate an API call or a long process
    setTimeout(() => {
      alert(`Đã lưu với thay đổi ở Order: ${filterText}`);
      setIsLoading(false); // Hide spinner after process
      // Navigate to /payment after the process is complete and spinner is hidden
      navigate('/payment');
    }, 2000); // 2 second delay for demonstration
  };

  // Logic lọc vẫn giữ nguyên, lọc theo Order ID
  const filteredServices = services.filter(service =>
    filterText === '' || service.orderID.toLowerCase().includes(filterText.toLowerCase())
  );

  const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  };

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: `url('/images/bg.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        color: 'white',
      }}
    >
      <div className="absolute inset-0 bg-black opacity-50"></div>

      {/* Sidebar */}
      <div
        className="w-72 p-4 fixed top-0 left-0 h-screen z-10"
        style={{ backgroundColor: '#231C60', borderRight: '2px solid white' }}
      >
        <div className="flex items-center mb-6">
          <img src="/images/logocinema1.png" alt="Logo" className="h-10 mr-2" />
        </div>
        <button
          className="button2 w-full text-black px-4 py-2 rounded"
          onClick={handleAddService}
        >
          Dịch vụ thêm
        </button>
      </div>

      {/* Main Content */}
      <div className="ml-72 p-6 relative z-10">
        <div style={{ flex: 1, padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3>Xin chào quản lý</h3>
            <div style={{ position: 'relative' }}>
              <span
                style={{ fontSize: '28px', cursor: 'pointer' }}
                onClick={() => setShowAccountMenu(!showAccountMenu)}
              >
                👤
              </span>
              {showAccountMenu && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '36px',
                    background: '#231C60',
                    color: 'white',
                    borderRadius: '4px',
                    padding: '8px',
                    minWidth: '100px',
                    textAlign: 'center',
                  }}
                >
                  <button
                    onClick={() => {
                      setShowLogoutModal(true);
                      setShowAccountMenu(false);
                    }}
                    style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg mt-6">
          <h2 className="text-xl font-bold mb-4">Thông tin nhân viên</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm">Mã nhân viên</label>
              <div className="uiverse-pixel-input">
                <input
                  type="text"
                  value={employeeId}
                  readOnly
                  className="w-full p-2 rounded text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm">Chọn ID order bạn muốn thêm dịch vụ</label>
              <div className="uiverse-pixel-input-wrapper">
                <select
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="uiverse-pixel-input w-full"
                >
                  <option value="">-- Chọn --</option>
                  {existingOrderIDs.map(id => (
                    <option key={id} value={id}>{id}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {isAddingService && (
            <form onSubmit={handleSubmitService} className="mt-4 space-y-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm">Tên dịch vụ</label>
                  <div className="uiverse-pixel-input-wrapper">
                    <select
                      value={newServiceName}
                      onChange={(e) => setNewServiceName(e.target.value)}
                      className="uiverse-pixel-input w-full"
                    >
                      {availableServices.map(service => (
                        <option key={service} value={service}>{service}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm">Số lượng</label>
                  <div className="uiverse-pixel-input-wrapper">
                    <select
                      value={newServiceQuantity}
                      onChange={(e) => setNewServiceQuantity(parseInt(e.target.value))}
                      className="uiverse-pixel-input w-24"
                    >
                      {[1, 2, 3, 4, 5].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Ô chọn Order ID khi thêm dịch vụ */}
              <div className="mt-4">
                <label className="block text-sm">Order ID</label>
                <div className="uiverse-pixel-input-wrapper">
                  <select
                    value={selectedOrderID}
                    onChange={(e) => setSelectedOrderID(e.target.value)}
                    className="uiverse-pixel-input w-full"
                    required
                  >
                    <option value="" disabled>-- Chọn Order ID --</option>
                    {existingOrderIDs.map(id => (
                      <option key={id} value={id}>{id}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-center mt-4">
                <button
                  className="button2 w-20 text-black px-4 py-2 rounded"
                  onClick={handleSubmitService}
                  style={{ width: '80px' }}
                >
                  Thêm
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="bg-gray-800 p-4 rounded-lg mt-6">
          <h2 className="text-xl font-bold mb-4">Chi tiết vé</h2>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-700">
                <th className="p-2 border-b">ID</th>
                <th className="p-2 border-b">Tên dịch vụ</th>
                <th className="p-2 border-b">Số lượng</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map((service) => (
                <tr key={service.id} className="border-b">
                  <td className="p-2">{service.id}</td>
                  <td className="p-2">{service.name}</td>
                  <td className="p-2">{service.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-center mt-6">
          <button
            onClick={() => {
                      handleSave();
                      navigate("/payment");
                    }}
            className="button2 bg-[#7e57c2] text-white px-4 py-2 rounded"
            style={{ width: '250px' }}
            disabled={isLoading} // Disable button when loading
          >
            {isLoading ? (
              <div className="dot-spinner">
                <div className="dot-spinner__dot"></div>
                <div className="dot-spinner__dot"></div>
                <div className="dot-spinner__dot"></div>
                <div className="dot-spinner__dot"></div>
                <div className="dot-spinner__dot"></div>
                <div className="dot-spinner__dot"></div>
                <div className="dot-spinner__dot"></div>
                <div className="dot-spinner__dot"></div>
              </div>
            ) : (
              'Yêu cầu thanh toán'
            )}
          </button>
        </div>

        {/* Modal Đăng xuất */}
        {showLogoutModal && (
          <div style={modalOverlayStyle}>
            <div style={{ background: '#4c65a8', padding: '24px', borderRadius: '8px', textAlign: 'center', color: 'white', width: '300px' }}>
              <div style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                  <img src="/images/warning.png" alt="!" style={{ width: '40px' }} />
                </div>
              </div>
              <p>Bạn chắc chắn muốn đăng xuất không?</p>
              <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '16px' }}>
                <button
                  onClick={() => {
                    alert('Đã đăng xuất');
                    setShowLogoutModal(false);
                    navigate('/');
                  }}
                  style={{ padding: '6px 12px', border: 'none', borderRadius: '4px', background: 'lightgreen', color: 'black' }}
                >
                  Có
                </button>
                <button
                  onClick={() => setShowLogoutModal(false)}
                  style={{ padding: '6px 12px', border: 'none', borderRadius: '4px', background: '#cc3380', color: 'white' }}
                >
                  Không
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuanLy;