> Cập nhật theo yêu cầu mới: phần này được đổi tên thành **Lời khen**. Không phải huy hiệu dùng đổi avatar. Cơ chế huy hiệu theo tổng điểm được hướng dẫn trong [HUY_HIEU_DOI_AVATAR_20261017.md](HUY_HIEU_DOI_AVATAR_20261017.md).

# Huy hiệu ghi nhận sự cố gắng

## Cách sử dụng

Giáo viên vào **Phòng học → HUY HIỆU CỐ GẮNG**, hoặc bấm **Trao huy hiệu cố gắng** trên bảng điều khiển tiết học. Chọn học sinh đã tham gia, chọn loại và viết lời ghi nhận cụ thể (tối đa 300 ký tự).

Sáu loại: Kiên trì cố gắng; Tiến bộ từng ngày; Hợp tác tốt; Biết giúp bạn; Chăm chỉ; Mạnh dạn chia sẻ. Các gợi ý hướng về hành vi quan sát được và sự tiến bộ của chính em, không so sánh với bạn. Có danh sách riêng cho giáo viên để quan sát em nào chưa được ghi nhận; không bắt buộc trao cho đủ.

Mỗi em có tối đa một huy hiệu mỗi loại trong một phòng học. Gửi lại cùng lời ghi nhận không tạo bản trùng; sửa lời không tăng số huy hiệu. Có thể thu hồi huy hiệu trao nhầm. Kiểm tra phiên bản trước khi thu hồi tránh xóa nhầm lời ghi nhận vừa được sửa ở cửa sổ khác. Giáo viên vẫn có thể ghi nhận sau khi kết thúc tiết học.

Học sinh mở **Huy hiệu cố gắng của em** trong góc học tập sau khi vào phòng/chọn tên. Chỉ hiển thị huy hiệu đã nhận với lời ghi nhận và ngày trao; không có ô huy hiệu chưa đạt, bảng xếp hạng hoặc thông báo bật lên làm gián đoạn bài học.

## Phạm vi dữ liệu

Lưu theo phòng học, mỗi em một tài liệu với tối đa sáu huy hiệu. Huy hiệu vẫn lưu sau khi kết thúc phòng; hiện chưa gom thành hồ sơ xuyên nhiều phòng hoặc cấp tự động từ điểm số. Không cộng/trừ điểm, không sửa lịch sử điểm hay bài nộp.

Chỉ giáo viên có quyền quản lý phòng được trao/sửa/thu hồi. Học sinh chỉ đọc tài liệu của chính mình theo liên kết phiên hiện tại; không tự trao, không liệt kê cả lớp hoặc xem của bạn. Phiên cũ bị thay liên kết không tiếp tục đọc được. Quy tắc kiểm tra loại, cấu trúc, tên chính xác và độ dài; không cho thêm trường điểm.

Giáo viên chỉ theo dõi danh sách khi mở tab huy hiệu; học sinh theo dõi một tài liệu riêng trong phòng hiện tại. Đăng ký trùng được dùng chung, dừng khi rời phòng, tách theo tài khoản. Có lượt đọc mới cho huy hiệu; không đọc toàn bộ lịch sử các phòng, không ghi theo chu kỳ.

## Kiểm tra

- `check-encouragement.mjs`: sáu loại, độ dài lời ghi nhận, dịch vụ thật ở chế độ mock, trao/sửa/thu hồi, không trùng, từ chối thu hồi bản cũ, tách học sinh, không đổi điểm, dùng chung và dọn đăng ký.
- Firebase Emulator trong `check-self-practice-rules.cjs`: giáo viên đúng phòng, học sinh chỉ đọc của mình, không đọc/liệt kê của bạn, không tự trao; kiểm tra cả sáu loại, từ chối trường điểm/loại lạ/lời quá dài và phiên đã mất liên kết.
- Trình duyệt 1280px và 390px: giáo viên trao/sửa/thu hồi, cập nhật trực tiếp trên đúng học sinh, số lượng không tăng khi sửa, điểm cũ giữ nguyên, không tràn ngang.
