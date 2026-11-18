"""Famous places of each Indian state and union territory with a real video
(the "places" playlist in videos.json, written by tools/find_videos.py).

Every file below was picked by a person on 2026-10-11 from Wikimedia Commons
searches (tourism films, travellers' clips, festivals), checking its name,
description, length and licence. Left out: visits by politicians, interviews,
clips filmed outside India and anything not suitable for small children.
Places with no suitable free video yet (for example Lakshadweep) are simply
not listed.

Commons had no video of Lotus Temple, Qutub Minar, the National War Memorial,
an Asiatic lion in India, Puducherry, Chandigarh's garden and sectors or
Chhattisgarh, so those are free Pexels / Pixabay clips, checked frame by frame,
made small with ffmpeg and served from the game's own site (docs/videos/, see
HOSTED). Manipur's Loktak Lake is a short cut from a Commons documentary.

game key -> [(place name shown and said to children, Commons file or docs/ path)]
"""

PLACES = {
    "States/Andhra Pradesh": [
        ("Visakhapatnam beach", "File:Time-lapse of Diwali on Vizag Beach 2018 (2).webm"),
        ("Araku Valley", "File:Baby monkey drinking water.webm"),
    ],
    "States/Arunachal Pradesh": [
        ("Tawang Monastery", "File:Praying with big prayer wheel at Tawang Monastry.webm"),
        ("Nuranang Falls", "File:Jang Waterfall or Nuranang falls.webm"),
        ("Sela Pass butterflies", "File:BUTTERFLYING IN HIGH ALLTITUDE (SELA PASS).webm"),
    ],
    "States/Assam": [
        ("Kaziranga elephants",
         "File:Indian elephant in Kaziranga National Park March 2025 by Tisha Mukherjee 03.mpg"),
        ("Kaziranga buffalo",
         "File:Wild water buffalo in Kaziranga National Park March 2025 by Tisha Mukherjee.mpg"),
        ("Tea gardens", "File:Tea garden Assam India.webm"),
        ("Majuli mask dance", "File:Hemchandra Goswami, Folk Artist, Majuli, Assam.webm"),
        ("Brahmaputra", "File:River flowing.webm"),
    ],
    "States/Bihar": [
        ("Bodh Gaya", "File:Sacred Serenity at Mahabodhi Temple, Bodhgaya, Bihar.webm"),
    ],
    "States/Chhattisgarh": [
        ("Folk dance", "videos/chhattisgarh_folk_dance.mp4"),
    ],
    "States/Goa": [
        ("Old Goa churches", "File:Churches & Convents - Old Goa - India.webm"),
        ("Aguada beach", "File:Aguada beach, Goa.webm"),
        ("A crab on the beach", "File:Crab in a hole (shot in Vainguinim beach, Goa).webm"),
    ],
    "States/Gujarat": [
        ("Statue of Unity",
         'File:"STATUE OF UNITY"- Kevadia (Gujarat) becomes a "Land of Billion Lights" at night..webm'),
        ("Asiatic lion", "videos/asiatic_lion.mp4"),
        ("Rann of Kutch", "File:Kutch in its Traditional form.webm"),
        ("Ahmedabad", "File:Ahmedabad - India's First World Heritage City.webm"),
        ("Sabarmati Ashram", "File:The Land Of Gandhi - Incredible India.webm"),
    ],
    "States/Haryana": [
        ("Surajkund Craft Fair", "File:Indian Been Music at Surajkund Craft Fair.webm"),
    ],
    "States/Himachal Pradesh": [
        ("Shimla toy train", "File:Kalka Shimla Toy Train.webm"),
        ("Snow in Shimla", "File:Cars stuck in snowfall at Summer Hill, Shimla, Himachal Pradesh, 2026.webm"),
        ("Road to Rohtang Pass", "File:Road to Rohtang pass on the Manali-Leh Highway.webm"),
        ("Manali folk dance", "File:Folk Dance Natti.webm"),
    ],
    "States/Jharkhand": [
        ("Bandana Festival", "File:Bandana Festival in Rajmahal.webm"),
    ],
    "States/Karnataka": [
        ("Hampi", "File:Destination - Hampi - India.webm"),
        ("Jog Falls", "File:Rainy days of 2013.webm"),
        ("Mysuru Dasara elephants", "File:ಮೈಸೂರು ದಸರಾ (Mysore Dasara) 2019 (1).webm"),
        ("Lalbagh flower show",
         "File:Indian Independence day celebration 216th flower show 2024, Lalbagh, Bangalore 06.ogg"),
    ],
    "States/Kerala": [
        ("Backwaters and houseboats", "File:Kerala - India's Paradise Found.webm"),
        ("Alappuzha canal", "File:Boat sailing in Alappuzha canal, Kerala.webm"),
        ("Munnar tea hills", "File:Munnar road and tea gardens 02.webm"),
        ("Kathakali", "File:Kalakeyavadham Kathakali clips held at Mridangasyleshwari Temple, Muzhakkunnu (3).webm"),
        ("Snake boat race", "File:NTBR26-Snakeboat Heats3.webm"),
    ],
    "States/Madhya Pradesh": [
        ("Sanchi Stupa", "File:Buddhist Monuments - Sanchi Hill 2013-02-21 4421.ogv"),
        ("Khajuraho Dance Festival", "File:Khajuraho Dance Festival 2025 01.webm"),
    ],
    "States/Maharashtra": [
        ("Gateway of India",
         "File:Gateway Of India - I AM YOUR GUIDE - places in india tourist Travel Holiday Culture Adventure.webm"),
        ("Marine Drive", "File:Timelapse at Marine Drive Mumbai.webm"),
        ("Mumbai local train", "File:Local train starting from Mumbai CSTM 001.webm"),
        ("Gulls at the Gateway", "File:Birds flying behind a ferry.webm"),
    ],
    "States/Manipur": [
        ("Loktak Lake", "videos/manipur_loktak_lake.mp4"),
    ],
    "States/Meghalaya": [
        ("Cherrapunji waterfall", "File:Majestic Wei Sawdong Waterfall.webm"),
        ("Dawki clear river", "File:Boating @ Dawki, Shillong.webm"),
        ("Shillong hills", "File:Beauty of Shillong.webm"),
    ],
    "States/Mizoram": [
        ("Bamboo dance", "File:Chapchar Kut cheraw dance 2014.webm"),
        ("Tuirihiau waterfall", "File:Tuirihiau waterfall.webm"),
        ("Reiek mountain", "File:360 degree view from Reiek top.webm"),
    ],
    "States/Nagaland": [
        ("Hornbill Festival", "File:Folk dance of Nagaland.webm"),
        ("Angami dance", "File:Stories in motion.webm"),
    ],
    "States/Odisha": [
        ("Konark Sun Temple", "File:Timelapse of sunset in Konarka (original).webm"),
        ("Bhubaneswar", "File:The City of Legends - Bhubaneshwar - India.webm"),
        ("Puri Jagannath", "File:SinhadwaraShreeJagannathTemplePuri.webm"),
        ("Rath Yatra", "File:Nandighosha Ratha or Lord Jagannath in 2024.webm"),
    ],
    "States/Punjab": [
        ("Golden Temple",
         "File:Film footage of the Golden Temple in Amritsar, by Roger Dumas, circa November–December 1927.webm"),
        ("Bhangra", "File:Punjabi Dance Performance at Cultural Fest, Himachal Pradesh University, Shimla.webm"),
    ],
    "States/Rajasthan": [
        ("Hawa Mahal", "File:Top view of Hawa Mahal Jaipur.webm"),
        ("Amber Fort", "File:Amber Fort Rajasthan.webm"),
        ("Jaisalmer Fort", "File:Jaisalmer Fort - Rajasthan - India.webm"),
        ("Kathputli puppets", "File:Kathputli at the Jaipur Wax Museum 01.webm"),
        ("Colours of Rajasthan", "File:Rajasthan - You haven't seen it all.webm"),
    ],
    "States/Sikkim": [
        ("Kanchenjunga", "File:Khanchendzonga from Jorebunglow, Darjeeling.webm"),
        ("Tsomgo Lake", "File:Tsongmo Lake, Sikkim, 2026.webm"),
        ("Enchey Monastery", "File:Prayer flags at Enchey Monastery, Gangtok.webm"),
    ],
    "States/Tamil Nadu": [
        ("Meenakshi Temple", "File:Madurai Meenakshi Temple.webm"),
        ("Big Temple", "File:Tanjavur Dance 01.webm"),
        ("Chennai from the lighthouse", "File:Chennai - bird's-eye view.ogv"),
        ("Ooty hills", "File:Ooty view.webm"),
        ("Kanyakumari Express", "File:Kanyakumari Express Timelapse.webm"),
    ],
    "States/Telangana": [
        ("Charminar", "File:Charminar Surrounding video 1.ogv"),
        ("Golconda Fort", "File:Panoramic View of Hyderabaad.webm"),
        ("A tour of Telangana", "File:Telangana - Visit for all reasons & all seasons.webm"),
    ],
    "States/Tripura": [
        ("Neermahal", "File:Neermahal Water Palace, Tripura, India.webm"),
    ],
    "States/Uttar Pradesh": [
        ("Taj Mahal", "File:Eu.Video-Taj Mahal.webm"),
        ("Varanasi ghats", "File:Ganges River in Varanasi by boat.webm"),
        ("Ganga Aarti", "File:Maha Aarti in Dasaswamedh Ghat (Varanasi india).ogv"),
        ("Rumi Darwaza, Lucknow", "File:Rumi Darwaza.webm"),
    ],
    "States/Uttarakhand": [
        ("Badrinath", "File:Badrinath - Uttarakhand - India.webm"),
        ("Ram Jhula, Rishikesh", "File:Rama Jhula Rishikesh Uttarakhand, India.ogv"),
        ("Rafting in Rishikesh", "File:Rafting, Rishikesh, Uttarakhand.webm"),
        ("Ganga Aarti, Haridwar", "File:Ganga Aarti in Haridwar.webm"),
        ("Bhatta Falls, Mussoorie", "File:Bhatta Falls ,Mussoorie.webm"),
    ],
    "States/West Bengal": [
        ("Howrah Bridge", "File:Howrah Bridge Night View (Silent Video) Full HD 1080p HIGH FR60.webm"),
        ("Darjeeling toy train", "File:Darjeeling toy train.webm"),
        ("Durga Puja", "File:DurgaPuja2018 - Pandal of Ahiritola Sarbojonin in Kolkata 01.webm"),
    ],
    "UTs/Andaman & Nicobar": [
        ("Scuba diving", "File:Choose Your Own Adventure - Scuba Diving - India.webm"),
        ("Havelock mangroves", "File:Ride into Mangrove Forest, Havelock Island vrvbaan042k24.webm"),
        ("Baratang Island", "File:Baratang - Andaman 2009-04-17 4170044.ogv"),
    ],
    "UTs/Puducherry": [
        ("French Quarter", "videos/puducherry_french_quarter.mp4"),
        ("Rock Beach", "videos/puducherry_rock_beach.mp4"),
    ],
    "UTs/Chandigarh": [
        ("Sukhna Lake", "File:Chandigarh-lake-sukhna.webm"),
        ("Japanese Garden", "videos/chandigarh_japanese_garden.mp4"),
        ("A city of numbered sectors", "videos/chandigarh_sectors.mp4"),
    ],
    "UTs/Daman & Diu": [
        ("Diu island", "File:Diu Island - Isle of Calm -IncredibleIndia.webm"),
    ],
    "UTs/Delhi": [
        ("A tour of Delhi", "File:Destination - Delhi - India.webm"),
        ("India Gate", "File:ICC World Cup 2011 - cheering at India gate.ogv"),
        ("National War Memorial", "videos/war_memorial.mp4"),
        ("Red Fort", "File:Diwan-I-Am.ogv"),
        ("Qutub Minar", "videos/qutub_minar.mp4"),
        ("Lotus Temple", "videos/lotus_temple.mp4"),
        ("Humayun's Tomb", "File:Humayun's Tomb - Poetry of Longing - Heritage - India.webm"),
        ("Rashtrapati Bhavan", "File:View of Rashtrapati bhavan.webm"),
    ],
    "UTs/Jammu & Kashmir": [
        ("Kashmir valley", "File:Jammu and Kashmir - India.webm"),
        ("Dal Lake", "File:Dal Lake Srinagar.webm"),
        ("Pashmina goats", "File:Pashmina, The Gold of Kashmir & The Himalaya.webm"),
    ],
    "UTs/Ladakh": [
        ("Pangong Lake", "File:Panorama of Pangong lake, Ladakh.webm"),
        ("Leh", "File:A Short Video of Leh City from Tsemo Hill.webm"),
        ("Hemis Monastery", "File:Panorama from Hemis monastery, Ladakh.webm"),
        ("Snow leopard", "File:Snow leopard in Ladakh.webm"),
        ("Kargil", "File:Lamsu village, Kargil during Summers.webm"),
    ],
}

