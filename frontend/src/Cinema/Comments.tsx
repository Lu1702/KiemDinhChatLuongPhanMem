import React, { useEffect, useState } from 'react';
import Nav from '../Header/nav';
import Bottom from '../Footer/bottom';
import { useNavigate } from 'react-router-dom';

// Định nghĩa interface cho bình luận
interface Comment {
    commentId: string;
    customerEmail: string;
    commentDetail: string;
    commentDate: Date;
}

interface CommentsApiResponse {
    status: string;
    message: string;
    data: Comment[];
}

// Định nghĩa interface cho chi tiết phim
interface MovieVisualFormat {
    movieVisualFormatId: string;
    movieVisualFormatName: string;
}

interface MovieGenre {
    movieGenreId: string;
    movieGenreName: string;
}

interface Movie {
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
    movieVisualFormat: MovieVisualFormat[];
    movieGenre: MovieGenre[];
}

interface MovieApiResponse {
    status: string;
    message: string;
    data: Movie;
}

interface PostCommentPayload {
    userID: string;
    movieID: string;
    commentDetail: string;
}

const Comments: React.FC = () => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState<string>('');
    const [movie, setMovie] = useState<Movie | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [posting, setPosting] = useState<boolean>(false);
    const [showTrailer, setShowTrailer] = useState<boolean>(false);
    const [trailerUrl, setTrailerUrl] = useState<string>('');
    const navigate = useNavigate();

    // Các state để xử lý chỉnh sửa
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editingCommentDetail, setEditingCommentDetail] = useState<string>('');
    
    // Các state mới để xử lý modal xác nhận
    const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
    const [commentToPost, setCommentToPost] = useState<string>('');


    // Lấy email và ID người dùng từ localStorage
    const userEmail = localStorage.getItem('Email');
    const userId = localStorage.getItem('IDND');
    const authToken = localStorage.getItem('authToken');

    // Lấy chi tiết phim và bình luận khi component được mount
    useEffect(() => {
        const fetchMovieDetails = async () => {
            try {
                const movieId = localStorage.getItem('movieId');
                if (!movieId) {
                    setError('Không tìm thấy ID phim.');
                    setLoading(false);
                    return;
                }

                // DEBUG LOGS
                console.log('--- Bắt đầu Debug ---');
                console.log('Giá trị userEmail trong localStorage:', userEmail);
                console.log('Giá trị userId trong localStorage:', userId);
                console.log('Giá trị movieId trong localStorage:', movieId);
                console.log('---------------------');
                // END DEBUG LOGS

                // Lấy chi tiết phim
                const movieResponse = await fetch(
                    `http://localhost:5229/api/movie/getMovieDetail/${movieId}`,
                    {
                        method: 'GET',
                        headers: {
                            accept: '*/*',
                        },
                    }
                );
                if (!movieResponse.ok) {
                    throw new Error(`Lỗi HTTP khi lấy chi tiết phim! trạng thái: ${movieResponse.status}`);
                }
                const movieResult: MovieApiResponse = await movieResponse.json();
                if (movieResult.status === 'Success') {
                    setMovie(movieResult.data);
                    localStorage.setItem('movieName', movieResult.data.movieName);
                } else {
                    setError(movieResult.message || 'Không thể tải chi tiết phim.');
                }

                // Lấy danh sách bình luận
                const commentsResponse = await fetch(
                    `http://localhost:5229/api/Comment/getComment/${movieId}`,
                    {
                        method: 'GET',
                        headers: {
                            accept: '*/*',
                        },
                    }
                );
                if (!commentsResponse.ok) {
                    throw new Error(`Lỗi HTTP khi lấy bình luận! trạng thái: ${commentsResponse.status}`);
                }
                const commentsResult: CommentsApiResponse = await commentsResponse.json();
                if (commentsResult.status === 'Success') {
                    setComments(commentsResult.data);
                    
                    // DEBUG LOGS
                    console.log('Dữ liệu bình luận từ API:', commentsResult.data);
                    console.log('---------------------');
                    // END DEBUG LOGS

                } else {
                    setError(commentsResult.message || 'Không thể tải danh sách bình luận.');
                }
            } catch (err: any) {
                setError(err.message || 'Lỗi kết nối khi tải dữ liệu. Vui lòng thử lại.');
                console.error('Lỗi chi tiết:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchMovieDetails();
    }, [userEmail, userId]);

    // Xử lý gửi bình luận mới
    const handleSubmitComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) {
            setError('Bình luận không được để trống.');
            return;
        }
        
        setError(null);
        setCommentToPost(newComment);
        setShowConfirmModal(true);
    };

    // Hàm gọi API khi người dùng xác nhận đăng bình luận
    const handleConfirmPost = async () => {
        setPosting(true);
        setShowConfirmModal(false);

        const movieId = localStorage.getItem('movieId');
        if (!movieId || !userId || !userEmail || !authToken) {
            setError('Vui lòng đăng nhập và chọn phim để gửi bình luận.');
            setPosting(false);
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:5229/api/Comment/uploadComment/${userId}/${movieId}?commentDetail=${encodeURIComponent(commentToPost)}`,
                {
                    method: 'POST',
                    headers: {
                        accept: '*/*',
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    errorData.message || `Lỗi HTTP khi gửi bình luận! trạng thái: ${response.status}`
                );
            }

            const result = await response.json();
            
            // DEBUG LOGS
            console.log('Dữ liệu phản hồi từ API khi gửi bình luận:', result);
            // END DEBUG LOGS

            if (result.status === 'Success') {
                // Tải lại trang để cập nhật danh sách bình luận
                window.location.reload();
            } else {
                setError(result.message || 'Gửi bình luận thất bại. Vui lòng thử lại.');
            }
        } catch (err: any) {
            setError(err.message || 'Lỗi kết nối khi gửi bình luận. Vui lòng thử lại.');
            console.error('Lỗi chi tiết:', err);
        } finally {
            setPosting(false);
            setNewComment('');
            setCommentToPost('');
        }
    };

    // Xử lý chỉnh sửa bình luận
    const handleEditComment = (commentId: string, currentDetail: string) => {
        setIsEditing(true);
        setEditingCommentId(commentId);
        setEditingCommentDetail(currentDetail);
    };

    // Xử lý lưu bình luận đã chỉnh sửa
    const handleSaveEdit = async () => {
        if (!editingCommentDetail.trim()) {
            setError('Bình luận không được để trống.');
            return;
        }

        if (!editingCommentId || !authToken) {
            setError('Lỗi không tìm thấy thông tin bình luận hoặc token.');
            return;
        }
        
        setError(null);
        setPosting(true);

        const encodedCommentDetail = encodeURIComponent(editingCommentDetail);

        try {
            const response = await fetch(
                `http://localhost:5229/api/Comment/editComment/${editingCommentId}?commentDetail=${encodedCommentDetail}`,
                {
                    method: 'PATCH',
                    headers: {
                        accept: '*/*',
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    errorData.message || `Lỗi HTTP khi sửa bình luận! trạng thái: ${response.status}`
                );
            }

            // Tải lại trang để cập nhật danh sách bình luận
            window.location.reload();

        } catch (err: any) {
            setError(err.message || 'Lỗi kết nối khi sửa bình luận. Vui lòng thử lại.');
            console.error('Lỗi chi tiết:', err);
        } finally {
            setPosting(false);
        }
    };

    // Xử lý xóa bình luận
    const handleDeleteComment = async (commentId: string) => {
        if (!authToken) {
            setError('Bạn cần đăng nhập để thực hiện hành động này.');
            return;
        }
        
        const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa bình luận này không?');
        if (!confirmDelete) {
            return;
        }

        setError(null);
        setPosting(true);

        try {
            const response = await fetch(
                `http://localhost:5229/api/Comment/deleteComment/${commentId}`,
                {
                    method: 'DELETE',
                    headers: {
                        accept: '*/*',
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    errorData.message || `Lỗi HTTP khi xóa bình luận! trạng thái: ${response.status}`
                );
            }
            
            // Tải lại trang để cập nhật danh sách bình luận
            window.location.reload();

        } catch (err: any) {
            setError(err.message || 'Lỗi kết nối khi xóa bình luận. Vui lòng thử lại.');
            console.error('Lỗi chi tiết:', err);
        } finally {
            setPosting(false);
        }
    };


    // Xử lý hiển thị trailer
    const handleOpenTrailer = (url: string) => {
        const getVideoId = (inputUrl: string) => {
            const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/;
            const match = inputUrl.match(regex);
            return match ? match[1] : null;
        };

        const videoId = getVideoId(url);
        if (videoId) {
            const embedUrl = `https://www.youtube.com/embed/${videoId}`;
            setTrailerUrl(embedUrl);
            setShowTrailer(true);
        } else {
            console.error('Không thể trích xuất video ID từ URL trailer.');
            alert('Đã xảy ra lỗi khi mở trailer.');
        }
    };

    // Tách bình luận của người dùng và bình luận khác để hiển thị bình luận của mình lên đầu
    const userComments = comments.filter(comment =>
        comment.customerEmail?.trim().toLowerCase() === userEmail?.trim().toLowerCase()
    );
    const otherComments = comments.filter(comment =>
        comment.customerEmail?.trim().toLowerCase() !== userEmail?.trim().toLowerCase()
    );
    const sortedComments = [...userComments, ...otherComments];

    return (
        <div
            className="flex flex-col min-h-screen bg-fixed w-full bg-cover bg-center"
            style={{ backgroundImage: "url('https://images8.alphacoders.com/136/thumb-1920-1368754.jpeg')" }}
        >
            <div className="sticky top-0 z-50 bg-slate-950 shadow-md">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-8">
                    <Nav />
                </div>
            </div>
            <main className="flex-grow flex flex-col items-center">
                <div className="pt-3 w-full max-w-screen-xl mx-auto px-4 sm:px-8 py-12">
                    {movie && (
                        <div className="p-4 text-white">
                            <div className="flex flex-col md:flex-row gap-6 mb-6 justify-center items-start">
                                <div className="flex-shrink-0">
                                    <img
                                        src={movie.movieImage}
                                        alt={movie.movieName}
                                        className="w-full max-w-[400px] rounded-lg shadow-lg object-cover"
                                    />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold text-yellow-400 mb-4 uppercase">{movie.movieName}</h2>
                                    <ul className="text-white mb-4 space-y-2">
                                        <li>
                                            <span className="text-yellow-400 font-bold">Thể loại:</span>{' '}
                                            <span className="pl-6">{movie.movieGenre.map(genre => genre.movieGenreName).join(', ')}</span>
                                        </li>
                                        <li>
                                            <span className="text-yellow-400 font-bold">Thời lượng:</span>{' '}
                                            <span className="pl-6">{movie.movieDuration} phút</span>
                                        </li>
                                        <li>
                                            <span className="text-yellow-400 font-bold">Ngôn ngữ:</span>{' '}
                                            <span className="pl-6">{Object.values(movie.movieLanguage)[0]}</span>
                                        </li>
                                        <li>
                                            <span className="text-yellow-400 font-bold">Độ tuổi:</span>{' '}
                                            <span className="pl-6">{Object.values(movie.movieMinimumAge)[0]}</span>
                                        </li>
                                        <li>
                                            <span className="text-yellow-400 font-bold">Đạo diễn:</span>{' '}
                                            <span className="pl-6">{movie.movieDirector || 'Không có thông tin'}</span>
                                        </li>
                                        <li>
                                            <span className="text-yellow-400 font-bold">Diễn viên:</span>{' '}
                                            <span className="pl-6">{movie.movieActor || 'Không có thông tin'}</span>
                                        </li>
                                        <li>
                                            <span className="text-yellow-400 font-bold">Khởi chiếu:</span>{' '}
                                            <span className="pl-6">{new Date(movie.releaseDate).toLocaleDateString('vi-VN')}</span>
                                        </li>
                                    </ul>
                                    <p className="max-w-[600px] mb-6 text-white">{movie.movieDescription}</p>
                                    <div>
                                        <button
                                            onClick={() => handleOpenTrailer(movie.movieTrailerUrl)}
                                            className="p-3 rounded-full backdrop-blur-lg border border-red-500/20 bg-gradient-to-tr from-black/60 to-black/40 shadow-lg hover:shadow-2xl hover:shadow-red-500/30 hover:scale-110 hover:rotate-2 active:scale-95 active:rotate-0 transition-all duration-300 ease-out cursor-pointer group relative overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                                            <div className="relative z-10">
                                                <svg
                                                    className="w-7 h-7 fill-current text-red-500 group-hover:text-red-400 transition-colors duration-300"
                                                    viewBox="0 0 576 512"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"
                                                    ></path>
                                                </svg>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className='flex justify-center items-center flex-col'>
                        <h1 className="text-3xl font-bold text-yellow-400 mb-6 uppercase">Bình luận</h1>
                        {loading && (
                            <div className="flex-col gap-4 w-full flex items-center justify-center">
                                <div className="w-20 h-20 border-4 border-transparent text-blue-400 text-4xl animate-spin flex items-center justify-center border-t-blue-400 rounded-full">
                                    <div className="w-16 h-16 border-4 border-transparent text-red-400 text-2xl animate-spin flex items-center justify-center border-t-red-400 rounded-full"></div>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="text-red-500 text-center p-4">{error}</div>
                        )}

                        {/* Form gửi bình luận */}
                        {!isEditing && (
                            <div className="mb-8 w-full max-w-screen-lg">
                                <form onSubmit={handleSubmitComment} className="bg-white/10 p-6 rounded-md shadow-lg">
                                    <h3 className="text-xl font-semibold text-white mb-4">Thêm bình luận</h3>
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Viết bình luận của bạn..."
                                        className="w-full p-3 rounded-md bg-gray-800 text-white border border-gray-600 focus:outline-none focus:border-yellow-400"
                                        rows={4}
                                        disabled={posting}
                                    />
                                    <button
                                        type="submit"
                                        disabled={posting || !newComment.trim()}
                                        className={`mt-4 px-6 py-2 rounded-md font-semibold text-white transition-colors duration-200 ${posting || !newComment.trim()
                                            ? 'bg-gray-600 cursor-not-allowed'
                                            : 'bg-green-600 hover:bg-green-700'
                                            }`}
                                    >
                                        {posting ? 'Đang gửi...' : 'Gửi bình luận'}
                                    </button>
                                </form>
                            </div>
                        )}
                        
                        {/* Form chỉnh sửa bình luận */}
                        {isEditing && (
                            <div className="mb-8 w-full max-w-screen-lg">
                                <div className="bg-white/10 p-6 rounded-md shadow-lg">
                                    <h3 className="text-xl font-semibold text-white mb-4">Chỉnh sửa bình luận</h3>
                                    <textarea
                                        value={editingCommentDetail}
                                        onChange={(e) => setEditingCommentDetail(e.target.value)}
                                        className="w-full p-3 rounded-md bg-gray-800 text-white border border-gray-600 focus:outline-none focus:border-yellow-400"
                                        rows={4}
                                    />
                                    <div className="mt-4 flex space-x-2">
                                        <button
                                            onClick={handleSaveEdit}
                                            disabled={posting || !editingCommentDetail.trim()}
                                            className={`px-6 py-2 rounded-md font-semibold text-white transition-colors duration-200 ${posting || !editingCommentDetail.trim()
                                                ? 'bg-gray-600 cursor-not-allowed'
                                                : 'bg-blue-600 hover:bg-blue-700'
                                                }`}
                                        >
                                            {posting ? 'Đang lưu...' : 'Lưu'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsEditing(false);
                                                setEditingCommentId(null);
                                                setEditingCommentDetail('');
                                            }}
                                            className="px-6 py-2 rounded-md font-semibold text-gray-800 bg-gray-300 hover:bg-gray-400 transition-colors duration-200"
                                        >
                                            Hủy
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Danh sách bình luận */}
                        <div className="w-full max-w-screen-md">
                            {sortedComments.length > 0 ? (
                                sortedComments.map((comment) => (
                                    <div
                                        key={comment.commentId}
                                        className="bg-white/10 p-4 rounded-md mb-4 shadow-md"
                                    >
                                        <div className="flex justify-between items-center">
                                            <p className="font-semibold text-yellow-400">
                                                {comment.customerEmail}
                                                {comment.customerEmail?.trim().toLowerCase() === userEmail?.trim().toLowerCase() && (
                                                    <span className="ml-2 text-green-400 text-sm">(Bạn)</span>
                                                )}
                                            </p>
                                            <div className="flex items-center space-x-2">
                                                <p className="text-sm text-gray-400">
                                                    {comment.commentDate && !isNaN(new Date(comment.commentDate).getTime())
                                                        ? `${new Date(comment.commentDate).toLocaleDateString('vi-VN')} ${new Date(comment.commentDate).toLocaleTimeString('vi-VN')}`
                                                        : 'Ngày không hợp lệ'}
                                                </p>
                                                {comment.customerEmail?.trim().toLowerCase() === userEmail?.trim().toLowerCase() && (
                                                    <>
                                                        <button
                                                            onClick={() => handleEditComment(comment.commentId, comment.commentDetail)}
                                                            className="text-blue-400 hover:text-blue-300 transition-colors"
                                                        >
                                                            Sửa
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteComment(comment.commentId)}
                                                            className="text-red-400 hover:text-red-300 transition-colors"
                                                        >
                                                            Xóa
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-white mt-2">{comment.commentDetail}</p>
                                    </div>
                                ))
                            ) : (
                                !loading && <p className="text-white text-center">Chưa có bình luận nào.</p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-md shadow-lg hover:bg-blue-700 transition-all"
                    >
                        Quay lại
                    </button>

                    {/* Modal xác nhận đăng bình luận */}
                    {showConfirmModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white p-6 rounded-lg shadow-xl w-80">
                                <h3 className="text-xl font-bold mb-4">Xác nhận đăng bình luận</h3>
                                <p className="mb-4">Bạn có chắc chắn muốn đăng bình luận này không?</p>
                                <div className="text-gray-600 italic border-l-4 border-gray-300 pl-2 mb-4">
                                    "{commentToPost}"
                                </div>
                                <div className="flex justify-end space-x-4">
                                    <button
                                        onClick={() => setShowConfirmModal(false)}
                                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                                    >
                                        Không
                                    </button>
                                    <button
                                        onClick={handleConfirmPost}
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                    >
                                        Có
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}


                    {showTrailer && (
                        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                            <div className="bg-black rounded-lg p-4 relative w-[90%] sm:w-[80%] md:w-[60%] aspect-video">
                                <button
                                    onClick={() => setShowTrailer(false)}
                                    className="absolute top-2 right-2 text-white text-xl sm:text-2xl font-bold"
                                >
                                    ✕
                                </button>
                                <iframe src={trailerUrl} title="Trailer" className="w-full h-full rounded-md" allowFullScreen />
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <footer>
                <Bottom />
            </footer>
        </div>
    );
};

export default Comments;