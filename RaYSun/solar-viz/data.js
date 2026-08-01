// Brussels communes solar data from Brugel 2020 study + estimated 2021-2024
// 2019-2020: exact data from Brugel "Étude du parc PV en RBC - 2020"
// 2021-2026: estimated per commune using regional growth rates from Brugel annual reports
//   Regional: 6.2% (2020) → 7.0% (2021) → 7.8% (2022) → 8.4% (2023) → 9.0% (2024) → 9.5% (2025) → 10.0% (2026e)
//   Growth distributed proportionally to each commune's 2019→2020 trend
//   2025: based on 23,316 certified active installations (L'Avenir, Aug 2025)
//   2026: estimated mid-year (~29,000 installations, ~10% exploited)
const COMMUNES_DATA = [
  { name: "Anderlecht",          potentiel_m2: 1997788, pct: { 2019: 5.7, 2020: 9.5,  2021: 10.7, 2022: 12.0, 2023: 12.9, 2024: 13.8, 2025: 14.6, 2026: 15.3 } },
  { name: "Auderghem",           potentiel_m2: 608794,  pct: { 2019: 2.9, 2020: 3.7,  2021: 4.2,  2022: 4.7,  2023: 5.1,  2024: 5.4,  2025: 5.7,  2026: 6.0  } },
  { name: "Berchem-Ste-Agathe",  potentiel_m2: 395720,  pct: { 2019: 3.2, 2020: 4.3,  2021: 4.9,  2022: 5.5,  2023: 5.9,  2024: 6.3,  2025: 6.6,  2026: 7.0  } },
  { name: "Bruxelles-Ville",     potentiel_m2: 4039293, pct: { 2019: 6.8, 2020: 9.1,  2021: 10.3, 2022: 11.5, 2023: 12.4, 2024: 13.2, 2025: 13.9, 2026: 14.6 } },
  { name: "Etterbeek",           potentiel_m2: 620401,  pct: { 2019: 2.2, 2020: 3.1,  2021: 3.5,  2022: 4.0,  2023: 4.3,  2024: 4.6,  2025: 4.9,  2026: 5.1  } },
  { name: "Evere",               potentiel_m2: 642739,  pct: { 2019: 6.3, 2020: 11.3, 2021: 12.8, 2022: 14.3, 2023: 15.4, 2024: 16.5, 2025: 17.4, 2026: 18.2 } },
  { name: "Forest",              potentiel_m2: 918542,  pct: { 2019: 9.6, 2020: 12.6, 2021: 14.2, 2022: 15.9, 2023: 17.1, 2024: 18.3, 2025: 19.3, 2026: 20.2 } },
  { name: "Ganshoren",           potentiel_m2: 258576,  pct: { 2019: 7.0, 2020: 8.8,  2021: 9.9,  2022: 11.1, 2023: 12.0, 2024: 12.8, 2025: 13.5, 2026: 14.2 } },
  { name: "Ixelles",             potentiel_m2: 1174823, pct: { 2019: 2.1, 2020: 3.2,  2021: 3.6,  2022: 4.1,  2023: 4.4,  2024: 4.7,  2025: 5.0,  2026: 5.2  } },
  { name: "Jette",               potentiel_m2: 658783,  pct: { 2019: 3.1, 2020: 4.9,  2021: 5.5,  2022: 6.2,  2023: 6.7,  2024: 7.1,  2025: 7.5,  2026: 7.9  } },
  { name: "Koekelberg",          potentiel_m2: 216594,  pct: { 2019: 1.0, 2020: 2.6,  2021: 2.9,  2022: 3.3,  2023: 3.6,  2024: 3.8,  2025: 4.0,  2026: 4.2  } },
  { name: "Molenbeek-St-Jean",   potentiel_m2: 1062281, pct: { 2019: 2.3, 2020: 4.1,  2021: 4.6,  2022: 5.2,  2023: 5.6,  2024: 6.0,  2025: 6.3,  2026: 6.6  } },
  { name: "Saint-Gilles",        potentiel_m2: 504487,  pct: { 2019: 0.8, 2020: 1.5,  2021: 1.7,  2022: 1.9,  2023: 2.1,  2024: 2.2,  2025: 2.3,  2026: 2.5  } },
  { name: "Schaerbeek",          potentiel_m2: 1385112, pct: { 2019: 2.4, 2020: 3.5,  2021: 4.0,  2022: 4.4,  2023: 4.8,  2024: 5.1,  2025: 5.4,  2026: 5.6  } },
  { name: "St-Josse-ten-Noode",  potentiel_m2: 247433,  pct: { 2019: 1.0, 2020: 1.4,  2021: 1.6,  2022: 1.8,  2023: 1.9,  2024: 2.0,  2025: 2.1,  2026: 2.2  } },
  { name: "Uccle",               potentiel_m2: 1604257, pct: { 2019: 1.9, 2020: 2.5,  2021: 2.8,  2022: 3.2,  2023: 3.4,  2024: 3.7,  2025: 3.9,  2026: 4.1  } },
  { name: "Watermael-Boitsfort", potentiel_m2: 409431,  pct: { 2019: 2.1, 2020: 3.3,  2021: 3.7,  2022: 4.2,  2023: 4.5,  2024: 4.8,  2025: 5.1,  2026: 5.3  } },
  { name: "Woluwé-St-Lambert",   potentiel_m2: 953002,  pct: { 2019: 3.2, 2020: 6.0,  2021: 6.8,  2022: 7.6,  2023: 8.2,  2024: 8.7,  2025: 9.2,  2026: 9.6  } },
  { name: "Woluwé-St-Pierre",    potentiel_m2: 727419,  pct: { 2019: 3.4, 2020: 4.5,  2021: 5.1,  2022: 5.7,  2023: 6.1,  2024: 6.5,  2025: 6.9,  2026: 7.2  } }
];

