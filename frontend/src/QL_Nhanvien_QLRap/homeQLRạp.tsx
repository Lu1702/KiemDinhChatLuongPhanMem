import React, { useState, useEffect, useCallback } from "react";
import Nav from "../Header/nav";
import Bottom from "../Footer/bottom";
import { useNavigate } from "react-router-dom";

// Define interfaces
interface Cinema {
    cinemaId: string;
    cinemaName: string;
}

interface Role {
    roleName: string;
    roleid: string;
}

interface Staff {
    staffId: string;
    staffName: string;
    staffPhoneNumber: string;
    dayOfBirth: string;
    cinemaName: string;
    cinemaId: string;
    staffRole: string;
}

interface AddStaffFormData {
    staffId: string; // Thêm staffId để hỗ trợ sau này nếu cần
    cinemaId: string;
    loginUserEmail: string;
    loginUserPassword: string;
    loginUserPasswordConfirm: string;
    staffName: string;
    dateOfBirth: string;
    phoneNumer: string;
    role: string;
}

interface EditingStaff {
    staffId: string;
    staffName: string;
    dateOfBirth: string;
    phoneNumer: string;
    cinemaId: string;
    staffRole: string;
}

// Utility function to format date
const formatDate = (dateStr: string) => dateStr ? new Date(dateStr).toISOString().split("T")[0] : "";

