/* BERANI — frontend app.js
   Mengambil data dari Google Apps Script (GAS) dan merender ke halaman.
   Jika GAS_API_URL belum diisi di shared/config.js, halaman tetap tampil
   dengan data contoh (fallback) supaya desain tetap bisa dilihat. */

const FALLBACK_DATA = {
  profil: {
    judul: 'BERANI',
    tagline: 'Berdedikasi, Rajin Berkolaborasi, Niat Menginspirasi',
    deskripsi: 'BERANI adalah komunitas belajar guru SDN CITERE — ruang berbagi praktik baik mengajar, berdiskusi, dan tumbuh bersama setiap pekan.',
    visi: 'Menjadi komunitas guru yang aktif belajar dan saling menguatkan demi murid yang lebih baik.',
    misi: 'Berbagi praktik baik secara rutin;Berkolaborasi lintas kelas dan mata pelajaran;Menginspirasi lewat karya dan jurnal mengajar',
  },
  program: [
    { id: '1', nama: 'Kelas Berbagi Jumat', deskripsi: 'Sesi rutin berbagi praktik baik mengajar antar guru, sekali sepekan.', kategori: 'Rutin', status: 'berjalan', tanggal: '2026', tahapSiklus: 'evaluasi' },
    { id: '2', nama: 'Lesson Study Kurikulum Merdeka', deskripsi: 'Observasi dan refleksi pembelajaran bersama untuk memperkuat implementasi Kurikulum Merdeka.', kategori: 'Kolaborasi', status: 'berjalan', tanggal: '2026', tahapSiklus: 'perencanaan' },
    { id: '3', nama: 'Pameran Karya Murid', deskripsi: 'Menampilkan hasil karya belajar murid dari seluruh kelas di akhir semester.', kategori: 'Semester', status: 'selesai', tanggal: '2025', tahapSiklus: 'implementasi' },
  ],
  siklus: [
    { id: '1', tahap: 'refleksi', judul: 'Analisis Rapor Pendidikan', deskripsi: 'Membedah hasil Rapor Pendidikan dan hasil belajar murid semester lalu untuk menemukan akar masalah pembelajaran di tiap kelas.', tanggal: '2026-01', programTerkait: 'Kelas Berbagi Jumat' },
    { id: '2', tahap: 'perencanaan', judul: 'Menyusun Modul Ajar Bersama', deskripsi: 'Menyusun modul ajar, alur tujuan pembelajaran (ATP), dan asesmen secara kolaboratif berdasarkan hasil refleksi.', tanggal: '2026-01', programTerkait: 'Lesson Study Kurikulum Merdeka' },
    { id: '3', tahap: 'implementasi', judul: 'Praktik di Kelas Masing-masing', deskripsi: 'Menerapkan hasil kesepakatan modul ajar dan strategi mengajar ke kelas masing-masing selama satu periode.', tanggal: '2026-02', programTerkait: 'Lesson Study Kurikulum Merdeka' },
    { id: '4', tahap: 'evaluasi', judul: 'Berbagi Praktik Baik', deskripsi: 'Guru saling berbagi praktik baik dan kendala yang dihadapi di kelas, menjadi bahan refleksi periode berikutnya.', tanggal: '2026-02', programTerkait: 'Kelas Berbagi Jumat' },
  ],
  sumberdaya: [
    { id: '1', judul: 'Modul Ajar Pecahan Kelas 4', jenis: 'Modul Ajar', mapel: 'Matematika', kelas: 'Kelas 4', fileUrl: '', pengunggah: 'Bu Sinta', keterangan: 'Modul ajar pecahan dengan pendekatan kontekstual, lengkap dengan LKPD.', tanggal: '2026-01' },
    { id: '2', judul: 'ATP Bahasa Indonesia Semester 2', jenis: 'ATP', mapel: 'Bahasa Indonesia', kelas: 'Kelas 5', fileUrl: '', pengunggah: 'Pak Yusuf', keterangan: 'Alur tujuan pembelajaran semester 2, sudah diselaraskan hasil refleksi rapor pendidikan.', tanggal: '2026-01' },
    { id: '3', judul: 'LKS Operasi Hitung Campuran', jenis: 'LKS', mapel: 'Matematika', kelas: 'Kelas 6', fileUrl: '', pengunggah: 'Bu Sinta', keterangan: 'Lembar kerja siswa untuk latihan operasi hitung campuran, siap cetak.', tanggal: '2026-02' },
  ],
  anggota: [
    { id: '1', nama: 'Yayat Heryana', peran: 'Penasihat / Kepala Sekolah', kelasMapel: '', fotoUrl: '', urutan: 1 },
    { id: '2', nama: 'Bu Sinta', peran: 'Ketua Komunitas', kelasMapel: 'Kelas 4', fotoUrl: '', urutan: 2 },
    { id: '3', nama: 'Pak Yusuf', peran: 'Sekretaris', kelasMapel: 'Kelas 6', fotoUrl: '', urutan: 3 },
    { id: '4', nama: 'Bu Rina', peran: 'Fasilitator / Narasumber', kelasMapel: 'PJOK', fotoUrl: '', urutan: 4 },
    { id: '5', nama: 'Pak Dedi', peran: 'Anggota', kelasMapel: 'Pendidikan Agama', fotoUrl: '', urutan: 5 },
  ],
  jadwal: [
    { id: '1', judul: 'Kelas Berbagi Jumat', tahap: 'evaluasi', tanggal: '2026-08-07', waktu: '13:00', tempat: 'Ruang Guru SDN CITERE', catatan: 'Berbagi praktik baik pekan ini, bawa contoh hasil kerja murid.' },
    { id: '2', judul: 'Lesson Study: Observasi Kelas 5', tahap: 'implementasi', tanggal: '2026-08-12', waktu: '08:00', tempat: 'Kelas 5', catatan: 'Observasi pembelajaran, guru lain mengamati dari belakang kelas.' },
    { id: '3', judul: 'Refleksi Rapor Pendidikan Semester 1', tahap: 'refleksi', tanggal: '2026-08-21', waktu: '13:00', tempat: 'Ruang Guru SDN CITERE', catatan: 'Membedah hasil Rapor Pendidikan bersama, siapkan laptop/HP masing-masing.' },
  ],
  notulen: [
    { id: '1', judul: 'Notulen Refleksi Rapor Pendidikan Semester 1', tanggal: '2026-07-24', tahap: 'refleksi', pemimpin: 'Bu Sinta', pesertaHadir: 'Yayat Heryana, Bu Sinta, Pak Yusuf, Bu Rina, Pak Dedi', ringkasanDiskusi: 'Ditemukan capaian literasi kelas 3-4 masih di bawah target, sementara numerasi kelas 5-6 sudah membaik dibanding semester lalu.', kesepakatan: 'Tiap guru kelas menyusun 1 strategi literasi untuk dicoba pekan depan, dibahas lagi di Kelas Berbagi Jumat.' },
  ],
  jurnal: [
    { id: '1', judul: 'Belajar Pecahan Lewat Kue', penulis: 'Bu Sinta', tanggal: '2026-07-10', ringkasan: 'Mencoba media kue untuk menjelaskan pecahan ke kelas 4, murid jadi lebih paham konsep bagian dari keseluruhan.', thumbnailUrl: '' },
    { id: '2', judul: 'Refleksi Minggu Asesmen', penulis: 'Pak Yusuf', tanggal: '2026-07-03', ringkasan: 'Catatan reflektif tentang asesmen formatif kelas 6 dan penyesuaian rencana pembelajaran pekan berikutnya.', thumbnailUrl: '' },
  ],
  galeri: [],
  kontak: { alamat: 'SDN CITERE', email: 'beranisdncitere@gmail.com', whatsapp: '08123456789', instagram: '@beranisdncitere', youtube: '', tiktok: '', mapsUrl: '' },
};

