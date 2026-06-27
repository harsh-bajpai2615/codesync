"use strict";
const api = () => (window.pywebview && window.pywebview.api) || null;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// Sample data so the UI previews fully in a plain browser (no Python bridge).
const SAMPLE = {
  version: "v0.13.0",
  github: "harsh-bajpai2615",
  sites: { leetcode: true, codeforces: false, codechef: false, neetcode: false, atcoder: false, geeksforgeeks: false },
  provider: "ollama",
  card: "sample-card.png",
  insights: {
    tiles: [["This week", 0], ["This month", 0], ["Streak", "0d"], ["Longest", "4d"], ["Optimal", "—"], ["Total", 38]],
    difficulty: { Easy: 8, Medium: 21, Hard: 9 },
    topics: ["Array", "Hash Table", "Math", "Greedy", "Prefix Sum", "String", "Sorting", "Two Pointers"],
    resume: [
      "Solved 38+ data-structures & algorithms problems across 6 platforms.",
      "9 hard and 21 medium problems; strongest in Array, Hash Table, Math.",
      "Maintained consistent practice — 13 active days, longest streak 4 days.",
    ],
    quiz: [{ title: "Maximum Path Score in a Grid", platform: "LeetCode", difficulty: "Hard",
             approach: "1. DP over grid cells.\n2. Track best incoming path.\n3. Answer at bottom-right." }],
  },
  contests: {
    handle: "",
    upcoming: [
      { platform: "leetcode", name: "Weekly Contest 508", when: "Sun 28 Jun · 08:00", dur: "1.5h", url: "#" },
      { platform: "codeforces", name: "Codeforces Round 1106 (Div. 2)", when: "Sun 28 Jun · 20:05", dur: "2.0h", url: "#" },
      { platform: "codeforces", name: "Educational Codeforces Round 192", when: "Mon 06 Jul · 20:05", dur: "2.0h", url: "#" },
      { platform: "leetcode", name: "Biweekly Contest 186", when: "Sat 04 Jul · 20:00", dur: "1.5h", url: "#" },
    ],
    rating: [1200, 1280, 1350, 1320, 1410, 1480, 1530, 1505, 1590, 1640, 1710, 1690],
  },
};
const LABELS = { leetcode: "LeetCode", codeforces: "Codeforces", codechef: "CodeChef",
  neetcode: "NeetCode", atcoder: "AtCoder", geeksforgeeks: "GeeksforGeeks" };

function toast(msg) {
  const t = $("#toast"); t.textContent = msg; t.classList.add("show");
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove("show"), 2600);
}

/* ---------- navigation ---------- */
function moveNavPill(item) {
  const pill = $("#navPill");
  pill.style.height = item.offsetHeight + "px";
  pill.style.transform = `translateY(${item.offsetTop}px)`;
}
function switchTab(tab, item) {
  $$(".nav-item").forEach((b) => b.classList.toggle("active", b === item));
  $$(".page").forEach((p) => p.classList.remove("active"));
  const page = $("#page-" + tab); page.classList.add("active");
  moveNavPill(item);
  if (tab === "insights") renderInsights();
  if (tab === "contests") renderContests();
  if (tab === "showcase") renderCard();
}
$$(".nav-item").forEach((b) => b.addEventListener("click", () => switchTab(b.dataset.tab, b)));

/* ---------- animations ---------- */
function countUp(el, target) {
  if (typeof target !== "number") { el.textContent = target; return; }
  const dur = 750, t0 = performance.now();
  (function step(now) {
    const k = Math.min((now - t0) / dur, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3)));
    if (k < 1) requestAnimationFrame(step);
  })(t0);
}

/* ---------- data ---------- */
async function getState() { const a = api(); return a ? await a.get_state() : SAMPLE; }
async function getInsights() { const a = api(); return a ? await a.get_insights() : SAMPLE.insights; }
async function getContests() { const a = api(); return a ? await a.get_contests() : SAMPLE.contests; }
async function getCard() { const a = api(); return a ? await a.get_card() : SAMPLE.card; }

