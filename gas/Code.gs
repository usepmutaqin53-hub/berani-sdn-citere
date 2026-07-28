/**
 * BERANI - Backend Google Apps Script
 * =====================================
 * Komunitas Belajar Guru SDN CITERE
 *
 * Script ini mengubah Google Spreadsheet menjadi "database" JSON sederhana
 * yang bisa diakses oleh website (baca) dan panel admin (baca + tulis).
 *
 * CARA PAKAI: lihat README.md di folder utama proyek.
 *
 * Struktur Sheet yang dibutuhkan (buat manual, atau jalankan setupSheets()
 * sekali dari editor Apps Script untuk membuatnya otomatis):
 *
 *  - Profil        : id | judul | tagline | deskripsi | visi | misi | fotoUrl | updatedAt
 *  - ProgramKerja  : id | nama | deskripsi | kategori | status | tanggal | tahapSiklus
 *  - SiklusKegiatan: id | tahap | judul | deskripsi | tanggal | programTerkait
 *  - SumberDaya    : id | judul | jenis | mapel | kelas | fileUrl | pengunggah | keterangan | tanggal
 *  - Anggota       : id | nama | peran | kelasMapel | fotoUrl | urutan
 *  - Jadwal        : id | judul | tahap | tanggal | waktu | tempat | catatan
 *  - Jurnal        : id | judul | penulis | tanggal | ringkasan | isi | thumbnailUrl | status
 *  - NotulenKombel : id | judul | tanggal | tahap | pemimpin | pesertaHadir | ringkasanDiskusi | kesepakatan | status
 *  - Galeri        : id | judul | url | keterangan | tanggal
 *  - Kontak        : id | alamat | email | whatsapp | instagram | youtube | tiktok | mapsUrl
 *
 *  Catatan SiklusKegiatan: kolom "tahap" wajib salah satu dari
 *  refleksi | perencanaan | implementasi | evaluasi — ini adalah siklus
 *  belajar Komunitas Belajar (Kombel) yang berulang setiap periode.
 *
 *  Catatan SumberDaya: kolom "jenis" bebas teks namun disarankan salah satu
 *  dari Modul Ajar | ATP | Asesmen | LKS | Media Ajar. Kolom "fileUrl" diisi
 *  tautan publik (Google Drive "siapa saja yang punya link", dsb).
 *
 *  Catatan Anggota: struktur mengikuti AD/ART Kombel BERANI, kolom "peran"
 *  WAJIB salah satu dari 5 nilai berikut (dipakai untuk menyusun bagan
 *  organisasi di beranda — nama lain tidak akan cocok dan otomatis masuk
 *  ke kelompok "Anggota"):
 *    Penasihat / Kepala Sekolah | Ketua Komunitas | Sekretaris |
 *    Fasilitator / Narasumber | Anggota
 *  "Fasilitator / Narasumber" sifatnya BERGILIR sesuai topik antarguru —
 *  isi dengan guru yang sedang bertugas periode ini, ganti sesuai jadwal.
 *  "Anggota" boleh diisi berkali-kali (satu baris per guru).
 *  Kolom "urutan" (angka) menentukan posisi tampil dalam kelompok yang
 *  sama, kecil tampil dulu.
 *
 *  Catatan Jadwal: kolom "tanggal" diisi format tanggal (YYYY-MM-DD) agar
 *  bisa diurutkan dan dipisah otomatis jadi "Akan Datang" vs "Telah Lewat"
 *  di beranda. Kolom "tahap" (opsional) menghubungkan jadwal ke tahap siklus.
 *
 *  Catatan Jurnal vs NotulenKombel — dua hal yang BEDA fungsi, jangan
 *  dicampur:
 *    - Jurnal (Jurnal Mengajar): tulisan reflektif PRIBADI satu guru
 *      tentang kelasnya sendiri. Kolom "penulis" wajib diisi nama guru.
 *    - NotulenKombel (Notulen Pertemuan): hasil kesepakatan pertemuan
 *      Kombel yang dihadiri banyak guru. Bukan tulisan satu orang, jadi
 *      tidak ada "penulis" — yang ada "pemimpin" rapat & "pesertaHadir".
 *      Kolom "status" sama seperti Jurnal: draft | publish.
 */

const SHEET_NAMES = {
  PROFIL: 'Profil',
  PROGRAM: 'ProgramKerja',
  SIKLUS: 'SiklusKegiatan',
  SUMBERDAYA: 'SumberDaya',
  ANGGOTA: 'Anggota',
  JADWAL: 'Jadwal',
  JURNAL: 'Jurnal',
  NOTULEN: 'NotulenKombel',
  GALERI: 'Galeri',
  KONTAK: 'Kontak',
};

