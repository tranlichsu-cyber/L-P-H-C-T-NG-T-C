# Lớp học tương tác – Tiểu học Sông Công

Ứng dụng hỗ trợ dạy học, tự luyện, phiếu bài tập Word và trả lời câu hỏi bằng thẻ QR. Mã nguồn sử dụng React, TypeScript, Vite và Firebase.

## Tài liệu

Xem [mục lục tài liệu](docs/README.md) để tìm đầy đủ hướng dẫn và báo cáo.

- [Hướng dẫn sử dụng](docs/huong-dan/HUONG_DAN_SU_DUNG.md)
- [Bắt đầu nhanh](docs/huong-dan/BAT_DAU_NHANH.md)
- [Trả lời bằng thẻ QR và nhập Word](docs/huong-dan/HUONG_DAN_GIO_THE_QR.md)
- [Triển khai Firebase](docs/ky-thuat/FIREBASE_GITHUB_DEPLOY.md)
- [Lịch sử thay đổi](docs/release/CHANGELOG.md)
- [Lộ trình phát triển](docs/ke-hoach/UPGRADE_ROADMAP_2026.md)

## Chạy dự án

Cài Node.js 22 và cấu hình biến môi trường theo [`.env.example`](.env.example). Chạy các lệnh từ thư mục gốc:

```sh
npm ci
npm run dev
```

Kiểm tra trước khi phát hành:

```sh
npm run lint
npm run build
```

## Cấu trúc

- `src/`: mã nguồn ứng dụng.
- `public/`: tài nguyên tĩnh và file mẫu tải xuống.
- `scripts/`: công cụ kiểm tra và vận hành.
- `docs/`: hướng dẫn, báo cáo phát hành, nội dung, kỹ thuật và kế hoạch.
- `.github/workflows/`: CI và các tác vụ vận hành.

Các file `*_TRIGGER.txt` ở thư mục gốc là đầu vào của CI; chỉ sửa khi chủ động chạy tác vụ tương ứng. Chi tiết tại [mục lục tài liệu](docs/README.md#file-kích-hoạt-ci).
