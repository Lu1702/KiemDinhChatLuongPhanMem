using backend.Data;
using backend.Enum;
using backend.Interface.CloudinaryInterface;
using backend.Interface.GenericsInterface;
using backend.Interface.MovieInterface;
using backend.Model.MinimumAge;
using backend.Model.Movie;
using backend.ModelDTO.GenericRespond;
using backend.ModelDTO.MoviesDTO.MovieRequest;
using backend.ModelDTO.MoviesDTO.MovieRespond;
using backend.ModelDTO.PaginiationDTO.Respond;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Data.Common;
using System.Globalization;
using System.Linq;
using System.Runtime.InteropServices.JavaScript;
using System.Transactions;
using backend.ModelDTO.MoviesDTO;

namespace backend.Services.MovieServices
{
    public class movieServices : IMovieService
    {
        private readonly DataContext _dataContext;

        private readonly ICloudinaryServices cloudinaryServices;

        public movieServices(DataContext dataContext, ICloudinaryServices cloudinaryServices)
        {
            _dataContext = dataContext;
            this.cloudinaryServices = cloudinaryServices;
        }

        public async Task<GenericRespondDTOs> add([FromForm] MovieRequestDTO movieRequestDTO)
        {
            if (_dataContext.movieInformation.Any(x => x.movieName == movieRequestDTO.movieName))
            {
                return new GenericRespondDTOs()
                {
                    Status = GenericStatusEnum.Failure.ToString(),
                    message = "Lỗi Tên phim đã tồn tại"
                };
            }else if (_dataContext.movieInformation.Any(x => x.movieTrailerUrl.Equals(movieRequestDTO.movieTrailerUrl)))
            {
                return new GenericRespondDTOs()
                {
                    Status = GenericStatusEnum.Failure.ToString(),
                    message = "Lỗi Trailer đã tồn tại"
                };
            }
            if (movieRequestDTO != null)
            {
                // Generate New GUID 
                // 
                await using var transaction = await _dataContext.Database.BeginTransactionAsync();
                try
                {
                    var movieID = Guid.NewGuid();

                    var getFullUploadPath = await cloudinaryServices.uploadFileToCloudinary(movieRequestDTO.movieImage);
                    var newMovie = new movieInformation()
                    {
                        movieId = movieID.ToString(),
                        movieName = movieRequestDTO.movieName,
                        movieImage = getFullUploadPath,
                        movieDescription = movieRequestDTO.movieDescription,
                        movieDirector = movieRequestDTO.movieDirector,
                        movieTrailerUrl = movieRequestDTO.movieTrailerUrl,
                        movieDuration = movieRequestDTO.movieDuration,
                        languageId = movieRequestDTO.languageId,
                        minimumAgeID = movieRequestDTO.minimumAgeID,
                        ReleaseDate = movieRequestDTO.releaseDate,
                    };

                    await _dataContext.movieInformation.AddAsync(newMovie);

                    var newMovieGenreArray = new List<movieGenreInformation>();

                    foreach (var movieGenreID in movieRequestDTO.movieGenreList)
                    {
                        newMovieGenreArray.Add(new movieGenreInformation()
                        {
                            movieGenreId = movieGenreID,
                            movieId = movieID.ToString()
                        });
                    }

                    await _dataContext.movieGenreInformation.AddRangeAsync(newMovieGenreArray);

                    // Add Thể loại hình ảnh của phim

                    var newMovieVisualArray = new List<movieVisualFormatDetail>();

                    foreach (var movieVisualFormatID in movieRequestDTO.visualFormatList)
                    {
                        newMovieVisualArray.Add(new movieVisualFormatDetail()
                        {
                            movieId = movieID.ToString(),
                            movieVisualFormatId = movieVisualFormatID,
                        });
                    }

                    await _dataContext.movieVisualFormatDetails.AddRangeAsync(newMovieVisualArray);

                    await _dataContext.SaveChangesAsync();
                    await transaction.CommitAsync();
                    return new GenericRespondDTOs()
                    {
                        Status = GenericStatusEnum.Success.ToString(),
                        message = "Thêm thành công"
                    };
                }
                catch (DbException db)
                {
                    await transaction.RollbackAsync();
                    if (db.Message.ToLower().Trim().Replace(" " , "").Contains("movieimage"))
                    {
                        return new GenericRespondDTOs()
                        {
                            Status = GenericStatusEnum.Failure.ToString(),
                            message = "Lỗi ảnh đã tồn tại"
                        };
                    }

                    return new GenericRespondDTOs()
                    {
                        Status = GenericStatusEnum.Failure.ToString(),
                        message = "Lỗi  DB"
                    };
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                    if (e.Message.ToLower().Trim().Replace(" " , "").Contains("movieimage"))
                    {
                        return new GenericRespondDTOs()
                        {
                            Status = GenericStatusEnum.Failure.ToString(),
                            message = "Lỗi ảnh đã tồn tại"
                        };
                    }

                    return new GenericRespondDTOs()
                    {
                        Status = GenericStatusEnum.Failure.ToString(),
                        message = "Lỗi hệ thống"
                    };
                }
            }

            return new GenericRespondDTOs()
            {
                Status = GenericStatusEnum.Failure.ToString(),
                message = "Lỗi nhập không đầy đủ thông tin"
            };
        }

