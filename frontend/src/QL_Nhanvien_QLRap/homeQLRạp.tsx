
import React, { useState, useEffect, useCallback } from "react";
import Nav from "../Header/nav";
import Bottom from "../Footer/bottom";
import { useNavigate } from "react-router-dom";

// Define interfaces
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
    staffId: string;
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
const formatDate = (dateStr: string) => dateStr ? new Date(dateStr).toISOString() : "";

const Info: React.FC = () => {
  
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
      const userEmail = localStorage.getItem("userEmail");
      const navigate = useNavigate();
      const [movieName, setMovieName] = useState<string>('');
      const [movieImageFile, setMovieImageFile] = useState<File | null>(null);
      const [movieImageFileName, setMovieImageFileName] = useState<string>('');
      const [movieDescription, setMovieDescription] = useState<string>('');
      const [movieDirector, setMovieDirector] = useState<string>('');
      const [movieActor, setMovieActor] = useState<string>('');
      const [movieTrailerUrl, setMovieTrailerUrl] = useState<string>('');
      const [movieDuration, setMovieDuration] = useState<number>(0);
      const [minimumAgeID, setMinimumAgeID] = useState<string>('');
      const [languageId, setLanguageId] = useState<string>('');
      const [releaseDate, setReleaseDate] = useState<string>(new Date().toISOString().substring(0, 16)); // YYYY-MM-DDTHH:MM
      const [visualFormatList, setVisualFormatList] = useState<string[]>(['']);
      const [movieGenreList, setMovieGenreList] = useState<string[]>(['']);
      const [foodDrinkItems, setFoodDrinkItems] = useState<FoodDrinkItem[]>([]);
      
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
      // NEW STATE: To indicate if food/drink items are being loaded
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
      const [isFoodDrinkLoading, setIsFoodDrinkLoading] = useState(true);
  
  
      // State cho ô chọn dịch vụ và số lượng khi thêm
      const [newServiceName, setNewServiceName] = useState(''); // Default to empty string initially
      const [newServiceQuantity, setNewServiceQuantity] = useState(1);
      const [selectedOrderID, setSelectedOrderID] = useState('');
  
      // Lấy danh sách các OrderID duy nhất từ các dịch vụ đã có
      const existingOrderIDs = Array.from(new Set(services.map(service => service.orderID)));
      const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
      
    const filteredServices = services.filter(service =>
        filterText === '' || service.orderID.toLowerCase().includes(filterText.toLowerCase())
    );
  // Handler for file input change
     const handleMovieImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
          setMovieImageFile(e.target.files[0]);
          setMovieImageFileName(e.target.files[0].name);
        } else {
          setMovieImageFile(null);
          setMovieImageFileName('');
        }
    };
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
      const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Đã đổi tên biến trạng thái và hàm cập nhật
    const [message1, setMessage1] = useState(''); 

    const handleChangePassword = async () => {
        setMessage1(''); // Xóa thông báo cũ

        if (newPassword !== confirmPassword) {
            setMessage1('Mật khẩu mới và xác nhận mật khẩu không khớp!');
            return;
        }

        const payload = {
            oldPassword: oldPassword,
            newPassword: newPassword,
            confirmPassword: confirmPassword,
        };

        const apiUrl = `http://localhost:5229/api/Account/changePassword?userID=${localStorage.getItem('IDND')}`;
        console.log('id là', localStorage.getItem('IDND'));
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'accept': '*/*',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                setMessage1('Mật khẩu đã được cập nhật thành công!');
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
                console.log('API Response:', await response.json());
            } else {
                const errorData = await response.json();
                setMessage1(`Lỗi: ${errorData.message || 'Có lỗi xảy ra khi đổi mật khẩu.'}`);
                console.error('API Error:', response.status, errorData);
            }
        } catch (error) {
            setMessage1('Đã xảy ra lỗi kết nối. Vui lòng thử lại sau.');
            console.error('Network or unexpected error:', error);
        }
    };
  // Handlers for dynamic list items (visualFormatList, movieGenreList)
  const handleAddListItem = (listType: 'visual' | 'genre') => {
    if (listType === 'visual') {
      setVisualFormatList([...visualFormatList, '']);
    } else {
      setMovieGenreList([...movieGenreList, '']);
    }
  };

  const handleRemoveListItem = (listType: 'visual' | 'genre', index: number) => {
    if (listType === 'visual') {
      const newList = visualFormatList.filter((_, i) => i !== index);
      setVisualFormatList(newList.length > 0 ? newList : ['']); // Ensure at least one empty input
    } else {
      const newList = movieGenreList.filter((_, i) => i !== index);
      setMovieGenreList(newList.length > 0 ? newList : ['']); // Ensure at least one empty input
    }
  };

  const handleListItemChange = (listType: 'visual' | 'genre', index: number, value: string) => {
    if (listType === 'visual') {
      const newList = [...visualFormatList];
      newList[index] = value;
      setVisualFormatList(newList);
    } else {
      const newList = [...movieGenreList];
      newList[index] = value;
      setMovieGenreList(newList);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission behavior
    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('movieName', movieName);
    formData.append('movieDescription', movieDescription);
    formData.append('movieDirector', movieDirector);
    formData.append('movieActor', movieActor);
    formData.append('movieTrailerUrl', movieTrailerUrl);
    formData.append('movieDuration', movieDuration.toString());
    formData.append('minimumAgeID', minimumAgeID);
    formData.append('languageId', languageId);
    formData.append('releaseDate', new Date(releaseDate).toISOString()); // Ensure ISO format

    // Append each item from the lists
    visualFormatList.forEach(item => {
      if (item.trim() !== '') { // Only append non-empty strings
        formData.append('visualFormatList', item);
      }
    });
    movieGenreList.forEach(item => {
      if (item.trim() !== '') { // Only append non-empty strings
        formData.append('movieGenreList', item);
      }
    });

    if (movieImageFile) {
      formData.append('movieImage', movieImageFile, movieImageFileName);
    } else {
      // Handle case where image is required but not provided
      setMessage({ type: 'error', text: 'Movie image is required.' });
      setLoading(false);
      return;
    }

    try {
        console.log(localStorage.getItem('role'));
      const response = await fetch('http://localhost:5229/api/movie/createMovie', {
       method: "POST",
                headers: { "accept": "*/*", "Content-Type": "multipart/form-data", 'Authorization': `Bearer 4d1e0f2a-b7c8-d9e0-f1a2-3b4c5d6e7f8g` },
        body: formData, // FormData automatically sets 'Content-Type': 'multipart/form-data'
        // No need to set 'Content-Type' header manually for FormData
      });

      if (response.ok) {
        const result = await response.json();
        setMessage({ type: 'success', text: 'Movie created successfully!' });
        console.log('Success:', result);
        // Optionally reset form fields here
        setMovieName('');
        setMovieImageFile(null);
        setMovieImageFileName('');
        setMovieDescription('');
        setMovieDirector('');
        setMovieActor('');
        setMovieTrailerUrl('');
        setMovieDuration(0);
        setMinimumAgeID('');
        setLanguageId('');
        setReleaseDate(new Date().toISOString().substring(0, 16));
        setVisualFormatList(['']);
        setMovieGenreList(['']);
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: `Failed to create movie: ${errorData.message || response.statusText}` });
        console.error('Error:', errorData);
      }
    } catch (error) {
      setMessage({ type: 'error', text: `An error occurred: ${error instanceof Error ? error.message : String(error)}` });
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

    const [userRole, setUserRole] = useState<string | null>(localStorage.getItem("role") || null);
    const [activeTab, setActiveTab] = useState< "password" | "nhanvien"|"quanlynoidung"| "doanhthu"|"xacdinhdichvu" |"csphongrap">("password");
    const [addStaffFormData, setAddStaffFormData] = useState<AddStaffFormData>({
        staffId: "",
        cinemaId: "",
        loginUserEmail: "",
        loginUserPassword: "",
        loginUserPasswordConfirm: "",
        staffName: "",
        dateOfBirth: "",
        phoneNumer: "",
        role: "", // Mặc định là rỗng, người dùng tự chọn
    });
    const [cinemas, setCinemas] = useState<Cinema[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [editingStaff, setEditingStaff] = useState<EditingStaff | null>(null);
    const [loading, setLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const roleName = localStorage.getItem('role') || '';
    const roles1: string[] = roleName ? roleName.split(',') : [];
    const [isCheckingRoles, setIsCheckingRoles] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [employeeId] = useState(localStorage.getItem("authToken"));
    useEffect(() => {
        setIsCheckingRoles(true);
        const timer = setTimeout(() => {
          if (roles1.includes('FacilitiesManager')|| roles1.includes('Director') || roles1.includes('MovieManager')||roles1.includes('MovieManager') || roles1.includes('Cashier') ) {
            alert('Chào mừng trở lại!');
            setIsAuthorized(true);
            setIsCheckingRoles(false);
          } else {
            alert('Không được phép vào trang này');
            navigate('/login');
          }
        }, 1000); // 1-second delay to show spinner
        return () => clearTimeout(timer);
      }, []); // Empty dependency array for mount-only execution
    
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
                    'accept': '*/*',
                    'Authorization': `Bearer ${authToken}`
                }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Kiểm tra trạng thái và dữ liệu trả về từ API
            if (data.status === "Success" && data.data) {
                // Ép kiểu (type assertion) dữ liệu nhận được thành mảng Role
                const fetchedRoles: Role[] = data.data;
                setRoles(fetchedRoles); // Cập nhật state chứa danh sách vai trò

                if (fetchedRoles.length > 0) {
                    // Ưu tiên tìm vai trò "Cashier" dựa trên 'roleName'
                    const cashierRole = fetchedRoles.find((role: Role) => role.roleName === "Cashier");

                    if (cashierRole) {
                        // Nếu tìm thấy "Cashier", đặt roleid của Cashier làm mặc định
                        setAddStaffFormData(prev => ({ ...prev, role: cashierRole.roleid }));
                    } else {
                        // Nếu không tìm thấy "Cashier", đặt roleid của vai trò đầu tiên làm mặc định
                        setAddStaffFormData(prev => ({ ...prev, role: fetchedRoles[0].roleid }));
                    }
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
        if (activeTab !== "nhanvien") return;
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
        if (!addStaffFormData.loginUserEmail || !addStaffFormData.loginUserPassword || !addStaffFormData.loginUserPasswordConfirm ||
            !addStaffFormData.staffName || !addStaffFormData.dateOfBirth || !addStaffFormData.phoneNumer ||
            !addStaffFormData.cinemaId ) {
            alert("Vui lòng điền đầy đủ tất cả thông tin (Email, Mật khẩu, Xác nhận mật khẩu, Tên nhân viên, Ngày sinh, SĐT, Rạp, Vai trò).");
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
            // Gán mặc định "Cashier" nếu role là rỗng
            
            const response = await fetch("http://localhost:5229/api/Staff/AddStaff", {
                method: "POST",
                headers: { "accept": "*/*", "Content-Type": "application/json", 'Authorization': `Bearer ${authToken}` },
                body: JSON.stringify({
                    loginUserEmail: addStaffFormData.loginUserEmail,
                    loginUserPassword: addStaffFormData.loginUserPassword,
                    loginUserPasswordConfirm: addStaffFormData.loginUserPasswordConfirm,
                    staffName: addStaffFormData.staffName,
                    dateOfBirth: dateOfBirthISO,
                    phoneNumer: addStaffFormData.phoneNumer,
                    cinemaId: addStaffFormData.cinemaId,
                    roleID: [
                        "1a8f7b9c-d4e5-4f6a-b7c8-9d0e1f2a3b4c"
                    ]
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
                    role: roles.length > 0 ? roles[0].roleid : "Cashier", // Lấy role đầu tiên hoặc để rỗng
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
                staffRole: staffToEdit.staffRole || "",
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
                    <button className={`w-full px-4 py-2 rounded-lg text-left font-medium ${activeTab === "password" ? "bg-yellow-300 text-black" : "hover:bg-white/30 text-white"}`} onClick={() => setActiveTab("password")}>Đổi mật khẩu</button>
                    { roles1.includes('TheaterManager') && (
                        <div className="mt-6 pt-6 border-t border-white/30">
                            <h3 className="text-lg font-bold text-DarkRed mb-4">Quản Lý Rạp</h3>
                            <button className={`w-full px-4 py-2 rounded-lg text-left font-medium ${activeTab === "nhanvien" ? "bg-yellow-300 text-black" : "hover:bg-white/30 text-white"}`} onClick={() => setActiveTab("nhanvien")}>Danh sách nhân viên</button>
                        </div>
                    )}
                    { roles1.includes('MovieManager') && (
                        <div className="mt-6 pt-6 border-t border-white/30">
                            <h3 className="text-lg font-bold text-DarkRed mb-4">Quản Lý Nội Dung</h3>
                            <button className={`w-full px-4 py-2 rounded-lg text-left font-medium ${activeTab === "quanlynoidung" ? "bg-yellow-300 text-black" : "hover:bg-white/30 text-white"}`} onClick={() => setActiveTab("quanlynoidung")}>Nội dung</button>
                        </div>
                    )}
                    {roles1.includes('Cashier')  && (
                        <div className="mt-6 pt-6 border-t border-white/30">
                            <h3 className="text-lg font-bold text-DarkRed mb-4">Thu Ngân</h3>
                            <button className={`w-full px-4 py-2 rounded-lg text-left font-medium ${activeTab === "xacdinhdichvu" ? "bg-yellow-300 text-black" : "hover:bg-white/30 text-white"}`} onClick={() => setActiveTab("xacdinhdichvu")}>Xác nhận dịch vụ</button>
                        </div>
                    )}
                    {userRole === "Director" && (
                        <div className="mt-6 pt-6 border-t border-white/30">
                            <h3 className="text-lg font-bold text-DarkRed mb-4">Giám đốc</h3>
                            <button className={`w-full px-4 py-2 rounded-lg text-left font-medium ${activeTab === "doanhthu" ? "bg-yellow-300 text-black" : "hover:bg-white/30 text-white"}`} onClick={() => setActiveTab("doanhthu")}>Doanh thu</button>
                        </div>
                    )}
                    {roles1.includes('FacilitiesManager')  && (
                        <div className="mt-6 pt-6 border-t border-white/30">
                            <h3 className="text-lg font-bold text-DarkRed mb-4">Quản trị viên hệ thống</h3>
                            <button className={`w-full px-4 py-2 rounded-lg text-left font-medium ${activeTab === "doanhthu" ? "bg-yellow-300 text-black" : "hover:bg-white/30 text-white"}`} onClick={() => navigate('/Quantrivienhethong/QLRapPhongChieu')}>Chỉnh sửa rạp/phòng chiếu</button>
                        </div>
                    )}
                </div>
                <div className="flex-1 space-y-8 mt-8 md:mt-0">
                    <h1 className="text-white text-3xl font-bold text-center uppercase">Cinema xin chào! {userEmail}</h1>
                    
                    {activeTab === "password" && (
                         <div className="bg-[#f7eaff]/50 p-6 rounded-2xl shadow-xl">
                <h2 className="text-2xl font-bold mb-6">Đổi mật khẩu</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block mb-2 font-semibold">Mật khẩu cũ</label>
                        <input
                            type="password"
                            className="w-full border rounded-md px-4 py-2 bg-white/50"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block mb-2 font-semibold">Mật khẩu mới</label>
                        <input
                            type="password"
                            className="w-full border rounded-md px-4 py-2 bg-white/50"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block mb-2 font-semibold">Xác nhận mật khẩu mới</label>
                        <input
                            type="password"
                            className="w-full border rounded-md px-4 py-2 bg-white/50"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                </div>
                {/* Đã sử dụng biến mới message1 để hiển thị */}
                {message1 && (
                    <p className={`mt-4 text-center font-semibold ${message1.includes('Lỗi:') ? 'text-red-500' : 'text-green-600'}`}>
                        {message1}
                    </p>
                )}
                <div className="mt-6 text-center">
                    <button
                        className="bg-yellow-950 text-yellow-400 border border-yellow-400 border-b-4 font-medium overflow-hidden relative px-4 py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group"
                        onClick={handleChangePassword}
                    >
                        <span className="bg-yellow-400 shadow-yellow-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>Cập nhật mật khẩu
                    </button>
                </div>
            </div>
                    )}
                    {activeTab === "nhanvien" && roles1.includes('TheaterManager') && (
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
                                        <input type="date" value={addStaffFormData.dateOfBirth} onChange={(e) => handleAddStaffInputChange(e, "dateOfBirth")} className="uiverse-pixel-input" placeholder="Ngày tháng năm sinh" required />
                                    </div>
                                    <div className="uiverse-pixel-input-wrapper">
                                        <label className="uiverse-pixel-label">SĐT</label>
                                        <input type="tel" value={addStaffFormData.phoneNumer} onChange={(e) => handleAddStaffInputChange(e, "phoneNumer")} className="uiverse-pixel-input" placeholder="Số điện thoại" required />
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
                                                        <td className="px-4 py-2">{staff.cinemaId}</td>
                                                        <td className="px-4 py-2">{staff.staffRole}</td>
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
                                                {roles.map((role) => <option key={role.roleid} value={role.roleid}>{role.roleName}</option>)}
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
                    {activeTab === "quanlynoidung" && (
                                        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
                      {/* The CSS styles are now in a separate style.css file and should be linked in your HTML or imported in your main JS/TS file */}
                      {/* Updated form container with bg-white/20 and backdrop-blur-md */}
                      <form onSubmit={handleSubmit} className="bg-white/20 backdrop-blur-md p-6 sm:p-8 lg:p-10 rounded-xl shadow-xl w-full max-w-2xl">
                        <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">Movie Details Form</h1>

                        {/* Message display area */}
                        {message && (
                          <div className={`p-3 mb-4 rounded-md text-center ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {message.text}
                          </div>
                        )}

                        {/* movieName */}
                        <div className="mb-4 flex flex-col sm:flex-row sm:items-center">
                          <label htmlFor="movieName" className="uiverse-pixel-label w-full sm:w-1/3 mb-1 sm:mb-0">
                            movieName <span className="text-red-500">*</span>
                          </label>
                          <div className="uiverse-pixel-input-wrapper w-full sm:w-2/3">
                            <input
                              type="text"
                              id="movieName"
                              className="uiverse-pixel-input"
                              value={movieName}
                              onChange={(e) => setMovieName(e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        {/* movieImage */}
                        <div className="mb-4 flex flex-col sm:flex-row sm:items-center">
                          <label htmlFor="movieImage" className="uiverse-pixel-label w-full sm:w-1/3 mb-1 sm:mb-0">
                            movieImage <span className="text-red-500">*</span>
                          </label>
                          <div className="flex items-center space-x-2 w-full sm:w-2/3">
                            <label htmlFor="movieImageInput" className="button2 cursor-pointer">
                              Choose File
                            </label>
                            <input
                              type="file"
                              id="movieImageInput"
                              className="hidden" // Hide the default file input
                              onChange={handleMovieImageChange}
                              required
                            />
                            <span className="text-gray-700 text-sm truncate flex-1">{movieImageFileName || 'No file chosen'}</span>
                          </div>
                        </div>

                        {/* movieDescription */}
                        <div className="mb-4 flex flex-col sm:flex-row sm:items-center">
                          <label htmlFor="movieDescription" className="uiverse-pixel-label w-full sm:w-1/3 mb-1 sm:mb-0">
                            movieDescription <span className="text-red-500">*</span>
                          </label>
                          <div className="uiverse-pixel-input-wrapper w-full sm:w-2/3">
                            <input
                              type="text"
                              id="movieDescription"
                              className="uiverse-pixel-input"
                              value={movieDescription}
                              onChange={(e) => setMovieDescription(e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        {/* movieDirector */}
                        <div className="mb-4 flex flex-col sm:flex-row sm:items-center">
                          <label htmlFor="movieDirector" className="uiverse-pixel-label w-full sm:w-1/3 mb-1 sm:mb-0">
                            movieDirector <span className="text-red-500">*</span>
                          </label>
                          <div className="uiverse-pixel-input-wrapper w-full sm:w-2/3">
                            <input
                              type="text"
                              id="movieDirector"
                              className="uiverse-pixel-input"
                              value={movieDirector}
                              onChange={(e) => setMovieDirector(e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        {/* movieActor */}
                        <div className="mb-4 flex flex-col sm:flex-row sm:items-center">
                          <label htmlFor="movieActor" className="uiverse-pixel-label w-full sm:w-1/3 mb-1 sm:mb-0">
                            movieActor <span className="text-red-500">*</span>
                          </label>
                          <div className="uiverse-pixel-input-wrapper w-full sm:w-2/3">
                            <input
                              type="text"
                              id="movieActor"
                              className="uiverse-pixel-input"
                              value={movieActor}
                              onChange={(e) => setMovieActor(e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        {/* movieTrailerUrl */}
                        <div className="mb-4 flex flex-col sm:flex-row sm:items-center">
                          <label htmlFor="movieTrailerUrl" className="uiverse-pixel-label w-full sm:w-1/3 mb-1 sm:mb-0">
                            movieTrailerUrl <span className="text-red-500">*</span>
                          </label>
                          <div className="uiverse-pixel-input-wrapper w-full sm:w-2/3">
                            <input
                              type="text"
                              id="movieTrailerUrl"
                              className="uiverse-pixel-input"
                              value={movieTrailerUrl}
                              onChange={(e) => setMovieTrailerUrl(e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        {/* movieDuration */}
                        <div className="mb-4 flex flex-col sm:flex-row sm:items-center">
                          <label htmlFor="movieDuration" className="uiverse-pixel-label w-full sm:w-1/3 mb-1 sm:mb-0">
                            movieDuration <span className="text-red-500">*</span>
                          </label>
                          <div className="uiverse-pixel-input-wrapper w-full sm:w-2/3">
                            <input
                              type="number"
                              id="movieDuration"
                              className="uiverse-pixel-input"
                              value={movieDuration}
                              onChange={(e) => setMovieDuration(Number(e.target.value))}
                              required
                            />
                          </div>
                        </div>

                        {/* minimumAgeID */}
                        <div className="mb-4 flex flex-col sm:flex-row sm:items-center">
                          <label htmlFor="minimumAgeID" className="uiverse-pixel-label w-full sm:w-1/3 mb-1 sm:mb-0">
                            minimumAgeID <span className="text-red-500">*</span>
                          </label>
                          <div className="uiverse-pixel-input-wrapper w-full sm:w-2/3">
                            <input
                              type="text"
                              id="minimumAgeID"
                              className="uiverse-pixel-input"
                              value={minimumAgeID}
                              onChange={(e) => setMinimumAgeID(e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        {/* languageId */}
                        <div className="mb-4 flex flex-col sm:flex-row sm:items-center">
                          <label htmlFor="languageId" className="uiverse-pixel-label w-full sm:w-1/3 mb-1 sm:mb-0">
                            languageId <span className="text-red-500">*</span>
                          </label>
                          <div className="uiverse-pixel-input-wrapper w-full sm:w-2/3">
                            <input
                              type="text"
                              id="languageId"
                              className="uiverse-pixel-input"
                              value={languageId}
                              onChange={(e) => setLanguageId(e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        {/* releaseDate */}
                        <div className="mb-4 flex flex-col sm:flex-row sm:items-center">
                          <label htmlFor="releaseDate" className="uiverse-pixel-label w-full sm:w-1/3 mb-1 sm:mb-0">
                            releaseDate <span className="text-red-500">*</span>
                          </label>
                          <div className="uiverse-pixel-input-wrapper w-full sm:w-2/3">
                            <input
                              type="datetime-local"
                              id="releaseDate"
                              className="uiverse-pixel-input"
                              value={releaseDate}
                              onChange={(e) => setReleaseDate(e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        {/* visualFormatList */}
                        <div className="mb-4 flex flex-col sm:flex-row sm:items-start">
                          <label className="uiverse-pixel-label w-full sm:w-1/3 mb-1 sm:mb-0">
                            visualFormatList <span className="text-red-500">*</span>
                          </label>
                          <div className="flex flex-col gap-2 w-full sm:w-2/3">
                            {visualFormatList.map((item, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <div className="uiverse-pixel-input-wrapper flex-grow">
                                  <input
                                    type="text"
                                    className="uiverse-pixel-input"
                                    value={item}
                                    onChange={(e) => handleListItemChange('visual', index, e.target.value)}
                                    required
                                  />
                                </div>
                                {visualFormatList.length > 1 && (
                                  <button
                                    type="button"
                                    className="remove-button"
                                    onClick={() => handleRemoveListItem('visual', index)}
                                  >
                                    -
                                  </button>
                                )}
                              </div>
                            ))}
                            <button
                              type="button"
                              className="button2 mt-2 self-start"
                              onClick={() => handleAddListItem('visual')}
                            >
                              Add string item
                            </button>
                          </div>
                        </div>

                        {/* movieGenreList */}
                        <div className="mb-4 flex flex-col sm:flex-row sm:items-start">
                          <label className="uiverse-pixel-label w-full sm:w-1/3 mb-1 sm:mb-0">
                            movieGenreList <span className="text-red-500">*</span>
                          </label>
                          <div className="flex flex-col gap-2 w-full sm:w-2/3">
                            {movieGenreList.map((item, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <div className="uiverse-pixel-input-wrapper flex-grow">
                                  <input
                                    type="text"
                                    className="uiverse-pixel-input"
                                    value={item}
                                    onChange={(e) => handleListItemChange('genre', index, e.target.value)}
                                    required
                                  />
                                </div>
                                {movieGenreList.length > 1 && (
                                  <button
                                    type="button"
                                    className="remove-button"
                                    onClick={() => handleRemoveListItem('genre', index)}
                                  >
                                    -
                                  </button>
                                )}
                              </div>
                            ))}
                            <button
                              type="button"
                              className="button2 mt-2 self-start"
                              onClick={() => handleAddListItem('genre')}
                            >
                              Add string item
                            </button>
                          </div>
                        </div>

                        {/* Add button at the bottom */}
                        <button type="submit" className="button2 w-full mt-6" disabled={loading}>
                          {loading ? 'Adding...' : 'Thêm'}
                        </button>
                      </form>
                    </div>
                    )}
                    {activeTab === "doanhthu" && roles1.includes('Director') && (
                        <div className="bg-[#f7eaff]/50 p-6 rounded-2xl shadow-xl">
                            <h2 className="text-2xl font-bold mb-6">Doanh Thu</h2>
                            <p className="text-white">Đây là trang hiển thị thông tin doanh thu. Bạn có thể thêm biểu đồ hoặc bảng dữ liệu ở đây.</p>
                        </div>
                    )}
                    {activeTab === "xacdinhdichvu" && roles1.includes('Cashier') && (
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
                                    value={employeeId || ''}
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
                    )}
                    {activeTab === "csphongrap" && roles1.includes('FacilitiesManager') && (
                        <div></div>
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