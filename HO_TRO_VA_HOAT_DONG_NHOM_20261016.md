# Hỗ trợ trong giờ học và hoạt động nhóm

## Tín hiệu học tập

- Học sinh đã vào phòng có ba nút: đã hiểu, còn phân vân, cần thầy/cô giúp. Tín hiệu chỉ hiện với chính em và giáo viên, không tính điểm.
- Giáo viên xem **Nhịp học của lớp** ngay trong phòng học hoặc trong bảng điều khiển bài giảng, xem các em đang chờ và bấm **Đã hỗ trợ**.
- Học sinh có thể báo lại sau khi đã được ghi nhận. Mỗi yêu cầu có mã riêng; thao tác xử lý yêu cầu cũ không được xóa nhầm yêu cầu mới vừa gửi.
- Giữ một tín hiệu gần nhất cho mỗi em trong buổi học. Chỉ ghi khi bấm đổi tín hiệu; đăng ký dữ liệu giáo viên dùng chung giữa các bảng điều khiển. Phòng đã kết thúc không nhận tín hiệu mới.

## Giao nhiệm vụ nhóm

1. Mở **HOẠT ĐỘNG LỚP HỌC → Hoạt động nhóm**.
2. Chọn từ 1–10 nhóm, không vượt số học sinh đã vào phòng; chia ngẫu nhiên rồi điều chỉnh từng thành viên và đại diện. Có thể giao cho một phần lớp; các em chưa được xếp sẽ thấy thông báo chờ giáo viên.
3. Nhập nhiệm vụ chung, chọn thời gian từ 1–60 phút hoặc 0 để tự khóa. Kiểm tra nhóm rồi phát. Nhóm và đại diện được chốt cho nhiệm vụ đó; muốn thay đổi thì phát nhiệm vụ mới. Hoạt động trước được khóa và bài cũ giữ nguyên.
4. Đại diện nhập và nộp một bài sau khi nhóm thảo luận. Thành viên khác xem bài chung sau khi nộp, không cùng sửa bản nháp và không tự nộp thay đại diện.
5. Giáo viên xem tiến độ theo nhóm, chọn chiếu ẩn tên đại diện mặc định, chữa bài và trả nhận xét. Nhận xét đã trả và đường dẫn bài cũ gửi tới từng thành viên; nhóm khác không đọc được bài hoặc nhận xét này.
6. Đồng hồ chạy trên thiết bị, không ghi Firestore mỗi giây. Khi hết giờ, ô nhập được khóa và phía máy chủ cũng từ chối bài mới. Bản nháp được giữ để học sinh không mất nội dung; không tự nộp thay nhóm.

## Phạm vi và quyền riêng tư

- Nhóm chốt theo các em và phiên đăng nhập đã vào phòng lúc phát nhiệm vụ. Nếu thành viên đổi sang thiết bị/phiên khác trong lúc làm nhóm, giáo viên có thể phát lại nhiệm vụ để chốt lại quyền nhóm. Phiên cũ bị đổi liên kết không tiếp tục đọc bài chung hoặc nhận xét của nhóm.
- Chỉ thành viên đúng nhóm đọc được tài liệu nộp chung và nhận xét đã trả. Nhận xét nháp vẫn chỉ dành cho giáo viên. Học sinh không liệt kê bài cả lớp, không sửa nhóm, không sửa bài đã nộp, không tự đổi tín hiệu của bạn hay ghi nhận hỗ trợ thay giáo viên.
- Phiếu Word, bảng con, vé ra cửa, tự luyện, đề thi và điểm cũ được giữ nguyên. Không chuyển đổi dữ liệu hiện có. Trường nhóm/thời gian chỉ có trên hoạt động mới.

## Xác minh

`check-activities.mjs` kiểm tra phân nhóm, thành viên/đại diện, quyền nhóm, nộp lặp, nhận xét gửi đủ thành viên, chặn nộp muộn, tín hiệu trùng và xử lý yêu cầu cũ. `check-self-practice-rules.cjs` bổ sung kiểm tra Firebase Emulator cho tín hiệu riêng tư, đại diện nộp, đọc đúng nhóm, không xem nháp, liên kết phiên, bất biến nhóm/thời gian và chặn phía máy chủ khi hết giờ/kết thúc phòng. Kiểm tra trình duyệt dùng nhiều vai trò ở máy tính và điện thoại; kiểm tra lại bảng con/vé ra cửa và phiếu Word.
