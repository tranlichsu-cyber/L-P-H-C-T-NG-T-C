# HƯỚNG DẪN XỬ LÝ SỰ CỐ VÀ KHẮC PHỤC LỖI (TROUBLESHOOTING)

## 1. HỌC SINH KHÔNG VÀO ĐƯỢC PHÒNG HỌC LIVE
- **Nguyên nhân 1**: Mã phòng học đã hết hạn hoặc Giáo viên đã bấm "Kết thúc phòng".
  - *Khắc phục*: Giáo viên kiểm tra lại trạng thái phòng trên giao diện máy tính.
- **Nguyên nhân 2**: Học sinh gõ sai mã phòng.
  - *Khắc phục*: Cho học sinh quét mã QR Code trên máy chiếu thay vì nhập mã 6 chữ số.

## 2. HIỂN THỊ THÔNG BÁO "MẤT KẾT NỐI MẠNG"
- **Nguyên nhân**: Mạng Wi-Fi trong lớp học bị gián đoạn.
- **Xử lý**: 
  - Giao diện Học sinh sẽ tự động hiển thị thanh màu cam thông báo *"Mất kết nối mạng! Câu trả lời chưa được gửi"*.
  - Nhắc học sinh **giữ nguyên màn hình**, không bấm refresh. Khi Wi-Fi hoạt động trở lại, đáp án sẽ được tự động gửi đi.

## 3. LỖI KHÔNG HIỂN THỊ CÂU HỎI TRÊN THIẾT BỊ HỌC SINH
- **Nguyên nhân**: Trình duyệt bị lưu cache phiên bản cũ.
- **Xử lý**:
  - Vuốt xuống để tải lại trang hoặc bấm biểu tượng Cài đặt PWA chọn **"Tải phiên bản mới"**.

## 4. LỖI VƯỢT QUÁ HẠN MỨC FIREBASE SPARK QUOTA
- **Triệu chứng**: Hệ thống hiển thị *"Hệ thống tạm thời đạt giới hạn sử dụng"*.
- **Xử lý**: 
  - Gói Spark miễn phí của Firebase lập tức tự động reset hạn mức vào 00:00 UTC (07:00 giờ Việt Nam) hàng ngày.
  - Giáo viên có thể chuyển tạm thời sang chế độ Mock Offline nếu cần dạy học gấp trong ngày.
