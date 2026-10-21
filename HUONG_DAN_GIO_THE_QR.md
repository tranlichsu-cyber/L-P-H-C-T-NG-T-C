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

## Kho câu hỏi riêng có ảnh và video

Vào **Trả lời bằng thẻ QR → Kho câu hỏi QR riêng → Tạo bộ câu hỏi QR**. Kho này tách khỏi bộ đề Live và tự luyện; chọn lớp rồi chỉ chọn các bộ của kho QR.

- Nhập tên bộ, môn, khối lớp. Mỗi câu có 2–4 lựa chọn, một đáp án đúng, điểm đúng/điểm trừ và giải thích. Có nút thêm, xóa, đổi thứ tự câu và xem trước. Bấm **Lưu bộ câu hỏi QR** trước khi rời trang.
- Ảnh: chọn JPG/PNG/WebP tối đa 6 MB hoặc dán liên kết HTTPS. Ảnh từ máy được thu gọn và lưu cùng câu hỏi, dùng lại được trên điện thoại/máy tính sau đăng nhập. Nên chọn ảnh rõ chữ và cắt gọn nội dung cần học.
- Video: dán liên kết YouTube (kể cả youtu.be/Shorts) hoặc video HTTPS có đuôi MP4/WebM. Video phát khi giáo viên bấm; có đường dẫn mở ngoài nếu nguồn không cho nhúng. Cần Internet và quyền xem video. Chức năng này dùng liên kết video, không tải tệp video lên Firebase.
- Bấm **Xem trước câu hỏi** để kiểm tra hình/video rồi bắt đầu tiết. Màn chiếu hiển thị nội dung đa phương tiện; màn quét chỉ tải hình/video khi mở phần “Ảnh / Video của câu hỏi”.

Mỗi bộ tối đa 80 câu và có giới hạn tổng dung lượng; nếu bộ chứa quá nhiều ảnh, dùng liên kết ảnh hoặc chia nhỏ bộ. Mỗi tiết mới lấy một bản riêng của nội dung và đáp án; sửa/xóa bộ trong kho không đổi câu hỏi, điểm và báo cáo của tiết đã tạo. Kho và đáp án riêng của tiết chỉ dành cho giáo viên có quyền. Tiếp tục dùng gói miễn phí, không thêm Cloud Functions hay yêu cầu Firebase Storage.

## Tải mẫu và nhập bộ câu hỏi từ Word

Vào **Trả lời bằng thẻ QR → Kho câu hỏi QR riêng**. Trong phần “Soạn câu hỏi bằng file Word” có **Tải mẫu Word trống**, **Tải bộ mẫu 10 câu Toán 4** và **Nhập từ file Word**. Dùng mẫu mới trên website để nhập tự động; file hướng dẫn văn bản thông thường không thay cho mẫu hai cột này.

1. Điền cột bên phải trong Word; giữ nguyên tên trường ở cột trái. Điền một bảng thông tin bộ và một bảng cho mỗi câu; sao chép/xóa cả bảng câu để thêm/bớt.
2. Điền nội dung, A/B và đáp án đúng A/B/C/D. C/D có thể để trống ở cuối nếu chỉ dùng 2–3 lựa chọn. Không bỏ trống lựa chọn ở giữa. Điểm đúng mặc định 10, điểm trừ mặc định 0 nếu để trống.
3. Trong ô **Ảnh**, có thể chèn một ảnh JPG/PNG/WebP bằng Insert → Pictures hoặc điền một liên kết HTTPS. Không đặt ảnh ngoài bảng hoặc trong đáp án. Trong ô **Video**, dán liên kết YouTube / MP4 / WebM; không nhúng tệp video vào Word.
4. Lưu .docx rồi chọn **Nhập từ file Word**. Giới hạn 8 MB, 80 câu; ảnh được thu gọn, bộ sau xử lý vẫn cần nằm trong giới hạn dung lượng của kho. File đặt mật khẩu, công thức/đối tượng Word chưa hỗ trợ hoặc thiếu dữ liệu sẽ báo lỗi và chưa tạo bộ.
5. Xem lại các câu và đáp án rồi bấm **Tạo bộ câu hỏi từ file**. Website tạo một bộ mới và mở trang chỉnh sửa; không ghi đè hoặc nối vào bộ hiện có. Sau đó về chọn lớp để bắt đầu dạy.
