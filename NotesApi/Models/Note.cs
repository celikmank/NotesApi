namespace NotesApi.Models
{
    public class Note
    {
        public int Id { get; set; } 

        public string Title { get; set; } = null!; 
        public string Content { get; set; } = null!; 

        public DateTime CreatedAt { get; set; } 
        public DateTime UpdatedAt { get; set; }

        public string? Tags { get; set; }
    }
}
