# Rà soát nội dung lớp 4 theo sáu sách giáo viên cung cấp

Ngày đối chiếu: 14/10/2026. Bộ sách: Kết nối tri thức với cuộc sống. Phạm vi là lớp 4; không suy rộng sang các lớp chưa có sách. Giáo viên chọn giữ lịch 35 tuần và điều chỉnh theo thứ tự sách.

## Đã kiểm tra và sửa

- Đối chiếu mục lục sáu PDF quét ảnh; ghi tên bài, tập sách, trang in, trang PDF và SHA-256 nguồn. Danh mục có 73 bài Toán, 31 bài Khoa học, 27 bài Lịch sử và Địa lí, 32 bài đọc Tiếng Việt tập một và 30 bài đọc tập hai.
- Tiếng Việt ghi trực tiếp tuần 1–35; tuần 9, 18, 27, 35 ôn tập/đánh giá. Tập hai bắt đầu lại từ Bài 1, không trộn số bài giữa hai tập.
- Cập nhật 35 mục luyện viết trong mã nguồn theo nội dung viết của từng tuần, thêm trang nguồn. Đề luyện thêm do website biên soạn, không tự nhận là đề nguyên văn SGK.
- Tuần 13: thay gieo hạt bằng viết đơn. Tuần 19: thay tình cảm với mái trường bằng tình cảm với người gần gũi, thân thiết. Tuần 34: bổ sung giấy mời bên cạnh viết thư.
- Chỉnh bài yêu cầu đoạn văn thành đoạn văn; báo cáo, đơn, thư và hướng dẫn có phần chuẩn bị ý phù hợp, thay bố cục mở bài–thân bài–kết bài dùng chung.
- Tách phiên bản bản nháp khi đổi đề: giữ bản cũ, không dùng bài cũ để đánh dấu hoàn thành đề mới.
- Sửa dữ liệu minh hoạ: câu hỏi về ba thể của nước hỏi đúng về trạng thái; bỏ lời giải nhịn nước theo số ngày; câu danh từ chỉ người có đáp án duy nhất; phép nhân hai chữ số tham chiếu Bài 43. Đây là dữ liệu minh hoạ trong mã, không phải bằng chứng đã sửa bản sao trên máy chủ.

## Phần ngân hàng máy chủ còn bị chặn

Truy vấn chỉ đọc `selfPracticeQuizzes` với điều kiện `published == true` bằng danh tính dự án hiện có trả HTTP 429, `RESOURCE_EXHAUSTED`, `Quota exceeded`. Không lấy được bản chụp ngân hàng hiện hành; không thay đổi hoặc xoá các tài liệu chưa đọc được.

Chưa xác nhận toàn bộ câu hỏi, đáp án, lời giải và tuần trong ngân hàng Firestore. Các bản nhập Excel hoặc bản công khai trên máy chủ có thể vẫn có nội dung cũ. Luyện viết trên website dùng dữ liệu tuần trong mã đã sửa; điều này không đồng nghĩa các câu trắc nghiệm trong ngân hàng đã được sửa.

Toán, Khoa học, Lịch sử và Địa lí trong các PDF có thứ tự bài nhưng không có bảng 35 tuần như Tiếng Việt. Giữ kế hoạch tuần hiện có; không tự coi mỗi bài tương ứng một tuần hoặc suy đoán số tiết. Sau khi máy chủ đọc được, cần đối chiếu tuần của từng bộ với lịch đang dùng, kiểm tra từng câu và đáp án với trang bài tương ứng.

## Công cụ trong website

`/teacher/curriculum-audit`: xem lịch Tiếng Việt 35 tuần, tra cứu danh mục bốn môn, số bài và trang nguồn; đối chiếu tiêu đề/số bài của các bộ đã tải được; tải báo cáo và thông báo rõ khi không đọc được máy chủ. Liên kết từ kho câu hỏi và quản lý tự luyện.

Công cụ không tự sửa đáp án hoặc coi tiêu đề khớp sách là nội dung đã kiểm chứng. Bài chưa ghép được với sách hoặc có nhiều nội dung cần đọc trực tiếp trước khi sửa.

## Kiểm tra

Kiểm tra tự động: số bài liên tục, phân biệt hai tập Tiếng Việt, đủ 35 tuần và 62 bài đọc, đúng mốc ôn tập, nguồn từng bài viết, số trang PDF, lỗi tuần 13/19/34 và giới hạn đối chiếu tiêu đề. Kiểm tra trình duyệt: tra cứu, lỗi máy chủ, điện thoại và đề mới không dùng nhầm bản nháp cũ. Biên dịch, lint và các kiểm tra học tập hiện có theo quy trình dự án.
