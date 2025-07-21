import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './style.css'; // Đảm bảo rằng file CSS này chứa các style cho uiverse-pixel-input và button2

// Giao diện cho một rạp chiếu phim (Cinema)
interface Cinema {
    cinemaId: string;
    cinemaName: string;
    cinemaLocation: string;
    cinemaDescription: string;
    cinemaContactNumber: string;
}

// Giao diện cho dữ liệu nhân viên khi nhận từ API GetStaffList
interface Staff {
    staffId: string; // ID duy nhất của nhân viên
    staffName: string;
    staffPhoneNumber: string;
    dayOfBirth: string; // API trả về dạng string (ISO 8601)
    cinemaId: string;
    staffRole: string; // Vai trò của nhân viên
    loginUserEmail: string; // Thêm trường email để khớp với dữ liệu đăng nhập
}

// Giao diện cho dữ liệu form khi THÊM nhân viên (dùng cho AddStaff API)
interface AddStaffFormData {
    loginUserEmail: string;
    loginUserPassword: string;
    loginUserPasswordConfirm: string; // Chỉ dùng trong client-side để xác nhận
    staffName: string;
    dateOfBirth: string; // Dạng YYYY-MM-DD cho input type="date"
    phoneNumer: string; // Tên trường theo API AddStaff
    cinemaId: string; // ID của rạp
    // staffRole không có ở đây vì nó sẽ được gán mặc định khi gửi API
}

// Giao diện cho dữ liệu khi CHỈNH SỬA nhân viên (dùng cho UpdateStaff API)
interface EditingStaff {
    staffId: string; // ID của nhân viên đang chỉnh sửa
    staffName: string;
    dateOfBirth: string; // Dạng YYYY-MM-DD cho input type="date"
    phoneNumer: string; // Tên trường theo API UpdateStaff
    cinemaId: string;
    staffRole: string; // Giữ trường role để chỉnh sửa nếu cần
}

// Styles
const thStyle: React.CSSProperties = { padding: "8px", textAlign: "center" };
const tdStyle: React.CSSProperties = { padding: "6px", textAlign: "center", border: "1px solid #ccc" };
const modalOverlayStyle: React.CSSProperties = {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
};
const modalContentStyle: React.CSSProperties = {
    background: "#1a1143", color: "white", padding: "20px",
    borderRadius: "8px", minWidth: "300px"
};

