/* Asset loader. Everything lives inside this folder so the game works offline. */
window.DF = window.DF || {};
(function (DF) {
  'use strict';
  var imgs = {}, rasters = {}, sil = {};
  var SQUARE = /^(icon-|prop-genesis-crystal)/;
  var PATHS = {};
  var ART = ['prop-berry-bush', 'prop-egg-nest', 'prop-genesis-crystal', 'icon-dna', 'icon-token', 'icon-food', 'icon-health', 'icon-energy', 'icon-egg', 'icon-xp', 'icon-crystal'];
  var PORTRAITS = ['dino-starter', 'enemy-raider', 'enemy-spitter', 'enemy-skimmer', 'boss-thornback', 'evo-swiftclaw', 'evo-ironhide', 'evo-wildspark', 'egg-shadowscale', 'egg-glade'];
  var PHOTOS = ['canyon_styracosaur', 'tribal_river_canyon', 'volcanic_ruins_chasm', 'other_9', 'raptor_nursery_sanctuary', 'other_8', 'other_1', 'other_5', 'lost_expedition_raptor', 'swiftclaw', 'crystal_magma_stegosaur', 'wildspark', 'aurora_celestial_sanctuary', 'bioluminescent_spino_swamp', 'celestial_sky_citadel', 'dino_valley_relic'];
  ART.forEach(function (n) { PATHS[n] = 'assets/art/' + n + '.svg'; });
  PHOTOS.forEach(function (n) { PATHS[n] = 'assets/images/' + n + '.jpg'; });
  PORTRAITS.forEach(function (n) { PATHS['pt-' + n] = 'assets/portraits/' + n + '.jpg'; }); // painted menu portraits
  DF.Sprites.names.forEach(function (n) { PATHS[n] = DF.Sprites.dataUrl(n); }); // in-game cut-out sprites, drawn in code
  /* Needed before the first screen can play. The rest is requested in the background. */
  var CRITICAL = ['canyon_styracosaur', 'other_9', 'raptor_nursery_sanctuary', 'dino-starter', 'enemy-raider', 'prop-berry-bush', 'prop-egg-nest', 'icon-dna', 'icon-token', 'evo-swiftclaw', 'evo-ironhide', 'evo-wildspark', 'enemy-spitter', 'enemy-skimmer', 'boss-thornback', 'prop-genesis-crystal'];

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
      var im = A.img(name), W = Math.round(w * 2), ratio = SQUARE.test(name) ? 1 : 0.75, H = Math.round(W * ratio);
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
