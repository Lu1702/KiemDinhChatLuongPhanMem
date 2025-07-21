import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './style.css';

interface Staff {
  email: string;
  password?: string;
  name: string;
  phone: string;
  dob: string;
  role: "Cashier";
  rạp: string;
}

interface FormData extends Omit<Staff, 'password'> {
  password: string;
  password2: string;
}

interface EditingStaff extends Omit<Staff, 'email' | 'password'> {
  index: number;
}

const thStyle: React.CSSProperties = { padding: "8px", textAlign: "center" };
const tdStyle: React.CSSProperties = { padding: "6px", textAlign: "center", border: "1px solid #ccc" };
const modalOverlayStyle: React.CSSProperties = {
  position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
  background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center"
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
  const [isLoading, setIsLoading] = useState(true);

  const [staffList, setStaffList] = useState<Staff[]>([
    { email: "test@email.com", password: "1234", name: "Nguyễn Văn A", phone: "123456789", dob: "01-01-2000", role: "Cashier", rạp: "A01" },
  ]);

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    password2: "",
    name: "",
    phone: "",
    dob: "",
    role: "Cashier",
    rạp: "A01",
  });

  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [editingStaff, setEditingStaff] = useState<EditingStaff | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const saveStaff = (): void => {
    if (!formData.name) {
      alert("Tên nhân viên không được để trống.");
      return;
    }
    if (formData.password !== formData.password2) {
      alert("Mật khẩu và xác nhận mật khẩu không khớp.");
      return;
    }

    const newStaff: Staff = {
      email: formData.email,
      password: formData.password,
      name: formData.name,
      phone: formData.phone,
      dob: formData.dob,
      role: formData.role,
      rạp: formData.rạp,
    };

    setStaffList([...staffList, newStaff]);
    setFormData({ email: "", password: "", password2: "", name: "", phone: "", dob: "", role: "Cashier", rạp: "A01" });
    setShowConfirmModal(false);
  };

  const handleDelete = (index: number): void => {
    const newList = [...staffList];
    newList.splice(index, 1);
    setStaffList(newList);
  };

  const handleEdit = (index: number): void => {
    const { name, phone, dob, role, rạp } = staffList[index];
    setEditingStaff({ name, phone, dob, role, rạp, index });
  };

  const handleSaveEdit = (): void => {
    if (editingStaff === null) return;

    const newList = [...staffList];
    newList[editingStaff.index] = {
      ...newList[editingStaff.index],
      name: editingStaff.name,
      phone: editingStaff.phone,
      dob: editingStaff.dob,
      role: editingStaff.role,
      rạp: editingStaff.rạp,
    };
    setStaffList(newList);
    setEditingStaff(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, field: keyof FormData): void => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, field: keyof Omit<EditingStaff, 'index'>): void => {
    if (editingStaff) {
      setEditingStaff({ ...editingStaff, [field]: e.target.value });
    }
  };

  const handleSave = () => {
    setShowConfirmModal(true);
  };

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
      {isLoading ? (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
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
      ) : (
        <>
          <div style={{
            width: "300px", background: "#231C60", padding: "16px", display: "flex",
            flexDirection: "column", gap: "12px", borderRight: "2px solid white"
          }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <img src="/images/logocinema1.png" alt="Logo" style={{ height: "40px", marginRight: "8px" }} />
            </div>
            <h3>Bạn muốn chỉnh sửa/ thêm gì</h3>
            <button onClick={() => setActiveTab("nhanvien")} className="button2">
              <span style={{ fontSize: "18px", marginRight: "8px" }}>☰</span> Nhân viên
            </button>
          </div>

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
                <h3 style={{ marginTop: "24px",fontSize:"40px" }}>Thêm nhân viên</h3>
                <div style={{
                  display: "flex", flexDirection: "column", gap: "16px",
                  maxWidth: "1000px", marginTop: "16px"
                }}>
                  <div className="uiverse-pixel-input-wrapper">
                    <label className="uiverse-pixel-label">Rạp</label>
                    <select
                      value={formData.rạp}
                      onChange={(e) => handleInputChange(e, 'rạp')}
                      className="uiverse-pixel-input"
                    >
                      <option value="A01">A01</option>
                      <option value="A02">A02</option>
                      <option value="A03">A03</option>
                      <option value="A04">A04</option>
                    </select>
                  </div>
                  <div className="uiverse-pixel-input-wrapper">
                    <label className="uiverse-pixel-label">Email Đăng nhập</label>
                    <input
                      type="text"
                      value={formData.email}
                      onChange={(e) => handleInputChange(e, 'email')}
                      className="uiverse-pixel-input"
                      placeholder="Email Đăng nhập"
                    />
                  </div>
                  <div className="uiverse-pixel-input-wrapper">
                    <label className="uiverse-pixel-label">Mật khẩu</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange(e, 'password')}
                      className="uiverse-pixel-input"
                      placeholder="Mật khẩu"
                    />
                  </div>
                  <div className="uiverse-pixel-input-wrapper">
                    <label className="uiverse-pixel-label">Xác nhận mật khẩu</label>
                    <input
                      type="password"
                      value={formData.password2}
                      onChange={(e) => handleInputChange(e, 'password2')}
                      className="uiverse-pixel-input"
                      placeholder="Xác nhận mật khẩu"
                    />
                  </div>
                  <div className="uiverse-pixel-input-wrapper">
                    <label className="uiverse-pixel-label">Ngày tháng năm sinh</label>
                    <input
                      type="text"
                      value={formData.dob}
                      onChange={(e) => handleInputChange(e, 'dob')}
                      className="uiverse-pixel-input"
                      placeholder="Ngày tháng năm sinh"
                    />
                  </div>
                  <div className="uiverse-pixel-input-wrapper">
                    <label className="uiverse-pixel-label">SĐT</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => handleInputChange(e, 'phone')}
                      className="uiverse-pixel-input"
                      placeholder="SĐT"
                    />
                  </div>
                  <div className="uiverse-pixel-input-wrapper">
                    <label className="uiverse-pixel-label">Tên nhân viên</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange(e, 'name')}
                      className="uiverse-pixel-input"
                      placeholder="Tên nhân viên"
                    />
                  </div>
                  <div className="uiverse-pixel-input-wrapper">
                    <label className="uiverse-pixel-label">Quyền hạn</label>
                    <select
                      value={formData.role}
                      onChange={(e) => handleInputChange(e, 'role')}
                      className="uiverse-pixel-input"
                    >
                      <option value="Cashier">Cashier</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginTop: "16px" }}>
                  <button onClick={handleSave} style={{
                    backgroundColor: "#add8e6", color: "black", padding: "8px 24px",
                    border: "none", borderRadius: "8px"
                  }}>Lưu</button>
                </div>
                <h3 style={{ marginTop: "24px" }}>Danh sách nhân viên</h3>
                <div style={{ maxWidth: "900px", width: "100%" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#4a80d6", color: "white" }}>
                        <th style={thStyle}>STT</th>
                        <th style={thStyle}>Tên nhân viên</th>
                        <th style={thStyle}>SĐT</th>
                        <th style={thStyle}>Ngày tháng năm sinh</th>
                        <th style={thStyle}>Role</th>
                        <th style={thStyle}>Rạp</th>
                        <th style={thStyle}>Tùy chỉnh</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staffList.map((staff, idx) => (
                        <tr key={idx} style={{ backgroundColor: "white", color: "black" }}>
                          <td style={tdStyle}>{idx + 1}</td>
                          <td style={tdStyle}>{staff.name}</td>
                          <td style={tdStyle}>{staff.phone}</td>
                          <td style={tdStyle}>{staff.dob}</td>
                          <td style={tdStyle}>{staff.role}</td>
                          <td style={tdStyle}>{staff.rạp}</td>
                          <td style={tdStyle}>
                            <button onClick={() => handleDelete(idx)} style={{ backgroundColor: '#cc3380', color: "white", border: "none", borderRadius: "4px", padding: "4px 8px" }}>Xóa</button>
                            <button onClick={() => handleEdit(idx)} style={{ backgroundColor: "#ccc", color: "black", border: "none", borderRadius: "4px", padding: "4px 8px", marginLeft: "4px" }}>Sửa</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {showConfirmModal && (
                  <div style={modalOverlayStyle}>
                    <div style={{ background: "#4c65a8", padding: "24px", borderRadius: "8px", textAlign: "center", color: "white", width: "300px" }}>
                      <div style={{ display: "flex", justifyContent: "center" }}>
                        <img src="/images/warning.png" alt="!" style={{ width: "40px", marginBottom: "8px" }} />
                      </div>
                      <p>Bạn có chắc chắn muốn lưu nhân viên này?</p>
                      <div style={{ display: "flex", justifyContent: "space-around", marginTop: "16px" }}>
                        <button onClick={saveStaff} style={{ padding: "6px 12px", border: "none", borderRadius: "4px", background: "lightgreen", color: "black" }}>Có</button>
                        <button onClick={() => setShowConfirmModal(false)} style={{ padding: "6px 12px", border: "none", borderRadius: "4px", background: '#cc3380', color: "white" }}>Không</button>
                      </div>
                    </div>
                  </div>
                )}
                {editingStaff && (
                  <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                      <h4>Chỉnh sửa nhân viên</h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {[
                          { label: "Rạp", field: "rạp", type: "select" },
                          { label: "Tên nhân viên", field: "name", type: "text" },
                          { label: "SĐT", field: "phone", type: "text" },
                          { label: "Ngày tháng năm sinh", field: "dob", type: "text" },
                          { label: "Quyền hạn", field: "role", type: "select" },
                        ].map((item, idx) => (
                          <div key={idx} className="uiverse-pixel-input-wrapper">
                            <label className="uiverse-pixel-label">{item.label}</label>
                            {item.type === "select" ? (
                              <select
                                value={editingStaff[item.field as keyof Omit<EditingStaff, 'index'>]}
                                onChange={(e) => handleEditInputChange(e, item.field as keyof Omit<EditingStaff, 'index'>)}
                                className="uiverse-pixel-input"
                              >
                                {item.field === "role" ? (
                                  <option value="Cashier">Cashier</option>
                                ) : (
                                  <>
                                    <option value="A01">A01</option>
                                    <option value="A02">A02</option>
                                    <option value="A03">A03</option>
                                    <option value="A04">A04</option>
                                  </>
                                )}
                              </select>
                            ) : (
                              <input
                                type="text"
                                value={editingStaff[item.field as keyof Omit<EditingStaff, 'index'>]}
                                onChange={(e) => handleEditInputChange(e, item.field as keyof Omit<EditingStaff, 'index'>)}
                                className="uiverse-pixel-input"
                                placeholder={item.label}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                      <div style={{ textAlign: "center", marginTop: "12px" }}>
                        <button onClick={handleSaveEdit} style={{ marginRight: "8px", padding: "6px 12px", border: "none", borderRadius: "4px", background: "lightgreen", color: "black" }}>Lưu</button>
                        <button onClick={() => setEditingStaff(null)} style={{ padding: "6px 12px", border: "none", borderRadius: "4px", background: '#cc3380', color: "white" }}>Hủy</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

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
        </>
      )}
    </div>
  );
}