/* BERANI — admin app.js
   Login sederhana (password disimpan di Script Properties GAS) lalu
   CRUD ke tiap resource lewat POST text/plain (menghindari CORS preflight). */

const SESSION_KEY = 'berani_admin_password';

function apiUrl() { return BERANI_CONFIG.GAS_API_URL; }

function isConfigured() {
  return apiUrl() && !apiUrl().startsWith('TEMPEL_URL');
}

async function apiPost(body) {
  const res = await fetch(apiUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // hindari CORS preflight
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Terjadi kesalahan.');
  return json.data;
}

async function apiGet(resource) {
  const res = await fetch(apiUrl() + '?action=get&resource=' + encodeURIComponent(resource));
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Terjadi kesalahan.');
  return json.data;
}

function getPassword() { return sessionStorage.getItem(SESSION_KEY); }
function setPassword(p) { sessionStorage.setItem(SESSION_KEY, p); }
function clearPassword() { sessionStorage.removeItem(SESSION_KEY); }

/* ---------------- Login ---------------- */
async function handleLogin(e) {
  e.preventDefault();
  const password = document.getElementById('loginPassword').value;
  const errorBox = document.getElementById('loginError');
  errorBox.classList.remove('is-visible');

  if (!isConfigured()) {
    errorBox.textContent = 'GAS_API_URL belum diisi di shared/config.js. Lihat README.md.';
    errorBox.classList.add('is-visible');
    return;
  }

  try {
    await apiPost({ action: 'login', password: password });
    setPassword(password);
    showDashboard();
  } catch (err) {
    errorBox.textContent = err.message;
    errorBox.classList.add('is-visible');
  }
}

function logout() {
  clearPassword();
  document.getElementById('dashboard').style.display = 'none';
  document.getElementById('loginScreen').style.display = 'grid';
}

function showDashboard() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('dashboard').style.display = 'grid';
  loadAllTabs();
}

/* ---------------- Tabs ---------------- */
function setupTabs() {
  const buttons = document.querySelectorAll('.side-nav button');
  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      buttons.forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      document.querySelectorAll('.tab-panel').forEach(function (p) { p.classList.remove('is-active'); });
      document.getElementById('tab-' + btn.dataset.tab).classList.add('is-active');
    });
  });
}

async function loadAllTabs() {
  await Promise.all([
    loadProfil(),
    loadKontak(),
    loadList('program', 'ProgramKerja', renderProgramRow),
    loadList('anggota', 'Anggota', renderAnggotaRow),
    loadList('siklus', 'SiklusKegiatan', renderSiklusRow),
    loadList('jadwal', 'Jadwal', renderJadwalRow),
    loadList('notulen', 'NotulenKombel', renderNotulenRow),
    loadList('sumberdaya', 'SumberDaya', renderSumberDayaRow),
    loadList('jurnal', 'Jurnal', renderJurnalRow),
    loadList('galeri', 'Galeri', renderGaleriRow),
  ]);
}

/* ---------------- Profil (singleton) ---------------- */
function updateLogoPreview(url) {
  const src = url || BERANI_CONFIG.LOGO_URL;
  if (!src) return;
  document.getElementById('profilFotoPreview').src = src;
  document.getElementById('sideLogo').src = src;
}

async function loadProfil() {
  try {
    const rows = await apiGet('Profil');
    const p = rows[0] || {};
    document.getElementById('profilId').value = p.id || '';
    document.getElementById('profilFotoUrl').value = p.fotoUrl || '';
    updateLogoPreview(p.fotoUrl);
    document.getElementById('profilJudul').value = p.judul || '';
    document.getElementById('profilTagline').value = p.tagline || '';
    document.getElementById('profilDeskripsi').value = p.deskripsi || '';
    document.getElementById('profilVisi').value = p.visi || '';
    document.getElementById('profilMisi').value = p.misi || '';
  } catch (err) { flashStatus('profilStatus', err.message, true); }
}

async function saveProfil(e) {
  e.preventDefault();
  const id = document.getElementById('profilId').value;
  const data = {
    fotoUrl: document.getElementById('profilFotoUrl').value,
    judul: document.getElementById('profilJudul').value,
    tagline: document.getElementById('profilTagline').value,
    deskripsi: document.getElementById('profilDeskripsi').value,
    visi: document.getElementById('profilVisi').value,
    misi: document.getElementById('profilMisi').value,
  };
  try {
    if (id) {
      await apiPost({ action: 'update', resource: 'profil', password: getPassword(), id: id, data: data });
    } else {
      const res = await apiPost({ action: 'create', resource: 'profil', password: getPassword(), data: data });
      document.getElementById('profilId').value = res.id;
    }
    flashStatus('profilStatus', 'Profil tersimpan.', false);
  } catch (err) { flashStatus('profilStatus', err.message, true); }
}

