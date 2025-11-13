# LEXIA Web App — Hướng Dẫn Sử Dụng (Frontend)

Phiên bản: Sprint 3 (Nov 2025)

---

## 👋 Giới thiệu

LEXIA là nền tảng học tiếng Anh thông minh cho người đi làm. Tài liệu này hướng dẫn người dùng cuối (end users) sử dụng ứng dụng web tại `http://localhost:3000` (môi trường dev) với thiết kế tối giản, dễ đọc và hỗ trợ dark mode.

- Trình duyệt hỗ trợ: Chrome, Edge, Firefox, Safari (phiên bản mới nhất)
- Thiết bị: Mobile (≥320px), Tablet (≥768px), Desktop (≥1024px)

---

## 🚀 Bắt đầu nhanh

1. Mở ứng dụng: `http://localhost:3000`
2. Nếu chưa có tài khoản, chọn "Register" để đăng ký
3. Đăng nhập và truy cập "Dashboard" để xem nội dung chính

Lưu ý bảo mật:

- Hệ thống dùng cookie httpOnly để quản lý phiên đăng nhập (an toàn trước XSS)
- Không cần (và không nên) dán token ở bất kỳ đâu

---

## 🔐 Đăng ký & Đăng nhập

### Đăng ký tài khoản

- Truy cập: `/register`
- Nhập Email, Mật khẩu, Xác nhận mật khẩu
- Mật khẩu cần tối thiểu 8 ký tự (gợi ý độ mạnh theo thời gian thực)
- Chấp nhận điều khoản sử dụng
- Nhấn "Create Account" → Chuyển đến Dashboard nếu thành công

Lỗi thường gặp khi đăng ký:

- Email đã tồn tại (409): "Email already registered. Please login."
- Dữ liệu không hợp lệ (422/400): Kiểm tra thông báo dưới từng ô nhập
- Mạng/Timeout: Hệ thống sẽ hiển thị thông báo và thử lại phù hợp

### Đăng nhập

- Truy cập: `/login`
- Nhập Email, Mật khẩu → "Sign In"
- Thành công → chuyển đến `/dashboard`
- Sai thông tin (401): Hiển thị "Invalid credentials" và giữ nguyên trang

Quên mật khẩu: sẽ được bổ sung trong sprint sau.

---

## 🧭 Điều hướng chính (Navigation)

- `Dashboard`: Trang tổng quan sau đăng nhập
- `Courses`: Danh sách khóa học và bộ lọc (theo CEFR)
- `Progress`: Tiến độ học tập, streak (sẽ mở rộng dần)
- `Profile`: Thông tin cá nhân, avatar, múi giờ, ngôn ngữ
- `Settings`: Tùy chọn giao diện, ngôn ngữ (kế hoạch mở rộng)

Gợi ý:

- Trên mobile, menu có thể thu gọn; dùng nút menu để mở/đóng
- Có hỗ trợ dark mode (theo hệ thống hoặc bật/tắt thủ công ở phần Header)

---

## 🏠 Dashboard

- Hiển thị lời chào, trạng thái đăng nhập và lối tắt đến mục quan trọng
- Sẽ bổ sung các thẻ thống kê (tiến độ, khóa học đã đăng ký, gợi ý lộ trình)
- Các vùng tải dữ liệu sẽ hiển thị skeleton/loading để tránh giật/nháy

---

## 📚 Khóa học (Courses)

- Duyệt danh sách khóa học theo cấp độ CEFR (A1→C2)
- Tìm kiếm/ lọc (khi được bật)
- Chọn một khóa học để xem chi tiết (sẽ bổ sung giao diện viewer bài học trong sprint kế tiếp)
- Đăng ký (Enroll) để thêm vào lộ trình học cá nhân (khi backend mở endpoint tương ứng)

---

## 📈 Tiến độ học (Progress)

- Xem tổng quan số bài đã hoàn thành, phần trăm tiến độ theo khóa
- Theo dõi streak học tập theo ngày (đang mở rộng)
- Các biểu đồ/heatmap sẽ được bổ sung ở sprint sau

---

## 👤 Hồ sơ cá nhân (Profile)

- Xem/ cập nhật: họ tên, bio, số điện thoại, múi giờ, ngôn ngữ giao diện
- Cập nhật avatar bằng URL (upload file sẽ bổ sung sau)
- Thay đổi được đồng bộ với backend theo thời gian thực

Lưu ý định dạng:

- Số điện thoại: `+84xxxxxxxxx` hoặc 10–20 chữ số
- Múi giờ: IANA (vd: `Asia/Ho_Chi_Minh`)
- Ngôn ngữ: ISO 639-1 (vd: `vi`, `en`)

