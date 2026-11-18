# Palm Jumeirah Layout for DominoGame (world roads & educational zones)
import math

class PalmWorld:
    def __init__(self, base_x=1200, base_y=2400, trunk_length=1600):
        self.base_x = base_x
        self.base_y = base_y
        self.trunk_length = trunk_length
        self.roads = []
        self.zones = []
        self._build_layout()

    def _build_layout(self):
        # 1. Main Entry Trunk (Gateway to Archipelago)
        self.roads.append({
            "name": "Palm Trunk Highway",
            "type": "trunk",
            "start": (self.base_x, self.base_y),
            "end": (self.base_x, self.base_y - self.trunk_length),
            "width": 40
        })

        # 2. Palm Fronds (Curved branches for educational topics)
        frond_topics = [
            ("Frond 1 (Left) - Math Safari", -1, 0, "Basic Math & Arithmetic"),
            ("Frond 1 (Right) - Geometry Garden", 1, 0, "Shapes & Spatial Logic"),
            ("Frond 2 (Left) - Phonics Forest", -1, 1, "Alphabets, Words & Spelling"),
            ("Frond 2 (Right) - Reading Cove", 1, 1, "Story Comprehension & Fables"),
            ("Frond 3 (Left) - Solar Wonder", -1, 2, "Space, Gravity & Nature"),
            ("Frond 3 (Right) - Logic & Code Pier", 1, 2, "Patterns, Algorithms & Circuits")
        ]

        frond_reach = 650
        for title, side, tier, description in frond_topics:
            start_y = self.base_y - 300 - (tier * 400)
            end_x = self.base_x + (side * frond_reach)
            end_y = start_y - 120

            # Frond pathway
            self.roads.append({
                "name": title,
                "type": "frond",
                "start": (self.base_x, start_y),
                "end": (end_x, end_y),
                "width": 24
            })

            # Interactive Education Station at the frond tip
            self.zones.append({
                "title": title,
                "category": description,
                "pos": (end_x, end_y),
                "radius": 45,
                "unlocked": True
            })

        # 3. Outer Crescent (Breakwater Ring)
        self.roads.append({
            "name": "Outer Crescent Ring",
            "type": "crescent",
            "center": (self.base_x, self.base_y - self.trunk_length),
            "radius": 850,
            "width": 30
        })

print("Palm Jumeirah layout module ready!")
