# Hẻm Nhà Living — 3D Architecture & Interior Model

> Mô hình kiến trúc & không gian nội thất 3D tương tác của công trình **Hẻm Nhà Living** (Boutique Homestay, Monthly Living & Cafe). Được lấy cảm hứng từ ngôn ngữ thị giác của [thorny-sprout](https://thorny-sprout-ynn9.here.now/) và kiến trúc thực tế từ [hem-nha-living.vercel.app](https://hem-nha-living.vercel.app/).

---

## ✨ Điểm nổi bật (Features)

- **🏛️ Khối kiến trúc 5 tầng đặc trưng:**
  - **Tầng 1 (Trệt):** Cổng vòm cong màu xanh xám (sage green), tường rào gạch bông gió trắng, biển hiệu đèn neon *"COFFEE Hẻm"*, chậu hoa giấy hồng, xe máy retro và cột đèn hẻm cổ điển.
  - **Tầng lửng:** Hệ lam chắn nắng thanh mảnh đón gió tự nhiên.
  - **Tầng 3 & 4 (Homestay & Living Studios):** Ban công khoét vòm sâu, cửa sổ viên thuốc (capsule pill windows), lan can nan gỗ dọc và bồn hoa ban công xanh mát.
  - **Tầng 5 (Rooftop Sky Terrace):** Giàn pergola khung thép đen, mái che mờ đón sáng, sàn gỗ ấm, bàn bida lỗ nỉ xanh, bàn bi lắc (foosball), quầy bar ngắm thành phố và dây đèn trang trí (festoon lights).

- **✨ Không gian Nội thất & Trải nghiệm Hẻm (Interiors):**
  - **☕ Quán Cafe & Bar Lounge:** Quầy bar gỗ óc chó với dải LED hắt chân ấm 2700K, tường gạch men đỏ bóng, máy pha espresso inox, bàn dài cộng đồng chân chữ X, kệ sách thư viện kịch trần và góc ghế bành đọc sách.
  - **🌿 Giếng trời thông tầng Atrium:** Thông tầng 2 tầng lầu đón ánh sáng tự nhiên thẳng đứng, sàn gạch terracotta ấm cúng, bục gỗ teak với cây xanh sống vươn cao, ban công uốn cong thanh lịch với lan can đỏ rượu burgundy.
  - **🛏️ Phòng Homestay Studio:** Giường bục gỗ sồi nâng cao 2 bậc thang uốn cong, bàn làm việc đèn nấm vintage, tường nhấn cam đào đất nung với bộ đôi tranh canvas tròn và cửa vòm kính ban công rèm voan.
  - **🛵 Trải nghiệm trong Hẻm phố:** Góc nhìn tầm mắt người đi bộ (1.6m) giữa hẻm với đường lát đá cuội bazan, bảng đen phấn menu trước quán, xe máy retro và giàn hoa giấy.

- **🌅 4 Khoảnh khắc ánh sáng trong ngày:** Sớm Mai (6:30 AM), Trưa Hè (12:00 PM), Hoàng Hôn (5:30 PM), Đêm Sao (8:30 PM) với ánh sáng bên ngoài và hệ thống đèn nội thất đồng bộ.
- **🏛️ Chế độ Sa bàn (Clay Mode):** Biến toàn bộ công trình thành mô hình thạch cao trắng kiến trúc đơn sắc.
- **🎮 Điều khiển tương tác linh hoạt:** Tự động xoay quanh tâm (Auto-rotate), chuyển đổi góc nhìn theo tab phân loại, thẻ Metadata cập nhật động thông số phòng, kéo chuột xoay/pan/zoom tự do.

---

## 🚀 Chạy dự án (Quick Start)

Dự án sử dụng thuần Vanilla JavaScript (ES Modules) và Three.js, không yêu cầu bước build phức tạp:

```bash
# 1. Clone repository
git clone git@github.com:vhm205/hem-nha-living-3d.git
cd hem-nha-living-3d

# 2. Khởi chạy máy chủ HTTP tĩnh (ví dụ dùng Python)
python3 -m http.server 8080

# Hoặc dùng npx serve
# npx serve -p 8080

# 3. Mở trình duyệt và truy cập
# http://localhost:8080
```

---

## 📂 Cấu trúc thư mục

```
hemhome-3D/
├── index.html            # Cấu trúc giao diện HTML, UI controls & metadata card
├── styles.css            # Giao diện Glassmorphism, Responsive design & Dark mode
├── main.js               # Khởi tạo Three.js scene, camera presets, controls & lighting
├── interiors.js          # Module dựng nội thất chi tiết, procedural canvas textures
├── vendor/               # Thư viện Three.js core & OrbitControls (chạy offline độc lập)
├── ref_images/           # Ảnh tư liệu tham khảo thực tế từ Hẻm Nhà Living
└── README.md             # Tài liệu giới thiệu và hướng dẫn dự án
```

---

## 🛠️ Công nghệ sử dụng

- **Three.js (r128)** — 3D WebGL Engine
- **HTML5 Canvas Procedural Textures** — Tạo vân gạch men đỏ, sàn gỗ sồi, gạch lát sàn cafe và tranh nghệ thuật bằng code không phụ thuộc tài nguyên ngoài
- **CSS3 Glassmorphism** — Giao diện mờ hiện đại lấy cảm hứng từ Apple & thorny-sprout
- **Vanilla ES Modules** — Module hóa mã nguồn sạch sẽ, không phụ thuộc bundler