# Clips served from the game's own GitHub Pages site (docs/videos/): free
# licences that allow use without attribution; we credit the maker anyway.
SITE = "https://saiqulmodi.github.io/DominoGame/"
HOSTED = {
    "videos/war_memorial.mp4": {
        "artist": "Vikash Yadav", "license": "Pexels License", "seconds": 45,
        "page": "https://www.pexels.com/video/ceremonial-event-at-outdoor-memorial-35974421/"},
    "videos/qutub_minar.mp4": {
        "artist": "Abhishek Shekhawat", "license": "Pexels License", "seconds": 26,
        "page": "https://www.pexels.com/video/majestic-view-of-qutub-minar-in-delhi-34416410/"},
    "videos/lotus_temple.mp4": {
        "artist": "Aradhyagad", "license": "Pixabay Content License", "seconds": 8,
        "page": "https://pixabay.com/videos/lotus-temple-delhi-india-temple-370418/"},
    # location not stated by the maker; a wild-looking Asiatic lion tagged India
    # (wild Asiatic lions live only in and around Gir)
    "videos/asiatic_lion.mp4": {
        "artist": "sjahanmi", "license": "Pixabay Content License", "seconds": 20,
        "page": "https://pixabay.com/videos/asiatic-lion-india-lion-mammal-50530/"},
    "videos/puducherry_french_quarter.mp4": {
        "artist": "Social Sudo", "license": "Pexels License", "seconds": 15,
        "page": "https://www.pexels.com/video/pondicherry-french-town-in-tamil-nadu-18428850/"},
    # cut from "Abiding Grace - Glimpses of the North-East" (Ministry of External
    # Affairs, 1999, on Wikimedia Commons): 1:32-1:47, the Manipur map, Loktak
    # Lake's floating phumdis and a boat; ends before the sword-art scene
    "videos/manipur_loktak_lake.mp4": {
        "artist": "Gautam Bora, Ministry of External Affairs", "license": "CC BY 3.0", "seconds": 15,
        "page": "https://commons.wikimedia.org/wiki/File:Abiding_Grace_-_Glimpses_of_the_North-East.webm"},
    # tagged Chhattisgarh by the maker: villagers dancing in a big circle, from above
    "videos/chhattisgarh_folk_dance.mp4": {
        "artist": "kaushal237", "license": "Pixabay Content License", "seconds": 20,
        "page": "https://pixabay.com/videos/people-celebration-dance-122709/"},
    "videos/chandigarh_japanese_garden.mp4": {
        "artist": "Ananya Mandial", "license": "Pexels License", "seconds": 30,
        "page": "https://www.pexels.com/video/pagoda-in-chandigarh-architectural-marvel-29799544/"},
    # the road sign shows Chandigarh's numbered sectors 32-51
    "videos/chandigarh_sectors.mp4": {
        "artist": "Ananya Mandial", "license": "Pexels License", "seconds": 21,
        "page": "https://www.pexels.com/video/chandigarh-city-road-traffic-on-a-busy-day-34451088/"},
    "videos/puducherry_rock_beach.mp4": {
        "artist": "Social Sudo", "license": "Pexels License", "seconds": 22,
        "page": "https://www.pexels.com/video/people-enjoying-the-evening-in-a-pondicherry-beach-18462367/"},
}
