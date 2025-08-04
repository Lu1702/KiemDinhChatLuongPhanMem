import React, { useState, useEffect } from 'react';

interface MovieDTO {
  movieID: string;
  movieName: string;
}

interface Schedule {
  scheduleId: string;
  cinemaName: string;
  movieVisualFormatInfo: string;
  showTime: string;
  showDate: string;
  cinemaRoom: number;
}

interface SearchResult {
  movieName: string;
  getListSchedule: Schedule[];
}

interface Cinema {
  cinemaId: string;
  cinemaName: string;
}

interface Room {
  roomId: string;
  roomNumber: number;
}

interface MovieVisualFormat {
  movieVisualId: string;
  movieVisualFormatDetail: string;
}

interface NewScheduleData {
  movieId: string;
  cinemaRoomId: string;
  showTime: string;
  showDate: string;
  movieVisualId: string;
}

interface MovieDetail {
  movieId: string;
  movieName: string;
  movieImage: string;
  movieDescription: string;
  movieMinimumAge: { [key: string]: string };
  movieDirector: string;
  movieActor: string;
  movieTrailerUrl: string;
  movieDuration: number;
  releaseDate: string;
  movieLanguage: { [key: string]: string };
  movieVisualFormat: { movieVisualFormatId: string; movieVisualFormatName: string }[];
  movieGenre: { movieGenreId: string; movieGenreName: string }[];
}

interface ScheduleShowTimeDTO {
  showTimeID: string;
  roomId: string;
}

interface ScheduleVisualFormatDTO {
  visualFormatID: string;
  scheduleShowTimeDTOs: ScheduleShowTimeDTO[];
}

interface ScheduleDateDTO {
  startDate: string;
  scheduleVisualFormatDTOs: ScheduleVisualFormatDTO[];
}

interface AddScheduleRequest {
  movieID: string;
  scheduleDateDTOs: ScheduleDateDTO[];
}

interface HourSchedule {
  hourScheduleID: string;
  hourScheduleShowTime: string;
}

interface EditScheduleRequest {
  cinemaRoomId: string;
  movieId: string;
  movieVisualFormatId: string;
  dayInWeekendSchedule: string;
  hourScheduleId: string;
  scheduleDate: string;
}