        // Không xóa phim chỉ set bằng isDelete = true thôi tùy lúc
        public async Task<GenericRespondDTOs> remove(string Id)
        {
            if (String.IsNullOrEmpty(Id))
            {
                return new GenericRespondDTOs
                {
                    Status = GenericStatusEnum.Failure.ToString(),
                    message = "Bạn chưa nhập ID"
                };
            }

            var findMovie = await _dataContext.movieInformation.FindAsync(Id);
            var findMovieGenres = _dataContext.movieGenreInformation.Where(genre => genre.movieId == Id).ToList();
            var findMovieVisualFormat = _dataContext
                .movieVisualFormatDetails.Where(visualFormat => visualFormat.movieId == Id).ToList();
            if (findMovie == null && !findMovieGenres.Any() && !findMovieVisualFormat.Any())
            {
                return new GenericRespondDTOs()
                {
                    Status = GenericStatusEnum.Failure.ToString(),
                    message = "Không tìm thấy phim"
                };
            }

            var timKiemLichChieuLienQuan =
                await _dataContext.movieSchedule.Where
                    (x => x.movieId.Equals(Id)).ToListAsync();

            await using var transaction = await _dataContext.Database.BeginTransactionAsync();
            try
            {
                if (!timKiemLichChieuLienQuan.Any())
                {
                    _dataContext.movieGenreInformation.RemoveRange(findMovieGenres);
                    _dataContext.movieVisualFormatDetails.RemoveRange(findMovieVisualFormat);
                    _dataContext.movieInformation.Remove(findMovie);
                    await _dataContext.SaveChangesAsync();
                    await transaction.CommitAsync();
                    return new GenericRespondDTOs()
                    {
                        Status = GenericStatusEnum.Success.ToString(),
                        message = "Đã xóa thành công"
                    };
                }

                var findTicket = await _dataContext
                    .TicketOrderDetail.Where(order =>
                        timKiemLichChieuLienQuan.Select(x => x.movieScheduleId).Contains(order.movieScheduleID))
                    .ToListAsync();
                if (!findTicket.Any())
                {
                    _dataContext.movieGenreInformation.RemoveRange(findMovieGenres);
                    _dataContext.movieVisualFormatDetails.RemoveRange(findMovieVisualFormat);
                    _dataContext.movieInformation.Remove(findMovie);
                    _dataContext.movieSchedule.RemoveRange(timKiemLichChieuLienQuan);
                    await _dataContext.SaveChangesAsync();
                    await transaction.CommitAsync();
                    return new GenericRespondDTOs()
                    {
                        Status = GenericStatusEnum.Success.ToString(),
                        message = "Đã xóa thành công"
                    };
                }

                var timKiemLichChieuDaChieu =
                    timKiemLichChieuLienQuan.ToList();

                // Tầng số 1 : Kiểm tra để xóa mềm  

                // Case chuaw chieu
                if (timKiemLichChieuDaChieu.Any(x => !x.IsDelete))
                {

                    // Tiếnhanfnhf tìm kiếm
                    var timKiemLichChuaChieu =
                        timKiemLichChieuLienQuan.Where(x => x.IsDelete == false).ToList();
                    // Tiep Tuc Tim Kiem Order Liên quan
                    var findUnshowedTicket =
                        findTicket
                            .Where(x => timKiemLichChuaChieu
                                .Select(x => x.movieScheduleId).Contains(x.movieScheduleID)).ToList();
                    var findOrder =
                        _dataContext.Order
                            .Where(order => findUnshowedTicket.Select(x => x.orderId).Contains(order.orderId)).ToList();

                    // Case 1 : Nếu phim chưa chiếu mà đã có người thanh toán thành công thì Khoong cho xoa
                    if (findOrder.Any(x => !x.PaymentStatus.Equals(PaymentStatus.PaymentFailure.ToString())))
                    {
                        return new GenericRespondDTOs()
                        {
                            Status = GenericStatusEnum.Failure.ToString(),
                            message = "Loi Da co nguoi Dat Ve Khong The Xoa"
                        };

                    }
                    else if (findOrder.Any(x => x.PaymentStatus.Equals(PaymentStatus.PaymentFailure.ToString())))
                    {
                        // Case 2 : Nếu phim chưa chiếu mà thanh toán thât bại thfi xóa cứng
                        // Neeus thanh toan that bai
                        findOrder = findOrder
                            .Where(x => x.PaymentStatus.Equals(PaymentStatus.PaymentFailure.ToString())).ToList();
                        _dataContext.movieSchedule.RemoveRange(timKiemLichChuaChieu);
                        _dataContext.TicketOrderDetail.RemoveRange(findUnshowedTicket);
                        _dataContext.Order.RemoveRange(findOrder);
                        _dataContext.movieInformation.Remove(findMovie);
                        _dataContext.movieGenreInformation.RemoveRange(findMovieGenres);
                        _dataContext.movieVisualFormatDetails.RemoveRange(findMovieVisualFormat);

                        await _dataContext.SaveChangesAsync();
                        await transaction.CommitAsync();

                        return new GenericRespondDTOs()
                        {
                            Status = GenericStatusEnum.Success.ToString(),
                            message = "Xoóa thành công"
                        };
                    }
                }
                else if (timKiemLichChieuDaChieu.Any())
                {
                    // Tìm kiếm case đã chiếu
                    timKiemLichChieuDaChieu = timKiemLichChieuDaChieu.Where(x => x.IsDelete == true).ToList();
                    var findShowedTicket =
                        findTicket
                            .Where(x => timKiemLichChieuDaChieu
                                .Select(x => x.movieScheduleId).Contains(x.movieScheduleID)).ToList();
                    var findOrder =
                        _dataContext.Order
                            .Where(order => findShowedTicket.Select(x => x.orderId).Contains(order.orderId)
                                            && order.PaymentStatus.Equals(PaymentStatus.PaymentFailure.ToString()))
                            .ToList();
                    // Case 1 : Nếu phim đã chiếu mà đã có người thanh toán thành công thì tiến hành xóa mềm
                    if (!findOrder.Any())
                    {
                        var findTicketContaintOrder = _dataContext.TicketOrderDetail
                            .Where(order => findOrder.Select(x => x.orderId).Contains(order.orderId)).ToList();
                        _dataContext.TicketOrderDetail.RemoveRange(findTicketContaintOrder);
                        // Xoas những cái thông tin thanh toán thất bại cho đỡ nănng Dâtabase
                        _dataContext.Order.RemoveRange(findOrder);
                        // Tien Hanh Update
                        findMovie.isDelete = true;
                        _dataContext.movieInformation.Update(findMovie);
                        await _dataContext.SaveChangesAsync();
                        await transaction.CommitAsync();

                        return new GenericRespondDTOs()
                        {
                            Status = GenericStatusEnum.Success.ToString(),
                            message = "Xoóa thành công"
                        };

                    }
                    else if (findOrder.Any())
                    {
                        // Case 2 : Nếu phim đã chiếu mà thanh toán thât bại thfi xóa cứng
                        // Neeus thanh toan that bai
                        _dataContext.movieSchedule.RemoveRange(timKiemLichChieuDaChieu);
                        _dataContext.TicketOrderDetail.RemoveRange(findShowedTicket);
                        _dataContext.Order.RemoveRange(findOrder);
                        _dataContext.movieInformation.Remove(findMovie);
                        _dataContext.movieGenreInformation.RemoveRange(findMovieGenres);
                        _dataContext.movieVisualFormatDetails.RemoveRange(findMovieVisualFormat);

                        await _dataContext.SaveChangesAsync();
                        await transaction.CommitAsync();

                        return new GenericRespondDTOs()
                        {
                            Status = GenericStatusEnum.Success.ToString(),
                            message = "Xoóa thành công"
                        };
                    }
                }
            }
            catch (Exception e)
            {
                await transaction.RollbackAsync();
                return new GenericRespondDTOs()
                {
                    Status = GenericStatusEnum.Failure.ToString(),
                    message = "Không thể xóa được do lỗi"
                };
            }

            return new GenericRespondDTOs()
            {
                Status = GenericStatusEnum.Failure.ToString(),
                message = "Không thể xóa được do lỗi"
            };
        }


