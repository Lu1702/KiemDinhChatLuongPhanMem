import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css'; // Đảm bảo rằng file CSS này chứa các style cho uiverse-pixel-input và button2

interface Service {
    id: number;
    name: string;
    quantity: number;
    orderID: string;
}

// NEW INTERFACE: For food/drink items from API
interface FoodDrinkItem {
    itemId: string; // Assuming an ID for each item
    itemName: string; // The name of the food/drink item
    price: number; // Assuming price is also available
    // Add other fields if your API returns them
}

const QuanLy: React.FC = () => {
    const [employeeId] = useState('123456789');
    const [filterText, setFilterText] = useState('');
    const [services, setServices] = useState<Service[]>([
        { id: 1, name: 'Bắp caramel', quantity: 1, orderID: 'ORD001' },
        { id: 2, name: 'Pepsi', quantity: 2, orderID: 'ORD001' },
        { id: 3, name: 'Coca', quantity: 1, orderID: 'ORD002' },
        { id: 4, name: 'Không thêm dịch vụ', quantity: 1, orderID: 'ORD003' },
    ]);
    const [isAddingService, setIsAddingService] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showAccountMenu, setShowAccountMenu] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    // NEW STATE: To store fetched food/drink items
    const [foodDrinkItems, setFoodDrinkItems] = useState<FoodDrinkItem[]>([]);
    // NEW STATE: To indicate if food/drink items are being loaded
    const [isFoodDrinkLoading, setIsFoodDrinkLoading] = useState(true);


    // State cho ô chọn dịch vụ và số lượng khi thêm
    const [newServiceName, setNewServiceName] = useState(''); // Default to empty string initially
    const [newServiceQuantity, setNewServiceQuantity] = useState(1);
    const [selectedOrderID, setSelectedOrderID] = useState('');
    const navigate = useNavigate();

    // Lấy danh sách các OrderID duy nhất từ các dịch vụ đã có
    const existingOrderIDs = Array.from(new Set(services.map(service => service.orderID)));

    // --- NEW useEffect to fetch food/drink items ---
    useEffect(() => {
        const fetchFoodDrinkItems = async () => {
            setIsFoodDrinkLoading(true);
            try {
                const response = await fetch('http://localhost:5229/api/FoodDrink/getAllItems'); // Assuming this API
                if (response.ok) {
                    const responseData = await response.json();
                    // Assuming API returns an array directly, or an object with a 'data' array
                    const items: FoodDrinkItem[] = responseData.data && Array.isArray(responseData.data) ? responseData.data : responseData;
                    if (Array.isArray(items)) {
                        setFoodDrinkItems(items);
                        if (items.length > 0) {
                            setNewServiceName(items[0].itemName); // Set default selected service to the first item
                        }
                    } else {
                        console.error("API did not return an array for food/drink items:", responseData);
                        alert("Dữ liệu đồ ăn/thức uống trả về không đúng định dạng.");
                    }
                } else {
                    const errorText = await response.text();
                    console.error("Failed to fetch food/drink items:", errorText);
                    alert(`Lỗi khi tải danh sách đồ ăn/thức uống: ${errorText}`);
                }
            } catch (error: any) {
                console.error("Network error fetching food/drink items:", error);
                alert(`Đã xảy ra lỗi kết nối khi tải đồ ăn/thức uống: ${error.message}`);
            } finally {
                setIsFoodDrinkLoading(false);
            }
        };

        fetchFoodDrinkItems();
    }, []); // Run once on component mount

    const handleAddService = () => {
        setIsAddingService(true);
        // Set default selected service to the first item if loaded
        if (foodDrinkItems.length > 0) {
            setNewServiceName(foodDrinkItems[0].itemName);
        } else {
            setNewServiceName(''); // Keep empty if no items loaded yet
        }
        setNewServiceQuantity(1);
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
            setNewServiceQuantity(1);
            setSelectedOrderID('');
            setIsAddingService(false);
        } else {
            alert('Vui lòng chọn Tên dịch vụ và Order ID.'); // Updated alert message
        }
    };

    const handleSave = () => {
        setIsLoading(true); // Show spinner when saving
        // Simulate an API call or a long process
        setTimeout(() => {
            alert(`Đã lưu với thay đổi ở Order: ${filterText}`);
            setIsLoading(false); // Hide spinner after process
            // Navigate to /payment after the process is complete and spinner is hidden
            navigate('/QuanLyRap/QLNV');
        }, 2000); // 2 second delay for demonstration
    };

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
                    disabled={isFoodDrinkLoading} // Disable if food/drink items are still loading
                >
                    {isFoodDrinkLoading ? 'Đang tải dịch vụ...' : 'Dịch vụ thêm'}
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
                            <label className="block text-sm">Chọn ID order muốn confirm</label>
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
                                            disabled={isFoodDrinkLoading || foodDrinkItems.length === 0} // Disable if loading or no items
                                        >
                                            {isFoodDrinkLoading ? (
                                                <option value="">Đang tải...</option>
                                            ) : foodDrinkItems.length === 0 ? (
                                                <option value="">Không có dịch vụ</option>
                                            ) : (
                                                foodDrinkItems.map(item => (
                                                    <option key={item.itemId} value={item.itemName}>{item.itemName}</option>
                                                ))
                                            )}
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
                                    disabled={isFoodDrinkLoading || foodDrinkItems.length === 0} // Disable if loading or no items
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
                                <th className="p-2 border-b">Order ID</th> {/* Added Order ID column */}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredServices.map((service) => (
                                <tr key={service.id} className="border-b">
                                    <td className="p-2">{service.id}</td>
                                    <td className="p-2">{service.name}</td>
                                    <td className="p-2">{service.quantity}</td>
                                    <td className="p-2">{service.orderID}</td> {/* Display Order ID */}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-center mt-6">
                    <button
                        onClick={() => {
                            handleSave();
                            // navigate("/payment"); // This navigate will happen after handleSave's timeout
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