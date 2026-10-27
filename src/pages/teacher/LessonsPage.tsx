import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cloud,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  HardDrive,
  Link2,
  MonitorPlay,
  Presentation,
  QrCode,
  RefreshCw,
  Smartphone,
  Trash2,
  Upload,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { PdfLessonView, countPdfPages } from '../../components/teacher/PdfLessonView';
import { PptxLessonView } from '../../components/teacher/PptxLessonView';
import { LessonSlideControls } from '../../components/teacher/LessonSlideControls';
import {
  deleteLesson,
  downloadLesson,
  saveLesson,
  syncLessonsFromGoogleDrive,
  useLessonLibrary,
  validateLessonFile,
  type Lesson,
} from '../../services/lessons/lessonLibrary';
import {
  connectGoogleDrive,
  extractDriveFileIdFromUrl,
  getDriveConnectionStatus,
  uploadFileToGoogleDrive,
} from '../../services/lessons/googleDriveLessons';
import { countPptxSlides, type SlideOutlineItem } from '../../services/lessons/pptxParser';
import {
  publishLessonRemoteState,
  sendLessonRemoteCommand,
  stopLessonRemoteSession,
  subscribeActiveTeacherPresentation,
  subscribeLessonPhoneRemote,
  subscribeLessonPresenter,
  type LessonRemoteState,
} from '../../services/lessons/lessonRemoteSync';
import { SUBJECT_OPTIONS } from './QuizzesPage';