/* ---------------- Kontak (singleton) ---------------- */
async function loadKontak() {
  try {
    const rows = await apiGet('Kontak');
    const k = rows[0] || {};
    document.getElementById('kontakId').value = k.id || '';
    document.getElementById('kontakAlamat').value = k.alamat || '';
    document.getElementById('kontakEmail').value = k.email || '';
    document.getElementById('kontakWhatsapp').value = k.whatsapp || '';
    document.getElementById('kontakInstagram').value = k.instagram || '';
    document.getElementById('kontakYoutube').value = k.youtube || '';
    document.getElementById('kontakTiktok').value = k.tiktok || '';
    document.getElementById('kontakMaps').value = k.mapsUrl || '';
  } catch (err) { flashStatus('kontakStatus', err.message, true); }
}

async function saveKontak(e) {
  e.preventDefault();
  const id = document.getElementById('kontakId').value;
  const data = {
    alamat: document.getElementById('kontakAlamat').value,
    email: document.getElementById('kontakEmail').value,
    whatsapp: document.getElementById('kontakWhatsapp').value,
    instagram: document.getElementById('kontakInstagram').value,
    youtube: document.getElementById('kontakYoutube').value,
    tiktok: document.getElementById('kontakTiktok').value,
    mapsUrl: document.getElementById('kontakMaps').value,
  };
  try {
    if (id) {
      await apiPost({ action: 'update', resource: 'kontak', password: getPassword(), id: id, data: data });
    } else {
      const res = await apiPost({ action: 'create', resource: 'kontak', password: getPassword(), data: data });
      document.getElementById('kontakId').value = res.id;
    }
    flashStatus('kontakStatus', 'Kontak tersimpan.', false);
  } catch (err) { flashStatus('kontakStatus', err.message, true); }
}

/* ---------------- Generic list resources: Program, Jurnal, Galeri ---------------- */
async function loadList(key, resourceName, rowRenderer) {
  const tbody = document.getElementById(key + 'TableBody');
  try {
    const rows = await apiGet(resourceName);
    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="5">Belum ada data.</td></tr>';
      return;
    }
    tbody.innerHTML = rows.map(rowRenderer).join('');
    tbody.querySelectorAll('[data-edit]').forEach(function (btn) {
      btn.addEventListener('click', function () { fillFormFromRow(key, JSON.parse(btn.dataset.edit)); });
    });
    tbody.querySelectorAll('[data-delete]').forEach(function (btn) {
      btn.addEventListener('click', function () { deleteItem(key, resourceName, btn.dataset.delete); });
    });
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="5">' + escapeHtml(err.message) + '</td></tr>';
  }
}

function renderProgramRow(p) {
  return '<tr><td>' + escapeHtml(p.nama) + '<div class="badge">' + escapeHtml(p.status) + '</div></td>' +
    '<td>' + escapeHtml(p.kategori || '') + '</td>' +
    '<td>' + escapeHtml(String(p.tanggal || '')) + '</td>' +
    '<td class="row-actions">' +
    '<button class="btn btn-ghost btn-sm" data-edit=\'' + escapeAttr(JSON.stringify(p)) + '\'>Ubah</button>' +
    '<button class="btn btn-danger btn-sm" data-delete="' + p.id + '">Hapus</button></td></tr>';
}

function renderAnggotaRow(a) {
  return '<tr><td>' + escapeHtml(a.nama) + '</td>' +
    '<td><div class="badge">' + escapeHtml(a.peran || '') + '</div></td>' +
    '<td>' + escapeHtml(a.kelasMapel || '') + '</td>' +
    '<td class="row-actions">' +
    '<button class="btn btn-ghost btn-sm" data-edit=\'' + escapeAttr(JSON.stringify(a)) + '\'>Ubah</button>' +
    '<button class="btn btn-danger btn-sm" data-delete="' + a.id + '">Hapus</button></td></tr>';
}

