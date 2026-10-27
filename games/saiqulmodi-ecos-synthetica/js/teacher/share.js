// share.js - on the path screen: "Share with teacher" (report card file or QR
// code, made only when the student taps) and "Teacher code" (a code from the
// teacher that opens a tier for the whole class).
import { addStrings, tr } from '../app/strings.js';
import { progress, saveProfiles, saveKeyFor } from '../app/Profile.js';
import { buildPayload, makeReport, checkUnlock } from './report.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const $ = (id) => document.getElementById(id);

addStrings({
  en: {
    'tc.share': 'Share with teacher', 'tc.code': 'Teacher code', 'tc.title': 'Report card for your teacher',
    'tc.lead': 'This makes a small file with your results only (stars, trees, cases). Nothing leaves this device unless you send the file or show the QR code.',
    'tc.classCode': 'Class code (from your teacher)', 'tc.classPh': 'e.g. 7B-GREEN', 'tc.make': 'Make report card',
    'tc.download': 'Download file', 'tc.qr': 'Or let your teacher scan this QR code:', 'tc.qrBig': 'Too much to fit in a QR code: send the file instead.',
    'tc.codeTitle': 'Teacher code', 'tc.codeLead': 'Your teacher can give the class a code that opens Eco Scientist or Eco Professional.',
    'tc.codeIn': 'Code', 'tc.apply': 'Use code', 'tc.needClass': 'Enter your class code first.', 'tc.bad': 'That code does not match your class code.',
    'tc.opened': '{tier} is open now.', 'tc.teacherPage': 'For teachers',
  },
  hi: {
    'tc.share': 'शिक्षक को भेजें', 'tc.code': 'शिक्षक कोड', 'tc.title': 'आपके शिक्षक के लिए रिपोर्ट कार्ड',
    'tc.lead': 'यह केवल आपके परिणामों (सितारे, पेड़, केस) की एक छोटी फ़ाइल बनाता है। जब तक आप फ़ाइल न भेजें या QR कोड न दिखाएँ, कुछ भी इस डिवाइस से बाहर नहीं जाता।',
    'tc.classCode': 'कक्षा कोड (शिक्षक से)', 'tc.classPh': 'जैसे 7B-GREEN', 'tc.make': 'रिपोर्ट कार्ड बनाएँ',
    'tc.download': 'फ़ाइल डाउनलोड करें', 'tc.qr': 'या शिक्षक यह QR कोड स्कैन करें:', 'tc.qrBig': 'QR कोड में समाने के लिए बहुत ज़्यादा है: फ़ाइल भेजें।',
    'tc.codeTitle': 'शिक्षक कोड', 'tc.codeLead': 'आपके शिक्षक कक्षा को एक कोड दे सकते हैं जो इको साइंटिस्ट या इको प्रोफ़ेशनल खोलता है।',
    'tc.codeIn': 'कोड', 'tc.apply': 'कोड लगाएँ', 'tc.needClass': 'पहले अपना कक्षा कोड लिखें।', 'tc.bad': 'यह कोड आपके कक्षा कोड से मेल नहीं खाता।',
    'tc.opened': '{tier} अब खुला है।', 'tc.teacherPage': 'शिक्षकों के लिए',
  },
  bn: {
    'tc.share': 'শিক্ষককে পাঠাও', 'tc.code': 'শিক্ষকের কোড', 'tc.title': 'তোমার শিক্ষকের জন্য রিপোর্ট কার্ড',
    'tc.lead': 'এটি শুধু তোমার ফলাফলের (তারা, গাছ, কেস) একটি ছোট ফাইল বানায়। তুমি ফাইল না পাঠালে বা QR কোড না দেখালে কিছুই এই ডিভাইস থেকে বাইরে যায় না।',
    'tc.classCode': 'ক্লাস কোড (শিক্ষকের কাছ থেকে)', 'tc.classPh': 'যেমন 7B-GREEN', 'tc.make': 'রিপোর্ট কার্ড বানাও',
    'tc.download': 'ফাইল ডাউনলোড করো', 'tc.qr': 'অথবা শিক্ষক এই QR কোড স্ক্যান করুন:', 'tc.qrBig': 'QR কোডে ধরানোর পক্ষে বেশি: ফাইল পাঠাও।',
    'tc.codeTitle': 'শিক্ষকের কোড', 'tc.codeLead': 'তোমার শিক্ষক ক্লাসকে একটি কোড দিতে পারেন যা ইকো সায়েন্টিস্ট বা ইকো প্রফেশনাল খোলে।',
    'tc.codeIn': 'কোড', 'tc.apply': 'কোড লাগাও', 'tc.needClass': 'আগে তোমার ক্লাস কোড লেখো।', 'tc.bad': 'এই কোড তোমার ক্লাস কোডের সঙ্গে মেলে না।',
    'tc.opened': '{tier} এখন খোলা।', 'tc.teacherPage': 'শিক্ষকদের জন্য',
  },
});

