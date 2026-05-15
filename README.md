# 🎓 Portal Asesmen Informatika Terpadu (SD, SMP & SMA)

Portal Evaluasi Mandiri berbasis Web yang interaktif, ringan, dan responsif. Sistem dirancang khusus untuk menunjang penguasaan materi Informatika 8 Pilar Utama bagi siswa dari jenjang SD hingga SMA, sekaligus menyediakan mode kelola dokumen ramah cetak khusus untuk Pengajar.

**Pengembang Sistem:**  
👨‍💻 **I Gede Rizki Heriana Prayoga (Mr. RH)**

---

## 🧭 Daftar Isi
1. [Tentang Aplikasi](#-tentang-aplikasi)
2. [Fitur Unggulan](#-fitur-unggulan)
3. [Standar Arsitektur Data (Skalabilitas Masa Depan)](#-standar-arsitektur-data-skalabilitas-masa-depan)
4. [Panduan Penamaan Berkas JSON (Konvensi Penamaan)](#-panduan-penamaan-berkas-json-konvensi-penamaan)
5. [Skema Struktur Objek JSON](#-skema-struktur-objek-json)
6. [Langkah-langkah Menambah Soal Baru](#-langkah-langkah-menambah-soal-baru)

---

## 🚀 Tentang Aplikasi
Sistem ini menggunakan arsitektur **Single Page Application (SPA) Statis**.
- **Tanpa Database Rumit (Serverless)**: Sistem murni memuat data lewat berkas `.json` menggunakan API Fetch JavaScript asli, menjadikannya super cepat dan sangat aman dihosting di GitHub Pages secara gratis.
- **Modular**: Halaman antarmuka dipisahkan secara penuh dari database bank soal, mempermudah perawatan aplikasi di kemudian hari tanpa perlu mengubah file program HTML.

---

## 💎 Fitur Unggulan
1. **Dual Role Gateway**: Satu aplikasi menangani dua peran sekaligus (Mode Interaktif Siswa dan Lembar Cetak Pengajar).
2. **Premium Authentication Modal**: Mode pengajar dilindungi kata sandi menggunakan modal UI kustom yang mewah dengan efek *glassmorphism* dan animasi getar (*shake feedback*).
3. **Smart Exit Confirmation**: Mencegah hilangnya progres jawaban siswa di tengah kuis akibat tidak sengaja mengklik tombol kembali.
4. **Dynamic Grid & Counters**: Secara otomatis menghitung dan menampilkan statistik paket soal yang terdaftar di halaman muka.

---

## 🏗️ Standar Arsitektur Data (Skalabilitas Masa Depan)
Seiring waktu, jumlah file bank soal Anda akan bertambah dari puluhan menjadi ratusan. Untuk mencegah kekacauan struktur (*maintenance nightmare*), sistem ini menerapkan **Sistem Konvensi Penamaan Terstruktur**.

### 📂 Struktur Folder Database yang Direkomendasikan:
Tetap letakkan semua file database di dalam folder `data/`.

```text
Kuis Informatika/
│
├── data/
│   ├── packages.json                          <-- File Peta Navigasi Utama
│   ├── smp_07_uas_sem2_2026_pkt1.json        <-- Standar Nama File Terbaru
│   ├── sma_12_us_2026_pkt1.json              <-- Standar Nama File Terbaru
│   └── PANDUAN_DATABASE.txt                  <-- Dokumen referensi cepat
│
├── assets/js/app.js                           <-- Logic Core Engine
└── index.html / kuis.html                     <-- UI Shell
```

---

## 📋 Panduan Penamaan Berkas JSON (Konvensi Penamaan)
Agar file berurutan secara otomatis sesuai urutan abjad di dalam sistem operasi, nama file wajib mengikuti aturan standard berikut:

### **Format Baku:**
> `[jenjang]_[kelas]_[jenis]_[semester]_[tahun]_[paket].json`

### **Detail Komponen:**
| Variabel | Penulisan | Keterangan & Opsi Nilai | Contoh |
| :--- | :--- | :--- | :--- |
| **`[jenjang]`** | `sd` / `smp` / `sma` | Selalu huruf kecil. | `smp` |
| **`[kelas]`** | `01` s.d. `12` | **Wajib 2 digit** (pakai angka 0 di depan angka satuan) agar urutan folder 1-12 rapi dan tidak berantakan. | `07` |
| **`[jenis]`** | Kategori Ujian | <ul><li>`uh`: Ulangan Harian</li><li>`uts`: Ujian Tengah Semester (PTS)</li><li>`uas`: Ujian Akhir Semester (ASAS / PAS)</li><li>`us`: Ujian Sekolah</li><li>`un`: Ujian Nasional</li></ul> | `uas` |
| **`[semester]`** | `sem1` / `sem2` | Gunakan `sem1` untuk ganjil dan `sem2` untuk genap. (Bisa dikosongkan jika jenisnya `us`/Ujian Sekolah). | `sem2` |
| **`[tahun]`** | Angka Tahun | Tulis 4 digit tahun kalender pelaksanaan ujian. | `2026` |
| **`[paket]`** | `pkt1`, `pkt2`, dst. | Kode paket simulasi untuk jenjang dan kategori yang sama. | `pkt1` |

### **💡 Contoh Penerapan Nyata:**
1.  **Kuis Kelas 7 SMP, Ulangan Semester Genap 2026, Paket 1:**  
    📄 `smp_07_uas_sem2_2026_pkt1.json`
2.  **Simulasi Kelas 12 SMA, Ujian Sekolah Nasional 2026, Paket 2:**  
    📄 `sma_12_us_2026_pkt2.json`
3.  **Ulangan Harian Kelas 4 SD, Semester Ganjil 2027, Paket 3:**  
    📄 `sd_04_uh_sem1_2027_pkt3.json`

---

## 📝 Skema Struktur Objek JSON

### 1. Registrasi Menu (`data/packages.json`)
Setiap kali Anda membuat berkas soal baru, **Wajib** mendaftarkannya ke dalam berkas array induk ini.

```json
[
  {
    "id": "smp-07-uas-sem2-2026-pkt1",
    "title": "Sumatif Akhir Semester Genap - Paket 1",
    "level": "SMP",
    "class": "7 SMP",
    "subject": "Informatika",
    "file": "data/smp_07_uas_sem2_2026_pkt1.json",
    "questionCount": 50,
    "description": "Evaluasi materi semester 2 mencakup Analisis Data dan Pemrograman Blok Scratch."
  }
]
```
> **Aturan Krusial `packages.json`:**
> - `id`: Digunakan sebagai query parameter URL. Gunakan huruf kecil, ganti spasi dengan tanda strip `-`.
> - `level`: **Wajib Huruf Kapital** (`SD`, `SMP`, `SMA`). Menentukan di bawah tombol mana paket ini akan muncul.
> - `file`: Path relatif lokasi berkas JSON soal tersebut dari root website.

### 2. Konten Soal (`data/nama_file_soal.json`)
Array berisi kumpulan butir soal. Menggunakan kunci inisial **1 huruf** untuk kompresi memori.

```json
[
  {
    "c": "Algoritma & Pemrograman",
    "q": "Apa kegunaan blok kuning di Scratch?",
    "o": ["Memicu Kejadian", "Berjalan", "Menghapus", "Mengubah"],
    "a": 0,
    "e": "Blok kuning (Events) memicu jalannya sebuah instruksi script."
  }
]
```
> **Aturan Krusial `soal.json`:**
> - `"c"` (*Category*): Nama pilar informatika kurikulum.
> - `"q"` (*Question*): Pertanyaan, mendukung tag HTML dasar (misalnya `<br>` untuk baris baru).
> - `"o"` (*Options*): Array maksimal 5 pilihan ganda (A, B, C, D, E).
> - `"a"` (*Answer*): **Indeks Angka** dimulai dari `0` (0=A, 1=B, 2=C, 3=D, 4=E).
> - `"e"` (*Explanation*): Paragraf teks pembahasan detail.

---

## 📋 Langkah-langkah Menambah Soal Baru
Ikuti 3 langkah instan berikut untuk menambah materi:

1.  **Buat Berkas JSON Baru**  
    Di dalam folder `data/`, buat file baru dengan nama sesuai standar, contoh: `smp_07_uas_sem2_2026_pkt1.json`. Isi dengan data soal sesuai skema.
2.  **Daftarkan ke `packages.json`**  
    Buka `data/packages.json`, tambahkan objek pendaftaran baru di akhir array. Pastikan menambahkan koma `,` pada objek sebelumnya.
3.  **Selesai!**  
    Buka portal Anda di browser dan segarkan halaman. Paket soal baru sudah siap diakses siswa maupun diunduh pengajar tanpa menyentuh kode program website sama sekali! ✨🥂

---
*Dokumentasi ini dirancang untuk mempermudah guru, laboran, dan pengembang memelihara kelangsungan sistem ujian mandiri Mr. RH secara berkelanjutan.*
