# Lộ trình nâng cấp website thlytutrong.com.vn (2026–2027)

## Nguyên tắc triển khai
- Giữ nguyên dữ liệu Firestore, Authentication, Storage và toàn bộ kết quả học tập hiện có. Không xóa hoặc di chuyển dữ liệu tự động.
- Triển khai từng đợt; mỗi đợt phải qua Lint, Build và kiểm tra khói (smoke test) trước khi coi là hoàn tất.
- Ưu tiên học sinh tiểu học: chữ dễ đọc, tương phản rõ, vùng bấm rộng >=44px, tiếng Việt dễ hiểu, không lạm dụng hiệu ứng chuyển động.
- Mọi thao tác quản trị/xóa dữ liệu phải có xác nhận và sao lưu thích hợp.

## Giai đoạn 1 — Giao diện cơ bản và độ ổn định (đang triển khai)
- [x] Trang chủ: lối vào Tự luyện và Góc truyền thống bằng thẻ có biểu tượng, hỗ trợ bàn phím.
- [x] Tự luyện: có trạng thái tải, nút tải lại và không hiện thông báo rỗng khi đang tải.
- [x] Mất mạng: thông báo ổn định, dễ đọc, không đưa ra cam kết sai về câu trả lời đã gửi.
- [ ] Smoke test trên Chrome điện thoại/desktop: đăng nhập giáo viên, chọn học sinh, làm 1 bộ đề, nộp bài, quay lại trang chủ.
- [ ] Rà soát toàn bộ màu, chữ và vùng bấm trong các trang giáo viên (cần kiểm tra theo màn hình).
- [ ] Thử lại quy trình nhập 1 file tuần và đối chiếu số câu từ Firestore.

## Giai đoạn 2 — Chất lượng nội dung và nhập dữ liệu
- Đối chiếu ngân hàng câu hỏi và bản công khai, cảnh báo bộ 0 câu/đáp án sai, chỉ rõ trạng thái.
- Báo cáo bản trùng theo môn-lớp-tuần; giữ bản tốt nhất, chỉ xóa sau khi có xác nhận và sao lưu.
- Nhập 35 tuần Tập làm văn bằng mẫu riêng; phân biệt trắc nghiệm tự chấm với bài thực hành viết giáo viên nhận xét.
- Gắn siêu dữ liệu khối, môn, tuần, bài; phân loại nội dung kiểm tra/luyện tập.

## Giai đoạn 3 — Hành trình học tập và hỗ trợ giáo viên
- Lộ trình học theo tuần, tìm kiếm linh hoạt và phân hóa bài tập theo năng lực.
- Giáo viên xem trước trước khi công khai, tạo báo cáo câu sai thường gặp.
- Ghi tiến độ cá nhân chỉ khi có cơ chế nhận diện học sinh phù hợp và quy trình bảo vệ dữ liệu.

## Giai đoạn 4 — Nội dung phong phú và độ tin cậy
- Thư viện học liệu, trò chơi ôn tập, Góc truyền thống số.
- Đo hiệu năng thực tế trên mạng yếu, thử tải đồng thời; rà soát phân quyền và kiểm soát chi phí Firebase.
- Chỉ phát triển AI học sinh sau khi có bộ lọc phù hợp lứa tuổi, giám sát giáo viên và chính sách dữ liệu.

## Tiêu chí nghiệm thu mỗi lần phát hành
1. Lint và Build thành công; workflow phát hành Production thành công.
2. Không đổi collection/rules dữ liệu khi chỉ cải thiện UI.
3. Các trang chủ, Tự luyện, cổng giáo viên và cổng học sinh không bị lỗi trắng trang.
4. Tối thiểu một bài làm thử từ đầu đến kết quả; hoạt động kiểm thử trực tiếp phải ghi rõ nếu chưa thực hiện.
5. Có đường dẫn workflow và SHA để đối chiếu, dự phòng quay lại bản trước.
