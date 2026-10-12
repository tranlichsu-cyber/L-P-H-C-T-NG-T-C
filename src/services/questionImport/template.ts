import * as XLSX from 'xlsx';
import type { Question, QuestionType } from '../../types';
export type ImportedQuestion = Omit<Question,'id'> & { points: number };
export const headers=['Loại câu hỏi','Nội dung','A','B','C','D','Đáp án đúng','Giải thích','Điểm'];
const types: Record<string,QuestionType>={'Trắc nghiệm':'MULTIPLE_CHOICE','Đúng/Sai':'TRUE_FALSE','Trả lời ngắn':'SHORT_ANSWER','Điền khuyết':'FILL_BLANK','Sắp xếp':'ORDERING',MULTIPLE_CHOICE:'MULTIPLE_CHOICE',TRUE_FALSE:'TRUE_FALSE',SHORT_ANSWER:'SHORT_ANSWER',FILL_BLANK:'FILL_BLANK',ORDERING:'ORDERING'};
export function downloadQuestionTemplate(){
 const wb=XLSX.utils.book_new();const ws=XLSX.utils.aoa_to_sheet([headers,
 ['Trắc nghiệm','2 + 3 bằng bao nhiêu?','4','5','6','7','B','2 + 3 = 5.',2],
 ['Đúng/Sai','10 lớn hơn 5.','','','','','Đúng','',2],
 ['Trả lời ngắn','8 + 2 bằng bao nhiêu?','','','','','10','',2],
 ['Điền khuyết','Một tuần có … ngày.','','','','','7','',2],
 ['Sắp xếp','Sắp xếp các số từ bé đến lớn.','','','','','1 → 2 → 3','',2]]);
 ws['!cols']=[{wch:20},{wch:50},...Array.from({length:4},()=>({wch:20})),{wch:30},{wch:40},{wch:12}];
 XLSX.utils.book_append_sheet(wb,ws,'Cau_hoi');XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([
 ['HƯỚNG DẪN'],['Mỗi dòng là một câu hỏi. Giữ nguyên hàng tiêu đề của trang Cau_hoi.'],['Xóa 5 câu ví dụ trước khi nhập câu hỏi của thầy/cô.'],['Trắc nghiệm: đủ 4 đáp án A–D; đáp án đúng ghi A, B, C hoặc D.'],['Đúng/Sai: đáp án ghi Đúng hoặc Sai.'],['Trả lời ngắn / Điền khuyết: nhập đáp án chuẩn, không dùng tự luận dài.'],['Sắp xếp: ghi thứ tự đúng, tách từng mục bằng ký hiệu → (ví dụ 1 → 2 → 3).'],['Điểm: số dương, tối đa 2 chữ số thập phân. Bài kiểm tra cần tổng 10 điểm.'],['Tối đa 200 câu/file; dung lượng tối đa 5 MB.'],['Ngân hàng câu hỏi dùng điểm này làm điểm đúng; không trừ điểm sai.']]),'Huong_dan');XLSX.writeFile(wb,'Mau_nhap_cau_hoi.xlsx');
}
export function parseQuestionRows(rows: unknown[][]): { questions:ImportedQuestion[]; errors:string[] } {
 const questions:ImportedQuestion[]=[],errors:string[]=[];const text=(v:unknown)=>String(v ?? '').trim();
 if(!rows.length || headers.some((h,i)=>text(rows[0]?.[i])!==h))return {questions,errors:['Hàng tiêu đề không đúng mẫu. Hãy tải file mẫu và giữ nguyên tên, thứ tự các cột.']};
 const data=rows.slice(1);if(data.filter(r=>r.some(v=>text(v))).length>200)return {questions,errors:['File chỉ được chứa tối đa 200 câu hỏi.']};
 data.forEach((r,i)=>{if(!r.some(v=>text(v)))return;const row=i+2;const type=types[text(r[0])],content=text(r[1]),answer=text(r[6]);const points=Number(text(r[8]).replace(',','.'));const fail=(m:string)=>errors.push(`Dòng ${row}: ${m}`);
 if(!type){fail('Loại câu hỏi không hợp lệ.');return;}if(!content || !answer){fail('Thiếu nội dung hoặc đáp án đúng.');return;}
 if(!Number.isFinite(points) || points<=0 || points>100 || Math.abs(points*100-Math.round(points*100))>0.000001){fail('Điểm phải lớn hơn 0, không quá 100 và tối đa 2 chữ số thập phân.');return;}
 let options:string[]|undefined,correctAnswer=answer;
 if(type==='MULTIPLE_CHOICE'){options=r.slice(2,6).map(text);if(options.length!==4 || options.some(o=>!o)){fail('Trắc nghiệm cần đủ 4 đáp án A, B, C, D.');return;}if(new Set(options).size!==4){fail('Các đáp án trắc nghiệm phải khác nhau.');return;}if(!/^[A-D]$/i.test(answer)){fail('Đáp án trắc nghiệm phải là A, B, C hoặc D.');return;}correctAnswer=options[answer.toUpperCase().charCodeAt(0)-65];}
 if(type==='TRUE_FALSE'){if(!['đúng','sai'].includes(answer.toLocaleLowerCase('vi'))){fail('Đáp án phải là Đúng hoặc Sai.');return;}correctAnswer=answer.toLocaleLowerCase('vi')==='đúng'?'Đúng':'Sai';options=['Đúng','Sai'];}
 if(type==='ORDERING'){const steps=answer.split('→').map(text);if(steps.length<2 || steps.length>8 || steps.some(x=>!x) || new Set(steps).size!==steps.length){fail('Sắp xếp cần 2–8 mục khác nhau, tách bằng →.');return;}correctAnswer=steps.join(' → ');options=[...steps].sort((a,b)=>a.localeCompare(b,'vi'));}
 questions.push({type,content,...(options?{options}:{}),correctAnswer,explanation:text(r[7]),points,correctPoints:points,wrongPenalty:0,caseInsensitive:true,trimWhitespace:true,source:'MANUAL'});
 });if(!questions.length && !errors.length)errors.push('File chưa có câu hỏi.');return {questions,errors};
}
export async function readQuestionFile(file:File){if(!/\.(xlsx|csv)$/i.test(file.name))throw new Error('Chỉ nhận file Excel .xlsx hoặc CSV .csv theo mẫu.');if(file.size>5*1024*1024)throw new Error('File vượt quá 5 MB.');const buffer=await file.arrayBuffer();const wb=/\.csv$/i.test(file.name)?XLSX.read(new TextDecoder('utf-8').decode(buffer),{type:'string',raw:true}):XLSX.read(buffer,{type:'array'});const sheet=wb.Sheets[wb.SheetNames.includes('Cau_hoi')?'Cau_hoi':wb.SheetNames[0]];return parseQuestionRows(XLSX.utils.sheet_to_json<unknown[]>(sheet,{header:1,defval:'',raw:true}));}
