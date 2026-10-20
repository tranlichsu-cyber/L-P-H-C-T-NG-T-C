# Sơ đồ tư duy trực quan — 21/10/2026

Áp dụng cho 263 sơ đồ lớp 4 và sơ đồ chi tiết khai thác tự nhiên ở Trung du và miền núi phía Bắc.

- Chủ đề trong đám mây ở giữa; ba hoặc bốn nhánh bố trí quanh tâm. Đường SVG cong nối từ tâm đến từng nhánh, có viền trắng và màu riêng, giữ cả khi in.
- Bốn màu xanh lá, xanh dương, cam, tím; chữ tương phản trên nền sáng. Nhánh dùng tiêu đề ngắn, biểu tượng theo ý nghĩa; phân số Toán trình bày tử và mẫu theo chiều dọc.
- 16 tranh minh họa mới tạo cho học liệu: ruộng bậc thang, thủy điện, khoáng sản, đọc sách, Toán, thực vật, viết, di sản, nước, không khí, âm thanh, nhiệt, dinh dưỡng, động vật, nấm, địa lí. Tranh là minh họa trang trí; kiến thức và tên địa danh vẫn là chữ HTML đối chiếu sách.
- Trung tâm một số bài viết và bài có tiêu đề dài dùng tên chủ đề rút gọn; tiêu đề SGK đầy đủ còn ở đầu bài và nguồn bản in. Không thay nội dung 263 bản kiến thức đã đối chiếu.
- Trên điện thoại: khung cuộn, nút xem toàn sơ đồ/đọc chữ lớn, nút đến từng nhánh và chủ đề. Điều khiển bằng bàn phím; SVG/tranh trang trí không tạo nội dung lặp cho trình đọc màn hình. Giữ chế độ che/mở nhánh tự nhớ.
- In/lưu PDF dùng khổ A4 ngang, hiện đủ kiến thức kể cả khi đang che nhánh. Chỉ in sơ đồ và nguồn, không kèm điều hướng hoặc danh sách bài.
- Giữ thư viện theo môn, tập, bài; Tiếng Việt tách Đọc hiểu, Luyện từ và câu, Tập làm văn. Giữ đường dẫn cũ của sơ đồ thiên nhiên.

## Tệp chính

`src/components/learning/IllustratedMindMap.tsx` dùng chung hai trang. `mindmapVisuals.ts` chọn tranh/biểu tượng và tên chủ đề. `src/pages/lessonMaps.css` bố trí hướng tâm và bản in. Hai ảnh PNG có tên phiên bản nằm ở `public/illustrations/`, được lưu đệm HTTP dài hạn qua cấu hình Hosting; tải dùng lại cho các bài khác. Không thêm thư viện hoặc dịch vụ API, không tăng lượt đọc Firestore, không di chuyển dữ liệu học sinh.

## Xác nhận

- `check-mindmaps.mjs`: vẫn đủ 193 bài và 70 bản phân môn theo tuần, đúng danh mục và trang nguồn.
- `check-mindmap-visuals.mjs`: 16 nhóm tranh, hình phù hợp bài Khoa học, tên chủ đề, bốn màu riêng, ảnh có phiên bản và chính sách cache; tránh nhầm “Trường Sa” thành “ruộng”, “bảo vệ nước” thành gió, “trong lành” thành nhiệt hoặc “Nam Bộ” thành mỏ.
- Trình duyệt Chromium 390/1280/1600px: tâm ở giữa, đủ đường nối, không tràn trang, che/mở nhánh, đọc phân số, xem tổng thể và chọn nhánh để đọc lớn.
- Xuất PDF thực tế **264 sơ đồ**: mỗi sơ đồ **một trang A4 ngang**, không chồng nhánh vào trung tâm hoặc cắt thẻ kiến thức. Kiểm tra thêm in khi nhánh đang che vẫn có đủ nội dung.
- Kiểm tra trực quan ảnh chụp màn hình và PDF; lint/build trước triển khai. Giữ các cảnh báo lint cũ ngoài phạm vi thay đổi.
