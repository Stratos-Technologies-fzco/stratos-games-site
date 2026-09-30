// Explorer Camp: spend coins/gems on outfits, pets and camp decorations.

import { h, btn, mount, topBar, avatarView, toast, kiki } from '../ui.js';
import { t, content } from '../content.js';
import { state } from '../state.js';
import { buyItem, toggleItem, isItemActive, canAfford } from '../rewards.js';
import { sfx } from '../audio.js';

const TABS = [
  { id: 'hat', icon: '🎩' },
  { id: 'outfit', icon: '👕' },
  { id: 'pet', icon: '🐶' },
  { id: 'camp', icon: '⛺' }
];

export function render() {
  const p = state.profile;
  const bar = topBar({ title: t('ui.camp.title'), back: '/map' });
  let tab = 'hat';
  const preview = h('div.camp-preview');
  const tabs = h('div.tabs', { role: 'tablist' });
  const grid = h('div.item-grid', { role: 'tabpanel' });

  function drawPreview() {
    const placed = p.campPlaced.map((id) => content.itemById[id]).filter(Boolean);
    preview.replaceChildren(
      h(
        'div.camp-scene',
        h('div.camp-ground'),
        placed.map((item, i) =>
          h('span.camp-deco', { style: { left: 6 + ((i * 29) % 84) + '%', bottom: 8 + ((i * 17) % 40) + '%' }, title: item.name }, item.emoji)
        ),
        h('div.camp-avatar', avatarView(p, content, 'xl')),
        h('div.camp-name', p.nickname)
      )
    );
  }

  function drawTabs() {
    tabs.replaceChildren(
      ...TABS.map((tb) =>
        h(
          'button.tab' + (tab === tb.id ? '.active' : ''),
          {
            type: 'button',
            role: 'tab',
            'aria-selected': String(tab === tb.id),
            onclick: () => {
              sfx('tap');
              tab = tb.id;
              drawTabs();
              drawGrid();
            }
          },
          h('span', { 'aria-hidden': 'true' }, tb.icon),
          ' ',
          t('ui.camp.tab_' + tb.id)
        )
      )
    );
  }

  function drawGrid() {
    const items = content.rewards.items.filter((i) => i.slot === tab);
    grid.replaceChildren(
      ...items.map((item) => {
        const owned = p.owned.includes(item.id);
        const active = owned && isItemActive(p, item);
        let action;
        if (!owned) {
          const afford = canAfford(p, item);
          action = btn(
            `${item.currency === 'gems' ? '💎' : '🪙'} ${item.price}`,
            async () => {
              const res = await buyItem(p, item);
              if (!res.ok) {
                toast(t('ui.camp.needMore', { currency: t('ui.common.' + item.currency) }), 'warn');
                return;
              }
              sfx('coin');
              toast(t('ui.camp.bought', { name: item.name }), 'good');
              (res.newAchievements || []).forEach((a) => toast(`${a.emoji} ${t('ui.reward.achievement', { name: a.name, gems: a.gems })}`, 'good', 3000));
              await toggleItem(p, item);
              drawAll();
            },
            'btn-small ' + (afford ? 'btn-primary' : 'btn-disabled'),
            { 'aria-label': t('ui.camp.buy', { name: item.name, price: item.price, currency: t('ui.common.' + item.currency) }) }
          );
        } else {
          const label = item.slot === 'camp' ? (active ? t('ui.camp.packAway') : t('ui.camp.place')) : active ? t('ui.camp.takeOff') : t('ui.camp.wear');
          action = btn(label, async () => {
            await toggleItem(p, item);
            drawAll();
          }, 'btn-small ' + (active ? 'btn-ghost' : 'btn-secondary'));
        }
        return h(
          'div.item-card' + (owned ? '.owned' : '') + (active ? '.active' : ''),
          h('span.item-emoji', { 'aria-hidden': 'true' }, item.emoji),
          h('span.item-name', item.name),
          action
        );
      })
    );
  }

  function drawAll() {
    drawPreview();
    drawGrid();
  }

  drawTabs();
  drawAll();
  mount(
    h(
      'main.screen.camp-screen',
      bar,
      preview,
      p.owned.length === 0 ? kiki(t('kiki.camp'), { speakNow: true }) : null,
      tabs,
      grid,
      h('p.help.center', t('ui.camp.note'))
    )
  );
  return () => bar.dispose();
}
