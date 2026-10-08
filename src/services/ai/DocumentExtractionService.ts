import type { DocumentExtractResult } from './types';

const loadScript = (src: string, globalName: string): Promise<any> =>
  new Promise((resolve, reject) => {
    const existing = (window as any)[globalName];
    if (existing) {
      resolve(existing);
      return;
    }

    const previous = document.querySelector(`script[data-ai-parser="${globalName}"]`);
    if (previous) {
      previous.addEventListener('load', () => resolve((window as any)[globalName]), { once: true });
      previous.addEventListener('error', () => reject(new Error(`Không tải được ${globalName}`)), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.dataset.aiParser = globalName;
    script.onload = () => {
      const loaded = (window as any)[globalName];
      if (loaded) resolve(loaded);
      else reject(new Error(`Thư viện ${globalName} không khởi tạo được.`));
    };
    script.onerror = () => reject(new Error(`Không tải được thư viện ${globalName}.`));
    document.head.appendChild(script);
  });

const normalizeExtractedText = (text: string): string =>
  text
    .replace(/\u0000/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

export class DocumentExtractionService {
  public static async extractTextFromFile(file: File): Promise<DocumentExtractResult> {
    const fileName = file.name;
    const ext = fileName.split('.').pop()?.toLowerCase();

    if (file.size > 15 * 1024 * 1024) {
      return {
        fileName,
        charCount: 0,
        extractedText: '',
        error: 'File quá lớn. Vui lòng chọn tài liệu dưới 15 MB.',
      };
    }

    // TXT
    if (ext === 'txt') {
      const text = normalizeExtractedText(await file.text());
      return {
        fileName,
        charCount: text.length,
        extractedText: text,
        ...(text ? {} : { error: 'File TXT không có nội dung chữ.' }),
      };
    }

    // DOCX - real extraction with Mammoth browser build.
    if (ext === 'docx') {
      try {
        const mammoth = await loadScript(
          'https://cdn.jsdelivr.net/npm/mammoth@1.8.0/mammoth.browser.min.js',
          'mammoth'
        );
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        const text = normalizeExtractedText(result?.value || '');

        if (!text) {
          throw new Error('Không tìm thấy nội dung chữ trong file Word.');
        }

        return {
          fileName,
          charCount: text.length,
          extractedText: text,
        };
      } catch (error: any) {
        return {
          fileName,
          charCount: 0,
          extractedText: '',
          error:
            error?.message ||
            'Không đọc được file DOCX. Vui lòng kiểm tra kết nối mạng hoặc thử lưu lại file Word.',
        };
      }
    }

    // Legacy .DOC cannot be parsed safely in the browser.
    if (ext === 'doc') {
      return {
        fileName,
        charCount: 0,
        extractedText: '',
        error: 'File .DOC cũ chưa được hỗ trợ. Hãy mở bằng Word và lưu lại thành .DOCX.',
      };
    }

    // PDF - real text extraction with PDF.js.
    if (ext === 'pdf') {
      try {
        const pdfjsLib = await loadScript(
          'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js',
          'pdfjsLib'
        );
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

        const bytes = new Uint8Array(await file.arrayBuffer());
        const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;

        const pageTexts: string[] = [];
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          const page = await pdf.getPage(pageNumber);
          const content = await page.getTextContent();
          const text = content.items
            .map((item: any) => (typeof item?.str === 'string' ? item.str : ''))
            .join(' ');
          if (text.trim()) pageTexts.push(text);
        }

        const extractedText = normalizeExtractedText(pageTexts.join('\n\n'));
        if (!extractedText) {
          return {
            fileName,
            charCount: 0,
            extractedText: '',
            error:
              'PDF không có lớp chữ để đọc (có thể là PDF scan/ảnh). Hãy dùng PDF có thể bôi đen chữ hoặc DOCX/TXT.',
          };
        }

        return {
          fileName,
          charCount: extractedText.length,
          extractedText,
        };
      } catch (error: any) {
        return {
          fileName,
          charCount: 0,
          extractedText: '',
          error:
            error?.message ||
            'Không đọc được file PDF. Hãy thử PDF có lớp chữ hoặc chuyển sang DOCX/TXT.',
        };
      }
    }

    return {
      fileName,
      charCount: 0,
      extractedText: '',
      error: `Định dạng .${ext || 'không xác định'} chưa được hỗ trợ. Hãy dùng TXT, DOCX hoặc PDF.`,
    };
  }
}