const PILLARS = [
  { letter: 'B', word: 'Berdedikasi', desc: 'Hadir dan bertanggung jawab penuh untuk murid, setiap hari.' },
  { letter: 'E', word: 'Elemen dasar', desc: 'Menguatkan fondasi mengajar: rencana, refleksi, dan asesmen.' },
  { letter: 'R', word: 'Rajin berkolaborasi', desc: 'Saling belajar lintas kelas lewat diskusi dan lesson study.' },
  { letter: 'A', word: 'Aktif berbagi', desc: 'Membagikan praktik baik lewat jurnal mengajar mingguan.' },
  { letter: 'N', word: 'Niat menginspirasi', desc: 'Karya kecil di kelas, dampak besar bagi guru lain.' },
  { letter: 'I', word: 'Ikhlas bertumbuh', desc: 'Terbuka pada masukan dan terus memperbaiki cara mengajar.' },
];

const SIKLUS_STAGES = [
  { key: 'refleksi', no: '01', label: 'Refleksi', icon: '🔍', desc: 'Menganalisis Rapor Pendidikan dan hasil belajar murid untuk menemukan akar masalah pembelajaran.' },
  { key: 'perencanaan', no: '02', label: 'Perencanaan', icon: '🗂️', desc: 'Menyusun modul ajar, alur tujuan pembelajaran (ATP), dan asesmen bersama-sama.' },
  { key: 'implementasi', no: '03', label: 'Implementasi', icon: '🏫', desc: 'Mempraktikkan hasil diskusi ke dalam kelas masing-masing.' },
  { key: 'evaluasi', no: '04', label: 'Evaluasi', icon: '🔁', desc: 'Saling berbagi praktik baik dan mereview kendala, lalu kembali ke tahap Refleksi.' },
];

