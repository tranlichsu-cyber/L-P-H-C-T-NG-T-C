# Học sinh tự đổi điểm lấy huy hiệu

Học sinh xem điểm trong Huy hiệu & cửa hàng avatar, bấm Đổi điểm lấy huy hiệu, rồi chọn avatar. Không cần giáo viên đồng bộ. Giữ tỷ lệ 20 điểm = 1 huy hiệu, giá avatar riêng 3–8 huy hiệu và không trừ điểm học tập.

Callable `automaticRewardPoints` yêu cầu Firebase Auth và kiểm tra lại mã cá nhân hoặc quyền của người tham gia phòng. Máy chủ lấy điểm tiết đã kết thúc, không lưu trữ, trong phạm vi 100 tiết lịch sử hiện tại; chấm lại đáp án tự luyện bằng đề gốc, chỉ lấy kết quả tốt nhất mỗi bài. Không tin số điểm do học sinh gửi. Bài thiếu đề gốc hoặc chờ chấm không tự cấp điểm. Lượt viết chưa có điểm chưa được tính.

VIEW cập nhật báo cáo, không cấp huy hiệu. CLAIM dùng giao dịch với mốc điểm cao nhất đã ghi nhận, bảo toàn avatar và huy hiệu đã dùng. Đổi lại không cấp trùng; giảm điểm lịch sử không thu hồi huy hiệu cũ. Cache báo cáo 60 giây; đọc riêng điểm của học sinh, không tải toàn bộ bài làm cả lớp. Giới hạn 2.000 phòng/lượt bài làm; vượt giới hạn báo lỗi, không tính thiếu âm thầm.

Triển khai cần Cloud Functions thế hệ 2 (Node 22), quyền triển khai Functions và gói Firebase hỗ trợ chức năng này. Không tự kích hoạt thanh toán. CI triển khai máy chủ trước frontend và rules; lỗi máy chủ dừng việc phát hành frontend. Cài `npm ci --prefix functions`, chạy `node scripts/build-reward-functions.mjs`, `node scripts/check-automatic-rewards.mjs` trước triển khai. Mã tạo trong functions/lib được bỏ qua Git.

Kiểm tra: build TypeScript/Vite, chính sách quy đổi/avatar, chấm lại và kiểm tra danh tính máy chủ, trình duyệt 1280/390px với dịch vụ mô phỏng, và bộ kiểm tra Firestore trong CI. Kiểm tra trình duyệt mô phỏng không chứng minh endpoint production hoạt động; trạng thái phát hành được báo riêng.
