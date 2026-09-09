const API_URL = "https://api.spoonacular.com/recipes/complexSearch";
const API_KEY = "914429867cf94d358e530aaa3c76111c";

const SYMPTOM_RECIPE_MAP = {
  "Cólicos": { query: "anti inflammatory iron rich meals", phaseClass: "fp-mens", subtitle: "Platos antiinflamatorios ricos en hierro para aliviar los cólicos." },
  "Hinchazón": { query: "anti inflammatory digestion low sodium", phaseClass: "fp-follic", subtitle: "Recetas ligeras y antiinflamatorias para reducir la hinchazón." },
  "Fatiga": { query: "energy boosting magnesium iron", phaseClass: "fp-lut", subtitle: "Comidas energéticas con hierro y magnesio para la fatiga." },
  "Sensibilidad": { query: "calming hormonal balance", phaseClass: "fp-ovul", subtitle: "Platos calmantes que ayudan a equilibrar el estado de ánimo." },
  "Insomnio": { query: "sleep promoting magnesium dinner", phaseClass: "fp-lut", subtitle: "Recetas ricas en magnesio que favorecen el descanso nocturno." },
  "Energía alta": { query: "balanced energy sustaining protein", phaseClass: "fp-follic", subtitle: "Comidas balanceadas para mantener la energía estable." }
};

const state = {
  user: null,
  cycleLength: 28,
  periodLength: 5,
  lastPeriod: null,
  notifications: true,
  premium: false,
  license: null,
  currentOnboardStep: 1,
  mood: { symptom: "", emoji: "" }
};

function getAccounts() {
  return JSON.parse(localStorage.getItem("luna_accounts") || "[]");
}

function saveAccounts(accounts) {
  localStorage.setItem("luna_accounts", JSON.stringify(accounts));
}

function findUser(username) {
  return getAccounts().find((user) => user.username === username || user.email === username);
}

function saveUser() {
  if (!state.user) return;
  const accounts = getAccounts();
  const index = accounts.findIndex((user) => user.username === state.user.username);
  if (index >= 0) accounts[index] = state.user;
  else accounts.push(state.user);
  saveAccounts(accounts);
}

function loadUserIntoState(user) {
  state.user = { ...user };
  state.cycleLength = user.cycleLength || 28;
  state.periodLength = user.periodLength || 5;
  state.lastPeriod = user.lastPeriod ? new Date(user.lastPeriod) : null;
  state.notifications = user.notifications !== undefined ? user.notifications : true;
  state.premium = user.premium || false;
  state.license = user.license || null;
  state.mood = user.mood || { symptom: "", emoji: "" };
}

function go(screen) {
  document.querySelectorAll(".screen").forEach((el) => el.classList.remove("active"));
  const target = document.getElementById("screen-" + screen);
  if (target) target.classList.add("active");
  window.scrollTo(0, 0);
}

