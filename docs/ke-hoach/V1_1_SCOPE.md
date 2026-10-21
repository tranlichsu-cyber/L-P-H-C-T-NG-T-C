# SCOPE PHÁT HÀNH PHIÊN BẢN 1.1.0 (V1_1_SCOPE.md)

## 1. NGUYÊN TẮC LỰA CHỌN PHẠM VI V1.1
Chỉ tập trung vào 6 cải tiến trọng tâm có phản hồi từ Giáo viên & Học sinh thực tế trong các đợt Pilot:
- Không thêm module lớn mới (Không làm v2.0).
- Tập trung giảm thao tác Giáo viên, nâng cao trải nghiệm Học sinh và tối ưu Firebase.

---

## 2. 6 CẢI TIẾN TRỌNG TÂM ĐƯỢC LỰA CHỌN PHIÊN BẢN 1.1

| ID | Nhóm cải tiến | Bằng chứng từ Pilot / Feedback | Lợi ích dự kiến | Độ phức tạp | Rủi ro |
| :---: | :--- | :--- | :--- | :---: | :---: |
| **IMP-01** | **Quick Lesson Mode (Bắt đầu nhanh)** | 84% Giáo viên phản ánh chọn lại Lớp & Bộ câu hỏi quen thuộc tốn thời gian. | Rút gọn từ 4 click xuống còn **1-click** khởi tạo phòng học. | Thấp | Không |
| **IMP-02** | **Bulk Import Học sinh & Câu hỏi (Excel/CSV)** | Giáo viên muốn dán/tải danh sách học sinh và bộ đề từ file Excel có sẵn. | Tiết kiệm 90% thời gian chuẩn bị bài. | Trung bình | Thấp |
| **IMP-03** | **Student Device Memory (Gợi ý tên học sinh)** | Học sinh tiểu học phản ánh tìm lại tên mỗi buổi học mất 10-15 giây. | Gợi ý "Có phải em là [Tên]?" với nút "Không phải em". | Thấp | Không |
| **IMP-04** | **Phím tắt Giáo viên (Keyboard Shortcuts)** | Giáo viên muốn chuyển câu/đóng bài nhanh từ bàn phím (`N`, `C`, `R`). | Dạy học rảnh tay, phản hồi mượt trên máy tính. | Thấp | Không |
| **IMP-05** | **Report Action Shortcuts** | Báo cáo sử dụng cho phép tạo trực tiếp bài củng cố / quiz mới. | Liên kết ngay báo cáo với hành động giảng dạy. | Thấp | Không |
| **IMP-06** | **AI Batch Control & Prompt v1.1** | Giáo viên muốn sinh thêm 3 câu hỏi bổ sung thay vì sinh lại toàn bộ. | Tiết kiệm 60% hạn mức API call và thời gian chờ. | Trung bình | Thấp |

---

## 3. CÁC ĐỀ XUẤT HOÃN LẠI (DEFERRED REQUESTS)
- **Cổng thông tin Phụ huynh (Parent Portal)**: Hoãn lại (Chưa cần thiết cho tương tác trong lớp).
- **Ứng dụng Native APK / IPA**: Hoãn lại (PWA đã đáp ứng 100% nhu cầu trên tablet).
- **Thanh toán & Đăng ký gói**: Hoãn lại (Cam kết duy trì mô hình Spark 0đ).
