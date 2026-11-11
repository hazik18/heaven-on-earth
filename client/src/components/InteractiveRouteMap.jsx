import { useState, useMemo } from 'react';

const ROUTE_WAYPOINTS_CATALOGUE = {
  'srinagar-leh-highway-nh1d': [
    {
      name: 'Srinagar',
      altitude: 'approx. 1,585 m',
      distance: '0 km (Origin)',
      type: 'start',
      x: 7,
      y: 74,
      elev: 1585,
      note: 'Start early morning from Dal Lake / Srinagar along the Sindh River valley.'
    },
    {
      name: 'Sonamarg',
      altitude: 'approx. 2,730 m',
      distance: 'approx. 80 km',
      type: 'landmark',
      x: 17,
      y: 60,
      elev: 2730,
      note: 'Meadow of Gold; last lush alpine valley before ascending Zoji La.'
    },
    {
      name: 'Zoji La Pass',
      altitude: 'approx. 3,528 m',
      distance: 'approx. 105 km',
      type: 'pass',
      x: 27,
      y: 36,
      elev: 3528,
      note: 'Dramatic mountain pass marking the geographic entry into Ladakh (Gumri checkpost).'
    },
    {
      name: 'Drass',
      altitude: 'approx. 3,300 m',
      distance: 'approx. 145 km',
      type: 'landmark',
      x: 37,
      y: 46,
      elev: 3300,
      note: 'Gateway to Ladakh & Kargil War Memorial at the foothills of Tololing.'
    },
    {
      name: 'Kargil',
      altitude: 'approx. 2,676 m',
      distance: 'approx. 204 km',
      type: 'halt',
      x: 47,
      y: 66,
      elev: 2676,
      note: 'Recommended Day 1 overnight halt on the banks of the Suru River; major fuel & ATM hub.'
    },
    {
      name: 'Mulbekh',
      altitude: 'approx. 3,304 m',
      distance: 'approx. 244 km',
      type: 'landmark',
      x: 57,
      y: 50,
      elev: 3304,
      note: '9-metre rock-carved Maitreya Buddha marking the cultural entry into Buddhist Ladakh.'
    },
    {
      name: 'Fotu La Pass',
      altitude: 'approx. 4,108 m',
      distance: 'approx. 295 km',
      type: 'pass',
      x: 67,
      y: 22,
      elev: 4108,
      note: 'Highest point on the Srinagar-Leh Highway (NH-1D) after crossing Namika La (approx. 3,700 m).'
    },
    {
      name: 'Lamayuru',
      altitude: 'approx. 3,510 m',
      distance: 'approx. 310 km',
      type: 'landmark',
      x: 76,
      y: 44,
      elev: 3510,
      note: 'Famous 11th-century Lamayuru Monastery & surreal Moonland paleolake formations.'
    },
    {
      name: 'Sangam',
      altitude: 'approx. 3,150 m',
      distance: 'approx. 398 km',
      type: 'landmark',
      x: 85,
      y: 58,
      elev: 3150,
      note: 'Confluence of the Indus & Zanskar rivers at Nimmu, followed by Magnetic Hill & Pathar Sahib.'
    },
    {
      name: 'Leh',
      altitude: 'approx. 3,500 m',
      distance: 'approx. 434 km',
      type: 'end',
      x: 94,
      y: 42,
      elev: 3500,
      note: 'Arrive in Leh; spend 2 mandatory nights acclimatising before crossing >5,000 m passes.'
    }
  ],
  'manali-leh-highway-nh3': [
    {
      name: 'Manali',
      altitude: 'approx. 2,050 m',
      distance: '0 km (Origin)',
      type: 'start',
      x: 8,
      y: 80,
      elev: 2050,
      note: 'Start from Kullu Valley via the 9.02 km Atal Tunnel into Lahaul.'
    },
    {
      name: 'Keylong',
      altitude: 'approx. 3,080 m',
      distance: 'approx. 115 km',
      type: 'landmark',
      x: 19,
      y: 65,
      elev: 3080,
      note: 'Important fuel stop at Tandi confluence before long uninhabited Trans-Himalayan stretches.'
    },
    {
      name: 'Jispa',
      altitude: 'approx. 3,200 m',
      distance: 'approx. 140 km',
      type: 'halt',
      x: 30,
      y: 60,
      elev: 3200,
      note: 'Recommended safer-altitude Day 1 overnight halt on the banks of the Bhaga River.'
    },
    {
      name: 'Baralacha La',
      altitude: 'approx. 4,890 m',
      distance: 'approx. 190 km',
      type: 'pass',
      x: 42,
      y: 28,
      elev: 4890,
      note: 'High pass above emerald Suraj Tal lake where three mountain valleys meet.'
    },
    {
      name: 'Sarchu',
      altitude: 'approx. 4,290 m',
      distance: 'approx. 222 km',
      type: 'halt',
      x: 54,
      y: 44,
      elev: 4290,
      note: 'High-altitude border plains between Himachal Pradesh & Ladakh (checkpost).'
    },
    {
      name: 'Lachulung La',
      altitude: 'approx. 5,059 m',
      distance: 'approx. 276 km',
      type: 'pass',
      x: 65,
      y: 24,
      elev: 5059,
      note: '21 hairpin bends of Gata Loops ascending Nakee La (approx. 4,739 m) and Lachulung La (approx. 5,059 m).'
    },
    {
      name: 'Moore Plains',
      altitude: 'approx. 4,700 m',
      distance: 'approx. 330 km',
      type: 'landmark',
      x: 76,
      y: 34,
      elev: 4700,
      note: '40 km high-altitude tableland drive past Pang flanked by nomadic Changpa pastures.'
    },
    {
      name: 'Tanglang La',
      altitude: 'approx. 5,328 m',
      distance: 'approx. 375 km',
      type: 'pass',
      x: 85,
      y: 16,
      elev: 5328,
      note: 'Highest pass on the Manali-Leh Highway (NH-3); keep summit halt under 15 minutes.'
    },
    {
      name: 'Leh',
      altitude: 'approx. 3,500 m',
      distance: 'approx. 430–490 km',
      type: 'end',
      x: 94,
      y: 52,
      elev: 3500,
      note: 'Descend into the Indus Valley via Rumtse, Upshi checkpost, and Karu to reach Leh.'
    }
  ],
  'manali-leh-via-zanskar-nimmu-padum-darcha': [
    {
      name: 'Manali / Darcha',
      altitude: 'approx. 3,360 m',
      distance: 'approx. 145 km',
      type: 'start',
      x: 9,
      y: 66,
      elev: 3360,
      note: 'Drive via Atal Tunnel and Jispa to Darcha checkpost at the mouth of the Shinku La valley.'
    },
    {
      name: 'Shinku La Pass',
      altitude: 'approx. 5,050 m',
      distance: 'approx. 185 km',
      type: 'pass',
      x: 24,
      y: 22,
      elev: 5050,
      note: 'High glacial pass connecting Lahaul (Himachal) directly into Zanskar (Ladakh).'
    },
    {
      name: 'Purne',
      altitude: 'approx. 3,800 m',
      distance: 'approx. 260 km',
      type: 'halt',
      x: 39,
      y: 52,
      elev: 3800,
      note: 'Pass the sacred standalone peak of Gonbo Rangjon to Purne (base for Phugtal Monastery trek).'
    },
    {
      name: 'Padum',
      altitude: 'approx. 3,657 m',
      distance: 'approx. 325 km',
      type: 'halt',
      x: 54,
      y: 56,
      elev: 3657,
      note: 'Administrative hub of Zanskar; fuel station, Karsha Monastery & Bardan Gompa.'
    },
    {
      name: 'Pensi La',
      altitude: 'approx. 4,400 m',
      distance: 'approx. 405 km',
      type: 'pass',
      x: 68,
      y: 36,
      elev: 4400,
      note: 'Excursion to Pensi La for panoramic views of the 23 km Drang Drung Glacier.'
    },
    {
      name: 'Singge La',
      altitude: 'approx. 4,960 m',
      distance: 'approx. 560 km',
      type: 'pass',
      x: 81,
      y: 24,
      elev: 4960,
      note: 'Dramatic trans-Zanskar mountain passes (Singge La & Sirsir La) linking Photoksar and Wanla.'
    },
    {
      name: 'Leh',
      altitude: 'approx. 3,500 m',
      distance: 'approx. 700 km',
      type: 'end',
      x: 93,
      y: 58,
      elev: 3500,
      note: 'Join the Indus Valley highway at Nimmu/Lamayuru and continue east to Leh.'
    }
  ],
  'leh-to-nubra-valley': [
    {
      name: 'Leh',
      altitude: 'approx. 3,500 m',
      distance: '0 km (Origin)',
      type: 'start',
      x: 10,
      y: 55,
      elev: 3500,
      note: 'Depart Leh after 2 nights of acclimatisation with printed EDF/PAP copies.'
    },
    {
      name: 'South Pullu',
      altitude: 'approx. 4,550 m',
      distance: 'approx. 24 km',
      type: 'landmark',
      x: 26,
      y: 38,
      elev: 4550,
      note: 'Permit checkpost on the southern ascent toward Khardung La.'
    },
    {
      name: 'Khardung La',
      altitude: 'approx. 5,359 m',
      distance: 'approx. 39 km',
      type: 'pass',
      x: 44,
      y: 16,
      elev: 5359,
      note: 'Historic high pass gateway to the Shyok & Nubra valleys; limit stop to 10–15 mins.'
    },
    {
      name: 'Khalsar',
      altitude: 'approx. 3,200 m',
      distance: 'approx. 96 km',
      type: 'landmark',
      x: 61,
      y: 62,
      elev: 3200,
      note: 'Junction along the Shyok River splitting toward Diskit/Hunder and Sumur/Panamik.'
    },
    {
      name: 'Diskit & Hunder',
      altitude: 'approx. 3,048 m',
      distance: 'approx. 120 km',
      type: 'halt',
      x: 77,
      y: 68,
      elev: 3048,
      note: '32m Maitreya Buddha at Diskit, fuel station, and Hunder cold desert sand dunes.'
    },
    {
      name: 'Turtuk',
      altitude: 'approx. 2,800 m',
      distance: 'approx. 200 km',
      type: 'end',
      x: 92,
      y: 74,
      elev: 2800,
      note: 'Balti heritage village & apricot orchards along the lower Shyok River near the LoC.'
    }
  ],
  'leh-to-pangong-tso': [
    {
      name: 'Leh',
      altitude: 'approx. 3,500 m',
      distance: '0 km (Origin)',
      type: 'start',
      x: 10,
      y: 66,
      elev: 3500,
      note: 'Depart early from Leh along the Indus River highway.'
    },
    {
      name: 'Karu',
      altitude: 'approx. 3,600 m',
      distance: 'approx. 40 km',
      type: 'landmark',
      x: 27,
      y: 62,
      elev: 3600,
      note: 'Major fuel station at Karu before turning northeast up the Chang La valley.'
    },
    {
      name: 'Chang La Pass',
      altitude: 'approx. 5,360 m',
      distance: 'approx. 75 km',
      type: 'pass',
      x: 46,
      y: 16,
      elev: 5360,
      note: 'Formidable high pass across the Ladakh Range into the Changthang plateau.'
    },
    {
      name: 'Tangtse',
      altitude: 'approx. 3,900 m',
      distance: 'approx. 115 km',
      type: 'landmark',
      x: 64,
      y: 54,
      elev: 3900,
      note: 'Permit checkpost at Tangtse; marmot meadows along the approach to Lukung.'
    },
    {
      name: 'Spangmik',
      altitude: 'approx. 4,225 m',
      distance: 'approx. 160 km',
      type: 'halt',
      x: 79,
      y: 44,
      elev: 4225,
      note: 'Primary lakeside camp zone at Pangong Tso with views of the Changchenmo peaks.'
    },
    {
      name: 'Man & Merak',
      altitude: 'approx. 4,230 m',
      distance: 'approx. 180–220 km',
      type: 'end',
      x: 92,
      y: 43,
      elev: 4230,
      note: 'Quiet lakeside Changpa settlements further southeast along Pangong Tso.'
    }
  ],
  'leh-to-tso-moriri-korzok': [
    {
      name: 'Leh',
      altitude: 'approx. 3,500 m',
      distance: '0 km (Origin)',
      type: 'start',
      x: 10,
      y: 72,
      elev: 3500,
      note: 'Top up full fuel at Karu; no regular petrol pumps ahead on the Tso Moriri loop.'
    },
    {
      name: 'Upshi',
      altitude: 'approx. 3,650 m',
      distance: 'approx. 50 km',
      type: 'landmark',
      x: 26,
      y: 66,
      elev: 3650,
      note: 'Enter the upper Indus River gorge toward Rong and Chumathang.'
    },
    {
      name: 'Chumathang',
      altitude: 'approx. 3,950 m',
      distance: 'approx. 138 km',
      type: 'halt',
      x: 44,
      y: 56,
      elev: 3950,
      note: 'Geothermal sulphur hot springs and dhabas along the Indus riverbank.'
    },
    {
      name: 'Mahe Bridge',
      altitude: 'approx. 4,150 m',
      distance: 'approx. 165 km',
      type: 'landmark',
      x: 61,
      y: 48,
      elev: 4150,
      note: 'Permit verification checkpost at Mahe Bridge; turn south toward Rupshu.'
    },
    {
      name: 'Namshang La',
      altitude: 'approx. 4,800 m',
      distance: 'approx. 195 km',
      type: 'pass',
      x: 77,
      y: 26,
      elev: 4800,
      note: 'Cross Namshang La past the turquoise saline waters of Kyagar Tso.'
    },
    {
      name: 'Tso Moriri',
      altitude: 'approx. 4,522 m',
      distance: 'approx. 220–240 km',
      type: 'end',
      x: 92,
      y: 36,
      elev: 4522,
      note: 'High-altitude Ramsar wetland lake at Korzok & 400-year-old Korzok Monastery.'
    }
  ],
  'leh-to-hanle-dark-sky-reserve': [
    {
      name: 'Leh',
      altitude: 'approx. 3,500 m',
      distance: '0 km (Origin)',
      type: 'start',
      x: 10,
      y: 70,
      elev: 3500,
      note: 'Depart early from Leh; fill tank at Karu and carry reserve fuel.'
    },
    {
      name: 'Chumathang',
      altitude: 'approx. 3,950 m',
      distance: 'approx. 138 km',
      type: 'halt',
      x: 32,
      y: 56,
      elev: 3950,
      note: 'Midway halt at Chumathang geothermal hot springs along the upper Indus.'
    },
    {
      name: 'Nyoma',
      altitude: 'approx. 4,180 m',
      distance: 'approx. 185 km',
      type: 'landmark',
      x: 54,
      y: 46,
      elev: 4180,
      note: 'Wide Indus plains inhabited by Kiang (Tibetan Wild Ass) and Black-necked Cranes.'
    },
    {
      name: 'Loma Bend',
      altitude: 'approx. 4,240 m',
      distance: 'approx. 205 km',
      type: 'landmark',
      x: 73,
      y: 42,
      elev: 4240,
      note: 'Key permit checkpost where the road turns southeast toward the Hanle valley.'
    },
    {
      name: 'Hanle Reserve',
      altitude: 'approx. 4,500 m',
      distance: 'approx. 255–275 km',
      type: 'end',
      x: 91,
      y: 30,
      elev: 4500,
      note: 'Bortle-1 night skies, 17th-century Hanle Monastery & Indian Astronomical Observatory.'
    }
  ],
  'hanle-to-umling-la-day-excursion': [
    {
      name: 'Hanle Base',
      altitude: 'approx. 4,500 m',
      distance: '0 km (Start)',
      type: 'start',
      x: 12,
      y: 72,
      elev: 4500,
      note: 'Depart Hanle early morning with extra fuel and portable oxygen.'
    },
    {
      name: 'Photi La Pass',
      altitude: 'approx. 5,524 m',
      distance: 'approx. 35 km',
      type: 'pass',
      x: 38,
      y: 28,
      elev: 5524,
      note: 'High paved mountain pass on the scenic southern approach toward Chisumle.'
    },
    {
      name: 'Chisumle & Norbu La',
      altitude: 'approx. 5,282 m',
      distance: 'approx. 52 km',
      type: 'pass',
      x: 64,
      y: 38,
      elev: 5282,
      note: 'Checkpost at Chisumle followed by the BRO Project Himank ascent via Norbu La.'
    },
    {
      name: 'Umling La',
      altitude: 'approx. 5,798 m',
      distance: 'approx. 75 km (150 km RT)',
      type: 'end',
      x: 90,
      y: 14,
      elev: 5798,
      note: 'One of the world’s highest motorable roads (19,024 ft); return to Hanle for sleep.'
    }
  ],
  'leh-to-zanskar-padum': [
    {
      name: 'Leh',
      altitude: 'approx. 3,500 m',
      distance: '0 km (Origin)',
      type: 'start',
      x: 10,
      y: 52,
      elev: 3500,
      note: 'Drive west on NH-1D via Sangam, Lamayuru, Fotu La, and Namika La.'
    },
    {
      name: 'Kargil',
      altitude: 'approx. 2,676 m',
      distance: 'approx. 230 km',
      type: 'halt',
      x: 28,
      y: 74,
      elev: 2676,
      note: 'Turn south into the Suru Valley; important fuel top-up before entering Zanskar.'
    },
    {
      name: 'Parkachik',
      altitude: 'approx. 3,600 m',
      distance: 'approx. 315 km',
      type: 'landmark',
      x: 46,
      y: 50,
      elev: 3600,
      note: 'Dramatic close-up views of Nun (7,135 m) & Kun (7,077 m) massifs and Parkachik Glacier.'
    },
    {
      name: 'Rangdum',
      altitude: 'approx. 4,031 m',
      distance: 'approx. 360 km',
      type: 'halt',
      x: 62,
      y: 38,
      elev: 4031,
      note: 'Isolated 18th-century hillock gompa in the upper Suru amphitheatre.'
    },
    {
      name: 'Pensi La',
      altitude: 'approx. 4,400 m',
      distance: 'approx. 385 km',
      type: 'pass',
      x: 77,
      y: 22,
      elev: 4400,
      note: 'Twin lakes Statso & Langtso at Pensi La facing the massive Drang Drung Glacier.'
    },
    {
      name: 'Padum',
      altitude: 'approx. 3,657 m',
      distance: 'approx. 460 km',
      type: 'end',
      x: 92,
      y: 48,
      elev: 3657,
      note: 'Arrive in Padum valley; explore Karsha, Sani, and Stongdey monasteries.'
    }
  ],
  'leh-to-lamayuru-sham-valley': [
    {
      name: 'Leh',
      altitude: 'approx. 3,500 m',
      distance: '0 km (Origin)',
      type: 'start',
      x: 10,
      y: 38,
      elev: 3500,
      note: 'Ideal Day 2–3 acclimatisation drive heading west down the Indus Valley.'
    },
    {
      name: 'Magnetic Hill',
      altitude: 'approx. 3,400 m',
      distance: 'approx. 28 km',
      type: 'landmark',
      x: 27,
      y: 46,
      elev: 3400,
      note: 'Historic Gurudwara Pathar Sahib and the famous gravity-hill optical stretch.'
    },
    {
      name: 'Sangam',
      altitude: 'approx. 3,150 m',
      distance: 'approx. 35 km',
      type: 'landmark',
      x: 45,
      y: 64,
      elev: 3150,
      note: 'Spectacular confluence of the emerald Indus and Zanskar rivers at Nimmu.'
    },
    {
      name: 'Basgo & Likir',
      altitude: 'approx. 3,350 m',
      distance: 'approx. 52 km',
      type: 'landmark',
      x: 62,
      y: 52,
      elev: 3350,
      note: '16th-century Basgo mud-brick citadel & 23m golden Maitreya Buddha at Likir.'
    },
    {
      name: 'Alchi',
      altitude: 'approx. 3,100 m',
      distance: 'approx. 68 km',
      type: 'halt',
      x: 77,
      y: 68,
      elev: 3100,
      note: '11th-century Choskor temple complex with rare Kashmiri-style Buddhist murals.'
    },
    {
      name: 'Lamayuru',
      altitude: 'approx. 3,510 m',
      distance: 'approx. 125 km',
      type: 'end',
      x: 92,
      y: 36,
      elev: 3510,
      note: 'Ancient Drikung Kagyu monastery perched above lunar paleolake formations.'
    }
  ],
  'leh-local-sightseeing': [
    {
      name: 'Spituk & Hall of Fame',
      altitude: 'approx. 3,500 m',
      distance: '0–5 km',
      type: 'start',
      x: 12,
      y: 56,
      elev: 3500,
      note: 'Gentle acclimatisation circuit starting with Hall of Fame museum & Spituk Gompa.'
    },
    {
      name: 'Leh Palace',
      altitude: 'approx. 3,560 m',
      distance: 'approx. 8 km',
      type: 'landmark',
      x: 30,
      y: 42,
      elev: 3560,
      note: '9-storey 17th-century royal palace built by King Sengge Namgyal above Old Leh.'
    },
    {
      name: 'Shanti Stupa',
      altitude: 'approx. 3,609 m',
      distance: 'approx. 12 km',
      type: 'pass',
      x: 48,
      y: 30,
      elev: 3609,
      note: 'Panoramic sunset viewpoint overlooking Leh valley and the Stok Kangri range.'
    },
    {
      name: 'Shey Palace',
      altitude: 'approx. 3,515 m',
      distance: 'approx. 25 km',
      type: 'landmark',
      x: 65,
      y: 54,
      elev: 3515,
      note: 'Ancient summer capital of Ladakh housing a two-storey copper-gilt Buddha.'
    },
    {
      name: 'Thiksey',
      altitude: 'approx. 3,600 m',
      distance: 'approx. 30 km',
      type: 'halt',
      x: 79,
      y: 34,
      elev: 3600,
      note: 'Iconic 12-storey hilltop monastery resembling the Potala Palace.'
    },
    {
      name: 'Hemis',
      altitude: 'approx. 3,636 m',
      distance: 'approx. 55 km',
      type: 'end',
      x: 92,
      y: 26,
      elev: 3636,
      note: 'Largest and wealthiest Drukpa Kagyu monastery in Ladakh, famed for the Hemis Festival.'
    }
  ]
};