const SHEET_COLUMNS = {
  Profil: ['id', 'judul', 'tagline', 'deskripsi', 'visi', 'misi', 'fotoUrl', 'updatedAt'],
  ProgramKerja: ['id', 'nama', 'deskripsi', 'kategori', 'status', 'tanggal', 'tahapSiklus'],
  SiklusKegiatan: ['id', 'tahap', 'judul', 'deskripsi', 'tanggal', 'programTerkait'],
  SumberDaya: ['id', 'judul', 'jenis', 'mapel', 'kelas', 'fileUrl', 'pengunggah', 'keterangan', 'tanggal'],
  Anggota: ['id', 'nama', 'peran', 'kelasMapel', 'fotoUrl', 'urutan'],
  Jadwal: ['id', 'judul', 'tahap', 'tanggal', 'waktu', 'tempat', 'catatan'],
  Jurnal: ['id', 'judul', 'penulis', 'tanggal', 'ringkasan', 'isi', 'thumbnailUrl', 'status'],
  NotulenKombel: ['id', 'judul', 'tanggal', 'tahap', 'pemimpin', 'pesertaHadir', 'ringkasanDiskusi', 'kesepakatan', 'status'],
  Galeri: ['id', 'judul', 'url', 'keterangan', 'tanggal'],
  Kontak: ['id', 'alamat', 'email', 'whatsapp', 'instagram', 'youtube', 'tiktok', 'mapsUrl'],
};

// ---------------------------------------------------------------------
// SETUP (jalankan sekali dari editor Apps Script: pilih fungsi ini, klik Run)
// ---------------------------------------------------------------------
function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(SHEET_COLUMNS).forEach(function (name) {
    let sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(SHEET_COLUMNS[name]);
      sheet.setFrozenRows(1);
    } else {
      // Sheet sudah ada isinya dari sebelumnya — tambahkan kolom baru yang
      // belum ada di header (misalnya setelah update kode ini) TANPA
      // mengubah urutan atau menghapus kolom/data yang sudah ada.
      migrateHeaders_(sheet, name);
    }
  });
  // Sheet default kosong bawaan Google Sheets boleh dihapus manual jika mau.

  // Isi contoh data awal supaya website tidak kosong saat pertama dicoba.
  seedIfEmpty_(SHEET_NAMES.PROFIL, [
    ['profil-1', 'BERANI', 'Berdedikasi, Rajin Berkolaborasi, Niat Menginspirasi',
      'BERANI adalah komunitas belajar guru SDN CITERE, wadah berbagi praktik baik mengajar dan tumbuh bersama.',
      'Menjadi komunitas guru yang aktif belajar dan saling menguatkan demi murid yang lebih baik.',
      'Berbagi praktik baik secara rutin; Berkolaborasi lintas kelas dan mapel; Menginspirasi lewat karya nyata.',
      '', new Date()],
  ]);
  seedIfEmpty_(SHEET_NAMES.KONTAK, [
    ['kontak-1', 'SDN CITERE', 'beranisdncitere@gmail.com', '08123456789', '@beranisdncitere', '', '', ''],
  ]);
  seedIfEmpty_(SHEET_NAMES.SIKLUS, [
    ['siklus-1', 'refleksi', 'Analisis Rapor Pendidikan', 'Membedah hasil Rapor Pendidikan dan hasil belajar murid semester lalu untuk menemukan akar masalah pembelajaran di tiap kelas.', '2026-01', 'Kelas Berbagi Jumat'],
    ['siklus-2', 'perencanaan', 'Menyusun Modul Ajar Bersama', 'Menyusun modul ajar, alur tujuan pembelajaran (ATP), dan asesmen secara kolaboratif berdasarkan hasil refleksi.', '2026-01', 'Lesson Study Kurikulum Merdeka'],
    ['siklus-3', 'implementasi', 'Praktik di Kelas Masing-masing', 'Menerapkan hasil kesepakatan modul ajar dan strategi mengajar ke kelas masing-masing selama satu periode.', '2026-02', 'Lesson Study Kurikulum Merdeka'],
    ['siklus-4', 'evaluasi', 'Berbagi Praktik Baik', 'Guru saling berbagi praktik baik dan kendala yang dihadapi di kelas, menjadi bahan refleksi periode berikutnya.', '2026-02', 'Kelas Berbagi Jumat'],
  ]);
  seedIfEmpty_(SHEET_NAMES.SUMBERDAYA, [
    ['sumberdaya-1', 'Modul Ajar Pecahan Kelas 4', 'Modul Ajar', 'Matematika', 'Kelas 4', '', 'Bu Sinta', 'Modul ajar pecahan dengan pendekatan kontekstual, lengkap dengan LKPD.', '2026-01'],
    ['sumberdaya-2', 'ATP Bahasa Indonesia Semester 2', 'ATP', 'Bahasa Indonesia', 'Kelas 5', '', 'Pak Yusuf', 'Alur tujuan pembelajaran semester 2, sudah diselaraskan hasil refleksi rapor pendidikan.', '2026-01'],
    ['sumberdaya-3', 'LKS Operasi Hitung Campuran', 'LKS', 'Matematika', 'Kelas 6', '', 'Bu Sinta', 'Lembar kerja siswa untuk latihan operasi hitung campuran, siap cetak.', '2026-02'],
  ]);
  seedIfEmpty_(SHEET_NAMES.ANGGOTA, [
    ['anggota-1', 'Yayat Heryana', 'Penasihat / Kepala Sekolah', '', '', 1],
    ['anggota-2', 'Bu Sinta', 'Ketua Komunitas', 'Kelas 4', '', 2],
    ['anggota-3', 'Pak Yusuf', 'Sekretaris', 'Kelas 6', '', 3],
    ['anggota-4', 'Bu Rina', 'Fasilitator / Narasumber', 'PJOK', '', 4],
    ['anggota-5', 'Pak Dedi', 'Anggota', 'Pendidikan Agama', '', 5],
  ]);
  seedIfEmpty_(SHEET_NAMES.JADWAL, [
    ['jadwal-1', 'Kelas Berbagi Jumat', 'evaluasi', '2026-08-07', '13:00', 'Ruang Guru SDN CITERE', 'Berbagi praktik baik pekan ini, bawa contoh hasil kerja murid.'],
    ['jadwal-2', 'Lesson Study: Observasi Kelas 5', 'implementasi', '2026-08-12', '08:00', 'Kelas 5', 'Observasi pembelajaran, guru lain mengamati dari belakang kelas.'],
    ['jadwal-3', 'Refleksi Rapor Pendidikan Semester 1', 'refleksi', '2026-08-21', '13:00', 'Ruang Guru SDN CITERE', 'Membedah hasil Rapor Pendidikan bersama, siapkan laptop/HP masing-masing.'],
  ]);
  seedIfEmpty_(SHEET_NAMES.NOTULEN, [
    ['notulen-1', 'Notulen Refleksi Rapor Pendidikan Semester 1', '2026-07-24', 'refleksi', 'Bu Sinta', 'Yayat Heryana, Bu Sinta, Pak Yusuf, Bu Rina, Pak Dedi', 'Ditemukan capaian literasi kelas 3-4 masih di bawah target, sementara numerasi kelas 5-6 sudah membaik dibanding semester lalu.', 'Tiap guru kelas menyusun 1 strategi literasi untuk dicoba pekan depan, dibahas lagi di Kelas Berbagi Jumat.', 'publish'],
  ]);

  SpreadsheetApp.getUi() && SpreadsheetApp.getUi().alert('Setup selesai. Sheet siap dipakai.');
}