async function fetchBerani() {
  const url = BERANI_CONFIG.GAS_API_URL;
  if (!url || url.startsWith('TEMPEL_URL')) return FALLBACK_DATA;
  try {
    const res = await fetch(url + '?action=getAll');
    const json = await res.json();
    if (!json.ok) throw new Error(json.error);
    return {
      profil: json.data.profil || FALLBACK_DATA.profil,
      program: json.data.program && json.data.program.length ? json.data.program : FALLBACK_DATA.program,
      siklus: json.data.siklus && json.data.siklus.length ? json.data.siklus : FALLBACK_DATA.siklus,
      sumberdaya: json.data.sumberdaya && json.data.sumberdaya.length ? json.data.sumberdaya : FALLBACK_DATA.sumberdaya,
      anggota: json.data.anggota && json.data.anggota.length ? json.data.anggota : FALLBACK_DATA.anggota,
      jadwal: json.data.jadwal && json.data.jadwal.length ? json.data.jadwal : FALLBACK_DATA.jadwal,
      jurnal: json.data.jurnal && json.data.jurnal.length ? json.data.jurnal : FALLBACK_DATA.jurnal,
      notulen: json.data.notulen && json.data.notulen.length ? json.data.notulen : FALLBACK_DATA.notulen,
      galeri: json.data.galeri || [],
      kontak: json.data.kontak || FALLBACK_DATA.kontak,
    };
  } catch (err) {
    console.warn('Gagal memuat data dari GAS, memakai data contoh.', err);
    return FALLBACK_DATA;
  }
}

function renderSpineAndPillars() {
  const spine = document.getElementById('spine');
  const pillarWrap = document.getElementById('pillars');
  spine.innerHTML = PILLARS.map(function (p, i) {
    return '<button class="letter-' + i + '" data-target="pillar-' + i + '" aria-label="' + p.word + '">' + p.letter + '</button>';
  }).join('');
  pillarWrap.innerHTML = PILLARS.slice(0, 3).map(function (p, i) {
    return '<div class="pillar-card letter-' + i + '" id="pillar-' + i + '"><div class="letter letter-' + i + '">' + p.letter + '</div><h3>' + p.word + '</h3><p>' + p.desc + '</p></div>';
  }).join('');

  spine.querySelectorAll('button').forEach(function (btn, i) {
    btn.addEventListener('click', function () {
      spine.querySelectorAll('button').forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      const targetPillar = PILLARS[i];
      document.getElementById('pillar-detail').innerHTML =
        '<div class="pillar-card is-active letter-' + i + '"><div class="letter letter-' + i + '">' + targetPillar.letter + '</div><h3>' + targetPillar.word + '</h3><p>' + targetPillar.desc + '</p></div>';
    });
  });
}

function renderSiklus(list, activeKey) {
  const stagesWrap = document.getElementById('siklusStages');
  const detailWrap = document.getElementById('siklusDetail');
  const current = activeKey || SIKLUS_STAGES[0].key;

  stagesWrap.innerHTML = SIKLUS_STAGES.map(function (s, i) {
    const isActive = s.key === current ? ' is-active' : '';
    return '<button class="siklus-stage stage-' + i + isActive + '" data-tahap="' + s.key + '">' +
      '<span class="stage-no">' + s.no + '</span>' +
      '<span class="stage-icon">' + s.icon + '</span>' +
      '<span class="stage-label">' + s.label + '</span>' +
      '</button>';
  }).join('');

  const stageInfo = SIKLUS_STAGES.find(function (s) { return s.key === current; });
  const items = list.filter(function (it) { return it.tahap === current; });

  detailWrap.innerHTML =
    '<div class="siklus-detail-head">' +
    '<h3>' + escapeHtml(stageInfo.label) + '</h3>' +
    '<p>' + escapeHtml(stageInfo.desc) + '</p>' +
    '</div>' +
    (items.length
      ? '<div class="siklus-items">' + items.map(function (it) {
          return '<div class="siklus-item">' +
            '<h4>' + escapeHtml(it.judul) + '</h4>' +
            '<p>' + escapeHtml(it.deskripsi || '') + '</p>' +
            '<div class="meta">' +
            (it.tanggal ? escapeHtml(formatTanggal(it.tanggal) || String(it.tanggal)) : '') +
            (it.programTerkait ? ' · Program: ' + escapeHtml(it.programTerkait) : '') +
            '</div></div>';
        }).join('') + '</div>'
      : '<div class="empty-state">Belum ada kegiatan untuk tahap ini.</div>');

  stagesWrap.querySelectorAll('.siklus-stage').forEach(function (btn) {
    btn.addEventListener('click', function () { renderSiklus(list, btn.dataset.tahap); });
  });
}

