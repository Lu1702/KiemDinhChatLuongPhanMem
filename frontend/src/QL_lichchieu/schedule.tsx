import React, { useEffect, useState } from "react";
import "./SchedulePage.css"; // Make sure this path is correct for your CSS file

const SchedulePage = () => {
  // Define types for each state variable based on your API response structure
  interface Cinema {
    cinemaId: string;
    cinemaName: string;
  }

  interface CinemaRoom {
    cinemaRoomId: string;
    cinemaRoomNumber: string;
  }

  interface Movie {
    movieID: string;
    movieName: string;
  }

  interface VisualFormat {
    movieVisualId: string;
    movieVisualFormatDetail: string;
  }

  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [selectedCinemaId, setSelectedCinemaId] = useState("");

  const [cinemaRooms, setCinemaRooms] = useState<CinemaRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState("");

  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovieId, setSelectedMovieId] = useState("");

  const [visualFormats, setVisualFormats] = useState<VisualFormat[]>([]);
  const [selectedFormatId, setSelectedFormatId] = useState("");

  const [selectedDateTime, setSelectedDateTime] = useState(""); // Format: "YYYY-MM-DDTHH:MM"

  // 1. Lấy danh sách rạp
  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        const res = await fetch("http://localhost:5229/api/Cinema/getCinemaList");
        const data = await res.json();
        if (data.status === "Success") {
          setCinemas(data.data);
        }
      } catch (err) {
        console.error("Lỗi khi lấy danh sách rạp:", err);
      }
    };
    fetchCinemas();
  }, []);

  // 2. Khi chọn rạp → lấy danh sách phòng
  useEffect(() => {
    if (!selectedCinemaId) {
      setCinemaRooms([]); // Clear rooms if no cinema is selected
      return;
    }

    const fetchCinemaRooms = async () => {
      try {
        const res = await fetch(
          `http://localhost:5229/api/CinemaRoom/SearchRoomByCinemaId?CinemaId=${selectedCinemaId}`
        );
        const data = await res.json();
        if (data.status === "Success") {
          setCinemaRooms(data.data);
        } else {
          setCinemaRooms([]);
          console.warn("Không tìm thấy phòng cho rạp này hoặc lỗi API:", data.message);
        }
      } catch (err) {
        console.error("Lỗi khi lấy danh sách phòng chiếu:", err);
        setCinemaRooms([]);
      }
    };

    fetchCinemaRooms();
  }, [selectedCinemaId]);

  // 3. Lấy danh sách định dạng
  useEffect(() => {
    const fetchVisualFormats = async () => {
      try {
        const res = await fetch("http://localhost:5229/api/MovieVisualFormat/GetMovieVisualFormatList");
        const data: VisualFormat[] = await res.json(); 
        
        if (Array.isArray(data) && data.length > 0) {
          setVisualFormats(data);
        } else {
          setVisualFormats([]);
        }
      } catch (err) {
        console.error("Lỗi khi lấy định dạng:", err);
        setVisualFormats([]);
      }
    };
    fetchVisualFormats();
  }, []);

  // 4. Lấy danh sách phim
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await fetch("http://localhost:5229/api/movie/getAllMoviesPagniation/1");
        const data = await res.json();
        if (data.movieRespondDTOs) {
          setMovies(data.movieRespondDTOs);
        }
      } catch (err) {
        console.error("Lỗi khi lấy phim:", err);
      }
    };
    fetchMovies();
  }, []);

  // 5. Hàm tạo lịch chiếu
  const handleCreateSchedule = async () => {
    if (!selectedCinemaId || !selectedRoomId || !selectedMovieId || !selectedFormatId || !selectedDateTime) {
      alert("Vui lòng chọn đầy đủ các thông tin.");
      return;
    }

    let formattedDateTime = selectedDateTime;
    try {
      const now = new Date(); 
      console.log("Current local time (for reference):", now.toLocaleString());
      formattedDateTime = new Date(selectedDateTime).toISOString();
      console.log("Formatted DateTime (ISO):", formattedDateTime);
    } catch (e) {
      console.error("Could not format date, using raw string:", selectedDateTime, e);
      formattedDateTime = selectedDateTime + ':00.000Z'; 
    }

    const payload = {
      movieID: selectedMovieId,
      scheduleDateDTOs: [
        {
          startDate: formattedDateTime,
          scheduleVisualFormatDTOs: [
            {
              visualFormatID: selectedFormatId,
              scheduleShowTimeDTOs: [
                {
                  showTimeID: "00000000-0000-0000-0000-000000000000", 
                  roomId: selectedRoomId,
                },
              ],
            },
          ],
        },
      ],
    };

    console.log("Payload gửi đi:", JSON.stringify(payload, null, 2));

    try {
      const res = await fetch(
        `http://localhost:5229/api/Schedule/addSchedule?cinemaId=${selectedCinemaId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "accept": "*/*"
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (res.ok && data.status === "Success") {
        alert("Tạo lịch chiếu thành công!");
        setSelectedCinemaId("");
        setSelectedRoomId("");
        setSelectedMovieId("");
        setSelectedFormatId("");
        setSelectedDateTime("");
      } else {
        alert("Tạo lịch chiếu thất bại: " + (data.message || "Lỗi không xác định."));
      }
    } catch (error) {
      console.error("Lỗi tạo lịch chiếu:", error);
      alert("Đã xảy ra lỗi khi gửi lịch chiếu.");
    }
  };

  return (
    // Main wrapper div with form-bg-opacity-30 and padding
    <div className="form-bg-opacity-30" style={{ padding: 20 }}>
      <h2>Quản lý lịch chiếu</h2>

      {/* Rạp */}
      <div className="uiverse-pixel-input-wrapper" style={{ marginBottom: 15 }}>
        <label className="uiverse-pixel-label">Chọn rạp: </label>
        <select
          value={selectedCinemaId}
          onChange={(e) => {
            setSelectedCinemaId(e.target.value);
            setSelectedRoomId("");
          }}
          className="uiverse-pixel-input"
        >
          <option value="">-- Chọn rạp --</option>
          {cinemas.map((cinema) => (
            <option key={cinema.cinemaId} value={cinema.cinemaId}>
              {cinema.cinemaName}
            </option>
          ))}
        </select>
      </div>

      {/* Phòng */}
      {selectedCinemaId && cinemaRooms.length > 0 && (
        <div className="uiverse-pixel-input-wrapper" style={{ marginBottom: 15 }}>
          <label className="uiverse-pixel-label">Chọn phòng chiếu: </label>
          <select
            value={selectedRoomId}
            onChange={(e) => setSelectedRoomId(e.target.value)}
            className="uiverse-pixel-input"
          >
            <option value="">-- Chọn phòng --</option>
            {cinemaRooms.map((room) => (
              <option key={room.cinemaRoomId} value={room.cinemaRoomId}>
                {room.cinemaRoomNumber}
              </option>
            ))}
          </select>
        </div>
      )}
      {selectedCinemaId && cinemaRooms.length === 0 && (
        <div style={{ marginBottom: 15, color: 'orange' }}>
          Không có phòng nào cho rạp này.
        </div>
      )}

      {/* Phim */}
      {movies.length > 0 && (
        <div className="uiverse-pixel-input-wrapper" style={{ marginBottom: 15 }}>
          <label className="uiverse-pixel-label">Chọn phim: </label>
          <select
            value={selectedMovieId}
            onChange={(e) => setSelectedMovieId(e.target.value)}
            className="uiverse-pixel-input"
          >
            <option value="">-- Chọn phim --</option>
            {movies.map((movie) => (
              <option key={movie.movieID} value={movie.movieID}>
                {movie.movieName}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Định dạng */}
      {visualFormats.length > 0 && (
        <div className="uiverse-pixel-input-wrapper" style={{ marginBottom: 15 }}>
          <label className="uiverse-pixel-label">Chọn định dạng: </label>
          <select
            value={selectedFormatId}
            onChange={(e) => setSelectedFormatId(e.target.value)}
            className="uiverse-pixel-input"
          >
            <option value="">-- Chọn định dạng --</option>
            {visualFormats.map((vf) => (
              <option key={vf.movieVisualId} value={vf.movieVisualId}>
                {vf.movieVisualFormatDetail}
              </option>
            ))}
          </select>
        </div>
      )}
      {visualFormats.length === 0 && (
        <div style={{ marginBottom: 15, color: 'red' }}>
          Đang tải định dạng hoặc không có định dạng nào được tìm thấy. Vui lòng kiểm tra Console.
        </div>
      )}

      {/* Thời gian chiếu */}
      <div className="uiverse-pixel-input-wrapper" style={{ marginBottom: 15 }}>
        <label className="uiverse-pixel-label">Chọn thời gian chiếu: </label>
        <input
          type="datetime-local"
          value={selectedDateTime}
          onChange={(e) => setSelectedDateTime(e.target.value)}
          className="uiverse-pixel-input"
        />
      </div>

      {/* Nút tạo */}
      <button
        onClick={handleCreateSchedule}
        className="button2" 
      >
        Tạo Lịch Chiếu
      </button>
    </div>
  );
};

export default SchedulePage;