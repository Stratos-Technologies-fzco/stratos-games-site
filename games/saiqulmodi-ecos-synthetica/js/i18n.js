// i18n.js - English, Hindi and Bengali. UI strings live here; organism and
// part texts live in lang/*.js. Anything missing falls back to English.
import { HI_DATA } from './lang/hi.js';
import { HI_DATA2 } from './lang/hi2.js';
import { BN_DATA } from './lang/bn.js';
import { BN_DATA2 } from './lang/bn2.js';
import { TIERS, TRUTHS } from './Database.js';
import { WHY } from './lang/why.js';

export const LANGS = {
  en: { label: 'English', speech: 'en-IN' },
  hi: { label: 'हिन्दी', speech: 'hi-IN' },
  bn: { label: 'বাংলা', speech: 'bn-IN' },
};

const merge = (a, b) => {
  const out = { ...a };
  for (const k of Object.keys(b)) out[k] = (typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k]) ? { ...a[k], ...b[k] } : b[k];
  return out;
};
const PACKS = { hi: merge(HI_DATA, HI_DATA2), bn: merge(BN_DATA, BN_DATA2) };

let lang = 'en';
try { const s = localStorage.getItem('ecos-lang'); if (LANGS[s]) lang = s; } catch (e) { /* storage blocked */ }

export const getLang = () => lang;
export function setLang(l) {
  if (!LANGS[l]) return;
  lang = l;
  try { localStorage.setItem('ecos-lang', l); } catch (e) { /* ignore */ }
  document.documentElement.lang = l;
}

