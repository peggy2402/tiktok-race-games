# 🏎️ TikTok Live Race Game (Đua Xe Tương Tác TikTok)

Một minigame đua xe tương tác trực tiếp dành cho các Streamer trên nền tảng **TikTok Live**. Khán giả của bạn có thể trực tiếp tham gia vào cuộc đua bằng cách gửi các món quà (Gifts) để giúp phương tiện/quốc gia mà họ yêu thích tăng tốc độ và giành chiến thắng!

---

## ✨ Tính Năng Nổi Bật

- 🎮 **Tương tác Thời Gian Thực**: Tự động nhận diện quà tặng từ khán giả và đẩy phương tiện tiến về phía trước theo đúng giá trị Xu (Diamonds) của món quà.
- 🏁 **Vòng Lặp Vô Tận & Tính Lượt Win**: Phương tiện chạm vạch đích sẽ tự động quay lại vạch xuất phát, hiệu ứng pháo hoa nổ ra và cộng thêm **1W** (1 lần Win) trên bục vinh quang.
- 🎁 **Rớt Vật Phẩm Ngẫu Nhiên**: Thỉnh thoảng đường đua sẽ xuất hiện trái cây/vật phẩm ngẫu nhiên. Phương tiện đi ngang qua sẽ "ăn" và nhận được điểm thưởng.
- 🏆 **Bục Vinh Quang (Podium)**: Tự động sắp xếp vị trí Top 1, Top 2, Top 3 theo hàng ngang với thiết kế siêu đẹp, hiển thị trực quan ai đang dẫn đầu.
- 🎨 **Hiệu Ứng Hình Ảnh Đỉnh Cao**:
  - Chữ nổi `+X` điểm và Tên TikTok của người tặng quà bay lơ lửng trên xe.
  - Hiệu ứng Neon xanh dương bao quanh phương tiện.
  - Khói xe xả ra mượt mà phía sau đuôi.
  - Hiệu ứng nổ sáng bừng (Sang - xịn - mịn) khi ăn vật phẩm.
- 🎵 **Hệ Thống Âm Thanh Đa Dạng**:
  - Giọng nói đếm ngược: `3 - 2 - 1 - GO!`.
  - Nhạc nền (BGM) xập xình.
  - Nhạc nổ pháo hoa chiến thắng.
  - Tiếng nhận quà chớp nhoáng (Biu biu) và Tiếng ăn vật phẩm (Pọc pọc) có thể phát đè lên nhau không bị đứt quãng.
- ⚙️ **Bảng Điều Khiển Web Tiện Lợi**: Giao diện Settings cho phép đổi Tên kênh TikTok Live, bật/tắt các loại hiệu ứng, thay đổi nhạc và cấu hình toàn bộ 10 xe trực tiếp mà không cần sửa Code.

---

## ⚙️ Yêu Cầu Hệ Thống

1. Máy tính đã cài đặt Node.js.
2. Phần mềm OBS Studio (hoặc các phần mềm Livestream tương tự hỗ trợ Browser Source).
3. _Khuyến nghị:_ Cần có API Key từ EulerStream (điền vào tệp `.env`) để tránh bị Rate Limit khi kết nối TikTok quá nhiều lần.

---

## 🚀 Hướng Dẫn Cài Đặt

1. Mở Terminal (PowerShell / Command Prompt) tại thư mục chứa mã nguồn (`c:\hoctap\tiktok-race-games`).
2. Chạy lệnh sau để cài đặt tất cả các thư viện cần thiết:
   ```bash
   npm install
   ```
3. Tạo một file `.env` ở thư mục gốc (nếu chưa có) và thiết lập các biến môi trường:
   ```env
   EULER_API_KEY=YOUR_API_KEY_HERE
   ```
4. Khởi động Máy chủ (Server):
   ```bash
   npm start
   # Hoặc nếu bạn có dùng nodemon:
   nodemon server.js
   ```
   _Nếu Terminal báo `Server running on port 3001`, tức là bạn đã khởi chạy thành công!_

---

## 🎮 Hướng Dẫn Sử Dụng

Hệ thống bao gồm 2 phần chính: **Bảng Cài Đặt** dành cho Streamer quản lý và **Màn Hình Game** để đưa lên Livestream.

### 1. Bảng Cài Đặt (Settings)

- Mở trình duyệt web và truy cập địa chỉ: http://localhost:3001/settings.html
- **Bước quan trọng nhất**: Ở mục `Cấu Hình Chung`, hãy điền chính xác **TikTok Username** của kênh đang phát Live (ví dụ: `muatet2026`).
- Tùy chỉnh các loại nhạc (BGM, Chiến thắng, Quà, Ăn vật phẩm), điểm thưởng và Kích thước phương tiện theo ý thích.
- Ở phía dưới, bạn có thể chỉnh sửa tự do Tên Quốc gia, Link hình Cờ, Link hình xe chạy và Link hình ảnh đại diện cho Quà.
- Nhấn **💾 Lưu Cài Đặt** (OBS sẽ tự động tải lại màn hình hiển thị ngay lập tức mà không cần bạn làm gì thêm).
- Nút **🔄 Reset Điểm Số** dùng để đưa tất cả các xe về 0 Vòng Win và dọn dẹp lại đường đua.

### 2. Đưa Game Lên OBS Studio (Màn hình 9:16)

1. Mở phần mềm OBS Studio.
2. Tạo một Nguồn mới: Chọn `Browser` (Trình duyệt).
3. Điền các thông số sau:
   - **URL:** `http://localhost:3001/overlay.html`
   - **Width (Chiều rộng):** `1080`
   - **Height (Chiều cao):** `1920`
   - **Tích chọn ô:** `Control audio via OBS` (Để bạn có thể kéo thanh âm lượng to nhỏ của Game ngay trên OBS).
4. Nhấn OK! Giao diện lúc này sẽ lập tức đếm ngược và bắt đầu cuộc đua dọc theo màn hình Livestream.

---

## 📂 Cách Thay Đổi Âm Thanh Bằng Nhạc Trong Máy

Bạn có một bài nhạc nền siêu đỉnh dạng đuôi `.mp3` trong máy và muốn phát nó trong Game? Rất đơn giản!

1. Copy file bài hát đó (Ví dụ: `nhac-sieu-chay.mp3`).
2. Dán file đó thẳng vào trong thư mục `overlay` (`c:\hoctap\tiktok-race-games\overlay\`).
3. Mở **Bảng Cài Đặt (Settings)** trên web.
4. Ở ô `Nhạc Nền BGM`, thay vì dán link mạng dài ngoằng, bạn chỉ cần gõ tên tệp: `nhac-sieu-chay.mp3` rồi bấm Lưu. Xong! Bạn có thể làm tương tự cho tiếng tặng quà, tiếng chiến thắng...

---

🎉 **Chúc bạn có những buổi Livestream bùng nổ, rực rỡ và thu về thật nhiều hoa hồng!**
