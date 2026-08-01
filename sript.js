// ==========================================
// 1. SISTEM TEMA GELAP (DARK MODE)
// ==========================================
const htmlElement = document.documentElement;
const btnTheme = document.getElementById('btn-theme');

if (localStorage.getItem('theme') === 'dark') {
    htmlElement.classList.add('dark');
}

if (btnTheme) {
    btnTheme.addEventListener('click', () => {
        htmlElement.classList.toggle('dark');
        if (htmlElement.classList.contains('dark')) {
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }
        // Muat ulang halaman agar warna grafik menyesuaikan mode gelap/terang
        location.reload();
    });
}

// ==========================================
// 2. INISIALISASI DATA & STREAK
// ==========================================
let pythonData = JSON.parse(localStorage.getItem('pythonData')) || [];
let englishData = JSON.parse(localStorage.getItem('englishData')) || [];
let lastStudyDate = localStorage.getItem('lastStudyDate');
let currentStreak = parseInt(localStorage.getItem('currentStreak')) || 0;

const pyCountIndex = document.getElementById('python-count');
const engCountIndex = document.getElementById('english-count');
if (pyCountIndex) pyCountIndex.textContent = pythonData.length;
if (engCountIndex) engCountIndex.textContent = englishData.length;

function checkAndUpdateStreak() {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    if (!lastStudyDate) return; 
    const lastDate = new Date(lastStudyDate);
    lastDate.setHours(0, 0, 0, 0);
    const diffTime = Math.abs(today - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    if (diffDays > 1) {
        currentStreak = 0;
        localStorage.setItem('currentStreak', currentStreak);
    }
}

function recordStudySession() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let lastDate = lastStudyDate ? new Date(lastStudyDate) : null;
    if (lastDate) lastDate.setHours(0, 0, 0, 0);
    if (!lastDate || today.getTime() !== lastDate.getTime()) {
        currentStreak += 1;
        localStorage.setItem('currentStreak', currentStreak);
        localStorage.setItem('lastStudyDate', new Date().toISOString());
    }
}

function recordActivityHistory() {
    let historyLogs = JSON.parse(localStorage.getItem('historyLogs')) || [];
    const todayIso = new Date().toISOString().split('T')[0];
    if (!historyLogs.includes(todayIso)) {
        historyLogs.push(todayIso);
        localStorage.setItem('historyLogs', JSON.stringify(historyLogs));
    }
}

checkAndUpdateStreak();

const streakCountElement = document.getElementById('streak-count');
if (streakCountElement) {
    streakCountElement.textContent = currentStreak;
}

// ==========================================
// 3. FITUR KALENDER, GRAFIK AKTIVITAS & PIE CHART
// ==========================================
const calendarDays = document.getElementById('calendar-days');
const calendarMonthText = document.getElementById('calendar-month');
if (calendarDays && calendarMonthText) {
    const date = new Date();
    const currentMonth = date.getMonth();
    const currentYear = date.getFullYear();
    const currentDate = date.getDate();

    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    calendarMonthText.textContent = `${monthNames[currentMonth]} ${currentYear}`;

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    let daysHTML = '';

    for (let i = 0; i < firstDay; i++) daysHTML += `<div></div>`;
    for (let i = 1; i <= daysInMonth; i++) {
        if (i < currentDate) daysHTML += `<div class="py-1 text-slate-300 dark:text-slate-600 line-through decoration-slate-300">${i}</div>`;
        else if (i === currentDate) daysHTML += `<div class="py-1 bg-amber-500 text-white font-bold rounded-lg shadow-sm">${i}</div>`;
        else daysHTML += `<div class="py-1 text-slate-600 dark:text-slate-400 font-medium">${i}</div>`;
    }
    calendarDays.innerHTML = daysHTML;
}

const activityChart = document.getElementById('activity-chart');
if (activityChart) {
    let historyLogs = JSON.parse(localStorage.getItem('historyLogs')) || [];
    let chartHTML = '';
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateString = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        const isoDate = d.toISOString().split('T')[0];
        const hasStudied = historyLogs.includes(isoDate);
        const boxColor = hasStudied ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-700 text-slate-400';
        
        chartHTML += `
            <div class="flex-1 flex flex-col items-center">
                <div class="w-full h-10 rounded-lg ${boxColor} flex items-center justify-center text-xs font-bold transition-all">
                    ${hasStudied ? '✓' : ''}
                </div>
                <span class="text-[10px] text-slate-400 mt-1">${dateString.split(' ')[0]}</span>
            </div>
        `;
    }
    activityChart.innerHTML = chartHTML;
}

