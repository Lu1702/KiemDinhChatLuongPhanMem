import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface Room {
  cinemaRoomId: string;
  cinemaRoomNumber: number;
}

interface Movie {
  movieID: string;
  movieName: string;
}

interface Cinema {
  cinemaId: string;
  cinemaName: string;
}

interface VisualFormat {
  movieVisualId: string;
  movieVisualFormatDetail: string;
}

interface Schedule {
  scheduleId: string;
  cinemaName: string;
  movieVisualFormatInfo: string;
  showTime: string;
  showDate: string;
  cinemaRoom: number;
}

interface ScheduleResponse {
  status: string;
  message: string;
  data: {
    movieName: string;
    getListSchedule: Schedule[];
  }[];
}

const ScheduleForm: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [visualFormats, setVisualFormats] = useState<VisualFormat[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [selectedMovie, setSelectedMovie] = useState<string>('');
  const [selectedCinema, setSelectedCinema] = useState<string>('');
  const [selectedVisualFormat, setSelectedVisualFormat] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [showTimeID] = useState<string>('default-showtime-id'); // Placeholder
  const [message, setMessage] = useState<string>('');
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  // Fetch initial data: cinemas, rooms, movies
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const [cinemaRes, roomRes, movieRes] = await Promise.all([
          fetch('http://localhost:5229/api/Cinema/GetCinemaList', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('http://localhost:5229/api/CinemaRoom/GetRoomList', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('http://localhost:5229/api/movie/getAllMoviesPagniation/1', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
        ]);

        const cinemaData = await cinemaRes.json();
        const roomData = await roomRes.json();
        const movieData = await movieRes.json();

        if (cinemaData.status === 'Success') setCinemas(cinemaData.data);
        if (roomData.status === 'Success') setRooms(roomData.data);
        if (movieData.movieRespondDTOs) setMovies(movieData.movieRespondDTOs);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchData();
  }, []);

  // Fetch all visual formats
  useEffect(() => {
    fetch('http://localhost:5229/api/MovieVisualFormat/GetMovieVisualFormatList', {
      headers: {
        'Accept': '*/*',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'Success') {
          setVisualFormats(data.data);
        } else {
          console.warn('Visual format fetch failed:', data);
          setVisualFormats([]);
        }
      })
      .catch(err => {
        console.error('Error fetching visual formats:', err);
        setVisualFormats([]);
      });
  }, []);

  // Fetch schedules by movie name
  const fetchSchedules = async (movieName: string) => {
    try {
      const response = await fetch(`http://localhost:5229/api/Schedule/getScheduleByName?name=${encodeURIComponent(movieName)}`, {
        headers: {
          'Accept': '*/*',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const data: ScheduleResponse = await response.json();
        if (data.status === 'Success' && Array.isArray(data.data)) {
          const scheduleList = data.data.flatMap(item => item.getListSchedule);
          setSchedules(scheduleList);
          if (scheduleList.length > 0 && scheduleList[0].movieVisualFormatInfo) {
            setSelectedVisualFormat(scheduleList[0].movieVisualFormatInfo);
          }
        } else {
          setSchedules([]);
        }
      } else {
        console.error('Failed to fetch schedules');
        setSchedules([]);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setSchedules([]);
    }
  };

  // Fetch schedules when selected movie changes
  useEffect(() => {
    if (selectedMovie) {
      const selectedMovieName = movies.find(m => m.movieID === selectedMovie)?.movieName || '';
      if (selectedMovieName) {
        localStorage.setItem('tenphim', selectedMovieName);
        fetchSchedules(selectedMovieName);
      } else {
        setSchedules([]);
      }
    } else {
      setSchedules([]);
    }
  }, [selectedMovie, movies]);

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRoom || !selectedMovie || !startDate || !selectedCinema || !selectedVisualFormat) {
      setMessage('Please fill all fields');
      return;
    }

    localStorage.setItem('CinemaID', selectedCinema);
    const selectedMovieName = movies.find(m => m.movieID === selectedMovie)?.movieName || '';
    localStorage.setItem('tenphim', selectedMovieName);

    const payload = {
      movieID: selectedMovie,
      scheduleDateDTOs: [
        {
          startDate: startDate.toISOString(),
          scheduleVisualFormatDTOs: [
            {
              visualFormatID: selectedVisualFormat, // value is now ID
              scheduleShowTimeDTOs: [
                {
                  showTimeID: showTimeID,
                  roomId: selectedRoom
                }
              ]
            }
          ]
        }
      ]
    };

    try {
      const cinemaId = localStorage.getItem('CinemaID');
      if (!cinemaId) {
        setMessage('Cinema ID is missing');
        return;
      }

      const response = await fetch(`http://localhost:5229/api/Schedule/addSchedule?cinemaId=${cinemaId}`, {
        method: 'POST',
        headers: {
          'Accept': '*/*',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setMessage('Schedule added successfully!');
        await fetchSchedules(selectedMovieName);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setMessage(`Failed to add schedule: ${errorData.message || response.statusText}`);
      }
    } catch (err) {
      console.error('Error submitting schedule:', err);
      setMessage('Failed to add schedule');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Schedule a Movie</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Cinema</label>
          <select
            value={selectedCinema}
            onChange={(e) => setSelectedCinema(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          >
            <option value="">Select a cinema</option>
            {cinemas.map(c => (
              <option key={c.cinemaId} value={c.cinemaId}>{c.cinemaName}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Movie</label>
          <select
            value={selectedMovie}
            onChange={(e) => setSelectedMovie(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          >
            <option value="">Select a movie</option>
            {movies.map(m => (
              <option key={m.movieID} value={m.movieID}>{m.movieName}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Visual Format</label>
          <select
            value={selectedVisualFormat}
            onChange={(e) => setSelectedVisualFormat(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          >
            <option value="">Select a visual format</option>
            {visualFormats.map(vf => (
              <option key={vf.movieVisualId} value={vf.movieVisualId}>
                {vf.movieVisualFormatDetail}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Room</label>
          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          >
            <option value="">Select a room</option>
            {rooms.map(r => (
              <option key={r.cinemaRoomId} value={r.cinemaRoomId}>
                Room {r.cinemaRoomNumber}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Start Date</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            showTimeSelect
            dateFormat="Pp"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
        >
          Add Schedule
        </button>
      </form>

      {message && <p className="mt-4 text-center text-sm text-red-600">{message}</p>}

      {selectedMovie && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Schedules for Selected Movie</h2>
          {schedules.length > 0 ? (
            <ul className="space-y-2">
              {schedules.map((s) => (
                <li key={s.scheduleId} className="p-4 border rounded-md shadow-sm">
                  <p><strong>Start Date:</strong> {new Date(s.showDate).toLocaleString()}</p>
                  <p><strong>Visual Format:</strong> {s.movieVisualFormatInfo}</p>
                  <p><strong>Show Time:</strong> {s.showTime}</p>
                  <p><strong>Cinema Room:</strong> {s.cinemaRoom}</p>
                  <p><strong>Cinema:</strong> {s.cinemaName}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No schedules found for this movie.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ScheduleForm;
