import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './style.css';

const thStyle: React.CSSProperties = { padding: "8px", textAlign: "center" };
const tdStyle: React.CSSProperties = { padding: "6px", textAlign: "center", border: "1px solid #ccc" };

export default function QuanLy() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"rap" | "phong">("rap");
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [editRapIndex, setEditRapIndex] = useState<number | null>(null);
  const [editSeatIndex, setEditSeatIndex] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingCinemas, setIsFetchingCinemas] = useState(false);

  const [rap, setRap] = useState({
    name: "",
    diachi: "",
    mota: "",
    hotline: "",
  });

  const [phong, setPhong] = useState({
    soPhong: "",
    rap: "", // This will store cinemaName
    dinhDang: "",
    slGhe: "",
  });

  const [gheList, setGheList] = useState<{ stt: number; ghe: string }[]>([]);

  const [listRap, setListRap] = useState<any[]>([]);
  const [visualFormats, setVisualFormats] = useState<any[]>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsFetchingCinemas(true);
      try {
        const cinemaResponse = await fetch('http://localhost:5229/api/Cinema/getCinemaList');
        if (cinemaResponse.ok) {
          const responseData = await cinemaResponse.json();
          let actualCinemaData = responseData;

          if (responseData && responseData.data && Array.isArray(responseData.data)) {
            actualCinemaData = responseData.data;
          } else if (responseData && Array.isArray(responseData)) {
            actualCinemaData = responseData;
          }
          // Add other conditions if your API structure is different (e.g., responseData.cinemas)

          if (Array.isArray(actualCinemaData)) {
            setListRap(actualCinemaData.map((c: any, index: number) => ({
              stt: index + 1,
              id: c.cinemaId,
              name: c.cinemaName,
              diachi: c.cinemaLocation,
              mota: c.cinemaDescription,
              hotline: c.cinemaContactNumber
            })));
            console.log("Fetched listRap:", actualCinemaData.map((c: any) => ({ id: c.cinemaId, name: c.cinemaName }))); // Log fetched cinemas
          } else {
            console.error("API did not return an array in expected format:", responseData);
            alert("Dữ liệu rạp trả về không đúng định dạng. Vui lòng kiểm tra console và network tab.");
          }
        } else {
          const errorText = await cinemaResponse.text();
          console.error("Failed to fetch cinemas:", errorText);
          alert(`Lỗi khi tải danh sách rạp: ${errorText}`);
        }

        // Static visual formats for now. If you have an API for this, fetch it here.
        const staticVisualFormats = [
            { visualFormatID: "2D", visualFormatName: "2D" },
            { visualFormatID: "3D", visualFormatName: "3D" }
        ];
        setVisualFormats(staticVisualFormats);
        console.log("Loaded visualFormats:", staticVisualFormats); // Log loaded visual formats

      } catch (error: unknown) {
        console.error("Error fetching initial data:", (error as Error).message);
        alert(`Đã xảy ra lỗi khi tải dữ liệu: ${(error as Error).message}`);
      } finally {
        setIsFetchingCinemas(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleRapChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRap({ ...rap, [name]: value });
  };

  const handlePhongChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPhong({ ...phong, [name]: value });

    if (name === "slGhe") {
      if (value) {
        const numSeats = parseInt(value, 10);
        if (isNaN(numSeats) || numSeats <= 0) {
            setGheList([]);
            return;
        }
        const newGheList = Array.from({ length: numSeats }, (_, index) => ({
          stt: index + 1,
          ghe: `A${(index + 1).toString().padStart(2, '0')}`,
        }));
        setGheList(newGheList);
      } else {
        setGheList([]);
      }
      setEditSeatIndex(null);
    }
  };

  const handleAdd = async () => {
    if (activeTab === "rap") {
      if (rap.name && rap.diachi && rap.hotline) {
        setIsLoading(true);
        try {
          if (editRapIndex !== null) {
            const rapToUpdate = listRap[editRapIndex];
            if (!rapToUpdate || !rapToUpdate.id) {
                alert("Không tìm thấy ID rạp để cập nhật.");
                setIsLoading(false);
                return;
            }

            const updatedCinemaData = {
              cinemaId: rapToUpdate.id,
              cinemaName: rap.name,
              cinemaLocation: rap.diachi,
              cinemaDescription: rap.mota,
              cinemaContactNumber: rap.hotline,
            };

            const response = await fetch(`http://localhost:5229/api/Cinema/UpdateCinema`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(updatedCinemaData),
            });

            if (response.ok) {
                const result = await response.json();
                alert(`Đã cập nhật rạp thành công: ${result.cinemaName || rap.name}`);
                const updatedList = listRap.map((item, index) =>
                    index === editRapIndex
                        ? { ...item, name: rap.name, diachi: rap.diachi, mota: rap.mota, hotline: rap.hotline }
                        : item
                );
                setListRap(updatedList);
                setEditRapIndex(null);
                setRap({ name: "", diachi: "", mota: "", hotline: "" });
            } else {
                const errorData = await response.json();
                alert(`Lỗi khi cập nhật rạp: ${errorData.message || response.statusText}`);
                console.error('Lỗi khi cập nhật rạp:', errorData);
            }

          } else {
            const newCinemaData = {
              cinemaName: rap.name,
              cinemaLocation: rap.diachi,
              cinemaDescription: rap.mota,
              cinemaContactNumber: rap.hotline,
            };

            const response = await fetch('http://localhost:5229/api/Cinema/addCinema', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(newCinemaData),
            });

            if (response.ok) {
              const result = await response.json();
              alert(`Đã thêm rạp thành công: ${result.cinemaName || rap.name}`);
              setListRap(prevList => [...prevList, {
                stt: prevList.length > 0 ? Math.max(...prevList.map(r => r.stt)) + 1 : 1,
                id: result.cinemaId,
                name: result.cinemaName || rap.name,
                diachi: result.cinemaLocation || rap.diachi,
                mota: result.cinemaDescription || rap.mota,
                hotline: result.cinemaContactNumber || rap.hotline
              }]);
              setRap({ name: "", diachi: "", mota: "", hotline: "" });
            } else {
              const errorData = await response.json();
              alert(`Lỗi khi thêm rạp: ${errorData.message || response.statusText}`);
              console.error('Lỗi khi thêm rạp:', errorData);
            }
          }
        } catch (error: unknown) {
          alert(`Đã xảy ra lỗi: ${(error as Error).message}`);
          console.error("Lỗi network hoặc lỗi không xác định:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        alert("Vui lòng điền đầy đủ Tên rạp, Địa chỉ và Hotline!");
      }
    } else { // Xử lý khi activeTab là "phong"
      if (phong.soPhong && phong.rap && phong.dinhDang && gheList.length > 0) {
        setIsLoading(true);
        try {
          const selectedCinema = listRap.find(c => c.name === phong.rap);
          const selectedVisualFormat = visualFormats.find(vf => vf.visualFormatName === phong.dinhDang);

          // --- THÊM LOG ĐỂ KIỂM TRA GIÁ TRỊ CỦA selectedCinema và selectedVisualFormat ---
          console.log("phong.rap (selected name):", phong.rap);
          console.log("selectedCinema (found object):", selectedCinema);
          console.log("selectedCinema.id:", selectedCinema?.id); // Use optional chaining for safety

          console.log("phong.dinhDang (selected name):", phong.dinhDang);
          console.log("selectedVisualFormat (found object):", selectedVisualFormat);
          console.log("selectedVisualFormat.visualFormatID:", selectedVisualFormat?.visualFormatID); // Use optional chaining for safety


          if (!selectedCinema || !selectedCinema.id) {
              alert("Không tìm thấy rạp đã chọn hoặc rạp không có ID hợp lệ. Vui lòng chọn lại rạp.");
              setIsLoading(false);
              return;
          }
          if (!selectedVisualFormat || !selectedVisualFormat.visualFormatID) {
              alert("Không tìm thấy định dạng hình ảnh đã chọn hoặc định dạng không có ID hợp lệ. Vui lòng chọn lại định dạng.");
              setIsLoading(false);
              return;
          }

          const roomNum = parseInt(phong.soPhong, 10);
          if (isNaN(roomNum) || roomNum <= 0) {
              alert("Số phòng chiếu phải là một số nguyên dương.");
              setIsLoading(false);
              return;
          }

          const seatNumbersAsString = gheList.map(g => (parseInt(g.ghe.substring(1), 10)).toString());
          if (seatNumbersAsString.some(s => s === 'NaN')) {
              alert("Có lỗi trong việc tạo số ghế. Vui lòng kiểm tra lại SL ghế.");
              setIsLoading(false);
              return;
          }

          const requestBody = {
            roomCreateRequestDTO: {
              roomNumber: roomNum,
              cinemaID: selectedCinema.id, // Đảm bảo đây là UUID của rạp
              visualFormatID: selectedVisualFormat.visualFormatID, // Ví dụ: "2D", "3D"
              seatsNumber: seatNumbersAsString // Mảng các chuỗi
            }
          };

          console.log("Dữ liệu gửi đi cho phòng chiếu (final payload):", requestBody);

          const response = await fetch('http://localhost:5229/api/CinemaRoom/CreateRoom', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });

          if (response.ok) {
            const result = await response.json();
            alert(`Đã thêm phòng chiếu thành công: Phòng ${result.roomNumber || phong.soPhong} tại rạp ${phong.rap}`);
            setPhong({ soPhong: "", rap: "", dinhDang: "", slGhe: "" });
            setGheList([]);
          } else {
            const errorData = await response.json();
            alert(`Lỗi khi thêm phòng chiếu: ${errorData.title || response.statusText}. Chi tiết: ${JSON.stringify(errorData.errors || errorData)}`);
            console.error('Lỗi khi thêm phòng chiếu:', errorData);
          }
        } catch (error: unknown) {
          alert(`Đã xảy ra lỗi khi thêm phòng chiếu: ${(error as Error).message}`);
          console.error("Lỗi network hoặc lỗi không xác định khi thêm phòng chiếu:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        alert("Vui lòng điền đầy đủ thông tin phòng chiếu và tạo danh sách ghế!");
      }
    }
  };

  const handleDelete = async (stt: number) => {
    const rapToDelete = listRap.find(item => item.stt === stt);
    if (!rapToDelete || !rapToDelete.id) {
        alert("Không tìm thấy rạp để xóa hoặc rạp không có ID.");
        return;
    }

    if (window.confirm(`Bạn có chắc chắn muốn xóa rạp "${rapToDelete.name}" không?`)) {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:5229/api/Cinema/DeleteCinema/${rapToDelete.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          alert(`Đã xóa rạp: ${rapToDelete.name}`);
          setListRap(listRap.filter((item) => item.stt !== stt));
          setEditRapIndex(null);
        } else {
          const errorData = await response.json();
          alert(`Lỗi khi xóa rạp: ${errorData.message || response.statusText}`);
          console.error('Lỗi khi xóa rạp:', errorData);
        }
      } catch (error: unknown) {
        alert(`Đã xảy ra lỗi khi xóa rạp: ${(error as Error).message}`);
        console.error("Lỗi network hoặc lỗi không xác định khi xóa rạp:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEdit = (item: typeof listRap[0], index: number) => {
    setRap({
      name: item.name,
      diachi: item.diachi,
      mota: item.mota || "",
      hotline: item.hotline,
    });
    setEditRapIndex(index);
  };

  const handleSeatDelete = (stt: number) => {
    const deletedSeat = gheList.find((item) => item.stt === stt);
    setGheList(gheList.filter((item) => item.stt !== stt));
    setEditSeatIndex(null);
    alert(`Đã xóa ghế: ${JSON.stringify(deletedSeat, null, 2)}`);
  };

  const handleSeatEdit = (item: typeof gheList[0], index: number) => {
    setEditSeatIndex(index);
    alert(`Đã chọn ghế để sửa: ${item.ghe}`);
  };

  return (
    <div style={{
      backgroundImage: "url('/images/bg.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundAttachment: "fixed",
      color: "white",
      minHeight: "100vh",
      padding: "16px",
      display: "flex",
      flexDirection: "row",
      alignItems: "flex-start"
    }}>
      <div style={{
        width: "300px", background: "#231C60", padding: "16px", display: "flex",
        flexDirection: "column", gap: "12px", borderRight: "2px solid white",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <img src="/images/logocinema1.png" alt="Logo" style={{ height: "40px", marginRight: "8px" }} />
        </div>
        <h3>Bạn muốn chỉnh sửa/ thêm gì</h3>
        <button onClick={() => setActiveTab("rap")} className="button2">
          <span style={{ fontSize: "18px", marginRight: "8px" }}>☰</span> Rạp
        </button>
        <button onClick={() => setActiveTab("phong")} className="button2">
          <span style={{ fontSize: "18px", marginRight: "8px" }}>☰</span> Phòng chiếu
        </button>
      </div>

      <div style={{ flex: 1, padding: "24px", marginLeft: "300px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
          <h3>Xin chào Quản trị viên hệ thống</h3>
          <div style={{ position: "relative" }}>
            <span style={{ fontSize: "28px", cursor: "pointer" }} onClick={() => setShowAccountMenu(!showAccountMenu)}>👤</span>
            {showAccountMenu && (
              <div style={{
                position: "absolute", right: 0, top: "36px",
                background: "#231C60", color: "white", borderRadius: "4px",
                padding: "8px", minWidth: "100px", textAlign: "center"
              }}>
                <button onClick={() => { setShowLogoutModal(true); setShowAccountMenu(false); }}
                  style={{ background: "", border: "", color: "White", cursor: "pointer" }}>
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
          {activeTab === "rap" ? (
            <>
              <h4 style={{ marginTop: "16px" }}>Chỉnh sửa Rạp</h4>
              <div style={{ marginTop: "16px", maxWidth: "400px", display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
                <div className="uiverse-pixel-input-wrapper">
                  <label className="uiverse-pixel-label">Tên rạp</label>
                  <input
                    name="name"
                    value={rap.name}
                    onChange={handleRapChange}
                    placeholder="Tên rạp"
                    className="uiverse-pixel-input"
                  />
                </div>
                <div className="uiverse-pixel-input-wrapper">
                  <label className="uiverse-pixel-label">Địa chỉ</label>
                  <input
                    name="diachi"
                    value={rap.diachi}
                    onChange={handleRapChange}
                    placeholder="Địa chỉ"
                    className="uiverse-pixel-input"
                  />
                </div>
                <div className="uiverse-pixel-input-wrapper">
                  <label className="uiverse-pixel-label">Miêu tả</label>
                  <input
                    name="mota"
                    value={rap.mota}
                    onChange={handleRapChange}
                    placeholder="Miêu tả"
                    className="uiverse-pixel-input"
                  />
                </div>
                <div className="uiverse-pixel-input-wrapper">
                  <label className="uiverse-pixel-label">Số hotline</label>
                  <input
                    name="hotline"
                    value={rap.hotline}
                    onChange={handleRapChange}
                    placeholder="Số hotline"
                    className="uiverse-pixel-input"
                  />
                </div>
              </div>
              <button
                onClick={handleAdd}
                style={{
                  background: "#add8e6", color: "black", padding: "8px 24px",
                  border: "none", borderRadius: "8px", cursor: "pointer",
                  marginTop: "16px"
                }}
                disabled={isLoading}
              >
                {isLoading ? 'Đang xử lý...' : (editRapIndex !== null ? "Cập nhật rạp" : "Thêm rạp")}
              </button>

              <h4 style={{ marginTop: "24px" }}>Danh sách Rạp</h4>
              <table className="revenue-table" style={{ width: "auto", marginTop: "10px" }}>
                <thead>
                  <tr>
                    <th style={thStyle}>STT</th>
                    <th style={thStyle}>Tên rạp</th>
                    <th style={thStyle}>Địa chỉ</th>
                    <th style={thStyle}>Miêu tả</th>
                    <th style={thStyle}>Hotline</th>
                    <th style={thStyle}>Tùy chỉnh</th>
                  </tr>
                </thead>
                <tbody>
                  {isFetchingCinemas ? (
                    <tr><td colSpan={6} style={{textAlign: 'center'}}>Đang tải danh sách rạp...</td></tr>
                  ) : listRap.length === 0 ? (
                    <tr><td colSpan={6} style={{textAlign: 'center'}}>Không có rạp nào.</td></tr>
                  ) : (
                    listRap.map((item, index) => (
                      <tr key={item.id || item.stt}>
                        <td style={tdStyle}>{item.stt}</td>
                        <td style={tdStyle}>{item.name}</td>
                        <td style={tdStyle}>{item.diachi}</td>
                        <td style={tdStyle}>{item.mota}</td>
                        <td style={tdStyle}>{item.hotline}</td>
                        <td style={tdStyle}>
                          <button
                            onClick={() => handleDelete(item.stt)}
                            style={{ backgroundColor: '#cc3380', color: "white", border: "none", borderRadius: "4px", padding: "4px 8px", marginRight: "4px" }}
                            disabled={isLoading}
                          >
                            Xóa
                          </button>
                          <button
                            onClick={() => handleEdit(item, index)}
                            style={{ backgroundColor: "#ccc", color: "black", border: "none", borderRadius: "4px", padding: "4px 8px" }}
                            disabled={isLoading}
                          >
                            Sửa
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </>
          ) : (
            <>
              <h4 style={{ marginTop: "16px" }}>Phòng chiếu</h4>
              <div style={{ marginTop: "16px", maxWidth: "500px", display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
                <div className="uiverse-pixel-input-wrapper">
                  <label className="uiverse-pixel-label">Số phòng chiếu</label>
                  <input
                    type="number"
                    name="soPhong"
                    value={phong.soPhong}
                    onChange={handlePhongChange}
                    placeholder="Số phòng chiếu"
                    className="uiverse-pixel-input"
                    min="1"
                  />
                </div>
                <div className="uiverse-pixel-input-wrapper">
                  <label className="uiverse-pixel-label">Rạp</label>
                  <select
                    name="rap"
                    value={phong.rap}
                    onChange={handlePhongChange}
                    className="uiverse-pixel-input"
                  >
                    <option value="">Chọn rạp</option>
                    {isFetchingCinemas ? (
                        <option disabled>Đang tải rạp...</option>
                    ) : (
                        listRap.map((item) => (
                            <option key={item.id} value={item.name}>{item.name}</option>
                        ))
                    )}
                  </select>
                </div>
                <div className="uiverse-pixel-input-wrapper">
                  <label className="uiverse-pixel-label">Định dạng hình ảnh</label>
                  <select
                    name="dinhDang"
                    value={phong.dinhDang}
                    onChange={handlePhongChange}
                    className="uiverse-pixel-input"
                  >
                    <option value="">Chọn định dạng</option>
                    {visualFormats.map(format => (
                        <option key={format.visualFormatID} value={format.visualFormatName}>
                            {format.visualFormatName}
                        </option>
                    ))}
                  </select>
                </div>
                <div className="uiverse-pixel-input-wrapper">
                  <label className="uiverse-pixel-label">SL ghế</label>
                  <select
                    name="slGhe"
                    value={phong.slGhe}
                    onChange={handlePhongChange}
                    className="uiverse-pixel-input"
                  >
                    <option value="">Chọn</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                    <option value="150">150</option>
                    <option value="200">200</option>
                  </select>
                </div>
              </div>

              {gheList.length > 0 && (
                <table className="revenue-table" style={{ width: "auto", marginTop: "20px" }}>
                  <thead>
                    <tr>
                      <th style={thStyle}>STT</th>
                      <th style={thStyle}>Tên ghế</th>
                      <th style={thStyle}>Tùy chỉnh</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gheList.map((item, index) => (
                      <tr key={item.stt}>
                        <td style={tdStyle}>{item.stt}</td>
                        <td style={tdStyle}>{item.ghe}</td>
                        <td style={tdStyle}>
                          <button
                            onClick={() => handleSeatDelete(item.stt)}
                            style={{ backgroundColor: '#cc3380', color: "white", border: "none", borderRadius: "4px", padding: "4px 8px", marginRight: "4px" }}
                          >
                            Xóa
                          </button>
                          <button
                            onClick={() => handleSeatEdit(item, index)}
                            style={{ backgroundColor: "#ccc", color: "black", border: "none", borderRadius: "4px", padding: "4px 8px" }}
                          >
                            Sửa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <div style={{ marginTop: "16px" }}>
                <button
                  onClick={handleAdd}
                  style={{
                    background: "#add8e6", color: "black", padding: "8px 24px",
                    border: "none", borderRadius: "8px", cursor: "pointer"
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? 'Đang xử lý...' : "Thêm phòng"}
                </button>
              </div>
            </>
          )}

        </div>
      </div>

      {showLogoutModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", display: "flex",
          justifyContent: "center", alignItems: "center"
        }}>
          <div style={{
            background: "#4c65a8", padding: "24px", borderRadius: "8px",
            textAlign: "center", color: "white", width: "300px"
          }}>
            <div style={{ marginBottom: "8px" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "8px" }}>
                <img src="/images/warning.png" alt="!" style={{ width: "40px" }} />
              </div>
            </div>
            <p>Bạn chắc chắn muốn đăng xuất không</p>
            <div style={{ display: "flex", justifyContent: "space-around", marginTop: "16px" }}>
              <button onClick={() => {
                alert("Đã đăng xuất");
                setShowLogoutModal(false);
                navigate("/");
              }}
                style={{ padding: "6px 12px", border: "none", borderRadius: "4px", background: "#ccc", color: "black" }}>Có</button>
              <button onClick={() => setShowLogoutModal(false)}
                style={{ padding: "6px 12px", border: "none", borderRadius: "4px", background: "#ccc", color: "black" }}>Không</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}