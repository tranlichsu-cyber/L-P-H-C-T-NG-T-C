# Bảng điều khiển tiết học

Bảng mở mặc định trong phòng điều khiển của giáo viên. Tab Tổng quan cũ vẫn giữ các thống kê đáp án chi tiết.

- Hiển thị trạng thái phòng và mã tham gia; số đã tham gia, sĩ số theo danh sách lớp, tiến độ nộp bài và số phiếu chờ trả.
- Đã tham gia là các em đã vào phòng, không phải trạng thái trực tuyến. Danh sách chưa tham gia đối chiếu danh sách lớp với người đã vào phòng; nếu không có danh sách sẽ thông báo rõ.
- Ưu tiên hoạt động đang phát trên thiết bị học sinh: phiếu Word, bảng con, vé ra cửa hoặc nhóm. Có thanh tiến độ, tên chưa nộp, đồng hồ nhóm, khóa nhận bài, chiếu đề, sang phần trả bài hoặc thu để trở lại câu hỏi. Bài đã nộp được giữ nguyên khi thu.
- Khi không phát hoạt động, hiện câu hỏi hiện tại và các nút phát, đóng, hiện đáp án, câu tiếp theo theo trạng thái sẵn có. Không chuyển tiếp quá câu cuối, không thao tác câu hỏi sau khi kết thúc phòng.
- Nhịp học của lớp và nút ghi nhận hỗ trợ riêng tư tích hợp trực tiếp bên cạnh tiến độ; không nhân đôi bảng tín hiệu trên tab này.
- Lối tắt giao bài, chọn câu hỏi, gọi học sinh, máy chiếu, bảng điểm. Nút kết thúc vẫn mở hộp xác nhận hiện có; không kết thúc ngay khi bấm lối tắt.
- Tái sử dụng các đăng ký dùng chung của phiếu/tín hiệu; chỉ theo dõi bài của hoạt động hiện tại, không tải toàn bộ lịch sử hoặc nhận xét từng em. Đồng hồ không ghi Firestore mỗi giây. Không thay đổi dữ liệu hoặc quy tắc bảo mật.

Kiểm thử trình duyệt ở 1280px và 390px: đối chiếu sĩ số, điều hướng lối tắt, đại diện nhóm nộp bài và cập nhật 50%, hỗ trợ riêng tư, chọn chiếu đề, khóa/thu bài, trở lại câu hỏi, khóa thao tác khi tiết học kết thúc và không tràn ngang. Build TypeScript/Vite, lint và kiểm tra dịch vụ phiếu/đọc dữ liệu trước khi triển khai.
