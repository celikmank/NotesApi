// src/types.ts
export interface Note {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface NoteCreateDto {
  title: string;
  content: string;
  tags?: string[];
}

export interface NoteUpdateDto {
  title: string;
  content: string;
  tags?: string[];
}