const UI = {
  en: {
    'start.subtitle': 'The Evolutionary Shield',
    'start.thesis': 'Fungi, bacteria, viruses and insects are not villains. Each one is surviving, as you are. Scan them, hear their side first, then answer them the way life really does: with walls, enzymes, signals, antibodies and partnerships.',
    'start.lens1t': 'Energy flows', 'start.lens1': 'From the sun, through every eater, out as heat. Matter goes round forever.',
    'start.lens2t': 'Nature in front', 'start.lens2': 'Every creature\'s own survival story comes before what it does to you.',
    'start.lens3t': 'Three ways of knowing', 'start.lens3': 'How humans explained each one: belief, observation, then science.',
    'start.forms': 'Single cell|Plant seedling|Honey bee|Human',
    'start.begin': 'Begin as a single cell', 'start.continue': 'Continue as {form}', 'start.new': 'New game',
    'start.erase': 'Erase all progress and start again?', 'start.eraseYes': 'Yes, erase', 'start.eraseNo': 'Keep my progress',
    'start.lang': 'Language',
    'hud.form': 'Form {n} of 4', 'hud.countered': 'Countered', 'hud.partners': 'Partners', 'hud.ep': 'evolution points',
    'hud.help': 'How to play', 'hud.soundOn': 'Sound on', 'hud.soundOff': 'Sound off',
    'hud.integrity': 'Integrity', 'hud.energy': 'Energy (ATP)', 'hud.balance': 'Ecosystem balance',
    'hud.hum': 'Humidity', 'hud.temp': 'Temp', 'hud.nut': 'Nutrients',
    'hud.keys': 'WASD move · drag to look · wheel zoom<br>click or E scan · L lab · C codex',
    'btn.evolve': 'Evolve', 'btn.codex': 'Codex', 'btn.lab': 'Lab', 'btn.scan': 'Scan', 'btn.close': 'Close', 'btn.continue': 'Continue',
    'btn.notYet': 'Not yet', 'btn.gotIt': 'Got it',
    'lab.title': 'Synthesis Lab', 'lab.cases': 'Open cases', 'lab.combo': 'Your combination',
    'lab.partInfo': 'Tap a part to read what it does and add it to your combination.',
    'lab.empty': 'No open cases. Scan a creature in the world first: its profile tells you how nature answers it. Species you have already countered or partnered with are in the Codex.',
    'lab.answer': 'How nature answers', 'lab.partner': 'How a partnership forms', 'lab.parts': '{n} parts', 'lab.slotEmpty': 'empty',
    'lab.synth': 'Synthesise (8 ATP · you have {n})', 'lab.full': 'Three slots are full. Tap a slot to remove a part.',
    'lab.noEnergy': 'Not enough energy (ATP). Close the Lab and let it refill for a few seconds.',
    'lab.fit': '{hits} of {needed} parts fit the real pathway.', 'lab.read': 'Read "How nature answers" again and match its words to the parts.',
    'lab.bestFit': 'Why it is the best fit for the {name}:', 'lab.notFit': 'Not the best fit for the {name}.',
    'lab.whyLocked': 'Make your first try. After one wrong combination, tapping a part shows why it fits or not.',
    'lab.usedFor': 'Nature uses it for: {list}.', 'lab.general': 'It is a real defence, but nature relies on other parts here.',
    'lab.marks': 'Green parts fit, red parts do not.', 'lab.hint': 'Hint: nature also uses "{part}".', 'lab.hintTab': 'Hint: nature also uses "{part}" (in the {tab} tab).',
    'codex.title': 'Codex', 'codex.species': 'Species', 'codex.energy': 'Energy flow', 'codex.truth': 'The truth',
    'codex.sum': '{s} of {t} species logged · {m} in immune memory · {p} partners',
    'codex.locked': 'Evolve to reach this form. {n} species wait here.', 'codex.unscanned': 'Not yet scanned',
    'energy.lead': 'Energy enters life from the sun (and from chemicals like ammonia), passes from eater to eaten, and leaves as heat. About 10% moves up each step; matter goes round and round.',
    'energy.source': 'Source', 'energy.sourceNote': 'Sunlight and chemical energy',
    'energy.producer': 'Producers', 'energy.producerNote': 'Make food from light or chemicals',
    'energy.herbivore': 'Plant eaters', 'energy.herbivoreNote': 'First consumers',
    'energy.predator': 'Predators', 'energy.predatorNote': 'Eat other consumers',
    'energy.decomposer': 'Decomposers', 'energy.decomposerNote': 'Return matter to soil and air',
    'energy.heat': 'Heat', 'energy.heatNote': 'Every step loses energy as heat',
    'energy.parasite': 'Parasites', 'energy.parasiteNote': 'Take energy from a living host',
    'energy.borrower': 'Viruses', 'energy.borrowerNote': 'Borrow a host cell\'s energy',
    'energy.partner': 'Partners', 'energy.partnerNote': 'Trade energy for something given back',
    'energy.none': 'none here',
    'energy.you0': 'You eat dissolved organic matter', 'energy.you1': 'You catch sunlight', 'energy.you2': 'You drink nectar, made from sunlight', 'energy.you3': 'You eat plants and animals',
    'chain.sun': 'Sun', 'chain.plants': 'Plants', 'chain.planteaters': 'Plant eaters', 'chain.predators': 'Predators',
    'chain.decomposers': 'Decomposers', 'chain.heat': 'Heat', 'chain.host': 'Living host', 'chain.hostcell': 'Host cell',
    'chain.dead': 'Dead matter', 'chain.soil': 'Soil and heat', 'chain.partner': 'Partner', 'chain.title': 'Where its energy comes from and goes', 'chain.chem': 'Ammonia',
    'prof.new': 'New species logged · +5 EP', 'prof.side': 'Its side of the story', 'prof.gift': 'Its gift to the living world',
    'prof.without': 'Without it', 'prof.energy': 'Energy flow', 'prof.harm': 'What it does to you, {player}',
    'prof.answer': 'How nature answers', 'prof.partner': 'How a partnership forms in nature', 'prof.human': 'How humans came to understand it',
    'way.belief': 'Belief', 'way.observed': 'Observation', 'way.science': 'Science', 'prof.fact': 'Did you know?',
    'prof.solution': 'The Lab solution', 'prof.solutionLead': 'Combine these parts in the Lab:', 'prof.solutionAlt': 'Another way that also works:',
    'prof.whatItIs': 'What it is:', 'prof.whyWorks': 'Why it works here:',
    'prof.labDefence': 'Build the defence in the Lab', 'prof.labPartner': 'Form the partnership in the Lab', 'prof.back': 'Back to the world',
    'prof.read': 'Read aloud', 'prof.stop': 'Stop reading', 'prof.listen': 'Listen',
    'voice.missing': 'This device has no {lang} voice installed, so reading aloud may not work. On Android, add the {lang} voice in Settings > Text-to-speech.',
    'status.partner': 'Partner: working with you', 'status.memory': 'Immune memory: you recognise it now',
    'status.invasive': 'Invasive now: balance is low', 'status.coexist': 'Coexisting while balance holds',
    'succ.partnerTitle': 'Partnership: {name}', 'succ.containTitle': '{name} contained', 'succ.notDestroyed': 'It was not destroyed. {outcome}',
    'succ.ep20': '+20 EP.', 'succ.ep25': '+25 EP. Your immune memory now recognises it on contact.',
    'intro.title': 'Form {n} of 4: {name}',
    'intro.s1': '<b>Scan</b> creatures that come near (tap them, or press Scan). Read their side of the story first.',
    'intro.s2': '<b>Build</b> the real defence or partnership in the Lab from the parts nature uses.',
    'intro.s3': '<b>Evolve</b> after you have countered {c} threats and formed {a} partnership, then pass a 5-question quiz.',
    'intro.enter': 'Enter the world',
    'evolve.title': 'Evolve into a {name}?',
    'evolve.body': 'Everything you learned stays: species in immune memory are still recognised, partners stay with you, and every Lab part you have unlocked remains available.',
    'evolve.quiz': 'First, a quiz of 5 questions. Answer 3 correctly to evolve.', 'evolve.take': 'Take the quiz',
    'over.title': 'Overwhelmed', 'over.lead': '{who} used you to survive, just as their ancestors survived on yours.',
    'over.body': 'Nothing you learned is lost. Open the Codex to read how nature answers them, then build that defence in the Lab before they reach you.',
    'over.codex': 'Open the Codex', 'over.retry': 'Try again', 'over.unscanned': 'an unscanned {cat}', 'over.attackers': 'The attackers', 'over.and': ' and ',
    'done.title': 'The Evolutionary Shield is complete',
    'done.lead': 'From a single cell to a human, you answered each organism with the defences life really evolved, and you made partners along the way.',
    'done.body': 'None of them was a villain. Each was a channel for the same flow of energy that runs through you. Keep exploring: the world goes on, and the Codex holds every story you found.',
    'done.truths': 'Read the truths', 'done.keep': 'Keep exploring', 'done.quiz': 'Take the final quiz',
    'help.title': 'How to play',
    'help.1': '<b>Move</b>: WASD or arrow keys on a PC; the joystick at bottom left on a phone.',
    'help.2': '<b>Look around</b>: drag the world. Zoom with the mouse wheel or pinch.',
    'help.3': '<b>Scan</b>: tap or click an organism, or press Scan (E). Stay within 12 m until the scan completes.',
    'help.4': '<b>Rings</b>: grey = unknown, pink = threat, violet = competitor, amber = opportunist, green = partner, blue = in immune memory.',
    'help.5': '<b>Lab (L)</b>: choose a case, add the parts named in "How nature answers", then Synthesise.',
    'help.6': '<b>Codex (C)</b>: every species you found, the energy flow, and the truths of the living world.',
    'help.7': '<b>Balance</b>: partners raise it; heat, drought and cold lower it. Below 50, opportunists such as Candida turn invasive.',
    'help.8': '<b>Read aloud</b>: every profile and quiz question can be read to you. Choose English, Hindi or Bengali on the start screen.',
    'toast.noEnergyScan': 'Not enough energy (ATP) to scan. Wait a moment.', 'toast.nothing': 'Nothing close enough. Move toward an organism.',
    'toast.memory': 'Immune memory: {name} contained on contact.', 'toast.contained': '{name} contained. {outcome}',
    'toast.partner': 'Partnership formed with {name}. {bonus}', 'toast.hunt': '{ally} kept the {prey} in check.',
    'toast.canEvolve': 'You can now evolve into a {name}. Your immune memory comes with you.',
    'toast.balLow': 'Balance fell below 50. {names} turn invasive.', 'toast.balOk': 'Balance restored. {names} return to quiet coexistence.',
    'toast.event': '{name}. {text}',
    'target.unknown': 'Unknown organism', 'target.tapAgain': 'Tap again to read its story', 'target.scanning': 'Scanning',
    'target.far': 'Move closer: {m} m too far',
    'quiz.title': 'Form quiz', 'quiz.finalTitle': 'Final quiz', 'quiz.progress': 'Question {i} of {n}', 'quiz.next': 'Next question', 'quiz.finish': 'See my score',
    'quiz.right': 'Correct!', 'quiz.wrong': 'Not quite. The answer is: {a}',
    'quiz.bank': 'NEET Learning Hub · Class {c} · {topic}', 'quiz.bankEn': '(in English)', 'quiz.game': 'From your discoveries',
    'quiz.pass': 'You scored {s} of {n}. You may evolve!', 'quiz.fail': 'You scored {s} of {n}. You need 3. Read the Codex and try a new quiz.',
    'quiz.final': 'You scored {s} of {n} in the final quiz. +{ep} EP.',
    'quiz.evolveNow': 'Evolve now', 'quiz.retry': 'Try a new quiz', 'quiz.back': 'Back to the world', 'quiz.read': 'Read aloud',
    'quiz.qDefence': 'Which parts does nature use against the {name}?', 'quiz.qPartner': 'Which parts form a partnership with the {name}?',
    'quiz.qEnergy': 'Where does the {name} sit in the flow of energy?', 'quiz.qSide': 'Whose survival story is this?',
    'quiz.qScience': 'Which discovery is about the {name}?',
    'fatal': 'This game needs WebGL. Please open it in a recent version of Chrome, Edge, Safari or Firefox.',
  },

  hi: {
    'start.subtitle': 'विकास की ढाल',
    'start.thesis': 'फफूँद, बैक्टीरिया, वायरस और कीट खलनायक नहीं हैं। हर एक आपकी तरह जीवित रहने की कोशिश कर रहा है। उन्हें स्कैन करें, पहले उनकी बात सुनें, फिर उन्हें वैसे जवाब दें जैसे जीवन सच में देता है: दीवारों, एंज़ाइमों, संकेतों, एंटीबॉडी और साझेदारी से।',
    'start.lens1t': 'ऊर्जा बहती है', 'start.lens1': 'सूरज से, हर खाने वाले से होकर, गर्मी बनकर बाहर। पदार्थ हमेशा घूमता रहता है।',
    'start.lens2t': 'प्रकृति सबसे आगे', 'start.lens2': 'हर जीव की अपनी जीवन-कथा पहले आती है, फिर यह कि वह आपके साथ क्या करता है।',
    'start.lens3t': 'जानने के तीन रास्ते', 'start.lens3': 'मनुष्यों ने हर जीव को कैसे समझा: आस्था, अवलोकन, फिर विज्ञान।',
    'start.forms': 'एक कोशिका|पौधे का अंकुर|मधुमक्खी|मनुष्य',
    'start.begin': 'एक कोशिका के रूप में शुरू करें', 'start.continue': '{form} के रूप में जारी रखें', 'start.new': 'नया खेल',
    'start.erase': 'सारी प्रगति मिटाकर फिर से शुरू करें?', 'start.eraseYes': 'हाँ, मिटाएँ', 'start.eraseNo': 'मेरी प्रगति रखें',
    'start.lang': 'भाषा',
    'hud.form': 'रूप {n} / 4', 'hud.countered': 'रोके गए', 'hud.partners': 'साथी', 'hud.ep': 'विकास अंक',
    'hud.help': 'कैसे खेलें', 'hud.soundOn': 'आवाज़ चालू', 'hud.soundOff': 'आवाज़ बंद',
    'hud.integrity': 'शरीर की सुरक्षा', 'hud.energy': 'ऊर्जा (ATP)', 'hud.balance': 'पारिस्थितिक संतुलन',
    'hud.hum': 'नमी', 'hud.temp': 'तापमान', 'hud.nut': 'पोषक तत्व',
    'hud.keys': 'WASD चलें · खींचकर देखें · व्हील ज़ूम<br>क्लिक या E स्कैन · L लैब · C कोडेक्स',
    'btn.evolve': 'विकसित हों', 'btn.codex': 'कोडेक्स', 'btn.lab': 'लैब', 'btn.scan': 'स्कैन', 'btn.close': 'बंद करें', 'btn.continue': 'आगे बढ़ें',
    'btn.notYet': 'अभी नहीं', 'btn.gotIt': 'समझ गया',
    'lab.title': 'संश्लेषण प्रयोगशाला', 'lab.cases': 'खुले मामले', 'lab.combo': 'आपका मेल',
    'lab.partInfo': 'किसी भाग पर टैप करें: पढ़ें वह क्या करता है और उसे अपने मेल में जोड़ें।',
    'lab.empty': 'कोई खुला मामला नहीं। पहले दुनिया में किसी जीव को स्कैन करें: उसकी प्रोफ़ाइल बताती है कि प्रकृति उसे कैसे जवाब देती है। जिन्हें आप रोक चुके हैं या साथी बना चुके हैं, वे कोडेक्स में हैं।',
    'lab.answer': 'प्रकृति कैसे जवाब देती है', 'lab.partner': 'साझेदारी कैसे बनती है', 'lab.parts': '{n} भाग', 'lab.slotEmpty': 'खाली',
    'lab.synth': 'संश्लेषण करें (8 ATP · आपके पास {n})', 'lab.full': 'तीनों खाने भरे हैं। कोई भाग हटाने के लिए खाने पर टैप करें।',
    'lab.noEnergy': 'ऊर्जा (ATP) कम है। लैब बंद करें और कुछ सेकंड रुकें।',
    'lab.fit': '{needed} में से {hits} भाग असली रास्ते से मेल खाते हैं।', 'lab.read': '"प्रकृति कैसे जवाब देती है" फिर से पढ़ें और उसके शब्दों को भागों से मिलाएँ।',
    'lab.bestFit': '{name} के लिए यह सबसे अच्छा क्यों है:', 'lab.notFit': '{name} के लिए यह सबसे अच्छा नहीं है।',
    'lab.whyLocked': 'पहले खुद कोशिश करें। एक गलत मेल के बाद, भाग पर टैप करने से पता चलेगा कि वह सही क्यों है या क्यों नहीं।',
    'lab.usedFor': 'प्रकृति इसका उपयोग करती है: {list}।', 'lab.general': 'यह एक असली बचाव है, पर यहाँ प्रकृति दूसरे भागों पर निर्भर करती है।',
    'lab.marks': 'हरे भाग सही हैं, लाल नहीं।', 'lab.hint': 'संकेत: प्रकृति "{part}" का भी उपयोग करती है।', 'lab.hintTab': 'संकेत: प्रकृति "{part}" का भी उपयोग करती है ({tab} टैब में)।',
    'codex.title': 'कोडेक्स', 'codex.species': 'जीव', 'codex.energy': 'ऊर्जा प्रवाह', 'codex.truth': 'सत्य',
    'codex.sum': '{t} में से {s} जीव दर्ज · {m} प्रतिरक्षा स्मृति में · {p} साथी',
    'codex.locked': 'इस रूप तक पहुँचने के लिए विकसित हों। यहाँ {n} जीव इंतज़ार कर रहे हैं।', 'codex.unscanned': 'अभी स्कैन नहीं हुआ',
    'energy.lead': 'ऊर्जा सूरज से (और अमोनिया जैसे रसायनों से) जीवन में आती है, खाए जाने वाले से खाने वाले तक जाती है, और गर्मी बनकर निकल जाती है। हर कदम पर लगभग 10% ही आगे जाती है; पदार्थ बार-बार घूमता है।',
    'energy.source': 'स्रोत', 'energy.sourceNote': 'सूर्य का प्रकाश और रासायनिक ऊर्जा',
    'energy.producer': 'उत्पादक', 'energy.producerNote': 'प्रकाश या रसायनों से भोजन बनाते हैं',
    'energy.herbivore': 'शाकाहारी', 'energy.herbivoreNote': 'पहले उपभोक्ता',
    'energy.predator': 'शिकारी', 'energy.predatorNote': 'दूसरे उपभोक्ताओं को खाते हैं',
    'energy.decomposer': 'अपघटक', 'energy.decomposerNote': 'पदार्थ को मिट्टी और हवा में लौटाते हैं',
    'energy.heat': 'गर्मी', 'energy.heatNote': 'हर कदम पर ऊर्जा गर्मी बनकर खोती है',
    'energy.parasite': 'परजीवी', 'energy.parasiteNote': 'जीवित मेज़बान से ऊर्जा लेते हैं',
    'energy.borrower': 'वायरस', 'energy.borrowerNote': 'मेज़बान कोशिका की ऊर्जा उधार लेते हैं',
    'energy.partner': 'साथी', 'energy.partnerNote': 'ऊर्जा के बदले कुछ लौटाते हैं',
    'energy.none': 'यहाँ कोई नहीं',
    'energy.you0': 'आप घुले हुए जैविक पदार्थ खाते हैं', 'energy.you1': 'आप सूरज की रोशनी पकड़ते हैं', 'energy.you2': 'आप फूलों का रस पीते हैं, जो धूप से बना है', 'energy.you3': 'आप पौधे और जानवर खाते हैं',
    'chain.sun': 'सूर्य', 'chain.plants': 'पौधे', 'chain.planteaters': 'शाकाहारी', 'chain.predators': 'शिकारी',
    'chain.decomposers': 'अपघटक', 'chain.heat': 'गर्मी', 'chain.host': 'जीवित मेज़बान', 'chain.hostcell': 'मेज़बान कोशिका',
    'chain.dead': 'मृत पदार्थ', 'chain.soil': 'मिट्टी और गर्मी', 'chain.partner': 'साथी', 'chain.title': 'इसकी ऊर्जा कहाँ से आती है और कहाँ जाती है', 'chain.chem': 'अमोनिया',
    'prof.new': 'नया जीव दर्ज · +5 EP', 'prof.side': 'इसकी अपनी कहानी', 'prof.gift': 'जीवित दुनिया को इसका उपहार',
    'prof.without': 'इसके बिना', 'prof.energy': 'ऊर्जा प्रवाह', 'prof.harm': 'यह आपके साथ क्या करता है ({player})',
    'prof.answer': 'प्रकृति कैसे जवाब देती है', 'prof.partner': 'प्रकृति में साझेदारी कैसे बनती है', 'prof.human': 'मनुष्यों ने इसे कैसे समझा',
    'way.belief': 'आस्था', 'way.observed': 'अवलोकन', 'way.science': 'विज्ञान', 'prof.fact': 'क्या आप जानते हैं?',
    'prof.solution': 'लैब में समाधान', 'prof.solutionLead': 'लैब में ये भाग मिलाएँ:', 'prof.solutionAlt': 'एक और तरीका जो काम करता है:',
    'prof.whatItIs': 'यह क्या है:', 'prof.whyWorks': 'यहाँ यह क्यों काम करता है:',
    'prof.labDefence': 'लैब में बचाव बनाएँ', 'prof.labPartner': 'लैब में साझेदारी बनाएँ', 'prof.back': 'दुनिया में लौटें',
    'prof.read': 'पढ़कर सुनाएँ', 'prof.stop': 'पढ़ना रोकें', 'prof.listen': 'सुनें',
    'voice.missing': 'इस डिवाइस में {lang} आवाज़ नहीं है, इसलिए पढ़कर सुनाना शायद काम न करे। Android पर सेटिंग्स > टेक्स्ट-टू-स्पीच में {lang} आवाज़ जोड़ें।',
    'status.partner': 'साथी: आपके साथ काम कर रहा है', 'status.memory': 'प्रतिरक्षा स्मृति: अब आप इसे पहचानते हैं',
    'status.invasive': 'अभी हमलावर: संतुलन कम है', 'status.coexist': 'संतुलन रहने तक साथ रहता है',
    'succ.partnerTitle': 'साझेदारी: {name}', 'succ.containTitle': '{name} रोका गया', 'succ.notDestroyed': 'इसे नष्ट नहीं किया गया। {outcome}',
    'succ.ep20': '+20 EP।', 'succ.ep25': '+25 EP। आपकी प्रतिरक्षा स्मृति अब इसे छूते ही पहचान लेती है।',
    'intro.title': 'रूप {n} / 4: {name}',
    'intro.s1': 'पास आने वाले जीवों को <b>स्कैन</b> करें (उन पर टैप करें या स्कैन दबाएँ)। पहले उनकी अपनी कहानी पढ़ें।',
    'intro.s2': 'प्रकृति के भागों से लैब में असली बचाव या साझेदारी <b>बनाएँ</b>।',
    'intro.s3': '{c} खतरों को रोकने और {a} साझेदारी बनाने के बाद 5 प्रश्नों की प्रश्नोत्तरी पास करके <b>विकसित</b> हों।',
    'intro.enter': 'दुनिया में प्रवेश करें',
    'evolve.title': '{name} में विकसित हों?',
    'evolve.body': 'आपने जो सीखा वह सब साथ रहेगा: प्रतिरक्षा स्मृति वाले जीव पहचाने जाते रहेंगे, साथी आपके साथ रहेंगे, और लैब के सारे खुले भाग उपलब्ध रहेंगे।',
    'evolve.quiz': 'पहले 5 प्रश्नों की प्रश्नोत्तरी। विकसित होने के लिए 3 सही उत्तर दें।', 'evolve.take': 'प्रश्नोत्तरी दें',
    'over.title': 'आप हार गए', 'over.lead': '{who} ने जीवित रहने के लिए आपका उपयोग किया, जैसे उनके पूर्वज आपके पूर्वजों पर जीवित रहे।',
    'over.body': 'आपका सीखा हुआ कुछ भी नहीं खोया। कोडेक्स खोलकर पढ़ें कि प्रकृति इन्हें कैसे जवाब देती है, फिर उनके पहुँचने से पहले लैब में वह बचाव बनाएँ।',
    'over.codex': 'कोडेक्स खोलें', 'over.retry': 'फिर से कोशिश करें', 'over.unscanned': 'एक बिना स्कैन किया {cat}', 'over.attackers': 'हमलावरों', 'over.and': ' और ',
    'done.title': 'विकास की ढाल पूरी हुई',
    'done.lead': 'एक कोशिका से मनुष्य तक, आपने हर जीव को उन्हीं बचावों से जवाब दिया जो जीवन ने सच में विकसित किए, और रास्ते में साथी भी बनाए।',
    'done.body': 'उनमें से कोई खलनायक नहीं था। हर एक उसी ऊर्जा प्रवाह का रास्ता था जो आपसे होकर बहता है। खोज जारी रखें: दुनिया चलती रहती है, और कोडेक्स में आपकी पाई हर कहानी है।',
    'done.truths': 'सत्य पढ़ें', 'done.keep': 'खोज जारी रखें', 'done.quiz': 'अंतिम प्रश्नोत्तरी दें',
    'help.title': 'कैसे खेलें',
    'help.1': '<b>चलें</b>: कंप्यूटर पर WASD या तीर कुंजियाँ; फ़ोन पर नीचे बाईं ओर का जॉयस्टिक।',
    'help.2': '<b>चारों ओर देखें</b>: दुनिया को खींचें। माउस व्हील या दो उँगलियों से ज़ूम करें।',
    'help.3': '<b>स्कैन</b>: किसी जीव पर टैप या क्लिक करें, या स्कैन (E) दबाएँ। स्कैन पूरा होने तक 12 मीटर के भीतर रहें।',
    'help.4': '<b>छल्ले</b>: धूसर = अज्ञात, गुलाबी = खतरा, बैंगनी = प्रतियोगी, पीला = अवसरवादी, हरा = साथी, नीला = प्रतिरक्षा स्मृति में।',
    'help.5': '<b>लैब (L)</b>: एक मामला चुनें, "प्रकृति कैसे जवाब देती है" में बताए भाग जोड़ें, फिर संश्लेषण करें।',
    'help.6': '<b>कोडेक्स (C)</b>: आपके पाए सभी जीव, ऊर्जा प्रवाह और जीवित दुनिया के सत्य।',
    'help.7': '<b>संतुलन</b>: साथी इसे बढ़ाते हैं; गर्मी, सूखा और ठंड इसे घटाते हैं। 50 से नीचे कैंडिडा जैसे अवसरवादी हमलावर बन जाते हैं।',
    'help.8': '<b>पढ़कर सुनाएँ</b>: हर प्रोफ़ाइल और प्रश्न आपको पढ़कर सुनाया जा सकता है। शुरुआत की स्क्रीन पर अंग्रेज़ी, हिन्दी या बांग्ला चुनें।',
    'toast.noEnergyScan': 'स्कैन के लिए ऊर्जा (ATP) कम है। थोड़ा रुकें।', 'toast.nothing': 'पास में कुछ नहीं। किसी जीव की ओर बढ़ें।',
    'toast.memory': 'प्रतिरक्षा स्मृति: {name} छूते ही रोका गया।', 'toast.contained': '{name} रोका गया। {outcome}',
    'toast.partner': '{name} के साथ साझेदारी बनी। {bonus}', 'toast.hunt': '{ally} ने {prey} को काबू में रखा।',
    'toast.canEvolve': 'अब आप {name} में विकसित हो सकते हैं। आपकी प्रतिरक्षा स्मृति साथ चलेगी।',
    'toast.balLow': 'संतुलन 50 से नीचे गिरा। {names} हमलावर बन गए।', 'toast.balOk': 'संतुलन लौटा। {names} फिर शांति से साथ रहते हैं।',
    'toast.event': '{name}। {text}',
    'target.unknown': 'अज्ञात जीव', 'target.tapAgain': 'इसकी कहानी पढ़ने के लिए फिर टैप करें', 'target.scanning': 'स्कैन हो रहा है',
    'target.far': 'पास जाएँ: {m} मीटर दूर',
    'quiz.title': 'रूप प्रश्नोत्तरी', 'quiz.finalTitle': 'अंतिम प्रश्नोत्तरी', 'quiz.progress': 'प्रश्न {i} / {n}', 'quiz.next': 'अगला प्रश्न', 'quiz.finish': 'मेरे अंक देखें',
    'quiz.right': 'सही!', 'quiz.wrong': 'ठीक नहीं। सही उत्तर है: {a}',
    'quiz.bank': 'NEET लर्निंग हब · कक्षा {c} · {topic}', 'quiz.bankEn': '(अंग्रेज़ी में)', 'quiz.game': 'आपकी खोजों से',
    'quiz.pass': '{n} में से {s} अंक। आप विकसित हो सकते हैं!', 'quiz.fail': '{n} में से {s} अंक। 3 चाहिए। कोडेक्स पढ़ें और नई प्रश्नोत्तरी दें।',
    'quiz.final': 'अंतिम प्रश्नोत्तरी में {n} में से {s} अंक। +{ep} EP।',
    'quiz.evolveNow': 'अभी विकसित हों', 'quiz.retry': 'नई प्रश्नोत्तरी', 'quiz.back': 'दुनिया में लौटें', 'quiz.read': 'पढ़कर सुनाएँ',
    'quiz.qDefence': '{name} के विरुद्ध प्रकृति कौन-से भाग उपयोग करती है?', 'quiz.qPartner': '{name} के साथ साझेदारी किन भागों से बनती है?',
    'quiz.qEnergy': 'ऊर्जा प्रवाह में {name} कहाँ है?', 'quiz.qSide': 'यह किसकी जीवन-कथा है?',
    'quiz.qScience': 'कौन-सी खोज {name} के बारे में है?',
    'fatal': 'इस खेल को WebGL चाहिए। कृपया Chrome, Edge, Safari या Firefox का नया संस्करण इस्तेमाल करें।',
  },

  bn: {
    'start.subtitle': 'বিবর্তনের ঢাল',
    'start.thesis': 'ছত্রাক, ব্যাকটেরিয়া, ভাইরাস আর পোকামাকড় খলনায়ক নয়। প্রত্যেকেই তোমার মতোই বেঁচে থাকার চেষ্টা করছে। তাদের স্ক্যান করো, আগে তাদের কথা শোনো, তারপর জীবন যেভাবে সত্যিই উত্তর দেয় সেভাবে উত্তর দাও: প্রাচীর, উৎসেচক, সংকেত, অ্যান্টিবডি আর অংশীদারিত্ব দিয়ে।',
    'start.lens1t': 'শক্তি প্রবাহিত হয়', 'start.lens1': 'সূর্য থেকে, প্রতিটি খাদকের মধ্য দিয়ে, তাপ হয়ে বেরিয়ে যায়। পদার্থ চিরকাল ঘুরতে থাকে।',
    'start.lens2t': 'প্রকৃতি সবার আগে', 'start.lens2': 'প্রতিটি জীবের নিজের বেঁচে থাকার গল্প আগে, তারপর সে তোমার সঙ্গে কী করে।',
    'start.lens3t': 'জানার তিনটি পথ', 'start.lens3': 'মানুষ প্রত্যেককে কীভাবে বুঝেছে: বিশ্বাস, পর্যবেক্ষণ, তারপর বিজ্ঞান।',
    'start.forms': 'একটি কোষ|চারাগাছ|মৌমাছি|মানুষ',
    'start.begin': 'একটি কোষ হিসেবে শুরু করো', 'start.continue': '{form} হিসেবে চালিয়ে যাও', 'start.new': 'নতুন খেলা',
    'start.erase': 'সব অগ্রগতি মুছে আবার শুরু করবে?', 'start.eraseYes': 'হ্যাঁ, মুছে দাও', 'start.eraseNo': 'আমার অগ্রগতি রাখো',
    'start.lang': 'ভাষা',
    'hud.form': 'রূপ {n} / 4', 'hud.countered': 'প্রতিরোধ', 'hud.partners': 'সঙ্গী', 'hud.ep': 'বিবর্তন পয়েন্ট',
    'hud.help': 'কীভাবে খেলবে', 'hud.soundOn': 'শব্দ চালু', 'hud.soundOff': 'শব্দ বন্ধ',
    'hud.integrity': 'শরীরের সুরক্ষা', 'hud.energy': 'শক্তি (ATP)', 'hud.balance': 'বাস্তুতন্ত্রের ভারসাম্য',
    'hud.hum': 'আর্দ্রতা', 'hud.temp': 'তাপমাত্রা', 'hud.nut': 'পুষ্টি',
    'hud.keys': 'WASD চলো · টেনে দেখো · হুইল জুম<br>ক্লিক বা E স্ক্যান · L ল্যাব · C কোডেক্স',
    'btn.evolve': 'বিবর্তিত হও', 'btn.codex': 'কোডেক্স', 'btn.lab': 'ল্যাব', 'btn.scan': 'স্ক্যান', 'btn.close': 'বন্ধ করো', 'btn.continue': 'এগিয়ে চলো',
    'btn.notYet': 'এখন নয়', 'btn.gotIt': 'বুঝেছি',
    'lab.title': 'সংশ্লেষণ ল্যাব', 'lab.cases': 'খোলা কেস', 'lab.combo': 'তোমার মিশ্রণ',
    'lab.partInfo': 'কোনো অংশে ট্যাপ করো: পড়ো সেটি কী করে, আর তোমার মিশ্রণে যোগ করো।',
    'lab.empty': 'কোনো খোলা কেস নেই। আগে পৃথিবীতে কোনো জীবকে স্ক্যান করো: তার প্রোফাইল বলে দেবে প্রকৃতি তাকে কীভাবে উত্তর দেয়। যাদের তুমি ঠেকিয়েছ বা সঙ্গী করেছ, তারা কোডেক্সে আছে।',
    'lab.answer': 'প্রকৃতি কীভাবে উত্তর দেয়', 'lab.partner': 'অংশীদারিত্ব কীভাবে গড়ে ওঠে', 'lab.parts': '{n}টি অংশ', 'lab.slotEmpty': 'খালি',
    'lab.synth': 'সংশ্লেষণ করো (8 ATP · তোমার আছে {n})', 'lab.full': 'তিনটি ঘরই ভর্তি। একটি অংশ সরাতে ঘরে ট্যাপ করো।',
    'lab.noEnergy': 'শক্তি (ATP) কম। ল্যাব বন্ধ করে কয়েক সেকেন্ড অপেক্ষা করো।',
    'lab.fit': '{needed}টির মধ্যে {hits}টি অংশ আসল পথের সঙ্গে মেলে।', 'lab.read': '"প্রকৃতি কীভাবে উত্তর দেয়" আবার পড়ো, আর তার শব্দগুলো অংশের সঙ্গে মেলাও।',
    'lab.bestFit': 'কেন এটি সেরা ({name}):', 'lab.notFit': 'এটি সেরা নয় ({name})।',
    'lab.whyLocked': 'আগে নিজে চেষ্টা করো। একটি ভুল মিশ্রণের পর, অংশে ট্যাপ করলে দেখাবে সেটি কেন মেলে বা মেলে না।',
    'lab.usedFor': 'প্রকৃতি এটি ব্যবহার করে: {list}।', 'lab.general': 'এটি আসল প্রতিরক্ষা, তবে এখানে প্রকৃতি অন্য অংশের উপর নির্ভর করে।',
    'lab.marks': 'সবুজ অংশ মেলে, লাল মেলে না।', 'lab.hint': 'ইঙ্গিত: প্রকৃতি "{part}"-ও ব্যবহার করে।', 'lab.hintTab': 'ইঙ্গিত: প্রকৃতি "{part}"-ও ব্যবহার করে ({tab} ট্যাবে)।',
    'codex.title': 'কোডেক্স', 'codex.species': 'জীব', 'codex.energy': 'শক্তি প্রবাহ', 'codex.truth': 'সত্য',
    'codex.sum': '{t}টির মধ্যে {s}টি জীব নথিভুক্ত · {m}টি প্রতিরোধ-স্মৃতিতে · {p}টি সঙ্গী',
    'codex.locked': 'এই রূপে পৌঁছাতে বিবর্তিত হও। এখানে {n}টি জীব অপেক্ষা করছে।', 'codex.unscanned': 'এখনও স্ক্যান হয়নি',
    'energy.lead': 'শক্তি সূর্য থেকে (আর অ্যামোনিয়ার মতো রাসায়নিক থেকে) জীবনে আসে, খাদ্য থেকে খাদকে যায়, আর তাপ হয়ে বেরিয়ে যায়। প্রতি ধাপে প্রায় 10% এগোয়; পদার্থ বারবার ঘোরে।',
    'energy.source': 'উৎস', 'energy.sourceNote': 'সূর্যের আলো আর রাসায়নিক শক্তি',
    'energy.producer': 'উৎপাদক', 'energy.producerNote': 'আলো বা রাসায়নিক থেকে খাদ্য তৈরি করে',
    'energy.herbivore': 'তৃণভোজী', 'energy.herbivoreNote': 'প্রথম খাদক',
    'energy.predator': 'শিকারি', 'energy.predatorNote': 'অন্য খাদকদের খায়',
    'energy.decomposer': 'বিয়োজক', 'energy.decomposerNote': 'পদার্থ মাটি আর বাতাসে ফিরিয়ে দেয়',
    'energy.heat': 'তাপ', 'energy.heatNote': 'প্রতি ধাপে শক্তি তাপ হয়ে হারায়',
    'energy.parasite': 'পরজীবী', 'energy.parasiteNote': 'জীবিত পোষকের থেকে শক্তি নেয়',
    'energy.borrower': 'ভাইরাস', 'energy.borrowerNote': 'পোষক কোষের শক্তি ধার করে',
    'energy.partner': 'সঙ্গী', 'energy.partnerNote': 'শক্তির বদলে কিছু ফিরিয়ে দেয়',
    'energy.none': 'এখানে কেউ নেই',
    'energy.you0': 'তুমি দ্রবীভূত জৈব পদার্থ খাও', 'energy.you1': 'তুমি সূর্যের আলো ধরো', 'energy.you2': 'তুমি ফুলের মধু পান করো, যা রোদ থেকে তৈরি', 'energy.you3': 'তুমি উদ্ভিদ আর প্রাণী খাও',
    'chain.sun': 'সূর্য', 'chain.plants': 'উদ্ভিদ', 'chain.planteaters': 'তৃণভোজী', 'chain.predators': 'শিকারি',
    'chain.decomposers': 'বিয়োজক', 'chain.heat': 'তাপ', 'chain.host': 'জীবিত পোষক', 'chain.hostcell': 'পোষক কোষ',
    'chain.dead': 'মৃত পদার্থ', 'chain.soil': 'মাটি আর তাপ', 'chain.partner': 'সঙ্গী', 'chain.title': 'এর শক্তি কোথা থেকে আসে আর কোথায় যায়', 'chain.chem': 'অ্যামোনিয়া',
    'prof.new': 'নতুন জীব নথিভুক্ত · +5 EP', 'prof.side': 'তার নিজের গল্প', 'prof.gift': 'জীবজগতের জন্য তার উপহার',
    'prof.without': 'সে না থাকলে', 'prof.energy': 'শক্তি প্রবাহ', 'prof.harm': 'সে তোমার সঙ্গে কী করে ({player})',
    'prof.answer': 'প্রকৃতি কীভাবে উত্তর দেয়', 'prof.partner': 'প্রকৃতিতে অংশীদারিত্ব কীভাবে গড়ে ওঠে', 'prof.human': 'মানুষ একে কীভাবে বুঝেছে',
    'way.belief': 'বিশ্বাস', 'way.observed': 'পর্যবেক্ষণ', 'way.science': 'বিজ্ঞান', 'prof.fact': 'তুমি কি জানো?',
    'prof.solution': 'ল্যাবের সমাধান', 'prof.solutionLead': 'ল্যাবে এই অংশগুলো মেলাও:', 'prof.solutionAlt': 'আরেকটি উপায় যা কাজ করে:',
    'prof.whatItIs': 'এটি কী:', 'prof.whyWorks': 'এখানে কেন কাজ করে:',
    'prof.labDefence': 'ল্যাবে প্রতিরক্ষা তৈরি করো', 'prof.labPartner': 'ল্যাবে অংশীদারিত্ব গড়ো', 'prof.back': 'পৃথিবীতে ফেরো',
    'prof.read': 'পড়ে শোনাও', 'prof.stop': 'পড়া থামাও', 'prof.listen': 'শোনো',
    'voice.missing': 'এই যন্ত্রে {lang} কণ্ঠ নেই, তাই পড়ে শোনানো হয়তো কাজ করবে না। Android-এ সেটিংস > টেক্সট-টু-স্পিচে {lang} কণ্ঠ যোগ করো।',
    'status.partner': 'সঙ্গী: তোমার সঙ্গে কাজ করছে', 'status.memory': 'প্রতিরোধ-স্মৃতি: এখন তুমি একে চেনো',
    'status.invasive': 'এখন আক্রমণকারী: ভারসাম্য কম', 'status.coexist': 'ভারসাম্য থাকা পর্যন্ত শান্তিতে থাকে',
    'succ.partnerTitle': 'অংশীদারিত্ব: {name}', 'succ.containTitle': '{name} প্রতিরোধ করা হল', 'succ.notDestroyed': 'একে ধ্বংস করা হয়নি। {outcome}',
    'succ.ep20': '+20 EP।', 'succ.ep25': '+25 EP। তোমার প্রতিরোধ-স্মৃতি এখন ছোঁয়ামাত্র একে চিনে ফেলে।',
    'intro.title': 'রূপ {n} / 4: {name}',
    'intro.s1': 'কাছে আসা জীবদের <b>স্ক্যান</b> করো (তাদের ট্যাপ করো, বা স্ক্যান টেপো)। আগে তাদের নিজের গল্প পড়ো।',
    'intro.s2': 'প্রকৃতির অংশ দিয়ে ল্যাবে আসল প্রতিরক্ষা বা অংশীদারিত্ব <b>তৈরি</b> করো।',
    'intro.s3': '{c}টি বিপদ ঠেকানো আর {a}টি অংশীদারিত্ব গড়ার পর 5 প্রশ্নের কুইজ পাস করে <b>বিবর্তিত</b> হও।',
    'intro.enter': 'পৃথিবীতে প্রবেশ করো',
    'evolve.title': '{name}-তে বিবর্তিত হবে?',
    'evolve.body': 'তুমি যা শিখেছ সব থাকবে: প্রতিরোধ-স্মৃতির জীবদের এখনও চেনা যাবে, সঙ্গীরা তোমার সঙ্গে থাকবে, আর ল্যাবের সব খোলা অংশ পাওয়া যাবে।',
    'evolve.quiz': 'আগে 5 প্রশ্নের একটি কুইজ। বিবর্তিত হতে 3টি সঠিক উত্তর দাও।', 'evolve.take': 'কুইজ দাও',
    'over.title': 'তুমি পরাস্ত', 'over.lead': '{who} বেঁচে থাকতে তোমাকে ব্যবহার করেছে, ঠিক যেমন তাদের পূর্বপুরুষ তোমার পূর্বপুরুষের উপর বেঁচেছিল।',
    'over.body': 'তোমার শেখা কিছুই হারায়নি। কোডেক্স খুলে পড়ো প্রকৃতি এদের কীভাবে উত্তর দেয়, তারপর তারা পৌঁছানোর আগে ল্যাবে সেই প্রতিরক্ষা তৈরি করো।',
    'over.codex': 'কোডেক্স খোলো', 'over.retry': 'আবার চেষ্টা করো', 'over.unscanned': 'একটি স্ক্যান-না-করা {cat}', 'over.attackers': 'আক্রমণকারীরা', 'over.and': ' আর ',
    'done.title': 'বিবর্তনের ঢাল সম্পূর্ণ',
    'done.lead': 'একটি কোষ থেকে মানুষ পর্যন্ত, তুমি প্রতিটি জীবকে সেই প্রতিরক্ষা দিয়ে উত্তর দিয়েছ যা জীবন সত্যিই বিবর্তনে পেয়েছে, আর পথে সঙ্গীও পেয়েছ।',
    'done.body': 'তাদের কেউই খলনায়ক ছিল না। প্রত্যেকেই সেই একই শক্তিপ্রবাহের পথ, যা তোমার মধ্য দিয়েও বয়। খোঁজ চালিয়ে যাও: পৃথিবী চলতে থাকে, আর কোডেক্সে তোমার পাওয়া সব গল্প আছে।',
    'done.truths': 'সত্যগুলো পড়ো', 'done.keep': 'খোঁজ চালিয়ে যাও', 'done.quiz': 'শেষ কুইজ দাও',
    'help.title': 'কীভাবে খেলবে',
    'help.1': '<b>চলা</b>: কম্পিউটারে WASD বা তীর-চাবি; ফোনে নিচে বাঁদিকের জয়স্টিক।',
    'help.2': '<b>চারপাশ দেখা</b>: পৃথিবীকে টেনে ঘোরাও। মাউস হুইল বা দুই আঙুলে জুম করো।',
    'help.3': '<b>স্ক্যান</b>: কোনো জীবে ট্যাপ বা ক্লিক করো, বা স্ক্যান (E) টেপো। স্ক্যান শেষ না হওয়া পর্যন্ত 12 মিটারের মধ্যে থাকো।',
    'help.4': '<b>বলয়</b>: ধূসর = অজানা, গোলাপি = বিপদ, বেগুনি = প্রতিযোগী, হলুদ = সুযোগসন্ধানী, সবুজ = সঙ্গী, নীল = প্রতিরোধ-স্মৃতিতে।',
    'help.5': '<b>ল্যাব (L)</b>: একটি কেস বাছো, "প্রকৃতি কীভাবে উত্তর দেয়"-তে বলা অংশ যোগ করো, তারপর সংশ্লেষণ করো।',
    'help.6': '<b>কোডেক্স (C)</b>: তোমার পাওয়া সব জীব, শক্তি প্রবাহ আর জীবজগতের সত্য।',
    'help.7': '<b>ভারসাম্য</b>: সঙ্গীরা এটা বাড়ায়; গরম, খরা আর ঠান্ডা কমায়। 50-এর নিচে ক্যান্ডিডার মতো সুযোগসন্ধানীরা আক্রমণকারী হয়ে ওঠে।',
    'help.8': '<b>পড়ে শোনাও</b>: প্রতিটি প্রোফাইল আর কুইজের প্রশ্ন তোমাকে পড়ে শোনানো যায়। শুরুর পর্দায় ইংরেজি, হিন্দি বা বাংলা বাছো।',
    'toast.noEnergyScan': 'স্ক্যানের জন্য শক্তি (ATP) কম। একটু অপেক্ষা করো।', 'toast.nothing': 'কাছে কিছু নেই। কোনো জীবের দিকে এগোও।',
    'toast.memory': 'প্রতিরোধ-স্মৃতি: {name} ছোঁয়ামাত্র ঠেকানো হল।', 'toast.contained': '{name} প্রতিরোধ করা হল। {outcome}',
    'toast.partner': '{name}-এর সঙ্গে অংশীদারিত্ব হল। {bonus}', 'toast.hunt': '{ally} {prey}-কে নিয়ন্ত্রণে রাখল।',
    'toast.canEvolve': 'এখন তুমি {name}-তে বিবর্তিত হতে পারো। তোমার প্রতিরোধ-স্মৃতি সঙ্গে যাবে।',
    'toast.balLow': 'ভারসাম্য 50-এর নিচে নামল। {names} আক্রমণকারী হয়ে উঠল।', 'toast.balOk': 'ভারসাম্য ফিরল। {names} আবার শান্তিতে সহাবস্থান করছে।',
    'toast.event': '{name}। {text}',
    'target.unknown': 'অজানা জীব', 'target.tapAgain': 'এর গল্প পড়তে আবার ট্যাপ করো', 'target.scanning': 'স্ক্যান চলছে',
    'target.far': 'কাছে যাও: {m} মিটার দূরে',
    'quiz.title': 'রূপের কুইজ', 'quiz.finalTitle': 'শেষ কুইজ', 'quiz.progress': 'প্রশ্ন {i} / {n}', 'quiz.next': 'পরের প্রশ্ন', 'quiz.finish': 'আমার নম্বর দেখো',
    'quiz.right': 'ঠিক!', 'quiz.wrong': 'ঠিক হয়নি। সঠিক উত্তর: {a}',
    'quiz.bank': 'NEET লার্নিং হাব · শ্রেণি {c} · {topic}', 'quiz.bankEn': '(ইংরেজিতে)', 'quiz.game': 'তোমার আবিষ্কার থেকে',
    'quiz.pass': '{n}-এর মধ্যে {s}। তুমি বিবর্তিত হতে পারো!', 'quiz.fail': '{n}-এর মধ্যে {s}। 3 দরকার। কোডেক্স পড়ো আর নতুন কুইজ দাও।',
    'quiz.final': 'শেষ কুইজে {n}-এর মধ্যে {s}। +{ep} EP।',
    'quiz.evolveNow': 'এখনই বিবর্তিত হও', 'quiz.retry': 'নতুন কুইজ', 'quiz.back': 'পৃথিবীতে ফেরো', 'quiz.read': 'পড়ে শোনাও',
    'quiz.qDefence': '{name}-এর বিরুদ্ধে প্রকৃতি কোন অংশগুলো ব্যবহার করে?', 'quiz.qPartner': '{name}-এর সঙ্গে অংশীদারিত্ব কোন অংশ দিয়ে গড়ে ওঠে?',
    'quiz.qEnergy': 'শক্তি প্রবাহে {name} কোথায়?', 'quiz.qSide': 'এটা কার বেঁচে থাকার গল্প?',
    'quiz.qScience': 'কোন আবিষ্কারটি {name} সম্পর্কে?',
    'fatal': 'এই খেলার জন্য WebGL দরকার। Chrome, Edge, Safari বা Firefox-এর নতুন সংস্করণে খোলো।',
  },
};

