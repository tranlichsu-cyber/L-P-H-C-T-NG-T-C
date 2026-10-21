# Trả lời câu hỏi Live bằng thẻ QR

Trong cổng giáo viên, chọn mục riêng **Trả lời bằng thẻ QR** trên thanh menu hoặc trang Dạy học. Không cần đi qua Phòng học Live.

1. Chọn lớp rồi chọn **Xem và in thẻ của lớp**, in A4 ở tỉ lệ 100%, đen trắng và cắt theo khung. Mỗi em nhận đúng thẻ mang tên mình; giữ thẻ để dùng lại trong các tiết của cùng lớp. Thẻ không phải mã đăng nhập.
2. Chọn bộ câu hỏi và bấm **Bắt đầu tiết học bằng thẻ QR**. Chỉ các câu trắc nghiệm có 2–4 lựa chọn được lấy theo đúng thứ tự trong bộ đề; các dạng khác được bỏ qua và báo số câu dùng. Bấm **Mở màn chiếu** trên máy tính và **Phát câu hỏi**. Mỗi em xoay cạnh mang chữ đáp án mình chọn lên trên: A, B, C hoặc D.
3. Trong tiết học thẻ QR, mở **Mở màn quét trên điện thoại**. Dùng điện thoại mở mã dẫn đến phòng học; đăng nhập cùng tài khoản giáo viên nếu được yêu cầu. Sau đăng nhập, màn quét được mở lại đúng phòng.
4. Bấm **Mở camera sau**, cấp quyền camera và giữ điện thoại thẳng đứng. Quét gần từng em hoặc nhóm nhỏ 2–4 em; không cần học sinh có điện thoại. Giữ thẻ thẳng, đủ sáng, không che mã; nếu chưa nhận thì đưa camera gần hơn. Cạnh đáp án được chọn phải nằm ngang ở trên.
5. Màn hình hiển thị tên và đáp án đã nhận sau hai lần đọc ổn định. Có thể dừng camera để kiểm tra, bỏ kết quả sai và quét lại. Chọn **Gửi các đáp án đã kiểm tra** để ghi nhận. Máy tính tự cập nhật bảng trả lời; khi giáo viên công bố kết quả, điểm và báo cáo dùng luồng chấm hiện có.

Mỗi câu giữ đáp án đầu tiên đã gửi, dù nộp từ thiết bị học sinh hay từ thẻ. Không gửi được khi câu đã đóng, câu đang chiếu đã đổi, phòng kết thúc, trò chơi tạm dừng hoặc hết giờ. Thẻ của lớp khác không được ghi nhận. Câu tự luận/đúng sai không dùng chế độ thẻ này. Với câu chỉ có hai lựa chọn, dùng A/B.

Điện thoại cần Internet, website HTTPS và trình duyệt hỗ trợ camera (Chrome/Safari hiện hành). Camera chỉ mở khi giáo viên yêu cầu; tắt khi rời màn quét, ẩn ứng dụng hoặc không còn nhận bài. Khung hình được giải mã trên điện thoại, không lưu/tải ảnh hay video lên máy chủ. Chỉ giáo viên có quyền quản lý phòng được gửi đáp án; mã thẻ không mang mã tự luyện hoặc mật khẩu. Quét khung hình không đọc/ghi Firestore; chỉ các đáp án đã xác nhận được gửi qua giao dịch chống ghi trùng. Không cần Cloud Functions hoặc nâng gói Firebase.

Đã kiểm tra bằng mã QR in thực tế trong camera mô phỏng: bốn hướng xoay, nhiều thẻ trong một khung hình, xác nhận/nộp, dừng camera, lỗi quyền camera và in A4. Nên thử vài thẻ với điện thoại, máy in và ánh sáng thực tế của lớp trước tiết đầu tiên.

## Mục riêng từ ngày 21/10/2026

Các tiết tạo ở mục này chỉ nhận câu trả lời bằng thẻ qua tài khoản giáo viên phụ trách phòng, không dùng mã phòng cho học sinh vào làm trên thiết bị. Màn chiếu không hiển thị mã tham gia. Trang điều khiển có các nút phát câu hỏi, đóng trả lời, chấm điểm, chuyển câu và kết thúc tiết; chấm câu đang mở trước khi kết thúc để lưu đủ điểm. Báo cáo vẫn nằm trong Lịch sử dạy học. Có lối tiếp tục tiết gần nhất trên máy đang dùng, theo tài khoản giáo viên. Các liên kết quét cũ vẫn được chuyển sang màn riêng; phòng Live cũ vẫn hoạt động như trước.
