# Rà soát các mô hình 3D — 01/11/2026

Phạm vi: bảy mô hình đang có trong kho. Mục tiêu là tăng độ đúng của hình dáng và chuyển động, giảm màu nhựa/neon, đồng thời giữ chức năng khám phá và trình chiếu.

| Mô hình | Những điểm đã sửa |
| --- | --- |
| Địa cầu | Ảnh đất liền và mây lưu tại máy; đường biên lục địa thật làm dự phòng; giảm cháy sáng; nút tìm Việt Nam xoay đúng về Đông Nam Á; chuyển động quay theo thời gian thay vì số khung hình. |
| Địa hình Việt Nam | Thay khối hộp/nón rời bằng đường bao đất liền Natural Earth 1:50m và bề mặt liên tục; bỏ tuyết thường trực; thống nhất Bắc–Nam; cập nhật vị trí các góc khám phá và điểm đánh dấu khi đổi mức phóng đại độ cao. |
| Đê sông Hồng | Màu đất, cỏ và nước phù sa tự nhiên hơn; mặt cắt có lớp đất; đá kè bám mái đê; thuyền có thân cong, mái chèo và đi theo mực nước; nhà mái hai dốc và cây có tán; bỏ số đo mực lũ giả chính xác. |
| Bạch Đằng 938 | Thân thuyền thuôn, có mép mạn, ghế/mái chèo và buồm cong; ẩn thuyền khi chuẩn bị trận địa; thuyền nổi khi triều cao, mắc cọc khi triều thấp ở giai đoạn giao chiến; không trình bày cờ minh họa như một phục dựng cờ lịch sử. |
| Vòng tuần hoàn nước | Núi là bề mặt mềm thay cho nón đều; mây mịn; mưa là vệt rơi và dừng ở bề mặt địa hình; hơi nước được ghi rõ là hạt chỉ hướng minh họa; nước ngầm là tầng chứa nước trong đất đá, không phải ống lớn; chuyển động phụ thuộc thời gian. |
| Chuỗi thức ăn | Cào cào có sáu chân khớp; ếch có chân và đồng tử; rắn/nấm có màu tự nhiên hơn; bệ và sinh vật không trôi nổi; năng lượng không chạy vòng về cây; đường nét đứt riêng biểu diễn tái sử dụng chất khoáng. |
| Đền Hùng | Rà soát WebGL, điểm khám phá và bố cục hiện tại; các bài kiểm tra nền công trình và tour được chạy lại. |

Các cảnh ngoài trời dùng nền sáng dịu. Thanh tiêu đề và hàng nút được xếp lại trên điện thoại; camera tự điều chỉnh góc nhìn theo tỉ lệ màn hình. Bộ dựng hình dùng cùng cách xử lý màu, tông sáng, chất liệu thô và chuyển camera theo thời gian; thao tác kéo dừng chuyển camera tự động. Công cụ chú thích ở các mô hình còn sử dụng được thu gọn mặc định và dời khỏi hàng nút góc nhìn. Đền Hùng không tải công cụ này.

## Giới hạn độ chân thực

- Sa bàn Việt Nam dùng **đường bao địa lí thật nhưng độ cao minh họa**, không sử dụng DEM đo đạc. Đảo là các ký hiệu vị trí tương đối; đây không phải hải đồ.
- Kiến trúc, thuyền lịch sử và sinh vật là hình học phục vụ bài học, không phải bản quét 3D hay phục dựng khảo cổ theo kích thước thật. Sinh vật được phóng đại để dễ quan sát.
- Mực triều, lũ, mưa và dòng năng lượng minh họa cơ chế; không phải mô hình dự báo thủy văn hay sinh thái định lượng.
- Nguồn và checksum tài nguyên: [`public/models/data/SOURCES.md`](../../public/models/data/SOURCES.md), [`SHA256SUMS`](../../public/models/data/SHA256SUMS).

## Kiểm tra

Từ thư mục repository:

```sh
node scripts/check-model-realism.mjs
node scripts/check-hung-temple-layout.mjs
node scripts/check-hung-temple-tour.mjs
sha256sum -c public/models/data/SHA256SUMS
npm run lint
npm run build
```

Bài kiểm tra hình học xác nhận các đỉnh và pháp tuyến hữu hạn, thân thuyền thuôn, bề mặt núi, phạm vi tọa độ Việt Nam, định dạng ảnh và cú pháp script trong cả bảy mô hình.

Kiểm tra Chromium thực tế với kết nối ngoài bị chặn: địa cầu tải ảnh tại máy và hướng Việt Nam về phía người xem; địa hình đổi độ nổi; thuyền theo mực nước; trận Bạch Đằng đổi trạng thái theo giai đoạn; mưa hoạt động; dòng năng lượng không khép kín; bệ sinh vật đứng yên; Đền Hùng mở điểm khám phá. Kiểm tra canvas khi đổi xuống chiều rộng 390px và lỗi JavaScript từng trang.

Có thể chạy kiểm tra trình duyệt bằng `scripts/check-models-browser.cjs` khi máy đã có Playwright/Chromium. Để giữ nguyên dependency và lockfile của ứng dụng:

```sh
npm install --prefix /tmp/model-browser-tools --no-audit --no-fund playwright
# Khởi động npm run dev ở một terminal khác.
MODEL_BROWSER_TOOLS=/tmp/model-browser-tools/node_modules/playwright \
CHROMIUM_EXECUTABLE=/usr/bin/chromium node scripts/check-models-browser.cjs
```

Nếu dùng Chromium do Playwright quản lý, bỏ biến `CHROMIUM_EXECUTABLE`. Có thể đổi `MODEL_BASE_URL` khi Vite chạy ở cổng khác. Bài kiểm tra chặn tải tài nguyên ngoài máy local và xác nhận canvas trên màn hình hẹp.
