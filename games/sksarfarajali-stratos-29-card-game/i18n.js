/* STRATOS 29 translations: Hindi (hi) and Bengali (bn). English is the default text in index.html.
   exact: whole phrases. pats: phrases with names, numbers, suits or card names in them. long: whole pages (tutorial, rules, about). */
(function () {
  var MID = '·', DASH = '—', TIMES = '×';

  function build(D) {
    function X(t) {
      if (t === undefined || t === null) return '';
      if (D.tok[t] !== undefined) return D.tok[t];
      var m = /^(\w+) of (Spades|Hearts|Diamonds|Clubs)$/.exec(t);
      if (m) return D.card(m[1], m[2]);
      return t;
    }
    function P(re, tpl) {
      return [re, function (m) { return tpl.replace(/\$(\d)/g, function (_, n) { return X(m[+n]); }); }];
    }
    var pats = D.pats(P, X);
    return { exact: D.exact, pats: pats, long: D.long, rank: D.rank };
  }

  /* ============================ HINDI ============================ */
  var HI_SUIT = { Spades: 'हुकुम', Hearts: 'पान', Diamonds: 'ईंट', Clubs: 'चिड़ी' };
  var HI_RANK = { J: 'गुलाम', Q: 'बेगम', K: 'बादशाह', A: 'इक्का' };
  var hi = build({
    tok: {
      'Team A': 'टीम A', 'Team B': 'टीम B', 'You': 'आप', 'Spades': HI_SUIT.Spades, 'Hearts': HI_SUIT.Hearts, 'Diamonds': HI_SUIT.Diamonds, 'Clubs': HI_SUIT.Clubs,
      'Easy': 'आसान', 'Medium': 'मध्यम', 'Hard': 'कठिन', 'Expert': 'विशेषज्ञ', 'no points': 'कोई अंक नहीं'
    },
    rank: HI_RANK,
    card: function (r, s) { return HI_SUIT[s] + ' का ' + (HI_RANK[r] || r); },
    exact: {
      'About': 'परिचय', 'About STRATOS 29': 'STRATOS 29 के बारे में', 'Think Smart. Bid Bold. Win 29.': 'सोचो समझदारी से। बोली लगाओ हिम्मत से। जीतो 29।',
      'Full guide': 'पूरी गाइड', 'Privacy policy': 'गोपनीयता नीति', 'Terms': 'शर्तें', 'Statistics': 'आँकड़े', 'Stats': 'आँकड़े', 'Games': 'खेल', 'Wins': 'जीत', 'Losses': 'हार', 'Win rate': 'जीत दर',
      'Average bid': 'औसत बोली', 'Best made bid': 'सबसे ऊँची पूरी की गई बोली', 'Points won': 'जीते गए अंक', 'Daily streak': 'रोज़ की लगातार जीत', 'Vs AI:': 'AI के विरुद्ध:', 'Daily Deal:': 'डेली डील:',
      'Best streak:': 'सबसे लंबी लगातार जीत:', 'Recent games': 'हाल के खेल', 'No finished games yet.': 'अभी कोई पूरा खेल नहीं।', 'Stats are kept on this device. Practice games are not counted.': 'आँकड़े इसी डिवाइस पर रहते हैं। प्रैक्टिस गेम गिने नहीं जाते।',
      'Played': 'खेले', 'Win / loss': 'जीत / हार', 'Won': 'जीते', 'Lost': 'हारे',
      'Learn to Play': 'खेलना सीखें', 'Learn to play': 'खेलना सीखें', 'Learn to Play 29': '29 खेलना सीखें', 'Watch Demo': 'डेमो देखें', 'Watch demo': 'डेमो देखें', 'Rules': 'नियम', 'Settings': 'सेटिंग्स',
      'Interactive tutorial · or watch a full demo round': 'इंटरैक्टिव ट्यूटोरियल · या पूरा डेमो राउंड देखें', 'Tutorial': 'ट्यूटोरियल',
      'INDIA’S CLASSIC TRICK-TAKING GAME': 'भारत का क्लासिक ट्रिक-टेकिंग खेल', 'Bid high. Read the table. Take 29.': 'ऊँची बोली लगाओ। मेज़ को पढ़ो। 29 जीतो।',
      'Partner up, call trumps and outplay three opponents across eight tricks.': 'साथी के साथ जोड़ी बनाओ, तुरुप चुनो और आठ चालों में तीन विरोधियों को मात दो।',
      'AI difficulty': 'AI कठिनाई', 'Easy': 'आसान', 'Medium': 'मध्यम', 'Hard': 'कठिन', 'Expert': 'विशेषज्ञ', 'Play Now': 'अभी खेलें', 'Practice': 'प्रैक्टिस', 'Daily Deal': 'डेली डील',
      'Same cards for everyone': 'सबके लिए एक जैसे पत्ते', 'Done ✓': 'पूरा ✓', 'Played ': 'खेला', 'Level 1': 'लेवल 1',
      'Play with Friends': 'दोस्तों के साथ खेलें', 'Create a room and share the code · up to 4 players': 'रूम बनाएँ और कोड साझा करें · 4 खिलाड़ियों तक', 'Join a Room': 'रूम में जुड़ें', 'Enter the room code a friend sent you': 'दोस्त का भेजा रूम कोड डालें',
      'Friends': 'दोस्त', 'Create room': 'रूम बनाएँ', 'Join room': 'रूम में जुड़ें', 'Use a code': 'कोड से जुड़ें',
      'Free to play': 'खेलना मुफ़्त', 'No real money': 'असली पैसा नहीं', 'How-to-play guide': 'खेलने की गाइड', 'Full how-to-play guide': 'खेलने की पूरी गाइड', 'A Stratos Technologies game': 'Stratos Technologies का खेल',
      'Full screen': 'फ़ुल स्क्रीन', '⛶ Full screen': '⛶ फ़ुल स्क्रीन', 'Exit full screen': 'फ़ुल स्क्रीन बंद करें',
      'Rookie': 'नौसिखिया', 'Card Player': 'ताश खिलाड़ी', 'Table Strategist': 'मेज़ रणनीतिकार', 'Bid Master': 'बोली उस्ताद', 'Legend': 'दिग्गज',
      'Saved automatically': 'अपने आप सेव होता है', 'Sound & motion': 'आवाज़ और गति', 'Table & cards': 'मेज़ और पत्ते', 'Gameplay': 'गेमप्ले', 'House rules': 'घरेलू नियम',
      'Sound effects': 'ध्वनि प्रभाव', 'Deal, play, trick won — always soft': 'बाँटना, चलना, चाल जीतना — हमेशा हल्की आवाज़', 'Music': 'संगीत', 'Gentle background pad': 'हल्का पृष्ठभूमि संगीत',
      'Animation speed': 'एनिमेशन की गति', 'Off': 'बंद', 'Normal': 'सामान्य', 'Fast': 'तेज़', 'Animations also switch off if your device asks for reduced motion.': 'अगर आपका डिवाइस कम गति माँगे तो एनिमेशन अपने आप बंद हो जाते हैं।',
      'Table': 'मेज़', 'Card back · Stratos logo': 'पत्ते का पिछला भाग · Stratos लोगो', 'Card face': 'पत्ते का चेहरा', 'Classic': 'क्लासिक', 'Red and black suits': 'लाल और काले सूट', 'Four colour': 'चार रंग', 'Each suit its own colour': 'हर सूट का अपना रंग',
      'Large print': 'बड़े अक्षर', 'Bigger rank letters': 'बड़े अक्षरों वाले पत्ते', 'Free': 'मुफ़्त', 'Emerald Felt': 'पन्ना हरा फ़ेल्ट', 'Royal Blue': 'रॉयल नीला', 'Burgundy Velvet': 'बरगंडी मखमल', 'Midnight Carbon': 'मिडनाइट कार्बन', 'Teak Wood': 'सागौन की लकड़ी', 'Rangoli Festive': 'रंगोली त्योहार',
      'Emerald': 'पन्ना', 'Purple': 'बैंगनी', 'Ocean': 'समुद्री', 'Ember': 'अंगारा', 'Ivory': 'हाथीदाँत',
      'Your name': 'आपका नाम', 'Game speed': 'खेल की गति', 'Relaxed': 'आराम से', 'Quick': 'जल्दी', 'Auto-play last card': 'आख़िरी पत्ता अपने आप चलें', 'When only one legal card remains': 'जब सिर्फ़ एक वैध पत्ता बचे',
      'Show legal-move hints': 'वैध चाल के संकेत दिखाएँ', 'Dim cards you can’t play': 'जो पत्ते खेल नहीं सकते उन्हें धुँधला करें',
      'STRATOS standard ruleset · regional variants are optional. Applies from the next game.': 'STRATOS मानक नियम · क्षेत्रीय बदलाव वैकल्पिक हैं। अगले खेल से लागू।',
      'Hidden trump': 'छिपा तुरुप', 'Trump stays secret until revealed': 'तुरुप खुलने तक गुप्त रहता है', 'Double & re-double': 'डबल और री-डबल', 'Opponents can double the stakes': 'विरोधी दांव दोगुना कर सकते हैं',
      'Pair (marriage)': 'जोड़ी (शादी)', 'K + Q of trump moves the bid by 4': 'तुरुप का K + Q बोली को 4 से बदल देता है',
      'If everyone passes: the next dealer redeals. Single hand is not part of this version.': 'अगर सब पास करें: अगला बाँटने वाला दोबारा बाँटता है। इस संस्करण में सिंगल हैंड नहीं है।',
      'Language / भाषा / ভাষা': 'Language / भाषा / ভাষা',
      'Back': 'पीछे', 'Next': 'आगे', 'Close': 'बंद करें', 'Done': 'पूरा', 'Got it': 'समझ गया', 'HINT': 'संकेत', 'Back to lobby': 'लॉबी में लौटें', 'Next round': 'अगला राउंड', 'Play again': 'फिर खेलें',
      'Leave': 'छोड़ें', 'Leave this game?': 'यह खेल छोड़ें?', 'Your progress in this game will be lost.': 'इस खेल की प्रगति खो जाएगी।', 'Keep playing': 'खेलते रहें', 'Stop': 'रोकें',
      'Your bid': 'आपकी बोली', 'Highest:': 'सबसे ऊँची:', 'No bid yet': 'अभी कोई बोली नहीं', 'Pass': 'पास', 'Bid history': 'बोली का इतिहास', 'You bid first': 'पहले आप बोली लगाएँगे', 'Passed': 'पास किया', 'Bid': 'बोली',
      'Remaining 4 cards are dealt after bidding': 'बोली के बाद बाकी 4 पत्ते बाँटे जाएँगे', 'Thinking…': 'सोच रहे हैं…', 'Choosing trump…': 'तुरुप चुन रहे हैं…', 'Deciding…': 'फ़ैसला कर रहे हैं…',
      'Bidding · no bid yet': 'बोली · अभी कोई बोली नहीं', 'Your lead': 'आपकी पहली चाल', 'Your turn · lead any card': 'आपकी बारी · कोई भी पत्ता चलें', 'Pick the trump suit': 'तुरुप सूट चुनें', 'Choose your trump': 'अपना तुरुप चुनें',
      'YOU ARE THE DECLARER': 'आप बोलीदाता हैं', 'Choose your trump suit': 'अपना तुरुप सूट चुनें', 'Keep trump hidden': 'तुरुप छिपाकर रखें', 'Opponents learn it only when someone who can’t follow suit asks': 'विरोधी तभी जान पाते हैं जब सूट न होने पर कोई उसे माँगे',
      'Team A must collect': 'टीम A को जुटाने होंगे', 'points': 'अंक', 'DOUBLE THE STAKES?': 'दांव दोगुना करें?', 'YOU WERE DOUBLED': 'आपको डबल किया गया', 'Re-double?': 'री-डबल करें?', 'Double?': 'डबल?', 'Double or play on?': 'डबल करें या खेलें?',
      'No thanks': 'नहीं, धन्यवाद', 'Double ×2': 'डबल ×2', 'No, keep ×2': 'नहीं, ×2 ही रहने दें', 'Re-double ×4': 'री-डबल ×4', 'Re-doubled! ×4': 'री-डबल! ×4',
      'You can see all 8 of your cards. Doubling makes the round worth': 'आप अपने सभी 8 पत्ते देख सकते हैं। डबल करने पर राउंड की कीमत हो जाती है', '2 game points': '2 गेम पॉइंट', '— for them if they make it, for you if they fall short.': '— उनके लिए अगर वे बोली पूरी करें, आपके लिए अगर वे चूक जाएँ।',
      ', win or lose.': ', जीत हो या हार।', '4 game points': '4 गेम पॉइंट',
      'Trump': 'तुरुप', 'Trump is hidden': 'तुरुप छिपा है', 'Hidden': 'छिपा', 'revealed': 'खुल गया', 'hidden (only you know)': 'छिपा (सिर्फ़ आपको पता है)', 'Round points': 'राउंड के अंक', 'Game score': 'गेम स्कोर', 'Trump is': 'तुरुप है',
      'Hint': 'संकेत', 'Last trick': 'पिछली चाल', 'Last': 'पिछली', 'Declare pair': 'जोड़ी घोषित करें', 'Pair': 'जोड़ी', 'Ask trump': 'तुरुप माँगें', 'Play card': 'पत्ता चलें', 'Trick': 'चाल',
      'Everyone passed — redeal': 'सबने पास किया — दोबारा बाँटेंगे', 'Not playable': 'यह पत्ता नहीं चल सकते', 'Next trick…': 'अगली चाल…',
      'Demo: Expert AI plays all four seats': 'डेमो: विशेषज्ञ AI चारों सीटों पर खेलता है', 'DEMO': 'डेमो', 'DEMO ROUND COMPLETE': 'डेमो राउंड पूरा', 'Watch four Expert players. Each sees only their own cards.': 'चार विशेषज्ञ खिलाड़ियों को देखें। हर कोई सिर्फ़ अपने पत्ते देखता है।', 'Watch again': 'फिर देखें', 'Play a real game': 'असली खेल खेलें',
      'Victory!': 'जीत!', 'Defeat': 'हार', 'Bid made!': 'बोली पूरी हुई!', 'Bid failed': 'बोली चूक गई', 'DAILY DEAL': 'डेली डील', 'Card points': 'पत्तों के अंक', 'Last trick ': 'आख़िरी चाल', 'Tricks won': 'जीती चालें', 'Round total': 'राउंड का कुल', 'Trick by trick': 'चाल दर चाल', 'Bidder': 'बोलीदाता',
      'Game score · first to 6': 'गेम स्कोर · पहले 6 तक', 'Practice this deal again': 'इस डील को फिर से आज़माएँ', 'Need': 'चाहिए',
      'Partner': 'साथी', 'Team A': 'टीम A', 'Team B': 'टीम B', 'AI': 'AI', 'Player': 'खिलाड़ी', 'host': 'होस्ट', 'Partner of host': 'होस्ट का साथी', 'Computer plays this seat': 'इस सीट पर कंप्यूटर खेलेगा',
      'Play online': 'ऑनलाइन खेलें', 'Play with up to': 'अधिकतम', '4 real players': '4 असली खिलाड़ियों के साथ खेलें', '. Partners sit opposite each other. Any empty seat is played by the computer and is marked AI.': '। साथी आमने-सामने बैठते हैं। खाली सीट पर कंप्यूटर खेलता है और उसे AI लिखा जाता है।',
      'Create a room': 'रूम बनाएँ', 'or join a friend’s room': 'या दोस्त के रूम में जुड़ें', 'Join': 'जुड़ें', 'Room': 'रूम', 'Room code': 'रूम कोड', 'Share invite': 'न्योता भेजें', 'Copied ✓': 'कॉपी हुआ ✓', 'Start game': 'खेल शुरू करें', 'Waiting for a friend to join…': 'दोस्त के जुड़ने का इंतज़ार…', 'Waiting for the host to start…': 'होस्ट के शुरू करने का इंतज़ार…', 'Waiting for the host…': 'होस्ट का इंतज़ार…', 'Leave room': 'रूम छोड़ें',
      'Online play uses a free public relay. Your cards are encrypted so only you can read them. Never type personal details here. The player who creates the room runs the game, so they need to keep the page open.': 'ऑनलाइन खेल एक मुफ़्त सार्वजनिक रिले इस्तेमाल करता है। आपके पत्ते एन्क्रिप्टेड हैं, इसलिए सिर्फ़ आप उन्हें पढ़ सकते हैं। यहाँ कभी निजी जानकारी न लिखें। रूम बनाने वाला खिलाड़ी खेल चलाता है, इसलिए उसे पेज खुला रखना होगा।',
      'You were in room': 'आप इस रूम में थे', '. Rejoin to get your seat back.': '। अपनी सीट वापस पाने के लिए दोबारा जुड़ें।', 'Rejoin room': 'रूम में फिर जुड़ें', 'Forget': 'भूल जाएँ', 'Opening a room…': 'रूम खोला जा रहा है…', 'Connecting…': 'जुड़ रहे हैं…', 'Looking for the room…': 'रूम ढूँढ रहे हैं…', 'Reconnecting…': 'दोबारा जुड़ रहे हैं…',
      'That code does not look right. Ask your friend to check it.': 'यह कोड सही नहीं लगता। दोस्त से जाँचने को कहें।', 'Room not found. Check the code, and ask your friend to keep the room open.': 'रूम नहीं मिला। कोड जाँचें और दोस्त से रूम खुला रखने को कहें।',
      'Could not reach the game relay. Check your internet and try again.': 'गेम रिले तक नहीं पहुँच सके। इंटरनेट जाँचें और फिर कोशिश करें।', 'Online play could not load. Check your internet and try again.': 'ऑनलाइन खेल लोड नहीं हो सका। इंटरनेट जाँचें और फिर कोशिश करें।',
      'Could not open a room. Check your internet and try again.': 'रूम नहीं खुल सका। इंटरनेट जाँचें और फिर कोशिश करें।', 'Online play needs a secure page (https). Open the game from stratos.games.': 'ऑनलाइन खेल के लिए सुरक्षित पेज (https) चाहिए। खेल stratos.games से खोलें।',
      'That game already started. Ask the host to make a new room.': 'वह खेल शुरू हो चुका है। होस्ट से नया रूम बनाने को कहें।', 'The room is full (4 players max).': 'रूम भर गया है (अधिकतम 4 खिलाड़ी)।', 'That room is no longer open.': 'वह रूम अब खुला नहीं है।', 'Could not restore your seat.': 'आपकी सीट वापस नहीं मिल सकी।',
      'Lost connection to the host.': 'होस्ट से कनेक्शन टूट गया।', 'The host closed the room.': 'होस्ट ने रूम बंद कर दिया।', 'Time is up: the computer played for you': 'समय समाप्त: आपके लिए कंप्यूटर ने खेला', 'Settings are available from the lobby': 'सेटिंग्स लॉबी से उपलब्ध हैं', 'House rules apply from the next game': 'घरेलू नियम अगले खेल से लागू होंगे',
      'bid': 'बोली', 'Hearts': HI_SUIT.Hearts, 'Spades': HI_SUIT.Spades, 'Diamonds': HI_SUIT.Diamonds, 'Clubs': HI_SUIT.Clubs,
      'Welcome to 29': '29 में स्वागत है', 'The goal': 'लक्ष्य', 'Playing tricks': 'चालें खेलना', 'Quick quiz': 'छोटी परीक्षा', 'You are ready!': 'आप तैयार हैं!',
      'Start a practice game': 'प्रैक्टिस गेम शुरू करें', 'Watch a demo round first': 'पहले डेमो राउंड देखें', 'Read the full guide': 'पूरी गाइड पढ़ें',
      'Bidding: your bid is the number of the 29 points your team promises to win. Jack = 3, Nine = 2, Ace = 1, Ten = 1. Strong Jacks and Nines in one suit mean you can bid higher.': 'बोली: आपकी बोली उन 29 अंकों की संख्या है जो आपकी टीम जीतने का वादा करती है। गुलाम = 3, नौ = 2, इक्का = 1, दस = 1। एक सूट में मज़बूत गुलाम और नौ हों तो ऊँची बोली लगा सकते हैं।',
      'Trump: the suit you pick beats every other suit. Choose the suit where you hold the most strength. Hidden trump stays secret until someone who cannot follow suit asks.': 'तुरुप: जो सूट आप चुनते हैं वह बाकी हर सूट को मात देता है। वह सूट चुनें जिसमें आपके पास सबसे ज़्यादा ताक़त हो। छिपा तुरुप तब तक गुप्त रहता है जब तक सूट न होने वाला कोई खिलाड़ी उसे न माँगे।',
      'Follow the suit that was led if you can. The highest card of that suit wins the trick, unless a trump is played. Dimmed cards cannot be played.': 'अगर हो सके तो चला गया सूट ही खेलें। उस सूट का सबसे ऊँचा पत्ता चाल जीतता है, जब तक तुरुप न खेला गया हो। धुँधले पत्ते नहीं चल सकते।',
      'You have no card of the led suit. You may play anything, or ask for the trump suit first. If you ask, you must play a trump if you have one.': 'आपके पास चला गया सूट नहीं है। आप कुछ भी खेल सकते हैं, या पहले तुरुप सूट माँग सकते हैं। माँगने पर अगर आपके पास तुरुप है तो वही खेलना होगा।',
      'Pair: you hold the King and Queen of trump. Once your team has won a trick you can declare it. For the bidding team it lowers the target by 4, for the other team it raises it by 4.': 'जोड़ी: आपके पास तुरुप का बादशाह और बेगम है। आपकी टीम के एक चाल जीतने के बाद आप इसे घोषित कर सकते हैं। बोली वाली टीम के लिए लक्ष्य 4 घटता है, दूसरी टीम के लिए 4 बढ़ता है।',
      'Double: the opposing team can double the stakes after seeing all 8 cards. The bidders may re-double. A made bid then scores 2 or 4 game points, and so does a failed one.': 'डबल: विरोधी टीम सभी 8 पत्ते देखकर दांव दोगुना कर सकती है। बोली वाले री-डबल कर सकते हैं। तब पूरी हुई बोली 2 या 4 गेम पॉइंट देती है, और चूकी हुई बोली भी उतने ही कटवाती है।',
      'The team that wins the last trick gets 1 bonus point, so all 29 points are in play.': 'आख़िरी चाल जीतने वाली टीम को 1 बोनस अंक मिलता है, इसलिए सारे 29 अंक दाँव पर होते हैं।'
    },
    pats: function (P, X) {
      return [
        P(/^You win the trick · \+(\d+) points?$/, 'आप चाल जीते · +$1 अंक'),
        P(/^([^·]+) wins the trick · \+(\d+) points?$/, '$1 ने चाल जीती · +$2 अंक'),
        P(/^([^·]+) wins the trick and collects (\d+) points?\. The winner leads the next trick\.$/, '$1 ने चाल जीती और $2 अंक बटोरे। जीतने वाला अगली चाल चलता है।'),
        P(/^([^·]+) won · \+(\d+) points$/, '$1 जीते · +$2 अंक'),
        [/^([^·]+) plays the ([^·]+?)\.(?: The suit led is (\w+): everyone who can must follow it\.)?$/, function (m) { return X(m[1]) + ' ने ' + X(m[2]) + ' खेला।' + (m[3] ? ' चला गया सूट ' + X(m[3]) + ' है: जो खिलाड़ी खेल सके उसे वही सूट खेलना होगा।' : ''); }],
        P(/^([^·]+) bids (\d+) — a promise that their team will win at least (\d+) of the 29 points\.$/, '$1 ने $2 की बोली लगाई — वादा कि उनकी टीम 29 में से कम से कम $3 अंक जीतेगी।'),
        P(/^([^·]+) passes\. A pass is final\.$/, '$1 ने पास किया। पास अंतिम होता है।'),
        P(/^([^·]+) won the bidding at (\d+) and chose (\w+) as trump\. Trump cards beat every other suit\.$/, '$1 ने $2 पर बोली जीती और $3 को तुरुप चुना। तुरुप के पत्ते बाकी हर सूट को मात देते हैं।'),
        P(/^([^·]+) bid (\d+)$/, '$1 ने $2 की बोली लगाई'),
        P(/^([^·]+) is choosing trump…$/, '$1 तुरुप चुन रहे हैं…'),
        P(/^Waiting for ([^·]+)$/, '$1 का इंतज़ार'),
        P(/^([^·]+) leads$/, '$1 से शुरुआत'),
        P(/^([^·]+) is winning · lead ([^·]+)$/, '$1 आगे हैं · सूट $2'),
        P(/^You are winning · lead ([^·]+)$/, 'आप आगे हैं · सूट $1'),
        P(/^Your turn · follow ([^·]+)$/, 'आपकी बारी · $1 खेलें'),
        P(/^Your turn · no ([^·]+) — play anything$/, 'आपकी बारी · $1 नहीं है — कुछ भी खेलें'),
        P(/^Bidding · highest (\d+) by ([^·]+)$/, 'बोली · सबसे ऊँची $1 ($2)'),
        P(/^(\d+) by ([^·]+)$/, '$2 की $1'),
        P(/^you must bid (\d+) or more$/, 'आपको $1 या ज़्यादा की बोली लगानी होगी'),
        P(/^min 16, max 29$/, 'न्यूनतम 16, अधिकतम 29'),
        P(/^Bid (\d+)$/, '$1 की बोली'),
        P(/^Bidder (\d+)$/, 'बोलीदाता $1'),
        P(/^(\d+) cards?$/, '$1 पत्ते'),
        P(/^(\d+) pts?$/, '$1 अंक'),
        P(/^Hint \((\d+)\)$/, 'संकेत ($1)'),
        [/^(Team [AB])(?: \(needs (\d+)\))?$/, function (m) { return X(m[1]) + (m[2] ? ' (को चाहिए ' + m[2] + ')' : ''); }],
        [/^(Team [AB]) bid (\d+)(?: \(target (\d+) after pair\))? with trump (\S+) (\w+) and collected (\d+) points$/, function (m) { return X(m[1]) + ' ने ' + m[2] + (m[3] ? ' (जोड़ी के बाद लक्ष्य ' + m[3] + ')' : '') + ' की बोली लगाई, तुरुप ' + m[4] + ' ' + X(m[5]) + ' और ' + m[6] + ' अंक जुटाए'; }],
        P(/^stakes ×(\d+)$/, 'दांव ×$1'),
        P(/^ROUND (\d+) COMPLETE$/, 'राउंड $1 पूरा'),
        P(/^first to (\d+)$/, 'पहले $1 तक'),
        P(/^([+-]\d+) to (Team [AB])$/, '$2 को $1'),
        P(/^(\d+) of 8$/, '8 में से $1'),
        P(/^Level (\d+)$/, 'लेवल $1'),
        P(/^Confirm (\w+) as trump$/, '$1 को तुरुप बनाएँ'),
        P(/^Trump (\S+) (\w+)$/, 'तुरुप $1 $2'),
        P(/^([^·]+) \(you\)$/, '$1 (आप)'),
        P(/^([^·]+) \(away\)$/, '$1 (दूर)'),
        P(/^You chose trump ([^·]+)$/, 'आपने तुरुप चुना $1'),
        P(/^Pair declared by ([^·]+)!$/, '$1 ने जोड़ी घोषित की!'),
        P(/^Target is now (\d+)$/, 'अब लक्ष्य $1 है'),
        P(/^([^·]+) asks for trump$/, '$1 ने तुरुप माँगा'),
        P(/^([^·]+) doubled! ×2$/, '$1 ने डबल किया! ×2'),
        P(/^([^·]+) doubled\. Re-doubling makes the round worth$/, '$1 ने डबल किया। री-डबल करने पर राउंड की कीमत हो जाती है'),
        P(/^You must follow (\w+)$/, 'आपको $1 खेलना होगा'),
        P(/^([^·]+) left\. A computer takes over\.$/, '$1 चले गए। कंप्यूटर उनकी जगह लेता है।'),
        P(/^([^·]+) is back$/, '$1 वापस आ गए'),
        P(/^AI level is now (\w+)$/, 'AI स्तर अब $1 है'),
        P(/^(\d+)s$/, '$1 सेकंड'),
        P(/^Lead the ([^·]+): a strong card that is likely to win this trick\.$/, '$1 से शुरुआत करें: यह मज़बूत पत्ता है और चाल जीतने की संभावना ज़्यादा है।'),
        P(/^Lead the ([^·]+): a low lead shows what the others hold without risking points\.$/, '$1 से शुरुआत करें: छोटा पत्ता चलने से अंक जोखिम में डाले बिना पता चलता है कि बाकियों के पास क्या है।'),
        P(/^Cut with trump to win this trick \((\d+) points? in it so far\)\.$/, 'तुरुप से काटकर यह चाल जीतें (अब तक इसमें $1 अंक हैं)।'),
        P(/^Win this trick with the ([^·]+) \((\d+) points? in it so far\)\.$/, '$1 से यह चाल जीतें (अब तक इसमें $2 अंक हैं)।'),
        P(/^Your partner is winning, so add the ([^·]+) \((\d+) points?\) to their trick\.$/, 'आपका साथी जीत रहा है, इसलिए $1 ($2 अंक) उनकी चाल में जोड़ें।'),
        P(/^Your partner is already winning, so a low card keeps your good cards for later\.$/, 'आपका साथी पहले से जीत रहा है, इसलिए छोटा पत्ता चलें और अच्छे पत्ते बाद के लिए बचाएँ।'),
        [/^The ([^·]+) will not win this trick, but it gives away (?:(\d+) points?|no points) and keeps your stronger cards for later\.$/, function (m) { return X(m[1]) + ' यह चाल नहीं जीतेगा, पर इससे ' + (m[2] ? m[2] + ' अंक' : 'कोई अंक नहीं') + ' जाते हैं और आपके मज़बूत पत्ते बाद के लिए बचे रहते हैं।'; }],
        P(/^Coach: a hand like yours can usually bid up to about (\d+)\.$/, 'कोच: आप जैसे पत्तों पर आमतौर पर लगभग $1 तक की बोली लगाई जा सकती है।'),
        P(/^You are winning easily on (\w+)\. Ready for a tougher table\?$/, 'आप AI के $1 स्तर पर आसानी से जीत रहे हैं। क्या अब कठिन मेज़ के लिए तैयार हैं?'),
        P(/^Try (\w+)$/, '$1 आज़माएँ'),
        P(/^Empty seats are played by the computer \((\w+) level\)\. You can start as soon as one friend has joined\.$/, 'खाली सीटों पर कंप्यूटर खेलेगा ($1 स्तर)। एक दोस्त के जुड़ते ही आप शुरू कर सकते हैं।'),
        P(/^Your bid · Strongest suit (\S+) \((\d+) cards?, (\d+) pts?\)$/, 'आपकी बोली · सबसे मज़बूत सूट $1 ($2 पत्ते, $3 अंक)'),
        P(/^Strongest suit (\S+) \((\d+) cards?, (\d+) pts?\)$/, 'सबसे मज़बूत सूट $1 ($2 पत्ते, $3 अंक)'),
        P(/^Team A must collect (\d+) of 29 points$/, 'टीम A को 29 में से $1 अंक जुटाने होंगे'),
        P(/^(\d+) of 29$/, '29 में से $1'),
        P(/^Learn to play · (\d+) \/ (\d+)$/, 'खेलना सीखें · $1 / $2'),
        P(/^How to play · (\d+) \/ (\d+)$/, 'कैसे खेलें · $1 / $2'),
        P(/^Daily streak: (\d+) days?.*$/, '🔥 लगातार दिन: $1')
      ];
    },
    long: {}
  });


  /* ============================ BENGALI ============================ */
  var BN_SUIT = { Spades: 'ইস্কাপন', Hearts: 'হরতন', Diamonds: 'রুইতন', Clubs: 'চিড়িতন' };
  var BN_SUITG = { Spades: 'ইস্কাপনের', Hearts: 'হরতনের', Diamonds: 'রুইতনের', Clubs: 'চিড়িতনের' };
  var BN_RANK = { J: 'গোলাম', Q: 'বিবি', K: 'রাজা', A: 'টেক্কা' };
  var bn = build({
    tok: {
      'Team A': 'টিম A', 'Team B': 'টিম B', 'You': 'আপনি', 'Spades': BN_SUIT.Spades, 'Hearts': BN_SUIT.Hearts, 'Diamonds': BN_SUIT.Diamonds, 'Clubs': BN_SUIT.Clubs,
      'Easy': 'সহজ', 'Medium': 'মাঝারি', 'Hard': 'কঠিন', 'Expert': 'বিশেষজ্ঞ', 'no points': 'কোনো পয়েন্ট নয়'
    },
    rank: BN_RANK,
    card: function (r, s) { return BN_SUITG[s] + ' ' + (BN_RANK[r] || r); },
    exact: {
      'About': 'পরিচিতি', 'About STRATOS 29': 'STRATOS 29 সম্পর্কে', 'Think Smart. Bid Bold. Win 29.': 'বুদ্ধি খাটাও। সাহসে ডাক দাও। জেতো 29।',
      'Full guide': 'পূর্ণ গাইড', 'Privacy policy': 'গোপনীয়তা নীতি', 'Terms': 'শর্তাবলি', 'Statistics': 'পরিসংখ্যান', 'Stats': 'পরিসংখ্যান', 'Games': 'খেলা', 'Wins': 'জয়', 'Losses': 'হার', 'Win rate': 'জয়ের হার',
      'Average bid': 'গড় ডাক', 'Best made bid': 'সবচেয়ে বড় পূরণ করা ডাক', 'Points won': 'জেতা পয়েন্ট', 'Daily streak': 'প্রতিদিনের ধারা', 'Vs AI:': 'AI-এর বিরুদ্ধে:', 'Daily Deal:': 'ডেইলি ডিল:',
      'Best streak:': 'সেরা ধারা:', 'Recent games': 'সাম্প্রতিক খেলা', 'No finished games yet.': 'এখনও কোনো খেলা শেষ হয়নি।', 'Stats are kept on this device. Practice games are not counted.': 'পরিসংখ্যান এই ডিভাইসেই থাকে। প্র্যাকটিস গেম গোনা হয় না।',
      'Played': 'খেলেছেন', 'Win / loss': 'জয় / হার', 'Won': 'জিতেছেন', 'Lost': 'হেরেছেন',
      'Learn to Play': 'খেলা শিখুন', 'Learn to play': 'খেলা শিখুন', 'Learn to Play 29': '29 খেলা শিখুন', 'Watch Demo': 'ডেমো দেখুন', 'Watch demo': 'ডেমো দেখুন', 'Rules': 'নিয়ম', 'Settings': 'সেটিংস',
      'Interactive tutorial · or watch a full demo round': 'ইন্টারঅ্যাকটিভ টিউটোরিয়াল · বা পুরো ডেমো রাউন্ড দেখুন', 'Tutorial': 'টিউটোরিয়াল',
      'INDIA’S CLASSIC TRICK-TAKING GAME': 'ভারতের ক্লাসিক ট্রিক-টেকিং তাসখেলা', 'Bid high. Read the table. Take 29.': 'উঁচু ডাক দাও। টেবিল পড়ো। জেতো 29।',
      'Partner up, call trumps and outplay three opponents across eight tricks.': 'সঙ্গীর সাথে জুটি বাঁধো, তুরুপ বেছে নাও আর আট চালে তিন প্রতিপক্ষকে হারাও।',
      'AI difficulty': 'AI-এর কঠিনতা', 'Easy': 'সহজ', 'Medium': 'মাঝারি', 'Hard': 'কঠিন', 'Expert': 'বিশেষজ্ঞ', 'Play Now': 'এখনই খেলুন', 'Practice': 'প্র্যাকটিস', 'Daily Deal': 'ডেইলি ডিল',
      'Same cards for everyone': 'সবার জন্য একই তাস', 'Done ✓': 'শেষ ✓', 'Level 1': 'লেভেল 1',
      'Play with Friends': 'বন্ধুদের সাথে খেলুন', 'Create a room and share the code · up to 4 players': 'রুম বানান আর কোড শেয়ার করুন · ৪ জন পর্যন্ত', 'Join a Room': 'রুমে যোগ দিন', 'Enter the room code a friend sent you': 'বন্ধুর পাঠানো রুম কোড দিন',
      'Friends': 'বন্ধু', 'Create room': 'রুম বানান', 'Join room': 'রুমে যোগ দিন', 'Use a code': 'কোড দিয়ে যোগ দিন',
      'Free to play': 'খেলা বিনামূল্যে', 'No real money': 'আসল টাকা নেই', 'How-to-play guide': 'খেলার গাইড', 'Full how-to-play guide': 'খেলার পূর্ণ গাইড', 'A Stratos Technologies game': 'Stratos Technologies-এর খেলা',
      'Full screen': 'ফুল স্ক্রিন', '⛶ Full screen': '⛶ ফুল স্ক্রিন', 'Exit full screen': 'ফুল স্ক্রিন বন্ধ করুন',
      'Rookie': 'নতুন', 'Card Player': 'তাস খেলোয়াড়', 'Table Strategist': 'টেবিল কৌশলী', 'Bid Master': 'ডাক-ওস্তাদ', 'Legend': 'কিংবদন্তি',
      'Saved automatically': 'নিজে থেকেই সেভ হয়', 'Sound & motion': 'শব্দ ও গতি', 'Table & cards': 'টেবিল ও তাস', 'Gameplay': 'গেমপ্লে', 'House rules': 'ঘরোয়া নিয়ম',
      'Sound effects': 'শব্দের প্রভাব', 'Deal, play, trick won — always soft': 'তাস বাঁটা, চাল দেওয়া, চাল জেতা — সবসময় নরম শব্দ', 'Music': 'সংগীত', 'Gentle background pad': 'মৃদু ব্যাকগ্রাউন্ড সুর',
      'Animation speed': 'অ্যানিমেশনের গতি', 'Off': 'বন্ধ', 'Normal': 'স্বাভাবিক', 'Fast': 'দ্রুত', 'Animations also switch off if your device asks for reduced motion.': 'ডিভাইস কম গতি চাইলে অ্যানিমেশন নিজে থেকেই বন্ধ হয়ে যায়।',
      'Table': 'টেবিল', 'Card back · Stratos logo': 'তাসের পিছন · Stratos লোগো', 'Card face': 'তাসের মুখ', 'Classic': 'ক্লাসিক', 'Red and black suits': 'লাল ও কালো সুট', 'Four colour': 'চার রঙ', 'Each suit its own colour': 'প্রতিটি সুটের নিজস্ব রঙ',
      'Large print': 'বড় অক্ষর', 'Bigger rank letters': 'বড় অক্ষরের তাস', 'Free': 'বিনামূল্যে', 'Emerald Felt': 'পান্না সবুজ ফেল্ট', 'Royal Blue': 'রয়্যাল নীল', 'Burgundy Velvet': 'বারগান্ডি মখমল', 'Midnight Carbon': 'মিডনাইট কার্বন', 'Teak Wood': 'সেগুন কাঠ', 'Rangoli Festive': 'রঙ্গোলি উৎসব',
      'Emerald': 'পান্না', 'Purple': 'বেগুনি', 'Ocean': 'সমুদ্র', 'Ember': 'অঙ্গার', 'Ivory': 'হাতির দাঁত',
      'Your name': 'আপনার নাম', 'Game speed': 'খেলার গতি', 'Relaxed': 'ধীরেসুস্থে', 'Quick': 'দ্রুত', 'Auto-play last card': 'শেষ তাস নিজে থেকে চলুক', 'When only one legal card remains': 'যখন মাত্র একটি বৈধ তাস থাকে',
      'Show legal-move hints': 'বৈধ চালের ইঙ্গিত দেখান', 'Dim cards you can’t play': 'যে তাস চালা যাবে না তা ঝাপসা করুন',
      'STRATOS standard ruleset · regional variants are optional. Applies from the next game.': 'STRATOS-এর স্ট্যান্ডার্ড নিয়ম · আঞ্চলিক রকমফের ঐচ্ছিক। পরের খেলা থেকে কার্যকর।',
      'Hidden trump': 'গোপন তুরুপ', 'Trump stays secret until revealed': 'প্রকাশ না হওয়া পর্যন্ত তুরুপ গোপন থাকে', 'Double & re-double': 'ডাবল ও রি-ডাবল', 'Opponents can double the stakes': 'প্রতিপক্ষ বাজি দ্বিগুণ করতে পারে',
      'Pair (marriage)': 'জোড়া (বিয়ে)', 'K + Q of trump moves the bid by 4': 'তুরুপের K + Q ডাককে ৪ বদলে দেয়',
      'If everyone passes: the next dealer redeals. Single hand is not part of this version.': 'সবাই পাস করলে: পরের ডিলার আবার তাস বাঁটেন। এই সংস্করণে সিঙ্গল হ্যান্ড নেই।',
      'Language / भाषा / ভাষা': 'Language / भाषा / ভাষা',
      'Back': 'পিছনে', 'Next': 'পরের', 'Close': 'বন্ধ করুন', 'Done': 'শেষ', 'Got it': 'বুঝেছি', 'HINT': 'ইঙ্গিত', 'Back to lobby': 'লবিতে ফিরুন', 'Next round': 'পরের রাউন্ড', 'Play again': 'আবার খেলুন',
      'Leave': 'ছেড়ে যান', 'Leave this game?': 'এই খেলা ছাড়বেন?', 'Your progress in this game will be lost.': 'এই খেলার অগ্রগতি হারিয়ে যাবে।', 'Keep playing': 'খেলতে থাকুন', 'Stop': 'থামান',
      'Your bid': 'আপনার ডাক', 'Highest:': 'সর্বোচ্চ:', 'No bid yet': 'এখনও কোনো ডাক নেই', 'Pass': 'পাস', 'Bid history': 'ডাকের ইতিহাস', 'You bid first': 'আপনি প্রথমে ডাকবেন', 'Passed': 'পাস করেছেন', 'Bid': 'ডাক',
      'Remaining 4 cards are dealt after bidding': 'ডাকের পরে বাকি ৪টি তাস বাঁটা হবে', 'Thinking…': 'ভাবছেন…', 'Choosing trump…': 'তুরুপ বাছছেন…', 'Deciding…': 'সিদ্ধান্ত নিচ্ছেন…',
      'Bidding · no bid yet': 'ডাক · এখনও কোনো ডাক নেই', 'Your lead': 'আপনার প্রথম চাল', 'Your turn · lead any card': 'আপনার পালা · যে কোনো তাস দিন', 'Pick the trump suit': 'তুরুপের সুট বাছুন', 'Choose your trump': 'আপনার তুরুপ বাছুন',
      'YOU ARE THE DECLARER': 'আপনি ডাকদাতা', 'Choose your trump suit': 'আপনার তুরুপের সুট বাছুন', 'Keep trump hidden': 'তুরুপ গোপন রাখুন', 'Opponents learn it only when someone who can’t follow suit asks': 'যে সুট মেলাতে পারে না সে চাইলে তবেই প্রতিপক্ষ জানতে পারে',
      'Team A must collect': 'টিম A-কে তুলতে হবে', 'points': 'পয়েন্ট', 'DOUBLE THE STAKES?': 'বাজি দ্বিগুণ করবেন?', 'YOU WERE DOUBLED': 'আপনাকে ডাবল করা হয়েছে', 'Re-double?': 'রি-ডাবল করবেন?', 'Double?': 'ডাবল?', 'Double or play on?': 'ডাবল না কি খেলা চলবে?',
      'No thanks': 'না, ধন্যবাদ', 'Double ×2': 'ডাবল ×2', 'No, keep ×2': 'না, ×2-ই থাক', 'Re-double ×4': 'রি-ডাবল ×4', 'Re-doubled! ×4': 'রি-ডাবল! ×4',
      'You can see all 8 of your cards. Doubling makes the round worth': 'আপনি নিজের সব ৮টি তাস দেখতে পাচ্ছেন। ডাবল করলে রাউন্ডের মূল্য হয়', '2 game points': '২ গেম পয়েন্ট', '— for them if they make it, for you if they fall short.': '— ওরা ডাক পূরণ করলে ওদের জন্য, ব্যর্থ হলে আপনার জন্য।',
      ', win or lose.': ', জিতুন বা হারুন।', '4 game points': '৪ গেম পয়েন্ট',
      'Trump': 'তুরুপ', 'Trump is hidden': 'তুরুপ গোপন', 'Hidden': 'গোপন', 'revealed': 'প্রকাশিত', 'hidden (only you know)': 'গোপন (শুধু আপনি জানেন)', 'Round points': 'রাউন্ডের পয়েন্ট', 'Game score': 'গেম স্কোর', 'Trump is': 'তুরুপ হল',
      'Hint': 'ইঙ্গিত', 'Last trick': 'শেষ চাল', 'Last': 'শেষ', 'Declare pair': 'জোড়া ঘোষণা', 'Pair': 'জোড়া', 'Ask trump': 'তুরুপ চান', 'Play card': 'তাস দিন', 'Trick': 'চাল',
      'Everyone passed — redeal': 'সবাই পাস করেছে — আবার বাঁটা হবে', 'Not playable': 'এই তাস চালা যাবে না', 'Next trick…': 'পরের চাল…',
      'Demo: Expert AI plays all four seats': 'ডেমো: বিশেষজ্ঞ AI চারটি আসনেই খেলছে', 'DEMO': 'ডেমো', 'DEMO ROUND COMPLETE': 'ডেমো রাউন্ড শেষ', 'Watch four Expert players. Each sees only their own cards.': 'চারজন বিশেষজ্ঞ খেলোয়াড়কে দেখুন। প্রত্যেকে শুধু নিজের তাস দেখে।', 'Watch again': 'আবার দেখুন', 'Play a real game': 'আসল খেলা খেলুন',
      'Victory!': 'জয়!', 'Defeat': 'হার', 'Bid made!': 'ডাক পূর্ণ হয়েছে!', 'Bid failed': 'ডাক ব্যর্থ', 'DAILY DEAL': 'ডেইলি ডিল', 'Card points': 'তাসের পয়েন্ট', 'Tricks won': 'জেতা চাল', 'Round total': 'রাউন্ডের মোট', 'Trick by trick': 'চালে চালে', 'Bidder': 'ডাকদাতা',
      'Game score · first to 6': 'গেম স্কোর · প্রথম 6 পর্যন্ত', 'Practice this deal again': 'এই ডিল আবার অনুশীলন করুন', 'Need': 'দরকার',
      'Partner': 'সঙ্গী', 'Team A': 'টিম A', 'Team B': 'টিম B', 'AI': 'AI', 'Player': 'খেলোয়াড়', 'host': 'হোস্ট', 'Partner of host': 'হোস্টের সঙ্গী', 'Computer plays this seat': 'এই আসনে কম্পিউটার খেলবে',
      'Play online': 'অনলাইনে খেলুন', 'Play with up to': 'সর্বোচ্চ', '4 real players': '৪ জন আসল খেলোয়াড়ের সাথে খেলুন', '. Partners sit opposite each other. Any empty seat is played by the computer and is marked AI.': '। সঙ্গীরা মুখোমুখি বসে। ফাঁকা আসনে কম্পিউটার খেলে এবং সেটি AI লেখা থাকে।',
      'Create a room': 'রুম বানান', 'or join a friend’s room': 'বা বন্ধুর রুমে যোগ দিন', 'Join': 'যোগ দিন', 'Room': 'রুম', 'Room code': 'রুম কোড', 'Share invite': 'আমন্ত্রণ পাঠান', 'Copied ✓': 'কপি হয়েছে ✓', 'Start game': 'খেলা শুরু করুন', 'Waiting for a friend to join…': 'বন্ধুর যোগ দেওয়ার অপেক্ষা…', 'Waiting for the host to start…': 'হোস্টের শুরু করার অপেক্ষা…', 'Waiting for the host…': 'হোস্টের অপেক্ষা…', 'Leave room': 'রুম ছাড়ুন',
      'Online play uses a free public relay. Your cards are encrypted so only you can read them. Never type personal details here. The player who creates the room runs the game, so they need to keep the page open.': 'অনলাইন খেলা একটি বিনামূল্যের পাবলিক রিলে ব্যবহার করে। আপনার তাস এনক্রিপ্টেড, তাই শুধু আপনিই পড়তে পারবেন। এখানে কখনও ব্যক্তিগত তথ্য লিখবেন না। যিনি রুম বানান তিনিই খেলা চালান, তাই তাঁকে পেজ খোলা রাখতে হবে।',
      'You were in room': 'আপনি এই রুমে ছিলেন', '. Rejoin to get your seat back.': '। নিজের আসন ফিরে পেতে আবার যোগ দিন।', 'Rejoin room': 'আবার রুমে যোগ দিন', 'Forget': 'ভুলে যান', 'Opening a room…': 'রুম খোলা হচ্ছে…', 'Connecting…': 'সংযোগ হচ্ছে…', 'Looking for the room…': 'রুম খোঁজা হচ্ছে…', 'Reconnecting…': 'আবার সংযোগ হচ্ছে…',
      'That code does not look right. Ask your friend to check it.': 'এই কোডটি ঠিক মনে হচ্ছে না। বন্ধুকে দেখে নিতে বলুন।', 'Room not found. Check the code, and ask your friend to keep the room open.': 'রুম পাওয়া যায়নি। কোড দেখুন আর বন্ধুকে রুম খোলা রাখতে বলুন।',
      'Could not reach the game relay. Check your internet and try again.': 'গেম রিলেতে পৌঁছানো যায়নি। ইন্টারনেট দেখে আবার চেষ্টা করুন।', 'Online play could not load. Check your internet and try again.': 'অনলাইন খেলা লোড হয়নি। ইন্টারনেট দেখে আবার চেষ্টা করুন।',
      'Could not open a room. Check your internet and try again.': 'রুম খোলা যায়নি। ইন্টারনেট দেখে আবার চেষ্টা করুন।', 'Online play needs a secure page (https). Open the game from stratos.games.': 'অনলাইন খেলার জন্য নিরাপদ পেজ (https) দরকার। খেলাটি stratos.games থেকে খুলুন।',
      'That game already started. Ask the host to make a new room.': 'সেই খেলা শুরু হয়ে গেছে। হোস্টকে নতুন রুম বানাতে বলুন।', 'The room is full (4 players max).': 'রুম ভর্তি (সর্বোচ্চ ৪ জন)।', 'That room is no longer open.': 'সেই রুম আর খোলা নেই।', 'Could not restore your seat.': 'আপনার আসন ফিরিয়ে আনা যায়নি।',
      'Lost connection to the host.': 'হোস্টের সাথে সংযোগ হারিয়ে গেছে।', 'The host closed the room.': 'হোস্ট রুম বন্ধ করে দিয়েছেন।', 'Time is up: the computer played for you': 'সময় শেষ: আপনার হয়ে কম্পিউটার খেলেছে', 'Settings are available from the lobby': 'সেটিংস লবি থেকে পাওয়া যাবে', 'House rules apply from the next game': 'ঘরোয়া নিয়ম পরের খেলা থেকে কার্যকর হবে',
      'Hearts': BN_SUIT.Hearts, 'Spades': BN_SUIT.Spades, 'Diamonds': BN_SUIT.Diamonds, 'Clubs': BN_SUIT.Clubs,
      'Welcome to 29': '29-এ স্বাগতম', 'The goal': 'লক্ষ্য', 'Playing tricks': 'চাল খেলা', 'Quick quiz': 'ছোট্ট কুইজ', 'You are ready!': 'আপনি তৈরি!',
      'Start a practice game': 'প্র্যাকটিস গেম শুরু করুন', 'Watch a demo round first': 'আগে ডেমো রাউন্ড দেখুন', 'Read the full guide': 'পূর্ণ গাইড পড়ুন',
      'Bidding: your bid is the number of the 29 points your team promises to win. Jack = 3, Nine = 2, Ace = 1, Ten = 1. Strong Jacks and Nines in one suit mean you can bid higher.': 'ডাক: আপনার ডাক হল ২৯ পয়েন্টের মধ্যে আপনার টিম যতটা জেতার প্রতিশ্রুতি দেয়। গোলাম = 3, নয় = 2, টেক্কা = 1, দশ = 1। এক সুটে শক্ত গোলাম আর নয় থাকলে উঁচু ডাক দিতে পারেন।',
      'Trump: the suit you pick beats every other suit. Choose the suit where you hold the most strength. Hidden trump stays secret until someone who cannot follow suit asks.': 'তুরুপ: আপনার বাছা সুট বাকি সব সুটকে হারায়। যে সুটে আপনার জোর বেশি সেটি বাছুন। গোপন তুরুপ গোপনই থাকে, যতক্ষণ না সুট মেলাতে না পারা কেউ তা চায়।',
      'Follow the suit that was led if you can. The highest card of that suit wins the trick, unless a trump is played. Dimmed cards cannot be played.': 'পারলে যে সুটে চাল শুরু হয়েছে সেটিই দিন। সেই সুটের সবচেয়ে বড় তাস চাল জেতে, যদি না তুরুপ পড়ে। ঝাপসা তাস চালা যায় না।',
      'You have no card of the led suit. You may play anything, or ask for the trump suit first. If you ask, you must play a trump if you have one.': 'চালের সুটের কোনো তাস আপনার নেই। যা খুশি দিতে পারেন, অথবা আগে তুরুপের সুট চাইতে পারেন। চাইলে আপনার কাছে তুরুপ থাকলে সেটিই দিতে হবে।',
      'Pair: you hold the King and Queen of trump. Once your team has won a trick you can declare it. For the bidding team it lowers the target by 4, for the other team it raises it by 4.': 'জোড়া: আপনার কাছে তুরুপের রাজা ও বিবি আছে। আপনার টিম একটি চাল জেতার পর তা ঘোষণা করতে পারেন। ডাকদাতা টিমের লক্ষ্য ৪ কমে, অন্য টিমের জন্য ৪ বাড়ে।',
      'Double: the opposing team can double the stakes after seeing all 8 cards. The bidders may re-double. A made bid then scores 2 or 4 game points, and so does a failed one.': 'ডাবল: প্রতিপক্ষ টিম সব ৮টি তাস দেখে বাজি দ্বিগুণ করতে পারে। ডাকদাতারা রি-ডাবল করতে পারেন। তখন পূর্ণ ডাকে ২ বা ৪ গেম পয়েন্ট মেলে, ব্যর্থ হলে সমান কাটা যায়।',
      'The team that wins the last trick gets 1 bonus point, so all 29 points are in play.': 'শেষ চাল যে টিম জেতে সে ১ বোনাস পয়েন্ট পায়, তাই সব ২৯ পয়েন্টই খেলায় থাকে।'
    },
    pats: function (P, X) {
      return [
        P(/^You win the trick · \+(\d+) points?$/, 'আপনি চাল জিতলেন · +$1 পয়েন্ট'),
        P(/^([^·]+) wins the trick · \+(\d+) points?$/, '$1 চাল জিতলেন · +$2 পয়েন্ট'),
        P(/^([^·]+) wins the trick and collects (\d+) points?\. The winner leads the next trick\.$/, '$1 চাল জিতে $2 পয়েন্ট পেলেন। বিজেতা পরের চাল শুরু করেন।'),
        P(/^([^·]+) won · \+(\d+) points$/, '$1 জিতেছেন · +$2 পয়েন্ট'),
        [/^([^·]+) plays the ([^·]+?)\.(?: The suit led is (\w+): everyone who can must follow it\.)?$/, function (m) { return X(m[1]) + ' ' + X(m[2]) + ' দিলেন।' + (m[3] ? ' চালের সুট ' + X(m[3]) + ': যিনি পারবেন তাঁকে সেই সুটই দিতে হবে।' : ''); }],
        P(/^([^·]+) bids (\d+) — a promise that their team will win at least (\d+) of the 29 points\.$/, '$1 $2 ডাকলেন — প্রতিশ্রুতি যে তাঁর টিম ২৯ পয়েন্টের মধ্যে অন্তত $3 জিতবে।'),
        P(/^([^·]+) passes\. A pass is final\.$/, '$1 পাস করলেন। পাস চূড়ান্ত।'),
        P(/^([^·]+) won the bidding at (\d+) and chose (\w+) as trump\. Trump cards beat every other suit\.$/, '$1 $2-এ ডাক জিতে $3 কে তুরুপ বাছলেন। তুরুপের তাস বাকি সব সুটকে হারায়।'),
        P(/^([^·]+) bid (\d+)$/, '$1 $2 ডেকেছেন'),
        P(/^([^·]+) is choosing trump…$/, '$1 তুরুপ বাছছেন…'),
        P(/^Waiting for ([^·]+)$/, '$1-এর অপেক্ষা'),
        P(/^([^·]+) leads$/, '$1 শুরু করবেন'),
        P(/^([^·]+) is winning · lead ([^·]+)$/, '$1 এগিয়ে · সুট $2'),
        P(/^You are winning · lead ([^·]+)$/, 'আপনি এগিয়ে · সুট $1'),
        P(/^Your turn · follow ([^·]+)$/, 'আপনার পালা · $1 দিন'),
        P(/^Your turn · no ([^·]+) — play anything$/, 'আপনার পালা · $1 নেই — যা খুশি দিন'),
        P(/^Bidding · highest (\d+) by ([^·]+)$/, 'ডাক · সর্বোচ্চ $1 ($2)'),
        P(/^(\d+) by ([^·]+)$/, '$2-এর $1'),
        P(/^you must bid (\d+) or more$/, 'আপনাকে $1 বা তার বেশি ডাকতে হবে'),
        P(/^min 16, max 29$/, 'সর্বনিম্ন 16, সর্বোচ্চ 29'),
        P(/^Bid (\d+)$/, '$1 ডাকুন'),
        P(/^Bidder (\d+)$/, 'ডাকদাতা $1'),
        P(/^(\d+) cards?$/, '$1টি তাস'),
        P(/^(\d+) pts?$/, '$1 পয়েন্ট'),
        P(/^Hint \((\d+)\)$/, 'ইঙ্গিত ($1)'),
        [/^(Team [AB])(?: \(needs (\d+)\))?$/, function (m) { return X(m[1]) + (m[2] ? ' (দরকার ' + m[2] + ')' : ''); }],
        [/^(Team [AB]) bid (\d+)(?: \(target (\d+) after pair\))? with trump (\S+) (\w+) and collected (\d+) points$/, function (m) { return X(m[1]) + ' ' + m[2] + ' ডেকেছিল' + (m[3] ? ' (জোড়ার পরে লক্ষ্য ' + m[3] + ')' : '') + ', তুরুপ ' + m[4] + ' ' + X(m[5]) + ' আর তুলেছে ' + m[6] + ' পয়েন্ট'; }],
        P(/^stakes ×(\d+)$/, 'বাজি ×$1'),
        P(/^ROUND (\d+) COMPLETE$/, 'রাউন্ড $1 শেষ'),
        P(/^first to (\d+)$/, 'প্রথম $1 পর্যন্ত'),
        P(/^([+-]\d+) to (Team [AB])$/, '$2-কে $1'),
        P(/^(\d+) of 8$/, '8-এর মধ্যে $1'),
        P(/^Level (\d+)$/, 'লেভেল $1'),
        P(/^Confirm (\w+) as trump$/, '$1 কে তুরুপ করুন'),
        P(/^Trump (\S+) (\w+)$/, 'তুরুপ $1 $2'),
        P(/^([^·]+) \(you\)$/, '$1 (আপনি)'),
        P(/^([^·]+) \(away\)$/, '$1 (অনুপস্থিত)'),
        P(/^You chose trump ([^·]+)$/, 'আপনি তুরুপ বাছলেন $1'),
        P(/^Pair declared by ([^·]+)!$/, '$1 জোড়া ঘোষণা করলেন!'),
        P(/^Target is now (\d+)$/, 'এখন লক্ষ্য $1'),
        P(/^([^·]+) asks for trump$/, '$1 তুরুপ চাইলেন'),
        P(/^([^·]+) doubled! ×2$/, '$1 ডাবল করলেন! ×2'),
        P(/^([^·]+) doubled\. Re-doubling makes the round worth$/, '$1 ডাবল করেছেন। রি-ডাবল করলে রাউন্ডের মূল্য হয়'),
        P(/^You must follow (\w+)$/, 'আপনাকে $1 দিতে হবে'),
        P(/^([^·]+) left\. A computer takes over\.$/, '$1 চলে গেছেন। কম্পিউটার তাঁর জায়গা নিচ্ছে।'),
        P(/^([^·]+) is back$/, '$1 ফিরে এসেছেন'),
        P(/^AI level is now (\w+)$/, 'AI-এর স্তর এখন $1'),
        P(/^(\d+)s$/, '$1 সেকেন্ড'),
        P(/^Lead the ([^·]+): a strong card that is likely to win this trick\.$/, '$1 দিয়ে শুরু করুন: এটি শক্ত তাস, চাল জেতার সম্ভাবনা বেশি।'),
        P(/^Lead the ([^·]+): a low lead shows what the others hold without risking points\.$/, '$1 দিয়ে শুরু করুন: ছোট তাসে পয়েন্টের ঝুঁকি না নিয়েই বোঝা যায় অন্যদের কাছে কী আছে।'),
        P(/^Cut with trump to win this trick \((\d+) points? in it so far\)\.$/, 'তুরুপ দিয়ে কেটে এই চাল জিতুন (এখন পর্যন্ত এতে $1 পয়েন্ট)।'),
        P(/^Win this trick with the ([^·]+) \((\d+) points? in it so far\)\.$/, '$1 দিয়ে এই চাল জিতুন (এখন পর্যন্ত এতে $2 পয়েন্ট)।'),
        P(/^Your partner is winning, so add the ([^·]+) \((\d+) points?\) to their trick\.$/, 'আপনার সঙ্গী জিতছেন, তাই $1 ($2 পয়েন্ট) তাঁর চালে যোগ করুন।'),
        P(/^Your partner is already winning, so a low card keeps your good cards for later\.$/, 'আপনার সঙ্গী আগেই জিতছেন, তাই ছোট তাস দিন আর ভালো তাস পরের জন্য রাখুন।'),
        [/^The ([^·]+) will not win this trick, but it gives away (?:(\d+) points?|no points) and keeps your stronger cards for later\.$/, function (m) { return X(m[1]) + ' এই চাল জিতবে না, তবে এতে ' + (m[2] ? m[2] + ' পয়েন্ট' : 'কোনো পয়েন্ট') + ' যায় আর আপনার শক্ত তাস পরের জন্য থাকে।'; }],
        P(/^Coach: a hand like yours can usually bid up to about (\d+)\.$/, 'কোচ: আপনার মতো তাসে সাধারণত প্রায় $1 পর্যন্ত ডাকা যায়।'),
        P(/^You are winning easily on (\w+)\. Ready for a tougher table\?$/, 'আপনি AI-এর $1 স্তরে সহজেই জিতছেন। আরও কঠিন টেবিলের জন্য তৈরি?'),
        P(/^Try (\w+)$/, '$1 চেষ্টা করুন'),
        P(/^Empty seats are played by the computer \((\w+) level\)\. You can start as soon as one friend has joined\.$/, 'ফাঁকা আসনে কম্পিউটার খেলবে ($1 স্তর)। একজন বন্ধু যোগ দিলেই শুরু করতে পারবেন।'),
        P(/^Your bid · Strongest suit (\S+) \((\d+) cards?, (\d+) pts?\)$/, 'আপনার ডাক · সবচেয়ে শক্ত সুট $1 ($2টি তাস, $3 পয়েন্ট)'),
        P(/^Strongest suit (\S+) \((\d+) cards?, (\d+) pts?\)$/, 'সবচেয়ে শক্ত সুট $1 ($2টি তাস, $3 পয়েন্ট)'),
        P(/^Team A must collect (\d+) of 29 points$/, 'টিম A-কে ২৯-এর মধ্যে $1 পয়েন্ট তুলতে হবে'),
        P(/^(\d+) of 29$/, '29-এর মধ্যে $1'),
        P(/^Learn to play · (\d+) \/ (\d+)$/, 'খেলা শিখুন · $1 / $2'),
        P(/^How to play · (\d+) \/ (\d+)$/, 'কীভাবে খেলবেন · $1 / $2')
      ];
    },
    long: {}
  });

  /* result screen and daily extras */
  hi.exact['Today’s deal won!'] = 'आज की डील जीत ली!'; hi.exact['Come back tomorrow for a new deal'] = 'नई डील के लिए कल आएँ';
  bn.exact['Today’s deal won!'] = 'আজকের ডিল জিতেছেন!'; bn.exact['Come back tomorrow for a new deal'] = 'নতুন ডিলের জন্য কাল আসুন';
  hi.pats.push([/^🔥 Daily streak: (\d+) days?$/, function (m) { return '🔥 लगातार दिन: ' + m[1]; }]);
  bn.pats.push([/^🔥 Daily streak: (\d+) days?$/, function (m) { return '🔥 টানা দিন: ' + m[1]; }]);

  /* ============================ WHOLE PAGES ============================ */
  function rankGrid(unit) {
    var rk = [['J', 3], ['9', 2], ['A', 1], ['10', 1], ['K', 0], ['Q', 0], ['8', 0], ['7', 0]];
    return '<div class="row" style="gap:6px;flex-wrap:wrap;margin-bottom:10px">' + rk.map(function (r, i) {
      return '<div class="col" style="align-items:center;gap:2px;padding:8px 10px;border-radius:10px;background:#0D1915;min-width:52px"><b class="hf" style="font-size:20px">' + r[0] + '</b><span class="' + (r[1] ? 'gold' : 'mute') + '" style="font-size:13px">' + r[1] + ' ' + unit + '</span><span class="mute" style="font-size:10px">#' + (i + 1) + '</span></div>';
    }).join('') + '</div>';
  }
  function chips() {
    return '<div class="row" style="gap:6px;justify-content:center;flex-wrap:wrap;margin:8px 0">' + [16, 17, 18, 19, 20].map(function (n, i) {
      return '<span style="padding:10px 14px;border-radius:10px;background:' + (i === 2 ? 'var(--gold)' : '#13231E') + ';color:' + (i === 2 ? '#1B1608' : 'var(--ink)') + ';font:700 18px var(--hf)">' + n + '</span>';
    }).join('') + '</div>';
  }
  /* the quiz step is the same in every language except the words */
  function quiz(h, T) {
    var A = h.A, a = A.tut.ans, done = a !== null;
    var opt = function (v, t) { var good = v === 'arjun'; return '<button class="btn" data-act="tutans" data-v="' + v + '" ' + (done ? 'disabled' : '') + ' style="flex:1;' + (done && a === v ? 'border-color:' + (good ? '#6FC3A0' : '#F0A07A') + ';opacity:1' : '') + '">' + t + '</button>'; };
    return '<p>' + T.q + '</p>' + h.trickRow([['8d', T.l1], ['Jd', 'Meera'], ['7h', 'Arjun']]) +
      '<div class="row" style="gap:8px">' + opt('kabir', '8♦ Kabir') + opt('meera', 'J♦ Meera') + opt('arjun', '7♥ Arjun') + '</div>' +
      (done ? '<p style="margin-top:12px;color:' + (a === 'arjun' ? '#6FC3A0' : '#F0A07A') + '">' + (a === 'arjun' ? T.ok : T.no) + T.why + '</p>' : '');
  }
  function lastStep(T) {
    return '<p>' + T.p + '</p><div class="col" style="gap:10px;margin-top:12px"><button class="btn pri" data-act="practice" style="height:54px;font-size:18px">' + T.b1 + '</button><button class="btn" data-act="demo" style="height:50px">' + T.b2 + '</button><a href="how-to-play.html" target="_blank" rel="noopener" class="btn" style="height:50px;display:flex;align-items:center;justify-content:center;text-decoration:none;color:var(--ink)">' + T.b3 + '</a></div>';
  }

  hi.long = {
    rules: [
      ['लक्ष्य', '<p>चार खिलाड़ी, दो टीमें। आप और <b>Meera</b> (सामने) <b class="gold">टीम A</b> हैं; Kabir और Arjun टीम B हैं।</p><p>32 पत्ते (7 से इक्का तक) और 8 चालें हैं। पत्तों के कुल <b>28 अंक</b> हैं और आख़िरी चाल पर <b>+1</b> मिलता है — कुल <b class="gold">29</b>।</p><p>एक टीम बोली लगाती है कि वह कितने अंक जुटाएगी। बोली पूरी हुई तो एक गेम पॉइंट मिलता है, नहीं तो एक कटता है। जो टीम पहले <b>+6</b> पर पहुँचे वह खेल जीतती है।</p>'],
      ['पत्तों का क्रम और अंक', rankGrid('अंक') + '<p>ऊँचे से नीचे: <b>J, 9, A, 10, K, Q, 8, 7</b>। तुरुप के पत्ते बाकी हर सूट को मात देते हैं।</p>'],
      ['बोली और तुरुप', '<p>हर खिलाड़ी को पहले <b>4 पत्ते</b> मिलते हैं। मेज़ पर घूमते हुए आप या तो <b>बोली</b> लगाते हैं (16 से 29, हर बोली पिछली से ऊँची) या <b>पास</b> करते हैं। पास अंतिम होता है।</p><p>सबसे ऊँची बोली वाला <b>बोलीदाता</b> बनता है और <b>तुरुप सूट</b> चुनता है। फिर सबको बाकी 4 पत्ते मिलते हैं। अगर चारों पास करें तो अगला खिलाड़ी दोबारा बाँटता है।</p><p><b>छिपा तुरुप:</b> बाकी लोग सूट तभी जानते हैं जब चला गया सूट न रखने वाला कोई खिलाड़ी उसे माँगे। माँगने वाले के पास तुरुप हो तो उसे वही खेलना होगा।</p>'],
      ['चालें खेलना', '<p>हर कोई एक पत्ता खेलता है। अगर हो सके तो <b>चला गया सूट</b> ही खेलना होगा। उस सूट का सबसे ऊँचा पत्ता जीतता है — पर अगर तुरुप खेला गया हो तो सबसे ऊँचा तुरुप जीतता है।</p><p>जीतने वाला अगली चाल चलता है। साथी जीत रहा हो तो उसकी चाल में अंक डालें, और विरोधियों के गुलाम और नौ पकड़ें।</p>'],
      ['जोड़ी, डबल और स्कोर', '<p><b>जोड़ी:</b> तुरुप का K + Q हो और आपकी टीम एक चाल जीत चुकी हो तो उसे घोषित करें। बोलीदाताओं का लक्ष्य 4 घटता है (16 से नीचे नहीं); दूसरी टीम की घोषणा से 4 बढ़ता है।</p><p><b>डबल:</b> विरोधी सभी 8 पत्ते देखकर डबल कर सकते हैं; बोलीदाता री-डबल कर सकते हैं। तब गेम पॉइंट ×2 या ×4 गिने जाते हैं।</p><p>बोली पूरी की: <b>+1</b>। चूके: <b>−1</b>। जो टीम पहले <b>+6</b> पर पहुँचे वह जीतती है (−6 पर टीम हार जाती है)।</p>']
    ],
    tut: function (h) {
      var mini = h.mini, trickRow = h.trickRow;
      return [
        ['29 में स्वागत है', function () { return '<p>29 चार खिलाड़ियों का, दो टीमों वाला ट्रिक-टेकिंग ताश का खेल है। आप और <b>Meera</b> (सामने बैठी) टीम A हैं। Kabir और Arjun टीम B हैं।</p><p>हर राउंड में <b>8 चालें</b> और <b>28 पत्ता-अंक</b> होते हैं, साथ में आख़िरी चाल का <b>1 बोनस अंक</b> — कुल <b class="gold">29</b>। एक टीम बोली लगाती है कि वह कितने अंक जीत सकती है। बोली पूरी की तो अंक मिलता है, चूके तो एक अंक कटता है। जो टीम पहले <b>+6</b> पर पहुँचे वह जीतती है।</p>'; }],
        ['पत्तों को जानें', function () {
          var rk = [['J', 3], ['9', 2], ['A', 1], ['10', 1], ['K', 0], ['Q', 0], ['8', 0], ['7', 0]];
          return '<p>32 पत्ते हैं। क्रम सामान्य नहीं है — सबसे ऊँचे से सबसे नीचे:</p><div class="row" style="gap:6px;justify-content:center;flex-wrap:wrap">' + rk.map(function (r) { return mini(r[0] + 's', false, r[1] + ' अंक'); }).join('') + '</div><p>गुलाम (J) और नौ (9) सबसे कीमती हैं। हर सूट में 7 अंक हैं, इसलिए पूरी गड्डी में 28।</p>';
        }],
        ['बोली', function () { return '<p>शुरू में आपको <b>4 पत्ते</b> मिलते हैं। उन्हें देखकर आप <b>बोली</b> लगाते हैं या <b>पास</b> करते हैं। बोली (16 से 29) एक वादा है कि आपकी टीम कम से कम उतने अंक जीतेगी।</p>' + chips() + '<p>हर बोली पिछली से ऊँची होनी चाहिए और पास अंतिम होता है। एक ही सूट में <b>गुलाम और नौ</b> हों तो ऊँची बोली लगाने का अच्छा कारण है। सबसे ऊँची बोली लगाने वाला <b>बोलीदाता</b> बनता है।</p>'; }],
        ['तुरुप चुनना', function () { return '<p>बोलीदाता <b>तुरुप सूट</b> चुनता है। तुरुप का पत्ता हर दूसरे सूट के हर पत्ते को मात देता है — इक्के या गुलाम को भी।</p><div class="row" style="gap:10px;justify-content:center">' + ['Jh', '9h', 'Ah'].map(function (c) { return mini(c, false); }).join('') + '</div><p>वह सूट चुनें जिसमें आप सबसे मज़बूत हों, जैसे यहाँ पान। आप तुरुप को <b>छिपा</b> भी सकते हैं: बाकी लोग तभी जानते हैं जब चला गया सूट न रखने वाला कोई खिलाड़ी उसे माँगे।</p>'; }],
        ['चाल जीतना', function () {
          return '<p>पहला खिलाड़ी कोई भी पत्ता खेलता है। बाकी सबको <b>वही सूट खेलना</b> होता है अगर उनके पास हो। उस सूट का सबसे ऊँचा पत्ता जीतता है।</p>' +
            trickRow([['10s', 'Kabir की चाल'], ['9s', 'Meera'], ['Qs', 'Arjun'], ['Js', 'आप जीते', true]]) +
            '<p>आपका गुलाम जीतता है और आपकी टीम <b>1 + 2 + 0 + 3 = 6 अंक</b> बटोरती है।</p><p>अगर आपके पास चला गया सूट <b>नहीं</b> है तो कुछ भी खेलें — या तुरुप से काटें (यहाँ पान):</p>' +
            trickRow([['As', 'Kabir की चाल'], ['Ks', 'Meera'], ['7h', 'Arjun ने काटा', true], ['10s', 'आप']]) + '<p>तुरुप का छोटा 7 भी इक्के को मात देता है। जीतने वाला अगली चाल चलता है।</p>';
        }],
        ['छोटी परीक्षा', function () { return quiz(h, { q: 'पान तुरुप है। Kabir ने चाल चली, फिर Meera और Arjun ने खेला। अभी चाल कौन जीत रहा है?', l1: 'Kabir की चाल', ok: 'सही! ', no: 'बिल्कुल नहीं। ', why: 'Arjun के पास ईंट नहीं थी, इसलिए उसने तुरुप से काटा। तुरुप का 7 भी Meera के गुलाम को मात देता है। अगर आपके पास ऊँचा तुरुप हो तो उसे हरा सकते हैं।' }); }],
        ['स्कोरिंग और अतिरिक्त नियम', function () { return '<p><b>स्कोरिंग:</b> हर टीम के जीते अंक जोड़ें (आख़िरी चाल का +1 भी)। बोली पूरी की? <b>+1 गेम पॉइंट</b>। चूके? <b>−1</b>। पहले <b>+6</b> जीतता है।</p><p><b>जोड़ी:</b> तुरुप का बादशाह और बेगम हों तो आपकी टीम के चाल जीतने के बाद उसे घोषित करें — बोली का लक्ष्य 4 बदल जाता है।</p><p><b>डबल:</b> दूसरी टीम को लगे कि आप चूकेंगे तो दांव दोगुना कर सकती है; आप री-डबल कर सकते हैं। तब राउंड 2 या 4 गेम पॉइंट का होता है।</p><p>सुझाव: पत्ते को चुनने के लिए एक बार टैप करें, खेलने के लिए दोबारा। धुँधले पत्ते नहीं चल सकते।</p>'; }],
        ['आप तैयार हैं!', function () { return lastStep({ p: 'सीखने का सबसे अच्छा तरीका खेलना है। <b>प्रैक्टिस</b> मोड संकेत और बोली की मदद दिखाता है, और आपके आँकड़ों में नहीं गिना जाता।', b1: 'प्रैक्टिस गेम शुरू करें', b2: 'पहले डेमो राउंड देखें', b3: 'पूरी गाइड पढ़ें' }); }]
      ];
    },
    about: '<p style="margin:0 0 10px"><b class="gold">सोचो समझदारी से। बोली लगाओ हिम्मत से। जीतो 29।</b></p><p style="margin:0 0 10px">STRATOS 29, भारत और दक्षिण एशिया के क्लासिक ट्रिक-टेकिंग ताश खेल 29 का मुफ़्त ब्राउज़र संस्करण है। आप AI साथी के साथ दो AI विरोधियों के खिलाफ़ खेलते हैं, तुरुप के लिए बोली लगाते हैं और +6 गेम पॉइंट तक दौड़ लगाते हैं। आसान से विशेषज्ञ तक चार AI स्तर, डेली डील, और बिल्ट-इन ट्यूटोरियल व डेमो इसे सीखने में आसान और महारत में कठिन बनाते हैं।</p><p style="margin:0 0 10px">इसे <b>Sk Sarfaraj Ali</b> ने Stratos Technologies के मुफ़्त खेलों के परिवार Stratos Games के लिए बनाया है। इसमें जुआ, असली पैसे का खेल या साइन-अप नहीं है। आपकी सेटिंग्स और आँकड़े आपके अपने डिवाइस पर रहते हैं।</p><p style="margin:0">निष्पक्ष खेल: AI सिर्फ़ अपने पत्ते और चले जा चुके पत्ते देखता है, बिल्कुल आपकी तरह। बाँटना आपके ब्राउज़र के सुरक्षित रैंडम जनरेटर से होता है।</p>'
  };

  bn.long = {
    rules: [
      ['লক্ষ্য', '<p>চারজন খেলোয়াড়, দুটি টিম। আপনি আর <b>Meera</b> (মুখোমুখি) <b class="gold">টিম A</b>; Kabir আর Arjun টিম B।</p><p>৩২টি তাস (৭ থেকে টেক্কা) আর ৮টি চাল। তাসের মোট <b>২৮ পয়েন্ট</b> এবং শেষ চালে <b>+1</b> — মোট <b class="gold">২৯</b>।</p><p>একটি টিম ডাকে যে সে কত পয়েন্ট তুলবে। ডাক পূরণ হলে একটি গেম পয়েন্ট মেলে, না হলে একটি কাটা যায়। যে টিম আগে <b>+6</b>-এ পৌঁছায় সে খেলা জেতে।</p>'],
      ['তাসের ক্রম ও পয়েন্ট', rankGrid('পয়েন্ট') + '<p>বড় থেকে ছোট: <b>J, 9, A, 10, K, Q, 8, 7</b>। তুরুপের তাস বাকি সব সুটকে হারায়।</p>'],
      ['ডাক ও তুরুপ', '<p>প্রত্যেকে প্রথমে <b>৪টি তাস</b> পায়। টেবিল ঘুরে আপনি হয় <b>ডাক</b> দেন (16 থেকে 29, প্রতিটি ডাক আগেরটির চেয়ে বড়) নয়তো <b>পাস</b> করেন। পাস চূড়ান্ত।</p><p>সর্বোচ্চ ডাকদাতা হন <b>ডাকদাতা</b> এবং <b>তুরুপের সুট</b> বাছেন। তারপর সবাই বাকি ৪টি তাস পায়। চারজনই পাস করলে পরের জন আবার তাস বাঁটে।</p><p><b>গোপন তুরুপ:</b> চালের সুট না থাকা কেউ চাইলে তবেই অন্যরা সুটটি জানতে পারে। যিনি চান তাঁর কাছে তুরুপ থাকলে সেটিই দিতে হবে।</p>'],
      ['চাল খেলা', '<p>প্রত্যেকে একটি করে তাস দেয়। পারলে <b>চালের সুটই</b> দিতে হবে। সেই সুটের সবচেয়ে বড় তাস জেতে — তবে তুরুপ পড়লে সবচেয়ে বড় তুরুপ জেতে।</p><p>বিজেতা পরের চাল শুরু করে। সঙ্গী জিতলে তাঁর চালে পয়েন্ট দিন, আর প্রতিপক্ষের গোলাম ও নয় ধরুন।</p>'],
      ['জোড়া, ডাবল ও স্কোর', '<p><b>জোড়া:</b> তুরুপের K + Q থাকলে এবং আপনার টিম একটি চাল জিতে থাকলে ঘোষণা করুন। ডাকদাতাদের লক্ষ্য ৪ কমে (১৬-র নিচে নয়); অন্য টিম ঘোষণা করলে ৪ বাড়ে।</p><p><b>ডাবল:</b> প্রতিপক্ষ সব ৮টি তাস দেখে ডাবল করতে পারে; ডাকদাতারা রি-ডাবল করতে পারেন। তখন গেম পয়েন্ট ×2 বা ×4 গোনা হয়।</p><p>ডাক পূরণ: <b>+1</b>। ব্যর্থ: <b>−1</b>। যে টিম আগে <b>+6</b>-এ পৌঁছায় সে জেতে (−6-এ গেলে টিম হারে)।</p>']
    ],
    tut: function (h) {
      var mini = h.mini, trickRow = h.trickRow;
      return [
        ['29-এ স্বাগতম', function () { return '<p>29 হল চারজনের, দুই টিমের ট্রিক-টেকিং তাসখেলা। আপনি আর <b>Meera</b> (মুখোমুখি) টিম A। Kabir আর Arjun টিম B।</p><p>প্রতি রাউন্ডে <b>৮টি চাল</b> আর <b>২৮ তাস-পয়েন্ট</b>, সাথে শেষ চালের <b>১ বোনাস পয়েন্ট</b> — মোট <b class="gold">২৯</b>। একটি টিম ডাকে যে সে কত পয়েন্ট জিততে পারবে। ডাক পূরণ হলে পয়েন্ট মেলে, না হলে একটি কাটা যায়। যে টিম আগে <b>+6</b>-এ পৌঁছায় সে জেতে।</p>'; }],
        ['তাসগুলো চিনুন', function () {
          var rk = [['J', 3], ['9', 2], ['A', 1], ['10', 1], ['K', 0], ['Q', 0], ['8', 0], ['7', 0]];
          return '<p>মোট ৩২টি তাস। ক্রম সাধারণ নয় — সবচেয়ে বড় থেকে সবচেয়ে ছোট:</p><div class="row" style="gap:6px;justify-content:center;flex-wrap:wrap">' + rk.map(function (r) { return mini(r[0] + 's', false, r[1] + ' পয়েন্ট'); }).join('') + '</div><p>গোলাম (J) আর নয় (9) সবচেয়ে দামি। প্রতি সুটে ৭ পয়েন্ট, তাই গোটা প্যাকে ২৮।</p>';
        }],
        ['ডাক', function () { return '<p>শুরুতে আপনি <b>৪টি তাস</b> পান। দেখে নিয়ে আপনি <b>ডাক</b> দেন বা <b>পাস</b> করেন। ডাক (16 থেকে 29) হল প্রতিশ্রুতি যে আপনার টিম অন্তত ততটা পয়েন্ট জিতবে।</p>' + chips() + '<p>প্রতিটি ডাক আগেরটির চেয়ে বড় হতে হবে, আর পাস চূড়ান্ত। এক সুটে <b>গোলাম আর নয়</b> থাকলে উঁচু ডাকের ভালো কারণ। সর্বোচ্চ ডাকদাতা হন <b>ডাকদাতা</b>।</p>'; }],
        ['তুরুপ বাছা', function () { return '<p>ডাকদাতা <b>তুরুপের সুট</b> বাছেন। তুরুপের তাস অন্য সব সুটের সব তাসকে হারায় — টেক্কা বা গোলামকেও।</p><div class="row" style="gap:10px;justify-content:center">' + ['Jh', '9h', 'Ah'].map(function (c) { return mini(c, false); }).join('') + '</div><p>যে সুটে আপনি সবচেয়ে শক্ত সেটি বাছুন, যেমন এখানে হরতন। আপনি তুরুপ <b>গোপন</b>ও রাখতে পারেন: চালের সুট না থাকা কেউ চাইলে তবেই অন্যরা জানতে পারে।</p>'; }],
        ['চাল জেতা', function () {
          return '<p>প্রথম খেলোয়াড় যে কোনো তাস দেন। বাকিদের থাকলে <b>সেই সুটই দিতে</b> হবে। সেই সুটের সবচেয়ে বড় তাস জেতে।</p>' +
            trickRow([['10s', 'Kabir-এর চাল'], ['9s', 'Meera'], ['Qs', 'Arjun'], ['Js', 'আপনি জিতলেন', true]]) +
            '<p>আপনার গোলাম জেতে, আর আপনার টিম পায় <b>1 + 2 + 0 + 3 = 6 পয়েন্ট</b>।</p><p>চালের সুট যদি আপনার <b>না</b> থাকে, যা খুশি দিন — বা তুরুপ দিয়ে কাটুন (এখানে হরতন):</p>' +
            trickRow([['As', 'Kabir-এর চাল'], ['Ks', 'Meera'], ['7h', 'Arjun কাটলেন', true], ['10s', 'আপনি']]) + '<p>তুরুপের ছোট ৭-ও টেক্কাকে হারায়। বিজেতা পরের চাল শুরু করে।</p>';
        }],
        ['ছোট্ট কুইজ', function () { return quiz(h, { q: 'হরতন তুরুপ। Kabir চাল দিলেন, তারপর Meera আর Arjun। এই মুহূর্তে চাল কে জিতছে?', l1: 'Kabir-এর চাল', ok: 'ঠিক! ', no: 'ঠিক হয়নি। ', why: 'Arjun-এর কাছে রুইতন ছিল না, তাই সে তুরুপ দিয়ে কেটেছে। তুরুপের ৭-ও Meera-র গোলামকে হারায়। আপনার কাছে বড় তুরুপ থাকলে তাকে হারাতে পারেন।' }); }],
        ['স্কোর ও বাড়তি নিয়ম', function () { return '<p><b>স্কোর:</b> প্রতি টিমের জেতা পয়েন্ট যোগ করুন (শেষ চালের +1 সহ)। ডাক পূরণ হলে <b>+1 গেম পয়েন্ট</b>। না হলে <b>−1</b>। আগে <b>+6</b> জেতে।</p><p><b>জোড়া:</b> তুরুপের রাজা আর বিবি থাকলে আপনার টিম চাল জেতার পর ঘোষণা করুন — ডাকের লক্ষ্য ৪ বদলে যায়।</p><p><b>ডাবল:</b> অন্য টিম মনে করলে আপনি ব্যর্থ হবেন, বাজি দ্বিগুণ করতে পারে; আপনি রি-ডাবল করতে পারেন। তখন রাউন্ড ২ বা ৪ গেম পয়েন্টের।</p><p>টিপ: তাস বাছতে একবার ট্যাপ করুন, চালতে আবার। ঝাপসা তাস চালা যায় না।</p>'; }],
        ['আপনি তৈরি!', function () { return lastStep({ p: 'শেখার সেরা উপায় খেলা। <b>প্র্যাকটিস</b> মোডে ইঙ্গিত ও ডাকের সাহায্য মেলে, আর এটি আপনার পরিসংখ্যানে গোনা হয় না।', b1: 'প্র্যাকটিস গেম শুরু করুন', b2: 'আগে ডেমো রাউন্ড দেখুন', b3: 'পূর্ণ গাইড পড়ুন' }); }]
      ];
    },
    about: '<p style="margin:0 0 10px"><b class="gold">বুদ্ধি খাটাও। সাহসে ডাক দাও। জেতো 29।</b></p><p style="margin:0 0 10px">STRATOS 29 হল ভারত ও দক্ষিণ এশিয়ার ক্লাসিক ট্রিক-টেকিং তাসখেলা 29-এর বিনামূল্যের ব্রাউজার সংস্করণ। আপনি AI সঙ্গীর সাথে দুই AI প্রতিপক্ষের বিরুদ্ধে খেলেন, তুরুপের জন্য ডাক দেন আর +6 গেম পয়েন্টের দিকে ছোটেন। সহজ থেকে বিশেষজ্ঞ পর্যন্ত চারটি AI স্তর, ডেইলি ডিল, আর বিল্ট-ইন টিউটোরিয়াল ও ডেমো একে শেখা সহজ আর দক্ষ হওয়া কঠিন করে তোলে।</p><p style="margin:0 0 10px">এটি বানিয়েছেন <b>Sk Sarfaraj Ali</b>, Stratos Technologies-এর বিনামূল্যের খেলার পরিবার Stratos Games-এর জন্য। এতে জুয়া, আসল টাকার খেলা বা সাইন-আপ নেই। আপনার সেটিংস ও পরিসংখ্যান আপনার নিজের ডিভাইসেই থাকে।</p><p style="margin:0">ন্যায্য খেলা: AI শুধু নিজের তাস আর আগে পড়া তাস দেখে, ঠিক আপনার মতোই। তাস বাঁটা হয় আপনার ব্রাউজারের নিরাপদ র‍্যান্ডম জেনারেটর দিয়ে।</p>'
  };

  window.S29_I18N = { hi: hi, bn: bn };
})();
