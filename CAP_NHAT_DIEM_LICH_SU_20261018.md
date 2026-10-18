# Cập nhật điểm học sinh từ toàn bộ lịch sử đã lưu

Đã thực hiện trên Firestore production ngày 18/10/2026, bằng tài khoản hiện có, không nâng gói Firebase và không dùng Cloud Functions.

Kết quả được xác nhận trong [workflow 39108383598](https://github.com/tranlichsu-cyber/L-P-H-C-T-NG-T-C/actions/runs/39108383598):

- Đối soát 35 học sinh của 1 lớp hiện có.
- Kiểm tra 6 tiết học đã kết thúc và 6 lượt tự luyện; lịch sử hiện tại không có tiết lưu trữ.
- Bổ sung 53 điểm còn thiếu từ 6 nguồn cho 4 học sinh. 31 học sinh còn lại không cần cộng thêm điểm.
- Không có lượt thiếu đề gốc, chờ chấm, nguồn điểm không hợp lệ hoặc sổ điểm bị lệch.
- Giữ nguyên bài làm, điểm chấm gốc, huy hiệu đã nhận/đã dùng và avatar. Chỉ cập nhật sổ điểm tích lũy và nguồn chống cộng trùng; học sinh tự đổi huy hiệu như trước.

Mã cập nhật đọc tất cả tiết đã kết thúc, kể cả lưu trữ, không giới hạn 100 tiết. Tự luyện chấm lại bằng đề chuẩn và chỉ lấy điểm cao nhất từng bài; nguồn đã ghi nhận chỉ cộng phần tăng thêm. Không ghi danh tính học sinh hoặc nội dung bài làm vào nhật ký công khai. Báo cáo tổng hợp riêng được lưu ở systemMigrations/history-points-20261018-v1.

Đã kiểm tra bằng dữ liệu giả trên Firestore Emulator: 150 tiết lưu trữ, xem trước không ghi, điểm khai tăng bị bỏ qua, làm lại không cộng trùng, thiếu đề/sổ lệch được giữ để xử lý, chạy lại không cộng thêm, bài làm/huy hiệu/avatar không đổi. Đã xem trước dữ liệu thật trước khi áp dụng. Lần cập nhật đọc 329 tài liệu theo bộ đếm, ngoài lượt đọc giao dịch ghi; giữ trong hạn mức kiểm soát của tác vụ.

Tác vụ này không cần triển khai lại website. Cờ APPLY đã trả về NO sau khi hoàn tất; chạy thủ công mặc định chỉ xem trước. Bật apply chỉ khi có yêu cầu cập nhật mới. Thay đổi cuối chỉ là báo cáo/cờ an toàn, bỏ qua CI để không đọc lại dữ liệu học sinh không cần thiết.
