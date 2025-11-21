# LEXIA Web App — Hướng Dẫn Sử Dụng (Frontend)

Phiên bản: Sprint 3 (Nov 2025) - **Cập nhật hoàn tất**

---

## 👋 Giới thiệu

LEXIA là nền tảng học tiếng Anh thông minh cho người đi làm. Tài liệu này hướng dẫn người dùng cuối (end users) sử dụng ứng dụng web tại `http://localhost:3000` (môi trường dev).

**Giao diện mới (Version B):**

- Phong cách thiết kế hiện đại, tối giản (Medium-inspired).
- Tông màu chủ đạo: **Deep Blue** (Xanh đậm) & **Warm Yellow** (Vàng ấm).
- Hỗ trợ **Dark Mode** hoàn chỉnh.

- Trình duyệt hỗ trợ: Chrome, Edge, Firefox, Safari (phiên bản mới nhất)
- Thiết bị: Mobile (≥320px), Tablet (≥768px), Desktop (≥1024px)

---

## 🚀 Bắt đầu nhanh

1. Mở ứng dụng: `http://localhost:3000`
2. Nếu chưa có tài khoản, chọn "Register" để đăng ký
3. Đăng nhập và truy cập "Dashboard" để xem nội dung chính

---

## 🔐 Đăng ký & Đăng nhập

### Đăng ký tài khoản

- Truy cập: `/register`
- Nhập Email, Mật khẩu, Xác nhận mật khẩu
- **Mới:** Chỉ báo độ mạnh mật khẩu theo thời gian thực (Màu sắc trực quan).
- Chấp nhận điều khoản sử dụng
- Nhấn "Create Account" → Chuyển đến Dashboard nếu thành công

### Đăng nhập

- Truy cập: `/login`
- Nhập Email, Mật khẩu → "Sign In"
- Thành công → chuyển đến `/dashboard`
- Hệ thống tự động chuyển hướng nếu phiên đăng nhập hết hạn.

---

## 🧭 Điều hướng chính (Navigation)

- `Dashboard`: Tổng quan, thống kê và hoạt động gần đây.
- `Courses`: Thư viện khóa học, tìm kiếm và lọc.
- `Learning Paths`: Lộ trình học tập được đề xuất.
- `Progress`: Biểu đồ tiến độ và lịch sử streak.
- `Profile`: Hồ sơ cá nhân, avatar.
- `Settings`: Cài đặt hệ thống.

**Tính năng giao diện:**

- **Sidebar (Desktop):** Có thể thu gọn để mở rộng không gian học.
- **Mobile Menu:** Menu trượt mượt mà, hỗ trợ vuốt (swipe) để đóng/mở.
- **Theme Toggle:** Chuyển đổi chế độ Sáng/Tối/Hệ thống ngay trên Header.

---

## 🏠 Dashboard

Trang tổng quan hiển thị đầy đủ thông tin:

- **Thẻ thống kê (Stats Cards):**
  - Số khóa học đang tham gia.
  - Số bài học đã hoàn thành.
  - Tổng giờ học.
  - **Current Streak:** Chuỗi ngày học liên tiếp (có biểu tượng lửa 🔥).
- **Hoạt động gần đây (Recent Activity):** Danh sách các khóa học vừa truy cập để học tiếp nhanh chóng.
- **Biểu đồ nhanh:** Tổng quan tiến độ tuần này.

---

## 📚 Khóa học (Courses) & Bài học

### Danh sách khóa học

- **Tìm kiếm:** Tìm theo tên khóa học (kết quả hiển thị ngay).
- **Bộ lọc:** Lọc theo trình độ CEFR (A1 - C2).
- **Sắp xếp:** Mới nhất, Phổ biến nhất, v.v.
- **Chế độ xem:** Dạng Lưới (Grid) hoặc Danh sách (List).

### Chi tiết & Học tập

- Xem cấu trúc khóa học, danh sách bài học.
- **Đăng ký (Enroll):** Tham gia khóa học với một cú nhấp chuột.
- **Lesson Viewer (Giao diện học):**
  - Giao diện tập trung, không xao nhãng.
  - Điều hướng bài học (Trước/Sau) dễ dàng.
  - Đánh dấu hoàn thành bài học.