const ORG_ROLES = [
  { key: 'penasihat', match: /penasihat|kepala sekolah/i, label: 'Penasihat / Kepala Sekolah', duty: 'Memberikan arahan, dukungan kebijakan, serta memfasilitasi kebutuhan operasional komunitas di lingkungan sekolah.' },
  { key: 'ketua', match: /ketua/i, label: 'Ketua Komunitas', duty: 'Memimpin jalannya organisasi komunitas belajar serta mengoordinasikan seluruh program kerja dan jadwal pertemuan rutin bersama anggota.' },
  { key: 'sekretaris', match: /sekretaris/i, label: 'Sekretaris', duty: 'Mengelola administrasi komunitas, mencatat hasil notulensi setiap pertemuan, serta mendokumentasikan lembar refleksi kegiatan.' },
  { key: 'fasilitator', match: /fasilitator|narasumber/i, label: 'Fasilitator / Narasumber', sub: 'Bergilir sesuai topik antarguru', duty: 'Memimpin sesi diskusi, membagikan praktik baik, atau memaparkan materi sesuai topik yang dijadwalkan, secara bergantian antarguru.' },
  { key: 'anggota', match: /.*/, label: 'Anggota Komunitas', sub: 'Seluruh guru aktif SDN CITERE', duty: 'Berpartisipasi aktif dalam kegiatan diskusi, bedah masalah pembelajaran, dan observasi kelas timbal-balik (peer observation).' },
];