export default function QuanLy() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<"nhanvien">("nhanvien");
    const [showAccountMenu, setShowAccountMenu] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // Spinner chung cho các thao tác
    const [isInitialLoading, setIsInitialLoading] = useState(true); // Spinner cho lần tải đầu tiên

    const [staffList, setStaffList] = useState<Staff[]>([]); // Sử dụng StaffInfoList cho danh sách
    const [cinemas, setCinemas] = useState<Cinema[]>([]); // Danh sách rạp từ API

    const [addStaffFormData, setAddStaffFormData] = useState<AddStaffFormData>({
        loginUserEmail: "",
        loginUserPassword: "",
        loginUserPasswordConfirm: "",
        staffName: "",
        dateOfBirth: "",
        phoneNumer: "",
        cinemaId: "",
    });
    
    const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false); // Modal xác nhận thêm
    const [editingStaff, setEditingStaff] = useState<EditingStaff | null>(null); // State để chỉnh sửa nhân viên

    // --- Hooks để tải dữ liệu ban đầu ---

    // Tải danh sách rạp
    useEffect(() => {
        const fetchCinemas = async () => {
            try {
                const response = await fetch('http://localhost:5229/api/Cinema/getCinemaList');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                if (data.status === "Success" && data.data) {
                    setCinemas(data.data);
                    if (data.data.length > 0) {
                        setAddStaffFormData(prev => ({
                            ...prev,
                            cinemaId: data.data[0].cinemaId // Set rạp mặc định cho form thêm
                        }));
                    }
                } else {
                    console.error("Failed to fetch cinemas:", data.message);
                }
            } catch (error) {
                console.error("Error fetching cinemas:", error);
                alert("Không thể tải danh sách rạp. Vui lòng thử lại sau.");
            }
        };
        fetchCinemas();
    }, []);

    // Tải danh sách nhân viên
    useEffect(() => {
        const fetchStaffList = async () => {
            try {
                setIsInitialLoading(true);
                const response = await fetch('http://localhost:5229/api/Staff/GetStaffList');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                if (data.status === "Success" && data.data) {
                    const formattedStaffList = data.data.map((staff: any) => ({
                        ...staff,
                        dayOfBirth: staff.dayOfBirth ? new Date(staff.dayOfBirth).toISOString().split('T')[0] : ''
                    }));
                    setStaffList(formattedStaffList);
                } else {
                    console.error("Failed to fetch staff list:", data.message);
                }
            } catch (error) {
                console.error("Error fetching staff list:", error);
                alert("Không thể tải danh sách nhân viên. Vui lòng thử lại sau.");
            } finally {
                setIsInitialLoading(false); // Tắt spinner ban đầu
            }
        };
        fetchStaffList();
    }, []);

    // --- Hàm xử lý form thêm nhân viên ---
    const handleAddStaffInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, field: keyof AddStaffFormData): void => {
        setAddStaffFormData({ ...addStaffFormData, [field]: e.target.value });
    };

    const handleSaveAddStaff = async () => {
        if (!addStaffFormData.staffName || !addStaffFormData.loginUserEmail || !addStaffFormData.cinemaId) {
            alert("Vui lòng điền đầy đủ thông tin bắt buộc (Email, Tên nhân viên, Rạp).");
            return;
        }
        if (addStaffFormData.loginUserPassword !== addStaffFormData.loginUserPasswordConfirm) {
            alert("Mật khẩu và xác nhận mật khẩu không khớp.");
            return;
        }

        setIsLoading(true); // Bật spinner cho thao tác này
        try {
            const dateOfBirthISO = addStaffFormData.dateOfBirth ? new Date(addStaffFormData.dateOfBirth).toISOString() : "";

            const response = await fetch('http://localhost:5229/api/Staff/AddStaff', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    loginUserEmail: addStaffFormData.loginUserEmail,
                    loginUserPassword: addStaffFormData.loginUserPassword,
                    loginUserPasswordConfirm: addStaffFormData.loginUserPasswordConfirm,
                    staffName: addStaffFormData.staffName,
                    dateOfBirth: dateOfBirthISO,
                    phoneNumer: addStaffFormData.phoneNumer,
                    cinemaId: addStaffFormData.cinemaId,
                    
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Lỗi HTTP: ${response.status}`);
            }

            const result = await response.json();
            if (result.status === "Success") {
                alert("Thêm nhân viên thành công!");
                // Gọi lại GetStaffList để cập nhật danh sách
                await fetch('http://localhost:5229/api/Staff/GetStaffList')
                    .then(res => res.json())
                    .then(data => {
                        if (data.status === "Success" && data.data) {
                            const formattedStaffList = data.data.map((staff: any) => ({
                                ...staff,
                                dayOfBirth: staff.dayOfBirth ? new Date(staff.dayOfBirth).toISOString().split('T')[0] : ''
                            }));
                            setStaffList(formattedStaffList);
                        }
                    });

                // Reset form
                setAddStaffFormData({
                    loginUserEmail: "",
                    loginUserPassword: "",
                    loginUserPasswordConfirm: "",
                    staffName: "",
                    dateOfBirth: "",
                    phoneNumer: "",
                    cinemaId: cinemas.length > 0 ? cinemas[0].cinemaId : "",
                });
                setShowConfirmModal(false); // Đóng modal xác nhận
            } else {
                alert(`Lỗi khi thêm nhân viên: ${result.message}`);
            }
        } catch (error: any) {
            console.error("Error adding staff:", error);
            alert(`Đã xảy ra lỗi khi thêm nhân viên: ${error.message}`);
        } finally {
            setIsLoading(false); // Tắt spinner
        }
    };

    // --- Hàm xử lý xóa nhân viên ---
    const handleDelete = async (staffIdToDelete: string): Promise<void> => {
  // Confirm with the user before proceeding
  if (!window.confirm(`Bạn có chắc chắn muốn xóa nhân viên với ID: ${staffIdToDelete} không?`)) {
    return;
  }

  setIsLoading(true); // Turn on the loading spinner

  try {
    // Loại bỏ khoảng trắng ở đầu/cuối hoặc giữa ID để đảm bảo gửi đi ID sạch
    const cleanedStaffId = staffIdToDelete; // Đã thêm lại phần này để an toàn hơn
    const response = await fetch(`http://localhost:5229/api/Staff/DeleteStaff?id=${cleanedStaffId}`, {
      method: 'DELETE', // Phương thức DELETE
      headers: { 'accept': '*/*' } // Giữ header accept nếu cần
    });
    console.log('id la ' +cleanedStaffId);
    // Check if the response was successful (status 2xx)
    if (response.ok) {
      // Check if the response has a JSON content type header
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        // If it's JSON, parse it
        const result = await response.json();
        if (result.status === "Success") {
          alert("Xóa nhân viên thành công!");
          // Update the UI by removing the deleted staff from the list
          setStaffList(prevList => prevList.filter(staff => staff.staffId !== staffIdToDelete));
        } else {
          // Handle cases where the API returns 200 OK but with a custom error status in JSON
          alert(`Lỗi khi xóa nhân viên: ${result.message || "Không xác định"}`);
        }
      } else {
        // If response is OK but not JSON (e.g., 204 No Content or plain text success)
        // No need to call response.json(), just acknowledge success.
        console.log("Delete successful, no JSON response or plain text body."); // Làm rõ hơn log
        alert("Xóa nhân viên thành công!");
        // Update the UI by removing the deleted staff from the list
        setStaffList(prevList => prevList.filter(staff => staff.staffId !== staffIdToDelete));
      }
    } else {
      // Handle HTTP errors (status 4xx or 5xx)
      let errorInfo = `Lỗi HTTP: ${response.status} ${response.statusText}`;
      try {
        // Attempt to parse error as JSON, but catch if it fails
        const errorData = await response.json();
        // Prefer a specific error message from the backend if available
        // Kiểm tra cả `errors` object cho lỗi validation chi tiết
        const validationErrors = errorData.errors ? Object.values(errorData.errors).flat().join("\n") : '';
        errorInfo = validationErrors || errorData.message || errorData.title || JSON.stringify(errorData);
      } catch (e) {
        // If parsing JSON fails, just use the HTTP status text and raw response text
        const errorText = await response.text(); // Lấy phản hồi thô
        console.warn("Could not parse error response as JSON:", e);
        errorInfo = `${errorInfo}. Chi tiết: ${errorText || "Không có thông tin chi tiết."}`; // Thêm chi tiết từ phản hồi thô
      }
      console.error("Error response from API:", response.status, response.statusText, errorInfo);
      alert(`Đã xảy ra lỗi khi xóa nhân viên: ${errorInfo}`);
    }
  } catch (error: any) {
    // Handle network errors or other unexpected issues
    console.error("Network or unexpected error during staff deletion:", error);
    alert(`Đã xảy ra lỗi kết nối hoặc không xác định: ${error.message}`);
  } finally {
    setIsLoading(false); // Turn off the loading spinner
  }
};

    // --- Hàm xử lý chỉnh sửa nhân viên ---
    const handleEdit = (staffIdToEdit: string): void => {
        const staffToEdit = staffList.find(staff => staff.staffId === staffIdToEdit);
        if (staffToEdit) {
            setEditingStaff({
                staffId: staffToEdit.staffId,
                staffName: staffToEdit.staffName,
                dateOfBirth: staffToEdit.dayOfBirth,
                phoneNumer: staffToEdit.staffPhoneNumber,
                cinemaId: staffToEdit.cinemaId,
                staffRole: staffToEdit.staffRole,
            });
        }
    };

    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, field: keyof Omit<EditingStaff, 'staffId'>): void => {
        if (editingStaff) {
            setEditingStaff({ ...editingStaff, [field]: e.target.value });
        }
    };

            const handleSaveEdit = async () => {
    if (!editingStaff) return;

    setIsLoading(true);
    try {
        const dateOfBirthISO = editingStaff.dateOfBirth ? new Date(editingStaff.dateOfBirth).toISOString() : "";

        const payload = {
            staffId: editingStaff.staffId, // Staff ID is included in the body
            staffName: editingStaff.staffName,
            staffPhoneNumber: editingStaff.phoneNumer, // Confirm this name with backend
            dateOfBirth: dateOfBirthISO,
            cinemaId: editingStaff.cinemaId,
            staffRole: editingStaff.staffRole,
        };
        console.log(editingStaff)
        const response = await fetch(`http://localhost:5229/api/Staff/editStaff?id=${editingStaff.staffId}`, { // ĐÃ SỬA: Dùng editingStaff.staffId
          method: 'PATCH', // Hoặc 'PUT', tùy thuộc vào backend của bạn
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
      });

if (response.ok) {
    // Xử lý thành công - Tương tự như code cũ của bạn
    const result = await response.json(); // Đọc JSON một lần
    alert(`Cập nhật nhân viên ${result.staffName || editingStaff.staffName} thành công!`);
    setStaffList(prevList =>
        prevList.map(staff =>
            staff.staffId === editingStaff.staffId ? {
                ...staff,
                staffName: editingStaff.staffName,
                staffPhoneNumber: editingStaff.phoneNumer,
                dateOfBirth: editingStaff.dateOfBirth,
                cinemaId: editingStaff.cinemaId,
                staffRole: editingStaff.staffRole,
            } : staff
        )
    );
} else {
                    // Xử lý lỗi - Đã sửa lỗi "body stream already read"
                    let errorInfo = `Lỗi HTTP: ${response.status} ${response.statusText}`;
                    let responseBodyText = ""; // Khai báo biến để lưu body dưới dạng text

                    try {
                        // Đọc body dưới dạng text ĐẦU TIÊN và DUY NHẤT
                        responseBodyText = await response.text(); 
                        
                        // Cố gắng parse JSON từ text đã đọc
                        const errorData = JSON.parse(responseBodyText);

                        // Nếu parse thành công, lấy thông tin lỗi từ JSON
                        const validationErrors = errorData.errors ? Object.values(errorData.errors).flat().join("\n") : '';
                        errorInfo = validationErrors || errorData.message || errorData.title || JSON.stringify(errorData);
                    } catch (e) {
                        // Nếu không parse được JSON, sử dụng responseBodyText thô
                        console.warn("Could not parse error response as JSON, using raw text:", e);
                        // responseBodyText đã được gán ở trên, sử dụng trực tiếp
                        errorInfo = `${errorInfo}. Chi tiết: ${responseBodyText || "Không có thông tin chi tiết."}`;
                    }
                    console.error("Error response from API:", response.status, response.statusText, errorInfo);
                    alert(`Đã xảy ra lỗi khi cập nhật nhân viên: ${errorInfo}`);
                }
            } catch (error: any) {
                console.error("Lỗi network hoặc không xác định khi cập nhật nhân viên:", error);
                alert(`Đã xảy ra lỗi không mong muốn: ${error.message}`);
            } finally {
                setIsLoading(false);
            }
        };
    console.log(staffList);
    
    return (
        <div style={{
            backgroundImage: "url('/images/bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            color: "white",
            minHeight: "100vh",
            display: "flex"
        }}>
            {/* Spinner chung cho toàn bộ trang */}
            {(isLoading || isInitialLoading) && (
                <div style={modalOverlayStyle}>
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
                </div>
            )}

            {/* Sidebar */}
            <div style={{
                width: "300px", background: "#231C60", padding: "16px", display: "flex",
                flexDirection: "column", gap: "12px", borderRight: "2px solid white"
            }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <img src="/images/logocinema1.png" alt="Logo" style={{ height: "40px", marginRight: "8px" }} />
                </div>
                <h3>Bạn muốn chỉnh sửa/ thêm gì</h3>
                <button onClick={() => setActiveTab("nhanvien")} className="button2">
                    <span style={{ fontSize: "18px", marginRight: "8px" }}>☰</span> Quản lý nhân viên
                </button>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <h3>Xin chào quản lý</h3>
                    <div style={{ position: "relative" }}>
                        <span style={{ fontSize: "28px", cursor: "pointer" }} onClick={() => setShowAccountMenu(!showAccountMenu)}>👤</span>
                        {showAccountMenu && (
                            <div style={{
                                position: "absolute", right: 0, top: "36px",
                                background: "#231C60", color: "white", borderRadius: "4px",
                                padding: "8px", minWidth: "100px", textAlign: "center"
                            }}>
                                <button onClick={() => { setShowLogoutModal(true); setShowAccountMenu(false); }}
                                    style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}>
                                    Đăng xuất
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {activeTab === "nhanvien" && (
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center"
                    }}>
                        <h3 style={{ marginTop: "24px", fontSize: "40px", fontWeight: "bold", color: "#CAFF38", fontStyle: "italic" }}>Thêm Nhân Viên</h3>
                        <div style={{
                            display: "flex",
                            flexDirection: "row",
                            flexWrap: "wrap",
                            gap: "16px",
                            maxWidth: "1000px",
                            marginTop: "25px",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                        }}>
                            {/* Cột thứ nhất: Thông tin đăng nhập */}
                            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px", minWidth: "280px" }}>
                                <div className="uiverse-pixel-input-wrapper">
                                    <h3 style={{ fontSize: "24px", fontWeight: "bold", fontStyle: "italic" }}>Thông tin đăng nhập</h3>
                                </div>
                                <div className="uiverse-pixel-input-wrapper">
                                    <label className="uiverse-pixel-label">Rạp</label>
                                    <select
                                        value={addStaffFormData.cinemaId}
                                        onChange={(e) => handleAddStaffInputChange(e, 'cinemaId')}
                                        className="uiverse-pixel-input"
                                        required
                                    >
                                        <option value="" disabled>-- Chọn rạp --</option>
                                        {cinemas.map((cinema) => (
                                            <option key={cinema.cinemaId} value={cinema.cinemaId}>{cinema.cinemaName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="uiverse-pixel-input-wrapper">
                                    <label className="uiverse-pixel-label">Email Đăng nhập</label>
                                    <input
                                        type="email"
                                        value={addStaffFormData.loginUserEmail}
                                        onChange={(e) => handleAddStaffInputChange(e, 'loginUserEmail')}
                                        className="uiverse-pixel-input"
                                        placeholder="Email Đăng nhập"
                                        required
                                    />
                                </div>
                                <div className="uiverse-pixel-input-wrapper">
                                    <label className="uiverse-pixel-label">Mật khẩu</label>
                                    <input
                                        type="password"
                                        value={addStaffFormData.loginUserPassword}
                                        onChange={(e) => handleAddStaffInputChange(e, 'loginUserPassword')}
                                        className="uiverse-pixel-input"
                                        placeholder="Mật khẩu"
                                        required
                                    />
                                </div>
                                <div className="uiverse-pixel-input-wrapper">
                                    <label className="uiverse-pixel-label">Xác nhận mật khẩu</label>
                                    <input
                                        type="password"
                                        value={addStaffFormData.loginUserPasswordConfirm}
                                        onChange={(e) => handleAddStaffInputChange(e, 'loginUserPasswordConfirm')}
                                        className="uiverse-pixel-input"
                                        placeholder="Xác nhận mật khẩu"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Cột thứ hai: Thông tin cá nhân */}
                            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px", minWidth: "280px" }}>
                                <div className="uiverse-pixel-input-wrapper">
                                    <h3 style={{ fontSize: "24px", fontWeight: "bold", fontStyle: "italic" }}>Thông tin cá nhân</h3>
                                </div>
                                <div className="uiverse-pixel-input-wrapper">
                                    <label className="uiverse-pixel-label">Tên nhân viên</label>
                                    <input
                                        type="text"
                                        value={addStaffFormData.staffName}
                                        onChange={(e) => handleAddStaffInputChange(e, 'staffName')}
                                        className="uiverse-pixel-input"
                                        placeholder="Tên nhân viên"
                                        required
                                    />
                                </div>
                                <div className="uiverse-pixel-input-wrapper">
                                    <label className="uiverse-pixel-label">Ngày tháng năm sinh</label>
                                    <input
                                        type="date"
                                        value={addStaffFormData.dateOfBirth}
                                        onChange={(e) => handleAddStaffInputChange(e, 'dateOfBirth')}
                                        className="uiverse-pixel-input"
                                    />
                                </div>
                                <div className="uiverse-pixel-input-wrapper">
                                    <label className="uiverse-pixel-label">SĐT</label>
                                    <input
                                        type="tel"
                                        value={addStaffFormData.phoneNumer}
                                        onChange={(e) => handleAddStaffInputChange(e, 'phoneNumer')}
                                        className="uiverse-pixel-input"
                                        placeholder="Số điện thoại"
                                    />
                                </div>
                                <div className="uiverse-pixel-input-wrapper">
                                    <label className="uiverse-pixel-label">Role</label>
                                    <select
                                        value="Cashier"
                                        className="uiverse-pixel-input"
                                        required>
                                        <option value="" disabled>-- Chọn quyền hạn --</option>
                                        <option value="Cashier">Cashier</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div style={{ marginTop: "16px" }}>
                            <button onClick={() => setShowConfirmModal(true)} style={{
                                backgroundColor: "#add8e6", color: "black", padding: "8px 24px",
                                border: "none", borderRadius: "8px"
                            }}
                                disabled={isLoading || isInitialLoading}>
                                {isLoading ? "Đang xử lý..." : "Lưu"}
                            </button>
                        </div>
                        <h3 style={{ marginTop: "80px", fontSize: "40px", fontWeight: "bold", color: "#CAFF38" }}>Danh sách nhân viên</h3>
                        <div style={{ maxWidth: "1200px", width: "150%", overflowX: "auto" }}>
                            <table style={{ marginTop: "20px", width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ backgroundColor: "#4a80d6", color: "white" }}>
                                        <th style={thStyle}>STT</th>
                                        <th style={thStyle}>Tên nhân viên</th>
                                        <th style={thStyle}>SĐT</th>
                                        <th style={thStyle}>Ngày tháng năm sinh</th>
                                        <th style={thStyle}>Rạp</th>
                                        <th style={thStyle}>Vai trò</th>
                                        <th style={thStyle}>Tùy chỉnh</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {staffList.map((staff, idx) => (
                                        <tr key={staff.staffId} style={{ backgroundColor: "white", color: "black" }}>
                                            <td style={tdStyle}>{idx + 1}</td>
                                            <td style={tdStyle}>{staff.staffName}</td>
                                            <td style={tdStyle}>{staff.staffPhoneNumber}</td>
                                            <td style={tdStyle}>{staff.dayOfBirth || ''}</td>
                                            <td style={tdStyle}>{cinemas.find(c => c.cinemaId === staff.cinemaId)?.cinemaName || staff.cinemaId}</td>
                                            <td style={tdStyle}>{staff.staffRole}</td>
                                            <td style={tdStyle}>
                                                <button onClick={() => handleDelete(staff.staffId)} style={{ backgroundColor: '#cc3380', color: "white", border: "none", borderRadius: "5px", padding: "4px 8px" }} disabled={isLoading}>Xóa</button>
                                                <button onClick={() => handleEdit(staff.staffId)} style={{ backgroundColor: "#ccc", color: "black", border: "none", borderRadius: "5px", padding: "4px 8px", marginLeft: "4px" }} disabled={isLoading}>Sửa</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Modal xác nhận thêm nhân viên */}
                        {showConfirmModal && (
                            <div style={modalOverlayStyle}>
                                <div style={{ background: "#4c65a8", padding: "24px", borderRadius: "8px", textAlign: "center", color: "white", width: "300px" }}>
                                    <div style={{ marginBottom: "8px" }}>
                                        <div style={{ display: "flex", justifyContent: "center", marginBottom: "8px" }}>
                                            <img src="/images/warning.png" alt="!" style={{ width: "40px" }} />
                                        </div>
                                    </div>
                                    <p>Bạn có chắc chắn muốn thêm nhân viên này?</p>
                                    <div style={{ display: "flex", justifyContent: "space-around", marginTop: "16px" }}>
                                        <button onClick={handleSaveAddStaff} style={{ padding: "6px 12px", border: "none", borderRadius: "4px", background: "lightgreen", color: "black" }} disabled={isLoading}>Có</button>
                                        <button onClick={() => setShowConfirmModal(false)} style={{ padding: "6px 12px", border: "none", borderRadius: "4px", background: '#cc3380', color: "white" }} disabled={isLoading}>Không</button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Modal chỉnh sửa nhân viên */}
                        {editingStaff && (
                            <div style={modalOverlayStyle}>
                                <div style={modalContentStyle}>
                                    <h4>Chỉnh sửa nhân viên</h4>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                        <div className="uiverse-pixel-input-wrapper">
                                            <label className="uiverse-pixel-label">ID Nhân viên (Không đổi)</label>
                                            <input
                                                type="text"
                                                value={editingStaff.staffId}
                                                className="uiverse-pixel-input"
                                                readOnly
                                            />
                                        </div>
                                        <div className="uiverse-pixel-input-wrapper">
                                            <label className="uiverse-pixel-label">Rạp</label>
                                            <select
                                                value={editingStaff.cinemaId}
                                                onChange={(e) => handleEditInputChange(e, 'cinemaId')}
                                                className="uiverse-pixel-input"
                                            >
                                                {cinemas.map(cinema => (
                                                    <option key={cinema.cinemaId} value={cinema.cinemaId}>{cinema.cinemaName}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="uiverse-pixel-input-wrapper">
                                            <label className="uiverse-pixel-label">Tên nhân viên</label>
                                            <input
                                                type="text"
                                                value={editingStaff.staffName}
                                                onChange={(e) => handleEditInputChange(e, 'staffName')}
                                                className="uiverse-pixel-input"
                                            />
                                        </div>
                                        <div className="uiverse-pixel-input-wrapper">
                                            <label className="uiverse-pixel-label">SĐT</label>
                                            <input
                                                type="tel"
                                                value={editingStaff.phoneNumer}
                                                onChange={(e) => handleEditInputChange(e, 'phoneNumer')}
                                                className="uiverse-pixel-input"
                                            />
                                        </div>
                                        <div className="uiverse-pixel-input-wrapper">
                                            <label className="uiverse-pixel-label">Ngày tháng năm sinh</label>
                                            <input
                                                type="date"
                                                value={editingStaff.dateOfBirth}
                                                onChange={(e) => handleEditInputChange(e, 'dateOfBirth')}
                                                className="uiverse-pixel-input"
                                            />
                                        </div>
                                        <div className="uiverse-pixel-input-wrapper">

                                          <label className="uiverse-pixel-label">Quyền hạn</label>

                                          <select
                                          className="uiverse-pixel-input">

                                          <option value="Cashier">Cashier</option>

                                          </select>

                                        </div>
                                    </div>
                                    <div style={{ textAlign: "center", marginTop: "12px" }}>
                                        <button onClick={handleSaveEdit} style={{ marginRight: "8px", padding: "6px 12px", border: "none", borderRadius: "4px", background: "lightgreen", color: "black" }} disabled={isLoading}>
                                            {isLoading ? "Đang lưu..." : "Lưu"}
                                        </button>
                                        <button onClick={() => setEditingStaff(null)} style={{ padding: "6px 12px", border: "none", borderRadius: "4px", background: '#cc3380', color: "white" }} disabled={isLoading}>Hủy</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Modal Đăng xuất */}
                {showLogoutModal && (
                    <div style={modalOverlayStyle}>
                        <div style={{ background: "#4c65a8", padding: "24px", borderRadius: "8px", textAlign: "center", color: "white", width: "300px" }}>
                            <div style={{ marginBottom: "8px" }}>
                                <div style={{ display: "flex", justifyContent: "center", marginBottom: "8px" }}>
                                    <img src="/images/warning.png" alt="!" style={{ width: "40px" }} />
                                </div>
                            </div>
                            <p>Bạn chắc chắn muốn đăng xuất không?</p>
                            <div style={{ display: "flex", justifyContent: "space-around", marginTop: "16px" }}>
                                <button onClick={() => {
                                    alert("Đã đăng xuất");
                                    setShowLogoutModal(false);
                                    navigate("/");
                                }}
                                    style={{ padding: "6px 12px", border: "none", borderRadius: "4px", background: "lightgreen", color: "black" }}>Có</button>
                                <button onClick={() => setShowLogoutModal(false)}
                                    style={{ padding: "6px 12px", border: "none", borderRadius: "4px", background: '#cc3380', color: "white" }}>Không</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}