using backend.Data;
using backend.Enum;
using backend.Interface.CommentInterface;
using backend.Interface.MovieInterface;
using backend.Model.Staff_Customer;
using backend.ModelDTO.CommentDTO.CommentRequest;
using backend.ModelDTO.CommentDTO.CommentRespond;
using backend.ModelDTO.GenericRespond;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace backend.Services.MovieServices
{
    public class CommentServices : ICommentServices
    {
        private readonly DataContext _dataContext;

        public CommentServices(DataContext dataContext)
        {
            this._dataContext = dataContext;
        }

        public GenericRespondWithObjectDTO<List<CommentRequestGetListDTO>> getAllComent(string movieID)
        {
            // Ai biết sửa cái warning này sửa giúp tui với :(
            if (!String.IsNullOrEmpty(movieID))
            {
                var getComment = _dataContext.movieCommentDetail.Where(x => x.movieId.Equals(movieID)).ToList();
                var newListCommentRespond = new List<CommentRequestGetListDTO>();
                foreach (var item in getComment)
                {
                    var newComment = new CommentRequestGetListDTO()
                    {
                        CommentId = item.commentID,
                        commentDetail = item.userCommentDetail,
                        customerEmail = _dataContext.userInformation
                        .FirstOrDefault(x => x.userId.Equals(_dataContext.Customers.FirstOrDefault(y => y.Id.Equals(item.customerID)).userID)).loginUserEmail,
                        commentDate = item.createdCommentTime
                    };
                    newListCommentRespond.Add(newComment);
                }

                return new GenericRespondWithObjectDTO<List<CommentRequestGetListDTO>>()
                {
                    Status = GenericStatusEnum.Success.ToString(),
                    message = "Lay Data Thanh Cong",
                    data = newListCommentRespond
                };
            }
            return new GenericRespondWithObjectDTO<List<CommentRequestGetListDTO>>()
            {
                Status = GenericStatusEnum.Failure.ToString(),
                message = "Khong Tim Thay Phim",
            };
        }

        // Đăng comment lên

        public async Task<GenericRespondDTOs> uploadComment(string customerID, string movieID, string commentDetail)
        {
            if (String.IsNullOrEmpty(customerID))
            {
                return new GenericRespondDTOs()
                {
                    message = "Lỗi không tìm thấy ID người dùng" ,
                    Status = GenericStatusEnum.Failure.ToString(),
                };
            }

            if(String.IsNullOrEmpty(movieID))
            {
                return new GenericRespondDTOs()
                {
                    Status = GenericStatusEnum.Failure.ToString() ,
                    message = "Thiếu MovieID"
                };
            }
            // Đăng comment lên
            var getCustomerId =  await _dataContext.Customers
                .FirstOrDefaultAsync(x => x.userID.Equals(customerID));
            if(getCustomerId == null)
            {
                return new GenericRespondDTOs()
                {
                    Status = GenericStatusEnum.Failure.ToString(),
                    message = "Lỗi Không tìm thấy thông tin khách hàng"
                };
            }
            // Tìm kiếm Order nếu đã mua và thanh toán thì mới được comment

            var getOrder = _dataContext.Order
                .Where(x => x.customerID.Equals(getCustomerId.Id)
                && x.PaymentStatus == PaymentStatus.PaymentSuccess.ToString());

            // Lấy danh sách vé Order

            var getTicketOrder = _dataContext.TicketOrderDetail
                .Include(x => x.movieSchedule)
                    .ThenInclude(x => x.movieInformation)
                        .Where(x => getOrder.Select(x => x.orderId).Contains(x.orderId)).ToList();

            var getMovieIDs = getTicketOrder.Select(x => x.movieSchedule.movieId);
            var checkStatus = getMovieIDs.Contains(movieID);
            // Lays tên phim

            if (getOrder.Any() && checkStatus)
            {
                try
                {
                    string commentIDGenerate = Guid.NewGuid().ToString();
                    await _dataContext.movieCommentDetail.AddAsync(new Model.Movie.movieCommentDetail()
                    {
                        customerID = getCustomerId.Id,
                        createdCommentTime = DateTime.Now,
                        movieId = movieID,
                        userCommentDetail = commentDetail,
                        commentID = commentIDGenerate,
                    });
                    await _dataContext.SaveChangesAsync();
                    return new GenericRespondDTOs()
                    {
                        Status = GenericStatusEnum.Success.ToString(),
                        message = "Đã đăng comment thành công !"
                    };
                }
                catch (Exception ex) 
                {
                    return new GenericRespondDTOs()
                    {
                        Status = GenericStatusEnum.Failure.ToString(),
                        message = "Lỗi : " + ex.Message
                    };
                }
            }
            return new GenericRespondDTOs()
            {
                Status = GenericStatusEnum.Failure.ToString(),
                message = "Lỗi Không đăng được comment ! bạn chưa mua vé hoặc đã mua nhưng chưa thanh toán"
            };
        }

        public GenericRespondWithObjectDTO<CommentRequestDTO> getCommentDetails(string commentID)
        {
            if (commentID != null)
            {
                var getCommentInfo = _dataContext.movieCommentDetail
                    .FirstOrDefault(x => x.commentID.Equals(commentID));
                if (getCommentInfo != null)
                {
                    var getUserEmail = _dataContext.Customers
                        .Include(x => x.userInformation).Where(x => x.Id.Equals(getCommentInfo.customerID));
                    var firstOrDefaultEmail = getUserEmail.FirstOrDefault();
                    var getMovies = _dataContext.movieInformation.FirstOrDefault(x => x.movieId.Equals(getCommentInfo.movieId));
                    if (getMovies != null)
                    {
                        if (firstOrDefaultEmail != null && getMovies.movieName != null)
                        {
                            return new GenericRespondWithObjectDTO<CommentRequestDTO>()
                            {
                                message = "Thành công" ,
                                Status = GenericStatusEnum.Success.ToString(),
                                data = new CommentRequestDTO()
                                {
                                    movieName = getMovies.movieName,
                                    commentDetail = getCommentInfo.userCommentDetail,
                                    userEmail = firstOrDefaultEmail.userInformation.loginUserEmail
                                }
                            };
                        }
                        return new GenericRespondWithObjectDTO<CommentRequestDTO>()
                        {
                            message = "Lỗi Không tìm thấy Phim hoặc Email",
                            Status = GenericStatusEnum.Failure.ToString()
                        };
                    }
                    return new GenericRespondWithObjectDTO<CommentRequestDTO>()
                    {
                        message = "Lỗi Không tìm thấy commendID",
                        Status = GenericStatusEnum.Failure.ToString()
                    };
                }
            }
            return new GenericRespondWithObjectDTO<CommentRequestDTO>()
            {
                message = "Lỗi Thiếu commentID",
                Status = GenericStatusEnum.Failure.ToString()
            };
        }

        public async Task<GenericRespondDTOs> editComment(string commentID, string commentDetail)
        {
            var getComment = _dataContext.movieCommentDetail.FirstOrDefault(x => x.commentID.Equals((commentID)));
            if (getComment != null)
            {
                try
                {
                    getComment.createdCommentTime = DateTime.Now;
                    getComment.userCommentDetail = commentDetail;

                    _dataContext.movieCommentDetail.Update(getComment);
                    await _dataContext.SaveChangesAsync();

                    return new GenericRespondDTOs()
                    {
                        Status = GenericStatusEnum.Success.ToString(),
                        message = "Sửa Bình Luận Thành công"
                    };
                }
                catch (Exception ex) 
                {
                    return new GenericRespondDTOs()
                    {
                        Status = GenericStatusEnum.Failure.ToString(),
                        message = "Lỗi : " + ex.Message
                    };
                }
            }
            return new GenericRespondDTOs()
            {
                Status = GenericStatusEnum.Failure.ToString(),
                message = "Lỗi Không tìm được bình luận"
            };

        }

        public async Task<GenericRespondDTOs> deleteComment(string commentID)
        {
            var getComment = _dataContext.movieCommentDetail.FirstOrDefault(x => x.commentID.Equals(commentID));
            if (getComment != null)
            {
                try
                {
                    _dataContext.movieCommentDetail.Remove(getComment);
                   await  _dataContext.SaveChangesAsync();
                    return new GenericRespondDTOs()
                    {
                        Status = GenericStatusEnum.Success.ToString(),
                        message = "Xóa bình luận thành công"
                    };
                }
                catch (Exception ex)
                {
                    return new GenericRespondDTOs()
                    {
                        Status = GenericStatusEnum.Failure.ToString(),
                        message = "Lỗi : " + ex.Message
                    };
                }
            }
            return new GenericRespondDTOs()
            {
                Status = GenericStatusEnum.Failure.ToString(),
                message = "Lỗi Không tìm được bình luận"
            };

        }
    }
}
