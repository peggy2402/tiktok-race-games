require("dotenv").config();
const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const { WebcastPushConnection } = require("tiktok-live-connector");
const fs = require("fs");

const app = express();
const server = http.createServer(app);

app.use(express.json()); // Hỗ trợ đọc dữ liệu JSON từ body request

// Cấu hình phục vụ file tĩnh từ thư mục "overlay" (cho phép truy cập localhost:3001/overlay.html)
app.use(express.static(path.join(__dirname, 'overlay')));

// Cấu hình Socket.io cho phép kết nối từ file HTML (Cors)
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

// --- HỆ THỐNG QUẢN LÝ CẤU HÌNH (SETTINGS) ---
const CONFIG_FILE = path.join(__dirname, 'race_config.json');

// Cấu hình mặc định ban đầu
const DEFAULT_CONFIG = [
  { id: 'car1', name: 'Indonesia', flag: 'https://flagcdn.com/w80/id.png', giftName: 'Rose', giftImg: 'https://p16-webcast.tiktokcdn.com/img/maliva/webcast-va/eba3a9bb85c33e017f3648eaf88d7189~tplv-obj.webp', carImg: 'https://cdn.creazilla.com/animations/15538651/cartoon-steamer-duck-walking-animation-gif-animation.gif' },
  { id: 'car2', name: 'Vietnam', flag: 'https://flagcdn.com/w80/vn.png', giftName: "You're awesome", giftImg: 'https://p16-webcast.tiktokcdn.com/img/alisg/webcast-sg/resource/e9cafce8279220ed26016a71076d6a8a.png~tplv-obj.webp', carImg: 'https://cdn.creazilla.com/animations/15538651/cartoon-steamer-duck-walking-animation-gif-animation.gif' },
  { id: 'car3', name: 'Philippines', flag: 'https://flagcdn.com/w80/ph.png', giftName: 'Love you', giftImg: 'https://p16-webcast.tiktokcdn.com/img/alisg/webcast-sg/resource/fc549cf1bc61f9c8a1c97ebab68dced7.png~tplv-obj.webp', carImg: 'https://cdn.creazilla.com/animations/15538651/cartoon-steamer-duck-walking-animation-gif-animation.gif' },
  { id: 'car4', name: 'Thailand', flag: 'https://flagcdn.com/w80/th.png', giftName: 'Naughty', giftImg: 'https://p16-webcast.tiktokcdn.com/img/alisg/webcast-sg/resource/4a68411b3e92fc2bf68d458d5f906b74.png~tplv-obj.webp', carImg: 'https://cdn.creazilla.com/animations/15538651/cartoon-steamer-duck-walking-animation-gif-animation.gif' },
  { id: 'car5', name: 'Malaysia', flag: 'https://flagcdn.com/w80/my.png', giftName: 'Light Sword', giftImg: 'https://p16-webcast.tiktokcdn.com/img/alisg/webcast-sg/resource/34190d129480492b9b6eefb70c7c1dec.png~tplv-obj.webp', carImg: 'https://cdn.creazilla.com/animations/15538651/cartoon-steamer-duck-walking-animation-gif-animation.gif' },
  { id: 'car6', name: 'Saudi Arabia', flag: 'https://flagcdn.com/w80/sa.png', giftName: 'TikTok', giftImg: 'https://p16-webcast.tiktokcdn.com/img/maliva/webcast-va/802a21ae29f9fae5abe3693de9f874bd~tplv-obj.webp', carImg: 'https://cdn.creazilla.com/animations/15538651/cartoon-steamer-duck-walking-animation-gif-animation.gif' },
  { id: 'car7', name: 'UAE', flag: 'https://flagcdn.com/w80/ae.png', giftName: 'Pop', giftImg: 'https://p16-webcast.tiktokcdn.com/img/alisg/webcast-sg/resource/0b4f61e8ab637f11449300d03929ef87.png~tplv-obj.webp', carImg: 'https://cdn.creazilla.com/animations/15538651/cartoon-steamer-duck-walking-animation-gif-animation.gif' },
  { id: 'car8', name: 'United States', flag: 'https://flagcdn.com/w80/us.png', giftName: 'Ice Cream', giftImg: 'https://p16-webcast.tiktokcdn.com/img/maliva/webcast-va/968820bc85e274713c795a6aef3f7c67~tplv-obj.webp', carImg: 'https://cdn.creazilla.com/animations/15538651/cartoon-steamer-duck-walking-animation-gif-animation.gif' },
  { id: 'car9', name: 'Japan', flag: 'https://flagcdn.com/w80/jp.png', giftName: 'Music Note', giftImg: 'https://p16-webcast.tiktokcdn.com/img/alisg/webcast-sg/resource/1f5ca5cfb4b98c2761fb85987f47c641.png~tplv-obj.webp', carImg: 'https://cdn.creazilla.com/animations/15538651/cartoon-steamer-duck-walking-animation-gif-animation.gif' },
  { id: 'car10', name: 'South Korea', flag: 'https://flagcdn.com/w80/kr.png', giftName: 'Vinyl Record', giftImg: 'https://p16-webcast.tiktokcdn.com/img/alisg/webcast-sg/resource/77f6ab69b0b03bda98a0a3d2bfdeb46f.png~tplv-obj.webp', carImg: 'https://cdn.creazilla.com/animations/15538651/cartoon-steamer-duck-walking-animation-gif-animation.gif' },
  { id: 'car11', name: 'Mexico', flag: 'https://flagcdn.com/w80/mx.png', giftName: 'Glow Stick', giftImg: 'https://p16-webcast.tiktokcdn.com/img/maliva/webcast-va/8e1a5d66370c5586545e358e37c10d25~tplv-obj.webp', carImg: 'https://cdn.creazilla.com/animations/15538651/cartoon-steamer-duck-walking-animation-gif-animation.gif' },
  { id: 'car12', name: 'Brazil', flag: 'https://flagcdn.com/w80/br.png', giftName: 'GG', giftImg: 'https://p16-webcast.tiktokcdn.com/img/maliva/webcast-va/3f02fa9594bd1495ff4e8aa5ae265eef~tplv-obj.webp', carImg: 'https://cdn.creazilla.com/animations/15538651/cartoon-steamer-duck-walking-animation-gif-animation.gif' },
  { id: 'car13', name: 'UK', flag: 'https://flagcdn.com/w80/gb.png', giftName: 'Birthday Cake', giftImg: 'https://p16-webcast.tiktokcdn.com/img/maliva/webcast-va/3ac5ec732f6f4ba7b1492248bfea83d6~tplv-obj.webp', carImg: 'https://cdn.creazilla.com/animations/15538651/cartoon-steamer-duck-walking-animation-gif-animation.gif' }
];

