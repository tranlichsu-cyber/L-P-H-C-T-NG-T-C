# HƯỚNG DẪN QUẢN TRỊ CẤP TRƯỜNG - LỚP HỌC TƯƠNG TÁC

## 1. QUẢN LÝ THÀNH VIÊN VÀ PHÂN VAI TRÒ
1. Đăng nhập tài khoản có quyền **Ban Giám Hiệu (`SCHOOL_ADMIN`)**.
2. Chọn mục **"Quản trị trường"** trên thanh menu $\rightarrow$ **"Quản lý giáo viên"**.
3. Tại danh sách giáo viên, bấm **"Phân quyền & Tổ"** để chọn vai trò (*BGH*, *Tổ trưởng*, *Giáo viên*) hoặc khóa/mở khóa tài khoản.
4. *Lưu ý*: Cơ chế **Last Admin Protection** sẽ tự động bảo vệ tài khoản Admin cuối cùng khỏi bị hạ quyền hoặc khóa vô tình.

## 2. QUẢN LÝ TỔ CHUYÊN MÔN (TEAMS)
1. Truy cập **"Quản trị trường"** $\rightarrow$ **"Tổ chuyên môn"**.
2. Bấm **"Thêm Tổ chuyên môn mới"** để tạo các tổ (Tổ Khối 1-2, Tổ Tiếng Anh, Tổ Tin học...).
3. Gán Tổ trưởng chuyên môn tương ứng.

## 3. PHÊ DUYỆT YÊU CẦU GIA NHẬP
1. Khi giáo viên mới đăng ký tài khoản gia nhập mã trường, yêu cầu sẽ xuất hiện tại mục **"Duyệt yêu cầu gia nhập"**.
2. Bấm **"Duyệt gia nhập"** để cho phép giáo viên bắt đầu sử dụng hệ thống.

## 4. BÁO CÁO THỐNG KÊ & XUẤT DỮ LIỆU BACKUP
- **Báo cáo sử dụng**: Vào **"Thống kê sử dụng cấp trường"** để theo dõi tần suất ứng dụng CNTT theo bộ môn và xuất tập tin CSV.
- **Sao lưu dữ liệu**: Trong cài đặt quản trị, chọn **"Xuất dữ liệu trường (Basic/Full JSON)"** để tải tập tin sao lưu về máy tính. *Lưu ý: Tệp chứa thông tin danh sách học sinh, vui lòng lưu trữ an toàn.*

## 5. GIÁM SÁT HẠN MỨC FIREBASE SPARK (MIỄN PHÍ)
- Hệ thống được tối ưu 100% chạy trên gói Firebase Spark miễn phí.
- Khuyến nghị Ban Giám hiệu định kỳ kiểm tra Firebase Console (`console.firebase.google.com`) để đảm bảo không vượt quá 50,000 Reads/ngày.