        public GenericRespondWithObjectDTO<movieGetDetailResponseDTO> getMovieDetail(string movieID)
        {
            var findMovieInfo = _dataContext.movieInformation
                .Where(x => x.movieId.Equals(movieID) && !x.isDelete)
                .Include(x => x.Language)
                .Include(x => x.minimumAge)
                .FirstOrDefault();
            if (findMovieInfo != null)
            {
                // Tiến hành lọc thông tin
                var findMovieVisualFormat = _dataContext.movieVisualFormatDetails
                    .Where(x => x.movieId == movieID)
                    .Include(x => x.movieVisualFormat)
                    .Select(x => new MovieVisualFormatGetDetailResponseDTO()
                    {
                        movieVisualFormatId = x.movieVisualFormat.movieVisualFormatId,
                        movieVisualFormatName = x.movieVisualFormat.movieVisualFormatName,
                    }).ToList();

                var findMovieGenre = _dataContext.movieGenreInformation.Where(x => x.movieId == movieID)
                    .Include(x => x.movieGenre)
                    .Select(x => new MovieGenreGetDetailResponseDTO()
                    {
                        movieGenreId = x.movieGenre.movieGenreId,
                        movieGenreName = x.movieGenre.movieGenreName,
                    }).ToList();
                Dictionary<string, string> MovieLanguage = new Dictionary<string, string>();
                Dictionary<string, string> MovieMiniumAge = new Dictionary<string, string>();

                MovieLanguage.Add(findMovieInfo.languageId, findMovieInfo.Language.languageDetail);
                MovieMiniumAge.Add(findMovieInfo.minimumAgeID, findMovieInfo.minimumAge.minimumAgeDescription);
                return new GenericRespondWithObjectDTO<movieGetDetailResponseDTO>()
                {

                    Status = GenericStatusEnum.Success.ToString(),
                    message = "Tìm chi tiết phim thành công",
                    data = new movieGetDetailResponseDTO()
                    {
                        movieId = movieID,
                        movieVisualFormat = findMovieVisualFormat,
                        MovieLanguage = MovieLanguage,
                        MovieMinimumAge = MovieMiniumAge,
                        movieGenre = findMovieGenre,
                        movieDirector = findMovieInfo.movieDirector,
                        movieImage = findMovieInfo.movieImage,
                        movieTrailerUrl = findMovieInfo.movieTrailerUrl,
                        ReleaseDate = findMovieInfo.ReleaseDate,
                        movieName = findMovieInfo.movieName,
                        movieActor = findMovieInfo.movieActor,
                        movieDescription = findMovieInfo.movieDescription,
                        movieDuration = findMovieInfo.movieDuration,
                    }
                };
            }

            return new GenericRespondWithObjectDTO<movieGetDetailResponseDTO>()
            {
                Status = GenericStatusEnum.Failure.ToString(),
                message = "Không tìm thấy phim , vui lòng thử lại sau"
            };
        }


