> Cập nhật: cơ chế tự đổi trên gói miễn phí được mô tả trong [HUY_HIEU_TU_DOI_20261017.md](HUY_HIEU_TU_DOI_20261017.md). Phần đồng bộ thủ công dưới đây là thiết kế cũ.

# Huy hiệu từ tổng điểm và cửa hàng avatar

## Quy tắc đã chọn

**20 điểm tích lũy = 1 huy hiệu**. Ví dụ 59 điểm được 2 huy hiệu, 60 điểm được 3. Phần điểm chưa đủ mốc được giữ trong tổng điểm để lần sau tiếp tục đạt mốc.

| Avatar | Giá huy hiệu |
| --- | ---: |
| Cú mèo ham học | Miễn phí |
| Mèo tinh nghịch | 3 |
| Thỏ vui vẻ | 4 |
| Gấu trúc dễ thương | 5 |
| Robot tò mò | 6 |
| Cáo khám phá | 7 |
| Phi hành gia nhí | 8 |

Avatar được vẽ SVG trực tiếp, không tải hình bên ngoài. Học sinh xác nhận giá trước khi đổi. Avatar đã mua thuộc bộ sưu tập, dùng lại miễn phí; không hoàn huy hiệu sau khi mua. Đổi chỉ tăng số huy hiệu đã dùng, không trừ hoặc sửa điểm học tập.

## Giáo viên đồng bộ điểm

Mở **Lớp → Học sinh → Lịch sử tiến bộ**, chọn **Tất cả các môn**, chờ tải đủ điểm rồi bấm **Đồng bộ huy hiệu từ tổng điểm**. Có lối tắt từ danh sách học sinh trong phòng học và bảng điều khiển tiết học.

Dùng đúng tổng điểm website đang hiển thị: điểm các buổi học trong phạm vi lịch sử đã tải (tối đa 100 buổi không lưu trữ), cộng điểm tự luyện cao nhất của từng bộ đề đã chấm theo thang 10. Bài đang chờ chấm chưa được cộng. Việc đồng bộ dùng dữ liệu trang đã tải, không tải lại toàn bộ lịch sử.

Số điểm đã quy đổi là mốc cao nhất đã được giáo viên ghi nhận. Đồng bộ cùng tổng điểm không cấp lại huy hiệu. Nếu điểm giảm do sửa hoặc lưu trữ lịch sử, huy hiệu đã cấp không bị thu hồi; cần vượt mốc đã ghi nhận mới nhận thêm. Không cấp theo từng lượt làm lại hoặc theo riêng từng môn. Tài khoản học sinh không được tự nhập tổng điểm để cấp huy hiệu.

Đây là quy trình giáo viên đồng bộ; chưa có tác vụ nền tự cấp khi học sinh vừa nộp bài. Số huy hiệu được lưu theo lớp và học sinh, dùng chung giữa các phòng của lớp đó và mã tự luyện của cùng em; không dùng chung giữa các lớp.

## Học sinh sử dụng

Sau khi nhập mã tự luyện và chọn tên, đầu trang chỉ hiện avatar đang dùng, họ tên, lớp và nút đổi học sinh. Bỏ khối TỰ LUYỆN, lời hướng dẫn và liên kết về trang chủ khi đã vào bằng mã. Trước khi vào mã vẫn giữ hướng dẫn ban đầu.

Mở **Huy hiệu & cửa hàng avatar** để xem số đã nhận/đã dùng/còn lại, giá từng avatar, số còn thiếu, đổi và chọn dùng. Avatar thay ngay trên đầu trang. Trong phòng học trực tuyến cũng có cửa hàng và avatar cá nhân dùng cùng ví.

Các huy hiệu ghi nhận thủ công ở phiên trước được đổi tên **Lời khen của thầy/cô**, giữ nguyên lời nhận xét nhưng không được dùng như tiền đổi avatar.

## Quyền truy cập và đồng thời

- Chỉ giáo viên có quyền quản lý lớp cấp mốc điểm/huy hiệu. Không được đặt lại chi tiêu hay xóa bộ sưu tập của học sinh khi đồng bộ.
- Học sinh gắn phiên bằng mã còn hiệu lực hoặc liên kết tham gia phòng đúng lớp/đúng tên. Chỉ đọc ví của mình, không liệt kê ví cả lớp. Mã bị thu hồi hoặc phiên phòng bị thay liên kết sẽ mất quyền truy cập.
- Quy tắc Firestore cố định giá, cấm tự tăng điểm/huy hiệu, cấm hoàn chi tiêu hoặc trang bị avatar chưa có. Một giao dịch chỉ mua một avatar; giao dịch đồng thời không vượt số dư hoặc ghi đè bộ sưu tập. Mua lại avatar đã có chỉ là chọn dùng, không tính phí lần nữa.
- Header và cửa hàng dùng chung đăng ký ví. Chỉ có một tài liệu ví cho mỗi em; không đọc toàn bộ lịch sử ở phía học sinh, không ghi mỗi giây. Thêm một tài liệu liên kết phiên để xác thực ví; mã không được đưa vào dữ liệu ví.

## Kiểm thử

`check-rewards.mjs`: mốc 20 điểm, giá 0/3/4/5/6/7/8, không cấp trùng, không mua trùng, giữ chi tiêu khi đồng bộ, thiếu số dư, trang bị miễn phí và bảo vệ dịch vụ mock. Kiểm tra giá trong Firestore khớp danh mục.

Firebase Emulator: cấp đúng giáo viên, ví cá nhân bằng mã/phòng, từ chối giả điểm, mua rẻ sai giá, hoàn huy hiệu, avatar chưa có, mua trùng, ghi đè đồng thời; thu hồi mã và thay phiên mất quyền. Trình duyệt 1280px/390px: nhập mã thật, header gọn, đồng bộ điểm, đổi/thiếu huy hiệu, xác nhận giá, đổi lại miễn phí, avatar và số dư cập nhật trực tiếp; tổng điểm không giảm.
