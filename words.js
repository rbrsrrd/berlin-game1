// CODE BERLINZ — word banks
// Add your own words any time: just push more strings into these arrays,
// or load extra words from a JSON/CSV file at boot (see loadExtra() below).

const AR_WORDS = [
"أسد","نمر","فيل","زرافة","حصان","جمل","ذئب","ثعلب","أرنب","سنجاب","قرد","غوريلا","دب","باندا","كنغر","تمساح","ثعبان","سلحفاة","ضفدع","سمكة","قرش","حوت","دلفين","أخطبوط","نجم البحر","سرطان البحر","نسر","صقر","بومة","ببغاء","بطريق","نعامة","طاووس","حمامة","عصفور","خفاش","فراشة","نحلة","نملة","عنكبوت","عقرب","جراد","يعسوب","خنفساء","دودة","حلزون","قنفذ","خلد","فأر","جرذ","غزال","ظبي","وعل","خروف","ماعز","بقرة","ثور","جاموس","خنزير","دجاجة","ديك","بطة","إوزة","حمار","بغل","قط","كلب",
"مدرسة","جامعة","مستشفى","مطار","ميناء","محطة قطار","جسر","نفق","برج","قلعة","قصر","معبد","مسجد","كنيسة","سوق","متحف","مكتبة","حديقة","غابة","صحراء","جبل","وادي","نهر","بحيرة","بحر","محيط","جزيرة","شاطئ","كهف","بركان","مصنع","مزرعة","سجن","محكمة","بنك","فندق","مطعم","مقهى","صيدلية","ملعب","استاد","مسرح","سينما","بلدية","سفارة","ثكنة","مرصد فلكي","مختبر","محطة فضاء",
"ساعة","مفتاح","قفل","باب","نافذة","مرآة","كرسي","طاولة","سرير","خزانة","مصباح","شمعة","كتاب","قلم","ورقة","خريطة","بوصلة","كاميرا","هاتف","حاسوب","شاشة","سماعة","مكبر صوت","مروحة","ثلاجة","فرن","موقد","سكين","ملعقة","شوكة","طبق","كوب","إبريق","مظلة","حقيبة","محفظة","نظارة","ساعة يد","خاتم","قلادة","تاج","سيف","درع","رمح","سهم","قوس","مسدس","بندقية","قنبلة","صاروخ","طائرة","سفينة","غواصة","قطار","سيارة","دراجة","عربة","صندوق","حبل","سلم","مطرقة","مسمار","براغي","منشار",
"شمس","قمر","نجمة","كوكب","مجرة","سحابة","مطر","ثلج","برق","رعد","ريح","عاصفة","قوس قزح","فجر","غروب","ليل","نهار","حجر","صخرة","رمل","تراب","طين","ماء","نار","هواء","جليد","ذهب","فضة","حديد","نحاس","ألماس","لؤلؤة","مرجان","ملح","شجرة","جذر","غصن","زهرة","وردة","نخلة","صنوبر","بلوط","عشب","طحلب","فطر",
"خبز","أرز","تمر","عسل","حليب","جبن","زيت","سكر","فلفل","بصل","ثوم","طماطم","خيار","بطاطس","جزر","تفاح","موز","برتقال","عنب","رمان","تين","مانجو","أناناس","بطيخ","شمام","فراولة","ليمون","قهوة","شاي","عصير","شوكولاتة","كعكة","بيتزا","برغر","شاورما","كباب","حساء","سلطة","بيض","سمك مشوي","دجاج","لحم",
"قلب","عقل","رأس","عين","أذن","أنف","فم","يد","قدم","ظهر","كتف","ركبة","إصبع","شعر","جلد","عظم","دم","فرح","حزن","غضب","خوف","حب","أمل","حلم","ذكرى","صداقة","ثقة","شجاعة","صبر",
"إنترنت","برمجة","روبوت","ذكاء اصطناعي","طاقة","كهرباء","مغناطيس","ذرة","جاذبية","تلسكوب","مجهر","قمر صناعي","محطة فضائية","مسبار فضائي","طاقة شمسية","بطارية","محرك","عجلة","مضخة","دائرة كهربائية",
"طبيب","مهندس","معلم","طيار","بحار","جندي","شرطي","إطفائي","محامي","قاضي","صحفي","كاتب","رسام","موسيقي","ممثل","مخرج","طباخ","نجار","حداد","خياط","فلاح","صياد","تاجر","محاسب","عالم","مصور","مترجم","دبلوماسي","جاسوس","محقق",
"كرة قدم","كرة سلة","كرة طائرة","تنس","سباحة","جري","قفز","ملاكمة","مصارعة","شطرنج","دراجة هوائية","تزلج","غوص","تجديف","رماية","سباق",
"بغداد","دمشق","القاهرة","الرياض","بيروت","عمّان","تونس","الرباط","برلين","باريس","لندن","روما","مدريد","موسكو","بكين","طوكيو","نيويورك","القدس","إسطنبول","فيينا",
"فرعون","هرم","أبو الهول","مومياء","تنين","عملاق","ساحر","شبح","وحش","أسطورة","فايكنغ","فارس","محارب","إمبراطور","ملكة","تاج الملك",
"زمن","مستقبل","ماضي","حاضر","سلام","حرب","ثورة","حرية","عدالة","قانون","دستور","انتخابات","اقتصاد","تجارة","صناعة","سياحة","ثقافة","فن","تعليم","صحة","بيئة","مناخ",
"قميص","بنطال","فستان","جاكيت","معطف","حذاء","جورب","قبعة","وشاح","قفاز","حزام","ربطة عنق","عباءة","عمامة",
"عود","ناي","طبل","قيثارة","بيانو","كمان","مزمار","دف","أرغن","ترومبيت",
"دائرة","مثلث","مربع","مستطيل","نجمة خماسية","لون أحمر","لون أزرق","لون أخضر","لون أصفر","لون أسود","لون أبيض","بنفسجي","برتقالي اللون","وردي","رمادي","بني","ذهبي اللون","فضي اللون",
"قلم رصاص","ممحاة","مسطرة","حقيبة مدرسية","دفتر","سبورة","طباشير","حاسبة",
"مقلاة","قدر طبخ","خلاط","محمصة","غسالة صحون","ميكروويف",
"زمرد","ياقوت","عقيق","فيروز","كهرمان",
"خنجر","فأس","منجنيق","دبابة","غواصة نووية",
"مجرة درب التبانة","ثقب أسود","مذنب","نيزك","مركبة فضائية","رائد فضاء",
"قرش أبيض","حبار","قنديل البحر","فقمة","أسد بحر","سمك السيف",
"ضباب","صقيع","إعصار","زلزال","تسونامي","فيضان","جفاف","حريق غابات",
"نرد","دومينو","ورق لعب","كلمات متقاطعة","لغز","متاهة",
"عيد","مهرجان","كرنفال","حفل زفاف","عيد ميلاد",
"مغامرة","رحلة","سفر","اكتشاف","اختراع","معجزة","سر","خطة","خدعة","مفاجأة","تحدي","فرصة","نجاح","فشل","جائزة","ميدالية","كأس","بطولة"
];