function initials(name) {
  return String(name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(function (w) { return w[0]; })
    .join('')
    .toUpperCase();
}

function groupByRole(list) {
  const buckets = { penasihat: [], ketua: [], sekretaris: [], fasilitator: [], anggota: [] };
  list.forEach(function (a) {
    const role = ORG_ROLES.find(function (r) { return r.key !== 'anggota' && r.match.test(a.peran || ''); });
    buckets[role ? role.key : 'anggota'].push(a);
  });
  return buckets;
}

function renderAnggota(list) {
  const wrap = document.getElementById('anggota-grid');
  if (!list.length) {
    wrap.innerHTML = '<div class="empty-state">Struktur anggota belum ditambahkan.</div>';
    return;
  }
  const bySort = list.slice().sort(function (a, b) { return (Number(a.urutan) || 999) - (Number(b.urutan) || 999); });
  const buckets = groupByRole(bySort);

  function roleMeta(key) { return ORG_ROLES.find(function (r) { return r.key === key; }); }

  function personNode(a) {
    const avatar = a.fotoUrl
      ? '<img src="' + a.fotoUrl + '" alt="' + escapeHtml(a.nama) + '">'
      : '<span>' + escapeHtml(initials(a.nama)) + '</span>';
    return '<div class="anggota-avatar">' + avatar + '</div><h4>' + escapeHtml(a.nama) + '</h4>' +
      (a.kelasMapel ? '<div class="meta">' + escapeHtml(a.kelasMapel) + '</div>' : '');
  }

  function tierNode(key, people) {
    const meta = roleMeta(key);
    const inner = people.length
      ? people.map(function (a) { return '<div class="orgchart-node reveal">' + personNode(a) + '</div>'; }).join('')
      : '<div class="orgchart-node orgchart-node-empty reveal"><div class="anggota-avatar"><span>?</span></div><h4>Belum ditentukan</h4></div>';
    return '<div class="orgchart-tier">' +
      '<p class="orgchart-role-label">' + escapeHtml(meta.label) + (meta.sub ? ' <span>· ' + escapeHtml(meta.sub) + '</span>' : '') + '</p>' +
      '<div class="orgchart-nodes">' + inner + '</div>' +
      '<p class="orgchart-duty">' + escapeHtml(meta.duty) + '</p>' +
      '</div>';
  }

  const connector = '<div class="orgchart-connector"></div>';

  wrap.innerHTML =
    tierNode('penasihat', buckets.penasihat) + connector +
    tierNode('ketua', buckets.ketua) + connector +
    '<div class="orgchart-branch">' +
      tierNode('sekretaris', buckets.sekretaris) +
      tierNode('fasilitator', buckets.fasilitator) +
    '</div>' + connector +
    tierNode('anggota', buckets.anggota);

  observeReveal();
}

function renderProfil(profil) {
  document.getElementById('profil-tagline').textContent = profil.tagline || '';
  document.getElementById('profil-deskripsi').textContent = profil.deskripsi || '';
  document.getElementById('profil-visi').textContent = profil.visi || '';
  const misiWrap = document.getElementById('profil-misi');
  const misiItems = (profil.misi || '').split(';').map(function (s) { return s.trim(); }).filter(Boolean);
  misiWrap.innerHTML = misiItems.map(function (m) { return '<li>' + escapeHtml(m) + '</li>'; }).join('');

  document.getElementById('heroCardTitle').textContent = profil.judul || BERANI_CONFIG.NAMA_ORGANISASI;

  // Logo diutamakan dari Profil.fotoUrl (diatur lewat admin), baru fallback
  // ke LOGO_URL bawaan di shared/config.js kalau belum diisi.
  const logoUrl = profil.fotoUrl || BERANI_CONFIG.LOGO_URL;
  if (logoUrl) {
    document.getElementById('brandLogo').src = logoUrl;
    document.getElementById('heroEmblem').src = logoUrl;
  }
}

function renderJadwal(list) {
  const wrap = document.getElementById('jadwal-list');
  if (!list.length) {
    wrap.innerHTML = '<div class="empty-state">Belum ada jadwal kegiatan.</div>';
    return;
  }
  const todayStr = new Date().toISOString().slice(0, 10);
  const sorted = list.slice().sort(function (a, b) {
    return String(a.tanggal).localeCompare(String(b.tanggal));
  });
  const akanDatang = sorted.filter(function (j) { return String(j.tanggal) >= todayStr; });
  const telahLewat = sorted.filter(function (j) { return String(j.tanggal) < todayStr; }).reverse();

  function itemHtml(j) {
    const stage = SIKLUS_STAGES.find(function (s) { return s.key === j.tahap; });
    return '<div class="jadwal-item reveal">' +
      '<div class="jadwal-date">' +
      '<span class="jadwal-date-day">' + escapeHtml((formatTanggal(j.tanggal) || '').split(' ')[0] || '') + '</span>' +
      '<span class="jadwal-date-rest">' + escapeHtml((formatTanggal(j.tanggal) || '').split(' ').slice(1).join(' ')) + '</span>' +
      '</div>' +
      '<div class="jadwal-body">' +
      (stage ? '<span class="status-pill stage-pill">' + stage.icon + ' ' + escapeHtml(stage.label) + '</span>' : '') +
      '<h3>' + escapeHtml(j.judul) + '</h3>' +
      '<div class="meta">' + (j.waktu ? escapeHtml(j.waktu) + ' · ' : '') + escapeHtml(j.tempat || '') + '</div>' +
      (j.catatan ? '<p>' + escapeHtml(j.catatan) + '</p>' : '') +
      '</div></div>';
  }

  let html = '';
  if (akanDatang.length) {
    html += '<h3 class="jadwal-subhead">Akan Datang</h3><div class="jadwal-group">' + akanDatang.map(itemHtml).join('') + '</div>';
  }
  if (telahLewat.length) {
    html += '<h3 class="jadwal-subhead jadwal-subhead-past">Telah Lewat</h3><div class="jadwal-group jadwal-group-past">' + telahLewat.map(itemHtml).join('') + '</div>';
  }
  wrap.innerHTML = html;
  observeReveal();
}

function refreshCarousel(id) {
  const track = document.getElementById(id);
  if (!track) return;
  const wrap = track.closest('.carousel');
  if (!wrap) return;
  const prevBtn = wrap.querySelector('.carousel-prev');
  const nextBtn = wrap.querySelector('.carousel-next');
  const scrollable = track.scrollWidth > track.clientWidth + 4;
  wrap.classList.toggle('has-overflow', scrollable);
  if (prevBtn) prevBtn.disabled = track.scrollLeft <= 2;
  if (nextBtn) nextBtn.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
}

function setupCarousel(id) {
  const track = document.getElementById(id);
  if (!track) return;
  const wrap = track.closest('.carousel');
  if (!wrap || wrap.dataset.carouselReady) return;
  wrap.dataset.carouselReady = '1';
  const prevBtn = wrap.querySelector('.carousel-prev');
  const nextBtn = wrap.querySelector('.carousel-next');
  if (prevBtn) prevBtn.addEventListener('click', function () {
    track.scrollBy({ left: -track.clientWidth * 0.85, behavior: 'smooth' });
  });
  if (nextBtn) nextBtn.addEventListener('click', function () {
    track.scrollBy({ left: track.clientWidth * 0.85, behavior: 'smooth' });
  });
  track.addEventListener('scroll', function () { refreshCarousel(id); });
  window.addEventListener('resize', function () { refreshCarousel(id); });
}

function renderProgram(list) {
  const wrap = document.getElementById('program-grid');
  setupCarousel('program-grid');
  if (!list.length) {
    wrap.innerHTML = '<div class="empty-state">Belum ada program kerja yang ditambahkan.</div>';
    refreshCarousel('program-grid');
    return;
  }
  wrap.innerHTML = list.map(function (p) {
    const statusClass = p.status === 'selesai' ? 'selesai' : '';
    const stage = SIKLUS_STAGES.find(function (s) { return s.key === p.tahapSiklus; });
    return '<div class="program-card reveal">' +
      '<span class="status-pill ' + statusClass + '">' + escapeHtml(p.status || 'berjalan') + '</span>' +
      (stage ? '<span class="status-pill stage-pill">' + stage.icon + ' ' + escapeHtml(stage.label) + '</span>' : '') +
      '<h3>' + escapeHtml(p.nama) + '</h3>' +
      '<p>' + escapeHtml(p.deskripsi || '') + '</p>' +
      '<div class="meta">' + escapeHtml(p.kategori || '') + (p.tanggal ? ' · ' + escapeHtml(String(p.tanggal)) : '') + '</div>' +
      '</div>';
  }).join('');
  observeReveal();
  refreshCarousel('program-grid');
}

const JENIS_ICON = { 'Modul Ajar': '📘', 'ATP': '🗺️', 'Asesmen': '✅', 'LKS': '📄', 'Media Ajar': '🎬' };

function renderSumberDaya(list) {
  const wrap = document.getElementById('sumberdaya-grid');
  setupCarousel('sumberdaya-grid');
  const cariEl = document.getElementById('sumberdayaCari');
  const jenisEl = document.getElementById('sumberdayaJenis');
  const kelasEl = document.getElementById('sumberdayaKelas');

  const jenisSet = Array.from(new Set(list.map(function (r) { return r.jenis; }).filter(Boolean))).sort();
  const kelasSet = Array.from(new Set(list.map(function (r) { return r.kelas; }).filter(Boolean))).sort();
  jenisEl.innerHTML = '<option value="">Semua jenis</option>' + jenisSet.map(function (j) { return '<option value="' + escapeHtml(j) + '">' + escapeHtml(j) + '</option>'; }).join('');
  kelasEl.innerHTML = '<option value="">Semua kelas</option>' + kelasSet.map(function (k) { return '<option value="' + escapeHtml(k) + '">' + escapeHtml(k) + '</option>'; }).join('');

  function draw() {
    const q = cariEl.value.trim().toLowerCase();
    const jenisFilter = jenisEl.value;
    const kelasFilter = kelasEl.value;
    const filtered = list.filter(function (r) {
      const matchQ = !q || (r.judul || '').toLowerCase().indexOf(q) !== -1 || (r.mapel || '').toLowerCase().indexOf(q) !== -1;
      const matchJenis = !jenisFilter || r.jenis === jenisFilter;
      const matchKelas = !kelasFilter || r.kelas === kelasFilter;
      return matchQ && matchJenis && matchKelas;
    });

    if (!filtered.length) {
      wrap.innerHTML = '<div class="empty-state">' + (list.length ? 'Tidak ada sumber daya yang cocok dengan pencarian.' : 'Belum ada sumber daya yang dibagikan. Admin bisa menambahkan lewat panel admin.') + '</div>';
      refreshCarousel('sumberdaya-grid');
      return;
    }
    wrap.innerHTML = filtered.map(function (r) {
      const icon = JENIS_ICON[r.jenis] || '📎';
      const downloadBtn = r.fileUrl
        ? '<a href="' + r.fileUrl + '" target="_blank" rel="noopener" class="btn btn-teal btn-sm">Unduh</a>'
        : '<span class="meta">Tautan belum ditambahkan</span>';
      return '<div class="sumberdaya-card reveal">' +
        '<div class="sumberdaya-icon">' + icon + '</div>' +
        '<div class="sumberdaya-body">' +
        '<span class="status-pill">' + escapeHtml(r.jenis || '') + '</span>' +
        '<h3>' + escapeHtml(r.judul) + '</h3>' +
        '<p>' + escapeHtml(r.keterangan || '') + '</p>' +
        '<div class="meta">' + escapeHtml(r.mapel || '') + (r.kelas ? ' · ' + escapeHtml(r.kelas) : '') + (r.pengunggah ? ' · oleh ' + escapeHtml(r.pengunggah) : '') + '</div>' +
        '<div class="sumberdaya-action">' + downloadBtn + '</div>' +
        '</div></div>';
    }).join('');
    observeReveal();
    refreshCarousel('sumberdaya-grid');
  }

  cariEl.addEventListener('input', draw);
  jenisEl.addEventListener('change', draw);
  kelasEl.addEventListener('change', draw);
  draw();
}

function renderNotulen(list) {
  const wrap = document.getElementById('notulen-list');
  if (!list.length) {
    wrap.innerHTML = '<div class="empty-state">Belum ada notulen pertemuan yang dipublikasikan.</div>';
    return;
  }
  const sorted = list.slice().sort(function (a, b) { return String(b.tanggal).localeCompare(String(a.tanggal)); });
  wrap.innerHTML = sorted.map(function (n) {
    const stage = SIKLUS_STAGES.find(function (s) { return s.key === n.tahap; });
    return '<article class="notulen-card reveal">' +
      '<div class="notulen-head">' +
      (stage ? '<span class="status-pill stage-pill">' + stage.icon + ' ' + escapeHtml(stage.label) + '</span>' : '') +
      '<span class="meta">' + escapeHtml(formatTanggal(n.tanggal)) + '</span>' +
      '</div>' +
      '<h3>' + escapeHtml(n.judul) + '</h3>' +
      (n.pemimpin ? '<div class="notulen-row"><strong>Pemimpin rapat:</strong> ' + escapeHtml(n.pemimpin) + '</div>' : '') +
      (n.pesertaHadir ? '<div class="notulen-row"><strong>Peserta hadir:</strong> ' + escapeHtml(n.pesertaHadir) + '</div>' : '') +
      (n.ringkasanDiskusi ? '<div class="notulen-row"><strong>Ringkasan diskusi:</strong> ' + escapeHtml(n.ringkasanDiskusi) + '</div>' : '') +
      (n.kesepakatan ? '<div class="notulen-row notulen-kesepakatan"><strong>Kesepakatan / tindak lanjut:</strong> ' + escapeHtml(n.kesepakatan) + '</div>' : '') +
      '</article>';
  }).join('');
  observeReveal();
}

function renderJurnal(list) {
  const wrap = document.getElementById('jurnal-grid');
  setupCarousel('jurnal-grid');
  if (!list.length) {
    wrap.innerHTML = '<div class="empty-state">Belum ada jurnal mengajar yang dipublikasikan.</div>';
    refreshCarousel('jurnal-grid');
    return;
  }
  wrap.innerHTML = list.map(function (j) {
    const bg = j.thumbnailUrl ? 'style="background-image:url(\'' + j.thumbnailUrl + '\')"' : '';
    return '<article class="jurnal-card reveal">' +
      '<div class="jurnal-thumb" ' + bg + '><span>' + escapeHtml(formatTanggal(j.tanggal)) + '</span></div>' +
      '<div class="jurnal-body">' +
      '<h3>' + escapeHtml(j.judul) + '</h3>' +
      '<p>' + escapeHtml(j.ringkasan || '') + '</p>' +
      '<div class="byline">' + escapeHtml(j.penulis || '') + '</div>' +
      '</div></article>';
  }).join('');
  observeReveal();
  refreshCarousel('jurnal-grid');
}

function renderGaleri(list) {
  const wrap = document.getElementById('galeri-grid');
  setupCarousel('galeri-grid');
  if (!list.length) {
    wrap.innerHTML = '<div class="empty-state">Galeri kegiatan akan tampil di sini setelah admin menambahkan foto.</div>';
    refreshCarousel('galeri-grid');
    return;
  }
  wrap.innerHTML = list.map(function (g) {
    return '<figure class="galeri-item reveal"><img src="' + g.url + '" alt="' + escapeHtml(g.judul || 'Kegiatan BERANI') + '" loading="lazy">' +
      '<figcaption>' + escapeHtml(g.keterangan || g.judul || '') + '</figcaption></figure>';
  }).join('');
  observeReveal();
  refreshCarousel('galeri-grid');
}

function renderKontak(kontak) {
  const list = document.getElementById('kontak-list');
  list.innerHTML =
    '<li><span class="tag">Alamat</span>' + escapeHtml(kontak.alamat || '') + '</li>' +
    '<li><span class="tag">Email</span>' + escapeHtml(kontak.email || '') + '</li>' +
    '<li><span class="tag">WhatsApp</span>' + escapeHtml(kontak.whatsapp || '') + '</li>' +
    '<li><span class="tag">Instagram</span>' + escapeHtml(kontak.instagram || '') + '</li>' +
    (kontak.youtube ? '<li><span class="tag">YouTube</span><a href="' + kontak.youtube + '" target="_blank" rel="noopener">' + escapeHtml(kontak.youtube) + '</a></li>' : '') +
    (kontak.tiktok ? '<li><span class="tag">TikTok</span><a href="' + kontak.tiktok + '" target="_blank" rel="noopener">' + escapeHtml(kontak.tiktok) + '</a></li>' : '');

  document.getElementById('heroCardAlamat').textContent = kontak.alamat || '—';
  document.getElementById('heroCardEmail').textContent = kontak.email || '—';
  document.getElementById('heroCardWhatsapp').textContent = kontak.whatsapp || '—';
}

function formatTanggal(t) {
  if (!t) return '';
  const d = new Date(t);
  if (isNaN(d)) return String(t);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function observeReveal() {
  const els = document.querySelectorAll('.reveal:not(.is-visible)');
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  els.forEach(function (el) { io.observe(el); });
}

function setupNav() {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  toggle.addEventListener('click', function () { links.classList.toggle('is-open'); });
  links.querySelectorAll('a:not(.dropdown-menu a)').forEach(function (a) {
    a.addEventListener('click', function () { links.classList.remove('is-open'); });
  });
  links.querySelectorAll('.dropdown-menu a').forEach(function (a) {
    a.addEventListener('click', function () {
      links.classList.remove('is-open');
      document.querySelectorAll('.nav-dropdown.is-open').forEach(function (d) { d.classList.remove('is-open'); });
    });
  });

  document.querySelectorAll('.nav-dropdown').forEach(function (dropdown) {
    const btn = dropdown.querySelector('.dropdown-toggle');
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      const wasOpen = dropdown.classList.contains('is-open');
      document.querySelectorAll('.nav-dropdown.is-open').forEach(function (d) { d.classList.remove('is-open'); });
      if (!wasOpen) dropdown.classList.add('is-open');
    });
  });
  document.addEventListener('click', function () {
    document.querySelectorAll('.nav-dropdown.is-open').forEach(function (d) { d.classList.remove('is-open'); });
  });
}

