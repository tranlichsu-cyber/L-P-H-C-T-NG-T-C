# Tự đổi huy hiệu trên gói Firebase Spark

Không dùng Cloud Functions hoặc API bên ngoài. Chỉ triển khai Hosting và Firestore rules/indexes; không nâng gói thanh toán.

Học sinh xem điểm trong Huy hiệu & cửa hàng avatar, tự đổi 20 điểm = 1 huy hiệu, rồi mua avatar giá riêng 3–8 huy hiệu. Điểm học tập không bị trừ. Huy hiệu đã nhận và avatar đang sở hữu được giữ nguyên.

## Điểm mới

Khi nộp bài, bài làm được lưu trước. Sau đó Firestore kiểm tra đáp án theo đề công bố, theo từng câu. Quy tắc đối chiếu câu trả lời, trọng số, thứ tự câu và phiên bản đề; không tin điểm hoặc cờ đúng/sai do trình duyệt gửi. Tiến trình xác minh có thể tiếp tục khi gửi lại; không phải nộp một bài mới. Nếu lỗi mạng hoặc đề thay đổi, bài đã lưu vẫn còn và giao diện báo điểm chờ xác minh.

Chỉ khi tiến trình hoàn tất, điểm được quy về thang 10 và ghi nhận bằng giao dịch cùng sổ điểm. Mỗi bài chỉ giữ điểm cao nhất. Bài có phần tự luận chờ chấm không tự cấp điểm. Đề có sẵn trong ứng dụng nhưng chưa có bản công bố trên Firestore cần được giáo viên đối soát bằng đề gốc.

Điểm trên lớp tự ghi theo từng phòng khi giáo viên kết thúc tiết. Sử dụng điểm giáo viên đã chấm, nguồn mỗi phòng chỉ cộng một lần. Nếu ghi điểm chưa hoàn tất, phòng đánh dấu chờ cập nhật và thông báo cho giáo viên; đối soát lịch sử có thể bổ sung phần còn thiếu.

Học sinh tự bấm đổi điểm khi đủ mốc. Firestore giới hạn tổng huy hiệu bằng mốc điểm hợp lệ, giữ nguyên phần đã dùng và avatar sở hữu. Hai thiết bị đồng thời không được nhận hoặc mua trùng.

## Điểm cũ

Giáo viên mở Lịch sử tiến bộ học sinh, chọn Tất cả các môn, chờ tải xong và bấm **Đối soát điểm cũ một lần**. Dùng các bản ghi đang tải (tối đa 100 tiết chưa lưu trữ theo phạm vi lịch sử hiện tại) và chấm lại bài tự luyện bằng đề gốc. Các nguồn cũ dùng cùng mã bài/phòng với nguồn mới nên đối soát lại không cộng trùng. Không cộng nguyên tổng điểm khai báo từ bài cũ.

Bài cũ không còn đề gốc được báo riêng, chưa tự cấp thêm điểm. Bài tự luận chưa chấm chưa được cộng. Mốc huy hiệu cũ giữ nguyên nếu tổng đối soát thấp hơn. Học sinh thấy cảnh báo điểm cũ chờ đối soát cho đến khi hoàn tất. Sau bước chuyển đổi này, bài mới không cần giáo viên bấm đồng bộ.

## Hạn mức

Hai listener dùng chung cho hồ sơ/cửa hàng: ví huy hiệu và sổ điểm, không đọc lại toàn bộ lịch sử khi học sinh mở cửa hàng. Kiểm tra đáp án dùng một giao dịch tiến trình cho mỗi câu, cộng giao dịch khởi tạo và ghi kết quả; mỗi giao dịch đọc một tiến trình, các quy tắc đọc đề và bài đã lưu. Cơ chế này tiết kiệm hạ tầng máy chủ nhưng vẫn tiêu thụ lượt đọc/ghi Firestore và chịu hạn mức Spark. Không có cam kết sử dụng miễn phí vô hạn.

Kiểm tra phát hành gồm build, chính sách điểm/avatar, các chức năng cũ, trình duyệt 1280/390px với dịch vụ mô phỏng và Firestore Emulator cho toàn bộ luồng xác minh/đổi huy hiệu. Trạng thái triển khai được ghi sau khi CI hoàn tất.
