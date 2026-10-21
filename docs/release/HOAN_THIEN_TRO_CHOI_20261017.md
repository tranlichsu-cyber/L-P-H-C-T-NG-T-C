# Hoàn thiện trò chơi lớp học

## Thay đổi cho giáo viên

- **Cùng chọn đáp án**: mặc định không giới hạn thời gian và tắt âm thanh. Có thể chọn 15, 20 hoặc 30 giây. Điểm theo bộ câu hỏi, không thưởng tốc độ; bỏ danh sách xếp hạng người nộp nhanh. Có câu hỏi, lựa chọn và nút sang câu tiếp theo trong trò chơi.
- **Tạm dừng**: đóng tương tác trò chơi và nhận câu trả lời của học sinh, giữ lựa chọn đang làm. Thời gian còn lại được lưu vào trạng thái phòng; tiếp tục từ thời gian đó. Tải lại trang không tạo lại đồng hồ. Firestore kiểm tra trạng thái tạm dừng và hạn nhận bài, kể cả khi thiết bị học sinh đổi đồng hồ hoặc gửi trực tiếp qua SDK. Đồng hồ trên thiết bị không ghi mỗi giây. Khi đóng trò chơi, câu đang mở được khóa.
- **Vòng quay**: kim chỉ đúng ô của người được chọn; giữ nguyên hình vòng quay khi cập nhật danh sách đã gọi. Tạm dừng thực sự dừng hoạt ảnh; đóng trò chơi hủy hoạt ảnh. Khung vừa màn hình điện thoại. Mỗi lượt chỉ chọn một mức thưởng; điểm được ghi bằng khóa sự kiện để gửi lại không cộng trùng, kể cả khi mạng lỗi rồi thử lại. Vẫn ưu tiên em chưa được gọi. Không thưởng điểm chỉ vì được chọn; giáo viên ghi nhận trả lời hoặc cố gắng.
- **Đua đội**: dùng tỷ lệ lượt đúng trên tổng lượt của tất cả thành viên ở các câu đã chấm, có số đúng/tổng để đối chiếu. Chưa nộp ở câu đã chấm không được tính đúng. Chặn tạo đội ít người hơn số đội; nhóm được chốt lúc bắt đầu. Các em vào sau cần giáo viên tạo lại đội. Kết quả đội là thống kê trò chơi, không thay điểm cá nhân theo bộ đề.
- **Ô cửa và hộp quà**: các câu hỏi không bị nhân bản khi số ô nhiều hơn số câu. Có nút đóng nhận bài tại ô đang mở và công bố đúng câu được chọn, kể cả câu cũ. Ô/hộp mở bằng bàn phím được. Không tiết lộ nội dung quà trước khi mở.
- **Hộp quà** dùng lời khen hoặc hoạt động cùng bạn, không phát sinh điểm may mắn. Hộp thưởng của phiên cũ cũng hiển thị lời khen và nói rõ không cộng điểm học tập.
- Công tắc âm thanh thực sự điều khiển âm thanh trò chơi. Bố cục tiêu đề co dòng trên điện thoại; bỏ hiệu ứng nảy liên tục của người được gọi.

## Giữ dữ liệu và giới hạn

Không xóa câu hỏi, bài nộp hoặc điểm hiện có. Trò mới chỉ dùng câu chưa có bài nộp và chưa công bố kết quả; muốn chơi lại cả bộ cần phòng học mới. Danh sách câu của trò được chốt để nút tiếp theo và kết quả đội không lẫn lượt học cũ. Thu phiếu/hoạt động Word trước khi mở trò chơi. Phiên trò chơi đã mở trước bản cập nhật nên kết thúc và mở lại để có đầy đủ thông tin hạn giờ mới.

Điểm đúng/sai của cá nhân vẫn theo bộ đề đang dùng. Không thay đổi lịch sử điểm cũ hoặc tự chuyển điểm phần trăm đội thành điểm kiểm tra. Chỉ trò cần tên học sinh (vòng quay/đua đội) mới đọc danh sách tham gia lúc tạo; các trò còn lại dùng câu hỏi sẵn có.

## Xác minh

- `scripts/check-games.mjs`: câu không lặp, không thưởng may mắn, số đội, tỷ lệ đội, kim vòng quay từ 1–40 thành viên; hạn giờ, không giới hạn, dừng/tiếp tục; gọi các phương thức dịch vụ mock thật cho phát/thu/đóng và chống thưởng trùng.
- `scripts/check-self-practice-rules.cjs`: gửi qua SDK bị từ chối khi tạm dừng, hết hạn, sai câu trong lượt tính giờ hoặc phòng kết thúc; chấp nhận lượt không giới hạn và còn hạn. Bộ kiểm tra Emulator chạy trước bước triển khai.
- Trình duyệt ở 1280px và 390px: cả 5 trò, lựa chọn mặc định, dừng/tiếp tục và dựng lại màn hình không mất thời gian, chỉ đóng một lần, vòng quay và thưởng một lần, tỷ lệ đội, bàn phím, không tràn ngang.
- Phòng giáo viên tích hợp dịch vụ mock thật: tạo/chạy/dừng/tiếp tục, chặn nộp, đóng/công bố kết quả, chuyển trò dùng câu mới; công bố ô cũ không đổi câu đang phát. Màn học sinh giữ lựa chọn, khóa gửi và nút xác nhận khi tạm dừng.
- Build, lint, kiểm tra phiếu Word, hoạt động lớp và dùng chung lượt đọc.
