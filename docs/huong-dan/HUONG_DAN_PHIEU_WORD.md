# Phiếu bài tập Word trong phòng học Live

## Giáo viên

1. Mở phòng học, chọn **Phiếu Word**. Mở **Phiếu Word / Chiếu bài làm** trong bảng điều khiển.
2. Tải **phiếu Word mẫu** hoặc chọn file `.docx` của mình. File `.doc` cũ cần được lưu lại thành `.docx` trong Word.
3. Kiểm tra bản xem trước và các ô học sinh sẽ trả lời. Phiếu nhận biết các đề mục như `Câu 1:`, `Bài 1:` hoặc `1.`. Thầy/cô có thể sửa tên câu hỏi, thêm hoặc bỏ ô. Phiếu không có đề mục được gợi ý một ô “Bài làm của em”.
4. Bấm **Phát phiếu cho học sinh**. Các em đã vào phòng và chọn tên sẽ được chuyển đến phiếu.
5. Bài nộp xuất hiện ngay trong danh sách. Mở bài để xem, chọn **Chiếu bài của…** rồi đưa cửa sổ trình chiếu lên màn hình lớp hoặc chia sẻ màn hình trong cuộc gọi trực tuyến. Có tùy chọn ẩn tên học sinh.
6. **Khóa nhận bài** để ngừng nhận bài mới. **Thu phiếu / trở về câu hỏi** để tiếp tục hoạt động khác. Phát phiếu mới khóa nhận bài của phiếu cũ.

Danh sách **Xem phiếu và bài đã nộp** giữ các phiếu của phòng, cho phép xem và trình chiếu bài cũ mà không phát lại phiếu đó cho học sinh.

## Học sinh

Vào phòng bằng mã phòng, chọn và xác nhận tên. Khi nhận phiếu, đọc đề và điền các ô trả lời ngay trên trang học. Kiểm tra lại rồi bấm **Nộp phiếu bài tập**. Chỉ thông báo đã nộp xác nhận bài đã gửi đến giáo viên; nếu gửi lỗi, giữ trang mở và thử lại.

Bản nháp được lưu riêng theo phòng, phiếu và học sinh trên thiết bị hiện tại. Bài đã nộp không sửa được. Học sinh chỉ có quyền đọc bài của mình; danh sách bài làm dành cho giáo viên quản lý phòng.

## Định dạng và giới hạn

Phiếu chuyển từ Word sang trang học, hỗ trợ văn bản, bảng, danh sách và hình ảnh thông thường. Kiểm tra công thức, hình vẽ, bố cục trang hoặc các định dạng phức tạp trong bản xem trước. Các em nhập câu trả lời vào những ô giáo viên đã kiểm tra, không chỉnh sửa file Word gốc.

File tối đa 8 MB; mỗi phiếu từ 1 đến 40 ô trả lời; mỗi ô tối đa 10.000 ký tự và cả bài tối đa 40.000 ký tự. Phiếu có hình ảnh lớn cần được giảm kích thước hoặc chia nhỏ trước khi phát. Các nội dung thực thi, biểu mẫu nhúng và ảnh từ liên kết ngoài bị loại khỏi phần hiển thị.

Phiếu dùng cùng phòng học và cấu hình Firebase của ứng dụng. Bài không tự chấm điểm; giáo viên xem và chữa bài trực tiếp. Chế độ mock phục vụ thử nghiệm trong các tab của cùng trình duyệt; học sinh ở nhiều thiết bị cần Firebase và quy tắc Firestore mới.

## Kiểm tra

- `npm run build`
- `npm run lint`
- `node scripts/check-worksheets.mjs` (bao gồm đọc phiếu `.docx` mẫu thực tế)
- Firebase Emulator: `node scripts/check-self-practice-rules.cjs` trong môi trường chạy emulator và đã cài các công cụ như quy trình kiểm thử GitHub Actions.

Kiểm thử quyền bao gồm giáo viên quản lý phòng, học sinh không đọc bài của bạn, nộp bài đúng danh tính, bài đã nộp không sửa được, chỉ giáo viên chọn bài chiếu, khóa nhận bài, kết thúc phòng và trình chiếu bài của phiếu cũ.
