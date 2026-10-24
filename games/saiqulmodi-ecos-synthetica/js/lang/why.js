// Why each part is the best fit for a case: WHY[lang][organismId][partId].
export const WHY = {
  en: {
    phage_lambda: {
      restriction_enzyme: 'It cuts the phage DNA the moment it enters, before any phage gene can be read. No other part acts that fast on foreign DNA.',
      self_methylation: 'It marks your own DNA so your restriction enzymes cut only the invader. Without it the enzyme would cut you too.',
      receptor_change: 'Lambda can only dock on the LamB channel. Change LamB and the phage cannot even begin: a one-part defence.',
    },
    phage_2972: {
      crispr_spacer: 'It is a memory of this exact phage. Only a stored spacer lets the cell recognise the phage by its own DNA sequence.',
      cas_nuclease: 'Cas is the pair of scissors guided by the spacer. It cuts the matching phage DNA and leaves your own DNA alone.',
    },
    pseudomonas_aer: {
      quorum_quench: 'Pseudomonas attacks only when its signals say "enough of us". Destroying the signals stops the attack without a fight.',
      siderophore: 'Its strength is stealing iron. Your own iron-grabbing molecule takes the iron back, so it cannot outgrow you.',
    },
    streptomyces: {
      efflux_pump: 'Streptomycin must stay inside you to work. A pump throws it out before it reaches your ribosomes.',
      modifying_enzyme: 'It changes the streptomycin molecule itself so it can no longer bind. Streptomyces protects itself with this very enzyme.',
    },
    myxococcus: {
      biofilm_matrix: 'The pack must touch you to digest you. A thick shared slime keeps it at a distance.',
      secondary_metabolite: 'Bacillaene directly stops Myxococcus: a chemical answer to a chemical hunter.',
    },
    bacillus_subtilis: {
      biofilm_matrix: 'Bacillus lives in biofilms. Building the same matrix is how you share its home.',
      autoinducer: 'The quorum signal tells the community you belong, so the group accepts you.',
    },
    nitrosomonas: {
      metabolite_exchange: 'Nitrifiers live by passing products to partners. Trading what each makes is how they live together.',
      biofilm_matrix: 'Cross-feeding works only when partners stay close. A shared biofilm keeps you side by side.',
    },
    diatom: {
      metabolite_exchange: 'The diatom leaks sugars made from sunlight; trading lets you eat them in return for what you give.',
      vitamin_b12: 'Many diatoms cannot make vitamin B12. Supplying it is the most valuable gift a bacterium can offer.',
    },
    lichen: {
      biofilm_matrix: 'Bacteria live on lichens as a thin biofilm. Building it is how you settle into the lichen.',
      vitamin_b12: 'The lichen\'s alga needs vitamins it cannot make; your B12 makes you a welcome member.',
    },
    phytophthora: {
      r_gene: 'Blight sends effector proteins into your cells. Only an R gene recognises those exact effectors.',
      hypersensitive: 'Blight must keep your cells alive to feed. Killing infected cells on purpose starves it.',
    },
    botrytis: {
      jasmonate: 'Jasmonic acid is the plant\'s alarm for tissue-killers like grey mould; salicylic acid would be the wrong alarm.',
      phytoalexin: 'Camalexin poisons grey mould directly. Cell suicide would feed it, so a chemical weapon is best.',
    },
    magnaporthe: {
      pattern_receptor: 'Rice blast\'s wall is full of chitin. The CEBiP/CERK1 receptor spots that chitin and raises the alarm early.',
      chitinase: 'It digests the chitin wall of the blast fungus. It works here because this is a true fungus, unlike late blight.',
      callose: 'The fungus drives its peg into one spot. A callose plug placed right there blocks it.',
      lignin: 'Lignin hardens the wall the peg must pierce, adding strength exactly where the pressure hits.',
      glucanase: 'Glucanase breaks the glucan in the fungal wall; together with chitinase it dissolves the wall far better than either alone.',
    },
    ps_syringae: {
      pattern_receptor: 'FLS2 recognises its flagellin, the tail it swims with, so you notice it the moment it lands.',
      stomatal_closure: 'It can enter only through open leaf pores. Closing them shuts its only door.',
      salicylic: 'Salicylic acid builds resistance against microbes that feed on living leaves, like this bacterium.',
    },
    tmv: {
      rna_silencing: 'TMV is just RNA in a protein coat. Cutting its RNA strikes the virus itself.',
      salicylic: 'Salicylic acid strengthens RNA silencing and spreads the defence through the whole plant.',
      r_gene: 'The N gene recognises TMV\'s own protein: a precise alarm for this virus.',
      hypersensitive: 'A virus needs living cells to copy itself. Dying cells trap it in small spots.',
    },
    aphid: {
      jasmonate: 'Jasmonic acid is the plant\'s alarm for insects feeding on it.',
      volatile_signal: 'Instead of fighting alone, the plant calls aphid hunters, the best aphid controllers there are.',
    },
    locust: {
      jasmonate: 'Jasmonic acid answers chewing insects and switches on the tannin defence.',
      tannin: 'A swarm cannot be fought one by one. Leaves that are hard to digest make the whole field poor food.',
    },
    amf: {
      strigolactone: 'This root signal is the invitation the fungus waits for: it makes its threads branch toward you.',
      sugar_exchange: 'The fungus cannot live without plant sugar and pays back with phosphate: a fair trade.',
    },
    rhizobium: {
      flavonoid: 'Flavonoids switch on Rhizobium\'s nod genes, the first step in building a nodule.',
      sugar_exchange: 'Fixing nitrogen costs a lot of energy; the plant\'s sugar pays for it.',
    },
    ladybird: {
      volatile_signal: 'Ladybirds find food by smell; a scent signal brings them to you.',
      salicylic: 'The salicylic pathway makes methyl salicylate, the very scent ladybirds follow.',
    },
    trichoderma: {
      sugar_exchange: 'Trichoderma lives on roots that feed it; sugar invites it to stay.',
      jasmonate: 'Jasmonate signalling lets the plant accept Trichoderma as a defence helper.',
    },
    termite: {
      latex_resin: 'Sticky latex gums up termite mouthparts right at the wound.',
      jasmonate: 'Jasmonic acid adds bitter, toxic compounds that chewing insects avoid.',
    },
    earthworm: {
      leaf_litter: 'Earthworms eat fallen leaves; leaving them to decay is the only invitation needed.',
    },
    beauveria: {
      chitin_cuticle: 'The fungus must dissolve the cuticle first; a thicker, harder cuticle stops it at the door.',
      melanization: 'Melanin seals the wound and poisons the fungus where it broke in.',
      toll_pathway: 'Toll is the insect\'s switch for fungi; it makes the antifungal peptides.',
      encapsulation: 'Blood cells wrap up the fungal threads that got inside.',
      amp: 'Antimicrobial peptides punch holes in the fungus inside the body.',
    },
    ascosphaera: {
      social_fever: 'Chalkbrood grows best on chilled brood; a warmer nest stops it.',
      hygienic: 'Removing infected larvae stops new spores from spreading.',
    },
    paenibacillus: {
      hygienic: 'Sick larvae removed before spores form means no new spores.',
      toll_pathway: 'Toll is the switch for Gram-positive bacteria like this one.',
      amp: 'Peptides such as abaecin and defensin kill the bacteria.',
      lysozyme: 'Gram-positive bacteria have an exposed wall that lysozyme cuts directly.',
    },
    dwv: {
      rnai_antiviral: 'DWV is an RNA virus; Dicer-2 cuts its RNA.',
      grooming: 'Most DWV is spread by Varroa mites; removing the mites cuts its road.',
    },
    varroa: {
      grooming: 'Bees biting mites off each other removes them from the adults.',
      hygienic: 'Mites breed in capped cells; uncapping and removing infested brood stops their breeding.',
    },
    serratia: {
      imd_pathway: 'Imd is the insect switch for Gram-negative bacteria like Serratia.',
      amp: 'The antibacterial peptides made through Imd kill it in the blood.',
    },
    gut_core: {
      trophallaxis: 'Young bees receive these bacteria by sharing food with nestmates.',
      metabolite_exchange: 'Gut partners live on sugars the bee cannot digest and share the products back.',
    },
    poplar: {
      propolis: 'Collecting the resin and lining the hive turns the tree\'s own defence into the colony\'s.',
    },
    hornet: {
      heat_balling: 'The hornet dies at about 46 C while bees survive 48 C: heat is the one weapon small bees can win with.',
      alarm_pheromone: 'One bee cannot do it; the alarm pheromone calls hundreds to form the ball.',
    },
    strep_pyogenes: {
      igg: 'IgG against M protein uncovers the bacterium that M protein tries to hide.',
      complement: 'Complement tags the antibody-coated bacterium for eating.',
      neutrophil: 'Neutrophils are the fast eaters that swallow tagged bacteria.',
      macrophage: 'Macrophages also eat tagged bacteria: a second route.',
    },
    influenza: {
      interferon: 'Interferon warns neighbouring cells before the virus reaches them.',
      cytotoxic_t: 'The virus hides inside your cells; only killer T cells destroy infected cells.',
      iga: 'IgA neutralises the virus on the airway surface, exactly where it enters.',
    },
    aspergillus: {
      macrophage: 'Lung macrophages eat inhaled spores before they can grow.',
      neutrophil: 'Neutrophils attack the hyphae, which are too big for one cell to swallow.',
      dectin1: 'Dectin-1 recognises the beta-glucan in the fungal wall.',
    },
    candida: {
      colonisation_resist: 'Candida turns invasive when its competitors vanish; resident bacteria keep it small.',
      th17: 'IL-17 from Th17 cells calls neutrophils to the skin and gut.',
      dectin1: 'Dectin-1 spots the glucan in Candida\'s wall.',
    },
    mtb: {
      macrophage: 'TB lives inside macrophages, so activated macrophages are where it must die.',
      th1: 'Interferon-gamma from Th1 cells unlocks the macrophages\' killing power.',
      granuloma: 'What cannot be killed can be walled off; granulomas keep it dormant.',
    },
    anopheles: {
      ige_mast: 'Bite reactions make feeding uncomfortable and slow.',
      grooming: 'Swatting stops the mosquito before it can feed.',
    },
    plasmodium: {
      sickle_trait: 'One HbS copy makes red cells a poor home for the parasite: natural selection\'s own answer.',
      igg: 'Antibodies mark infected red cells.',
      macrophage: 'Spleen macrophages remove the infected red cells.',
    },
    bifido: {
      dietary_fiber: 'Fibre is its food.',
      iga: 'IgA helps friendly bacteria settle on the gut lining.',
    },
    bacteroides: {
      dietary_fiber: 'Bacteroides digests the fibre you cannot.',
      metabolite_exchange: 'It shares fatty acids with your gut cells in return.',
    },
    housefly: {
      sanitation: 'Flies carry germs from waste to food; toilets and covered food break that route.',
      grooming: 'Swatting keeps flies off your food and skin.',
    },
    dung_beetle: {
      pastoral_care: 'Dewormer drugs in dung kill beetle larvae; clean dung lets the beetles thrive.',
    },
  },

  hi: {
    phage_lambda: {
      restriction_enzyme: 'यह फ़ेज का DNA अंदर आते ही काट देता है, उसके किसी जीन के पढ़े जाने से पहले। बाहरी DNA पर कोई दूसरा भाग इतनी तेज़ी से काम नहीं करता।',
      self_methylation: 'यह आपके अपने DNA पर निशान लगाता है ताकि आपके रेस्ट्रिक्शन एंज़ाइम केवल घुसपैठिए को काटें। इसके बिना एंज़ाइम आपको भी काट देता।',
      receptor_change: 'लैम्डा केवल LamB द्वार पर चिपक सकता है। LamB बदल दें तो फ़ेज शुरुआत भी नहीं कर पाता: एक भाग वाला बचाव।',
    },
    phage_2972: {
      crispr_spacer: 'यह ठीक इसी फ़ेज की स्मृति है। केवल रखा हुआ स्पेसर ही कोशिका को फ़ेज उसके अपने DNA क्रम से पहचानने देता है।',
      cas_nuclease: 'Cas स्पेसर से चलने वाली कैंची है। यह मेल खाते फ़ेज DNA को काटती है और आपका DNA छोड़ देती है।',
    },
    pseudomonas_aer: {
      quorum_quench: 'स्यूडोमोनास तभी हमला करता है जब उसके संदेश कहें "हम काफ़ी हैं"। संदेश नष्ट करने से हमला बिना लड़ाई रुक जाता है।',
      siderophore: 'इसकी ताकत लोहा छीनना है। आपका अपना लोहा पकड़ने वाला अणु लोहा वापस ले लेता है, तो यह आपसे आगे नहीं बढ़ पाता।',
    },
    streptomyces: {
      efflux_pump: 'स्ट्रेप्टोमाइसिन को असर के लिए आपके भीतर रहना होता है। पंप उसे राइबोसोम तक पहुँचने से पहले बाहर फेंक देता है।',
      modifying_enzyme: 'यह स्ट्रेप्टोमाइसिन अणु को ही बदल देता है ताकि वह जुड़ न सके। स्ट्रेप्टोमाइसीज़ खुद इसी एंज़ाइम से अपनी रक्षा करता है।',
    },
    myxococcus: {
      biofilm_matrix: 'दल को आपको पचाने के लिए छूना पड़ता है। मोटी साझा परत उसे दूर रखती है।',
      secondary_metabolite: 'बैसिलीन सीधे मिक्सोकोकस को रोकती है: रासायनिक शिकारी का रासायनिक जवाब।',
    },
    bacillus_subtilis: {
      biofilm_matrix: 'बैसिलस बायोफ़िल्म में रहता है। वही आवरण बनाना उसका घर बाँटने का तरीका है।',
      autoinducer: 'कोरम संकेत समुदाय को बताता है कि आप उन्हीं में से हैं, तो समूह आपको अपना लेता है।',
    },
    nitrosomonas: {
      metabolite_exchange: 'नाइट्रीकारी बैक्टीरिया अपने उत्पाद साथियों को देकर जीते हैं। जो जो बनाता है उसका लेन-देन ही साथ रहने का तरीका है।',
      biofilm_matrix: 'लेन-देन तभी चलता है जब साथी पास रहें। साझा बायोफ़िल्म आपको साथ-साथ रखती है।',
    },
    diatom: {
      metabolite_exchange: 'डायटम धूप से बनी शर्करा छोड़ता है; लेन-देन से आप उसे खा पाते हैं, बदले में कुछ देकर।',
      vitamin_b12: 'कई डायटम विटामिन B12 नहीं बना सकते। इसे देना ही बैक्टीरियम का सबसे कीमती उपहार है।',
    },
    lichen: {
      biofilm_matrix: 'बैक्टीरिया लाइकेन पर पतली बायोफ़िल्म बनकर रहते हैं। उसे बनाना ही लाइकेन में बसने का तरीका है।',
      vitamin_b12: 'लाइकेन के शैवाल को ऐसे विटामिन चाहिए जो वह नहीं बना सकता; आपका B12 आपको स्वागत योग्य सदस्य बनाता है।',
    },
    phytophthora: {
      r_gene: 'झुलसा आपकी कोशिकाओं में प्रभावक प्रोटीन भेजता है। केवल R जीन ही उन्हीं प्रोटीनों को पहचानता है।',
      hypersensitive: 'झुलसे को खाने के लिए आपकी कोशिकाएँ जीवित चाहिए। संक्रमित कोशिकाओं को जानबूझकर मारना उसे भूखा रखता है।',
    },
    botrytis: {
      jasmonate: 'जैस्मोनिक अम्ल धूसर फफूँद जैसे ऊतक-मारकों के लिए पौधे की चेतावनी है; सैलिसिलिक अम्ल गलत चेतावनी होती।',
      phytoalexin: 'कैमालेक्सिन धूसर फफूँद को सीधे ज़हर देता है। कोशिका-आत्महत्या तो उसे खिलाती, इसलिए रासायनिक हथियार सबसे अच्छा है।',
    },
    magnaporthe: {
      pattern_receptor: 'ब्लास्ट की भित्ति काइटिन से भरी है। CEBiP/CERK1 ग्राही उस काइटिन को पहचानकर जल्दी चेतावनी देता है।',
      chitinase: 'यह ब्लास्ट फफूँद की काइटिन भित्ति पचाता है। यहाँ यह काम करता है क्योंकि यह असली फफूँद है, पछेती झुलसे जैसा नहीं।',
      callose: 'फफूँद एक ही जगह कील धँसाती है। ठीक वहीं बना कैलोज़ प्लग उसे रोक देता है।',
      lignin: 'लिग्निन उस दीवार को सख्त बनाता है जिसे कील को भेदना है, ठीक वहीं ताकत जोड़ते हुए जहाँ दबाव पड़ता है।',
      glucanase: 'ग्लूकानेज़ फफूँद की भित्ति का ग्लूकान तोड़ता है; काइटिनेज़ के साथ मिलकर यह अकेले किसी से भी बेहतर भित्ति घोलता है।',
    },
    ps_syringae: {
      pattern_receptor: 'FLS2 इसके फ़्लैजेलिन, यानी तैरने वाली पूँछ, को पहचानता है, तो यह आते ही पकड़ में आ जाता है।',
      stomatal_closure: 'यह केवल खुले रंध्रों से ही अंदर आ सकता है। उन्हें बंद करना इसका एकमात्र दरवाज़ा बंद करना है।',
      salicylic: 'सैलिसिलिक अम्ल जीवित पत्तियों पर पलने वाले सूक्ष्मजीवों, जैसे इस बैक्टीरियम, के विरुद्ध प्रतिरोध बनाता है।',
    },
    tmv: {
      rna_silencing: 'TMV प्रोटीन के खोल में बस RNA है। उसका RNA काटना सीधे वायरस पर वार है।',
      salicylic: 'सैलिसिलिक अम्ल RNA साइलेंसिंग को मज़बूत करता है और बचाव पूरे पौधे में फैलाता है।',
      r_gene: 'N जीन TMV के अपने प्रोटीन को पहचानता है: इस वायरस के लिए सटीक चेतावनी।',
      hypersensitive: 'वायरस को अपनी नकल के लिए जीवित कोशिकाएँ चाहिए। मरती कोशिकाएँ उसे छोटे धब्बों में फँसा देती हैं।',
    },
    aphid: {
      jasmonate: 'जैस्मोनिक अम्ल पौधे पर खाने वाले कीटों के लिए उसकी चेतावनी है।',
      volatile_signal: 'अकेले लड़ने के बजाय पौधा माहू के शिकारियों को बुलाता है, जो माहू के सबसे अच्छे नियंत्रक हैं।',
    },
    locust: {
      jasmonate: 'जैस्मोनिक अम्ल चबाने वाले कीटों का जवाब देता है और टैनिन वाला बचाव चालू करता है।',
      tannin: 'झुंड से एक-एक करके नहीं लड़ा जा सकता। पचने में कठिन पत्तियाँ पूरे खेत को खराब भोजन बना देती हैं।',
    },
    amf: {
      strigolactone: 'यह जड़ संकेत वह निमंत्रण है जिसका फफूँद इंतज़ार करती है: इससे उसके तंतु आपकी ओर शाखाएँ बनाते हैं।',
      sugar_exchange: 'फफूँद पौधे की शर्करा के बिना नहीं जी सकती और फ़ॉस्फ़ेट से चुकाती है: एक उचित सौदा।',
    },
    rhizobium: {
      flavonoid: 'फ़्लेवोनॉइड राइज़ोबियम के nod जीन चालू करते हैं, गाँठ बनाने का पहला कदम।',
      sugar_exchange: 'नाइट्रोजन स्थिर करने में बहुत ऊर्जा लगती है; पौधे की शर्करा उसका भुगतान करती है।',
    },
    ladybird: {
      volatile_signal: 'लेडीबर्ड गंध से भोजन खोजती है; गंध का संकेत उसे आपके पास लाता है।',
      salicylic: 'सैलिसिलिक मार्ग मिथाइल सैलिसिलेट बनाता है, वही गंध जिसके पीछे लेडीबर्ड आती है।',
    },
    trichoderma: {
      sugar_exchange: 'ट्राइकोडर्मा उन जड़ों पर रहता है जो उसे खिलाती हैं; शर्करा उसे रुकने का न्योता है।',
      jasmonate: 'जैस्मोनेट संकेत पौधे को ट्राइकोडर्मा को बचाव के सहायक के रूप में अपनाने देता है।',
    },
    termite: {
      latex_resin: 'चिपचिपा लेटेक्स घाव पर ही दीमक के मुँह के अंग चिपका देता है।',
      jasmonate: 'जैस्मोनिक अम्ल कड़वे, ज़हरीले यौगिक जोड़ता है जिनसे चबाने वाले कीट बचते हैं।',
    },
    earthworm: {
      leaf_litter: 'केंचुए गिरी पत्तियाँ खाते हैं; उन्हें सड़ने देना ही उनका न्योता है।',
    },
    beauveria: {
      chitin_cuticle: 'फफूँद को पहले कवच घोलना पड़ता है; मोटा, सख्त कवच उसे दरवाज़े पर ही रोक देता है।',
      melanization: 'मेलानिन घाव बंद करता है और जहाँ फफूँद घुसी वहीं उसे ज़हर देता है।',
      toll_pathway: 'टोल फफूँद के लिए कीट का स्विच है; यही फफूँद-रोधी पेप्टाइड बनाता है।',
      encapsulation: 'रक्त कोशिकाएँ अंदर पहुँचे फफूँद के तंतुओं को लपेट देती हैं।',
      amp: 'रोगाणुरोधी पेप्टाइड शरीर के भीतर फफूँद में छेद कर देते हैं।',
    },
    ascosphaera: {
      social_fever: 'चॉकब्रूड ठंडे शिशुओं पर सबसे अच्छा बढ़ता है; गर्म छत्ता उसे रोक देता है।',
      hygienic: 'संक्रमित लार्वा हटाने से नए बीजाणु नहीं फैलते।',
    },
    paenibacillus: {
      hygienic: 'बीजाणु बनने से पहले बीमार लार्वा हटाने का मतलब है कोई नए बीजाणु नहीं।',
      toll_pathway: 'टोल इस जैसे ग्राम-धनात्मक बैक्टीरिया का स्विच है।',
      amp: 'एबेसिन और डिफ़ेन्सिन जैसे पेप्टाइड बैक्टीरिया को मारते हैं।',
      lysozyme: 'ग्राम-धनात्मक बैक्टीरिया की भित्ति खुली होती है जिसे लाइसोज़ाइम सीधे काटता है।',
    },
    dwv: {
      rnai_antiviral: 'DWV एक RNA वायरस है; डाइसर-2 उसका RNA काटता है।',
      grooming: 'ज़्यादातर DWV वैरोआ माइट से फैलता है; माइट हटाना उसका रास्ता काटना है।',
    },
    varroa: {
      grooming: 'मधुमक्खियाँ एक-दूसरे से माइट काटकर हटाती हैं, जिससे वयस्कों से वे दूर होते हैं।',
      hygienic: 'माइट बंद कोषों में पनपते हैं; कोष खोलकर संक्रमित शिशु हटाने से उनका पनपना रुकता है।',
    },
    serratia: {
      imd_pathway: 'Imd सेराशिया जैसे ग्राम-ऋणात्मक बैक्टीरिया के लिए कीट का स्विच है।',
      amp: 'Imd से बने बैक्टीरिया-रोधी पेप्टाइड इसे रक्त में मारते हैं।',
    },
    gut_core: {
      trophallaxis: 'नन्हीं मधुमक्खियाँ साथियों के साथ भोजन बाँटकर ये बैक्टीरिया पाती हैं।',
      metabolite_exchange: 'आँत के साथी वह शर्करा खाते हैं जिसे मधुमक्खी नहीं पचा सकती और उत्पाद लौटाते हैं।',
    },
    poplar: {
      propolis: 'राल इकट्ठा करके छत्ते में बिछाना पेड़ के अपने बचाव को कॉलोनी का बचाव बना देता है।',
    },
    hornet: {
      heat_balling: 'हॉर्नेट लगभग 46 C पर मर जाता है जबकि मधुमक्खियाँ 48 C सह लेती हैं: गर्मी ही वह हथियार है जिससे छोटी मधुमक्खियाँ जीत सकती हैं।',
      alarm_pheromone: 'एक मधुमक्खी यह नहीं कर सकती; चेतावनी फ़ेरोमोन सैकड़ों को गोला बनाने बुलाता है।',
    },
    strep_pyogenes: {
      igg: 'M प्रोटीन के विरुद्ध IgG उस बैक्टीरियम को उजागर करती है जिसे M प्रोटीन छिपाना चाहता है।',
      complement: 'कॉम्प्लीमेंट एंटीबॉडी से ढके बैक्टीरियम पर खाने का निशान लगाता है।',
      neutrophil: 'न्यूट्रोफ़िल तेज़ भक्षक हैं जो निशान लगे बैक्टीरिया निगलते हैं।',
      macrophage: 'मैक्रोफ़ेज भी निशान लगे बैक्टीरिया खाते हैं: दूसरा रास्ता।',
    },
    influenza: {
      interferon: 'इंटरफ़ेरॉन वायरस के पहुँचने से पहले पड़ोसी कोशिकाओं को चेता देता है।',
      cytotoxic_t: 'वायरस आपकी कोशिकाओं के भीतर छिपता है; केवल किलर T कोशिकाएँ संक्रमित कोशिकाओं को नष्ट करती हैं।',
      iga: 'IgA श्वासनली की सतह पर, ठीक जहाँ वायरस घुसता है, उसे निष्क्रिय करती है।',
    },
    aspergillus: {
      macrophage: 'फेफड़ों के मैक्रोफ़ेज साँस में आए बीजाणुओं को बढ़ने से पहले खा लेते हैं।',
      neutrophil: 'न्यूट्रोफ़िल उन तंतुओं पर हमला करते हैं जो एक कोशिका के निगलने के लिए बहुत बड़े हैं।',
      dectin1: 'डेक्टिन-1 फफूँद की भित्ति का बीटा-ग्लूकान पहचानता है।',
    },
    candida: {
      colonisation_resist: 'प्रतियोगी गायब होने पर कैंडिडा हमलावर बनती है; रहने वाले बैक्टीरिया उसे छोटा रखते हैं।',
      th17: 'Th17 कोशिकाओं का IL-17 न्यूट्रोफ़िल को त्वचा और आँत तक बुलाता है।',
      dectin1: 'डेक्टिन-1 कैंडिडा की भित्ति का ग्लूकान पहचानता है।',
    },
    mtb: {
      macrophage: 'टीबी मैक्रोफ़ेज के भीतर रहता है, इसलिए सक्रिय मैक्रोफ़ेज ही वह जगह हैं जहाँ उसे मरना है।',
      th1: 'Th1 कोशिकाओं का इंटरफ़ेरॉन-गामा मैक्रोफ़ेज की मारक शक्ति खोलता है।',
      granuloma: 'जिसे मारा न जा सके, उसे बंद किया जा सकता है; ग्रैन्युलोमा उसे निष्क्रिय रखता है।',
    },
    anopheles: {
      ige_mast: 'काटने पर प्रतिक्रिया खून पीना असहज और धीमा बना देती है।',
      grooming: 'झटकना मच्छर को खून पीने से पहले ही रोक देता है।',
    },
    plasmodium: {
      sickle_trait: 'HbS की एक प्रति लाल कोशिकाओं को परजीवी के लिए खराब घर बना देती है: प्राकृतिक चयन का अपना जवाब।',
      igg: 'एंटीबॉडी संक्रमित लाल कोशिकाओं पर निशान लगाती हैं।',
      macrophage: 'तिल्ली के मैक्रोफ़ेज संक्रमित लाल कोशिकाओं को हटा देते हैं।',
    },
    bifido: {
      dietary_fiber: 'रेशा ही इसका भोजन है।',
      iga: 'IgA मित्र बैक्टीरिया को आँत की परत पर बसने में मदद करती है।',
    },
    bacteroides: {
      dietary_fiber: 'बैक्टेरॉइडीज़ वह रेशा पचाता है जो आप नहीं पचा सकते।',
      metabolite_exchange: 'बदले में यह आपकी आँत की कोशिकाओं के साथ वसा अम्ल बाँटता है।',
    },
    housefly: {
      sanitation: 'मक्खियाँ कचरे से भोजन तक रोगाणु लाती हैं; शौचालय और ढका भोजन वह रास्ता तोड़ते हैं।',
      grooming: 'झटकने से मक्खियाँ भोजन और त्वचा से दूर रहती हैं।',
    },
    dung_beetle: {
      pastoral_care: 'गोबर में कृमिनाशक दवाएँ भृंग के लार्वा मारती हैं; साफ़ गोबर में भृंग पनपते हैं।',
    },
  },

  bn: {
    phage_lambda: {
      restriction_enzyme: 'ফাজের DNA ঢোকামাত্র এটি কেটে দেয়, তার কোনো জিন পড়ার আগেই। বাইরের DNA-র উপর আর কোনো অংশ এত দ্রুত কাজ করে না।',
      self_methylation: 'এটি তোমার নিজের DNA-তে চিহ্ন দেয়, যাতে রেস্ট্রিকশন উৎসেচক কেবল অনুপ্রবেশকারীকে কাটে। এটি না থাকলে উৎসেচক তোমাকেও কাটত।',
      receptor_change: 'ল্যাম্বডা কেবল LamB দরজায় আটকাতে পারে। LamB বদলে দিলে ফাজ শুরুই করতে পারে না: এক অংশের প্রতিরক্ষা।',
    },
    phage_2972: {
      crispr_spacer: 'এটি ঠিক এই ফাজেরই স্মৃতি। কেবল রাখা স্পেসারই কোষকে ফাজটি তার নিজের DNA ক্রম দেখে চিনতে দেয়।',
      cas_nuclease: 'Cas হল স্পেসার-চালিত কাঁচি। এটি মেলা ফাজ DNA কাটে আর তোমার DNA ছেড়ে দেয়।',
    },
    pseudomonas_aer: {
      quorum_quench: 'সিউডোমোনাস আক্রমণ করে কেবল যখন তার বার্তা বলে "আমরা যথেষ্ট"। বার্তা নষ্ট করলে লড়াই ছাড়াই আক্রমণ থামে।',
      siderophore: 'এর শক্তি লোহা চুরি। তোমার নিজের লোহা-ধরা অণু লোহা ফিরিয়ে নেয়, তাই সে তোমাকে ছাপিয়ে বাড়তে পারে না।',
    },
    streptomyces: {
      efflux_pump: 'স্ট্রেপ্টোমাইসিনকে কাজ করতে তোমার ভেতরে থাকতে হয়। পাম্প রাইবোজোমে পৌঁছানোর আগেই তাকে বাইরে ছুড়ে দেয়।',
      modifying_enzyme: 'এটি স্ট্রেপ্টোমাইসিন অণুটাকেই বদলে দেয়, যাতে তা আর আটকাতে না পারে। স্ট্রেপ্টোমাইসিস নিজেকে এই উৎসেচক দিয়েই রক্ষা করে।',
    },
    myxococcus: {
      biofilm_matrix: 'দলটিকে তোমাকে হজম করতে ছুঁতে হয়। মোটা ভাগ করা পিচ্ছিল স্তর তাকে দূরে রাখে।',
      secondary_metabolite: 'ব্যাসিলিন সরাসরি মিক্সোকক্কাসকে থামায়: রাসায়নিক শিকারির রাসায়নিক জবাব।',
    },
    bacillus_subtilis: {
      biofilm_matrix: 'ব্যাসিলাস বায়োফিল্মে থাকে। একই আস্তরণ বানানোই তার বাসা ভাগ করার উপায়।',
      autoinducer: 'কোরাম সংকেত সম্প্রদায়কে জানায় তুমি তাদেরই একজন, তাই দল তোমাকে গ্রহণ করে।',
    },
    nitrosomonas: {
      metabolite_exchange: 'নাইট্রিফাইং ব্যাকটেরিয়া তাদের উৎপাদন সঙ্গীদের দিয়ে বাঁচে। যে যা বানায় তার আদানপ্রদানই একসঙ্গে থাকার উপায়।',
      biofilm_matrix: 'আদানপ্রদান কাজ করে কেবল সঙ্গীরা কাছাকাছি থাকলে। ভাগ করা বায়োফিল্ম তোমাদের পাশাপাশি রাখে।',
    },
    diatom: {
      metabolite_exchange: 'ডায়াটম রোদে তৈরি শর্করা ছাড়ে; আদানপ্রদানে তুমি তা খেতে পারো, বদলে কিছু দিয়ে।',
      vitamin_b12: 'অনেক ডায়াটম ভিটামিন B12 বানাতে পারে না। তা দেওয়াই একটি ব্যাকটেরিয়ার সবচেয়ে দামি উপহার।',
    },
    lichen: {
      biofilm_matrix: 'ব্যাকটেরিয়া লাইকেনের উপর পাতলা বায়োফিল্ম হয়ে থাকে। তা বানানোই লাইকেনে বসতির উপায়।',
      vitamin_b12: 'লাইকেনের শৈবালের এমন ভিটামিন দরকার যা সে বানাতে পারে না; তোমার B12 তোমাকে স্বাগত সদস্য করে।',
    },
    phytophthora: {
      r_gene: 'ধসা তোমার কোষে বিশেষ প্রোটিন পাঠায়। কেবল R জিনই ঠিক সেই প্রোটিনগুলো চেনে।',
      hypersensitive: 'ধসার খেতে তোমার কোষ জীবিত চাই। আক্রান্ত কোষকে ইচ্ছে করে মেরে ফেললে সে না খেয়ে থাকে।',
    },
    botrytis: {
      jasmonate: 'জ্যাসমোনিক অ্যাসিড ধূসর ছাতার মতো কলা-মারাদের জন্য গাছের সতর্কঘণ্টা; স্যালিসাইলিক অ্যাসিড ভুল সতর্কতা হত।',
      phytoalexin: 'ক্যামালেক্সিন সরাসরি ধূসর ছাতাকে বিষ দেয়। কোষের আত্মহত্যা তাকে খাওয়াত, তাই রাসায়নিক অস্ত্রই সেরা।',
    },
    magnaporthe: {
      pattern_receptor: 'ব্লাস্টের প্রাচীর কাইটিনে ভরা। CEBiP/CERK1 গ্রাহক সেই কাইটিন চিনে আগেভাগে সতর্ক করে।',
      chitinase: 'এটি ব্লাস্ট ছত্রাকের কাইটিন প্রাচীর হজম করে। এখানে কাজ করে কারণ এটি আসল ছত্রাক, নাবি ধসার মতো নয়।',
      callose: 'ছত্রাক একটি জায়গাতেই কীলক ঢোকায়। ঠিক সেখানে ক্যালোজ ছিপি তাকে আটকায়।',
      lignin: 'লিগনিন সেই প্রাচীর শক্ত করে যা কীলককে ভেদ করতে হবে, ঠিক যেখানে চাপ পড়ে।',
      glucanase: 'গ্লুকানেজ ছত্রাকের প্রাচীরের গ্লুকান ভাঙে; কাইটিনেজের সঙ্গে মিলে একার চেয়ে অনেক ভালো প্রাচীর গলায়।',
    },
    ps_syringae: {
      pattern_receptor: 'FLS2 এর ফ্ল্যাজেলিন, অর্থাৎ সাঁতারের লেজ, চেনে, তাই নামামাত্র ধরা পড়ে।',
      stomatal_closure: 'এটি কেবল খোলা পত্ররন্ধ্র দিয়েই ঢুকতে পারে। সেগুলো বন্ধ করা মানে তার একমাত্র দরজা বন্ধ।',
      salicylic: 'স্যালিসাইলিক অ্যাসিড জীবিত পাতায় বাঁচা অণুজীবের, যেমন এই ব্যাকটেরিয়ার, বিরুদ্ধে প্রতিরোধ গড়ে।',
    },
    tmv: {
      rna_silencing: 'TMV প্রোটিনের খোলসে শুধু RNA। তার RNA কাটা মানে সরাসরি ভাইরাসকেই আঘাত।',
      salicylic: 'স্যালিসাইলিক অ্যাসিড RNA সাইলেন্সিং জোরালো করে আর প্রতিরক্ষা পুরো গাছে ছড়ায়।',
      r_gene: 'N জিন TMV-র নিজের প্রোটিন চেনে: এই ভাইরাসের জন্য নিখুঁত সতর্কতা।',
      hypersensitive: 'ভাইরাসের প্রতিলিপি বানাতে জীবিত কোষ চাই। মরা কোষ তাকে ছোট দাগে আটকে রাখে।',
    },
    aphid: {
      jasmonate: 'জ্যাসমোনিক অ্যাসিড গাছ খাওয়া পোকার জন্য গাছের সতর্কঘণ্টা।',
      volatile_signal: 'একা লড়ার বদলে গাছ জাবপোকার শিকারিদের ডাকে, যারা জাবপোকার সেরা নিয়ন্ত্রক।',
    },
    locust: {
      jasmonate: 'জ্যাসমোনিক অ্যাসিড চিবিয়ে খাওয়া পোকার জবাব দেয় আর ট্যানিনের প্রতিরক্ষা চালু করে।',
      tannin: 'ঝাঁকের সঙ্গে একে একে লড়া যায় না। হজম করা কঠিন পাতা পুরো খেতকেই খারাপ খাবার বানায়।',
    },
    amf: {
      strigolactone: 'এই শিকড় সংকেতই সেই নিমন্ত্রণ যার অপেক্ষায় ছত্রাক থাকে: এতে তার সুতো তোমার দিকে শাখা বাড়ায়।',
      sugar_exchange: 'ছত্রাক গাছের শর্করা ছাড়া বাঁচে না, আর ফসফেট দিয়ে শোধ করে: ন্যায্য লেনদেন।',
    },
    rhizobium: {
      flavonoid: 'ফ্ল্যাভোনয়েড রাইজোবিয়ামের nod জিন চালু করে, গুটি তৈরির প্রথম ধাপ।',
      sugar_exchange: 'নাইট্রোজেন বাঁধতে অনেক শক্তি লাগে; গাছের শর্করা তার দাম দেয়।',
    },
    ladybird: {
      volatile_signal: 'লেডিবার্ড গন্ধে খাবার খোঁজে; গন্ধের সংকেত তাকে তোমার কাছে আনে।',
      salicylic: 'স্যালিসাইলিক পথ মিথাইল স্যালিসাইলেট বানায়, ঠিক সেই গন্ধ যা লেডিবার্ড অনুসরণ করে।',
    },
    trichoderma: {
      sugar_exchange: 'ট্রাইকোডার্মা সেই শিকড়ে থাকে যা তাকে খাওয়ায়; শর্করা তাকে থেকে যাওয়ার নিমন্ত্রণ।',
      jasmonate: 'জ্যাসমোনেট সংকেত গাছকে ট্রাইকোডার্মাকে প্রতিরক্ষার সহায়ক হিসেবে গ্রহণ করতে দেয়।',
    },
    termite: {
      latex_resin: 'আঠালো ল্যাটেক্স ক্ষতস্থানেই উইপোকার মুখের অংশ আটকে দেয়।',
      jasmonate: 'জ্যাসমোনিক অ্যাসিড তেতো, বিষাক্ত যৌগ যোগ করে যা চিবিয়ে খাওয়া পোকা এড়িয়ে চলে।',
    },
    earthworm: {
      leaf_litter: 'কেঁচো ঝরা পাতা খায়; সেগুলো পচতে দেওয়াই একমাত্র নিমন্ত্রণ।',
    },
    beauveria: {
      chitin_cuticle: 'ছত্রাককে আগে খোলস গলাতে হয়; মোটা, শক্ত খোলস তাকে দরজাতেই থামায়।',
      melanization: 'মেলানিন ক্ষত বন্ধ করে আর যেখানে ছত্রাক ঢুকেছে সেখানেই তাকে বিষ দেয়।',
      toll_pathway: 'টোল ছত্রাকের জন্য পোকার সুইচ; এটিই ছত্রাকরোধী পেপটাইড বানায়।',
      encapsulation: 'রক্তকোষ ভেতরে ঢোকা ছত্রাকের সুতো মুড়ে ফেলে।',
      amp: 'জীবাণুরোধী পেপটাইড দেহের ভেতরে ছত্রাকে ছিদ্র করে।',
    },
    ascosphaera: {
      social_fever: 'চকব্রুড ঠান্ডা শিশুর উপর সবচেয়ে ভালো বাড়ে; গরম বাসা তাকে থামায়।',
      hygienic: 'আক্রান্ত শূককীট সরালে নতুন রেণু ছড়ায় না।',
    },
    paenibacillus: {
      hygienic: 'রেণু তৈরির আগে অসুস্থ শূককীট সরানো মানে নতুন রেণু নেই।',
      toll_pathway: 'টোল এর মতো গ্রাম-পজিটিভ ব্যাকটেরিয়ার সুইচ।',
      amp: 'অ্যাবেসিন আর ডিফেনসিনের মতো পেপটাইড ব্যাকটেরিয়া মারে।',
      lysozyme: 'গ্রাম-পজিটিভ ব্যাকটেরিয়ার প্রাচীর খোলা থাকে, যা লাইসোজাইম সরাসরি কাটে।',
    },
    dwv: {
      rnai_antiviral: 'DWV একটি RNA ভাইরাস; ডাইসার-2 তার RNA কাটে।',
      grooming: 'বেশিরভাগ DWV ছড়ায় ভ্যারোয়া মাইট দিয়ে; মাইট সরানো মানে তার পথ কাটা।',
    },
    varroa: {
      grooming: 'মৌমাছিরা একে অপরের গা থেকে মাইট কামড়ে সরায়, ফলে পূর্ণাঙ্গদের থেকে তারা দূর হয়।',
      hygienic: 'মাইট বন্ধ কোষে বংশবৃদ্ধি করে; কোষ খুলে আক্রান্ত শিশু সরালে বংশবৃদ্ধি থামে।',
    },
    serratia: {
      imd_pathway: 'Imd হল সেরাটিয়ার মতো গ্রাম-নেগেটিভ ব্যাকটেরিয়ার জন্য পোকার সুইচ।',
      amp: 'Imd পথে তৈরি ব্যাকটেরিয়ারোধী পেপটাইড রক্তে একে মারে।',
    },
    gut_core: {
      trophallaxis: 'কচি মৌমাছিরা সঙ্গীদের সঙ্গে খাবার ভাগ করে এই ব্যাকটেরিয়া পায়।',
      metabolite_exchange: 'অন্ত্রের সঙ্গীরা সেই শর্করা খায় যা মৌমাছি হজম করতে পারে না, আর উৎপাদন ফেরত দেয়।',
    },
    poplar: {
      propolis: 'রজন সংগ্রহ করে মৌচাকে লেপে দিলে গাছের নিজের প্রতিরক্ষা উপনিবেশের প্রতিরক্ষা হয়ে যায়।',
    },
    hornet: {
      heat_balling: 'ভীমরুল প্রায় 46 C-এ মরে, মৌমাছি 48 C সহ্য করে: তাপই সেই অস্ত্র যা দিয়ে ছোট মৌমাছি জিততে পারে।',
      alarm_pheromone: 'একটি মৌমাছি এটা পারে না; সতর্কতা ফেরোমোন শত শত মৌমাছিকে গোলা বানাতে ডাকে।',
    },
    strep_pyogenes: {
      igg: 'M প্রোটিনের বিরুদ্ধে IgG সেই ব্যাকটেরিয়াকে উন্মুক্ত করে যাকে M প্রোটিন লুকোতে চায়।',
      complement: 'কমপ্লিমেন্ট অ্যান্টিবডি-মোড়া ব্যাকটেরিয়ায় খাওয়ার চিহ্ন দেয়।',
      neutrophil: 'নিউট্রোফিল দ্রুত ভক্ষক, যারা চিহ্নিত ব্যাকটেরিয়া গেলে।',
      macrophage: 'ম্যাক্রোফেজও চিহ্নিত ব্যাকটেরিয়া খায়: দ্বিতীয় পথ।',
    },
    influenza: {
      interferon: 'ইন্টারফেরন ভাইরাস পৌঁছানোর আগেই পাশের কোষদের সতর্ক করে।',
      cytotoxic_t: 'ভাইরাস তোমার কোষের ভেতরে লুকোয়; কেবল কিলার T কোষ আক্রান্ত কোষ ধ্বংস করে।',
      iga: 'IgA শ্বাসনালির উপরিতলে, ঠিক যেখানে ভাইরাস ঢোকে, তাকে নিষ্ক্রিয় করে।',
    },
    aspergillus: {
      macrophage: 'ফুসফুসের ম্যাক্রোফেজ শ্বাসে আসা রেণু বাড়ার আগেই খেয়ে ফেলে।',
      neutrophil: 'নিউট্রোফিল সেই সুতোয় আক্রমণ করে যা একটি কোষের গেলার পক্ষে খুব বড়।',
      dectin1: 'ডেকটিন-1 ছত্রাকের প্রাচীরের বিটা-গ্লুকান চেনে।',
    },
    candida: {
      colonisation_resist: 'প্রতিযোগীরা হারিয়ে গেলে ক্যান্ডিডা আক্রমণকারী হয়; বাসিন্দা ব্যাকটেরিয়া তাকে ছোট রাখে।',
      th17: 'Th17 কোষের IL-17 নিউট্রোফিলকে ত্বক আর অন্ত্রে ডাকে।',
      dectin1: 'ডেকটিন-1 ক্যান্ডিডার প্রাচীরের গ্লুকান চেনে।',
    },
    mtb: {
      macrophage: 'যক্ষ্মা ম্যাক্রোফেজের ভেতরে থাকে, তাই সক্রিয় ম্যাক্রোফেজই সেই জায়গা যেখানে তাকে মরতে হবে।',
      th1: 'Th1 কোষের ইন্টারফেরন-গামা ম্যাক্রোফেজের মারণ-শক্তি খুলে দেয়।',
      granuloma: 'যাকে মারা যায় না, তাকে বন্দি করা যায়; গ্রানুলোমা তাকে সুপ্ত রাখে।',
    },
    anopheles: {
      ige_mast: 'কামড়ের প্রতিক্রিয়া রক্ত খাওয়াকে অস্বস্তিকর আর ধীর করে।',
      grooming: 'চাপড় মশাকে রক্ত খাওয়ার আগেই থামায়।',
    },
    plasmodium: {
      sickle_trait: 'HbS-এর একটি কপি লোহিত কণিকাকে পরজীবীর জন্য খারাপ বাসা বানায়: প্রাকৃতিক নির্বাচনের নিজের জবাব।',
      igg: 'অ্যান্টিবডি আক্রান্ত লোহিত কণিকায় চিহ্ন দেয়।',
      macrophage: 'প্লীহার ম্যাক্রোফেজ আক্রান্ত লোহিত কণিকা সরিয়ে দেয়।',
    },
    bifido: {
      dietary_fiber: 'তন্তুই এর খাবার।',
      iga: 'IgA বন্ধু ব্যাকটেরিয়াকে অন্ত্রের আস্তরণে বসতে সাহায্য করে।',
    },
    bacteroides: {
      dietary_fiber: 'ব্যাকটেরয়েডিস সেই তন্তু হজম করে যা তুমি পারো না।',
      metabolite_exchange: 'বদলে এটি তোমার অন্ত্রের কোষের সঙ্গে ফ্যাটি অ্যাসিড ভাগ করে।',
    },
    housefly: {
      sanitation: 'মাছি আবর্জনা থেকে খাবারে জীবাণু আনে; শৌচাগার আর ঢাকা খাবার সেই পথ ভাঙে।',
      grooming: 'তাড়ালে মাছি খাবার আর ত্বক থেকে দূরে থাকে।',
    },
    dung_beetle: {
      pastoral_care: 'গোবরে কৃমিনাশক ওষুধ গুবরে পোকার শূককীট মারে; পরিষ্কার গোবরে পোকারা বাড়ে।',
    },
  },
};
