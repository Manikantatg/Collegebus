export interface BusRoute {
  [key: number]: string[];
}

export const busRoutes: BusRoute = {
  1: ["🏊 Water Tank", "🏫 Datta School", "🕉️ Sanna Durgamma Gudi", "🎓 BITM"],
  2: ["🚧 Guggariatti Gate", "🚨 Checkpost", "🏪 APMC", "🕉️ Benki Maremma Temple", "👮 Brucepet Police Station", "🔄 Mothi Circle", "🎓 BITM"],
  3: ["🌳 Kakarla Thota", "🕉️ Brahmaiah Temple", "🏥 Bharat Nursing Home", "🏫 ASM College", "🎓 BITM"],
  4: ["🛣️ Kappagal Road", "⛪ Don Bosco Church", "🕌 Kunitana Masjid", "🎓 BITM"],
  5: ["👨‍🏫 Teacher's Colony", "💧 Nallacheruvu", "🏫 Mohammadiya School", "🎦 Select Talkies", "🏦 SBI-ATM", "👮 COW Bazaar Police Station", "🏛️ Babu Khan Chowk", "🎓 BITM"],
  6: ["🏫 Kendriya Vidyalaya School", "🏘️ Bandihatti", "🚦 Belagal Cross", "🏡 Kuvempu Nagar 3rd Cross", "🏡 Kuvempu Nagar 5th Cross", "🎓 BITM"],
  7: ["🍽️ Kutti Hotel", "⛪ CSI Fat Baba Temple", "📻 Radio Park 2nd Gate", "🥖 Yerrithatha Bakery", "🏡 Kuvempu Nagar 2nd Cross", "🎓 BITM"],
  8: ["🏦 Kappagal Road - SBI Bank", "🕉️ Gurudrama Temple", "🏘️ Devi Nagar 4th Cross", "🕉️ Kumar Swamy Temple", "🏫 SGP College", "🏫 Vasan School", "🏦 Old Canara Bank", "🎓 BITM"],
  9: ["🏘️ Basaveswara Nagar", "🕉️ Basaveswara Temple", "🏪 Basaveswara Nagar Market", "🏢 MMTC", "🎓 BITM"],
  10: ["🏭 Gangappa Jinn", "💊 Anand Medical Stores", "🏦 Union Bank", "🎦 Raghavendra Theatre", "🏫 Nalanda College", "🏫 Nandi School", "🎓 BITM"],
  11: ["🏦 S.N.R. Pet - SBI Bank", "🏦 Bajaj National Bank", "🕉️ Raghavendra Swamy Temple", "⚡ 1st Gate KEB", "📻 Radio Park", "🕉️ Ayyappa Swamy Temple", "🎓 BITM"],
  12: ["⛽ Petrol Bunk - Anand Nagar", "🚌 Bus Stand", "⚡ KEB", "🏛️ Kannada Bhusan Stand", "🏭 Millenter", "🕉️ Vinayaka Temple", "🎓 BITM"],
  13: ["🏦 State Bank - Sangankal Road", "🚕 Auto Stand", "🏦 Karnataka Gramin Bank", "🌊 Small Canal", "🏘️ Vajpayee Layout", "🏘️ Sadguru Colony", "🎓 BITM"],
  14: ["⛪ Shrine Church", "🏪 Hira Hardware", "💧 Vidyanagar Water Tank", "🏢 Surya Apartment", "🔄 Batti Circle", "🏡 Vidyanagar 5th Cross", "🔄 Vidyanagar Circle", "🏥 OPD", "🎓 BITM"],
  15: ["🏘️ Havambhavi", "⛽ HP Petrol Bunk", "🏛️ Classic Function Hall", "🌊 Canal", "🏫 Chaitanya Girls College", "🔄 Sreeramullo Circle", "🔄 BSC SPC Circle", "🏥 KMC", "🏫 Ambedkar School", "🏡 Indira Nagar 3rd Cross", "🎓 BITM"],
  16: ["🏥 Taranath Hospital", "🏫 BPSC School", "🎦 RR Theatre", "🚗 M.G. Automobiles", "🍽️ Pavan Hotel", "🔄 Sangam Circle", "🔄 Royal Circle", "🎓 BITM"],
  17: ["🔄 Basaveswara Nagar - KB Circle", "💧 Water Booster", "🏢 Suryanarayana Reddy Office", "🏪 Gandhinagar Market", "🏥 Sukhurtha Nursing Home", "🏫 Shivananda School", "🎓 BITM"],
  18: ["🏫 R.R. Block Girls", "🛣️ Talur Road", "🏫 Government School", "🏛️ Basava Bhavan", "🏢 Police Gymkhana", "🏢 BJP Office", "🎓 BITM"]
};

export const drivers = [
  { email: "ramesh@ku.com", name: "H. M. Ramesh", phone: "9901873421", bus: 1, password: "driver123" },
  { email: "hulugappa@ku.com", name: "Hulugappa", phone: "6364791418", bus: 2, password: "driver123" },
  { email: "guruswamy@ku.com", name: "Guru Swamy", phone: "9113672508", bus: 3, password: "driver123" },
  { email: "mallikarjuna@ku.com", name: "Mallikarjuna K", phone: "9743332296", bus: 4, password: "driver123" },
  { email: "iranna@ku.com", name: "Iranna K.", phone: "9741724157", bus: 5, password: "driver123" },
  { email: "sashikumar@ku.com", name: "O. M. Sashikumar", phone: "9731741589", bus: 6, password: "driver123" },
  { email: "urushabendraiah@ku.com", name: "O. M. Urushabendraiah", phone: "8971611258", bus: 7, password: "driver123" },
  { email: "bhopeswamy@ku.com", name: "Bhopeswamy", phone: "9668885765", bus: 8, password: "driver123" },
  { email: "prathap@ku.com", name: "Prathap Reddy", phone: "7899914449", bus: 9, password: "driver123" },
  { email: "hussein@ku.com", name: "Hussein Sab", phone: "9740147038", bus: 10, password: "driver123" },
  { email: "umesh@ku.com", name: "Umesh", phone: "7975161977", bus: 11, password: "driver123" },
  { email: "maribasava@ku.com", name: "Mari Basava", phone: "8861444133", bus: 12, password: "driver123" },
  { email: "venkatesh.naik@ku.com", name: "Venkatesh Naik", phone: "9740157722", bus: 13, password: "driver123" },
  { email: "kumarswamy@ku.com", name: "Kumar Swamy", phone: "9008267208", bus: 14, password: "driver123" },
  { email: "venkatesh.b@ku.com", name: "Venkatesh B", phone: "9494137538", bus: 15, password: "driver123" },
  { email: "chandbasha@ku.com", name: "Chand Basha", phone: "9887615689", bus: 16, password: "driver123" },
  { email: "honappa@ku.com", name: "Honappa", phone: "9480918653", bus: 17, password: "driver123" },
  { email: "ramakrishna@ku.com", name: "Ramakrishna", phone: "8050825447", bus: 18, password: "driver123" }
];

export const ADMIN_CREDENTIALS = {
  email: "admin@bustrack.com",
  password: "admin123"
};

export const COLLEGE_LOCATION = {
  lat: 15.1396,
  lng: 76.9231
};