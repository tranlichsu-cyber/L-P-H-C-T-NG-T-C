# Nâng cấp Tự luyện – Tập làm văn lớp 4 (35 tuần)

Trạng thái: đặc tả triển khai, CHƯA nhập nội dung 35 tuần hoặc phát hành production.

## Hiện trạng đã xác minh từ mã nguồn
- `src/pages/SelfPracticePage.tsx` hiển thị bộ đề công khai, chạy qua `TraditionQuizRunner`; có lọc trùng bộ Tập làm văn theo lớp/tuần.
- `src/services/selfPractice/content.ts` chỉ chấp nhận MULTIPLE_CHOICE, TRUE_FALSE, SHORT_ANSWER, FILL_BLANK, ORDERING và bắt buộc correctAnswer; chưa có kiểu bài viết dài.
- `src/pages/student/StudentPracticeHubPage.tsx` là luồng bài được giao khác với trang Tự luyện công khai; không được đồng nhất hai luồng.
- Trang Tự luyện hiện công bố không cần đăng nhập và kết quả chỉ ở thiết bị; vì vậy KHÔNG được hứa lưu bài theo danh tính học sinh lên Firebase nếu chưa bổ sung xác thực, phân quyền và quy định dữ liệu.

## Quy tắc nội dung
- Chỉ lớp 4, môn Tập làm văn, 35 tuần; căn cứ phân phối chương trình và SGK thực tế, không suy đoán chủ đề tuần.
- Mỗi tuần có yêu cầu lập ý và thực hành viết tương ứng kĩ năng tuần đó; đoạn văn/viết thư/ôn tập không bị ép thành bài văn dài.
- Mỗi tuần có một bài gợi ý hoàn chỉnh đúng thể loại và độ dài, chỉ được xem sau khi nộp đủ hai phần.
- Bảng kiểm nội dung: tuần, học kì, bài học SGK, yêu cầu cần đạt, kiểu văn bản, đề lập ý, đề viết, bài gợi ý, nguồn trang SGK, trạng thái duyệt.

## Hợp đồng dữ liệu đề xuất (bổ sung, không phá cấu trúc cũ)
```ts
interface Grade4WritingWeek {
  id: string; grade: '4'; subject: 'Tập làm văn'; week: number;
  textbookLesson: string; learningOutcome: string; genre: string;
  outlinePrompt: string; writingPrompt: string; suggestedWriting: string;
  reference: string; reviewed: boolean; version: number;
}
interface WritingAttempt {
  weekId: string; outline: string; writing: string;
  status: 'DRAFT'|'SUBMITTED'; submittedAt?: string;
}
```

## Các bước triển khai an toàn
1. Nhập bảng đối chiếu 35 tuần từ SGK + phân phối chương trình đã xác minh; không công khai tuần chưa duyệt.
2. Tạo thành phần viết hai ô đa dòng, tự lưu bản nháp theo tuần, xác nhận trước khi nộp; mở nút “Xem bài gợi ý” sau khi nộp.
3. Dùng localStorage cho luồng tự luyện không đăng nhập; nếu cần giáo viên chấm và lưu Firebase, phải xây dựng luồng đăng nhập học sinh, quy tắc Firestore, quyền truy cập và chính sách lưu trữ riêng.
4. Chỉ ẩn bộ đề cũ trùng lặp sau khi đã nhập đủ và đối chiếu; không xóa Firestore.
5. Kiểm thử 35 tuần, trình duyệt điện thoại, tải lại, mất mạng, bản nháp, quyền xem gợi ý, tính nhất quán với dữ liệu cũ.
6. Build/lint, phát hành môi trường dev, kiểm thử rồi mới cân nhắc production.

## Điều kiện chặn phát hành
Chưa có bảng đối chiếu SGK/phân phối chương trình được kiểm chứng, hoặc còn bài trùng, bài gợi ý chưa duyệt, mất dữ liệu bản nháp, hoặc kiểm thử thất bại => KHÔNG phát hành.
