const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const { WebcastPushConnection } = require("tiktok-live-connector");

const app = express();
const server = http.createServer(app);

// Cấu hình phục vụ file tĩnh từ thư mục "overlay" (cho phép truy cập localhost:3001/overlay.html)
app.use(express.static(path.join(__dirname, 'overlay')));

// Cấu hình Socket.io cho phép kết nối từ file HTML (Cors)
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

// Khởi tạo vị trí của 10 xe bằng 0
let race = {};
for (let i = 1; i <= 13; i++) {
  race[`car${i}`] = 0;
}

// Lưu trữ điểm của người xem để tính MVP
let userScores = {};

// Username TikTok LIVE của bạn
const tiktokUsername = "buivinhphuchotboykeokeo";

// Cấu hình kết nối TikTok Live (Thêm options để giả lập trình duyệt và tránh lỗi 200)
const tiktok = new WebcastPushConnection(tiktokUsername, {
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
    console.log(`✅ Đã kết nối tới TikTok Live: ${tiktokUsername} (Room ID: ${state.roomId})`);
  }).catch(err => {
    console.error("❌ Lỗi kết nối:", err);
    console.log("🔄 Đang thử kết nối lại sau 5 giây...");
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

// Mapping tên Quốc Gia để hiển thị Log cho dễ nhìn
const COUNTRY_NAMES = {
  "car1": "Indonesia 🇮🇩",
  "car2": "Việt Nam 🇻🇳",
  "car3": "Philippines 🇵🇭",
  "car4": "Thái Lan 🇹🇭",
  "car5": "Malaysia 🇲🇾",
  "car6": "Saudi Arabia 🇸🇦",
  "car7": "UAE 🇦🇪",
  "car8": "Mỹ (USA) 🇺🇸",
  "car9": "Nhật Bản 🇯🇵",
  "car10": "Hàn Quốc 🇰🇷",
  "car11": "Mexico 🇲🇽",
  "car12": "Brazil 🇧🇷",
  "car13": "UK 🇬🇧"
};

// Cấu hình MAPPING: Quà nào -> Xe nước nào
const GIFT_MAPPING = {
  "Rose": "car1",           // 1. Hoa hồng (Indonesia)
  "Finger Heart": "car2",   // 2. Đỉnh (Việt Nam)
  "Love you": "car3",       // 3. Yêu bạn (Philippines)
  "Naughty": "car4",        // 4. Hiểu ý tôi chứ (Thái Lan)
  "Light Sword": "car5",    // 5. Kiếm Ánh Sáng (Malaysia)
  "TikTok": "car6",         // 6. Tiktok (Saudi Arabia)
  "Pop": "car7",            // 7. Pop (UAE)
  "Ice Cream": "car8",      // 8. Kem ốc quế (USA)
  "Heart Me": "car8",       // 8. Heart Me -> Gán cho USA
  "Popular Vote": "car8",   // 8. Popular Vote -> Gán cho USA
  "Music Note": "car9",     // 9. Nhạc tự do (Nhật Bản)
  "Vinyl Record": "car10",  // 10. Nhạc xưa (Hàn Quốc)
  "Glow Stick": "car11",    // 11. Que phát sáng (Mexico)
  "GG": "car12",            // 12. GG (Brazil)
  "Birthday Cake": "car13"  // 13. Bánh sinh nhật (UK)
  
  // LƯU Ý: Với quà số 5, 9, 10. Hãy nhìn Console khi có người tặng
  // xem nó hiện tên tiếng Anh là gì rồi sửa vào đây nhé!
};

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