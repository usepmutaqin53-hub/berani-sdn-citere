# BERANI — Website Komunitas Belajar Guru SDN CITERE

**B**erdedikasi, **R**ajin berkolaborasi, **N**iat menginspirasi

Proyek ini terdiri dari 3 bagian:

```
berani-website/
├── frontend/     → Website publik (index.html)
├── admin/        → Panel admin untuk mengelola konten (index.html)
├── gas/          → Backend Google Apps Script (Code.gs) + Google Sheets sebagai database
└── shared/       → config.js — satu tempat untuk mengatur URL backend
```

Frontend dan admin adalah **file statis** (HTML/CSS/JS biasa) yang bisa dihosting
gratis di GitHub Pages. Data (profil, program kerja, jurnal guru, galeri, kontak)
disimpan di **Google Spreadsheet**, dan diakses lewat **Google Apps Script (GAS)**
yang berfungsi sebagai API JSON. Tidak perlu server atau biaya hosting bulanan.

---

## 1. Siapkan Backend (Google Apps Script + Spreadsheet)

1. Buka [sheets.google.com](https://sheets.google.com), buat Spreadsheet baru,
   beri nama misalnya **"BERANI - Database"**.
2. Di spreadsheet itu, buka menu **Ekstensi → Apps Script**.
3. Hapus isi file `Code.gs` bawaan, lalu salin-tempel seluruh isi file
   [`gas/Code.gs`](gas/Code.gs) dari proyek ini.
4. Simpan project (nama bebas, misalnya "BERANI Backend").
5. Di editor Apps Script, pilih fungsi **`setupSheets`** dari dropdown fungsi
   di toolbar, lalu klik **Run** (▶). Ini akan membuat sheet
   `Profil`, `ProgramKerja`, `SiklusKegiatan`, `SumberDaya`, `Anggota`,
   `Jadwal`, `Jurnal`, `NotulenKombel`, `Galeri`, `Kontak` otomatis, lengkap
   dengan contoh data awal. Izinkan akses saat diminta (klik akun Google
   Anda → Advanced → Go to project (unsafe) — ini normal untuk script
   milik sendiri).

   > Sudah pernah menjalankan `setupSheets` sebelumnya? Jalankan lagi —
   > sheet lama tidak akan ditimpa. Kalau ada sheet yang belum ada, akan
   > dibuat baru; kalau ada kolom baru yang belum ada di sheet lama (misalnya
   > `youtube`/`tiktok` di Kontak), kolom itu otomatis ditambahkan ke ujung
   > kanan tanpa mengubah data yang sudah ada.
6. Atur password admin: di kotak fungsi (dropdown yang sama), pilih
   **`setAdminPassword`**, lalu **sebelum** klik Run, edit baris kode paling
   bawah file (`Code.gs`) sementara, atau lebih mudah: buka tab **Editor**,
   ketik sementara di baris kosong:
   ```js
   function setPasswordSaya() { setAdminPassword('kata-sandi-anda'); }
   ```
   Jalankan `setPasswordSaya`, lalu boleh dihapus lagi. (Password disimpan
   aman di Script Properties, bukan di kode.)
7. **Deploy sebagai Web App**:
   - Klik **Deploy → New deployment**.
   - Pilih tipe **Web app**.
   - **Execute as**: Me (akun Anda).
   - **Who has access**: Anyone.
   - Klik **Deploy**, lalu **salin URL Web App** yang muncul
     (bentuknya `https://script.google.com/macros/s/XXXXX/exec`).

> Setiap kali Anda mengubah `Code.gs`, buat **New deployment** lagi (atau
> "Manage deployments" → edit versi) supaya perubahan aktif di URL yang sama.

---

## 2. Sambungkan Frontend & Admin ke Backend

Buka [`shared/config.js`](shared/config.js), ganti baris:

```js
GAS_API_URL: "TEMPEL_URL_WEB_APP_GOOGLE_APPS_SCRIPT_DI_SINI",
```

dengan URL Web App dari langkah sebelumnya. File ini dipakai bersama oleh
`frontend/index.html` dan `admin/index.html`, jadi cukup diedit sekali.

---

## 3. Coba di Komputer Sendiri (Lokal)

Karena semuanya file statis, cukup buka `frontend/index.html` langsung di
browser untuk melihat website (sebelum `GAS_API_URL` diisi, halaman tetap
tampil dengan data contoh). Untuk mencoba admin, buka `admin/index.html`
dan login dengan password yang diatur di langkah 1.6.

Disarankan menjalankan lewat server lokal sederhana (bukan cuma buka file)
agar tidak ada kendala browser terkait `fetch`, contoh dengan Python:

```bash
cd berani-website
python -m http.server 8000
```

lalu buka `http://localhost:8000/frontend/` dan `http://localhost:8000/admin/`.

---

## 4. Deploy ke GitHub Pages (Gratis)

1. Buat repository baru di GitHub, misalnya `berani-sdn-citere`.
2. Unggah seluruh isi folder `berani-website/` ke repository tersebut.
3. Di repository, buka **Settings → Pages**.
4. Pada **Branch**, pilih `main` (atau branch utama Anda) dan folder `/ (root)`.
5. Simpan. GitHub akan memberi URL seperti:
   `https://<username-anda>.github.io/berani-sdn-citere/frontend/`
6. Website admin bisa diakses lewat:
   `https://<username-anda>.github.io/berani-sdn-citere/admin/`
   (sebaiknya jangan disebarluaskan link admin ini secara publik).

---

## 5. Menu / Konten yang Tersedia

| Bagian | Frontend menampilkan | Admin mengelola |
|---|---|---|
| Beranda / Profil | Tagline, deskripsi, visi, misi, kepanjangan BERANI | Form Profil |
| Struktur Organisasi | Bagan AD/ART: Penasihat/Kepsek → Ketua → Sekretaris & Fasilitator/Narasumber → Anggota, lengkap rincian tugas tiap peran | Tambah / ubah / hapus, atur urutan tampil |
| Siklus Belajar | Diagram 4 tahap (Refleksi → Perencanaan → Implementasi → Evaluasi), klik tahap untuk lihat kegiatan | Tambah / ubah / hapus kegiatan per tahap |
| Jadwal Kegiatan | Daftar pertemuan, otomatis terpisah "Akan Datang" / "Telah Lewat" berdasarkan tanggal hari ini | Tambah / ubah / hapus |
| Notulen Kombel | Hasil resmi diskusi & kesepakatan pertemuan (bukan tulisan pribadi) | Tambah / ubah / hapus, atur status draft/publish |
| Program Kerja | Daftar kegiatan dengan status "berjalan"/"selesai", ditandai tahap siklus terkait | Tambah / ubah / hapus |
| Bank Sumber Daya | Modul ajar, ATP, asesmen, LKS, media ajar — bisa dicari & difilter jenis/kelas | Tambah / ubah / hapus, tempel tautan file |
| Jurnal Guru | Tulisan reflektif PRIBADI tiap guru (beda dengan Notulen Kombel di atas) | Tambah / ubah / hapus, atur status draft/publish |
| Galeri | Foto kegiatan (tempel URL gambar publik) | Tambah / ubah / hapus |
| Kontak | Alamat, email, WhatsApp, Instagram | Form Kontak |

---

Setelah deploy versi ini, tab **Struktur Organisasi** di beranda berubah dari
kartu datar jadi **bagan organisasi bertingkat** sesuai AD/ART Kombel BERANI
(Penasihat/Kepala Sekolah → Ketua → Sekretaris & Fasilitator/Narasumber →
Anggota), lengkap rincian tugas tiap peran.

> **Kalau kamu sudah pernah mengisi data Anggota sebelumnya** (versi lama
> pakai label "Kepala Sekolah", "Koordinator Kombel", "Guru Kelas", "Guru
> Mapel"): label "Kepala Sekolah" tetap otomatis terbaca sebagai
> "Penasihat", dan "Guru Kelas"/"Guru Mapel" otomatis masuk kelompok
> "Anggota" — aman, tidak perlu diubah. **Yang perlu diubah manual** cuma
> peran **"Koordinator Kombel"** → ganti ke **"Ketua Komunitas"** lewat
> admin, supaya orangnya tampil di tempat yang benar di bagan.

## 6. Catatan Keamanan

Sistem login admin ini **sederhana** (satu password bersama, cocok untuk
komunitas kecil di satu sekolah) — bukan sistem akun multi-pengguna dengan
peran/role. Untuk kebutuhan lebih serius (banyak admin dengan hak akses
berbeda, log aktivitas, dsb.), pertimbangkan menambahkan Google Sign-In atau
memindahkan backend ke layanan yang mendukung otentikasi penuh.

Jangan bagikan URL Web App (`GAS_API_URL`) sebagai "rahasia" — anggap semua
data di Spreadsheet ini bisa dibaca publik lewat endpoint `?action=getAll`,
karena memang begitu cara frontend membacanya. Simpan hanya data yang memang
untuk publikasi.

Sama halnya untuk **Bank Sumber Daya**: tautan file yang ditempel di sana
akan terlihat publik lewat website. Pastikan berkas yang dibagikan (modul
ajar, LKS, dsb.) memang layak dan aman dibagikan ke luar sekolah, dan jangan
menempelkan dokumen yang memuat data pribadi murid.

> **Perbaikan bug:** versi sebelumnya punya bentrok ID HTML pada dropdown
> "Status" di form Program Kerja dan Jurnal (id dropdown sama dengan id kotak
> pesan sukses di atasnya), yang membuat nilai status yang tersimpan selalu
> kosong — akibatnya jurnal/program yang di-set "Publish" bisa jadi tidak
> muncul di beranda. Sudah diperbaiki di versi ini. Kalau kamu punya data
> lama yang pernah tersimpan dengan status kosong, cek ulang lewat panel
> admin dan set ulang statusnya ke "Publish"/"Berjalan" sesuai kebutuhan.

> **Logo sekarang dinamis:** sebelumnya logo di navbar & beranda diambil
> langsung dari `LOGO_URL` di `shared/config.js` (hardcode, harus edit kode
> untuk ganti). Sekarang logo diatur dari tab **Profil Komunitas** di admin
> — ada kolom "URL Logo BERANI" lengkap dengan pratinjau. `LOGO_URL` di
> `config.js` masih dipakai sebagai **cadangan** kalau kolom itu dikosongkan
> (juga tetap dipakai untuk logo di layar login admin, sebelum admin
> berhasil masuk).

---

## 7. Kustomisasi Desain

Semua warna, font, dan gaya visual ada di satu file:
[`frontend/style.css`](frontend/style.css) (dipakai juga oleh admin lewat
`admin/style.css`). Token warna utama:

- `--pine` (`#16423C`) — hijau pinus, warna utama
- `--marigold` (`#E8A33D`) — kuning kunyit, aksen semangat
- `--maroon` (`#8C3B4A`) — aksen sekunder
- `--paper` (`#F2F0E4`) — latar dasar

Elemen "spine" di beranda (huruf B-E-R-A-N-I vertikal) adalah elemen ciri khas
halaman ini — tiap huruf memang mewakili satu kata di kepanjangan BERANI,
bisa diklik untuk melihat penjelasan tiap nilai.

## 8. Tampilan Saat Dibagikan (Open Graph)

`frontend/index.html` sudah punya tag `og:title`, `og:description`, dan
`og:image` supaya link situs ini tampil bagus dengan gambar & judul saat
ditempel di grup WhatsApp atau Facebook.

Karena WhatsApp/Facebook membaca HTML mentah (tidak menjalankan JavaScript),
tag ini **ditulis statis** di `<head>` — bukan diambil otomatis dari
Spreadsheet Profil. Kalau nama, tagline, atau logo BERANI berubah, update
juga tag `og:title` / `og:description` / `og:image` (dan `<link rel="icon">`)
di `frontend/index.html` secara manual supaya tetap sinkron dengan
`shared/config.js`.

Setelah situs sudah online (GitHub Pages atau lainnya), disarankan tambah
`<meta property="og:url" content="https://alamat-situsmu">` juga.

Tips: setelah deploy, tes hasilnya di
[Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
atau kirim link-nya ke chat WhatsApp sendiri dulu untuk lihat pratinjaunya.
