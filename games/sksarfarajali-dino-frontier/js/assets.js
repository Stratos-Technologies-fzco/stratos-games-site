/* Asset loader. Everything lives inside this folder so the game works offline. */
window.DF = window.DF || {};
(function (DF) {
  'use strict';
  var imgs = {}, rasters = {}, sil = {};
  var SQUARE = /^(icon-|prop-genesis-crystal)/;
  var PATHS = {};
  var ART = ['prop-berry-bush', 'prop-genesis-crystal', 'icon-token', 'icon-food', 'icon-health', 'icon-energy', 'icon-egg', 'icon-xp', 'icon-crystal'];
  var PHOTOS = ['canyon_styracosaur', 'tribal_river_canyon', 'volcanic_ruins_chasm', 'other_9', 'raptor_nursery_sanctuary', 'other_1', 'lost_expedition_raptor', 'aurora_celestial_sanctuary', 'bioluminescent_spino_swamp', 'celestial_sky_citadel'];
  ART.forEach(function (n) { PATHS[n] = 'assets/art/' + n + '.svg'; });
  PHOTOS.forEach(function (n) { PATHS[n] = 'assets/images/' + n + '.jpg'; });
  /* in-game dinosaurs are the owner's own art, cut out: the player (one recolour per evolution path), enemies and the boss */
  PATHS['dino-starter'] = 'assets/sprites/player.png'; PATHS['evo-swiftclaw'] = 'assets/sprites/swiftclaw.png'; PATHS['evo-ironhide'] = 'assets/sprites/ironhide.png'; PATHS['evo-wildspark'] = 'assets/sprites/wildspark.png';
  PATHS['prop-berry-bush'] = 'assets/sprites/food.png'; PATHS['icon-food'] = 'assets/sprites/food-icon.png'; // food: the owner's glowing mushroom art (cut out)
  PATHS['dna'] = 'assets/sprites/dna.png'; // DNA Fragment pickup (the owner's art, cut out)
  ['egg', 'egg-glade', 'egg-prism', 'egg-ember', 'egg-frost', 'egg-mire', 'egg-genesis'].forEach(function (n) { PATHS[n] = 'assets/sprites/' + n + '.png'; }); // the owner's egg art (cut out) and two recolours
  ['enemy-raider', 'enemy-spitter', 'enemy-skimmer', 'boss-thornback', 'boss-cinderjaw', 'boss-whitetitan', 'boss-mirequeen', 'boss-colossus'].forEach(function (n) { PATHS[n] = 'assets/sprites/' + n + '.png'; });
  /* Version tag on every file URL so returning players pick up swapped art instead of a cached copy. Bump it when art changes. */
  var V = '20261031d';
  Object.keys(PATHS).forEach(function (n) { if (PATHS[n].indexOf('data:') !== 0) PATHS[n] += '?v=' + V; });
  /* Needed before the first screen can play. The rest is requested in the background. */
  var CRITICAL = ['canyon_styracosaur', 'other_9', 'raptor_nursery_sanctuary', 'dino-starter', 'enemy-raider', 'prop-berry-bush', 'egg', 'egg-glade', 'dna', 'icon-token', 'evo-swiftclaw', 'evo-ironhide', 'evo-wildspark', 'enemy-spitter', 'enemy-skimmer', 'boss-thornback', 'prop-genesis-crystal'];

  function loadOne(name) {
    return new Promise(function (resolve, reject) {
      if (imgs[name] && imgs[name].complete && imgs[name].naturalWidth) return resolve(imgs[name]);
      var im = new Image(); im.decoding = 'async';
      im.onload = function () { imgs[name] = im; resolve(im); };
      im.onerror = function () { reject(new Error('asset:' + name)); };
      im.src = PATHS[name];
    });
  }
  var A = DF.Assets = {
    paths: PATHS,
    url: function (name) { return PATHS[name]; },
    /* Loads the critical set with progress, then lazy-loads the rest. Rejects if a critical file fails. */
    load: function (onProgress) {
      var done = 0, total = CRITICAL.length;
      return Promise.all(CRITICAL.map(function (n) {
        return loadOne(n).then(function () { done++; if (onProgress) onProgress(done / total); });
      })).then(function () {
        Object.keys(PATHS).forEach(function (n) { if (CRITICAL.indexOf(n) < 0) loadOne(n).catch(function () {}); });
      });
    },
    img: function (name) { return imgs[name] || placeholder(); },
    sprite: function (name, w) {
      var key = name + '|' + w; if (rasters[key]) return rasters[key];
      var im = A.img(name), W = Math.round(w * 2), ratio = (im.naturalWidth && im.naturalHeight) ? im.naturalHeight / im.naturalWidth : (SQUARE.test(name) ? 1 : 0.75), H = Math.round(W * ratio);
      var c = document.createElement('canvas'); c.width = W; c.height = H;
      try { c.getContext('2d').drawImage(im, 0, 0, W, H); } catch (e) {}
      return (rasters[key] = c);
    },
    /* flat-colour copy of a sprite, used for hit flashes and attack telegraphs */
    silhouette: function (name, w, color) {
      var key = name + '|' + w + '|' + color; if (sil[key]) return sil[key];
      var src = A.sprite(name, w), c = document.createElement('canvas'); c.width = src.width; c.height = src.height;
      var x = c.getContext('2d'); x.drawImage(src, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = color; x.fillRect(0, 0, c.width, c.height);
      return (sil[key] = c);
    }
  };
  var ph = null;
  function placeholder() { if (!ph) { ph = document.createElement('canvas'); ph.width = ph.height = 2; } return ph; }
})(window.DF);
