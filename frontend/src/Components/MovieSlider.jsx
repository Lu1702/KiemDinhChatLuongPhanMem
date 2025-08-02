import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { useNavigate } from "react-router-dom";

const MovieSlider = () => {
    const navigate = useNavigate();
    const handleListfilm = () => {
        navigate("/listfilm");
    }
    const slides = [

        {
            image: "https://api-website.cinestar.com.vn/media/MageINIC/bannerslider/BANNER-WEB.jpg",
        },
        {
            image: "https://api-website.cinestar.com.vn/media/MageINIC/bannerslider/1215wx365h_8_.jpg",
        },
        {
            image: "https://thumbs.dreamstime.com/b/color-vector-cinema-building-red-chair-giant-popcorn-boxes-drink-movie-night-commercial-online-concept-invitation-to-premiere-316893647.jpg?w=1400",
        },



    ];

    return (
        <div className="w-full bg-[#0d1128]">
            <Swiper
                navigation={true}
                modules={[Navigation, Autoplay]}
                autoplay={{ delay: 2000, disableOnInteraction: false }}
                className="mySwiper w-full"
            >
                {slides.map((slide, index) => (
                    <SwiperSlide key={index}>
                        <div className="relative w-full flex justify-center items-center">
                            <img
                                onClick={handleListfilm}
                                src={slide.image}
                                alt={`slide-${index}`}
                                className="w-full max-h-[400px] object-cover aspect-[1215/365] rounded-md"
                            />
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default MovieSlider;
