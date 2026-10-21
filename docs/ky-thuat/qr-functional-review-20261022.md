# Rà soát chức năng thẻ QR – 22/10/2026

Phạm vi: kho QR, nhập Word, trình soạn, chuẩn bị tiết, điều khiển, màn chiếu, quét, in thẻ và điều hướng liên quan. Thử trên dữ liệu giả lập trong trình duyệt, dùng các dịch vụ thật của ứng dụng ở chế độ local; không gửi bài, đổi điểm hay xóa bộ đề production để thử.

| Nhóm | Luồng đã kiểm tra |
| --- | --- |
| Kho QR | Mở/tạo/sửa, lỗi tải và thử lại đúng kho, xóa có xác nhận, giữ lại, đọc bộ cũ thiếu thời gian cập nhật |
| Word | Tải mẫu thực tế, file sai bị chặn, xem lại 10 câu, tạo bộ mới, ảnh nhúng/video, giữ bộ cũ |
| Trình soạn | Nội dung/metadata, 2–4 lựa chọn, chọn đúng bằng chuột/phím, đổi số lựa chọn, thêm/nhân đôi/đổi thứ tự/xóa-hủy, ảnh/video/xem trước, điểm/giải thích, lưu-mở lại |
| Dữ liệu chưa lưu | Chuyển mục rồi khôi phục, bỏ bản nháp, lưu lỗi rồi thử lại, xóa nháp sau khi lưu; tách tài khoản/bộ, dữ liệu hỏng/quá lớn và storage không khả dụng |
| Chuẩn bị tiết | Lớp rỗng, bộ rỗng, lọc môn, chọn/bỏ/tất cả câu, tổng điểm, trộn không đổi A–D, khởi tạo đúng câu đã chọn |
| Điều khiển | Phát/đóng/chấm/chuyển câu, khóa kết thúc khi chưa chấm, hủy/xác nhận kết thúc, đường dẫn báo cáo đúng phòng, danh sách đáp án học sinh |
| Màn chiếu | Tràn màn hình, toàn màn hình vào/thoát/lỗi bị từ chối, nội dung/kết quả cập nhật, không lộ đáp án trước công bố, về điều khiển |
| Camera | Bốn hướng xoay, ba thẻ cùng khung, xem lại/gửi, giữ đáp án đầu tiên, dừng/đóng/từ chối quyền; hủy lúc chờ quyền, stream trả về muộn được đóng, lỗi cũ không tắt camera mới |
| Thẻ/điều hướng | In A4/lưu PDF theo danh sách, đăng nhập trả về đúng màn quét, menu ẩn/mở/chọn/ESC, màn hình 320–1920px |

Các sửa chữa: bổ sung khôi phục nháp local và khóa lưu lặp; sửa vòng đời camera khi còn chờ quyền; bỏ dữ liệu phòng cũ khi đổi ID; thử tải lại đúng kho; giữ giao diện hoạt động với bộ cũ thiếu ngày cập nhật/số câu. Không đổi cách tính điểm, định dạng ngân hàng hay quy tắc phân quyền.

Kiểm tra mã: build TypeScript/Vite, lint, `check-qr-bank` (gồm nháp), `check-qr-cards`, `check-qr-word`. Các kiểm tra rules/scoring trên Firestore Emulator được chạy tiếp trong quy trình triển khai production.

Giới hạn: camera được thử bằng luồng hình mô phỏng từ QR in thực tế; chưa dùng điện thoại/máy chiếu vật lý trong môi trường này. Kiểm tra quyền đăng nhập dùng tài khoản giả lập; liên kết báo cáo được đối chiếu với route và ID, không thao tác báo cáo thật của học sinh.
