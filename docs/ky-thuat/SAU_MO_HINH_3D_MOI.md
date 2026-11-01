# Sáu mô hình 3D mới

Sáu mục trước đây ghi “Đang phát triển” đã có sa bàn WebGL và đường dẫn riêng. Kho hiện có 13 mô hình sử dụng được. Mỗi mô hình mới có sáu điểm khám phá, ba câu hỏi có chấm kết quả, xoay/nghiêng/thu phóng, nhãn, góc toàn cảnh, tham quan tự động và toàn màn hình.

| Đường dẫn | Mô hình và tương tác riêng |
| --- | --- |
| `/mo-hinh/thap-dinh-duong` | Sáu tầng nhóm thực phẩm; chuyển sang đĩa ăn, thêm cơm/rau/cá/quả/sữa/nước, nhận xét mức đa dạng và làm lại. Không đưa ra khẩu phần y khoa cho từng học sinh. |
| `/mo-hinh/co-the-nguoi-tuan-hoan` | Bốn buồng tim, cả hai phổi, đường máu ít/giàu ô-xi; nhịp co bóp, tạm dừng và thanh tốc độ; mở vỏ tim để quan sát. Màu xanh là quy ước của sơ đồ. |
| `/mo-hinh/trong-dong-dong-son` | Thân trống xoay được, mặt có ngôi sao 14 tia, vành họa tiết, quai và cấu tạo tang/thân/chân; nút gõ tạo âm minh họa. Hình học theo dáng trống Ngọc Lũ, không khẳng định mọi trống Đông Sơn đều có 14 tia. |
| `/mo-hinh/van-mieu-quoc-tu-giam` | Cổng, Đại Trung Môn, Khuê Văn Các, giếng vuông, đủ 82 cụm bia trên rùa và khu nhà phía sau. Tỉ lệ và hoa văn giản lược. |
| `/mo-hinh/nha-rong-tay-nguyen` | Sàn trên cột, mái cao, cầu thang, dàn cồng, sân làng và bếp lửa chuyển động; nghe âm cồng tổng hợp minh họa. Không sử dụng âm này như bản thu di sản. |
| `/mo-hinh/dia-dao-cu-chi` | Đóng/mở khối đất để quan sát ba tầng hầm, các nhánh, đường xuống, phòng, bếp và đường phân tán khói, lỗ thông hơi; chọn điểm trong hầm sẽ tự mở mặt cắt. Không phải bản đo đạc hay chỉ dẫn thực địa. |

Các cảnh được dựng từ hình học 3D, không phải ảnh phẳng được kéo/zoom. Ảnh xem trước trong kho được chụp từ cảnh WebGL. Không cần tài nguyên mạng ngoài, tài khoản hay dữ liệu Firebase để dùng sáu mô hình này.

## Cấu trúc

- `src/pages/models/WorkshopModelPage.tsx`: trang React dùng đường dẫn `/mo-hinh/:modelId`, chỉ nhận sáu ID hợp lệ; đường dẫn mô hình cũ giữ bộ trang riêng.
- `public/models/*-3d.html`: sáu trang độc lập mới.
- `public/models/lib/model-workshop.js` và `.css`: dựng cảnh, tương tác, âm tổng hợp, tour và câu hỏi. Nội dung đặt ở `public/models/data/new-models.json`.
- `src/data/models/modelsCatalog.ts`: trạng thái sẵn có, ảnh và đường dẫn.

Tour giữ nguyên điểm và thời gian đọc còn lại khi tiếp tục; tự tạm dừng khi đổi tab trình duyệt hoặc thao tác camera. Các nút điểm khám phá và câu hỏi hỗ trợ bàn phím. Mở câu hỏi không tự tạo dữ liệu điểm trên tài khoản học sinh. Toàn bộ điểm của phần thử tài chỉ ở trong phiên trang.

## Kiểm tra

```sh
node scripts/check-new-models.mjs
node scripts/check-model-realism.mjs
npm run lint
npm run build
```

Kiểm tra hình học chạy chính các bộ dựng cảnh: mọi đỉnh/pháp tuyến hữu hạn, sáu điểm mỗi mô hình, 18 câu hỏi hợp lệ, 82 bia, hai nhánh tuần hoàn phổi, thứ tự ba tầng hầm và đủ đường dẫn/ảnh cho 13 mục trong kho.

Kiểm tra trình duyệt:

```sh
# Cần Vite chạy sẵn và Playwright + Chromium.
MODEL_BROWSER_TOOLS=/tmp/model-browser-tools/node_modules/playwright \
CHROMIUM_EXECUTABLE=/usr/bin/chromium node scripts/check-new-models-browser.cjs
```

Bài kiểm tra chặn tải ngoài localhost, kiểm tra sáu điểm, nhãn, camera, tour, điều khiển riêng, chấm đúng/sai, màn hình 390px, sáu trang React và đường dẫn không tồn tại. Các mô hình lịch sử và giải phẫu vẫn là bản minh họa giáo dục, không phải bản quét hiện vật hoặc giải phẫu chuyên môn.
