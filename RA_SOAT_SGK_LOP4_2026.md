# Rà soát nội dung lớp 4 theo sáu sách giáo viên cung cấp

Ngày đối chiếu: 14/10/2026. Bộ sách: Kết nối tri thức với cuộc sống. Phạm vi là lớp 4; không suy rộng sang các lớp chưa có sách. Giáo viên chọn giữ lịch 35 tuần và điều chỉnh theo thứ tự sách.

## Đã kiểm tra và sửa

- Đối chiếu mục lục sáu PDF quét ảnh; ghi tên bài, tập sách, trang in, trang PDF và SHA-256 nguồn. Danh mục có 73 bài Toán, 31 bài Khoa học, 27 bài Lịch sử và Địa lí, 32 bài đọc Tiếng Việt tập một và 30 bài đọc tập hai.
- Tiếng Việt ghi trực tiếp tuần 1–35; tuần 9, 18, 27, 35 ôn tập/đánh giá. Tập hai bắt đầu lại từ Bài 1, không trộn số bài giữa hai tập.
- Cập nhật 35 mục luyện viết trong mã nguồn theo nội dung viết của từng tuần, thêm trang nguồn. Đề luyện thêm do website biên soạn, không tự nhận là đề nguyên văn SGK.
- Tuần 13: thay gieo hạt bằng viết đơn. Tuần 19: thay tình cảm với mái trường bằng tình cảm với người gần gũi, thân thiết. Tuần 34: bổ sung giấy mời bên cạnh viết thư.
- Chỉnh bài yêu cầu đoạn văn thành đoạn văn; báo cáo, đơn, thư và hướng dẫn có phần chuẩn bị ý phù hợp, thay bố cục mở bài–thân bài–kết bài dùng chung.
- Tách phiên bản bản nháp khi đổi đề: giữ bản cũ, không dùng bài cũ để đánh dấu hoàn thành đề mới.
- Sửa dữ liệu minh hoạ: câu hỏi về ba thể của nước hỏi đúng về trạng thái; bỏ lời giải nhịn nước theo số ngày; câu danh từ chỉ người có đáp án duy nhất; phép nhân hai chữ số tham chiếu Bài 43. Đây là dữ liệu minh hoạ trong mã, không phải bằng chứng đã sửa bản sao trên máy chủ.

## Phần ngân hàng máy chủ còn bị chặn

Truy vấn chỉ đọc `selfPracticeQuizzes` với điều kiện `published == true` bằng danh tính dự án hiện có trả HTTP 429, `RESOURCE_EXHAUSTED`, `Quota exceeded`. Không lấy được bản chụp ngân hàng hiện hành; không thay đổi hoặc xoá các tài liệu chưa đọc được.

Chưa xác nhận toàn bộ câu hỏi, đáp án, lời giải và tuần trong ngân hàng Firestore. Các bản nhập Excel hoặc bản công khai trên máy chủ có thể vẫn có nội dung cũ. Luyện viết trên website dùng dữ liệu tuần trong mã đã sửa; điều này không đồng nghĩa các câu trắc nghiệm trong ngân hàng đã được sửa.

Toán, Khoa học, Lịch sử và Địa lí trong các PDF có thứ tự bài nhưng không có bảng 35 tuần như Tiếng Việt. Giữ kế hoạch tuần hiện có; không tự coi mỗi bài tương ứng một tuần hoặc suy đoán số tiết. Sau khi máy chủ đọc được, cần đối chiếu tuần của từng bộ với lịch đang dùng, kiểm tra từng câu và đáp án với trang bài tương ứng.

## Công cụ trong website

`/teacher/curriculum-audit`: xem lịch Tiếng Việt 35 tuần, tra cứu danh mục bốn môn, số bài và trang nguồn; đối chiếu tiêu đề/số bài của các bộ đã tải được; tải báo cáo và thông báo rõ khi không đọc được máy chủ. Liên kết từ kho câu hỏi và quản lý tự luyện.

Công cụ không tự sửa đáp án hoặc coi tiêu đề khớp sách là nội dung đã kiểm chứng. Bài chưa ghép được với sách hoặc có nhiều nội dung cần đọc trực tiếp trước khi sửa.

## Kiểm tra

Kiểm tra tự động: số bài liên tục, phân biệt hai tập Tiếng Việt, đủ 35 tuần và 62 bài đọc, đúng mốc ôn tập, nguồn từng bài viết, số trang PDF, lỗi tuần 13/19/34 và giới hạn đối chiếu tiêu đề. Kiểm tra trình duyệt: tra cứu, lỗi máy chủ, điện thoại và đề mới không dùng nhầm bản nháp cũ. Biên dịch, lint và các kiểm tra học tập hiện có theo quy trình dự án.