function showTab(id, btn) {
  document.querySelectorAll(".tab").forEach((tab) => tab.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
  document.getElementById("tab-" + id).classList.add("active");
  btn.classList.add("active");
}

function doLogin() {
  const usernameInput = document.getElementById("login-username");
  const username = usernameInput ? usernameInput.value.trim() : "";
  const pass = document.getElementById("login-pass").value;
  const remember = document.getElementById("remember-me")?.checked;

  if (!username || !pass) {
    toast("Ingresa tus datos de acceso");
    return;
  }

  const found = findUser(username);
  if (!found || found.pass !== pass) {
    toast("Usuario o contraseña incorrectos");
    return;
  }

  loadUserIntoState(found);

  if (remember) localStorage.setItem("luna_session", username);
  else localStorage.removeItem("luna_session");

  if (!state.license) { go("license"); return; }
  if (!state.lastPeriod) { go("onboarding"); return; }
  launchApp();
}

function doRegister() {
  const usernameInput = document.getElementById("reg-username");
  const passInput = document.getElementById("reg-pass");

  const username = usernameInput ? usernameInput.value.trim() : "";
  const name = username;
  const pass = passInput ? passInput.value : "";

  if (!username || !pass) {
    toast("Completa todos los campos necesarios");
    return;
  }

  if (pass.length < 6) {
    toast("La contraseña debe tener al menos 6 caracteres");
    return;
  }

  if (findUser(username)) {
    toast("Esta cuenta ya existe");
    return;
  }

  const user = {
    username,
    name,
    pass,
    cycleLength: 28,
    periodLength: 5,
    lastPeriod: null,
    notifications: true,
    premium: false,
    license: null,
    mood: { symptom: "", emoji: "" }
  };

  const accounts = getAccounts();
  accounts.push(user);
  saveAccounts(accounts);

  loadUserIntoState(user);
  go("license");
}

function doForgot() {
  const usernameInput = document.getElementById("forgot-username");
  const username = usernameInput ? usernameInput.value.trim() : "";

  if (!username) {
    toast("Ingresa tu nombre de usuario");
    return;
  }

  const found = findUser(username);
  if (!found) {
    toast("Usuario no encontrado");
    return;
  }

  document.getElementById("forgot-form").style.display = "none";
  document.getElementById("forgot-sent").style.display = "block";
  document.getElementById("forgot-sent-email").textContent = username;
  localStorage.setItem("luna_reset_user", found.username);
}

function showResetForm() {
  document.getElementById("reset-form").style.display = "block";
}

function doResetPass() {
  const p1 = document.getElementById("new-pass1").value;
  const p2 = document.getElementById("new-pass2").value;

  if (!p1 || p1.length < 6) { toast("Mínimo 6 caracteres"); return; }
  if (p1 !== p2) { toast("Las contraseñas no coinciden"); return; }

  const resetUser = localStorage.getItem("luna_reset_user");
  if (!resetUser) { toast("Sesión expirada"); go("forgot"); return; }

  const accounts = getAccounts();
  const index = accounts.findIndex((user) => user.username === resetUser);
  if (index === -1) { toast("No se encontró la cuenta"); return; }

  accounts[index].pass = p1;
  saveAccounts(accounts);
  localStorage.removeItem("luna_reset_user");
  toast("✓ Contraseña actualizada");
  setTimeout(() => go("login"), 1500);
}

const PREMIUM_CODES = ["LUNA-PREM-101","LUNA-PREM-102","LUNA-PREM-103","LUNA-PREM-104","LUNA-PREM-105"];
const ESSENTIAL_CODES = ["LUNA-ESEN-201","LUNA-ESEN-202","LUNA-ESEN-203","LUNA-ESEN-204","LUNA-ESEN-205"];

function getUsedCodes() { return JSON.parse(localStorage.getItem("luna_used_codes") || "[]"); }
function markCodeUsed(code, username) {
  const used = getUsedCodes();
  if (!used.find((entry) => entry.code === code)) {
    used.push({ code, username, ts: Date.now() });
    localStorage.setItem("luna_used_codes", JSON.stringify(used));
  }
}
function isCodeUsedByOther(code, myUsername) {
  const entry = getUsedCodes().find((item) => item.code === code);
  return entry && entry.username !== myUsername;
}
function validateCode(code) {
  if (PREMIUM_CODES.includes(code)) return "premium";
  if (ESSENTIAL_CODES.includes(code)) return "essential";
  return null;
}

function activateLicense() {
  const code = document.getElementById("license-code").value.trim().toUpperCase();
  const errEl = document.getElementById("lic-error");
  const input = document.getElementById("license-code");
  errEl.textContent = "";
  input.classList.remove("error", "success");

  if (!code) { errEl.textContent = "Introduce tu código de activación"; input.classList.add("error"); return; }

  const type = validateCode(code);
  if (!type) { errEl.textContent = "❌ Código inválido. Verifica de nuevo."; input.classList.add("error"); return; }
  if (isCodeUsedByOther(code, state.user?.username || "")) { errEl.textContent = "⛔ Código ya usado en otro dispositivo."; input.classList.add("error"); return; }

  input.classList.add("success");
  applyLicense(code, type);
}

function applyLicense(code, type) {
  const isPremium = type === "premium";
  markCodeUsed(code, state.user?.username || "anonymous");

  if (state.user) {
    state.user.license = { code, type, activatedAt: new Date().toISOString() };
    state.user.premium = isPremium;
    state.license = state.user.license;
    state.premium = isPremium;
    saveUser();
  }

  showSpinner(
    isPremium ? "✨ Pase Premium Total activado" : "🌸 Pase Esencial activado",
    isPremium ? "Acceso completo desbloqueado" : "Acceso básico desbloqueado",
    1400,
    () => {
      toast(isPremium ? "👑 ¡Bienvenida al Pase Premium Total!" : "🌸 ¡Pase Esencial activado!");
      if (!state.lastPeriod) go("onboarding");
      else launchApp();
    }
  );
}

function simulateBankPayment() {
  const errEl = document.getElementById("lic-error");
  if (errEl) errEl.textContent = "";
  showSpinner("Validando con Webhook Bancario de LUNA...", "Contactando procesador de pagos...", 2200, () => {
    const simulatedCode = "LUNA-PREM-101";
    markCodeUsed(simulatedCode, state.user?.username || "demo");
    if (state.user) {
      state.user.license = { code: simulatedCode, type: "premium", activatedAt: new Date().toISOString(), method: "bank_sim" };
      state.user.premium = true;
      state.license = state.user.license;
      state.premium = true;
      saveUser();
    }
    toast("✅ Pago confirmado · Webhook LUNA: SUCCESS 200");
    setTimeout(() => {
      if (!state.lastPeriod) go("onboarding");
      else launchApp();
    }, 800);
  });
}

function showSpinner(text, sub, duration, callback) {
  const overlay = document.getElementById("spinner-overlay");
  if (overlay) {
    document.getElementById("spinner-text").innerHTML = text;
    document.getElementById("spinner-sub").textContent = sub;
    overlay.classList.add("show");
    setTimeout(() => { overlay.classList.remove("show"); if (callback) callback(); }, duration);
  } else {
    if (callback) callback();
  }
}

function openLockModal() { if (state.premium) return; document.getElementById("lock-modal").classList.add("open"); }
function closeLockModal() { document.getElementById("lock-modal").classList.remove("open"); }
function upgradeWithCode() { go("license"); document.getElementById("license-code").value = ""; document.getElementById("lic-error").textContent = ""; }

function applyPremiumUI() {
  const isPremium = state.premium;
  const foodGate = document.getElementById("premium-food");
  if (foodGate) foodGate.style.display = isPremium ? "none" : "block";
}

function updateSlider(sliderId, valId) { document.getElementById(valId).textContent = document.getElementById(sliderId).value; }
function updateRangeGradient(el) {
  const min = +el.min, max = +el.max, val = +el.value;
  const pct = ((val - min) / (max - min)) * 100;
  el.style.background = `linear-gradient(to right, var(--rose) ${pct}%, var(--border) ${pct}%)`;
}
function selectOption(btn, group) {
  btn.closest(".option-grid").querySelectorAll(".option-btn").forEach((b) => b.classList.remove("sel"));
  btn.classList.add("sel");
}

function nextStep(step) {
  if (step === 2) state.cycleLength = +document.getElementById("cycle-slider").value;
  if (step === 3) state.periodLength = +document.getElementById("period-slider").value;
  if (step === 4) {
    const dateValue = document.getElementById("last-period").value;
    if (!dateValue) { toast("Por favor elige una fecha"); return; }
    state.lastPeriod = new Date(dateValue);
  }

  document.querySelectorAll(".onboard-step").forEach((el) => el.classList.remove("active"));
  document.getElementById("step" + step).classList.add("active");
  for (let i = 1; i <= 5; i++) {
    const pb = document.getElementById("pb" + i);
    if (pb) pb.classList.toggle("done", i < step);
  }
  state.currentOnboardStep = step;
}

function finishOnboarding() {
  if (!state.user) { go("login"); return; }
  state.user.cycleLength = state.cycleLength;
  state.user.periodLength = state.periodLength;
  state.user.lastPeriod = state.lastPeriod ? state.lastPeriod.toISOString() : null;
  saveUser();
  launchApp();
}

function launchApp() { go("app"); applyPremiumUI(); updateHomeData(); buildCalendar(); }

function getDayOfCycle() {
  if (!state.lastPeriod) return 1;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const diff = Math.floor((today - state.lastPeriod) / 86400000);
  return ((diff % state.cycleLength) + state.cycleLength) % state.cycleLength + 1;
}

function getPhase(day) {
  const pl = state.periodLength, ovulStart = pl + 9, ovulEnd = pl + 13;
  if (day <= pl) return { name: "Menstruación", key: "mens" };
  if (day <= ovulStart - 1) return { name: "Fase Folicular", key: "follic" };
  if (day <= ovulEnd) return { name: "Ovulación", key: "ovul" };
  return { name: "Fase Lútea", key: "lut" };
}

function getDaysUntilNext() { return state.cycleLength - getDayOfCycle() + 1; }
function getNextPeriodDate() {
  if (!state.lastPeriod) return new Date();
  const next = new Date(state.lastPeriod);
  next.setDate(next.getDate() + state.cycleLength);
  return next;
}

function updateHomeData() {
  const day = getDayOfCycle(), phase = getPhase(day), daysLeft = getDaysUntilNext(), nextDate = getNextPeriodDate();
  const name = state.user ? state.user.name || state.user.username : "amiga";

  const hName = document.getElementById("hero-name"); if (hName) hName.innerHTML = `${name} <em>✦</em>`;
  const hPhase = document.getElementById("hero-phase"); if (hPhase) hPhase.textContent = phase.name;
  const sDay = document.getElementById("stat-day"); if (sDay) sDay.textContent = day;
  const sNext = document.getElementById("stat-next"); if (sNext) sNext.textContent = daysLeft;
  const sCycle = document.getElementById("stat-cycle"); if (sCycle) sCycle.textContent = state.cycleLength;
}

function buildCalendar() {
  const year = 2026, monthIndex = 4;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const grid = document.getElementById("cal-body"); if (!grid) return;
  grid.innerHTML = "";

  const firstDay = new Date(year, monthIndex, 1).getDay();
  const offset = (firstDay + 6) % 7;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  for (let i = 0; i < offset; i++) {
    const empty = document.createElement("div"); empty.className = "cal-day empty"; grid.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, monthIndex, day), el = document.createElement("div");
    el.className = "cal-day"; el.textContent = day;
    if (date.toDateString() === today.toDateString()) el.classList.add("today");

    if (state.lastPeriod) {
      const diff = Math.floor((date - state.lastPeriod) / 86400000);
      const cycleDay = ((diff % state.cycleLength) + state.cycleLength) % state.cycleLength + 1;
      if (cycleDay >= 1 && cycleDay <= state.periodLength) el.classList.add("mens");
    }
    grid.appendChild(el);
  }
}