let qrReady = null;
function loadQR() {
  if (!qrReady) {
    qrReady = new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'vendor/qrcode.min.js';
      s.onload = () => { window.qrcode.stringToBytes = window.qrcode.stringToBytesFuncs['UTF-8']; res(window.qrcode); };
      s.onerror = rej;
      document.head.appendChild(s);
    });
  }
  return qrReady;
}

export function qrSVG(qrcode, text) {
  const q = qrcode(0, 'L');
  q.addData(text, 'Byte');
  q.make();
  return q.createSvgTag({ cellSize: 4, margin: 4, scalable: true });
}

function readSave(p) { try { return JSON.parse(localStorage.getItem(saveKeyFor(p)) || 'null'); } catch (e) { return null; } }

export function addShareButtons(shell) {
  shell.addFooter((foot, p) => {
    if (!p) return;
    foot.insertAdjacentHTML('beforeend', `<button class="btn" id="btnShare">📤 ${esc(tr('tc.share'))}</button><button class="btn" id="btnTCode">🔑 ${esc(tr('tc.code'))}</button><a class="btn" href="teacher.html" target="_blank" rel="noopener">🧑‍🏫 ${esc(tr('tc.teacherPage'))}</a>`);
    $('btnShare').onclick = () => openShare(shell, p);
    $('btnTCode').onclick = () => openCode(shell, p);
  });
}

function classField(p) {
  return `<label>${esc(tr('tc.classCode'))}<input id="tcClass" maxlength="12" autocomplete="off" value="${esc(p.classCode || '')}" placeholder="${esc(tr('tc.classPh'))}"></label>`;
}
function saveClass(p) { p.classCode = $('tcClass').value.trim().toUpperCase().slice(0, 12); saveProfiles(); return p.classCode; }

function openShare(shell, p) {
  shell.openModal(`<header><h2>${esc(tr('tc.title'))}</h2><button class="x" id="tcClose">${esc(tr('common.close'))}</button></header>
    <div class="scroll profile-form"><p>${esc(tr('tc.lead'))}</p>${classField(p)}
    <div class="sheet-actions"><button class="btn primary" id="tcMake">${esc(tr('tc.make'))}</button></div><div id="tcOut"></div></div>`);
  $('tcClose').onclick = () => shell.closeModal();
  $('tcMake').onclick = async () => {
    saveClass(p);
    const rep = await makeReport(buildPayload(p, progress(p), readSave(p)));
    const text = JSON.stringify(rep);
    let qr = '';
    try { qr = qrSVG(await loadQR(), text); } catch (e) { qr = ''; }
    $('tcOut').innerHTML = `<div class="sheet-actions"><button class="btn primary" id="tcDl">${esc(tr('tc.download'))}</button></div>
      ${qr ? `<p>${esc(tr('tc.qr'))}</p><div class="tc-qr">${qr}</div>` : `<p>${esc(tr('tc.qrBig'))}</p>`}`;
    $('tcDl').onclick = () => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
      a.download = `ecos-report-${(p.classCode || 'class')}-${p.name.replace(/[^\p{L}\p{N}]+/gu, '_')}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    };
  };
}

function openCode(shell, p) {
  shell.openModal(`<header><h2>${esc(tr('tc.codeTitle'))}</h2><button class="x" id="tcClose">${esc(tr('common.close'))}</button></header>
    <div class="scroll profile-form"><p>${esc(tr('tc.codeLead'))}</p>${classField(p)}
    <label>${esc(tr('tc.codeIn'))}<input id="tcCode" maxlength="6" autocomplete="off"></label>
    <div class="sheet-actions"><button class="btn primary" id="tcApply">${esc(tr('tc.apply'))}</button></div><p id="tcMsg"></p></div>`);
  $('tcClose').onclick = () => shell.closeModal();
  $('tcApply').onclick = async () => {
    const cc = saveClass(p);
    if (!cc) { $('tcMsg').textContent = tr('tc.needClass'); return; }
    const tier = await checkUnlock(cc, $('tcCode').value);
    if (!tier) { $('tcMsg').textContent = tr('tc.bad'); return; }
    p.unlocked[tier] = true;
    if (tier === 'professional') p.unlocked.scientist = true;
    saveProfiles();
    $('tcMsg').textContent = tr('tc.opened', { tier: tr(`tier.${tier}`) });
    shell.render();
  };
}