function seedIfEmpty_(sheetName, rows) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (sheet.getLastRow() <= 1) {
    rows.forEach(function (r) { sheet.appendRow(r); });
  }
}

// ---------------------------------------------------------------------
// AUTH (sederhana, cocok untuk komunitas sekolah - bukan sistem enterprise)
// ---------------------------------------------------------------------
// Jalankan sekali dari editor Apps Script untuk mengatur password admin:
//   setAdminPassword('password-rahasia-anda')
function setAdminPassword(password) {
  PropertiesService.getScriptProperties().setProperty('ADMIN_PASSWORD', password);
}

function checkPassword_(password) {
  const saved = PropertiesService.getScriptProperties().getProperty('ADMIN_PASSWORD');
  if (!saved) {
    throw new Error('Password admin belum diatur. Jalankan setAdminPassword("...") dari editor Apps Script.');
  }
  return password === saved;
}

// ---------------------------------------------------------------------
// HELPERS: baca/tulis sheet sebagai array of object
// ---------------------------------------------------------------------
function getSheet_(name) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sheet) throw new Error('Sheet "' + name + '" tidak ditemukan. Jalankan setupSheets() dulu.');
  return sheet;
}

function readAll_(name) {
  const sheet = getSheet_(name);
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0];
  return values.slice(1)
    .filter(function (row) { return row[0] !== '' && row[0] !== null; })
    .map(function (row) {
      const obj = {};
      headers.forEach(function (h, i) { obj[h] = row[i]; });
      return obj;
    });
}

function findRowIndexById_(sheet, id) {
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(id)) return i + 1; // 1-indexed sheet row
  }
  return -1;
}

