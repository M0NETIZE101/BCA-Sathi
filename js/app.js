// BCA Sathi — app logic
// Loads content from /data.json (admin-editable) with data.js as fallback.

const page = document.body.dataset.page;
const params = new URLSearchParams(location.search);

// ---------- State ----------
let BCA_DATA = { semesters: [] };

// ---------- Load data.json with fallback ----------
async function loadData() {
  try {
    const res = await fetch("/data.json", { cache: "no-cache" });
    if (!res.ok) throw new Error("data.json not found");
    const json = await res.json();
    if (!json || !Array.isArray(json.semesters)) throw new Error("Invalid data.json shape");
    BCA_DATA = json;
  } catch (err) {
    console.warn("[BCA Sathi] Falling back to data.js:", err.message);
    BCA_DATA = window.BCA_DATA_STATIC || { semesters: [] };
  }
}

// ---------- Helpers ----------
function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
}

function findSemester(id) {
  return BCA_DATA.semesters.find(s => String(s.id) === String(id));
}

function findSubject(semId, subjId) {
  const sem = findSemester(semId);
  return sem ? sem.subjects.find(s => s.id === subjId) : null;
}

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

// ---------- Shared: fill semester dropdown ----------
function fillDropdown() {
  const dd = document.getElementById("semesterDropdown");
  if (!dd) return;
  dd.innerHTML = "";
  BCA_DATA.semesters
    .slice()
    .sort((a, b) => a.id - b.id)
    .forEach(s => {
      const a = el("a", null, `Semester ${s.id}`);
      a.href = `semester.html?sem=${s.id}`;
      dd.appendChild(a);
    });
}

// ---------- HOME ----------
function renderHome() {
  const grid = document.getElementById("semesterGrid");
  if (!grid) return;
  grid.innerHTML = "";

  BCA_DATA.semesters
    .slice()
    .sort((a, b) => a.id - b.id)
    .forEach(s => {
      const card = el("a", "sem-card");
      card.href = `semester.html?sem=${s.id}`;
      const count = (s.subjects || []).length;
      card.innerHTML = `
        <div class="sem-number">${s.id}</div>
        <div class="sem-info">
          <h3>Semester ${s.id}</h3>
          <p>${escapeHtml(s.tagline || "")}</p>
          <span class="sem-count">${count} ${count === 1 ? "subject" : "subjects"}</span>
        </div>
      `;
      grid.appendChild(card);
    });
}

