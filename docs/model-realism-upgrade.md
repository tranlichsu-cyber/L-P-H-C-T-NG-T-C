# Nâng cấp hình ảnh mô hình 3D

## Những thay đổi đã thực hiện

| Mô hình | Nâng cấp trong bản này |
| --- | --- |
| Đền Hùng | Giữ bố cục có sẵn; thêm bề mặt gỗ/đá/ngói, UV mái, chi tiết xà đỡ và nước trong khu giếng. |
| Văn Miếu | Chi tiết cột, chân tảng, xà và cửa của các nhà; vật liệu đá/gỗ/ngói, góc cạnh có vát. Giữ 82 bia và các điểm khám phá. |
| Trống đồng | Gờ nổi đồng tâm, hạt trang trí được gộp thành một lô dựng hình, bề mặt đồng có biến thiên nhẹ. Hoa văn tiếp tục là minh họa. |
| Nhà rông | Bề mặt mái tranh và mặt hồi có UV, khung mái và mối buộc; giữ hoạt động nghe cồng và tham quan. |
| Địa đạo | Bề mặt đất, vách có vân lớp và nền đường hầm; giữ ba tầng, mặt cắt, bếp và các điểm khám phá. |
| Vòng tuần hoàn nước | Địa hình mượt hơn, bề mặt đá/đất, gợn mặt nước chuyển động và cụm cây lá rộng thay khối nón; giữ diễn giải hơi nước là ký hiệu minh họa. |
| Đê sông Hồng | Bề mặt đất/đá/đường đê, vân gỗ thuyền và vải buồm, gợn nước và hai vùng cây trồng theo hàng. |
| Bạch Đằng | Vật liệu gỗ/vải, gợn nước, cụm cây ven bờ; giữ diễn biến thủy triều và trận đánh hiện có. |
| Địa hình Việt Nam | UV mặt địa hình và chi tiết bề mặt, gợn nước; giữ nguyên đường bờ, nhãn và các vị trí hiện có. |
| Quả địa cầu | Giữ ảnh bản đồ cục bộ, tăng khả năng lấy mẫu bản đồ, sửa bề mặt thành phi kim, viền khí quyển phụ thuộc góc nhìn và lớp mây bớt sáng cộng dồn. |
| Chuỗi thức ăn | Bề mặt sinh vật, mắt/cánh châu chấu, chuyển động cánh nhỏ và vùng cây trồng; các bệ và mũi tên kiến thức giữ nguyên. |
| Tim | Bề mặt mô nhẹ và ánh sáng môi trường; giữ cấu trúc, màu quy ước, đường đi, mặt cắt và nhịp tim minh họa. |
| Tháp dinh dưỡng | Thực phẩm mẫu trên các tầng, bề mặt lá/quả và cạnh mềm; giữ hoạt động ghép bữa ăn. |

## Lớp dựng hình chung

- Bản đồ bề mặt 256 × 256 tạo bằng mã, có bộ nhớ đệm; không tải ảnh bên ngoài.
- Vát cạnh một số khối kiến trúc/đồ vật, giữ nguyên kích thước bao.
- Ánh sáng môi trường từ bản đồ bầu trời tạo tại chỗ trên thiết bị phù hợp; đèn gốc vẫn hoạt động khi không tạo được bản đồ môi trường.
- Tùy chọn Tự động / Tiết kiệm / Chi tiết điều chỉnh độ phân giải dựng hình và bóng. Không thay đổi nội dung học tập.
- Cây và cây trồng dùng InstancedMesh để gộp nhiều chi tiết. Chuyển động bề mặt nước/cánh tuân theo lựa chọn giảm chuyển động của thiết bị.

## Giới hạn về độ chân thực

Đây là nâng cấp hình ảnh và hình học bằng mã của các mô hình hiện có. Chưa bổ sung tài sản được dựng/quét từ hiện vật, ảnh khảo sát mới hoặc dữ liệu độ cao DEM. Không xem địa hình, kiến trúc, chi tiết trang trí và tốc độ diễn biến là bản tái dựng đo đạc. Bước tiếp theo cần nguồn tham chiếu được xác nhận, tài sản có quyền sử dụng và thẩm định chuyên môn khi thay hình dáng hoặc thông tin khoa học.

## Kiểm chứng

- Build TypeScript/Vite và lint của dự án.
- `check-realism-upgrade.mjs`: 11 loại bề mặt có cache, vật liệu nước phi kim, vát cạnh giữ kích thước, hình học hữu hạn, cây/ruộng gộp lô, chuyển chất lượng và 13 trang tích hợp.
- Các kiểm tra mô hình, bài học, bố cục và tham quan Đền Hùng hiện có.
- Môi trường Cloud Browser báo lỗi tạo WebGL context với cả bản gốc trên website công khai và bản nâng cấp. Vì vậy chưa xác nhận ảnh dựng 3D, chất lượng shader, bóng đổ, tốc độ khung hình hoặc bố cục trong cảnh thực tế bằng trình duyệt này. Cần kiểm tra trên thiết bị có WebGL; không công bố mức tăng hiệu năng đã đo.
