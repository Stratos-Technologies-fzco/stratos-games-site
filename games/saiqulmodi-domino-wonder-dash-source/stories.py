"""Story of the day: short adventures that link 5 pictures together.

Each step is (category, item name, sentence). The story changes every day;
children can also pick any story from the Games menu.
"""

STORIES = [
    {"id": "farm", "title": "A Day at the Farm", "steps": [
        ("Birds", "Rooster", "Good morning! The rooster wakes up the farm."),
        ("Animals", "Cow", "The cow gives us fresh milk."),
        ("Animals", "Goat", "The goat munches green grass."),
        ("Vehicles", "Tractor", "The farmer drives the tractor to the field."),
        ("Plants", "Corn", "Tall corn grows in the sunny field."),
    ]},
    {"id": "jungle", "title": "Jungle Adventure", "steps": [
        ("Animals", "Elephant", "We walk into the jungle and meet a big elephant."),
        ("Animals", "Monkey", "A monkey swings from tree to tree."),
        ("Birds", "Parrot", "A green parrot says hello!"),
        ("Reptiles", "Snake", "Shh! A snake slides under the leaves."),
        ("Animals", "Tiger", "The tiger is the king of the Indian jungle."),
    ]},
    {"id": "sea", "title": "Under the Sea", "steps": [
        ("Sea", "Fish", "We dive into the blue sea. Hello, little fish!"),
        ("Sea", "Crab", "A crab walks sideways on the sand."),
        ("Sea", "Octopus", "The octopus waves its eight arms."),
        ("Sea", "Dolphin", "A happy dolphin jumps over the waves."),
        ("Sea", "Whale", "The giant whale sings a deep song."),
    ]},
    {"id": "school", "title": "Off to School", "steps": [
        ("Home", "School Bag", "We pack our school bag."),
        ("Vehicles", "Bus", "We ride the school bus."),
        ("Buildings", "School", "Here is our school!"),
        ("Helpers", "Teacher", "Our teacher says good morning."),
        ("Home", "Pencil", "We write our name with a pencil."),
    ]},
    {"id": "kitchen", "title": "Cooking with Amma", "steps": [
        ("Vegetables", "Potato", "Amma washes the potatoes."),
        ("Vegetables", "Onion", "She cuts an onion. It makes us cry!"),
        ("Vegetables", "Tomato", "Red tomatoes make the curry tasty."),
        ("Food", "Rice", "The rice is ready."),
        ("Food", "Roti", "Hot roti for everyone! Time to eat."),
    ]},
    {"id": "india", "title": "Trip Across India", "steps": [
        ("Countries", "India", "This is our country, India."),
        ("Cities", "Delhi", "We start in Delhi and see India Gate."),
        ("Cities", "Agra", "In Agra we see the beautiful Taj Mahal."),
        ("Rivers", "Ganga", "We visit the holy river Ganga."),
        ("Travel", "Train", "We ride a train home. Choo choo!"),
    ]},
    {"id": "rain", "title": "A Rainy Day", "steps": [
        ("Sky", "Cloud", "Dark clouds fill the sky."),
        ("Sky", "Lightning", "Flash! Lightning lights up the clouds."),
        ("Sky", "Rain", "Pitter patter, here comes the rain."),
        ("Home", "Umbrella", "We open our umbrella."),
        ("Sky", "Rainbow", "The rain stops and a rainbow comes out!"),
    ]},
    {"id": "space", "title": "Trip to Space", "steps": [
        ("Travel", "Rocket", "Three, two, one, blast off in our rocket!"),
        ("Helpers", "Astronaut", "We are astronauts now."),
        ("Sky", "Earth", "Look back, there is our planet Earth."),
        ("Shapes", "Moon", "We fly past the moon."),
        ("Sky", "Saturn", "Saturn has beautiful rings!"),
    ]},
    {"id": "garden", "title": "In the Garden", "steps": [
        ("Plants", "Seedling", "We plant a tiny seed and it grows."),
        ("Plants", "Sunflower", "A sunflower turns to the sun."),
        ("Insects", "Bee", "A bee visits the flowers for honey."),
        ("Insects", "Butterfly", "A butterfly dances in the air."),
        ("Plants", "Tree", "We rest under a big shady tree."),
    ]},
    {"id": "body", "title": "My Amazing Body", "steps": [
        ("Body", "Eye", "With my eyes I see colours."),
        ("Body", "Ear", "With my ears I hear music."),
        ("Body", "Nose", "With my nose I smell flowers."),
        ("Body", "Hand", "With my hands I draw pictures."),
        ("Body", "Tooth", "I brush my teeth every day!"),
    ]},
    {"id": "helpers", "title": "Our Helpers", "steps": [
        ("Helpers", "Farmer", "The farmer grows our food."),
        ("Helpers", "Doctor", "The doctor helps us get well."),
        ("Helpers", "Police", "The police keep us safe."),
        ("Helpers", "Firefighter", "The firefighter puts out fires."),
        ("Helpers", "Cook", "The cook makes a yummy meal. Thank you, helpers!"),
    ]},
    {"id": "music", "title": "Music Party", "steps": [
        ("Music", "Drum", "Boom boom, the drum starts the party."),
        ("Music", "Flute", "The flute plays a sweet tune."),
        ("Music", "Guitar", "Strum the guitar!"),
        ("Music", "Trumpet", "The trumpet plays loud and bright."),
        ("Music", "Bell", "Ding dong, the party ends with a bell."),
    ]},
    {"id": "sports", "title": "Sports Day", "steps": [
        ("Sports", "Cricket", "We play cricket in the park."),
        ("Sports", "Football", "Kick the football into the goal!"),
        ("Sports", "Kite", "We fly a kite high in the sky."),
        ("Sports", "Medal", "Everyone gets a medal for trying."),
        ("Sports", "Trophy", "Our team wins the trophy!"),
    ]},
    {"id": "city", "title": "Busy City Street", "steps": [
        ("Vehicles", "Auto Rickshaw", "An auto rickshaw goes putt putt."),
        ("Vehicles", "Police Car", "A police car rushes by."),
        ("Vehicles", "Ambulance", "Make way for the ambulance!"),
        ("Vehicles", "Bicycle", "Ring ring, here comes a bicycle."),
        ("Bridges", "Howrah Bridge", "We cross the big Howrah Bridge."),
    ]},
]


def story_of_the_day(day_number):
  """Same story all day, a new one tomorrow."""
  return STORIES[day_number % len(STORIES)]


def find(story_id):
  for s in STORIES:
    if s["id"] == story_id:
      return s
  return None