(async function init() {
  document.getElementById('brandNama').textContent = BERANI_CONFIG.NAMA_ORGANISASI;
  document.getElementById('brandSekolah').textContent = BERANI_CONFIG.NAMA_SEKOLAH;
  document.getElementById('year').textContent = new Date().getFullYear();
  if (BERANI_CONFIG.LOGO_URL) {
    // Tampilan awal sebelum data Profil selesai dimuat — akan ditimpa
    // renderProfil() dengan Profil.fotoUrl begitu data tersedia.
    document.getElementById('brandLogo').src = BERANI_CONFIG.LOGO_URL;
    document.getElementById('heroEmblem').src = BERANI_CONFIG.LOGO_URL;
  }
  document.getElementById('heroCardSub').textContent = BERANI_CONFIG.NAMA_SEKOLAH;

  setupNav();
  renderSpineAndPillars();

  const data = await fetchBerani();
  renderProfil(data.profil || {});
  renderAnggota(data.anggota || []);
  renderSiklus(data.siklus || []);
  renderJadwal(data.jadwal || []);
  renderNotulen(data.notulen || []);
  renderProgram(data.program || []);
  renderSumberDaya(data.sumberdaya || []);
  renderJurnal(data.jurnal || []);
  renderGaleri(data.galeri || []);
  renderKontak(data.kontak || {});
  observeReveal();
})();
