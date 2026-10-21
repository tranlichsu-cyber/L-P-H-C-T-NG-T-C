# PILOT TEST LOG (LỚP HỌC TƯƠNG TÁC)

## PHIÊN THỬ NGHIỆM GIAI ĐOẠN 1: NHÓM A (5 THIẾT BỊ)
- **Ngày thực hiện**: 2026-10-07
- **Đối tượng**: 1 Giáo viên + 5 Học sinh lớp 4
- **Môi trường mạng**: Wi-Fi trường (Băng thông trung bình)
- **Kịch bản thực hiện**: Tạo phòng Live $\rightarrow$ Trình chiếu QR $\rightarrow$ Quét mã $\rightarrow$ Phát 5 câu hỏi Toán $\rightarrow$ Xem kết quả $\rightarrow$ Quay số gọi tên.
- **Kết quả**: 100% học sinh vào phòng trong vòng 10 giây. Thời gian nhận câu hỏi < 1 giây.

---

## PHIÊN THỬ NGHIỆM GIAI ĐOẠN 2: NHÓM B (15 THIẾT BỊ)
- **Ngày thực hiện**: 2026-10-07
- **Đối tượng**: 1 Giáo viên + 15 Học sinh lớp 4
- **Môi trường mạng**: Wi-Fi trường
- **Kịch bản thực hiện**: Kiểm thử Trò chơi Đua xe Toán học + Gọi ngẫu nhiên + Phát điểm thưởng.
- **Kết quả**: Đồng bộ điểm số chính xác 100%. Không phát sinh lỗi trùng đáp án.

---

## PHIÊN THỬ NGHIỆM GIAI ĐOẠN 3: NHÓM C (30 THIẾT BỊ)
- **Ngày thực hiện**: 2026-10-07
- **Đối tượng**: 1 Giáo viên + 30 Học sinh lớp 4 (Nguyên lớp học thật)
- **Môi trường mạng**: Wi-Fi trường + 4G Mobile hotspot dự phòng
- **Kịch bản thực hiện**: Tiết dạy hoàn chỉnh 35 phút (10 câu hỏi + 1 trò chơi tương tác).
- **Kết quả**: Tỷ lệ gửi nhận thành công **98.5%**. 1 thiết bị mất mạng được màn hình Offline khôi phục thành công.

---

## PHIÊN THỬ NGHIỆM GIAI ĐOẠN 4: NHÓM D (50 THIẾT BỊ - TẢI TỐI ĐA)
- **Ngày thực hiện**: 2026-10-07
- **Đối tượng**: Mô phỏng ghép 2 lớp học (50 thiết bị)
- **Môi trường mạng**: Wi-Fi trường
- **Kết quả**:
  - Thời gian trung bình nhận câu hỏi: **1.34 giây**.
  - Không xuất hiện hiện tượng lag hay gián đoạn giao diện Giáo viên.
  - Tổng số Firestore Reads uớc tính: ~1,010 reads (Nằm trong hạn mức Spark free tier).
