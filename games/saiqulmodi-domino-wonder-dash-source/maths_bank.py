"""Maths Play question bank: every NCERT Class 1-7 maths chapter.

Pure Python (no drawing): each generator g_<kind>(d) makes one question at
difficulty d (0 easy, 1 middle, 2 hard) and returns a dict:

  kind, scene      which picture mathsgame.py draws (scene_<scene>)
  ask, explain     (English, Hindi, Bengali): the question and the reason
  c                the right answer, as the text on its button
  choices          2-4 button texts (c is one of them)
  speak            {button text: (en, hi, bn)} for word answers (optional)
  eq, steps        the sum shown after the answer, and its breakdown into adding
  ...              numbers the picture needs

Every operation is worked out by adding (add_all / times_by_adding /
share_by_taking_away), the same "unified" view the game shows the child.
CHAPTERS lists each class's chapters and the kinds of question in them.
"""

import math
import random
from fractions import Fraction

# ---------------------------------------------------------------- the addition engine


def add_all(terms):
  total = 0
  for t in terms:
    total += t
  return total


def take_away_by_adding(a, b):
  return add_all([a, -b])


def times_by_adding(group, size):
  return add_all([size] * group)


def share_by_taking_away(n, parts):
  rounds, left = 0, n
  while left >= parts:
    left = add_all([left, -parts])
    rounds = add_all([rounds, 1])
  return rounds


def lcm(a, b):
  m = a
  while m % b:
    m = add_all([m, a])
  return m


def is_prime(n):
  return n > 1 and all(n % d for d in range(2, int(n ** 0.5) + 1))


def factor_pair(n):
  for d in range(int(n ** 0.5), 1, -1):
    if n % d == 0:
      return d, n // d
  return 1, n


# ---------------------------------------------------------------- text helpers
def num(n):
  """A number as shown: Indian commas (12,34,567), a real minus sign."""
  if isinstance(n, float):
    s = f"{n:.2f}".rstrip("0").rstrip(".")
    return s.replace("-", "−")
  neg = n < 0
  s = str(abs(n))
  if len(s) > 3:
    head, tail = s[:-3], s[-3:]
    parts = []
    while len(head) > 2:
      parts.insert(0, head[-2:])
      head = head[:-2]
    if head:
      parts.insert(0, head)
    s = ",".join(parts + [tail])
  return ("−" if neg else "") + s


def intl(n):
  """International commas (1,234,567)."""
  return f"{n:,}"


def L(en, hi, bn, **kw):
  return tuple(x.format(**kw) for x in (en, hi, bn))


def frac(f):
  f = Fraction(f)
  return str(f.numerator) if f.denominator == 1 else f"{f.numerator}/{f.denominator}"


def options(right, wrong, n=4):
  """Button texts: the right one plus up to n-1 different wrong ones, shuffled."""
  out, seen = [right], {right}
  for w in wrong:
    if w not in seen:
      out.append(w)
      seen.add(w)
    if len(out) == n:
      break
  random.shuffle(out)
  return out


def near(c, spread=3, neg=False, step=1):
  """Wrong number answers close to c."""
  cand = [c + k * step for k in range(-spread, spread + 1) if k]
  random.shuffle(cand)
  cand.sort(key=lambda x: abs(x - c))
  return [x for x in cand if neg or x >= 0]


def num_q(kind, scene, ask, explain, c, eq="", steps=None, neg=False, spread=3, step=1,
          wrong=None, **data):
  wrong_vals = wrong if wrong is not None else near(c, spread, neg, step)
  if not neg:                       # a negative wrong answer would give the game away
    wrong_vals = [w for w in wrong_vals if w >= 0] + [w for w in near(c, spread, False, step)]
  q = {"kind": kind, "scene": scene, "ask": ask, "explain": explain, "c": num(c), "val": c,
       "choices": options(num(c), [num(w) for w in wrong_vals if w != c]),
       "eq": eq, "steps": steps}
  q.update(data)
  return q


def word_q(kind, scene, ask, explain, c, wrong, words, eq="", steps=None, n=4, **data):
  """A question whose answers are words; words = {en: (hi, bn)} for speaking."""
  q = {"kind": kind, "scene": scene, "ask": ask, "explain": explain, "c": c,
       "choices": options(c, [w for w in wrong if w != c], n), "eq": eq, "steps": steps,
       "speak": {w: (w, *words.get(w, (w, w))) for w in [c] + list(wrong)}}
  q.update(data)
  return q


def split_dots(n, max_half=6):
  if n <= max_half:
    a = random.randint(0, n) if n > 1 else n
    return a, n - a
  a = random.randint(max(0, n - 9), min(9, n))
  return a, n - a


# Words said for word answers: English -> (Hindi, Bengali)
WORDS = {
    "Circle": ("वृत्त", "বৃত্ত"), "Square": ("वर्ग", "বর্গ"), "Triangle": ("त्रिभुज", "ত্রিভুজ"),
    "Rectangle": ("आयत", "আয়তক্ষেত্র"), "Pentagon": ("पंचभुज", "পঞ্চভুজ"), "Hexagon": ("षट्भुज", "ষড়ভুজ"),
    "Oval": ("अंडाकार", "ডিম্বাকার"), "Star": ("तारा", "তারা"),
    "Cube": ("घन", "ঘনক"), "Cuboid": ("घनाभ", "আয়তঘন"), "Sphere": ("गोला", "গোলক"),
    "Cylinder": ("बेलन", "বেলন"), "Cone": ("शंकु", "শঙ্কু"), "Pyramid": ("पिरामिड", "পিরামিড"),
    "Acute": ("न्यून कोण", "সূক্ষ্মকোণ"), "Right": ("समकोण", "সমকোণ"), "Obtuse": ("अधिक कोण", "স্থূলকোণ"),
    "Straight": ("ऋजु कोण", "সরলকোণ"), "Reflex": ("प्रतिवर्ती कोण", "প্রবৃদ্ধ কোণ"),
    "Parallel": ("समांतर", "সমান্তরাল"), "Perpendicular": ("लंब", "লম্ব"),
    "Intersecting": ("प्रतिच्छेदी", "ছেদী"),
    "Equilateral": ("समबाहु", "সমবাহু"), "Isosceles": ("समद्विबाहु", "সমদ্বিবাহু"),
    "Scalene": ("विषमबाहु", "বিষমবাহু"),
    "Even": ("सम", "জোড়"), "Odd": ("विषम", "বিজোড়"),
    "Yes": ("हाँ", "হ্যাঁ"), "No": ("नहीं", "না"),
    "Profit": ("लाभ", "লাভ"), "Loss": ("हानि", "ক্ষতি"),
    "Monday": ("सोमवार", "সোমবার"), "Tuesday": ("मंगलवार", "মঙ্গলবার"),
    "Wednesday": ("बुधवार", "বুধবার"), "Thursday": ("गुरुवार", "বৃহস্পতিবার"),
    "Friday": ("शुक्रवार", "শুক্রবার"), "Saturday": ("शनिवार", "শনিবার"), "Sunday": ("रविवार", "রবিবার"),
    "Mango": ("आम", "আম"), "Apple": ("सेब", "আপেল"), "Banana": ("केला", "কলা"), "Grapes": ("अंगूर", "আঙুর"),
}
SHAPES2D = {"Circle": 0, "Triangle": 3, "Square": 4, "Rectangle": 4, "Pentagon": 5, "Hexagon": 6,
            "Oval": 0, "Star": 10}
DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
MONTHS = [("January", 31), ("February", 28), ("March", 31), ("April", 30), ("May", 31), ("June", 30),
          ("July", 31), ("August", 31), ("September", 30), ("October", 31), ("November", 30),
          ("December", 31)]
FRUITS = ["Mango", "Apple", "Banana", "Grapes"]
PLURAL = {"Mango": "mangoes", "Apple": "apples", "Banana": "bananas", "Grapes": "bunches of grapes"}


# ================================================================ numbers
def g_count(d):
  c = random.randint(1, (6, 9, 12)[d])
  a, b = split_dots(c, 6)
  return num_q("count", "count", L("How many dots on this domino?", "इस डोमिनो पर कितने बिंदु हैं?",
                                   "এই ডোমিনোতে কতগুলো বিন্দু আছে?"),
               L("{c} dots!", "{c} बिंदु!", "{c}টা বিন্দু!", c=c), c,
               eq=f"{a} + {b} = {c}" if a and b else str(c), a=a, b=b, lit_to=c)


def g_compare(d, fewer=None):
  fewer = random.random() < 0.4 if fewer is None else fewer
  top = (6, 9, 12)[d]
  x, y = random.sample(range(1, top + 1), 2)
  want = min(x, y) if fewer else max(x, y)
  other = y if want == x else x
  ask = (L("Which domino has fewer dots?", "किस डोमिनो पर कम बिंदु हैं?", "কোন ডোমিনোতে কম বিন্দু আছে?")
         if fewer else L("Which domino has more dots?", "किस डोमिनो पर ज़्यादा बिंदु हैं?",
                         "কোন ডোমিনোতে বেশি বিন্দু আছে?"))
  ex = (L("{a} is less than {b}.", "{a}, {b} से कम है।", "{a}, {b}-এর চেয়ে কম।", a=want, b=other) if fewer
        else L("{a} is more than {b}.", "{a}, {b} से ज़्यादा है।", "{a}, {b}-এর চেয়ে বেশি।", a=want, b=other))
  return {"kind": "compare", "scene": "more", "ask": ask, "explain": ex, "tap2": True,
          "c": 0 if want == x else 1, "totals": (x, y), "halves": [split_dots(x, 6), split_dots(y, 6)],
          "eq": f"{want} {'<' if fewer else '>'} {other}", "steps": None, "choices": None}


def g_after(d, before=None):
  before = random.random() < 0.5 if before is None else before
  top = (10, 20, 99)[d]
  a = random.randint(2, top - 1)
  c = add_all([a, -1 if before else 1])
  if before:
    ask = L("What number comes before {a}?", "{a} से पहले कौन-सी संख्या आती है?", "{a}-এর আগে কোন সংখ্যা আসে?", a=a)
    ex = L("{c} comes before {a}.", "{a} से पहले {c} आता है।", "{a}-এর আগে আসে {c}।", a=a, c=c)
  else:
    ask = L("What number comes after {a}?", "{a} के बाद कौन-सी संख्या आती है?", "{a}-এর পরে কোন সংখ্যা আসে?", a=a)
    ex = L("{c} comes after {a}.", "{a} के बाद {c} आता है।", "{a}-এর পরে আসে {c}।", a=a, c=c)
  return num_q("after", "after", ask, ex, c, eq=f"{a} {'−' if before else '+'} 1 = {c}", a=a, before=before)


def g_tens(d):
  t = random.randint(1, (4, 7, 9)[d])
  o = random.randint(1, 9)
  c = add_all([10] * t + [o])
  return num_q("tens", "tens", L("{t} rows of ten and {o} more. How many dominoes?",
                                  "दस-दस की {t} पंक्तियाँ और {o} और। कुल कितने डोमिनो?",
                                  "দশটা করে {t} সারি আর আরও {o}টা। মোট কতগুলো ডোমিনো?", t=t, o=o),
               L("{t} tens and {o} ones make {c}.", "{t} दहाई और {o} इकाई मिलकर {c}।",
                 "{t} দশক আর {o} একক মিলে {c}।", t=t, o=o, c=c), c,
               eq=f"{t} tens + {o} ones = {c}", steps=" + ".join(["10"] * t + [str(o)]) + f" = {c}",
               spread=2, wrong=[c + 10, c - 10, int(f"{o}{t}"), c + 1, c - 1], a=t, b=o)


def g_skip(d):
  step = random.choice([(2, 5, 10), (2, 3, 4, 5, 10), (3, 4, 6, 7, 8, 9, 25)][d])
  start = step * random.randint(0, 3)
  seq = [start + step * k for k in range(5)]
  c = seq[-1]
  return num_q("skip", "seq", L("Count in {s}s. What comes next?", "{s}-{s} करके गिनो। आगे क्या आएगा?",
                                 "{s} করে গোনো। এরপর কী আসবে?", s=step),
               L("Add {s} each time: {c}.", "हर बार {s} जोड़ो: {c}।", "প্রতিবার {s} যোগ করো: {c}।", s=step, c=c), c,
               eq=f"{seq[-2]} + {step} = {c}", step=step, wrong=[c + 1, c - 1, c + step, c - step + 1],
               seq=seq[:-1] + [None])


def g_even_odd(d):
  n = random.randint(*((1, 20), (10, 99), (100, 9999))[d])
  c = "Even" if n % 2 == 0 else "Odd"
  return word_q("even_odd", "pairs", L("Is {n} even or odd?", "{n} सम है या विषम?", "{n} জোড় না বিজোড়?", n=num(n)),
                L("{n} ends in {l}, so it is {w}.", "{n} के अंत में {l} है, इसलिए यह {wh} है।",
                  "{n}-এর শেষে {l}, তাই এটা {wb}।", n=num(n), l=n % 10, w=c.lower(), wh=WORDS[c][0], wb=WORDS[c][1]),
                c, ["Odd" if c == "Even" else "Even"], WORDS, n=2, value=n,
                eq=f"{num(n)} = {c}")


def g_ordinal(d):
  kids = random.randint(5, 8)
  pos = random.randint(1, kids)
  names = {1: "1st", 2: "2nd", 3: "3rd"}
  c = names.get(pos, f"{pos}th")
  wrong = [names.get(p, f"{p}th") for p in range(1, kids + 1) if p != pos]
  random.shuffle(wrong)
  return {"kind": "ordinal", "scene": "queue", "ask": L("Children stand in a line. Where is the child with the star?",
                                                        "बच्चे लाइन में खड़े हैं। तारे वाला बच्चा कौन-से नंबर पर है?",
                                                        "বাচ্চারা লাইনে দাঁড়িয়ে আছে। তারা-ওয়ালা বাচ্চা কত নম্বরে?"),
          "explain": L("The star child is {c} in the line.", "तारे वाला बच्चा लाइन में {c} है।",
                       "তারা-ওয়ালা বাচ্চা লাইনে {c}।", c=c),
          "c": c, "choices": options(c, wrong), "eq": c, "steps": None, "kids": kids, "pos": pos}


