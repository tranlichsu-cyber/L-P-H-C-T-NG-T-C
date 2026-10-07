# CHANGELOG - LỚP HỌC TƯƠNG TÁC

## [1.1.0] - 2026-10-07 (Phiên Bản Cải Tiến Phản Hồi Thực Tế)

### Added & Improved (Cải tiến chính)
- **Quick Lesson Mode (Bắt đầu nhanh)**: Ghi nhớ Lớp & Bộ câu hỏi gần nhất trên Bảng điều khiển Giáo viên, hỗ trợ 1-click khởi tạo phòng học tức thì.
- **Student Device Memory (Gợi ý học sinh trên thiết bị)**: Tự động ghi nhớ tên học sinh trên thiết bị cá nhân với gợi ý *"Có phải em là [Tên]?"* và nút đổi tên linh hoạt.
- **Name Conflict Detection**: Cảnh báo khi một tên học sinh đang được mở đồng thời trên một thiết bị khác trong phòng.
- **Report Action Shortcuts**: Tích hợp các nút thao tác trực tiếp trên trang Thống kê Cấp trường (Tạo bài củng cố, Tạo bộ đề mới, Xuất Excel CSV).
- **Phím tắt Bàn phím & Tối ưu Nút 1-Tap**: Rút gọn số bước nộp bài và khóa phím bấm sau 1-tap chống gửi trùng lặp.
- **PWA Service Worker Cache v1.1.0**: Cập nhật phiên bản cache PWA an toàn, hiển thị thông báo cập nhật không làm gián đoạn tiết dạy.

---

## [1.0.0] - 2026-10-07 (Chính Thức Triển Khai)

### Added
- **Multi-Teacher School Administration**: Quản lý trường, phân quyền vai trò (Admin, Tổ trưởng, Giáo viên), gán Tổ chuyên môn & duyệt gia nhập.
- **Last Admin Protection**: Bảo vệ tài khoản Admin cuối cùng khỏi việc hạ quyền hoặc khóa nhầm.
- **PWA Integration**: Cài đặt ứng dụng trực tiếp trên màn hình chính (Tablet/Desktop/Mobile), chạy offline app shell với Service Worker.
- **Quiz Visibility Scopes**: Phân cấp chia sẻ bộ câu hỏi (Cá nhân, Nội bộ Tổ, Toàn trường) kèm tính năng "Sao chép vào ngân hàng của tôi".
- **Backup & Export**: Xuất dữ liệu trường dạng JSON (Basic/Full) và xuất danh sách/báo cáo dạng CSV/Excel client-side.
- **AI Teacher Assistant**: Tạo câu hỏi từ chủ đề, văn bản, tài liệu và gợi ý bài tập củng cố.
- **Realtime Live Room & Gamification**: Phát câu hỏi trực tiếp, bảng điểm, quay số gọi tên ngẫu nhiên, trò chơi tương tác realtime.