// Consistent Color System used across Legend, Map Pins, Elevation Nodes, Inspector Card & Stop Pills
const TYPE_STYLES = {
  start: {
    badge: 'Origin',
    hex: '#10b981', // Emerald-500
    dotCls: 'bg-emerald-500',
    badgeSolidCls: 'bg-emerald-500 text-white',
    pillActiveCls: 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-500/30',
    pillIdleCls: 'bg-emerald-50/70 text-emerald-900 border-emerald-200 hover:bg-emerald-100/80',
    pill: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    icon: 'trip_origin'
  },
  pass: {
    badge: 'Mountain Pass',
    hex: '#FF8C00', // Orange Primary
    dotCls: 'bg-[#FF8C00]',
    badgeSolidCls: 'bg-[#FF8C00] text-white',
    pillActiveCls: 'bg-[#FF8C00] text-white border-[#FF8C00] shadow-md ring-2 ring-[#FF8C00]/30',
    pillIdleCls: 'bg-orange-50/80 text-orange-950 border-orange-200 hover:bg-orange-100/80',
    pill: 'bg-orange-100 text-orange-900 border-orange-300',
    icon: 'landscape'
  },
  halt: {
    badge: 'Night Halt',
    hex: '#3b82f6', // Blue-500
    dotCls: 'bg-blue-500',
    badgeSolidCls: 'bg-blue-500 text-white',
    pillActiveCls: 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-500/30',
    pillIdleCls: 'bg-blue-50/80 text-blue-900 border-blue-200 hover:bg-blue-100/80',
    pill: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: 'hotel'
  },
  landmark: {
    badge: 'Key Stop',
    hex: '#a855f7', // Purple-500
    dotCls: 'bg-purple-500',
    badgeSolidCls: 'bg-purple-500 text-white',
    pillActiveCls: 'bg-purple-600 text-white border-purple-600 shadow-md ring-2 ring-purple-500/30',
    pillIdleCls: 'bg-purple-50/70 text-purple-900 border-purple-200 hover:bg-purple-100/80',
    pill: 'bg-purple-100 text-purple-800 border-purple-300',
    icon: 'place'
  },
  end: {
    badge: 'Destination',
    hex: '#f43f5e', // Rose-500
    dotCls: 'bg-rose-500',
    badgeSolidCls: 'bg-rose-500 text-white',
    pillActiveCls: 'bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-500/30',
    pillIdleCls: 'bg-rose-50/80 text-rose-900 border-rose-200 hover:bg-rose-100/80',
    pill: 'bg-rose-100 text-rose-800 border-rose-300',
    icon: 'flag'
  }
};

