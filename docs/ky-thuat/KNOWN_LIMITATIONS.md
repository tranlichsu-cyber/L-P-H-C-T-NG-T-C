# KNOWN LIMITATIONS (CÁC GIỚI HẠN KỸ THUẬT ĐÃ XÁC ĐỊNH PHIÊN BẢN 1.0)

Tài liệu ghi nhận các giới hạn kỹ thuật đã biết của phiên bản `v1.0.0`:

1. **Yêu cầu kết nối Internet**: 
   - Ứng dụng PWA hỗ trợ cache giao diện (App Shell) khi mất mạng, tuy nhiên các tính năng đồng bộ tương tác Realtime giữa Giáo viên và Học sinh bắt buộc cần kết nối Wi-Fi/4G.
2. **Phiên làm việc Vô danh của Học sinh**:
   - Tài khoản học sinh sử dụng Firebase Anonymous Auth nên phụ thuộc vào bộ nhớ LocalStorage của trình duyệt thiết bị. Nếu học sinh xóa lịch sử trình duyệt, thiết bị sẽ tạo phiên vô danh mới khi gia nhập phòng tiếp theo.
3. **Quy mô phòng học tối ưu**:
   - Ứng dụng được thiết kế tối ưu nhất cho quy mô lớp học tiểu học từ **30 đến 50 học sinh/phòng**. Chưa khuyến nghị sử dụng cho hội trường lớn trên 500 thiết bị cùng lúc.
4. **Hạn mức Firebase Spark (Free Tier)**:
   - Hệ thống tối ưu chạy trên gói miễn phí 50,000 Reads/ngày. Nếu trường học sử dụng trên 30 tiết dạy/ngày, quản trị viên cần theo dõi Firebase Console để tránh chạm trần hạn mức.
