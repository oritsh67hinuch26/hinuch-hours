const { useState } = React;

const days = [
  {
    day: 1, date: "22.5", weekday: "חמישי",
    theme: "מינכן ← קייזרטל ← זלצבורג", emoji: "✈️", color: "#5B8E7D",
    morning: [
      "12:30 נחיתה מינכן + קבלת רכב",
      "קייזרטל (45 דק' מהנמל) – עמק ללא מכוניות: 280 מדרגות Kaiseraufstieg, כנסיית Antonius הפוטוגנית, בתי קפה כפריים מקומיים"
    ],
    afternoon: [
      "16:00 זלצבורג – Getreidegasse, קתדרלה וכיכר Residenzplatz, גני Mirabell, גשר המנעולים Makartsteg",
      "שקיעה מ-Kapuzinerberg – נוף על העיר"
    ],
    evening: ["ארוחת ערב בעיר העתיקה", "לינה: Motel One Salzburg-Süd"],
    hotel: "Motel One Salzburg-Süd", gf: "Triangel, Carpe Diem",
    distance: "מינכן←זלצבורג: 145 ק\"מ | 1.5 שעות",
    tip: "לרכוש מדבקת כבישים (Vignette) לאוסטריה בתחנת דלק לפני הגבול",
    gfPlaces: [
      { label: "🌿 Triangel Restaurant", waze: "https://waze.com/ul?ll=47.7998,13.0455&navigate=yes" },
      { label: "🥂 Carpe Diem Finest Fingerfood", waze: "https://waze.com/ul?ll=47.8008,13.0432&navigate=yes" },
    ],
    stops: [
      { label: "✈️ שדה תעופה מינכן", waze: "https://waze.com/ul?ll=48.3537,11.7750&navigate=yes" },
      { label: "🏔️ קייזרטל", waze: "https://waze.com/ul?ll=47.5747,12.1897&navigate=yes" },
      { label: "🏘️ גטריידגאסה זלצבורג", waze: "https://waze.com/ul?ll=47.8004,13.0433&navigate=yes" },
      { label: "🌸 גני מיראבל", waze: "https://waze.com/ul?ll=47.8044,13.0404&navigate=yes" },
      { label: "🏨 Motel One Salzburg", waze: "https://waze.com/ul?q=Motel+One+Salzburg+Sud&navigate=yes" },
    ]
  },
  {
    day: 2, date: "23.5", weekday: "שישי",
    theme: "Salzachöfen + Gosausee", emoji: "🏔️", color: "#4A7C8E",
    morning: [
      "07:30 הלשטאט – סיבוב קצר בעיירה לפני העומס",
      "09:00 נקיק Salzachöfen (30 דק' מזלצבורג) – חצוב לעומק 90 מ', דום טבעי מסלעים, 3 יורו כניסה, כשעה-שעתיים הליכה",
      "11:30 Golling – ארוחת צהריים בגשטהוף מקומי"
    ],
    afternoon: [
      "14:00 אגם Gosausee – הליכה לאורך הגדה הימנית עד סוף האגם הראשון, קרחון Dachstein משתקף במים"
    ],
    evening: [
      "17:30 נסיעה לאבנטאו (20 דק') + ארוחת ערב שקטה",
      "לינה: Frauenzimmer by Townhouse, אבנטאו"
    ],
    hotel: "Frauenzimmer by Townhouse – אבנטאו", gf: "Bräugasthof, Golling",
    distance: "זלצבורג←Salzachöfen: 40 ק\"מ | ←Gosausee: 25 ק\"מ | ←אבנטאו: 20 ק\"מ",
    tip: "גוסאו > הלשטאט – פחות תיירותי, יותר יפה!",
    gfPlaces: [
      { label: "🌿 Bräugasthof Abtenau", waze: "https://waze.com/ul?ll=47.5688,13.3453&navigate=yes" },
      { label: "🍽️ Gasthof Zur Post, Golling", waze: "https://waze.com/ul?ll=47.5964,13.1650&navigate=yes" },
    ],
    stops: [
      { label: "🏘️ הלשטאט", waze: "https://waze.com/ul?ll=47.5622,13.6493&navigate=yes" },
      { label: "🪨 נקיק Salzachöfen", waze: "https://waze.com/ul?ll=47.5897,13.1714&navigate=yes" },
      { label: "🍽️ Golling an der Salzach", waze: "https://waze.com/ul?ll=47.5964,13.1650&navigate=yes" },
      { label: "🏔️ אגם Gosausee", waze: "https://waze.com/ul?ll=47.5358,13.5281&navigate=yes" },
      { label: "🏨 Abtenau (מלון)", waze: "https://waze.com/ul?ll=47.5688,13.3453&navigate=yes" },
    ]
  },
  {
    day: 3, date: "24.5", weekday: "שבת",
    theme: "🎂 יום הולדת! Hohenwerfen + Zell am See", emoji: "🎂", color: "#8E5B7D",
    morning: [
      "09:30 טירת Hohenwerfen – סיור בטירה, הגעה מוקדמת",
      "11:15 מופע הבזים – חובה לאוהבי בעלי חיים!",
      "13:30 נקיק זיגמונד-טון (קפרון) – כשעה הליכה בנקיק הטורקיז"
    ],
    afternoon: [
      "צ'ק-אין ל-Aparthotel Zell am See – כרטיב חינמי לרכבל",
      "15:30 Schmittenhöhe – רכבל לגובה 1,965 מ', תצפית פנורמית על 30 פסגות והאגם"
    ],
    evening: [
      "ארוחת ערב חגיגית ליום הולדת 🎉",
      "לינה: Aparthotel Zell am See – נוף לאגם"
    ],
    hotel: "ALPIN – Das Sporthotel | SUMMERCARD כלולה 🎿", gf: "Kupferkanne, Zell am See",
    distance: "אבנטאו←Hohenwerfen: 20 ק\"מ | ←Zell am See: 30 ק\"מ",
    tip: "מופע הבזים ב-11:15 – זמן מושלם! | SUMMERCARD מהמלון כולל רכבל חינם!",
    gfPlaces: [
      { label: "☕ Kupferkanne Zell am See", waze: "https://waze.com/ul?ll=47.3244,12.7940&navigate=yes" },
      { label: "🌿 Restaurant Steinerwirt, Zell am See", waze: "https://waze.com/ul?ll=47.3260,12.7950&navigate=yes" },
    ],
    stops: [
      { label: "🏰 טירת Hohenwerfen", waze: "https://waze.com/ul?ll=47.4618,13.1872&navigate=yes" },
      { label: "💧 נקיק זיגמונד-טון", waze: "https://waze.com/ul?ll=47.3747,13.1253&navigate=yes" },
      { label: "🏔️ Schmittenhöhe (רכבל)", waze: "https://waze.com/ul?ll=47.3244,12.7931&navigate=yes" },
      { label: "🏨 Aparthotel Zell am See", waze: "https://waze.com/ul?q=ALPIN+Das+Sporthotel+Zell+am+See&navigate=yes" },
    ]
  },
  {
    day: 4, date: "25.5", weekday: "ראשון",
    theme: "יום הגבהים הגדול", emoji: "⛰️", color: "#6B7E4A",
    morning: [
      "07:30 סכר Kaprun – חובה: בגדי חורף + כפפות + כובע! אוטובוס ← רכבל פתוח ← אוטובוס, כ-4 שעות כולל נסיעות",
      "תצפית עליונה על הסכר – מחייב!"
    ],
    afternoon: [
      "12:00 Grossglockner High Alpine Road – הכביש הפנורמי היפה ביותר באלפים",
      "עצירת חובה: Edelweissspitze – הנקודה הגבוהה ביותר אליה ניתן להגיע ברכב",
      "Franz-Josef-Höhe – צפייה בקרחון Pasterze ומרמיטות 🦔"
    ],
    evening: [
      "17:30 חזרה למלון + ארוחת ערב שקטה",
      "לינה: Aparthotel Zell am See"
    ],
    hotel: "ALPIN – Das Sporthotel | SUMMERCARD כלולה 🎿", gf: "להצטייד בחטיפי GF מהמלון",
    distance: "Zell am See←סכר: 10 ק\"מ | ←גרוסגלוקנר: 15 ק\"מ | דרך פנורמית: 48 ק\"מ",
    tip: "לבדוק www.grossglockner.at לפני היציאה | SUMMERCARD מהמלון – בדקי אילו רכבלים כלולים!",
    gfPlaces: [
      { label: "🌿 Fürthermoaralm (בדרך הפנורמית)", waze: "https://waze.com/ul?ll=47.0800,12.7800&navigate=yes" },
      { label: "☕ Kupferkanne, Zell am See", waze: "https://waze.com/ul?ll=47.3244,12.7940&navigate=yes" },
    ],
    stops: [
      { label: "💧 סכר Kaprun", waze: "https://waze.com/ul?ll=47.2667,12.7597&navigate=yes" },
      { label: "⛰️ כניסת גרוסגלוקנר", waze: "https://waze.com/ul?ll=47.1167,12.8417&navigate=yes" },
      { label: "🌸 Edelweissspitze", waze: "https://waze.com/ul?ll=47.1333,12.8417&navigate=yes" },
      { label: "🧊 Franz-Josef-Höhe (קרחון)", waze: "https://waze.com/ul?ll=47.0733,12.7450&navigate=yes" },
      { label: "🏨 חזרה ל-Zell am See", waze: "https://waze.com/ul?ll=47.3244,12.7931&navigate=yes" },
    ]
  },
  {
    day: 5, date: "26.5", weekday: "שני",
    theme: "Krimml → Rattenberg", emoji: "💧", color: "#4A6B8E",
    morning: [
      "08:30 מפלי Krimml – הגבוהים באירופה (380 מ'!), 3 רמות מרהיבות, 2.5-3 שעות הליכה, ~6-8 יורו כניסה"
    ],
    afternoon: [
      "12:00 מעבר Gerlos Pass – תצפיות פנורמיות ועצירה ב-Gerlos Stausee (מים טורקיז)",
      "14:30 Rattenberg – העיר הקטנה באוסטריה (400 מ' אורך!), חנויות זכוכית, רחובות מהמאה ה-13"
    ],
    evening: [
      "17:00 צ'ק-אין + סיור קצר בעיר",
      "ארוחת ערב על נהר Inn | לינה: Boutiquehotel Rattenberg (בניין גותי מ-1500, דירוג 9.6)"
    ],
    hotel: "Boutiquehotel Rattenberg – בניין גותי מ-1500, דירוג 9.6", gf: "ברברה מגישה ארוחת בוקר אזורית בעצמה",
    distance: "Zell am See←Krimml: 35 ק\"מ | ←Gerlos: 45 ק\"מ | ←Rattenberg: 70 ק\"מ",
    tip: "חלופת גשם: מכרות הכסף Silver Mine ב-Schwaz",
    gfPlaces: [
      { label: "🌿 Café Antik, Rattenberg", waze: "https://waze.com/ul?ll=47.4397,11.8942&navigate=yes" },
      { label: "🍽️ Gasthof Zollhaus, Rattenberg", waze: "https://waze.com/ul?ll=47.4400,11.8950&navigate=yes" },
    ],
    stops: [
      { label: "💧 מפלי Krimml", waze: "https://waze.com/ul?ll=47.2167,12.1700&navigate=yes" },
      { label: "🏔️ Gerlos Pass", waze: "https://waze.com/ul?ll=47.2383,12.0383&navigate=yes" },
      { label: "💎 Gerlos Stausee", waze: "https://waze.com/ul?ll=47.2500,12.0167&navigate=yes" },
      { label: "🏘️ Rattenberg", waze: "https://waze.com/ul?ll=47.4397,11.8942&navigate=yes" },
      { label: "🏨 Boutiquehotel Rattenberg", waze: "https://waze.com/ul?q=Boutiquehotel+Rattenberg&navigate=yes" },
    ]
  },
  {
    day: 6, date: "27.5", weekday: "שלישי",
    theme: "מחלבה + אגם Achensee – יום רגוע", emoji: "🧀", color: "#8E7D4A",
    morning: [
      "09:00 נקיק Wolfsklamm (Stans) – הליכה במדרגות עץ לאורך מפל עד לכנסייה למעלה, כשעה וחצי",
      "11:30 מחלבת Erlebnis Sennerei Zillertal – סיור עצמאי, טעימות גבינות + ארוחת צהריים ב-Sennereiküche"
    ],
    afternoon: [
      "13:30 נסיעה לאגם Achensee (45 דק') + צ'ק-אין מהיר",
      "Karwendelbahn – רכבל לגובה 1,780 מ', תצפית מדהימה על האגם וההרים",
      "חלופה: הליכה לאורך שפת האגם לכיוון Achenkirch, או קיאק/סירת משוטים 🚣"
    ],
    evening: [
      "שקיעה מהמרפסת",
      "ארוחת ערב במלון או בכפר Pertisau | לינה: Seehotel Einwaller – ספא גג + נוף לאגם + מזח פרטי"
    ],
    hotel: "Seehotel Einwaller, Pertisau – מזח פרטי, ספא גג, מבוגרים בלבד", gf: "Sennereiküche במחלבה",
    distance: "Rattenberg←Stans: 30 ק\"מ | ←Mayrhofen: 25 ק\"מ | ←Achensee: 45 ק\"מ",
    tip: "חלופת גשם: עולם הקריסטלים של סברובסקי",
    gfPlaces: [
      { label: "🧀 Sennereiküche (במחלבה עצמה)", waze: "https://waze.com/ul?ll=47.1667,11.8667&navigate=yes" },
      { label: "🌿 Seehotel Einwaller (המלון)", waze: "https://waze.com/ul?q=Seehotel+Einwaller+Pertisau&navigate=yes" },
    ],
    stops: [
      { label: "🪨 נקיק Wolfsklamm (Stans)", waze: "https://waze.com/ul?ll=47.4172,11.7797&navigate=yes" },
      { label: "🧀 מחלבת Sennerei Zillertal", waze: "https://waze.com/ul?ll=47.1667,11.8667&navigate=yes" },
      { label: "🚡 Karwendelbahn (Pertisau)", waze: "https://waze.com/ul?ll=47.4333,11.7167&navigate=yes" },
      { label: "🏨 Seehotel Einwaller", waze: "https://waze.com/ul?q=Seehotel+Einwaller+Pertisau&navigate=yes" },
    ]
  },
  {
    day: 7, date: "28.5", weekday: "רביעי",
    theme: "Hall in Tirol + אינסברוק", emoji: "🏰", color: "#7D4A5B",
    morning: [
      "09:00 Hall in Tirol (20 דק' מהמלון) – עיר עתיקה אותנטית שרוב התיירים מחמיצים: מגדל המטבע, רחובות צבעוניים, שוק קטן",
      "11:00 אינסברוק – הגג הזהב Goldenes Dachl, ארמון Hofburg, Maria-Theresien-Straße"
    ],
    afternoon: [
      "14:30 Nordkettenbahn – רכבל ממרכז העיר ל-2,300 מ'! תצפית 360° על אינסברוק וההרים",
      "חלופה: עולם הקריסטלים של סברובסקי (20 דק')"
    ],
    evening: [
      "18:00 ערב חופשי – רחובות העיר העתיקה, גשר Innbrücke, מסעדה לבחירה",
      "לינה: Altstadthotel Weisses Kreuz"
    ],
    hotel: "Altstadthotel Weisses Kreuz – אינסברוק", gf: "Lichtblick (קומה 7), עוגות – Café Munding",
    distance: "Pertisau←Hall: 50 ק\"מ | ←אינסברוק: 10 ק\"מ",
    tip: "הרכבל Nordkette – חובה ביום בהיר!",
    gfPlaces: [
      { label: "🌿 Lichtblick Restaurant (קומה 7)", waze: "https://waze.com/ul?ll=47.2682,11.3928&navigate=yes" },
      { label: "☕ Café Munding (עוגות GF)", waze: "https://waze.com/ul?ll=47.2675,11.3933&navigate=yes" },
      { label: "🍽️ Restaurant Ottoburg, Innsbruck", waze: "https://waze.com/ul?ll=47.2678,11.3930&navigate=yes" },
    ],
    stops: [
      { label: "🏘️ Hall in Tirol", waze: "https://waze.com/ul?ll=47.2833,11.5069&navigate=yes" },
      { label: "✨ הגג הזהב – אינסברוק", waze: "https://waze.com/ul?ll=47.2682,11.3928&navigate=yes" },
      { label: "🚡 Nordkettenbahn (רכבל)", waze: "https://waze.com/ul?ll=47.2728,11.3958&navigate=yes" },
      { label: "🏨 Altstadthotel Weisses Kreuz", waze: "https://waze.com/ul?q=Altstadthotel+Weisses+Kreuz+Innsbruck&navigate=yes" },
    ]
  },
  {
    day: 8, date: "29.5", weekday: "חמישי",
    theme: "יום נסיעות ארוך → פוסן", emoji: "🌉", color: "#5B4A8E",
    morning: [
      "09:30 נקיק Leutaschklamm (30 דק' מאינסברוק) – הליכה מעגלית כשעה וחצי על גשרי פלדה מעל נהר גועש",
      "11:30 Mittenwald – עיירת הציורים: כל הבתים מצוירים (Lüftlmalerei), ארוחת צהריים בעיר העתיקה"
    ],
    afternoon: [
      "14:00 Highline 179 ליד Reutte – אחד מגשרי החבלים הארוכים בעולם, מחבר שתי מצודות עתיקות, עלייה במיני-פוניקולר"
    ],
    evening: [
      "17:00 פוסן – צ'ק-אין + שיטוט בעיר העתיקה",
      "ארוחת ערב בפוסן | לינה: Hotel Sonne – לב העיר"
    ],
    hotel: "Hotel Sonne – פוסן, לב האקשן", gf: "מאפיות ב-Reichenstraße",
    distance: "אינסברוק←Leutasch: 30 ק\"מ | ←Mittenwald: 15 ק\"מ | ←Highline: 40 ק\"מ | ←פוסן: 30 ק\"מ | סה\"כ ~115 ק\"מ",
    tip: "נתיב יעיל: Leutasch → Mittenwald → Highline → פוסן – ישר קדימה!",
    gfPlaces: [
      { label: "🌿 Gasthof zum Stern, Mittenwald", waze: "https://waze.com/ul?ll=47.4433,11.2636&navigate=yes" },
      { label: "🍽️ Restaurant Ritterstube, Füssen", waze: "https://waze.com/ul?ll=47.5714,10.7014&navigate=yes" },
    ],
    stops: [
      { label: "🪨 נקיק Leutaschklamm", waze: "https://waze.com/ul?ll=47.3833,11.1333&navigate=yes" },
      { label: "🎨 Mittenwald – עיירת הציורים", waze: "https://waze.com/ul?ll=47.4433,11.2636&navigate=yes" },
      { label: "🌉 Highline 179 (Reutte)", waze: "https://waze.com/ul?ll=47.4883,10.7217&navigate=yes" },
      { label: "🏰 פוסן (Füssen)", waze: "https://waze.com/ul?ll=47.5714,10.7014&navigate=yes" },
      { label: "🏨 Hotel Sonne Füssen", waze: "https://waze.com/ul?q=Hotel+Sonne+Füssen&navigate=yes" },
    ]
  },
  {
    day: 9, date: "30.5", weekday: "שישי",
    theme: "טירת Neuschwanstein → Schwangau", emoji: "🏯", color: "#4A8E6B",
    morning: [
      "08:30 טירת Neuschwanstein – עלייה בשאטל/כרכרה, סיור בטירה (הוזמן מראש לשעה 10:00)",
      "תצפית מגשר Marienbrücke – חובה מוחלטת!"
    ],
    afternoon: [
      "12:30 אגם Alpsee – הליכה מישורית נעימה על שפת המים",
      "14:30 כנסיית Wies (UNESCO) – 'הקפלה הסיסטינית של בוואריה' (25 דק' מהאגם)",
      "16:30 צ'ק-אין ל-Hotel Müller, Schwangau"
    ],
    evening: [
      "שיטוט בין הטירות המוארות בערב – קסום ללא עומס תיירים ✨",
      "ארוחת ערב בווארית אותנטית במלון"
    ],
    hotel: "Hotel Müller, Schwangau – משפחתי, בין שתי הטירות", gf: "מאפיות ב-Reichenstraße",
    distance: "פוסן←Neuschwanstein: 5 ק\"מ | ←Wies: 30 ק\"מ | ←Schwangau: 15 ק\"מ",
    tip: "הטירות המוארות בערב – קסומות ללא עומס תיירים",
    gfPlaces: [
      { label: "🏨 Hotel Müller (ארוחת ערב GF)", waze: "https://waze.com/ul?q=Hotel+Müller+Schwangau&navigate=yes" },
      { label: "🌿 Alpenrose Restaurant, Schwangau", waze: "https://waze.com/ul?ll=47.5580,10.7550&navigate=yes" },
    ],
    stops: [
      { label: "🏯 חניון Neuschwanstein", waze: "https://waze.com/ul?ll=47.5576,10.7498&navigate=yes" },
      { label: "🌊 אגם Alpsee", waze: "https://waze.com/ul?ll=47.5522,10.7467&navigate=yes" },
      { label: "⛪ כנסיית Wies (UNESCO)", waze: "https://waze.com/ul?ll=47.6817,10.8883&navigate=yes" },
      { label: "🏨 Hotel Müller Schwangau", waze: "https://waze.com/ul?q=Hotel+Müller+Schwangau&navigate=yes" },
    ]
  },
  {
    day: 10, date: "31.5", weekday: "שבת",
    theme: "Linderhof + Oberammergau ✈ חזרה", emoji: "🛫", color: "#8E6B4A",
    morning: [
      "08:00 אגם Plansee – נסיעה נופית ממש על קו המים",
      "09:30 ארמון Linderhof – הגנים המטורפים של לודוויג, מזרקה פועלת כל שעה עגולה",
      "10:30 מנזר Ettal – גבינות וליקרים מקומיים"
    ],
    afternoon: [
      "11:00 Oberammergau – כפר שכל בית מצויר מהרצפה לגג, שעה-שעתיים: הליכה, קפה, צהריים",
      "15:00 יציאה לשדה + עצירה ב-Starnberg (על הדרך) – 10 דק' על הטיילת של האגם"
    ],
    evening: [
      "17:00 שדה תעופה מינכן",
      "20:00 טיסה חזרה 🏠"
    ],
    hotel: "טיסה הביתה", gf: "שדה תעופה Terminal 2T",
    distance: "Schwangau←Plansee: 25 ק\"מ | ←Linderhof: 20 ק\"מ | ←Oberammergau: 10 ק\"מ | ←מינכן: 90 ק\"מ",
    tip: "Starnberg ממש על האוטוסטרדה – עצירה קלה בדרך לשדה",
    gfPlaces: [
      { label: "☕ Café Hochleitner, Oberammergau", waze: "https://waze.com/ul?ll=47.5983,11.0669&navigate=yes" },
      { label: "✈️ Terminal 2T – שדה מינכן (GF)", waze: "https://waze.com/ul?ll=48.3537,11.7750&navigate=yes" },
    ],
    stops: [
      { label: "🌊 אגם Plansee", waze: "https://waze.com/ul?ll=47.5000,10.7333&navigate=yes" },
      { label: "👑 ארמון Linderhof", waze: "https://waze.com/ul?ll=47.5714,10.9611&navigate=yes" },
      { label: "⛪ מנזר Ettal", waze: "https://waze.com/ul?ll=47.5736,11.0939&navigate=yes" },
      { label: "🎨 Oberammergau", waze: "https://waze.com/ul?ll=47.5983,11.0669&navigate=yes" },
      { label: "🌊 אגם Starnberg", waze: "https://waze.com/ul?ll=47.9969,11.3414&navigate=yes" },
      { label: "✈️ שדה תעופה מינכן", waze: "https://waze.com/ul?ll=48.3537,11.7750&navigate=yes" },
    ]
  }
];

