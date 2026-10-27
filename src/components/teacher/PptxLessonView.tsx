import { useEffect, useRef, useState } from 'react';
import { getLessonFile, type Lesson } from '../../services/lessons/lessonLibrary';
import {
  parsePptxPresentation,
  type ParsedPptxPresentation,
  type SlideOutlineItem,
} from '../../services/lessons/pptxParser';

interface PptxLessonViewProps {
  lesson: Lesson;
  directFile?: Blob | File | null;
  page: number;
  animStep?: number;
  enableAnimations?: boolean;
  onCount?: (count: number) => void;
  onMaxAnimSteps?: (max: number) => void;
  onOutlines?: (outlines: SlideOutlineItem[]) => void;
}

export function PptxLessonView({
  lesson,
  directFile,
  page,
  animStep = 0,
  enableAnimations = true,
  onCount,
  onMaxAnimSteps,
  onOutlines,
}: PptxLessonViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [presentation, setPresentation] = useState<ParsedPptxPresentation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [containerSize, setContainerSize] = useState({ width: 960, height: 540 });

  const onCountRef = useRef(onCount);
  const onMaxAnimStepsRef = useRef(onMaxAnimSteps);
  const onOutlinesRef = useRef(onOutlines);
  useEffect(() => {
    onCountRef.current = onCount;
    onMaxAnimStepsRef.current = onMaxAnimSteps;
    onOutlinesRef.current = onOutlines;
  }, [onCount, onMaxAnimSteps, onOutlines]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        setContainerSize({
          width: Math.max(100, entry.contentRect.width),
          height: Math.max(100, entry.contentRect.height),
        });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let disposed = false;
    let currentPres: ParsedPptxPresentation | null = null;
    setPresentation(null);
    setLoading(true);
    setError('');

    void (async () => {
      try {
        const blob =
          directFile ||
          (await getLessonFile(
            {
              id: lesson.id,
              ownerId: lesson.ownerId,
              title: lesson.title,
              subject: lesson.subject,
              grade: lesson.grade,
              createdAt: lesson.createdAt,
            },
            'ppt'
          ));
        if (disposed) return;

        const header = new Uint8Array(await blob.slice(0, 8).arrayBuffer());
        const isOldOlePpt = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1].every(
          (v, idx) => header[idx] === v
        );
        if (isOldOlePpt) {
          throw new Error(
            'Tệp này đang ở định dạng .ppt cũ (PowerPoint 97-2003). Vui lòng lưu thành đuôi .pptx hoặc .pdf trong PowerPoint để trình chiếu trực tiếp trên web.'
          );
        }

        const parsed = await parsePptxPresentation(blob);
        if (disposed) {
          parsed.revokeUrls();
          return;
        }
        currentPres = parsed;
        setPresentation(parsed);
        onCountRef.current?.(Math.max(1, parsed.slides.length));
        onOutlinesRef.current?.(parsed.outlines);
      } catch (err) {
        if (!disposed) {
          setError(
            err instanceof Error
              ? err.message
              : 'Không đọc được tệp PowerPoint (.pptx). Vui lòng kiểm tra lại tệp.'
          );
        }
      } finally {
        if (!disposed) setLoading(false);
      }
    })();

    return () => {
      disposed = true;
      currentPres?.revokeUrls();
    };
  }, [
    directFile,
    lesson.id,
    lesson.ownerId,
    lesson.title,
    lesson.subject,
    lesson.grade,
    lesson.createdAt,
  ]);

  const aspectRatio = presentation?.aspectRatio || 16 / 9;
  let stageWidth = containerSize.width;
  let stageHeight = stageWidth / aspectRatio;
  if (stageHeight > containerSize.height) {
    stageHeight = containerSize.height;
    stageWidth = stageHeight * aspectRatio;
  }
  const fontScale = Math.max(0.35, stageWidth / 960);

  const currentSlide =
    presentation && presentation.slides.length > 0
      ? presentation.slides[Math.min(presentation.slides.length - 1, Math.max(0, page - 1))]
      : null;

  useEffect(() => {
    if (currentSlide) {
      onMaxAnimStepsRef.current?.(currentSlide.maxAnimSteps || 0);
    }
  }, [currentSlide]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-0 flex items-center justify-center overflow-hidden bg-slate-950 select-none relative"
      aria-label={`Bài giảng PowerPoint ${lesson.title}, slide ${page}`}
    >
      <style>{`
        @keyframes pptxSlidePush {
          0% { opacity: 0.1; transform: translateX(35px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes pptxSlideFade {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes pptxSlideZoom {
          0% { opacity: 0.2; transform: scale(0.94); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes pptxAnimFlyIn {
          0% { opacity: 0; transform: translateY(28px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes pptxAnimZoomIn {
          0% { opacity: 0; transform: scale(0.65); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes pptxAnimFadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes pptxAnimWipeIn {
          0% { opacity: 0; clip-path: inset(0 100% 0 0); }
          100% { opacity: 1; clip-path: inset(0 0 0 0); }
        }
      `}</style>

      {error ? (
        <div
          role="alert"
          className="max-w-xl rounded-2xl border border-amber-400/40 bg-amber-950/70 p-6 text-amber-100 text-center space-y-2"
        >
          <p className="font-bold text-lg">Không mở được slide PowerPoint</p>
          <p className="text-sm text-amber-200/90">{error}</p>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center gap-3 text-white">
          <div className="w-10 h-10 rounded-full border-4 border-sky-400 border-t-transparent animate-spin" />
          <p className="font-semibold text-sm">Đang dựng slide bài giảng .pptx…</p>
        </div>
      ) : currentSlide ? (
        <div
          key={`slide_${page}`}
          className="relative overflow-hidden rounded-lg shadow-2xl transition-all duration-200"
          style={{
            width: `${Math.floor(stageWidth)}px`,
            height: `${Math.floor(stageHeight)}px`,
            backgroundColor: currentSlide.backgroundColor || '#ffffff',
            backgroundImage: currentSlide.backgroundImageUrl
              ? `url(${currentSlide.backgroundImageUrl})`
              : currentSlide.backgroundGradient || undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            animation:
              currentSlide.transition === 'fade'
                ? 'pptxSlideFade 0.3s ease-out both'
                : currentSlide.transition === 'zoom'
                  ? 'pptxSlideZoom 0.35s cubic-bezier(0.16, 1, 0.3, 1) both'
                  : 'pptxSlidePush 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
          }}
        >
          {currentSlide.elements.map(el => {
            const isVisible =
              !enableAnimations || !el.animStep || el.animStep <= (animStep || 0);

            if (!isVisible) return null;

            const animStyle =
              enableAnimations && el.animStep && el.animStep > 0
                ? {
                    animation:
                      el.animEffect === 'zoom'
                        ? 'pptxAnimZoomIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both'
                        : el.animEffect === 'fade'
                          ? 'pptxAnimFadeIn 0.4s ease-out both'
                          : el.animEffect === 'wipe'
                            ? 'pptxAnimWipeIn 0.5s ease-out both'
                            : 'pptxAnimFlyIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
                  }
                : {};

            if (el.kind === 'image') {
              return (
                <img
                  key={el.id}
                  src={el.url}
                  alt=""
                  draggable={false}
                  loading="eager"
                  style={{
                    position: 'absolute',
                    left: `${el.xPct}%`,
                    top: `${el.yPct}%`,
                    width: `${el.wPct}%`,
                    height: `${el.hPct}%`,
                    objectFit: 'contain',
                    zIndex: 2,
                    ...animStyle,
                  }}
                />
              );
            }

            if (el.kind === 'video') {
              return (
                <video
                  key={el.id}
                  src={el.url}
                  poster={el.posterUrl}
                  controls
                  playsInline
                  style={{
                    position: 'absolute',
                    left: `${el.xPct}%`,
                    top: `${el.yPct}%`,
                    width: `${el.wPct}%`,
                    height: `${el.hPct}%`,
                    objectFit: 'contain',
                    backgroundColor: '#000',
                    borderRadius: '6px',
                    zIndex: 3,
                    ...animStyle,
                  }}
                />
              );
            }

            if (el.kind === 'audio') {
              return (
                <div
                  key={el.id}
                  style={{
                    position: 'absolute',
                    left: `${el.xPct}%`,
                    top: `${el.yPct}%`,
                    width: `${Math.max(el.wPct, 24)}%`,
                    zIndex: 3,
                    ...animStyle,
                  }}
                  className="bg-slate-900/85 backdrop-blur-xs p-2 rounded-xl shadow-lg"
                >
                  <audio src={el.url} controls className="w-full h-9" />
                </div>
              );
            }

            if (el.kind === 'table') {
              return (
                <div
                  key={el.id}
                  style={{
                    position: 'absolute',
                    left: `${el.xPct}%`,
                    top: `${el.yPct}%`,
                    width: `${el.wPct}%`,
                    height: `${el.hPct}%`,
                    fontSize: `${Math.max(10, Math.round(16 * fontScale))}px`,
                    zIndex: 2,
                    ...animStyle,
                  }}
                  className="overflow-auto"
                >
                  <table className="w-full h-full border-collapse border border-slate-400 bg-white/95 shadow-xs">
                    <tbody>
                      {el.rows.map((row, rIdx) => (
                        <tr key={rIdx}>
                          {row.map((cell, cIdx) => (
                            <td
                              key={cIdx}
                              colSpan={cell.colSpan}
                              style={{
                                backgroundColor:
                                  cell.fillColor || (rIdx === 0 ? '#e2e8f0' : undefined),
                                color: cell.color || '#0f172a',
                                fontWeight: cell.bold || rIdx === 0 ? 700 : 500,
                                padding: `${Math.max(3, Math.round(8 * fontScale))}px`,
                              }}
                              className="border border-slate-300 align-middle"
                            >
                              {cell.text}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            }

            if (el.kind !== 'shape') return null;

            // Shape / TextBox element
            const justifyContent =
              el.vAlign === 'middle'
                ? 'center'
                : el.vAlign === 'bottom'
                  ? 'flex-end'
                  : 'flex-start';

            return (
              <div
                key={el.id}
                style={{
                  position: 'absolute',
                  left: `${el.xPct}%`,
                  top: `${el.yPct}%`,
                  width: `${el.wPct}%`,
                  minHeight: `${el.hPct}%`,
                  maxHeight: `${100 - el.yPct}%`,
                  backgroundColor: el.fillColor,
                  border: el.borderColor
                    ? `${Math.max(1, Math.round(2 * fontScale))}px solid ${el.borderColor}`
                    : undefined,
                  borderRadius: el.borderRadiusPct
                    ? `${Math.round(14 * fontScale)}px`
                    : undefined,
                  padding:
                    el.fillColor || el.borderColor
                      ? `${Math.max(4, Math.round(10 * fontScale))}px`
                      : `${Math.max(2, Math.round(4 * fontScale))}px`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent,
                  overflow: 'hidden',
                  boxSizing: 'border-box',
                  zIndex: el.fillColor || el.borderColor ? 1 : 2,
                  ...animStyle,
                }}
              >
                {el.paragraphs.map((para, pIdx) => {
                  const defaultPt = el.isTitle ? 32 : 20;
                  const levelIndent = (para.level || 0) * Math.round(22 * fontScale);
                  return (
                    <div
                      key={pIdx}
                      style={{
                        textAlign: para.align || (el.isTitle ? 'left' : 'left'),
                        paddingLeft: levelIndent ? `${levelIndent}px` : undefined,
                        marginBottom: `${Math.max(2, Math.round(5 * fontScale))}px`,
                        lineHeight: 1.28,
                        wordBreak: 'break-word',
                      }}
                    >
                      {para.bullet && (
                        <span
                          style={{
                            fontSize: `${Math.max(10, Math.round((para.runs[0]?.fontSizePt || defaultPt) * fontScale))}px`,
                            color: para.runs[0]?.color || '#1e293b',
                            marginRight: `${Math.max(4, Math.round(8 * fontScale))}px`,
                          }}
                        >
                          •
                        </span>
                      )}
                      {para.runs.map((run, rIdx) => {
                        const pt = run.fontSizePt || defaultPt;
                        const px = Math.max(9, Math.round(pt * 1.18 * fontScale));
                        return (
                          <span
                            key={rIdx}
                            style={{
                              fontSize: `${px}px`,
                              fontWeight: run.bold || el.isTitle ? 700 : 500,
                              fontStyle: run.italic ? 'italic' : undefined,
                              textDecoration: run.underline ? 'underline' : undefined,
                              color:
                                run.color ||
                                (currentSlide.backgroundColor &&
                                /^#(0|1|2|3)/.test(currentSlide.backgroundColor)
                                  ? '#f8fafc'
                                  : '#0f172a'),
                              whiteSpace: 'pre-wrap',
                            }}
                          >
                            {run.text}
                          </span>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            );
          })}

          {currentSlide.elements.length === 0 && (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-slate-500">
              <p className="font-bold text-lg text-slate-700">{currentSlide.title}</p>
              {currentSlide.summary && (
                <p className="mt-2 text-sm max-w-lg">{currentSlide.summary}</p>
              )}
            </div>
          )}

          {/* Subtle slide number badge */}
          <div className="absolute bottom-2 right-3 rounded-full bg-slate-900/55 px-2.5 py-0.5 text-[11px] font-bold text-white/90 pointer-events-none">
            {page} / {presentation?.slides.length || 1}
            {currentSlide.maxAnimSteps && currentSlide.maxAnimSteps > 0
              ? ` • Bước ${animStep}/${currentSlide.maxAnimSteps}`
              : ''}
          </div>
        </div>
      ) : null}
    </div>
  );
}
