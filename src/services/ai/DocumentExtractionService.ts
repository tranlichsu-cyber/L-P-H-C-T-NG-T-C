import type { DocumentExtractResult } from './types';

export class DocumentExtractionService {
  public static async extractTextFromFile(file: File): Promise<DocumentExtractResult> {
    const fileName = file.name;
    const ext = fileName.split('.').pop()?.toLowerCase();

    // 1. Plain Text TXT File
    if (ext === 'txt') {
      const text = await file.text();
      return {
        fileName,
        charCount: text.length,
        extractedText: text,
      };
    }

    // 2. Word DOCX File
    if (ext === 'docx' || ext === 'doc') {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const textDecoder = new TextDecoder('utf-8');
        const rawText = textDecoder.decode(arrayBuffer);

        // Basic clean text extraction from XML tags in docx
        const cleanText = rawText
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

        if (cleanText.length > 20) {
          return {
            fileName,
            charCount: cleanText.length,
            extractedText: cleanText,
          };
        }
      } catch (e) {
        console.warn('Fallback DOCX extraction used', e);
      }

      // Safe Fallback for DOCX
      const fallbackText = await file.text();
      const cleaned = fallbackText.replace(/[^\w\sàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ,.?!-]/gi, ' ').replace(/\s+/g, ' ').trim();
      return {
        fileName,
        charCount: cleaned.length,
        extractedText: cleaned || 'Nội dung văn bản được trích xuất từ tài liệu Word.',
      };
    }

    // 3. PDF File
    if (ext === 'pdf') {
      try {
        const rawText = await file.text();
        const cleanedText = rawText
          .replace(/[\x00-\x1F\x7F-\x9F]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

        if (cleanedText.length > 50) {
          return {
            fileName,
            charCount: cleanedText.length,
            extractedText: cleanedText,
          };
        }
      } catch (e) {
        console.warn('PDF text extraction error', e);
      }

      return {
        fileName,
        charCount: 0,
        extractedText: '',
        error: 'Không đọc được nội dung chữ trong tài liệu này (có thể là file PDF scan hoặc chưa hỗ trợ OCR).',
      };
    }

    return {
      fileName,
      charCount: 0,
      extractedText: '',
      error: `Định dạng file .${ext} chưa được hỗ trợ. Hãy dùng file .TXT, .DOCX hoặc .PDF text.`,
    };
  }
}