        public async Task<GenericRespondDTOs> edit(string movieID, MovieEditRequestDTO dtos)
        {
            if (_dataContext.movieInformation.Any(x =>
                    !x.movieId.Equals(movieID) && x.movieName.Equals(dtos.movieName)))
            {
                return new GenericRespondDTOs()
                {
                    Status = GenericStatusEnum.Failure.ToString(),
                    message = "Lỗi Tên Phim đã tồn tại"
                };
            }else if (_dataContext.movieInformation.Any(x =>
                          !x.movieId.Equals(movieID) && x.movieTrailerUrl.Equals(dtos.movieTrailerUrl)))
            {
                return new GenericRespondDTOs()
                {
                    Status = GenericStatusEnum.Failure.ToString(),
                    message = "Lỗi Trailer Phim đã tồn tại"
                };
            }
            // Tìm kiếm các trường dữ liệu liên quan
            var findLanguageAndMiniumAgeAndMovieInfo = _dataContext.movieInformation.Where
                    (x => x.movieId.Equals(movieID) && !x.isDelete)
                .Include(x => x.Language)
                .Include(x => x.minimumAge)
                .FirstOrDefault();

            if (findLanguageAndMiniumAgeAndMovieInfo != null)
            {

                var FindMovieScheduleObject = _dataContext.movieSchedule.Where(x =>
                    x.movieId.Equals(findLanguageAndMiniumAgeAndMovieInfo.movieId) && !x.IsDelete).ToList();
                var FindOrder = _dataContext.TicketOrderDetail.Any(x =>
                    x.movieScheduleID.Equals(FindMovieScheduleObject.Select(x => x.movieScheduleId)));
                if (!FindOrder)
                {
                    var findGenreFilm = _dataContext.movieGenreInformation
                        .Where(x => x.movieId.Equals(movieID));


                    var findMovieVisualFormatID = _dataContext.movieVisualFormatDetails
                        .Where(x => x.movieId.Equals(movieID));

                    string movieName = string.Empty;
                    string minumAgeID = string.Empty;
                    string movieImage = string.Empty;
                    string movieDescription = string.Empty;
                    string movieDirector = string.Empty;
                    string movieActor = string.Empty;
                    string trailerURL = string.Empty;
                    int movieDuration = 0;
                    DateTime relaseDate = new DateTime();
                    string languageID = string.Empty;

                    // Using ternary operator for strings
                    var Transition = await _dataContext.Database.BeginTransactionAsync();
                    try
                    {
                        movieName = string.IsNullOrEmpty(dtos.movieName)
                            ? findLanguageAndMiniumAgeAndMovieInfo.movieName
                            : dtos.movieName;
                        minumAgeID = string.IsNullOrEmpty(dtos.minimumAgeID)
                            ? findLanguageAndMiniumAgeAndMovieInfo.minimumAgeID
                            : dtos.minimumAgeID;
                        movieDescription = string.IsNullOrEmpty(dtos.movieDescription)
                            ? findLanguageAndMiniumAgeAndMovieInfo.movieDescription
                            : dtos.movieDescription;
                        movieDirector = string.IsNullOrEmpty(dtos.movieDirector)
                            ? findLanguageAndMiniumAgeAndMovieInfo.movieDirector
                            : dtos.movieDirector;
                        movieActor = string.IsNullOrEmpty(dtos.movieActor)
                            ? findLanguageAndMiniumAgeAndMovieInfo.movieActor
                            : dtos.movieActor;
                        trailerURL = string.IsNullOrEmpty(dtos.movieTrailerUrl)
                            ? findLanguageAndMiniumAgeAndMovieInfo.movieTrailerUrl
                            : dtos.movieTrailerUrl;
                        languageID = string.IsNullOrEmpty(dtos.languageId)
                            ? findLanguageAndMiniumAgeAndMovieInfo.languageId
                            : dtos.languageId;
                        movieImage = dtos.movieImage == null
                            ? findLanguageAndMiniumAgeAndMovieInfo.movieImage
                            : await cloudinaryServices.uploadFileToCloudinary(dtos.movieImage);

                        movieDuration = dtos.movieDuration ?? findLanguageAndMiniumAgeAndMovieInfo.movieDuration;
                        relaseDate = dtos.releaseDate ?? findLanguageAndMiniumAgeAndMovieInfo.ReleaseDate;

                        // Nếu ko phải null thì tiến hành xóa hết trong DB

                        // Tạo môột List
                        List<string> movieGenre = new List<string>();
                        List<string> movieVisualFormat = new List<string>();
                        if (!dtos.movieGenreList.IsNullOrEmpty())
                        {
                            _dataContext.movieGenreInformation
                                .RemoveRange(findGenreFilm);
                            movieGenre = dtos.movieGenreList;
                            List<movieGenreInformation> movieGenreList = new List<movieGenreInformation>();
                            foreach (var Element in movieGenre)
                            {
                                // Duyeejt cac Element
                                movieGenreList.Add(new movieGenreInformation()
                                {
                                    movieId = findLanguageAndMiniumAgeAndMovieInfo.movieId,
                                    movieGenreId = Element
                                });
                            }

                            await _dataContext.movieGenreInformation.AddRangeAsync(movieGenreList);
                            // Tieeps tuc them vao DB
                        }

                        // Xóa hết

                        if (!dtos.visualFormatList.IsNullOrEmpty())
                        {
                            _dataContext.movieVisualFormatDetails
                                .RemoveRange(findMovieVisualFormatID);
                            movieVisualFormat = dtos.visualFormatList;

                            List<movieVisualFormatDetail> movieVisualFormatList = new List<movieVisualFormatDetail>();

                            foreach (var element in movieVisualFormat)
                            {
                                movieVisualFormatList.Add(new movieVisualFormatDetail()
                                {
                                    movieId = findLanguageAndMiniumAgeAndMovieInfo.movieId,
                                    movieVisualFormatId = element
                                });
                            }

                            await _dataContext.movieVisualFormatDetails.AddRangeAsync(movieVisualFormatList);
                        }

                        findLanguageAndMiniumAgeAndMovieInfo.movieActor = movieActor;
                        findLanguageAndMiniumAgeAndMovieInfo.movieDirector = movieDirector;
                        findLanguageAndMiniumAgeAndMovieInfo.movieDuration = movieDuration;
                        findLanguageAndMiniumAgeAndMovieInfo.languageId = languageID;
                        findLanguageAndMiniumAgeAndMovieInfo.minimumAgeID = minumAgeID;
                        findLanguageAndMiniumAgeAndMovieInfo.movieName = movieName;
                        findLanguageAndMiniumAgeAndMovieInfo.ReleaseDate = relaseDate;
                        findLanguageAndMiniumAgeAndMovieInfo.movieDescription = movieDescription;
                        findLanguageAndMiniumAgeAndMovieInfo.movieImage = movieImage;
                        findLanguageAndMiniumAgeAndMovieInfo.movieTrailerUrl = trailerURL;


                        _dataContext.movieInformation.Update(findLanguageAndMiniumAgeAndMovieInfo);
                        await _dataContext.SaveChangesAsync();
                        await Transition.CommitAsync();
                        return new GenericRespondDTOs()
                        {
                            Status = GenericStatusEnum.Success.ToString(),
                            message = "Sửa phim thành công"
                        };
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.Message);
                        await Transition.RollbackAsync();
                        return new GenericRespondDTOs()
                        {
                            Status = GenericStatusEnum.Failure.ToString(),
                            message = "Lỗi" + ex.Message
                        };
                    }
                }

                return new GenericRespondDTOs()
                {
                    Status = GenericStatusEnum.Failure.ToString(),
                    message = "Lỗi đã có người đặt vé"
                };
            }

