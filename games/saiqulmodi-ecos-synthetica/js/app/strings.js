// strings.js - text for the path screen, profiles and the new tiers, in English,
// Hindi and Bengali. Tier modules add their own packs with addStrings().
// Anything missing in hi/bn falls back to English.
import { getLang } from '../i18n.js';

const STR = { en: {}, hi: {}, bn: {} };

export function addStrings(pack) {
  for (const l of Object.keys(pack)) STR[l] = { ...(STR[l] || {}), ...pack[l] };
}

export function tr(key, vars) {
  const l = getLang();
  let s = (STR[l] && STR[l][key]) ?? STR.en[key] ?? key;
  if (vars) s = s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`));
  return s;
}

addStrings({
  en: {
    'shell.tag': 'One living world. Three ways to learn it.',
    'shell.lead': 'Start as an Eco Explorer, grow into an Eco Scientist, and work as an Eco Professional. Each level opens the next.',
    'shell.player': 'Player', 'shell.class': 'Class {c}', 'shell.college': 'College / professional',
    'shell.switch': 'Change player', 'shell.newPlayer': 'New player', 'shell.name': 'Name', 'shell.classLabel': 'Class',
    'shell.create': 'Start', 'shell.cancel': 'Cancel', 'shell.whoPlays': 'Who is playing?',
    'shell.namePh': 'Your name', 'shell.delete': 'Remove', 'shell.deleteAsk': 'Remove {name} and all their progress?',
    'shell.play': 'Play', 'shell.continue': 'Continue', 'shell.locked': 'Locked', 'shell.soon': 'Coming in the next update',
    'shell.placement': 'Placement test', 'shell.placementWhy': 'Already know this? Pass a 10-question test (7 correct) to open it now.',
    'tier.explorer': 'Eco Explorer', 'tier.explorerAge': 'Class 1-10',
    'tier.explorerText': 'Plant trees, rescue animals, clean the river, sort waste and light the village with sun and wind.',
    'tier.scientist': 'Eco Scientist', 'tier.scientistAge': 'Class 11-12',
    'tier.scientistText': 'Live as a cell, a plant, a bee and a human. Run experiments on cycles and populations, keep a journal and read the data.',
    'tier.professional': 'Eco Professional', 'tier.professionalAge': 'MBBS, Engineering, Agriculture, Forestry, Environmental Science, Research',
    'tier.professionalText': 'Real cases: outbreaks, clean energy, soil, forests and research data. Choose your track.',
    'tier.unlockScientist': 'Opens when you finish Eco Explorer.',
    'tier.unlockProfessional': 'Opens when you finish Eco Scientist.',
    'tier.progress': '{d} of {n} done',
    'pl.title': 'Placement test: {tier}', 'pl.q': 'Question {i} of {n}', 'pl.next': 'Next', 'pl.finish': 'See result',
    'pl.pass': 'You scored {s} of {n}. {tier} is open now.', 'pl.fail': 'You scored {s} of {n}. You need 7. Try again later, or play the level before it.',
    'pl.close': 'Close', 'pl.right': 'Right.', 'pl.wrong': 'Not quite. Answer: {a}', 'pl.loading': 'Loading questions...',
    'pl.en': '(question in English)',
    'shell.back': 'Paths', 'shell.backAsk': 'Leave this level and go back to the paths? Your progress is saved.',
    'common.yes': 'Yes', 'common.no': 'No', 'common.close': 'Close', 'common.read': 'Read aloud', 'common.stop': 'Stop',
  },
  hi: {
    'shell.tag': 'एक जीवित दुनिया। उसे सीखने के तीन रास्ते।',
    'shell.lead': 'इको एक्सप्लोरर से शुरू करें, इको साइंटिस्ट बनें, और इको प्रोफ़ेशनल की तरह काम करें। हर स्तर अगला स्तर खोलता है।',
    'shell.player': 'खिलाड़ी', 'shell.class': 'कक्षा {c}', 'shell.college': 'कॉलेज / पेशेवर',
    'shell.switch': 'खिलाड़ी बदलें', 'shell.newPlayer': 'नया खिलाड़ी', 'shell.name': 'नाम', 'shell.classLabel': 'कक्षा',
    'shell.create': 'शुरू करें', 'shell.cancel': 'रद्द करें', 'shell.whoPlays': 'कौन खेल रहा है?',
    'shell.namePh': 'आपका नाम', 'shell.delete': 'हटाएँ', 'shell.deleteAsk': '{name} और उनकी सारी प्रगति हटाएँ?',
    'shell.play': 'खेलें', 'shell.continue': 'जारी रखें', 'shell.locked': 'बंद', 'shell.soon': 'अगले अपडेट में आ रहा है',
    'shell.placement': 'स्तर परीक्षा', 'shell.placementWhy': 'पहले से जानते हैं? 10 प्रश्नों की परीक्षा (7 सही) पास करके इसे अभी खोलें।',
    'tier.explorer': 'इको एक्सप्लोरर', 'tier.explorerAge': 'कक्षा 1-10',
    'tier.explorerText': 'पेड़ लगाएँ, जानवरों को बचाएँ, नदी साफ़ करें, कचरा अलग करें और सूरज व हवा से गाँव रोशन करें।',
    'tier.scientist': 'इको साइंटिस्ट', 'tier.scientistAge': 'कक्षा 11-12',
    'tier.scientistText': 'एक कोशिका, एक पौधा, एक मधुमक्खी और एक मनुष्य बनकर जिएँ। चक्रों और आबादी पर प्रयोग करें, डायरी रखें और आँकड़े पढ़ें।',
    'tier.professional': 'इको प्रोफ़ेशनल', 'tier.professionalAge': 'MBBS, इंजीनियरिंग, कृषि, वानिकी, पर्यावरण विज्ञान, शोध',
    'tier.professionalText': 'असली केस: महामारी, स्वच्छ ऊर्जा, मिट्टी, जंगल और शोध के आँकड़े। अपना ट्रैक चुनें।',
    'tier.unlockScientist': 'इको एक्सप्लोरर पूरा करने पर खुलेगा।',
    'tier.unlockProfessional': 'इको साइंटिस्ट पूरा करने पर खुलेगा।',
    'tier.progress': '{n} में से {d} पूरे',
    'pl.title': 'स्तर परीक्षा: {tier}', 'pl.q': 'प्रश्न {i} / {n}', 'pl.next': 'अगला', 'pl.finish': 'परिणाम देखें',
    'pl.pass': 'आपके {n} में से {s} सही। {tier} अब खुल गया है।', 'pl.fail': 'आपके {n} में से {s} सही। 7 चाहिए। बाद में फिर कोशिश करें, या पिछला स्तर खेलें।',
    'pl.close': 'बंद करें', 'pl.right': 'सही।', 'pl.wrong': 'सही नहीं। उत्तर: {a}', 'pl.loading': 'प्रश्न लोड हो रहे हैं...',
    'pl.en': '(प्रश्न अंग्रेज़ी में)',
    'shell.back': 'रास्ते', 'shell.backAsk': 'यह स्तर छोड़कर रास्तों पर वापस जाएँ? आपकी प्रगति सहेजी गई है।',
    'common.yes': 'हाँ', 'common.no': 'नहीं', 'common.close': 'बंद करें', 'common.read': 'पढ़कर सुनाएँ', 'common.stop': 'रोकें',
  },
  bn: {
    'shell.tag': 'একটি জীবন্ত পৃথিবী। তাকে শেখার তিনটি পথ।',
    'shell.lead': 'ইকো এক্সপ্লোরার হয়ে শুরু করো, ইকো সায়েন্টিস্ট হয়ে ওঠো, আর ইকো প্রফেশনাল হিসেবে কাজ করো। প্রতিটি স্তর পরেরটি খুলে দেয়।',
    'shell.player': 'খেলোয়াড়', 'shell.class': 'শ্রেণি {c}', 'shell.college': 'কলেজ / পেশাদার',
    'shell.switch': 'খেলোয়াড় বদলাও', 'shell.newPlayer': 'নতুন খেলোয়াড়', 'shell.name': 'নাম', 'shell.classLabel': 'শ্রেণি',
    'shell.create': 'শুরু করো', 'shell.cancel': 'বাতিল', 'shell.whoPlays': 'কে খেলছে?',
    'shell.namePh': 'তোমার নাম', 'shell.delete': 'সরাও', 'shell.deleteAsk': '{name} আর তার সব অগ্রগতি সরিয়ে দেবে?',
    'shell.play': 'খেলো', 'shell.continue': 'চালিয়ে যাও', 'shell.locked': 'বন্ধ', 'shell.soon': 'পরের আপডেটে আসছে',
    'shell.placement': 'স্তর পরীক্ষা', 'shell.placementWhy': 'আগে থেকেই জানো? ১০টি প্রশ্নের পরীক্ষায় (৭টি ঠিক) পাশ করে এখনই খোলো।',
    'tier.explorer': 'ইকো এক্সপ্লোরার', 'tier.explorerAge': 'শ্রেণি ১-১০',
    'tier.explorerText': 'গাছ লাগাও, প্রাণী বাঁচাও, নদী পরিষ্কার করো, বর্জ্য আলাদা করো আর সূর্য ও বাতাস দিয়ে গ্রাম আলোকিত করো।',
    'tier.scientist': 'ইকো সায়েন্টিস্ট', 'tier.scientistAge': 'শ্রেণি ১১-১২',
    'tier.scientistText': 'একটি কোষ, একটি গাছ, একটি মৌমাছি আর একজন মানুষ হয়ে বাঁচো। চক্র ও জনসংখ্যা নিয়ে পরীক্ষা করো, ডায়েরি রাখো আর তথ্য পড়ো।',
    'tier.professional': 'ইকো প্রফেশনাল', 'tier.professionalAge': 'MBBS, ইঞ্জিনিয়ারিং, কৃষি, বনবিদ্যা, পরিবেশ বিজ্ঞান, গবেষণা',
    'tier.professionalText': 'আসল কেস: মহামারি, পরিচ্ছন্ন শক্তি, মাটি, বন আর গবেষণার তথ্য। তোমার ট্র্যাক বেছে নাও।',
    'tier.unlockScientist': 'ইকো এক্সপ্লোরার শেষ করলে খুলবে।',
    'tier.unlockProfessional': 'ইকো সায়েন্টিস্ট শেষ করলে খুলবে।',
    'tier.progress': '{n}টির মধ্যে {d}টি শেষ',
    'pl.title': 'স্তর পরীক্ষা: {tier}', 'pl.q': 'প্রশ্ন {i} / {n}', 'pl.next': 'পরের', 'pl.finish': 'ফল দেখো',
    'pl.pass': 'তুমি {n}টির মধ্যে {s}টি ঠিক করেছ। {tier} এখন খোলা।', 'pl.fail': 'তুমি {n}টির মধ্যে {s}টি ঠিক করেছ। ৭টি দরকার। পরে আবার চেষ্টা করো, বা আগের স্তরটি খেলো।',
    'pl.close': 'বন্ধ করো', 'pl.right': 'ঠিক।', 'pl.wrong': 'ঠিক হয়নি। উত্তর: {a}', 'pl.loading': 'প্রশ্ন আসছে...',
    'pl.en': '(প্রশ্ন ইংরেজিতে)',
    'shell.back': 'পথ', 'shell.backAsk': 'এই স্তর ছেড়ে পথে ফিরে যাবে? তোমার অগ্রগতি সংরক্ষিত আছে।',
    'common.yes': 'হ্যাঁ', 'common.no': 'না', 'common.close': 'বন্ধ করো', 'common.read': 'পড়ে শোনাও', 'common.stop': 'থামো',
  },
});
