// BCA Sathi — app logic
const page = document.body.dataset.page;
const params = new URLSearchParams(location.search);

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

// ---------- Shared: fill semester dropdown ----------
function fillDropdown() {
  const dd = document.getElementById("semesterDropdown");
  if (!dd) return;
  BCA_DATA.semesters.forEach(s => {
    const a = el("a", null, `Semester ${s.id}`);
    a.href = `semester.html?sem=${s.id}`;
    dd.appendChild(a);
  });
}

// ---------- HOME ----------
function renderHome() {
  const grid = document.getElementById("semesterGrid");
  if (!grid) return;
  BCA_DATA.semesters.forEach(s => {
    const card = el("a", "sem-card");
    card.href = `semester.html?sem=${s.id}`;
    card.innerHTML = `
      <div class="sem-number">${s.id}</div>
      <div class="sem-info">
        <h3>Semester ${s.id}</h3>
        <p>${s.tagline}</p>
        <span class="sem-count">${s.subjects.length} subjects</span>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ---------- SEMESTER ----------
function renderSemester() {
  const semId = params.get("sem");
  const sem = findSemester(semId);
  if (!sem) { document.getElementById("semTitle").textContent = "Semester not found"; return; }

  document.title = `Semester ${sem.id} — BCA Sathi`;
  document.getElementById("bcSem").textContent = `Semester ${sem.id}`;
  document.getElementById("semTitle").textContent = `Semester ${sem.id} — ${sem.tagline}`;

  const grid = document.getElementById("subjectGrid");
  if (sem.subjects.length === 0) {
    grid.innerHTML = `<p class="empty">Subjects for this semester are being added. Check back soon.</p>`;
    return;
  }

  sem.subjects.forEach(sub => {
    const card = el("div", "subject-card");
    card.innerHTML = `
      <div class="subj-head">
        <h3>${sub.name}</h3>
        ${sub.code ? `<span class="subj-code">${sub.code}</span>` : ""}
      </div>
      <div class="subj-links">
        <a class="chip chip-notes" href="subject.html?sem=${sem.id}&sub=${sub.id}#notes">📄 Notes (${sub.notes.length})</a>
        <a class="chip chip-papers" href="subject.html?sem=${sem.id}&sub=${sub.id}#papers">📝 Papers (${sub.papers.length})</a>
        <a class="chip chip-syllabus" href="subject.html?sem=${sem.id}&sub=${sub.id}#syllabus">📚 Syllabus</a>
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
    return;
  }

  document.title = `${sub.name} — BCA Sathi`;
  document.getElementById("bcSubject").innerHTML =
    `<a href="index.html">Home</a> / <a href="semester.html?sem=${sem.id}">Semester ${sem.id}</a> / <span>${sub.name}</span>`;
  document.getElementById("subjTitle").textContent = sub.name;
  document.getElementById("subjCode").textContent = sub.code ? `Subject Code: ${sub.code}` : "";

  const tabs = document.querySelectorAll(".tab");
  tabs.forEach(t => {
    t.addEventListener("click", () => {
      tabs.forEach(x => x.classList.remove("active"));
      t.classList.add("active");
      renderTab(t.dataset.tab, sub, sem);
    });
  });

  // Default tab from hash, or papers
  const initial = (location.hash || "#papers").replace("#", "");
  const tabBtn = document.querySelector(`.tab[data-tab="${initial}"]`) || tabs[0];
  tabBtn.click();
}

function renderTab(tab, sub, sem) {
  const c = document.getElementById("tabContent");
  c.innerHTML = "";

  if (tab === "papers") {
    if (sub.papers.length === 0) {
      c.innerHTML = `<p class="empty">No past papers uploaded yet for this subject.</p>`;
      return;
    }
    const sorted = [...sub.papers].sort((a, b) => b.year - a.year);
    sorted.forEach(p => {
      const row = el("div", "resource-row");
      row.innerHTML = `
        <div><strong>${p.year}</strong> <span class="muted">Board Exam</span></div>
        <div class="row-actions">
          <span class="muted">${p.sizeMB} MB</span>
          <a class="btn btn-sm" href="${p.file}" target="_blank" rel="noopener">Download PDF</a>
        </div>
      `;
      c.appendChild(row);
    });
  }

  if (tab === "notes") {
    if (sub.notes.length === 0) {
      c.innerHTML = `<p class="empty">No notes uploaded yet for this subject.</p>`;
      return;
    }
    sub.notes.forEach(n => {
      const row = el("div", "resource-row");
      row.innerHTML = `
        <div><strong>${n.title}</strong></div>
        <div class="row-actions">
          <span class="muted">${n.sizeMB} MB</span>
          <a class="btn btn-sm" href="${n.file}" target="_blank" rel="noopener">Download PDF</a>
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
          <span class="muted">${sub.syllabus.sizeMB} MB</span>
          <a class="btn btn-sm" href="${sub.syllabus.file}" target="_blank" rel="noopener">Download PDF</a>
        </div>
      </div>
    `;
  }
}

// ---------- Init ----------
fillDropdown();
if (page === "home") renderHome();
if (page === "semester") renderSemester();
if (page === "subject") renderSubject();