// UI string with {placeholders}.
export function t(key, vars = {}) {
  let s = (UI[lang] && UI[lang][key]) ?? UI.en[key] ?? key;
  for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(v);
  return s;
}

const pack = () => PACKS[lang];

// Organism field in the current language.
export function o(org, field) {
  if (field === 'bonus') return (pack() && pack().orgs && pack().orgs[org.id] && pack().orgs[org.id].bonus) || (org.bonus ? org.bonus.text : '');
  const p = pack();
  return (p && p.orgs && p.orgs[org.id] && p.orgs[org.id][field]) || org[field] || '';
}

// Lab part name or description.
export function comp(id, field, en) {
  const p = pack();
  const v = p && p.comps && p.comps[id];
  if (v) return field === 'name' ? v[0] : v[1];
  return en;
}

// Small dictionaries: tiers, events, truths, trophic, roles, categories, kinds.
export function dict(group, key, en) {
  const p = pack();
  const v = p && p[group] && p[group][key];
  return v ?? en;
}

// A form (tier) with its texts in the current language.
export const tierT = (i) => ({ ...TIERS[i], ...dict('tiers', i, {}) });
// An environment event's [name, text] in the current language.
export const eventT = (ev) => dict('events', ev.name, [ev.name, ev.text]);
// Why a Lab part is the best fit for a case, in the current language.
export const whyT = (orgId, partId) => (WHY[lang] && WHY[lang][orgId] && WHY[lang][orgId][partId]) || (WHY.en[orgId] && WHY.en[orgId][partId]) || '';
// A truth's [title, text] in the current language.
export const truthT = (i) => dict('truths', i, [TRUTHS[i].title, TRUTHS[i].text]);
