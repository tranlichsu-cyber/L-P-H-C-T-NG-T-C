# Giảm lượt đọc dữ liệu — 15/10/2026

- Chỉ tải dữ liệu lớp, học sinh, bộ câu hỏi khi vào màn hình giáo viên. Các trang công khai, học sinh và quản trị không kích hoạt thêm bộ dữ liệu của TeacherDataProvider.
- Giáo viên truy vấn lớp mình phụ trách và bộ câu hỏi thuộc quyền sử dụng thay vì đọc toàn bộ rồi lọc. Quản trị vẫn xem toàn trường. Truy vấn OR gộp tài liệu trùng; khi thiếu chỉ mục mới chuyển sang các truy vấn riêng, không thử lại lỗi hạn mức hoặc quyền truy cập.
- Danh sách tự luyện lưu trong bộ nhớ 2 phút, gộp yêu cầu đồng thời, xóa khi thay đổi tài khoản hoặc xuất bản/xóa bài. Nút Tải lại đọc lại máy chủ. Không lưu dữ liệu riêng tư xuống ổ đĩa.
- Bỏ lần đọc cài đặt riêng trước đăng ký cập nhật trực tiếp; dùng cấu hình cục bộ ban đầu, sau đó nhận bản cập nhật từ máy chủ.
- Các màn hình cùng xem một phòng hoặc phiếu Word dùng chung đăng ký cập nhật theo tài khoản/phòng/phiếu/học sinh. Đóng màn hình cuối cùng sẽ hủy đăng ký; nhận xét riêng vẫn giữ phạm vi truy cập hiện có.

Kiểm chứng: build, lint, scripts/check-read-efficiency.mjs (bộ nhớ đệm, đổi tài khoản, cập nhật, lỗi, truy vấn có phạm vi, không thử lại lỗi quota), kiểm thử trình duyệt TeacherDataProvider với Firestore giả lập và luồng phiếu Word. CI chạy các kiểm tra bảo mật Firestore trước triển khai.

Không công bố tỷ lệ giảm khi chưa có số đo thực tế. Tối ưu không đặt lại hạn mức Firestore đã hết; kiểm tra ngân hàng bài thực tế vẫn phụ thuộc dịch vụ hoạt động trở lại. SDK có thể đã gộp một số đăng ký giống nhau; lợi ích tiết kiệm chính đến từ tránh tải trên màn hình không cần, truy vấn có phạm vi và sử dụng lại kết quả đọc.
