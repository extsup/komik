# Manga Agregator — Railway

## Deploy ke Railway

1. Push ke GitHub repo
2. Buka [railway.app](https://railway.app) → New Project → Deploy from GitHub Repo
3. Pilih repo ini
4. Railway otomatis detect `package.json` dan jalankan `npm start`
5. Selesai — Railway akan kasih domain otomatis

## Endpoints

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/api/latest` | Manga terbaru (gabungan semua source) |
| GET | `/api/popular` | Manga populer |
| GET | `/api/search?query=...` | Cari manga |
| GET | `/api/shinigami?path=...` | Proxy Shinigami API |
| GET | `/api/kiryuu?path=...` | Proxy Kiryuu API |
| GET | `/api/komikcast?path=...` | Proxy Komikcast API |

## Environment

Tidak perlu env vars — langsung jalan.

Port diambil dari `process.env.PORT` (Railway set otomatis), fallback ke `3000`.
