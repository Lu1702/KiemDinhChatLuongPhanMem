import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './Home';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Account/Login';
import Register from './Account/Register';
import Listfilm from './Cinema/Listfilm';
import Forgotpassword from './Account/Forgotpass';
import Comingmovies from './Cinema/Comingmovies';
import Introduce from './Cinema/Introduce';
import Cinezone from './Cinema/Cinezone';
import PaymentPage from './Bookig/PaymentPage';
import Info from './Account/Info';
import QLNV from './QL_Nhanvien_QLRap/homeQLRạp';
import DT from './QL_Doanhthu_GiamDoc/Doanhthu';
import RapPhongChieu from './QL_Rap_PhongChieu_QtrivienHT/Quantrivienhethong_QuanlyRapPhongChieu';
import DV from './QLDichVu_ThuNgan/QLDichVu';
import Comments from './Cinema/Comments';
import Booking from './Bookig/Booking';
import BookingHistory from './Account/BookingHistory';
import Addmovie from './QL_Add_movie/Addmovie';
import MovieDetails from './Bookig/Movies';
import MovieDetail from './Bookig/MovieDetail';
import Abc from './VnpayCallBack/VNPAY';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/listfilm" element={<Listfilm />} />
        <Route path="/forgotpassword" element={<Forgotpassword />} />
        <Route path="/comingmovies" element={<Comingmovies />} />
        <Route path="/introduce" element={<Introduce />} />
        <Route path="/cinezone" element={<Cinezone />} />
        <Route path="/cinezone/:cinemaId" element={<Cinezone />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/info" element={<Info />} />
        <Route path="/HomeAdmin" element={<QLNV />} />
        <Route path="/Giamdoc/doanhthu" element={<DT />} />
        <Route path="/Quantrivienhethong/QLRapPhongChieu" element={<RapPhongChieu />} />
        <Route path="/QTVHThong/chinhsuaphongrap" element={<DV />} />
        <Route path="/comments" element={<Comments />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/bookinghistory/:userId" element={<BookingHistory />} />
        <Route path="/addmovie" element={<Addmovie />} />
        <Route path="/movies" element={<MovieDetails />} />
        <Route path="/moviedetail/:movieId" element={<MovieDetail />} />
        <Route path="*" element={<div className="text-white text-center p-4">404 - Trang không tìm thấy</div>} />
        <Route path="/VNPAY/PaymentStatus" element={<Abc/>}/>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

// Theo dõi hiệu suất ứng dụng
reportWebVitals();