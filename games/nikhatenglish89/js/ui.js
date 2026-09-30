// DOM helpers shared by all screens.

import { sfx, speak } from './audio.js';
import { state, onChange } from './state.js';
import { t } from './content.js';
import { totalStars } from './player.js';
import { navigate } from './router.js';

// h('div.card#id', { onclick, ...attrs }, children...)
export function h(tag, attrs, ...children) {
  if (attrs == null || typeof attrs !== 'object' || attrs instanceof Node || Array.isArray(attrs)) {
    if (attrs != null) children.unshift(attrs);
    attrs = {};
  }
  const [name, ...rest] = tag.split(/(?=[.#])/);
  const el = document.createElement(name || 'div');
  for (const part of rest) {
    if (part[0] === '.') el.classList.add(part.slice(1));
    else if (part[0] === '#') el.id = part.slice(1);
  }
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'class') el.className += (el.className ? ' ' : '') + v;
    else if (k === 'style' && typeof v === 'object') {
      for (const [prop, val] of Object.entries(v)) {
        if (prop.startsWith('--')) el.style.setProperty(prop, String(val));
        else el.style[prop] = val;
      }
    }
    else if (k === 'html') el.innerHTML = v;
    else if (v === true) el.setAttribute(k, '');
    else el.setAttribute(k, v);
  }
  appendChildren(el, children);
  return el;
}

function appendChildren(el, children) {
  for (const c of children.flat(Infinity)) {
    if (c == null || c === false) continue;
    el.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
  }
}

// Button with a tap sound and an accessible label.
export function btn(label, onClick, cls = '', attrs = {}) {
  return h(
    'button.btn' + (cls ? '.' + cls.split(' ').join('.') : ''),
    {
      type: 'button',
      ...attrs,
      onclick: (e) => {
        sfx('tap');
        onClick && onClick(e);
      }
    },
    label
  );
}

export function mount(...nodes) {
  const app = document.getElementById('app');
  app.replaceChildren(...nodes);
  app.scrollTop = 0;
  window.scrollTo(0, 0);
  const heading = app.querySelector('h1, h2');
  if (heading) {
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
  }
}

export function toast(message, kind = 'info', ms = 2200) {
  const layer = document.getElementById('toast-layer');
  const el = h('div.toast.toast-' + kind, { role: 'status' }, message);
  layer.appendChild(el);
  setTimeout(() => el.classList.add('out'), ms);
  setTimeout(() => el.remove(), ms + 400);
}

// Modal dialog. buttons: [{label, value, cls}] -> resolves with value.
export function modal({ title, body, buttons = [{ label: 'OK', value: true }], dismissable = true, cls = '' }) {
  return new Promise((resolve) => {
    const layer = document.getElementById('modal-layer');
    const previouslyFocused = document.activeElement;
    const close = (value) => {
      wrap.remove();
      document.removeEventListener('keydown', onKey);
      if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus({ preventScroll: true });
      resolve(value);
    };
    const onKey = (e) => {
      if (e.key === 'Escape' && dismissable) close(null);
    };
    const dialog = h(
      'div.modal' + (cls ? '.' + cls : ''),
      { role: 'dialog', 'aria-modal': 'true', 'aria-label': typeof title === 'string' ? title : '' },
      title ? h('h2.modal-title', title) : null,
      h('div.modal-body', body),
      h(
        'div.modal-actions',
        buttons.map((b) => btn(b.label, () => close(b.value), b.cls || ''))
      )
    );
    const wrap = h('div.modal-backdrop', {
      onclick: (e) => {
        if (e.target === wrap && dismissable) close(null);
      }
    }, dialog);
    layer.appendChild(wrap);
    document.addEventListener('keydown', onKey);
    const first = dialog.querySelector('button');
    if (first) first.focus({ preventScroll: true });
  });
}

export function confirmModal(title, body, yes, no, danger = false) {
  return modal({
    title,
    body,
    buttons: [
      { label: no, value: false, cls: 'btn-ghost' },
      { label: yes, value: true, cls: danger ? 'btn-danger' : 'btn-primary' }
    ]
  });
}

// Kiki the parrot companion with a speech bubble. Tapping repeats the line.
export function kiki(text, { key = null, size = '', speakNow = true } = {}) {
  const bubble = h('div.kiki-bubble', text);
  const el = h(
    'div.kiki' + (size ? '.kiki-' + size : ''),
    h(
      'button.kiki-bird',
      {
        type: 'button',
        'aria-label': t('ui.common.kikiRepeat'),
        onclick: () => speak(bubble.textContent, { key, kiki: true })
      },
      '🦜'
    ),
    bubble
  );
  if (speakNow && state.settings.autoRead) setTimeout(() => speak(text, { key, kiki: true }), 150);
  el.setText = (next, nextKey = null) => {
    bubble.textContent = next;
    if (state.settings.autoRead) speak(next, { key: nextKey, kiki: true });
  };
  return el;
}

// Top bar with back button, title and the explorer's wallet.
export function topBar({ title = '', back = null, showWallet = true } = {}) {
  const coins = h('span.wallet-value');
  const gems = h('span.wallet-value');
  const stars = h('span.wallet-value');
  const refresh = () => {
    const p = state.profile;
    if (!p) return;
    coins.textContent = p.coins;
    gems.textContent = p.gems;
    stars.textContent = totalStars(p);
  };
  refresh();
  const off = onChange(refresh);
  const bar = h(
    'header.topbar',
    back
      ? btn(h('span', { 'aria-hidden': 'true' }, '←'), () => (typeof back === 'function' ? back() : navigate(back)), 'btn-icon btn-back', {
          'aria-label': t('ui.common.back')
        })
      : h('span.topbar-spacer'),
    h('h1.topbar-title', title),
    showWallet && state.profile
      ? h(
          'div.wallet',
          { 'aria-label': t('ui.common.wallet') },
          h('span.wallet-item', { title: t('ui.common.stars') }, '⭐', stars),
          h('span.wallet-item', { title: t('ui.common.coins') }, '🪙', coins),
          h('span.wallet-item', { title: t('ui.common.gems') }, '💎', gems)
        )
      : h('span.topbar-spacer')
  );
  bar.dispose = off;
  return bar;
}

export function starsRow(n, max = 3, cls = '') {
  return h(
    'span.stars' + (cls ? '.' + cls : ''),
    { 'aria-label': t('ui.common.starsOf', { n, max }) },
    Array.from({ length: max }, (_, i) => h('span.star' + (i < n ? '.on' : ''), { 'aria-hidden': 'true' }, '★'))
  );
}

export function storageBanner() {
  if (!state.storageWarning) return null;
  return h('div.banner.banner-warn', { role: 'alert' }, t('ui.errors.notSaved'));
}

export function avatarView(profile, content, size = '') {
  const hat = profile.equipped.hat && content.itemById[profile.equipped.hat];
  const outfit = profile.equipped.outfit && content.itemById[profile.equipped.outfit];
  const pet = profile.equipped.pet && content.itemById[profile.equipped.pet];
  return h(
    'div.avatar' + (size ? '.avatar-' + size : ''),
    { 'aria-hidden': 'true' },
    hat ? h('span.avatar-hat', hat.emoji) : null,
    h('span.avatar-face', profile.avatar),
    outfit ? h('span.avatar-outfit', outfit.emoji) : null,
    pet ? h('span.avatar-pet', pet.emoji) : null
  );
}

export function formatMinutes(seconds) {
  const m = Math.round(seconds / 60);
  if (m < 60) return t('ui.parent.minutes', { m });
  return t('ui.parent.hours', { h: Math.floor(m / 60), m: m % 60 });
}