function selectSymptom(btn, symptom) {
  document.querySelectorAll(".sym-btn").forEach((item) => item.classList.remove("sel"));
  btn.classList.add("sel");
  state.mood.symptom = symptom;
  toast("Síntoma registrado ✨");
  fetchSymptomRecipes(symptom);
}

async function fetchSymptomRecipes(symptom) {
  const info = SYMPTOM_RECIPE_MAP[symptom] || { query: symptom, phaseClass: "fp-mens", subtitle: "Platos saludables recomendados." };
  const params = new URLSearchParams({ apiKey: API_KEY, query: info.query, number: "3", addRecipeInformation: "false" });

  try {
    const response = await fetch(`${API_URL}?${params.toString()}`);
    if (!response.ok) throw new Error("Spoonacular Status: " + response.status);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      toast("No encontramos platos en vivo justo ahora."); return;
    }

    const recipes = data.results.slice(0, 3).map((item) => ({
      title: item.title, image: item.image || "", desc: info.subtitle, phaseClass: info.phaseClass
    }));

    renderFoodCards(recipes);
  } catch (error) {
    console.error(error);
    toast("Error de conexión con Spoonacular.");
  }
}

function renderFoodCards(recipes) {
  const list = document.getElementById("food-list"); if (!list) return;
  list.innerHTML = "";

  recipes.forEach((recipe) => {
    const card = document.createElement("div"); card.className = "food-card"; card.dataset.phase = "all";
    const imageHtml = recipe.image
      ? `<div class="food-emoji" style="width:84px;height:84px;border-radius:20px;overflow:hidden;padding:0;"><img src="${recipe.image}" alt="${recipe.title}" style="width:100%;height:100%;object-fit:cover;"></div>`
      : `<div class="food-emoji">🥗</div>`;

    card.innerHTML = `
      ${imageHtml}
      <div class="food-body">
        <span class="food-phase ${recipe.phaseClass}">Nutrición Especializada</span>
        <div class="food-title">${recipe.title}</div>
        <div class="food-desc">${recipe.desc}</div>
      </div>
    `;
    list.appendChild(card);
  });
}

