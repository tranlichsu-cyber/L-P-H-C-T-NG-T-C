# Nâng cấp quan sát mô hình

## Tính năng

Cả 13 mô hình có bảng “Góc nhìn & chuyển động”, mặc định thu gọn để giữ không gian quan sát:

- Góc ban đầu, từ trên, phía trước và bên cạnh. Các góc giữ khoảng cách đến tâm quan sát; đổi góc dừng tự xoay và tạm dừng tham quan tự động nếu đang chạy.
- Dừng/tiếp tục chuyển động. Hiệu ứng nước, mây, sinh vật, nhịp tim, đoàn hành hương và tự xoay dừng trong khi học sinh vẫn có thể xoay/thu phóng bằng tay. Thời gian mô phỏng không nhảy khi tiếp tục. Nút tạm dừng chuyến tham quan vẫn dùng riêng.
- “Mái trong suốt” chỉ xuất hiện với các nhóm mái được đánh dấu tại Đền Hùng, Văn Miếu và nhà rông. Vật liệu tường, cột, hiện vật và nước được giữ nguyên. Tắt chế độ hoặc rời trang khôi phục đúng vật liệu gốc.

Thay đổi này hoàn thiện khả năng quan sát cấu trúc và dừng hình khi dạy học; không bổ sung dữ liệu khảo sát, tài sản quét 3D hoặc thay đổi nội dung kiến thức.

## Kiểm chứng

`check-model-inspection.mjs` thực thi API và các nút thực tế với cảnh Three.js, đồng hồ và DOM thử nghiệm: bốn tư thế camera hữu hạn, khoảng cách được giữ, dừng/tiếp tục không nhảy thời gian, camera bằng tay vẫn hoạt động, mái dùng vật liệu riêng rồi khôi phục đúng, và 13 trang tham chiếu tài nguyên có phiên bản mới.

Kiểm tra lại build/lint, bộ kiểm tra hình học, bài học và tham quan hiện có. Cloud Browser của phiên trước không tạo được WebGL ngay cả với bản gốc, nên kiểm chứng bằng mã/DOM không thay thế việc xem cảnh 3D, bóng đổ và hiệu năng trên thiết bị có WebGL.
