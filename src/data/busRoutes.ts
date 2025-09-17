export interface BusRoute {
  [key: number]: string[];
}

export const busRoutes: BusRoute = {
  1: ["🌳 Kakarla Thota", "🚧 Guggarati Railway Gate", "🏪 APMC Main Gate", "🕉️ Benki Mareamma Temple", "👮 Bruce Pet Police Station", "💎 Kalyan Jewellers", "🔄 Mothi Circle", "🎓 Mount View Campus"],
  2: ["🏫 RR Block", "🎓 Mount View Campus"],
  3: ["🏫 RR Block", "🎓 Mount View Campus"],
  4: ["🏡 Kuvempu Nagar 5th Cross", "🏡 Kuvempu Nagar 3rd Cross", "🏢 G Square", "🥖 Yerithata Bakery", "🏘️ Vijayanagar Colony", "🕉️ Radia Park Ayyappa Temple", "🚧 2nd Railway Gate", "✝️ Sudha Cross", "🏫 Vasavi School", "🏘️ Sanjay Gandhi Nagar", "🕉️ Kumarswamy Temple", "👮‍♀️ Womens Police Station", "🎓 Mount View Campus"],
  5: ["🏫 RR Block", "🎓 Mount View Campus"],
  6: ["🔄 Gandhi Circle", "🕉️ Abhayanjaneya Temple", "🛍️ Reliance Trends", "🏪 APMC", "🚌 Bus Depot", "🏨 Vaishanavi Hotel", "🏘️ Halekote", "🏘️ Tekkalakote", "✝️ Byrapura Cross", "✝️ Sirigeri Cross", "🎓 Mount View Campus"],
  7: ["🏘️ Kapagal", "🏘️ Sirivara", "🏘️ Sangankal", "🏘️ Vajpayee Layout Main Gate", "⚡ KEB Circle", "💧 Water Booster", "🏛️ MLA Office", "🏪 Gandhi Nagar Market", "🏥 Sukrutha Nursing Home", "🎓 Mount View Campus"],
  8: ["🏘️ Bandihatti (Satyanarayana Temple)", "🏫 Kendriya Vidhyalaya", "🕌 Kunitan Masjid", "👮 Cowl Bazar Police Station", "🏰 Fort Entrance", "🍽️ Putti Hotel", "🎓 Mount View Campus"],
  9: ["🚦 Belagal Cross", "🎦 Select Talkies", "🏫 Mohammadia School", "🔄 SP Circle", "🎓 Mount View Campus"],
  10: ["💧 Water-Tank-Circle Raghavendra Colony", "🕉️ Sana Durgamma Temple", "🏦 Patel Nagar SBI Bank", "🕉️ Raghavendra Swamy Temple", "🍦 Cool Corner", "🏪 Basaveshwara Nagar Market", "🎓 Mount View Campus"],
  11: ["🏘️ JK Layout", "🏫 Bala Bharathi School", "🏘️ Sueha Colony", "🏛️ Govindappa Kalyana Mantapa", "🏨 Reddy Hotel", "🌊 Canal", "🏫 Shantiniketan School", "🏢 Gymkhana", "🏛️ Old BJP Office", "🎓 Mount View Campus"],
  12: ["🥛 KMF Diary", "🏫 Ambedkar School", "🔄 Indira Circle", "⛪ Shrine Church", "🔄 Vidya Nagar Circle", "🏰 Raaga Fort", "🏘️ Shanthi Nagar", "🕉️ Kolagal Yeriswamy Temple", "🏘️ Yarrangali", "🏘️ Badnahatti", "🏘️ Kurugodu", "✝️ Kollur Cross", "🎓 Mount View Campus"],
  13: ["🕉️ Brahmendra Temple", "🏘️ SMV 5th cross", "🏘️ Kapagal Road 1st Cross", "🏥 Bharath Nursing Home", "🛍️ Vishal Market", "🏦 SBI Bank", "🕉️ Durgamma Gudi", "📺 Sony Showroom", "🚌 KSRTC Bus Depot", "🏛️ Sriramulu Office", "🏥 Ballari Health City", "🏫 Chaitanya Girls College", "🌊 Havambhavi Canal", "🏛️ Classic Function Hall", "🏫 Vijayawada-Chaitanya College", "🎓 Mount View Campus"],
  14: ["🏘️ Raghavendra Colony 2nd Stage", "💊 Medplus", "🏥 Tamath Hospital", "🏫 BPSC School", "🎦 RR Theatre", "🔄 MG Circle", "🏨 Pawan Hotel", "🔄 Royal Circle", "🚌 Old Bus Stand", "🎓 Mount View Campus"],
  15: ["🏘️ Andral", "🔄 Bapuji Nagar Circle", "🚌 Kanekal Bus Stand", "🏘️ Miller Pet", "🏭 Gangappa Gin", "💊 Sharada Medical Store", "🎦 Raghavendra Theatre", "🔄 Sangam Circle", "🎓 Mount View Campus"],
  16: ["🏘️ Shankar Town", "🔄 Old Gate Circle", "🚂 Railway Station", "🛍️ Vishal Mart", "🏛️ Grama Panchayat Office", "🛣️ Toranagallu Bye Pass", "🚌 Kudthini Bus Stand", "🛣️ Veniveenapura Bye Pass", "🏫 BITM main Gate", "🏘️ Allipur", "🏭 Daardmill", "🏛️ Karnataka Function Hall", "🎓 Mount View Campus"]
};

export const drivers = [
  { email: "mohan@ku.com", name: "A Mohan", phone: "6363329681", bus: 1, password: "driver123" },
  { email: "sureshbabu@ku.com", name: "Suresh Babu", phone: "7019228638", bus: 2, password: "driver123" },
  { email: "venugopal@ku.com", name: "Venu Gopal B", phone: "9449093380", bus: 3, password: "driver123" },
  { email: "sreeram@ku.com", name: "Sree Ram S", phone: "9632262531", bus: 4, password: "driver123" },
  { email: "govind@ku.com", name: "Govind", phone: "7483482879", bus: 5, password: "driver123" },
  { email: "viraphana@ku.com", name: "Viraphana Gouda", phone: "9731287543", bus: 6, password: "driver123" },
  { email: "khadar@ku.com", name: "Khadar Basha", phone: "9980858196", bus: 7, password: "driver123" },
  { email: "hussain@ku.com", name: "Hussain M", phone: "9482999973", bus: 8, password: "driver123" },
  { email: "suman@ku.com", name: "Suman H", phone: "7899782975", bus: 9, password: "driver123" },
  { email: "shankarappa.h@ku.com", name: "Shankarappa H", phone: "9901419933", bus: 10, password: "driver123" },
  { email: "gadhilinga@ku.com", name: "Gadhilinga", phone: "8296180661", bus: 11, password: "driver123" },
  { email: "tippu@ku.com", name: "Tippu Sultan", phone: "9480951544", bus: 12, password: "driver123" },
  { email: "shankarappa.r@ku.com", name: "Shankarappa R", phone: "9743798551", bus: 13, password: "driver123" },
  { email: "rajesh@ku.com", name: "Rajesh", phone: "9980807675", bus: 14, password: "driver123" },
  { email: "pampapathi@ku.com", name: "Pampapathi", phone: "7338023244", bus: 15, password: "driver123" },
  { email: "driver16@ku.com", name: "Bus 16 Driver", phone: "0000000000", bus: 16, password: "driver123" }
];

export const ADMIN_CREDENTIALS = {
  email: "admin@bustrack.com",
  password: "admin123"
};

export const COLLEGE_LOCATION = {
  lat: 15.1396,
  lng: 76.9231
};