const EN_WORDS = [
"Lion","Tiger","Elephant","Giraffe","Horse","Camel","Wolf","Fox","Rabbit","Squirrel","Monkey","Gorilla","Bear","Panda","Kangaroo","Crocodile","Snake","Turtle","Frog","Fish","Shark","Whale","Dolphin","Octopus","Starfish","Crab","Eagle","Falcon","Owl","Parrot","Penguin","Ostrich","Peacock","Dove","Sparrow","Bat","Butterfly","Bee","Ant","Spider","Scorpion","Beetle","Snail","Hedgehog","Mole","Mouse","Rat","Deer","Goat","Cow","Bull","Buffalo","Pig","Chicken","Duck","Goose","Donkey","Cat","Dog",
"School","University","Hospital","Airport","Harbor","Station","Bridge","Tunnel","Tower","Castle","Palace","Temple","Mosque","Church","Market","Museum","Library","Park","Forest","Desert","Mountain","Valley","River","Lake","Sea","Ocean","Island","Beach","Cave","Volcano","Factory","Farm","Prison","Court","Bank","Hotel","Restaurant","Cafe","Pharmacy","Stadium","Theater","Cinema","Embassy","Observatory","Laboratory","Space Station",
"Clock","Key","Lock","Door","Window","Mirror","Chair","Table","Bed","Cabinet","Lamp","Candle","Book","Pen","Paper","Map","Compass","Camera","Phone","Computer","Screen","Speaker","Fan","Fridge","Oven","Stove","Knife","Spoon","Fork","Plate","Cup","Kettle","Umbrella","Bag","Wallet","Glasses","Watch","Ring","Necklace","Crown","Sword","Shield","Spear","Arrow","Bow","Gun","Rifle","Bomb","Rocket","Airplane","Ship","Submarine","Train","Car","Bicycle","Cart","Box","Rope","Ladder","Hammer","Nail","Screw","Saw",
"Sun","Moon","Star","Planet","Galaxy","Cloud","Rain","Snow","Lightning","Thunder","Wind","Storm","Rainbow","Dawn","Sunset","Night","Day","Stone","Rock","Sand","Dust","Clay","Water","Fire","Air","Ice","Gold","Silver","Iron","Copper","Diamond","Pearl","Coral","Salt","Tree","Root","Branch","Flower","Rose","Palm","Pine","Oak","Grass","Moss","Mushroom",
"Bread","Rice","Honey","Milk","Cheese","Oil","Sugar","Pepper","Onion","Garlic","Tomato","Cucumber","Potato","Carrot","Apple","Banana","Orange","Grape","Pomegranate","Fig","Mango","Pineapple","Watermelon","Strawberry","Lemon","Coffee","Tea","Juice","Chocolate","Cake","Pizza","Burger","Soup","Salad","Egg","Chicken","Meat",
"Heart","Brain","Head","Eye","Ear","Nose","Mouth","Hand","Foot","Back","Shoulder","Knee","Finger","Hair","Skin","Bone","Joy","Sadness","Anger","Fear","Love","Hope","Dream","Memory","Friendship","Trust","Courage","Patience",
"Internet","Code","Robot","Artificial Intelligence","Energy","Electricity","Magnet","Atom","Gravity","Telescope","Microscope","Satellite","Space Station","Probe","Solar Power","Battery","Engine","Wheel","Pump","Circuit",
"Doctor","Engineer","Teacher","Pilot","Sailor","Soldier","Police","Firefighter","Lawyer","Judge","Journalist","Writer","Painter","Musician","Actor","Director","Chef","Carpenter","Blacksmith","Tailor","Farmer","Fisherman","Merchant","Accountant","Scientist","Photographer","Translator","Diplomat","Spy","Detective",
"Football","Basketball","Volleyball","Tennis","Swimming","Running","Jumping","Boxing","Wrestling","Chess","Cycling","Skiing","Diving","Rowing","Archery","Race",
"Berlin","Paris","London","Rome","Madrid","Moscow","Beijing","Tokyo","New York","Istanbul","Vienna","Cairo","Baghdad",
"Pharaoh","Pyramid","Sphinx","Mummy","Dragon","Giant","Wizard","Ghost","Monster","Legend","Viking","Knight","Warrior","Emperor","Queen",
"Time","Future","Past","Present","Peace","War","Revolution","Freedom","Justice","Law","Economy","Trade","Industry","Tourism","Culture","Art","Education","Health","Environment","Climate",
"Shirt","Pants","Dress","Jacket","Coat","Shoe","Sock","Hat","Scarf","Glove","Belt","Tie",
"Guitar","Flute","Drum","Harp","Piano","Violin","Trumpet",
"Circle","Triangle","Square","Rectangle","Star","Red","Blue","Green","Yellow","Black","White","Purple","Orange","Pink","Gray","Brown","Gold","Silver",
"Pencil","Eraser","Ruler","Backpack","Notebook","Whiteboard","Chalk","Calculator",
"Pan","Pot","Blender","Toaster","Dishwasher","Microwave",
"Emerald","Ruby","Turquoise","Amber",
"Dagger","Axe","Catapult","Tank","Nuclear Submarine",
"Milky Way","Black Hole","Comet","Meteor","Spacecraft","Astronaut",
"White Shark","Squid","Jellyfish","Seal","Sea Lion","Swordfish",
"Fog","Frost","Hurricane","Earthquake","Tsunami","Flood","Drought","Wildfire",
"Dice","Domino","Cards","Crossword","Puzzle","Maze",
"Holiday","Festival","Carnival","Wedding","Birthday",
"Adventure","Journey","Trip","Discovery","Invention","Miracle","Secret","Plan","Trick","Surprise","Challenge","Opportunity","Success","Failure","Prize","Medal","Trophy","Championship"
];

module.exports = { AR_WORDS, EN_WORDS };