## Kiểm tra lại ngày 15/10/2026

Đã chạy lại truy vấn ngân hàng công khai: vẫn HTTP 429 `RESOURCE_EXHAUSTED` / `Quota exceeded`. Truy vấn giới hạn một tài liệu cũng trả cùng lỗi; không thể xử lý bằng cách chia nhỏ danh sách. Bằng chứng: các lượt kiểm tra GitHub Actions 38613134348 và 38613533724. Không sửa nội dung chưa đọc được và không xác nhận đã hoàn tất ngân hàng.

Để tiếp tục khi máy chủ chưa đọc được, cần file câu hỏi thực tế đã nhập (Excel hoặc bản xuất JSON có câu hỏi, đáp án, môn và bài/tuần). Các PDF sách và báo cáo đối chiếu tiêu đề không thay thế được dữ liệu câu hỏi hiện hành.

## Rà soát tiếp ngày 15/10/2026

- Kiểm tra lại truy vấn ngân hàng sau bản tối ưu lượt đọc: vẫn HTTP 429 `RESOURCE_EXHAUSTED`, kể cả giới hạn một tài liệu. Bằng chứng: [GitHub Actions 38676648560](https://github.com/tranlichsu-cyber/L-P-H-C-T-NG-T-C/actions/runs/38676648560). Không đọc được nội dung ngân hàng; không có chỉnh sửa dữ liệu Firestore trong đợt này.
- Đọc lại 35 đề, trọng tâm, ý chuẩn bị, bài mẫu và tiêu chí tự kiểm tra của luyện viết trong mã nguồn. Kiểm tra trực tiếp trang in 79 và 120 của Tiếng Việt tập một để xác nhận dạng đoạn văn tưởng tượng và đoạn văn miêu tả con vật.
- Tuần 10: bỏ yêu cầu viết cả câu chuyện, sửa thành tìm ý và viết một đoạn văn tưởng tượng. Tuần 15: sửa yêu cầu và mẫu thành một đoạn miêu tả con gà/đàn gà, kèm chuẩn bị ý cho tuần 16. Tuần 11: làm rõ lựa chọn người kể để đề phù hợp mẫu kể theo nhân vật.
- Tuần 5, 7, 14, 28: phân biệt phần tìm hiểu/lập ý theo sách với bản viết luyện thêm của website, không đổi lịch tiết viết chính thức. Tuần 1: bổ sung ý kiến về góc đọc sách trong mẫu. Báo cáo tuần 4 bổ sung tên người viết ở cuối.
- Cả 35 tuần: thay tiêu chí chung bằng tiêu chí đúng dạng văn bản. Gợi ý chuẩn bị ý phân biệt kể chuyện, thuật lại sự việc, miêu tả, nêu ý kiến, nêu tình cảm và tưởng tượng. Các đề thay yêu cầu có phiên bản mới, giữ cả bản nháp v2 và v1 để xem/sao chép, không lấy bài đã hoàn thành theo đề trước làm bài mới.
- Toán minh hoạ: giới hạn quy tắc viết thêm chữ số 0 khi nhân với 10 vào số tự nhiên, tránh khẳng định cho mọi loại số. Không coi đây là sửa câu hỏi đã nhập trên máy chủ.
- Công cụ đối chiếu bốn môn: bắt tuần/bài 0, nhận biết tập một/hai, đối chiếu số bài và tên trước khi xử lí tuần. Với Tiếng Việt, phát hiện tên bài hoặc tập sách lệch tuần, thay vì chỉ thấy chữ “Tuần” là trả về mục tham chiếu. Vẫn không tự xác nhận đáp án hoặc suy đoán lịch 35 tuần của Toán, Khoa học, Lịch sử và Địa lí.

Kiểm tra bổ sung: các tình huống bài–tuần–tập xung đột, đoạn văn tuần 10/15, tiêu chí từng thể loại, khôi phục cả hai phiên bản nháp, tách học sinh A/B và không mở gợi ý bằng trạng thái hoàn thành của đề cũ. Phạm vi đã rà và sửa trong đợt này là dữ liệu luyện viết, câu hỏi minh hoạ và logic đối chiếu; chưa phải toàn bộ câu hỏi các môn trên máy chủ.
