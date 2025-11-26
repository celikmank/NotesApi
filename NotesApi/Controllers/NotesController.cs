using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NotesApi.Data;
using NotesApi.Dtos;
using NotesApi.Models;

namespace NotesApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public NotesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<object>> GetNotes(
            [FromQuery] string? search,
            [FromQuery] string? tag,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 10;
            if (pageSize > 100) pageSize = 100; // Max 100 item per page

            var query = _context.Notes.AsQueryable();

           
            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(n =>
                    n.Title.Contains(search) ||
                    n.Content.Contains(search));
            }

            
            if (!string.IsNullOrWhiteSpace(tag))
            {
                query = query.Where(n =>
                    n.Tags != null && n.Tags.Contains(tag));
            }

            
            var totalCount = await query.CountAsync();

            
            var notes = await query
                .OrderByDescending(n => n.UpdatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var result = notes.Select(n => new NoteResponseDto
            {
                Id = n.Id,
                Title = n.Title,
                Content = n.Content,
                CreatedAt = n.CreatedAt,
                UpdatedAt = n.UpdatedAt,
                Tags = string.IsNullOrWhiteSpace(n.Tags)
                    ? new List<string>()
                    : n.Tags
                        .Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries)
                        .ToList()
            }).ToList();

            
            return Ok(new
            {
                data = result,
                pagination = new
                {
                    currentPage = page,
                    pageSize = pageSize,
                    totalCount = totalCount,
                    totalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
                    hasNext = page * pageSize < totalCount,
                    hasPrevious = page > 1
                }
            });
        }

        
        [HttpGet("{id:int}")]
        public async Task<ActionResult<NoteResponseDto>> GetNote(int id)
        {
            var note = await _context.Notes.FindAsync(id);

            if (note == null)
                return NotFound(new { error = "Note not found" });

            var result = new NoteResponseDto
            {
                Id = note.Id,
                Title = note.Title,
                Content = note.Content,
                CreatedAt = note.CreatedAt,
                UpdatedAt = note.UpdatedAt,
                Tags = string.IsNullOrWhiteSpace(note.Tags)
                    ? new List<string>()
                    : note.Tags
                        .Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries)
                        .ToList()
            };

            return Ok(result);
        }

       
        [HttpPost]
        public async Task<ActionResult<NoteResponseDto>> CreateNote(NoteCreateDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var now = DateTime.UtcNow;

            var note = new Note
            {
                Title = request.Title,
                Content = request.Content,
                CreatedAt = now,
                UpdatedAt = now,
                Tags = request.Tags != null && request.Tags.Any()
                    ? string.Join(",", request.Tags)
                    : null
            };

            _context.Notes.Add(note);
            await _context.SaveChangesAsync();

            var response = new NoteResponseDto
            {
                Id = note.Id,
                Title = note.Title,
                Content = note.Content,
                CreatedAt = note.CreatedAt,
                UpdatedAt = note.UpdatedAt,
                Tags = request.Tags?.ToList() ?? new List<string>()
            };

            return CreatedAtAction(nameof(GetNote), new { id = note.Id }, response);
        }

       
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateNote(int id, NoteUpdateDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var note = await _context.Notes.FindAsync(id);

            if (note == null)
                return NotFound(new { error = "Note not found" });

            note.Title = request.Title;
            note.Content = request.Content;
            note.UpdatedAt = DateTime.UtcNow;
            note.Tags = request.Tags != null && request.Tags.Any()
                ? string.Join(",", request.Tags)
                : null;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteNote(int id)
        {
            var note = await _context.Notes.FindAsync(id);

            if (note == null)
                return NotFound(new { error = "Note not found" });

            _context.Notes.Remove(note);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("tags")]
        public async Task<ActionResult<IEnumerable<string>>> GetAllTags()
        {
            var notes = await _context.Notes
                .Where(n => n.Tags != null && n.Tags != "")
                .Select(n => n.Tags)
                .ToListAsync();

            var allTags = notes
                .SelectMany(t => t!.Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries))
                .Distinct()
                .OrderBy(t => t)
                .ToList();

            return Ok(allTags);
        }
    }
}
