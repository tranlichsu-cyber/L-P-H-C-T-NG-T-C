# V1.0 RELEASE PROFILE & FEATURE INVENTORY (LỚP HỌC TƯƠNG TÁC)

## 1. OFFICIAL MODULE STATUS IN VERSION 1.0.0

| Module / Feature Name | Status | Owner Area | Security Impact | Firebase Cost Impact |
| :--- | :---: | :--- | :--- | :--- |
| **Authentication Teacher** | `STABLE` | Teacher App | Email/Password Auth | Very Low |
| **Anonymous Student Auth** | `STABLE` | Student App | Anonymous Firebase Auth | Free |
| **School & Role Management** | `STABLE` | School Admin | RBAC, Last Admin Guard | Low |
| **Class & Roster Management** | `STABLE` | Teacher App | Teacher Ownership | Low |
| **Quiz Bank & Scopes** | `STABLE` | Teacher App | Scope: PRIVATE/TEAM/SCHOOL | Low |
| **AI Question Assistant** | `STABLE` | Teacher App | Teacher Approval Required | Free / Client API |
| **Live Room Controller** | `STABLE` | Teacher App | Realtime Host | ~1k Reads/Session |
| **QR Join & 6-Digit PIN** | `STABLE` | Student App | Public Room Code | Free |
| **Realtime Student Answering**| `STABLE` | Student App | Anonymous Submission | ~1 Write/Answer |
| **Live Results & Charts** | `STABLE` | Teacher App | Aggregate Realtime | Realtime Listener |
| **Scoreboard & Badges** | `STABLE` | Teacher App | Teacher-only Write | Low |
| **Random Student Picker** | `STABLE` | Teacher App | Client-side Wheel | Free |
| **Interactive Class Games** | `STABLE` | Teacher App | Client-side Animation | Free |
| **Teaching History Summaries**| `STABLE` | Teacher App | Snapshot Immutable | Very Low |
| **Usage Reports & CSV Export**| `STABLE` | School Admin | Local Blob Export | Free |
| **Self-Paced Practice** | `STABLE` | Teacher/Student | Assignment Isolation | Low |
| **PWA Standalone Shell** | `STABLE` | App Root | Static Asset Cache | Hosting Free Tier |
| **Audit Logs** | `STABLE` | School Admin | Immutable Audit Trail | Low |

---

## 2. FEATURE FREEZE POLICY FOR VERSION 1.0.0
- **Scope Lock**: Không bổ sung bất kỳ tính năng mới nào ngoài danh mục STABLE ở trên.
- **Exception Rule**: Chỉ cho phép sửa lỗi thuộc các nhóm: *Blocker*, *Security Critical*, *Data-Loss*, *Device Compatibility*.
- **New Feature Requests**: Tất cả các yêu cầu tính năng bổ sung từ người dùng được ghi nhận vào `PRODUCT_BACKLOG.md`.
