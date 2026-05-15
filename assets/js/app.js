/**
 * Sistem Kuis Dinamis v2.0
 * Mengontrol pemuatan data paket soal via JSON dan merender halaman berdasarkan Peran (Siswa/Pengajar).
 * Didesain untuk modularitas dan kemudahan maintenance.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Init URL Parameters
  const params = new URLSearchParams(window.location.search);
  const paketId = params.get("paket");
  const role = params.get("role") || "siswa"; // default: siswa

  if (!paketId) {
    // Jika parameter paket kosong, redirect ke index landing page
    window.location.href = "index.html";
    return;
  }

  // Mulai proses memuat data paket soal
  loadQuizSystem(paketId, role);
});

let quizData = [];
let currentQuestionIndex = 0;
let score = 0;
let hasAnswered = false;
let isQuizActive = false; // Track jika kuis interaktif sedang aktif

const icons = {
  correct: `<svg class="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
  wrong: `<svg class="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
};

const alphabet = ["A", "B", "C", "D", "E"];

/**
 * Mengunduh paket manifest dan dataset pertanyaan
 */
async function loadQuizSystem(paketId, role) {
  const container = document.getElementById("app-container");
  const loadingOverlay = document.getElementById("loading-overlay");

  try {
    // 1. Muat manifes paket soal
    const packagesResp = await fetch("data/packages.json");
    const packages = await packagesResp.json();

    const activePackage = packages.find((p) => p.id === paketId);

    if (!activePackage) {
      throw new Error("Paket soal tidak ditemukan di sistem.");
    }

    // Update info judul di header tab
    document.title = `${activePackage.title} - US Informatika`;
    
    // Update Judul di Start Screen / Page Header jika ada
    const titleElems = document.querySelectorAll(".dynamic-pkg-title");
    titleElems.forEach(el => el.textContent = activePackage.title);

    // 2. Muat berkas soal JSON yang bersangkutan
    const quizResp = await fetch(activePackage.file);
    quizData = await quizResp.json();

    // Hilangkan loading screen
    if (loadingOverlay) {
      loadingOverlay.classList.add("opacity-0");
      setTimeout(() => loadingOverlay.classList.add("hidden"), 300);
    }

    // 3. Inisialisasi Mode Tampilan berdasarkan peran (role)
    if (role === "pengajar") {
      initializeInstructorView(activePackage);
    } else {
      initializeStudentView(activePackage);
    }

  } catch (error) {
    console.error("Gagal memuat sistem kuis:", error);
    if (container) {
      container.innerHTML = `
        <div class="min-h-screen flex items-center justify-center bg-slate-50 px-4">
          <div class="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center border border-red-100">
            <div class="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <h3 class="text-xl font-bold text-slate-800 mb-2">Terjadi Kesalahan</h3>
            <p class="text-slate-600 mb-6">${error.message || "Gagal terhubung ke pangkalan data soal."}</p>
            <a href="index.html" class="inline-block w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-6 rounded-xl transition duration-200">
              Kembali ke Beranda
            </a>
          </div>
        </div>
      `;
    }
  }
}

// ==========================================
// MODE SISWA (STUDENT VIEW ENGINE)
// ==========================================

function initializeStudentView(pkgInfo) {
  // Menampilkan layout mode siswa, menyembunyikan layout pengajar
  document.getElementById("student-layout").classList.remove("hidden");
  document.getElementById("instructor-layout")?.classList.add("hidden");

  // Binding Aksi Tombol Mulai
  const startBtn = document.getElementById("start-btn");
  if (startBtn) {
    startBtn.onclick = startQuiz;
  }

  const nextBtn = document.getElementById("next-btn");
  if (nextBtn) {
    nextBtn.onclick = nextQuestion;
  }
}