const Info: React.FC = () => {
    const userEmail = localStorage.getItem("userEmail");
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState<string | null>(localStorage.getItem("role") || null);
    const [activeTab, setActiveTab] = useState<"info" | "password" | "nhanvien">("info");
    const [addStaffFormData, setAddStaffFormData] = useState<AddStaffFormData>({
        staffId: "",
        cinemaId: "",
        loginUserEmail: "",
        loginUserPassword: "",
        loginUserPasswordConfirm: "",
        staffName: "",
        dateOfBirth: "",
        phoneNumer: "",
        role: "Cashier", // Giá trị mặc định
    });
    const [cinemas, setCinemas] = useState<Cinema[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [editingStaff, setEditingStaff] = useState<EditingStaff | null>(null);
    const [loading, setLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch cinemas
    useEffect(() => {
        const fetchCinemas = async () => {
            try {
                const response = await fetch("http://localhost:5229/api/Cinema/getCinemaList");
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                if (data.status === "Success" && data.data) {
                    setCinemas(data.data);
                    if (data.data.length > 0) setAddStaffFormData(prev => ({ ...prev, cinemaId: data.data[0].cinemaId }));
                }
            } catch (error) {
                alert("Không thể tải danh sách rạp. Vui lòng thử lại sau.");
            }
        };
        fetchCinemas();
    }, []);

    // Fetch roles
    useEffect(() => {
        const fetchRoles = async () => {
            const authToken = localStorage.getItem('authToken');
            if (!authToken) {
                console.error('Không tìm thấy token xác thực. Vui lòng đăng nhập.');
                navigate('/');
                return;
            }
            try {
                const response = await fetch("http://localhost:5229/api/Staff/GetRoleList", {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    }
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                if (data.status === "Success" && data.data) {
                    setRoles(data.data);
                    if (data.data.length > 0) {
                        setAddStaffFormData(prev => ({ ...prev, role: data.data[0].roleid }));
                    }
                } else {
                    console.error("Lỗi khi tải danh sách vai trò:", data.message);
                }
            } catch (error: any) {
                console.error("Lỗi khi tải danh sách vai trò:", error.message);
            }
        };
        fetchRoles();
    }, []);

    // Fetch staff list
    const fetchStaffList = useCallback(async () => {
        const roleName = localStorage.getItem('role');
        if (activeTab !== "nhanvien" || roleName !== "TheaterManager") return;
        try {
            setIsInitialLoading(true);
            const authToken = localStorage.getItem('authToken');
            if (!authToken) {
                console.error('Không tìm thấy token xác thực. Vui lòng đăng nhập.');
                navigate('/login');
                return;
            }
            const response = await fetch("http://localhost:5229/api/Staff/GetStaffList", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            if (data.status === "Success" && data.data) {
                const formattedStaffList = data.data.map((staff: any) => ({
                    staffId: staff.staffId,
                    staffName: staff.staffName,
                    staffPhoneNumber: staff.staffPhoneNumber,
                    dayOfBirth: formatDate(staff.dayOfBirth),
                    cinemaName: staff.cinemaName,
                    cinemaId: staff.cinemaId,
                    staffRole: staff.staffRole,
                }));
                setStaffList(formattedStaffList);
                setError(null);
            } else {
                setError("Không thể tải danh sách nhân viên.");
            }
        } catch (error) {
            setError("Lỗi khi tải danh sách nhân viên. Vui lòng thử lại.");
        } finally {
            setIsInitialLoading(false);
        }
    }, [activeTab, userRole]);

    useEffect(() => {
        if (staffList.length === 0) fetchStaffList();
    }, [fetchStaffList, staffList.length]);

    // Handle Add Staff input change
    const handleAddStaffInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, field: keyof AddStaffFormData): void => {
        setAddStaffFormData({ ...addStaffFormData, [field]: e.target.value });
    };

    // Handle Add Staff submission
    const handleAddStaffSubmit = async () => {
        if (!addStaffFormData.staffName || !addStaffFormData.loginUserEmail || !addStaffFormData.cinemaId || !addStaffFormData.role) {
            alert("Vui lòng điền đầy đủ thông tin bắt buộc (Email, Tên nhân viên, Rạp, Vai trò).");
            return;
        }
        if (addStaffFormData.loginUserPassword !== addStaffFormData.loginUserPasswordConfirm) {
            alert("Mật khẩu và xác nhận mật khẩu không khớp.");
            return;
        }

        setLoading(true);
        try {
            const dateOfBirthISO = addStaffFormData.dateOfBirth ? new Date(addStaffFormData.dateOfBirth).toISOString() : "";
            const authToken = localStorage.getItem('authToken');
            if (!authToken) {
                console.error('Không tìm thấy token xác thực. Vui lòng đăng nhập.');
                navigate('/login');
                return;
            }
            const response = await fetch("http://localhost:5229/api/Staff/AddStaff", {
                method: "POST",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${authToken}` },
                body: JSON.stringify({
                    loginUserEmail: addStaffFormData.loginUserEmail,
                    loginUserPassword: addStaffFormData.loginUserPassword,
                    loginUserPasswordConfirm: addStaffFormData.loginUserPasswordConfirm,
                    staffName: addStaffFormData.staffName,
                    dateOfBirth: dateOfBirthISO,
                    phoneNumer: addStaffFormData.phoneNumer,
                    cinemaId: addStaffFormData.cinemaId,
                    roleId: addStaffFormData.role,
                }),
            });

            if (!response.ok) throw new Error((await response.json()).message || `Lỗi HTTP: ${response.status}`);
            const result = await response.json();
            if (result.status === "Success") {
                alert("Thêm nhân viên thành công!");
                await fetchStaffList();
                setAddStaffFormData({
                    staffId: "",
                    cinemaId: cinemas.length > 0 ? cinemas[0].cinemaId : "",
                    loginUserEmail: "",
                    loginUserPassword: "",
                    loginUserPasswordConfirm: "",
                    staffName: "",
                    dateOfBirth: "",
                    phoneNumer: "",
                    role: roles.length > 0 ? roles[0].roleid : "Cashier",
                });
            } else alert(`Lỗi: ${result.message}`);
        } catch (error: any) {
            setError(`Lỗi khi thêm nhân viên: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Handle Delete Staff
    const handleDelete = async (staffIdToDelete: string): Promise<void> => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa nhân viên với ID: ${staffIdToDelete} không?`)) return;
        setLoading(true);
        try {
            const authToken = localStorage.getItem('authToken');
            const response = await fetch(`http://localhost:5229/api/Staff/DeleteStaff?id=${staffIdToDelete}`, {
                method: "DELETE",
                headers: { 'accept': "*/*", 'Authorization': `Bearer ${authToken}` },
            });
            if (response.ok) {
                alert("Xóa nhân viên thành công!");
                await fetchStaffList();
            } else throw new Error((await response.json()).message || `Lỗi HTTP: ${response.status}`);
        } catch (error: any) {
            alert(`Lỗi khi xóa nhân viên: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Handle Edit Staff
    const handleEdit = (staffIdToEdit: string): void => {
        const staffToEdit = staffList.find((staff) => staff.staffId === staffIdToEdit);
        if (staffToEdit) {
            setEditingStaff({
                staffId: staffToEdit.staffId,
                staffName: staffToEdit.staffName,
                dateOfBirth: staffToEdit.dayOfBirth,
                phoneNumer: staffToEdit.staffPhoneNumber,
                cinemaId: staffToEdit.cinemaId,
                staffRole: staffToEdit.staffRole || "Cashier",
            });
        }
    };

    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, field: keyof Omit<EditingStaff, "staffId">): void => {
        if (editingStaff) {
            setEditingStaff({ ...editingStaff, [field]: e.target.value });
        }
    };

    const handleSaveEdit = async () => {
        if (!editingStaff) return;
        setLoading(true);
        try {
            const dateOfBirthISO = editingStaff.dateOfBirth ? new Date(editingStaff.dateOfBirth).toISOString() : "";
            const payload = {
                staffId: editingStaff.staffId,
                staffName: editingStaff.staffName,
                staffPhoneNumber: editingStaff.phoneNumer,
                dateOfBirth: dateOfBirthISO,
                cinemaId: editingStaff.cinemaId,
                staffRole: editingStaff.staffRole,
            };
            const authToken = localStorage.getItem('authToken');
            const response = await fetch(`http://localhost:5229/api/Staff/editStaff?id=${editingStaff.staffId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${authToken}` },
                body: JSON.stringify(payload),
            });
            if (response.ok) {
                alert(`Cập nhật nhân viên ${editingStaff.staffName} thành công!`);
                await fetchStaffList();
                setEditingStaff(null);
            } else throw new Error((await response.json()).message || `Lỗi HTTP: ${response.status}`);
        } catch (error: any) {
            alert(`Lỗi khi cập nhật: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("userEmail");
        localStorage.removeItem("authToken");
        localStorage.removeItem("role");
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-fixed bg-cover bg-center" style={{ backgroundImage: "url('https://images8.alphacoders.com/136/thumb-1920-1368754.jpeg')" }}>
            <div className="sticky top-0 z-50 bg-slate-900 shadow-md mb-4">
                <div className="max-w-screen-xl mx-auto px-8"><Nav /></div>
            </div>
            <div className="max-w-6xl mx-auto py-10 px-4 md:flex gap-8">
                <div className="sticky top-32 h-fit self-start bg-white/20 backdrop-blur-md p-4 rounded-xl w-full md:w-1/4 space-y-4 shadow-lg">
                    <button className={`w-full px-4 py-2 rounded-lg text-left font-medium ${activeTab === "info" ? "bg-yellow-300 text-black" : "hover:bg-white/30 text-white"}`} onClick={() => setActiveTab("info")}>Thông tin cá nhân</button>
                    <button className={`w-full px-4 py-2 rounded-lg text-left font-medium ${activeTab === "password" ? "bg-yellow-300 text-black" : "hover:bg-white/30 text-white"}`} onClick={() => setActiveTab("password")}>Đổi mật khẩu</button>
                    {userRole === "TheaterManager" && (
                        <div className="mt-6 pt-6 border-t border-white/30">
                            <h3 className="text-lg font-bold text-white mb-4">Quản Lý Rạp</h3>
                            <button className={`w-full px-4 py-2 rounded-lg text-left font-medium ${activeTab === "nhanvien" ? "bg-yellow-300 text-black" : "hover:bg-white/30 text-white"}`} onClick={() => setActiveTab("nhanvien")}>Danh sách nhân viên</button>
                        </div>
                    )}
                    {process.env.NODE_ENV === "development" && <p className="text-white text-sm">Debug: userRole = {userRole}</p>}
                </div>
                <div className="flex-1 space-y-8 mt-8 md:mt-0">
                    <h1 className="text-white text-3xl font-bold text-center uppercase">Cinema xin chào! {userEmail}</h1>
                    {activeTab === "info" && (
                        <div className="bg-[#f7eaff]/50 p-6 rounded-2xl shadow-xl">
                            <h2 className="text-2xl font-bold mb-6">Thông tin cá nhân</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div><label className="block mb-2 font-semibold">Họ và tên:</label><input type="text" className="w-full border rounded-md px-4 py-2 bg-white/50" /></div>
                                <div><label className="block mb-2 font-semibold">Ngày sinh:</label><input type="date" className="w-full border rounded-md px-4 py-2 bg-white/50" /></div>
                                <div><label className="block mb-2 font-semibold">Email:</label><input type="email" className="w-full border rounded-md px-4 py-2 bg-white/50" /></div>
                                <div><label className="block mb-2 font-semibold">Địa chỉ:</label><input type="text" className="w-full border rounded-md px-4 py-2 bg-white/50" /></div>
                                <div className="md:col-span-2"><label className="block mb-2 font-semibold">CCCD:</label><input type="number" className="w-full border rounded-md px-4 py-2 bg-white/50" /></div>
                            </div>
                            <div className="mt-6 text-center">
                                <button className="bg-yellow-950 text-yellow-400 border border-yellow-400 border-b-4 font-medium overflow-hidden relative px-4 py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group">
                                    <span className="bg-yellow-400 shadow-yellow-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>Lưu thông tin
                                </button>
                            </div>
                        </div>
                    )}
                    {activeTab === "password" && (
                        <div className="bg-[#f7eaff]/50 p-6 rounded-2xl shadow-xl">
                            <h2 className="text-2xl font-bold mb-6">Đổi mật khẩu</h2>
                            <div className="space-y-4">
                                <div><label className="block mb-2 font-semibold">Mật khẩu cũ</label><input type="password" className="w-full border rounded-md px-4 py-2 bg-white/50" /></div>
                                <div><label className="block mb-2 font-semibold">Mật khẩu mới</label><input type="password" className="w-full border rounded-md px-4 py-2 bg-white/50" /></div>
                                <div><label className="block mb-2 font-semibold">Xác nhận mật khẩu mới</label><input type="password" className="w-full border rounded-md px-4 py-2 bg-white/50" /></div>
                            </div>
                            <div className="mt-6 text-center">
                                <button className="bg-yellow-950 text-yellow-400 border border-yellow-400 border-b-4 font-medium overflow-hidden relative px-4 py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group">
                                    <span className="bg-yellow-400 shadow-yellow-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>Cập nhật mật khẩu
                                </button>
                            </div>
                        </div>
                    )}
                    {activeTab === "nhanvien" && userRole === "TheaterManager" && (
                        <div className="bg-[#f7eaff]/50 p-6 rounded-2xl shadow-xl">
                            <h2 className="text-2xl font-bold mb-6">Thêm Nhân Viên</h2>
                            <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "16px", maxWidth: "1000px", marginTop: "25px", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px", minWidth: "280px" }}>
                                    <div className="uiverse-pixel-input-wrapper"><h3 style={{ fontSize: "24px", fontWeight: "bold", fontStyle: "italic" }}>Thông tin đăng nhập</h3></div>
                                    <div className="uiverse-pixel-input-wrapper">
                                        <label className="uiverse-pixel-label">Rạp</label>
                                        <select value={addStaffFormData.cinemaId} onChange={(e) => handleAddStaffInputChange(e, "cinemaId")} className="uiverse-pixel-input" required>
                                            <option value="" disabled>-- Chọn rạp --</option>
                                            {cinemas.map((cinema) => <option key={cinema.cinemaId} value={cinema.cinemaId}>{cinema.cinemaName}</option>)}
                                        </select>
                                    </div>
                                    <div className="uiverse-pixel-input-wrapper">
                                        <label className="uiverse-pixel-label">Email Đăng nhập</label>
                                        <input type="email" value={addStaffFormData.loginUserEmail} onChange={(e) => handleAddStaffInputChange(e, "loginUserEmail")} className="uiverse-pixel-input" placeholder="Email Đăng nhập" required />
                                    </div>
                                    <div className="uiverse-pixel-input-wrapper">
                                        <label className="uiverse-pixel-label">Mật khẩu</label>
                                        <input type="password" value={addStaffFormData.loginUserPassword} onChange={(e) => handleAddStaffInputChange(e, "loginUserPassword")} className="uiverse-pixel-input" placeholder="Mật khẩu" required />
                                    </div>
                                    <div className="uiverse-pixel-input-wrapper">
                                        <label className="uiverse-pixel-label">Xác nhận mật khẩu</label>
                                        <input type="password" value={addStaffFormData.loginUserPasswordConfirm} onChange={(e) => handleAddStaffInputChange(e, "loginUserPasswordConfirm")} className="uiverse-pixel-input" placeholder="Xác nhận mật khẩu" required />
                                    </div>
                                </div>
                                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px", minWidth: "280px" }}>
                                    <div className="uiverse-pixel-input-wrapper"><h3 style={{ fontSize: "24px", fontWeight: "bold", fontStyle: "italic" }}>Thông tin cá nhân</h3></div>
                                    <div className="uiverse-pixel-input-wrapper">
                                        <label className="uiverse-pixel-label">Tên nhân viên</label>
                                        <input type="text" value={addStaffFormData.staffName} onChange={(e) => handleAddStaffInputChange(e, "staffName")} className="uiverse-pixel-input" placeholder="Tên nhân viên" required />
                                    </div>
                                    <div className="uiverse-pixel-input-wrapper">
                                        <label className="uiverse-pixel-label">Ngày tháng năm sinh</label>
                                        <input type="date" value={addStaffFormData.dateOfBirth} onChange={(e) => handleAddStaffInputChange(e, "dateOfBirth")} className="uiverse-pixel-input" placeholder="Ngày tháng năm sinh" />
                                    </div>
                                    <div className="uiverse-pixel-input-wrapper">
                                        <label className="uiverse-pixel-label">SĐT</label>
                                        <input type="tel" value={addStaffFormData.phoneNumer} onChange={(e) => handleAddStaffInputChange(e, "phoneNumer")} className="uiverse-pixel-input" placeholder="Số điện thoại" />
                                    </div>
                                    <div className="uiverse-pixel-input-wrapper">
                                        <label className="uiverse-pixel-label">Role</label>
                                        <select value={addStaffFormData.role} onChange={(e) => handleAddStaffInputChange(e, "role")} className="uiverse-pixel-input" required>
                                            <option value="" disabled>-- Chọn quyền hạn --</option>
                                            {roles.map((role) => <option key={role.roleid} value={role.roleid}>{role.roleName}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 text-center">
                                <button className="bg-yellow-950 text-yellow-400 border border-yellow-400 border-b-4 font-medium overflow-hidden relative px-4 py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group" onClick={handleAddStaffSubmit} disabled={loading}>
                                    <span className="bg-yellow-400 shadow-yellow-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
                                    {loading ? "Đang xử lý..." : "Thêm nhân viên"}
                                </button>
                            </div>
                            <div className="mt-8">
                                <h2 className="text-2xl font-bold mb-4">Danh sách nhân viên</h2>
                                {error && <p className="text-red-500 mb-4">{error}</p>}
                                {isInitialLoading ? (
                                    <p className="text-white">Đang tải danh sách...</p>
                                ) : staffList.length === 0 ? (
                                    <p className="text-white">Không có nhân viên nào.</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full bg-white/50 rounded-lg shadow-md">
                                            <thead>
                                                <tr className="bg-yellow-950 text-white">
                                                    <th className="px-4 py-2">ID</th>
                                                    <th className="px-4 py-2">Tên</th>
                                                    <th className="px-4 py-2">Ngày sinh</th>
                                                    <th className="px-4 py-2">SĐT</th>
                                                    <th className="px-4 py-2">Rạp</th>
                                                    <th className="px-4 py-2">Vai trò</th>
                                                    <th className="px-4 py-2">Tùy Chọn</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {staffList.map((staff) => (
                                                    <tr key={staff.staffId} className="border-t">
                                                        <td className="px-4 py-2">{staff.staffId}</td>
                                                        <td className="px-4 py-2">{staff.staffName}</td>
                                                        <td className="px-4 py-2">{staff.dayOfBirth}</td>
                                                        <td className="px-4 py-2">{staff.staffPhoneNumber}</td>
                                                        <td className="px-4 py-2">{staff.cinemaName}</td> {/* Hiển thị cinemaName */}
                                                        <td className="px-4 py-2">Cashier</td> {/* Hiển thị cố định "Cashier" */}
                                                        <td className="px-4 py-2">
                                                            <button onClick={() => handleEdit(staff.staffId)} className="mr-2 bg-blue-500 text-white px-2 py-1 rounded">Sửa</button>
                                                            <button onClick={() => handleDelete(staff.staffId)} className="bg-red-500 text-white px-2 py-1 rounded">Xóa</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                            {editingStaff && (
                                <div className="mt-6 bg-white/50 p-4 rounded-lg shadow-xl">
                                    <h3 className="text-xl font-bold mb-4">Chỉnh sửa nhân viên</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block mb-2 font-semibold">Tên nhân viên</label>
                                            <input type="text" value={editingStaff.staffName} onChange={(e) => handleEditInputChange(e, "staffName")} className="w-full border rounded-md px-4 py-2" />
                                        </div>
                                        <div>
                                            <label className="block mb-2 font-semibold">Ngày sinh</label>
                                            <input type="date" value={editingStaff.dateOfBirth} onChange={(e) => handleEditInputChange(e, "dateOfBirth")} className="w-full border rounded-md px-4 py-2" />
                                        </div>
                                        <div>
                                            <label className="block mb-2 font-semibold">SĐT</label>
                                            <input type="tel" value={editingStaff.phoneNumer} onChange={(e) => handleEditInputChange(e, "phoneNumer")} className="w-full border rounded-md px-4 py-2" />
                                        </div>
                                        <div>
                                            <label className="block mb-2 font-semibold">Rạp</label>
                                            <select value={editingStaff.cinemaId} onChange={(e) => handleEditInputChange(e, "cinemaId")} className="w-full border rounded-md px-4 py-2">
                                                {cinemas.map((cinema) => <option key={cinema.cinemaId} value={cinema.cinemaId}>{cinema.cinemaName}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block mb-2 font-semibold">Vai trò</label>
                                            <select value={editingStaff.staffRole} onChange={(e) => handleEditInputChange(e, "staffRole")} className="w-full border rounded-md px-4 py-2">
                                                <option value="Cashier">Cashier</option> {/* Cố định vai trò là Cashier */}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mt-4 text-center">
                                        <button onClick={handleSaveEdit} className="bg-green-500 text-white px-4 py-2 rounded" disabled={loading}>
                                            {loading ? "Đang lưu..." : "Lưu"}
                                        </button>
                                        <button onClick={() => setEditingStaff(null)} className="ml-2 bg-gray-500 text-white px-4 py-2 rounded">Hủy</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <div className="flex justify-center mt-10">
                <button className="group flex items-center justify-start w-11 h-11 bg-red-600 rounded-full cursor-pointer relative overflow-hidden transition-all duration-200 shadow-lg hover:w-32 hover:rounded-lg active:translate-x-1 active:translate-y-1">
                    <div className="flex items-center justify-center w-full transition-all duration-300 group-hover:justify-start group-hover:px-3">
                        <svg className="w-4 h-4" viewBox="0 0 512 512" fill="white">
                            <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path>
                        </svg>
                    </div>
                    <div onClick={handleLogout} className="absolute right-3 transform translate-x-full opacity-0 text-white text-lg font-semibold transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">Đăng xuất</div>
                </button>
            </div>
            <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="fixed bottom-6 right-6 z-50 px-4 py-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all border cursor-pointer">↑</button>
            <div className="sticky mx-auto mt-28"><Bottom /></div>
        </div>
    );
};

export default Info;