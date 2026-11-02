# Phát triển kho học liệu mô hình

## Phạm vi bản cập nhật

- Danh mục ưu tiên tìm kiếm và bài học trước phần giới thiệu nổi bật, huy hiệu.
- Tìm theo từng từ, không phân biệt dấu tiếng Việt, chữ hoa/thường; kết hợp môn, khối và trạng thái. Có thông báo kết quả, trạng thái rỗng và nút đặt lại.
- Vòng tuần hoàn nước: hoạt động gợi ý 15 phút, mục tiêu, 5 nhiệm vụ, dấu chọn tiến độ tạm thời, hướng dẫn giáo viên và phiếu in A4.
- Chỉ tạo iframe 3D sau khi người học yêu cầu. Chuyển sang nội dung khác sẽ tháo iframe; người học có nút dừng 3D và đọc văn bản.
- Vòng lặp dựng hình của mô hình nước dừng khi tài liệu bị ẩn và tiếp tục với một vòng lặp khi quay lại; giới hạn pixel ratio trên màn hình nhỏ. Không thay đổi mô hình vật lý hay khẳng định đã đo được mức tăng FPS.
- Sửa đường dẫn kho QR và trò chơi sang các route giáo viên hiện có. Các trang này vẫn áp dụng quyền đăng nhập của ứng dụng.
- Ghi rõ học liệu tim là mở rộng; không tự xác nhận ánh xạ chương trình hoặc bộ sách.

## Kiểm chứng

Chạy `npm ci`, `npm run build`, `node scripts/check-model-learning.mjs`, `node scripts/check-new-models.mjs`, `node scripts/check-model-realism.mjs`.

Kiểm tra trình duyệt: tìm `tuan hoan nuoc` có một kết quả, từ khóa không tồn tại có hướng dẫn khôi phục, đặt lại có 13 kết quả; tích một nhiệm vụ cập nhật 1/5; chế độ văn bản hoạt động khi chưa tải 3D; bấm bắt đầu tạo iframe, dừng 3D tháo iframe; phiếu có bố cục và điều khiển in.

Chưa đo hiệu năng trên thiết bị học sinh thực tế, chưa kiểm thử bản in giấy hoặc mọi kích thước màn hình. Cần thử tại lớp trước khi công bố hiệu quả dạy học. Bản sửa không chỉnh cơ sở dữ liệu, phân quyền hoặc quy trình triển khai sản xuất.

## Tiêu chí cho giai đoạn tiếp theo

1. Giáo viên duyệt từng học liệu: yêu cầu cần đạt, bộ sách, lớp, phạm vi bắt buộc/mở rộng, nguồn kiến thức và ngày duyệt. Không gán mã năng lực số khi chưa đối chiếu nguồn chính thức.
2. Thử bài mẫu trong tiết học: học sinh có gọi đúng quá trình, giải thích được hiện tượng và nêu được cách bảo vệ nước hay không. Dùng kết quả này để sửa nhiệm vụ trước khi nhân rộng.
3. Đo tải, bộ nhớ và tốc độ khung hình trên điện thoại/máy lớp học; ưu tiên mức chất lượng phù hợp và phục hồi lỗi WebGL. Hiện chỉ mới giới hạn độ phân giải và quản lý vòng đời mô hình nước.
4. Kiểm thử bàn phím, độ tương phản, chữ khi trình chiếu, màn hình nhỏ, lời đọc và thao tác cảm ứng. Chưa xem bản sửa này là chứng nhận tuân thủ tiêu chuẩn tiếp cận.
5. Sau khi bài mẫu đạt yêu cầu, xây dựng hồ sơ nhiệm vụ tương tự cho Đền Hùng và chuỗi thức ăn; ưu tiên giải thích và sản phẩm học tập hơn số lượt bấm/huy hiệu.

## Nguồn tham khảo

- USGS Water Science School, Water cycle: https://www.usgs.gov/water-science-school/water-cycle
- CAST, Universal Design for Learning: https://www.cast.org/what-we-do/universal-design-for-learning/
- MDN, WebGL best practices: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices

Các tài liệu trên hỗ trợ nội dung khoa học và lựa chọn thiết kế; không thay thế chương trình, sách giáo khoa hoặc phê duyệt chuyên môn của nhà trường.
