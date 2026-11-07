import { LEVELS } from './levels.js';
import { CARS, getUnlockedCars } from './cars.js';
import { loadSave, totalStars } from './save.js';

const $ = (id) => document.getElementById(id);

const screens = {
  boot: $('boot-screen'),
  menu: $('main-menu'),
  levelSelect: $('level-select'),
  garage: $('garage-screen'),
  howto: $('howto-screen'),
  pause: $('pause-screen'),
  results: $('results-screen'),
  hud: $('hud'),
  touch: $('touch-controls'),
};

export function showScreen(name) {
  for (const key of Object.keys(screens)) {
    if (key === 'hud' || key === 'touch') continue;
    screens[key].classList.toggle('hidden', key !== name);
  }
}

export function setHudVisible(visible) {
  screens.hud.classList.toggle('hidden', !visible);
  const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  screens.touch.classList.toggle('hidden', !(visible && isTouch));
}

export function setPauseVisible(visible) {
  screens.pause.classList.toggle('hidden', !visible);
}

export function refreshStarsTotal() {
  const save = loadSave();
  $('stars-total-val').textContent = totalStars(save);
}

export function renderLevelList(onSelect) {
  const save = loadSave();
  const listEl = $('level-list');
  listEl.innerHTML = '';
  LEVELS.forEach((lvl, i) => {
    const unlocked = i === 0 || (save.stars[LEVELS[i - 1].id] ?? 0) >= 1;
    const stars = save.stars[lvl.id] ?? 0;
    const card = document.createElement('div');
    card.className = 'level-card' + (unlocked ? '' : ' locked');
    const swatch = document.createElement('div');
    swatch.className = 'level-swatch';
    swatch.style.background = `#${lvl.skyColor.toString(16).padStart(6, '0')}`;
    card.appendChild(swatch);
    const title = document.createElement('h3');
    title.textContent = lvl.name;
    card.appendChild(title);
    const starsEl = document.createElement('div');
    starsEl.className = 'stars';
    starsEl.textContent = unlocked ? '★'.repeat(stars) + '☆'.repeat(3 - stars) : 'LOCKED';
    card.appendChild(starsEl);
    if (unlocked) {
      card.addEventListener('click', () => {
        document.querySelectorAll('.level-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        onSelect(lvl.id);
      });
    }
    listEl.appendChild(card);
  });
}

export function renderCarList(onSelect) {
  const save = loadSave();
  const stars = totalStars(save);
  const listEl = $('car-list');
  const statsEl = $('car-stats');
  listEl.innerHTML = '';

  function showStats(car) {
    statsEl.innerHTML = '';
    for (const [name, val] of Object.entries(car.stats)) {
      const row = document.createElement('div');
      row.className = 'stat-row';
      const label = document.createElement('div');
      label.className = 'stat-name';
      label.textContent = name.toUpperCase();
      row.appendChild(label);
      const bg = document.createElement('div');
      bg.className = 'stat-bar-bg';
      const fill = document.createElement('div');
      fill.className = 'stat-bar-fill';
      fill.style.width = `${val}%`;
      bg.appendChild(fill);
      row.appendChild(bg);
      statsEl.appendChild(row);
    }
  }

  CARS.forEach(car => {
    const unlocked = car.unlockStars <= stars;
    const card = document.createElement('div');
    card.className = 'car-card' + (unlocked ? '' : ' locked') + (car.id === save.selectedCar ? ' selected' : '');
    const swatch = document.createElement('div');
    swatch.className = 'level-swatch';
    swatch.style.background = `#${car.color.toString(16).padStart(6, '0')}`;
    card.appendChild(swatch);
    const title = document.createElement('h3');
    title.textContent = car.name;
    card.appendChild(title);
    const sub = document.createElement('div');
    sub.className = 'stars';
    sub.textContent = unlocked ? 'READY' : `NEEDS ${car.unlockStars} ★`;
    card.appendChild(sub);
    card.addEventListener('mouseenter', () => showStats(car));
    if (unlocked) {
      card.addEventListener('click', () => {
        document.querySelectorAll('.car-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        onSelect(car.id);
      });
    }
    listEl.appendChild(card);
  });

  showStats(getUnlockedCars(stars).slice(-1)[0] ?? CARS[0]);
}

export function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec - m * 60;
  return `${String(m).padStart(2, '0')}:${s.toFixed(2).padStart(5, '0')}`;
}

export function updateHudTimer(sec, freeride) {
  $('hud-timer').textContent = freeride ? 'FREE RIDE' : formatTime(sec);
}

export function updateHudCheckpoint(cur, total) {
  $('hud-checkpoint').textContent = `CP ${cur}/${total}`;
}

export function updateHudScore(score) {
  $('hud-stunt-score').textContent = score;
}

export function updateSpeedMeter(speedKmh, maxSpeedKmh) {
  const pct = Math.max(0, Math.min(100, (speedKmh / maxSpeedKmh) * 100));
  $('speed-fill').style.width = `${pct}%`;
}

export function updateBoostMeter(pct) {
  $('boost-fill').style.width = `${Math.max(0, Math.min(100, pct))}%`;
}

let popupSeq = 0;
export function spawnStuntPopup(text, sub) {
  const layer = $('stunt-popup-layer');
  const el = document.createElement('div');
  el.className = 'stunt-popup';
  el.textContent = sub ? `${text}  +${sub}` : text;
  layer.appendChild(el);
  popupSeq++;
  setTimeout(() => el.remove(), 1150);
}

let comboTimeout = null;
export function showComboBanner(text) {
  const el = $('combo-banner');
  el.textContent = text;
  el.classList.remove('hidden');
  clearTimeout(comboTimeout);
  comboTimeout = setTimeout(() => el.classList.add('hidden'), 1000);
}

export function showResults({ title, stars, timeSec, stuntScore, freeride }) {
  $('results-title').textContent = title;
  $('results-stars').textContent = freeride ? '— FREE RIDE —' : ('★'.repeat(stars) + '☆'.repeat(3 - stars));
  const statsEl = $('results-stats');
  statsEl.innerHTML = '';
  const lines = freeride
    ? [`Stunt Score: ${stuntScore}`]
    : [`Time: ${formatTime(timeSec)}`, `Stunt Score: ${stuntScore}`];
  for (const line of lines) {
    const div = document.createElement('div');
    div.textContent = line;
    statsEl.appendChild(div);
  }
  showScreen('results');
}

export function setBootProgress(pct, label) {
  $('boot-fill').style.width = `${pct}%`;
  if (label) $('boot-label').textContent = label;
}