function buildFallbackWaypoints(route) {
  const passes = route.key_passes || [];
  const total = passes.length + 2;
  const points = [
    {
      name: route.from_location || 'Start',
      altitude: 'approx. 3,500 m',
      distance: '0 km (Origin)',
      type: 'start',
      x: 10,
      y: 65,
      elev: 3500,
      note: `Starting point for ${route.title}.`
    }
  ];

  passes.forEach((p, idx) => {
    const progress = (idx + 1) / (total - 1);
    const numMatch = String(p.altitude || '').replace(/,/g, '').match(/\d+/);
    const elev = numMatch ? Number(numMatch[0]) : 4500;
    points.push({
      name: p.name,
      altitude: p.altitude,
      distance: `Stop ${idx + 2}`,
      type: 'pass',
      x: Math.round(10 + progress * 80),
      y: Math.round(22 + (idx % 2) * 18),
      elev,
      note: `Key mountain pass along ${route.title} (${p.altitude}).`
    });
  });

  points.push({
    name: route.to_location || 'Destination',
    altitude: 'approx. 3,500 m',
    distance: route.approx_distance || 'Destination',
    type: 'end',
    x: 90,
    y: 50,
    elev: 3500,
    note: `Final destination of ${route.title}.`
  });

  return points;
}

export default function InteractiveRouteMap({ route }) {
  const waypoints = useMemo(() => {
    if (route?.waypoints?.length > 1) return route.waypoints;
    if (route?.slug && ROUTE_WAYPOINTS_CATALOGUE[route.slug]) {
      return ROUTE_WAYPOINTS_CATALOGUE[route.slug];
    }
    return buildFallbackWaypoints(route || {});
  }, [route]);

  const [activeIdx, setActiveIdx] = useState(0);
  const [mapMode, setMapMode] = useState('elevation');

  const activeStop = waypoints[activeIdx] || waypoints[0];
  const activeStyle = TYPE_STYLES[activeStop?.type] || TYPE_STYLES.landmark;

  // Build smooth SVG cubic bezier path across waypoints (in 1060x340 coordinate space)
  const svgPoints = useMemo(() => {
    return waypoints.map((wp) => ({
      ...wp,
      style: TYPE_STYLES[wp.type] || TYPE_STYLES.landmark,
      cx: (wp.x / 100) * 1000 + 30,
      cy: (wp.y / 100) * 300 + 10
    }));
  }, [waypoints]);

  const routePathD = useMemo(() => {
    if (svgPoints.length === 0) return '';
    return svgPoints.reduce((acc, pt, i, arr) => {
      if (i === 0) return `M ${pt.cx} ${pt.cy}`;
      const prev = arr[i - 1];
      const midX = (prev.cx + pt.cx) / 2;
      return `${acc} C ${midX} ${prev.cy}, ${midX} ${pt.cy}, ${pt.cx} ${pt.cy}`;
    }, '');
  }, [svgPoints]);

  const activePathD = useMemo(() => {
    const sub = svgPoints.slice(0, activeIdx + 1);
    if (sub.length <= 1) return '';
    return sub.reduce((acc, pt, i, arr) => {
      if (i === 0) return `M ${pt.cx} ${pt.cy}`;
      const prev = arr[i - 1];
      const midX = (prev.cx + pt.cx) / 2;
      return `${acc} C ${midX} ${prev.cy}, ${midX} ${pt.cy}, ${pt.cx} ${pt.cy}`;
    }, '');
  }, [svgPoints, activeIdx]);

  // Elevation profile coordinates
  const elevPoints = useMemo(() => {
    const elevs = waypoints.map((w) => w.elev || 3500);
    const minE = Math.min(...elevs, 1500) - 350;
    const maxE = Math.max(...elevs, 5200) + 350;
    return waypoints.map((wp, i) => {
      const cx = 65 + (i / Math.max(waypoints.length - 1, 1)) * 930;
      const ratio = ((wp.elev || 3500) - minE) / Math.max(maxE - minE, 1);
      const cy = 255 - ratio * 175;
      return {
        ...wp,
        style: TYPE_STYLES[wp.type] || TYPE_STYLES.landmark,
        cx,
        cy
      };
    });
  }, [waypoints]);

  const elevPathD = useMemo(() => {
    if (elevPoints.length === 0) return '';
    return elevPoints.reduce((acc, pt, i, arr) => {
      if (i === 0) return `M ${pt.cx} ${pt.cy}`;
      const prev = arr[i - 1];
      const midX = (prev.cx + pt.cx) / 2;
      return `${acc} C ${midX} ${prev.cy}, ${midX} ${pt.cy}, ${pt.cx} ${pt.cy}`;
    }, '');
  }, [elevPoints]);

  const elevAreaD = useMemo(() => {
    if (!elevPathD || elevPoints.length === 0) return '';
    const first = elevPoints[0];
    const last = elevPoints[elevPoints.length - 1];
    return `${elevPathD} L ${last.cx} 280 L ${first.cx} 280 Z`;
  }, [elevPathD, elevPoints]);

  const googleMapsDirectionsUrl = useMemo(() => {
    const names = waypoints.map((w) => `${w.name}, Ladakh`).join('/');
    return `https://www.google.com/maps/dir/${encodeURIComponent(names).replace(/%2F/g, '/')}`;
  }, [waypoints]);

  return (
    <section className="w-full max-w-6xl mt-8 sm:mt-12 bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 md:p-10 shadow-sm">
      {/* Header + View Mode Toggle (Responsive Stack on Mobile/Tablet) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 sm:mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-icons text-[#FF8C00] text-lg">map</span>
            <span className="font-sans text-xs uppercase tracking-widest text-[#FF8C00] font-bold">
              Interactive Route Map & Elevation Profile
            </span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">
            Route Geography & Major Stops ({waypoints.length} Checkpoints)
          </h3>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Tap any color-coded pin on the chart or checkpoint card below to inspect elevation, distance, and halt details.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="bg-slate-100 p-1 rounded-full grid grid-cols-2 sm:flex items-center">
            <button
              type="button"
              onClick={() => setMapMode('elevation')}
              className={`px-3.5 py-2 sm:py-1.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                mapMode === 'elevation'
                  ? 'bg-[#FF8C00] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-icons text-sm">show_chart</span>
              Elevation Profile
            </button>
            <button
              type="button"
              onClick={() => setMapMode('route')}
              className={`px-3.5 py-2 sm:py-1.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                mapMode === 'route'
                  ? 'bg-[#FF8C00] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-icons text-sm">alt_route</span>
              Route Map
            </button>
          </div>

          <a
            href={googleMapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-full border border-slate-200 hover:border-[#FF8C00] text-xs font-bold text-slate-700 hover:text-[#FF8C00] transition-colors"
          >
            <span className="material-icons text-sm text-[#FF8C00]">open_in_new</span>
            Open in Google Maps
          </a>
        </div>
      </div>

      {/* Main Interactive Map + Active Stop Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
        {/* Left 8 Cols: Interactive SVG Topographic Map / Elevation Canvas */}
        <div className="lg:col-span-8 relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-inner flex flex-col justify-between">
          {/* Legend Bar — Responsive Wrap on Mobile/Tablet */}
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3.5 sm:px-5 pt-3.5 pb-2.5 border-b border-white/10 text-xs text-slate-200">
            <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500 ring-2 ring-emerald-400/30 inline-block" />
                Origin
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#FF8C00] ring-2 ring-orange-400/30 inline-block" />
                Mountain Pass
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-blue-500 ring-2 ring-blue-400/30 inline-block" />
                Night Halt
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-purple-500 ring-2 ring-purple-400/30 inline-block" />
                Key Stop
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-rose-500 ring-2 ring-rose-400/30 inline-block" />
                Destination
              </span>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-2">
              <span className="text-orange-300 font-bold text-xs">
                {route.from_location} → {route.to_location}
              </span>
              <span className="md:hidden text-[11px] text-slate-400 flex items-center gap-0.5">
                <span className="material-icons text-xs">swipe</span> Swipe chart
              </span>
            </div>
          </div>

          {/* SVG Canvas — Touch-scrollable on small mobile phones so labels & pins stay large and readable */}
          <div className="relative w-full overflow-x-auto custom-scrollbar px-1 sm:px-2 py-2">
            <div className="min-w-[660px] sm:min-w-[740px] md:min-w-0 w-full">
              <svg
                viewBox="0 0 1060 340"
                className="w-full h-[230px] sm:h-[270px] md:h-[310px] select-none"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <linearGradient id="routeGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="50%" stopColor="#FF8C00" />
                    <stop offset="100%" stopColor="#f43f5e" />
                  </linearGradient>
                  <linearGradient id="elevFill" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FF8C00" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#FF8C00" stopOpacity="0.03" />
                  </linearGradient>
                </defs>

                {/* Subtle Topographic Grid & Contours */}
                {[60, 120, 180, 240].map((yLine) => (
                  <line
                    key={yLine}
                    x1="35"
                    y1={yLine}
                    x2="1025"
                    y2={yLine}
                    stroke="rgba(255,255,255,0.06)"
                    strokeDasharray="4 6"
                  />
                ))}
                {[160, 340, 530, 720, 900].map((xLine) => (
                  <line
                    key={xLine}
                    x1={xLine}
                    y1="20"
                    x2={xLine}
                    y2="280"
                    stroke="rgba(255,255,255,0.05)"
                    strokeDasharray="4 6"
                  />
                ))}

                {/* Stylized Mountain Range Silhouette in Background */}
                <path
                  d="M0,280 L0,200 L95,140 L185,210 L300,100 L420,185 L540,85 L660,175 L790,80 L910,165 L1000,115 L1060,180 L1060,280 Z"
                  fill="rgba(255,255,255,0.03)"
                />

                {mapMode === 'route' ? (
                  <>
                    {/* Base Dashed Route Line */}
                    <path
                      d={routePathD}
                      fill="none"
                      stroke="rgba(255,255,255,0.22)"
                      strokeWidth="5"
                      strokeDasharray="8 8"
                      strokeLinecap="round"
                    />

                    {/* Full Route Gradient Line */}
                    <path
                      d={routePathD}
                      fill="none"
                      stroke="url(#routeGlow)"
                      strokeWidth="4"
                      strokeLinecap="round"
                      opacity="0.6"
                    />

                    {/* Highlighted Active Progress Segment */}
                    {activePathD && (
                      <path
                        d={activePathD}
                        fill="none"
                        stroke={activeStyle.hex}
                        strokeWidth="6"
                        strokeLinecap="round"
                      />
                    )}

                    {/* Interactive Pins — Colored by Stop Type */}
                    {svgPoints.map((pt, idx) => {
                      const isSelected = idx === activeIdx;
                      const pinColor = pt.style.hex;
                      const labelAbove = idx % 2 === 0;
                      const boxWidth = Math.max(pt.name.length * 7.2 + 20, 76);

                      return (
                        <g
                          key={idx}
                          onClick={() => setActiveIdx(idx)}
                          className="cursor-pointer group"
                        >
                          {isSelected && (
                            <circle cx={pt.cx} cy={pt.cy} r="22" fill={pinColor} opacity="0.28">
                              <animate
                                attributeName="r"
                                values="14;24;14"
                                dur="1.8s"
                                repeatCount="indefinite"
                              />
                            </circle>
                          )}

                          <circle
                            cx={pt.cx}
                            cy={pt.cy}
                            r={isSelected ? 12 : 9}
                            fill={pinColor}
                            stroke="#ffffff"
                            strokeWidth={isSelected ? 3.5 : 2}
                          />

                          <text
                            x={pt.cx}
                            y={pt.cy + 3.5}
                            textAnchor="middle"
                            fill="#ffffff"
                            fontSize="9.5"
                            fontWeight="bold"
                          >
                            {idx + 1}
                          </text>

                          {/* Stop Label Pill (Auto-sized so full name is never cut) */}
                          <g
                            transform={`translate(${pt.cx}, ${
                              labelAbove ? pt.cy - 24 : pt.cy + 28
                            })`}
                          >
                            <rect
                              x={-boxWidth / 2}
                              y="-11"
                              width={boxWidth}
                              height="21"
                              rx="6"
                              fill={isSelected ? pinColor : 'rgba(15, 23, 42, 0.92)'}
                              stroke={isSelected ? '#ffffff' : pinColor}
                              strokeWidth={isSelected ? '1.5' : '1.2'}
                            />
                            <text
                              x="0"
                              y="3"
                              textAnchor="middle"
                              fill="#ffffff"
                              fontSize="10"
                              fontWeight="bold"
                            >
                              {pt.name}
                            </text>
                          </g>
                        </g>
                      );
                    })}
                  </>
                ) : (
                  <>
                    {/* 5,000m High-Altitude Advisory Threshold Line */}
                    <line
                      x1="40"
                      y1="72"
                      x2="1020"
                      y2="72"
                      stroke="rgba(245, 158, 11, 0.55)"
                      strokeWidth="1.5"
                      strokeDasharray="6 4"
                    />
                    <text
                      x="1015"
                      y="64"
                      textAnchor="end"
                      fill="#fbbf24"
                      fontSize="10.5"
                      fontWeight="bold"
                    >
                      5,000 m High-Altitude Threshold (2 Nights Leh Acclimatisation Required)
                    </text>

                    {/* Elevation Area Fill & Curve */}
                    <path d={elevAreaD} fill="url(#elevFill)" />
                    <path
                      d={elevPathD}
                      fill="none"
                      stroke="#FF8C00"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />

                    {/* Elevation Nodes — Every Node Uses Its Category Color */}
                    {elevPoints.map((pt, idx) => {
                      const isSelected = idx === activeIdx;
                      const pinColor = pt.style.hex;
                      const staggerY = waypoints.length > 7 && idx % 2 === 1 ? 324 : 304;

                      return (
                        <g
                          key={idx}
                          onClick={() => setActiveIdx(idx)}
                          className="cursor-pointer"
                        >
                          <line
                            x1={pt.cx}
                            y1={pt.cy}
                            x2={pt.cx}
                            y2="280"
                            stroke={isSelected ? pinColor : 'rgba(255,255,255,0.18)'}
                            strokeWidth={isSelected ? '2' : '1'}
                            strokeDasharray="3 3"
                          />

                          {isSelected && (
                            <circle cx={pt.cx} cy={pt.cy} r="18" fill={pinColor} opacity="0.3">
                              <animate
                                attributeName="r"
                                values="12;20;12"
                                dur="1.8s"
                                repeatCount="indefinite"
                              />
                            </circle>
                          )}

                          <circle
                            cx={pt.cx}
                            cy={pt.cy}
                            r={isSelected ? 11 : 8}
                            fill={pinColor}
                            stroke="#ffffff"
                            strokeWidth={isSelected ? 3 : 2}
                          />

                          <text
                            x={pt.cx}
                            y={pt.cy - 15}
                            textAnchor="middle"
                            fill={isSelected ? '#ffffff' : '#e2e8f0'}
                            fontSize={isSelected ? '11' : '10'}
                            fontWeight="bold"
                          >
                            {pt.altitude.replace('approx. ', '')}
                          </text>

                          <text
                            x={pt.cx}
                            y={staggerY}
                            textAnchor="middle"
                            fill={isSelected ? pinColor : '#cbd5e1'}
                            fontSize={isSelected ? '11' : '10'}
                            fontWeight="bold"
                          >
                            {pt.name}
                          </text>
                        </g>
                      );
                    })}
                  </>
                )}
              </svg>
            </div>
          </div>

          {/* Bottom Bar inside Map — Stacks cleanly on small screens */}
          <div className="px-3.5 sm:px-5 py-3 bg-slate-950/85 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${activeStyle.dotCls}`} />
              <span className="truncate">
                Stop {activeIdx + 1} of {waypoints.length}:{' '}
                <strong className="text-white">{activeStop?.name}</strong>{' '}
                <span className="text-slate-400">({activeStyle.badge})</span>
              </span>
            </div>
            <div className="grid grid-cols-2 sm:flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveIdx((i) => (i - 1 + waypoints.length) % waypoints.length)}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors text-center"
              >
                ← Prev Stop
              </button>
              <button
                type="button"
                onClick={() => setActiveIdx((i) => (i + 1) % waypoints.length)}
                className="px-3 py-1.5 rounded-lg bg-[#FF8C00] hover:bg-[#e07800] text-white font-semibold transition-colors text-center"
              >
                Next Stop →
              </button>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Active Stop Inspector Card */}
        <div className="lg:col-span-4 bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 sm:mb-4">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${activeStyle.pill}`}
              >
                <span className={`w-2 h-2 rounded-full ${activeStyle.dotCls}`} />
                <span className="material-icons text-sm">{activeStyle.icon}</span>
                {activeStyle.badge}
              </span>
              <span className="text-xs font-bold text-slate-500">
                Checkpoint #{activeIdx + 1} of {waypoints.length}
              </span>
            </div>

            <h4 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 mb-3">
              {activeStop?.name}
            </h4>

            <div className="grid grid-cols-2 gap-2.5 mb-4">
              <div className="bg-white border border-slate-200 rounded-xl p-3">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                  Elevation
                </p>
                <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                  {activeStop?.altitude}
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-3">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                  Route Distance
                </p>
                <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                  {activeStop?.distance}
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4">
              <p className="text-xs uppercase tracking-widest text-[#FF8C00] font-bold mb-1">
                Traveller Note at {activeStop?.name}
              </p>
              <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
                {activeStop?.note}
              </p>
            </div>
          </div>

          <div className="mt-4 sm:mt-5 pt-3.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span>Tap any checkpoint below</span>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${activeStop?.name} Ladakh`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[#FF8C00] hover:underline inline-flex items-center gap-1"
            >
              Pin on Maps <span className="material-icons text-xs">north_east</span>
            </a>
          </div>
        </div>
      </div>

      {/* Responsive Checkpoint Grid on Mobile & Wrapped Pills on Tablet/Desktop */}
      <div className="mt-5 sm:mt-6 pt-5 border-t border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
            All Route Checkpoints (Tap to Inspect)
          </span>
          <span className="text-xs text-slate-400">
            Color-coded by checkpoint type
          </span>
        </div>

        {/* Full-width cards on narrow mobile (<640px) and wrapped pills on sm+ so names never clip */}
        <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-stretch sm:items-center gap-2 sm:gap-2.5">
          {waypoints.map((wp, idx) => {
            const isSelected = idx === activeIdx;
            const st = TYPE_STYLES[wp.type] || TYPE_STYLES.landmark;
            return (
              <div key={idx} className="flex items-center">
                <button
                  type="button"
                  onClick={() => setActiveIdx(idx)}
                  className={`w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between sm:justify-start gap-2.5 border ${
                    isSelected ? st.pillActiveCls : st.pillIdleCls
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold shrink-0 ${
                        isSelected ? 'bg-white text-slate-900' : st.badgeSolidCls
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="text-left">{wp.name}</span>
                  </div>
                  <span
                    className={`text-[11px] shrink-0 ${
                      isSelected ? 'text-white/90' : 'opacity-75'
                    }`}
                  >
                    ({wp.altitude.replace('approx. ', '')})
                  </span>
                </button>
                {idx < waypoints.length - 1 && (
                  <span className="hidden sm:inline-block material-icons text-slate-300 text-sm ml-1.5">
                    chevron_right
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
