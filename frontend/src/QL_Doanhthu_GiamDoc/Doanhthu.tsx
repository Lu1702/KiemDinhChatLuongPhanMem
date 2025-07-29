import React, { useState, useEffect } from 'react';

interface MovieFormData {
  movieName: string;
  movieDuration: number;
  movieActor: string;
  movieImage: File | null;
  movieTrailerUrl: string;
  movieDescription: string;
  minimumAgeID: string;
  movieGenreList: string[];
  languageId: string;
  releaseDate: string;
  visualFormatList: string[];
  movieDirector: string;
}

interface Message {
  type: 'success' | 'error';
  text: string;
}

interface VisualFormat {
  movieVisualId: string;
  movieVisualFormatDetail: string;
}

interface Genre {
  genreId: string;
  genreName: string;
}

const CreateMovieForm: React.FC = () => {
  const [formData, setFormData] = useState<MovieFormData>({
    movieName: '',
    movieDuration: 0,
    movieActor: '',
    movieImage: null,
    movieTrailerUrl: '',
    movieDescription: '',
    minimumAgeID: '',
    movieGenreList: [],
    languageId: '',
    releaseDate: '2025-07-28T04:34:25.435Z',
    visualFormatList: [],
    movieDirector: '',
  });
  const [movieImageFileName, setMovieImageFileName] = useState<string | null>(null);
  const [message, setMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [visualFormats, setVisualFormats] = useState<VisualFormat[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);

  useEffect(() => {
    const fetchVisualFormats = async () => {
      try {
        const response = await fetch('http://localhost:5229/api/MovieVisualFormat/GetMovieVisualFormatList', {
          method: 'GET',
          headers: {
            accept: '*/*',
          },
        });
        if (response.ok) {
          const data: VisualFormat[] = await response.json();
          setVisualFormats(data);
        } else {
          setMessage({ type: 'error', text: `Failed to fetch visual formats: ${response.statusText}` });
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'An error occurred while fetching visual formats.' });
      }
    };

    const fetchGenres = async () => {
      try {
        const response = await fetch('http://localhost:5229/api/MovieGenre/GetMovieGenreList', {
          method: 'GET',
          headers: {
            accept: '*/*',
          },
        });
        if (response.ok) {
          const data: Genre[] = await response.json();
          setGenres(data);
        } else {
          setMessage({ type: 'error', text: `Failed to fetch genres: ${response.statusText}` });
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'An error occurred while fetching genres.' });
      }
    };

    fetchVisualFormats();
    fetchGenres();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleMovieImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, movieImage: file }));
    setMovieImageFileName(file ? file.name : null);
  };

  const handleVisualFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(
      (option) => option.value
    );
    setFormData((prev) => ({
      ...prev,
      visualFormatList: selectedOptions,
    }));
  };

  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(
      (option) => option.value
    );
    setFormData((prev) => ({
      ...prev,
      movieGenreList: selectedOptions,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.movieGenreList.length || !formData.visualFormatList.length) {
      setMessage({ type: 'error', text: 'Please select at least one genre and visual format.' });
      return;
    }
    setShowModal(true);
  };

  const confirmSubmit = async () => {
    setLoading(true);
    setShowModal(false);
    setMessage(null);

    const token = localStorage.getItem('authToken');
    if (!token) {
      setMessage({ type: 'error', text: 'Authentication token is missing.' });
      setLoading(false);
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('movieName', formData.movieName);
    formDataToSend.append('movieDuration', formData.movieDuration.toString());
    formDataToSend.append('movieActor', formData.movieActor);
    if (formData.movieImage) {
      formDataToSend.append('movieImage', formData.movieImage);
    }
    formDataToSend.append('movieTrailerUrl', formData.movieTrailerUrl);
    formDataToSend.append('movieDescription', formData.movieDescription);
    formDataToSend.append('minimumAgeID', formData.minimumAgeID);
    formDataToSend.append('movieGenreList', formData.movieGenreList.join(','));
    formDataToSend.append('languageId', formData.languageId);
    formDataToSend.append('releaseDate', formData.releaseDate);
    formDataToSend.append('visualFormatList', formData.visualFormatList.join(','));
    formDataToSend.append('movieDirector', formData.movieDirector);

    try {
      const response = await fetch('http://localhost:5229/api/movie/createMovie', {
        method: 'POST',
        headers: {
          accept: '*/*',
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Movie created successfully!' });
        setFormData({
          movieName: '',
          movieDuration: 0,
          movieActor: '',
          movieImage: null,
          movieTrailerUrl: '',
          movieDescription: '',
          minimumAgeID: '',
          movieGenreList: [],
          languageId: '',
          releaseDate: '2025-07-28T04:34:25.435Z',
          visualFormatList: [],
          movieDirector: '',
        });
        setMovieImageFileName(null);
      } else {
        const errorData = await response.json();
        setMessage({
          type: 'error',
          text: errorData.message || `Failed to create movie: ${response.statusText}`,
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: `An error occurred while creating the movie: ${(error as Error).message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <form
        onSubmit={handleSubmit}
        className="bg-white/20 backdrop-blur-md p-6 sm:p-8 lg:p-10 rounded-xl shadow-xl w-full max-w-2xl"
      >
        <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">
          Movie Details Form
        </h1>

        {message && (
          <div
            className={`p-3 mb-4 rounded-md text-center ${
              message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="mb-4 flex flex-col sm:flex-row sm:items-center">
          <label htmlFor="movieName" className="w-full sm:w-1/3 mb-1 sm:mb-0 text-gray-700">
            Movie Name <span className="text-red-500">*</span>
          </label>
          <div className="w-full sm:w-2/3">
            <input
              type="text"
              id="movieName"
              className="w-full p-2 border rounded-md"
              value={formData.movieName}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="mb-4 flex flex-col sm:flex-row sm:items-center">
          <label htmlFor="movieImage" className="w-full sm:w-1/3 mb-1 sm:mb-0 text-gray-700">
            Movie Image <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center space-x-2 w-full sm:w-2/3">
            <label
              htmlFor="movieImageInput"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 cursor-pointer"
            >
              Choose File
            </label>
            <input
              type="file"
              id="movieImageInput"
              className="hidden"
              onChange={handleMovieImageChange}
              required
            />
            <span className="text-gray-700 text-sm truncate flex-1">
              {movieImageFileName || 'No file chosen'}
            </span>
          </div>
        </div>

        <div className="mb-4 flex flex-col sm:flex-row sm:items-center">
          <label htmlFor="movieDescription" className="w-full sm:w-1/3 mb-1 sm:mb-0 text-gray-700">
            Description <span className="text-red-500">*</span>
          </label>
          <div className="w-full sm:w-2/3">
            <input
              type="text"
              id="movieDescription"
              className="w-full p-2 border rounded-md"
              value={formData.movieDescription}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="mb-4 flex flex-col sm:flex-row sm:items-center">
          <label htmlFor="movieDirector" className="w-full sm:w-1/3 mb-1 sm:mb-0 text-gray-700">
            Director <span className="text-red-500">*</span>
          </label>
          <div className="w-full sm:w-2/3">
            <input
              type="text"
              id="movieDirector"
              className="w-full p-2 border rounded-md"
              value={formData.movieDirector}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="mb-4 flex flex-col sm:flex-row sm:items-center">
          <label htmlFor="movieActor" className="w-full sm:w-1/3 mb-1 sm:mb-0 text-gray-700">
            Actor <span className="text-red-500">*</span>
          </label>
          <div className="w-full sm:w-2/3">
            <input
              type="text"
              id="movieActor"
              className="w-full p-2 border rounded-md"
              value={formData.movieActor}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="mb-4 flex flex-col sm:flex-row sm:items-center">
          <label htmlFor="movieTrailerUrl" className="w-full sm:w-1/3 mb-1 sm:mb-0 text-gray-700">
            Trailer URL <span className="text-red-500">*</span>
          </label>
          <div className="w-full sm:w-2/3">
            <input
              type="text"
              id="movieTrailerUrl"
              className="w-full p-2 border rounded-md"
              value={formData.movieTrailerUrl}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="mb-4 flex flex-col sm:flex-row sm:items-center">
          <label htmlFor="movieDuration" className="w-full sm:w-1/3 mb-1 sm:mb-0 text-gray-700">
            Duration (min) <span className="text-red-500">*</span>
          </label>
          <div className="w-full sm:w-2/3">
            <input
              type="number"
              id="movieDuration"
              className="w-full p-2 border rounded-md"
              value={formData.movieDuration}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  movieDuration: Number(e.target.value),
                }))
              }
              required
            />
          </div>
        </div>

        <div className="mb-4 flex flex-col sm:flex-row sm:items-center">
          <label htmlFor="minimumAgeID" className="w-full sm:w-1/3 mb-1 sm:mb-0 text-gray-700">
            Minimum Age ID <span className="text-red-500">*</span>
          </label>
          <div className="w-full sm:w-2/3">
            <input
              type="text"
              id="minimumAgeID"
              className="w-full p-2 border rounded-md"
              value={formData.minimumAgeID}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="mb-4 flex flex-col sm:flex-row sm:items-center">
          <label htmlFor="languageId" className="w-full sm:w-1/3 mb-1 sm:mb-0 text-gray-700">
            Language ID <span className="text-red-500">*</span>
          </label>
          <div className="w-full sm:w-2/3">
            <input
              type="text"
              id="languageId"
              className="w-full p-2 border rounded-md"
              value={formData.languageId}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="mb-4 flex flex-col sm:flex-row sm:items-center">
          <label htmlFor="releaseDate" className="w-full sm:w-1/3 mb-1 sm:mb-0 text-gray-700">
            Release Date <span className="text-red-500">*</span>
          </label>
          <div className="w-full sm:w-2/3">
            <input
              type="datetime-local"
              id="releaseDate"
              className="w-full p-2 border rounded-md"
              value={formData.releaseDate}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="mb-4 flex flex-col sm:flex-row sm:items-start">
          <label className="w-full sm:w-1/3 mb-1 sm:mb-0 text-gray-700">
            Visual Format List <span className="text-red-500">*</span>
          </label>
          <div className="w-full sm:w-2/3">
            <select
              multiple
              className="w-full p-2 border rounded-md"
              value={formData.visualFormatList}
              onChange={handleVisualFormatChange}
              required
            >
              {visualFormats.map((format) => (
                <option key={format.movieVisualId} value={format.movieVisualFormatDetail}>
                  {format.movieVisualFormatDetail}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-600 mt-1">
              Hold Ctrl (Windows) or Cmd (Mac) to select multiple formats
            </p>
          </div>
        </div>

        <div className="mb-4 flex flex-col sm:flex-row sm:items-start">
          <label className="w-full sm:w-1/3 mb-1 sm:mb-0 text-gray-700">
            Genre List <span className="text-red-500">*</span>
          </label>
          <div className="w-full sm:w-2/3">
            <select
              multiple
              className="w-full p-2 border rounded-md"
              value={formData.movieGenreList}
              onChange={handleGenreChange}
              required
            >
              {genres.map((genre) => (
                <option key={genre.genreId} value={genre.genreName}>
                  {genre.genreName}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-600 mt-1">
              Hold Ctrl (Windows) or Cmd (Mac) to select multiple genres
            </p>
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 w-full mt-6"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Thêm'}
        </button>
      </form>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full">
            <h2 className="text-lg font-bold mb-4 text-gray-800">
              Bạn có chắc chắn muốn thêm phim "{formData.movieName}" không?
            </h2>
            <div className="flex justify-end gap-4">
              <button
                className="bg-gray-300 text-black px-4 py-2 rounded-md hover:bg-gray-400"
                onClick={() => setShowModal(false)}
              >
                Không
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                onClick={confirmSubmit}
              >
                Có
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateMovieForm;