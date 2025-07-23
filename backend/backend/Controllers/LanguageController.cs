using backend.Data;
using backend.Model.Movie;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LanguageController : ControllerBase
{
    private readonly DataContext _context;

    public LanguageController(DataContext context)
    {
        _context = context;
    }
    
    [HttpGet("GetLanguage")]
    public IActionResult Index()
    {
        return Ok(_context.Language.Select(x => new
        {
            languageId = x.languageId,
            languageDetail = x.languageDetail
        }));
    }}