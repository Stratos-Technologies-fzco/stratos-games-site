"""Bangla barnamala: Swarabarna (11 vowels) and Byanjanbarna (39 consonants).

Each row: (letter, word, letter in English letters, word in English letters,
meaning). The word is the everyday one children learn with the letter
(ক-এ কলা). Letters that never begin a word use a word they appear in
(ঙ in ব্যাঙ, ণ in হরিণ, ং in রং). ঞ has no common word and just says itself.
Children trace the letter, hear it in Bengali and sing its chant
(domino_data.native_chant, singalong.py).
"""

BANGLA_SWAR = [
    ("অ", "অজগর", "o", "ojogor", "python"),
    ("আ", "আম", "aa", "aam", "mango"),
    ("ই", "ইঁদুর", "i", "indur", "mouse"),
    ("ঈ", "ঈগল", "ee", "eegol", "eagle"),
    ("উ", "উট", "u", "ut", "camel"),
    ("ঊ", "ঊষা", "oo", "oosha", "dawn"),
    ("ঋ", "ঋষি", "ri", "rishi", "sage"),
    ("এ", "একতারা", "e", "ektara", "one-string instrument"),
    ("ঐ", "ঐরাবত", "oi", "oirabot", "Indra's elephant"),
    ("ও", "ওল", "o", "ol", "yam"),
    ("ঔ", "ঔষধ", "ou", "oushodh", "medicine"),
]

BANGLA_BYANJAN = [
    ("ক", "কলা", "ko", "kola", "banana"),
    ("খ", "খরগোশ", "kho", "khorgosh", "rabbit"),
    ("গ", "গরু", "go", "goru", "cow"),
    ("ঘ", "ঘড়ি", "gho", "ghori", "clock"),
    ("ঙ", "ব্যাঙ", "ungo", "byang", "frog"),
    ("চ", "চশমা", "cho", "choshma", "spectacles"),
    ("ছ", "ছাতা", "chho", "chhata", "umbrella"),
    ("জ", "জাহাজ", "jo", "jahaj", "ship"),
    ("ঝ", "ঝুড়ি", "jho", "jhuri", "basket"),
    ("ঞ", "", "nyo", "", ""),
    ("ট", "টমেটো", "to", "tometo", "tomato"),
    ("ঠ", "ঠোঁট", "tho", "thont", "lips"),
    ("ড", "ডাব", "do", "daab", "green coconut"),
    ("ঢ", "ঢোল", "dho", "dhol", "drum"),
    ("ণ", "হরিণ", "no", "horin", "deer"),
    ("ত", "তরমুজ", "to", "tormuj", "watermelon"),
    ("থ", "থালা", "tho", "thala", "plate"),
    ("দ", "দই", "do", "doi", "curd"),
    ("ধ", "ধান", "dho", "dhaan", "paddy"),
    ("ন", "নৌকা", "no", "nouka", "boat"),
    ("প", "পাখি", "po", "pakhi", "bird"),
    ("ফ", "ফুল", "pho", "phul", "flower"),
    ("ব", "বই", "bo", "boi", "book"),
    ("ভ", "ভালুক", "bho", "bhaluk", "bear"),
    ("ম", "মাছ", "mo", "maachh", "fish"),
    ("য", "যাঁতা", "jo", "jaanta", "grinding stone"),
    ("র", "রথ", "ro", "roth", "chariot"),
    ("ল", "লাটিম", "lo", "latim", "spinning top"),
    ("শ", "শাপলা", "sho", "shapla", "water lily"),
    ("ষ", "ষাঁড়", "sho", "shaar", "bull"),
    ("স", "সাপ", "sho", "shaap", "snake"),
    ("হ", "হাতি", "ho", "hati", "elephant"),
    ("ড়", "পাহাড়", "ro", "pahar", "hill"),
    ("ঢ়", "আষাঢ়", "rho", "asharh", "a rainy month"),
    ("য়", "ময়ূর", "yo", "moyur", "peacock"),
    ("ৎ", "উৎসব", "khondo to", "utshob", "festival"),
    ("ং", "রং", "onushshor", "rong", "colour"),
    ("ঃ", "নিঃশ্বাস", "bishorgo", "nishshash", "breath"),
    ("ঁ", "চাঁদ", "chondrobindu", "chaand", "moon"),
]


def bangla_items(rows):
  """Catalog rows: the letter with its phrase (ক-এ কলা) to say and show."""
  items = []
  for letter, word, roman, word_roman, meaning in rows:
    if word:
      phrase = f"{letter}-এ {word}"
      desc = f"{roman}-e {word_roman} - {meaning}"
    else:
      phrase, desc = letter, f"{roman} - a nasal sound"
    items.append((letter, desc, ("bangla", (phrase, roman))))
  return items
