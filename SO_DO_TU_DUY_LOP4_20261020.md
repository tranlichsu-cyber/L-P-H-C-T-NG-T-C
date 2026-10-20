# Sơ đồ tư duy lớp 4 — 20/10/2026

## Phạm vi và nguồn

Biên soạn theo sáu PDF SGK Kết nối tri thức với cuộc sống do giáo viên cung cấp. Danh tính sách, tên, số bài, trang bắt đầu và lịch Tiếng Việt nằm trong `src/data/curriculum/grade4.json`. Nội dung sơ đồ là lời tóm tắt do website biên soạn, không sao chép toàn bộ bài đọc, không thay thế hoạt động trong SGK.

| Môn / phần | Số sơ đồ | Cách sắp xếp |
| --- | ---: | --- |
| Toán | 73 | Tập một: bài 1–37; tập hai: bài 38–73 |
| Tiếng Việt — Đọc hiểu | 62 | Tập một: 32 bài; tập hai: 30 bài |
| Tiếng Việt — Luyện từ và câu | 35 | Tuần 1–18 ở tập một; tuần 19–35 ở tập hai |
| Tiếng Việt — Tập làm văn | 35 | Tuần 1–35, gắn mục tiêu, dàn ý, yêu cầu tự sửa đã đối chiếu SGK |
| Khoa học | 31 | Bài 1–31 |
| Lịch sử và Địa lí | 27 | Bài 1–27 |
| **Tổng** | **263** | **193 bài có số và 70 sơ đồ phân môn theo tuần** |

Luyện từ và câu và Tập làm văn gồm cả các tuần ôn tập, được ghi rõ là ôn tập. Không tạo số bài giả cho các nội dung theo tuần. Ba môn ngoài Tiếng Việt giữ thứ tự bài trong sách, không tự đặt tuần dạy. Các môn hoặc khối khác chưa có đủ sách đối chiếu không được tự sinh sơ đồ.

## Nội dung được chú ý trong rà soát

- Toán: quy tắc cộng/trừ phân số giữ mẫu khi đã cùng mẫu; phép chia chỉ đảo phân số thứ hai, số chia khác 0; ví dụ thế kỉ XXI bắt đầu năm 2001; chuyển đổi diện tích phân biệt độ dài; hình thoi phân biệt hình bình hành.
- Khoa học: chiều mũi tên chuỗi thức ăn; hô hấp của cây cả ngày và đêm, quang hợp cần ánh sáng; nước trong không đồng nghĩa uống được; không tự nhận định nấm ăn qua màu sắc; không nhảy xuống nước cứu người; tránh thử vật nóng bằng tay.
- Lịch sử và Địa lí: dùng địa danh trong bản SGK cập nhật; Mù Cang Chải/Sa Pa ở Lào Cai, Hoàng Su Phì ở Tuyên Quang; phố cổ Hội An thuộc thành phố Đà Nẵng; phân biệt tên nhà máy thủy điện với tên tỉnh. Bài 5 có đủ phần dân cư, không chỉ ba hoạt động khai thác tự nhiên.
- Đọc hiểu: giữ riêng nhân vật và diễn biến của từng bài; gọi rõ truyền thuyết và giai thoại; không chuyển giai thoại sáng tác bản Ánh trăng thành sự kiện đã xác minh. Bài Ngô-rông-gô-rô không lặp số liệu “25 000 loài” thiếu hợp lí trong bản đọc; dùng mô tả “nhiều động vật”. Bài Băng tan nói rõ băng trên đất liền tan góp phần làm nước biển dâng.
- Tập làm văn: dùng mục tiêu, dàn ý, tiêu chí sửa bài của 35 tuần đã có; không đưa thêm bộ câu hỏi trắc nghiệm hoặc thay đổi bài viết học sinh.

## Trải nghiệm

Đường dẫn thư viện: `/hoc-lieu/so-do-tu-duy`; bài: `/hoc-lieu/so-do-tu-duy/:lessonId`.

Môn → phần (riêng Tiếng Việt) → tập sách → bài. Tìm kiếm hỗ trợ tiếng Việt không dấu. Bài có các nhánh nối màu, chế độ che/mở để tự nhớ, in/lưu PDF vẫn hiện đủ nhánh, bài trước/tiếp trong cùng tập và liên kết nội dung Tiếng Việt cùng tuần.

Có lối vào từ trang chủ, Tự luyện, kho bài giảng giáo viên. Giữ đường dẫn sơ đồ Bài 5 đã công khai. Nội dung nằm trong tài nguyên tĩnh, tải theo trang; không thêm truy vấn Firestore, không thêm API AI, không chạy di chuyển dữ liệu điểm hoặc ngân hàng câu hỏi.

## Kiểm tra

`scripts/check-mindmaps.mjs` kiểm tra đủ 263 ID không trùng, đúng tên/môn/số/trang theo danh mục, 35 tuần ở từng phân môn, bộ lọc, tìm không dấu và các điểm kiến thức cần bảo vệ khỏi lỗi hồi quy. Kiểm tra này không thay cho đánh giá chuyên môn của giáo viên.

Kiểm tra trình duyệt thực tế ở 390px và 1280px: luồng chọn môn/phần/tập/bài, che/mở, in, tìm kiếm, chuyển bài, quay lại đúng nhóm và đường dẫn không hợp lệ. Mở từng đường dẫn để kiểm tra sơ đồ không rỗng, đúng tên và số nhánh.
