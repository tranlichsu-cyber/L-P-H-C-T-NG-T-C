# PILOT ISSUES TRACKING & TAXONOMY (LỚP HỌC TƯƠNG TÁC)

## 1. ISSUE TAXONOMY & SEVERITY DEFINITIONS

| Severity Code | Classification | Description | SLA / Action Requirement |
| :--- | :--- | :--- | :--- |
| **`BUG_BLOCKER`** | Blocker Bug | Không thể vào phòng, không nhận đáp án, crash app, rò rỉ bảo mật. | Sửa lập tức trước phiên Pilot tiếp theo |
| **`BUG_MAJOR`** | Major Bug | QR không quét được trên 1 số dòng máy, refresh bị mất trạng thái. | Sửa trong vòng 24h |
| **`BUG_MINOR`** | Minor Bug | Lỗi khoảng cách UI, chữ bị vỡ nhỏ trên màn hình quá bé. | Sửa trong bản cập nhật tuần |
| **`UX_HIGH`** | High UX Friction | Giáo viên không biết bấm nút gì tiếp theo, số bước quá 4 clicks. | Rút gọn quy trình thao tác |
| **`UX_MEDIUM`** | Medium UX Issue | Chữ câu hỏi nhỏ hơn 24px trên máy chiếu, nút bấm quá gần nhau. | Phóng to font & padding nút |
| **`PERFORMANCE`** | Performance Lag | Độ trễ nhận đáp án > 3 giây khi 50 thiết bị cùng bấm. | Tối ưu listener & batch update |

---

## 2. PILOT ISSUE LOG

| Issue ID | Ngày phát hiện | Nhóm Pilot | Thiết bị / Trình duyệt | Mô tả sự cố | Mức độ nghiêm trọng | Trạng thái | Phiên bản khắc phục |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **ISS-001** | 2026-10-07 | Nhóm A (5 máy) | iPad Safari | Bàn phím ảo che mất nút "VÀO PHÒNG" | `UX_MEDIUM` | **FIXED** | v1.0.0-pilot.1 |
| **ISS-002** | 2026-10-07 | Nhóm B (15 máy) | Android Chrome | Mã QR hiển thị quá nhỏ khi đứng cuối lớp | `UX_HIGH` | **FIXED** | v1.0.0-pilot.1 |
| **ISS-003** | 2026-10-07 | Nhóm C (30 máy) | Windows Edge | Giáo viên lỡ bấm nút nhầm khi chưa đóng đáp án | `UX_HIGH` | **FIXED** | v1.0.0-pilot.1 |
| **ISS-004** | 2026-10-07 | Nhóm D (50 máy) | Mix Android/iOS | Học sinh nhấp đúp 2 lần gửi đáp án liên tiếp | `BUG_MAJOR` | **FIXED** | v1.0.0-pilot.1 |