// Inisialisasi Chart.js (Grafik Lingkaran Perbandingan)
const canvasCtx = document.getElementById('categoryChart');
if (canvasCtx) {
    const isDark = htmlElement.classList.contains('dark');
    new Chart(canvasCtx, {
        type: 'doughnut', // Model donat agar lebih modern
        data: {
            labels: ['Python Log', 'English Log'],
            datasets: [{
                data: [pythonData.length, englishData.length],
                backgroundColor: ['#3b82f6', '#ef4444'], // Biru (Python) & Merah (English)
                borderWidth: isDark ? 0 : 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: isDark ? '#cbd5e1' : '#475569',
                        font: { weight: 'bold', size: 12 }
                    }
                }
            }
        }
    });
}

// ==========================================
// 4. FITUR BOOKMARK & EXPORT/IMPORT DATA
// ==========================================
const bookmarkList = document.getElementById('bookmark-list');
if (bookmarkList) {
    let bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [
        { title: "Python Docs", url: "https://docs.python.org/3/" },
        { title: "TryHackMe", url: "https://tryhackme.com/" }
    ];

    function renderBookmarks() {
        bookmarkList.innerHTML = '';
        if (bookmarks.length === 0) {
            bookmarkList.innerHTML = '<span class="text-xs text-slate-400 italic">Belum ada bookmark tersimpan.</span>';
            return;
        }
        bookmarks.forEach((bm, idx) => {
            bookmarkList.innerHTML += `
                <div class="group relative inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-slate-600 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors">
                    <a href="${bm.url}" target="_blank" class="hover:text-blue-600">${bm.title} ↗</a>
                    <button onclick="deleteBookmark(${idx})" class="text-slate-400 hover:text-red-500 ml-1 font-bold">×</button>
                </div>
            `;
        });
    }

    window.deleteBookmark = function(index) {
        bookmarks.splice(index, 1);
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
        renderBookmarks();
    }

    const btnAddBm = document.getElementById('btn-add-bm');
    const bmTitle = document.getElementById('bm-title');
    const bmUrl = document.getElementById('bm-url');

    btnAddBm.addEventListener('click', () => {
        if (!bmTitle.value || !bmUrl.value) return alert("Isi judul dan URL link!");
        bookmarks.push({ title: bmTitle.value, url: bmUrl.value });
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
        bmTitle.value = ''; bmUrl.value = '';
        renderBookmarks();
    });

    renderBookmarks();
}

