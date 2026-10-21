# Dọn bộ câu hỏi trống ngày 21/10/2026

Thực hiện theo yêu cầu xóa bộ đề không có câu hỏi. Thao tác dữ liệu một lần, không cần phát hành Hosting.

- Phạm vi: `quizzes`, `qrQuestionSets`, `selfPracticeQuizzes`, `traditionQuizzes`.
- `quizzes`: kiểm tra câu hỏi con thực tế, không tin riêng `questionCount`; giữ nội dung câu hỏi nhúng cũ nếu có.
- Ba kho dạng mảng: chỉ chọn mảng `questions: []` rõ ràng; giữ định dạng chưa nhận biết. Kiểm tra thêm câu hỏi con để bảo vệ dữ liệu cũ.
- Bỏ qua bài có đề bài viết trực tiếp. Không đọc/xóa `practiceSets`, phiếu Word, bài nộp, điểm hoặc phòng học.
- Tạo bản sao đầy đủ trước khi xóa; lưu kiểu Timestamp, bytes, reference và dữ liệu lồng nhau. Bản sao trong artifact `empty-quiz-recovery-<run-id>` giữ 90 ngày. Hàm `decode` trong script phục hồi kiểu Firestore; khi cần khôi phục, kiểm tra tài liệu chưa tồn tại rồi dùng `db.doc(saved.path).create(decode(saved.data, db))` với quyền quản trị để không ghi đè tài liệu mới.
- Mỗi tài liệu được kiểm tra lại trong giao dịch, kể cả câu hỏi con. Bỏ qua tài liệu có thay đổi từ lúc sao lưu. Giới hạn 2.000 tài liệu/kho và tối đa 300 ứng viên mỗi lượt; vượt giới hạn sẽ dừng trước khi xóa.
- Kiểm thử trên Firestore Emulator phải đạt trước khi workflow được cấp thông tin đăng nhập production. Bản sao phải được lưu artifact thành công trước bước xóa.
- `systemMigrations/empty-quizzes-20261021-v1` ghi kết quả để chạy lại không xóa thêm các bản nháp mới. Báo cáo chỉ có số lượng, không có nội dung giảng dạy hay dữ liệu học sinh; lưu trên nhánh `audit/empty-quiz-cleanup-<run-id>`.

Workflow: `.github/workflows/cleanup-empty-quizzes.yml`. Chỉ đổi cấu hình `.github/operations/empty-quiz-cleanup.json` trên main hoặc chạy workflow thủ công mới kích hoạt; thay đổi mã khác không tự dọn dữ liệu.

Sau khi dọn, tải lại trang để xóa cache danh sách trong phiên trình duyệt (cache ứng dụng tối đa khoảng 2 phút).

## Trạng thái ngày 21/10/2026

Kiểm thử Firestore Emulator đã đạt (`EMPTY_QUIZ_EMULATOR_VERIFIED`), nhưng production trả `8 RESOURCE_EXHAUSTED: Quota exceeded` ở bước chuẩn bị; không có artifact sao lưu nên bước xóa chưa chạy. Không tiếp tục thử đọc khi hạn mức đã hết. Workflow được lên lịch lúc 07:15 UTC ngày 22/10/2026 (14:15 Việt Nam), sau giờ hạn mức miễn phí được làm mới theo múi giờ Pacific. Cổng ngày chỉ cho lịch tự động chạy đúng ngày này; những năm sau sẽ bỏ qua. Kiểm thử, sao lưu, kiểm tra thay đổi và dấu hoàn thành một lần vẫn áp dụng đầy đủ. Có thể kiểm tra kết quả ở workflow và nhánh audit được tạo sau khi hoàn tất.