const ScheduleSearch: React.FC = () => {
  const [movies, setMovies] = useState<MovieDTO[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<string>('');
  const [schedules, setSchedules] = useState<SearchResult[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [cinemaRooms, setCinemaRooms] = useState<Room[]>([]);
  const [movieVisualFormats, setMovieVisualFormats] = useState<MovieVisualFormat[]>([]);
  const [newSchedule, setNewSchedule] = useState<NewScheduleData>({
    movieId: '',
    cinemaRoomId: '',
    showTime: '',
    showDate: '',
    movieVisualId: '',
  });
  const [editSchedule, setEditSchedule] = useState<NewScheduleData>({
    movieId: '',
    cinemaRoomId: '',
    showTime: '',
    showDate: '',
    movieVisualId: '',
  });
  const [selectedCinemaId, setSelectedCinemaId] = useState<string>('');
  const [editCinemaId, setEditCinemaId] = useState<string>('');
  const [movieDetail, setMovieDetail] = useState<MovieDetail | null>(null);
  const [availableTimes, setAvailableTimes] = useState<HourSchedule[]>([]);

  const API_BASE_URL = 'http://localhost:5229/api';

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [
          movieResponse,
          cinemaResponse,
          visualFormatResponse,
          timeResponse,
        ] = await Promise.all([
          fetch(`${API_BASE_URL}/movie/getAllMoviesPagniation/1`),
          fetch(`${API_BASE_URL}/Cinema/getCinemaList`),
          fetch(`${API_BASE_URL}/MovieVisualFormat/GetMovieVisualFormatList`),
          fetch(`${API_BASE_URL}/Schedule/GetAllTimes`),
        ]);

        if (!movieResponse.ok) throw new Error('Lỗi khi lấy danh sách phim.');
        if (!cinemaResponse.ok) throw new Error('Lỗi khi lấy danh sách rạp.');
        if (!visualFormatResponse.ok) throw new Error('Lỗi khi lấy danh sách định dạng phim.');
        if (!timeResponse.ok) throw new Error('Lỗi khi lấy danh sách thời gian.');

        const movieData = await movieResponse.json();
        const cinemaData = await cinemaResponse.json();
        const visualFormatData = await visualFormatResponse.json();
        const timeData = await timeResponse.json();

        const moviesList = movieData.movieRespondDTOs || [];
        setMovies(moviesList);

        const cinemasList = cinemaData.data || [];
        setCinemas(cinemasList);

        const visualFormatsList = visualFormatData || [];
        setMovieVisualFormats(visualFormatsList);

        setAvailableTimes(timeData);

        if (moviesList.length > 0) {
          setSelectedMovie(moviesList[0].movieName);
          setNewSchedule((prev) => ({ ...prev, movieId: moviesList[0].movieID }));
          await fetchMovieDetail(moviesList[0].movieID);
        }
        if (cinemasList.length > 0) {
          setSelectedCinemaId(cinemasList[0].cinemaId);
        }
        if (visualFormatsList.length > 0) {
          setNewSchedule((prev) => ({ ...prev, movieVisualId: visualFormatsList[0].movieVisualId }));
        }
        if (timeData.length > 0) {
          setNewSchedule((prev) => ({ ...prev, showTime: timeData[0].hourScheduleID }));
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedCinemaId && newSchedule.movieVisualId) {
      fetchCinemaRooms(selectedCinemaId, newSchedule.movieVisualId);
    }
  }, [selectedCinemaId, newSchedule.movieVisualId]);

  useEffect(() => {
    if (editCinemaId && editSchedule.movieVisualId) {
      fetchCinemaRooms(editCinemaId, editSchedule.movieVisualId);
    }
  }, [editCinemaId, editSchedule.movieVisualId]);

  const fetchCinemaRooms = async (cinemaId: string, visualId: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/CinemaRoom/GetRoomByCinemaIdAndVisualId?cinemaId=${cinemaId}&visualId=${visualId}`
      );
      if (!response.ok) throw new Error('Không có phòng chiếu phù hợp.');
      const data = await response.json();

      const roomsList = data.data && data.data.length > 0 ? data.data[0].roomList : [];
      setCinemaRooms(roomsList);

      if (roomsList.length > 0) {
        if (showAddModal) {
          setNewSchedule((prev) => ({ ...prev, cinemaRoomId: roomsList[0].roomId }));
          setModalError(null);
        } else if (showEditModal) {
          setEditSchedule((prev) => ({ ...prev, cinemaRoomId: roomsList[0].roomId }));
        }
      } else {
        if (showAddModal) {
          setNewSchedule((prev) => ({ ...prev, cinemaRoomId: '' }));
          setModalError('Không có phòng chiếu phù hợp.');
        } else if (showEditModal) {
          setEditSchedule((prev) => ({ ...prev, cinemaRoomId: '' }));
        }
      }
    } catch (err: any) {
      if (showAddModal) {
        setModalError('Không có phòng chiếu phù hợp.');
        setCinemaRooms([]);
        setNewSchedule((prev) => ({ ...prev, cinemaRoomId: '' }));
      } else {
        setError(err.message);
        setCinemaRooms([]);
        if (showEditModal) {
          setEditSchedule((prev) => ({ ...prev, cinemaRoomId: '' }));
        }
      }
    }
  };

  const fetchMovieDetail = async (movieId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/movie/getMovieDetail/${movieId}`, {
        headers: {
          accept: '*/*',
        },
      });

      if (!response.ok) {
        throw new Error('Lỗi khi lấy chi tiết phim.');
      }

      const result = await response.json();
      if (result.status === 'Success' && result.data) {
        setMovieDetail(result.data);
      } else {
        setMovieDetail(null);
        setError('Không tìm thấy chi tiết phim.');
      }
    } catch (err: any) {
      setError(err.message);
      setMovieDetail(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!selectedMovie) {
      setError('Vui lòng chọn một bộ phim.');
      return;
    }
    setLoading(true);
    setSchedules(null);
    setError(null);
    setSelectedScheduleId(null);

    const encodedMovieName = encodeURIComponent(selectedMovie);

    try {
      const response = await fetch(`${API_BASE_URL}/Schedule/getScheduleByName?name=${encodedMovieName}`);
      if (!response.ok) {
        throw new Error('Lỗi không tìm thấy lịch chiếu.');
      }
      const result = await response.json();

      if (result.status === 'Success' && result.data && result.data.length > 0) {
        setSchedules(result.data);
      } else {
        setSchedules([]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedScheduleId) {
      alert('Vui lòng chọn một lịch chiếu để xóa.');
      return;
    }

    const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa lịch chiếu này không?');
    if (!confirmDelete) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        alert('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/Schedule/removeSchedule/${selectedScheduleId}`, {
        method: 'DELETE',
        headers: {
          accept: '*/*',
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        alert('Xóa lịch chiếu thành công!');
        handleSearch();
      } else {
        const errorData = await response.json();
        alert(`Lỗi khi xóa lịch chiếu: ${errorData.message}`);
        setError(errorData.message);
      }
    } catch (err: any) {
      alert(`Lỗi khi gọi API: ${err.message}`);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchedule = async () => {
    setLoading(true);
    setError(null);
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        alert('Không tìm thấy token xác thực.');
        setLoading(false);
        return;
      }

      if (
        !newSchedule.movieId ||
        !selectedCinemaId ||
        !newSchedule.cinemaRoomId ||
        !newSchedule.showTime ||
        !newSchedule.showDate ||
        !newSchedule.movieVisualId
      ) {
        alert('Vui lòng điền đầy đủ thông tin.');
        setLoading(false);
        return;
      }

      const requestBody: AddScheduleRequest = {
        movieID: newSchedule.movieId,
        scheduleDateDTOs: [
          {
            startDate: new Date(newSchedule.showDate + 'T00:00:00+07:00').toISOString(),
            scheduleVisualFormatDTOs: [
              {
                visualFormatID: newSchedule.movieVisualId,
                scheduleShowTimeDTOs: [
                  {
                    showTimeID: newSchedule.showTime,
                    roomId: newSchedule.cinemaRoomId,
                  },
                ],
              },
            ],
          },
        ],
      };

      const response = await fetch(`${API_BASE_URL}/Schedule/addSchedule?cinemaId=${selectedCinemaId}`, {
        method: 'POST',
        headers: {
          accept: '*/*',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        alert('Thêm lịch chiếu thành công!');
        setShowAddModal(false);
        setMovieDetail(null);
        setModalError(null);
        handleSearch();
      } else {
        const errorData = await response.json();
        alert(`Lỗi khi thêm lịch chiếu: ${errorData.message || 'Không xác định'}`);
      }
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSchedule = async () => {
    if (!selectedScheduleId) {
      alert('Vui lòng chọn một lịch chiếu để sửa.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        alert('Không tìm thấy token xác thực.');
        setLoading(false);
        return;
      }

      if (
        !editSchedule.movieId ||
        !editCinemaId ||
        !editSchedule.cinemaRoomId ||
        !editSchedule.showTime ||
        !editSchedule.showDate ||
        !editSchedule.movieVisualId
      ) {
        alert('Vui lòng điền đầy đủ thông tin.');
        setLoading(false);
        return;
      }

      const dayInWeek = new Date(editSchedule.showDate).toLocaleDateString('en-US', { weekday: 'long' });

      const requestBody: EditScheduleRequest = {
        cinemaRoomId: editSchedule.cinemaRoomId,
        movieId: editSchedule.movieId,
        movieVisualFormatId: editSchedule.movieVisualId,
        dayInWeekendSchedule: dayInWeek,
        hourScheduleId: editSchedule.showTime,
        scheduleDate: new Date(editSchedule.showDate + 'T00:00:00+07:00').toISOString(),
      };

      const response = await fetch(`${API_BASE_URL}/Schedule/editSchedule/${selectedScheduleId}`, {
        method: 'PATCH',
        headers: {
          accept: '*/*',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        alert('Sửa lịch chiếu thành công!');
        setShowEditModal(false);
        setMovieDetail(null);
        handleSearch();
      } else {
        const errorData = await response.json();
        alert(`Lỗi khi sửa lịch chiếu: ${errorData.message || 'Không xác định'}`);
      }
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditModal = () => {
    if (!selectedScheduleId) {
      alert('Vui lòng chọn một lịch chiếu để sửa.');
      return;
    }

    const selectedResult = schedules?.find((movieSchedule) =>
      movieSchedule.getListSchedule.some((schedule) => schedule.scheduleId === selectedScheduleId)
    );
    const selectedSchedule = selectedResult?.getListSchedule.find(
      (schedule) => schedule.scheduleId === selectedScheduleId
    );

    if (!selectedSchedule || !selectedResult) {
      alert('Không tìm thấy lịch chiếu được chọn.');
      return;
    }

    const selectedCinema = cinemas.find((cinema) => cinema.cinemaName === selectedSchedule.cinemaName);
    const selectedMovie = movies.find((movie) => movie.movieName === selectedResult.movieName);
    const selectedVisualFormat = movieVisualFormats.find(
      (format) => format.movieVisualFormatDetail === selectedSchedule.movieVisualFormatInfo
    );
    const selectedTime = availableTimes.find((time) => time.hourScheduleShowTime === selectedSchedule.showTime);

    setEditSchedule({
      movieId: selectedMovie?.movieID || '',
      cinemaRoomId: '',
      showTime: selectedTime?.hourScheduleID || '',
      showDate: selectedSchedule.showDate.split('T')[0],
      movieVisualId: selectedVisualFormat?.movieVisualId || '',
    });
    setEditCinemaId(selectedCinema?.cinemaId || '');
    setShowEditModal(true);
    fetchMovieDetail(selectedMovie?.movieID || '');
  };

  const handleCinemaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCinemaId = e.target.value;
    setSelectedCinemaId(newCinemaId);
    setModalError(null);
  };

  const handleEditCinemaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCinemaId = e.target.value;
    setEditCinemaId(newCinemaId);
  };

  const handleMovieChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMovieId = e.target.value;
    setNewSchedule({ ...newSchedule, movieId: newMovieId });
    setModalError(null);
    fetchMovieDetail(newMovieId);
  };

  const handleEditMovieChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMovieId = e.target.value;
    setEditSchedule({ ...editSchedule, movieId: newMovieId });
    fetchMovieDetail(newMovieId);
  };

  const isVisualFormatCompatible = (visualFormatId: string): boolean => {
    if (!movieDetail || !movieDetail.movieVisualFormat) return false;
    return movieDetail.movieVisualFormat.some(
      (format) => format.movieVisualFormatId === visualFormatId
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-700/70 to-gray-500/50 font-sans py-10 px-4 rounded-2xl">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-yellow-400 text-center mb-8 tracking-wide">
          Tìm kiếm & Quản lý Lịch chiếu Phim
        </h1>

        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-xl mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1">
              <label className="block text-base font-medium text-gray-300 mb-1">Chọn Phim</label>
              <select
                id="movie-select"
                value={selectedMovie}
                onChange={(e) => setSelectedMovie(e.target.value)}
                disabled={loading}
                className="w-full bg-gray-800 text-white border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                {loading && <option>Đang tải phim...</option>}
                {!loading && movies.length === 0 && <option>Không có phim nào</option>}
                {movies.map((movie) => (
                  <option key={movie.movieID} value={movie.movieName}>
                    {movie.movieName}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="relative bg-yellow-950 text-yellow-400 border border-yellow-400 rounded-md px-6 py-2 font-medium overflow-hidden transition-all duration-300 hover:bg-yellow-900 hover:border-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed group mt-6 sm:mt-0"
            >
              <span className="absolute inset-0 bg-yellow-400 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></span>
              {loading ? <div className="flex flex-row gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-300 animate-bounce"></div>
                <div
                  className="w-4 h-4 rounded-full bg-yellow-300 animate-bounce [animation-delay:-.3s]"
                ></div>
                <div
                  className="w-4 h-4 rounded-full bg-yellow-300 animate-bounce [animation-delay:-.5s]"
                ></div>
              </div>
                : 'Tìm kiếm'}
            </button>
          </div>
        </div>

        <div className=" p-6 rounded-2xl shadow-xl mb-8 flex justify-center items-center" >
          <button
            onClick={() => setShowAddModal(true)}
            className="relative bg-yellow-950 text-yellow-400 border border-yellow-400 rounded-md px-6 py-2 font-medium overflow-hidden transition-all duration-300 hover:bg-yellow-900 hover:border-yellow-500 group">
            <span className="absolute inset-0 bg-yellow-400 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></span>
            Thêm lịch chiếu
          </button>
        </div>

        {error && <p className="text-red-400 text-center mb-4">{error}</p>}

        {schedules && schedules.length > 0 && (
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-6">Kết quả tìm kiếm</h2>
            <div className="flex gap-4 mb-4">
              <button
                onClick={handleDelete}
                disabled={loading || !selectedScheduleId}
                className="relative bg-red-600 text-white rounded-md px-6 py-2 font-medium overflow-hidden transition-all duration-300 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang xóa...' : 'Xóa lịch chiếu đã chọn'}
              </button>
              <button
                onClick={handleOpenEditModal}
                disabled={loading || !selectedScheduleId}
                className="relative bg-blue-600 text-white rounded-md px-6 py-2 font-medium overflow-hidden transition-all duration-300 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang xử lý...' : 'Sửa lịch chiếu đã chọn'}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full bg-white/10 rounded-lg shadow-md">
                <thead>
                  <tr className="bg-yellow-950 text-white">
                    <th className="px-4 py-3 text-left text-sm font-semibold"></th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Tên phim</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Rạp</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Định dạng</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Phòng chiếu</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Thời gian</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Ngày</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((movieSchedule) =>
                    movieSchedule.getListSchedule.map((schedule) => (
                      <tr key={schedule.scheduleId} className="border-t border-gray-600 hover:bg-gray-700/20 transition">
                        <td className="px-4 py-2">
                          <input
                            type="radio"
                            name="schedule"
                            value={schedule.scheduleId}
                            checked={selectedScheduleId === schedule.scheduleId}
                            onChange={() => setSelectedScheduleId(schedule.scheduleId)}
                            className="text-yellow-500 focus:ring-yellow-500"
                          />
                        </td>
                        <td className="px-4 py-2 text-white">{movieSchedule.movieName}</td>
                        <td className="px-4 py-2 text-white">{schedule.cinemaName}</td>
                        <td className="px-4 py-2 text-white">{schedule.movieVisualFormatInfo}</td>
                        <td className="px-4 py-2 text-white">{schedule.cinemaRoom}</td>
                        <td className="px-4 py-2 text-white">{schedule.showTime}</td>
                        <td className="px-4 py-2 text-white">{new Date(schedule.showDate).toLocaleDateString('vi-VN')}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {schedules && schedules.length === 0 && (
          <p className="text-white text-center">Không tìm thấy lịch chiếu nào cho phim này.</p>
        )}

        {/* Modal thêm lịch chiếu */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="max-w-lg w-full bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-yellow-500/30">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Thêm Lịch Chiếu Mới</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setMovieDetail(null);
                    setModalError(null);
                  }}
                  className="text-gray-300 hover:text-white text-2xl"
                >
                  &times;
                </button>
              </div>
              {modalError && <p className="text-red-400 mb-4">{modalError}</p>}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Phim</label>
                  <select
                    value={newSchedule.movieId}
                    onChange={handleMovieChange}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    {movies.map((movie) => (
                      <option key={movie.movieID} value={movie.movieID}>
                        {movie.movieName}
                      </option>
                    ))}
                  </select>
                </div>
                {movieDetail ? (
                  <div>
                    <h3 className="text-xl font-semibold text-white italic">Định dạng phim</h3>
                    {movieDetail.movieVisualFormat && movieDetail.movieVisualFormat.length > 0 ? (
                      <ul className="list-disc list-inside text-gray-300">
                        {movieDetail.movieVisualFormat.map((format) => (
                          <li key={format.movieVisualFormatId}>{format.movieVisualFormatName}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-300">Không có định dạng phim nào.</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-300">Đang tải chi tiết phim...</p>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Rạp</label>
                  <select
                    value={selectedCinemaId}
                    onChange={handleCinemaChange}
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
                  <label className="block text-sm font-medium text-gray-300 mb-1">Định dạng phim</label>
                  <select
                    value={newSchedule.movieVisualId}
                    onChange={(e) => setNewSchedule({ ...newSchedule, movieVisualId: e.target.value })}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    {movieVisualFormats.map((format) => (
                      <option
                        key={format.movieVisualId}
                        value={format.movieVisualId}
                        disabled={!isVisualFormatCompatible(format.movieVisualId)}
                      >
                        {format.movieVisualFormatDetail}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Phòng chiếu</label>
                  <select
                    value={newSchedule.cinemaRoomId}
                    onChange={(e) => setNewSchedule({ ...newSchedule, cinemaRoomId: e.target.value })}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    {cinemaRooms.length === 0 ? (
                      <option value="">Không có phòng chiếu phù hợp</option>
                    ) : (
                      cinemaRooms.map((room) => (
                        <option key={room.roomId} value={room.roomId}>
                          Phòng: {room.roomNumber}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Thời gian</label>
                  <select
                    value={newSchedule.showTime}
                    onChange={(e) => setNewSchedule({ ...newSchedule, showTime: e.target.value })}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    <option value="">Chọn thời gian</option>
                    {availableTimes.map((time) => (
                      <option key={time.hourScheduleID} value={time.hourScheduleID}>
                        {time.hourScheduleShowTime}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Ngày chiếu</label>
                  <input
                    type="date"
                    value={newSchedule.showDate}
                    onChange={(e) => setNewSchedule({ ...newSchedule, showDate: e.target.value })}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-center gap-4">
                <button
                  onClick={handleAddSchedule}
                  disabled={loading}
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Đang thêm...' : 'Lưu'}
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setMovieDetail(null);
                    setModalError(null);
                  }}
                  className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal sửa lịch chiếu */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="max-w-lg w-full bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-yellow-500/30">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Sửa Lịch Chiếu</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setMovieDetail(null);
                  }}
                  className="text-gray-300 hover:text-white text-2xl"
                >
                  &times;
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Phim</label>
                  <select
                    value={editSchedule.movieId}
                    onChange={handleEditMovieChange}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    {movies.map((movie) => (
                      <option key={movie.movieID} value={movie.movieID}>
                        {movie.movieName}
                      </option>
                    ))}
                  </select>
                </div>
                {movieDetail ? (
                  <div>
                    <h3 className="text-xl font-semibold text-white italic">Định dạng phim</h3>
                    {movieDetail.movieVisualFormat && movieDetail.movieVisualFormat.length > 0 ? (
                      <ul className="list-disc list-inside text-gray-300">
                        {movieDetail.movieVisualFormat.map((format) => (
                          <li key={format.movieVisualFormatId}>{format.movieVisualFormatName}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-300">Không có định dạng phim nào.</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-300">Đang tải chi tiết phim...</p>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Rạp</label>
                  <select
                    value={editCinemaId}
                    onChange={handleEditCinemaChange}
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
                  <label className="block text-sm font-medium text-gray-300 mb-1">Định dạng phim</label>
                  <select
                    value={editSchedule.movieVisualId}
                    onChange={(e) => setEditSchedule({ ...editSchedule, movieVisualId: e.target.value })}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    {movieVisualFormats.map((format) => (
                      <option
                        key={format.movieVisualId}
                        value={format.movieVisualId}
                        disabled={!isVisualFormatCompatible(format.movieVisualId)}
                      >
                        {format.movieVisualFormatDetail}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Phòng chiếu</label>
                  <select
                    value={editSchedule.cinemaRoomId}
                    onChange={(e) => setEditSchedule({ ...editSchedule, cinemaRoomId: e.target.value })}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    {cinemaRooms.length === 0 ? (
                      <option value="">Không có phòng chiếu phù hợp</option>
                    ) : (
                      cinemaRooms.map((room) => (
                        <option key={room.roomId} value={room.roomId}>
                          Phòng: {room.roomNumber}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Thời gian</label>
                  <select
                    value={editSchedule.showTime}
                    onChange={(e) => setEditSchedule({ ...editSchedule, showTime: e.target.value })}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    <option value="">Chọn thời gian</option>
                    {availableTimes.map((time) => (
                      <option key={time.hourScheduleID} value={time.hourScheduleID}>
                        {time.hourScheduleShowTime}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Ngày chiếu</label>
                  <input
                    type="date"
                    value={editSchedule.showDate}
                    onChange={(e) => setEditSchedule({ ...editSchedule, showDate: e.target.value })}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-center gap-4">
                <button
                  onClick={handleEditSchedule}
                  disabled={loading}
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Đang sửa...' : 'Lưu'}
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setMovieDetail(null);
                  }}
                  className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleSearch;