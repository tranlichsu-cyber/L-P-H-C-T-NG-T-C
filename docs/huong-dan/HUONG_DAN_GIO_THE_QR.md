# Trả lời câu hỏi Live bằng thẻ QR

Trong cổng giáo viên, chọn mục riêng **Trả lời bằng thẻ QR** trên thanh menu hoặc trang Dạy học. Không cần đi qua Phòng học Live.

1. Chọn lớp rồi chọn **Xem và in thẻ của lớp**, in A4 ở tỉ lệ 100%, đen trắng và cắt theo khung. Mỗi em nhận đúng thẻ mang tên mình; giữ thẻ để dùng lại trong các tiết của cùng lớp. Thẻ không phải mã đăng nhập.
2. Trong **Cấu hình câu hỏi cho tiết học**, lọc theo môn rồi chọn bộ câu hỏi QR. Mặc định chọn tất cả; có thể bỏ chọn từng câu, chọn lại tất cả và bật **Trộn thứ tự câu hỏi**. Trộn chỉ thay đổi thứ tự câu, giữ nguyên đáp án A–D. Kiểm tra số câu và điểm tối đa trong **Sẵn sàng lên lớp**, rồi bấm **Bắt đầu tiết học bằng thẻ QR**. Chỉ những câu được chọn được sao chép vào tiết; không sửa bộ gốc. Bấm **Phát câu hỏi** trên máy tính để hiện câu hỏi ngay trên trang điều khiển. Mỗi em xoay cạnh mang chữ đáp án mình chọn lên trên: A, B, C hoặc D.
3. Trong phần **Kết nối điện thoại để quét thẻ**, dùng camera điện thoại mở mã dẫn đến màn quét; đăng nhập cùng tài khoản giáo viên nếu được yêu cầu. Sau đăng nhập, màn quét được mở lại đúng phòng.
4. Bấm **Mở camera sau**, cấp quyền camera và giữ điện thoại thẳng đứng. Quét gần từng em hoặc nhóm nhỏ 2–4 em; không cần học sinh có điện thoại. Giữ thẻ thẳng, đủ sáng, không che mã; nếu chưa nhận thì đưa camera gần hơn. Cạnh đáp án được chọn phải nằm ngang ở trên.
5. Màn hình hiển thị tên và đáp án đã nhận sau hai lần đọc ổn định. Có thể dừng camera để kiểm tra, bỏ kết quả sai và quét lại. Chọn **Gửi các đáp án đã kiểm tra** để ghi nhận. Máy tính tự cập nhật bảng trả lời; khi giáo viên công bố kết quả, điểm và báo cáo dùng luồng chấm hiện có.

Mỗi câu giữ đáp án đầu tiên đã gửi. Tiết thẻ QR riêng chỉ nhận đáp án qua tài khoản giáo viên; phòng Live cũ có kết hợp thiết bị và thẻ vẫn giữ đáp án đầu tiên. Không gửi được khi câu đã đóng, câu đang chiếu đã đổi, phòng kết thúc, trò chơi tạm dừng hoặc hết giờ. Thẻ của lớp khác không được ghi nhận. Câu tự luận/đúng sai không dùng chế độ thẻ này. Với câu chỉ có hai lựa chọn, dùng A/B.

Điện thoại cần Internet, website HTTPS và trình duyệt hỗ trợ camera (Chrome/Safari hiện hành). Camera chỉ mở khi giáo viên yêu cầu; tắt khi rời màn quét, ẩn ứng dụng hoặc không còn nhận bài. Khung hình được giải mã trên điện thoại, không lưu/tải ảnh hay video lên máy chủ. Chỉ giáo viên có quyền quản lý phòng được gửi đáp án; mã thẻ không mang mã tự luyện hoặc mật khẩu. Quét khung hình không đọc/ghi Firestore; chỉ các đáp án đã xác nhận được gửi qua giao dịch chống ghi trùng. Không cần Cloud Functions hoặc nâng gói Firebase.

Đã kiểm tra bằng mã QR in thực tế trong camera mô phỏng: bốn hướng xoay, nhiều thẻ trong một khung hình, xác nhận/nộp, dừng camera, lỗi quyền camera và in A4. Nên thử vài thẻ với điện thoại, máy in và ánh sáng thực tế của lớp trước tiết đầu tiên.

## Mục riêng từ ngày 21/10/2026

Các tiết tạo ở mục này chỉ nhận câu trả lời bằng thẻ qua tài khoản giáo viên phụ trách phòng, không dùng mã phòng cho học sinh vào làm trên thiết bị. Màn chiếu không hiển thị mã tham gia. Trang điều khiển có các nút phát câu hỏi, đóng trả lời, chấm điểm, chuyển câu và kết thúc tiết; chấm câu đang mở trước khi kết thúc để lưu đủ điểm. Báo cáo vẫn nằm trong Lịch sử dạy học. Có lối tiếp tục tiết gần nhất trên máy đang dùng, theo tài khoản giáo viên. Các liên kết quét cũ vẫn được chuyển sang màn riêng; phòng Live cũ vẫn hoạt động như trước.

## Kho câu hỏi riêng có ảnh và video

Vào **Trả lời bằng thẻ QR → Mở kho câu hỏi QR → Tạo bộ câu hỏi QR**. Kho này tách khỏi bộ đề Live và tự luyện; chọn lớp rồi chỉ chọn các bộ của kho QR.

- Nhập tên bộ, môn, khối lớp. Mỗi câu có 2–4 lựa chọn, một đáp án đúng, điểm đúng/điểm trừ và giải thích. Có nút thêm, xóa, đổi thứ tự câu và xem trước. Bấm **Lưu bộ câu hỏi QR** trước khi rời trang.
- Ảnh: chọn JPG/PNG/WebP tối đa 6 MB hoặc dán liên kết HTTPS. Ảnh từ máy được thu gọn và lưu cùng câu hỏi, dùng lại được trên điện thoại/máy tính sau đăng nhập. Nên chọn ảnh rõ chữ và cắt gọn nội dung cần học.
- Video: dán liên kết YouTube (kể cả youtu.be/Shorts) hoặc video HTTPS có đuôi MP4/WebM. Video phát khi giáo viên bấm; có đường dẫn mở ngoài nếu nguồn không cho nhúng. Cần Internet và quyền xem video. Chức năng này dùng liên kết video, không tải tệp video lên Firebase.
- Bấm **Xem trước câu hỏi** để kiểm tra hình/video rồi bắt đầu tiết. Màn chiếu hiển thị nội dung đa phương tiện; màn quét chỉ tải hình/video khi mở phần “Ảnh / Video của câu hỏi”.

Mỗi bộ tối đa 80 câu và có giới hạn tổng dung lượng; nếu bộ chứa quá nhiều ảnh, dùng liên kết ảnh hoặc chia nhỏ bộ. Mỗi tiết mới lấy một bản riêng của nội dung và đáp án; sửa/xóa bộ trong kho không đổi câu hỏi, điểm và báo cáo của tiết đã tạo. Kho và đáp án riêng của tiết chỉ dành cho giáo viên có quyền. Tiếp tục dùng gói miễn phí, không thêm Cloud Functions hay yêu cầu Firebase Storage.

## Tải mẫu và nhập bộ câu hỏi từ Word

Vào **Trả lời bằng thẻ QR → Mở kho câu hỏi QR**. Trong phần “Soạn câu hỏi bằng file Word” có **Tải mẫu Word trống**, **Tải bộ mẫu 10 câu Toán 4** và **Nhập từ file Word**. Dùng mẫu mới trên website để nhập tự động; file hướng dẫn văn bản thông thường không thay cho mẫu hai cột này.

1. Điền cột bên phải trong Word; giữ nguyên tên trường ở cột trái. Điền một bảng thông tin bộ và một bảng cho mỗi câu; sao chép/xóa cả bảng câu để thêm/bớt.
2. Điền nội dung, A/B và đáp án đúng A/B/C/D. C/D có thể để trống ở cuối nếu chỉ dùng 2–3 lựa chọn. Không bỏ trống lựa chọn ở giữa. Điểm đúng mặc định 10, điểm trừ mặc định 0 nếu để trống.
3. Trong ô **Ảnh**, có thể chèn một ảnh JPG/PNG/WebP bằng Insert → Pictures hoặc điền một liên kết HTTPS. Không đặt ảnh ngoài bảng hoặc trong đáp án. Trong ô **Video**, dán liên kết YouTube / MP4 / WebM; không nhúng tệp video vào Word.
4. Lưu .docx rồi chọn **Nhập từ file Word**. Giới hạn 8 MB, 80 câu; ảnh được thu gọn, bộ sau xử lý vẫn cần nằm trong giới hạn dung lượng của kho. File đặt mật khẩu, công thức/đối tượng Word chưa hỗ trợ hoặc thiếu dữ liệu sẽ báo lỗi và chưa tạo bộ.
5. Xem lại các câu và đáp án rồi bấm **Tạo bộ câu hỏi từ file**. Website tạo một bộ mới và mở trang chỉnh sửa; không ghi đè hoặc nối vào bộ hiện có. Sau đó về chọn lớp để bắt đầu dạy.

## Bố cục điều khiển tiết học

Màn điều khiển có các ô tiến độ, trạng thái và số học sinh đã trả lời câu hiện tại. Bảng **Đáp án từng học sinh** hiển thị tên, lựa chọn đã gửi hoặc trạng thái chưa trả lời, không cần mở camera trên máy tính. Câu hỏi hiển thị trực tiếp phía trên; mã kết nối điện thoại luôn có sẵn bên dưới cụm điều khiển. Muốn quét bằng camera của chính máy đang dùng, chọn **Quét ngay trên máy này**. Đóng hoặc ẩn phần quét sẽ dừng camera và vẫn giữ trang điều khiển; các kết quả chưa gửi trong phần quét sẽ bị bỏ, vì vậy cần kiểm tra và gửi trước khi đóng.

Chọn ít nhất một câu và lớp có học sinh để bắt đầu. Điểm đúng/điểm trừ lấy từ từng câu đã soạn; muốn đổi điểm, sửa bộ câu hỏi trong kho trước khi tạo tiết. Màn chuẩn bị dùng dữ liệu kho đã tải, lọc môn và chọn câu không tạo thêm lượt đọc Firestore.

## Hiển thị câu hỏi khi phát câu

Trang điều khiển hiển thị trực tiếp nội dung câu hỏi, ảnh/video và các lựa chọn A–D ngay phía trên các nút điều khiển. Bấm **Phát câu hỏi**, **Câu tiếp theo** hoặc chọn phát một câu sẽ đưa trang về phần câu hỏi. Trước khi công bố kết quả, các lựa chọn không đánh dấu đáp án đúng. Sau **Hiện đáp án / Chấm điểm**, đáp án đúng và giải thích mới xuất hiện.

## Trình soạn câu hỏi dạng slide

Vào **Kho câu hỏi thẻ QR → Tạo bộ câu hỏi QR** hoặc sửa một bộ đã có. Danh sách bên trái dùng để chọn từng câu; trên điện thoại có thể vuốt ngang danh sách. Vùng giữa chỉ soạn một câu tại một thời điểm. Nhập câu hỏi, điền 2–4 lựa chọn rồi bấm chữ A/B/C/D để chọn đáp án đúng (ô xanh). Có thể dùng phím mũi tên khi đang chọn đáp án. Giảm số lựa chọn sẽ đưa đáp án đúng về A nếu đáp án cũ bị bỏ.

Các nút mũi tên đổi vị trí câu; **Nhân đôi** tạo câu mới có mã riêng và giữ nội dung/ảnh/video của bản gốc. **Xóa câu hỏi** có bước xác nhận và giữ ít nhất một câu. Tối đa 80 câu/bộ. **Ảnh / Video** mở phần chèn ảnh hoặc liên kết; **Điểm số và giải thích** mở cấu hình từng câu. **Xem trước câu hỏi** hiển thị nội dung học sinh sẽ thấy, chưa đánh dấu đáp án đúng.

Bấm **Lưu bộ câu hỏi QR** để lưu. Soạn, đổi câu và xem trước chỉ thay đổi dữ liệu trên trang, không tự ghi Firestore. Nếu một câu chưa hợp lệ, trình soạn đưa về câu đó để sửa; nếu lưu lỗi, nội dung trên trang được giữ lại. Các liên kết quay về kho/chọn lớp sẽ nhắc khi còn thay đổi chưa lưu; đóng/tải lại trang cũng có nhắc của trình duyệt.

## Khôi phục bản nháp và thử lại khi lỗi

Thay đổi chưa lưu trong trình soạn được giữ thành bản nháp trên trình duyệt của máy đang dùng, theo tài khoản giáo viên và từng bộ câu hỏi. Khi mở lại, chọn **Khôi phục bản nháp** hoặc **Bỏ bản nháp cũ**; bản nháp không tự ghi đè bộ đã lưu trên hệ thống. Lưu thành công sẽ xóa bản nháp tương ứng. Nếu trình duyệt không cho lưu hoặc hết chỗ, trang hiển thị thông báo để thầy/cô lưu bộ câu hỏi trước khi rời trang. Bản nháp trên máy không đồng bộ sang thiết bị khác.

Khi kho QR chưa tải được, dùng **Thử tải lại kho câu hỏi**. Lúc chờ cấp quyền camera, nút mở chuyển thành **Đang mở camera…**; vẫn có thể bấm **Dừng camera** để hủy. Chuyển phòng học không tiếp tục hiển thị dữ liệu của phòng trước.

## Bốn nút điều khiển câu hỏi

1. **Phát câu hỏi**: mở nhận đáp án cho câu đang chọn. Có thể mở lại câu đã đóng nhưng chưa chấm; đáp án đã ghi nhận vẫn được giữ, mỗi học sinh chỉ gửi một lần.
2. **Đóng trả lời**: ngừng nhận đáp án mới, giữ nguyên câu hỏi và lựa chọn trên máy tính. Hãy gửi các thẻ đã quét và kiểm tra số bài đã nhận trước khi đóng.
3. **Hiện đáp án / Chấm điểm**: chỉ bật sau khi đóng trả lời. Đáp án đúng, giải thích và điểm được lưu cùng nhau; nếu lưu lỗi, câu vẫn ở trạng thái chờ chấm để thử lại. Bấm đồng thời từ hai thiết bị không cộng điểm hai lần.
4. **Câu tiếp theo**: chỉ bật sau khi chấm; phát câu chưa làm tiếp theo, bỏ qua các câu đã chấm. Nếu đã nhảy qua một số câu, hệ thống quay lại các câu chưa làm theo thứ tự bộ đề. Hết câu chưa làm thì nút bị khóa.

Khi đang xử lý, bốn nút tạm khóa và có thông báo chờ. Nếu có lỗi, thông báo hiện ngay trong khung điều khiển. Không chuyển sang câu khác khi câu hiện tại đang nhận đáp án hoặc đang chờ chấm.
