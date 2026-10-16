# Lớp học tương tác: bảng con, chữa bài, vé ra cửa

## Cách dùng

1. Giáo viên mở phòng học, chọn **BẢNG CON / VÉ RA CỬA**. Trong bảng điều khiển bài giảng cũng có **Hoạt động nhanh / Phiếu Word / Chữa bài**.
2. Chọn bảng con, nhập nhiệm vụ rồi phát. Học sinh đang ở phòng được chuyển tới trang hoạt động hiện có; có thể gõ chữ, vẽ bằng chuột/bút/ngón tay hoặc kết hợp cả hai. Bản nháp lưu riêng theo phòng, bài và học sinh trên thiết bị. Bài đã nộp được khóa.
3. Giáo viên mở bài, chọn chiếu. Tên được ẩn mặc định với hoạt động mới; có thể bật lại. Dùng bút đỏ đánh dấu, lùi nét hoặc ghi chú trên màn hình chiếu. Những ghi chú này lưu trên thiết bị theo tài khoản giáo viên/phòng/bài/học sinh, không thay đổi bài gốc và không tự gửi cho học sinh. Dùng **Nhận xét và trả bài** để gửi nhận xét riêng.
4. Cuối tiết chọn vé ra cửa: hai câu ngắn tùy chỉnh và một câu tự đánh giá. Học sinh chọn đã hiểu/còn phân vân/cần giúp. Giáo viên xem tổng hợp, lọc nhóm cần hỗ trợ và xem những em đã vào phòng nhưng chưa nộp.
5. Phát hoạt động mới sẽ khóa hoạt động trước. Bài trước vẫn có trong danh sách để xem, chữa và trả nhận xét. Giáo viên có thể khóa nhận hoặc thu hoạt động; phòng đã kết thúc không nhận bài hay phát bài mới.

## Dữ liệu và quyền truy cập

- Dùng các phiếu, trạng thái phát bài, bài nộp và nhận xét của phòng hiện có. Trường `kind` không bắt buộc, chỉ thêm cho bảng con/vé ra cửa; phiếu Word cũ hoạt động như trước. Không chuyển đổi hoặc xóa dữ liệu hiện có.
- Chỉ giáo viên quản lý phòng phát/khóa/chọn chiếu/đọc danh sách bài. Học sinh chỉ đọc bài và nhận xét của chính mình. Việc ẩn tên trên máy chiếu không mở quyền đọc bài của bạn.
- Nét vẽ là tọa độ số có giới hạn, không phải SVG/HTML do người dùng nhập. Tối đa 32 nét/480 điểm, chữ 1.000 ký tự; có lùi/xóa khi bảng đầy. Văn bản nhiệm vụ được escape khi tạo phần hiển thị.
- Các nét nháp và ghi chú không ghi Firestore theo từng chuyển động. Lịch sử phiếu dùng chung đăng ký trong một trang; nhận xét từng em chỉ tải sau khi giáo viên mở bài lần đầu.

## Kiểm tra

- `scripts/check-activities.mjs`: kiểu hoạt động, giới hạn và dữ liệu vẽ sai, nhiệm vụ trên máy chiếu, chu trình thực tế của dịch vụ trong chế độ mô phỏng, nộp lặp, chuyển bài/khóa/kết thúc phòng, tổng hợp vé, bài cũ/nhận xét và đăng ký dùng chung.
- Kiểm tra phiếu Word và hiệu quả đọc dữ liệu hiện có vẫn chạy.
- Bổ sung Firebase Emulator: sở hữu phòng, không xem bài bạn/không liệt kê bài cả lớp, chỉ giáo viên chọn chiếu, loại hoạt động bất biến, giá trị tự đánh giá hợp lệ, khóa bài/phòng kết thúc. Quy trình triển khai chạy bộ kiểm tra này trước khi đưa bản dựng lên.
- Kiểm tra trình duyệt với giáo viên và nhiều học sinh ở màn hình máy tính/điện thoại: chữ và hình vẽ, chiếu ẩn tên, ghi chú độc lập với bài gốc, trả nhận xét riêng, chuyển từ bài đã trả sang hoạt động mới, tổng hợp và lọc hỗ trợ, khóa nộp và chiếu bài lưu trữ.