---

## 🌙 Chế độ tối (Dark Mode)

- Tự động theo hệ thống
- Có thể bật/tắt thủ công trong Header → nút Theme Toggle
- Cài đặt được lưu trong trình duyệt (không yêu cầu đăng nhập lại)

---

## 🧰 Hành vi bảo mật & phiên đăng nhập

- Đăng nhập sử dụng cookie httpOnly (không hiển thị trong JS/DevTools Application → Local Storage)
- Ứng dụng kiểm tra phiên khi tải trang:
  - Trong lúc kiểm tra, hiển thị màn hình chờ (LoadingScreen) để tránh nháy nội dung
  - Nếu phiên hợp lệ → truy cập bình thường
  - Nếu không hợp lệ → chuyển về `/login`
- Các trang cần bảo vệ được kiểm tra cả phía server (middleware) và client (UX mượt mà)

---

## 🧩 Thông báo lỗi & trạng thái tải

Hệ thống hiển thị thông báo theo ngữ cảnh:

- Lỗi 401 (chưa đăng nhập/phiên hết hạn): chuyển về login, kèm thông báo phù hợp
- Lỗi mạng/timeout: hiện toast "No internet"/"Request timeout" và có thể tự thử lại ở các yêu cầu an toàn
- Lỗi 500+: hiển thị thông báo chung và ghi log client tối thiểu
- Trạng thái tải: dùng spinner/skeleton trên các vùng nội dung chính

---

## ♿ Trợ năng (Accessibility)

- Hỗ trợ điều hướng bằng bàn phím (Tab, Enter, Escape)
- ARIA labels cho các nút/biểu tượng quan trọng
- Tương phản màu đạt mức WCAG AA
- Focus ring rõ ràng khi dùng bàn phím

---

## ❓ Câu hỏi thường gặp (FAQ)

1. Tôi bị chuyển về trang đăng nhập dù vừa đăng nhập xong?

- Có thể phiên đã hết hạn hoặc cookie bị chặn bởi trình duyệt. Kiểm tra cài đặt cookie/Privacy và thử lại.

2. Tại sao tôi không thấy token ở Local Storage?

- LEXIA dùng cookie httpOnly để bảo mật, token không nằm ở Local Storage nhằm tránh XSS.

3. Tôi không thấy nút "Forgot Password" hoạt động?

- Tính năng này sẽ được bổ sung ở sprint tiếp theo; hiện thời là placeholder.

4. Vì sao giao diện khác nhau giữa mobile và desktop?

- Ứng dụng thiết kế responsive. Một số thành phần (sidebar, menu) thu gọn trên mobile để tối ưu không gian.

---

## 🔧 Khắc phục sự cố (Troubleshooting)

- Không đăng nhập được:

  - Kiểm tra email/mật khẩu
  - Kiểm tra kết nối mạng
  - Cho phép cookie cho `http://localhost:3000`
  - Backend phải chạy ở URL cấu hình (mặc định: `NEXT_PUBLIC_API_URL`)

- Trang trắng khi vừa vào app:

  - Đợi vài giây: ứng dụng đang kiểm tra phiên đăng nhập (màn hình chờ)
  - Nếu vẫn trắng, mở DevTools → Console để xem lỗi mạng

- Giao diện không đúng theme:
  - Dùng nút Theme Toggle trong Header
  - Làm mới trang sau khi đổi

---

## 🧪 Môi trường & yêu cầu (dành cho người dùng nội bộ/dev)

- Frontend dev: `http://localhost:3000`
- Backend dev: mặc định `http://localhost:8088/api/v1` (cấu hình qua `NEXT_PUBLIC_API_URL`)
- Cookie bắt buộc: bật cookies cho domain `localhost`

Chạy cục bộ (tham khảo nhanh):

```bash
# Trong thư mục lexia-web
npm install
# Cấu hình file .env.local (ví dụ)
# NEXT_PUBLIC_API_URL=http://localhost:8088/api/v1
npm run dev
```

---

## 📞 Hỗ trợ

- Email: support@lexia.com
- Tài liệu Backend API (tham khảo): `backend/docs/USER-GUIDE.md`
- Swagger (backend): `http://localhost:8088/swagger-ui.html`

---

## 🔄 Lịch sử cập nhật

- Sprint 3 (2025-11-12/13):
  - Hoàn thiện luồng đăng nhập/đăng ký với cookie httpOnly
  - Bổ sung middleware bảo vệ route và LoadingScreen chống nháy nội dung
  - Cải thiện thông báo lỗi và dark mode
