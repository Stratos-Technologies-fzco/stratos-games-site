// --- Ecos-Synthetica Q/A Bank & Game Manager ---
const QABank = {
  stages: {
    single_cell: {
      title: "Single Cell",
      questions: [
        {
          id: "sc_01",
          pillar: "Energy flows",
          prompt: "How does the single cell first acquire fuel from its microenvironment?",
          options: [
            "Passive nutrient diffusion across the semi-permeable lipid membrane",
            "Hunting larger multi-cellular organisms directly",
            "Absorbing direct thermal heat as kinetic motion",
            "Extracting electrical current from soil minerals"
          ],
          correct: 0,
          explanation: "At the cellular scale, matter and dissolved organic compounds pass across the lipid bilayer via passive diffusion and transport proteins."
        },
        {
          id: "sc_02",
          pillar: "Nature in front",
          prompt: "Why does a nearby bacteriophage attach to the cell wall?",
          options: [
            "It is completing its replication cycle to avoid extinction",
            "It acts out of targeted malice against the cell",
            "To consume the cell's heat energy entirely",
            "To convert the cell into non-living mineral matter"
          ],
          correct: 0,
          explanation: "Microbes and phages do not act out of malice; their molecular machinery evolved solely to propagate genetic material."
        },
        {
          id: "sc_03",
          pillar: "Three ways of knowing",
          prompt: "How did early naturalists first verify the existence of single-celled life?",
          options: [
            "Direct visual observation using ground-glass lens systems",
            "Ancient philosophical deduction from elemental theories",
            "Gene sequencing assays",
            "Chemical stain spectrography"
          ],
          correct: 0,
          explanation: "Leeuwenhoek handcrafted precision optical lenses, shifting human knowledge from dogma to empirical observation."
        }
      ]
    },
    plant_seedling: {
      title: "Plant Seedling",
      questions: [
        {
          id: "ps_01",
          pillar: "Energy flows",
          prompt: "What primary mechanism allows the seedling to turn solar radiation into chemical energy?",
          options: [
            "Photosynthetic carbon fixation converting sunlight into glucose",
            "Thermal radiation dissipation through stomata",
            "Direct mechanical absorption of wind energy",
            "Root extraction of atmospheric carbon"
          ],
          correct: 0,
          explanation: "Solar photon capture via chlorophyll splits water and fixes carbon dioxide into sugar chains."
        },
        {
          id: "ps_02",
          pillar: "Nature in front",
          prompt: "Why do mycorrhizal fungi colonize the seedling root system?",
          options: [
            "To exchange scavenged soil phosphorus for plant carbohydrates in mutual symbiosis",
            "To rapidly suffocate and digest living root tissue",
            "To steal structural lignin for spore production",
            "To prevent water absorption by neighboring plants"
          ],
          correct: 0,
          explanation: "Fungi trade high-surface-area foraging of minerals in exchange for stable sugars produced by the plant."
        }
      ]
    },
    honey_bee: {
      title: "Honey Bee",
      questions: [
        {
          id: "hb_01",
          pillar: "Energy flows",
          prompt: "How does the bee disperse metabolic energy back into the surrounding ecosystem?",
          options: [
            "Through muscular flight heat loss and active pollination cycles",
            "By sequestering carbohydrates indefinitely inside the hive wax",
            "By transforming floral nectar into inorganic soil minerals",
            "Through complete cellular dormancy during daylight"
          ],
          correct: 0,
          explanation: "Muscular flight dissipates heat while pollen dispersal enables reproduction across trophic webs."
        }
      ]
    },
    human: {
      title: "Human",
      questions: [
        {
          id: "hu_01",
          pillar: "Three ways of knowing",
          prompt: "How did scientific understanding of disease replace the historical 'miasma' theory?",
          options: [
            "Through germ theory validation and controlled pathogen isolation",
            "By attributing illness to unaligned bodily humors and bad air",
            "By relying on traditional planetary alignment charts",
            "By assuming microscopic life arises spontaneously"
          ],
          correct: 0,
          explanation: "Rigorous observation, culturing, and microscopy proved that specific microbes cause infection."
        }
      ]
    }
  },

  // Retrieve all questions for a given stage
  getByStage(stageKey) {
    return this.stages[stageKey]?.questions || [];
  },

  // Retrieve questions filtered by pillar (e.g., 'Energy flows')
  getByPillar(stageKey, pillarName) {
    const list = this.getByStage(stageKey);
    return list.filter(q => q.pillar.toLowerCase() === pillarName.toLowerCase());
  },

  // Check an answer: returns { isCorrect: boolean, explanation: string }
  verifyAnswer(stageKey, questionIndex, selectedIndex) {
    const q = this.stages[stageKey]?.questions[questionIndex];
    if (!q) return null;
    return {
      isCorrect: q.correct === selectedIndex,
      explanation: q.explanation
    };
  }
};

// Expose globally so your game loop / UI can access it anywhere:
window.QABank = QABank;