            return new GenericRespondDTOs()
            {
                Status = GenericStatusEnum.Failure.ToString(),
                message = "Lỗi Không tìm thấy thông tin phim"
            };
        }

        public async Task<PagniationRespond> getListItemsPagination(int page, int pagesize = 9)
        {
            // Lấy giờ hiện tại
            DateTime dateTime = DateTime.Now;
            var getAllData = _dataContext.movieInformation.ToList();
            var getAllMovieData = await _dataContext.movieInformation
                .Where(x => !x.isDelete)
                .Select(x => new movieRespondDTO()
                {
                    movieName = x.movieName,
                    movieID = x.movieId,
                    movieImage = x.movieImage,
                    movieDuration = x.movieDuration,
                    movieGenres = x.movieGenreInformation.Select(mg => mg.movieGenre.movieGenreName).ToArray(),
                    ListLanguageName = x.Language.languageDetail,
                    movieTrailerUrl = x.movieTrailerUrl,
                    releaseDate = x.ReleaseDate,
                    movieVisualFormat = x.movieVisualFormatDetail
                        .Select(vs => vs.movieVisualFormat.movieVisualFormatName).ToArray(),
                    isRelease = x.ReleaseDate > DateTime.Now ? false : true,
                    minimumAge =
                        _dataContext.minimumAges.FirstOrDefault(m => m.minimumAgeID.Equals(x.minimumAgeID))
                            .minimumAgeInfo,
                    minimumAgeDescription =
                        _dataContext.minimumAges.FirstOrDefault(m => m.minimumAgeID.Equals(x.minimumAgeID))
                            .minimumAgeDescription
                }).Skip((page - 1) * pagesize).Take(pagesize).ToListAsync();
            var newPagniationRespond = new PagniationRespond()
            {
                movieRespondDTOs = getAllMovieData.ToList(),
                page = page,
                pageSize = (int)Math.Ceiling((double)getAllData.Count() / pagesize),
                totalCount = getAllData.Count,
            };
            return newPagniationRespond;
        }

        public async Task<List<movieRespondDTO>> getListMoviesByNameTake5(string movie)
        {
            DateTime dateTime = DateTime.Now;
            var getAllMovieData = await _dataContext.movieInformation
                .Where(x => x.movieName.Contains(movie) && !x.isDelete)
                .Select(x => new movieRespondDTO()
                {
                    movieName = x.movieName,
                    movieID = x.movieId,
                    movieDuration = x.movieDuration,
                    movieGenres = x.movieGenreInformation.Select(mg => mg.movieGenre.movieGenreName).ToArray(),
                    ListLanguageName = x.Language.languageDetail,
                    movieTrailerUrl = x.movieTrailerUrl,
                    releaseDate = x.ReleaseDate,
                    movieVisualFormat = x.movieVisualFormatDetail
                        .Select(vs => vs.movieVisualFormat.movieVisualFormatName).ToArray(),
                    isRelease = x.ReleaseDate > DateTime.Now ? false : true,

                })
                .Take(5).ToListAsync();
            return getAllMovieData;
        }

        public async Task<PagniationRespond> getFullSearchResult(string movieName, int page, int pagesize = 9)
        {
            // Lấy giờ hiện tại
            DateTime dateTime = DateTime.Now;
            var getAllMovieData = await _dataContext.movieInformation
                .Where(x => x.movieName.Contains(movieName) && !x.isDelete)
                .Select(x => new movieRespondDTO()
                {
                    movieName = x.movieName,
                    movieID = x.movieId,
                    movieImage = x.movieImage,
                    movieDuration = x.movieDuration,
                    movieGenres = x.movieGenreInformation.Select(mg => mg.movieGenre.movieGenreName).ToArray(),
                    ListLanguageName = x.Language.languageDetail,
                    movieTrailerUrl = x.movieTrailerUrl,
                    releaseDate = x.ReleaseDate,
                    movieVisualFormat = x.movieVisualFormatDetail
                        .Select(vs => vs.movieVisualFormat.movieVisualFormatName).ToArray(),
                    isRelease = x.ReleaseDate > DateTime.Now ? false : true,
                    minimumAge =
                        _dataContext.minimumAges.FirstOrDefault(m => m.minimumAgeID.Equals(x.minimumAgeID))
                            .minimumAgeInfo,
                    minimumAgeDescription =
                        _dataContext.minimumAges.FirstOrDefault(m => m.minimumAgeID.Equals(x.minimumAgeID))
                            .minimumAgeDescription
                }).Skip((page - 1) * pagesize).Take(pagesize).ToListAsync();
            var newPagniationRespond = new PagniationRespond()
            {
                movieRespondDTOs = getAllMovieData,
                page = page,
                pageSize = (int)Math.Ceiling((double)getAllMovieData.Count() / pagesize),
                totalCount = getAllMovieData.Count,
            };
            return newPagniationRespond;
        }


