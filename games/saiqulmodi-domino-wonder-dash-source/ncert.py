"""Which picture categories belong to which class, for the Class Pavilions' Subject Magic
Console (world.py): CLASS_TOPICS[class][button] = [category, ...], this class's own NCERT
topics first. Buttons: "evs" (Classes 1-5), "science" and "social" (Classes 6-7).
"""

CLASS_TOPICS = {
    1: {"evs": ["Living & Non-living", "My Family", "Clean & Healthy"]},
    2: {"evs": ["Seasons & Weather", "Helpers Around Us", "Clean & Healthy"]},
    3: {"evs": ["Animal Homes", "Water O' Water", "Flying High", "Houses We Live In"]},
    4: {"evs": ["Going to School", "Save the Trees", "Basva's Farm", "Animal Homes"]},
    5: {"evs": ["Super Senses", "Tasting to Digesting", "Float or Sink", "Up You Go"]},
    6: {"science": ["Food & Nutrients", "Deficiency Diseases", "Plant Parts", "Body Movements",
                    "Light & Shadows", "Energy"],
        "social": ["Early Humans", "Kings & Empires", "Moon Phases", "Globe & Time", "Government & Us"]},
    7: {"science": ["How Living Things Eat", "Heat", "Acids & Bases", "Changes Around Us",
                    "Breathing & Blood", "Motion & Time"],
        "social": ["Kings & Empires", "Government & Us", "Globe & Time"]},
}

# The 3D Wonder Town's seven class segments (user, 05-Nov-2026): each class shows only its own NCERT subjects, and a
# category belongs to one class only. Subject key -> categories, as far as the game has content for it. Everything
# not listed here (tools/export_town_data.py works it out) is an ancillary subject, the same in every class.
MATHS_PLAY = "Maths Play"               # opens on this class's own chapters (mathsgame.py)
SYLLABUS = {
    1: {"english": ["ABC", "abc"],
        "hindi": ["Swar", "Vyanjan"],
        "maths": [MATHS_PLAY, "123", "Shapes"],
        "evs": ["Living & Non-living", "My Family", "Clean & Healthy", "Body"]},
    2: {"maths": [MATHS_PLAY, "Signs"],
        "evs": ["Seasons & Weather", "Helpers Around Us", "Home", "Good Habits"]},
    3: {"maths": [MATHS_PLAY],
        "evs": ["Animal Homes", "Water O' Water", "Flying High", "Houses We Live In", "Plants"]},
    4: {"maths": [MATHS_PLAY],
        "evs": ["Going to School", "Save the Trees", "Basva's Farm"]},
    5: {"maths": [MATHS_PLAY],
        "evs": ["Super Senses", "Tasting to Digesting", "Float or Sink", "Up You Go"]},
    6: {"maths": [MATHS_PLAY, "Angles & Solids"],
        "science": ["Food & Nutrients", "Deficiency Diseases", "Plant Parts", "Body Movements", "Light & Shadows",
                    "Materials", "Lab Tools", "Energy", "Space"],
        "social": ["Early Humans", "Long Ago", "Moon Phases", "Globe & Time", "Earth & Maps", "Government & Us"]},
    7: {"maths": [MATHS_PLAY],
        "science": ["How Living Things Eat", "Heat", "Acids & Bases", "Changes Around Us", "Breathing & Blood",
                    "Motion & Time", "Inside Body"],
        "social": ["Kings & Empires", "Our Country", "India Map", "States", "UTs", "Monuments"]},
}