def g_number_name(d):
  ones = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven",
          "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"]
  tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"]

  def name(n):
    if n < 20:
      return ones[n]
    if n < 100:
      return tens[n // 10] + ("-" + ones[n % 10] if n % 10 else "")
    return ones[n // 100] + " hundred" + (" " + name(n % 100) if n % 100 else "")
  n = random.randint(*((11, 20), (21, 99), (101, 999))[d])
  words = name(n)
  return num_q("number_name", "words", L("Which number is \"{w}\"?", "\"{w}\" कौन-सी संख्या है?",
                                          "\"{w}\" কোন সংখ্যা?", w=words),
               L("{w} is {n}.", "{w} यानी {n}।", "{w} মানে {n}।", w=words, n=n), n,
               wrong=[int(str(n)[::-1]) if n % 10 else n + 1, n + 10, n - 10, n + 1, n - 1],
               words=words, eq=f"{words} = {n}")


def g_place_value(d):
  n = random.randint(*((10, 99), (100, 999), (1000, 99999), (100000, 9999999))[d + 1 if d else 0])
  digits = str(n)
  k = random.randrange(len(digits))
  while digits[k] == "0":
    k = random.randrange(len(digits))
  place = len(digits) - 1 - k
  value = int(digits[k]) * 10 ** place
  places = ["ones", "tens", "hundreds", "thousands", "ten thousands", "lakhs", "ten lakhs"]
  hi = ["इकाई", "दहाई", "सैकड़ा", "हज़ार", "दस हज़ार", "लाख", "दस लाख"]
  bn = ["একক", "দশক", "শতক", "হাজার", "অযুত", "লক্ষ", "নিযুত"]
  wrong = [int(digits[k]) * 10 ** p for p in range(len(digits)) if p != place] + [int(digits[k])]
  return num_q("place_value", "place", L("What is the value of the digit {g} in {n}?",
                                          "{n} में अंक {g} का स्थानीय मान क्या है?",
                                          "{n}-এ {g} অঙ্কটির স্থানীয় মান কত?", g=digits[k], n=num(n)),
               L("{g} is in the {p} place, so it is worth {v}.", "{g} {ph} के स्थान पर है, इसलिए उसका मान {v}।",
                 "{g} আছে {pb}-এর ঘরে, তাই মান {v}।", g=digits[k], p=places[place], ph=hi[place], pb=bn[place],
                 v=num(value)), value, wrong=wrong, value=n, digit_index=k,
               eq=f"{digits[k]} × {num(10 ** place)} = {num(value)}")


def g_expanded(d):
  n = random.randint(*((21, 99), (101, 999), (1001, 9999))[d])
  parts = [int(ch) * 10 ** (len(str(n)) - 1 - i) for i, ch in enumerate(str(n)) if ch != "0"]
  show = " + ".join(num(p) for p in parts)
  return num_q("expanded", "expr", L("{s}. What number is this?", "{s}। यह कौन-सी संख्या है?",
                                      "{s}। এটা কোন সংখ্যা?", s=show),
               L("Put the parts together: {n}.", "हिस्सों को जोड़ो: {n}।", "অংশগুলো জোড়ো: {n}।", n=num(n)), n,
               show=show + " = ?", eq=f"{show} = {num(n)}", steps=f"{show} = {num(add_all(parts))}",
               wrong=[int(str(n)[::-1]), n + 10 ** (len(str(n)) - 1), n - 1, n + 100, n + 1])


def g_biggest(d):
  top = (99, 9999, 9999999)[d]
  base = random.randint(top // 10 + 1, top)
  s = list(str(base))
  vals = {base}
  for _ in range(40):              # digit shuffles first: the hardest to tell apart
    t = s[:]
    random.shuffle(t)
    v = int("".join(t))
    if t[0] != "0" and top // 10 < v <= top:
      vals.add(v)
    if len(vals) == 4:
      break
  while len(vals) < 4:             # short numbers have few shuffles: add near ones
    v = base + random.randint(-top // 10, top // 10)
    if top // 10 < v <= top:
      vals.add(v)
  vals = list(vals)
  smallest = random.random() < 0.4
  c = min(vals) if smallest else max(vals)
  ask = (L("Which is the smallest number?", "सबसे छोटी संख्या कौन-सी है?", "সবচেয়ে ছোট সংখ্যা কোনটা?") if smallest
         else L("Which is the biggest number?", "सबसे बड़ी संख्या कौन-सी है?", "সবচেয়ে বড় সংখ্যা কোনটা?"))
  return {"kind": "biggest", "scene": "expr", "ask": ask, "show": "  ".join(num(v) for v in vals),
          "explain": L("Compare digit by digit from the left: {c}.", "बाएँ से अंक-दर-अंक तुलना करो: {c}।",
                       "বাঁ দিক থেকে অঙ্ক মিলিয়ে দেখো: {c}।", c=num(c)),
          "c": num(c), "choices": [num(v) for v in vals], "eq": num(c), "steps": None}


def g_round(d):
  to = (10, 100, 1000)[d]
  n = random.randint(to + 1, to * 99)
  if n % to == to // 2:
    n += 1
  c = int(round(n / to) * to)
  return num_q("round", "numline", L("Round {n} to the nearest {t}.", "{n} को निकटतम {t} तक पूर्णांकित करो।",
                                      "{n}-কে নিকটতম {t}-এ পূর্ণসংখ্যা করো।", n=num(n), t=num(to)),
               L("{n} is closer to {c}.", "{n}, {c} के ज़्यादा पास है।", "{n}, {c}-এর বেশি কাছে।", n=num(n), c=num(c)),
               c, wrong=[c + to, c - to, n // to * to if c != n // to * to else c + 2 * to, c + 2 * to],
               value=n, to=to, eq=f"{num(n)} is about {num(c)}")


def g_roman(d):
  vals = [(1000, "M"), (900, "CM"), (500, "D"), (400, "CD"), (100, "C"), (90, "XC"), (50, "L"),
          (40, "XL"), (10, "X"), (9, "IX"), (5, "V"), (4, "IV"), (1, "I")]

  def roman(n):
    out = ""
    for v, s in vals:
      while n >= v:
        out += s
        n -= v
    return out
  n = random.randint(*((1, 20), (10, 100), (40, 500))[d])
  r = roman(n)
  return num_q("roman", "expr", L("What number is the Roman numeral {r}?", "रोमन अंक {r} कौन-सी संख्या है?",
                                   "রোমান সংখ্যা {r} মানে কত?", r=" ".join(r)),
               L("{r} is {n}.", "{r} यानी {n}।", "{r} মানে {n}।", r=" ".join(r), n=n), n, show=r,
               wrong=[n + 1, n - 1, n + 10, n - 10, n + 5], eq=f"{r} = {n}")


# ================================================================ operations
def g_add(d):
  c = random.randint(3, (10, 18, 18)[d])
  a, b = split_dots(c, 9)
  if a == 0 or b == 0:
    a, b = c - 1, 1
  return num_q("add", "add", L("Count the dots: {a} and {b}. How many in all?", "बिंदु गिनो: {a} और {b}। कुल कितने बिंदु?",
                                "বিন্দু গোনো: {a} আর {b}। মোট কতগুলো বিন্দু?", a=a, b=b),
               L("{a} plus {b} is {c}.", "{a} और {b} मिलकर {c}।", "{a} যোগ {b} সমান {c}।", a=a, b=b, c=c),
               add_all([a, b]), eq=f"{a} + {b} = {c}", a=a, b=b, lit_to=c)


def g_topple(d):
  n = random.randint(3, (10, 18, 20)[d])
  k = random.randint(1, n - 1)
  c = take_away_by_adding(n, k)
  return num_q("topple", "topple", L("{n} dominoes stand in a row. {k} fall down. How many are still standing?",
                                      "{n} डोमिनो खड़े हैं। {k} गिर गए। कितने अब भी खड़े हैं?",
                                      "{n}টা ডোমিনো দাঁড়িয়ে আছে। {k}টা পড়ে গেল। কতগুলো এখনও দাঁড়িয়ে আছে?", n=n, k=k),
               L("{n} take away {k} is {c}.", "{n} में से {k} गए, बचे {c}।", "{n} থেকে {k} গেলে থাকে {c}।", n=n, k=k, c=c),
               c, eq=f"{n} − {k} = {c}", steps=f"{n} − {k} = {n} + (−{k}) = {c}" if d == 2 else None,
               a=n, b=k, falls=sorted(random.sample(range(n), k)))


def g_bonds(d):
  c = random.randint(5, (10, 15, 20)[d])
  a = random.randint(1, min(9, c - 1))
  b = take_away_by_adding(c, a)
  if b > 9:
    a, b = c - 9, 9
  return num_q("bonds", "bonds", L("{a} and how many more make {c}?", "{a} और कितने मिलकर {c} बनते हैं?",
                                    "{a} আর কত মিলে {c} হয়?", a=a, c=c),
               L("{a} and {b} make {c}.", "{a} और {b} मिलकर {c}।", "{a} আর {b} মিলে {c}।", a=a, b=b, c=c),
               b, eq=f"{a} + {b} = {c}", a=a, b=b, total=c, lit_to=c)


def _column(kind, d, sub):
  digits = (2, 3, 4)[d]
  lo, hi = 10 ** (digits - 1), 10 ** digits - 1
  a, b = random.randint(lo, hi), random.randint(lo, hi)
  if sub:
    a, b = max(a, b), min(a, b)
    if a == b:
      a += 1
    c = take_away_by_adding(a, b)
    ask = L("{a} take away {b}. Work it out in columns.", "{a} में से {b} घटाओ। कॉलम में हल करो।",
            "{a} থেকে {b} বিয়োগ করো। কলামে কষে দেখো।", a=num(a), b=num(b))
    ex = L("{a} − {b} = {c}. Borrow from the next column when needed.",
           "{a} − {b} = {c}। ज़रूरत हो तो अगले कॉलम से उधार लो।",
           "{a} − {b} = {c}। দরকার হলে পাশের কলাম থেকে ধার নাও।", a=num(a), b=num(b), c=num(c))
    steps = f"{num(a)} + (−{num(b)}) = {num(c)}"
  else:
    if digits == 4 and a + b > 9999:
      b = 9999 - a if 9999 - a >= lo else lo
    c = add_all([a, b])
    ask = L("{a} plus {b}. Work it out in columns.", "{a} और {b} जोड़ो। कॉलम में हल करो।",
            "{a} আর {b} যোগ করো। কলামে কষে দেখো।", a=num(a), b=num(b))
    ex = L("{a} + {b} = {c}. Carry 1 when a column makes 10 or more.",
           "{a} + {b} = {c}। किसी कॉलम में 10 या ज़्यादा हो तो 1 हासिल आगे ले जाओ।",
           "{a} + {b} = {c}। কোনো কলামে 10 বা বেশি হলে হাতে 1 নিয়ে যাও।", a=num(a), b=num(b), c=num(c))
    steps = None
  return num_q(kind, "column", ask, ex, c, eq=f"{num(a)} {'−' if sub else '+'} {num(b)} = {num(c)}", steps=steps,
               wrong=[c + 10, c - 10, c + 1, c - 1, c + 100, c - 100], a=a, b=b, op="−" if sub else "+")


def g_col_add(d):
  return _column("col_add", d, False)


def g_col_sub(d):
  return _column("col_sub", d, True)


def g_times(d):
  g = random.randint(2, (5, 7, 10)[d])
  p = random.randint(1, (5, 7, 10)[d])
  c = times_by_adding(g, p)
  return num_q("times", "times", L("{g} dominoes with {p} dots each. How many dots in all?",
                                    "{g} डोमिनो, हर एक पर {p} बिंदु। कुल कितने बिंदु?",
                                    "{g}টা ডোমিনো, প্রতিটিতে {p}টা বিন্দু। মোট কতগুলো বিন্দু?", g=g, p=p),
               L("{p} added {g} times is {c}.", "{p} को {g} बार जोड़ो तो {c}।", "{p} কে {g} বার যোগ করলে {c}।", g=g, p=p, c=c),
               c, eq=f"{g} × {p} = {c}", steps=" + ".join([str(p)] * g) + f" = {c}",
               wrong=[c + p, c - p, c + 1, c - 1, c + g], a=g, b=p, halves=split_dots(p, 6))


def g_tables(d):
  t = random.randint(2, (5, 10, 12)[d])
  k = random.randint(2, 10)
  c = times_by_adding(k, t)
  return num_q("tables", "expr", L("{t} times {k}?", "{t} गुणा {k}?", "{t} গুণ {k}?", t=t, k=k),
               L("{t} times {k} is {c}.", "{t} गुणा {k} बराबर {c}।", "{t} গুণ {k} সমান {c}।", t=t, k=k, c=c),
               c, show=f"{t} × {k} = ?", eq=f"{t} × {k} = {c}",
               steps=" + ".join([str(t)] * k) + f" = {c}" if k <= 6 else None,
               wrong=[c + t, c - t, c + k, c - 1, c + 1])


def g_mult(d):
  a = random.randint(*((11, 49), (12, 99), (101, 999))[d])
  b = random.randint(*((2, 9), (11, 30), (11, 99))[d])
  c = a * b
  tens, ones = divmod(b, 10)
  if tens:
    steps = f"{num(a)} × {tens * 10} + {num(a)} × {ones} = {num(a * tens * 10)} + {num(a * ones)} = {num(c)}"
  else:
    steps = f"{num(a)} × {b} = " + " + ".join([num(a)] * b) + f" = {num(c)}" if b <= 4 else None
  return num_q("mult", "expr", L("{a} times {b}?", "{a} गुणा {b}?", "{a} গুণ {b}?", a=num(a), b=b),
               L("{a} times {b} is {c}.", "{a} गुणा {b} बराबर {c}।", "{a} গুণ {b} সমান {c}।", a=num(a), b=b, c=num(c)),
               c, show=f"{num(a)} × {b} = ?", eq=f"{num(a)} × {b} = {num(c)}", steps=steps,
               wrong=[c + a, c - a, c + 10, c - 10, c + b])


def g_share(d):
  g = random.randint(2, (4, 5, 6)[d])
  each = random.randint(1, (5, 6, 8)[d])
  n = times_by_adding(g, each)
  c = share_by_taking_away(n, g)
  return num_q("share", "share", L("{n} laddoos shared equally by {g} friends. How many does each friend get?",
                                    "{n} लड्डू {g} दोस्तों में बराबर बाँटे। हर दोस्त को कितने मिलेंगे?",
                                    "{n}টা লাড্ডু {g} বন্ধুর মধ্যে সমান ভাগ করা হল। প্রত্যেকে কতগুলো পাবে?", n=n, g=g),
               L("{n} shared by {g} is {c} each.", "{n} को {g} में बाँटो तो हर एक को {c}।",
                 "{n} কে {g} জনে ভাগ করলে প্রত্যেকে {c}টা।", n=n, g=g, c=c),
               c, eq=f"{n} ÷ {g} = {c}", steps=f"{n} " + " ".join([f"− {g}"] * c) + f" = 0, so {c} rounds",
               a=n, b=g)


def g_divide(d):
  b = random.randint(2, (5, 9, 12)[d])
  q = random.randint(2, (10, 30, 99)[d])
  r = random.randint(0, b - 1) if d else 0
  a = add_all([times_by_adding(q, b), r])
  c = f"{q} r {r}" if r else str(q)
  wrong = [f"{q + 1} r {r}" if r else str(q + 1), f"{q - 1} r {r}" if r else str(q - 1),
           f"{q} r {(r + 1) % b}" if r else str(q + 2), f"{q} r {max(0, r - 1)}" if r > 1 else str(q * 2)]
  ex = (L("{a} ÷ {b} = {q}, and {r} is left over.", "{a} ÷ {b} = {q}, और {r} शेष बचा।",
          "{a} ÷ {b} = {q}, আর {r} অবশিষ্ট থাকে।", a=a, b=b, q=q, r=r) if r
        else L("{a} ÷ {b} = {q}.", "{a} ÷ {b} = {q}।", "{a} ÷ {b} = {q}।", a=a, b=b, q=q))
  return {"kind": "divide", "scene": "expr", "ask": L("{a} divided by {b}?", "{a} को {b} से भाग दो?",
                                                      "{a} কে {b} দিয়ে ভাগ করো?", a=a, b=b),
          "explain": ex, "show": f"{a} ÷ {b} = ?", "c": c, "choices": options(c, wrong),
          "eq": f"{a} ÷ {b} = {c}".replace(" r ", " remainder "),
          "steps": f"{b} × {q} = {b * q}" + (f", {a} − {b * q} = {r} left" if r else ""),
          "speak": {w: (w.replace(" r ", " remainder "), w.replace(" r ", " शेष "), w.replace(" r ", " অবশিষ্ট "))
                    for w in [c] + wrong}}


def g_multiple(d):
  a, b = random.choice([(2, 3), (2, 5), (3, 4), (3, 5), (2, 7), (4, 5), (4, 6), (3, 6), (2, 9), (5, 6), (3, 8),
                        (6, 8), (4, 10)])
  c = lcm(a, b)
  pool = [n for n in range(2, c + 12) if n != c and not (n % a == 0 and n % b == 0)]
  near_ = sorted(pool, key=lambda n: (n % a != 0 and n % b != 0, abs(n - c)))[:6]
  q = num_q("multiple", "multiple", L("Factor gate! Which number is in both the {a} table and the {b} table?",
                                       "फ़ैक्टर गेट! कौन-सी संख्या {a} और {b} दोनों के पहाड़े में है?",
                                       "ফ্যাক্টর গেট! কোন সংখ্যা {a} আর {b} দুটো নামতাতেই আছে?", a=a, b=b),
            L("{c} is in the {a} table and in the {b} table.", "{c}, {a} और {b} दोनों के पहाड़े में है।",
              "{c}, {a} আর {b} দুটো নামতাতেই আছে।", a=a, b=b, c=c),
            c, wrong=random.sample(near_, 3), eq=f"{a} × {c // a} = {c} = {b} × {c // b}", a=a, b=b)
  q["c_int"] = c
  return q


def g_factor(d):
  n = random.choice([(6, 8, 10, 12, 15), (18, 20, 24, 28, 30), (36, 40, 42, 48, 60)][d])
  fs = [k for k in range(2, n) if n % k == 0]
  c = random.choice(fs)
  wrong = [k for k in range(2, n) if n % k][:12]
  random.shuffle(wrong)
  a, b = c, n // c
  return num_q("factor", "array", L("Which number is a factor of {n}?", "इनमें से {n} का गुणनखंड कौन-सा है?",
                                     "এর মধ্যে {n}-এর উৎপাদক কোনটা?", n=n),
               L("{c} times {b} is {n}, so {c} is a factor.", "{c} गुणा {b} बराबर {n}, इसलिए {c} गुणनखंड है।",
                 "{c} গুণ {b} সমান {n}, তাই {c} একটা উৎপাদক।", c=c, b=b, n=n), c,
               wrong=wrong, eq=f"{c} × {b} = {n}", rows=a, cols=b, value=n)


def g_hcf(d):
  g = random.choice([(2, 3, 4, 5), (4, 6, 8), (6, 8, 9, 12)][d])
  x, y = random.sample([2, 3, 5, 7], 2) if d else random.sample([2, 3, 5], 2)
  a, b = g * x, g * y
  c = math.gcd(a, b)
  return num_q("hcf", "expr", L("What is the biggest number that divides both {a} and {b}?",
                                 "वह सबसे बड़ी संख्या कौन-सी है जो {a} और {b} दोनों को पूरा भाग दे?",
                                 "কোন সবচেয়ে বড় সংখ্যা {a} আর {b} দুটোকেই নিঃশেষে ভাগ করে?", a=a, b=b),
               L("The HCF of {a} and {b} is {c}.", "{a} और {b} का म.स. {c} है।", "{a} আর {b}-এর গ.সা.গু. {c}।",
                 a=a, b=b, c=c), c, show=f"HCF ({a}, {b}) = ?", eq=f"{a} = {c} × {x},  {b} = {c} × {y}",
               wrong=[c * 2, c // 2 if c > 2 else c + 1, 1, x, y, c + 2])


def g_divisible(d):
  k = random.choice([(2, 5, 10), (3, 9, 4), (6, 8, 11)][d])
  c = k * random.randint(3, (20, 50, 120)[d])
  wrong = []
  while len(wrong) < 3:
    w = c + random.randint(-30, 30)
    if w > 0 and w % k and w not in wrong:
      wrong.append(w)
  rule = {2: "it ends in an even digit", 5: "it ends in 0 or 5", 10: "it ends in 0",
          3: "its digits add up to a multiple of 3", 9: "its digits add up to a multiple of 9",
          4: "its last two digits make a multiple of 4", 6: "it can be divided by 2 and by 3",
          8: "its last three digits make a multiple of 8", 11: "it divides exactly by 11"}[k]
  return num_q("divisible", "expr", L("Which number can be divided by {k} exactly?",
                                       "किस संख्या को {k} से पूरा भाग दिया जा सकता है?",
                                       "কোন সংখ্যাকে {k} দিয়ে নিঃশেষে ভাগ করা যায়?", k=k),
               L("{c} works: {r}.", "{c} पूरा बँटता है।", "{c} নিঃশেষে ভাগ হয়।", c=num(c), r=rule), c,
               wrong=wrong, show=f"÷ {k}", eq=f"{num(c)} ÷ {k} = {num(c // k)}")


def g_prime(d):
  p = random.choice([2, 3, 5, 7, 11, 13] if d == 0 else [11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47])
  comps = [n for n in range(4, 52) if not is_prime(n) and abs(n - p) <= 14]
  q = num_q("prime", "prime", L("Prime shield! Which number is a prime number?",
                                 "प्राइम शील्ड! इनमें अभाज्य संख्या कौन-सी है?",
                                 "প্রাইম শিল্ড! এর মধ্যে মৌলিক সংখ্যা কোনটা?"),
            L("{c} is prime. Only 1 times {c} makes it.", "{c} अभाज्य है। सिर्फ़ 1 गुणा {c} से बनता है।",
              "{c} মৌলিক। শুধু 1 গুণ {c} দিয়েই হয়।", c=p), p, wrong=random.sample(comps, 3),
            eq=f"{p} = 1 × {p}  (prime shield)")
  q["c_int"] = p
  return q


def g_prime_factor(d):
  n = random.choice([(12, 18, 20, 8), (24, 30, 36, 28), (48, 60, 72, 90)][d])
  fs, m, k = [], n, 2
  while m > 1:
    while m % k == 0:
      fs.append(k)
      m //= k
    k += 1
  c = " × ".join(map(str, fs))
  wrong = []
  for a, b in [factor_pair(n)]:
    wrong.append(f"{a} × {b}")
  alt = fs[:]
  alt[-1] = alt[-1] + 1
  wrong.append(" × ".join(map(str, alt)))
  wrong.append(" × ".join(map(str, fs[:-1] + [fs[-1], 2])))
  wrong.append(" × ".join(map(str, fs[1:])))
  return {"kind": "prime_factor", "scene": "tree", "ask": L("Break {n} into prime numbers only.",
                                                            "{n} को सिर्फ़ अभाज्य संख्याओं में तोड़ो।",
                                                            "{n}-কে শুধু মৌলিক সংখ্যায় ভাঙো।", n=n),
          "explain": L("{n} = {c}. Every one of them is prime.", "{n} = {c}। ये सभी अभाज्य हैं।",
                       "{n} = {c}। এদের সবকটাই মৌলিক।", n=n, c=c),
          "c": c, "choices": options(c, wrong), "eq": f"{n} = {c}", "steps": None, "value": n, "factors": fs}


def g_bodmas(d):
  a, b, c_ = random.randint(2, 9), random.randint(2, 9), random.randint(2, 9)
  form = random.choice([0, 1] if d == 0 else [0, 1, 2, 3])
  if form == 0:
    show, val, steps = f"{a} + {b} × {c_}", a + b * c_, f"{b} × {c_} = {b * c_} first, then {a} + {b * c_}"
    wrong = [(a + b) * c_]
  elif form == 1:
    show, val, steps = f"({a} + {b}) × {c_}", (a + b) * c_, f"({a} + {b}) = {a + b} first, then × {c_}"
    wrong = [a + b * c_]
  elif form == 2:
    big = a * b + c_
    show, val, steps = f"{big} − {a} × {b}", big - a * b, f"{a} × {b} = {a * b} first, then {big} − {a * b}"
    wrong = [(big - a) * b]
  else:
    show, val, steps = f"{a * c_} ÷ {c_} + {b}", a + b, f"{a * c_} ÷ {c_} = {a} first, then + {b}"
    wrong = [a * c_ // (c_ + b) if c_ + b else 1]
  return num_q("bodmas", "expr", L("Work it out: {s}. Brackets first, then times and divide, then plus and minus.",
                                    "हल करो: {s}। पहले कोष्ठक, फिर गुणा-भाग, फिर जोड़-घटाव।",
                                    "সমাধান করো: {s}। আগে বন্ধনী, তারপর গুণ-ভাগ, তারপর যোগ-বিয়োগ।", s=show),
               L("The answer is {v}.", "उत्तर {v} है।", "উত্তর {v}।", v=val), val, show=show + " = ?",
               eq=f"{show} = {val}", steps=steps, wrong=wrong + [val + 1, val - 1, val + 2])


def g_exponent(d):
  base = random.choice([(2, 3, 10), (2, 3, 4, 5, 10), (2, 3, 5, 6, 7)][d])
  e = random.randint(2, (3, 4, 5)[d] if base < 10 else 4)
  c = base ** e
  return num_q("exponent", "expr", L("{b} to the power {e}?", "{b} की घात {e}?", "{b}-এর ঘাত {e}?", b=base, e=e),
               L("Multiply {b} by itself {e} times: {c}.", "{b} को {e} बार आपस में गुणा करो: {c}।",
                 "{b} কে {e} বার নিজের সঙ্গে গুণ করো: {c}।", b=base, e=e, c=num(c)), c,
               show=f"{base}^{e} = ?", eq=f"{base}^{e} = {num(c)}",
               steps=" × ".join([str(base)] * e) + f" = {num(c)}",
               wrong=[base * e, c * base, c // base, c + base, base + e])


def g_integer(d):
  form = random.choice(["plus", "minus", "minus_neg"] + (["times"] if d == 2 else []))
  if form == "plus":
    a, b = random.randint(-3, 8), random.randint(1, 9)
    c = add_all([a, -b])
    show, steps = f"{num(a)} + (−{b})", f"{num(a)} + (−{b}) = {num(c)}"
    ask = L("{a} plus negative {b}. Where do we land?", "{a} में ऋण {b} जोड़ो। हम कहाँ पहुँचेंगे?",
            "{a}-এর সাথে ঋণাত্মক {b} যোগ করো। আমরা কোথায় পৌঁছাব?", a=a, b=b)
  elif form == "minus":
    a, b = random.randint(0, 6), random.randint(1, 9)
    c = take_away_by_adding(a, b)
    show, steps = f"{a} − {b}", f"{a} − {b} = {a} + (−{b}) = {num(c)}"
    ask = L("{a} minus {b}. Where do we land?", "{a} में से {b} घटाओ। हम कहाँ पहुँचेंगे?",
            "{a} থেকে {b} বিয়োগ করো। আমরা কোথায় পৌঁছাব?", a=a, b=b)
  elif form == "minus_neg":
    a, b = random.randint(-6, 5), random.randint(1, 5)
    c = add_all([a, b])
    show, steps = f"{num(a)} − (−{b})", f"{num(a)} − (−{b}) = {num(a)} + {b} = {num(c)}"
    ask = L("{a} minus negative {b}. Where do we land?", "{a} में से ऋण {b} घटाओ। हम कहाँ पहुँचेंगे?",
            "{a} থেকে ঋণাত্মক {b} বিয়োগ করো। আমরা কোথায় পৌঁছাব?", a=a, b=b)
  else:
    a, b = -random.randint(2, 6), random.randint(2, 5)
    c = times_by_adding(b, a)
    show, steps = f"{b} × ({num(a)})", " + ".join([f"({num(a)})"] * b) + f" = {num(c)}"
    ask = L("{b} times negative {a}?", "{b} गुणा ऋण {a}?", "{b} গুণ ঋণাত্মক {a}?", a=abs(a), b=b)
  return num_q("integer", "integer" if form != "times" else "expr", ask,
               L("We land on {c}.", "हम {c} पर पहुँचे।", "আমরা {c}-এ পৌঁছালাম।", c=c), c, neg=True,
               show=show + " = ?", eq=f"{show} = {num(c)}", steps=steps, a=a, b=b, form=form)


# ================================================================ fractions, decimals, percent
def g_frac_shade(d):
  den = random.choice([(2, 4), (2, 3, 4, 6, 8), (3, 5, 6, 8, 10, 12)][d])
  n = random.randint(1, den - 1)
  shape = random.choice(["pie", "bar"])
  c = frac(Fraction(n, den)) if d else f"{n}/{den}"
  c = f"{n}/{den}"
  wrong = [f"{den - n}/{den}", f"{n}/{den + 1}", f"{n + 1}/{den}" if n + 1 < den else f"{n}/{den + 2}",
           f"{den}/{n}"]
  return {"kind": "frac_shade", "scene": "fraction", "ask": L("What part is coloured?", "कितना भाग रंगा है?",
                                                              "কতটা অংশ রঙ করা?"),
          "explain": L("{n} of the {d} equal parts: {n}/{d}.", "{d} बराबर भागों में से {n}: {n}/{d}।",
                       "{d}টা সমান ভাগের {n}টা: {n}/{d}।", n=n, d=den),
          "c": c, "choices": options(c, wrong), "eq": f"{n}/{den}", "steps": None, "num": n, "den": den,
          "shape": shape}


def g_frac_equiv(d):
  a, b = random.choice([(1, 2), (1, 3), (2, 3), (1, 4), (3, 4), (2, 5), (3, 5)])
  k = random.randint(2, (3, 4, 6)[d])
  c = a * k
  return num_q("frac_equiv", "expr", L("{a} over {b} is the same as how many over {bk}?",
                                        "{a} बटा {b}, कितने बटा {bk} के बराबर है?",
                                        "{a} বাই {b}, কত বাই {bk}-এর সমান?", a=a, b=b, bk=b * k),
               L("Multiply top and bottom by {k}: {c}/{bk}.", "ऊपर और नीचे दोनों को {k} से गुणा करो: {c}/{bk}।",
                 "উপর আর নিচ দুটোকেই {k} দিয়ে গুণ করো: {c}/{bk}।", k=k, c=c, bk=b * k), c,
               show=f"{a}/{b} = ?/{b * k}", eq=f"{a}/{b} = {c}/{b * k}", wrong=[c + 1, c - 1, b * k - c, a + k],
               num=a, den=b, k=k)


def g_frac_compare(d):
  if d == 0:
    den = random.randint(3, 8)
    x, y = random.sample(range(1, den), 2)
    fs = [Fraction(x, den), Fraction(y, den)]
  else:
    while True:
      fs = [Fraction(random.randint(1, 5), random.randint(2, 8)) for _ in range(2)]
      if fs[0] != fs[1] and all(f < 1 for f in fs):
        break
  texts = [f"{f.numerator}/{f.denominator}" for f in fs]
  big = max(range(2), key=lambda i: fs[i])
  return {"kind": "frac_compare", "scene": "fraction2", "ask": L("Which is bigger?", "कौन-सा बड़ा है?",
                                                                 "কোনটা বড়?"),
          "explain": L("{a} is bigger than {b}.", "{a}, {b} से बड़ा है।", "{a}, {b}-এর চেয়ে বড়।",
                       a=texts[big], b=texts[1 - big]),
          "c": texts[big], "choices": texts[:], "eq": f"{texts[big]} > {texts[1 - big]}", "steps": None,
          "fracs": [(f.numerator, f.denominator) for f in fs]}


def g_frac_add(d):
  if d < 2:
    den = random.randint(3, 10)
    a, b = random.randint(1, den - 2), 1
    b = random.randint(1, den - a - 1) if den - a - 1 >= 1 else 1
    r = Fraction(a + b, den)
    show = f"{a}/{den} + {b}/{den}"
    c = f"{a + b}/{den}"
    steps = f"{a}/{den} + {b}/{den} = ({a} + {b})/{den} = {c}"
    wrong = [f"{a + b}/{den * 2}", f"{a * b}/{den}", f"{a + b + 1}/{den}", f"{abs(a - b)}/{den}"]
    if d == 1 and random.random() < 0.5:     # take away
      a, b = max(a, b) + 1, min(a, b)
      a = min(a, den - 1)
      show, c = f"{a}/{den} − {b}/{den}", f"{a - b}/{den}"
      steps = f"{a}/{den} + (−{b}/{den}) = {c}"
      wrong = [f"{a - b}/0" if False else f"{a + b}/{den}", f"{a - b + 1}/{den}", f"{a - b}/{den * 2}",
               f"{max(1, a - b - 1)}/{den}"]
  else:
    d1, d2 = random.sample([2, 3, 4, 5, 6], 2)
    f1, f2 = Fraction(1, d1), Fraction(1, d2)
    r = f1 + f2
    show = f"1/{d1} + 1/{d2}"
    c = frac(r)
    l_ = lcm(d1, d2)
    steps = f"{l_ // d1}/{l_} + {l_ // d2}/{l_} = {c}"
    wrong = [f"2/{d1 + d2}", frac(r + Fraction(1, l_)), frac(abs(r - Fraction(1, l_))), f"1/{l_}"]
  return {"kind": "frac_add", "scene": "expr", "ask": L("Work it out: {s}.", "हल करो: {s}।", "সমাধান করো: {s}।", s=show),
          "explain": L("The answer is {c}.", "उत्तर {c} है।", "উত্তর {c}।", c=c), "show": show + " = ?",
          "c": c, "choices": options(c, wrong), "eq": f"{show} = {c}", "steps": steps}


def g_frac_of(d):
  den = random.choice([(2, 4), (2, 3, 4, 5), (3, 4, 5, 6, 8)][d])
  numr = 1 if d == 0 else random.randint(1, den - 1)
  each = random.randint(2, (6, 8, 12)[d])
  n = den * each
  c = numr * each
  return num_q("frac_of", "share", L("What is {a}/{b} of {n}?", "{n} का {a}/{b} कितना है?", "{n}-এর {a}/{b} কত?",
                                      a=numr, b=den, n=n),
               L("Share {n} into {b} equal parts: {e} each. {a} parts make {c}.",
                 "{n} को {b} बराबर भागों में बाँटो: हर भाग {e}। {a} भाग मिलकर {c}।",
                 "{n}-কে {b}টা সমান ভাগে ভাগ করো: প্রতিটি {e}। {a}টা ভাগ মিলে {c}।", n=n, b=den, e=each, a=numr, c=c),
               c, eq=f"{numr}/{den} of {n} = {c}", steps=f"{n} ÷ {den} = {each}, {each} × {numr} = {c}",
               wrong=[each, n - c, c + each, c + 1], a=n, b=den)


def g_dec_add(d):
  a = round(random.randint(1, (50, 99, 999)[d]) / (10 if d < 2 else 100), 2)
  b = round(random.randint(1, (50, 99, 999)[d]) / (10 if d < 2 else 100), 2)
  sub = d >= 1 and random.random() < 0.5
  if sub:
    a, b = max(a, b), min(a, b)
    if a == b:
      a = round(a + 1, 2)
  c = round(a - b if sub else a + b, 2)
  op = "−" if sub else "+"
  return num_q("dec_add", "expr", L("Work it out: {a} {o} {b}.", "हल करो: {a} {o} {b}।", "সমাধান করো: {a} {o} {b}।",
                                     a=num(a), o="minus" if sub else "plus", b=num(b)),
               L("Line up the decimal points: {c}.", "दशमलव बिंदु एक सीध में रखो: {c}।",
                 "দশমিক বিন্দু এক সারিতে রাখো: {c}।", c=num(c)), c,
               show=f"{num(a)} {op} {num(b)} = ?", eq=f"{num(a)} {op} {num(b)} = {num(c)}",
               wrong=[round(c + 0.1, 2), round(c - 0.1, 2), round(c + 1, 2), round(c * 10, 2) if c < 10 else round(c + 0.01, 2)])


def g_dec_compare(d):
  vals = set()
  while len(vals) < 4:
    vals.add(round(random.randint(1, 99) / random.choice([10, 100]) + random.randint(0, 2 if d else 0), 2))
  vals = list(vals)
  c = max(vals)
  return {"kind": "dec_compare", "scene": "expr", "ask": L("Which is the biggest?", "सबसे बड़ा कौन-सा है?",
                                                          "সবচেয়ে বড় কোনটা?"),
          "explain": L("Compare the whole part, then tenths, then hundredths: {c}.",
                       "पहले पूरा भाग, फिर दशांश, फिर शतांश की तुलना करो: {c}।",
                       "আগে পূর্ণ অংশ, তারপর দশমাংশ, তারপর শতাংশ মেলাও: {c}।", c=num(c)),
          "show": "  ".join(num(v) for v in vals), "c": num(c), "choices": [num(v) for v in vals],
          "eq": num(c), "steps": None}


def g_dec_shift(d):
  a = round(random.randint(11, 999) / (10 if d < 2 else 100), 2)
  k = random.choice([10, 100] if d else [10])
  div = d == 2 and random.random() < 0.5
  c = round(a / k if div else a * k, 4)
  op = "÷" if div else "×"
  return num_q("dec_shift", "expr", L("{a} {o} {k}?", "{a} {o} {k}?", "{a} {o} {k}?", a=num(a),
                                       o="divided by" if div else "times", k=k),
               L("The point moves {n} place{s} {w}: {c}.", "दशमलव {n} स्थान {wh} खिसकता है: {c}।",
                 "দশমিক {n} ঘর {wb} সরে: {c}।", n=len(str(k)) - 1, s="" if k == 10 else "s",
                 w="left" if div else "right", wh="बाएँ" if div else "दाएँ", wb="বাঁয়ে" if div else "ডানে",
                 c=num(c)), c, show=f"{num(a)} {op} {k} = ?", eq=f"{num(a)} {op} {k} = {num(c)}",
               wrong=[round(c * 10, 4), round(c / 10, 4), round(a + k, 2), round(c * 100, 4)])


def g_frac_to_dec(d):
  f = random.choice([(1, 2), (1, 4), (3, 4), (1, 5), (2, 5), (1, 10), (3, 10), (7, 10), (1, 20), (3, 20)][:6 + 2 * d])
  c = f[0] / f[1]
  return num_q("frac_to_dec", "expr", L("Write {a}/{b} as a decimal.", "{a}/{b} को दशमलव में लिखो।",
                                         "{a}/{b} দশমিকে লেখো।", a=f[0], b=f[1]),
               L("{a}/{b} = {c}.", "{a}/{b} = {c}।", "{a}/{b} = {c}।", a=f[0], b=f[1], c=num(c)), c,
               show=f"{f[0]}/{f[1]} = ?", eq=f"{f[0]}/{f[1]} = {num(c)}",
               wrong=[f[0] + f[1] / 10, c * 10, c / 10, round(f[1] / f[0] / 10, 2)])


def g_percent(d):
  p = random.choice([(10, 25, 50), (10, 20, 25, 50, 75), (5, 12, 15, 30, 40, 60)][d])
  n = random.choice([20, 40, 60, 80, 100, 120, 200, 300, 400, 500])
  c = p * n // 100 if p * n % 100 == 0 else round(p * n / 100, 2)
  return num_q("percent", "percent", L("What is {p} percent of {n}?", "{n} का {p} प्रतिशत कितना है?",
                                        "{n}-এর {p} শতাংশ কত?", p=p, n=n),
               L("{p} out of every 100: {c}.", "हर 100 में से {p}: {c}।", "প্রতি 100-তে {p}: {c}।", p=p, c=num(c)),
               c, show=f"{p}% of {n} = ?", eq=f"{p}/100 × {n} = {num(c)}", wrong=[p, n - c, c * 2, c + 10], p=p, n=n)


# ================================================================ measurement, time, money
def g_ruler(d):
  start = 0 if d == 0 else random.randint(1, 4)
  length = random.randint(2, (8, 10, 12)[d] - start) if d else random.randint(2, 9)
  c = length
  return num_q("ruler", "ruler", L("How long is the pencil?", "पेंसिल कितनी लंबी है?", "পেন্সিলটা কত লম্বা?"),
               L("From {s} to {e} is {c} centimetres.", "{s} से {e} तक {c} सेंटीमीटर है।",
                 "{s} থেকে {e} পর্যন্ত {c} সেন্টিমিটার।", s=start, e=start + length, c=c), c,
               wrong=[start + length, c + 1, c - 1, c + 2], start=start, length=length, eq=f"{start + length} − {start} = {c} cm")


def g_convert(d):
  units = [("m", "cm", 100, "metres", "centimetres", "मीटर", "सेंटीमीटर", "মিটার", "সেন্টিমিটার"),
           ("kg", "g", 1000, "kilograms", "grams", "किलोग्राम", "ग्राम", "কিলোগ্রাম", "গ্রাম"),
           ("L", "mL", 1000, "litres", "millilitres", "लीटर", "मिलीलीटर", "লিটার", "মিলিলিটার"),
           ("km", "m", 1000, "kilometres", "metres", "किलोमीटर", "मीटर", "কিলোমিটার", "মিটার"),
           ("cm", "mm", 10, "centimetres", "millimetres", "सेंटीमीटर", "मिलीमीटर", "সেন্টিমিটার", "মিলিমিটার")]
  big, small, k, bw, sw, bh, sh, bb, sb = random.choice(units[:3] if d == 0 else units)
  n = random.randint(2, 9) if d < 2 else random.randint(2, 9) + random.choice([0.5, 0.25])
  c = n * k
  c = int(c) if c == int(c) else c
  return num_q("convert", "expr", L("{n} {bw} is how many {sw}?", "{n} {bh} कितने {sh} हैं?",
                                     "{n} {bb} কত {sb}?", n=num(n), bw=bw, sw=sw, bh=bh, sh=sh, bb=bb, sb=sb),
               L("1 {bu} = {k} {su}, so {n} {bu} = {c} {su}.", "1 {bu} = {k} {su}, इसलिए {n} {bu} = {c} {su}।",
                 "1 {bu} = {k} {su}, তাই {n} {bu} = {c} {su}।", bu=big, su=small, k=k, n=num(n), c=num(c)), c,
               show=f"{num(n)} {big} = ? {small}", eq=f"{num(n)} × {k} = {num(c)} {small}",
               steps=" + ".join([str(k)] * int(n)) + (f" + {num(c - int(n) * k)}" if n != int(n) else "") + f" = {num(c)}"
               if n <= 5 else None,
               wrong=[n * k * 10 if k < 1000 else int(n * 100), int(n * k / 10), int(n + k), int(c + k)])


def _time_text(h, m):
  return f"{h}:{m:02d}"


def g_clock(d):
  h = random.randint(1, 12)
  m = random.choice([(0,), (0, 30), (0, 15, 30, 45), ][min(d, 2)] if d < 2 else list(range(0, 60, 5)))
  c = _time_text(h, m)
  wrong = [_time_text(h % 12 + 1, m), _time_text(h, (m + 30) % 60), _time_text((m // 5) or 12, h * 5 % 60),
           _time_text(h, (m + 15) % 60)]
  said = {0: "{h} o'clock", 15: "quarter past {h}", 30: "half past {h}", 45: "quarter to {h1}"}
  en = said.get(m, "{h}:{mm}").format(h=h, h1=h % 12 + 1, mm=f"{m:02d}")
  return {"kind": "clock", "scene": "clock", "ask": L("What time is it?", "कितने बजे हैं?", "কটা বাজে?"),
          "explain": L("The short hand shows the hour, the long hand the minutes: {t}.",
                       "छोटी सुई घंटा, बड़ी सुई मिनट बताती है: {t}।",
                       "ছোট কাঁটা ঘণ্টা, বড় কাঁটা মিনিট দেখায়: {t}।", t=c),
          "c": c, "choices": options(c, wrong), "eq": f"{c}  ({en})", "steps": None, "h": h, "m": m}


def g_duration(d):
  h1 = random.randint(1, 9)
  m1 = random.choice([0, 30] if d < 2 else [0, 15, 30, 45])
  dur = random.choice([(60, 120, 180), (30, 90, 120, 150), (45, 75, 105, 135, 165)][d])
  t2 = h1 * 60 + m1 + dur
  h2, m2 = divmod(t2, 60)
  hrs, mins = divmod(dur, 60)
  c = f"{hrs} h {mins} min" if mins else f"{hrs} h"
  if hrs == 0:
    c = f"{mins} min"
  wrong = set()
  for dd in (dur + 30, dur - 30, dur + 60, dur + 15):
    if dd > 0:
      a, b = divmod(dd, 60)
      wrong.add(f"{a} h {b} min" if b and a else (f"{b} min" if not a else f"{a} h"))
  return {"kind": "duration", "scene": "clock2", "ask": L("A game starts at {a} and ends at {b}. How long is it?",
                                                          "खेल {a} बजे शुरू होकर {b} बजे खत्म होता है। कितनी देर चला?",
                                                          "খেলা {a}-এ শুরু হয়ে {b}-এ শেষ হয়। কতক্ষণ চলল?",
                                                          a=_time_text(h1, m1), b=_time_text(h2, m2)),
          "explain": L("From {a} to {b} is {c}.", "{a} से {b} तक {c}।", "{a} থেকে {b} পর্যন্ত {c}।",
                       a=_time_text(h1, m1), b=_time_text(h2, m2), c=c.replace("h", "hours").replace("min", "minutes")),
          "c": c, "choices": options(c, list(wrong)), "eq": f"{_time_text(h1, m1)} to {_time_text(h2, m2)} = {c}",
          "steps": None, "h": h1, "m": m1, "h2": h2 % 12 or 12, "m2": m2}


def g_calendar(d):
  if d == 0:
    k = random.randrange(7)
    step = random.choice([1, 2])
    c = DAYS[(k + step) % 7]
    ask = L("Today is {t}. What day is it {s}?", "आज {th} है। {sh} कौन-सा दिन होगा?",
            "আজ {tb}। {sb} কোন দিন হবে?", t=DAYS[k], s="tomorrow" if step == 1 else "the day after tomorrow",
            th=WORDS[DAYS[k]][0], sh="कल" if step == 1 else "परसों", tb=WORDS[DAYS[k]][1],
            sb="কাল" if step == 1 else "পরশু")
    return word_q("calendar", "calendar", ask, L("After {t} comes {c}.", "{th} के बाद {ch}।", "{tb}-এর পরে {cb}।",
                                                 t=DAYS[k], c=c, th=WORDS[DAYS[k]][0], ch=WORDS[c][0],
                                                 tb=WORDS[DAYS[k]][1], cb=WORDS[c][1]),
                  c, [x for x in DAYS if x != c][:6], WORDS, eq=c, day=k)
  if d == 1:
    name, days = random.choice(MONTHS)
    return num_q("calendar", "calendar", L("How many days are there in {m}?", "{m} में कितने दिन होते हैं?",
                                           "{m}-এ কত দিন থাকে?", m=name),
                 L("{m} has {c} days.", "{m} में {c} दिन होते हैं।", "{m}-এ {c} দিন।", m=name, c=days), days,
                 wrong=[d_ for d_ in (28, 29, 30, 31) if d_ != days], month=name, eq=f"{name}: {days} days")
  k = random.randrange(7)
  n = random.randint(8, 30)
  c = DAYS[(k + n) % 7]
  return word_q("calendar", "calendar", L("Today is {t}. What day will it be after {n} days?",
                                          "आज {th} है। {n} दिन बाद कौन-सा दिन होगा?",
                                          "আজ {tb}। {n} দিন পরে কোন দিন হবে?", t=DAYS[k], n=n,
                                          th=WORDS[DAYS[k]][0], tb=WORDS[DAYS[k]][1]),
                L("{n} days = {w} weeks and {r} days, so {c}.", "{n} दिन = {w} सप्ताह और {r} दिन, इसलिए {ch}।",
                  "{n} দিন = {w} সপ্তাহ আর {r} দিন, তাই {cb}।", n=n, w=n // 7, r=n % 7, c=c, ch=WORDS[c][0],
                  cb=WORDS[c][1]),
                c, [x for x in DAYS if x != c], WORDS, eq=f"{n} = 7 × {n // 7} + {n % 7}", day=k)


def g_money(d):
  pool = [(1, 2, 5, 10), (1, 2, 5, 10, 20, 50), (10, 20, 50, 100, 200, 500)][d]
  items = [random.choice(pool) for _ in range(random.randint(2, (4, 5, 5)[d]))]
  c = add_all(items)
  return num_q("money", "money", L("How many rupees in all?", "कुल कितने रुपये हैं?", "মোট কত টাকা?"),
               L("{s} = {c} rupees.", "{s} = {c} रुपये।", "{s} = {c} টাকা।", s=" + ".join(map(str, items)), c=c), c,
               eq=" + ".join(map(str, items)) + f" = Rs. {num(c)}", step=min(pool), spread=3, coins=items)


def g_change(d):
  note = random.choice([(10, 20, 50), (50, 100), (100, 200, 500, 2000)][d])
  cost = random.randint(note // 5, note - 1)
  if d == 0:
    cost = random.randint(1, note - 1)
  c = take_away_by_adding(note, cost)
  return num_q("change", "bill", L("Something costs {a} rupees. You pay with a {n} rupee note. How much change?",
                                    "चीज़ {a} रुपये की है। तुमने {n} रुपये का नोट दिया। कितने वापस मिलेंगे?",
                                    "জিনিসটার দাম {a} টাকা। তুমি {n} টাকার নোট দিলে। কত ফেরত পাবে?", a=cost, n=note),
               L("{n} − {a} = {c} rupees back.", "{n} − {a} = {c} रुपये वापस।", "{n} − {a} = {c} টাকা ফেরত।",
                 n=note, a=cost, c=c), c, eq=f"Rs. {note} − Rs. {cost} = Rs. {c}",
               steps=f"{note} + (−{cost}) = {c}", spread=3, step=1 if d == 0 else 5, a=cost, n=note)


def g_bill(d):
  k = random.randint(2, 3)
  items = random.sample([("Pencil", 5, 10), ("Eraser", 3, 8), ("Notebook", 20, 60), ("Pen", 10, 25),
                         ("Book", 50, 150), ("Box", 30, 90)], k)
  lines = [(nm, random.randint(lo, hi) * (1 if d < 2 else 1)) for nm, lo, hi in items]
  qty = [random.randint(1, (1, 3, 4)[d]) for _ in lines]
  c = add_all([times_by_adding(q, p) for q, (_n, p) in zip(qty, lines)])
  return num_q("bill", "billlist", L("Add up the bill. What is the total?", "बिल जोड़ो। कुल कितना हुआ?",
                                      "বিল যোগ করো। মোট কত হল?"),
               L("The total is {c} rupees.", "कुल {c} रुपये।", "মোট {c} টাকা।", c=c), c,
               eq=" + ".join(f"{q} × {p}" for q, (_n, p) in zip(qty, lines)) + f" = Rs. {c}", step=5,
               lines=[(n, p, q) for (n, p), q in zip(lines, qty)])


# ================================================================ geometry
def g_shape2d(d):
  names = ["Circle", "Triangle", "Square", "Rectangle"] + (["Pentagon", "Hexagon", "Oval"] if d else [])
  c = random.choice(names)
  if random.random() < 0.5 or d == 0:
    return word_q("shape2d", "shape", L("What is this shape called?", "इस आकृति का नाम क्या है?", "এই আকারের নাম কী?"),
                  L("It is a {c}.", "यह {ch} है।", "এটা {cb}।", c=c.lower(), ch=WORDS[c][0], cb=WORDS[c][1]),
                  c, [x for x in names if x != c], WORDS, eq=c, shape=c)
  sides = SHAPES2D[c] if c not in ("Circle", "Oval") else 0
  c2 = random.choice(["Triangle", "Square", "Pentagon", "Hexagon", "Rectangle"])
  sides = SHAPES2D[c2]
  return num_q("shape2d", "shape", L("How many sides and corners does this shape have?",
                                     "इस आकृति की कितनी भुजाएँ और कोने हैं?", "এই আকারের কটা বাহু আর কোণ আছে?"),
               L("A {c} has {n} sides and {n} corners.", "{ch} की {n} भुजाएँ और {n} कोने होते हैं।",
                 "{cb}-এর {n}টা বাহু আর {n}টা কোণ।", c=c2.lower(), ch=WORDS[c2][0], cb=WORDS[c2][1], n=sides),
               sides, eq=f"{c2}: {sides} sides", shape=c2, count_corners=True)


def g_solid(d):
  solids = {"Cube": (6, 12, 8), "Cuboid": (6, 12, 8), "Cylinder": (3, 2, 0), "Cone": (2, 1, 1),
            "Sphere": (1, 0, 0), "Pyramid": (5, 8, 5)}
  name = random.choice(list(solids))
  if d == 0 or random.random() < 0.4:
    return word_q("solid", "solid", L("What is this solid shape called?", "इस ठोस आकृति का नाम क्या है?",
                                      "এই ঘন আকারের নাম কী?"),
                  L("It is a {c}.", "यह {ch} है।", "এটা {cb}।", c=name.lower(), ch=WORDS[name][0], cb=WORDS[name][1]),
                  name, [x for x in solids if x != name], WORDS, eq=name, solid=name)
  name = random.choice(["Cube", "Cuboid", "Pyramid"])
  f, e, v = solids[name]
  what, val, hi, bn = random.choice([("faces", f, "फलक", "তল"), ("edges", e, "किनारे", "ধার"),
                                     ("corners", v, "शीर्ष", "শীর্ষবিন্দু")])
  return num_q("solid", "solid", L("How many {w} does a {s} have?", "{sh} के कितने {wh} होते हैं?",
                                   "{sb}-এর কটা {wb} থাকে?", w=what, s=name.lower(), sh=WORDS[name][0],
                                   wh=hi, sb=WORDS[name][1], wb=bn),
               L("A {s} has {c} {w}.", "{sh} के {c} {wh} होते हैं।", "{sb}-এর {c}টা {wb}।", s=name.lower(), c=val,
                 w=what, sh=WORDS[name][0], wh=hi, sb=WORDS[name][1], wb=bn), val,
               eq=f"{name}: {f} faces, {e} edges, {v} corners", solid=name,
               wrong=[f, e, v, val + 2, val - 2])


def g_angle_type(d):
  kinds = ["Acute", "Right", "Obtuse"] + (["Straight", "Reflex"] if d else [])
  c = random.choice(kinds)
  deg = {"Acute": random.choice([20, 35, 45, 60, 70]), "Right": 90,
         "Obtuse": random.choice([110, 120, 135, 150]), "Straight": 180,
         "Reflex": random.choice([210, 240, 270, 300])}[c]
  rule = {"Acute": "less than 90°", "Right": "exactly 90°", "Obtuse": "between 90° and 180°",
          "Straight": "exactly 180°", "Reflex": "more than 180°"}[c]
  return word_q("angle_type", "angle", L("What kind of angle is this?", "यह कौन-सा कोण है?", "এটা কী ধরনের কোণ?"),
                L("It is {r}: a {c} angle.", "यह {ch} है।", "এটা {cb}।", r=rule, c=c.lower(), ch=WORDS[c][0],
                  cb=WORDS[c][1]), c, [k for k in kinds if k != c], WORDS, eq=f"{deg}° = {c}", deg=deg,
                show_deg=False)


def g_angle_measure(d):
  deg = random.choice([(30, 45, 60, 90), (30, 45, 60, 90, 120, 135, 150), (20, 40, 70, 110, 130, 160, 100)][d])
  return num_q("angle_measure", "angle", L("How many degrees is this angle? Read the protractor.",
                                           "यह कोण कितने डिग्री का है? चाँदे पर पढ़ो।",
                                           "এই কোণটা কত ডিগ্রি? চাঁদায় পড়ো।"),
               L("It is {c} degrees.", "यह {c} डिग्री है।", "এটা {c} ডিগ্রি।", c=deg), deg,
               wrong=[180 - deg, deg + 10, deg - 10, deg + 30], eq=f"{deg}°", deg=deg, protractor=True)


def g_angle_pair(d):
  comp = random.random() < 0.5
  if d == 2 and random.random() < 0.4:
    a = random.randint(25, 155)
    return num_q("angle_pair", "vertical", L("Two lines cross. One angle is {a} degrees. What is the angle opposite it?",
                                             "दो रेखाएँ काटती हैं। एक कोण {a} डिग्री है। उसके सामने वाला कोण?",
                                             "দুটো রেখা ছেদ করে। একটা কোণ {a} ডিগ্রি। তার বিপরীত কোণ কত?", a=a),
                 L("Vertically opposite angles are equal: {a} degrees.", "शीर्षाभिमुख कोण बराबर होते हैं: {a} डिग्री।",
                   "বিপ্রতীপ কোণ সমান: {a} ডিগ্রি।", a=a), a, wrong=[180 - a, 90 - a if a < 90 else a - 90, a + 10],
                 eq=f"{a}° = {a}°", deg=a)
  total = 90 if comp else 180
  a = random.randint(10, total - 10)
  c = take_away_by_adding(total, a)
  return num_q("angle_pair", "angle_pair", L("Two angles make {t} degrees. One is {a}. What is the other?",
                                             "दो कोण मिलकर {t} डिग्री बनाते हैं। एक {a} है। दूसरा कितना?",
                                             "দুটো কোণ মিলে {t} ডিগ্রি। একটা {a}। অন্যটা কত?", t=total, a=a),
               L("{t} − {a} = {c} degrees.", "{t} − {a} = {c} डिग्री।", "{t} − {a} = {c} ডিগ্রি।", t=total, a=a, c=c), c,
               eq=f"{a}° + {c}° = {total}°", steps=f"{total} + (−{a}) = {c}",
               wrong=[(180 if comp else 90) - a if (180 if comp else 90) > a else c + 10, c + 10, c - 10, a],
               deg=a, total=total)


def g_lines(d):
  c = random.choice(["Parallel", "Perpendicular", "Intersecting"])
  why = {"Parallel": "they never meet", "Perpendicular": "they meet at a right angle",
         "Intersecting": "they cross each other"}[c]
  return word_q("lines", "lines", L("What kind of lines are these?", "ये किस तरह की रेखाएँ हैं?",
                                    "এগুলো কী ধরনের রেখা?"),
                L("They are {c}: {w}.", "ये {ch} रेखाएँ हैं।", "এগুলো {cb} রেখা।", c=c.lower(), w=why,
                  ch=WORDS[c][0], cb=WORDS[c][1]), c, [x for x in ("Parallel", "Perpendicular", "Intersecting") if x != c],
                WORDS, n=3, eq=c, line_kind=c)


def g_symmetry(d):
  shapes = {"Square": 4, "Rectangle": 2, "Circle": 0, "Triangle": 3, "Hexagon": 6, "Pentagon": 5, "Star": 5}
  pool = ["Square", "Rectangle", "Triangle"] if d == 0 else list(shapes)
  name = random.choice([s for s in pool if s != "Circle"])
  c = shapes[name]
  return num_q("symmetry", "symmetry", L("How many lines of symmetry does this shape have?",
                                         "इस आकृति में सममिति की कितनी रेखाएँ हैं?",
                                         "এই আকারের কটা প্রতিসাম্য রেখা আছে?"),
               L("A {s} has {c} lines of symmetry: fold it on each and both halves match.",
                 "{sh} में सममिति की {c} रेखाएँ हैं।", "{sb}-এর {c}টা প্রতিসাম্য রেখা।", s=name.lower(), c=c,
                 sh=WORDS[name][0], sb=WORDS[name][1]), c, wrong=[c + 1, c - 1 if c > 1 else c + 2, c * 2, 1],
               eq=f"{name}: {c} lines", shape=name)


def g_triangle_angle(d):
  a = random.randint(30, 90)
  b = random.randint(20, 150 - a)
  c = 180 - a - b
  return num_q("triangle_angle", "triangle", L("Two angles of a triangle are {a} and {b} degrees. What is the third?",
                                               "त्रिभुज के दो कोण {a} और {b} डिग्री हैं। तीसरा कोण कितना है?",
                                               "ত্রিভুজের দুটো কোণ {a} আর {b} ডিগ্রি। তৃতীয়টা কত?", a=a, b=b),
               L("The three angles add up to 180: {c} degrees.", "तीनों कोणों का योग 180 होता है: {c} डिग्री।",
                 "তিন কোণের যোগফল 180: {c} ডিগ্রি।", c=c), c,
               eq=f"{a}° + {b}° + {c}° = 180°", steps=f"180 + (−{a}) + (−{b}) = {c}",
               wrong=[c + 10, c - 10, 90 - c if c < 90 else c + 20, a + b], angles=(a, b, c))


def g_triangle_type(d):
  c = random.choice(["Equilateral", "Isosceles", "Scalene"])
  s = random.randint(4, 9)
  sides = {"Equilateral": (s, s, s), "Isosceles": (s, s, random.choice([x for x in range(3, 2 * s) if x != s])),
           "Scalene": tuple(random.sample(range(4, 10), 3))}[c]
  return word_q("triangle_type", "triangle", L("The sides are {a}, {b} and {c} cm. What kind of triangle is it?",
                                               "भुजाएँ {a}, {b} और {c} सेमी हैं। यह कौन-सा त्रिभुज है?",
                                               "বাহুগুলো {a}, {b} আর {c} সেমি। এটা কী ধরনের ত্রিভুজ?",
                                               a=sides[0], b=sides[1], c=sides[2]),
                L("{c} triangle.", "{ch} त्रिभुज।", "{cb} ত্রিভুজ।", c=c, ch=WORDS[c][0], cb=WORDS[c][1]),
                c, [x for x in ("Equilateral", "Isosceles", "Scalene") if x != c], WORDS, n=3, eq=c, sides=sides)


def g_circle(d):
  r = random.randint(2, (6, 10, 25)[d])
  diam = random.random() < 0.5
  c = 2 * r if diam else r
  if diam:
    ask = L("The radius is {r} cm. What is the diameter?", "त्रिज्या {r} सेमी है। व्यास कितना है?",
            "ব্যাসার্ধ {r} সেমি। ব্যাস কত?", r=r)
  else:
    ask = L("The diameter is {d} cm. What is the radius?", "व्यास {d} सेमी है। त्रिज्या कितनी है?",
            "ব্যাস {d} সেমি। ব্যাসার্ধ কত?", d=2 * r)
  return num_q("circle", "circle", ask, L("The diameter is two radii: {d} = {r} + {r}.", "व्यास दो त्रिज्याओं के बराबर: {d} = {r} + {r}।",
                                          "ব্যাস দুটো ব্যাসার্ধের সমান: {d} = {r} + {r}।", d=2 * r, r=r), c,
               eq=f"{2 * r} = {r} + {r}", wrong=[c * 2, c + 1, c - 1, c * 3], r=r, diam=diam)


# ================================================================ area, perimeter, volume
def g_perimeter(d):
  w, h = random.randint(2, (6, 9, 15)[d]), random.randint(2, (5, 8, 12)[d])
  c = add_all([w, h, w, h])
  return num_q("perimeter", "grid", L("Walk all round the edge. What is the perimeter?",
                                      "किनारे-किनारे पूरा घूमो। परिमाप कितना है?", "চারপাশ দিয়ে হাঁটো। পরিসীমা কত?"),
               L("{w} + {h} + {w} + {h} = {c} units.", "{w} + {h} + {w} + {h} = {c} इकाई।",
                 "{w} + {h} + {w} + {h} = {c} একক।", w=w, h=h, c=c), c,
               eq=f"2 × ({w} + {h}) = {c}", steps=f"{w} + {h} + {w} + {h} = {c}",
               wrong=[w * h, w + h, c + 2, c - 2], w=w, h=h, what="perimeter")


def g_area(d):
  w, h = random.randint(2, (6, 9, 15)[d]), random.randint(2, (5, 8, 12)[d])
  c = times_by_adding(h, w)
  return num_q("area", "grid", L("How many squares cover the shape? What is the area?",
                                 "आकृति को कितने वर्ग ढकते हैं? क्षेत्रफल कितना है?",
                                 "আকারটা কতগুলো বর্গ ঢাকে? ক্ষেত্রফল কত?"),
               L("{h} rows of {w} squares: {c} square units.", "{w} वर्गों की {h} पंक्तियाँ: {c} वर्ग इकाई।",
                 "{w}টা বর্গের {h} সারি: {c} বর্গ একক।", w=w, h=h, c=c), c,
               eq=f"{w} × {h} = {c}", steps=" + ".join([str(w)] * h) + f" = {c}" if h <= 6 else None,
               wrong=[2 * (w + h), c + w, c - w, c + h], w=w, h=h, what="area")


def g_area_tri(d):
  b, h = random.choice([2, 4, 6, 8, 10]), random.randint(2, 9)
  c = b * h // 2
  return num_q("area_tri", "expr", L("A triangle has base {b} and height {h}. What is its area?",
                                     "त्रिभुज का आधार {b} और ऊँचाई {h} है। क्षेत्रफल कितना है?",
                                     "ত্রিভুজের ভূমি {b} আর উচ্চতা {h}। ক্ষেত্রফল কত?", b=b, h=h),
               L("Half of base times height: {c}.", "आधार गुणा ऊँचाई का आधा: {c}।", "ভূমি গুণ উচ্চতার অর্ধেক: {c}।", c=c),
               c, show=f"½ × {b} × {h} = ?", eq=f"½ × {b} × {h} = {c}", wrong=[b * h, b + h, c + 1, c * 3])


def g_volume(d):
  l, w, h = random.randint(2, (3, 4, 6)[d]), random.randint(2, (3, 4, 5)[d]), random.randint(1, (3, 4, 5)[d])
  c = l * w * h
  return num_q("volume", "cubes", L("How many little cubes make this box?", "यह डिब्बा कितने छोटे घनों से बना है?",
                                    "এই বাক্সটা কতগুলো ছোট ঘনক দিয়ে তৈরি?"),
               L("{l} × {w} in each layer, {h} layers: {c} cubes.", "हर परत में {l} × {w}, {h} परतें: {c} घन।",
                 "প্রতি স্তরে {l} × {w}, {h}টা স্তর: {c}টা ঘনক।", l=l, w=w, h=h, c=c), c,
               eq=f"{l} × {w} × {h} = {c}", steps=" + ".join([str(l * w)] * h) + f" = {c}",
               wrong=[l * w, l + w + h, c + l * w, c - l * w if c > l * w else c + 1], l=l, w=w, h=h)


# ================================================================ data handling
def _counts(d, k=4):
  return {f: random.randint(1, (6, 9, 12)[d]) for f in random.sample(FRUITS, k)}


def g_tally(d):
  n = random.randint(3, (9, 15, 23)[d])
  return num_q("tally", "tally", L("Count the tally marks.", "मिलान चिह्न गिनो।", "ট্যালি চিহ্ন গোনো।"),
               L("Each bundle is 5: {c}.", "हर गट्ठर 5 का: {c}।", "প্রতিটা গুচ্ছ 5: {c}।", c=n), n,
               eq=" + ".join(["5"] * (n // 5) + ([str(n % 5)] if n % 5 else [])) + f" = {n}", value=n)


def g_picto(d):
  key = random.choice([1, 2, 5] if d else [1])
  counts = {f: random.randint(1, 6) * key for f in random.sample(FRUITS, 3)}
  f = random.choice(list(counts))
  c = counts[f]
  return num_q("picto", "picto", L("Each picture means {k}. How many {f} were sold?" if key > 1 else
                                   "How many {f} were sold?", "हर चित्र = {k}। कितने {fh} बिके?",
                                   "প্রতিটা ছবি = {k}। কতগুলো {fb} বিক্রি হল?", k=key, f=PLURAL[f],
                                   fh=WORDS[f][0], fb=WORDS[f][1]),
               L("{n} pictures × {k} = {c}.", "{n} चित्र × {k} = {c}।", "{n}টা ছবি × {k} = {c}।", n=c // key, k=key, c=c), c,
               eq=f"{c // key} × {key} = {c}", step=key, counts=counts, key=key, fruit=f)


def g_bars(d):
  counts = _counts(d)
  ask_most = random.random() < 0.5 or d == 0
  if ask_most:
    c = max(counts, key=counts.get)
    if list(counts.values()).count(counts[c]) > 1:
      counts[c] += 1
    return word_q("bars", "bars", L("Which fruit is liked by the most children?", "सबसे ज़्यादा बच्चों को कौन-सा फल पसंद है?",
                                    "সবচেয়ে বেশি বাচ্চা কোন ফল পছন্দ করে?"),
                  L("{c} has the tallest bar.", "{ch} की पट्टी सबसे ऊँची है।", "{cb}-এর দণ্ড সবচেয়ে উঁচু।", c=c,
                    ch=WORDS[c][0], cb=WORDS[c][1]),
                  c, [f for f in counts if f != c], WORDS, eq=f"{c}: {counts[c]}", counts=counts)
  f1, f2 = random.sample(list(counts), 2)
  c = abs(counts[f1] - counts[f2])
  if c == 0:
    counts[f1] += 2
    c = 2
  return num_q("bars", "bars", L("How many more children like {a} than {b}?" if counts[f1] > counts[f2] else
                                 "How many more children like {b} than {a}?",
                                 "{a} और {b} को पसंद करने वालों में कितना अंतर है?",
                                 "{a} আর {b} পছন্দ করা বাচ্চাদের মধ্যে পার্থক্য কত?", a=f1.lower(), b=f2.lower()),
               L("The difference is {c}.", "अंतर {c} है।", "পার্থক্য {c}।", c=c), c,
               eq=f"{max(counts[f1], counts[f2])} − {min(counts[f1], counts[f2])} = {c}", counts=counts)


def g_mean(d):
  n = random.randint(3, 5)
  m = random.randint(3, (8, 15, 30)[d])
  vals = [m] * n
  for _ in range(n):
    i, j = random.sample(range(n), 2)
    k = random.randint(0, min(3, vals[j] - 1))
    vals[i] += k
    vals[j] -= k
  return num_q("mean", "expr", L("Find the average of {v}.", "{v} का औसत निकालो।", "{v}-এর গড় বের করো।",
                                 v=", ".join(map(str, vals))),
               L("Add them up: {s}. Share by {n}: {m}.", "सब जोड़ो: {s}। {n} से भाग दो: {m}।",
                 "সব যোগ করো: {s}। {n} দিয়ে ভাগ করো: {m}।", s=sum(vals), n=n, m=m), m,
               show=",  ".join(map(str, vals)), eq=f"{' + '.join(map(str, vals))} = {sum(vals)},  {sum(vals)} ÷ {n} = {m}",
               wrong=[sum(vals), m + 1, m - 1, max(vals)])


def g_median_mode(d):
  vals = sorted(random.randint(1, 20) for _ in range(random.choice([5, 7])))
  mode = random.random() < 0.5
  if mode:
    x = random.choice(vals)
    vals = sorted(vals + [x, x])
    from collections import Counter
    cnt = Counter(vals)
    top = max(cnt.values())
    if list(cnt.values()).count(top) > 1:
      vals.append(x)
      vals.sort()
    c = Counter(vals).most_common(1)[0][0]
    ask = L("Which number comes most often (the mode)?", "कौन-सी संख्या सबसे ज़्यादा बार आती है (बहुलक)?",
            "কোন সংখ্যা সবচেয়ে বেশিবার আসে (প্রচুরক)?")
    ex = L("{c} comes most often.", "{c} सबसे ज़्यादा बार आता है।", "{c} সবচেয়ে বেশিবার আসে।", c=c)
  else:
    random.shuffle(vals)
    c = sorted(vals)[len(vals) // 2]
    ask = L("Put them in order. Which is the middle number (the median)?",
            "क्रम में लगाओ। बीच वाली संख्या (माध्यिका) कौन-सी है?", "সাজিয়ে নাও। মাঝের সংখ্যা (মধ্যমা) কোনটা?")
    ex = L("In order, the middle one is {c}.", "क्रम में बीच वाली {c} है।", "সাজালে মাঝেরটা {c}।", c=c)
  wrong = [v for v in set(vals) if v != c][:5]
  return num_q("median_mode", "expr", ask, ex, c, show=",  ".join(map(str, vals)), wrong=wrong,
               eq=", ".join(map(str, sorted(vals))))


# ================================================================ patterns
def g_fib(d):
  x, y = random.choice([(1, 1), (1, 2), (2, 3), (1, 3), (2, 2)])
  seq = [x, y]
  while len(seq) < 6:
    seq.append(add_all(seq[-2:]))
  return num_q("fib", "fib", L("Spiral trail! Each domino is the two before it added. What comes next?",
                               "घुमावदार रास्ता! हर डोमिनो पिछले दो का जोड़ है। आगे क्या आएगा?",
                               "প্যাঁচানো পথ! প্রতিটি ডোমিনো আগের দুটোর যোগফল। এরপর কী আসবে?"),
               L("{a} plus {b} is {c}.", "{a} और {b} मिलकर {c}।", "{a} যোগ {b} সমান {c}।", a=seq[3], b=seq[4], c=seq[5]),
               seq[5], eq=f"{seq[3]} + {seq[4]} = {seq[5]}", seq=seq)


def g_num_pattern(d):
  form = random.choice([("add",), ("add", "sub", "double"), ("square", "triangle", "double", "add")][d])
  if form == "add":
    s, k = random.randint(1, 20), random.randint(2, 9)
    seq = [s + k * i for i in range(5)]
    rule = f"add {k}"
  elif form == "sub":
    k = random.randint(2, 9)
    s = k * 6 + random.randint(0, 9)
    seq = [s - k * i for i in range(5)]
    rule = f"take away {k}"
  elif form == "double":
    s = random.randint(1, 5)
    seq = [s * 2 ** i for i in range(5)]
    rule = "double"
  elif form == "square":
    s = random.randint(1, 4)
    seq = [(s + i) ** 2 for i in range(5)]
    rule = "square numbers"
  else:
    seq = [n * (n + 1) // 2 for n in range(1, 6)]
    rule = "triangle numbers"
  c = seq[-1]
  return num_q("num_pattern", "seq", L("What comes next in the pattern?", "इस क्रम में आगे क्या आएगा?",
                                       "এই নকশায় এরপর কী আসবে?"),
               L("The rule is: {r}. Next is {c}.", "नियम है: {r}। अगला {c}।", "নিয়ম: {r}। পরেরটা {c}।", r=rule, c=c),
               c, eq=f"{rule}: {c}", wrong=[c + 1, c - 1, c + 2, seq[-2] + (seq[-2] - seq[-3])],
               seq=seq[:-1] + [None])


def g_shape_pattern(d):
  base = random.sample(["Circle", "Triangle", "Square", "Star"], 2 if d == 0 else 3)
  unit = base + ([base[0]] if d == 2 else [])
  seq = (unit * 4)[:len(unit) * 2 + 1]
  c = seq[-1]
  return word_q("shape_pattern", "shape_seq", L("What comes next in the pattern?", "इस क्रम में आगे क्या आएगा?",
                                                "এই নকশায় এরপর কী আসবে?"),
                L("The pattern repeats: next is the {c}.", "क्रम दोहराता है: अगला {ch}।", "নকশা আবার হয়: পরেরটা {cb}।",
                  c=c.lower(), ch=WORDS[c][0], cb=WORDS[c][1]),
                c, [x for x in ["Circle", "Triangle", "Square", "Star"] if x != c], WORDS, eq=c, seq=seq[:-1] + [None])


# ================================================================ algebra, ratio, commercial maths
def g_balance(d):
  if d < 2 or random.random() < 0.5:
    a, x = random.randint(1, (9, 15, 30)[d]), random.randint(1, (9, 15, 30)[d])
    c = add_all([x, a])
    return num_q("balance", "balance", L("Balance it! x plus {a} equals {c}. What is x?",
                                         "तराज़ू बराबर करो! x और {a} मिलकर {c}। x क्या है?",
                                         "দাঁড়িপাল্লা সমান করো! x যোগ {a} সমান {c}। x কত?", a=a, c=c),
                 L("x is {x}. Now both sides are equal.", "x बराबर {x}। अब दोनों तरफ़ बराबर।",
                   "x সমান {x}। এখন দুই দিক সমান।", x=x), x, show=f"x + {a} = {c}", eq=f"x = {x}",
                 steps=f"x = {c} + (−{a}) = {x}", total=c, two=False, a=a)
  k, x = random.randint(2, 5), random.randint(2, 9)
  c = times_by_adding(k, x)
  return num_q("balance", "balance", L("Balance it! {k} x equals {c}. What is x?", "तराज़ू बराबर करो! {k}x बराबर {c}। x क्या है?",
                                       "দাঁড়িপাল্লা সমান করো! {k}x সমান {c}। x কত?", k=k, c=c),
               L("x is {x}.", "x बराबर {x}।", "x সমান {x}।", x=x), x, show=f"{k}x = {c}", eq=f"x = {x}",
               steps=" + ".join(["x"] * k) + f" = {c}, so x = {c} ÷ {k} = {x}", total=c, two=True, a=k)


def g_evaluate(d):
  a, b, x = random.randint(2, 6), random.randint(1, 9), random.randint(1, (5, 9, 12)[d])
  c = a * x + b
  return num_q("evaluate", "expr", L("If x is {x}, what is {a}x + {b}?", "अगर x = {x} है, तो {a}x + {b} कितना?",
                                     "x = {x} হলে {a}x + {b} কত?", x=x, a=a, b=b),
               L("{a} times {x} plus {b} is {c}.", "{a} गुणा {x} और {b} = {c}।", "{a} গুণ {x} যোগ {b} = {c}।",
                 a=a, x=x, b=b, c=c), c, show=f"{a}x + {b},  x = {x}", eq=f"{a} × {x} + {b} = {c}",
               steps=" + ".join([str(x)] * a) + f" + {b} = {c}", wrong=[a + x + b, a * (x + b), c + a, c - 1])


def g_like_terms(d):
  v = random.choice(["a", "x", "y", "m"])
  a, b = random.randint(2, 9), random.randint(1, 9)
  sub = d >= 1 and random.random() < 0.5
  if sub:
    a, b = max(a, b) + 1, min(a, b)
  c = a - b if sub else a + b
  ct = f"{c}{v}"
  op = "−" if sub else "+"
  return {"kind": "like_terms", "scene": "expr", "ask": L("Simplify {a}{v} {o} {b}{v}.", "{a}{v} {o} {b}{v} को सरल करो।",
                                                          "{a}{v} {o} {b}{v} সরল করো।", a=a, v=v, b=b,
                                                          o="plus" if not sub else "minus"),
          "explain": L("Like terms join: {c}.", "समान पद जुड़ते हैं: {c}।", "সদৃশ পদ যোগ হয়: {c}।", c=ct),
          "show": f"{a}{v} {op} {b}{v} = ?", "c": ct,
          "choices": options(ct, [f"{a + b if sub else a * b}{v}", f"{c + 1}{v}", f"{c}", f"{max(1, c - 1)}{v}"]),
          "eq": f"{a}{v} {op} {b}{v} = {ct}",
          "steps": f"{a}{v} + {'(−' + str(b) + v + ')' if sub else str(b) + v} = {ct}"}


def g_ratio(d):
  if random.random() < 0.5:
    v, k = random.randint(1, 5), random.randint(2, 4)
    c = times_by_adding(k, v)
    q = num_q("ratio", "ratio", L("A {a}-dot domino goes through a 1 to {b} ratio gate. How many dots now?",
                                  "{a} बिंदु वाला डोमिनो 1 अनुपात {b} गेट से गुज़रा। अब कितने बिंदु?",
                                  "{a} বিন্দুর ডোমিনো 1 অনুপাত {b} গেট পেরোল। এখন কতগুলো বিন্দু?", a=v, b=k),
              L("The domino now has {c} dots.", "अब डोमिनो पर {c} बिंदु हैं।", "এখন ডোমিনোতে {c}টা বিন্দু।", c=c), c,
              show=f"1 : {k}", eq=f"{v} × {k} = {c}", steps=" + ".join([str(v)] * k) + f" = {c}", a=v, b=k, up=True)
  else:
    k, m = random.randint(2, 4), random.randint(1, 5)
    v = times_by_adding(k, m)
    c = share_by_taking_away(v, k)
    q = num_q("ratio", "ratio", L("A {a}-dot domino goes through a {b} to 1 ratio gate. How many dots now?",
                                  "{a} बिंदु वाला डोमिनो {b} अनुपात 1 गेट से गुज़रा। अब कितने बिंदु?",
                                  "{a} বিন্দুর ডোমিনো {b} অনুপাত 1 গেট পেরোল। এখন কতগুলো বিন্দু?", a=v, b=k),
              L("The domino now has {c} dots.", "अब डोमिनो पर {c} बिंदु हैं।", "এখন ডোমিনোতে {c}টা বিন্দু।", c=c), c,
              show=f"{k} : 1", eq=f"{v} ÷ {k} = {c}", steps=f"{v} " + " ".join([f"− {k}"] * c) + f" = 0, so {c}",
              a=v, b=k, up=False)
  return q


def g_ratio_simplify(d):
  a, b = random.sample(range(1, 7), 2)
  k = random.randint(2, (4, 6, 9)[d])
  c = f"{a // math.gcd(a, b)} : {b // math.gcd(a, b)}"
  return {"kind": "ratio_simplify", "scene": "expr", "ask": L("Write {x} to {y} in its simplest form.",
                                                              "{x} : {y} को सरलतम रूप में लिखो।",
                                                              "{x} : {y}-কে সরলতম রূপে লেখো।", x=a * k, y=b * k),
          "explain": L("Divide both by {g}: {c}.", "दोनों को {g} से भाग दो: {c}।", "দুটোকেই {g} দিয়ে ভাগ করো: {c}।",
                       g=k * math.gcd(a, b), c=c),
          "show": f"{a * k} : {b * k} = ?", "c": c,
          "choices": options(c, [f"{b} : {a}" if a != b else "1 : 2", f"{a * k // 2 if a * k % 2 == 0 else a + 1} : {b * k // 2 if b * k % 2 == 0 else b + 1}",
                                 f"{a + 1} : {b + 1}", f"{a * 2} : {b}"]),
          "eq": f"{a * k} : {b * k} = {c}", "steps": None,
          "speak": {}}


def g_unitary(d):
  item, hi, bn = random.choice([("pens", "पेन", "কলম"), ("eggs", "अंडे", "ডিম"), ("books", "किताबें", "বই"),
                                ("mangoes", "आम", "আম")])
  n = random.randint(2, (5, 8, 12)[d])
  each = random.randint(2, (10, 20, 50)[d])
  m = random.choice([x for x in range(2, (6, 10, 15)[d] + 1) if x != n])
  total = n * each
  c = m * each
  return num_q("unitary", "expr", L("{n} {i} cost {t} rupees. How much do {m} {i} cost?",
                                    "{n} {ih} {t} रुपये के हैं। {m} {ih} कितने के होंगे?",
                                    "{n}টা {ib}-এর দাম {t} টাকা। {m}টা {ib}-এর দাম কত?",
                                    n=n, i=item, t=total, m=m, ih=hi, ib=bn),
               L("One costs {t} ÷ {n} = {e}. {m} cost {m} × {e} = {c}.", "एक का दाम {t} ÷ {n} = {e}। {m} का {m} × {e} = {c}।",
                 "একটার দাম {t} ÷ {n} = {e}। {m}টার দাম {m} × {e} = {c}।", t=total, n=n, e=each, m=m, c=c), c,
               show=f"{n} {item} = Rs. {total},  {m} {item} = ?", eq=f"{total} ÷ {n} × {m} = {c}",
               wrong=[total + m, c + each, c - each, total * m // max(1, n - 1)])


def g_profit(d):
  cp = random.randint(2, 20) * (5 if d else 1) * 10
  diff = random.randint(1, 10) * (5 if d else 1)
  profit = random.random() < 0.6
  sp = cp + diff if profit else cp - diff
  if d == 0:
    c = "Profit" if profit else "Loss"
    return word_q("profit", "expr", L("Bought for {a} rupees, sold for {b} rupees. Profit or loss?",
                                      "{a} रुपये में खरीदा, {b} रुपये में बेचा। लाभ या हानि?",
                                      "{a} টাকায় কিনে {b} টাকায় বেচা হল। লাভ না ক্ষতি?", a=cp, b=sp),
                  L("Sold for {w}: a {c}.", "{wh} बेचा, इसलिए {ch}।", "{wb} বেচা হল, তাই {cb}।",
                    w="more" if profit else "less", wh="ज़्यादा में" if profit else "कम में",
                    wb="বেশিতে" if profit else "কমে", c=c.lower(), ch=WORDS[c][0], cb=WORDS[c][1]),
                  c, ["Loss" if profit else "Profit"], WORDS, n=2, show=f"Buy Rs. {cp},  Sell Rs. {sp}",
                  eq=f"{sp} − {cp} = {sp - cp}")
  return num_q("profit", "expr", L("Bought for {a} rupees, sold for {b} rupees. How much {w}?",
                                   "{a} रुपये में खरीदा, {b} रुपये में बेचा। कितना {wh}?",
                                   "{a} টাকায় কিনে {b} টাকায় বেচা হল। কত {wb}?", a=cp, b=sp,
                                   w="profit" if profit else "loss", wh="लाभ" if profit else "हानि",
                                   wb="লাভ" if profit else "ক্ষতি"),
               L("The difference is {c} rupees.", "अंतर {c} रुपये है।", "পার্থক্য {c} টাকা।", c=diff), diff,
               show=f"Buy Rs. {cp},  Sell Rs. {sp}", eq=f"{max(cp, sp)} − {min(cp, sp)} = {diff}",
               steps=f"{max(cp, sp)} + (−{min(cp, sp)}) = {diff}", step=5 if d else 1)


def g_interest(d):
  p = random.choice([100, 200, 500, 1000, 2000, 5000])
  r = random.choice([2, 5, 10] if d < 2 else [4, 5, 8, 10, 12])
  t = random.randint(1, (2, 3, 5)[d])
  c = p * r * t // 100
  return num_q("interest", "expr", L("{p} rupees in a bank at {r} percent a year for {t} years. What is the simple interest?",
                                     "{p} रुपये बैंक में {r} प्रतिशत सालाना दर पर {t} साल। साधारण ब्याज कितना?",
                                     "{p} টাকা ব্যাংকে বছরে {r} শতাংশ হারে {t} বছর। সরল সুদ কত?", p=p, r=r, t=t),
               L("{p} × {r} × {t} ÷ 100 = {c} rupees.", "{p} × {r} × {t} ÷ 100 = {c} रुपये।",
                 "{p} × {r} × {t} ÷ 100 = {c} টাকা।", p=p, r=r, t=t, c=c), c,
               show=f"P = {p},  R = {r}%,  T = {t}", eq=f"SI = {p} × {r} × {t} ÷ 100 = {c}",
               steps=" + ".join([str(p * r // 100)] * t) + f" = {c}" if t <= 5 else None,
               wrong=[c + p, p * r // 100, c * 2, c + 10])


# ================================================================ chapters
# (English, Hindi, Bengali) chapter names, and the kinds they ask
CHAPTERS = {
    1: [(("Numbers to 20", "20 तक संख्याएँ", "20 পর্যন্ত সংখ্যা"), ["count", "after", "compare"]),
        (("Numbers to 99", "99 तक संख्याएँ", "99 পর্যন্ত সংখ্যা"), ["tens", "after", "number_name"]),
        (("Addition", "जोड़", "যোগ"), ["add", "bonds"]),
        (("Subtraction", "घटाव", "বিয়োগ"), ["topple", "bonds"]),
        (("Shapes", "आकृतियाँ", "আকার"), ["shape2d", "solid"]),
        (("Measurement", "माप", "মাপ"), ["ruler"]),
        (("Time", "समय", "সময়"), ["clock", "calendar"]),
        (("Money", "पैसे", "টাকা-পয়সা"), ["money"]),
        (("Patterns", "पैटर्न", "নকশা"), ["shape_pattern", "skip"]),
        (("Data", "आँकड़े", "তথ্য"), ["tally", "picto"])],
    2: [(("Numbers to 100", "100 तक संख्याएँ", "100 পর্যন্ত সংখ্যা"), ["tens", "number_name", "biggest", "after"]),
        (("Place value", "स्थानीय मान", "স্থানীয় মান"), ["place_value", "expanded"]),
        (("Add with carry", "हासिल वाला जोड़", "হাতে রেখে যোগ"), ["col_add", "add"]),
        (("Take away with borrow", "उधार वाला घटाव", "ধার করে বিয়োগ"), ["col_sub", "topple"]),
        (("Even and odd", "सम और विषम", "জোড় ও বিজোড়"), ["even_odd", "skip"]),
        (("Groups (times)", "समूह (गुणा)", "দল (গুণ)"), ["times", "skip"]),
        (("Shapes and solids", "आकृतियाँ और ठोस", "আকার ও ঘনবস্তু"), ["shape2d", "solid"]),
        (("Length", "लंबाई", "দৈর্ঘ্য"), ["ruler"]),
        (("Time and calendar", "समय और कैलेंडर", "সময় ও ক্যালেন্ডার"), ["clock", "calendar"]),
        (("Money", "पैसे", "টাকা-পয়সা"), ["money", "change"]),
        (("Patterns", "पैटर्न", "নকশা"), ["shape_pattern", "num_pattern"]),
        (("Data", "आँकड़े", "তথ্য"), ["tally", "picto"])],
    3: [(("Numbers to 999", "999 तक संख्याएँ", "999 পর্যন্ত সংখ্যা"), ["place_value", "expanded", "biggest", "number_name"]),
        (("Add and subtract", "जोड़ और घटाव", "যোগ ও বিয়োগ"), ["col_add", "col_sub"]),
        (("Multiplication", "गुणा", "গুণ"), ["times", "tables", "mult"]),
        (("Division", "भाग", "ভাগ"), ["share", "divide"]),
        (("Fractions", "भिन्न", "ভগ্নাংশ"), ["frac_shade", "frac_of"]),
        (("Shapes and symmetry", "आकृतियाँ और सममिति", "আকার ও প্রতিসাম্য"), ["shape2d", "symmetry", "solid"]),
        (("Measurement", "माप", "মাপ"), ["ruler", "convert"]),
        (("Time", "समय", "সময়"), ["clock", "duration", "calendar"]),
        (("Money", "पैसे", "টাকা-পয়সা"), ["money", "change", "bill"]),
        (("Patterns", "पैटर्न", "নকশা"), ["num_pattern", "shape_pattern", "skip"]),
        (("Data", "आँकड़े", "তথ্য"), ["picto", "bars", "tally"])],
    4: [(("Large numbers", "बड़ी संख्याएँ", "বড় সংখ্যা"), ["place_value", "biggest", "round", "roman"]),
        (("Multiplication", "गुणा", "গুণ"), ["mult", "tables"]),
        (("Division", "भाग", "ভাগ"), ["divide", "share"]),
        (("Fractions", "भिन्न", "ভগ্নাংশ"), ["frac_shade", "frac_equiv", "frac_compare", "frac_of"]),
        (("Decimals", "दशमलव", "দশমিক"), ["frac_to_dec", "dec_add", "dec_compare"]),
        (("Angles and circles", "कोण और वृत्त", "কোণ ও বৃত্ত"), ["angle_type", "circle"]),
        (("Perimeter and area", "परिमाप और क्षेत्रफल", "পরিসীমা ও ক্ষেত্রফল"), ["perimeter", "area"]),
        (("Measurement", "माप", "মাপ"), ["convert"]),
        (("Time", "समय", "সময়"), ["clock", "duration", "calendar"]),
        (("Money", "पैसे", "টাকা-পয়সা"), ["bill", "change"]),
        (("Patterns", "पैटर्न", "নকশা"), ["num_pattern", "fib"]),
        (("Data", "आँकड़े", "তথ্য"), ["bars", "picto"])],
    5: [(("Large numbers", "बड़ी संख्याएँ", "বড় সংখ্যা"), ["place_value", "biggest", "round", "roman"]),
        (("Factors and multiples", "गुणनखंड और गुणज", "উৎপাদক ও গুণিতক"), ["factor", "multiple", "prime", "divisible"]),
        (("Fractions", "भिन्न", "ভগ্নাংশ"), ["frac_add", "frac_equiv", "frac_compare", "frac_of"]),
        (("Decimals", "दशमलव", "দশমিক"), ["dec_add", "dec_compare", "dec_shift"]),
        (("Percent", "प्रतिशत", "শতাংশ"), ["percent", "frac_to_dec"]),
        (("Angles", "कोण", "কোণ"), ["angle_type", "angle_measure"]),
        (("Shapes and symmetry", "आकृतियाँ और सममिति", "আকার ও প্রতিসাম্য"), ["symmetry", "solid", "shape2d"]),
        (("Area and volume", "क्षेत्रफल और आयतन", "ক্ষেত্রফল ও আয়তন"), ["area", "perimeter", "volume"]),
        (("Measurement and time", "माप और समय", "মাপ ও সময়"), ["convert", "duration"]),
        (("Data", "आँकड़े", "তথ্য"), ["bars", "mean"]),
        (("Patterns", "पैटर्न", "নকশা"), ["num_pattern", "fib"])],
    6: [(("Patterns in maths", "गणित में पैटर्न", "গণিতে নকশা"), ["num_pattern", "fib"]),
        (("Lines and angles", "रेखाएँ और कोण", "রেখা ও কোণ"), ["lines", "angle_type", "angle_measure"]),
        (("Number play", "संख्याओं का खेल", "সংখ্যার খেলা"), ["even_odd", "divisible", "bodmas"]),
        (("Prime time", "अभाज्य संख्याएँ", "মৌলিক সংখ্যা"), ["prime", "prime_factor", "factor", "hcf", "multiple"]),
        (("Perimeter and area", "परिमाप और क्षेत्रफल", "পরিসীমা ও ক্ষেত্রফল"), ["perimeter", "area", "area_tri"]),
        (("Fractions", "भिन्न", "ভগ্নাংশ"), ["frac_add", "frac_compare", "frac_equiv"]),
        (("Integers", "पूर्णांक", "পূর্ণসংখ্যা"), ["integer"]),
        (("Symmetry", "सममिति", "প্রতিসাম্য"), ["symmetry"]),
        (("Decimals", "दशमलव", "দশমিক"), ["dec_add", "dec_compare", "dec_shift"]),
        (("Data handling", "आँकड़ों का प्रबंधन", "তথ্য ব্যবস্থাপনা"), ["bars", "picto", "tally"]),
        (("Ratio and algebra", "अनुपात और बीजगणित", "অনুপাত ও বীজগণিত"), ["ratio", "ratio_simplify", "balance", "evaluate"])],
    7: [(("Large numbers", "बड़ी संख्याएँ", "বড় সংখ্যা"), ["place_value", "round", "biggest"]),
        (("Arithmetic expressions", "अंकगणितीय व्यंजक", "পাটিগণিতের রাশি"), ["bodmas"]),
        (("Integers", "पूर्णांक", "পূর্ণসংখ্যা"), ["integer"]),
        (("Fractions and decimals", "भिन्न और दशमलव", "ভগ্নাংশ ও দশমিক"), ["frac_add", "frac_of", "dec_shift", "dec_add"]),
        (("Lines and angles", "रेखाएँ और कोण", "রেখা ও কোণ"), ["angle_pair", "lines"]),
        (("Triangles", "त्रिभुज", "ত্রিভুজ"), ["triangle_angle", "triangle_type"]),
        (("Data handling", "आँकड़ों का प्रबंधन", "তথ্য ব্যবস্থাপনা"), ["mean", "median_mode", "bars"]),
        (("Algebraic expressions", "बीजीय व्यंजक", "বীজগাণিতিক রাশি"), ["evaluate", "like_terms", "balance"]),
        (("Exponents", "घातांक", "সূচক"), ["exponent"]),
        (("Ratio and percent", "अनुपात और प्रतिशत", "অনুপাত ও শতাংশ"), ["ratio", "ratio_simplify", "unitary", "percent"]),
        (("Profit, loss and interest", "लाभ, हानि और ब्याज", "লাভ, ক্ষতি ও সুদ"), ["profit", "interest"]),
        (("Perimeter and area", "परिमाप और क्षेत्रफल", "পরিসীমা ও ক্ষেত্রফল"), ["area", "area_tri", "circle", "volume"])],
}

GENERATORS = {name[2:]: fn for name, fn in list(globals().items()) if name.startswith("g_") and callable(fn)}


def make(kind, d):
  """One question of this kind at difficulty d (0-2)."""
  return GENERATORS[kind](max(0, min(2, d)))


def all_kinds():
  return sorted({k for chs in CHAPTERS.values() for _n, kinds in chs for k in kinds})