const btnExport = document.getElementById('btn-export');
const btnImport = document.getElementById('btn-import');
if (btnExport) {
    btnExport.addEventListener('click', () => {
        const dataToSave = { python: pythonData, english: englishData, streak: currentStreak, lastDate: lastStudyDate };
        const blob = new Blob([JSON.stringify(dataToSave)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Backup_Learning_Tracker.json`;
        a.click();
    });
}
if (btnImport) {
    btnImport.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const importedData = JSON.parse(event.target.result);
                if(importedData.python) localStorage.setItem('pythonData', JSON.stringify(importedData.python));
                if(importedData.english) localStorage.setItem('englishData', JSON.stringify(importedData.english));
                if(importedData.streak !== undefined) localStorage.setItem('currentStreak', importedData.streak);
                if(importedData.lastDate) localStorage.setItem('lastStudyDate', importedData.lastDate);
                alert("Berhasil memulihkan data! Halaman akan dimuat ulang.");
                location.reload();
            } catch(err) {
                alert("File backup tidak valid!");
            }
        };
        reader.readAsText(file);
    });
}

window.deleteItem = function(type, index) {
    if(!confirm("Yakin ingin menghapus catatan ini?")) return;
    if(type === 'python') {
        pythonData.splice(index, 1);
        localStorage.setItem('pythonData', JSON.stringify(pythonData));
        renderPython(document.getElementById('search-python')?.value || '');
    } else {
        englishData.splice(index, 1);
        localStorage.setItem('englishData', JSON.stringify(englishData));
        renderEnglish();
    }
}

// ==========================================
// 5. LOGIKA HALAMAN PYTHON
// ==========================================
const pythonContainer = document.getElementById('python-container');
const searchPython = document.getElementById('search-python');

function renderPython(filterText = '') {
    if (!pythonContainer) return;
    pythonContainer.innerHTML = '';
    
    const filteredData = pythonData.filter(item => 
        item.title.toLowerCase().includes(filterText.toLowerCase()) || 
        item.note.toLowerCase().includes(filterText.toLowerCase())
    );

    const statsPy = document.getElementById('stats-python');
    if(statsPy) statsPy.textContent = pythonData.length;

    if (filteredData.length === 0) {
        pythonContainer.innerHTML = '<p class="text-slate-400 col-span-full">Tidak ada catatan ditemukan.</p>';
        return;
    }
    
    filteredData.forEach((item) => {
        const realIndex = pythonData.findIndex(p => p.title === item.title && p.note === item.note);
        const codeBlock = item.code ? `<div class="mt-4"><pre><code class="language-python">${item.code}</code></pre></div>` : '';
        
        pythonContainer.innerHTML += `
            <div class="bg-white dark:bg-slate-800 border border-blue-100 dark:border-slate-700 p-5 rounded-2xl shadow-sm relative group overflow-hidden">
                <button onclick="deleteItem('python', ${realIndex})" class="absolute top-4 right-4 text-slate-400 hover:text-red-500">🗑️</button>
                <h3 class="font-bold text-lg text-blue-900 dark:text-blue-300 mb-2">${item.title}</h3>
                <p class="text-slate-700 dark:text-slate-300">${item.note}</p>
                ${codeBlock}
                <span class="block text-xs text-slate-400 mt-4">🗓️ ${item.date}</span>
            </div>
        `;
    });
    if (window.Prism) Prism.highlightAll();
}

if (pythonContainer) {
    const btnSubmit = document.getElementById('btn-submit-python');
    const inputTitle = document.getElementById('input-title');
    const inputNote = document.getElementById('input-note');
    const inputCode = document.getElementById('input-code');

    btnSubmit.addEventListener('click', () => {
        if (!inputTitle.value) return alert("Isi judul topik!");
        pythonData.unshift({
            title: inputTitle.value,
            note: inputNote.value,
            code: inputCode ? inputCode.value : '',
            date: new Date().toLocaleDateString('id-ID')
        });
        localStorage.setItem('pythonData', JSON.stringify(pythonData));
        recordStudySession();
        recordActivityHistory();
        inputTitle.value = ''; inputNote.value = ''; if(inputCode) inputCode.value = '';
        renderPython(searchPython ? searchPython.value : '');
    });

    if(searchPython) {
        searchPython.addEventListener('input', (e) => renderPython(e.target.value));
    }
    renderPython();
}

// ==========================================
// 6. LOGIKA HALAMAN ENGLISH & MODE UJIAN
// ==========================================
const englishContainer = document.getElementById('english-container');
if (englishContainer) {
    const btnSubmit = document.getElementById('btn-submit-english');
    const inputTitle = document.getElementById('input-title');
    const inputNote = document.getElementById('input-note');

    function renderEnglish() {
        englishContainer.innerHTML = '';
        if (englishData.length === 0) {
            englishContainer.innerHTML = '<p class="text-slate-400 col-span-full text-center">Belum ada catatan.</p>';
            return;
        }
        englishData.forEach((item, index) => {
            englishContainer.innerHTML += `
                <div class="bg-white dark:bg-slate-800 border border-red-100 dark:border-slate-700 p-5 rounded-2xl shadow-sm relative group">
                    <button onclick="deleteItem('english', ${index})" class="absolute top-4 right-4 text-slate-400 hover:text-red-500">🗑️</button>
                    <h3 class="font-bold text-lg text-red-900 dark:text-red-300 mb-2">${item.title}</h3>
                    <p class="text-slate-700 dark:text-slate-300 mb-4">${item.note}</p>
                    <span class="text-xs text-slate-400">🗓️ ${item.date}</span>
                </div>
            `;
        });
    }

    btnSubmit.addEventListener('click', () => {
        if (!inputTitle.value || !inputNote.value) return alert("Isi form dengan lengkap!");
        englishData.unshift({
            title: inputTitle.value,
            note: inputNote.value,
            date: new Date().toLocaleDateString('id-ID')
        });
        localStorage.setItem('englishData', JSON.stringify(englishData));
        recordStudySession();
        recordActivityHistory();
        inputTitle.value = ''; inputNote.value = '';
        renderEnglish();
    });
    renderEnglish();

    const bankSoal = [
        {
            q: "Neither the teacher nor the students _____ present at the seminar yesterday.",
            options: ["was", "were", "is", "are"],
            answer: "were",
            explanation: "Dalam aturan 'neither... nor', kata kerja disesuaikan dengan subjek terdekat (students = plural/jamak, jadi memakai 'were')."
        },
        {
            q: "She speaks English fluently, _____ she?",
            options: ["does", "doesn't", "is", "isn't"],
            answer: "doesn't",
            explanation: "Bentuk Question Tag. Kalimat utamanya positif ('speaks') & Present Simple, maka tag-nya menggunakan 'doesn't'."
        },
        {
            q: "If I _____ about the heavy traffic, I would have taken another route.",
            options: ["know", "knew", "had known", "have known"],
            answer: "had known",
            explanation: "Conditional Sentence Tipe 3. Rumus: If + Past Perfect (had + V3), would have + V3."
        },
        {
            q: "The new software update allows users _____ files much faster.",
            options: ["download", "to download", "downloading", "downloaded"],
            answer: "to download",
            explanation: "Kata kerja 'allow' diikuti objek dan to-infinitive (allow someone to do something)."
        }
    ];

    const btnExamMode = document.getElementById('btn-exam-mode');
    const normalView = document.getElementById('normal-view');
    const examView = document.getElementById('exam-view');
    const examQuestion = document.getElementById('exam-question');
    const examOptions = document.getElementById('exam-options');
    const examFeedback = document.getElementById('exam-feedback');
    const btnNextExam = document.getElementById('btn-next-exam');
    const examScoreEl = document.getElementById('exam-score');

    let isExamActive = false;
    let currentQuestionIndex = 0;
    let score = 0;
    let shuffledSoal = [];

    if (btnExamMode) {
        btnExamMode.addEventListener('click', () => {
            isExamActive = !isExamActive;
            if (isExamActive) {
                normalView.classList.add('hidden');
                examView.classList.remove('hidden');
                btnExamMode.textContent = "🔙 Kembali ke Catatan";
                btnExamMode.classList.replace('bg-amber-500', 'bg-slate-600');
                
                shuffledSoal = [...bankSoal].sort(() => Math.random() - 0.5);
                currentQuestionIndex = 0;
                score = 0;
                loadExamQuestion();
            } else {
                normalView.classList.remove('hidden');
                examView.classList.add('hidden');
                btnExamMode.textContent = "🎯 Buka Mode Ujian Random";
                btnExamMode.classList.replace('bg-slate-600', 'bg-amber-500');
            }
        });
    }

    function loadExamQuestion() {
        if (!examOptions) return;
        examOptions.innerHTML = '';
        examFeedback.classList.add('hidden');
        btnNextExam.classList.add('hidden');

        if (currentQuestionIndex >= shuffledSoal.length) {
            examQuestion.textContent = `🎉 Ujian Selesai! Skor Akhir Kamu: ${score} dari ${bankSoal.length * 10}`;
            examOptions.innerHTML = `<button onclick="location.reload()" class="py-3 bg-blue-600 text-white font-bold rounded-xl">Ulangi Ujian</button>`;
            return;
        }

        const current = shuffledSoal[currentQuestionIndex];
        examQuestion.textContent = `${currentQuestionIndex + 1}. ${current.q}`;
        examScoreEl.textContent = `Skor: ${score}`;

        current.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.textContent = opt;
            btn.className = "p-3 border dark:border-slate-700 rounded-xl font-medium text-slate-700 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-slate-700 transition-all text-left px-4";
            btn.onclick = () => checkAnswer(opt, current.answer, btn, current.explanation);
            examOptions.appendChild(btn);
        });
    }

    function checkAnswer(selected, correct, selectedBtn, explanation) {
        const allButtons = examOptions.querySelectorAll('button');
        allButtons.forEach(b => b.disabled = true);

        if (selected === correct) {
            selectedBtn.classList.replace('border', 'bg-green-100 border-green-500 text-green-800');
            score += 10;
            examFeedback.textContent = "✅ Benar! " + explanation;
            examFeedback.className = "p-4 rounded-xl mb-6 text-sm font-medium bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300";
        } else {
            selectedBtn.classList.replace('border', 'bg-red-100 border-red-500 text-red-800');
            allButtons.forEach(b => {
                if (b.textContent === correct) b.classList.replace('border', 'bg-green-100 border-green-500 text-green-800');
            });
            examFeedback.textContent = "❌ Kurang tepat. " + explanation;
            examFeedback.className = "p-4 rounded-xl mb-6 text-sm font-medium bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300";
        }

        examFeedback.classList.remove('hidden');
        btnNextExam.classList.remove('hidden');
        examScoreEl.textContent = `Skor: ${score}`;
    }

    if (btnNextExam) {
        btnNextExam.addEventListener('click', () => {
            currentQuestionIndex++;
            loadExamQuestion();
        });
    }
}