function startQuiz() {
  isQuizActive = true; // Tandai kuis sedang berlangsung
  document.getElementById("start-screen").classList.add("hidden");
  document.getElementById("quiz-screen").classList.remove("hidden");
  document.getElementById("score-display")?.classList.remove("hidden");
  loadQuestion();
}

function loadQuestion() {
  hasAnswered = false;
  const q = quizData[currentQuestionIndex];

  // DOM Elements Binding
  const el = {
    qText: document.getElementById("question-text"),
    oContainer: document.getElementById("options-container"),
    qNum: document.getElementById("question-number"),
    qCat: document.getElementById("question-category"),
    progBar: document.getElementById("progress-bar"),
    fbContainer: document.getElementById("feedback-container"),
    fbTitle: document.getElementById("feedback-title"),
    fbText: document.getElementById("feedback-text"),
    fbIcon: document.getElementById("feedback-icon"),
    nextBtn: document.getElementById("next-btn"),
  };

  // Render Teks Soal & Progress
  el.qNum.textContent = `Soal ${currentQuestionIndex + 1} dari ${quizData.length}`;
  el.qCat.textContent = q.c;
  el.progBar.style.width = `${(currentQuestionIndex / quizData.length) * 100}%`;
  el.qText.innerHTML = q.q;

  // Reset Tampilan Feedback
  el.fbContainer.classList.add("hidden");
  el.fbContainer.classList.remove(
    "slide-up",
    "bg-green-50",
    "bg-red-50",
    "border-green-200",
    "border-red-200"
  );
  el.nextBtn.classList.add("hidden");

  // Render Opsi Jawaban
  el.oContainer.innerHTML = "";
  q.o.forEach((optText, index) => {
    const btn = document.createElement("button");
    btn.className = `option-btn w-full text-left p-4 rounded-xl border-2 border-slate-200 bg-white flex items-start text-slate-700 font-medium shadow-sm transition-all duration-200`;
    btn.onclick = () => selectOption(index, btn);
    btn.innerHTML = `
      <span class="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 font-bold mr-4">${alphabet[index]}</span>
      <span class="pt-1">${optText}</span>
      <span class="ml-auto result-icon"></span>
    `;
    el.oContainer.appendChild(btn);
  });
}

