# Giảm tải mô hình sau phản hồi bị lag

- Không cài bảng nổi “Góc nhìn & chuyển động” khi mở mô hình. Các hàm thử nghiệm vẫn còn để tránh thay đổi không liên quan, nhưng không có bảng quan sát/mái trong suốt tự xuất hiện.
- Tự động mặc định: pixel ratio tối đa 1; không có bóng đổ, bản đồ phản xạ môi trường, lấy mẫu bump map hoặc bước tạo hình vát cạnh.
- Chi tiết: người dùng chủ động bật lại hiệu ứng, pixel ratio giới hạn 1,5. Bản đồ môi trường và cạnh vát chỉ được tạo khi chọn mức này.
- Bộ chặn khung hình đặt trước cập nhật hình học và dựng cảnh: tối đa 30 khung/giây ở mặc định, 24 ở tiết kiệm/thiết bị ít lõi hoặc màn hình nhỏ; 60 ở Chi tiết. Tab ẩn không cập nhật cảnh.
- Tắt khử răng cưa đa mẫu khi tạo renderer. Giữ mô hình, nhãn, câu hỏi và nội dung bài học.
- Các tài nguyên được gắn phiên bản performance1 để không dùng lẫn thư viện cũ trong bộ nhớ đệm.

Đây là giới hạn và cấu hình được kiểm chứng bằng mã, không phải kết quả đo FPS trên thiết bị người dùng. Chưa thể xác nhận hết lag hoặc đo hiệu năng WebGL bằng Cloud Browser hiện tại.

`check-model-performance.mjs` thực thi cấu hình mặc định và chuyển mức chất lượng trên cảnh Three.js với đồng hồ giả: xác nhận không tạo bảng nổi, không chạy hiệu ứng nặng mặc định, giới hạn khung hình nằm trước vòng cập nhật, và các tệp của 13 mô hình có mã phiên bản đồng bộ. Build, lint và các kiểm tra hồi quy hiện có được giữ trong CI.
