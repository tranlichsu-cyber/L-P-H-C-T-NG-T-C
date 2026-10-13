import * as XLSX from 'xlsx';
import type {Quiz,Question,QuestionType} from '../../types';
const heading=['STT','Phần','Mã câu','Loại câu hỏi','Nội dung câu hỏi','Phương án A','Phương án B','Phương án C','Phương án D','Đáp án đúng','Điểm','Giải thích / lời giải','Cách chấm','Ghi chú'];
const clean=(x:unknown)=>String(x??'').trim();
export interface ExamImport {quiz:Quiz; durationMinutes:number; totalPoints:number; warnings:string[]}
export function downloadExamTemplate(){
 const wb=XLSX.utils.book_new();
 XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([['MẪU NHẬP ĐỀ THI – TIỂU HỌC','Giá trị'],['Tên đề thi','Kiểm tra giữa học kì I – Toán lớp 4'],['Môn học','Toán'],['Khối lớp',4],['Năm học','2026–2027'],['Thời gian làm bài (phút)',40],['Điểm tối đa',10],['Chế độ','Đề thi']]),'Thong_tin_de');
 const ws=XLSX.utils.aoa_to_sheet([heading,['1','I. TRẮC NGHIỆM','C01','Trắc nghiệm 4 lựa chọn','2 + 3 bằng bao nhiêu?','4','5','6','7','B',1,'2 + 3 = 5.','Tự động','Xóa ví dụ trước khi nhập'],['2','II. TỰ LUẬN','C02','Trả lời ngắn','8 + 2 bằng bao nhiêu?','','','','','10',1,'8 + 2 = 10.','Tự động','Xóa ví dụ trước khi nhập']]);
 ws['!cols']=[{wch:8},{wch:23},{wch:12},{wch:28},{wch:70},...Array.from({length:4},()=>({wch:24})),{wch:24},{wch:12},{wch:60},{wch:25},{wch:34}];
 XLSX.utils.book_append_sheet(wb,ws,'Cau_hoi_de_thi');
 XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([['HƯỚNG DẪN'],['Giữ nguyên tên ba trang tính và tiêu đề cột.'],['Điền thông tin đề tại Thong_tin_de.'],['Mỗi dòng là một câu hoặc một ý chấm điểm.'],['Loại câu: Trắc nghiệm 4 lựa chọn, Đúng/Sai, Trả lời ngắn, Điền khuyết hoặc Sắp xếp.'],['Trắc nghiệm ghi A/B/C/D ở cột Đáp án đúng.'],['Đúng/Sai ghi Đúng hoặc Sai.'],['Câu tự luận dài chỉ có thể tự chấm theo đáp án chính xác; phần trình bày cần giáo viên xem xét.'],['Tổng điểm các dòng cần trùng điểm tối đa ở trang thông tin.'],['Xóa các câu ví dụ trước khi nhập đề thật.']]),'Huong_dan');
 XLSX.writeFile(wb,'Mau_nhap_de_thi.xlsx');
}
export async function readExamFile(file:File,teacherId:string):Promise<ExamImport>{
 if(!/\.xlsx$/i.test(file.name))throw new Error('Mẫu đề thi phải là file .xlsx.');
 if(file.size>5*1024*1024)throw new Error('File lớn hơn 5 MB.');
 const wb=XLSX.read(await file.arrayBuffer(),{type:'array'});
 const info=wb.Sheets['Thong_tin_de'],sheet=wb.Sheets['Cau_hoi_de_thi'];
 if(!info||!sheet)throw new Error('Thiếu trang Thong_tin_de hoặc Cau_hoi_de_thi.');
 const meta=XLSX.utils.sheet_to_json<unknown[]>(info,{header:1,defval:''});
 const value=(label:string)=>clean(meta.find(r=>clean(r[0])===label)?.[1]);
 const title=value('Tên đề thi'),subject=value('Môn học'),grade=value('Khối lớp'),durationMinutes=Number(value('Thời gian làm bài (phút)')),maximum=Number(value('Điểm tối đa'));
 if(!title||!subject||!/[1-5]/.test(grade))throw new Error('Thiếu tên đề, môn hoặc khối lớp 1–5.');
 if(!Number.isInteger(durationMinutes)||durationMinutes<1||durationMinutes>180)throw new Error('Thời gian phải từ 1 đến 180 phút.');
 if(!Number.isFinite(maximum)||maximum<=0)throw new Error('Điểm tối đa phải là số dương.');
 const rows=XLSX.utils.sheet_to_json<unknown[]>(sheet,{header:1,defval:'',raw:true});
 if(heading.some((x,i)=>clean(rows[0]?.[i])!==x))throw new Error('Tiêu đề cột không đúng mẫu đề thi.');
 const entries=rows.slice(1).filter(r=>clean(r[4]));
 if(!entries.length||entries.length>200)throw new Error('Cần từ 1 đến 200 câu hỏi.');
 const types:Record<string,QuestionType>={'Trắc nghiệm 4 lựa chọn':'MULTIPLE_CHOICE','Trắc nghiệm':'MULTIPLE_CHOICE','Đúng/Sai':'TRUE_FALSE','Trả lời ngắn':'SHORT_ANSWER','Điền khuyết':'FILL_BLANK','Sắp xếp':'ORDERING'};
 const questions:Question[]=entries.map((row,index)=>{
  const type=types[clean(row[3])],content=clean(row[4]),answer=clean(row[9]),points=Number(clean(row[10]).replace(',','.'));
  const fail=(reason:string):never=>{throw new Error('Câu '+(index+1)+': '+reason)};
  if(!type)fail('Loại câu hỏi không được hỗ trợ.');
  if(!content||!answer)fail('Thiếu nội dung hoặc đáp án.');
  if(!Number.isFinite(points)||points<=0)fail('Điểm phải lớn hơn 0.');
  let options:string[]|undefined,correctAnswer=answer;
  if(type==='MULTIPLE_CHOICE'){
   options=row.slice(5,9).map(clean);
   if(options.length!==4||options.some(v=>!v)||new Set(options).size!==4)fail('Cần đủ 4 đáp án khác nhau.');
   if(!/^[A-D]$/i.test(answer))fail('Đáp án phải là A, B, C hoặc D.');
   correctAnswer=options[answer.toUpperCase().charCodeAt(0)-65];
  }
  if(type==='TRUE_FALSE'){if(!['Đúng','Sai'].includes(answer))fail('Đáp án phải là Đúng hoặc Sai.');options=['Đúng','Sai'];}
  if(type==='ORDERING'){const order=answer.split('→').map(clean);if(order.length<2||order.some(v=>!v))fail('Các bước sắp xếp phải cách nhau bằng →.');correctAnswer=order.join(' → ');options=[...order].sort((a,b)=>a.localeCompare(b,'vi'));}
  return {id:clean(row[2])||'cau-'+(index+1),type,content,options,correctAnswer,explanation:clean(row[11]),correctPoints:points,wrongPenalty:0,caseInsensitive:true,trimWhitespace:true};
 });
 if(new Set(questions.map(q=>q.id)).size!==questions.length)throw new Error('Mã câu hỏi trong đề bị trùng.');
 const totalPoints=Math.round(questions.reduce((a,q)=>a+(q.correctPoints||0),0)*100)/100;
 if(Math.abs(totalPoints-maximum)>0.01)throw new Error('Tổng điểm câu hỏi ('+totalPoints+') khác điểm tối đa ('+maximum+'). Hãy chỉnh file trước khi đăng.');
 const warnings=entries.filter(r=>/giáo viên|thủ công/i.test(clean(r[12]))).map(r=>'Câu '+clean(r[2])+' yêu cầu giáo viên chấm.');
 const quiz:Quiz={id:'exam-'+Date.now(),teacherId,title,subject,grade:'Khối '+grade,questionCount:questions.length,questions,createdAt:new Date().toISOString(),visibility:'PRIVATE'};
 return {quiz,durationMinutes,totalPoints,warnings};
}
