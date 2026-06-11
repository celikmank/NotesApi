# NotesApi

Not alma uygulaması için full-stack bir proje: **ASP.NET Core REST API** + **React (TypeScript)** arayüz. Notları oluşturabilir, düzenleyebilir, silebilir; başlık/içerikte arama yapabilir, etikete göre filtreleyebilir ve sayfalama ile listeleyebilirsin.

## Özellikler
- Notlar için tam CRUD (oluştur, listele, güncelle, sil)
- Başlık ve içerikte metin arama
- Etikete göre filtreleme
- Sayfalama (`page` / `pageSize`)
- Merkezi hata yönetimi (global exception handler)
- React arayüzü için CORS yapılandırması

## Teknolojiler
- **Backend:** C#, ASP.NET Core Web API, Entity Framework Core, SQLite, Swagger
- **Frontend:** React 19, TypeScript, Vite

## Proje yapısı
```
NotesApi/         ASP.NET Core API (Controllers, Data, Dtos, Models, Migrations)
notes-frontend/   React + TypeScript (Vite) arayüz
```

## Kurulum

### Gereksinimler
- .NET SDK 8+
- Node.js 18+

### Backend
```bash
cd NotesApi
dotnet restore
dotnet ef database update
dotnet run
```
API varsayılan olarak `http://localhost:5199` üzerinde çalışır, Swagger arayüzü `/swagger` adresindedir.

### Frontend
```bash
cd notes-frontend
npm install
npm run dev
```
Arayüz `http://localhost:5173` üzerinde açılır. (Farklı bir API adresi için `notes-frontend` içinde `VITE_API_BASE_URL` ortam değişkenini ayarlayabilirsin.)

## API uç noktaları
| Metot | Yol | Açıklama |
|-------|-----|----------|
| GET | `/api/notes?search=&tag=&page=&pageSize=` | Notları listele (arama, etiket, sayfalama) |
| POST | `/api/notes` | Yeni not ekle |
| PUT | `/api/notes/{id}` | Notu güncelle |
| DELETE | `/api/notes/{id}` | Notu sil |
