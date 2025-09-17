export interface BusRoute {
  [key: number]: string[];
}

export interface BusStop {
  name: string;
  scheduledTime: string;
  actualTime?: string;
  completed: boolean;
}

export interface BusRouteWithTimes {
  [key: number]: BusStop[];
}

export const busRoutes: BusRouteWithTimes = {
  1: [
    { name: "🌳 Kakarla Thota", scheduledTime: "7:40 AM", completed: false },
    { name: "🚧 Guggarati Railway Gate", scheduledTime: "7:43 AM", completed: false },
    { name: "🏪 APMC Main Gate", scheduledTime: "7:46 AM", completed: false },
    { name: "🕉️ Benki Mareamma Temple", scheduledTime: "7:50 AM", completed: false },
    { name: "👮 Bruce Pet Police Station", scheduledTime: "7:53 AM", completed: false },
    { name: "💎 Kalyan Jewellers", scheduledTime: "7:55 AM", completed: false },
    { name: "🔄 Mothi Circle", scheduledTime: "7:58 AM", completed: false },
    { name: "🎓 Mount View Campus", scheduledTime: "8:50 AM", completed: false }
  ],
  2: [
    { name: "🏫 RR Block", scheduledTime: "7:45 AM", completed: false },
    { name: "🎓 Mount View Campus", scheduledTime: "8:50 AM", completed: false }
  ],
  3: [
    { name: "🏫 RR Block", scheduledTime: "7:45 AM", completed: false },
    { name: "🎓 Mount View Campus", scheduledTime: "8:50 AM", completed: false }
  ],
  4: [
    { name: "🏡 Kuvempu Nagar 5th Cross", scheduledTime: "7:35 AM", completed: false },
    { name: "🏡 Kuvempu Nagar 3rd Cross", scheduledTime: "7:37 AM", completed: false },
    { name: "🏢 G Square", scheduledTime: "7:40 AM", completed: false },
    { name: "🥖 Yerithata Bakery", scheduledTime: "7:42 AM", completed: false },
    { name: "🏘️ Vijayanagar Colony", scheduledTime: "7:44 AM", completed: false },
    { name: "🕉️ Radia Park Ayyappa Temple", scheduledTime: "7:46 AM", completed: false },
    { name: "🚧 2nd Railway Gate", scheduledTime: "7:48 AM", completed: false },
    { name: "✝️ Sudha Cross", scheduledTime: "7:50 AM", completed: false },
    { name: "🏫 Vasavi School", scheduledTime: "7:52 AM", completed: false },
    { name: "🏘️ Sanjay Gandhi Nagar", scheduledTime: "7:54 AM", completed: false },
    { name: "🕉️ Kumarswamy Temple", scheduledTime: "7:56 AM", completed: false },
    { name: "👮‍♀️ Womens Police Station", scheduledTime: "7:58 AM", completed: false },
    { name: "🎓 Mount View Campus", scheduledTime: "8:50 AM", completed: false }
  ],
  5: [
    { name: "🏫 RR Block", scheduledTime: "7:45 AM", completed: false },
    { name: "🎓 Mount View Campus", scheduledTime: "8:50 AM", completed: false }
  ],
  6: [
    { name: "🔄 Gandhi Circle", scheduledTime: "7:40 AM", completed: false },
    { name: "🕉️ Abhayanjaneya Temple", scheduledTime: "7:42 AM", completed: false },
    { name: "🛍️ Reliance Trends", scheduledTime: "7:44 AM", completed: false },
    { name: "🏪 APMC", scheduledTime: "7:46 AM", completed: false },
    { name: "🚌 Bus Depot", scheduledTime: "7:48 AM", completed: false },
    { name: "🏨 Vaishanavi Hotel", scheduledTime: "7:50 AM", completed: false },
    { name: "🏘️ Halekote", scheduledTime: "8:05 AM", completed: false },
    { name: "🏘️ Tekkalakote", scheduledTime: "8:15 AM", completed: false },
    { name: "✝️ Byrapura Cross", scheduledTime: "8:25 AM", completed: false },
    { name: "✝️ Sirigeri Cross", scheduledTime: "8:35 AM", completed: false },
    { name: "🎓 Mount View Campus", scheduledTime: "8:45 AM", completed: false }
  ],
  7: [
    { name: "🏘️ Kapagal", scheduledTime: "7:20 AM", completed: false },
    { name: "🏘️ Sirivara", scheduledTime: "7:25 AM", completed: false },
    { name: "🏘️ Sangankal", scheduledTime: "7:35 AM", completed: false },
    { name: "🏘️ Vajpayee Layout Main Gate", scheduledTime: "7:40 AM", completed: false },
    { name: "⚡ KEB Circle", scheduledTime: "7:43 AM", completed: false },
    { name: "💧 Water Booster", scheduledTime: "7:46 AM", completed: false },
    { name: "🏛️ MLA Office", scheduledTime: "7:48 AM", completed: false },
    { name: "🏪 Gandhi Nagar Market", scheduledTime: "7:50 AM", completed: false },
    { name: "🏥 Sukrutha Nursing Home", scheduledTime: "7:52 AM", completed: false },
    { name: "🎓 Mount View Campus", scheduledTime: "8:50 AM", completed: false }
  ],
  8: [
    { name: "🏘️ Bandihatti (Satyanarayana Temple)", scheduledTime: "7:40 AM", completed: false },
    { name: "🏫 Kendriya Vidhyalaya", scheduledTime: "7:42 AM", completed: false },
    { name: "🕌 Kunitan Masjid", scheduledTime: "7:45 AM", completed: false },
    { name: "👮 Cowl Bazar Police Station", scheduledTime: "7:48 AM", completed: false },
    { name: "🏰 Fort Entrance", scheduledTime: "7:52 AM", completed: false },
    { name: "🍽️ Putti Hotel", scheduledTime: "7:54 AM", completed: false },
    { name: "🎓 Mount View Campus", scheduledTime: "8:50 AM", completed: false }
  ],
  9: [
    { name: "🚦 Belagal Cross", scheduledTime: "7:40 AM", completed: false },
    { name: "🎦 Select Talkies", scheduledTime: "7:45 AM", completed: false },
    { name: "🏫 Mohammadia School", scheduledTime: "7:48 AM", completed: false },
    { name: "🔄 SP Circle", scheduledTime: "7:55 AM", completed: false },
    { name: "🎓 Mount View Campus", scheduledTime: "8:50 AM", completed: false }
  ],
  10: [
    { name: "💧 Water-Tank-Circle Raghavendra Colony", scheduledTime: "7:35 AM", completed: false },
    { name: "🕉️ Sana Durgamma Temple", scheduledTime: "7:37 AM", completed: false },
    { name: "🏦 Patel Nagar SBI Bank", scheduledTime: "7:40 AM", completed: false },
    { name: "🕉️ Raghavendra Swamy Temple", scheduledTime: "7:43 AM", completed: false },
    { name: "🍦 Cool Corner", scheduledTime: "7:45 AM", completed: false },
    { name: "🏪 Basaveshwara Nagar Market", scheduledTime: "7:50 AM", completed: false },
    { name: "🎓 Mount View Campus", scheduledTime: "8:50 AM", completed: false }
  ],
  11: [
    { name: "🏘️ JK Layout", scheduledTime: "7:40 AM", completed: false },
    { name: "🏫 Bala Bharathi School", scheduledTime: "7:42 AM", completed: false },
    { name: "🏘️ Sueha Colony", scheduledTime: "7:44 AM", completed: false },
    { name: "🏛️ Govindappa Kalyana Mantapa", scheduledTime: "7:46 AM", completed: false },
    { name: "🏨 Reddy Hotel", scheduledTime: "7:48 AM", completed: false },
    { name: "🌊 Canal", scheduledTime: "7:50 AM", completed: false },
    { name: "🏫 Shantiniketan School", scheduledTime: "7:52 AM", completed: false },
    { name: "🏢 Gymkhana", scheduledTime: "7:54 AM", completed: false },
    { name: "🏛️ Old BJP Office", scheduledTime: "7:56 AM", completed: false },
    { name: "🎓 Mount View Campus", scheduledTime: "8:50 AM", completed: false }
  ],
  12: [
    { name: "🥛 KMF Diary", scheduledTime: "7:35 AM", completed: false },
    { name: "🏫 Ambedkar School", scheduledTime: "7:37 AM", completed: false },
    { name: "🔄 Indira Circle", scheduledTime: "7:40 AM", completed: false },
    { name: "⛪ Shrine Church", scheduledTime: "7:42 AM", completed: false },
    { name: "🔄 Vidya Nagar Circle", scheduledTime: "7:44 AM", completed: false },
    { name: "🏰 Raaga Fort", scheduledTime: "7:46 AM", completed: false },
    { name: "🏘️ Shanthi Nagar", scheduledTime: "7:50 AM", completed: false },
    { name: "🕉️ Kolagal Yeriswamy Temple", scheduledTime: "7:55 AM", completed: false },
    { name: "🏘️ Yarrangali", scheduledTime: "8:00 AM", completed: false },
    { name: "🏘️ Badnahatti", scheduledTime: "8:10 AM", completed: false },
    { name: "🏘️ Kurugodu", scheduledTime: "8:20 AM", completed: false },
    { name: "✝️ Kollur Cross", scheduledTime: "8:30 AM", completed: false },
    { name: "🎓 Mount View Campus", scheduledTime: "8:50 AM", completed: false }
  ],
  13: [
    { name: "🕉️ Brahmendra Temple", scheduledTime: "7:40 AM", completed: false },
    { name: "🏘️ SMV 5th cross", scheduledTime: "7:42 AM", completed: false },
    { name: "🏘️ Kapagal Road 1st Cross", scheduledTime: "7:44 AM", completed: false },
    { name: "🏥 Bharath Nursing Home", scheduledTime: "7:46 AM", completed: false },
    { name: "🛍️ Vishal Market", scheduledTime: "7:48 AM", completed: false },
    { name: "🏦 SBI Bank", scheduledTime: "7:50 AM", completed: false },
    { name: "🕉️ Durgamma Gudi", scheduledTime: "7:52 AM", completed: false },
    { name: "📺 Sony Showroom", scheduledTime: "7:54 AM", completed: false },
    { name: "🚌 KSRTC Bus Depot", scheduledTime: "7:56 AM", completed: false },
    { name: "🏛️ Sriramulu Office", scheduledTime: "7:58 AM", completed: false },
    { name: "🏥 Ballari Health City", scheduledTime: "8:00 AM", completed: false },
    { name: "🏫 Chaitanya Girls College", scheduledTime: "8:02 AM", completed: false },
    { name: "🌊 Havambhavi Canal", scheduledTime: "8:05 AM", completed: false },
    { name: "🏛️ Classic Function Hall", scheduledTime: "8:07 AM", completed: false },
    { name: "🏫 Vijayawada-Chaitanya College", scheduledTime: "8:10 AM", completed: false },
    { name: "🎓 Mount View Campus", scheduledTime: "8:50 AM", completed: false }
  ],
  14: [
    { name: "🏘️ Raghavendra Colony 2nd Stage", scheduledTime: "7:30 AM", completed: false },
    { name: "💊 Medplus", scheduledTime: "7:32 AM", completed: false },
    { name: "🏥 Tamath Hospital", scheduledTime: "7:35 AM", completed: false },
    { name: "🏫 BPSC School", scheduledTime: "7:37 AM", completed: false },
    { name: "🎦 RR Theatre", scheduledTime: "7:40 AM", completed: false },
    { name: "🔄 MG Circle", scheduledTime: "7:42 AM", completed: false },
    { name: "🏨 Pawan Hotel", scheduledTime: "7:45 AM", completed: false },
    { name: "🔄 Royal Circle", scheduledTime: "7:47 AM", completed: false },
    { name: "🚌 Old Bus Stand", scheduledTime: "7:50 AM", completed: false },
    { name: "🎓 Mount View Campus", scheduledTime: "8:50 AM", completed: false }
  ],
  15: [
    { name: "🏘️ Andral", scheduledTime: "7:40 AM", completed: false },
    { name: "🔄 Bapuji Nagar Circle", scheduledTime: "7:43 AM", completed: false },
    { name: "🚌 Kanekal Bus Stand", scheduledTime: "7:46 AM", completed: false },
    { name: "🏘️ Miller Pet", scheduledTime: "7:48 AM", completed: false },
    { name: "🏭 Gangappa Gin", scheduledTime: "7:50 AM", completed: false },
    { name: "💊 Sharada Medical Store", scheduledTime: "7:53 AM", completed: false },
    { name: "🎦 Raghavendra Theatre", scheduledTime: "7:55 AM", completed: false },
    { name: "🔄 Sangam Circle", scheduledTime: "7:57 AM", completed: false },
    { name: "🎓 Mount View Campus", scheduledTime: "8:50 AM", completed: false }
  ],
  16: [
    { name: "🏘️ Shankar Town", scheduledTime: "7:20 AM", completed: false },
    { name: "🔄 Old Gate Circle", scheduledTime: "7:22 AM", completed: false },
    { name: "🚂 Railway Station", scheduledTime: "7:24 AM", completed: false },
    { name: "🛍️ Vishal Mart", scheduledTime: "7:26 AM", completed: false },
    { name: "🏛️ Grama Panchayat Office", scheduledTime: "7:28 AM", completed: false },
    { name: "🛣️ Toranagallu Bye Pass", scheduledTime: "7:30 AM", completed: false },
    { name: "🚌 Kudthini Bus Stand", scheduledTime: "7:38 AM", completed: false },
    { name: "🛣️ Veniveenapura Bye Pass", scheduledTime: "7:43 AM", completed: false },
    { name: "🏫 BITM main Gate", scheduledTime: "7:50 AM", completed: false },
    { name: "🏘️ Allipur", scheduledTime: "7:52 AM", completed: false },
    { name: "🏭 Daardmill", scheduledTime: "7:55 AM", completed: false },
    { name: "🏛️ Karnataka Function Hall", scheduledTime: "7:57 AM", completed: false },
    { name: "🎓 Mount View Campus", scheduledTime: "8:50 AM", completed: false }
  ]
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