/* ---------- setup ---------- */
async function renderSetup() {
  const s = await getState();
  $("#version").textContent = s.version;
  const gh = s.github;
  $("#ghBadge").textContent = gh || "not connected";
  $("#ghBadge").className = "badge " + (gh ? "ok" : "no");
  $("#ghStatus").textContent = gh || "Not connected";
  $("#ghDot").classList.toggle("on", !!gh);
  $("#btnGithub").textContent = gh ? "Connected ✓" : "Connect GitHub";
  const sites = $("#sites"); sites.innerHTML = "";
  for (const [k, on] of Object.entries(s.sites)) {
    const el = document.createElement("div"); el.className = "site";
    el.innerHTML = `<span class="nm">${LABELS[k] || k}</span>
      <span class="pill ${on ? "on" : "off"}">${on ? "Connected" : "Not connected"}</span>
      <button class="btn sm" data-cp="${k}">${on ? "Re-login" : "Log in"}</button>`;
    sites.appendChild(el);
  }
  $$("[data-cp]").forEach((b) => b.addEventListener("click", () => act("cp_login", b.dataset.cp)));
  $$("#providerSeg button").forEach((b) =>
    b.classList.toggle("on", b.dataset.v === (s.provider || "ollama")));
  updateKeyField(s.provider || "ollama", s.api_key);
}

function curProvider() { const o = $("#providerSeg button.on"); return o ? o.dataset.v : "ollama"; }
function updateKeyField(provider, key) {
  const show = provider === "gemini" || provider === "groq";
  $("#keyWrap").classList.toggle("hidden", !show);
  $("#keyHint").classList.toggle("hidden", !show);
  if (key !== undefined && $("#apiKey")) $("#apiKey").value = key || "";
}

/* ---------- showcase ---------- */
async function renderCard() {
  const c = await getCard();
  if (c) $("#cardImg").src = c.startsWith("data:") || c.endsWith(".png") ? c : "data:image/png;base64," + c;
}

/* ---------- insights ---------- */
async function renderInsights() {
  const d = await getInsights();
  const tiles = $("#tiles"); tiles.innerHTML = "";
  d.tiles.forEach(([l, v]) => {
    const t = document.createElement("div"); t.className = "tile";
    t.innerHTML = `<div class="v">0</div><div class="l">${l}</div>`;
    tiles.appendChild(t); countUp(t.querySelector(".v"), v);
  });
  const tot = Object.values(d.difficulty).reduce((a, b) => a + b, 0) || 1;
  const colors = { Easy: "var(--easy)", Medium: "var(--med)", Hard: "var(--hard)" };
  const db = $("#diffBars"); db.innerHTML = "";
  ["Easy", "Medium", "Hard"].forEach((lvl) => {
    const n = d.difficulty[lvl] || 0;
    const row = document.createElement("div"); row.className = "drow";
    row.innerHTML = `<span class="lbl" style="color:${colors[lvl]}">${lvl}</span>
      <div class="bar-bg"><div class="bar-fill" style="background:${colors[lvl]}"></div></div><span class="n">${n}</span>`;
    db.appendChild(row);
    setTimeout(() => { row.querySelector(".bar-fill").style.width = (100 * n / tot) + "%"; }, 60);
  });
  $("#topics").innerHTML = (d.topics || []).map((t) => `<span class="chip">${t}</span>`).join("");
  $("#resume").innerHTML = (d.resume || []).map((b) => `<li>${b.replace(/^[-•]\s*/, "")}</li>`).join("");
  window._quiz = d.quiz || [];
}