// ---------- SEMESTER ----------
function renderSemester() {
  const semId = params.get("sem");
  const sem = findSemester(semId);

  if (!sem) {
    document.getElementById("semTitle").textContent = "Semester not found";
    document.getElementById("bcSem").textContent = "Not found";
    return;
  }

  document.title = `Semester ${sem.id} — BCA Sathi`;
  document.getElementById("bcSem").textContent = `Semester ${sem.id}`;
  document.getElementById("semTitle").textContent =
    `Semester ${sem.id}${sem.tagline ? " — " + sem.tagline : ""}`;

  const grid = document.getElementById("subjectGrid");
  grid.innerHTML = "";

  const subjects = sem.subjects || [];
  if (subjects.length === 0) {
    grid.innerHTML = `<p class="empty">Subjects for this semester are being added. Check back soon.</p>`;
    return;
  }

  subjects.forEach(sub => {
    const card = el("div", "subject-card");
    const notesCount = (sub.notes || []).length;
    const papersCount = (sub.papers || []).length;
    card.innerHTML = `
      <div class="subj-head">
        <h3>${escapeHtml(sub.name)}</h3>
        ${sub.code ? `<span class="subj-code">${escapeHtml(sub.code)}</span>` : ""}
      </div>
      <div class="subj-links">
        <a class="chip chip-notes" href="subject.html?sem=${sem.id}&sub=${encodeURIComponent(sub.id)}#notes">📄 Notes (${notesCount})</a>
        <a class="chip chip-papers" href="subject.html?sem=${sem.id}&sub=${encodeURIComponent(sub.id)}#papers">📝 Papers (${papersCount})</a>
        <a class="chip chip-syllabus" href="subject.html?sem=${sem.id}&sub=${encodeURIComponent(sub.id)}#syllabus">📚 Syllabus</a>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ---------- SUBJECT ----------
function renderSubject() {
  const semId = params.get("sem");
  const subjId = params.get("sub");
  const sem = findSemester(semId);
  const sub = findSubject(semId, subjId);

  if (!sem || !sub) {
    document.getElementById("subjTitle").textContent = "Subject not found";
    document.getElementById("bcSubject").innerHTML =
      `<a href="index.html">Home</a> / <a href="semester.html?sem=${escapeHtml(semId || "")}">Semester</a> / <span>Not found</span>`;
    return;
  }

  document.title = `${sub.name} — BCA Sathi`;
  document.getElementById("bcSubject").innerHTML =
    `<a href="index.html">Home</a> / <a href="semester.html?sem=${sem.id}">Semester ${sem.id}</a> / <span>${escapeHtml(sub.name)}</span>`;
  document.getElementById("subjTitle").textContent = sub.name;
  document.getElementById("subjCode").textContent =
    sub.code ? `Subject Code: ${sub.code}` : "";

  const tabs = document.querySelectorAll(".tab");
  tabs.forEach(t => {
    t.addEventListener("click", () => {
      tabs.forEach(x => x.classList.remove("active"));
      t.classList.add("active");
      renderTab(t.dataset.tab, sub, sem);
    });
  });

  const initial = (location.hash || "#papers").replace("#", "");
  const tabBtn = document.querySelector(`.tab[data-tab="${initial}"]`) || tabs[0];
  tabBtn.click();
}

function renderTab(tab, sub, sem) {
  const c = document.getElementById("tabContent");
  c.innerHTML = "";

  if (tab === "papers") {
    const papers = sub.papers || [];
    if (papers.length === 0) {
      c.innerHTML = `<p class="empty">No past papers uploaded yet for this subject.</p>`;
      return;
    }
    [...papers].sort((a, b) => (b.year || 0) - (a.year || 0)).forEach(p => {
      const row = el("div", "resource-row");
      row.innerHTML = `
        <div><strong>${escapeHtml(p.year || "—")}</strong> <span class="muted">Board Exam</span></div>
        <div class="row-actions">
          <span class="muted">${p.sizeMB || "?"} MB</span>
          <a class="btn btn-sm" href="${escapeHtml(p.file)}" target="_blank" rel="noopener">Download PDF</a>
        </div>
      `;
      c.appendChild(row);
    });
  }

  if (tab === "notes") {
    const notes = sub.notes || [];
    if (notes.length === 0) {
      c.innerHTML = `<p class="empty">No notes uploaded yet for this subject.</p>`;
      return;
    }
    notes.forEach(n => {
      const row = el("div", "resource-row");
      row.innerHTML = `
        <div><strong>${escapeHtml(n.title || "Untitled")}</strong></div>
        <div class="row-actions">
          <span class="muted">${n.sizeMB || "?"} MB</span>
          <a class="btn btn-sm" href="${escapeHtml(n.file)}" target="_blank" rel="noopener">Download PDF</a>
        </div>
      `;
      c.appendChild(row);
    });
  }

  if (tab === "syllabus") {
    if (!sub.syllabus) {
      c.innerHTML = `<p class="empty">Syllabus not uploaded yet.</p>`;
      return;
    }
    c.innerHTML = `
      <div class="resource-row">
        <div><strong>Official TU Syllabus</strong></div>
        <div class="row-actions">
          <span class="muted">${sub.syllabus.sizeMB || "?"} MB</span>
          <a class="btn btn-sm" href="${escapeHtml(sub.syllabus.file)}" target="_blank" rel="noopener">Download PDF</a>
        </div>
      </div>
    `;
  }
}

// ---------- Init ----------
loadData().then(() => {
  fillDropdown();
  if (page === "home") renderHome();
  if (page === "semester") renderSemester();
  if (page === "subject") renderSubject();
}).catch(err => {
  console.error("[BCA Sathi] Init failed:", err);
  const grid = document.getElementById("semesterGrid");
  if (grid) grid.innerHTML = `<p class="empty">Could not load content. Please refresh.</p>`;
});