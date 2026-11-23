(() => {
  "use strict";

  const DATA = window.HSH_CONTENT;
  const app = document.getElementById("app");
  const toastEl = document.getElementById("toast");
  const levelsById = new Map(DATA.levels.map((level) => [level.id, level]));
  const STAGES = [
    { id: "memorize", title: "饱和背诵", short: "背", description: "只追求熟练，不想感情和动作。" },
    { id: "structure", title: "结构锚定", short: "拆", description: "把背下来的话拆成可复用骨架。" },
    { id: "variation", title: "变式打磨", short: "换", description: "换内容不换骨架，验证结构惯性。" },
    { id: "transfer", title: "迁移通关", short: "用", description: "用真实职场命题完成三次迁移。" },
  ];
  const ICONS = {
    logo: '<path d="M7 9.5a5 5 0 0 1 10 0v3a3 3 0 0 1-3 3h-1v-2h1a1 1 0 0 0 1-1v-3a3 3 0 0 0-6 0v3a1 1 0 0 0 1 1h1v2H9a3 3 0 0 1-3-3v-3Z"/><path d="M10 8.5h4v5h-4z"/>',
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10Z"/>',
    levels: '<path d="M6 3h12v18H6z"/><path d="M9 7h6M9 11h6M9 15h4"/>',
    history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/>',
    chevron: '<path d="m9 18 6-6-6-6"/>',
    arrowLeft: '<path d="m15 18-6-6 6-6"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    check: '<path d="m5 12 4 4L19 6"/><path d="M4 4h16v16H4z"/>',
    volume: '<path d="M4 10v4h4l5 4V6L8 10H4Z"/><path d="M16 9a4 4 0 0 1 0 6"/><path d="M18.5 6.5a8 8 0 0 1 0 11"/>',
    play: '<path d="m8 5 11 7-11 7V5Z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    refresh: '<path d="M20 6v5h-5"/><path d="M4 18v-5h5"/><path d="M18.5 9A7 7 0 0 0 6 6.5L4 9"/><path d="M5.5 15A7 7 0 0 0 18 17.5l2-2.5"/>',
    download: '<path d="M12 3v12"/><path d="m8 11 4 4 4-4"/><path d="M4 20h16"/>',
    trash: '<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="m6 7 1 14h10l1-14"/><path d="M10 11v6M14 11v6"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>',
    spark: '<path d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3Z"/><path d="m5 16 .8 2.2L8 19l-2.2.8L5 22l-.8-2.2L2 19l2.2-.8L5 16Z"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>',
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
  const uid = () => crypto.randomUUID?.() || `hsh-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const dayKey = (date = new Date()) =>
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const formatDate = (value) => {
    const date = value ? new Date(value) : new Date();
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };
  const formatDateTime = (value) => {
    const date = new Date(value);
    return `${date.getMonth() + 1}月${date.getDate()}日 ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const state = {
    route: "today",
    routeId: "",
    sessions: [],
    levelProgress: {},
    dataLoaded: false,
    storageReady: true,
    train: null,
    timer: null,
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
      const request = indexedDB.open("huishuohua-local", 4);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("sessions")) {
          const store = db.createObjectStore("sessions", { keyPath: "id" });
          store.createIndex("createdAt", "createdAt");
        }
        if (!db.objectStoreNames.contains("levelProgress")) {
          db.createObjectStore("levelProgress", { keyPath: "levelId" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function idb(storeName, mode, action) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, mode);
      const request = action(tx.objectStore(storeName));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      tx.oncomplete = () => db.close();
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  }

  const putSession = (session) => idb("sessions", "readwrite", (store) => store.put(session));
  const getSessions = () =>
    idb("sessions", "readonly", (store) => store.getAll()).then((rows) =>
      rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    );
  const putLevelProgress = (progress) =>
    idb("levelProgress", "readwrite", (store) => store.put(progress));
  const getLevelProgressRows = () =>
    idb("levelProgress", "readonly", (store) => store.getAll()).then((rows) =>
      Object.fromEntries(rows.map((row) => [row.levelId, row])),
    );

  async function refreshData() {
    try {
      const [sessions, levelProgress] = await Promise.all([
        getSessions(),
        getLevelProgressRows(),
      ]);
      state.sessions = sessions || [];
      state.levelProgress = levelProgress || {};
      state.storageReady = true;
    } catch (error) {
      console.warn(error);
      state.sessions = [];
      state.levelProgress = {};
      state.storageReady = false;
    } finally {
      state.dataLoaded = true;
    }
  }

  function getLevel(id) {
    return levelsById.get(id);
  }

  function getProgress(levelId) {
    return {
      levelId,
      memorizePasses: 0,
      structurePassed: false,
      variationPassed: false,
      transferPassed: [false, false, false],
      completed: false,
      completedAt: null,
      startedAt: null,
      updatedAt: null,
      ...(state.levelProgress[levelId] || {}),
    };
  }

  function currentStage(level) {
    const progress = getProgress(level.id);
    if (progress.memorizePasses < 3) return "memorize";
    if (!progress.structurePassed) return "structure";
    if (!progress.variationPassed) return "variation";
    if (progress.transferPassed.filter(Boolean).length < 3) return "transfer";
    return "complete";
  }

  function stagePassed(level, stage) {
    const progress = getProgress(level.id);
    if (stage === "memorize") return progress.memorizePasses >= 3;
    if (stage === "structure") return progress.structurePassed;
    if (stage === "variation") return progress.variationPassed;
    if (stage === "transfer") return progress.completed;
    return false;
  }

  function stageIndex(stageId) {
    return STAGES.findIndex((stage) => stage.id === stageId);
  }

  function isUnlocked(level) {
    const index = DATA.levels.findIndex((item) => item.id === level.id);
    return index === 0 || getProgress(DATA.levels[index - 1].id).completed;
  }

  function currentLevel() {
    return DATA.levels.find((level) => isUnlocked(level) && !getProgress(level.id).completed) || null;
  }

  function completedLevels() {
    return DATA.levels.filter((level) => getProgress(level.id).completed).length;
  }

  function parseRoute() {
    const raw = location.hash.replace(/^#\/?/, "");
    const [route = "today", ...parts] = raw.split("/");
    state.route = route || "today";
    state.routeId = parts.map(decodeURIComponent).join("/");
  }

  function navigate(path) {
    const next = `#/${path.replace(/^#\/?/, "")}`;
    if (location.hash === next) {
      parseRoute();
      render();
    } else location.hash = next;
  }

  function goBack() {
    if (history.length > 1) history.back();
    else navigate("today");
  }

  function topbar() {
    return `<header class="topbar">
      <div class="brand"><span class="brand-mark">${icon("logo")}</span><span class="brand-name">会说话 <small class="version-tag">V3</small></span></div>
      <div class="date-label">${formatDate()}</div>
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
    return `<nav class="bottom-nav">
      ${[
        ["today", "home", "今日"],
        ["levels", "levels", "七关"],
        ["records", "history", "记录"],
      ]
        .map(
          ([route, iconName, label]) => `<button class="nav-item ${active === route ? "active" : ""}" data-action="navigate" data-route="${route}">${icon(iconName)}<span>${label}</span></button>`,
        )
        .join("")}
    </nav>`;
  }

  function stagePath(level, compact = false) {
    const current = currentStage(level);
    const progress = getProgress(level.id);
    const passed = [
      progress.memorizePasses >= 3,
      progress.structurePassed,
      progress.variationPassed,
      progress.transferPassed.filter(Boolean).length >= 3,
    ];
    return `<div class="v3-stage-path ${compact ? "compact" : ""}">
      ${STAGES.map((stage, index) => {
        const isDone = passed[index];
        const isCurrent = current === stage.id;
        return `<div class="${isDone ? "done" : ""} ${isCurrent ? "current" : ""}">
          <span>${isDone ? icon("check") : index + 1}</span>
          <strong>${stage.short}</strong>
          <small>${stage.title}</small>
        </div>`;
      }).join("")}
    </div>`;
  }

  function levelNumber(level) {
    return `第 ${level.level} 关`;
  }

  function renderToday() {
    const level = currentLevel();
    if (!level) {
      return `<div class="page">${topbar()}
        <section class="v3-finished">
          <span>${icon("check")}</span>
          <div class="eyebrow">全部通关</div>
          <h1>七套经典结构，已经练进本能。</h1>
          <p>现在可以回到七关随时复练，或者回到真实工作中使用。</p>
          <button class="primary-button" data-action="navigate" data-route="levels">查看七关</button>
        </section>
        ${bottomNav("today")}
      </div>`;
    }
    const stage = currentStage(level);
    const stageData = STAGES[stageIndex(stage)];
    const progress = getProgress(level.id);
    return `<div class="page">
      ${topbar()}
      <section class="v3-today-hero">
        <div class="v3-level-line"><span>${levelNumber(level)}</span><span>${esc(level.difficulty)}</span></div>
        <h1>${esc(level.title)}</h1>
        <p>${esc(level.speaker)}</p>
        <div class="v3-hero-rule">${esc(level.summary)}</div>
        <button class="primary-button v3-main-button" data-action="start-current-stage">继续${esc(stageData.title)} ${icon("chevron")}</button>
      </section>
      <section class="v3-focus-card">
        <div class="v3-focus-head"><span>今天的唯一动作</span><small>${esc(stageData.description)}</small></div>
        <h2>${esc(stageData.title)}</h2>
        ${stagePath(level)}
      </section>
      <div class="v3-meta-line">
        <span>总进度 ${completedLevels()} / 7</span>
        <span>本关建议 3～5 天</span>
        <span>每天 10～15 分钟</span>
      </div>
      <p class="v3-principle">没击穿当前步骤，不进入下一步；没通过迁移，不解锁下一关。</p>
      ${bottomNav("today")}
    </div>`;
  }

  function renderLevels() {
    const active = currentLevel();
    return `<div class="page">
      ${topbar()}
      <header class="page-heading fade-in">
        <div class="eyebrow">七篇经典，逐关击穿</div>
        <h1>一遍只练一关，<br>练透再往下走。</h1>
        <p>每关对应一套可复用结构。当前完成 ${completedLevels()} / 7。</p>
      </header>
      <div class="v3-level-list">
        ${DATA.levels
          .map((level) => {
            const unlocked = isUnlocked(level);
            const progress = getProgress(level.id);
            const isCurrent = active?.id === level.id;
            return `<div class="v3-level-row ${unlocked ? "" : "locked"} ${progress.completed ? "done" : ""} ${isCurrent ? "current" : ""}">
              <span class="v3-level-number">${String(level.level).padStart(2, "0")}</span>
              <span class="v3-level-copy">
                <strong>${esc(level.title)}</strong>
                <small>${progress.completed ? "已通关 · " : unlocked ? `${esc(level.difficulty)} · ` : "尚未解锁 · "}${esc(level.speaker)}</small>
              </span>
              ${
                !unlocked
                  ? `<span class="v3-lock">${icon("lock")}</span>`
                  : progress.completed
                    ? `<span class="v3-done-mark">${icon("check")}</span>`
                    : `<button class="v3-row-action" data-action="start-level" data-id="${level.id}">${isCurrent ? "继续" : "开始"} ${icon("chevron")}</button>`
              }
            </div>`;
          })
          .join("")}
      </div>
      <div class="notice neutral">${icon("lock")}<span>强制解锁：上一关完成三次真实迁移之前，本关不会出现范文内容。</span></div>
      ${bottomNav("levels")}
    </div>`;
  }

  function renderRecords() {
    const current = currentLevel();
    const totalStages = Object.values(state.levelProgress).reduce((sum, progress) => {
      return (
        sum +
        (progress.memorizePasses >= 3 ? 1 : 0) +
        (progress.structurePassed ? 1 : 0) +
        (progress.variationPassed ? 1 : 0) +
        (progress.transferPassed?.filter(Boolean).length >= 3 ? 1 : 0)
      );
    }, 0);
    return `<div class="page">
      ${topbar()}
      <header class="page-heading fade-in">
        <div class="eyebrow">训练记录</div>
        <h1>只看你击穿了<br>哪几个单点。</h1>
        <p>${current ? `当前在第 ${current.level} 关：${esc(current.title)}` : "七关已全部通关。"}</p>
      </header>
      <div class="v3-stat-line">
        <div><strong>${completedLevels()}</strong><span>通关关卡</span></div>
        <div><strong>${totalStages}</strong><span>通过步骤</span></div>
        <div><strong>${state.sessions.length}</strong><span>过关记录</span></div>
      </div>
      <section class="section">
        <div class="section-head"><div><h2>过关记录</h2><p>记录不评价发音、气场或知识掌握。</p></div></div>
        ${
          state.sessions.length
            ? `<div class="history-list">${state.sessions
                .map(
                  (session) => `<div class="history-item v3-history-item">
                    <span class="history-icon">${icon(session.stage === "transfer" ? "target" : session.stage === "structure" ? "levels" : "check")}</span>
                    <span><h3>${esc(session.title || session.lessonTitle || "训练记录")}</h3><p>${esc(session.stageLabel || session.mode || "训练")} · ${formatDateTime(session.createdAt)}</p></span>
                  </div>`,
                )
                .join("")}</div>`
            : `<div class="empty-state"><div class="empty-icon">${icon("levels")}</div><h3>还没有过关记录</h3><p>完成第一关的连续三遍脱稿背诵后，这里会出现记录。</p><button class="primary-button" data-action="navigate" data-route="today">回到今日</button></div>`
        }
      </section>
      <section class="section">
        <div class="content-card flat">
          <div class="data-actions">
            <button class="secondary-button block" data-action="export-data" ${!state.sessions.length ? "disabled" : ""}>${icon("download")} 导出训练记录</button>
            <label class="secondary-button block" style="cursor:pointer">${icon("history")} 导入旧记录<input id="level-import-input" type="file" accept="application/json,.json" hidden></label>
            <button class="danger-button block" data-action="clear-data" ${!state.sessions.length ? "disabled" : ""}>${icon("trash")} 清空本机数据</button>
          </div>
          <p class="data-note">本版本训练以口头过关为主，不产生新的录音；导出包含历史记录和当前闯关进度。</p>
        </div>
      </section>
      ${state.storageReady ? "" : `<div class="notice danger">${icon("info")}<span>本地数据库不可用，当前进度可能无法保存。</span></div>`}
      ${bottomNav("records")}
    </div>`;
  }

  function stopTimer() {
    clearInterval(state.timer);
    state.timer = null;
  }

  function speak(text) {
    if (!("speechSynthesis" in window)) {
      showToast("当前浏览器不支持语音示范");
      return;
    }
    const utterance = new SpeechSynthesisUtterance(String(text).replace(/\n+/g, "，"));
    utterance.lang = "zh-CN";
    utterance.rate = 0.86;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  }

  function startCountUp(clockId) {
    stopTimer();
    state.train.elapsed = 0;
    const update = () => {
      const clock = document.getElementById(clockId);
      if (clock) clock.textContent = formatClock(state.train.elapsed);
    };
    update();
    state.timer = setInterval(() => {
      state.train.elapsed += 1;
      update();
    }, 1000);
  }

  function startCountdown(seconds, clockId) {
    stopTimer();
    state.train.countdown = seconds;
    const update = () => {
      const clock = document.getElementById(clockId);
      if (clock) clock.textContent = formatClock(state.train.countdown);
    };
    update();
    state.timer = setInterval(() => {
      state.train.countdown -= 1;
      update();
      if (state.train.countdown <= 0) {
        stopTimer();
        showToast("时间到，可以继续完成");
      }
    }, 1000);
  }

  function createTrain(levelId, stage) {
    const progress = getProgress(levelId);
    return {
      levelId,
      stage,
      view: "full",
      sentenceIndex: 0,
      reciteStarted: false,
      reciteFinished: false,
      elapsed: 0,
      countdown: 0,
      structureSelection: [],
      structureOrderCorrect: false,
      structureWrong: false,
      structureQuizChoice: null,
      structureQuizWrong: false,
      variationValues: {},
      variationOutline: "",
      variationError: "",
      transferIndex: Math.max(0, progress.transferPassed.findIndex((value) => !value)),
    };
  }

  function startLevel(levelId, requestedStage = null) {
    const level = getLevel(levelId);
    if (!level || !isUnlocked(level)) {
      showToast("请先通关上一关");
      return;
    }
    const progress = getProgress(level.id);
    if (progress.completed) {
      navigate("levels");
      return;
    }
    const nextStage = currentStage(level);
    const stage =
      requestedStage && (requestedStage === nextStage || stagePassed(level, requestedStage))
        ? requestedStage
        : nextStage;
    state.train = createTrain(level.id, stage);
    navigate(`train/${level.id}/${stage}`);
  }

  function ensureTrainFromRoute() {
    if (state.train) return true;
    const [levelId, requestedStage] = state.routeId.split("/");
    const level = getLevel(levelId);
    if (!level || !isUnlocked(level)) {
      navigate("today");
      return false;
    }
    const nextStage = currentStage(level);
    const stage =
      requestedStage && (requestedStage === nextStage || stagePassed(level, requestedStage))
        ? requestedStage
        : nextStage;
    if (stage !== requestedStage) {
      history.replaceState(null, "", `#/train/${level.id}/${stage}`);
      state.routeId = `${level.id}/${stage}`;
    }
    state.train = createTrain(level.id, stage);
    return true;
  }

  async function saveLevelProgress(levelId, patch) {
    const next = {
      ...getProgress(levelId),
      ...patch,
      levelId,
      startedAt: getProgress(levelId).startedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await putLevelProgress(next);
    state.levelProgress[levelId] = next;
    return next;
  }

  async function recordPass(level, stage) {
    const exists = state.sessions.some(
      (session) =>
        session.schemaVersion === 3 &&
        session.levelId === level.id &&
        session.stage === stage,
    );
    if (exists) return;
    const session = {
      id: uid(),
      schemaVersion: 3,
      levelId: level.id,
      title: `第 ${level.level} 关 · ${level.title}`,
      stage,
      stageLabel: STAGES.find((item) => item.id === stage)?.title || stage,
      status: "过关",
      createdAt: new Date().toISOString(),
      durationSec: 0,
      attempts: [],
    };
    await putSession(session);
    state.sessions.unshift(session);
  }

  function stageHeader(level, stage, subtitle) {
    const index = stageIndex(stage);
    return `<header class="backbar practice-header">
      <button class="icon-button" data-action="back" aria-label="返回">${icon("arrowLeft")}</button>
      <div class="backbar-title">${levelNumber(level)} · ${STAGES[index].title}</div>
      <span aria-hidden="true"></span>
    </header>
    <div class="v3-stage-progress">${STAGES.map((item, i) => `<span class="${i <= index ? "active" : ""}"></span>`).join("")}</div>
    <div class="v3-stage-subtitle">${esc(subtitle)}</div>`;
  }

  function stageCompleted(level, stage, title, text, nextStage, nextLabel) {
    return `<div class="page page-practice">
      ${stageHeader(level, stage, "这一关已经达到标准")}
      <main class="practice-shell">
        <section class="v3-stage-complete">
          <span class="completion-mark">${icon("check")}</span>
          <div class="eyebrow">${esc(STAGES[stageIndex(stage)].title)}已过关</div>
          <h1>${esc(title)}</h1>
          <p>${esc(text)}</p>
          <button class="primary-button block" data-action="open-stage" data-id="${level.id}" data-stage="${nextStage}">${esc(nextLabel)} ${icon("chevron")}</button>
        </section>
      </main>
    </div>`;
  }

  function renderMemorize(level) {
    const progress = getProgress(level.id);
    const drill = state.train;
    if (progress.memorizePasses >= 3) {
      return stageCompleted(
        level,
        "memorize",
        "全文已经进入熟练区。",
        "你已经连续三次无卡顿脱稿背诵。下一步只拆结构，不增加新的记忆任务。",
        "structure",
        "进入结构拆解",
      );
    }
    const sentences = level.text;
    const currentText =
      drill.view === "sentence" ? sentences[drill.sentenceIndex] : level.text.join("\n\n");
    return `<div class="page page-practice">
      ${stageHeader(level, "memorize", "只追求熟练，不要求感情和动作")}
      <main class="practice-shell">
        <section class="practice-center fade-in">
          <div class="practice-copy">
            <div class="eyebrow">第 1 步 · 饱和背诵</div>
            <h1>先把这一篇，<br>背到不用想。</h1>
            <p>逐句跟读，再全文跟读，最后脱稿。只有连续 3 次无卡顿，才进入结构拆解。</p>
          </div>
          <div class="v3-pass-counter">
            ${[0, 1, 2].map((index) => `<span class="${index < progress.memorizePasses ? "done" : ""}">${index < progress.memorizePasses ? icon("check") : index + 1}</span>`).join("")}
            <small>连续达标 ${progress.memorizePasses} / 3</small>
          </div>
          <section class="v3-classic-card">
            <div class="v3-card-tools">
              <button class="${drill.view === "sentence" ? "active" : ""}" data-action="memorize-view" data-view="sentence">逐句跟读</button>
              <button class="${drill.view === "full" ? "active" : ""}" data-action="memorize-view" data-view="full">全文跟读</button>
              <button class="speak-button" data-action="speak-memorize">${icon("volume")} 听示范</button>
            </div>
            ${
              drill.view === "sentence"
                ? `<div class="v3-sentence-focus">${esc(sentences[drill.sentenceIndex])}</div>
                   <div class="v3-sentence-nav">
                     <button data-action="sentence-prev" ${drill.sentenceIndex === 0 ? "disabled" : ""}>上一句</button>
                     <span>${drill.sentenceIndex + 1} / ${sentences.length}</span>
                     <button data-action="sentence-next" ${drill.sentenceIndex === sentences.length - 1 ? "disabled" : ""}>下一句</button>
                   </div>`
                : `<div class="v3-classic-text">${level.text.map((paragraph) => `<p>${esc(paragraph)}</p>`).join("")}</div>`
            }
          </section>
          ${
            !drill.reciteStarted
              ? `<button class="primary-button block" data-action="start-recite">开始脱稿背诵 ${icon("mic")}</button>
                 <p class="v3-small-note">开始后全文隐藏。背完再看原文，自行判断是否卡顿。</p>`
              : !drill.reciteFinished
                ? `<section class="v3-recite-card">
                    <div class="recording-status live">脱稿中</div>
                    <div class="recording-clock" id="recite-clock">${formatClock(drill.elapsed)}</div>
                    <p>不要看原文。背完后再结束计时。</p>
                    <button class="primary-button block" data-action="finish-recite">我背完了</button>
                  </section>`
                : `<section class="v3-recite-card">
                    <div class="eyebrow">这一遍结束</div>
                    <div class="v3-classic-text compact">${level.text.map((paragraph) => `<p>${esc(paragraph)}</p>`).join("")}</div>
                    <p>对照原文判断：有没有明显卡顿、错漏或需要停下来想很久？</p>
                    <div class="button-row">
                      <button class="secondary-button" data-action="stutter-reset">有卡顿，重新开始</button>
                      <button class="primary-button" data-action="clean-pass">无卡顿，完成一遍</button>
                    </div>
                  </section>`
          }
        </section>
      </main>
    </div>`;
  }

  function shuffledStructureOptions(level) {
    const items = level.structure.segments.map((label, index) => ({ label, index }));
    const shift = items.length > 1 ? 1 : 0;
    return [...items.slice(shift), ...items.slice(0, shift)];
  }

  function renderStructure(level) {
    const progress = getProgress(level.id);
    const drill = state.train;
    if (progress.structurePassed) {
      return stageCompleted(
        level,
        "structure",
        "你已经能看见骨架。",
        "下一步换掉所有内容，只保留这套顺序和功能。",
        "variation",
        "进入变式打磨",
      );
    }
    const options = shuffledStructureOptions(level);
    const selected = drill.structureSelection;
    const orderCorrect =
      selected.length === level.structure.segments.length &&
      selected.every((value, index) => value === index);
    return `<div class="page page-practice">
      ${stageHeader(level, "structure", "只判断结构，不评价语气和感染力")}
      <main class="practice-shell">
        <section class="practice-center fade-in">
          <div class="practice-copy">
            <div class="eyebrow">第 2 步 · 结构锚定</div>
            <h1>不看漂亮句子，<br>只看它怎么搭起来。</h1>
            <p>按顺序依次选择这一段的功能模块，拼出范文骨架。</p>
          </div>
          <section class="v3-classic-card">
            <div class="v3-classic-text compact">${level.text.map((paragraph) => `<p>${esc(paragraph)}</p>`).join("")}</div>
          </section>
          <section class="v3-structure-builder">
            <div class="v3-builder-head"><strong>拼出正确顺序</strong><button class="text-button" data-action="reset-structure">重新排序</button></div>
            <div class="v3-structure-options">
              ${options
                .map(
                  (item) => `<button class="${selected.includes(item.index) ? "selected" : ""}" data-action="pick-structure" data-index="${item.index}" ${selected.includes(item.index) ? "disabled" : ""}>${esc(item.label)}</button>`,
                )
                .join("")}
            </div>
            <div class="v3-structure-slots">${level.structure.segments
              .map(
                (_, index) => `<div><span>${index + 1}</span><strong>${selected[index] != null ? esc(level.structure.segments[selected[index]]) : "待选择"}</strong></div>`,
              )
              .join("")}</div>
            ${
              selected.length === level.structure.segments.length
                ? orderCorrect
                  ? `<div class="notice"><span>顺序正确。再看一个反例，确认你真的理解，而不是碰巧选中。</span></div>`
                  : `<div class="notice danger"><span>顺序不对，说明你记住了内容，但还没有抓住功能顺序。</span></div>`
                : ""
            }
          </section>
          ${
            orderCorrect
              ? `<form id="structure-quiz" class="v3-quiz">
                  <h3>${esc(level.quiz.question)}</h3>
                  ${level.quiz.options
                    .map(
                      (option, index) => `<label><input type="radio" name="quiz-option" value="${index}" ${drill.structureQuizChoice === index ? "checked" : ""}><span>${String.fromCharCode(65 + index)}</span><p>${esc(option)}</p></label>`,
                    )
                    .join("")}
                  ${drill.structureQuizWrong ? `<p class="v3-error">还不对。回到三段各自承担的功能上判断。</p>` : ""}
                  <button class="primary-button block" type="submit">确认结构答案</button>
                </form>`
              : ""
          }
        </section>
      </main>
    </div>`;
  }

  function fillVariationTemplate(level, values) {
    return level.variation.template.replace(/\{([^}]+)\}/g, (_, key) => values[key] || `【${key}】`);
  }

  function renderVariation(level) {
    const progress = getProgress(level.id);
    const drill = state.train;
    if (progress.variationPassed) {
      return stageCompleted(
        level,
        "variation",
        "骨架已经能脱离原内容。",
        "下一步进入三个真实职场命题，只有三次迁移全部通过才解锁下一关。",
        "transfer",
        "进入迁移通关",
      );
    }
    return `<div class="page page-practice">
      ${stageHeader(level, "variation", "换内容不换骨架，不引入新的表达技巧")}
      <main class="practice-shell">
        <section class="practice-center fade-in">
          <div class="practice-copy">
            <div class="eyebrow">第 3 步 · 变式打磨</div>
            <h1>把原话拿掉，<br>只留下骨架。</h1>
            <p>${esc(level.structure.name)}。填写新的职场内容，生成提纲后完整说一遍。</p>
          </div>
          <section class="v3-frame-card">
            <div class="content-label">原结构</div>
            <h3>${esc(level.structure.name)}</h3>
            <p>${esc(level.structure.summary)}</p>
          </section>
          ${
            !drill.variationOutline
              ? `<form id="variation-form" class="v3-form">
                  ${level.variation.fields
                    .map(
                      (field) => `<label><span>${esc(field)}</span><input name="${esc(field)}" value="${esc(drill.variationValues[field] || "")}" placeholder="输入一个真实工作内容"></label>`,
                    )
                    .join("")}
                  ${drill.variationError ? `<p class="v3-error">${esc(drill.variationError)}</p>` : ""}
                  <button class="primary-button block" type="submit">生成替换提纲</button>
                </form>`
              : `<section class="v3-outline-card">
                  <div class="content-label">你的新提纲</div>
                  <p>${esc(drill.variationOutline)}</p>
                  <button class="text-button" data-action="reset-variation">重新填写</button>
                </section>
                <section class="v3-timer-card">
                  <div class="stage-timer" id="variation-clock">01:30</div>
                  <button class="secondary-button block" data-action="start-countdown" data-seconds="90">开始 90 秒表达</button>
                </section>
                <div class="notice neutral"><span>说完后再确认：内容全换，顺序没有乱，结尾仍然落到行动。</span></div>
                <button class="primary-button block" data-action="pass-variation">我按这个骨架说完了 ${icon("check")}</button>`
          }
        </section>
      </main>
    </div>`;
  }

  function renderTransfer(level) {
    const progress = getProgress(level.id);
    const drill = state.train;
    if (progress.completed) return renderLevelComplete(level);
    const passed = progress.transferPassed || [false, false, false];
    const index = passed.findIndex((value) => !value);
    const prompt = level.transferPrompts[index];
    return `<div class="page page-practice">
      ${stageHeader(level, "transfer", "三题全部通过才解锁下一关")}
      <main class="practice-shell">
        <section class="practice-center fade-in">
          <div class="practice-copy">
            <div class="eyebrow">第 4 步 · 迁移通关 · ${index + 1} / 3</div>
            <h1>换一道没见过的题，<br>看骨架还在不在。</h1>
            <p>不要背原句，只使用本关的结构完成表达。</p>
          </div>
          <div class="v3-transfer-dots">${passed.map((value, i) => `<span class="${value ? "done" : i === index ? "current" : ""}">${value ? icon("check") : i + 1}</span>`).join("")}</div>
          <section class="v3-transfer-card">
            <div class="content-label">真实命题</div>
            <h2>${esc(prompt.title)}</h2>
            <p>${esc(prompt.scene)}</p>
            <div class="structure-flow">${level.structure.segments.map((segment) => `<span class="structure-step">${esc(segment)}</span>`).join("")}</div>
          </section>
          <section class="v3-timer-card">
            <div class="stage-timer" id="transfer-clock">02:00</div>
            <button class="secondary-button block" data-action="start-countdown" data-seconds="120" data-clock="transfer-clock">开始 2 分钟表达</button>
          </section>
          <form id="transfer-form" class="v3-check-form">
            <h3>完成后只检查结构</h3>
            ${prompt.checks
              .map(
                (check) => `<label><input type="checkbox" name="transfer-check" value="${esc(check)}"><span>${esc(check)}</span></label>`,
              )
              .join("")}
            <p class="v3-error" id="transfer-error"></p>
            <button class="primary-button block" type="submit">这一题通过，进入下一题 ${icon("chevron")}</button>
          </form>
          <p class="v3-small-note">只有三项结构检查全部勾选才计为通过。这里不评价发音、手势和气场。</p>
        </section>
      </main>
    </div>`;
  }

  function renderLevelComplete(level) {
    const next = DATA.levels[level.level] || null;
    return `<div class="page page-practice">
      ${backbar("通关完成")}
      <main class="practice-shell">
        <section class="v3-stage-complete">
          <span class="completion-mark">${icon("check")}</span>
          <div class="eyebrow">第 ${level.level} 关通关</div>
          <h1>${esc(level.title)}</h1>
          <p>你已经完成背诵、结构拆解、内容替换和三次真实迁移。</p>
          <blockquote class="gold-quote small">${esc(level.structure.name)}</blockquote>
          ${
            next
              ? `<button class="primary-button block" data-action="start-level" data-id="${next.id}">解锁第 ${next.level} 关 ${icon("chevron")}</button>`
              : `<button class="primary-button block" data-action="finish-all">完成全部七关 ${icon("check")}</button>`
          }
        </section>
      </main>
    </div>`;
  }

  function renderTraining() {
    if (!ensureTrainFromRoute()) return "";
    const level = getLevel(state.train.levelId);
    if (!level) {
      navigate("today");
      return "";
    }
    switch (state.train.stage) {
      case "memorize":
        return renderMemorize(level);
      case "structure":
        return renderStructure(level);
      case "variation":
        return renderVariation(level);
      case "transfer":
        return renderTransfer(level);
      default:
        return renderToday();
    }
  }

  async function handleCleanPass() {
    const level = getLevel(state.train.levelId);
    const progress = getProgress(level.id);
    const nextPasses = Math.min(3, progress.memorizePasses + 1);
    await saveLevelProgress(level.id, { memorizePasses: nextPasses });
    if (nextPasses >= 3) await recordPass(level, "memorize");
    state.train.reciteStarted = false;
    state.train.reciteFinished = false;
    stopTimer();
    render();
  }

  async function handleStutter() {
    const level = getLevel(state.train.levelId);
    await saveLevelProgress(level.id, { memorizePasses: 0 });
    state.train.reciteStarted = false;
    state.train.reciteFinished = false;
    stopTimer();
    showToast("连续次数已清零，重新开始第 1 遍");
    render();
  }

  async function submitStructureQuiz(event) {
    event.preventDefault();
    const level = getLevel(state.train.levelId);
    const selected = document.querySelector('input[name="quiz-option"]:checked');
    state.train.structureQuizChoice = selected ? Number(selected.value) : null;
    if (state.train.structureQuizChoice !== level.quiz.correct) {
      state.train.structureQuizWrong = true;
      render();
      return;
    }
    await saveLevelProgress(level.id, { structurePassed: true });
    await recordPass(level, "structure");
    render();
  }

  function submitVariation(event) {
    event.preventDefault();
    const level = getLevel(state.train.levelId);
    const form = new FormData(event.target);
    const values = Object.fromEntries(level.variation.fields.map((field) => [field, String(form.get(field) || "").trim()]));
    if (level.variation.fields.some((field) => !values[field])) {
      state.train.variationValues = values;
      state.train.variationError = "五项内容都要替换成真实工作场景，不能留空。";
      render();
      return;
    }
    state.train.variationValues = values;
    state.train.variationOutline = fillVariationTemplate(level, values);
    state.train.variationError = "";
    render();
  }

  async function passVariation() {
    const level = getLevel(state.train.levelId);
    if (!state.train.variationOutline) return;
    await saveLevelProgress(level.id, {
      variationPassed: true,
      variationOutline: state.train.variationOutline,
    });
    await recordPass(level, "variation");
    render();
  }

  async function submitTransfer(event) {
    event.preventDefault();
    const level = getLevel(state.train.levelId);
    const progress = getProgress(level.id);
    const index = progress.transferPassed.findIndex((value) => !value);
    const prompt = level.transferPrompts[index];
    const checked = event.target.querySelectorAll('input[name="transfer-check"]:checked').length;
    if (checked < prompt.checks.length) {
      const error = document.getElementById("transfer-error");
      if (error) error.textContent = "三项结构检查都完成，才能通过这一题。";
      return;
    }
    const transferPassed = [...progress.transferPassed];
    transferPassed[index] = true;
    const completed = transferPassed.every(Boolean);
    await saveLevelProgress(level.id, {
      transferPassed,
      completed,
      completedAt: completed ? new Date().toISOString() : null,
    });
    if (completed) await recordPass(level, "transfer");
    state.train.transferIndex = completed ? 2 : index + 1;
    render();
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
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
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
        schemaVersion: 3,
        exportedAt: new Date().toISOString(),
        sessions,
        levelProgress: Object.values(state.levelProgress),
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `会说话-七关记录-${dayKey()}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      showToast("训练记录已导出");
    } catch (error) {
      console.error(error);
      showToast("导出失败");
    }
  }

  async function importData(file) {
    if (!file) return;
    try {
      const payload = JSON.parse(await file.text());
      const sessions = Array.isArray(payload.sessions) ? payload.sessions : [];
      let count = 0;
      for (const raw of sessions) {
        if (!raw?.id || state.sessions.some((session) => session.id === raw.id)) continue;
        const attempts = [];
        for (const attempt of raw.attempts || []) {
          const { audioDataUrl, ...rest } = attempt;
          attempts.push({ ...rest, blob: audioDataUrl ? dataUrlToBlob(audioDataUrl) : null });
        }
        await putSession({ ...raw, attempts });
        count += 1;
      }
      for (const progress of payload.levelProgress || []) {
        if (progress?.levelId && getLevel(progress.levelId)) await putLevelProgress(progress);
      }
      await refreshData();
      render();
      showToast(count ? `已导入 ${count} 条记录` : "没有新的记录");
    } catch (error) {
      console.error(error);
      showToast("导入失败");
    }
  }

  async function clearAllData() {
    if (!window.confirm("这会永久删除本机训练记录和七关进度，无法恢复。确定清空吗？")) return;
    try {
      await Promise.all([
        idb("sessions", "readwrite", (store) => store.clear()),
        idb("levelProgress", "readwrite", (store) => store.clear()),
      ]);
      state.sessions = [];
      state.levelProgress = {};
      render();
      showToast("本机数据已清空");
    } catch (error) {
      console.error(error);
      showToast("清空失败");
    }
  }

  function render() {
    stopTimer();
    parseRoute();
    let html = "";
    switch (state.route) {
      case "today":
        state.train = null;
        html = renderToday();
        break;
      case "levels":
        state.train = null;
        html = renderLevels();
        break;
      case "records":
        state.train = null;
        html = renderRecords();
        break;
      case "train":
        html = renderTraining();
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
      case "start-current-stage": {
        const level = currentLevel();
        if (level) startLevel(level.id);
        break;
      }
      case "start-level":
        startLevel(id);
        break;
      case "open-stage":
        startLevel(id, trigger.dataset.stage);
        break;
      case "memorize-view":
        state.train.view = trigger.dataset.view;
        render();
        break;
      case "sentence-prev":
        if (state.train.sentenceIndex > 0) state.train.sentenceIndex -= 1;
        render();
        break;
      case "sentence-next": {
        const level = getLevel(state.train.levelId);
        if (state.train.sentenceIndex < level.text.length - 1) state.train.sentenceIndex += 1;
        render();
        break;
      }
      case "speak-memorize": {
        const level = getLevel(state.train.levelId);
        speak(
          state.train.view === "sentence"
            ? level.text[state.train.sentenceIndex]
            : level.text.join("，"),
        );
        break;
      }
      case "start-recite":
        state.train.reciteStarted = true;
        state.train.reciteFinished = false;
        render();
        startCountUp("recite-clock");
        break;
      case "finish-recite":
        stopTimer();
        state.train.reciteFinished = true;
        render();
        break;
      case "clean-pass":
        handleCleanPass();
        break;
      case "stutter-reset":
        handleStutter();
        break;
      case "pick-structure": {
        const index = Number(trigger.dataset.index);
        if (!state.train.structureSelection.includes(index)) {
          state.train.structureSelection.push(index);
          const level = getLevel(state.train.levelId);
          if (state.train.structureSelection.length === level.structure.segments.length) {
            state.train.structureOrderCorrect = state.train.structureSelection.every(
              (value, position) => value === position,
            );
          }
          render();
        }
        break;
      }
      case "reset-structure":
        state.train.structureSelection = [];
        state.train.structureOrderCorrect = false;
        state.train.structureQuizWrong = false;
        render();
        break;
      case "start-countdown":
        startCountdown(Number(trigger.dataset.seconds || 90), trigger.dataset.clock || "variation-clock");
        break;
      case "reset-variation":
        state.train.variationOutline = "";
        render();
        break;
      case "pass-variation":
        passVariation();
        break;
      case "finish-all":
        navigate("levels");
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
    if (event.target.id === "structure-quiz") submitStructureQuiz(event);
    if (event.target.id === "variation-form") submitVariation(event);
    if (event.target.id === "transfer-form") submitTransfer(event);
  });

  app.addEventListener("change", (event) => {
    if (event.target.name === "quiz-option" && state.train) {
      state.train.structureQuizChoice = Number(event.target.value);
      state.train.structureQuizWrong = false;
    }
    if (event.target.id === "level-import-input") {
      importData(event.target.files?.[0]).finally(() => {
        event.target.value = "";
      });
    }
  });

  window.addEventListener("hashchange", () => {
    stopTimer();
    if (!location.hash.startsWith("#/train")) state.train = null;
    render();
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