function TripApp() {
  const [selectedDay, setSelectedDay] = useState(null);
  const [tab, setTab] = useState("morning");
  const day = selectedDay !== null ? days[selectedDay] : null;

  const tabList = [
    { key: "morning", label: "🌅 בוקר" },
    { key: "afternoon", label: "☀️ אחה\"צ" },
    { key: "evening", label: "🌙 ערב" },
    { key: "info", label: "ℹ️ פרטים" },
    { key: "gf", label: "🌾 GF" },
    { key: "nav", label: "🚗 ניווט" },
    { key: "tickets", label: "🎫 כרטיסים" },
  ];

  return React.createElement("div", {
    style: { minHeight: "100vh", background: "#f5f5f0", fontFamily: "'Georgia', serif", direction: "rtl", color: "#2c2c2c" }
  },
    React.createElement("div", { style: { background: "rgba(0,0,0,0.04)", borderBottom: "1px solid rgba(0,0,0,0.1)", padding: "24px 20px 20px", textAlign: "center" } },
      React.createElement("div", { style: { fontSize: 16, letterSpacing: 4, color: "#7a8a6a", marginBottom: 6 } }, "22–31 מאי 2025"),
      React.createElement("h1", { style: { margin: 0, fontSize: 34, fontWeight: 400, background: "linear-gradient(135deg, #d4c5a9, #8ecfba)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" } }, "🇦🇹 מסלול אוסטריה"),
      React.createElement("div", { style: { fontSize: 16, color: "#888", marginTop: 4 } }, "10 ימים | עיירות, טבע, אוכל מקומי | GF ✓")
    ),
    React.createElement("div", { style: { padding: "20px 16px" } },
      React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 } },
        days.map((d, i) => React.createElement("button", {
          key: i, onClick: () => { setSelectedDay(i); setTab("morning"); },
          style: { background: selectedDay === i ? "linear-gradient(135deg, " + d.color + "dd, " + d.color + "88)" : "#ffffff", border: selectedDay === i ? "2px solid " + d.color : "1px solid #e0e0e0", borderRadius: 12, padding: "14px 12px", cursor: "pointer", textAlign: "right", color: "#2c2c2c" }
        },
          React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 } },
            React.createElement("span", { style: { fontSize: 22 } }, d.emoji),
            React.createElement("div", null,
              React.createElement("div", { style: { fontSize: 16, color: "#888", marginBottom: 2 } }, d.weekday + " " + d.date),
              React.createElement("div", { style: { fontSize: 16, fontWeight: 600, color: "#444" } }, "יום " + d.day)
            )
          ),
          React.createElement("div", { style: { fontSize: 15, lineHeight: 1.5, color: selectedDay === i ? "#fff" : "#333" } }, d.theme)
        ))
      )
    ),
    day && React.createElement("div", { style: { margin: "0 16px 32px", background: "#ffffff", borderRadius: 16, border: "1px solid " + day.color, overflow: "hidden" } },
      React.createElement("div", { style: { background: "linear-gradient(135deg, " + day.color + "cc, " + day.color + "66)", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" } },
        React.createElement("span", { style: { fontSize: 34 } }, day.emoji),
        React.createElement("div", { style: { textAlign: "right" } },
          React.createElement("div", { style: { fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 4 } }, day.weekday + " " + day.date),
          React.createElement("div", { style: { fontSize: 18, fontWeight: 600, color: "#fff" } }, day.theme)
        )
      ),
      React.createElement("div", { style: { display: "flex", borderBottom: "1px solid rgba(255,255,255,0.08)", overflowX: "auto" } },
        tabList.map(t => React.createElement("button", {
          key: t.key, onClick: () => setTab(t.key),
          style: { flex: 1, padding: "12px 4px", border: "none", background: tab === t.key ? day.color + "44" : "transparent", color: tab === t.key ? "#fff" : "#666", fontSize: 13, cursor: "pointer", borderBottom: tab === t.key ? "2px solid " + day.color : "2px solid transparent", whiteSpace: "nowrap", minWidth: 60 }
        }, t.label))
      ),
      React.createElement("div", { style: { padding: "16px 20px" } },
        (tab === "morning" || tab === "afternoon" || tab === "evening") && React.createElement("ul", { style: { margin: 0, padding: 0, listStyle: "none" } },
          (tab === "morning" ? day.morning : tab === "afternoon" ? day.afternoon : day.evening).map((item, i) =>
            React.createElement("li", { key: i, style: { padding: "8px 0", borderBottom: "1px solid #eee", fontSize: 18, lineHeight: 1.6, display: "flex", alignItems: "flex-start", gap: 10 } },
              React.createElement("span", { style: { color: day.color, flexShrink: 0, marginTop: 3, fontSize: 10 } }, "◆"),
              React.createElement("span", { style: { color: "#222" } }, item)
            )
          )
        ),
        tab === "info" && React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12 } },
          React.createElement("div", { style: { background: "#ffffff", borderRadius: 10, padding: 14, border: "1px solid " + day.color + "33" } },
            React.createElement("div", { style: { fontSize: 14, color: day.color, marginBottom: 6 } }, "🏨 מלון"),
            React.createElement("div", { style: { fontSize: 17, color: "#222" } }, day.hotel)
          ),
          React.createElement("div", { style: { background: "#ffffff", borderRadius: 10, padding: 14, border: "1px solid #e8e8e8" } },
            React.createElement("div", { style: { fontSize: 14, color: "#8E7D4A", marginBottom: 6 } }, "🚗 נסיעות"),
            React.createElement("div", { style: { fontSize: 16, lineHeight: 1.6, color: "#333" } }, day.distance)
          ),
          React.createElement("div", { style: { background: "#ffffff", borderRadius: 10, padding: 14, border: "1px solid #e8e8e8" } },
            React.createElement("div", { style: { fontSize: 14, color: "#6B8E4A", marginBottom: 6 } }, "🌾 GF"),
            React.createElement("div", { style: { fontSize: 16, color: "#333" } }, day.gf)
          ),
          day.tip && React.createElement("div", { style: { background: day.color + "22", borderRadius: 10, padding: 14, border: "1px solid " + day.color } },
            React.createElement("div", { style: { fontSize: 14, color: day.color, marginBottom: 6 } }, "💡 טיפ"),
            React.createElement("div", { style: { fontSize: 16, lineHeight: 1.6, color: "#333" } }, day.tip)
          )
        ),
        tab === "gf" && React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } },
          React.createElement("div", { style: { fontSize: 14, color: "#8a9a7a", marginBottom: 4, textAlign: "center" } }, "לחצי לפתיחת Waze למסעדה 🌾"),
          day.gfPlaces.map((place, i) =>
            React.createElement("a", {
              key: i, href: place.waze, target: "_blank", rel: "noopener noreferrer",
              style: { display: "flex", alignItems: "center", justifyContent: "space-between", background: "#6B8E4A22", border: "1px solid #6B8E4A55", borderRadius: 10, padding: "14px 16px", textDecoration: "none", color: "#222", cursor: "pointer" }
            },
              React.createElement("span", { style: { fontSize: 16 } }, place.label),
              React.createElement("span", { style: { fontSize: 22 } }, "📍")
            )
          )
        ),
        tab === "nav" && React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } },
          React.createElement("div", { style: { fontSize: 14, color: "#8a9a7a", marginBottom: 4, textAlign: "center" } }, "לחצי על עצירה לפתיחת Waze 🚗"),
          day.stops.map((stop, i) =>
            React.createElement("a", {
              key: i, href: stop.waze, target: "_blank", rel: "noopener noreferrer",
              style: { display: "flex", alignItems: "center", justifyContent: "space-between", background: day.color + "22", border: "1px solid " + day.color + "55", borderRadius: 10, padding: "14px 16px", textDecoration: "none", color: "#222", cursor: "pointer" }
            },
              React.createElement("span", { style: { fontSize: 16 } }, stop.label),
              React.createElement("span", { style: { fontSize: 22 } }, "📍")
            )
          )
        ),
        tab === "tickets" && React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12 } },
          // טיסת הלוך - ימים 1
          (day.day === 1) && React.createElement("div", null,
            React.createElement("div", { style: { fontSize: 14, color: "#666", marginBottom: 8, fontWeight: 600 } }, "✈️ טיסת הלוך – 22/05"),
            React.createElement("div", { style: { background: "#f8f8f8", borderRadius: 10, padding: 14, border: "1px solid #e0e0e0", marginBottom: 8 } },
              React.createElement("div", { style: { fontSize: 15, fontWeight: 600, marginBottom: 4 } }, "AZ809 – ITA Airways"),
              React.createElement("div", { style: { fontSize: 14, color: "#444" } }, "תל אביב (TLV) → רומא (FCO)"),
              React.createElement("div", { style: { fontSize: 14, color: "#444" } }, "05:15 → 08:00 | טרמינל 3"),
              React.createElement("div", { style: { fontSize: 13, color: "#888", marginTop: 4 } }, "המשך: LH1867 (Lufthansa) רומא → מינכן 10:50→12:25")
            ),
            React.createElement("div", { style: { background: "#444", borderRadius: 8, marginBottom: 4 } },
              React.createElement("div", { style: { fontSize: 13, color: "#aaa", padding: "6px 12px" } }, "קוד הזמנה: 9YD8GG")
            ),
            React.createElement("a", {
              href: "eTicket.pdf", target: "_blank",
              style: { display: "flex", alignItems: "center", justifyContent: "space-between", background: "#5B8E7D22", border: "1px solid #5B8E7D", borderRadius: 10, padding: "12px 16px", textDecoration: "none", color: "#222" }
            },
              React.createElement("span", { style: { fontSize: 16 } }, "📄 פתח כרטיס טיסה הלוך"),
              React.createElement("span", { style: { fontSize: 20 } }, "↗️")
            )
          ),
          // טיסת חזור - יום 10
          (day.day === 10) && React.createElement("div", null,
            React.createElement("div", { style: { fontSize: 14, color: "#666", marginBottom: 8, fontWeight: 600 } }, "✈️ טיסת חזור – 31/05"),
            React.createElement("div", { style: { background: "#f8f8f8", borderRadius: 10, padding: 14, border: "1px solid #e0e0e0", marginBottom: 8 } },
              React.createElement("div", { style: { fontSize: 15, fontWeight: 600, marginBottom: 4 } }, "LY352 – אל על"),
              React.createElement("div", { style: { fontSize: 14, color: "#444" } }, "מינכן (MUC) → תל אביב (TLV)"),
              React.createElement("div", { style: { fontSize: 14, color: "#444" } }, "20:00 → 00:45 (+1) | טרמינל 1")
            ),
            React.createElement("div", { style: { background: "#444", borderRadius: 8, marginBottom: 4 } },
              React.createElement("div", { style: { fontSize: 13, color: "#aaa", padding: "6px 12px" } }, "קוד הזמנה: 9YCM2S")
            ),
            React.createElement("a", {
              href: "ticket2.pdf", target: "_blank",
              style: { display: "flex", alignItems: "center", justifyContent: "space-between", background: "#5B8E7D22", border: "1px solid #5B8E7D", borderRadius: 10, padding: "12px 16px", textDecoration: "none", color: "#222" }
            },
              React.createElement("span", { style: { fontSize: 16 } }, "📄 פתח כרטיס טיסה חזור"),
              React.createElement("span", { style: { fontSize: 20 } }, "↗️")
            )
          ),
          // כרטיס טירה - יום 9
          (day.day === 9) && React.createElement("div", null,
            React.createElement("div", { style: { fontSize: 14, color: "#666", marginBottom: 8, fontWeight: 600 } }, "🏰 כרטיס טירת Neuschwanstein – 30/05"),
            React.createElement("div", { style: { background: "#f8f8f8", borderRadius: 10, padding: 14, border: "1px solid #e0e0e0", marginBottom: 8 } },
              React.createElement("div", { style: { fontSize: 15, fontWeight: 600, marginBottom: 4 } }, "Neuschwanstein Castle"),
              React.createElement("div", { style: { fontSize: 14, color: "#444" } }, "תאריך: 30.05.2026"),
              React.createElement("div", { style: { fontSize: 14, color: "#444" } }, "מספר סיור: 422"),
              React.createElement("div", { style: { fontSize: 13, color: "#e74c3c", marginTop: 6, fontWeight: 600 } }, "⚠️ להגיע 15 דק' לפני הסיור!")
            ),
            React.createElement("a", {
              href: "Ticket_20260420_5401729_1327067.pdf", target: "_blank",
              style: { display: "flex", alignItems: "center", justifyContent: "space-between", background: "#4A8E6B22", border: "1px solid #4A8E6B", borderRadius: 10, padding: "12px 16px", textDecoration: "none", color: "#222" }
            },
              React.createElement("span", { style: { fontSize: 16 } }, "📄 פתח כרטיס טירה"),
              React.createElement("span", { style: { fontSize: 20 } }, "↗️")
            )
          ),
          // ימים ללא כרטיסים
          (day.day !== 1 && day.day !== 9 && day.day !== 10) && React.createElement("div", { style: { textAlign: "center", padding: 20, color: "#999", fontSize: 15 } },
            "אין כרטיסים ליום זה 😊"
          )
        )
      ),
      React.createElement("div", { style: { display: "flex", justifyContent: "space-between", padding: "14px 20px", borderTop: "1px solid rgba(255,255,255,0.06)" } },
        React.createElement("button", { onClick: () => selectedDay > 0 && setSelectedDay(selectedDay - 1), disabled: selectedDay === 0, style: { background: "transparent", border: "none", color: selectedDay === 0 ? "#444" : "#8E9B7D", fontSize: 16, cursor: selectedDay === 0 ? "default" : "pointer" } }, "← יום קודם"),
        React.createElement("span", { style: { fontSize: 15, color: "#999" } }, "יום " + day.day + " מתוך 10"),
        React.createElement("button", { onClick: () => selectedDay < 9 && setSelectedDay(selectedDay + 1), disabled: selectedDay === 9, style: { background: "transparent", border: "none", color: selectedDay === 9 ? "#444" : "#8E9B7D", fontSize: 16, cursor: selectedDay === 9 ? "default" : "pointer" } }, "יום הבא →")
      )
    ),
    !day && React.createElement("div", { style: { textAlign: "center", padding: "20px 20px 40px", color: "#999", fontSize: 17 } }, "לחצי על יום כדי לראות את הפרטים")
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(TripApp));