function selectOption(selectedIndex, selectedBtn) {
  if (hasAnswered) return; // Kunci input setelah memilih
  hasAnswered = true;

  const q = quizData[currentQuestionIndex];
  const isCorrect = selectedIndex === q.a;
  
  const oContainer = document.getElementById("options-container");
  const allBtns = oContainer.querySelectorAll("button");

  // Update status visual semua tombol jawaban
  allBtns.forEach((btn, index) => {
    btn.classList.add("option-disabled");
    btn.disabled = true;

    const iconSpan = btn.querySelector(".result-icon");
    const letterSpan = btn.querySelector("span:first-child");

    if (index === q.a) {
      // Jawaban yang Benar
      btn.classList.remove("option-disabled");
      btn.classList.add("option-correct");
      letterSpan.className = "w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg bg-green-200 text-green-800 font-bold mr-4";
      iconSpan.innerHTML = icons.correct;
    } else if (index === selectedIndex && !isCorrect) {
      // Pilihan siswa yang Salah
      btn.classList.add("option-wrong");
      letterSpan.className = "w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg bg-red-200 text-red-800 font-bold mr-4";
      iconSpan.innerHTML = icons.wrong;
    }
  });

  // Hitung dan Animasi Skor
  if (isCorrect) {
    score++;
    const currScoreEl = document.getElementById("current-score");
    if (currScoreEl) {
      currScoreEl.textContent = score;
      currScoreEl.classList.add("scale-150", "transition-transform");
      setTimeout(() => currScoreEl.classList.remove("scale-150"), 300);
    }
  }

  // Render Kotak Feedback/Penjelasan
  const fb = {
    container: document.getElementById("feedback-container"),
    icon: document.getElementById("feedback-icon"),
    title: document.getElementById("feedback-title"),
    text: document.getElementById("feedback-text"),
    nextBtn: document.getElementById("next-btn"),
  };

  fb.icon.innerHTML = isCorrect ? icons.correct : icons.wrong;
  fb.title.textContent = isCorrect ? "Jawaban Anda Tepat!" : "Jawaban Kurang Tepat";
  fb.title.className = isCorrect ? "text-lg font-bold text-green-800" : "text-lg font-bold text-red-800";
  
  fb.container.classList.add(isCorrect ? "bg-green-50" : "bg-red-50");
  fb.container.classList.add(isCorrect ? "border-green-200" : "border-red-200");
  fb.text.innerHTML = q.e;

  fb.container.classList.remove("hidden");
  
  // Trigger reflow untuk memancing animasi slide-up
  void fb.container.offsetWidth;
  fb.container.classList.add("slide-up");

  // Tombol Lanjut
  fb.nextBtn.classList.remove("hidden");
  if (currentQuestionIndex === quizData.length - 1) {
    fb.nextBtn.querySelector("span").textContent = "Lihat Hasil Akhir";
  }

  fb.nextBtn.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function nextQuestion() {
  if (currentQuestionIndex < quizData.length - 1) {
    currentQuestionIndex++;
    loadQuestion();
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    showResult();
  }
}

function showResult() {
  isQuizActive = false; // Matikan state aktif agar tombol back bebas berfungsi
  document.getElementById("quiz-screen").classList.add("hidden");
  document.getElementById("score-display")?.classList.add("hidden");
  document.getElementById("result-screen").classList.remove("hidden");

  const finalScoreElem = document.getElementById("final-score-text");
  const iconElem = document.getElementById("final-icon");

  document.getElementById("correct-count").textContent = score;
  document.getElementById("wrong-count").textContent = quizData.length - score;

  // Jalankan animasi penghitungan nilai akhir
  animateValue(finalScoreElem, 0, score, 1500);

  // Tentukan warna lingkaran ikon ringkasan nilai
  if (score >= 80) {
    iconElem.className = "w-32 h-32 rounded-full flex items-center justify-center mb-6 border-8 border-green-400 text-green-500 bg-green-50";
  } else if (score >= 60) {
    iconElem.className = "w-32 h-32 rounded-full flex items-center justify-center mb-6 border-8 border-yellow-400 text-yellow-500 bg-yellow-50";
  } else {
    iconElem.className = "w-32 h-32 rounded-full flex items-center justify-center mb-6 border-8 border-red-400 text-red-500 bg-red-50";
  }
}

function animateValue(obj, start, end, duration) {
  if (!obj) return;
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    obj.innerHTML = Math.floor(progress * (end - start) + start);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

// ==========================================
// KONTROL NAVIGASI KEMBALI & MODAL KELUAR
// ==========================================

function handleGoBack() {
  // Jika siswa sedang ditengah-tengah pengerjaan kuis
  if (isQuizActive) {
    toggleExitModal(true);
  } else {
    // Jika belum mulai atau sudah melihat hasil
    window.location.href = "index.html";
  }
}

function toggleExitModal(show) {
  const modal = document.getElementById("exit-confirm-modal");
  const modalBox = document.getElementById("exit-modal-box");
  
  if (!modal || !modalBox) return;

  if (show) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    
    // Picu delay mikro untuk transisi visual
    setTimeout(() => {
      modal.classList.remove("opacity-0");
      modalBox.classList.remove("scale-95");
      modalBox.classList.add("scale-100");
    }, 20);
  } else {
    modal.classList.add("opacity-0");
    modalBox.classList.remove("scale-100");
    modalBox.classList.add("scale-95");
    
    // Sembunyikan kontainer setelah transisi memudar selesai
    setTimeout(() => {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }, 200);
  }
}

// ==========================================
// MODE PENGAJAR (INSTRUCTOR VIEW ENGINE)
// ==========================================

function initializeInstructorView(pkgInfo) {
  // Tampilkan layout mode pengajar, hilangkan mode siswa
  document.getElementById("student-layout").classList.add("hidden");
  const instLayout = document.getElementById("instructor-layout");
  instLayout.classList.remove("hidden");

  // Render Detail Info Header di Panel
  const packageInfoDisplay = document.getElementById("instructor-package-info");
  if (packageInfoDisplay) {
    packageInfoDisplay.textContent = `${pkgInfo.title} (${pkgInfo.questionCount} Butir Soal)`;
  }

  // Mulai Render Grid Soal & Kunci Jawaban
  renderInstructorGrid();
}

function renderInstructorGrid() {
  const listContainer = document.getElementById("questions-list-container");
  if (!listContainer) return;

  listContainer.innerHTML = ""; // Reset konten container

  quizData.forEach((q, index) => {
    // Membuat DOM Node Soal per butir
    const qBlock = document.createElement("div");
    qBlock.className = "bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden break-inside-avoid page-break-inside-avoid print:shadow-none print:border-slate-300 mb-6";
    
    // HTML Layout untuk Detail Soal, Pilihan (dengan kunci jawaban disorot), dan Penjelasan
    let optionsHTML = "";
    q.o.forEach((opt, optIdx) => {
      const isCorrect = optIdx === q.a;
      // Jika ini kunci jawaban, tambahkan style penanda hijau yang ramah print
      const optClass = isCorrect 
        ? "bg-emerald-50 border-emerald-200 text-emerald-900 font-medium ring-2 ring-emerald-500 ring-opacity-50 print:bg-green-100 print:border-green-300" 
        : "bg-slate-50 border-slate-100 text-slate-600 print:bg-white";
      
      const badgeClass = isCorrect
        ? "bg-emerald-500 text-white print:bg-green-600"
        : "bg-slate-200 text-slate-500 print:bg-slate-200";

      optionsHTML += `
        <div class="flex items-start p-3 rounded-lg border ${optClass} transition duration-150">
          <span class="w-6 h-6 flex-shrink-0 flex items-center justify-center text-xs font-bold rounded-md ${badgeClass} mr-3">${alphabet[optIdx]}</span>
          <div class="text-sm">${opt}</div>
          ${isCorrect ? '<span class="ml-auto text-emerald-600 text-xs font-bold tracking-wider uppercase flex items-center"><svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg> KUNCI</span>' : ''}
        </div>
      `;
    });

    qBlock.innerHTML = `
      <div class="bg-slate-900 text-white px-6 py-3 flex flex-wrap items-center justify-between gap-2 print:bg-slate-100 print:text-slate-800 print:border-b print:border-slate-300">
        <div class="flex items-center gap-3">
          <span class="bg-white bg-opacity-20 text-white text-xs font-bold px-2.5 py-1 rounded print:bg-slate-800 print:text-white">BUTIR ${index + 1}</span>
          <span class="text-slate-300 text-xs uppercase tracking-wider font-semibold print:text-slate-700">${q.c}</span>
        </div>
      </div>
      
      <div class="p-6 space-y-5">
        <div class="text-slate-800 font-medium leading-relaxed question-body-text print:text-black">
          ${q.q}
        </div>
        
        <div class="grid grid-cols-1 gap-2 pt-2">
          ${optionsHTML}
        </div>
        
        <div class="mt-4 pt-4 border-t border-slate-100 bg-slate-50 bg-opacity-50 rounded-lg p-4 border-dashed print:bg-slate-50 print:border-slate-200">
          <div class="flex items-center text-slate-800 font-semibold text-sm mb-1 gap-1.5">
            <svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Penjelasan Jawaban:
          </div>
          <p class="text-xs text-slate-600 leading-relaxed italic print:text-slate-700">
            ${q.e}
          </p>
        </div>
      </div>
    `;
    
    listContainer.appendChild(qBlock);
  });
}