function getHeaders_(sheet) {
  const lastCol = sheet.getLastColumn();
  if (lastCol === 0) return [];
  return sheet.getRange(1, 1, 1, lastCol).getValues()[0];
}

function migrateHeaders_(sheet, name) {
  const current = getHeaders_(sheet);
  const wanted = SHEET_COLUMNS[name];
  const missing = wanted.filter(function (c) { return current.indexOf(c) === -1; });
  if (missing.length) {
    sheet.getRange(1, current.length + 1, 1, missing.length).setValues([missing]);
  }
}

function createRow_(name, data) {
  const sheet = getSheet_(name);
  const headers = getHeaders_(sheet);
  const id = name.toLowerCase() + '-' + new Date().getTime();
  const row = headers.map(function (c) {
    if (c === 'id') return id;
    if (c === 'updatedAt') return new Date();
    return data[c] !== undefined ? data[c] : '';
  });
  sheet.appendRow(row);
  return id;
}

function updateRow_(name, id, data) {
  const sheet = getSheet_(name);
  const headers = getHeaders_(sheet);
  const rowIndex = findRowIndexById_(sheet, id);
  if (rowIndex === -1) throw new Error('Data dengan id "' + id + '" tidak ditemukan di ' + name);
  const row = headers.map(function (c) {
    if (c === 'id') return id;
    if (c === 'updatedAt') return new Date();
    return data[c] !== undefined ? data[c] : '';
  });
  sheet.getRange(rowIndex, 1, 1, headers.length).setValues([row]);
}

function deleteRow_(name, id) {
  const sheet = getSheet_(name);
  const rowIndex = findRowIndexById_(sheet, id);
  if (rowIndex === -1) throw new Error('Data dengan id "' + id + '" tidak ditemukan di ' + name);
  sheet.deleteRow(rowIndex);
}

// ---------------------------------------------------------------------
// HTTP ENTRY POINTS
// ---------------------------------------------------------------------
function doGet(e) {
  try {
    const action = (e.parameter.action || 'getAll');
    let payload;

    if (action === 'getAll') {
      payload = {
        profil: readAll_(SHEET_NAMES.PROFIL)[0] || null,
        program: readAll_(SHEET_NAMES.PROGRAM),
        siklus: readAll_(SHEET_NAMES.SIKLUS),
        sumberdaya: readAll_(SHEET_NAMES.SUMBERDAYA),
        anggota: readAll_(SHEET_NAMES.ANGGOTA),
        jadwal: readAll_(SHEET_NAMES.JADWAL),
        jurnal: readAll_(SHEET_NAMES.JURNAL).filter(function (j) { return j.status === 'publish'; }),
        notulen: readAll_(SHEET_NAMES.NOTULEN).filter(function (n) { return n.status === 'publish'; }),
        galeri: readAll_(SHEET_NAMES.GALERI),
        kontak: readAll_(SHEET_NAMES.KONTAK)[0] || null,
      };
    } else if (action === 'get') {
      const resource = e.parameter.resource;
      payload = readAll_(SHEET_NAMES[resource.toUpperCase()] || resource);
    } else {
      throw new Error('Aksi GET tidak dikenal: ' + action);
    }

    return jsonOutput_({ ok: true, data: payload });
  } catch (err) {
    return jsonOutput_({ ok: false, error: err.message });
  }
}

function doPost(e) {
  try {
    // Dikirim sebagai text/plain berisi JSON (menghindari CORS preflight).
    const body = JSON.parse(e.postData.contents);
    const action = body.action;

    if (action === 'login') {
      const valid = checkPassword_(body.password);
      if (!valid) throw new Error('Password salah.');
      return jsonOutput_({ ok: true, data: { loggedIn: true } });
    }

    // Semua aksi tulis lain wajib password.
    if (!checkPassword_(body.password)) throw new Error('Password salah atau sesi berakhir.');

    const sheetName = SHEET_NAMES[(body.resource || '').toUpperCase()];
    if (!sheetName) throw new Error('Resource tidak dikenal: ' + body.resource);

    let payload;
    if (action === 'create') {
      const id = createRow_(sheetName, body.data || {});
      payload = { id: id };
    } else if (action === 'update') {
      updateRow_(sheetName, body.id, body.data || {});
      payload = { id: body.id };
    } else if (action === 'delete') {
      deleteRow_(sheetName, body.id);
      payload = { id: body.id };
    } else {
      throw new Error('Aksi POST tidak dikenal: ' + action);
    }

    return jsonOutput_({ ok: true, data: payload });
  } catch (err) {
    return jsonOutput_({ ok: false, error: err.message });
  }
}

function jsonOutput_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
