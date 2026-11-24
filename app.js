(() => {
  "use strict";

  const DATA = window.HSH_CONTENT;
  const app = document.getElementById("app");
  const toastEl = document.getElementById("toast");
  const levelsById = new Map(DATA.levels.map((level) => [level.id, level]));
  const sidePacksById = new Map(DATA.sidePacks.map((pack) => [pack.id, pack]));
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
    sideProgress: {},
    voiceMeta: null,
    dataLoaded: false,
    storageReady: true,
    train: null,
    sideTrain: null,
    timer: null,
    voiceRate: 1,
    userAudioUrl: null,
    mediaRecorder: null,
    mediaStream: null,
    mediaChunks: [],
    mediaStartedAt: 0,
    voicePlayback: null,
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
      const request = indexedDB.open("huishuohua-local", 6);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("sessions")) {
          const store = db.createObjectStore("sessions", { keyPath: "id" });
          store.createIndex("createdAt", "createdAt");
        }
        if (!db.objectStoreNames.contains("levelProgress")) {
          db.createObjectStore("levelProgress", { keyPath: "levelId" });
        }
        if (!db.objectStoreNames.contains("sideProgress")) {
          db.createObjectStore("sideProgress", { keyPath: "packId" });
        }
        if (!db.objectStoreNames.contains("voiceMeta")) {
          db.createObjectStore("voiceMeta", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("voiceAssets")) {
          db.createObjectStore("voiceAssets", { keyPath: "key" });
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
  const putSideProgress = (progress) =>
    idb("sideProgress", "readwrite", (store) => store.put(progress));
  const getSideProgressRows = () =>
    idb("sideProgress", "readonly", (store) => store.getAll()).then((rows) =>
      Object.fromEntries(rows.map((row) => [row.packId, row])),
    );

  async function refreshData() {
    try {
      const [sessions, levelProgress, sideProgress, voiceMeta] = await Promise.all([
        getSessions(),
        getLevelProgressRows(),
        getSideProgressRows(),
        idb("voiceMeta", "readonly", (store) => store.get("active")),
      ]);
      state.sessions = sessions || [];
      state.levelProgress = levelProgress || {};
      state.sideProgress = sideProgress || {};
      state.voiceMeta = voiceMeta || null;
      state.storageReady = true;
    } catch (error) {
      console.warn(error);
      state.sessions = [];
      state.levelProgress = {};
      state.sideProgress = {};
      state.voiceMeta = null;
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

  function getSidePack(id) {
    return sidePacksById.get(id);
  }

  function getSideProgress(packId) {
    return {
      packId,
      started: false,
      completed: false,
      samples: {},
      startedAt: null,
      completedAt: null,
      updatedAt: null,
      ...(state.sideProgress[packId] || {}),
    };
  }

  function getSampleProgress(packId, sampleId) {
    return {
      sampleId,
      memorizePasses: 0,
      structurePassed: false,
      variationPassed: false,
      transferPassed: false,
      completed: false,
      ...(getSideProgress(packId).samples?.[sampleId] || {}),
    };
  }

  function sidePackUnlocked(pack) {
    if (!pack.unlockAfterLevel) return true;
    return getProgress(DATA.levels[pack.unlockAfterLevel - 1].id).completed;
  }

  function activeSidePack() {
    const active = Object.values(state.sideProgress).find((progress) => progress.started && !progress.completed);
    return active ? getSidePack(active.packId) : null;
  }

  function currentSideSample(pack) {
    return pack.samples.find((sample) => !getSampleProgress(pack.id, sample.id).completed) || null;
  }

  function sideSampleStage(pack, sample) {
    const progress = getSampleProgress(pack.id, sample.id);
    if (progress.memorizePasses < 3) return "memorize";
    if (!progress.structurePassed) return "structure";
    if (!progress.variationPassed) return "variation";
    if (!progress.transferPassed) return "transfer";
    return "complete";
  }

  async function saveSideSample(packId, sampleId, patch) {
    const packProgress = getSideProgress(packId);
    const previous = getSampleProgress(packId, sampleId);
    const samples = {
      ...packProgress.samples,
      [sampleId]: {
        ...previous,
        ...patch,
        updatedAt: new Date().toISOString(),
      },
    };
    const completed = getSidePack(packId).samples.every((sample) => samples[sample.id]?.completed);
    const next = {
      ...packProgress,
      packId,
      started: true,
      completed,
      completedAt: completed ? new Date().toISOString() : null,
      samples,
      startedAt: packProgress.startedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await putSideProgress(next);
    state.sideProgress[packId] = next;
    return next;
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
      <div class="brand"><span class="brand-mark">${icon("logo")}</span><span class="brand-name">会说话 <small class="version-tag">V3.2</small></span></div>
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
    const activeSide = activeSidePack();
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
      <section class="v3-side-entry">
        <button data-action="open-side-packs">
          <span class="v3-side-icon">${icon("cup")}</span>
          <span><strong>${activeSide ? `继续${esc(activeSide.title)}` : "支线补丁包"}</strong><small>${activeSide ? "支线进行中，主线仍可独立推进" : "敬酒 6 场景 · 致辞 5 场景"}</small></span>
          ${icon("chevron")}
        </button>
      </section>
      ${
        !state.voiceMeta
          ? `<button class="v3-voice-import-tip" data-action="navigate" data-route="records">${icon("volume")} 导入私人男声声音包，替换机械系统音</button>`
          : `<div class="v3-voice-active">${icon("volume")} 私人示范音：${esc(state.voiceMeta.name)}</div>`
      }
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

  function renderSidePacks() {
    const active = activeSidePack();
    return `<div class="page">
      ${backbar("支线补丁包")}
      <header class="page-heading fade-in">
        <div class="eyebrow">独立支线</div>
        <h1>短场景，也要<br>练成自己的。</h1>
        <p>支线不占主线七关编号。一次只能进行一个支线包，练完再回主线。</p>
      </header>
      <div class="v3-side-pack-list">
        ${DATA.sidePacks
          .map((pack) => {
            const progress = getSideProgress(pack.id);
            const unlocked = sidePackUnlocked(pack);
            const blockedByActive = active && active.id !== pack.id && !progress.completed;
            const current = currentSideSample(pack);
            const completedCount = pack.samples.filter((sample) => getSampleProgress(pack.id, sample.id).completed).length;
            return `<div class="v3-side-pack-card ${unlocked ? "" : "locked"}">
              <div class="v3-side-pack-head"><span class="v3-side-icon">${icon(pack.id === "toast" ? "cup" : "book")}</span><span>${esc(pack.kicker)}</span></div>
              <h2>${esc(pack.title)}</h2>
              <p>${esc(pack.description)}</p>
              <div class="v3-side-progress"><span><i style="width:${Math.round((completedCount / pack.samples.length) * 100)}%"></i></span><small>${completedCount} / ${pack.samples.length}</small></div>
              ${
                !unlocked
                  ? `<div class="v3-side-lock">${icon("lock")} 主线第 1 关通关后开放</div>`
                  : progress.completed
                    ? `<div class="v3-side-done">${icon("check")} 已完成</div>`
                    : blockedByActive
                      ? `<div class="v3-side-lock">${icon("lock")} 先完成${esc(active.title)}</div>`
                      : `<button class="primary-button block" data-action="open-side-pack" data-id="${pack.id}">${progress.started ? `继续 ${esc(current?.title || "")}` : `开始 ${esc(pack.title)}`} ${icon("chevron")}</button>`
              }
            </div>`;
          })
          .join("")}
      </div>
      <p class="v3-principle">支线内部同样逐样本解锁。当前样本未击穿，不进入下一个。</p>
    </div>`;
  }

  function renderSidePack(pack) {
    if (!pack) return renderSidePacks();
    const progress = getSideProgress(pack.id);
    const current = currentSideSample(pack);
    const active = activeSidePack();
    const blockedByActive = active && active.id !== pack.id && !progress.completed;
    return `<div class="page">
      ${backbar(pack.title)}
      <section class="v3-side-detail">
        <div class="eyebrow">${esc(pack.kicker)}</div>
        <h1>${esc(pack.title)}</h1>
        <p>${esc(pack.description)}</p>
        <blockquote>${esc(pack.structureName)}</blockquote>
      </section>
      <div class="v3-side-sample-list">
        ${pack.samples
          .map((sample) => {
            const sampleProgress = getSampleProgress(pack.id, sample.id);
            const isCurrent = current?.id === sample.id;
            const stateLabel = sampleProgress.completed ? "已通关" : isCurrent ? sideSampleStage(pack, sample) : "未解锁";
            return `<div class="v3-side-sample ${sampleProgress.completed ? "done" : ""} ${isCurrent ? "current" : ""} ${!sampleProgress.completed && !isCurrent ? "locked" : ""}">
              <span class="v3-side-sample-index">${sampleProgress.completed ? icon("check") : pack.samples.findIndex((item) => item.id === sample.id) + 1}</span>
              <span><strong>${esc(sample.title)}</strong><small>${sampleProgress.completed ? "已击穿" : isCurrent ? STAGES[stageIndex(stateLabel)]?.title || "进行中" : "完成上一组后解锁"}</small></span>
              ${
                isCurrent && !blockedByActive
                  ? `<button class="v3-row-action" data-action="start-side-sample" data-pack="${pack.id}" data-id="${sample.id}">${stateLabel === "memorize" ? "开始" : "继续"} ${icon("chevron")}</button>`
                  : !sampleProgress.completed
                    ? `<span class="v3-lock">${icon("lock")}</span>`
                    : ""
              }
            </div>`;
          })
          .join("")}
      </div>
      ${progress.completed ? `<div class="notice">${icon("check")}<span>${esc(pack.title)}已完成。请回主线继续七关训练。</span></div>` : ""}
      ${blockedByActive ? `<div class="notice danger">${icon("info")}<span>当前正在进行${esc(active.title)}，请先完成后再开启其他支线包。</span></div>` : ""}
    </div>`;
  }

  function createSideTrain(pack, sample, stage) {
    return {
      packId: pack.id,
      sampleId: sample.id,
      stage,
      view: "full",
      sentenceIndex: 0,
      reciteStarted: false,
      reciteFinished: false,
      elapsed: 0,
      countdown: 0,
      structureSelection: [],
      structureCorrect: false,
      variationValues: {},
      variationOutline: "",
      variationError: "",
    };
  }

  function startSideSample(packId, sampleId) {
    const pack = getSidePack(packId);
    const sample = pack?.samples.find((item) => item.id === sampleId);
    if (!pack || !sample || !sidePackUnlocked(pack)) {
      showToast("这个支线包还没有解锁");
      return;
    }
    const active = activeSidePack();
    if (active && active.id !== pack.id) {
      showToast(`请先完成${active.title}`);
      return;
    }
    const current = currentSideSample(pack);
    if (current?.id !== sample.id) {
      showToast("请按顺序完成当前样本");
      return;
    }
    const stage = sideSampleStage(pack, sample);
    state.sideTrain = createSideTrain(pack, sample, stage);
    saveSideSample(pack.id, sample.id, {}).finally(() => {
      navigate(`side-train/${pack.id}/${sample.id}/${stage}`);
    });
  }

  function sideStagePassed(pack, sample, stage) {
    const progress = getSampleProgress(pack.id, sample.id);
    if (stage === "memorize") return progress.memorizePasses >= 3;
    if (stage === "structure") return progress.structurePassed;
    if (stage === "variation") return progress.variationPassed;
    if (stage === "transfer") return progress.completed;
    return false;
  }

  function ensureSideTrainFromRoute() {
    if (state.sideTrain) return true;
    const [packId, sampleId, requestedStage] = state.routeId.split("/");
    const pack = getSidePack(packId);
    const sample = pack?.samples.find((item) => item.id === sampleId);
    if (!pack || !sample || !sidePackUnlocked(pack)) {
      navigate("sidepacks");
      return false;
    }
    const active = activeSidePack();
    if (active && active.id !== pack.id) {
      showToast(`请先完成${active.title}`);
      navigate("sidepacks");
      return false;
    }
    const current = currentSideSample(pack);
    if (current?.id !== sample.id) {
      navigate(`sidepack/${pack.id}`);
      return false;
    }
    const nextStage = sideSampleStage(pack, sample);
    const stage =
      requestedStage && (requestedStage === nextStage || sideStagePassed(pack, sample, requestedStage))
        ? requestedStage
        : nextStage;
    state.sideTrain = createSideTrain(pack, sample, stage);
    if (stage !== requestedStage) {
      history.replaceState(null, "", `#/side-train/${pack.id}/${sample.id}/${stage}`);
      state.routeId = `${pack.id}/${sample.id}/${stage}`;
    }
    return true;
  }

  async function recordSidePass(pack, sample, stage) {
    const exists = state.sessions.some(
      (session) =>
        session.schemaVersion === 4 &&
        session.packId === pack.id &&
        session.sampleId === sample.id &&
        session.stage === stage,
    );
    if (exists) return;
    const session = {
      id: uid(),
      schemaVersion: 4,
      packId: pack.id,
      sampleId: sample.id,
      title: `${pack.title} · ${sample.title}`,
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

  function sideHeader(pack, sample, stage) {
    const index = stageIndex(stage);
    return `<header class="backbar practice-header">
      <button class="icon-button" data-action="back" aria-label="返回">${icon("arrowLeft")}</button>
      <div class="backbar-title">${esc(pack.title)} · ${STAGES[index].title}</div>
      <span aria-hidden="true"></span>
    </header>
    <div class="v3-stage-progress">${STAGES.map((_, i) => `<span class="${i <= index ? "active" : ""}"></span>`).join("")}</div>
    <div class="v3-stage-subtitle">${esc(sample.title)} · ${pack.id === "toast" ? "30～45 秒" : "2～3 分钟"}</div>`;
  }

  function sideStageComplete(pack, sample, stage, title, copy) {
    const current = currentSideSample(pack);
    const nextStage = current?.id === sample.id ? sideSampleStage(pack, sample) : null;
    const nextSample = current?.id !== sample.id ? current : null;
    return `<div class="page page-practice">
      ${sideHeader(pack, sample, stage)}
      <main class="practice-shell">
        <section class="v3-stage-complete">
          <span class="completion-mark">${icon("check")}</span>
          <div class="eyebrow">${STAGES[stageIndex(stage)].title}已过关</div>
          <h1>${esc(title)}</h1>
          <p>${esc(copy)}</p>
          ${
            nextStage
              ? `<button class="primary-button block" data-action="start-side-sample" data-pack="${pack.id}" data-id="${sample.id}">继续${STAGES[stageIndex(nextStage)].title} ${icon("chevron")}</button>`
              : nextSample
                ? `<button class="primary-button block" data-action="start-side-sample" data-pack="${pack.id}" data-id="${nextSample.id}">进入下一组：${esc(nextSample.title)} ${icon("chevron")}</button>`
                : `<button class="primary-button block" data-action="open-side-pack" data-id="${pack.id}">查看${esc(pack.title)}通关 ${icon("check")}</button>`
          }
        </section>
      </main>
    </div>`;
  }

  function renderSideMemorize(pack, sample) {
    const progress = getSampleProgress(pack.id, sample.id);
    const drill = state.sideTrain;
    if (progress.memorizePasses >= 3) {
      return sideStageComplete(
        pack,
        sample,
        "memorize",
        "这段已经背熟。",
        "下一步只拆出固定骨架，不评价语气和表演。",
      );
    }
    const currentText =
      drill.view === "sentence" ? sample.text[drill.sentenceIndex] : sample.text;
    return `<div class="page page-practice">
      ${sideHeader(pack, sample, "memorize")}
      <main class="practice-shell">
        <section class="practice-center fade-in">
          <div class="practice-copy">
            <div class="eyebrow">第 1 步 · 饱和背诵</div>
            <h1>先把这一组，<br>背到不用想。</h1>
            <p>连续三次脱稿无卡顿，才拆结构。卡一次，连续次数清零。</p>
          </div>
          <div class="v3-pass-counter">
            ${[0, 1, 2].map((index) => `<span class="${index < progress.memorizePasses ? "done" : ""}">${index < progress.memorizePasses ? icon("check") : index + 1}</span>`).join("")}
            <small>连续达标 ${progress.memorizePasses} / 3</small>
          </div>
          <section class="v3-classic-card">
            <div class="v3-card-tools">
              <button class="${drill.view === "sentence" ? "active" : ""}" data-action="side-view" data-view="sentence">逐句跟读</button>
              <button class="${drill.view === "full" ? "active" : ""}" data-action="side-view" data-view="full">全文跟读</button>
            </div>
            ${
              drill.view === "sentence"
                ? `<div class="v3-sentence-focus">${esc(sample.text[drill.sentenceIndex])}</div>
                   <div class="v3-sentence-nav"><button data-action="side-sentence-prev" ${drill.sentenceIndex === 0 ? "disabled" : ""}>上一句</button><span>${drill.sentenceIndex + 1} / ${sample.text.length}</span><button data-action="side-sentence-next" ${drill.sentenceIndex === sample.text.length - 1 ? "disabled" : ""}>下一句</button></div>`
                : `<div class="v3-classic-text">${sample.text.map((paragraph) => `<p>${esc(paragraph)}</p>`).join("")}</div>`
            }
          </section>
          <div class="v3-demo-controls">
            <button data-action="demo-toggle">${icon("play")} 播放示范</button>
            <button data-action="demo-restart" disabled>${icon("refresh")} 从头</button>
          </div>
          ${voiceRateControls()}
          ${userRecordingControls()}
          ${
            !drill.reciteStarted
              ? `<button class="primary-button block" data-action="side-start-recite">开始脱稿背诵 ${icon("mic")}</button>
                 <p class="v3-small-note">开始后全文隐藏。只判断熟练，不评价情绪和语气。</p>`
              : !drill.reciteFinished
                ? `<section class="v3-recite-card"><div class="recording-status live">脱稿中</div><div class="recording-clock" id="recite-clock">${formatClock(drill.elapsed)}</div><p>不要看原文，背完后再结束计时。</p><button class="primary-button block" data-action="side-finish-recite">我背完了</button></section>`
                : `<section class="v3-recite-card"><div class="eyebrow">这一遍结束</div><div class="v3-classic-text compact">${sample.text.map((paragraph) => `<p>${esc(paragraph)}</p>`).join("")}</div><p>对照原文判断：有没有明显卡顿、错漏，或者需要停下来想很久？</p><div class="button-row"><button class="secondary-button" data-action="side-stutter">有卡顿，重新开始</button><button class="primary-button" data-action="side-clean-pass">无卡顿，完成一遍</button></div></section>`
          }
        </section>
      </main>
    </div>`;
  }

  function renderSideStructure(pack, sample) {
    const progress = getSampleProgress(pack.id, sample.id);
    const drill = state.sideTrain;
    if (progress.structurePassed) {
      return sideStageComplete(
        pack,
        sample,
        "structure",
        "骨架已经拆出来。",
        `${pack.structureName}。下一步换掉具体内容，只保留这个顺序。`,
      );
    }
    const items = pack.segments.map((label, index) => ({ label, index }));
    const shift = items.length > 1 ? 1 : 0;
    const options = [...items.slice(shift), ...items.slice(0, shift)];
    const selected = drill.structureSelection;
    const correct = selected.length === items.length && selected.every((value, index) => value === index);
    return `<div class="page page-practice">
      ${sideHeader(pack, sample, "structure")}
      <main class="practice-shell">
        <section class="practice-center fade-in">
          <div class="practice-copy">
            <div class="eyebrow">第 2 步 · 拆出骨架</div>
            <h1>内容可以忘，<br>顺序不能乱。</h1>
            <p>按顺序拼出这一段的固定模块，再脱口说出每一块的作用。</p>
          </div>
          <section class="v3-classic-card"><div class="v3-classic-text compact">${sample.text.map((paragraph) => `<p>${esc(paragraph)}</p>`).join("")}</div></section>
          <section class="v3-structure-builder">
            <div class="v3-builder-head"><strong>拼出正确顺序</strong><button class="text-button" data-action="side-reset-structure">重新排序</button></div>
            <div class="v3-structure-options">${options.map((item) => `<button class="${selected.includes(item.index) ? "selected" : ""}" data-action="side-pick-structure" data-index="${item.index}" ${selected.includes(item.index) ? "disabled" : ""}>${esc(item.label)}</button>`).join("")}</div>
            <div class="v3-structure-slots">${pack.segments.map((_, index) => `<div><span>${index + 1}</span><strong>${selected[index] != null ? esc(pack.segments[selected[index]]) : "待选择"}</strong></div>`).join("")}</div>
            ${selected.length === items.length ? `<div class="notice ${correct ? "" : "danger"}"><span>${correct ? "顺序正确。现在脱口说出每一块负责什么。" : "顺序不对，只重练本步。"}</span></div>` : ""}
          </section>
          ${correct ? `<button class="primary-button block" data-action="side-pass-structure">我已经能说出每块作用 ${icon("check")}</button>` : ""}
        </section>
      </main>
    </div>`;
  }

  function renderSideVariation(pack, sample) {
    const progress = getSampleProgress(pack.id, sample.id);
    const drill = state.sideTrain;
    if (progress.variationPassed) {
      return sideStageComplete(
        pack,
        sample,
        "variation",
        "骨架已经脱离原内容。",
        "下一步进入固定考场，用新对象或新场景完成最后一次迁移。",
      );
    }
    const duration = pack.id === "toast" ? 45 : 180;
    return `<div class="page page-practice">
      ${sideHeader(pack, sample, "variation")}
      <main class="practice-shell">
        <section class="practice-center fade-in">
          <div class="practice-copy">
            <div class="eyebrow">第 3 步 · 换内容保骨架</div>
            <h1>换掉内容，<br>不换顺序。</h1>
            <p>金句固定为：“${esc(sample.quote)}”。更换对象和三拍内容后，按原骨架完整说一遍。</p>
          </div>
          ${
            !drill.variationOutline
              ? `<form id="side-variation-form" class="v3-form">
                  ${pack.variation.fields
                    .map((field) => `<label><span>${esc(field)}</span><input name="${esc(field)}" value="${esc(drill.variationValues[field] || "")}" placeholder="换成一个真实内容"></label>`)
                    .join("")}
                  ${drill.variationError ? `<p class="v3-error">${esc(drill.variationError)}</p>` : ""}
                  <button class="primary-button block" type="submit">生成替换提纲</button>
                </form>`
              : `<section class="v3-outline-card"><div class="content-label">你的新提纲</div><p>${esc(drill.variationOutline)}</p><button class="text-button" data-action="side-reset-variation">重新填写</button></section>
                 <section class="v3-timer-card"><div class="stage-timer" id="side-variation-clock">${formatClock(duration)}</div><button class="secondary-button block" data-action="side-countdown" data-seconds="${duration}" data-clock="side-variation-clock">开始计时表达</button></section>
                 <div class="notice neutral"><span>只说固定骨架，不临场加新的结构。</span></div>
                 <button class="primary-button block" data-action="side-pass-variation">我按骨架说完了 ${icon("check")}</button>`
          }
        </section>
      </main>
    </div>`;
  }

  function renderSideTransfer(pack, sample) {
    const progress = getSampleProgress(pack.id, sample.id);
    if (progress.completed) {
      return sideStageComplete(
        pack,
        sample,
        "transfer",
        "这组场景已经通关。",
        "按固定流程进入下一组，不增加额外样本。",
      );
    }
    return `<div class="page page-practice">
      ${sideHeader(pack, sample, "transfer")}
      <main class="practice-shell">
        <section class="practice-center fade-in">
          <div class="practice-copy">
            <div class="eyebrow">第 4 步 · 场景套用通关</div>
            <h1>换对象，<br>骨架还在不在？</h1>
            <p>不看原稿，按固定骨架完成下面的真实场景。</p>
          </div>
          <section class="v3-transfer-card">
            <div class="content-label">通关命题</div>
            <h2>${esc(sample.transfer.title)}</h2>
            <p>${esc(sample.transfer.scene)}</p>
            <div class="structure-flow">${pack.segments.map((segment) => `<span class="structure-step">${esc(segment)}</span>`).join("")}</div>
          </section>
          <section class="v3-timer-card"><div class="stage-timer" id="side-transfer-clock">${formatClock(pack.id === "toast" ? 45 : 180)}</div><button class="secondary-button block" data-action="side-countdown" data-seconds="${pack.id === "toast" ? 45 : 180}" data-clock="side-transfer-clock">开始脱稿表达</button></section>
          <form id="side-transfer-form" class="v3-check-form">
            <h3>只检查结构</h3>
            ${sample.transfer.checks.map((check) => `<label><input type="checkbox" name="side-transfer-check" value="${esc(check)}"><span>${esc(check)}</span></label>`).join("")}
            <p class="v3-error" id="side-transfer-error"></p>
            <button class="primary-button block" type="submit">这一组通过 ${icon("chevron")}</button>
          </form>
        </section>
      </main>
    </div>`;
  }

  function renderSideTraining() {
    if (!ensureSideTrainFromRoute()) return "";
    const pack = getSidePack(state.sideTrain.packId);
    const sample = pack?.samples.find((item) => item.id === state.sideTrain.sampleId);
    if (!pack || !sample) {
      navigate("sidepacks");
      return "";
    }
    switch (state.sideTrain.stage) {
      case "memorize":
        return renderSideMemorize(pack, sample);
      case "structure":
        return renderSideStructure(pack, sample);
      case "variation":
        return renderSideVariation(pack, sample);
      case "transfer":
        return renderSideTransfer(pack, sample);
      default:
        return renderSidePack(pack);
    }
  }

  async function handleSideCleanPass() {
    const pack = getSidePack(state.sideTrain.packId);
    const sample = pack.samples.find((item) => item.id === state.sideTrain.sampleId);
    const progress = getSampleProgress(pack.id, sample.id);
    const passes = Math.min(3, progress.memorizePasses + 1);
    await saveSideSample(pack.id, sample.id, { memorizePasses: passes });
    if (passes >= 3) await recordSidePass(pack, sample, "memorize");
    state.sideTrain.reciteStarted = false;
    state.sideTrain.reciteFinished = false;
    stopTimer();
    render();
  }

  async function handleSideStutter() {
    const pack = getSidePack(state.sideTrain.packId);
    const sample = pack.samples.find((item) => item.id === state.sideTrain.sampleId);
    await saveSideSample(pack.id, sample.id, { memorizePasses: 0 });
    state.sideTrain.reciteStarted = false;
    state.sideTrain.reciteFinished = false;
    stopTimer();
    showToast("连续次数已清零，重新开始第 1 遍");
    render();
  }

  async function passSideStructure() {
    const pack = getSidePack(state.sideTrain.packId);
    const sample = pack.samples.find((item) => item.id === state.sideTrain.sampleId);
    await saveSideSample(pack.id, sample.id, { structurePassed: true });
    await recordSidePass(pack, sample, "structure");
    render();
  }

  function fillSideVariation(pack, sample, values, template) {
    return template.replace(/\{([^}]+)\}/g, (_, key) => {
      if (key === "引用") return sample.quote;
      return values[key] || `【${key}】`;
    });
  }

  function submitSideVariation(event) {
    event.preventDefault();
    const pack = getSidePack(state.sideTrain.packId);
    const sample = pack.samples.find((item) => item.id === state.sideTrain.sampleId);
    const form = new FormData(event.target);
    const values = Object.fromEntries(pack.variation.fields.map((field) => [field, String(form.get(field) || "").trim()]));
    if (pack.variation.fields.some((field) => !values[field])) {
      state.sideTrain.variationValues = values;
      state.sideTrain.variationError = "每一项都要替换成真实内容，不能留空。";
      render();
      return;
    }
    state.sideTrain.variationValues = values;
    state.sideTrain.variationOutline = fillSideVariation(
      pack,
      sample,
      values,
      pack.variation.template,
    );
    state.sideTrain.variationError = "";
    render();
  }

  async function passSideVariation() {
    const pack = getSidePack(state.sideTrain.packId);
    const sample = pack.samples.find((item) => item.id === state.sideTrain.sampleId);
    await saveSideSample(pack.id, sample.id, {
      variationPassed: true,
      variationOutline: state.sideTrain.variationOutline,
    });
    await recordSidePass(pack, sample, "variation");
    render();
  }

  async function submitSideTransfer(event) {
    event.preventDefault();
    const pack = getSidePack(state.sideTrain.packId);
    const sample = pack.samples.find((item) => item.id === state.sideTrain.sampleId);
    const checks = event.target.querySelectorAll('input[name="side-transfer-check"]:checked').length;
    if (checks < sample.transfer.checks.length) {
      const error = document.getElementById("side-transfer-error");
      if (error) error.textContent = "结构检查全部完成，才能通过这一组。";
      return;
    }
    await saveSideSample(pack.id, sample.id, {
      transferPassed: true,
      completed: true,
    });
    await recordSidePass(pack, sample, "transfer");
    render();
  }

  function renderRecords() {
    const current = currentLevel();
    const mainStages = Object.values(state.levelProgress).reduce((sum, progress) => {
      return (
        sum +
        (progress.memorizePasses >= 3 ? 1 : 0) +
        (progress.structurePassed ? 1 : 0) +
        (progress.variationPassed ? 1 : 0) +
        (progress.transferPassed?.filter(Boolean).length >= 3 ? 1 : 0)
      );
    }, 0);
    const sideStages = Object.values(state.sideProgress).reduce((sum, packProgress) => {
      return (
        sum +
        Object.values(packProgress.samples || {}).reduce((sampleSum, sample) => {
          return (
            sampleSum +
            (sample.memorizePasses >= 3 ? 1 : 0) +
            (sample.structurePassed ? 1 : 0) +
            (sample.variationPassed ? 1 : 0) +
            (sample.transferPassed ? 1 : 0)
          );
        }, 0)
      );
    }, 0);
    const completedSideSamples = DATA.sidePacks.reduce(
      (sum, pack) =>
        sum +
        pack.samples.filter((sample) => getSampleProgress(pack.id, sample.id).completed).length,
      0,
    );
    return `<div class="page">
      ${topbar()}
      <header class="page-heading fade-in">
        <div class="eyebrow">训练记录</div>
        <h1>只看你击穿了<br>哪几个单点。</h1>
        <p>${current ? `当前在第 ${current.level} 关：${esc(current.title)}` : "七关已全部通关。"}</p>
      </header>
      <div class="v3-stat-line">
        <div><strong>${completedLevels()}</strong><span>通关关卡</span></div>
        <div><strong>${completedSideSamples}/11</strong><span>支线样本</span></div>
        <div><strong>${state.sessions.length}</strong><span>过关记录</span></div>
      </div>
      <p class="v3-principle">主线通过 ${mainStages} 个步骤，支线通过 ${sideStages} 个步骤。</p>
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
        <div class="section-head"><div><h2>私人示范音</h2><p>音频只导入当前手机，不上传公开网页。</p></div></div>
        <div class="content-card flat">
          ${
            state.voiceMeta
              ? `<div class="v3-voice-pack-current"><span>${icon("volume")}</span><div><strong>${esc(state.voiceMeta.name)}</strong><small>${state.voiceMeta.fileCount || 0} 段音频 · 已保存在本机</small></div></div>
                 <button class="danger-button block" style="margin-top:10px" data-action="remove-voice-pack">${icon("trash")} 删除私人声音包</button>`
              : `<p style="color:var(--ink-soft);font-size:11px;line-height:1.65">导入后会优先使用私人男声示范，不进入公开 GitHub。未导入时自动使用系统中文语音。</p>`
          }
          <label class="secondary-button block" style="cursor:pointer;margin-top:10px">${icon("volume")} 导入私人声音包<input id="voice-pack-input" type="file" accept=".json,.hshvoice,application/json" hidden></label>
        </div>
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

  function preferredVoice() {
    const voices = window.speechSynthesis?.getVoices?.() || [];
    const chinese = voices.filter((voice) => /^zh|Chinese|中文/i.test(`${voice.lang} ${voice.name}`));
    const maleHints = /Yunxi|Yunyang|Kangkang|Liang|Male|男|Sinji/i;
    return chinese.find((voice) => maleHints.test(voice.name)) || chinese[0] || null;
  }

  function speak(text, rate = state.voiceRate) {
    if (!("speechSynthesis" in window)) {
      showToast("当前浏览器不支持语音示范");
      return;
    }
    const utterance = new SpeechSynthesisUtterance(String(text).replace(/\n+/g, "，"));
    utterance.lang = "zh-CN";
    utterance.rate = rate;
    const voice = preferredVoice();
    if (voice) utterance.voice = voice;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  }

  function stopVoicePlayback() {
    if (!state.voicePlayback) return;
    clearTimeout(state.voicePlayback.delay);
    try {
      state.voicePlayback.audio?.pause();
    } catch {
      // ignore already finished audio
    }
    if (state.voicePlayback.url) URL.revokeObjectURL(state.voicePlayback.url);
    state.voicePlayback.cancelled = true;
    state.voicePlayback.audio = null;
    state.voicePlayback = null;
    window.speechSynthesis?.cancel?.();
    updateDemoControls();
  }

  function getVoiceAsset(key) {
    return idb("voiceAssets", "readonly", (store) => store.get(key));
  }

  function base64Audio(data, mime = "audio/mpeg") {
    const binary = atob(data);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return new Blob([bytes], { type: mime });
  }

  function updateDemoControls() {
    const playback = state.voicePlayback;
    document.querySelectorAll('[data-action="demo-toggle"]').forEach((button) => {
      button.innerHTML = playback?.paused
        ? `${icon("play")} 继续播放`
        : playback
          ? `${icon("stop")} 暂停`
          : `${icon("play")} 播放示范`;
    });
    document.querySelectorAll('[data-action="demo-restart"]').forEach((button) => {
      button.disabled = !playback;
    });
  }

  function finishVoicePlayback(playback) {
    if (state.voicePlayback !== playback) return;
    playback.cancelled = true;
    playback.audio = null;
    state.voicePlayback = null;
    updateDemoControls();
  }

  function playPrivateBlock(playback, index) {
    if (playback.cancelled || state.voicePlayback !== playback) return;
    if (index >= playback.assets.length) {
      finishVoicePlayback(playback);
      return;
    }
    playback.index = index;
    const url = URL.createObjectURL(playback.assets[index].blob);
    const audio = new Audio(url);
    playback.audio = audio;
    playback.url = url;
    playback.blockEnded = false;
    audio.playbackRate = playback.rate;
    audio.preservesPitch = true;
    audio.onended = () => {
      URL.revokeObjectURL(url);
      playback.url = null;
      playback.audio = null;
      playback.blockEnded = true;
      if (playback.paused) return;
      playback.delay = setTimeout(() => playPrivateBlock(playback, index + 1), 550);
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      playback.url = null;
      playback.audio = null;
      startSystemPlayback(playback.blocks, playback.rate);
    };
    audio.play().catch(() => {
      URL.revokeObjectURL(url);
      playback.url = null;
      playback.audio = null;
      startSystemPlayback(playback.blocks, playback.rate);
    });
  }

  function playSystemBlock(playback, index) {
    if (playback.cancelled || state.voicePlayback !== playback) return;
    if (index >= playback.blocks.length) {
      finishVoicePlayback(playback);
      return;
    }
    if (!("speechSynthesis" in window)) {
      finishVoicePlayback(playback);
      showToast("当前浏览器不支持语音示范");
      return;
    }
    playback.index = index;
    const utterance = new SpeechSynthesisUtterance(playback.blocks[index]);
    const voice = preferredVoice();
    utterance.lang = "zh-CN";
    utterance.rate = playback.rate;
    if (voice) utterance.voice = voice;
    playback.utterance = utterance;
    playback.blockEnded = false;
    utterance.onend = () => {
      playback.blockEnded = true;
      if (playback.paused) return;
      playback.delay = setTimeout(() => playSystemBlock(playback, index + 1), 550);
    };
    speechSynthesis.speak(utterance);
  }

  function startSystemPlayback(blocks, rate = state.voiceRate) {
    stopVoicePlayback();
    const playback = {
      mode: "system",
      blocks: Array.isArray(blocks) ? blocks : [blocks],
      assets: [],
      rate,
      index: 0,
      paused: false,
      cancelled: false,
      audio: null,
      utterance: null,
      delay: null,
      blockEnded: false,
    };
    state.voicePlayback = playback;
    playSystemBlock(playback, 0);
    updateDemoControls();
  }

  async function playVoiceKeys(keys, fallbackText, rate = state.voiceRate) {
    const blocks = Array.isArray(fallbackText) ? fallbackText : [fallbackText];
    if (!state.voiceMeta) {
      startSystemPlayback(blocks, rate);
      return;
    }
    try {
      const assets = await Promise.all(keys.map((key) => getVoiceAsset(key)));
      if (assets.some((asset) => !asset?.blob)) {
        startSystemPlayback(blocks, rate);
        return;
      }
      stopVoicePlayback();
      const playback = {
        mode: "private",
        keys,
        blocks,
        assets,
        rate,
        index: 0,
        paused: false,
        cancelled: false,
        audio: null,
        utterance: null,
        delay: null,
        url: null,
        blockEnded: false,
      };
      state.voicePlayback = playback;
      playPrivateBlock(playback, 0);
      updateDemoControls();
    } catch (error) {
      console.warn(error);
      startSystemPlayback(blocks, rate);
    }
  }

  function toggleVoicePlayback() {
    const playback = state.voicePlayback;
    if (!playback) return;
    playback.paused = !playback.paused;
    if (playback.paused) {
      clearTimeout(playback.delay);
      playback.delay = null;
      if (playback.mode === "private") playback.audio?.pause();
      else window.speechSynthesis?.pause?.();
    } else if (playback.mode === "private") {
      if (playback.audio && !playback.blockEnded) {
        playback.audio.play().catch(() => {});
      } else {
        playPrivateBlock(playback, playback.blockEnded ? playback.index + 1 : playback.index);
      }
    } else if (playback.blockEnded) {
      playSystemBlock(playback, playback.index + 1);
    } else {
      window.speechSynthesis?.resume?.();
    }
    updateDemoControls();
  }

  function restartVoicePlayback() {
    const playback = state.voicePlayback;
    if (!playback) return;
    const { mode, keys, blocks, rate } = playback;
    stopVoicePlayback();
    if (mode === "private") playVoiceKeys(keys, blocks, rate);
    else startSystemPlayback(blocks, rate);
  }

  function currentDemoDefinition() {
    if (state.route === "train" && state.train?.stage === "memorize") {
      const level = getLevel(state.train.levelId);
      if (state.train.view === "sentence") {
        return {
          keys: [`level-${level.id}-p${state.train.sentenceIndex + 1}`],
          blocks: [level.text[state.train.sentenceIndex]],
        };
      }
      return {
        keys: level.text.map((_, index) => `level-${level.id}-p${index + 1}`),
        blocks: level.text,
      };
    }
    if (state.route === "side-train" && state.sideTrain?.stage === "memorize") {
      const pack = getSidePack(state.sideTrain.packId);
      const sample = pack?.samples.find((item) => item.id === state.sideTrain.sampleId);
      if (!sample) return null;
      if (state.sideTrain.view === "sentence") {
        return {
          keys: [`side-${pack.id}-${sample.id}-p${state.sideTrain.sentenceIndex + 1}`],
          blocks: [sample.text[state.sideTrain.sentenceIndex]],
        };
      }
      return {
        keys: sample.text.map((_, index) => `side-${pack.id}-${sample.id}-p${index + 1}`),
        blocks: sample.text,
      };
    }
    return null;
  }

  function toggleCurrentDemo() {
    if (state.voicePlayback) {
      toggleVoicePlayback();
      return;
    }
    const demo = currentDemoDefinition();
    if (demo) playVoiceKeys(demo.keys, demo.blocks);
  }

  function restartCurrentDemo() {
    const demo = currentDemoDefinition();
    if (demo) playVoiceKeys(demo.keys, demo.blocks);
  }

  async function importVoicePack(file) {
    if (!file) return;
    try {
      const payload = JSON.parse(await file.text());
      if (payload?.type !== "private-voice-pack" || !payload.files) {
        throw new Error("Invalid voice pack");
      }
      const rows = Object.entries(payload.files);
      if (!rows.length) throw new Error("Empty voice pack");
      showToast("正在导入私人声音包…");
      const db = await openDB();
      await new Promise((resolve, reject) => {
        const tx = db.transaction(["voiceAssets", "voiceMeta"], "readwrite");
        const assets = tx.objectStore("voiceAssets");
        assets.clear();
        for (const [key, fileData] of rows) {
          assets.put({
            key,
            blob: base64Audio(fileData.data, fileData.mime || "audio/mpeg"),
          });
        }
        tx.objectStore("voiceMeta").put({
          id: "active",
          name: payload.name || "私人男声",
          voiceId: payload.voiceId || "",
          fileCount: rows.length,
          createdAt: payload.createdAt || null,
          importedAt: new Date().toISOString(),
        });
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });
      db.close();
      state.voiceMeta = await idb("voiceMeta", "readonly", (store) => store.get("active"));
      render();
      showToast(`私人声音包已导入，共 ${rows.length} 段`);
    } catch (error) {
      console.error(error);
      showToast("声音包导入失败，请确认选择了正确的私人声音包文件");
    }
  }

  async function removeVoicePack() {
    if (!window.confirm("删除本机私人声音包？删除后将恢复系统语音。")) return;
    try {
      const db = await openDB();
      await new Promise((resolve, reject) => {
        const tx = db.transaction(["voiceAssets", "voiceMeta"], "readwrite");
        tx.objectStore("voiceAssets").clear();
        tx.objectStore("voiceMeta").delete("active");
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });
      db.close();
      state.voiceMeta = null;
      render();
      showToast("私人声音包已删除");
    } catch (error) {
      console.error(error);
      showToast("删除失败");
    }
  }

  function voiceRateControls() {
    return `<div class="v3-voice-rate">
      <span>示范语速 · ${state.voiceMeta ? esc(state.voiceMeta.name) : "系统中文男声"}</span>
      ${[0.8, 1, 1.5]
        .map(
          (rate) => `<button class="${state.voiceRate === rate ? "active" : ""}" data-action="voice-rate" data-rate="${rate}">${rate.toFixed(1)}x</button>`,
        )
        .join("")}
    </div>`;
  }

  function clearUserAudio() {
    if (state.userAudioUrl) URL.revokeObjectURL(state.userAudioUrl);
    state.userAudioUrl = null;
  }

  function recordingSupported() {
    return Boolean(window.isSecureContext && navigator.mediaDevices?.getUserMedia && window.MediaRecorder);
  }

  async function startUserRecording() {
    if (!recordingSupported()) {
      showToast("当前微信环境无法录音，可继续使用语音示范跟读");
      return;
    }
    try {
      clearUserAudio();
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      const recorder = new MediaRecorder(stream);
      state.mediaStream = stream;
      state.mediaRecorder = recorder;
      state.mediaChunks = [];
      state.mediaStartedAt = Date.now();
      recorder.ondataavailable = (event) => {
        if (event.data?.size) state.mediaChunks.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(state.mediaChunks, { type: recorder.mimeType || "audio/mp4" });
        clearUserAudio();
        state.userAudioUrl = URL.createObjectURL(blob);
        state.mediaStream?.getTracks().forEach((track) => track.stop());
        state.mediaStream = null;
        state.mediaRecorder = null;
        render();
      };
      recorder.start(500);
      render();
    } catch (error) {
      console.warn(error);
      showToast("没有获得麦克风权限，可继续使用系统示范");
    }
  }

  function stopUserRecording() {
    if (state.mediaRecorder?.state === "recording") state.mediaRecorder.stop();
  }

  function userRecordingControls() {
    return `<section class="v3-follow-record">
      <div class="v3-follow-head"><strong>跟读自检</strong><small>系统示范用于定节奏，录音只用于自己对比，不做评分。</small></div>
      ${
        state.mediaRecorder?.state === "recording"
          ? `<button class="record-button stop" data-action="stop-user-recording" aria-label="停止录音"></button><p>录音中，点击停止</p>`
          : `<button class="secondary-button block" data-action="start-user-recording">${icon("mic")} 录一遍跟读</button>
             ${state.userAudioUrl ? `<audio controls playsinline src="${state.userAudioUrl}"></audio>` : ""}`
      }
    </section>`;
  }

  function startCountUp(clockId, target = state.train) {
    stopTimer();
    target.elapsed = 0;
    const update = () => {
      const clock = document.getElementById(clockId);
      if (clock) clock.textContent = formatClock(target.elapsed);
    };
    update();
    state.timer = setInterval(() => {
      target.elapsed += 1;
      update();
    }, 1000);
  }

  function startCountdown(seconds, clockId, target = state.train) {
    stopTimer();
    target.countdown = seconds;
    const update = () => {
      const clock = document.getElementById(clockId);
      if (clock) clock.textContent = formatClock(target.countdown);
    };
    update();
    state.timer = setInterval(() => {
      target.countdown -= 1;
      update();
      if (target.countdown <= 0) {
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
          <div class="v3-demo-controls">
            <button data-action="demo-toggle">${icon("play")} 播放示范</button>
            <button data-action="demo-restart" disabled>${icon("refresh")} 从头</button>
          </div>
          ${voiceRateControls()}
          ${userRecordingControls()}
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
        sideProgress: Object.values(state.sideProgress),
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
      for (const progress of payload.sideProgress || []) {
        if (progress?.packId && getSidePack(progress.packId)) await putSideProgress(progress);
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
        idb("sideProgress", "readwrite", (store) => store.clear()),
        idb("voiceAssets", "readwrite", (store) => store.clear()),
        idb("voiceMeta", "readwrite", (store) => store.clear()),
      ]);
      state.sessions = [];
      state.levelProgress = {};
      state.sideProgress = {};
      state.voiceMeta = null;
      render();
      showToast("本机数据已清空");
    } catch (error) {
      console.error(error);
      showToast("清空失败");
    }
  }

  function render() {
    stopTimer();
    stopVoicePlayback();
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
      case "sidepacks":
        state.train = null;
        html = renderSidePacks();
        break;
      case "sidepack":
        state.train = null;
        html = renderSidePack(getSidePack(state.routeId));
        break;
      case "side-train":
        html = renderSideTraining();
        break;
      case "train":
        html = renderTraining();
        break;
      default:
        html = renderToday();
    }
    app.innerHTML = html;
    updateDemoControls();
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
      case "open-side-packs":
        navigate("sidepacks");
        break;
      case "open-side-pack":
        navigate(`sidepack/${id}`);
        break;
      case "start-side-sample":
        startSideSample(trigger.dataset.pack, id);
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
        toggleCurrentDemo();
        break;
      }
      case "side-view":
        state.sideTrain.view = trigger.dataset.view;
        render();
        break;
      case "side-sentence-prev":
        if (state.sideTrain.sentenceIndex > 0) state.sideTrain.sentenceIndex -= 1;
        render();
        break;
      case "side-sentence-next": {
        const pack = getSidePack(state.sideTrain.packId);
        const sample = pack.samples.find((item) => item.id === state.sideTrain.sampleId);
        if (state.sideTrain.sentenceIndex < sample.text.length - 1) state.sideTrain.sentenceIndex += 1;
        render();
        break;
      }
      case "speak-side": {
        toggleCurrentDemo();
        break;
      }
      case "demo-toggle":
        toggleCurrentDemo();
        break;
      case "demo-restart":
        restartCurrentDemo();
        break;
      case "voice-rate":
        state.voiceRate = Number(trigger.dataset.rate);
        render();
        break;
      case "start-user-recording":
        startUserRecording();
        break;
      case "stop-user-recording":
        stopUserRecording();
        break;
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
      case "side-start-recite":
        state.sideTrain.reciteStarted = true;
        state.sideTrain.reciteFinished = false;
        render();
        startCountUp("recite-clock", state.sideTrain);
        break;
      case "side-finish-recite":
        stopTimer();
        state.sideTrain.reciteFinished = true;
        render();
        break;
      case "side-clean-pass":
        handleSideCleanPass();
        break;
      case "side-stutter":
        handleSideStutter();
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
      case "side-pick-structure": {
        const index = Number(trigger.dataset.index);
        if (!state.sideTrain.structureSelection.includes(index)) {
          state.sideTrain.structureSelection.push(index);
          const pack = getSidePack(state.sideTrain.packId);
          state.sideTrain.structureCorrect =
            state.sideTrain.structureSelection.length === pack.segments.length &&
            state.sideTrain.structureSelection.every((value, position) => value === position);
          render();
        }
        break;
      }
      case "side-reset-structure":
        state.sideTrain.structureSelection = [];
        state.sideTrain.structureCorrect = false;
        render();
        break;
      case "side-pass-structure":
        passSideStructure();
        break;
      case "start-countdown":
        startCountdown(Number(trigger.dataset.seconds || 90), trigger.dataset.clock || "variation-clock");
        break;
      case "side-countdown":
        startCountdown(Number(trigger.dataset.seconds || 45), trigger.dataset.clock || "side-variation-clock", state.sideTrain);
        break;
      case "reset-variation":
        state.train.variationOutline = "";
        render();
        break;
      case "pass-variation":
        passVariation();
        break;
      case "side-reset-variation":
        state.sideTrain.variationOutline = "";
        render();
        break;
      case "side-pass-variation":
        passSideVariation();
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
      case "remove-voice-pack":
        removeVoicePack();
        break;
      default:
        break;
    }
  });

  app.addEventListener("submit", (event) => {
    if (event.target.id === "structure-quiz") submitStructureQuiz(event);
    if (event.target.id === "variation-form") submitVariation(event);
    if (event.target.id === "transfer-form") submitTransfer(event);
    if (event.target.id === "side-variation-form") submitSideVariation(event);
    if (event.target.id === "side-transfer-form") submitSideTransfer(event);
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
    if (event.target.id === "voice-pack-input") {
      importVoicePack(event.target.files?.[0]).finally(() => {
        event.target.value = "";
      });
    }
  });

  window.addEventListener("hashchange", () => {
    stopTimer();
    if (state.mediaRecorder?.state === "recording") state.mediaRecorder.stop();
    state.mediaStream?.getTracks().forEach((track) => track.stop());
    state.mediaStream = null;
    clearUserAudio();
    if (!location.hash.startsWith("#/train")) state.train = null;
    if (!location.hash.startsWith("#/side-train")) state.sideTrain = null;
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