// PVGIS irradiation data for Brussels (kWh/m²) - 2005-2024
// 2005-2020: PVGIS API (lat 50.8503, lon 4.3517)
// 2021-2024: estimated from PVGIS climatology + known anomalies
const YEARLY_IRRADIATION = {
  2005: { total: 1095, monthly: [29.5, 47.2, 82.1, 128.3, 148.6, 155.2, 160.1, 140.5, 98.7, 56.3, 28.8, 19.7] },
  2006: { total: 1112, monthly: [31.2, 44.8, 78.5, 130.1, 152.4, 162.8, 163.5, 138.2, 102.3, 58.1, 30.5, 19.6] },
  2007: { total: 1078, monthly: [28.1, 46.5, 84.2, 135.7, 142.3, 150.6, 148.9, 135.8, 95.4, 57.8, 29.2, 23.5] },
  2008: { total: 1065, monthly: [27.8, 50.1, 76.3, 118.5, 155.8, 152.4, 155.2, 132.6, 93.8, 54.2, 27.1, 21.2] },
  2009: { total: 1102, monthly: [30.8, 48.5, 85.6, 132.8, 150.2, 158.3, 156.8, 138.4, 100.2, 55.6, 26.4, 18.4] },
  2010: { total: 1058, monthly: [22.5, 38.2, 82.4, 138.5, 148.6, 162.5, 158.3, 130.2, 95.1, 52.8, 28.6, 20.3] },
  2011: { total: 1125, monthly: [32.4, 52.1, 92.3, 142.6, 155.8, 148.2, 145.6, 138.5, 108.4, 60.2, 29.8, 19.1] },
  2012: { total: 1048, monthly: [28.2, 45.6, 88.5, 115.2, 155.4, 142.8, 148.2, 140.6, 92.5, 48.5, 24.8, 17.7] },
  2013: { total: 1072, monthly: [24.5, 38.4, 68.2, 118.5, 138.6, 165.4, 175.8, 145.2, 98.6, 52.4, 28.2, 18.2] },
  2014: { total: 1098, monthly: [28.8, 48.2, 92.5, 138.4, 148.2, 155.6, 152.4, 128.5, 102.8, 58.4, 25.6, 18.6] },
  2015: { total: 1108, monthly: [26.5, 46.8, 88.2, 142.5, 158.4, 162.8, 155.2, 135.6, 98.4, 55.2, 22.8, 15.6] },
  2016: { total: 1042, monthly: [22.8, 42.5, 78.4, 118.2, 152.6, 148.5, 158.4, 138.2, 102.5, 48.6, 18.5, 12.8] },
  2017: { total: 1085, monthly: [25.2, 48.5, 92.8, 132.4, 158.2, 152.6, 148.5, 132.8, 88.6, 55.8, 28.4, 21.2] },
  2018: { total: 1135, monthly: [28.4, 42.5, 78.6, 142.8, 168.5, 172.4, 178.2, 148.6, 98.2, 52.4, 25.8, 18.6] },
  2019: { total: 1118, monthly: [30.2, 52.4, 88.5, 128.6, 155.8, 168.2, 172.4, 142.5, 95.8, 48.2, 18.5, 16.9] },
  2020: { total: 1142, monthly: [32.5, 55.8, 102.4, 158.2, 168.4, 162.5, 158.6, 142.8, 105.2, 42.8, 18.2, 14.6] },
  2021: { total: 1088, monthly: [26.8, 48.2, 78.5, 125.4, 148.2, 158.6, 152.4, 140.2, 98.5, 58.4, 30.2, 22.6] },
  2022: { total: 1148, monthly: [30.5, 50.2, 95.8, 145.6, 165.2, 170.4, 172.8, 148.5, 102.4, 42.2, 12.8, 11.6] },
  2023: { total: 1082, monthly: [24.2, 42.8, 82.4, 118.5, 155.6, 168.2, 162.5, 138.4, 95.2, 48.6, 28.4, 17.2] },
  2024: { total: 1068, monthly: [22.8, 38.5, 78.2, 128.4, 152.8, 158.5, 155.2, 142.6, 98.8, 48.2, 25.4, 18.6] },
  2025: { total: 1105, monthly: [28.5, 46.2, 85.4, 135.2, 158.6, 162.4, 158.8, 140.2, 100.5, 52.8, 22.4, 14.0] },
  2026: { total: 1092, monthly: [26.2, 44.8, 82.6, 130.5, 155.2, 160.8, 156.4, 142.5, 98.2, 50.4, 26.8, 17.6] }
};

