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
    try {
      const fileContent = fs.readFileSync(CONFIG_FILE, 'utf8');
      raceConfig = JSON.parse(fileContent);
    } catch (error) {
      console.error(`⚠️ Lỗi khi đọc file ${CONFIG_FILE}:`, error.message);
      console.log("🔄 Đang khôi phục cấu hình mặc định...");
      raceConfig = DEFAULT_CONFIG;
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(raceConfig, null, 2));
    }
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

// --- CẤU HÌNH TIKTOK USERNAME ---
const APP_SETTINGS_FILE = path.join(__dirname, 'app_settings.json');
let appSettings = { tiktokUsername: "father.run52" };

function loadAppSettings() {
  if (fs.existsSync(APP_SETTINGS_FILE)) {
    try {
      appSettings = JSON.parse(fs.readFileSync(APP_SETTINGS_FILE, 'utf8'));
    } catch (e) {
      console.error("Lỗi đọc app_settings.json, dùng mặc định.");
    }
  } else {
    fs.writeFileSync(APP_SETTINGS_FILE, JSON.stringify(appSettings, null, 2));
  }
}
loadAppSettings();

// API: Lấy app settings
app.get('/api/app-settings', (req, res) => res.json(appSettings));

// API: Cập nhật app settings
app.post('/api/app-settings', (req, res) => {
  const oldUsername = appSettings.tiktokUsername;
  appSettings = req.body;
  fs.writeFileSync(APP_SETTINGS_FILE, JSON.stringify(appSettings, null, 2));
  
  if (oldUsername !== appSettings.tiktokUsername) {
    console.log(`\n🔄 TikTok Username thay đổi từ '${oldUsername}' sang '${appSettings.tiktokUsername}'. Đang kết nối lại...`);
    initTikTokConnection(); // Tự động kết nối lại khi user thay đổi
  }
  res.json({ success: true });
});

// API: Reset điểm số
app.post('/api/reset', (req, res) => {
  for (let key in race) {
    race[key] = 0;
  }
  userScores = {};
  io.emit("raceUpdate", race);
  io.emit("mvpUpdate", []);
  io.emit("raceReset"); // Bắn tín hiệu để overlay reset xe về vạch đích
  res.json({ success: true });
});

let tiktok = null;
let reconnectTimeout = null;

function initTikTokConnection() {
  if (tiktok) {
    try { tiktok.disconnect(); } catch (e) {} // Ngắt kết nối với phiên cũ
  }
  if (reconnectTimeout) clearTimeout(reconnectTimeout);

  tiktok = new WebcastPushConnection(appSettings.tiktokUsername, {
    signApiKey: process.env.EULER_API_KEY,
    processInitialData: false,
    enableExtendedGiftInfo: true,
    enableWebsocketUpgrade: true,
    requestPollingInterval: 2000,
    clientParams: {
      "app_language": "en-US",
      "device_platform": "web_pc"
    }
  });

  tiktok.on('disconnected', () => {
    console.warn("⚠️ Mất kết nối tới Live Stream!");
    console.log("🔄 Đang thử kết nối lại sau 5 giây...");
    reconnectTimeout = setTimeout(connectTikTok, 5000);
  });

  tiktok.on('streamEnd', () => {
    console.warn("⚠️ Stream đã kết thúc!");
    reconnectTimeout = setTimeout(connectTikTok, 10000);
  });

  tiktok.on("gift", data => {
    const giftName = data.giftName;
    const nickname = data.nickname;
    console.log("Gift Name: " + giftName);
    
    const carId = GIFT_MAPPING[giftName];

    if (!carId) {
      console.log(`❌ CHƯA CÓ MAPPING: ${nickname} gửi "${giftName}" -> Hãy thêm "${giftName}" vào cấu hình.`);
      return; 
    }

    let score = data.diamondCount || 1; 

    console.log(`✅ ${COUNTRY_NAMES[carId]} TĂNG TỐC! | User: ${nickname} | Quà: ${giftName} (+${score} điểm)`);

    race[carId] += score;

    if (!userScores[nickname]) userScores[nickname] = 0;
    userScores[nickname] += score;

    const topUsers = Object.entries(userScores)
      .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
      .slice(0, 3)
      .map(([name, s], index) => ({ rank: index + 1, name, score: s }));

    io.emit("mvpUpdate", topUsers); 

    io.emit("newGift", {
      carId: carId,
      giftName: giftName,
      nickname: data.nickname || "Viewer",
      score: score
    });

    io.emit("raceUpdate", race);
  });

  connectTikTok();
}

function connectTikTok() {
  if (!tiktok) return;
  tiktok.connect().then(state => {
    console.log(`\n✅ Đã kết nối tới TikTok Live: ${appSettings.tiktokUsername} (Room ID: ${state.roomId})`);
  }).catch(err => {
    if (String(err).includes('UserOfflineError')) {
      process.stdout.write(`🟡 Chờ "${appSettings.tiktokUsername}" livestream... Tự động kiểm tra lại. (Lần cuối: ${new Date().toLocaleTimeString()})\r`);
    } else {
      console.error("\n❌ Lỗi kết nối:", err);
      console.log("🔄 Đang thử kết nối lại sau 5 giây...");
    }
    reconnectTimeout = setTimeout(connectTikTok, 5000);
  });
}

// Bắt đầu kết nối lần đầu
initTikTokConnection();

server.listen(3001, () => {
  console.log("Server running on port 3001");
});