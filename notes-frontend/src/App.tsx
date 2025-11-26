import { useEffect, useMemo, useState } from "react";
import { createNote, deleteNote, getNotes, updateNote } from "./api";
import type { Note, NoteCreateDto, NoteUpdateDto } from "./types";
import "./App.css";

function formatDate(d?: string) {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleString("tr-TR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return d;
  }
}

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>({});

  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function loadNotes() {
    try {
      setLoading(true);
      setError(null);
      const result = await getNotes(
        search.trim() || undefined,
        tagFilter.trim() || undefined,
        currentPage,
        10
      );
      setNotes(result.data || []);
      setPagination(result.pagination || {});
    } catch (err: unknown) {
      setError(String(err ?? "Bir hata oluştu"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    notes.forEach((n) => n.tags.forEach((t) => s.add(t)));
    return Array.from(s);
  }, [notes]);

  function resetForm() {
    setTitle("");
    setContent("");
    setTagsInput("");
    setEditingNote(null);
    setShowForm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    try {
      setError(null);
      if (editingNote) {
        const dto: NoteUpdateDto = { title, content, tags };
        await updateNote(editingNote.id, dto);
      } else {
        const dto: NoteCreateDto = { title, content, tags };
        await createNote(dto);
      }
      resetForm();
      await loadNotes();
    } catch (err: unknown) {
      setError(String(err ?? "Bir hata oluştu"));
    }
  }

  function handleEdit(note: Note) {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setTagsInput(note.tags.join(", "));
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id: number) {
    if (!confirm("Bu notu silmek istediğine emin misin?")) return;
    try {
      setError(null);
      await deleteNote(id);
      await loadNotes();
    } catch (err: unknown) {
      setError(String(err ?? "Bir hata oluştu"));
    }
  }

  async function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCurrentPage(1);
    await loadNotes();
  }

  return (
    <div className="app-root">
      <div className="container">
        <header className="header">
          <h1 className="app-title">📝 NotDefteri</h1>
          <p className="app-subtitle">Basit, hızlı ve şık not yönetimi</p>
        </header>

        <div className="search-section">
          <form onSubmit={handleSearchSubmit} className="search-form">
            <input
              type="text"
              placeholder="🔍 Başlık veya içerikte ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input search-input"
            />
            <select 
              value={tagFilter} 
              onChange={(e) => setTagFilter(e.target.value)} 
              className="select"
            >
              <option value="">🏷️ Tüm Etiketler</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>#{tag}</option>
              ))}
            </select>
            <button type="submit" className="btn btn-primary">Filtrele</button>
          </form>
        </div>

        {error && (
          <div className="error" role="alert">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {!showForm && (
          <button 
            onClick={() => setShowForm(true)} 
            className="btn btn-create"
          >
            ✨ Yeni Not Oluştur
          </button>
        )}

        {showForm && (
          <section className="card form-card">
            <div className="card-header">
              <h2 className="card-title">
                {editingNote ? "✏️ Notu Güncelle" : "✨ Yeni Not"}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="note-form">
              <input 
                className="input" 
                placeholder="Başlık giriniz..." 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required 
              />
              <textarea 
                className="textarea" 
                placeholder="Not içeriğini yazınız..." 
                value={content} 
                onChange={(e) => setContent(e.target.value)} 
                required 
                rows={5}
              />
              <input 
                className="input" 
                placeholder="🏷️ Etiketler (örn: iş, kişisel, önemli)" 
                value={tagsInput} 
                onChange={(e) => setTagsInput(e.target.value)} 
              />
              <div className="form-actions">
                <button type="button" onClick={resetForm} className="btn btn-secondary">
                  İptal
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingNote ? "💾 Güncelle" : "➕ Oluştur"}
                </button>
              </div>
            </form>
          </section>
        )}

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <span>Yükleniyor...</span>
          </div>
        )}

        <div className="notes-list">
          {notes.length === 0 && !loading && (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>Henüz not yok</h3>
              <p>Yukarıdaki butona tıklayarak ilk notunu oluştur!</p>
            </div>
          )}

          {notes.map((note) => (
            <article key={note.id} className="note-card">
              <div className="note-content">
                <h3 className="note-title">{note.title}</h3>
                <p className="note-text">{note.content}</p>
              </div>
              
              {note.tags.length > 0 && (
                <div className="tags">
                  {note.tags.map((t) => (
                    <span key={t} className="tag">#{t}</span>
                  ))}
                </div>
              )}

              <div className="note-footer">
                <div className="note-meta">
                  <div className="meta-item">
                    <span className="meta-icon">🕐</span>
                    <span className="meta-text">{formatDate(note.createdAt)}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-icon">✏️</span>
                    <span className="meta-text">{formatDate(note.updatedAt)}</span>
                  </div>
                </div>
                <div className="note-actions">
                  <button 
                    onClick={() => handleEdit(note)} 
                    className="btn-icon btn-edit"
                    title="Düzenle"
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={() => handleDelete(note.id)} 
                    className="btn-icon btn-delete"
                    title="Sil"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {pagination.totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={!pagination.hasPrevious}
              className="btn btn-secondary"
            >
              ← Önceki
            </button>
            <span className="page-info">
              Sayfa {pagination.currentPage} / {pagination.totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={!pagination.hasNext}
              className="btn btn-secondary"
            >
              Sonraki →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