function filterFood(btn, phase) {
  document.querySelectorAll(".filter-btn").forEach((item) => item.classList.remove("active"));
  btn.classList.add("active");
  document.querySelectorAll(".food-card").forEach((card) => {
    card.style.display = phase === "all" || card.dataset.phase === phase ? "flex" : "none";
  });
}

function selMood(btn) {
  document.querySelectorAll(".mood").forEach((item) => item.classList.remove("sel"));
  btn.classList.add("sel");
  state.mood.emoji = btn.textContent.trim();
  toast("Estado de ánimo guardado ✨");
}

function toggleFaq(el) { el.classList.toggle("open"); }

function scheduleReminders() {
  if (!("Notification" in window)) return;
  if (window.lunaReminderInterval) return;
  if (Notification.permission !== "granted") return;

  window.lunaReminderInterval = setInterval(() => {
    const days = getDaysUntilNext();
    if (days === 2 || days === 1) {
      new Notification("🌙 Luna", {
        body: `Tu menstruación se espera en ${days} día${days > 1 ? "s" : ""}.`
      });
    }
  }, 3600000);
}

function toast(msg) {
  const element = document.getElementById("toast-el");
  if (element) { element.textContent = msg; element.classList.add("show"); setTimeout(() => element.classList.remove("show"), 2800); }
}

document.addEventListener("DOMContentLoaded", () => {
  const today = new Date().toISOString().split("T")[0];
  const lastPeriodInput = document.getElementById("last-period");
  if (lastPeriodInput) lastPeriodInput.max = today;

  const sessionUsername = localStorage.getItem("luna_session");
  if (sessionUsername) {
    const found = findUser(sessionUsername);
    if (found) {
      loadUserIntoState(found);
      if (!state.license) { go("license"); return; }
      if (!state.lastPeriod) { go("onboarding"); return; }
      launchApp(); return;
    }
  }
  document.querySelectorAll('input[type="range"]').forEach(updateRangeGradient);
});