let raceConfig = [];
let GIFT_MAPPING = {};
let COUNTRY_NAMES = {};
let race = {};

// Hàm nạp cấu hình và tạo lại bộ từ điển
function loadAndMapConfig() {
  if (fs.existsSync(CONFIG_FILE)) {
    raceConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  } else {
    raceConfig = DEFAULT_CONFIG;
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(raceConfig, null, 2));
  }
  
  GIFT_MAPPING = {};
  COUNTRY_NAMES = {};
  raceConfig.forEach(item => {
    GIFT_MAPPING[item.giftName] = item.id;
    COUNTRY_NAMES[item.id] = item.name;
    if (race[item.id] === undefined) race[item.id] = 0; // Khởi tạo điểm = 0
  });
}
loadAndMapConfig();

// API: Lấy cấu hình hiện tại
app.get('/api/config', (req, res) => res.json(raceConfig));

// API: Cập nhật cấu hình
app.post('/api/config', (req, res) => {
  raceConfig = req.body;
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(raceConfig, null, 2));
  loadAndMapConfig();
  io.emit('reloadSettings'); // Phát tín hiệu để overlay.html tự động reload
  res.json({ success: true });
});


// Lưu trữ điểm của người xem để tính MVP
let userScores = {};

// Username TikTok LIVE của bạn
const tiktokUsername = "father.run52";

