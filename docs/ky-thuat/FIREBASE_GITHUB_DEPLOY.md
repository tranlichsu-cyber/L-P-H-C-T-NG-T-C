# Triển khai Firebase DEV từ GitHub

Repository đã có workflow thủ công: **Deploy DEV to Firebase**.

## 1. Không commit khóa bí mật

Không đưa các giá trị thật vào `.env`, source code hoặc file JSON trong repository.

## 2. Khai báo GitHub Environment

Vào:

**Repository → Settings → Environments → New environment**

Tạo environment:

`development`

## 3. Khai báo Repository/Environment variables

Trong environment `development`, tạo Variables:

- `VITE_APP_URL` — URL Firebase Hosting DEV, ví dụ `https://lhtt-dev.web.app`
- `VITE_AI_ENABLED` — nên để `false` cho lần triển khai đầu
- `VITE_AI_MODE` — `mock` nếu AI chưa được cấu hình an toàn

## 4. Khai báo Secrets

Tạo các secrets:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `FIREBASE_SERVICE_ACCOUNT_LHTT_DEV`

Các giá trị Firebase Web Config lấy từ Firebase Console → Project settings → Your apps → Web app.

`FIREBASE_SERVICE_ACCOUNT_LHTT_DEV` là toàn bộ JSON của service account dùng để deploy CI. Không commit JSON này vào repository.

## 5. Firebase Authentication

Trong Firebase Console của project `lhtt-dev`:

Authentication → Sign-in method:

- Bật **Email/Password** cho giáo viên.
- Bật **Anonymous** cho học sinh.

## 6. Firestore

Tạo Cloud Firestore nếu chưa có.

Sau đó kiểm tra `firestore.rules` trong repository trước khi deploy.

## 7. Chạy workflow

Vào:

**Actions → Deploy DEV to Firebase → Run workflow**

Workflow sẽ:

1. npm ci
2. npm run lint
3. npm run build
4. deploy Firebase Hosting
5. deploy Firestore Rules
6. deploy Firestore indexes

Chỉ DEV được triển khai bởi workflow này. Không triển khai production.

## 8. Kiểm tra sau deploy

Mở URL Hosting DEV và thử:

- `/`
- `/login`
- `/teacher`
- `/student/join`

Sau đó thử bằng 2 thiết bị: 1 máy giáo viên và 1 tablet học sinh.
