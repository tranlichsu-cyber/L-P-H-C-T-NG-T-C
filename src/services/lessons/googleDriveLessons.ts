import { GoogleAuthProvider, linkWithPopup, reauthenticateWithPopup, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import type { Lesson } from './lessonLibrary';

const DRIVE_TOKEN_KEY = 'lhtt_gdrive_access_token';
const DRIVE_TOKEN_EXP_KEY = 'lhtt_gdrive_access_token_exp';
const DRIVE_EMAIL_KEY = 'lhtt_gdrive_email';
const DRIVE_FOLDER_ID_KEY = 'lhtt_gdrive_folder_id';
const DRIVE_FOLDER_NAME = 'Kho Bài Giảng PPT - Lớp Học Tương Tác';

export interface DriveConnectionStatus {
  connected: boolean;
  email: string;
}

function getValidCachedToken(): string | null {
  try {
    const token = sessionStorage.getItem(DRIVE_TOKEN_KEY);
    const exp = Number(sessionStorage.getItem(DRIVE_TOKEN_EXP_KEY) || 0);
    if (token && exp > Date.now() + 60_000) {
      return token;
    }
  } catch {
    // Ignore storage error
  }
  return null;
}

function saveDriveToken(token: string, email?: string | null): void {
  try {
    sessionStorage.setItem(DRIVE_TOKEN_KEY, token);
    // Google OAuth access tokens are valid for 3600s (1 hour)
    sessionStorage.setItem(DRIVE_TOKEN_EXP_KEY, String(Date.now() + 50 * 60 * 1000));
    if (email) {
      localStorage.setItem(DRIVE_EMAIL_KEY, email);
    }
  } catch {
    // Ignore storage error
  }
}

export function getDriveConnectionStatus(): DriveConnectionStatus {
  const token = getValidCachedToken();
  let email = '';
  try {
    email = localStorage.getItem(DRIVE_EMAIL_KEY) || auth?.currentUser?.email || '';
  } catch {
    email = auth?.currentUser?.email || '';
  }
  return {
    connected: Boolean(token),
    email,
  };
}

export function disconnectGoogleDrive(): void {
  try {
    sessionStorage.removeItem(DRIVE_TOKEN_KEY);
    sessionStorage.removeItem(DRIVE_TOKEN_EXP_KEY);
    sessionStorage.removeItem(DRIVE_FOLDER_ID_KEY);
  } catch {
    // Ignore
  }
}

export async function connectGoogleDrive(): Promise<string> {
  const cached = getValidCachedToken();
  if (cached) return cached;

  if (!auth) {
    throw new Error('Cần cấu hình xác thực Google để kết nối Google Drive.');
  }

  const provider = new GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/drive.file');
  provider.setCustomParameters({
    prompt: 'consent',
    ...(auth.currentUser?.email ? { login_hint: auth.currentUser.email } : {}),
  });

  let result;
  const user = auth.currentUser;
  if (user && !user.isAnonymous) {
    const hasGoogle = user.providerData.some(p => p.providerId === 'google.com');
    try {
      if (hasGoogle) {
        result = await reauthenticateWithPopup(user, provider);
      } else {
        result = await linkWithPopup(user, provider);
      }
    } catch {
      // Fallback to direct popup if account is separate or already linked
      result = await signInWithPopup(auth, provider);
    }
  } else {
    result = await signInWithPopup(auth, provider);
  }

  const credential = GoogleAuthProvider.credentialFromResult(result);
  const accessToken = credential?.accessToken;
  if (!accessToken) {
    throw new Error(
      'Không nhận được quyền truy cập Google Drive. Hãy tích chọn cấp quyền tệp Google Drive khi cửa sổ Google hiện lên.'
    );
  }

  saveDriveToken(accessToken, result.user.email);
  return accessToken;
}

async function ensureLessonDriveFolder(accessToken: string): Promise<string> {
  try {
    const cachedFolderId = sessionStorage.getItem(DRIVE_FOLDER_ID_KEY);
    if (cachedFolderId) return cachedFolderId;
  } catch {
    // Ignore
  }

  const query = encodeURIComponent(
    `mimeType='application/vnd.google-apps.folder' and name='${DRIVE_FOLDER_NAME}' and trashed=false`
  );
  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)&pageSize=1`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (searchRes.ok) {
    const data = (await searchRes.json()) as { files?: Array<{ id: string }> };
    if (data.files && data.files.length > 0) {
      const folderId = data.files[0].id;
      try {
        sessionStorage.setItem(DRIVE_FOLDER_ID_KEY, folderId);
      } catch {
        // Ignore
      }
      return folderId;
    }
  }

  // Create folder if not exists
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files?fields=id', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: DRIVE_FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });

  if (!createRes.ok) {
    throw new Error('Không tạo được thư mục bài giảng trên Google Drive.');
  }

  const created = (await createRes.json()) as { id: string };
  try {
    sessionStorage.setItem(DRIVE_FOLDER_ID_KEY, created.id);
  } catch {
    // Ignore
  }
  return created.id;
}

export interface DriveUploadedFileInfo {
  fileId: string;
  name: string;
  webViewLink?: string;
  size?: number;
}

/**
 * Uploads a file of ANY size (unlimited size, supports 100MB, 500MB, 2GB+)
 * to Google Drive using Google Drive Resumable Upload protocol with live progress.
 */
export async function uploadFileToGoogleDrive(
  file: File,
  lessonMeta: {
    lessonId: string;
    ownerId: string;
    title: string;
    subject: string;
    grade: string;
    fileRole: 'ppt' | 'pdf';
    pageCount?: number;
  },
  onProgress?: (percent: number) => void
): Promise<DriveUploadedFileInfo> {
  const accessToken = await connectGoogleDrive();
  const folderId = await ensureLessonDriveFolder(accessToken);

  const mimeType =
    file.type ||
    (/\.pdf$/i.test(file.name)
      ? 'application/pdf'
      : /\.pptx$/i.test(file.name)
        ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        : 'application/vnd.ms-powerpoint');

  const metadata = {
    name: file.name,
    parents: [folderId],
    description: `${lessonMeta.title} (${lessonMeta.grade} - ${lessonMeta.subject})`,
    appProperties: {
      lhttLessonId: lessonMeta.lessonId,
      lhttOwnerId: lessonMeta.ownerId,
      lhttTitle: lessonMeta.title.slice(0, 100),
      lhttSubject: lessonMeta.subject.slice(0, 40),
      lhttGrade: lessonMeta.grade.slice(0, 30),
      lhttRole: lessonMeta.fileRole,
      lhttPageCount: String(lessonMeta.pageCount || 1),
    },
  };

  // Initiate resumable upload session
  const initRes = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,name,webViewLink,size',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Upload-Content-Type': mimeType,
        'X-Upload-Content-Length': String(file.size),
      },
      body: JSON.stringify(metadata),
    }
  );

  if (!initRes.ok) {
    throw new Error('Không khởi tạo được phiên tải tệp lên Google Drive.');
  }

  const uploadUrl = initRes.headers.get('Location');
  if (!uploadUrl) {
    throw new Error('Google Drive không trả về đường dẫn tải tệp.');
  }

  // Stream file via XMLHttpRequest so teacher sees real-time progress bar for large files
  const uploaded = await new Promise<DriveUploadedFileInfo>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl, true);
    xhr.setRequestHeader('Content-Type', mimeType);

    xhr.upload.onprogress = event => {
      if (event.lengthComputable && onProgress) {
        const pct = Math.min(99, Math.round((event.loaded / event.total) * 100));
        onProgress(pct);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const parsed = JSON.parse(xhr.responseText) as {
            id: string;
            name: string;
            webViewLink?: string;
            size?: string;
          };
          onProgress?.(100);
          resolve({
            fileId: parsed.id,
            name: parsed.name || file.name,
            webViewLink: parsed.webViewLink,
            size: parsed.size ? Number(parsed.size) : file.size,
          });
        } catch {
          reject(new Error('Không đọc được phản hồi từ Google Drive sau khi tải lên.'));
        }
      } else {
        reject(new Error(`Tải lên Google Drive thất bại (Mã ${xhr.status}).`));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Mất kết nối mạng khi đang tải tệp lên Google Drive.'));
    };

    xhr.send(file);
  });

  return uploaded;
}

export async function downloadFileFromGoogleDrive(fileId: string): Promise<Blob> {
  const accessToken = await connectGoogleDrive();
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error(
      'Không tải được tệp từ Google Drive. Hãy kiểm tra quyền truy cập tài khoản Google Drive.'
    );
  }

  return await res.blob();
}

export async function deleteFileFromGoogleDrive(fileId: string): Promise<void> {
  const token = getValidCachedToken();
  if (!token || !fileId) return;
  try {
    await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    // Ignore
  }
}

interface RawDriveLessonFile {
  id: string;
  name: string;
  webViewLink?: string;
  createdTime?: string;
  size?: string;
  appProperties?: {
    lhttLessonId?: string;
    lhttOwnerId?: string;
    lhttTitle?: string;
    lhttSubject?: string;
    lhttGrade?: string;
    lhttRole?: 'ppt' | 'pdf';
    lhttPageCount?: string;
  };
}

export async function listLessonsFromGoogleDrive(ownerId: string): Promise<Lesson[]> {
  const accessToken = await connectGoogleDrive();
  const folderId = await ensureLessonDriveFolder(accessToken);

  const q = encodeURIComponent(`'${folderId}' in parents and trashed=false`);
  const fields = encodeURIComponent(
    'files(id,name,webViewLink,createdTime,size,appProperties)'
  );
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=${fields}&pageSize=100&orderBy=createdTime desc`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!res.ok) {
    throw new Error('Không đọc được danh sách bài giảng từ Google Drive.');
  }

  const data = (await res.json()) as { files?: RawDriveLessonFile[] };
  const files = data.files || [];
  const lessonMap = new Map<string, Lesson>();

  for (const f of files) {
    const props = f.appProperties || {};
    const isPdf = props.lhttRole === 'pdf' || /\.pdf$/i.test(f.name);
    const lessonId = props.lhttLessonId || `drive_${f.id}`;
    const existing = lessonMap.get(lessonId);

    const cleanTitle = props.lhttTitle || f.name.replace(/\.[^.]+$/, '');
    const pageCount = props.lhttPageCount ? Number(props.lhttPageCount) : undefined;

    const base: Lesson = existing || {
      id: lessonId,
      ownerId,
      title: cleanTitle,
      subject: props.lhttSubject || 'Tổng hợp',
      grade: props.lhttGrade || 'Khối 4',
      createdAt: f.createdTime || new Date().toISOString(),
      storageProvider: 'gdrive',
      ...(pageCount ? { pageCount } : {}),
    };

    if (isPdf) {
      base.pdfName = f.name;
      base.pdfDriveId = f.id;
      base.pdfDriveUrl = f.webViewLink;
    } else {
      base.pptName = f.name;
      base.pptDriveId = f.id;
      base.pptDriveUrl = f.webViewLink;
    }

    lessonMap.set(lessonId, base);
  }

  return [...lessonMap.values()];
}

export function extractDriveFileIdFromUrl(url: string): {
  fileId: string;
  embedUrl: string;
} | null {
  const clean = url.trim();
  if (!clean) return null;

  // Match /d/<FILE_ID> in Google Drive or Google Slides URLs
  const matchD = clean.match(/\/d\/([a-zA-Z0-9_-]{15,})/);
  if (matchD) {
    const fileId = matchD[1];
    const isSlides = clean.includes('/presentation/');
    const embedUrl = isSlides
      ? `https://docs.google.com/presentation/d/${fileId}/embed?start=false&loop=false&delayms=3000`
      : `https://drive.google.com/file/d/${fileId}/preview`;
    return { fileId, embedUrl };
  }

  // Match ?id=<FILE_ID>
  const matchId = clean.match(/[?&]id=([a-zA-Z0-9_-]{15,})/);
  if (matchId) {
    const fileId = matchId[1];
    return {
      fileId,
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
    };
  }

  return null;
}