// Cấu hình kết nối TikTok Live (Thêm options để giả lập trình duyệt và tránh lỗi 200)
const tiktok = new WebcastPushConnection(tiktokUsername, {
  // Thêm API Key của bạn từ EulerStream.com vào đây để tránh lỗi Rate Limit
  signApiKey: process.env.EULER_API_KEY, // <-- Sử dụng biến môi trường từ file .env
  processInitialData: false,
  enableExtendedGiftInfo: true,
  enableWebsocketUpgrade: true,
  requestPollingInterval: 2000,
  clientParams: {
    "app_language": "en-US",
    "device_platform": "web_pc"
  }
});

// Hàm xử lý kết nối để có thể tái sử dụng (Reconnect)
function connectTikTok() {
  tiktok.connect().then(state => {
    // Thêm một dòng mới để không bị ghi đè bởi thông báo chờ
    console.log(`\n✅ Đã kết nối tới TikTok Live: ${tiktokUsername} (Room ID: ${state.roomId})`);
  }).catch(err => {
    if (String(err).includes('UserOfflineError')) {
      // Khi user chưa online, hiển thị thông báo gọn gàng trên 1 dòng và tự cập nhật
      process.stdout.write(`🟡 Chờ "${tiktokUsername}" livestream... Tự động kiểm tra lại. (Lần cuối: ${new Date().toLocaleTimeString()})\r`);
    } else {
      // Với các lỗi khác, vẫn in chi tiết để debug
      console.error("\n❌ Lỗi kết nối:", err);
      console.log("🔄 Đang thử kết nối lại sau 5 giây...");
    }
    setTimeout(connectTikTok, 5000);
  });
}

// Lắng nghe sự kiện mất kết nối để tự động reconnect
tiktok.on('disconnected', () => {
  console.warn("⚠️ Mất kết nối tới Live Stream!");
  console.log("🔄 Đang thử kết nối lại sau 5 giây...");
  setTimeout(connectTikTok, 5000);
});

// Lắng nghe sự kiện Stream kết thúc
tiktok.on('streamEnd', () => {
  console.warn("⚠️ Stream đã kết thúc!");
  // Tùy chọn: Có thể thử kết nối lại đề phòng họ live lại ngay
  setTimeout(connectTikTok, 10000);
});

// Bắt đầu kết nối lần đầu
connectTikTok();

tiktok.on("gift", data => {
  const giftName = data.giftName;
  const nickname = data.nickname;
  const diamond = data.diamondCount;
  console.log("Gift Name: " + giftName);
  // Kiểm tra xem quà này có thuộc về quốc gia nào không
  const carId = GIFT_MAPPING[giftName];

  if (!carId) {
    // Log ra những món quà bị bỏ qua để debug
    console.log(`❌ CHƯA CÓ MAPPING: ${nickname} gửi "${giftName}" -> Hãy thêm "${giftName}" vào GIFT_MAPPING trong server.js`);
    return; 
  }

  // Tính điểm: mặc định 1 xu = 1 điểm (hoặc tùy chỉnh)
  // Bạn có thể lấy data.diamondCount để chính xác số xu
  let score = data.diamondCount || 1; 

  // Log thành công
  console.log(`✅ ${COUNTRY_NAMES[carId]} TĂNG TỐC! | User: ${nickname} | Quà: ${giftName} (+${score} điểm)`);

  // Cộng điểm cho đúng xe đó
  race[carId] += score;

  // --- XỬ LÝ MVP (Người tặng nhiều nhất) ---
  // Cộng dồn điểm cho người dùng
  if (!userScores[nickname]) userScores[nickname] = 0;
  userScores[nickname] += score;

  // Sắp xếp và lấy Top 3
  const topUsers = Object.entries(userScores)
    .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
    .slice(0, 3)
    .map(([name, s], index) => ({ rank: index + 1, name, score: s }));

  io.emit("mvpUpdate", topUsers); // Gửi danh sách MVP mới xuống Client

  // Gửi thông tin gift để hiển thị effect (thêm mới)
  io.emit("newGift", {
    carId: carId,
    giftName: giftName,
    nickname: data.nickname || "Viewer",
    score: score
  });

  // Gửi vị trí mới của cả 10 xe tới giao diện HTML
  io.emit("raceUpdate", race);
});

server.listen(3001, () => {
  console.log("Server running on port 3001");
});