---

## 📈 Tiến độ học (Progress)

Trang theo dõi chi tiết hiệu suất học tập:

- **Biểu đồ vùng (Area Chart):** Trực quan hóa hoạt động học tập theo thời gian.
- **Streak Heatmap:** Biểu đồ nhiệt (giống GitHub) hiển thị cường độ học tập trong năm.
- **Thống kê chi tiết:** Tổng điểm, xếp hạng (sắp ra mắt).

---

## 👤 Hồ sơ cá nhân (Profile)

Quản lý thông tin cá nhân toàn diện:

- **Avatar:** Tải ảnh đại diện lên từ máy tính (Hỗ trợ xem trước, cắt ảnh).
- **Thông tin:** Cập nhật Họ tên, Bio, Số điện thoại.
- **Học tập:** Cập nhật Trình độ hiện tại và Mục tiêu học tập.

---

## ⚙️ Cài đặt (Settings)

Tùy chỉnh trải nghiệm ứng dụng:

- **Giao diện:** Chọn theme Light, Dark hoặc theo hệ thống.
- **Ngôn ngữ:** Chọn ngôn ngữ hiển thị (Tiếng Việt, English, v.v.).
- **Múi giờ:** Cài đặt múi giờ để nhận thông báo đúng lúc.
- **Thông báo:** Bật/tắt thông báo Email, Nhắc nhở học tập, Báo cáo tuần.

---

## 🧰 Hành vi bảo mật & Phiên đăng nhập

- **Token Management:** Hiện tại sử dụng `localStorage` kết hợp với cơ chế bảo mật phía client. (Sẽ nâng cấp lên httpOnly cookies trong các bản cập nhật tới).
- **Loading States:** Hệ thống hiển thị Skeleton hoặc Spinner khi tải dữ liệu, tránh giật trang.
- **Error Handling:** Thông báo lỗi thân thiện (Toast notification) khi mất mạng hoặc lỗi server.

---

## ♿ Trợ năng (Accessibility)

Đạt chuẩn **WCAG AA**:

- Hỗ trợ điều hướng hoàn toàn bằng bàn phím (Tab, Enter, Esc).
- Tương phản màu sắc tối ưu cho người khiếm thị.
- Hỗ trợ trình đọc màn hình (Screen Reader) với đầy đủ ARIA labels.
- Form có thông báo lỗi rõ ràng, liên kết với ô nhập liệu.

---

## ❓ Câu hỏi thường gặp (FAQ)

1. **Tôi có thể đổi Avatar không?**

   - Có, bạn có thể tải ảnh lên tại trang Profile.

2. **Làm sao để bật chế độ tối (Dark Mode)?**

   - Nhấn vào biểu tượng Mặt trăng/Mặt trời ở góc trên bên phải màn hình.

3. **Tôi quên mật khẩu thì sao?**

   - Tính năng "Quên mật khẩu" đang được phát triển và sẽ ra mắt sớm.

4. **Tại sao tôi thấy token trong Local Storage?**
   - Trong phiên bản hiện tại, chúng tôi lưu token tại Local Storage để đảm bảo trải nghiệm mượt mà nhất. Cơ chế bảo mật nâng cao sẽ được cập nhật sau.

---

## 🔧 Khắc phục sự cố (Troubleshooting)

- **Không đăng nhập được:**

  - Kiểm tra email/mật khẩu.
  - Kiểm tra kết nối mạng.
  - Đảm bảo Backend đang chạy.

- **Giao diện bị vỡ hoặc không đúng theme:**
  - Thử tải lại trang (F5).
  - Xóa cache trình duyệt nếu cần thiết.

---

## 🔄 Lịch sử cập nhật

- **Sprint 3 (Nov 2025) - Hoàn tất:**
  - **UI/UX:** Refactor toàn bộ theo Design System mới (Blue/Yellow).
  - **Tính năng:** Dashboard thống kê, Tìm kiếm khóa học, Lesson Viewer, Upload Avatar, Settings.
  - **Kỹ thuật:** Tối ưu hiệu năng, Accessibility (WCAG AA), Unit Tests.
