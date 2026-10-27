// Missions.js - the Explorer activities. 3D missions run in the World; mini-games
// are tap-only HTML panels. Each returns { wrong } (mistakes, used as hints).
// ui: { step(key, vars), fact(textKey, nameKey), panel(html) -> element, closePanel(), sound(kind), wait(ms) }

const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

function counter(w, ui) {
  const c = { wrong: 0 };
  w.onWrong = () => { c.wrong++; ui.sound('no'); ui.hint('ex.notThat'); };
  return c;
}

export const MISSIONS = {
  // Plants: take a sapling, plant it, fetch water, water it, watch it grow. Three times.
  async plantTree(w, ui, pr) {
    const c = counter(w, ui);
    const free = w.makePatches();
    for (let i = 0; i < 3; i++) {
      ui.step(i ? 'm.plant.again' : 'm.plant.go', { n: 3 - i });
      await w.waitTap([w.shed]);
      w.carry(w.makeSapling());
      ui.sound('pick');
      ui.step('m.plant.dig');
      const patch = await w.waitTap(free);
      free.splice(free.indexOf(patch), 1);
      w.carry(null);
      const sap = w.makeSapling();
      sap.position.y = 0.05;
      patch.obj.add(sap);
      ui.sound('dig');
      ui.step('m.plant.water');
      await w.waitTap([w.river]);
      w.carry(w.makeCan());
      ui.sound('water');
      ui.step('m.plant.pour');
      await w.waitTap([patch]);
      w.carry(null);
      patch.obj.remove(sap);
      const t = w.addPlantedTree(pr.trees || 0);
      pr.trees = (pr.trees || 0) + 1;
      t.position.copy(patch.obj.position);
      w.removeThing(patch);
      ui.sound('grow');
      ui.step('m.plant.grow');
      await ui.wait(1500);
    }
    return c;
  },

  // Animals: free each animal and take it to its own home.
  async rescueAnimal(w, ui) {
    const c = counter(w, ui);
    const turtle = w.makeAnimal('turtle');
    const bag = w.makeLitter(1);
    bag.scale.setScalar(2.2);
    bag.position.y = 0.4;
    turtle.add(bag);
    const tTh = w.addThing('turtle', turtle, 9, 9, { radius: 0.8, hitY: 0.4 });
    const chick = w.addThing('chick', w.makeAnimal('chick'), 19, 4, { radius: 0.6, hitY: 0.4 });
    const frog = w.addThing('frog', w.makeAnimal('frog'), 3, 13, { radius: 0.7, hitY: 0.4 });
    const jobs = [
      { th: tTh, step: 'm.rescue.turtle', home: w.river, homeStep: 'm.rescue.turtleHome', place: (o) => { o.position.set(w.player.position.x, 0.05, -18.5); w.scene.add(o); } },
      { th: chick, step: 'm.rescue.chick', home: w.nestTree, homeStep: 'm.rescue.chickHome', place: (o) => { o.position.copy(w.nestPos); o.scale.setScalar(0.8); w.nestTree.obj.add(o); } },
      { th: frog, step: 'm.rescue.frog', home: w.pond, homeStep: 'm.rescue.frogHome', place: (o) => { o.position.set(24, 0.05, 16); w.scene.add(o); } },
    ];
    for (const j of jobs) {
      ui.step(j.step);
      await w.waitTap([j.th]);
      if (j.th === tTh) turtle.remove(bag);
      w.removeThing(j.th);
      w.scene.remove(j.th.obj);
      w.carry(j.th.obj);
      ui.sound('pick');
      ui.step(j.homeStep);
      await w.waitTap([j.home]);
      w.carry(null);
      j.place(j.th.obj);
      j.th.obj.rotation.set(0, 0, 0);
      ui.sound('yay');
    }
    ui.step('m.rescue.done');
    await ui.wait(1800);
    return c;
  },

  // Pollution, part 1 in 3D: pick up the rubbish, the river turns blue, fish return. Part 2: sort the waste.
  async cleanRiver(w, ui) {
    const c = counter(w, ui);
    const n = 8;
    const litter = [];
    for (let i = 0; i < n; i++) {
      const x = -28 + i * 8 + Math.random() * 2;
      const th = w.addThing(`litter${i}`, w.makeLitter(i), x, -19 + (i % 2 ? 1.5 : -1), { radius: 0.7, hitY: 0.3, approach: () => w.vec(x, 0, -14.6) });
      th.obj.position.y = 0.15;
      th.marker = () => th.obj.position;
      th.arrowY = 2.2;
      litter.push(th);
    }
    ui.step('m.river.start');
    let got = 0;
    while (got < n) {
      const th = await w.waitTap(litter.filter((l) => !l.removed));
      w.removeThing(th);
      w.tweens.push({ obj: th.obj, from: 1, to: 0.01, t: 0, dur: 0.4, done: () => w.scene.remove(th.obj) });
      got++;
      w.setRiverClean(got / n);
      ui.sound('pick');
      if (got < n) ui.step('m.river.left', { n: n - got });
    }
    w.addFish(6);
    ui.sound('yay');
    ui.step('m.river.done');
    await ui.wait(1800);
    const sort = await MINIS.sortWaste(ui);
    c.wrong += sort.wrong;
    return c;
  },

  // Biodiversity: find six different living things around the trail.
  async spotSpecies(w, ui) {
    const c = counter(w, ui);
    const spots = [['butterfly', -10, 14, 1.4], ['peacock', 18, 20, 0], ['earthworm', -20, 10, 0], ['mushroom', 30, -2, 0], ['bee', 6, -12, 1.6], ['ladybird', -26, -10, 0]];
    const things = spots.map(([k, x, z, y]) => {
      const o = w.makeAnimal(k);
      const th = w.addThing(k, o, x, z, { radius: 0.9, hitY: 0.5 });
      o.position.y = y;
      if (o.userData.wings) w.anims.push((dt, t) => { o.userData.wings[0].rotation.y = Math.sin(t * 14) * 0.8; o.userData.wings[1].rotation.y = -Math.sin(t * 14) * 0.8; });
      return th;
    });
    ui.step('m.spot.start');
    let left = things.length;
    while (left) {
      const th = await w.waitTap(things.filter((t) => !t.found));
      th.found = true;
      left--;
      ui.sound('yay');
      w.removeThing(th);
      await ui.fact(`sp.${th.id}`, `spn.${th.id}`, th.id);
      if (left) ui.step('m.spot.left', { n: left });
    }
    return c;
  },

  // Climate: solar panels on three roofs and a windmill on the hill, then night falls and the homes light up.
  async cleanEnergy(w, ui) {
    const c = counter(w, ui);
    w.resetEnergy();
    ui.step('m.energy.start');
    w.setDusk(0.35);
    const roofs = [...w.huts];
    for (let i = 0; i < 3; i++) {
      const hut = await w.waitTap(roofs);
      roofs.splice(roofs.indexOf(hut), 1);
      const s = w.makeSolar();
      s.position.set(0, 3.1, 0.6);
      hut.obj.add(s);
      w.energyObjs.push(s);
      w.grow(s);
      ui.sound('dig');
    }
    ui.step('m.energy.wind');
    await w.waitTap([w.hill]);
    const mill = w.makeWindmill();
    mill.position.set(0, 4.2, 0);
    w.hill.obj.add(mill);
    w.energyObjs.push(mill);
    w.grow(mill);
    ui.sound('grow');
    for (let k = 0.35; k <= 0.85; k += 0.05) { w.setDusk(k); await ui.wait(80); }
    w.lightHomes(true);
    ui.sound('yay');
    ui.step('m.energy.done');
    await ui.wait(2500);
    for (let k = 0.85; k >= 0; k -= 0.05) { w.setDusk(Math.max(0, k)); await ui.wait(40); }
    w.lightHomes(false);
    return c;
  },

  async waterCycle(w, ui) { return MINIS.order(ui, 'mini.water', [['☀️', 'w.sun'], ['💨', 'w.vapour'], ['☁️', 'w.cloud'], ['🌧️', 'w.rain']], true); },
  async foodChain(w, ui) { return MINIS.order(ui, 'mini.chain', [['🌿', 'c.grass'], ['🦗', 'c.grasshopper'], ['🐸', 'c.frog'], ['🐍', 'c.snake'], ['🦅', 'c.eagle']], false); },
};

