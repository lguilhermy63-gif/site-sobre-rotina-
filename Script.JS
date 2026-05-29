/* ============================================================
   VidaSã — Rotina & Bem-estar  |  script.js
   ============================================================ */

/* ══════════════════════════════════════════════════════════
   CONFIGURAÇÕES GLOBAIS
══════════════════════════════════════════════════════════ */
const WATER_GOAL = 8;   // meta de copos por dia
let waterCount   = 0;
let mealCount    = 0;
let routineDone  = 0;
let toastTimer   = null;
const REMINDER_INTERVAL = 60 * 60 * 1000; // 1 hora em ms

/* ══════════════════════════════════════════════════════════
   DATA NO HEADER
══════════════════════════════════════════════════════════ */
function setDate() {
  const now = new Date();
  const opts = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  document.getElementById('currentDate').textContent = now.toLocaleDateString('pt-BR', opts);
}

/* ══════════════════════════════════════════════════════════
   LEMBRETE DE ÁGUA (TOAST)
══════════════════════════════════════════════════════════ */
function showToast() {
  if (waterCount >= WATER_GOAL) return; // meta já atingida
  const toast = document.getElementById('waterToast');
  toast.classList.add('show');
  // fecha automaticamente em 6 s
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => closeToast(), 6000);
}

function closeToast() {
  document.getElementById('waterToast').classList.remove('show');
}

// Dispara o lembrete ao carregar e depois a cada 1 hora
window.addEventListener('load', () => {
  setTimeout(showToast, 8000);          // primeiro lembrete após 8 s
  setInterval(showToast, REMINDER_INTERVAL);
});

/* ══════════════════════════════════════════════════════════
   HIDRATAÇÃO
══════════════════════════════════════════════════════════ */

/** Gera os 8 copos na grade */
function buildCupsGrid() {
  const grid = document.getElementById('cupsGrid');
  grid.innerHTML = '';
  for (let i = 1; i <= WATER_GOAL; i++) {
    const cup = document.createElement('span');
    cup.className = 'cup';
    cup.id = `cup-${i}`;
    cup.title = `Copo ${i}`;
    cup.textContent = '🥤';
    cup.addEventListener('click', () => handleCupClick(i));
    grid.appendChild(cup);
  }
}

/** Clique direto em um copo — permite marcar/desmarcar individualmente */
function handleCupClick(index) {
  // Marca todos até o índice clicado (ou desmarca se já eram todos iguais)
  const allFilled = waterCount >= index;
  waterCount = allFilled ? index - 1 : index;
  updateWaterUI();
}

/** Botões +/- de copo */
function changeWater(delta) {
  waterCount = Math.max(0, Math.min(WATER_GOAL, waterCount + delta));
  updateWaterUI();
}

/** Atualiza toda a UI de água */
function updateWaterUI() {
  // Copos visuais
  for (let i = 1; i <= WATER_GOAL; i++) {
    const cup = document.getElementById(`cup-${i}`);
    if (!cup) continue;
    cup.classList.toggle('filled', i <= waterCount);
  }

  // Barra de progresso
  const pct = Math.round((waterCount / WATER_GOAL) * 100);
  document.getElementById('waterFill').style.width = pct + '%';
  document.getElementById('waterPct').textContent  = pct + '%';

  // Badge
  document.getElementById('waterBadge').textContent = `${waterCount} / ${WATER_GOAL} copos`;

  // Mensagem motivacional
  const msg = getWaterMessage(waterCount);
  const msgEl = document.getElementById('waterMsg');
  msgEl.textContent = msg;

  // Cor do progresso muda quando meta atingida
  const fill = document.getElementById('waterFill');
  if (waterCount >= WATER_GOAL) {
    fill.style.background = 'linear-gradient(90deg, #52b788, #1b4332)';
    closeToast();
  } else {
    fill.style.background = 'linear-gradient(90deg, var(--water-blue), var(--water-dark))';
  }
}

/** Mensagens motivacionais por quantidade de copos */
function getWaterMessage(count) {
  if (count === 0)               return 'Bora começar a se hidratar! 💪';
  if (count === 1)               return 'Ótimo começo! Cada copo conta. 🌱';
  if (count < 4)                 return `${WATER_GOAL - count} copos para a meta — continue! 💧`;
  if (count < WATER_GOAL - 1)   return `Quase lá! Só faltam ${WATER_GOAL - count} copinhos. 🏃`;
  if (count === WATER_GOAL - 1) return 'Último copo! Você consegue! 🎯';
  if (count === WATER_GOAL)     return '🎉 Meta atingida! Excelente hidratação hoje!';
  return '💧 Hidratado(a) além da meta — incrível!';
}

