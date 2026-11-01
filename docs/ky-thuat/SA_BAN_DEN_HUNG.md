# Sa bàn 3D Đền Hùng

Mở `/mo-hinh/den-hung`. Thẻ **Sa bàn 3D tương tác** mở mặc định. Bản độc lập ở `/models/den-hung-3d.html` dùng cùng cảnh WebGL. Thẻ ảnh tham khảo đã được gỡ khỏi giao diện.

- Kéo chuột hoặc một ngón tay để xoay và nghiêng. Cuộn chuột, chụm hai ngón hoặc dùng nút +/− để thu phóng. Nút **Toàn cảnh** đưa camera về góc nhìn ban đầu.
- Bấm công trình, nhãn nổi hoặc tên địa điểm để khám phá. Danh sách nút hỗ trợ bàn phím. Kéo camera không chọn nhầm công trình; chụm hai ngón cũng không kích hoạt điểm khám phá.
- Đường bậc đá nối Cổng Đền, Đền Hạ, Đền Trung, Đền Thượng, Lăng Hùng Vương và Đền Giếng. Đoàn rước di chuyển theo tuyến này.
- **Tham quan tự động** đưa camera lần lượt tới sáu điểm. Có tiến độ, tạm dừng/tiếp tục, bỏ qua điểm và kết thúc. Thời gian dừng dựa theo độ dài nội dung. Tiếp tục giữ nguyên điểm đang xem và thời gian còn lại; chuyển sang tab trình duyệt khác hoặc kéo camera sẽ tạm dừng tour.
- Dùng **Chiếu toàn màn hình** khi trình chiếu. Thuyết minh tiếng Việt phụ thuộc giọng đọc được trình duyệt/hệ điều hành cung cấp; tour vẫn chạy bằng thông tin chữ khi không có bộ đọc.

Bố cục được dựng lại theo `public/images/models/den-hung-panoramic-diorama.jpg`: cổng ở chính diện, Đền Hạ bên trái, Đền Trung và Đền Thượng lên dần ở giữa, lăng ở sườn phải và Đền Giếng dạng nhà bát giác cạnh hồ phía trước. Góc toàn cảnh mở từ phía chính diện để đối chiếu với ảnh; các mặt bên và phía sau là phần tái dựng bổ sung. Ảnh không được dán lên mặt phẳng để giả mô hình.

Cảnh gồm địa hình liên tục, các nền sân, mái ngói cong, tiền đường và hậu cung, cổng vòm hai tầng, giếng, cây rừng và vật liệu tạo tại máy. Cây rừng, bậc đá và ngói được vẽ theo lô để giảm số lệnh vẽ. Thư viện Three.js và OrbitControls có sẵn trong `public/models/lib`, không cần tải mô hình từ dịch vụ bên ngoài.

Đây là bản tái dựng phục vụ giảng dạy, chưa phải mô hình khảo sát hay quét 3D thực địa. Tỉ lệ, vị trí tương đối và chi tiết kiến trúc cần đối chiếu hồ sơ, ảnh nhiều góc và số đo di tích trước khi sử dụng như tài liệu kiến trúc chính xác.

## Kiểm tra

Từ thư mục repository:

```sh
npm run dev
npm run lint
npm run build
node scripts/check-hung-temple-tour.mjs
node scripts/check-hung-temple-layout.mjs
```

Bài kiểm thử tour chạy chính bộ điều khiển trong HTML với đồng hồ giả lập: sáu điểm theo thứ tự, thời gian còn lại khi tạm dừng, tiếp tục không nhảy điểm, tạm dừng khi ẩn tab, hoàn thành, khởi động lại, dọn timer và trường hợp không có bộ đọc.

Kiểm tra bằng trình duyệt có WebGL: kéo ngang/dọc, zoom hai chiều, bấm cả bốn đền, bấm nhãn nổi sau khi đổi góc nhìn, bắt đầu/tạm dừng/tiếp tục/kết thúc tour, thử ở chiều rộng 390px và chế độ toàn màn hình. Thông báo dự phòng xuất hiện nếu không khởi tạo được WebGL.
