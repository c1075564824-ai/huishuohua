(() => {
  "use strict";

  const DATA = window.HSH_CONTENT;
  const app = document.getElementById("app");
  const toastEl = document.getElementById("toast");
  const lessonsById = new Map(DATA.lessons.map((lesson) => [lesson.id, lesson]));
  const abilitiesById = new Map(DATA.abilities.map((ability) => [ability.id, ability]));
  const REVIEW_GAPS = [1, 3, 7, 14, 30];
  const ICONS = {
    logo: '<path d="M7 9.5a5 5 0 0 1 10 0v3a3 3 0 0 1-3 3h-1v-2h1a1 1 0 0 0 1-1v-3a3 3 0 0 0-6 0v3a1 1 0 0 0 1 1h1v2H9a3 3 0 0 1-3-3v-3Z"/><path d="M10 8.5h4v5h-4z"/>',
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10Z"/>',
    ability: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/><path d="M7 4.5h10"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>',
    history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/><path d="M9 21h6"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    spark: '<path d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3Z"/><path d="m5 16 .8 2.2L8 19l-2.2.8L5 22l-.8-2.2L2 19l2.2-.8L5 16Z"/>',
    check: '<path d="m5 12 4 4L19 6"/><path d="M4 4h16v16H4z"/>',
    chevron: '<path d="m9 18 6-6-6-6"/>',
    arrowLeft: '<path d="m15 18-6-6 6-6"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    play: '<path d="m8 5 11 7-11 7V5Z"/>',
    volume: '<path d="M4 10v4h4l5 4V6L8 10H4Z"/><path d="M16 9a4 4 0 0 1 0 6"/><path d="M18.5 6.5a8 8 0 0 1 0 11"/>',
    refresh: '<path d="M20 6v5h-5"/><path d="M4 18v-5h5"/><path d="M18.5 9A7 7 0 0 0 6 6.5L4 9"/><path d="M5.5 15A7 7 0 0 0 18 17.5l2-2.5"/>',
    download: '<path d="M12 3v12"/><path d="m8 11 4 4 4-4"/><path d="M4 20h16"/>',
    trash: '<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="m6 7 1 14h10l1-14"/><path d="M10 11v6M14 11v6"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    shield: '<path d="M12 3 4 6v5c0 5 3.4 8.5 8 10 4.6-1.5 8-5 8-10V6l-8-3Z"/><path d="m9 12 2 2 4-5"/>',
    list: '<path d="M9 6h12M9 12h12M9 18h12"/><path d="M4 6h.01M4 12h.01M4 18h.01"/>',
    cup: '<path d="M5 7h11v6a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5V7Z"/><path d="M16 9h2a3 3 0 0 1 0 6h-2"/><path d="M4 21h14"/>',
    question: '<circle cx="12" cy="12" r="9"/><path d="M9.7 9a2.4 2.4 0 1 1 3.8 2c-.9.6-1.5 1.2-1.5 2.5"/><path d="M12 17h.01"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  };

  const icon = (name) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.spark}</svg>`;
  const esc = (value = "") =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  const pad = (value) => String(Math.max(0, Math.floor(value))).padStart(2, "0");
  const formatClock = (seconds) => `${pad(seconds / 60)}:${pad(seconds % 60)}`;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const average = (values) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0);
  const uid = () =>
    crypto.randomUUID?.() || `hsh-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const todayKey = (date = new Date()) =>
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const addDays = (dateKey, days) => {
    const date = new Date(`${dateKey}T12:00:00`);
    date.setDate(date.getDate() + days);
    return todayKey(date);
  };
  const formatDate = (value) => {
    if (!value) return "待安排";
    const date = new Date(value.includes("T") ? value : `${value}T12:00:00`);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };
  const shortDate = (value) => {
    const date = new Date(value);
    return `${date.getMonth() + 1}月${date.getDate()}日 ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const state = {
    route: "today",
    routeId: "",
    sessions: [],
    progress: {},
    dataLoaded: false,
    storageAvailable: true,
    practice: null,
    libraryQuery: "",
    libraryFilter: "all",
    objectUrls: new Set(),
    stageTimer: null,
    recordTimer: null,
    volumeTimer: null,
    mediaRecorder: null,
    mediaStream: null,
    audioContext: null,
    analyser: null,
    volumeSamples: [],
    toastTimer: null,
  };

  function showToast(message) {
    clearTimeout(state.toastTimer);
    toastEl.textContent = message;
    toastEl.classList.add("show");
    state.toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2400);
  }

  function openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("huishuohua-local", 2);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("sessions")) {
          const store = db.createObjectStore("sessions", { keyPath: "id" });
          store.createIndex("createdAt", "createdAt");
        }
        if (!db.objectStoreNames.contains("progress")) {
          db.createObjectStore("progress", { keyPath: "lessonId" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function idbRequest(storeName, mode, action) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);
      const request = action(store);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      transaction.oncomplete = () => db.close();
      transaction.onerror = () => {
        db.close();
        reject(transaction.error);
      };
    });
  }

  const putSession = (session) =>
    idbRequest("sessions", "readwrite", (store) => store.put(session));
  const getSessions = () =>
    idbRequest("sessions", "readonly", (store) => store.getAll()).then((rows) =>
      rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    );
  const removeSession = (id) =>
    idbRequest("sessions", "readwrite", (store) => store.delete(id));
  const putProgress = (progress) =>
    idbRequest("progress", "readwrite", (store) => store.put(progress));
  const getProgress = () =>
    idbRequest("progress", "readonly", (store) => store.getAll()).then((rows) =>
      Object.fromEntries(rows.map((row) => [row.lessonId, row])),
    );

  async function refreshData() {
    try {
      const [sessions, progress] = await Promise.all([getSessions(), getProgress()]);
      state.sessions = sessions || [];
      state.progress = progress || {};
      state.storageAvailable = true;
    } catch (error) {
      console.warn("Local storage unavailable", error);
      state.sessions = [];
      state.progress = {};
      state.storageAvailable = false;
    } finally {
      state.dataLoaded = true;
    }
  }

  function releaseObjectUrls() {
    state.objectUrls.forEach((url) => URL.revokeObjectURL(url));
    state.objectUrls.clear();
  }

  function audioUrl(blob) {
    if (!blob) return "";
    const url = URL.createObjectURL(blob);
    state.objectUrls.add(url);
    return url;
  }

  function parseRoute() {
    const raw = location.hash.replace(/^#\/?/, "");
    const [route = "today", ...id] = raw.split("/");
    state.route = route || "today";
    state.routeId = decodeURIComponent(id.join("/") || "");
  }

  function navigate(path) {
    const hash = `#/${path.replace(/^#\/?/, "")}`;
    if (location.hash === hash) {
      parseRoute();
      render();
    } else {
      location.hash = hash;
    }
  }

  function goBack() {
    if (history.length > 1) history.back();
    else navigate("today");
  }

  function getAbility(id) {
    return abilitiesById.get(id);
  }

  function getLesson(id) {
    return lessonsById.get(id);
  }

  function getLessonProgress(id) {
    return (
      state.progress[id] || {
        lessonId: id,
        completed: false,
        quickCount: 0,
        followCount: 0,
        reviewStep: 0,
        mastery: "new",
        nextReview: null,
        lastPracticeDate: null,
      }
    );
  }

  function getDueReviews() {
    const today = todayKey();
    return Object.values(state.progress)
      .filter((progress) => progress.completed && progress.nextReview && progress.nextReview <= today)
      .sort((a, b) => String(a.nextReview).localeCompare(String(b.nextReview)));
  }

  function getDailyLesson() {
    try {
      const saved = JSON.parse(localStorage.getItem("hsh-v2-daily") || "null");
      if (saved?.date === todayKey() && lessonsById.has(saved.lessonId)) {
        return getLesson(saved.lessonId);
      }
    } catch {
      // ignore malformed local state
    }
    const next = DATA.lessons.find((lesson) => !getLessonProgress(lesson.id).completed);
    const lesson = next || DATA.lessons[new Date().getDate() % DATA.lessons.length];
    localStorage.setItem(
      "hsh-v2-daily",
      JSON.stringify({ date: todayKey(), lessonId: lesson.id }),
    );
    return lesson;
  }

  function abilityProgress(abilityId) {
    const abilityLessons = DATA.lessons.filter((lesson) => lesson.ability === abilityId);
    const complete = abilityLessons.filter((lesson) => getLessonProgress(lesson.id).completed).length;
    return { complete, total: abilityLessons.length, percent: Math.round((complete / abilityLessons.length) * 100) };
  }

  function completedLessons() {
    return DATA.lessons.filter((lesson) => getLessonProgress(lesson.id).completed).length;
  }

  function weekPracticeDays() {
    const now = new Date();
    now.setHours(12, 0, 0, 0);
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    const start = todayKey(monday);
    return new Set(
      state.sessions
        .filter((session) => todayKey(new Date(session.createdAt)) >= start)
        .map((session) => todayKey(new Date(session.createdAt))),
    ).size;
  }

  function topbar() {
    return `<header class="topbar">
      <div class="brand"><span class="brand-mark">${icon("logo")}</span><span class="brand-name">会说话 <small class="version-tag">V2</small></span></div>
      <div class="date-label">${formatDate(todayKey())}<br>每天练一点，现场稳一点</div>
    </header>`;
  }

  function backbar(title) {
    return `<header class="backbar">
      <button class="icon-button" data-action="back" aria-label="返回">${icon("arrowLeft")}</button>
      <div class="backbar-title">${esc(title)}</div>
      <span aria-hidden="true"></span>
    </header>`;
  }

  function bottomNav(active) {
    const items = [
      ["today", "home", "今日"],
      ["abilities", "ability", "能力"],
      ["library", "book", "素材"],
      ["reviews", "history", "复习"],
    ];
    return `<nav class="bottom-nav">${items
      .map(
        ([route, iconName, label]) => `<button class="nav-item ${active === route ? "active" : ""}" data-action="navigate" data-route="${route}">
          ${icon(iconName)}<span>${label}</span>
        </button>`,
      )
      .join("")}</nav>`;
  }

  function abilityChip(ability) {
    return `<span class="ability-chip ${ability.color}">${icon(ability.icon)}${esc(ability.title)}</span>`;
  }

  function modeButtons(lesson, compact = false) {
    return `<div class="mode-buttons ${compact ? "compact" : ""}">
      <button class="mode-button" data-action="start-mode" data-id="${lesson.id}" data-mode="quick">
        <span class="mode-time">60 秒</span><strong>门槛版</strong><small>读一句，说一句</small>
      </button>
      <button class="mode-button" data-action="start-mode" data-id="${lesson.id}" data-mode="standard">
        <span class="mode-time">5 分钟</span><strong>标准版</strong><small>跟读与复述</small>
      </button>
      <button class="mode-button featured" data-action="start-mode" data-id="${lesson.id}" data-mode="full">
        <span class="mode-time">15 分钟</span><strong>完整版</strong><small>跟·忆·用·改</small>
      </button>
    </div>`;
  }

  function renderToday() {
    const lesson = getDailyLesson();
    const ability = getAbility(lesson.ability);
    const progress = getLessonProgress(lesson.id);
    const completedToday = state.sessions.some(
      (session) =>
        session.lessonId === lesson.id &&
        !session.isReview &&
        todayKey(new Date(session.createdAt)) === todayKey(),
    );
    const due = getDueReviews();
    return `<div class="page">
      ${topbar()}
      <section class="today-hero ${ability.color} fade-in">
        <div class="today-hero-top">
          ${abilityChip(ability)}
          <span class="today-time">${completedToday ? "今日已完成" : "今日推荐 · 15 分钟"}</span>
        </div>
        <h1>${esc(lesson.title)}</h1>
        <p>${esc(lesson.subtitle)}</p>
        <blockquote>${esc(lesson.goldLine)}</blockquote>
        <div class="today-rule"><span>今日规则</span>${esc(ability.rule)}</div>
        <button class="primary-button hero-start" data-action="start-mode" data-id="${lesson.id}" data-mode="full">
          ${completedToday ? "再练一遍" : "开始完整训练"} ${icon("chevron")}
        </button>
      </section>

      <section class="section compact-section">
        <div class="section-head"><div><h2>今天练多深</h2><p>最低 60 秒也算一次，不给自己设断签压力。</p></div></div>
        ${modeButtons(lesson)}
      </section>

      <section class="section">
        <div class="section-head"><div><h2>完整版怎么练</h2><p>一次只做一个动作，随时可以结束并保存。</p></div></div>
        <div class="training-path">
          <div><span>01</span><strong>跟</strong><small>3 分钟跟读</small></div>
          <div><span>02</span><strong>忆</strong><small>3 分钟回忆</small></div>
          <div><span>03</span><strong>用</strong><small>6 分钟表达</small></div>
          <div><span>04</span><strong>改</strong><small>3 分钟重说</small></div>
        </div>
      </section>

      ${due.length ? `<section class="section"><button class="review-reminder" data-action="navigate" data-route="reviews">
        <span class="history-icon">${icon("refresh")}</span>
        <span><strong>今天有 ${due.length} 个旧内容该复习</strong><small>每次只用 30～60 秒重新调取</small></span>
        ${icon("chevron")}
      </button></section>` : ""}

      <section class="section">
        <div class="two-stat-card">
          <div><strong>${completedLessons()}</strong><span>/ 28 已掌握</span></div>
          <div><strong>${weekPracticeDays()}</strong><span>本周练过几天</span></div>
          <div><strong>${Object.keys(state.progress).filter((id) => getLessonProgress(id).completed).length ? getDueReviews().length : 0}</strong><span>待复习</span></div>
        </div>
      </section>

      <section class="section">
        <div class="insight-card">
          <span class="mini-icon">${icon(ability.icon)}</span>
          <div><h3>${esc(ability.title)}：${esc(ability.tagline)}</h3><p>${esc(ability.description)}</p></div>
        </div>
      </section>
      ${progress.quickCount > 0 && !progress.completed ? `<p class="subtle-note">你已经完成过 ${progress.quickCount} 次轻练。继续 5 分钟版本，就会进入正式训练进度。</p>` : ""}
    </div>${bottomNav("today")}`;
  }

  function renderAbilities() {
    return `<div class="page">
      ${topbar()}
      <header class="page-heading fade-in">
        <div class="eyebrow">Four core abilities</div>
        <h1>场景很多，<br>底层能力只有四种。</h1>
        <p>每周只主攻一个能力，用不同场景反复练。当前完成 ${completedLessons()} / 28 个训练包。</p>
      </header>
      <div class="ability-list">
        ${DATA.abilities
          .map((ability) => {
            const progress = abilityProgress(ability.id);
            return `<button class="ability-card ${ability.color}" data-action="open-ability" data-id="${ability.id}">
              <div class="ability-card-head">
                <span class="group-icon">${icon(ability.icon)}</span>
                <span class="ability-week">第 ${ability.week} 周</span>
              </div>
              <h2>${esc(ability.title)}</h2>
              <p>${esc(ability.tagline)}</p>
              <div class="ability-progress"><span><i style="width:${progress.percent}%"></i></span><small>${progress.complete} / ${progress.total}</small></div>
              <div class="ability-card-rule">${esc(ability.rule)}</div>
            </button>`;
          })
          .join("")}
      </div>
      <div class="notice neutral">${icon("shield")}<span>先学新内容，再通过第 1、3、7、14、30 天的间隔复习，把同一结构迁移到不同场景。</span></div>
    </div>${bottomNav("abilities")}`;
  }

  function renderAbilityDetail(ability) {
    if (!ability) return renderAbilities();
    const lessons = DATA.lessons.filter((lesson) => lesson.ability === ability.id);
    const progress = abilityProgress(ability.id);
    return `<div class="page">
      ${backbar(ability.title)}
      <section class="ability-detail-hero ${ability.color}">
        <span class="group-icon">${icon(ability.icon)}</span>
        <div class="eyebrow">第 ${ability.week} 周 · ${progress.complete} / ${progress.total}</div>
        <h1>${esc(ability.title)}</h1>
        <p>${esc(ability.description)}</p>
        <blockquote>${esc(ability.rule)}</blockquote>
        <div class="ability-progress"><span><i style="width:${progress.percent}%"></i></span><small>${progress.percent}%</small></div>
      </section>
      <div class="lesson-list">
        ${lessons
          .map((lesson) => {
            const p = getLessonProgress(lesson.id);
            const stateLabel = p.completed ? "已训练" : p.quickCount ? "轻练过" : "未开始";
            return `<button class="lesson-library-item" data-action="open-lesson" data-id="${lesson.id}">
              <span class="lesson-day">D${lesson.day}</span>
              <span class="lesson-copy"><strong>${esc(lesson.title)}</strong><small>${esc(lesson.goldLine)}</small></span>
              <span class="state-label ${p.completed ? "done" : ""}">${stateLabel}</span>
            </button>`;
          })
          .join("")}
      </div>
      <div class="notice neutral">${icon("refresh")}<span>已经完成的内容可以随时加练。重复不是倒退，换场景调用才是强化。</span></div>
    </div>${bottomNav("abilities")}`;
  }

  function lessonStatusLabel(lesson) {
    const p = getLessonProgress(lesson.id);
    if (p.completed) return p.mastery === "顺口" ? "顺口" : "已训练";
    if (p.quickCount) return "轻练过";
    return "未开始";
  }

  function renderLessonDetail(lesson) {
    if (!lesson) return renderLibrary();
    const ability = getAbility(lesson.ability);
    const progress = getLessonProgress(lesson.id);
    return `<div class="page">
      ${backbar(ability.title)}
      <header class="lesson-detail-head fade-in">
        ${abilityChip(ability)}
        <h1>${esc(lesson.title)}</h1>
        <p class="detail-summary">${esc(lesson.subtitle)}</p>
        <blockquote class="gold-quote">${esc(lesson.goldLine)}</blockquote>
        <div class="detail-meta">
          <span class="meta-pill">${icon("target")} ${esc(lesson.type)}</span>
          <span class="meta-pill">${icon("calendar")} ${lessonStatusLabel(lesson)}</span>
        </div>
      </header>
      <section class="content-card">
        <div class="content-label">跟读材料</div>
        <p class="reading-preview">${esc(lesson.reading.split("\n").slice(0, 4).join(" "))}</p>
        <button class="text-button" data-action="speak" data-id="${lesson.id}">${icon("volume")} 听系统示范</button>
      </section>
      ${
        lesson.classicQuote
          ? `<section class="content-card"><div class="content-label">原文金句</div><p class="classic-quote">${esc(lesson.classicQuote)}</p><p>${esc(lesson.source)}</p></section>`
          : ""
      }
      <section class="content-card">
        <div class="content-label">表达结构</div>
        <h3>${esc(lesson.structure.name)}</h3>
        <ol class="step-list">${lesson.structure.steps.map((step, index) => `<li data-index="${index + 1}">${esc(step)}</li>`).join("")}</ol>
        <p>${esc(lesson.structure.cue)}</p>
      </section>
      <section class="content-card">
        <div class="content-label">迁移任务</div>
        <p>${esc(lesson.apply.prompt)}</p>
        <div class="hint-chips">${lesson.apply.constraints.map((item) => `<span class="hint-chip">${esc(item)}</span>`).join("")}</div>
      </section>
      <div class="bottom-cta"><button class="primary-button block" data-action="start-mode" data-id="${lesson.id}" data-mode="${progress.completed ? "standard" : "full"}">
        ${progress.completed ? "加练这一课" : "开始这一课"} ${icon("chevron")}
      </button></div>
    </div>${bottomNav("library")}`;
  }

  function filteredLibrary() {
    const query = state.libraryQuery.trim().toLowerCase();
    const lessonRows = DATA.lessons
      .filter((lesson) => {
        if (state.libraryFilter === "phrases") return false;
        if (!query) return true;
        const ability = getAbility(lesson.ability);
        return [
          lesson.title,
          lesson.subtitle,
          lesson.type,
          lesson.goldLine,
          lesson.classicQuote || "",
          ...lesson.keywords,
          ability.title,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);
      })
      .map((lesson) => ({ type: "lesson", lesson }));
    const phraseRows = DATA.phraseBank
      .flatMap((group) =>
        group.items.map((item) => ({ type: "phrase", group, item })),
      )
      .filter((row) => {
        if (state.libraryFilter === "lessons") return false;
        if (!query) return true;
        return `${row.group.category} ${row.item.text} ${row.item.use}`
          .toLowerCase()
          .includes(query);
      });
    return [...lessonRows, ...phraseRows];
  }

  function libraryResultsMarkup() {
    const rows = filteredLibrary();
    if (!rows.length) {
      return `<div class="empty-state"><div class="empty-icon">${icon("search")}</div><h3>没有找到内容</h3><p>换一个关键词，或查看全部素材。</p></div>`;
    }
    return rows
      .map((row) => {
        if (row.type === "lesson") {
          const lesson = row.lesson;
          const ability = getAbility(lesson.ability);
          return `<button class="library-result" data-action="open-lesson" data-id="${lesson.id}">
            <span class="mini-icon ${ability.color}">${icon(ability.icon)}</span>
            <span><strong>${esc(lesson.title)}</strong><small>${esc(lesson.goldLine)}</small><em>${esc(ability.title)} · ${esc(lesson.type)}</em></span>
            ${icon("chevron")}
          </button>`;
        }
        return `<div class="phrase-result">
          <div class="phrase-result-head"><span>${esc(row.group.category)}</span><small>${esc(row.item.use)}</small></div>
          <p>${esc(row.item.text)}</p>
          <button class="text-button" data-action="copy-phrase" data-text="${esc(row.item.text)}">${icon("copy")} 复制这句</button>
        </div>`;
      })
      .join("");
  }

  function renderLibrary() {
    const totalPhrases = DATA.phraseBank.reduce((sum, group) => sum + group.items.length, 0);
    return `<div class="page">
      ${topbar()}
      <header class="page-heading fade-in">
        <div class="eyebrow">Material library</div>
        <h1>先存好句子，<br>再练成自己的。</h1>
        <p>${DATA.lessons.length} 个训练包与 ${totalPhrases} 条实用表达。搜索故事、金句、场景或用途。</p>
      </header>
      <div class="library-search">${icon("search")}<input id="library-search" type="search" value="${esc(state.libraryQuery)}" placeholder="搜索：会议、夸奖、敬酒、故事……"></div>
      <div class="filter-chips" id="library-filters">
        ${[
          ["all", "全部"],
          ["lessons", "训练素材"],
          ["phrases", "实用句库"],
        ]
          .map(
            ([value, label]) => `<button class="filter-chip ${state.libraryFilter === value ? "active" : ""}" data-action="library-filter" data-value="${value}">${label}</button>`,
          )
          .join("")}
      </div>
      <div id="library-results" class="library-results">${libraryResultsMarkup()}</div>
    </div>${bottomNav("library")}`;
  }

  function sessionTitle(session) {
    return session.title || session.lessonTitle || "历史练习";
  }

  function sessionStatus(session) {
    if (session.status) return session.status;
    if (session.review?.score) return "历史记录";
    return "已保存";
  }

  function renderReviews() {
    const due = getDueReviews();
    const totalSeconds = state.sessions.reduce(
      (sum, session) => sum + Number(session.durationSec || 0),
      0,
    );
    return `<div class="page">
      ${topbar()}
      <header class="page-heading fade-in">
        <div class="eyebrow">Review & history</div>
        <h1>复习，是把学过<br>变成会用。</h1>
        <p>到期复习每次只花 30～60 秒。先回忆，再看答案，不重复整堂课。</p>
      </header>
      <section class="due-panel">
        <div class="section-head"><div><h2>今天该复习</h2><p>${due.length ? "先想，再看提示。" : "暂时没有到期内容。"}</p></div><span class="due-count">${due.length}</span></div>
        ${
          due.length
            ? due
                .slice(0, 6)
                .map((progress) => {
                  const lesson = getLesson(progress.lessonId);
                  if (!lesson) return "";
                  return `<button class="due-item" data-action="start-review" data-id="${lesson.id}">
                    <span><strong>${esc(lesson.goldLine)}</strong><small>${esc(lesson.title)} · ${formatDate(progress.nextReview)}到期</small></span>
                    ${icon("chevron")}
                  </button>`;
                })
                .join("")
            : `<div class="empty-mini"><span>${icon("check")}</span><p>今天没有欠账。可以继续学新的内容，或给已有内容加练。</p></div>`
        }
      </section>
      <div class="two-stat-card">
        <div><strong>${state.sessions.length}</strong><span>练习次数</span></div>
        <div><strong>${Math.max(0, Math.round(totalSeconds / 60))}</strong><span>累计分钟</span></div>
        <div><strong>${weekPracticeDays()}</strong><span>本周天数</span></div>
      </div>
      <section class="section">
        <div class="section-head"><div><h2>练习记录</h2><p>录音只保存在这台设备。</p></div><span class="due-count">${state.sessions.length}</span></div>
        ${
          state.sessions.length
            ? `<div class="history-list">${state.sessions
                .map(
                  (session) => `<button class="history-item" data-action="open-record" data-id="${session.id}">
                    <span class="history-icon">${icon(session.isReview ? "refresh" : "mic")}</span>
                    <span><h3>${esc(sessionTitle(session))}</h3><p>${esc(session.abilityTitle || session.kind || "练习")} · ${shortDate(session.createdAt)} · ${esc(sessionStatus(session))}</p></span>
                    ${icon("chevron")}
                  </button>`,
                )
                .join("")}</div>`
            : `<div class="empty-state"><div class="empty-icon">${icon("mic")}</div><h3>还没有训练记录</h3><p>从今天 60 秒的门槛版开始，先让自己愿意打开。</p><button class="primary-button" data-action="navigate" data-route="today">去今日训练</button></div>`
        }
      </section>
      <section class="section">
        <div class="section-head"><div><h2>本机数据</h2><p>没有账号，录音不上传。</p></div></div>
        <div class="content-card flat">
          <div class="data-actions">
            <button class="secondary-button block" data-action="export-data" ${!state.sessions.length ? "disabled" : ""}>${icon("download")} 导出全部记录</button>
            <label class="secondary-button block" style="cursor:pointer">${icon("history")} 导入旧练习记录<input id="record-import-input" type="file" accept="application/json,.json" hidden></label>
            <button class="danger-button block" data-action="clear-data" ${!state.sessions.length ? "disabled" : ""}>${icon("trash")} 清空全部本机数据</button>
          </div>
          <p class="data-note">更换手机、清理浏览器或换网址前，请先导出 JSON 备份。</p>
        </div>
      </section>
      ${state.storageAvailable ? "" : `<div class="notice danger">${icon("info")}<span>当前浏览器无法保存本地数据库，练习可以完成，但历史记录可能丢失。</span></div>`}
    </div>${bottomNav("reviews")}`;
  }

  function attemptAudioCard(attempt, label) {
    if (!attempt?.blob) {
      return `<div class="audio-card"><div class="audio-top"><span class="audio-title">${icon("mic")} ${esc(label)}</span><span class="audio-meta">无录音</span></div><p style="font-size:11px">本次使用无录音复盘，记录仍会保存。</p></div>`;
    }
    return `<div class="audio-card">
      <div class="audio-top"><span class="audio-title">${icon("mic")} ${esc(label)}</span><span class="audio-meta">${formatClock(attempt.durationSec || 0)}</span></div>
      <audio controls playsinline preload="metadata" src="${audioUrl(attempt.blob)}"></audio>
    </div>`;
  }

  function renderRecordDetail(session) {
    if (!session) {
      return `<div class="page">${backbar("练习记录")}<div class="empty-state"><div class="empty-icon">${icon("history")}</div><h3>没有找到这条记录</h3><p>可能已经删除，或浏览器本地数据被重置。</p><button class="primary-button" data-action="navigate" data-route="reviews">返回复习</button></div></div>`;
    }
    const lesson = session.lessonId ? getLesson(session.lessonId) : null;
    const attempts = session.attempts || [];
    return `<div class="page">
      ${backbar("本次训练")}
      <section class="record-hero ${lesson ? getAbility(lesson.ability).color : "green"}">
        <div class="eyebrow">${esc(session.abilityTitle || session.kind || "历史记录")} · ${shortDate(session.createdAt)}</div>
        <h1>${esc(sessionTitle(session))}</h1>
        <blockquote>${esc(session.goldLine || session.review?.headline || "把练习留在本机，把变化带到现场。")}</blockquote>
        <div class="record-meta">
          <span>${esc(session.modeLabel || session.mode || "练习")}</span>
          <span>状态：${esc(session.status || "已记录")}</span>
          ${session.nextReview ? `<span>下次复习：${formatDate(session.nextReview)}</span>` : ""}
        </div>
      </section>
      <section class="content-card">
        <div class="content-label">本次录音</div>
        ${attempts.length ? attempts.map((attempt, index) => attemptAudioCard(attempt, `第 ${index + 1} 遍`)).join("") : `<div class="empty-mini"><p>本次没有录音，可以继续完成训练并记录主观状态。</p></div>`}
        ${session.notes ? `<p><strong style="color:var(--ink)">练习笔记：</strong>${esc(session.notes)}</p>` : ""}
      </section>
      ${
        lesson
          ? `<section class="content-card"><div class="content-label">今天留下的内容</div><p class="gold-quote small">${esc(lesson.goldLine)}</p><p><strong style="color:var(--ink)">结构：</strong>${esc(lesson.structure.name)}</p><p><strong style="color:var(--ink)">迁移任务：</strong>${esc(lesson.apply.prompt)}</p></section>`
          : ""
      }
      <div class="button-row">
        <button class="secondary-button" data-action="mark-used" data-id="${session.id}">${session.usedInReal ? "✓ 已在现场使用" : "标记已在现场使用"}</button>
        <button class="danger-button" data-action="delete-record" data-id="${session.id}">删除记录</button>
      </div>
      ${lesson ? `<div class="bottom-cta"><button class="primary-button block" data-action="open-lesson" data-id="${lesson.id}">回到这一课加练 ${icon("chevron")}</button></div>` : ""}
    </div>${bottomNav("reviews")}`;
  }

  function stopAudio() {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }

  function speakText(text, rate = 0.88) {
    if (!("speechSynthesis" in window)) {
      showToast("当前浏览器不支持语音示范");
      return;
    }
    const clean = String(text)
      .replaceAll("//", "，")
      .replaceAll("｜", "，")
      .replace(/【[^】]+】/g, "，")
      .replaceAll("**", "");
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = "zh-CN";
    utterance.rate = rate;
    utterance.pitch = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  function clearStageTimer() {
    clearInterval(state.stageTimer);
    state.stageTimer = null;
  }

  function cleanupPracticeMedia({ discard = false } = {}) {
    clearStageTimer();
    clearInterval(state.recordTimer);
    clearInterval(state.volumeTimer);
    state.recordTimer = null;
    state.volumeTimer = null;
    if (state.practice) state.practice.discardRecording = discard;
    if (state.mediaRecorder?.state === "recording") {
      try {
        state.mediaRecorder.stop();
      } catch {
        // recorder may already be stopping
      }
    }
    state.mediaRecorder = null;
    state.mediaStream?.getTracks().forEach((track) => track.stop());
    state.mediaStream = null;
    if (state.audioContext && state.audioContext.state !== "closed") {
      state.audioContext.close().catch(() => {});
    }
    state.audioContext = null;
    state.analyser = null;
    state.volumeSamples = [];
    stopAudio();
  }

  function practiceModeLabel(mode) {
    return {
      quick: "60 秒门槛版",
      standard: "5 分钟标准版",
      full: "15 分钟完整版",
      review: "间隔复习",
    }[mode] || "训练";
  }

  function createPractice(lessonId, mode, isReview = false) {
    const lesson = getLesson(lessonId);
    if (!lesson) return null;
    return {
      lessonId,
      mode,
      isReview,
      step:
        isReview
          ? "reviewQuick"
          : mode === "quick"
            ? "quick"
            : "follow",
      status: getLessonProgress(lessonId).mastery === "new" ? "能用" : getLessonProgress(lessonId).mastery,
      notes: "",
      attempts: [],
      startedAt: Date.now(),
      hintRevealed: false,
      recording: false,
      saving: false,
      micError: "",
      discardRecording: false,
      recordElapsed: 0,
      recordingStartedAt: 0,
      timerLeft: 0,
    };
  }

  function startMode(lessonId, mode, isReview = false) {
    cleanupPracticeMedia({ discard: true });
    const practice = createPractice(lessonId, mode, isReview);
    if (!practice) return;
    state.practice = practice;
    navigate("practice");
  }

  function exitPractice() {
    const practice = state.practice;
    if (!practice) {
      navigate("today");
      return;
    }
    if (
      !practice.saving &&
      practice.step !== "follow" &&
      !window.confirm("本次训练还没有保存，退出会丢弃本次录音。确定退出吗？")
    ) {
      return;
    }
    cleanupPracticeMedia({ discard: true });
    state.practice = null;
    navigate("today");
  }

  function practiceHeader(lesson) {
    const practice = state.practice;
    const ability = getAbility(lesson.ability);
    const stageOrder = ["follow", "recall", "apply", "review"];
    const active =
      practice.step === "quick" || practice.step === "reviewQuick"
        ? 0
        : Math.max(0, stageOrder.indexOf(practice.step));
    return `<header class="backbar practice-header">
      <button class="icon-button" data-action="exit-practice" aria-label="退出">${icon("close")}</button>
      <div class="backbar-title">${esc(ability.title)} · ${practiceModeLabel(practice.mode)}</div>
      <span aria-hidden="true"></span>
    </header>
    <div class="practice-progress">${[0, 1, 2, 3]
      .map((index) => `<span class="${index <= active ? "active" : ""}"></span>`)
      .join("")}</div>`;
  }

  function practiceStatusForm(practice) {
    return `<div class="mastery-options">
      ${[
        ["还生", "需要再看提示"],
        ["能用", "照着结构能说"],
        ["顺口", "换场景也能用"],
      ]
        .map(
          ([value, label]) => `<label class="${practice.status === value ? "active" : ""}">
            <input type="radio" name="training-status" value="${value}" ${practice.status === value ? "checked" : ""}>
            <strong>${value}</strong><small>${label}</small>
          </label>`,
        )
        .join("")}
    </div>`;
  }

  function renderPracticeQuick() {
    const practice = state.practice;
    const lesson = getLesson(practice.lessonId);
    const ability = getAbility(lesson.ability);
    return `<div class="page page-practice">
      ${practiceHeader(lesson)}
      <main class="practice-shell">
        <section class="practice-center fade-in">
          <div class="practice-copy">
            <div class="eyebrow">${esc(ability.title)} · 60 秒门槛版</div>
            <h1>先读一句，<br>再说一句。</h1>
            <p>今天不用学很多。读完金句，合上页面复述一次，就算完成轻练。</p>
          </div>
          <section class="gold-focus-card ${ability.color}">
            <div class="content-label">今日金句</div>
            <blockquote>${esc(lesson.goldLine)}</blockquote>
            <button class="text-button" data-action="speak-gold">${icon("volume")} 听一遍</button>
          </section>
          <section class="content-card">
            <div class="content-label">最小训练</div>
            <p>大声读一遍金句，停两秒，再不看原文复述一遍。完成后选择“还生 / 能用 / 顺口”。</p>
            <div class="quick-timer" id="practice-clock">${formatClock(60)}</div>
            <button class="secondary-button block" data-action="start-timer" data-seconds="60">${icon("clock")} 开始 60 秒计时</button>
          </section>
          <form id="training-complete">
            <section class="content-card">
              <h3>这次的感觉</h3>
              ${practiceStatusForm(practice)}
            </section>
            <div class="bottom-cta"><button class="primary-button block" type="submit">完成今日轻练 ${icon("check")}</button></div>
          </form>
        </section>
      </main>
    </div>`;
  }

  function renderPracticeReviewQuick() {
    const practice = state.practice;
    const lesson = getLesson(practice.lessonId);
    const ability = getAbility(lesson.ability);
    return `<div class="page page-practice">
      ${practiceHeader(lesson)}
      <main class="practice-shell">
        <section class="practice-center fade-in">
          <div class="practice-copy">
            <div class="eyebrow">${esc(ability.title)} · 间隔复习</div>
            <h1>先想，再看。</h1>
            <p>用下面的关键词，回忆这一课讲了什么。不要直接翻原文。</p>
          </div>
          <section class="content-card">
            <div class="content-label">回忆线索</div>
            <div class="hint-chips large">${lesson.keywords.map((word) => `<span class="hint-chip">${esc(word)}</span>`).join("")}</div>
            <div class="quick-timer" id="practice-clock">${formatClock(45)}</div>
            <button class="secondary-button block" data-action="start-timer" data-seconds="45">${icon("clock")} 开始 45 秒回忆</button>
          </section>
          ${
            practice.hintRevealed
              ? `<section class="gold-focus-card ${ability.color}">
                  <div class="content-label">答案</div>
                  <blockquote>${esc(lesson.goldLine)}</blockquote>
                  <p>${esc(lesson.structure.name)}：${lesson.structure.steps.map((step) => esc(step)).join(" → ")}</p>
                </section>`
              : `<button class="quiet-button block" data-action="reveal-hint">我卡住了，看一眼提示</button>`
          }
          <form id="training-complete">
            <section class="content-card">
              <h3>这次还能不能调用</h3>
              ${practiceStatusForm(practice)}
            </section>
            <div class="bottom-cta"><button class="primary-button block" type="submit">完成复习 ${icon("check")}</button></div>
          </form>
        </section>
      </main>
    </div>`;
  }

  function stageTimerMarkup(seconds) {
    return `<div class="stage-timer" id="practice-clock">${formatClock(seconds)}</div>
      <button class="text-button" data-action="start-timer" data-seconds="${seconds}">${icon("clock")} 开始计时</button>`;
  }

  function renderPracticeFollow() {
    const practice = state.practice;
    const lesson = getLesson(practice.lessonId);
    const ability = getAbility(lesson.ability);
    const seconds = practice.mode === "standard" ? 120 : 180;
    return `<div class="page page-practice">
      ${practiceHeader(lesson)}
      <main class="practice-shell">
        <section class="practice-center fade-in">
          <div class="practice-copy">
            <div class="eyebrow">第 1 步 · 跟</div>
            <h1>先跟节奏，<br>不要急着背。</h1>
            <p>${esc(ability.rule)}。可先听一遍系统示范，再跟读两遍；出现不适时停下来。</p>
          </div>
          <section class="reading-card">
            <div class="reading-card-head"><span>${icon("volume")} 跟读材料</span><button class="text-button" data-action="speak-reading">听示范</button></div>
            <div class="reading-text">${esc(lesson.reading)}</div>
            ${lesson.classicQuote ? `<p class="classic-quote">${esc(lesson.classicQuote)}</p>` : ""}
          </section>
          <section class="content-card flat">
            <div class="content-label">今天记住这句</div>
            <blockquote class="gold-quote small">${esc(lesson.goldLine)}</blockquote>
            ${stageTimerMarkup(seconds)}
          </section>
          <div class="bottom-cta"><button class="primary-button block" data-action="practice-next" data-next="recall">跟读完成，收起原文 ${icon("chevron")}</button></div>
          <button class="text-button center-button" data-action="practice-next" data-next="apply">跳过跟读，直接表达</button>
        </section>
      </main>
    </div>`;
  }

  function renderPracticeRecall() {
    const practice = state.practice;
    const lesson = getLesson(practice.lessonId);
    const ability = getAbility(lesson.ability);
    return `<div class="page page-practice">
      ${practiceHeader(lesson)}
      <main class="practice-shell">
        <section class="practice-center fade-in">
          <div class="practice-copy">
            <div class="eyebrow">第 2 步 · 忆</div>
            <h1>收起原文，<br>先把它想起来。</h1>
            <p>不要重新阅读。看着关键词，用自己的话复述 30～60 秒。说得不完整也没关系。</p>
          </div>
          <section class="recall-card ${ability.color}">
            <div class="content-label">只给你这些线索</div>
            <div class="hint-chips large">${lesson.keywords.map((word) => `<span class="hint-chip">${esc(word)}</span>`).join("")}</div>
            ${stageTimerMarkup(120)}
          </section>
          ${
            practice.hintRevealed
              ? `<section class="content-card"><div class="content-label">提示</div><blockquote class="gold-quote small">${esc(lesson.goldLine)}</blockquote><p>${esc(lesson.structure.name)}：${lesson.structure.steps.map((step) => esc(step)).join(" → ")}</p></section>`
              : `<button class="quiet-button block" data-action="reveal-hint">想不起来，只揭晓金句</button>`
          }
          <div class="button-row">
            <button class="secondary-button" data-action="practice-prev" data-prev="follow">回看材料</button>
            <button class="primary-button" data-action="practice-next" data-next="apply">我复述完了</button>
          </div>
        </section>
      </main>
    </div>`;
  }

  function volumeBars() {
    return `<div class="volume-stage" id="volume-stage">${Array.from({ length: 22 }, (_, index) => `<span class="volume-bar" data-bar="${index}"></span>`).join("")}</div>`;
  }

  function recordingSupported() {
    return Boolean(window.isSecureContext && navigator.mediaDevices?.getUserMedia && window.MediaRecorder);
  }

  function renderPracticeApply() {
    const practice = state.practice;
    const lesson = getLesson(practice.lessonId);
    const ability = getAbility(lesson.ability);
    const maxSeconds = practice.mode === "standard" ? 60 : 90;
    const recording = practice.recording;
    return `<div class="page page-practice">
      ${practiceHeader(lesson)}
      <main class="practice-shell">
        <section class="practice-center fade-in">
          <div class="practice-copy">
            <div class="eyebrow">第 3 步 · 用</div>
            <h1>现在，<br>说给一个真实的人听。</h1>
            <p>${esc(lesson.apply.prompt)}</p>
          </div>
          <section class="apply-card">
            <div class="content-label">今天必须做到</div>
            <div class="hint-chips">${lesson.apply.constraints.map((item) => `<span class="hint-chip">${esc(item)}</span>`).join("")}</div>
            <div class="structure-flow">${lesson.structure.steps.map((step) => `<span class="structure-step">${esc(step)}</span>`).join("")}</div>
          </section>
          ${
            recording
              ? `<div class="recording-stage">
                  <span class="recording-status live">录音中</span>
                  <div class="recording-clock" id="record-clock">${formatClock(practice.recordElapsed)}</div>
                  <div class="recording-target">建议 ${formatClock(maxSeconds)}，到时会自动结束</div>
                  ${volumeBars()}
                  <button class="record-button stop" data-action="stop-recording" aria-label="停止录音"></button>
                  <div class="record-help">点一下停止，进入复盘</div>
                </div>`
              : `<div class="record-area">
                  ${recordingSupported() ? `<button class="record-button" data-action="start-recording" aria-label="开始录音">${icon("mic")}</button><p class="record-help">点击录音，音频只留在这台设备</p>` : `<div class="notice">${icon("info")}<span>${window.isSecureContext ? "当前浏览器不支持录音。你仍可完成表达和无录音复盘。" : "当前不是 HTTPS，麦克风可能不可用。"}</span></div>`}
                  <label class="secondary-button block" style="cursor:pointer">${icon("volume")} 导入手机已有录音<input id="audio-file-input" type="file" accept="audio/*" hidden></label>
                  <button class="quiet-button block" data-action="skip-recording">不录音，直接进入复盘</button>
                </div>`
          }
          <div class="notice neutral">${icon("shield")}<span>发声不舒服时停止练习。这里只训练表达与舒适度，不判断发声位置，也不做嗓音诊断。</span></div>
          <button class="text-button center-button" data-action="practice-prev" data-prev="recall">返回关键词</button>
        </section>
      </main>
    </div>`;
  }

  function attemptMetrics(attempt) {
    if (!attempt?.metrics) return "";
    return `<div class="metric-row">
      <div class="metric"><strong>${formatClock(attempt.durationSec)}</strong><span>表达时长</span></div>
      <div class="metric"><strong>${attempt.metrics.stability}</strong><span>音量稳定度</span></div>
      <div class="metric"><strong>${attempt.metrics.pauseGroups}</strong><span>明显停顿组</span></div>
    </div>`;
  }

  function renderPracticeReview() {
    const practice = state.practice;
    const lesson = getLesson(practice.lessonId);
    const ability = getAbility(lesson.ability);
    const latest = practice.attempts.at(-1);
    return `<div class="page page-practice">
      ${practiceHeader(lesson)}
      <main class="practice-shell">
        <section class="practice-center fade-in">
          <div class="practice-copy">
            <div class="eyebrow">第 4 步 · 改</div>
            <h1>只找一个问题，<br>然后再说一遍。</h1>
            <p>先回听录音，再选择一个真实状态。不需要用很多评分证明自己练过。</p>
          </div>
          <section class="content-card">
            <div class="content-label">本次录音</div>
            ${practice.attempts.length ? practice.attempts.map((attempt, index) => attemptAudioCard(attempt, `第 ${index + 1} 遍`)).join("") : `<div class="empty-mini"><p>本次没有录音。继续确认状态并保存即可。</p></div>`}
            ${latest ? attemptMetrics(latest) : ""}
            ${
              practice.attempts.length > 1
                ? `<div class="compare-card"><div class="compare-item"><strong>${formatClock(practice.attempts[0].durationSec || 0)}</strong><span>第 1 遍</span></div><span class="compare-arrow">${icon("chevron")}</span><div class="compare-item"><strong>${formatClock(latest.durationSec || 0)}</strong><span>第 2 遍</span></div></div>`
                : ""
            }
          </section>
          <form id="training-complete">
            <section class="content-card">
              <h3>这次的状态</h3>
              ${practiceStatusForm(practice)}
            </section>
            <section class="content-card">
              <h3>只留一句提醒</h3>
              <textarea class="notes-input" id="training-notes" maxlength="180" placeholder="例如：结论后停顿；把第二项待办说清楚；第一句慢一点。">${esc(practice.notes)}</textarea>
            </section>
            ${
              practice.mode === "full" && practice.attempts.length === 1 && practice.attempts[0].blob
                ? `<button class="secondary-button block" type="button" data-action="retry-apply">${icon("refresh")} 按这个提醒再说一遍</button>`
                : ""
            }
            <div class="bottom-cta"><button class="primary-button block" type="submit">保存这次训练 ${icon("check")}</button></div>
          </form>
        </section>
      </main>
    </div>`;
  }

  function renderPractice() {
    if (!state.practice) {
      navigate("today");
      return "";
    }
    switch (state.practice.step) {
      case "quick":
        return renderPracticeQuick();
      case "reviewQuick":
        return renderPracticeReviewQuick();
      case "follow":
        return renderPracticeFollow();
      case "recall":
        return renderPracticeRecall();
      case "apply":
        return renderPracticeApply();
      case "review":
        return renderPracticeReview();
      default:
        return renderPracticeFollow();
    }
  }

  function startStageTimer(seconds) {
    clearStageTimer();
    if (!state.practice) return;
    state.practice.timerLeft = seconds;
    const update = () => {
      const clock = document.getElementById("practice-clock");
      if (clock) clock.textContent = formatClock(state.practice.timerLeft);
    };
    update();
    state.stageTimer = setInterval(() => {
      if (!state.practice) {
        clearStageTimer();
        return;
      }
      state.practice.timerLeft -= 1;
      update();
      if (state.practice.timerLeft <= 0) {
        clearStageTimer();
        showToast("时间到，可以继续或进入下一步");
      }
    }, 1000);
  }

  function movePractice(next) {
    if (!state.practice) return;
    clearStageTimer();
    state.practice.step = next;
    state.practice.hintRevealed = false;
    render();
  }

  function previousPractice(previous) {
    if (!state.practice) return;
    clearStageTimer();
    state.practice.step = previous;
    state.practice.hintRevealed = false;
    render();
  }

  function chooseMimeType() {
    const types = ["audio/mp4", "audio/mp4;codecs=mp4a.40.2", "audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus"];
    return types.find((type) => MediaRecorder.isTypeSupported(type)) || "";
  }

  async function startRecording() {
    if (!state.practice || !recordingSupported()) {
      showToast("当前环境无法录音");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
        },
      });
      const mimeType = chooseMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      state.mediaStream = stream;
      state.mediaRecorder = recorder;
      state.volumeSamples = [];
      const chunks = [];
      recorder.ondataavailable = (event) => {
        if (event.data?.size) chunks.push(event.data);
      };
      recorder.onstop = () => {
        if (!state.practice) return;
        const durationSec = Math.max(0.1, state.practice.recordElapsed || 0);
        if (state.practice.discardRecording) return;
        const blob = chunks.length ? new Blob(chunks, { type: recorder.mimeType || mimeType }) : null;
        state.practice.attempts.push({
          durationSec,
          blob,
          metrics: blob ? analyzeVolume(state.volumeSamples, durationSec) : null,
        });
        state.practice.discardRecording = false;
        releaseMediaAfterRecording();
        state.practice.recording = false;
        state.practice.step = "review";
        render();
      };
      recorder.onerror = () => {
        state.practice.micError = "录音出现错误，已切换到无录音复盘。";
        releaseMediaAfterRecording();
        state.practice.recording = false;
        state.practice.step = "review";
        render();
      };
      setupAnalyser(stream);
      state.practice.recording = true;
      state.practice.recordingStartedAt = Date.now();
      state.practice.recordElapsed = 0;
      state.practice.micError = "";
      recorder.start(500);
      render();
      startRecordingTimers();
    } catch (error) {
      const denied = error?.name === "NotAllowedError" || error?.name === "PermissionDeniedError";
      state.practice.micError = denied
        ? "麦克风权限被拒绝，可使用导入录音或无录音复盘。"
        : "没有成功打开麦克风，可使用无录音复盘。";
      render();
    }
  }

  function releaseMediaAfterRecording() {
    state.mediaStream?.getTracks().forEach((track) => track.stop());
    state.mediaStream = null;
    if (state.audioContext && state.audioContext.state !== "closed") {
      state.audioContext.close().catch(() => {});
    }
    state.audioContext = null;
    state.analyser = null;
    state.mediaRecorder = null;
  }

  function setupAnalyser(stream) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      state.audioContext = new AudioCtx();
      const source = state.audioContext.createMediaStreamSource(stream);
      state.analyser = state.audioContext.createAnalyser();
      state.analyser.fftSize = 512;
      source.connect(state.analyser);
    } catch {
      state.analyser = null;
    }
  }

  function sampleVolume() {
    if (!state.practice || !state.practice.recording || !state.analyser) return;
    const data = new Uint8Array(state.analyser.fftSize);
    state.analyser.getByteTimeDomainData(data);
    let sum = 0;
    data.forEach((value) => {
      const normalized = (value - 128) / 128;
      sum += normalized * normalized;
    });
    const level = clamp(Math.round(Math.sqrt(sum / data.length) * 320), 0, 100);
    state.volumeSamples.push(level);
    const bars = [...document.querySelectorAll(".volume-bar")];
    const tail = state.volumeSamples.slice(-bars.length);
    bars.forEach((bar, index) => {
      const value = tail[index] || 0;
      bar.style.height = `${8 + Math.round((value / 100) * 48)}px`;
      bar.classList.toggle("active", value > 8);
    });
  }

  function startRecordingTimers() {
    const maxSeconds = state.practice.mode === "standard" ? 60 : 90;
    clearInterval(state.recordTimer);
    clearInterval(state.volumeTimer);
    state.recordTimer = setInterval(() => {
      if (!state.practice?.recording) {
        clearInterval(state.recordTimer);
        return;
      }
      state.practice.recordElapsed = (Date.now() - state.practice.recordingStartedAt) / 1000;
      const clock = document.getElementById("record-clock");
      if (clock) clock.textContent = formatClock(state.practice.recordElapsed);
      if (state.practice.recordElapsed >= maxSeconds) stopRecording();
    }, 200);
    state.volumeTimer = setInterval(sampleVolume, 100);
  }

  function stopRecording() {
    if (!state.practice?.recording) return;
    state.practice.recordElapsed = (Date.now() - state.practice.recordingStartedAt) / 1000;
    clearInterval(state.recordTimer);
    clearInterval(state.volumeTimer);
    if (state.mediaRecorder?.state === "recording") state.mediaRecorder.stop();
  }

  function analyzeVolume(samples, durationSec) {
    if (!samples.length) return null;
    const avg = average(samples);
    const variance = average(samples.map((value) => (value - avg) ** 2));
    const stability = clamp(Math.round(100 - (Math.sqrt(variance) / Math.max(avg, 1)) * 100), 0, 100);
    const threshold = Math.max(3, avg * 0.26);
    let silentRun = 0;
    let pauseGroups = 0;
    samples.forEach((value) => {
      if (value <= threshold) silentRun += 1;
      else {
        if (silentRun >= 12) pauseGroups += 1;
        silentRun = 0;
      }
    });
    if (silentRun >= 12) pauseGroups += 1;
    return { averageLevel: Math.round(avg), stability, pauseGroups, durationSec };
  }

  function skipRecording() {
    if (!state.practice) return;
    cleanupPracticeMedia({ discard: true });
    state.practice.recording = false;
    state.practice.step = "review";
    render();
  }

  function retryApply() {
    if (!state.practice) return;
    cleanupPracticeMedia();
    state.practice.step = "apply";
    state.practice.recordElapsed = 0;
    render();
  }

  function loadAudioFile(file) {
    if (!state.practice || !file) return;
    if (!file.type.startsWith("audio/") && !/\.(m4a|mp3|wav|aac|ogg|webm|mp4)$/i.test(file.name)) {
      showToast("请选择音频文件");
      return;
    }
    const audio = new Audio();
    const localUrl = URL.createObjectURL(file);
    audio.preload = "metadata";
    audio.onloadedmetadata = () => {
      state.practice.attempts.push({
        durationSec: Number.isFinite(audio.duration) ? audio.duration : 0,
        blob: file,
        metrics: null,
      });
      URL.revokeObjectURL(localUrl);
      state.practice.step = "review";
      render();
    };
    audio.onerror = () => {
      URL.revokeObjectURL(localUrl);
      state.practice.attempts.push({ durationSec: 0, blob: file, metrics: null });
      state.practice.step = "review";
      render();
    };
    audio.src = localUrl;
  }

  async function completeTraining() {
    const practice = state.practice;
    if (!practice || practice.saving) return;
    practice.saving = true;
    const lesson = getLesson(practice.lessonId);
    const ability = getAbility(lesson.ability);
    const selected = document.querySelector('input[name="training-status"]:checked');
    practice.status = selected?.value || practice.status || "能用";
    practice.notes = document.getElementById("training-notes")?.value.trim() || practice.notes;
    const createdAt = new Date().toISOString();
    const today = todayKey();
    let progress = {
      ...getLessonProgress(lesson.id),
      lessonId: lesson.id,
      updatedAt: createdAt,
      lastPracticeDate: today,
      mastery: practice.status,
      lastMode: practice.mode,
    };
    if (practice.isReview) {
      progress.reviewStep =
        practice.status === "还生"
          ? 0
          : Math.min((progress.reviewStep || 0) + 1, REVIEW_GAPS.length - 1);
      progress.nextReview = addDays(today, REVIEW_GAPS[progress.reviewStep]);
      progress.lastReviewDate = today;
    } else {
      progress.completed = practice.mode !== "quick" || Boolean(progress.completed);
      progress.reviewStep = 0;
      progress.nextReview = addDays(today, 1);
      progress.quickCount = (progress.quickCount || 0) + (practice.mode === "quick" ? 1 : 0);
      progress.lastTrainingDate = today;
    }
    const session = {
      id: uid(),
      schemaVersion: 2,
      lessonId: lesson.id,
      title: lesson.title,
      goldLine: lesson.goldLine,
      ability: lesson.ability,
      abilityTitle: ability.title,
      mode: practice.isReview ? "review" : practice.mode,
      modeLabel: practiceModeLabel(practice.isReview ? "review" : practice.mode),
      isReview: practice.isReview,
      status: practice.status,
      notes: practice.notes,
      createdAt,
      durationSec: practice.attempts.reduce((sum, attempt) => sum + Number(attempt.durationSec || 0), 0),
      attempts: practice.attempts,
      nextReview: progress.nextReview,
      usedInReal: false,
    };
    try {
      await putSession(session);
      await putProgress(progress);
      await refreshData();
      cleanupPracticeMedia();
      state.practice = null;
      navigate(`record/${session.id}`);
      showToast(practice.isReview ? "复习已完成" : "训练已保存在本机");
    } catch (error) {
      console.error("Save failed", error);
      practice.saving = false;
      showToast("保存失败，请检查浏览器本地存储");
    }
  }

  async function copyText(text) {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      showToast("已复制");
      return;
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
      showToast("已复制");
    }
  }

  function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  }

  function dataUrlToBlob(dataUrl) {
    const [header, encoded] = String(dataUrl).split(",");
    const mime = header.match(/data:([^;]+)/)?.[1] || "audio/mp4";
    const binary = atob(encoded || "");
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return new Blob([bytes], { type: mime });
  }

  async function exportData() {
    try {
      const sessions = await Promise.all(
        state.sessions.map(async (session) => ({
          ...session,
          attempts: await Promise.all(
            (session.attempts || []).map(async (attempt) => ({
              ...attempt,
              blob: undefined,
              audioDataUrl: attempt.blob ? await blobToDataUrl(attempt.blob) : null,
            })),
          ),
        })),
      );
      const payload = {
        app: "会说话",
        schemaVersion: 2,
        exportedAt: new Date().toISOString(),
        note: "此文件可能包含个人录音，请妥善保管。",
        sessions,
        progress: Object.values(state.progress),
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `会说话-备份-${todayKey()}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      showToast("本机记录已导出");
    } catch (error) {
      console.error(error);
      showToast("导出失败");
    }
  }

  async function importData(file) {
    if (!file) return;
    try {
      const payload = JSON.parse(await file.text());
      const sessions = Array.isArray(payload) ? payload : payload.sessions || [];
      const progressRows = Array.isArray(payload.progress) ? payload.progress : [];
      let imported = 0;
      let skipped = 0;
      for (const raw of sessions) {
        if (!raw?.id || state.sessions.some((session) => session.id === raw.id)) {
          skipped += 1;
          continue;
        }
        const attempts = [];
        for (const rawAttempt of raw.attempts || []) {
          const { audioDataUrl, ...attempt } = rawAttempt;
          attempts.push({
            ...attempt,
            blob: audioDataUrl ? dataUrlToBlob(audioDataUrl) : null,
          });
        }
        await putSession({ ...raw, attempts });
        imported += 1;
      }
      for (const progress of progressRows) {
        if (progress?.lessonId && getLesson(progress.lessonId)) {
          await putProgress(progress);
        }
      }
      await refreshData();
      render();
      showToast(
        imported
          ? `已导入 ${imported} 条记录${skipped ? `，跳过 ${skipped} 条重复记录` : ""}`
          : "没有新的记录需要导入",
      );
    } catch (error) {
      console.error(error);
      showToast("导入失败，请选择由“会说话”导出的 JSON 文件");
    }
  }

  async function clearAllData() {
    if (!window.confirm("这会永久删除本机全部练习记录、录音和训练进度，无法恢复。确定清空吗？")) return;
    try {
      await Promise.all([
        idbRequest("sessions", "readwrite", (store) => store.clear()),
        idbRequest("progress", "readwrite", (store) => store.clear()),
      ]);
      state.sessions = [];
      state.progress = {};
      localStorage.removeItem("hsh-v2-daily");
      render();
      showToast("本机数据已清空");
    } catch (error) {
      console.error(error);
      showToast("清空失败");
    }
  }

  async function deleteSessionRecord(id) {
    const session = state.sessions.find((item) => item.id === id);
    if (!session || !window.confirm(`确定删除“${sessionTitle(session)}”及其录音吗？`)) return;
    try {
      await removeSession(id);
      state.sessions = state.sessions.filter((item) => item.id !== id);
      navigate("reviews");
      showToast("记录已删除");
    } catch (error) {
      console.error(error);
      showToast("删除失败");
    }
  }

  async function markUsed(id) {
    const session = state.sessions.find((item) => item.id === id);
    if (!session) return;
    const updated = { ...session, usedInReal: !session.usedInReal };
    try {
      await putSession(updated);
      state.sessions = state.sessions.map((item) => (item.id === id ? updated : item));
      if (updated.lessonId) {
        const progress = getLessonProgress(updated.lessonId);
        await putProgress({
          ...progress,
          lessonId: updated.lessonId,
          lastRealUse: updated.usedInReal ? todayKey() : progress.lastRealUse || null,
        });
        state.progress[updated.lessonId] = {
          ...progress,
          lessonId: updated.lessonId,
          lastRealUse: updated.usedInReal ? todayKey() : progress.lastRealUse || null,
        };
      }
      render();
    } catch (error) {
      console.error(error);
      showToast("更新失败");
    }
  }

  function updateLibraryResults() {
    const results = document.getElementById("library-results");
    if (results) results.innerHTML = libraryResultsMarkup();
  }

  function render() {
    releaseObjectUrls();
    stopAudio();
    parseRoute();
    let html = "";
    switch (state.route) {
      case "today":
        html = renderToday();
        break;
      case "abilities":
        html = renderAbilities();
        break;
      case "ability":
        html = renderAbilityDetail(getAbility(state.routeId));
        break;
      case "lesson":
        html = renderLessonDetail(getLesson(state.routeId));
        break;
      case "library":
        html = renderLibrary();
        break;
      case "reviews":
        html = renderReviews();
        break;
      case "record":
        html = renderRecordDetail(state.sessions.find((session) => session.id === state.routeId));
        break;
      case "practice":
        html = renderPractice();
        break;
      default:
        html = renderToday();
    }
    app.innerHTML = html;
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  app.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-action]");
    if (!trigger) return;
    const action = trigger.dataset.action;
    const id = trigger.dataset.id;
    switch (action) {
      case "navigate":
        navigate(trigger.dataset.route);
        break;
      case "back":
        goBack();
        break;
      case "open-ability":
        navigate(`ability/${id}`);
        break;
      case "open-lesson":
        navigate(`lesson/${id}`);
        break;
      case "start-mode":
        startMode(id, trigger.dataset.mode, false);
        break;
      case "start-review":
        startMode(id, "review", true);
        break;
      case "exit-practice":
        exitPractice();
        break;
      case "speak":
      case "speak-reading": {
        const lesson = getLesson(state.practice?.lessonId || state.routeId);
        if (lesson) speakText(lesson.reading);
        break;
      }
      case "speak-gold": {
        const lesson = getLesson(state.practice?.lessonId);
        if (lesson) speakText(lesson.goldLine);
        break;
      }
      case "start-timer":
        startStageTimer(Number(trigger.dataset.seconds || 60));
        break;
      case "practice-next":
        movePractice(trigger.dataset.next);
        break;
      case "practice-prev":
        previousPractice(trigger.dataset.prev);
        break;
      case "reveal-hint":
        state.practice.hintRevealed = true;
        render();
        break;
      case "start-recording":
        startRecording();
        break;
      case "stop-recording":
        stopRecording();
        break;
      case "skip-recording":
        skipRecording();
        break;
      case "retry-apply":
        retryApply();
        break;
      case "open-record":
        navigate(`record/${id}`);
        break;
      case "mark-used":
        markUsed(id);
        break;
      case "delete-record":
        deleteSessionRecord(id);
        break;
      case "library-filter":
        state.libraryFilter = trigger.dataset.value;
        render();
        break;
      case "copy-phrase":
        copyText(trigger.dataset.text || "");
        break;
      case "export-data":
        exportData();
        break;
      case "clear-data":
        clearAllData();
        break;
      default:
        break;
    }
  });

  app.addEventListener("submit", (event) => {
    if (event.target.id === "training-complete") {
      event.preventDefault();
      completeTraining();
    }
  });

  app.addEventListener("input", (event) => {
    if (event.target.id === "library-search") {
      state.libraryQuery = event.target.value;
      updateLibraryResults();
    }
  });

  app.addEventListener("change", (event) => {
    if (event.target.name === "training-status") {
      document.querySelectorAll(".mastery-options label").forEach((label) => {
        label.classList.toggle("active", label.querySelector("input")?.checked);
      });
      if (state.practice) state.practice.status = event.target.value;
    }
    if (event.target.id === "audio-file-input") {
      loadAudioFile(event.target.files?.[0]);
    }
    if (event.target.id === "record-import-input") {
      importData(event.target.files?.[0]).finally(() => {
        event.target.value = "";
      });
    }
  });

  window.addEventListener("hashchange", () => {
    const next = location.hash;
    if (state.practice && !next.startsWith("#/practice")) {
      cleanupPracticeMedia({ discard: true });
      state.practice = null;
    }
    render();
  });

  window.addEventListener("beforeunload", (event) => {
    if (state.practice?.recording) {
      event.preventDefault();
      event.returnValue = "";
    }
  });

  async function init() {
    if (!location.hash) history.replaceState(null, "", "#/today");
    parseRoute();
    await refreshData();
    render();
    if ("serviceWorker" in navigator && window.isSecureContext) {
      navigator.serviceWorker.register("./sw.js").catch((error) => {
        console.warn("Service worker registration failed", error);
      });
    }
  }

  init();
})();