function renderNotulenRow(n) {
  return '<tr><td>' + escapeHtml(n.judul) + '</td>' +
    '<td>' + escapeHtml(String(n.tanggal || '')) + '</td>' +
    '<td><div class="badge">' + escapeHtml(n.status || 'draft') + '</div></td>' +
    '<td class="row-actions">' +
    '<button class="btn btn-ghost btn-sm" data-edit=\'' + escapeAttr(JSON.stringify(n)) + '\'>Ubah</button>' +
    '<button class="btn btn-danger btn-sm" data-delete="' + n.id + '">Hapus</button></td></tr>';
}

function renderJadwalRow(j) {
  return '<tr><td>' + escapeHtml(j.judul) + '</td>' +
    '<td>' + escapeHtml(String(j.tanggal || '')) + (j.waktu ? ' ' + escapeHtml(j.waktu) : '') + '</td>' +
    '<td>' + escapeHtml(j.tempat || '') + '</td>' +
    '<td class="row-actions">' +
    '<button class="btn btn-ghost btn-sm" data-edit=\'' + escapeAttr(JSON.stringify(j)) + '\'>Ubah</button>' +
    '<button class="btn btn-danger btn-sm" data-delete="' + j.id + '">Hapus</button></td></tr>';
}

const TAHAP_LABEL = { refleksi: 'Refleksi', perencanaan: 'Perencanaan', implementasi: 'Implementasi', evaluasi: 'Evaluasi' };

function renderSiklusRow(s) {
  return '<tr><td>' + escapeHtml(s.judul) + '</td>' +
    '<td><div class="badge">' + escapeHtml(TAHAP_LABEL[s.tahap] || s.tahap || '') + '</div></td>' +
    '<td>' + escapeHtml(String(s.tanggal || '')) + '</td>' +
    '<td class="row-actions">' +
    '<button class="btn btn-ghost btn-sm" data-edit=\'' + escapeAttr(JSON.stringify(s)) + '\'>Ubah</button>' +
    '<button class="btn btn-danger btn-sm" data-delete="' + s.id + '">Hapus</button></td></tr>';
}

function renderSumberDayaRow(r) {
  return '<tr><td>' + escapeHtml(r.judul) + '<div class="badge">' + escapeHtml(r.jenis || '') + '</div></td>' +
    '<td>' + escapeHtml(r.jenis || '') + '</td>' +
    '<td>' + escapeHtml(r.kelas || '') + (r.mapel ? ' · ' + escapeHtml(r.mapel) : '') + '</td>' +
    '<td class="row-actions">' +
    '<button class="btn btn-ghost btn-sm" data-edit=\'' + escapeAttr(JSON.stringify(r)) + '\'>Ubah</button>' +
    '<button class="btn btn-danger btn-sm" data-delete="' + r.id + '">Hapus</button></td></tr>';
}

function renderJurnalRow(j) {
  return '<tr><td>' + escapeHtml(j.judul) + '<div class="badge">' + escapeHtml(j.status || 'draft') + '</div></td>' +
    '<td>' + escapeHtml(j.penulis || '') + '</td>' +
    '<td>' + escapeHtml(String(j.tanggal || '')) + '</td>' +
    '<td class="row-actions">' +
    '<button class="btn btn-ghost btn-sm" data-edit=\'' + escapeAttr(JSON.stringify(j)) + '\'>Ubah</button>' +
    '<button class="btn btn-danger btn-sm" data-delete="' + j.id + '">Hapus</button></td></tr>';
}

function renderGaleriRow(g) {
  return '<tr><td>' + escapeHtml(g.judul || '') + '</td>' +
    '<td><img src="' + g.url + '" alt="" style="width:60px;height:44px;object-fit:cover;border-radius:6px" onerror="this.style.opacity=0.2"></td>' +
    '<td>' + escapeHtml(String(g.tanggal || '')) + '</td>' +
    '<td class="row-actions">' +
    '<button class="btn btn-ghost btn-sm" data-edit=\'' + escapeAttr(JSON.stringify(g)) + '\'>Ubah</button>' +
    '<button class="btn btn-danger btn-sm" data-delete="' + g.id + '">Hapus</button></td></tr>';
}