        public async Task<List<movieRespondDTO>> getListMoviesByName(string movie)
        {
            DateTime dateTime = DateTime.Now;
            var getAllMovieData = await _dataContext.movieInformation
                .Where(x => x.movieName.Contains(movie) && !x.isDelete)
                .Select(x => new movieRespondDTO()
                {
                    movieName = x.movieName,
                    movieID = x.movieId,
                    movieDuration = x.movieDuration,
                    movieGenres = x.movieGenreInformation.Select(mg => mg.movieGenre.movieGenreName).ToArray(),
                    ListLanguageName = x.Language.languageDetail,
                    movieTrailerUrl = x.movieTrailerUrl,
                    movieVisualFormat = x.movieVisualFormatDetail
                        .Select(vs => vs.movieVisualFormat.movieVisualFormatName).ToArray(),
                    isRelease = x.ReleaseDate > DateTime.Now ? false : true,

                }).ToListAsync();
            return getAllMovieData;
        }

        public async Task<GenericRespondWithObjectDTO<List<GetMovieShowedDTOList>>> GetShowedMovieTake5()
        {
            // Lấy danh sách phim đang chiếu
            // Layas Danh Sách check ở MovieSchedule coi đã có lịch chiếu chưa 
            // Lấy Random 5 Phim Đã chiếu
            // Lấy thông tin 
            var findShowedMovie = _dataContext
                .movieInformation
                .Where(x => !x.isDelete && x.ReleaseDate < DateTime.Now);
            var selectData = await findShowedMovie.Select(x => new GetMovieShowedDTOList()
            {
                MovieId = x.movieId,
                MovieName = x.movieName,
                MovieImage = x.movieImage,
                TrailerURL = x.movieTrailerUrl
            }).Take(5).ToListAsync();
            return new GenericRespondWithObjectDTO<List<GetMovieShowedDTOList>>()
            {
                Status = GenericStatusEnum.Success.ToString() ,
                message = "Layas Data thanh cong" ,
                data = selectData
            };
        }

        public async Task<GenericRespondWithObjectDTO<List<GetMovieShowedDTOList>>> GetUnShowedMovieTake5()
        {
            var findShowedMovie = _dataContext.movieInformation
                .Where(x =>
                    !x.isDelete && x.ReleaseDate > DateTime.Now);
            var selectData = await findShowedMovie.Select(x => new GetMovieShowedDTOList()
            {
                MovieId = x.movieId,
                MovieName = x.movieName,
                MovieImage = x.movieImage,
                TrailerURL = x.movieTrailerUrl
            }).Take(5).ToListAsync();
            return new GenericRespondWithObjectDTO<List<GetMovieShowedDTOList>>()
            {
                Status = GenericStatusEnum.Success.ToString() ,
                message = "Layas Data thanh cong" ,
                data = selectData
            };
        }
    }
}