export function LessonsPage() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const library = useLessonLibrary();
  const [searchParams, setSearchParams] = useSearchParams();
  const remoteParam = searchParams.get('remote');

  const [replacing, setReplacing] = useState<Lesson | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Toán');
  const [grade, setGrade] = useState('Khối 4');
  const [ppt, setPpt] = useState<File | null>(null);
  const [pdf, setPdf] = useState<File | null>(null);
  const [saveToDrive, setSaveToDrive] = useState(true);
  const [driveLinkInput, setDriveLinkInput] = useState('');
  const [driveSlideCountInput, setDriveSlideCountInput] = useState(15);
  const [driveConnected, setDriveConnected] = useState(() => getDriveConnectionStatus().connected);
  const [driveEmail, setDriveEmail] = useState(() => getDriveConnectionStatus().email);

  // Active presentation state on computer
  const [preview, setPreview] = useState<Lesson | null>(null);
  const [directFile, setDirectFile] = useState<File | null>(null);
  const [presentMode, setPresentMode] = useState<'ppt' | 'pdf' | 'drive_embed'>('ppt');
  const [sessionId, setSessionId] = useState('');
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(1);
  const [blackout, setBlackout] = useState(false);
  const [outlines, setOutlines] = useState<SlideOutlineItem[]>([]);
  const [showPhoneQrModal, setShowPhoneQrModal] = useState(false);
  const [deleting, setDeleting] = useState<Lesson | null>(null);

  // Phone Remote Mode state
  const [activeRemoteSessionId, setActiveRemoteSessionId] = useState<string | null>(remoteParam);
  const [remoteState, setRemoteState] = useState<LessonRemoteState | null>(null);
  const [detectedTeacherPresentation, setDetectedTeacherPresentation] =
    useState<LessonRemoteState | null>(null);

  const quickFileInputRef = useRef<HTMLInputElement>(null);
  const stateRef = useRef<LessonRemoteState | null>(null);

  useEffect(() => {
    if (remoteParam) {
      setActiveRemoteSessionId(remoteParam);
    }
  }, [remoteParam]);

  // Listen for active presentation of the same teacher account so opening /teacher/lessons on phone shows a 1-tap connect banner
  useEffect(() => {
    if (!currentUser?.uid) return;
    return subscribeActiveTeacherPresentation(currentUser.uid, state => {
      if (state && state.sessionId !== sessionId) {
        setDetectedTeacherPresentation(state);
      } else if (!state) {
        setDetectedTeacherPresentation(null);
      }
    });
  }, [currentUser?.uid, sessionId]);

  // Subscribe to remote updates when phone remote mode is active
  useEffect(() => {
    if (!activeRemoteSessionId) return;
    return subscribeLessonPhoneRemote(
      activeRemoteSessionId,
      state => {
        setRemoteState(state);
      },
      () => {
        showToast('Đã kết thúc trình chiếu trên máy tính.', 'info');
      }
    );
  }, [activeRemoteSessionId, showToast]);

  // Keep stateRef updated and broadcast whenever computer presentation state changes
  useEffect(() => {
    if (!preview || !sessionId) {
      stateRef.current = null;
      return;
    }
    const nextState: LessonRemoteState = {
      sessionId,
      lessonId: preview.id,
      teacherId: currentUser?.uid || preview.ownerId || 'teacher',
      title: preview.title,
      subject: preview.subject,
      grade: preview.grade,
      page,
      count,
      blackout,
      outlines,
      updatedAt: new Date().toISOString(),
    };
    stateRef.current = nextState;
    publishLessonRemoteState(nextState);
  }, [preview, sessionId, currentUser?.uid, page, count, blackout, outlines]);

  // Listen for phone remote commands when computer is presenting
  useEffect(() => {
    if (!preview || !sessionId) return;
    return subscribeLessonPresenter(
      sessionId,
      () => stateRef.current,
      cmd => {
        if (cmd.action === 'NEXT') {
          setPage(prev => Math.min(stateRef.current?.count || 1, prev + 1));
        } else if (cmd.action === 'PREV') {
          setPage(prev => Math.max(1, prev - 1));
        } else if (cmd.action === 'SET_PAGE' && typeof cmd.page === 'number') {
          const maxCount = stateRef.current?.count || 1;
          setPage(Math.min(maxCount, Math.max(1, cmd.page)));
        } else if (cmd.action === 'TOGGLE_BLACKOUT') {
          setBlackout(prev => !prev);
        }
      }
    );
  }, [preview, sessionId]);

  const refreshDriveStatus = () => {
    const st = getDriveConnectionStatus();
    setDriveConnected(st.connected);
    setDriveEmail(st.email);
  };

  const handleConnectAndSyncDrive = async () => {
    if (!currentUser?.uid) {
      showToast('Vui lòng đăng nhập tài khoản giáo viên.', 'error');
      return;
    }
    setBusy(true);
    try {
      await connectGoogleDrive();
      refreshDriveStatus();
      const syncedCount = await syncLessonsFromGoogleDrive(currentUser.uid);
      showToast(
        syncedCount > 0
          ? `Đã kết nối Google Drive và đồng bộ ${syncedCount} bài giảng!`
          : 'Đã kết nối Kho Google Drive thành công! Mọi bài giảng tải lên sẽ được lưu vào Google Drive của thầy/cô.',
        'success'
      );
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Không kết nối được Google Drive.',
        'error'
      );
    } finally {
      setBusy(false);
    }
  };

  const startPresentation = (
    lesson: Lesson,
    mode?: 'ppt' | 'pdf' | 'drive_embed',
    instantFile: File | null = null
  ) => {
    const chosenMode =
      mode ||
      (lesson.pptName
        ? 'ppt'
        : lesson.pdfName
          ? 'pdf'
          : lesson.externalDriveEmbedUrl
            ? 'drive_embed'
            : 'ppt');
    const newSessionId = `${lesson.id.slice(0, 8)}_${Date.now().toString(36)}`;
    setDirectFile(instantFile);
    setPresentMode(chosenMode);
    setPage(1);
    setCount(lesson.pageCount || 1);
    setBlackout(false);
    setOutlines([]);
    setSessionId(newSessionId);
    setPreview(lesson);
  };

  const closePresentation = () => {
    if (sessionId) {
      stopLessonRemoteSession(sessionId, currentUser?.uid);
    }
    setPreview(null);
    setDirectFile(null);
    setSessionId('');
    setBlackout(false);
    setShowPhoneQrModal(false);
  };

  const handleQuickFileSelect = async (file: File) => {
    const isPdf = /\.pdf$/i.test(file.name);
    const isPptx = /\.(pptx|ppt)$/i.test(file.name);
    if (!isPdf && !isPptx) {
      showToast('Vui lòng chọn tệp .pptx hoặc .pdf để trình chiếu.', 'error');
      return;
    }

    setBusy(true);
    try {
      await validateLessonFile(file, isPdf ? 'pdf' : 'ppt');
      let slideCount = 1;
      if (isPdf) {
        slideCount = await countPdfPages(file);
      } else if (/\.pptx$/i.test(file.name)) {
        slideCount = await countPptxSlides(file);
      }
      const cleanTitle = file.name.replace(/\.[^.]+$/, '');
      const lessonObj: Lesson = {
        id: crypto.randomUUID(),
        ownerId: currentUser?.uid || 'teacher',
        title: cleanTitle,
        subject: 'Tổng hợp',
        grade: 'Khối 4',
        createdAt: new Date().toISOString(),
        storageProvider: 'local',
        pageCount: slideCount,
        ...(isPdf ? { pdfName: file.name } : { pptName: file.name }),
      };

      // Best-effort save into local library
      if (currentUser?.uid) {
        try {
          await saveLesson(lessonObj, isPptx ? file : null, isPdf ? file : null);
        } catch {
          // Even if file is huge and exceeds browser cache, still present immediately from memory
        }
      }

      startPresentation(lessonObj, isPdf ? 'pdf' : 'ppt', file);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Không mở được tệp bài giảng.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    try {
      await action();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Không xử lý được tệp.', 'error');
    } finally {
      setBusy(false);
      setUploadProgress(null);
    }
  };

  const field =
    'w-full border border-slate-300 rounded-xl p-3 bg-white text-slate-900 text-sm mt-1';

  // ============================================================================
  // 1. PHONE REMOTE CONTROL VIEW (BÚT TRÌNH CHIẾU TRÊN ĐIỆN THOẠI)
  // ============================================================================
  if (activeRemoteSessionId && !preview) {
    const activePage = remoteState?.page || 1;
    const totalCount = Math.max(1, remoteState?.count || 1);
    const isBlackout = Boolean(remoteState?.blackout);
    const currentOutline = remoteState?.outlines?.find(o => o.index === activePage);

    const triggerRemoteCommand = (
      action: 'NEXT' | 'PREV' | 'SET_PAGE' | 'TOGGLE_BLACKOUT',
      targetPage?: number
    ) => {
      sendLessonRemoteCommand(activeRemoteSessionId, { action, page: targetPage });
      setRemoteState(prev => {
        if (!prev) return prev;
        if (action === 'NEXT') {
          return { ...prev, page: Math.min(prev.count, prev.page + 1) };
        }
        if (action === 'PREV') {
          return { ...prev, page: Math.max(1, prev.page - 1) };
        }
        if (action === 'SET_PAGE' && typeof targetPage === 'number') {
          return { ...prev, page: Math.min(prev.count, Math.max(1, targetPage)) };
        }
        if (action === 'TOGGLE_BLACKOUT') {
          return { ...prev, blackout: !prev.blackout };
        }
        return prev;
      });
    };

    return (
      <div className="max-w-lg mx-auto space-y-4 pb-10">
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-5 shadow-xl border border-indigo-500/30 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-3 py-1 text-xs font-extrabold text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              ĐIỀU KHIỂN TRÌNH CHIẾU
            </span>
            <button
              type="button"
              onClick={() => {
                setActiveRemoteSessionId(null);
                setSearchParams({});
              }}
              className="rounded-xl bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs font-bold text-slate-200"
            >
              Thoát điều khiển
            </button>
          </div>

          <div>
            <p className="text-xs font-semibold text-indigo-300">
              {remoteState
                ? `${remoteState.grade} • ${remoteState.subject}`
                : 'Đang đồng bộ với máy tính...'}
            </p>
            <h1 className="text-xl font-black tracking-tight mt-0.5 truncate">
              {remoteState?.title || 'Bài giảng đang trình chiếu'}
            </h1>
          </div>

          <div className="rounded-2xl bg-white/10 border border-white/15 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-bold text-indigo-200">Slide hiện tại</p>
              <p className="text-3xl font-black text-white mt-0.5">
                {activePage}{' '}
                <span className="text-lg font-semibold text-indigo-300">/ {totalCount}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => triggerRemoteCommand('TOGGLE_BLACKOUT')}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-black transition-all ${
                isBlackout
                  ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/30'
                  : 'bg-slate-800 text-slate-200 border border-slate-600 hover:bg-slate-700'
              }`}
            >
              {isBlackout ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {isBlackout ? 'Hiện lại màn chiếu' : 'Màn hình đen'}
            </button>
          </div>

          {/* Big Prev / Next Touch Buttons for walking around classroom */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              disabled={activePage <= 1}
              onClick={() => triggerRemoteCommand('PREV')}
              className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 disabled:opacity-40 border border-slate-600 py-6 px-4 text-white font-black transition-all shadow-md"
            >
              <ChevronLeft className="w-8 h-8 text-sky-300" />
              <span className="text-base">SLIDE TRƯỚC</span>
            </button>

            <button
              type="button"
              disabled={activePage >= totalCount}
              onClick={() => triggerRemoteCommand('NEXT')}
              className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 active:scale-95 disabled:opacity-40 py-6 px-4 text-white font-black transition-all shadow-lg shadow-indigo-600/40"
            >
              <ChevronRight className="w-8 h-8 text-white" />
              <span className="text-base">SLIDE TIẾP</span>
            </button>
          </div>
        </div>

        {/* Current Slide Summary & Speaker Notes on Phone */}
        {currentOutline && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-2">
            <p className="text-xs font-black uppercase tracking-wider text-indigo-600">
              Nội dung & Ghi chú Slide {activePage}
            </p>
            <h2 className="font-bold text-base text-slate-900">{currentOutline.title}</h2>
            {currentOutline.summary && (
              <p className="text-sm text-slate-600 leading-relaxed">{currentOutline.summary}</p>
            )}
            {currentOutline.notes && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-950 space-y-1">
                <p className="font-bold text-amber-800">📝 Ghi chú của giáo viên:</p>
                <p className="whitespace-pre-wrap">{currentOutline.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Quick Jump to Any Slide */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm text-slate-900">
              Chuyển nhanh đến Slide ({totalCount} trang)
            </h3>
            <button
              type="button"
              onClick={() =>
                sendLessonRemoteCommand(activeRemoteSessionId, { action: 'PING_STATE' })
              }
              className="text-xs font-bold text-indigo-600 hover:underline"
            >
              Làm mới
            </button>
          </div>

          {remoteState?.outlines && remoteState.outlines.length > 0 ? (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {remoteState.outlines.map(item => {
                const isCurrent = item.index === activePage;
                return (
                  <button
                    key={item.index}
                    type="button"
                    onClick={() => triggerRemoteCommand('SET_PAGE', item.index)}
                    className={`w-full text-left rounded-xl p-3 border transition-all flex items-start gap-3 ${
                      isCurrent
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                        isCurrent ? 'bg-white text-indigo-700' : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      {item.index}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm truncate">{item.title}</p>
                      {item.summary && (
                        <p
                          className={`text-xs truncate mt-0.5 ${
                            isCurrent ? 'text-indigo-100' : 'text-slate-500'
                          }`}
                        >
                          {item.summary}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: totalCount }, (_, idx) => {
                const num = idx + 1;
                const isCurrent = num === activePage;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => triggerRemoteCommand('SET_PAGE', num)}
                    className={`rounded-xl py-2.5 text-sm font-black border transition-all ${
                      isCurrent
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============================================================================
  // 2. COMPUTER PROJECTOR VIEW (MÀN HÌNH TRÌNH CHIẾU TRÊN MÁY TÍNH)
  // ============================================================================
  if (preview) {
    const remoteUrl = `${window.location.origin}/teacher/lessons?remote=${encodeURIComponent(sessionId)}`;
    const hasBothModes = Boolean(preview.pptName && preview.pdfName && !directFile);

    // Compute Drive/Slides embed URL if in drive_embed mode
    const driveEmbedSrc = (() => {
      if (!preview.externalDriveEmbedUrl) return '';
      if (preview.externalDriveEmbedUrl.includes('/presentation/')) {
        return `${preview.externalDriveEmbedUrl}#slide=${page}`;
      }
      return preview.externalDriveEmbedUrl;
    })();

    return (
      <div className="fixed inset-0 z-50 bg-slate-950 p-3 flex flex-col gap-2 h-[100dvh] overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 shrink-0 text-white bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2">
          <div className="flex items-center gap-3 min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500/20 border border-indigo-400/30 px-2.5 py-1 text-xs font-bold text-indigo-300 shrink-0">
              <Presentation className="w-3.5 h-3.5" />
              {presentMode === 'ppt'
                ? 'PPTX Trực tiếp'
                : presentMode === 'pdf'
                  ? 'PDF Trình chiếu'
                  : 'Google Drive / Slides'}
            </span>
            <strong className="truncate text-sm sm:text-base">{preview.title}</strong>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {hasBothModes && (
              <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
                <button
                  type="button"
                  onClick={() => setPresentMode('ppt')}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors ${
                    presentMode === 'ppt'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Bản .PPTX
                </button>
                <button
                  type="button"
                  onClick={() => setPresentMode('pdf')}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors ${
                    presentMode === 'pdf'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Bản .PDF
                </button>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              className="text-emerald-300 border-emerald-500/50 hover:bg-emerald-950/60 gap-1.5"
              onClick={() => setShowPhoneQrModal(true)}
            >
              <QrCode className="w-4 h-4" />
              Mã QR điều khiển ĐT
            </Button>

            <Button variant="primary" size="sm" onClick={closePresentation}>
              Đóng trình chiếu
            </Button>
          </div>
        </div>

        <div className="relative flex-1 min-h-0 rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
          {presentMode === 'drive_embed' && driveEmbedSrc ? (
            <iframe
              key={driveEmbedSrc}
              src={driveEmbedSrc}
              title={preview.title}
              className="w-full h-full border-0 bg-slate-950"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          ) : presentMode === 'ppt' ? (
            <PptxLessonView
              lesson={preview}
              directFile={directFile}
              page={page}
              onCount={setCount}
              onOutlines={setOutlines}
            />
          ) : (
            <PdfLessonView lesson={preview} page={page} onCount={setCount} />
          )}

          {blackout && (
            <div
              onClick={() => setBlackout(false)}
              className="absolute inset-0 z-20 bg-black flex flex-col items-center justify-center text-slate-500 cursor-pointer select-none"
            >
              <EyeOff className="w-12 h-12 mb-2 opacity-40" />
              <p className="text-sm font-semibold opacity-60">
                Màn hình đang tạm tối • Bấm vào màn hình hoặc trên điện thoại để hiện lại
              </p>
            </div>
          )}
        </div>

        <LessonSlideControls
          page={page}
          count={count}
          onPage={setPage}
          blackout={blackout}
          onToggleBlackout={() => setBlackout(prev => !prev)}
          onOpenPhoneQr={() => setShowPhoneQrModal(true)}
        />

        <Modal
          isOpen={showPhoneQrModal}
          onClose={() => setShowPhoneQrModal(false)}
          title="ĐIỀU KHIỂN SLIDE BẰNG ĐIỆN THOẠI"
          footer={
            <Button variant="primary" onClick={() => setShowPhoneQrModal(false)}>
              Đã hiểu
            </Button>
          }
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <p className="text-sm text-slate-600">
              Dùng camera điện thoại quét mã QR dưới đây (hoặc mở mục{' '}
              <strong>Bài giảng PPT</strong> trên điện thoại) để chuyển slide từ xa và xem ghi chú
              bài giảng:
            </p>
            <div className="p-4 bg-white rounded-2xl border-2 border-indigo-100 shadow-md">
              <QRCodeSVG value={remoteUrl} size={210} level="M" includeMargin />
            </div>
            <div className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600 space-y-1">
              <p className="font-bold text-slate-800">
                💡 Mẹo nhanh: Nếu điện thoại đã đăng nhập tài khoản giáo viên
              </p>
              <p>
                Thầy/cô chỉ cần bấm vào mục <strong>Bài giảng PPT</strong> trên thanh menu điện
                thoại là nút điều khiển bài giảng đang chiếu sẽ tự động hiện ngay đầu trang!
              </p>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  // ============================================================================
  // 3. LESSON LIBRARY & GOOGLE DRIVE REPOSITORY VIEW
  // ============================================================================
  return (
    <div className="space-y-5">
      <input
        ref={quickFileInputRef}
        type="file"
        accept=".pptx,.pdf"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) void handleQuickFileSelect(file);
        }}
      />

      <PageHeader
        title="KHO BÀI GIẢNG PPTX / PDF (GOOGLE DRIVE & MÁY TÍNH)"
        description="Không giới hạn dung lượng tệp tải lên • Lưu trữ trực tiếp vào Google Drive của thầy/cô để mở trên mọi máy tính và điều khiển bằng điện thoại."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => void handleConnectAndSyncDrive()}
              className={`gap-2 font-bold ${
                driveConnected
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  : 'border-sky-300 bg-sky-50 text-sky-800 hover:bg-sky-100'
              }`}
            >
              {driveConnected ? (
                <RefreshCw className="w-4 h-4 text-emerald-600" />
              ) : (
                <Cloud className="w-4 h-4 text-sky-600" />
              )}
              {driveConnected ? 'Đồng bộ từ Google Drive' : 'Kết nối Kho Google Drive'}
            </Button>

            <Button
              variant="outline"
              disabled={busy}
              onClick={() => quickFileInputRef.current?.click()}
              className="gap-2 border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold"
            >
              <Zap className="w-4 h-4 text-amber-500" />
              Chọn tệp .PPTX / .PDF chiếu ngay
            </Button>

            <Button
              variant="primary"
              disabled={busy}
              onClick={() => {
                setReplacing(null);
                setTitle('');
                setPpt(null);
                setPdf(null);
                setDriveLinkInput('');
                setOpen(true);
              }}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              Tải bài giảng lên Kho
            </Button>
          </div>
        }
      />

      {/* Google Drive Storage Status Bar */}
      <div className="rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-50 via-white to-indigo-50 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-black text-sm text-slate-900">
                Kho lưu trữ Google Drive cá nhân (Không giới hạn dung lượng tệp)
              </h2>
              {driveConnected ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Đã kết nối{' '}
                  {driveEmail ? `(${driveEmail})` : ''}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-900">
                  Chưa kết nối phiên này
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Khi tải giáo án lên, tệp <strong>.pptx / .pdf</strong> (kể cả tệp 100 MB, 500 MB hay
              hàng GB có video) sẽ được lưu vào thư mục{' '}
              <strong>“Kho Bài Giảng PPT - Lớp Học Tương Tác”</strong> trên chính Google Drive của
              thầy/cô.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => void handleConnectAndSyncDrive()}
          className="shrink-0 gap-1.5"
        >
          <Cloud className="w-4 h-4 text-sky-600" />
          {driveConnected ? 'Làm mới kho Drive' : 'Kết nối Google Drive ngay'}
        </Button>
      </div>

      {/* Auto-detected Active Presentation Banner (for opening on Phone without scanning QR) */}
      {detectedTeacherPresentation && (
        <div className="rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-0.5 text-xs font-extrabold">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
              ĐANG TRÌNH CHIẾU TRÊN MÁY TÍNH
            </span>
            <h2 className="text-lg font-black">
              {detectedTeacherPresentation.title} (Slide {detectedTeacherPresentation.page}/
              {detectedTeacherPresentation.count})
            </h2>
            <p className="text-xs text-emerald-100">
              Bấm nút bên cạnh để biến điện thoại này thành bút điều khiển chuyển slide từ xa.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => setActiveRemoteSessionId(detectedTeacherPresentation.sessionId)}
            className="bg-white text-emerald-900 hover:bg-emerald-50 font-black shrink-0 gap-2 shadow-md"
          >
            <Smartphone className="w-4 h-4 text-emerald-700" />
            Điều khiển bằng điện thoại này
          </Button>
        </div>
      )}

      {library.loading ? (
        <p className="text-slate-600 py-8 text-center">Đang đọc kho bài giảng…</p>
      ) : library.error ? (
        <p role="alert" className="text-rose-700">
          {library.error}
        </p>
      ) : !library.items.length ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-white p-10 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Presentation className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h2 className="text-lg font-black text-slate-900">Chưa có bài giảng nào trong kho</h2>
            <p className="text-sm text-slate-500">
              Thầy/cô có thể tải tệp <strong>.pptx / .pdf</strong> không giới hạn dung lượng lên{' '}
              <strong>Google Drive</strong>, dán link Google Drive có sẵn hoặc chọn tệp chiếu ngay.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Button
              variant="primary"
              onClick={() => {
                setReplacing(null);
                setTitle('');
                setPpt(null);
                setPdf(null);
                setDriveLinkInput('');
                setOpen(true);
              }}
              className="gap-2"
            >
              <Cloud className="w-4 h-4" />
              Tải bài giảng lên Google Drive
            </Button>
            <Button
              variant="outline"
              onClick={() => void handleConnectAndSyncDrive()}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Lấy bài giảng từ Google Drive
            </Button>
            <Button
              variant="outline"
              onClick={() => quickFileInputRef.current?.click()}
              className="gap-2"
            >
              <Zap className="w-4 h-4 text-amber-500" />
              Chọn tệp trên máy chiếu ngay
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {library.items.map(lesson => {
            const canPresentPpt = Boolean(lesson.pptName || lesson.pptDriveId);
            const canPresentPdf = Boolean(lesson.pdfName || lesson.pdfDriveId);
            const canPresentDriveEmbed = Boolean(lesson.externalDriveEmbedUrl);
            const isDriveStored = Boolean(
              lesson.storageProvider === 'gdrive' ||
                lesson.pptDriveId ||
                lesson.pdfDriveId ||
                lesson.externalDriveEmbedUrl
            );

            return (
              <article
                key={lesson.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                        {lesson.grade} • {lesson.subject}
                      </span>
                      {isDriveStored ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 border border-sky-200 px-2.5 py-0.5 text-xs font-bold text-sky-700">
                          <Cloud className="w-3.5 h-3.5" /> Kho Google Drive
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                          <HardDrive className="w-3.5 h-3.5" /> Lưu trên máy
                        </span>
                      )}
                    </div>
                    {lesson.pageCount && (
                      <span className="text-xs font-bold text-slate-500">
                        {lesson.pageCount} slide
                      </span>
                    )}
                  </div>

                  <h2 className="font-black text-lg text-slate-900 my-2">{lesson.title}</h2>

                  <div className="space-y-1 text-xs text-slate-600">
                    {lesson.pptName && (
                      <p className="flex items-center gap-1.5 break-all">
                        <Presentation className="w-4 h-4 text-orange-600 shrink-0" />
                        <span>
                          <strong>PowerPoint:</strong> {lesson.pptName}
                        </span>
                      </p>
                    )}
                    {lesson.pdfName && (
                      <p className="flex items-center gap-1.5 break-all">
                        <FileText className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>
                          <strong>PDF:</strong> {lesson.pdfName}
                        </span>
                      </p>
                    )}
                    {lesson.externalDriveEmbedUrl && !lesson.pptName && !lesson.pdfName && (
                      <p className="flex items-center gap-1.5 break-all text-sky-700">
                        <Link2 className="w-4 h-4 shrink-0" />
                        <span>Liên kết trình chiếu trực tiếp từ Google Drive / Slides</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-slate-100">
                  {canPresentPpt && (
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={busy}
                      onClick={() => startPresentation(lesson, 'ppt')}
                      className="gap-1.5"
                    >
                      <MonitorPlay className="w-4 h-4" />
                      Trình chiếu PPTX
                    </Button>
                  )}

                  {canPresentPdf && (
                    <Button
                      variant={canPresentPpt ? 'outline' : 'primary'}
                      size="sm"
                      disabled={busy}
                      onClick={() => startPresentation(lesson, 'pdf')}
                      className="gap-1.5"
                    >
                      <MonitorPlay className="w-4 h-4" />
                      Trình chiếu PDF
                    </Button>
                  )}

                  {canPresentDriveEmbed && (
                    <Button
                      variant={canPresentPpt || canPresentPdf ? 'outline' : 'primary'}
                      size="sm"
                      disabled={busy}
                      onClick={() => startPresentation(lesson, 'drive_embed')}
                      className="gap-1.5"
                    >
                      <MonitorPlay className="w-4 h-4" />
                      Chiếu từ Drive
                    </Button>
                  )}

                  {(lesson.pptDriveUrl || lesson.pdfDriveUrl) && (
                    <a
                      href={lesson.pptDriveUrl || lesson.pdfDriveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-xl border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-700 hover:bg-sky-100"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Mở trên Drive
                    </a>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={busy}
                    onClick={() => {
                      setReplacing(lesson);
                      setTitle(lesson.title);
                      setSubject(lesson.subject);
                      setGrade(lesson.grade);
                      setPpt(null);
                      setPdf(null);
                      setDriveLinkInput(lesson.externalDriveEmbedUrl || '');
                      setOpen(true);
                    }}
                  >
                    Cập nhật
                  </Button>

                  {lesson.pptName && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={busy}
                      onClick={() => run(() => downloadLesson(lesson, 'ppt'))}
                      className="gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Tải PPT
                    </Button>
                  )}

                  {lesson.pdfName && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={busy}
                      onClick={() => run(() => downloadLesson(lesson, 'pdf'))}
                      className="gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Tải PDF
                    </Button>
                  )}

                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={busy}
                    onClick={() => setDeleting(lesson)}
                    className="gap-1 text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Xoá
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Upload / Save Lesson Modal (Google Drive + Local + Unlimited Size) */}
      <Modal
        isOpen={open}
        onClose={() => {
          if (!busy) setOpen(false);
        }}
        title={
          replacing
            ? 'Cập nhật bài giảng (Google Drive / Máy tính)'
            : 'Tải giáo án PPTX / PDF lên Kho Google Drive'
        }
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="primary"
              disabled={busy || (!ppt && !pdf && !driveLinkInput.trim())}
              onClick={() =>
                run(async () => {
                  if (!currentUser?.uid) throw new Error('Cần đăng nhập giáo viên.');
                  if (!title.trim()) throw new Error('Nhập tên bài giảng.');
                  let pageCount: number | undefined = replacing?.pageCount;
                  const lessonId = replacing?.id || crypto.randomUUID();

                  if (ppt) {
                    await validateLessonFile(ppt, 'ppt');
                    if (/\.pptx$/i.test(ppt.name)) {
                      try {
                        pageCount = await countPptxSlides(ppt);
                      } catch {
                        // Ignore slide count failure
                      }
                    }
                  }

                  if (pdf) {
                    await validateLessonFile(pdf, 'pdf');
                    try {
                      pageCount = await countPdfPages(pdf);
                    } catch {
                      throw new Error(
                        'Không đọc được PDF. Hãy xuất PDF không có mật khẩu từ PowerPoint.'
                      );
                    }
                  }

                  let pptDriveId = replacing?.pptDriveId;
                  let pptDriveUrl = replacing?.pptDriveUrl;
                  let pdfDriveId = replacing?.pdfDriveId;
                  let pdfDriveUrl = replacing?.pdfDriveUrl;
                  let externalDriveEmbedUrl = replacing?.externalDriveEmbedUrl;

                  if (driveLinkInput.trim()) {
                    const parsedLink = extractDriveFileIdFromUrl(driveLinkInput);
                    if (!parsedLink) {
                      throw new Error(
                        'Liên kết Google Drive / Google Slides chưa đúng định dạng. Hãy sao chép liên kết chia sẻ từ Google Drive.'
                      );
                    }
                    externalDriveEmbedUrl = parsedLink.embedUrl;
                    if (!pageCount) {
                      pageCount = Math.max(1, driveSlideCountInput || 15);
                    }
                  }

                  if (saveToDrive && (ppt || pdf)) {
                    setUploadProgress(1);
                    if (ppt) {
                      const uploadedPpt = await uploadFileToGoogleDrive(
                        ppt,
                        {
                          lessonId,
                          ownerId: currentUser.uid,
                          title: title.trim(),
                          subject,
                          grade,
                          fileRole: 'ppt',
                          pageCount,
                        },
                        pct => setUploadProgress(pct)
                      );
                      pptDriveId = uploadedPpt.fileId;
                      pptDriveUrl = uploadedPpt.webViewLink;
                    }
                    if (pdf) {
                      const uploadedPdf = await uploadFileToGoogleDrive(
                        pdf,
                        {
                          lessonId,
                          ownerId: currentUser.uid,
                          title: title.trim(),
                          subject,
                          grade,
                          fileRole: 'pdf',
                          pageCount,
                        },
                        pct => setUploadProgress(pct)
                      );
                      pdfDriveId = uploadedPdf.fileId;
                      pdfDriveUrl = uploadedPdf.webViewLink;
                    }
                    refreshDriveStatus();
                  }

                  const lesson: Lesson = {
                    ...(replacing || {}),
                    id: lessonId,
                    ownerId: currentUser.uid,
                    title: title.trim(),
                    subject,
                    grade,
                    createdAt: replacing?.createdAt || new Date().toISOString(),
                    storageProvider:
                      saveToDrive || externalDriveEmbedUrl ? 'gdrive' : 'local',
                    ...(pageCount ? { pageCount } : {}),
                    ...(ppt ? { pptName: ppt.name } : {}),
                    ...(pdf ? { pdfName: pdf.name } : {}),
                    ...(pptDriveId ? { pptDriveId } : {}),
                    ...(pptDriveUrl ? { pptDriveUrl } : {}),
                    ...(pdfDriveId ? { pdfDriveId } : {}),
                    ...(pdfDriveUrl ? { pdfDriveUrl } : {}),
                    ...(externalDriveEmbedUrl ? { externalDriveEmbedUrl } : {}),
                  };

                  await saveLesson(lesson, ppt, pdf);
                  setOpen(false);
                  showToast(
                    saveToDrive && (ppt || pdf)
                      ? 'Đã tải bài giảng lên Google Drive của thầy/cô thành công!'
                      : 'Đã lưu bài giảng thành công!',
                    'success'
                  );
                })
              }
            >
              {busy
                ? uploadProgress !== null
                  ? `Đang tải lên Google Drive (${uploadProgress}%)…`
                  : 'Đang lưu…'
                : 'Lưu bài giảng'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Storage target selector */}
          <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-3.5 space-y-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={saveToDrive}
                onChange={e => setSaveToDrive(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <div className="text-xs">
                <span className="font-black text-slate-900 flex items-center gap-1.5 text-sm">
                  <Cloud className="w-4 h-4 text-sky-600" />
                  Lưu trực tiếp vào Kho Google Drive của tôi (Khuyên dùng)
                </span>
                <p className="text-slate-600 mt-0.5">
                  Không giới hạn dung lượng tệp tải lên (hỗ trợ tệp .pptx/.pdf nặng hàng trăm MB có
                  video) và tự động đồng bộ khi mở trên máy tính ở lớp.
                </p>
              </div>
            </label>
          </div>

          <label className="block text-sm font-bold text-slate-700">
            Tên bài giảng
            <input
              className={field}
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ví dụ: Phân số – Tiết 1"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm font-bold text-slate-700">
              Môn học
              <select
                className={field}
                value={subject}
                onChange={e => setSubject(e.target.value)}
              >
                {SUBJECT_OPTIONS.map(s => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-bold text-slate-700">
              Khối lớp
              <select className={field} value={grade} onChange={e => setGrade(e.target.value)}>
                {[1, 2, 3, 4, 5].map(g => (
                  <option key={g}>Khối {g}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="block text-sm font-bold text-slate-700">
            Tệp PowerPoint (.pptx / .ppt — Không giới hạn dung lượng)
            <input
              className={field}
              type="file"
              accept=".pptx,.ppt"
              onChange={e => {
                const file = e.target.files?.[0] || null;
                setPpt(file);
                if (file && !title) setTitle(file.name.replace(/\.[^.]+$/, ''));
              }}
            />
          </label>

          <label className="block text-sm font-bold text-slate-700">
            Tệp PDF trình chiếu (tùy chọn — Không giới hạn dung lượng)
            <input
              className={field}
              type="file"
              accept=".pdf"
              onChange={e => {
                const file = e.target.files?.[0] || null;
                setPdf(file);
                if (file && !title) setTitle(file.name.replace(/\.[^.]+$/, ''));
              }}
            />
          </label>

          <div className="border-t border-slate-200 pt-3 space-y-2">
            <label className="block text-sm font-bold text-slate-700">
              Hoặc dán liên kết bài giảng đã có sẵn trên Google Drive / Google Slides (tùy chọn)
              <input
                className={field}
                value={driveLinkInput}
                onChange={e => setDriveLinkInput(e.target.value)}
                placeholder="https://docs.google.com/presentation/d/... hoặc https://drive.google.com/file/d/..."
              />
            </label>
            {driveLinkInput.trim() && (
              <label className="block text-xs font-bold text-slate-600">
                Số trang slide dự kiến (để điều khiển trên điện thoại)
                <input
                  type="number"
                  min={1}
                  max={200}
                  className={field}
                  value={driveSlideCountInput}
                  onChange={e => setDriveSlideCountInput(Number(e.target.value) || 1)}
                />
              </label>
            )}
          </div>

          {uploadProgress !== null && (
            <div className="rounded-xl bg-sky-50 border border-sky-200 p-3 space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-sky-900">
                <span>Đang tải tệp lên Google Drive của thầy/cô...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2.5 bg-sky-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-600 transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleting}
        onClose={() => {
          if (!busy) setDeleting(null);
        }}
        title="Xoá bài giảng khỏi kho"
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setDeleting(null)}>
              Hủy
            </Button>
            <Button
              variant="danger"
              disabled={busy}
              onClick={() =>
                run(async () => {
                  if (deleting) {
                    await deleteLesson(deleting);
                    setDeleting(null);
                    showToast('Đã xoá bài giảng khỏi kho.', 'success');
                  }
                })
              }
            >
              Xoá khỏi kho
            </Button>
          </>
        }
      >
        <p className="font-bold text-slate-900">{deleting?.title}</p>
        <p className="mt-2 text-sm text-slate-600">
          Xoá bài giảng này khỏi danh sách kho (tệp gốc trong thư mục máy tính của thầy/cô vẫn giữ
          nguyên).
        </p>
      </Modal>
    </div>
  );
}