function fillFormFromRow(key, row) {
  if (key === 'program') {
    document.getElementById('programId').value = row.id;
    document.getElementById('programNama').value = row.nama || '';
    document.getElementById('programDeskripsi').value = row.deskripsi || '';
    document.getElementById('programKategori').value = row.kategori || '';
    document.getElementById('programStatusSel').value = row.status || 'berjalan';
    document.getElementById('programTanggal').value = row.tanggal || '';
    document.getElementById('programTahapSiklus').value = row.tahapSiklus || '';
  } else if (key === 'anggota') {
    document.getElementById('anggotaId').value = row.id;
    document.getElementById('anggotaNama').value = row.nama || '';
    document.getElementById('anggotaPeran').value = row.peran || 'Guru Kelas';
    document.getElementById('anggotaKelasMapel').value = row.kelasMapel || '';
    document.getElementById('anggotaUrutan').value = row.urutan || '';
    document.getElementById('anggotaFotoUrl').value = row.fotoUrl || '';
  } else if (key === 'siklus') {
    document.getElementById('siklusId').value = row.id;
    document.getElementById('siklusTahap').value = row.tahap || 'refleksi';
    document.getElementById('siklusJudul').value = row.judul || '';
    document.getElementById('siklusTanggal').value = row.tanggal || '';
    document.getElementById('siklusProgramTerkait').value = row.programTerkait || '';
    document.getElementById('siklusDeskripsi').value = row.deskripsi || '';
  } else if (key === 'jadwal') {
    document.getElementById('jadwalId').value = row.id;
    document.getElementById('jadwalJudul').value = row.judul || '';
    document.getElementById('jadwalTahap').value = row.tahap || '';
    document.getElementById('jadwalTanggal').value = row.tanggal || '';
    document.getElementById('jadwalWaktu').value = row.waktu || '';
    document.getElementById('jadwalTempat').value = row.tempat || '';
    document.getElementById('jadwalCatatan').value = row.catatan || '';
  } else if (key === 'notulen') {
    document.getElementById('notulenId').value = row.id;
    document.getElementById('notulenJudul').value = row.judul || '';
    document.getElementById('notulenTanggal').value = row.tanggal || '';
    document.getElementById('notulenTahap').value = row.tahap || '';
    document.getElementById('notulenPemimpin').value = row.pemimpin || '';
    document.getElementById('notulenStatusSel').value = row.status || 'draft';
    document.getElementById('notulenPeserta').value = row.pesertaHadir || '';
    document.getElementById('notulenRingkasan').value = row.ringkasanDiskusi || '';
    document.getElementById('notulenKesepakatan').value = row.kesepakatan || '';
  } else if (key === 'sumberdaya') {
    document.getElementById('sumberdayaId').value = row.id;
    document.getElementById('sumberdayaJudul').value = row.judul || '';
    document.getElementById('sumberdayaJenis').value = row.jenis || 'Modul Ajar';
    document.getElementById('sumberdayaMapel').value = row.mapel || '';
    document.getElementById('sumberdayaKelas').value = row.kelas || '';
    document.getElementById('sumberdayaPengunggah').value = row.pengunggah || '';
    document.getElementById('sumberdayaTanggal').value = row.tanggal || '';
    document.getElementById('sumberdayaFileUrl').value = row.fileUrl || '';
    document.getElementById('sumberdayaKeterangan').value = row.keterangan || '';
  } else if (key === 'jurnal') {
    document.getElementById('jurnalId').value = row.id;
    document.getElementById('jurnalJudul').value = row.judul || '';
    document.getElementById('jurnalPenulis').value = row.penulis || '';
    document.getElementById('jurnalTanggal').value = row.tanggal || '';
    document.getElementById('jurnalRingkasan').value = row.ringkasan || '';
    document.getElementById('jurnalIsi').value = row.isi || '';
    document.getElementById('jurnalThumbnail').value = row.thumbnailUrl || '';
    document.getElementById('jurnalStatusSel').value = row.status || 'draft';
  } else if (key === 'galeri') {
    document.getElementById('galeriId').value = row.id;
    document.getElementById('galeriJudul').value = row.judul || '';
    document.getElementById('galeriUrl').value = row.url || '';
    document.getElementById('galeriKeterangan').value = row.keterangan || '';
    document.getElementById('galeriTanggal').value = row.tanggal || '';
  }
  document.getElementById(key + 'Form').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function resetForm(key) {
  document.getElementById(key + 'Form').reset();
  document.getElementById(key + 'Id').value = '';
}

async function saveListItem(key, resourceName, data, idFieldId) {
  const id = document.getElementById(idFieldId).value;
  if (id) {
    await apiPost({ action: 'update', resource: resourceName, password: getPassword(), id: id, data: data });
  } else {
    await apiPost({ action: 'create', resource: resourceName, password: getPassword(), data: data });
  }
}

const ROW_RENDERERS = {
  program: renderProgramRow,
  anggota: renderAnggotaRow,
  siklus: renderSiklusRow,
  jadwal: renderJadwalRow,
  notulen: renderNotulenRow,
  sumberdaya: renderSumberDayaRow,
  jurnal: renderJurnalRow,
  galeri: renderGaleriRow,
};

async function deleteItem(key, resourceName, id) {
  if (!confirm('Hapus data ini?')) return;
  try {
    await apiPost({ action: 'delete', resource: resourceName, password: getPassword(), id: id });
    loadList(key, resourceName, ROW_RENDERERS[key]);
  } catch (err) {
    alert(err.message);
  }
}

async function handleProgramSubmit(e) {
  e.preventDefault();
  const data = {
    nama: document.getElementById('programNama').value,
    deskripsi: document.getElementById('programDeskripsi').value,
    kategori: document.getElementById('programKategori').value,
    status: document.getElementById('programStatusSel').value,
    tanggal: document.getElementById('programTanggal').value,
    tahapSiklus: document.getElementById('programTahapSiklus').value,
  };
  try {
    await saveListItem('program', 'program', data, 'programId');
    resetForm('program');
    flashStatus('programStatus', 'Program kerja tersimpan.', false);
    loadList('program', 'ProgramKerja', renderProgramRow);
  } catch (err) { flashStatus('programStatus', err.message, true); }
}

async function handleAnggotaSubmit(e) {
  e.preventDefault();
  const data = {
    nama: document.getElementById('anggotaNama').value,
    peran: document.getElementById('anggotaPeran').value,
    kelasMapel: document.getElementById('anggotaKelasMapel').value,
    urutan: document.getElementById('anggotaUrutan').value,
    fotoUrl: document.getElementById('anggotaFotoUrl').value,
  };
  try {
    await saveListItem('anggota', 'anggota', data, 'anggotaId');
    resetForm('anggota');
    flashStatus('anggotaStatus', 'Anggota tersimpan.', false);
    loadList('anggota', 'Anggota', renderAnggotaRow);
  } catch (err) { flashStatus('anggotaStatus', err.message, true); }
}

async function handleSiklusSubmit(e) {
  e.preventDefault();
  const data = {
    tahap: document.getElementById('siklusTahap').value,
    judul: document.getElementById('siklusJudul').value,
    tanggal: document.getElementById('siklusTanggal').value,
    programTerkait: document.getElementById('siklusProgramTerkait').value,
    deskripsi: document.getElementById('siklusDeskripsi').value,
  };
  try {
    await saveListItem('siklus', 'siklus', data, 'siklusId');
    resetForm('siklus');
    flashStatus('siklusStatus', 'Kegiatan siklus tersimpan.', false);
    loadList('siklus', 'SiklusKegiatan', renderSiklusRow);
  } catch (err) { flashStatus('siklusStatus', err.message, true); }
}

async function handleNotulenSubmit(e) {
  e.preventDefault();
  const data = {
    judul: document.getElementById('notulenJudul').value,
    tanggal: document.getElementById('notulenTanggal').value,
    tahap: document.getElementById('notulenTahap').value,
    pemimpin: document.getElementById('notulenPemimpin').value,
    pesertaHadir: document.getElementById('notulenPeserta').value,
    ringkasanDiskusi: document.getElementById('notulenRingkasan').value,
    kesepakatan: document.getElementById('notulenKesepakatan').value,
    status: document.getElementById('notulenStatusSel').value,
  };
  try {
    await saveListItem('notulen', 'notulen', data, 'notulenId');
    resetForm('notulen');
    flashStatus('notulenFormStatus', 'Notulen tersimpan.', false);
    loadList('notulen', 'NotulenKombel', renderNotulenRow);
  } catch (err) { flashStatus('notulenFormStatus', err.message, true); }
}

async function handleJadwalSubmit(e) {
  e.preventDefault();
  const data = {
    judul: document.getElementById('jadwalJudul').value,
    tahap: document.getElementById('jadwalTahap').value,
    tanggal: document.getElementById('jadwalTanggal').value,
    waktu: document.getElementById('jadwalWaktu').value,
    tempat: document.getElementById('jadwalTempat').value,
    catatan: document.getElementById('jadwalCatatan').value,
  };
  try {
    await saveListItem('jadwal', 'jadwal', data, 'jadwalId');
    resetForm('jadwal');
    flashStatus('jadwalStatus', 'Jadwal tersimpan.', false);
    loadList('jadwal', 'Jadwal', renderJadwalRow);
  } catch (err) { flashStatus('jadwalStatus', err.message, true); }
}

async function handleSumberDayaSubmit(e) {
  e.preventDefault();
  const data = {
    judul: document.getElementById('sumberdayaJudul').value,
    jenis: document.getElementById('sumberdayaJenis').value,
    mapel: document.getElementById('sumberdayaMapel').value,
    kelas: document.getElementById('sumberdayaKelas').value,
    pengunggah: document.getElementById('sumberdayaPengunggah').value,
    tanggal: document.getElementById('sumberdayaTanggal').value,
    fileUrl: document.getElementById('sumberdayaFileUrl').value,
    keterangan: document.getElementById('sumberdayaKeterangan').value,
  };
  try {
    await saveListItem('sumberdaya', 'sumberdaya', data, 'sumberdayaId');
    resetForm('sumberdaya');
    flashStatus('sumberdayaStatus', 'Sumber daya tersimpan.', false);
    loadList('sumberdaya', 'SumberDaya', renderSumberDayaRow);
  } catch (err) { flashStatus('sumberdayaStatus', err.message, true); }
}

async function handleJurnalSubmit(e) {
  e.preventDefault();
  const data = {
    judul: document.getElementById('jurnalJudul').value,
    penulis: document.getElementById('jurnalPenulis').value,
    tanggal: document.getElementById('jurnalTanggal').value,
    ringkasan: document.getElementById('jurnalRingkasan').value,
    isi: document.getElementById('jurnalIsi').value,
    thumbnailUrl: document.getElementById('jurnalThumbnail').value,
    status: document.getElementById('jurnalStatusSel').value,
  };
  try {
    await saveListItem('jurnal', 'jurnal', data, 'jurnalId');
    resetForm('jurnal');
    flashStatus('jurnalStatus', 'Jurnal tersimpan.', false);
    loadList('jurnal', 'Jurnal', renderJurnalRow);
  } catch (err) { flashStatus('jurnalStatus', err.message, true); }
}

async function handleGaleriSubmit(e) {
  e.preventDefault();
  const data = {
    judul: document.getElementById('galeriJudul').value,
    url: document.getElementById('galeriUrl').value,
    keterangan: document.getElementById('galeriKeterangan').value,
    tanggal: document.getElementById('galeriTanggal').value,
  };
  try {
    await saveListItem('galeri', 'galeri', data, 'galeriId');
    resetForm('galeri');
    flashStatus('galeriStatus', 'Foto galeri tersimpan.', false);
    loadList('galeri', 'Galeri', renderGaleriRow);
  } catch (err) { flashStatus('galeriStatus', err.message, true); }
}

/* ---------------- Utilities ---------------- */
function flashStatus(elId, message, isError) {
  const el = document.getElementById(elId);
  el.textContent = message;
  el.className = (isError ? 'form-error' : 'form-success') + ' is-visible';
  setTimeout(function () { el.classList.remove('is-visible'); }, 3500);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
function escapeAttr(str) { return String(str).replace(/'/g, '&#39;'); }

/* ---------------- Init ---------------- */
document.addEventListener('DOMContentLoaded', function () {
  if (BERANI_CONFIG.LOGO_URL) {
    document.getElementById('loginLogo').src = BERANI_CONFIG.LOGO_URL;
    document.getElementById('sideLogo').src = BERANI_CONFIG.LOGO_URL;
  }
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  document.getElementById('logoutBtn').addEventListener('click', logout);
  document.getElementById('profilForm').addEventListener('submit', saveProfil);
  document.getElementById('profilFotoUrl').addEventListener('input', function (e) {
    updateLogoPreview(e.target.value);
  });
  document.getElementById('kontakForm').addEventListener('submit', saveKontak);
  document.getElementById('programForm').addEventListener('submit', handleProgramSubmit);
  document.getElementById('anggotaForm').addEventListener('submit', handleAnggotaSubmit);
  document.getElementById('siklusForm').addEventListener('submit', handleSiklusSubmit);
  document.getElementById('jadwalForm').addEventListener('submit', handleJadwalSubmit);
  document.getElementById('notulenForm').addEventListener('submit', handleNotulenSubmit);
  document.getElementById('sumberdayaForm').addEventListener('submit', handleSumberDayaSubmit);
  document.getElementById('jurnalForm').addEventListener('submit', handleJurnalSubmit);
  document.getElementById('galeriForm').addEventListener('submit', handleGaleriSubmit);
  document.querySelectorAll('[data-reset]').forEach(function (btn) {
    btn.addEventListener('click', function () { resetForm(btn.dataset.reset); });
  });
  setupTabs();

  if (getPassword() && isConfigured()) {
    showDashboard();
  }
});
