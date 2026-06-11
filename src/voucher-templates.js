const VOUCHER_TEMPLATES = [ // --- Existing categories --- { name: "60-Min Full
Body Massage", category: "Wellness", price: 550, validMonths: 12, icon:
"massage", desc: "Swedish, deep tissue or aromatherapy of choice", }, { name:
"Couples Spa Day", category: "Wellness", price: 1800, validMonths: 12, icon:
"couples_spa", desc: "Side-by-side treatments, sparkling wine & lunch", }, {
name: "Hot Stone Therapy", category: "Wellness", price: 750, validMonths: 12,
icon: "hot_stone", desc: "90-min volcanic hot stone full-body treatment", }, {
name: "Luxury Pamper Package", category: "Beauty", price: 480, validMonths: 6,
icon: "pamper", desc: "Gel mani, spa pedi & eyebrow shaping", }, { name: "Bridal
Glow Package", category: "Beauty", price: 1950, validMonths: 12, icon: "bridal",
desc: "Full bridal prep: hair, makeup, nails & skin", }, { name: "Tandem
Skydive", category: "Adventure", price: 2950, validMonths: 24, icon: "skydive",
desc: "15,000ft freefall with certified instructor", }, { name: "Hot Air Balloon
Sunrise", category: "Adventure", price: 2400, validMonths: 18, icon: "balloon",
desc: "Champagne breakfast flight over Magaliesberg", }, { name: "Wine Tasting
for Two", category: "Dining & Wine", price: 620, validMonths: 12, icon: "wine",
desc: "6-wine flight with artisan cheese board", }, // --- NEW: Traditional
Restaurants category --- { name: "Sunday Lunch for Two — Kwa Terry", category:
"Traditional Restaurants", price: 420, validMonths: 12, icon: "kwa_terry", desc:
"A proper Zimbabwean Sunday lunch for two at Kwa Terry — sadza, nyama, matemba,
muriwo and all the trimmings. The taste of home, gifted from anywhere in the
world.", }, { name: "Family Feast — Kwa Terry (4 People)", category:
"Traditional Restaurants", price: 980, validMonths: 12, icon:
"kwa_terry_family", desc: "Treat the whole family to a hearty traditional feast
at Kwa Terry. Sadza rezviyo, beef stew, road runner chicken, roasted groundnuts
and more. Seats up to 4.", }, { name: "Feli Nandi's — Lunch for Two", category:
"Traditional Restaurants", price: 380, validMonths: 12, icon: "feli_nandi",
desc: "Send mum (or anyone you love) for a sit-down traditional lunch at Feli
Nandi's. Think freshly pounded sadza, slow-cooked dovi, covo with peanut butter
and a cold Mazoe to wash it down.", }, { name: "Feli Nandi's — Mother's Special
Treat", category: "Traditional Restaurants", price: 650, validMonths: 12, icon:
"feli_nandi_mum", desc: "The ultimate long-distance gift for mum. A full
traditional spread at Feli Nandi's — 3 courses, a cold drink, and a personalised
printed card delivered to her table. She deserves it.", }, { name: "Roadrunner
Chicken Braai Lunch", category: "Traditional Restaurants", price: 320,
validMonths: 6, icon: "roadrunner", desc: "Free-range road runner chicken
braaied over open fire — served with sadza, chakalaka and tomato-onion relish.
Authentic Zimbabwean flavour, no shortcuts.", }, { name: "Sadza & Dovi Dinner
for Two", category: "Traditional Restaurants", price: 350, validMonths: 6, icon:
"sadza_dovi", desc: "A comforting evening meal of sadza with peanut butter stew
(dovi), covo greens and roasted groundnuts. The kind of dinner grandma would
cook.", }, { name: "Traditional Breakfast Spread", category: "Traditional
Restaurants", price: 240, validMonths: 6, icon: "trad_breakfast", desc: "Start
the day the Zimbabwean way — mahewu, rapoko porridge, roasted sweet potato and
fresh maputi. A warm, nourishing breakfast for one.", }, { name: "Whole Family
Sunday Roast (Up to 6)", category: "Traditional Restaurants", price: 1450,
validMonths: 12, icon: "family_roast", desc: "The grandest gift — a full Sunday
roast for up to 6 family members. Whole road runner chicken, beef, sadza, 4
sides and traditional mahewu or Mazoe. Book ahead.", }, { name: "Braai
Masterclass", category: "Dining & Wine", price: 695, validMonths: 12, icon:
"braai", desc: "Learn to braai like a pro — fire, meat & stories", }, // ───
Skills for Foreigners in Zimbabwe ──────────────────────────────────── { name:
"Shona Language Basics — 4 Session Bundle", category: "Skills", price: 850,
validMonths: 12, icon: "shona_language", desc: "Four 1-hour beginner Shona
lessons with a native speaker. Learn greetings, market phrases, numbers and
everyday conversation. Perfect for expats and new arrivals.", }, { name:
"Zimbabwe Business Setup Consultation", category: "Skills", price: 1200,
validMonths: 12, icon: "biz_setup", desc: "A 90-minute 1-on-1 session with a
local business consultant covering company registration, ZIMRA tax basics, forex
rules and what foreign investors need to know.", }, { name: "Expat Orientation
Day", category: "Skills", price: 980, validMonths: 12, icon:
"expat_orientation", desc: "A full guided half-day for new arrivals. Covers
neighbourhoods, mobile money (Ecocash), load-shedding prep, local markets and
expat community contacts. Harare or Bulawayo.", }, { name: "Zimbabwe Driving &
Road Rules Crash Course", category: "Skills", price: 650, validMonths: 6, icon:
"driving_lesson", desc: "A 2-hour practical session for foreigners — learn local
road rules, police checkpoints, licence requirements and how to navigate
Zimbabwe's roads safely.", }, { name: "Shona Stone Sculpture Workshop",
category: "Skills", price: 750, validMonths: 12, icon: "sculpture_workshop",
desc: "A hands-on 3-hour sculpting session with a Zimbabwean master sculptor.
Learn the techniques behind one of Zimbabwe's most celebrated art forms.
Materials included.", }, { name: "Traditional Cooking Masterclass", category:
"Skills", price: 680, validMonths: 12, icon: "cooking_class", desc: "Learn to
cook sadza, dovi, muriwo and roasted groundnuts with a local chef. A 3-hour
hands-on class — eat what you make. Perfect for expats and food-curious
tourists.", }, { name: "Mbira Music Introduction — 3 Lessons", category:
"Skills", price: 720, validMonths: 12, icon: "mbira_lessons", desc: "Three
45-minute beginner lessons on the mbira — Zimbabwe's iconic thumb piano. Learn
traditional songs, techniques and the cultural significance behind the
instrument.", }, { name: "Wildlife & Bush Photography Workshop", category:
"Skills", price: 1450, validMonths: 18, icon: "bush_photography", desc: "A
full-day practical photography workshop in the bush. Covers camera settings,
tracking light, wildlife behaviour and composing the perfect safari shot. All
levels welcome.", }, { name: "Ecocash & Mobile Money for Expats", category:
"Skills", price: 350, validMonths: 6, icon: "mobile_money", desc: "A 1-hour
practical session covering Ecocash, mobile banking, USD cash economy and how to
pay for everything from groceries to fuel as a foreigner in Zimbabwe.", }, {
name: "Zimbabwe Labour Law for Foreign Employers", category: "Skills", price:
1650, validMonths: 12, icon: "labour_law", desc: "A 2-hour briefing with an HR
specialist on Zimbabwe's Labour Act — hiring local staff, contracts, termination
rules, work permits and managing cross-cultural teams.", }, { name: "Solar &
Off-Grid Living Workshop", category: "Skills", price: 890, validMonths: 12,
icon: "solar_workshop", desc: "Learn how to set up and manage solar power,
inverters and water harvesting for your home or business. Essential knowledge
for expats dealing with load-shedding.", }, { name: "Batik & Textile Art Class",
category: "Skills", price: 580, validMonths: 12, icon: "batik_class", desc: "A
3-hour hands-on batik and fabric dyeing workshop with a local textile artist.
Create your own piece to take home. No experience needed. All materials
provided.", }, // --- NEW: Florists category --- { name: "Birthday Bloom
Bouquet", category: "Florists", price: 350, validMonths: 6, icon: "bouquet",
desc: "A hand-arranged seasonal bouquet perfect for birthdays — collected
in-store or delivered.", }, { name: "Luxury Rose Arrangement", category:
"Florists", price: 680, validMonths: 6, icon: "roses", desc: "Premium long-stem
roses arranged by a master florist. Choose your colour on redemption.", }, {
name: "Weekly Flower Subscription", category: "Florists", price: 1200,
validMonths: 3, icon: "subscription", desc: "4 weeks of fresh seasonal flower
deliveries — a gift that keeps giving all month long.", }, { name: "Wedding
Centrepiece Voucher", category: "Florists", price: 2500, validMonths: 12, icon:
"wedding_flowers", desc: "One full table centrepiece arrangement for weddings or
special events. Consultation included.", }, { name: "Surprise Me Seasonal
Bouquet", category: "Florists", price: 450, validMonths: 6, icon:
"surprise_bouquet", desc: "Let the florist work their magic — a beautiful
seasonal arrangement chosen fresh on the day.", }, { name: "Corporate Office
Flowers", category: "Florists", price: 1800, validMonths: 12, icon:
"corporate_flowers", desc: "Monthly fresh flower arrangement for reception or
boardroom. Delivery and setup included.", }, // --- NEW: Music category --- {
name: "Live Jazz Evening for Two", category: "Music", price: 780, validMonths:
12, icon: "jazz", desc: "Two tickets to an intimate live jazz performance at a
premier Zimbabwean venue, including welcome cocktails.", }, { name: "Private
Guitar Lesson Bundle", category: "Music", price: 650, validMonths: 12, icon:
"guitar", desc: "4 x 45-minute private guitar lessons (acoustic or electric)
with a professional musician. All levels welcome.", }, { name: "Studio Recording
Session", category: "Music", price: 1200, validMonths: 12, icon: "studio", desc:
"3-hour professional studio recording session — perfect for soloists, bands or
podcasters. Files delivered digitally.", }, { name: "Concert Ticket Voucher",
category: "Music", price: 450, validMonths: 6, icon: "concert", desc:
"Redeemable against any single concert ticket purchased through our partner
venues across Zimbabwe.", }, { name: "DJ Workshop — Beginner", category:
"Music", price: 990, validMonths: 12, icon: "dj", desc: "Full-day intro to
DJing: mixing, beatmatching, software and equipment provided. Walk away knowing
how to DJ.", }, // --- NEW: Events category --- { name: "Corporate Function
Package", category: "Events", price: 4500, validMonths: 12, icon: "corporate",
desc: "Half-day venue hire for up to 30 guests including AV setup, catering
allowance and on-site coordinator.", }, { name: "Birthday Celebration Bundle",
category: "Events", price: 1850, validMonths: 12, icon: "birthday", desc:
"Private venue styling, décor package, welcome drinks for up to 20 guests and a
personalised cake.", }, { name: "Kids Party Experience", category: "Events",
price: 1200, validMonths: 6, icon: "kids_party", desc: "2-hour fully-hosted kids
party with entertainment, face painting, snacks and party packs for 15
children.", }, { name: "Wedding Anniversary Dinner", category: "Events", price:
2200, validMonths: 12, icon: "anniversary", desc: "Private 5-course dinner for
two at a top ZIM restaurant with a dedicated sommelier and personalised menu.",
}, { name: "Festival General Access Pass", category: "Events", price: 580,
validMonths: 6, icon: "festival", desc: "One general-access pass redeemable at
any participating Zimbabwean food, arts or music festival.", }, { name: "Ancient
City Lodge — 1 Night Stay", category: "Stays", price: 2800, validMonths: 12,
icon: "ancient_city", desc: "One night for two at Ancient City Lodge, Masvingo —
stone-walled luxury steps from the Great Zimbabwe Ruins. Breakfast included.",
imageUrl: "/images/ancient-city-lodge-masvingo-698880.webp", }, { name: "Great
Zimbabwe Ruins Weekend", category: "Stays", price: 5200, validMonths: 12, icon:
"great_zim_weekend", desc: "Two nights for two at Ancient City Lodge — guided
ruins tour, full breakfast daily and sunset drinks by the stone pool.", }, {
name: "Masvingo Heritage Escape", category: "Stays", price: 3600, validMonths:
12, icon: "masvingo_escape", desc: "One night bed & breakfast plus a private
guided tour of the Great Zimbabwe National Monument. History, luxury and nature
in one gift.", }, ];