/* ══════════════════════════════════════════════════════════
   ROTINA DO DIA
══════════════════════════════════════════════════════════ */

/** Marcar / desmarcar atividade */
function toggleRoutine(id, checkbox) {
  const item = document.querySelector(`[data-id="${id}"]`);
  if (!item) return;

  if (checkbox.checked) {
    item.classList.add('done');
    routineDone++;
  } else {
    item.classList.remove('done');
    routineDone = Math.max(0, routineDone - 1);
  }

  updateRoutineBadge();
}

/** Adicionar item personalizado */
function addRoutineItem() {
  const input = document.getElementById('newRoutineInput');
  const text  = input.value.trim();
  if (!text) return;

  const id = 'custom-' + Date.now();
  const li = document.createElement('li');
  li.className = 'routine-item';
  li.dataset.id = id;

  li.innerHTML = `
    <label class="check-label">
      <input type="checkbox" class="check-input" onchange="toggleRoutine('${id}', this)" />
      <span class="check-box"></span>
      <span class="routine-text">✏️ ${escapeHTML(text)}</span>
    </label>
    <div style="display:flex;align-items:center;gap:6px">
      <span class="routine-time">personalizado</span>
      <button class="btn-remove" onclick="removeRoutineItem('${id}')" title="Remover">✕</button>
    </div>
  `;

  document.getElementById('routineList').appendChild(li);
  input.value = '';
  input.focus();
}

/** Remover item da rotina */
function removeRoutineItem(id) {
  const item = document.querySelector(`[data-id="${id}"]`);
  if (!item) return;
  if (item.classList.contains('done')) {
    routineDone = Math.max(0, routineDone - 1);
  }
  item.style.opacity = '0';
  item.style.transform = 'translateX(20px)';
  item.style.transition = 'opacity .25s, transform .25s';
  setTimeout(() => { item.remove(); updateRoutineBadge(); }, 250);
}

function updateRoutineBadge() {
  document.getElementById('routineBadge').textContent = `${routineDone} concluído${routineDone !== 1 ? 's' : ''}`;
}

/* ══════════════════════════════════════════════════════════
   REFEIÇÕES
══════════════════════════════════════════════════════════ */

function addMeal() {
  const typeEl  = document.getElementById('mealType');
  const inputEl = document.getElementById('mealInput');
  const text    = inputEl.value.trim();
  if (!text) return;

  // Remove placeholder vazio
  const list = document.getElementById('mealList');
  const empty = list.querySelector('.meal-empty');
  if (empty) empty.remove();

  const now  = new Date();
  const time = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const li = document.createElement('li');
  li.className = 'meal-item';
  li.innerHTML = `
    <span class="meal-type">${typeEl.value}</span>
    <span class="meal-text">${escapeHTML(text)}</span>
    <span class="meal-time">${time}</span>
    <button class="btn-remove" onclick="removeMeal(this)" title="Remover">✕</button>
  `;

  list.appendChild(li);
  inputEl.value = '';
  inputEl.focus();
  mealCount++;
  updateMealBadge();

  // Scroll suave para o novo item
  li.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function removeMeal(btn) {
  const li = btn.closest('.meal-item');
  li.style.opacity = '0';
  li.style.transform = 'translateX(20px)';
  li.style.transition = 'opacity .25s, transform .25s';
  setTimeout(() => {
    li.remove();
    mealCount = Math.max(0, mealCount - 1);
    updateMealBadge();

    // Mostra placeholder se lista ficou vazia
    const list = document.getElementById('mealList');
    if (!list.querySelector('.meal-item')) {
      const empty = document.createElement('li');
      empty.className = 'meal-empty';
      empty.textContent = 'Nenhuma refeição registrada ainda.';
      list.appendChild(empty);
    }
  }, 250);
}

function updateMealBadge() {
  document.getElementById('mealBadge').textContent = `${mealCount} registrada${mealCount !== 1 ? 's' : ''}`;
}

/* ══════════════════════════════════════════════════════════
   ENTER para submeter nos inputs
══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('newRoutineInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') addRoutineItem();
  });
  document.getElementById('mealInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') addMeal();
  });
});

/* ══════════════════════════════════════════════════════════
   UTILITÁRIO — escapeHTML
══════════════════════════════════════════════════════════ */
function escapeHTML(str) {
  return str.replace(/&/g,'&amp;')
            .replace(/</g,'&lt;')
            .replace(/>/g,'&gt;')
            .replace(/"/g,'&quot;');
}

/* ══════════════════════════════════════════════════════════
   INICIALIZAÇÃO
══════════════════════════════════════════════════════════ */
setDate();
buildCupsGrid();
updateWaterUI();