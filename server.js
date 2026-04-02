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
  { id: 'car10', name: 'South Korea', flag: 'https://flagcdn.com/w80/kr.png', giftName: 'Vinyl Record', giftImg: 'https://p16-webcast.tiktokcdn.com/img/alisg/webcast-sg/resource/77f6ab69b0b03bda98a0a3d2bfdeb46f.png~tplv-obj.webp', carImg: 'https://cdn.creazilla.com/animations/15538651/cartoon-steamer-duck-walking-animation-gif-animation.gif' }
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
      // Giới hạn cấu hình tải lên từ file chỉ lấy tối đa 10 xe
      raceConfig = JSON.parse(fileContent).slice(0, 10);
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
let appSettings = { tiktokUsername: "father.run52", enableWinSound: true, bgmUrl: "", winSoundUrl: "", giftSoundUrl: "https://www.myinstants.com/media/sounds/pew_1.mp3", eatSoundUrl: "https://www.myinstants.com/media/sounds/pop_7e9ls8L.mp3", carSize: 70, enableNeon: true, itemPoints: 5 };

function loadAppSettings() {
  if (fs.existsSync(APP_SETTINGS_FILE)) {
    try {
      appSettings = JSON.parse(fs.readFileSync(APP_SETTINGS_FILE, 'utf8'));
      if (appSettings.enableWinSound === undefined) appSettings.enableWinSound = true;
      if (appSettings.bgmUrl === undefined) appSettings.bgmUrl = "";
      if (appSettings.winSoundUrl === undefined) appSettings.winSoundUrl = "";
      if (appSettings.giftSoundUrl === undefined) appSettings.giftSoundUrl = "https://www.myinstants.com/media/sounds/pew_1.mp3";
      if (appSettings.eatSoundUrl === undefined) appSettings.eatSoundUrl = "https://www.myinstants.com/media/sounds/pop_7e9ls8L.mp3";
      if (appSettings.itemPoints === undefined) appSettings.itemPoints = 5;
      if (appSettings.carSize === undefined) appSettings.carSize = 70;
      if (appSettings.enableNeon === undefined) appSettings.enableNeon = true;
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

// Lắng nghe sự kiện từ Giao diện (Overlay)
io.on("connection", (socket) => {
  socket.on("eatItem", (data) => {
    if (race[data.carId] !== undefined) {
      race[data.carId] += data.points || 5; // Thưởng điểm khi ăn vật phẩm
      console.log(`🎁 ${COUNTRY_NAMES[data.carId]} vừa ăn vật phẩm! (+${data.points || 5} điểm)`);
      io.emit("raceUpdate", race);
    }
  });
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

  // BẮT BUỘC: Lắng nghe sự kiện lỗi để Node.js không bị crash khi IP Railway bị TikTok chặn/rate-limit
  tiktok.on('error', err => {
    console.error("⚠️ Lỗi từ kết nối TikTok (Có thể do mạng hoặc IP bị giới hạn):", err.message || err);
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

// --- BẢO VỆ SERVER KHÔNG BỊ CRASH (RẤT QUAN TRỌNG KHI DEPLOY CLOUD) ---
process.on('uncaughtException', (err) => {
  console.error("🔥 Uncaught Exception (Đã chặn crash):", err);
  // Không gọi process.exit(1) để giữ server sống
});
process.on('unhandledRejection', (reason, promise) => {
  console.error("🔥 Unhandled Rejection (Đã chặn crash):", reason);
  // Không gọi process.exit(1) để giữ server sống
});

app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Trang Chủ - TikTok Live Race</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #121212; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        h1 { color: #00f3ff; margin-bottom: 30px; text-shadow: 0 0 10px rgba(0,243,255,0.5); text-align: center; }
        .btn-container { display: flex; gap: 20px; flex-wrap: wrap; justify-content: center; }
        .btn { text-decoration: none; background: #1e1e1e; color: #fff; padding: 30px 50px; border-radius: 12px; font-size: 20px; font-weight: bold; border: 2px solid #333; transition: all 0.3s ease; display: flex; flex-direction: column; align-items: center; gap: 15px; min-width: 150px; text-align: center; }
        .btn:hover { transform: translateY(-5px); border-color: #00f3ff; box-shadow: 0 10px 20px rgba(0, 243, 255, 0.3); }
        .btn-settings:hover { border-color: #ffd700; box-shadow: 0 10px 20px rgba(255, 215, 0, 0.3); }
      </style>
    </head>
    <body>
      <h1>🏎️ TikTok Live Race Server</h1>
      <div class="btn-container">
        <a href="/overlay.html" class="btn" target="_blank">
          <span style="font-size: 50px;">🎮</span>
          Mở Màn Hình Game<br><span style="font-size: 14px; color:#aaa; font-weight:normal;">(Dành cho OBS)</span>
        </a>
        <a href="/settings.html" class="btn btn-settings" target="_blank">
          <span style="font-size: 50px;">⚙️</span>
          Cài Đặt Game<br><span style="font-size: 14px; color:#aaa; font-weight:normal;">(Quản lý / Config)</span>
        </a>
      </div>
    </body>
    </html>
  `);
});

const PORT = parseInt(process.env.PORT, 10) || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
  
  // Khởi động kết nối TikTok SAU KHI web server đã lắng nghe thành công
  setTimeout(() => {
    try {
      initTikTokConnection();
    } catch (err) {
      console.error("TikTok init error:", err);
    }
  }, 2000);
});

// API: Health Check (Rất quan trọng để Render không bị Timeout)
app.get('/health', (req, res) => res.status(200).send('OK'));
app.get('/ping', (req, res) => res.status(200).send('pong'));

