import DOMPurify from 'dompurify';
import {detectWorksheetQuestions,type WorksheetDraft} from './content';
export function sanitizeWorksheetHtml(html:string):string{
 const clean=DOMPurify.sanitize(html,{ALLOWED_TAGS:['p','br','h1','h2','h3','h4','h5','h6','strong','em','u','s','sup','sub','ul','ol','li','table','thead','tbody','tr','td','th','img'],ALLOWED_ATTR:['src','alt','colspan','rowspan']});
 const document=new DOMParser().parseFromString(clean,'text/html');
 document.querySelectorAll('img').forEach(img=>{if(!/^data:image\/(png|jpeg|gif|webp);base64,[A-Za-z0-9+/=]+$/.test(img.getAttribute('src')||''))img.remove();});
 return document.body.innerHTML;
}
export async function readWordWorksheet(file:File):Promise<{draft:WorksheetDraft;warnings:string[]}>{
 if(!/\.docx$/i.test(file.name))throw new Error('Chọn file Word .docx. Với file .doc cũ, thầy/cô hãy lưu lại thành .docx trong Word.');
 if(file.size>8*1024*1024)throw new Error('File Word tối đa 8 MB. Thầy/cô hãy giảm kích thước ảnh hoặc chia phiếu.');
 const mammoth=await import('mammoth');
 let result;
 try{result=await mammoth.convertToHtml({arrayBuffer:await file.arrayBuffer()},{externalFileAccess:false,includeEmbeddedStyleMap:false});}catch{throw new Error('Không đọc được file Word. Kiểm tra file không bị hỏng hoặc đặt mật khẩu rồi lưu lại thành .docx.');}
 const html=sanitizeWorksheetHtml(result.value);
 const document=new DOMParser().parseFromString(html,'text/html');
 if(!document.body.textContent?.trim())throw new Error('Phiếu chưa có nội dung văn bản. Hãy thêm câu hỏi trong file Word.');
 const lines=Array.from(document.querySelectorAll('p,h1,h2,h3,h4,li')).map(p=>p.textContent||'').join('\n');
 return {draft:{title:file.name.replace(/\.docx$/i,''),fileName:file.name,html,questions:detectWorksheetQuestions(lines)},warnings:result.messages.filter(m=>m.type==='warning').map(m=>m.message)};
}
