# Thiết kế xác định học sinh trong Tự luyện lớp 4

## Phạm vi
Thêm bước **chọn lớp → chọn tên → xác nhận** trước khi làm bài Tập làm văn lớp 4. Dùng ID học sinh và ID lớp ổn định, không dùng tên làm khóa. Danh sách lấy từ dữ liệu lớp hiện có, không tạo lớp/học sinh mẫu trên production.

## Phát hiện khi kiểm tra mã nguồn
- `/tu-luyen` hiện không cần đăng nhập; `SelfPracticePage.tsx` không có bước chọn lớp/tên.
- `StudentSessionContext.selectStudent` lưu ID/tên trong localStorage nhưng chỉ là lựa chọn ở phía trình duyệt, **không phải xác thực**.
- `firestore.rules` hiện chỉ cho giáo viên đọc `classes/{classId}` và `classes/{classId}/students/{studentId}`. Không thể dùng trực tiếp từ trang công khai để tải danh sách.
- `SelfPracticeService` chỉ quản lý bộ đề công khai; chưa có nơi lưu bài Tập làm văn theo học sinh.

## Yêu cầu bắt buộc khi lập trình
1. Chỉ hiển thị các lớp 4 đang hoạt động và tên học sinh thuộc lớp tương ứng. Không để lộ dữ liệu cá nhân khác ngoài tên cần thiết.
2. Tách **chọn danh tính hiển thị** khỏi **xác minh quyền ghi**. Có thể xác nhận bằng mã cá nhân do giáo viên cấp hoặc liên kết tài khoản học sinh. Không cho người dùng ghi vào hồ sơ học sinh khác chỉ vì chọn được tên.
3. Dùng Firebase Authentication và Firestore Security Rules để ràng buộc authUid ↔ classId/studentId trước khi lưu bài; giáo viên được phân quyền đọc bài lớp mình, quản trị được đọc theo chính sách trường.
4. Chỉ lưu bài khi xác thực và quy tắc cho phép. Báo lỗi rõ khi chưa được xác minh; không thông báo 'đã lưu Firebase' nếu chỉ lưu localStorage.
5. Lưu bản nháp và bài nộp với `classId`, `studentId`, `week`, `outline`, `writing`, `status`, `updatedAt`, `submittedAt`; không xóa dữ liệu cũ.
6. Giáo viên có bảng lọc lớp, tuần, tên, trạng thái và vùng nhận xét. Học sinh chỉ xem được bài của mình.
7. Kiểm thử trường hợp chọn trùng tên, đổi lớp, học sinh bị chuyển lớp, hai thiết bị, mạng chập chờn, học sinh khác cố xem/sửa bài, giáo viên khác lớp.

## Tiêu chí nghiệm thu
- Chọn lớp chỉ hiện học sinh của lớp đó.
- Chọn tên chưa đủ để giả danh người khác; chỉ khi xác minh hợp lệ mới cho lưu Firebase.
- Nộp bài xong mới mở “Xem bài gợi ý”.
- Giáo viên có thể xem bài từng học sinh thuộc lớp được phân quyền.
- Không tác động đến phòng học tương tác, danh sách lớp hiện tại, dữ liệu Firestore cũ.

**Trạng thái:** tài liệu kỹ thuật; chưa triển khai giao diện, xác thực hoặc quy tắc Firestore. Không merge lên main/production cho đến khi hoàn thành và kiểm thử.