// Tap-only mini-games in a panel.
export const MINIS = {
  // Put cards in order by tapping the next one.
  order(ui, promptKey, items, cycle) {
    return new Promise((resolve) => {
      let next = 0; let wrong = 0;
      const shown = shuffle(items.map((it, i) => ({ i, icon: it[0], key: it[1] })));
      const draw = () => {
        const el = ui.panel(`
          <p class="ex-prompt">${ui.esc(ui.tr(promptKey))}</p>
          <div class="ex-row">${items.slice(0, next).map((it) => `<div class="ex-chip done"><span>${it[0]}</span>${ui.esc(ui.tr(it[1]))}</div>`).join('<b class="ex-arrow">→</b>')}${cycle && next === items.length ? `<b class="ex-arrow">↺</b>` : ''}</div>
          <div class="ex-cards">${shown.map((s) => `<button class="ex-card ${s.i < next ? 'used' : ''}" data-i="${s.i}" ${s.i < next ? 'disabled' : ''}><span>${s.icon}</span>${ui.esc(ui.tr(s.key))}</button>`).join('')}</div>`, 'mini');
        ui.speak([ui.tr(promptKey)]);
        el.querySelectorAll('.ex-card').forEach((b) => {
          b.onclick = () => {
            const i = Number(b.dataset.i);
            if (i === next) {
              next++; ui.sound('pick');
              if (next === items.length) { draw(); ui.sound('yay'); setTimeout(() => { ui.closePanel(); resolve({ wrong }); }, 1600); return; }
              draw();
            } else { wrong++; ui.sound('no'); b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 400); ui.hint('mini.wrong'); }
          };
        });
      };
      draw();
    });
  },

  // Tap a thing, then the bin it belongs in.
  sortWaste(ui) {
    return new Promise((resolve) => {
      const items = shuffle([['🍌', 'it.banana', 'wet'], ['🍚', 'it.food', 'wet'], ['🍂', 'it.leaves', 'wet'], ['📰', 'it.paper', 'dry'], ['🍾', 'it.glass', 'dry'],
        ['🥫', 'it.can', 'dry'], ['🧴', 'it.plastic', 'dry'], ['🔋', 'it.battery', 'harm'], ['💊', 'it.medicine', 'harm']]);
      const bins = [['wet', '🟢', 'bin.wet'], ['dry', '🔵', 'bin.dry'], ['harm', '🔴', 'bin.harm']];
      let sel = null; let wrong = 0;
      const placed = new Set();
      const draw = () => {
        const el = ui.panel(`
          <p class="ex-prompt">${ui.esc(ui.tr('mini.sort'))}</p>
          <div class="ex-cards">${items.map((it, i) => `<button class="ex-card small ${placed.has(i) ? 'used' : ''} ${sel === i ? 'sel' : ''}" data-i="${i}" ${placed.has(i) ? 'disabled' : ''}><span>${it[0]}</span>${ui.esc(ui.tr(it[1]))}</button>`).join('')}</div>
          <div class="ex-bins">${bins.map((b) => `<button class="ex-bin" data-b="${b[0]}"><span>${b[1]}🗑️</span>${ui.esc(ui.tr(b[2]))}<i>${items.filter((it, i) => placed.has(i) && it[2] === b[0]).map((it) => it[0]).join('')}</i></button>`).join('')}</div>`, 'mini');
        el.querySelectorAll('.ex-card').forEach((b) => { b.onclick = () => { sel = Number(b.dataset.i); ui.speak([ui.tr(items[sel][1])]); draw(); }; });
        el.querySelectorAll('.ex-bin').forEach((b) => {
          b.onclick = () => {
            if (sel === null) return;
            if (items[sel][2] === b.dataset.b) {
              placed.add(sel); sel = null; ui.sound('pick');
              if (placed.size === items.length) { draw(); ui.sound('yay'); ui.step('mini.sortDone'); setTimeout(() => { ui.closePanel(); resolve({ wrong }); }, 1600); return; }
            } else { wrong++; ui.sound('no'); ui.hint('mini.wrong'); }
            draw();
          };
        });
      };
      ui.speak([ui.tr('mini.sort')]);
      draw();
    });
  },
};
