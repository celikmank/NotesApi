using System.ComponentModel.DataAnnotations;

namespace NotesApi.Dtos
{
    public class NoteUpdateDto
    {
        [Required(ErrorMessage = "Title is required")]
        [MinLength(2, ErrorMessage = "Title must be at least 2 characters")]
        [MaxLength(200, ErrorMessage = "Title cannot exceed 200 characters")]
        public string Title { get; set; } = null!;

        [Required(ErrorMessage = "Content is required")]
        [MinLength(1, ErrorMessage = "Content cannot be empty")]
        [MaxLength(10000, ErrorMessage = "Content cannot exceed 10000 characters")]
        public string Content { get; set; } = null!;

        [MaxLength(10, ErrorMessage = "You cannot add more than 10 tags")]
        public List<string>? Tags { get; set; } 
    }
}
