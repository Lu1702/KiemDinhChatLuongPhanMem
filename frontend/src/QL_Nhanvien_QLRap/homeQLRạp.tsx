
import React, { useState, useEffect, useCallback } from "react";
import Nav from "../Header/nav";
import Bottom from "../Footer/bottom";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import SCHEDULE from '../QL_lichchieu/schedule';
import RevenueList from "../QL_Doanhthu_GiamDoc/Doanhthu";
interface FoodItem {
    foodId: string;
    foodName: string;
    foodPrice: number;
}

interface OrderRequestItem {
    productId: string;
    quanlity: number;
}

// Define possible API response structures
interface ApiResponseFood {
    data?: FoodItem[];
    status?: string;
    message?: string;
    [key: string]: any; // Allow for other properties
}
interface VisualFormat {
    movieVisualId: string;
    movieVisualFormatDetail: string;
}

interface CinemaRoom {
    roomNumber: number;
    cinemaID: string;
    visualFormatID: string;
    seatsNumber: string[];
}

interface ApiResponse<T> {
    status: string;
    message: string;
    data: T;
}
// Define interfaces
interface Service {
    id: number;
    name: string;
    quanlity: number;
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
    cinemaLocation: string;
    cinemaDescription?: string;
    cinemaContactNumber?: string;
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
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [filterText, setFilterText] = useState('');
    const [services, setServices] = useState<Service[]>([
        { id: 1, name: 'Bắp caramel', quanlity: 1, orderID: 'ORD001' },
        { id: 2, name: 'Pepsi', quanlity: 2, orderID: 'ORD001' },
        { id: 3, name: 'Coca', quanlity: 1, orderID: 'ORD002' },
        { id: 4, name: 'Không thêm dịch vụ', quanlity: 1, orderID: 'ORD003' },
    ]);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isAddingService, setIsAddingService] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showAccountMenu, setShowAccountMenu] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const userEmail = localStorage.getItem("userEmail");
    const navigate = useNavigate();
    const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
    const [movieName, setMovieName] = useState<string>('');
    const [movieImageFile, setMovieImageFile] = useState<File | null>(null);
    const [movieImageFileName, setMovieImageFileName] = useState<string>('');
    const [movieDescription, setMovieDescription] = useState<string>('');
    const [movieDirector, setMovieDirector] = useState<string>('');
    const [movieActor, setMovieActor] = useState<string>('');
    const [movieTrailerUrl, setMovieTrailerUrl] = useState<string>('');
    const [movieDuration, setMovieDuration] = useState<number>(0);
    const [visualFormats, setVisualFormats] = useState<VisualFormat[]>([]);
    const [minimumAgeID, setMinimumAgeID] = useState<string>('');
    const [languageId, setLanguageId] = useState<string>('');
    const [releaseDate, setReleaseDate] = useState<string>(new Date().toISOString().substring(0, 16)); // YYYY-MM-DDTHH:MM
    const [visualFormatList, setVisualFormatList] = useState<string[]>(['']);
    const [movieGenreList, setMovieGenreList] = useState<string[]>(['']);
    const [foodDrinkItems, setFoodDrinkItems] = useState<FoodDrinkItem[]>([]);
    const [newRoom, setNewRoom] = useState<CinemaRoom>({
        roomNumber: 0,
        cinemaID: '',
        visualFormatID: '',
        seatsNumber: [],
    });
    const [newCinema, setNewCinema] = useState({
        cinemaName: '',
        cinemaLocation: '',
        cinemaDescription: '',
        cinemaContactNumber: '',
    });
    const [selectedCinemaId, setSelectedCinemaId] = useState<string>('');
    const [seatInput, setSeatInput] = useState<string>('');
    const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [customerEmail, setCustomerEmail] = useState('');
    const [orderItems, setOrderItems] = useState<OrderRequestItem[]>([]);
    const [selectedFoodId, setSelectedFoodId] = useState('');
    const [quanlity, setquanlity] = useState(1);
    const [errorFood, setErrorFood] = useState<string | null>(null);

    // Fetch food items and open modal on mount
    useEffect(() => {
        axios.get('http://localhost:5229/api/Food/GetFoodInformation')
            .then(response => {
                // Log the full response for debugging
                console.log('Full API Response:', response);
                // Check for nested data
                let items = response.data as ApiResponseFood;
                if (Array.isArray(items)) {
                    setFoodItems(items);
                } else if (items && typeof items === 'object') {
                    // Safely extract nested array
                    const foodData = items.data || [];
                    if (Array.isArray(foodData)) {
                        setFoodItems(foodData);
                    } else {
                        console.error('No valid array found in response:', response.data);
                        setErrorFood('Invalid food items data format');
                        setFoodItems([]);
                    }
                } else {
                    console.error('Unexpected API response format:', response.data);
                    setErrorFood('Invalid food items data format');
                    setFoodItems([]);
                }
            })
            .catch(error => {
                console.error('Error fetching food items:', error);
                setErrorFood('Failed to fetch food items');
                setFoodItems([]);
            });

        // Open modal immediately
        setIsModalOpen(true);
    }, []);

    const handleAddItem = () => {
        if (selectedFoodId) {
            setOrderItems([...orderItems, { productId: selectedFoodId, quanlity }]);
            setSelectedFoodId('');
            setquanlity(1);
        }
    };
    
    const handleSubmitOrder = async () => {
        if (!customerEmail) {
            alert('Please enter a customer email');
            return;
        }

        const orderData = {
            customerEmail,
            orderDate: new Date().toISOString(),
            orderRequestItems: orderItems
        };

        try {
            const userId = localStorage.getItem('IDND');
            await axios.post(
                `http://localhost:5229/api/StaffOrder/StaffOrder?UserId=${userId}`,
                orderData,
                {
                    headers: {
                        'accept': '*/*',
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    }
                }
            );
            setIsModalOpen(false);
            setOrderItems([]);
            setCustomerEmail('');
            alert('Order submitted successfully!');
        } catch (error) {
            console.error('Error submitting order:', error);
            alert('Failed to submit order');
        }
    };
    const handleRoomInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value } = e.target;
        setNewRoom((prev) => ({
            ...prev,
            [name]: name === 'roomNumber' ? Number(value) : value,
        }));
    };

    const handleAddSeat = () => {
        if (seatInput.trim()) {
            setNewRoom((prev) => ({
                ...prev,
                seatsNumber: [...prev.seatsNumber, seatInput.trim()],
            }));
            setSeatInput('');
        }
    };
    const handleDeleteCinema = async () => {
        if (!selectedCinemaId) {
            setError('Vui lòng chọn một rạp để xóa');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5229/api/Cinema/deleteCinema/${selectedCinemaId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete cinema');
            }

            setIsDeleteModalOpen(false);
            setSelectedCinemaId('');
            fetchCinemas();
            setSuccessMessage('Đã xóa rạp thành công');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError('Failed to delete cinema');
        }
    };
    const handleSubmitService = (e: React.FormEvent) => {
        e.preventDefault();
        if (newServiceName.trim() && selectedOrderID.trim()) {
            const newService: Service = {
                id: services.length + 1,
                name: newServiceName,
                quanlity: newServicequanlity,
                orderID: selectedOrderID
            };
            setServices([...services, newService]);
            setNewServicequanlity(1);
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
    const [newServicequanlity, setNewServicequanlity] = useState(1);
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
        formData.append('movieDuration', movieDuration.toString());
        formData.append('movieActor', movieActor);
        formData.append('movieImage', '488383774_10161252255948295_3777127523036369629_n.jpg'); // <-- phải là File object
        formData.append('movieTrailerUrl', movieTrailerUrl);
        formData.append('movieDescription', movieDescription);
        formData.append('minimumAgeID', minimumAgeID);
        formData.append('movieGenreList', "Horror");
        formData.append('languageId', languageId);
        formData.append('releaseDate', new Date(releaseDate).toISOString());
        formData.append('visualFormatList', "3D");
        formData.append('movieName', movieName);
        formData.append('movieDirector', movieDirector);
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
                headers: { "accept": "*/*", 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
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
    const [activeTab, setActiveTab] = useState<"password" | "nhanvien" | "quanlynoidung" | "schedule" | "doanhthu" | "xacdinhdichvu" | "csphongrap" | "room">("password");
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
    const handleDeleteStaffOrder = (index: number) => {
        setOrderItems(orderItems.filter((_, i) => i !== index));
    };
    const roleName = localStorage.getItem('role') || '';
    const roles1: string[] = roleName ? roleName.split(',') : [];
    const [isCheckingRoles, setIsCheckingRoles] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [employeeId] = useState(localStorage.getItem("authToken"));
    useEffect(() => {
        setIsCheckingRoles(true);
        const timer = setTimeout(() => {
            if (roles1.includes('FacilitiesManager') || roles1.includes('Director') || roles1.includes('MovieManager') || roles1.includes('MovieManager') || roles1.includes('Cashier') || roles1.includes('TheaterManager')) {
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
    useEffect(() => {
        const fetchCinemas = async () => {
            try {
                const response = await fetch('http://localhost:5229/api/Cinema/getCinemaList', {
                    headers: {
                        'accept': '*/*',
                    },
                });
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                if (data.status === 'Success' && data.data) {
                    setCinemas(data.data);
                    if (data.data.length > 0) setAddStaffFormData(prev => ({ ...prev, cinemaId: data.data[0].cinemaId }));
                }
            } catch (error) {
                alert('Không thể tải danh sách rạp. Vui lòng thử lại sau.');
            }
        };

        const fetchVisualFormats = async () => {
            try {
                const response = await fetch('http://localhost:5229/api/MovieVisualFormat/GetMovieVisualFormatList', {
                    headers: {
                        'accept': '*/*',
                    },
                });
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                if (data.status === 'Success' && data.data) {
                    setVisualFormats(data.data);
                }
            } catch (error) {
                alert('Không thể tải danh sách định dạng hình ảnh. Vui lòng thử lại sau.');
            }
        };

        fetchCinemas();
        fetchVisualFormats();
    }, []);
    const handleSaveCinema = async () => {
        try {
            const response = await fetch('http://localhost:5229/api/Cinema/addCinema', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                },
                body: JSON.stringify(newCinema),
            });

            if (!response.ok) {
                throw new Error('Failed to add cinema');
            }

            setIsAddModalOpen(false);
            setNewCinema({
                cinemaName: '',
                cinemaLocation: '',
                cinemaDescription: '',
                cinemaContactNumber: '',
            });
            fetchCinemas();
            setSuccessMessage('Đã tạo rạp thành công');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError('Failed to add cinema');
        }
    };
    const handleCinemaInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewCinema((prev) => ({ ...prev, [name]: value }));
    };



    const handleSaveRoom = async () => {
        if (!newRoom.cinemaID || !newRoom.visualFormatID || newRoom.roomNumber < 0) {
            setError('Vui lòng điền đầy đủ thông tin phòng chiếu');
            return;
        }

        try {
            const response = await fetch('http://localhost:5229/api/CinemaRoom/CreateRoom', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                },
                body: JSON.stringify(newRoom),
            });

            if (!response.ok) {
                throw new Error('Failed to create room');
            }

            setNewRoom({
                roomNumber: 0,
                cinemaID: '',
                visualFormatID: '',
                seatsNumber: [],
            });
            setSeatInput('');
            setSuccessMessage('Đã tạo phòng chiếu thành công');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError('Failed to create room');
        }
    };

    useEffect(() => {
        fetchCinemas();
        fetchVisualFormats();
    }, []);
    const fetchCinemas = async () => {
        setLoading(true);
        try {
            const response = await axios.get<ApiResponse<Cinema[]>>('http://localhost:5229/api/Cinema/getCinemaList', {
                headers: {
                    'accept': '*/*'
                },
            });
            console.log('Cinema API Response:', response.data);
            const cinemaData = response.data.data;
            if (Array.isArray(cinemaData)) {
                setCinemas(cinemaData);
            } else {
                setError('Cinema API response data is not an array');
                setCinemas([]);
            }
        } catch (err) {
            setError('Failed to fetch cinema list');
            setCinemas([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchVisualFormats = async () => {
        setLoading(true);
        try {
            const response = await axios.get<VisualFormat[]>('http://localhost:5229/api/MovieVisualFormat/GetMovieVisualFormatList', {
                headers: {
                    'accept': '*/*',
                },
            }
            );
            console.log('Visual Format API Response:', response.data);
            if (Array.isArray(response.data)) {
                setVisualFormats(response.data);
            } else {
                setError('Visual Format API response data is not an array');
                setVisualFormats([]);
            }
        } catch (err) {
            setError('Failed to fetch visual format list');
            setVisualFormats([]);
        } finally {
            setLoading(false);
        }
    };
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
                // Only one fetch call is needed
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

                // Check status and data returned from API
                if (data.status === "Success" && data.data) {
                    // Type assertion for the received data to Role array
                    const fetchedRoles: Role[] = data.data;
                    setRoles(fetchedRoles); // Update state with the list of roles

                    if (fetchedRoles.length > 0) {
                        // Prioritize finding the "Cashier" role based on 'roleName'
                        const cashierRole = fetchedRoles.find((role: Role) => role.roleName === "Cashier");

                        if (cashierRole) {
                            // If "Cashier" is found, set its roleid as default
                            setAddStaffFormData(prev => ({ ...prev, role: cashierRole.roleid }));
                        } else {
                            // If "Cashier" is not found, set the roleid of the first role as default
                            setAddStaffFormData(prev => ({ ...prev, role: fetchedRoles[0].roleid }));
                        }
                    }
                } else {
                    console.error("Lỗi khi tải danh sách vai trò:", data.message);
                }
            } catch (error: any) {
                // This catch block handles errors from the fetch operation itself
                console.error("Lỗi khi tải danh sách vai trò:", error.message);
            }
        };
        fetchRoles();
    }, []); // Dependency array: Empty array means this effect runs once after the initial render

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
            !addStaffFormData.cinemaId) {
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
    console.log('hahahahaha localStorage: ', localStorage.getItem('IDND'))
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
                    {roles1.includes('TheaterManager') && (
                        <div className="mt-6 pt-6 border-t border-white/30">
                            <h3 className="text-lg font-bold text-DarkRed mb-4 text-yellow-400">Quản Lý Rạp</h3>
                            <button className={`w-full px-4 py-2 rounded-lg text-left font-medium ${activeTab === "nhanvien" ? "bg-yellow-300 text-black" : "hover:bg-white/30 text-white"}`} onClick={() => setActiveTab("nhanvien")}>Danh sách nhân viên</button>
                            <button className={`w-full px-4 py-2 rounded-lg text-left font-medium ${activeTab === "schedule" ? "bg-yellow-300 text-black" : "hover:bg-white/30 text-white"}`} onClick={() => setActiveTab("schedule")}>Tạo lịch chiếu</button>
                        </div>
                    )}
                    {roles1.includes('MovieManager') && (
                        <div className="mt-6 pt-6 border-t border-white/30">
                            <h3 className="text-lg font-bold text-DarkRed mb-4 text-yellow-400">Quản Lý Nội Dung</h3>
                            <button className={`w-full px-4 py-2 rounded-lg text-left font-medium ${activeTab === "quanlynoidung" ? "bg-yellow-300 text-black" : "hover:bg-white/30 text-white"}`} onClick={() => navigate('/Addmovie')}>Thêm Phim</button>
                        </div>
                    )}
                    {roles1.includes('Cashier') && (
                        <div className="mt-6 pt-6 border-t border-white/30">
                            <h3 className="text-lg font-bold text-DarkRed mb-4 text-yellow-400">Thu Ngân</h3>
                            <button className={`w-full px-4 py-2 rounded-lg text-left font-medium ${activeTab === "xacdinhdichvu" ? "bg-yellow-300 text-black" : "hover:bg-white/30 text-white"}`} onClick={() => setActiveTab("xacdinhdichvu")}>Xác nhận dịch vụ</button>
                        </div>
                    )}
                    {userRole?.includes('Director') && (
                        <div className="mt-6 pt-6 border-t border-white/30">
                            <h3 className="text-lg font-bold text-DarkRed mb-4 text-yellow-400">Giám đốc</h3>
                            <button className={`w-full px-4 py-2 rounded-lg text-left font-medium ${activeTab === "doanhthu" ? "bg-yellow-300 text-black" : "hover:bg-white/30 text-white"}`} onClick={() => setActiveTab("doanhthu")}>Doanh thu</button>
                        </div>
                    )}
                    {roles1.includes('FacilitiesManager') && (
                        <div className="mt-6 pt-6 border-t border-white/30">
                            <h3 className="text-lg font-bold text-DarkRed mb-4 text-yellow-400">Quản trị viên hệ thống</h3>
                            <button className={`w-full px-4 py-2 rounded-lg text-left font-medium ${activeTab === "csphongrap" ? "bg-yellow-300 text-black" : "hover:bg-white/30 text-white"}`} onClick={() => setActiveTab("csphongrap")}>Chỉnh sửa rạp</button>
                        </div>
                    )}
                </div>
                <div className="flex-1 space-y-8 mt-8 md:mt-0">
                    <h1 className="text-white text-3xl font-bold text-center uppercase">Cinema xin chào! {userEmail}</h1>

                    {activeTab === "password" && (
                        <div className="max-w-4xl mx-auto bg-white/10 rounded-xl shadow-2xl overflow-hidden p-8 animate-[slideInFromLeft_1s_ease-out]">
                            <div className="bg-white/10 p-6 rounded-2xl shadow-xl text-white">
                                <h2 className="text-2xl font-bold mb-6">Đổi mật khẩu</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block mb-3 font-semibold">Mật khẩu cũ</label>
                                        <input
                                            type="password"
                                            className="w-full border rounded-md px-4 py-2 bg-white/10"
                                            value={oldPassword}
                                            onChange={(e) => setOldPassword(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-2 font-semibold">Mật khẩu mới</label>
                                        <input
                                            type="password"
                                            className="w-full border rounded-md px-4 py-2 bg-white/10"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-2 font-semibold">Xác nhận mật khẩu mới</label>
                                        <input
                                            type="password"
                                            className="w-full border rounded-md px-4 py-2 bg-white/10"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
                                {message1 && (
                                    <p className={`mt-4 text-center font-semibold ${message1.includes('Lỗi:') ? 'text-red-500' : 'text-green-600'}`}>
                                        {message1}
                                    </p>
                                )}

                                <div className="mt-6 text-center">
                                    <button
                                        onClick={handleChangePassword}
                                        type="submit"
                                        disabled={loading}
                                        className="relative cursor-pointer py-4 px-8 text-center font-barlow inline-flex justify-center text-base uppercase text-white rounded-lg border-solid transition-transform duration-300 ease-in-out group outline-offset-4 focus:outline focus:outline-2 focus:outline-white focus:outline-offset-4 overflow-hidden">
                                        {loading ?
                                            'Đang cập nhật mật khẩu...' : 'Cập nhật mật khẩu'}

                                        <span
                                            className="absolute left-[-75%] top-0 h-full w-[50%] bg-white/20 rotate-12 z-10 blur-lg group-hover:left-[125%] transition-all duration-1000 ease-in-out"
                                        ></span>

                                        <span
                                            className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#D4EDF9] absolute h-[20%] rounded-tl-lg border-l-2 border-t-2 top-0 left-0"
                                        ></span>
                                        <span
                                            className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#D4EDF9] absolute group-hover:h-[90%] h-[60%] rounded-tr-lg border-r-2 border-t-2 top-0 right-0"
                                        ></span>
                                        <span
                                            className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#D4EDF9] absolute h-[60%] group-hover:h-[90%] rounded-bl-lg border-l-2 border-b-2 left-0 bottom-0"
                                        ></span>
                                        <span
                                            className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#D4EDF9] absolute h-[20%] rounded-br-lg border-r-2 border-b-2 right-0 bottom-0"
                                        ></span>
                                    </button>
                                </div>
                            </div>
                        </div>

                    )}
                    {activeTab === 'nhanvien' && roles1.includes('TheaterManager') && (
                        <div className="min-h-screen bg-gradient-to-b from-gray-700/70 to-gray-500/50 font-sans py-10 px-4 rounded-2xl">
                            <div className="max-w-6xl mx-auto">
                                <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-xl">
                                    <h2 className="text-3xl font-bold text-yellow-400 mb-6 tracking-wide">Thêm Nhân Viên</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Thông tin đăng nhập */}
                                        <div className="space-y-4">
                                            <h3 className="text-xl font-semibold text-white italic">Thông tin đăng nhập</h3>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-1">Rạp</label>
                                                <select
                                                    value={addStaffFormData.cinemaId}
                                                    onChange={(e) => handleAddStaffInputChange(e, 'cinemaId')}
                                                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                                    required
                                                >
                                                    <option value="" disabled>
                                                        -- Chọn rạp --
                                                    </option>
                                                    {cinemas.map((cinema) => (
                                                        <option key={cinema.cinemaId} value={cinema.cinemaId}>
                                                            {cinema.cinemaName}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-1">Email Đăng nhập</label>
                                                <input
                                                    type="email"
                                                    value={addStaffFormData.loginUserEmail}
                                                    onChange={(e) => handleAddStaffInputChange(e, 'loginUserEmail')}
                                                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                                    placeholder="Email Đăng nhập"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-1">Mật khẩu</label>
                                                <input
                                                    type="password"
                                                    value={addStaffFormData.loginUserPassword}
                                                    onChange={(e) => handleAddStaffInputChange(e, 'loginUserPassword')}
                                                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                                    placeholder="Mật khẩu"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-1">Xác nhận mật khẩu</label>
                                                <input
                                                    type="password"
                                                    value={addStaffFormData.loginUserPasswordConfirm}
                                                    onChange={(e) => handleAddStaffInputChange(e, 'loginUserPasswordConfirm')}
                                                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                                    placeholder="Xác nhận mật khẩu"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        {/* Thông tin cá nhân */}
                                        <div className="space-y-4">
                                            <h3 className="text-xl font-semibold text-white italic">Thông tin cá nhân</h3>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-1">Tên nhân viên</label>
                                                <input
                                                    type="text"
                                                    value={addStaffFormData.staffName}
                                                    onChange={(e) => handleAddStaffInputChange(e, 'staffName')}
                                                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                                    placeholder="Tên nhân viên"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-1">Ngày tháng năm sinh</label>
                                                <input
                                                    type="date"
                                                    value={addStaffFormData.dateOfBirth}
                                                    onChange={(e) => handleAddStaffInputChange(e, 'dateOfBirth')}
                                                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-1">SĐT</label>
                                                <input
                                                    type="tel"
                                                    value={addStaffFormData.phoneNumer}
                                                    onChange={(e) => handleAddStaffInputChange(e, 'phoneNumer')}
                                                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                                    placeholder="Số điện thoại"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-1">Vai trò</label>
                                                <select
                                                    value={addStaffFormData.role}
                                                    onChange={(e) => handleAddStaffInputChange(e, 'role')}
                                                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                                    required
                                                >
                                                    <option value="" disabled>
                                                        -- Chọn quyền hạn --
                                                    </option>
                                                    {roles.map((role) => (
                                                        <option key={role.roleid} value={role.roleid}>
                                                            {role.roleName}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-6 text-center">
                                        <button
                                            className="relative bg-yellow-950 text-yellow-400 border border-yellow-400 rounded-md px-6 py-2 font-medium overflow-hidden transition-all duration-300 hover:bg-yellow-900 hover:border-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed group"
                                            onClick={handleAddStaffSubmit}
                                            disabled={loading}
                                        >
                                            <span className="absolute inset-0 bg-yellow-400 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></span>
                                            {loading ? (
                                                <div className="flex flex-row gap-2">
                                                    <div className="w-4 h-4 rounded-full bg-yellow-300 animate-bounce"></div>
                                                    <div className="w-4 h-4 rounded-full bg-yellow-300 animate-bounce [animation-delay:-.3s]"></div>
                                                    <div className="w-4 h-4 rounded-full bg-yellow-300 animate-bounce [animation-delay:-.5s]"></div>
                                                </div>
                                            ) : (
                                                'Thêm nhân viên'
                                            )}
                                        </button>
                                    </div>
                                    <div className="mt-8">
                                        <h2 className="text-3xl font-bold text-yellow-400 mb-6 tracking-wide">Danh Sách Nhân Viên</h2>
                                        {error && <p className="text-red-400 mb-4 text-center">{error}</p>}
                                        {successMessage && <p className="text-green-400 mb-4 text-center">{successMessage}</p>}
                                        {isInitialLoading ? (
                                            <div className="flex justify-center items-center">
                                                <div className="flex flex-row gap-2">
                                                    <div className="w-4 h-4 rounded-full bg-yellow-300 animate-bounce"></div>
                                                    <div className="w-4 h-4 rounded-full bg-yellow-300 animate-bounce [animation-delay:-.3s]"></div>
                                                    <div className="w-4 h-4 rounded-full bg-yellow-300 animate-bounce [animation-delay:-.5s]"></div>
                                                </div>
                                            </div>
                                        ) : staffList.length === 0 ? (
                                            <p className="text-white text-center">Không có nhân viên nào.</p>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <table className="w-full bg-white/10 rounded-lg shadow-md">
                                                    <thead>
                                                        <tr className="bg-yellow-950 text-white">
                                                            <th className="px-4 py-3 text-left text-sm font-semibold">Tên</th>
                                                            <th className="px-4 py-3 text-left text-sm font-semibold">Ngày sinh</th>
                                                            <th className="px-4 py-3 text-left text-sm font-semibold">SĐT</th>
                                                            <th className="px-4 py-3 text-left text-sm font-semibold">Rạp</th>
                                                            <th className="px-4 py-3 text-left text-sm font-semibold">Tùy Chọn</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {staffList.map((staff) => (
                                                            <tr key={staff.staffId} className="border-t border-gray-600 hover:bg-gray-700/20 transition">
                                                                <td className="px-4 py-2 text-white">{staff.staffName}</td>
                                                                <td className="px-4 py-2 text-white">{staff.dayOfBirth}</td>
                                                                <td className="px-4 py-2 text-white">{staff.staffPhoneNumber}</td>
                                                                <td className="px-4 py-2 text-white">
                                                                    {cinemas.find((cinema) => cinema.cinemaId === staff.cinemaId)?.cinemaName || staff.cinemaId}
                                                                </td>
                                                                <td className="px-4 py-2">
                                                                    <div className="flex gap-2">
                                                                        <button
                                                                            onClick={() => handleEdit(staff.staffId)}
                                                                            className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition"
                                                                        >
                                                                            Sửa
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDelete(staff.staffId)}
                                                                            className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition"
                                                                        >
                                                                            Xóa
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                    {editingStaff && (
                                        <div className="mt-6 bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-yellow-500/30">
                                            <h3 className="text-2xl font-bold text-yellow-400 mb-4 tracking-wide">Chỉnh sửa nhân viên</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-1">Tên nhân viên</label>
                                                    <input
                                                        type="text"
                                                        value={editingStaff.staffName}
                                                        onChange={(e) => handleEditInputChange(e, 'staffName')}
                                                        className="w-full bg-gray-800 text-white border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-1">Ngày sinh</label>
                                                    <input
                                                        type="date"
                                                        value={editingStaff.dateOfBirth}
                                                        onChange={(e) => handleEditInputChange(e, 'dateOfBirth')}
                                                        className="w-full bg-gray-800 text-white border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-1">SĐT</label>
                                                    <input
                                                        type="tel"
                                                        value={editingStaff.phoneNumer}
                                                        onChange={(e) => handleEditInputChange(e, 'phoneNumer')}
                                                        className="w-full bg-gray-800 text-white border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-1">Rạp</label>
                                                    <select
                                                        value={editingStaff.cinemaId}
                                                        onChange={(e) => handleEditInputChange(e, 'cinemaId')}
                                                        className="w-full bg-gray-800 text-white border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                                    >
                                                        {cinemas.map((cinema) => (
                                                            <option key={cinema.cinemaId} value={cinema.cinemaId}>
                                                                {cinema.cinemaName}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-1">Vai trò</label>
                                                    <select
                                                        value={editingStaff.staffRole}
                                                        onChange={(e) => handleEditInputChange(e, 'staffRole')}
                                                        className="w-full bg-gray-800 text-white border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                                    >
                                                        {roles.map((role) => (
                                                            <option key={role.roleid} value={role.roleid}>
                                                                {role.roleName}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="mt-6 flex justify-center gap-4">
                                                <button
                                                    onClick={handleSaveEdit}
                                                    className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                    disabled={loading}
                                                >
                                                    {loading ? (
                                                        <div className="flex flex-row gap-2">
                                                            <div className="w-4 h-4 rounded-full bg-yellow-300 animate-bounce"></div>
                                                            <div className="w-4 h-4 rounded-full bg-yellow-300 animate-bounce [animation-delay:-.3s]"></div>
                                                            <div className="w-4 h-4 rounded-full bg-yellow-300 animate-bounce [animation-delay:-.5s]"></div>
                                                        </div>
                                                    ) : (
                                                        'Lưu'
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => setEditingStaff(null)}
                                                    className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition"
                                                >
                                                    Hủy
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Trang Add_movie */}
                    {activeTab === "quanlynoidung" && (
                        <div>

                        </div>
                    )}
                    {activeTab === "schedule" && (
                        <div>
                            <SCHEDULE />
                        </div>
                    )}
                    {activeTab === "doanhthu" && roles1.includes('Director') && (
                        <div>
                            <RevenueList />
                        </div>
                    )}
                    {activeTab === "xacdinhdichvu" && roles1.includes('Cashier') && (
                        <div className="p-4 max-w-4xl rounded-xl mx-auto bg-gradient-to-b from-gray-700/70 to-gray-500/50">
                            {/* Error Message */}
                            {errorFood && (
                                <div className="bg-red-600/10 text-red-400 p-4 mb-4 rounded-md border border-red-500/30">
                                    {errorFood}
                                </div>
                            )}

                            {/* Order Form */}
                            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-yellow-500/30">
                                <h2 className="text-2xl font-bold text-white mb-6">Đặt Hàng Mới</h2>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Email Khách Hàng</label>
                                    <input
                                        type="text"
                                        value={customerEmail}
                                        onChange={(e) => setCustomerEmail(e.target.value)}
                                        placeholder="Nhập email khách hàng"
                                        className="w-full bg-gray-800 text-white border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Ngày Đặt Hàng</label>
                                    <input
                                        type="text"
                                        value={new Date().toLocaleDateString()}
                                        disabled
                                        className="w-full bg-gray-800 text-white border border-gray-600 rounded-md p-2"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Chọn Món</label>
                                    <div className="flex gap-2">
                                        <select
                                            className="w-full bg-gray-800 text-white border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                            value={selectedFoodId}
                                            onChange={(e) => setSelectedFoodId(e.target.value)}
                                        >
                                            <option value="">Chọn món</option>
                                            {Array.isArray(foodItems) && foodItems.length > 0 ? (
                                                foodItems.map((item) => (
                                                    <option key={item.foodId} value={item.foodId}>{item.foodName}</option>
                                                ))
                                            ) : (
                                                <option disabled>Không có món nào</option>
                                            )}
                                        </select>
                                        <select
                                            className="w-24 p-2 border rounded-md"
                                            value={quanlity}
                                            onChange={(e) => setquanlity(Number(e.target.value))}
                                        >
                                            {[1, 2, 3, 4].map((num) => (
                                                <option key={num} value={num}>{num}</option>
                                            ))}
                                        </select>
                                        <button
                                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
                                            onClick={handleAddItem}
                                        >
                                            Thêm
                                        </button>
                                    </div>
                                </div>

                                {/* Selected Items List */}
                                {orderItems.length > 0 && (
                                    <div className="mb-4">
                                        <h3 className="text-sm font-medium text-white mb-2">Danh Sách Món Đã Chọn</h3>
                                        <ul className="list-disc pl-5 text-white bg-white/10 rounded-md p-4">
                                            {orderItems.map((item, index) => {
                                                const food = foodItems.find(f => f.foodId === item.productId);
                                                return (
                                                    <li key={index} className="flex items-center gap-2">
                                                        {food?.foodName || 'Unknown Item'} - quanlity: {item.quanlity}
                                                        <button
                                                            className="bg-red-600 text-white px-2 py-1 rounded-md hover:bg-red-700 transition"
                                                            onClick={() => handleDeleteStaffOrder(index)}
                                                        >
                                                            Xóa
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                )}

                                <div className="flex justify-end gap-2">
                                    <button
                                        className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition"
                                        onClick={() => {
                                            setOrderItems([]);
                                            setCustomerEmail('');
                                        }}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={handleSubmitOrder}
                                        disabled={orderItems.length === 0}
                                    >
                                        Gửi Đơn Hàng
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'csphongrap' && roles1.includes('FacilitiesManager') && (
                        <div className="min-h-screen bg-gradient-to-b from-gray-700/70 to-gray-500/50 font-sans py-10 px-4 rounded-2xl">
                            <div className="max-w-6xl mx-auto">
                                <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
                                    <h2 className="text-3xl font-bold text-yellow-400 tracking-wide">Danh Sách Rạp</h2>
                                    <div className="flex gap-4 mt-4 sm:mt-0">
                                        <button
                                            onClick={() => navigate('/QTVHThong/chinhsuaphongrap')}
                                            className="relative bg-yellow-950 text-yellow-400 border border-yellow-400 rounded-md px-6 py-2 font-medium overflow-hidden transition-all duration-300 hover:bg-yellow-900 hover:border-yellow-500 group"
                                        >
                                            <span className="absolute inset-0 bg-yellow-400 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></span>
                                            Chỉnh sửa rạp
                                        </button>
                                        <button
                                            onClick={() => navigate('/QTVHThong/chinhsuaphongrap')}
                                            className="relative bg-yellow-950 text-yellow-400 border border-yellow-400 rounded-md px-6 py-2 font-medium overflow-hidden transition-all duration-300 hover:bg-yellow-900 hover:border-yellow-500 group"
                                        >
                                            <span className="absolute inset-0 bg-yellow-400 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></span>
                                            Chỉnh sửa phòng chiếu
                                        </button>
                                    </div>
                                </div>

                                {loading && (
                                    <div className="flex justify-center items-center">
                                        <div className="flex flex-row gap-2">
                                            <div className="w-4 h-4 rounded-full bg-yellow-300 animate-bounce"></div>
                                            <div className="w-4 h-4 rounded-full bg-yellow-300 animate-bounce [animation-delay:-.3s]"></div>
                                            <div className="w-4 h-4 rounded-full bg-yellow-300 animate-bounce [animation-delay:-.5s]"></div>
                                        </div>
                                    </div>
                                )}

                                {successMessage && <p className="text-green-400 text-center mb-4">{successMessage}</p>}

                                {!loading && !error && cinemas.length === 0 && (
                                    <p className="text-white text-center">Không có rạp nào để hiển thị.</p>
                                )}

                                {cinemas.length > 0 && (
                                    <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-xl">
                                        <h3 className="text-2xl font-bold text-white mb-6">Danh Sách Rạp</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {cinemas.map((cinema) => (
                                                <div
                                                    key={cinema.cinemaId}
                                                    className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-md border border-gray-600 hover:border-yellow-500 transition-all duration-300"
                                                >
                                                    <h3 className="text-xl font-semibold text-yellow-400">{cinema.cinemaName}</h3>
                                                    <p className="text-gray-300 mt-2">{cinema.cinemaLocation}</p>
                                                    {cinema.cinemaDescription && (
                                                        <p className="text-gray-400 mt-1">{cinema.cinemaDescription}</p>
                                                    )}
                                                    {cinema.cinemaContactNumber && (
                                                        <p className="text-gray-400 mt-1">Số điện thoại: {cinema.cinemaContactNumber}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {/* Add Cinema Modal */}
                    {isAddModalOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                                <h3 className="text-xl font-bold mb-4">Thêm Rạp Mới</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Tên Rạp</label>
                                        <input
                                            type="text"
                                            name="cinemaName"
                                            value={newCinema.cinemaName}
                                            onChange={handleCinemaInputChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Địa điểm</label>
                                        <input
                                            type="text"
                                            name="cinemaLocation"
                                            value={newCinema.cinemaLocation}
                                            onChange={handleCinemaInputChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                                        <textarea
                                            name="cinemaDescription"
                                            value={newCinema.cinemaDescription}
                                            onChange={handleCinemaInputChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                                        <input
                                            type="text"
                                            name="cinemaContactNumber"
                                            value={newCinema.cinemaContactNumber}
                                            onChange={handleCinemaInputChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                        />
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end space-x-2">
                                    <button
                                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                                        onClick={() => setIsAddModalOpen(false)}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                        onClick={handleSaveCinema}
                                    >
                                        Lưu
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Delete Cinema Modal */}
                    {isDeleteModalOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                                <h3 className="text-xl font-bold mb-4">Xóa Rạp</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Chọn Rạp</label>
                                        <select
                                            value={selectedCinemaId}
                                            onChange={(e) => setSelectedCinemaId(e.target.value)}
                                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                        >
                                            <option value="">--Chọn rạp để xóa--</option>
                                            {cinemas.map((cinema) => (
                                                <option key={cinema.cinemaId} value={cinema.cinemaId}>
                                                    {cinema.cinemaName} (ID: {cinema.cinemaId})
                                                </option>
                                            ))}
                                        </select>
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
                                <div className="mt-6 flex justify-end space-x-2">
                                    <button
                                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                                        onClick={() => {
                                            setIsDeleteModalOpen(false);
                                            setSelectedCinemaId('');
                                        }}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                        onClick={handleDeleteCinema}
                                        disabled={!selectedCinemaId}
                                    >
                                        Xóa
                                    </button>
                                </div>
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