// src/api.ts
import type { Note, NoteCreateDto, NoteUpdateDto } from "./types";

const API_BASE_URL =
  ((import.meta as unknown as { env?: { VITE_API_BASE_URL?: string } })?.env
    ?.VITE_API_BASE_URL as string | undefined) ||
  "http://localhost:5199/api";

function getErrorMessage(err: unknown, fallback: string) {
  if (err instanceof Error) return err.message;
  try {
    return String(err);
  } catch {
    return fallback;
  }
}

async function handleResponse<T = unknown>(res: Response, fallbackMessage: string): Promise<T | null> {
  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || fallbackMessage);
  }
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

export async function getNotes(search?: string, tag?: string, page = 1, pageSize = 10): Promise<{ data: Note[], pagination: any }> {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (tag) params.append("tag", tag);
  params.append("page", String(page));
  params.append("pageSize", String(pageSize));

  const url = `${API_BASE_URL}/notes?${params.toString()}`;

  try {
    const res = await fetch(url);
    const result = await handleResponse<{ data: Note[], pagination: any }>(res, "Notlar alınamadı");
    return result || { data: [], pagination: {} };
  } catch (err: unknown) {
    throw new Error(getErrorMessage(err, "Ağ hatası: Notlar alınamadı"));
  }
}

export async function createNote(dto: NoteCreateDto): Promise<Note> {
  try {
    const res = await fetch(`${API_BASE_URL}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
    const data = await handleResponse<Note>(res, "Not oluşturulamadı");
    return data as Note;
  } catch (err: unknown) {
    throw new Error(getErrorMessage(err, "Ağ hatası: Not oluşturulamadı"));
  }
}

export async function updateNote(id: number, dto: NoteUpdateDto): Promise<void> {
  try {
    const res = await fetch(`${API_BASE_URL}/notes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
    await handleResponse(res, "Not güncellenemedi");
  } catch (err: unknown) {
    throw new Error(getErrorMessage(err, "Ağ hatası: Not güncellenemedi"));
  }
}

export async function deleteNote(id: number): Promise<void> {
  try {
    const res = await fetch(`${API_BASE_URL}/notes/${id}`, {
      method: "DELETE",
    });
    await handleResponse(res, "Not silinemedi");
  } catch (err: unknown) {
    throw new Error(getErrorMessage(err, "Ağ hatası: Not silinemedi"));
  }
}