/* ---------- contests ---------- */
async function renderContests() {
  const d = await getContests();
  $("#contestList").innerHTML = (d.upcoming || []).map((c) =>
    `<div class="contest"><span class="cbadge ${c.platform === "codeforces" ? "cf" : "lc"}">${LABELS[c.platform] || c.platform}</span>
     <span class="nm">${c.name}</span><span class="when">${c.when} · ${c.dur}</span>
     <a href="${c.url}" target="_blank">open</a></div>`).join("") ||
    `<div class="muted">Couldn't load contests.</div>`;
  drawRating(d.rating || [], d.handle);
}
function drawRating(vals, handle) {
  const svg = $("#ratingChart"); const W = 600, H = 140, p = 12;
  if (!vals.length) { svg.innerHTML = ""; $("#ratingMeta").textContent = handle ? "no rated contests" : "connect Codeforces"; return; }
  const mn = Math.min(...vals) - 50, mx = Math.max(...vals) + 50, rng = (mx - mn) || 1;
  const pts = vals.map((v, i) => [p + (W - 2 * p) * (i / Math.max(vals.length - 1, 1)),
    H - p - (H - 2 * p) * ((v - mn) / rng)]);
  const dpath = pts.map((q) => q[0].toFixed(1) + "," + q[1].toFixed(1)).join(" ");
  svg.innerHTML = `<defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#5b8cff"/>
    <stop offset="1" stop-color="#7c5cfc"/></linearGradient></defs>
    <polyline class="spark" points="${dpath}"/>
    <circle cx="${pts.at(-1)[0]}" cy="${pts.at(-1)[1]}" r="4" fill="#7c5cfc"/>`;
  $("#ratingMeta").textContent = `current ${vals.at(-1)} · max ${Math.max(...vals)} · ${vals.length} contests`;
}

/* ---------- actions ---------- */
async function act(method, ...args) {
  const a = api();
  if (!a) { toast("Preview mode — run inside GitKosh to use this."); return null; }
  try { return await a[method](...args); } catch (e) { toast("Error: " + e); return null; }
}
$("#btnGithub").addEventListener("click", () => act("github_login").then(renderSetup));
$("#btnSync").addEventListener("click", () => { showProg(); act("run_sync", false); });
$("#btnReset").addEventListener("click", () => { showProg(); act("run_sync", true); });
$("#btnPublish").addEventListener("click", () => act("publish_site").then((u) => u && toast("Published: " + u)));
$("#btnPost").addEventListener("click", async () => { $("#postBox").value = "Generating…";
  const r = await act("generate_post"); if (r) $("#postBox").value = r.post; });
$("#btnCopyEmbed").addEventListener("click", async () => {
  const md = await act("get_embed"); navigator.clipboard?.writeText(md || ""); toast("Embed code copied"); });
$("#btnRefreshCard").addEventListener("click", renderCard);
$("#btnRefreshContests").addEventListener("click", renderContests);
$("#btnCopyResume").addEventListener("click", () => {
  navigator.clipboard?.writeText([...$$("#resume li")].map((l) => "- " + l.textContent).join("\n")); toast("Copied"); });
$$("#providerSeg button").forEach((b) => b.addEventListener("click", () => {
  $$("#providerSeg button").forEach((x) => x.classList.toggle("on", x === b));
  updateKeyField(b.dataset.v);
  act("set_provider", b.dataset.v); }));
$("#btnSaveKey").addEventListener("click", () =>
  act("save_ai", curProvider(), $("#apiKey").value).then(() => toast("AI settings saved")));
$("#btnQuiz").addEventListener("click", () => {
  const pool = window._quiz || []; if (!pool.length) return;
  const q = pool[Math.floor(Math.random() * pool.length)];
  $("#quiz").innerHTML = `<div class="quiz-q">${q.title} · ${q.platform} · ${q.difficulty || ""}</div>
    <div class="quiz-a" id="quizA">Recall your approach…</div>`;
  setTimeout(() => { const a = $("#quizA"); if (a) a.textContent = q.approach || "(open the solution)"; }, 1600);
});

function showProg() { $("#progWrap").classList.remove("hidden"); window.gkProgress("Working…", 8); }
// called from Python via evaluate_js
window.gkProgress = (text, pct) => {
  $("#progWrap").classList.remove("hidden");
  $("#progText").textContent = text || "";
  $("#progBar").style.width = (pct || 0) + "%";
};
window.gkRefresh = () => { renderSetup(); };

/* ---------- boot ---------- */
function boot() {
  renderSetup();
  const t = new URLSearchParams(location.search).get("tab");
  const item = (t && $(`.nav-item[data-tab="${t}"]`)) || $(".nav-item.active");
  if (item) { if (t) switchTab(t, item); else moveNavPill(item); }
}
if (window.pywebview) boot(); else window.addEventListener("DOMContentLoaded", boot);
window.addEventListener("pywebviewready", boot);
