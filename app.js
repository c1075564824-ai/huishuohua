(() => {
  "use strict";

  const C = window.HSH_CONTENT;
  const app = document.getElementById("app");
  const toastEl = document.getElementById("toast");

  const ICON_PATHS = {
    logo: '<path d="M7 9.5a5 5 0 0 1 10 0v3a3 3 0 0 1-3 3h-1v-2h1a1 1 0 0 0 1-1v-3a3 3 0 0 0-6 0v3a1 1 0 0 0 1 1h1v2H9a3 3 0 0 1-3-3v-3Z"/><path d="M10 8.5h4v5h-4z"/>',
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10Z"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 16 9 5 9-5"/>',
    voice: '<path d="M4 10v4"/><path d="M8 7v10"/><path d="M12 4v16"/><path d="M16 7v10"/><path d="M20 10v4"/>',
    history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    code: '<path d="m8 9-4 3 4 3"/><path d="m16 9 4 3-4 3"/><path d="m14 5-4 14"/>',
    spark: '<path d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3Z"/><path d="m5 16 .8 2.2L8 19l-2.2.8L5 22l-.8-2.2L2 19l2.2-.8L5 16Z"/>',
    chart: '<path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/>',
    cup: '<path d="M5 7h11v6a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5V7Z"/><path d="M16 9h2a3 3 0 0 1 0 6h-2"/><path d="M4 21h14"/>',
    check: '<path d="m5 12 4 4L19 6"/><path d="M4 4h16v16H4z"/>',
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>',
    question: '<circle cx="12" cy="12" r="9"/><path d="M9.7 9a2.4 2.4 0 1 1 3.8 2c-.9.6-1.5 1.2-1.5 2.5"/><path d="M12 17h.01"/>',
    chevron: '<path d="m9 18 6-6-6-6"/>',
    arrowLeft: '<path d="m15 18-6-6 6-6"/>',
    arrowUpRight: '<path d="M7 17 17 7"/><path d="M8 7h9v9"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/><path d="M9 21h6"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
    play: '<path d="m8 5 11 7-11 7V5Z"/>',
    audio: '<path d="M4 10v4h4l5 4V6L8 10H4Z"/><path d="M16 9a4 4 0 0 1 0 6"/><path d="M18.5 6.5a8 8 0 0 1 0 11"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>',
    shield: '<path d="M12 3 4 6v5c0 5 3.4 8.5 8 10 4.6-1.5 8-5 8-10V6l-8-3Z"/><path d="m9 12 2 2 4-5"/>',
    download: '<path d="M12 3v12"/><path d="m8 11 4 4 4-4"/><path d="M4 20h16"/>',
    trash: '<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="m6 7 1 14h10l1-14"/><path d="M10 11v6M14 11v6"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    list: '<path d="M9 6h12M9 12h12M9 18h12"/><path d="M4 6h.01M4 12h.01M4 18h.01"/>',
    lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    notes: '<path d="M5 3h11l3 3v15H5V3Z"/><path d="M9 11h6M9 15h6"/>',
    refresh: '<path d="M20 6v5h-5"/><path d="M4 18v-5h5"/><path d="M18.5 9A7 7 0 0 0 6 6.5L4 9"/><path d="M5.5 15A7 7 0 0 0 18 17.5l2-2.5"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>',
  };

  const icon = (name, className = "") =>
    `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[name] || ICON_PATHS.info}</svg>`;

  const state = {
    route: "home",
    routeId: "",
    sessions: [],
    sessionsLoaded: false,
    practice: null,
    objectUrls: new Set(),
    prepTimer: null,
    recordTimer: null,
    volumeTimer: null,
    mediaRecorder: null,
    mediaStream: null,
    audioContext: null,
    analyser: null,
    volumeSamples: [],
    toastTimer: null,
    storageAvailable: true,
  };

  const allScenarios = C.scenarioGroups.flatMap((group) =>
    group.items.map((item) => ({ ...item, groupId: group.id, group })),
  );
  const allLessons = C.voiceWeeks.flatMap((week) =>
    week.lessons.map((lesson) => ({ ...lesson, weekNumber: week.week, weekTitle: week.title })),
  );

  const esc = (value = "") =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const pad = (value) => String(Math.max(0, Math.floor(value))).padStart(2, "0");
  const formatClock = (seconds) => `${pad(seconds / 60)}:${pad(seconds % 60)}`;
  const todayKey = (date = new Date()) => {
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    return `${year}-${month}-${day}`;
  };
  const uid = () =>
    window.crypto?.randomUUID?.() ||
    `hsh-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const clamp = (number, min, max) => Math.max(min, Math.min(max, number));
  const average = (values) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0);

  function showToast(message) {
    clearTimeout(state.toastTimer);
    toastEl.textContent = message;
    toastEl.classList.add("show");
    state.toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2400);
  }

  function dayLabel(date = new Date()) {
    const week = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][date.getDay()];
    return `${date.getMonth() + 1}月${date.getDate()}日 · ${week}`;
  }

  function getScenario(id) {
    return allScenarios.find((item) => item.id === id);
  }

  function getLesson(id) {
    return allLessons.find((item) => item.id === id);
  }

  function getGroup(id) {
    return C.scenarioGroups.find((group) => group.id === id);
  }

  function getWeek(weekNumber) {
    return C.voiceWeeks.find((week) => week.week === Number(weekNumber));
  }

  function openDB() {
    return new Promise((resolve, reject) => {
      if (!("indexedDB" in window)) {
        reject(new Error("IndexedDB unavailable"));
        return;
      }
      const request = indexedDB.open("huishuohua-local", 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("sessions")) {
          const store = db.createObjectStore("sessions", { keyPath: "id" });
          store.createIndex("createdAt", "createdAt");
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error("Database blocked"));
    });
  }

  async function putSession(session) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("sessions", "readwrite");
      transaction.objectStore("sessions").put(session);
      transaction.oncomplete = () => {
        db.close();
        resolve();
      };
      transaction.onerror = () => {
        db.close();
        reject(transaction.error);
      };
    });
  }

  async function readSessions() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const request = db.transaction("sessions", "readonly").objectStore("sessions").getAll();
      request.onsuccess = () => {
        db.close();
        resolve(request.result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      };
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  }

  async function deleteSessionRecord(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("sessions", "readwrite");
      transaction.objectStore("sessions").delete(id);
      transaction.oncomplete = () => {
        db.close();
        resolve();
      };
      transaction.onerror = () => {
        db.close();
        reject(transaction.error);
      };
    });
  }

  async function clearSessionRecords() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("sessions", "readwrite");
      transaction.objectStore("sessions").clear();
      transaction.oncomplete = () => {
        db.close();
        resolve();
      };
      transaction.onerror = () => {
        db.close();
        reject(transaction.error);
      };
    });
  }

  async function refreshSessions() {
    try {
      state.sessions = await readSessions();
      state.storageAvailable = true;
    } catch (error) {
      console.warn("Local storage unavailable", error);
      state.sessions = [];
      state.storageAvailable = false;
    } finally {
      state.sessionsLoaded = true;
    }
  }

  function releaseObjectUrls() {
    state.objectUrls.forEach((url) => URL.revokeObjectURL(url));
    state.objectUrls.clear();
  }

  function createAudioUrl(blob) {
    if (!blob) return "";
    const url = URL.createObjectURL(blob);
    state.objectUrls.add(url);
    return url;
  }

  function parseRoute() {
    const raw = window.location.hash.replace(/^#\/?/, "");
    const [route = "home", ...idParts] = raw.split("/");
    state.route = route || "home";
    state.routeId = decodeURIComponent(idParts.join("/") || "");
  }

  function navigate(path) {
    const nextHash = `#/${path.replace(/^#\/?/, "")}`;
    if (window.location.hash === nextHash) {
      parseRoute();
      render();
      return;
    }
    window.location.hash = nextHash;
  }

  function goBack() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate("home");
    }
  }

  function topbar() {
    return `<header class="topbar">
      <div class="brand">
        <span class="brand-mark">${icon("logo")}</span>
        <span class="brand-name">会说话</span>
      </div>
      <div class="date-label">${dayLabel()}<br>每天练一点，现场少一点紧张</div>
    </header>`;
  }

  function backbar(title, action = "back") {
    return `<header class="backbar">
      <button class="icon-button" data-action="${action}" aria-label="返回">${icon("arrowLeft")}</button>
      <div class="backbar-title">${esc(title)}</div>
      <span aria-hidden="true"></span>
    </header>`;
  }

  function bottomNav(active) {
    const items = [
      ["home", "home", "今日"],
      ["scenarios", "layers", "场景"],
      ["voice", "voice", "发声"],
      ["records", "history", "记录"],
    ];
    return `<nav class="bottom-nav" aria-label="主导航">
      ${items
        .map(
          ([route, iconName, label]) => `<button class="nav-item ${active === route ? "active" : ""}" data-action="navigate" data-route="${route}">
            ${icon(iconName)}<span>${label}</span>
          </button>`,
        )
        .join("")}
    </nav>`;
  }

  function getDailyPlan() {
    const date = new Date();
    const start = new Date(date.getFullYear(), 0, 0);
    const day = Math.floor((date - start) / 86400000);
    const voice = allLessons[day % allLessons.length];
    const scenarioA = allScenarios[day % allScenarios.length];
    const summaries = getGroup("summary").items;
    const summary = summaries[day % summaries.length];
    return [
      { kind: "voice", id: voice.id, title: voice.title, subtitle: `发声 · ${voice.minutes} 分钟 · ${voice.label}` },
      { kind: "scenario", id: scenarioA.id, title: scenarioA.title, subtitle: `${scenarioA.group.shortTitle} · ${Math.ceil(scenarioA.durationSec / 60)} 分钟 · ${scenarioA.structure}` },
      { kind: "scenario", id: summary.id, title: summary.title, subtitle: `会议总结 · 90 秒 · 结论—待办—时间` },
    ];
  }

  function practicedDays() {
    return new Set(
      state.sessions.map((session) => todayKey(new Date(session.createdAt))),
    );
  }

  function calcStreak() {
    const days = practicedDays();
    if (!days.size) return 0;
    const cursor = new Date();
    cursor.setHours(12, 0, 0, 0);
    if (!days.has(todayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
    let streak = 0;
    while (days.has(todayKey(cursor))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }

  function weekStrip() {
    const days = practicedDays();
    const now = new Date();
    now.setHours(12, 0, 0, 0);
    const mondayOffset = (now.getDay() + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - mondayOffset);
    const labels = ["一", "二", "三", "四", "五", "六", "日"];
    return `<div class="week-strip">
      ${labels
        .map((label, index) => {
          const date = new Date(monday);
          date.setDate(monday.getDate() + index);
          const key = todayKey(date);
          const done = days.has(key);
          const today = key === todayKey();
          return `<div class="week-day ${done ? "done" : ""} ${today ? "today" : ""}">
            <span class="week-dot">${done ? icon("check") : ""}</span>
            <span>周${label}</span>
          </div>`;
        })
        .join("")}
    </div>`;
  }

  function renderHome() {
    const plan = getDailyPlan();
    const streak = calcStreak();
    const insights = [
      ["先让气走，再让声出", "开口前做一次轻哼，把第一句话说得轻一点，往往比直接用力更清楚。"],
      ["观点不要超过三个", "即兴表达时，给自己一个“三件事”框架，听众更容易跟上。"],
      ["停顿是在留位置", "说完结论后停两秒，比重复解释更能让重点被听见。"],
      ["录音只留在这台设备", "第一版不接入云端，也不会上传你的练习音频。"],
    ];
    const insight = insights[new Date().getDate() % insights.length];
    const inWechat = /MicroMessenger/i.test(navigator.userAgent);
    return `<div class="page">
      ${topbar()}
      ${
        inWechat
          ? `<div class="notice neutral" style="margin-bottom:12px">${icon("book")}<span>建议点微信右上角「···」，选择“浮窗”或“收藏”，以后每天都能一键打开。</span></div>`
          : ""
      }
      <section class="hero-card fade-in">
        <div class="hero-kicker">今日练习 · 15～25 分钟</div>
        <h1 class="hero-title">把话说清楚，<br>也说得有力量。</h1>
        <p class="hero-subtitle">一次练发声，一次练场景，再把讨论收成行动。连续第 ${streak || 1} 天，从第一句话开始。</p>
        <div class="hero-actions">
          <div class="hero-meta">${icon("clock")} 约 18 分钟</div>
          <button class="primary-button" data-action="start-practice" data-kind="${plan[0].kind}" data-id="${plan[0].id}">
            开始练习 ${icon("arrowUpRight")}
          </button>
        </div>
      </section>

      <section class="section fade-in delay-one">
        <div class="section-head">
          <div><h2>今天练什么</h2><p>少而具体，每次只改一个动作。</p></div>
          <span class="text-button">${streak ? `连续 ${streak} 天` : "今天开始"}</span>
        </div>
        ${weekStrip()}
        <div class="plan-card" style="margin-top: 12px">
          ${plan
            .map(
              (item, index) => `<button class="plan-row" data-action="start-practice" data-kind="${item.kind}" data-id="${item.id}">
                <span class="plan-number">0${index + 1}</span>
                <span><span class="plan-title">${esc(item.title)}</span><span class="plan-subtitle">${esc(item.subtitle)}</span></span>
                <span class="plan-arrow">${icon("chevron")}</span>
              </button>`,
            )
            .join("")}
        </div>
      </section>

      <section class="section fade-in delay-two">
        <div class="section-head">
          <div><h2>换个场景</h2><p>不是背话术，是把结构练成习惯。</p></div>
          <button class="text-button" data-action="navigate" data-route="scenarios">全部 ${icon("chevron")}</button>
        </div>
        <div class="scenario-scroll">
          ${C.scenarioGroups
            .map(
              (group) => `<button class="scenario-tile ${group.color}" data-action="open-group" data-id="${group.id}">
                <span class="tile-icon">${icon(group.icon)}</span>
                <span class="tile-arrow">${icon("arrowUpRight")}</span>
                <h3>${esc(group.title)}</h3>
                <p>${esc(group.description)}</p>
              </button>`,
            )
            .join("")}
        </div>
      </section>

      <section class="section">
        <div class="insight-card">
          <span class="mini-icon">${icon("spark")}</span>
          <div><h3>${esc(insight[0])}</h3><p>${esc(insight[1])}</p></div>
        </div>
      </section>
    </div>
    ${bottomNav("home")}`;
  }

  function renderScenarios() {
    return `<div class="page">
      ${topbar()}
      <header class="page-heading fade-in">
        <div class="eyebrow">Scenario practice</div>
        <h1>把真实场面，<br>提前练一遍。</h1>
        <p>先搭结构，再开口。每个场景都按“准备—表达—回听—复盘—重练”完成一次闭环。</p>
      </header>
      <div class="group-grid fade-in delay-one">
        ${C.scenarioGroups
          .map(
            (group) => `<button class="group-card ${group.color}" data-action="open-group" data-id="${group.id}">
              <span class="group-icon">${icon(group.icon)}</span>
              <h3>${esc(group.title)}</h3>
              <p>${esc(group.description)}</p>
              <span class="group-meta">${esc(group.kicker)} ${icon("chevron")}</span>
            </button>`,
          )
          .join("")}
      </div>
      <div class="notice neutral" style="margin-top: 18px">
        ${icon("shield")}<span>录音和记录默认只保存在当前设备。不会自动上传，也不会发给任何第三方。</span>
      </div>
    </div>
    ${bottomNav("scenarios")}`;
  }

  function renderScenarioGroup(group) {
    if (!group) return renderScenarios();
    return `<div class="page">
      ${backbar(group.title, "back")}
      <header class="page-heading fade-in">
        <div class="eyebrow">${esc(group.kicker)}</div>
        <h1>${esc(group.title)}</h1>
        <p>${esc(group.description)} 每个题目都给出结构提示，先说清楚，再追求说得好。</p>
      </header>
      <div class="library-list">
        ${group.items
          .map(
            (item) => `<button class="library-item fade-in" data-action="open-scenario" data-id="${item.id}">
              <span>
                <h3>${esc(item.title)}</h3>
                <p>${esc(item.summary)}</p>
                <span class="library-meta">
                  <span class="meta-item">${icon("clock")} ${Math.ceil(item.durationSec / 60)} 分钟</span>
                  <span class="meta-item">${icon("list")} ${esc(item.structure)}</span>
                </span>
              </span>
              <span class="round-arrow">${icon("chevron")}</span>
            </button>`,
          )
          .join("")}
      </div>
    </div>
    ${bottomNav("scenarios")}`;
  }

  function renderScenarioDetail(item) {
    if (!item) return renderScenarios();
    return `<div class="page">
      ${backbar(item.group.title, "back")}
      <header class="detail-head fade-in">
        <span class="detail-kicker">${icon(item.group.icon)} ${esc(item.summary)}</span>
        <h1 class="detail-title">${esc(item.title)}</h1>
        <p class="detail-summary">${esc(item.prompt)}</p>
        <div class="detail-meta">
          <span class="meta-pill">${icon("clock")} 表达 ${formatClock(item.durationSec)}</span>
          <span class="meta-pill">${icon("target")} 准备 ${formatClock(item.prepSec)}</span>
        </div>
      </header>
      <section class="content-card fade-in delay-one">
        <div class="content-label">推荐结构</div>
        <div class="structure-flow">
          ${item.structure.split("→").map((step) => `<span class="structure-step">${esc(step.trim())}</span>`).join("")}
        </div>
      </section>
      <section class="content-card">
        <h3>先想这三个位置</h3>
        <div class="hint-chips">${item.hints.map((hint) => `<span class="hint-chip">${esc(hint)}</span>`).join("")}</div>
        <p style="margin-top: 12px">不必写完整稿。用关键词提醒自己，不背句子，现场才会自然。</p>
      </section>
      <section class="content-card">
        <div class="content-label">一句参考</div>
        <p>${esc(item.example)}</p>
      </section>
      <div class="notice neutral" style="margin-top: 14px">
        ${icon("info")}<span>首版不判断“发声位置是否正确”。复盘基于你的自评、录音回放和基础音量数据。</span>
      </div>
      <div class="bottom-cta">
        <button class="primary-button block" data-action="start-practice" data-kind="scenario" data-id="${item.id}">
          开始练习 ${icon("mic")}
        </button>
      </div>
    </div>
    ${bottomNav("scenarios")}`;
  }

  function renderVoice() {
    return `<div class="page">
      ${topbar()}
      <header class="page-heading fade-in">
        <div class="eyebrow">Voice foundation</div>
        <h1>声音不必用力，<br>也能被听见。</h1>
        <p>用四周建立气息、放松、共鸣和节奏的底子。每次只练一个动作，不追求“喊得更大”。</p>
      </header>
      <section class="voice-hero fade-in delay-one">
        <div class="hero-kicker">四周入门计划</div>
        <h2>从“嗓子说话”<br>走向“有支点地说”。</h2>
        <p>每天 5～9 分钟。录音前后对比，感受舒适度和稳定性的变化。</p>
        <div class="voice-orbit"></div>
      </section>
      ${C.voiceWeeks
        .map(
          (week, weekIndex) => `<section class="week-card">
            <div class="week-card-head">
              <div>
                <div class="week-label">WEEK ${week.week}</div>
                <h3>${esc(week.title)}</h3>
                <p>${esc(week.subtitle)}</p>
              </div>
              <div class="week-progress">${weekIndex === 0 ? "从这里开始" : `第 ${week.week} 周`}
                <div class="progress-track"><span style="width:${weekIndex === 0 ? 25 : 0}%"></span></div>
              </div>
            </div>
            ${week.lessons
              .map(
                (lesson) => `<button class="lesson-row" data-action="open-lesson" data-id="${lesson.id}">
                  <span class="lesson-index">${String(lesson.title.length).slice(-1).padStart(2, "0")}</span>
                  <span><span class="lesson-title">${esc(lesson.title)}</span><span class="lesson-sub">${esc(lesson.label)} · ${lesson.minutes} 分钟</span></span>
                  ${icon("chevron")}
                </button>`,
              )
              .join("")}
          </section>`,
        )
        .join("")}
      <div class="notice" style="margin-top: 18px">
        ${icon("info")}<span>训练中出现喉部疼痛、持续嘶哑或明显不适时，请立即停止。本工具是练习辅助，不用于诊断或治疗嗓音问题。</span>
      </div>
    </div>
    ${bottomNav("voice")}`;
  }

  function renderLesson(lesson) {
    if (!lesson) return renderVoice();
    return `<div class="page">
      ${backbar(`第 ${lesson.weekNumber} 周 · 发声`, "back")}
      <header class="detail-head fade-in">
        <span class="detail-kicker">${icon("voice")} ${esc(lesson.label)} · ${lesson.minutes} 分钟</span>
        <h1 class="detail-title">${esc(lesson.title)}</h1>
        <p class="detail-summary">${esc(lesson.goal)}</p>
        <div class="detail-meta">
          <span class="meta-pill">${icon("clock")} 核心练习 ${formatClock(lesson.exerciseSec)}</span>
          <span class="meta-pill">${icon("mic")} 需要录音对比</span>
        </div>
      </header>
      <section class="content-card">
        <div class="content-label">为什么练这个</div>
        <p>${esc(lesson.why)}</p>
      </section>
      <section class="content-card">
        <h3>具体动作</h3>
        <ol class="step-list">
          ${lesson.steps.map((step, index) => `<li data-index="${index + 1}">${esc(step)}</li>`).join("")}
        </ol>
      </section>
      <section class="content-card">
        <div class="content-label">跟读示范</div>
        <p style="font-family: var(--font-display); font-size: 16px; color: var(--ink)">${esc(lesson.sample)}</p>
      </section>
      <div class="notice ${lesson.caution.includes("停止") ? "danger" : ""}">
        ${icon("shield")}<span>${esc(lesson.caution)}</span>
      </div>
      <div class="bottom-cta">
        <button class="primary-button block" data-action="start-practice" data-kind="voice" data-id="${lesson.id}">
          开始这次训练 ${icon("mic")}
        </button>
      </div>
    </div>
    ${bottomNav("voice")}`;
  }

  function recordingSupported() {
    return Boolean(
      window.isSecureContext &&
        navigator.mediaDevices?.getUserMedia &&
        window.MediaRecorder,
    );
  }

  function cleanupPracticeMedia() {
    clearInterval(state.prepTimer);
    clearInterval(state.recordTimer);
    clearInterval(state.volumeTimer);
    state.prepTimer = null;
    state.recordTimer = null;
    state.volumeTimer = null;
    if (state.mediaRecorder?.state === "recording") {
      try {
        state.mediaRecorder.stop();
      } catch (error) {
        console.warn(error);
      }
    }
    state.mediaRecorder = null;
    if (state.mediaStream) {
      state.mediaStream.getTracks().forEach((track) => track.stop());
      state.mediaStream = null;
    }
    if (state.audioContext && state.audioContext.state !== "closed") {
      state.audioContext.close().catch(() => {});
    }
    state.audioContext = null;
    state.analyser = null;
    state.volumeSamples = [];
  }

  function createPractice(kind, itemId) {
    const item = kind === "voice" ? getLesson(itemId) : getScenario(itemId);
    if (!item) return null;
    const prepSeconds = kind === "scenario" ? item.prepSec : 30;
    return {
      id: uid(),
      kind,
      itemId,
      item,
      phase: "prep",
      attemptNumber: 1,
      attempts: [],
      keywords: ["", "", ""],
      prepRemainingSec: prepSeconds,
      prepRunning: false,
      current: {
        attemptNumber: 1,
        blob: null,
        mimeType: "",
        durationSec: 0,
        volumeSamples: [],
        ratings: {},
        notes: "",
        metrics: null,
      },
      review: null,
      micError: "",
      recordElapsed: 0,
      recordingStartedAt: 0,
      startedAt: Date.now(),
      saved: false,
      saving: false,
    };
  }

  function startPractice(kind, itemId) {
    cleanupPracticeMedia();
    const practice = createPractice(kind, itemId);
    if (!practice) {
      showToast("没有找到这个练习");
      return;
    }
    state.practice = practice;
    navigate("practice");
  }

  function collectKeywords() {
    if (!state.practice || state.practice.kind !== "scenario") return;
    state.practice.keywords = [...document.querySelectorAll(".keyword-input")].map(
      (input) => input.value.trim(),
    );
  }

  function startPrepCountdown() {
    const practice = state.practice;
    if (!practice) return;
    collectKeywords();
    practice.prepRunning = true;
    practice.prepRemainingSec = practice.item.prepSec;
    render();
    clearInterval(state.prepTimer);
    state.prepTimer = setInterval(() => {
      if (!state.practice || state.practice.phase !== "prep") {
        clearInterval(state.prepTimer);
        return;
      }
      state.practice.prepRemainingSec -= 1;
      const clock = document.getElementById("prep-clock");
      if (clock) clock.textContent = formatClock(state.practice.prepRemainingSec);
      if (state.practice.prepRemainingSec <= 0) {
        clearInterval(state.prepTimer);
        state.prepTimer = null;
        enterReady();
      }
    }, 1000);
  }

  function enterReady() {
    if (!state.practice) return;
    collectKeywords();
    clearInterval(state.prepTimer);
    state.prepTimer = null;
    state.practice.phase = "ready";
    render();
  }

  function exitPractice() {
    if (!state.practice) {
      navigate("home");
      return;
    }
    const isSaved = state.practice.saved;
    if (!isSaved && !window.confirm("退出后，本次练习尚未保存，录音也会丢弃。确定退出吗？")) {
      return;
    }
    cleanupPracticeMedia();
    state.practice = null;
    navigate("home");
  }

  function practiceHeader(title) {
    const phase = state.practice?.phase || "prep";
    const activeIndex =
      phase === "prep" ? 0 : phase === "ready" || phase === "recording" ? 1 : phase === "review" ? 2 : 3;
    return `<header class="backbar practice-header">
      <button class="icon-button" data-action="exit-practice" aria-label="退出练习">${icon("close")}</button>
      <div class="backbar-title">${esc(title)}</div>
      <span aria-hidden="true"></span>
    </header>
    <div class="practice-progress" aria-label="练习进度">
      ${[0, 1, 2, 3].map((index) => `<span class="${index <= activeIndex ? "active" : ""}"></span>`).join("")}
    </div>`;
  }

  function renderPracticePrep() {
    const practice = state.practice;
    const isVoice = practice.kind === "voice";
    const item = practice.item;
    return `<div class="page page-practice">
      ${practiceHeader(isVoice ? "发声训练" : "场景表达")}
      <main class="practice-shell">
        <section class="practice-center fade-in">
          <div class="practice-copy">
            <div class="eyebrow">${isVoice ? `第 ${item.weekNumber} 周 · ${esc(item.label)}` : esc(item.group.title)}</div>
            <h1>${isVoice ? esc(item.title) : "先想清楚，再开口。"}</h1>
            <p>${isVoice ? esc(item.goal) : esc(item.prompt)}</p>
          </div>

          ${
            isVoice
              ? `<section class="content-card">
                  <h3>只做这几个动作</h3>
                  <ol class="step-list">
                    ${item.steps.map((step, index) => `<li data-index="${index + 1}">${esc(step)}</li>`).join("")}
                  </ol>
                </section>
                <section class="content-card flat">
                  <div class="content-label">跟读示范</div>
                  <p style="font-family: var(--font-display); font-size: 17px; color: var(--ink)">${esc(item.sample)}</p>
                </section>
                <div class="notice ${item.caution.includes("停止") ? "danger" : ""}">${icon("shield")}<span>${esc(item.caution)}</span></div>`
              : `<section class="content-card">
                  <div class="content-label">用 3 个关键词提醒自己</div>
                  <div class="keyword-grid">
                    ${[0, 1, 2]
                      .map(
                        (index) => `<div class="keyword-input-wrap">
                          <input class="keyword-input" id="keyword-${index}" type="text" maxlength="10" value="${esc(practice.keywords[index] || "")}" placeholder="${esc(item.hints[index] || `关键词 ${index + 1}`)}" aria-label="关键词 ${index + 1}">
                          <span class="keyword-label">${String(index + 1).padStart(2, "0")}</span>
                        </div>`,
                      )
                      .join("")}
                  </div>
                </section>
                <section class="content-card flat">
                  <div class="content-label">推荐结构</div>
                  <div class="structure-flow">
                    ${item.structure.split("→").map((step) => `<span class="structure-step">${esc(step.trim())}</span>`).join("")}
                  </div>
                </section>
                <div class="timer-ring" aria-live="polite">
                  <div class="timer-value" id="prep-clock">${formatClock(practice.prepRemainingSec)}</div>
                  <div class="timer-caption">${practice.prepRunning ? "准备倒计时" : "准备时间"}</div>
                </div>`
          }

          <div class="bottom-cta">
            ${
              isVoice
                ? `<button class="primary-button block" data-action="enter-ready">了解动作，开始录音 ${icon("mic")}</button>`
                : practice.prepRunning
                  ? `<button class="primary-button block" data-action="enter-ready">准备好了，开始表达 ${icon("mic")}</button>`
                  : `<button class="primary-button block" data-action="start-prep">开始 ${formatClock(item.prepSec)} 准备 ${icon("clock")}</button>`
            }
          </div>
          ${
            !isVoice
              ? `<button class="text-button" style="width:100%; justify-content:center" data-action="enter-ready">不准备，直接开始表达</button>`
              : ""
          }
        </section>
      </main>
    </div>`;
  }

  function renderVolumeBars(barCount = 22) {
    return `<div class="volume-stage" id="volume-stage" aria-hidden="true">
      ${Array.from({ length: barCount }, (_, index) => `<span class="volume-bar" data-bar="${index}"></span>`).join("")}
    </div>`;
  }

  function renderPracticeRecord() {
    const practice = state.practice;
    const recording = practice.phase === "recording";
    const isVoice = practice.kind === "voice";
    const maxSeconds = practice.item.durationSec || practice.item.exerciseSec;
    const supported = recordingSupported();
    const instructions = isVoice
      ? `核心练习 ${formatClock(practice.item.exerciseSec)}，先把动作做舒服，再追求稳定。`
      : `目标表达 ${formatClock(maxSeconds)}。不需要背稿，照着关键词把结构说完整。`;

    return `<div class="page page-practice">
      ${practiceHeader(isVoice ? "发声训练" : "场景表达")}
      <main class="practice-shell">
        <section class="practice-center fade-in">
          <div class="practice-copy" style="text-align:${recording ? "center" : "left"}">
            <div class="eyebrow">${recording ? "正在录音" : "轮到你了"}</div>
            <h1>${recording ? "听见自己的声音。" : isVoice ? "只练一个舒服的动作。" : "现在，说给一个人听。"}</h1>
            <p${recording ? ' style="margin-right:auto;margin-left:auto"' : ""}>${esc(instructions)}</p>
          </div>

          ${
            recording
              ? `<div class="recording-stage">
                  <div style="margin-top:24px"><span class="recording-status live">录音中</span></div>
                  <div class="recording-clock" id="record-clock">${formatClock(practice.recordElapsed)}</div>
                  <div class="recording-target">目标 ${formatClock(maxSeconds)} · 达到目标后自动结束</div>
                  ${renderVolumeBars()}
                  <button class="record-button stop" data-action="stop-recording" aria-label="停止录音"></button>
                  <div class="record-help">点一下结束，马上回听</div>
                </div>`
              : `${
                  supported
                    ? `<div class="recording-stage">
                        ${renderVolumeBars()}
                        <button class="record-button" data-action="start-recording" aria-label="开始录音">${icon("mic")}</button>
                        <div class="record-help">点击后允许麦克风，录音只保存在本机</div>
                      </div>`
                    : `<div class="notice" style="margin-top:22px">${icon("mic")}<span>${
                        !window.isSecureContext
                          ? "当前页面不是 HTTPS 安全连接，微信可能无法使用麦克风。部署到 HTTPS 后即可录音。"
                          : "当前浏览器不支持录音。你仍然可以完成自评和复盘，但不会生成音频。"
                      }</span></div>`
                }
                ${
                  practice.micError
                    ? `<div class="notice danger" style="margin-top:10px">${icon("info")}<span>${esc(practice.micError)}</span></div>`
                    : ""
                }
                <label class="secondary-button block" style="margin-top:18px;cursor:pointer">
                  ${icon("audio")} 导入手机里已有的录音
                  <input id="audio-file-input" type="file" accept="audio/*" hidden>
                </label>
                <p style="margin-top:7px;color:var(--ink-faint);font-size:10px;line-height:1.55">可以先使用手机录音机录好，再回到这里导入复盘；导入的音频同样只在本机读取。</p>
                ${
                  !supported || practice.micError
                    ? `<button class="secondary-button block" style="margin-top:18px" data-action="skip-to-review">无录音，继续复盘</button>`
                    : ""
                }
                <div class="button-row" style="margin-top:18px">
                  <button class="secondary-button" data-action="return-prep">返回准备</button>
                  <button class="quiet-button" data-action="skip-to-review">跳过录音</button>
                </div>`
          }
        </section>
      </main>
    </div>`;
  }

  function chooseMimeType() {
    if (!window.MediaRecorder?.isTypeSupported) return "";
    const candidates = [
      "audio/mp4",
      "audio/mp4;codecs=mp4a.40.2",
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
    ];
    return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || "";
  }

  async function startRecording() {
    if (!state.practice || !recordingSupported()) {
      showToast("当前环境无法录音，可使用无录音复盘");
      return;
    }
    const button = document.querySelector('[data-action="start-recording"]');
    if (button) button.disabled = true;
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
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
      const chunks = [];
      state.mediaStream = stream;
      state.mediaRecorder = recorder;
      state.volumeSamples = [];

      recorder.ondataavailable = (event) => {
        if (event.data?.size) chunks.push(event.data);
      };
      recorder.onstop = () => finalizeRecording(chunks, recorder.mimeType || mimeType || "audio/mp4");
      recorder.onerror = (event) => {
        console.warn("MediaRecorder error", event.error);
        state.practice.micError = "录音过程中发生错误，已为你切换到无录音复盘。";
        cleanupPracticeMedia();
        if (state.practice) {
          state.practice.phase = "review";
          render();
        }
      };

      setupVolumeAnalysis(stream);
      state.practice.phase = "recording";
      state.practice.recordingStartedAt = Date.now();
      state.practice.recordElapsed = 0;
      state.practice.micError = "";
      recorder.start(500);
      render();
      startRecordingClocks();
    } catch (error) {
      console.warn("Microphone permission error", error);
      stream?.getTracks().forEach((track) => track.stop());
      if (!state.practice) return;
      const denied =
        error?.name === "NotAllowedError" || error?.name === "PermissionDeniedError";
      state.practice.micError = denied
        ? "麦克风权限被拒绝。你可以修改浏览器权限，或先使用无录音模式完成复盘。"
        : "没有成功打开麦克风。你可以检查设备后重试，或先使用无录音模式。";
      render();
    }
  }

  function setupVolumeAnalysis(stream) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      state.audioContext = new AudioCtx();
      const source = state.audioContext.createMediaStreamSource(stream);
      state.analyser = state.audioContext.createAnalyser();
      state.analyser.fftSize = 512;
      source.connect(state.analyser);
    } catch (error) {
      console.warn("Volume analysis unavailable", error);
      state.analyser = null;
    }
  }

  function sampleVolume() {
    if (!state.practice || state.practice.phase !== "recording" || !state.analyser) return;
    const data = new Uint8Array(state.analyser.fftSize);
    state.analyser.getByteTimeDomainData(data);
    let sum = 0;
    for (const value of data) {
      const normalized = (value - 128) / 128;
      sum += normalized * normalized;
    }
    const rms = Math.sqrt(sum / data.length);
    const level = clamp(Math.round(rms * 320), 0, 100);
    state.volumeSamples.push(level);

    const bars = [...document.querySelectorAll(".volume-bar")];
    const tail = state.volumeSamples.slice(-bars.length);
    bars.forEach((bar, index) => {
      const value = tail[index] ?? 0;
      const height = 8 + Math.round((value / 100) * 48);
      bar.style.height = `${height}px`;
      bar.classList.toggle("active", value > 8);
    });
  }

  function startRecordingClocks() {
    clearInterval(state.recordTimer);
    clearInterval(state.volumeTimer);
    const maxSeconds = state.practice.item.durationSec || state.practice.item.exerciseSec;
    state.recordTimer = setInterval(() => {
      if (!state.practice || state.practice.phase !== "recording") {
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
    if (!state.practice || state.practice.phase !== "recording") return;
    state.practice.recordElapsed = (Date.now() - state.practice.recordingStartedAt) / 1000;
    clearInterval(state.recordTimer);
    clearInterval(state.volumeTimer);
    state.recordTimer = null;
    state.volumeTimer = null;
    if (state.mediaRecorder?.state === "recording") {
      try {
        state.mediaRecorder.stop();
      } catch (error) {
        console.warn("Could not stop recorder", error);
        finalizeRecording([], "");
      }
    } else {
      finalizeRecording([], "");
    }
  }

  function finalizeRecording(chunks, mimeType) {
    if (!state.practice) return;
    const durationSec = Math.max(0.1, state.practice.recordElapsed || 0);
    const blob = chunks.length ? new Blob(chunks, { type: mimeType }) : null;
    const metrics = blob
      ? analyzeVolume(state.volumeSamples, durationSec)
      : null;
    state.practice.current = {
      ...state.practice.current,
      attemptNumber: state.practice.attemptNumber,
      blob,
      mimeType,
      durationSec,
      volumeSamples: state.volumeSamples.slice(),
      metrics,
    };
    if (state.mediaStream) state.mediaStream.getTracks().forEach((track) => track.stop());
    state.mediaStream = null;
    if (state.audioContext && state.audioContext.state !== "closed") {
      state.audioContext.close().catch(() => {});
    }
    state.audioContext = null;
    state.analyser = null;
    state.mediaRecorder = null;
    state.practice.phase = "review";
    render();
  }

  function analyzeVolume(samples, durationSec) {
    if (!samples.length) return null;
    const avg = average(samples);
    const variance = average(samples.map((value) => (value - avg) ** 2));
    const deviation = Math.sqrt(variance);
    const stability = clamp(Math.round(100 - (deviation / Math.max(avg, 1)) * 100), 0, 100);
    const threshold = Math.max(3, avg * 0.26);
    let silentRun = 0;
    let pauseGroups = 0;
    samples.forEach((value) => {
      if (value <= threshold) {
        silentRun += 1;
      } else {
        if (silentRun >= 12) pauseGroups += 1;
        silentRun = 0;
      }
    });
    if (silentRun >= 12) pauseGroups += 1;
    return {
      averageLevel: Math.round(avg),
      stability,
      pauseGroups,
      sampleCount: samples.length,
      durationSec,
    };
  }

  function skipToReview() {
    if (!state.practice) return;
    cleanupPracticeMedia();
    state.practice.current = {
      ...state.practice.current,
      attemptNumber: state.practice.attemptNumber,
      blob: null,
      durationSec: 0,
      volumeSamples: [],
      metrics: null,
    };
    state.practice.phase = "review";
    render();
  }

  async function loadUploadedAudio(file) {
    if (!state.practice || !file) return;
    if (!file.type.startsWith("audio/") && !/\.(m4a|mp3|wav|aac|ogg|webm|mp4)$/i.test(file.name)) {
      showToast("请选择音频文件");
      return;
    }
    showToast("正在读取录音…");
    cleanupPracticeMedia();
    const duration = await new Promise((resolve) => {
      const audio = new Audio();
      const localUrl = URL.createObjectURL(file);
      const finish = (value) => {
        URL.revokeObjectURL(localUrl);
        resolve(value);
      };
      audio.preload = "metadata";
      audio.onloadedmetadata = () => finish(Number.isFinite(audio.duration) ? audio.duration : 0);
      audio.onerror = () => finish(0);
      audio.src = localUrl;
    });
    state.practice.current = {
      ...state.practice.current,
      attemptNumber: state.practice.attemptNumber,
      blob: file,
      mimeType: file.type || "audio/mp4",
      durationSec: duration,
      volumeSamples: [],
      metrics: null,
    };
    state.practice.phase = "review";
    render();
  }

  function audioCard(blob, title, meta = "") {
    if (!blob) {
      return `<div class="audio-card">
        <div class="audio-top">
          <span class="audio-title">${icon("audio")} ${esc(title)}</span>
          <span class="audio-meta">无录音</span>
        </div>
        <p style="font-size:11px">本次使用无录音模式，复盘只依据自评和文字记录。</p>
      </div>`;
    }
    const url = createAudioUrl(blob);
    return `<div class="audio-card">
      <div class="audio-top">
        <span class="audio-title">${icon("audio")} ${esc(title)}</span>
        <span class="audio-meta">${esc(meta || "本机录音")}</span>
      </div>
      <audio controls playsinline preload="metadata" src="${url}"></audio>
    </div>`;
  }

  function metricRow(metrics, durationSec) {
    if (!metrics) {
      return `<div class="metric-row">
        <div class="metric"><strong>${durationSec ? formatClock(durationSec) : "--"}</strong><span>表达时长</span></div>
        <div class="metric"><strong>--</strong><span>音量稳定</span></div>
        <div class="metric"><strong>--</strong><span>明显停顿</span></div>
      </div>`;
    }
    return `<div class="metric-row">
      <div class="metric"><strong>${formatClock(metrics.durationSec)}</strong><span>表达时长</span></div>
      <div class="metric"><strong>${metrics.stability}</strong><span>音量稳定度</span></div>
      <div class="metric"><strong>${metrics.pauseGroups}</strong><span>明显停顿组</span></div>
    </div>`;
  }

  function renderRatingGroup(dimensions, values = {}) {
    return `<div class="rating-list">
      ${dimensions
        .map(
          (dimension) => `<div class="rating-item">
            <label for="${dimension.id}-3">
              <span>${esc(dimension.label)}</span>
              <span class="rating-value">1 需改善 · 5 很好</span>
            </label>
            <div class="segmented">
              ${[1, 2, 3, 4, 5]
                .map(
                  (value) => `<input type="radio" id="${dimension.id}-${value}" name="${dimension.id}" value="${value}" ${Number(values[dimension.id] || 3) === value ? "checked" : ""}>
                    <label for="${dimension.id}-${value}">${value}</label>`,
                )
                .join("")}
            </div>
          </div>`,
        )
        .join("")}
    </div>`;
  }

  function renderPracticeReview() {
    const practice = state.practice;
    const current = practice.current;
    const dims = practice.kind === "voice" ? C.voiceDimensions : C.scenarioDimensions;
    const attemptLabel = `第 ${practice.attemptNumber} 遍`;
    return `<div class="page page-practice">
      ${practiceHeader("回听与复盘")}
      <main class="practice-shell">
        <section class="practice-center fade-in">
          <div class="practice-copy">
            <div class="eyebrow">${esc(attemptLabel)} · 只找一个改进动作</div>
            <h1>先回听，再判断。</h1>
            <p>留意三个地方：第一句是否清楚，重点前后有没有停顿，说到后半段喉咙是否越来越紧。</p>
          </div>
          ${audioCard(current.blob, attemptLabel, current.durationSec ? formatClock(current.durationSec) : "")}
          ${metricRow(current.metrics, current.durationSec)}
          ${
            !current.metrics
              ? `<div class="notice neutral" style="margin-top:14px">${icon("info")}<span>没有录音数据。请不要据此判断发声位置，只记录主观舒适度和下一次要改的动作。</span></div>`
              : ""
          }
          <form id="review-form">
            <section class="content-card">
              <h3>这次的真实感受</h3>
              <p>评分只用于追踪自己的变化，不判断专业发声位置。</p>
              ${renderRatingGroup(dims, current.ratings)}
            </section>
            <section class="content-card">
              <h3>留一句给自己的提醒</h3>
              <textarea class="notes-input" id="review-notes" maxlength="240" placeholder="例如：第一句太快；结论后停顿了两秒；后半段开始用喉咙顶。">${esc(current.notes || "")}</textarea>
            </section>
            <div class="bottom-cta">
              <button class="primary-button block" type="submit">生成这次复盘 ${icon("spark")}</button>
            </div>
          </form>
          <div class="button-row" style="margin-top:16px">
            <button class="secondary-button" data-action="retake-current">重录这一遍</button>
            <button class="quiet-button" data-action="exit-practice">先退出</button>
          </div>
        </section>
      </main>
    </div>`;
  }

  const GOOD_REVIEWS = {
    structure: "你已经能把内容装进一个清晰框架，听众更容易跟上。",
    focus: "你知道把注意力放在主结论上，而不是被细节带走。",
    delivery: "这一段有可感知的节奏，重点前后没有被语速淹没。",
    comfort: "这次表达相对省力，声音没有明显被喉咙推着走。",
    throat: "你在有意识地减少喉部用力，这是迁移到真实场景的基础。",
    volume: "音量控制比较自然，没有靠一味放大来换清楚。",
    breath: "气口安排相对稳定，句子完整性没有被抢气打断。",
    fatigue: "练习后整体还比较轻松，说明这次强度适合你。",
  };

  function scoreHeadline(score) {
    if (score >= 4.5) return "这次已经站得很稳。";
    if (score >= 3.7) return "方向对了，再稳住一点。";
    if (score >= 3) return "结构开始站住，继续收短。";
    return "先收成一个重点，再说第二遍。";
  }

  function buildReview(practice, attempt) {
    const dims = practice.kind === "voice" ? C.voiceDimensions : C.scenarioDimensions;
    const rated = dims.map((dimension) => ({
      ...dimension,
      value: Number(attempt.ratings[dimension.id] || 3),
    }));
    const sortedHigh = [...rated].sort((a, b) => b.value - a.value);
    const sortedLow = [...rated].sort((a, b) => a.value - b.value);
    const score = average(rated.map((dimension) => dimension.value));
    const good = sortedHigh[0];
    const issues = sortedLow.slice(0, 2);
    const metricNote = attempt.metrics
      ? `录音时长 ${formatClock(attempt.metrics.durationSec)}，音量稳定度 ${attempt.metrics.stability}/100，识别到约 ${attempt.metrics.pauseGroups} 组明显停顿。`
      : "本次没有录音，复盘主要依据你的主观评分。";
    const prompt = practice.kind === "scenario" ? practice.item.prompt : practice.item.sample;
    const keywords = practice.keywords.filter(Boolean);
    const coachPrompt = [
      "你是我的口才教练。请根据以下练习记录给我一次简短复盘。",
      "注意：你没有听过录音，不要假装分析语气、发声位置或逐字稿。",
      `练习类型：${practice.kind === "voice" ? "发声训练" : practice.item.group.title}`,
      `练习题目：${practice.item.title}`,
      `场景或示范：${prompt}`,
      `关键词：${keywords.length ? keywords.join("、") : "未填写"}`,
      `自评：${rated.map((dimension) => `${dimension.label} ${dimension.value}/5`).join("；")}`,
      `基础数据：${metricNote}`,
      `我的主观记录：${attempt.notes || "无"}`,
      "请只输出：1. 一个做得好的地方；2. 最多两个最需改善的问题；3. 一个可以照做的表达修改示例；4. 下一次只练的一个动作。总字数不超过 350 字。",
    ].join("\n");
    return {
      score: Number(score.toFixed(1)),
      headline: scoreHeadline(score),
      good: GOOD_REVIEWS[good.id] || `${good.label}是这次相对稳定的部分。`,
      goodLabel: good.label,
      issues: issues.map((issue) => ({ label: issue.label, text: issue.low })),
      revision: practice.kind === "scenario" ? practice.item.revisionTip : practice.item.nextTip,
      nextAction: sortedLow[0].low,
      metricNote,
      coachPrompt,
      createdAt: new Date().toISOString(),
    };
  }

  function submitReview(event) {
    event.preventDefault();
    if (!state.practice) return;
    const dims = state.practice.kind === "voice" ? C.voiceDimensions : C.scenarioDimensions;
    const ratings = {};
    for (const dimension of dims) {
      const selected = document.querySelector(`input[name="${dimension.id}"]:checked`);
      ratings[dimension.id] = Number(selected?.value || 3);
    }
    state.practice.current.ratings = ratings;
    state.practice.current.notes = document.getElementById("review-notes")?.value.trim() || "";
    const attempt = { ...state.practice.current };
    state.practice.attempts.push(attempt);
    state.practice.review = buildReview(state.practice, attempt);
    state.practice.phase = "result";
    render();
  }

  function comparisonMarkup() {
    const practice = state.practice;
    if (practice.attempts.length < 2) return "";
    const [first, second] = practice.attempts;
    const firstScore = average(Object.values(first.ratings));
    const secondScore = average(Object.values(second.ratings));
    const scoreDirection = secondScore - firstScore;
    return `<section class="result-section">
      <div class="result-kicker">${icon("refresh")} 前后对比</div>
      <div class="compare-card">
        <div class="compare-item"><strong>${firstScore.toFixed(1)}</strong><span>第 1 遍自评</span></div>
        <span class="compare-arrow">${icon("arrowUpRight")}</span>
        <div class="compare-item"><strong>${secondScore.toFixed(1)}</strong><span>第 2 遍自评</span></div>
      </div>
      <p>${scoreDirection > 0 ? `第二遍自评提升了 ${scoreDirection.toFixed(1)} 分。` : scoreDirection < 0 ? "第二遍自评略有下降，可能是你在尝试新的动作，先听录音判断是否更舒服。" : "两遍自评接近，继续听录音里最具体的那个变化。"}</p>
      ${audioCard(second.blob, "第 2 遍录音", second.durationSec ? formatClock(second.durationSec) : "")}
      <details style="margin-top:12px">
        <summary style="color:var(--ink-soft);font-size:11px;cursor:pointer">回听第 1 遍</summary>
        ${audioCard(first.blob, "第 1 遍录音", first.durationSec ? formatClock(first.durationSec) : "")}
      </details>
    </section>`;
  }

  function renderPracticeResult() {
    const practice = state.practice;
    const review = practice.review;
    const lastAttempt = practice.attempts.at(-1);
    return `<div class="page page-practice">
      ${practiceHeader("本次复盘")}
      <main class="practice-shell">
        <section class="practice-center fade-in">
          <div class="result-hero">
            <div class="hero-kicker">${esc(practice.item.title)}</div>
            <div class="result-score"><strong>${review.score.toFixed(1)}</strong><span>/ 5 自评</span></div>
            <h2>${esc(review.headline)}</h2>
            <p>${esc(review.metricNote)}</p>
          </div>
          <section class="result-section">
            <div class="result-kicker">${icon("spark")} 这次做对了</div>
            <h3>${esc(review.goodLabel)}</h3>
            <p>${esc(review.good)}</p>
          </section>
          <section class="result-section">
            <div class="result-kicker">${icon("target")} 下一遍只改这里</div>
            <div class="issue-list">
              ${review.issues
                .map(
                  (issue, index) => `<div class="issue-row"><span class="issue-index">${index + 1}</span><span><strong>${esc(issue.label)}：</strong>${esc(issue.text)}</span></div>`,
                )
                .join("")}
            </div>
          </section>
          <section class="result-section">
            <div class="result-kicker">${icon("notes")} 可以这样改</div>
            <p>${esc(review.revision)}</p>
            ${
              practice.kind === "scenario"
                ? `<div style="margin-top:14px;padding:13px;border-radius:13px;background:#fbf9f2;color:var(--ink-soft);font-size:12px;line-height:1.7">${esc(practice.item.example)}</div>`
                : ""
            }
          </section>
          ${comparisonMarkup()}
          <section class="result-section">
            <div class="result-kicker">${icon("audio")} 回听录音</div>
            ${audioCard(lastAttempt.blob, `第 ${lastAttempt.attemptNumber} 遍`, lastAttempt.durationSec ? formatClock(lastAttempt.durationSec) : "")}
          </section>
          <section class="result-section">
            <div class="result-kicker">${icon("copy")} 教练复盘提示词</div>
            <p>这里只包含场景、自评和基础数据，不包含录音或假造的逐字稿。</p>
            <textarea class="coach-prompt" id="coach-prompt" readonly>${esc(review.coachPrompt)}</textarea>
            <button class="secondary-button block" style="margin-top:10px" data-action="copy-coach">复制复盘提示词</button>
          </section>
          <div class="bottom-cta">
            ${
              practice.attempts.length < 2
                ? `<button class="primary-button block" data-action="retry-practice">按建议再练一遍 ${icon("refresh")}</button>`
                : `<button class="primary-button block" data-action="save-session">完成并保存 ${icon("check")}</button>`
            }
          </div>
          ${
            practice.attempts.length < 2
              ? `<button class="quiet-button block" style="margin-top:10px" data-action="save-session">暂不重练，保存这次记录</button>`
              : ""
          }
        </section>
      </main>
    </div>`;
  }

  function retryPractice() {
    const practice = state.practice;
    if (!practice) return;
    cleanupPracticeMedia();
    practice.attemptNumber = practice.attempts.length + 1;
    practice.phase = "prep";
    practice.prepRunning = false;
    practice.prepRemainingSec = practice.kind === "scenario" ? practice.item.prepSec : 30;
    practice.current = {
      attemptNumber: practice.attemptNumber,
      blob: null,
      mimeType: "",
      durationSec: 0,
      volumeSamples: [],
      ratings: { ...practice.attempts.at(-1).ratings },
      notes: "",
      metrics: null,
    };
    practice.review = null;
    practice.micError = "";
    render();
  }

  function retakeCurrent() {
    if (!state.practice) return;
    cleanupPracticeMedia();
    state.practice.current = {
      attemptNumber: state.practice.attemptNumber,
      blob: null,
      mimeType: "",
      durationSec: 0,
      volumeSamples: [],
      ratings: {},
      notes: "",
      metrics: null,
    };
    state.practice.phase = "ready";
    render();
  }

  async function saveCurrentSession() {
    const practice = state.practice;
    if (!practice || practice.saving || practice.saved) return;
    practice.saving = true;
    const button = document.querySelector('[data-action="save-session"]');
    if (button) {
      button.disabled = true;
      button.textContent = "正在保存…";
    }
    const session = {
      id: practice.id,
      itemId: practice.itemId,
      kind: practice.kind,
      title: practice.item.title,
      groupTitle: practice.kind === "scenario" ? practice.item.group.title : `第 ${practice.item.weekNumber} 周 · ${practice.item.label}`,
      prompt: practice.kind === "scenario" ? practice.item.prompt : practice.item.sample,
      keywords: practice.keywords,
      createdAt: new Date().toISOString(),
      attempts: practice.attempts.map((attempt) => ({ ...attempt })),
      review: practice.review,
      durationSec: practice.attempts.reduce((sum, attempt) => sum + (attempt.durationSec || 0), 0),
    };
    try {
      await putSession(session);
      practice.saved = true;
      await refreshSessions();
      cleanupPracticeMedia();
      state.practice = null;
      navigate(`record/${session.id}`);
      showToast("练习已保存在本机");
    } catch (error) {
      console.error("Save failed", error);
      practice.saving = false;
      showToast("保存失败，请检查浏览器隐私设置后重试");
      if (button) {
        button.disabled = false;
        button.textContent = "完成并保存";
      }
    }
  }

  function formatRecordDate(value) {
    const date = new Date(value);
    return `${date.getMonth() + 1}月${date.getDate()}日 ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function renderRecords() {
    const sessions = state.sessions;
    const totalMinutes = sessions.length
      ? Math.max(1, Math.round(sessions.reduce((sum, item) => sum + (item.durationSec || 0), 0) / 60))
      : 0;
    return `<div class="page">
      ${topbar()}
      <header class="page-heading fade-in">
        <div class="eyebrow">Your progress</div>
        <h1>把每次开口，<br>留下来。</h1>
        <p>这里记录的是变化，不是打分排名。回听两遍录音，比追求一次完美更有用。</p>
      </header>
      <div class="stats-grid fade-in delay-one">
        <div class="stat-card"><strong>${sessions.length}</strong><span>完成练习</span></div>
        <div class="stat-card"><strong>${totalMinutes}</strong><span>练习分钟</span></div>
        <div class="stat-card"><strong>${calcStreak()}</strong><span>连续天数</span></div>
      </div>
      <section class="section">
        <div class="section-head">
          <div><h2>练习记录</h2><p>点开可以回听和查看复盘。</p></div>
          ${sessions.length ? `<span class="text-button">${sessions.length} 次</span>` : ""}
        </div>
        ${
          !state.sessionsLoaded
            ? `<div class="empty-state"><div class="empty-icon">${icon("history")}</div><h3>正在读取记录</h3><p>只读取当前设备中的本地数据。</p></div>`
            : sessions.length
              ? `<div class="history-list">
                  ${sessions
                    .map(
                      (session) => `<button class="history-item" data-action="open-record" data-id="${session.id}">
                        <span class="history-icon ${session.kind === "voice" ? "voice" : ""}">${icon(session.kind === "voice" ? "voice" : "mic")}</span>
                        <span>
                          <h3>${esc(session.title)}</h3>
                          <p>${esc(session.groupTitle)} · ${formatRecordDate(session.createdAt)} · 自评 ${Number(session.review?.score || 0).toFixed(1)}</p>
                        </span>
                        ${icon("chevron")}
                      </button>`,
                    )
                    .join("")}
                </div>`
              : `<div class="empty-state">
                  <div class="empty-icon">${icon("mic")}</div>
                  <h3>还没有练习记录</h3>
                  <p>从今天的一次 90 秒表达开始。完成后，录音和复盘会保存在这里。</p>
                  <button class="primary-button" data-action="navigate" data-route="home">回今日练习</button>
                </div>`
        }
      </section>
      <section class="section">
        <div class="section-head"><div><h2>本机数据</h2><p>没有账号，也不会上传到服务器。</p></div></div>
        <div class="content-card flat">
          <div class="data-actions">
            <button class="secondary-button block" data-action="export-data" ${!sessions.length ? "disabled" : ""}>${icon("download")} 导出全部记录</button>
            <label class="secondary-button block" style="cursor:pointer">
              ${icon("history")} 导入旧练习记录
              <input id="record-import-input" type="file" accept="application/json,.json" hidden>
            </label>
            <button class="danger-button block" data-action="clear-data" ${!sessions.length ? "disabled" : ""}>${icon("trash")} 清空全部本机数据</button>
          </div>
          <p class="data-note">导出的 JSON 包含复盘信息和录音数据，文件可能较大。请自行妥善保管。</p>
        </div>
      </section>
      ${
        state.storageAvailable
          ? ""
          : `<div class="notice danger" style="margin-top:14px">${icon("info")}<span>当前浏览器无法使用本地数据库，练习仍可完成，但历史记录可能无法保存。</span></div>`
      }
    </div>
    ${bottomNav("records")}`;
  }

  function renderRecordDetail(session) {
    if (!session) {
      return `<div class="page">
        ${backbar("练习记录", "back")}
        <div class="empty-state" style="margin-top:25px">
          <div class="empty-icon">${icon("history")}</div>
          <h3>没有找到这条记录</h3>
          <p>记录可能已被清理，或本地浏览器数据被重置。</p>
          <button class="primary-button" data-action="navigate" data-route="records">返回记录</button>
        </div>
      </div>`;
    }
    const review = session.review || {};
    const attempts = session.attempts || [];
    const lastAttempt = attempts.at(-1);
    return `<div class="page">
      ${backbar("练习记录", "back")}
      <section class="result-hero fade-in">
        <div class="hero-kicker">${esc(session.groupTitle)} · ${formatRecordDate(session.createdAt)}</div>
        <div class="result-score"><strong>${Number(review.score || 0).toFixed(1)}</strong><span>/ 5 自评</span></div>
        <h2>${esc(session.title)}</h2>
        <p>${esc(review.headline || "完成了一次真实练习。")}</p>
      </section>
      <section class="result-section">
        <div class="result-kicker">${icon("spark")} 当时的判断</div>
        <h3>${esc(review.goodLabel || "完成练习")}</h3>
        <p>${esc(review.good || "这次练习已经保存在本机。")}</p>
        <div class="issue-list">
          ${(review.issues || [])
            .map(
              (issue, index) => `<div class="issue-row"><span class="issue-index">${index + 1}</span><span><strong>${esc(issue.label)}：</strong>${esc(issue.text)}</span></div>`,
            )
            .join("")}
        </div>
      </section>
      <section class="result-section">
        <div class="result-kicker">${icon("target")} 下一次只练</div>
        <p>${esc(review.nextAction || "从第一句话开始，先慢下来。")}</p>
      </section>
      <section class="result-section">
        <div class="result-kicker">${icon("audio")} 录音${attempts.length > 1 ? ` · ${attempts.length} 遍` : ""}</div>
        ${attempts
          .map((attempt) =>
            audioCard(
              attempt.blob,
              `第 ${attempt.attemptNumber} 遍`,
              attempt.durationSec ? formatClock(attempt.durationSec) : "",
            ),
          )
          .join("")}
        ${lastAttempt?.notes ? `<p style="margin-top:13px"><strong style="color:var(--ink)">练习笔记：</strong>${esc(lastAttempt.notes)}</p>` : ""}
      </section>
      <section class="result-section">
        <div class="result-kicker">${icon("copy")} 教练复盘提示词</div>
        <textarea class="coach-prompt" id="saved-coach-prompt" readonly>${esc(review.coachPrompt || "")}</textarea>
        <button class="secondary-button block" style="margin-top:10px" data-action="copy-saved-coach">复制复盘提示词</button>
      </section>
      <div class="button-row" style="margin-top:16px">
        <button class="secondary-button" data-action="retry-session" data-id="${session.id}">再练一次</button>
        <button class="danger-button" data-action="delete-record" data-id="${session.id}">删除记录</button>
      </div>
    </div>
    ${bottomNav("records")}`;
  }

  function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  }

  async function exportRecords() {
    if (!state.sessions.length) return;
    showToast("正在整理本机记录…");
    try {
      const exportSessions = await Promise.all(
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
        version: 1,
        exportedAt: new Date().toISOString(),
        note: "此文件包含个人练习录音，请妥善保管。",
        sessions: exportSessions,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `会说话-练习记录-${todayKey()}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      showToast("练习记录已导出");
    } catch (error) {
      console.error("Export failed", error);
      showToast("导出失败，请稍后重试");
    }
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

  async function importRecords(file) {
    if (!file) return;
    try {
      const payload = JSON.parse(await file.text());
      const incoming = Array.isArray(payload) ? payload : payload.sessions;
      if (!Array.isArray(incoming)) throw new Error("Invalid record file");
      let imported = 0;
      let skipped = 0;
      for (const rawSession of incoming) {
        if (!rawSession?.id || state.sessions.some((item) => item.id === rawSession.id)) {
          skipped += 1;
          continue;
        }
        const attempts = [];
        for (const rawAttempt of rawSession.attempts || []) {
          const { audioDataUrl, ...attempt } = rawAttempt;
          attempts.push({
            ...attempt,
            blob: audioDataUrl ? dataUrlToBlob(audioDataUrl) : null,
          });
        }
        await putSession({ ...rawSession, attempts });
        imported += 1;
      }
      await refreshSessions();
      render();
      showToast(
        imported
          ? `已导入 ${imported} 次练习${skipped ? `，跳过 ${skipped} 条重复记录` : ""}`
          : "没有新的练习记录需要导入",
      );
    } catch (error) {
      console.error("Import failed", error);
      showToast("导入失败，请选择由“会说话”导出的 JSON 文件");
    }
  }

  async function clearAllRecords() {
    if (!state.sessions.length) return;
    const confirmed = window.confirm(
      "这会永久删除当前设备上的全部练习记录和录音，且无法恢复。确定继续吗？",
    );
    if (!confirmed) return;
    try {
      await clearSessionRecords();
      state.sessions = [];
      showToast("本机练习数据已清空");
      render();
    } catch (error) {
      console.error("Clear failed", error);
      showToast("清空失败，请稍后重试");
    }
  }

  async function removeRecord(id) {
    const session = state.sessions.find((item) => item.id === id);
    if (!session) return;
    if (!window.confirm(`确定删除“${session.title}”及其录音吗？此操作无法恢复。`)) return;
    try {
      await deleteSessionRecord(id);
      state.sessions = state.sessions.filter((item) => item.id !== id);
      showToast("记录已删除");
      navigate("records");
    } catch (error) {
      console.error("Delete failed", error);
      showToast("删除失败，请稍后重试");
    }
  }

  async function copyText(text) {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      showToast("已复制，可粘贴到你的 AI 助手中");
      return;
    } catch (error) {
      console.warn("Clipboard API unavailable", error);
    }
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      showToast("已复制，可粘贴到你的 AI 助手中");
    } catch (error) {
      showToast("当前环境无法自动复制，请长按文本选择复制");
    }
    textarea.remove();
  }

  function renderPractice() {
    if (!state.practice) {
      navigate("home");
      return "";
    }
    switch (state.practice.phase) {
      case "prep":
        return renderPracticePrep();
      case "ready":
      case "recording":
        return renderPracticeRecord();
      case "review":
        return renderPracticeReview();
      case "result":
        return renderPracticeResult();
      default:
        return renderPracticePrep();
    }
  }

  function render() {
    releaseObjectUrls();
    parseRoute();
    let html = "";
    switch (state.route) {
      case "home":
        html = renderHome();
        break;
      case "scenarios":
        html = renderScenarios();
        break;
      case "group":
        html = renderScenarioGroup(getGroup(state.routeId));
        break;
      case "scenario":
        html = renderScenarioDetail(getScenario(state.routeId));
        break;
      case "voice":
        html = renderVoice();
        break;
      case "lesson":
        html = renderLesson(getLesson(state.routeId));
        break;
      case "practice":
        html = renderPractice();
        break;
      case "records":
        html = renderRecords();
        break;
      case "record":
        html = renderRecordDetail(state.sessions.find((item) => item.id === state.routeId));
        break;
      default:
        html = renderHome();
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
      case "open-group":
        navigate(`group/${id}`);
        break;
      case "open-scenario":
        navigate(`scenario/${id}`);
        break;
      case "open-lesson":
        navigate(`lesson/${id}`);
        break;
      case "start-practice":
        startPractice(trigger.dataset.kind, id);
        break;
      case "exit-practice":
        exitPractice();
        break;
      case "start-prep":
        startPrepCountdown();
        break;
      case "enter-ready":
        enterReady();
        break;
      case "return-prep":
        if (state.practice) {
          collectKeywords();
          cleanupPracticeMedia();
          state.practice.phase = "prep";
          state.practice.prepRunning = false;
          render();
        }
        break;
      case "start-recording":
        startRecording();
        break;
      case "stop-recording":
        stopRecording();
        break;
      case "skip-to-review":
        skipToReview();
        break;
      case "retake-current":
        retakeCurrent();
        break;
      case "retry-practice":
        retryPractice();
        break;
      case "save-session":
        saveCurrentSession();
        break;
      case "copy-coach": {
        const textarea = document.getElementById("coach-prompt");
        copyText(textarea?.value || "");
        break;
      }
      case "copy-saved-coach": {
        const textarea = document.getElementById("saved-coach-prompt");
        copyText(textarea?.value || "");
        break;
      }
      case "open-record":
        navigate(`record/${id}`);
        break;
      case "delete-record":
        removeRecord(id);
        break;
      case "retry-session": {
        const session = state.sessions.find((item) => item.id === id);
        if (session) startPractice(session.kind, session.itemId);
        break;
      }
      case "export-data":
        exportRecords();
        break;
      case "clear-data":
        clearAllRecords();
        break;
      default:
        break;
    }
  });

  app.addEventListener("submit", (event) => {
    if (event.target.id === "review-form") submitReview(event);
  });

  app.addEventListener("change", (event) => {
    if (event.target.id === "audio-file-input") {
      loadUploadedAudio(event.target.files?.[0]);
    }
    if (event.target.id === "record-import-input") {
      importRecords(event.target.files?.[0]).finally(() => {
        event.target.value = "";
      });
    }
  });

  window.addEventListener("hashchange", () => {
    const next = window.location.hash;
    if (state.practice && !next.startsWith("#/practice")) {
      cleanupPracticeMedia();
      state.practice = null;
    }
    render();
  });

  window.addEventListener("beforeunload", (event) => {
    if (state.practice?.phase === "recording") {
      event.preventDefault();
      event.returnValue = "";
    }
  });

  async function init() {
    if (!window.location.hash) {
      window.history.replaceState(null, "", "#/home");
    }
    parseRoute();
    await refreshSessions();
    render();
    if ("serviceWorker" in navigator && window.isSecureContext) {
      navigator.serviceWorker.register("./sw.js").catch((error) => {
        console.warn("Service worker registration failed", error);
      });
    }
  }

  init();
})();
