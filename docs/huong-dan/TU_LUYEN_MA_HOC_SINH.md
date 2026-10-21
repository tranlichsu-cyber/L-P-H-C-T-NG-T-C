# Tự luyện bằng mã riêng của học sinh

## Giáo viên

1. Thêm học sinh vào lớp trong Quản lý lớp.
2. Mở **Quản lý tự luyện → Mã học sinh và bài làm tự luyện**, chọn lớp và bấm **Tạo / cập nhật mã cho lớp**.
3. Gửi riêng mã 12 ký tự cho từng học sinh. Tạo lại sẽ giữ nguyên mã còn hiệu lực và cập nhật tên học sinh. Thu hồi mã chặn các lần truy cập và gửi bài tiếp theo; bài đã nộp vẫn được giữ.
4. Trong cùng mục, chọn lớp/học sinh và bấm **Tải lại mã và bài làm**. Mở từng bài để xem câu trả lời, đáp án, điểm hoặc dàn ý và bài viết. Mỗi lần làm lại được lưu thành một bài riêng.

## Học sinh

Vào **Tự luyện**, nhập mã giáo viên đã cấp và bấm tên của mình để xác nhận. Mã chỉ hiển thị học sinh tương ứng. Chọn bộ đề, làm bài rồi nộp. Chỉ thông báo **Đã gửi bài** xác nhận giáo viên có thể xem bài. Nếu gửi thất bại, giữ trang mở và bấm **Gửi lại bài**.

Bài Tập làm văn gửi cả dàn ý và bài viết khi bấm **Em đã hoàn thành**. Bản nháp trên thiết bị được tách theo học sinh và lớp. Bài viết không tự động chấm điểm; điểm trắc nghiệm là điểm tự luyện tính trên trình duyệt, không dùng làm điểm kiểm tra chính thức.

## Đưa vào sử dụng trên Firebase

Phải triển khai cả ứng dụng và `firestore.rules` mới. Quy tắc mới quản lý `selfPracticeAccess` và `selfPracticeWork`: chỉ giáo viên quản lý lớp được cấp mã, không cho học sinh truy vấn danh sách mã hoặc đọc bài làm, và chỉ giáo viên cấp mã được đọc báo cáo. Các bài nộp phải khớp mã, lớp và học sinh đang tồn tại.

Firebase cần bật đăng nhập Anonymous như luồng học sinh hiện có. Mã cá nhân là thông tin truy cập: gửi riêng, thu hồi nếu bị chia sẻ. Chế độ mock chỉ lưu trong trình duyệt hiện tại; theo dõi bài làm giữa các thiết bị cần cấu hình Firebase và triển khai quy tắc mới.

## Kiểm tra

- `npm run build`
- `npm run lint`
- `node scripts/check-student-self-practice.mjs`
- `node scripts/check-writing-practice.mjs`
- `node scripts/check-tradition-quizzes.mjs`

Kiểm tra quyền trên Firebase Emulator (cần Java 21+, tải emulator từ `storage.googleapis.com` và các công cụ kiểm thử; cài ngoài kho mã):

```bash
npm install --prefix /tmp/self-practice-rule-tools --no-audit --no-fund firebase-tools @firebase/rules-unit-testing firebase
NODE_PATH=/tmp/self-practice-rule-tools/node_modules \
  /tmp/self-practice-rule-tools/node_modules/.bin/firebase emulators:exec \
  --only firestore --project demo-self-practice \
  'node scripts/check-self-practice-rules.cjs'
```

Kiểm thử quyền bao gồm cấp mã đúng chủ lớp, chặn truy vấn danh sách mã, chặn giả danh học sinh, chỉ giáo viên đọc báo cáo, gửi lại không sửa câu trả lời, nộp bài viết và thu hồi mã.