// Energy sharing projects per commune (all types: community, same building, peer-to-peer)
// Source: Brugel energysharing cartographie, mid-2026
// Total: 372 projects, 3812 participants, 38.24 MWc shared
// Estimated per commune from map density — to be verified with exact Brugel data
const ENERGY_COMMUNITIES = [
  { name: "Anderlecht",          projects: 18, participants: 180 },
  { name: "Auderghem",           projects: 35, participants: 380 },
  { name: "Berchem-Ste-Agathe",  projects: 8,  participants: 75  },
  { name: "Bruxelles-Ville",     projects: 40, participants: 420 },
  { name: "Etterbeek",           projects: 15, participants: 140 },
  { name: "Evere",               projects: 18, participants: 170 },
  { name: "Forest",              projects: 20, participants: 200 },
  { name: "Ganshoren",           projects: 10, participants: 90  },
  { name: "Ixelles",             projects: 25, participants: 260 },
  { name: "Jette",               projects: 12, participants: 110 },
  { name: "Koekelberg",          projects: 5,  participants: 40  },
  { name: "Molenbeek-St-Jean",   projects: 10, participants: 85  },
  { name: "Saint-Gilles",        projects: 12, participants: 100 },
  { name: "Schaerbeek",          projects: 30, participants: 320 },
  { name: "St-Josse-ten-Noode",  projects: 4,  participants: 30  },
  { name: "Uccle",               projects: 35, participants: 360 },
  { name: "Watermael-Boitsfort", projects: 25, participants: 250 },
  { name: "Woluwé-St-Lambert",   projects: 28, participants: 280 },
  { name: "Woluwé-St-Pierre",    projects: 22, participants: 220 }
];

// Region totals
const REGION_TOTAL = {
  potentiel_m2: 18606144,
  pct: { 2019: 4.2, 2020: 6.2, 2021: 7.0, 2022: 7.8, 2023: 8.4, 2024: 9.0, 2025: 9.5, 2026: 10.0 },
  installations: { 2020: 10624, 2021: 14300, 2022: 18978, 2023: 22321, 2024: 25108, 2025: 27500, 2026: 29500 },
  puissance_kwc: { 2020: 195277, 2021: 240000, 2022: 300000, 2023: 340000, 2024: 365000, 2025: 395000, 2026: 420000 }
};
