# Trả lời câu hỏi Live bằng thẻ QR

Trong phòng học Live, chọn **GIƠ THẺ QR • IN THẺ / QUÉT ĐÁP ÁN**.

1. Chọn **Xem và in thẻ của lớp**, in A4 ở tỉ lệ 100%, đen trắng và cắt theo khung. Mỗi em nhận đúng thẻ mang tên mình; giữ thẻ để dùng lại trong các tiết của cùng lớp. Thẻ không phải mã đăng nhập.
2. Trên máy tính, phát câu hỏi trắc nghiệm có 2–4 lựa chọn và mở màn máy chiếu như thường lệ. Mỗi em xoay cạnh mang chữ đáp án mình chọn lên trên: A, B, C hoặc D.
3. Trong màn thẻ QR, mở **Mở màn quét trên điện thoại**. Dùng điện thoại mở mã dẫn đến phòng học; đăng nhập cùng tài khoản giáo viên nếu được yêu cầu. Sau đăng nhập, màn quét được mở lại đúng phòng.
4. Bấm **Mở camera sau**, cấp quyền camera và giữ điện thoại thẳng đứng. Quét gần từng em hoặc nhóm nhỏ 2–4 em; không cần học sinh có điện thoại. Giữ thẻ thẳng, đủ sáng, không che mã; nếu chưa nhận thì đưa camera gần hơn. Cạnh đáp án được chọn phải nằm ngang ở trên.
5. Màn hình hiển thị tên và đáp án đã nhận sau hai lần đọc ổn định. Có thể dừng camera để kiểm tra, bỏ kết quả sai và quét lại. Chọn **Gửi các đáp án đã kiểm tra** để ghi nhận. Máy tính tự cập nhật bảng trả lời; khi giáo viên công bố kết quả, điểm và báo cáo dùng luồng chấm hiện có.

Mỗi câu giữ đáp án đầu tiên đã gửi, dù nộp từ thiết bị học sinh hay từ thẻ. Không gửi được khi câu đã đóng, câu đang chiếu đã đổi, phòng kết thúc, trò chơi tạm dừng hoặc hết giờ. Thẻ của lớp khác không được ghi nhận. Câu tự luận/đúng sai không dùng chế độ thẻ này. Với câu chỉ có hai lựa chọn, dùng A/B.

Điện thoại cần Internet, website HTTPS và trình duyệt hỗ trợ camera (Chrome/Safari hiện hành). Camera chỉ mở khi giáo viên yêu cầu; tắt khi rời màn quét, ẩn ứng dụng hoặc không còn nhận bài. Khung hình được giải mã trên điện thoại, không lưu/tải ảnh hay video lên máy chủ. Chỉ giáo viên có quyền quản lý phòng được gửi đáp án; mã thẻ không mang mã tự luyện hoặc mật khẩu. Quét khung hình không đọc/ghi Firestore; chỉ các đáp án đã xác nhận được gửi qua giao dịch chống ghi trùng. Không cần Cloud Functions hoặc nâng gói Firebase.

Đã kiểm tra bằng mã QR in thực tế trong camera mô phỏng: bốn hướng xoay, nhiều thẻ trong một khung hình, xác nhận/nộp, dừng camera, lỗi quyền camera và in A4. Nên thử vài thẻ với điện thoại, máy in và ánh sáng thực tế của lớp trước tiết đầu tiên.
