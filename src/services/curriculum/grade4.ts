import data from '../../data/curriculum/grade4.json';
export const grade4Curriculum=data;
export const curriculumText=(text:string)=>text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/gi,'d').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
export function curriculumSubject(subject:string){
 const s=curriculumText(subject);
 if(s==='toan')return 'Toán';if(s==='khoa hoc')return 'Khoa học';if(['lich su va dia li','lich su dia li','lich su va dia ly','lich su dia ly'].includes(s))return 'Lịch sử và Địa lí';if(['tieng viet','tap lam van','luyen tu va cau','doc hieu'].includes(s))return 'Tiếng Việt';return null;
}
export interface CurriculumCheck {status:'REFERENCE'|'MISMATCH'|'UNCONFIRMED'|'OUTSIDE';message:string;references:typeof data.lessons;week?:number}
export function checkGrade4Quiz(quiz:{title:string;subject:string;grade:string}):CurriculumCheck{
 const subject=curriculumSubject(quiz.subject),title=curriculumText(quiz.title);const grade:string[]=quiz.grade.match(/\d+/g)||[];
 if(!grade.includes('4')||!subject)return {status:'OUTSIDE',message:'Ngoài phạm vi sáu sách lớp 4 được cung cấp.',references:[]};
 const weekMatch=title.match(/\btuan\s+(\d+)(?!\d)/);
 const week=Number(weekMatch?.[1]);
 if(weekMatch&&(week<1||week>35))return {status:'MISMATCH',message:'Số tuần ngoài lịch 1–35.',references:[]};
 const numberMatch=title.match(/\bbai\s+(\d+)(?!\d)/);
 const number=Number(numberMatch?.[1]);
 const bookHint=subject==='Tiếng Việt'?( /\btap (1|mot)\b/.test(title)?'tv1':/\btap (2|hai)\b/.test(title)?'tv2':null):null;
 const allCandidates=data.lessons.filter(l=>l.subject===subject);
 const candidates=allCandidates.filter(l=>!bookHint||l.book===bookHint);
 const named=allCandidates.filter(l=>(' '+title+' ').includes(' '+curriculumText(l.title)+' ')&&curriculumText(l.title).length>=8&&!/^(luyen tap chung|on tap)/.test(curriculumText(l.title)));
 const numbered=number?candidates.filter(l=>l.number===number):[];
 if(bookHint&&named.length===1&&named[0].book!==bookHint)return {status:'MISMATCH',message:'Tên bài thuộc tập khác với tập sách ghi trong tiêu đề. Cần kiểm tra nội dung trước khi sửa.',references:named,week:week||undefined};
 if(number&&named.length===1&&named[0].number!==number)return {status:'MISMATCH',message:'Tên bài khớp Bài '+named[0].number+' trong sách, nhưng tiêu đề đang ghi Bài '+number+'. Cần kiểm tra nội dung trước khi đổi số bài.',references:named,week:week||undefined};
 if(numberMatch&&!numbered.length)return {status:'MISMATCH',message:'Không có Bài '+number+' trong môn này theo sách được cung cấp.',references:[],week:week||undefined};
 if(subject==='Tiếng Việt'&&week){
  const entry=data.weeks.find(w=>w.week===week)!;
  const references=data.lessons.filter(l=>entry.readingIds.includes(l.id));
  const identified=named.length===1?named:numbered.length===1?numbered:[];
  if((bookHint&&bookHint!==entry.book)||(identified.length===1&&!entry.readingIds.includes(identified[0].id)))return {status:'MISMATCH',message:'Bài hoặc tập sách ghi trong tiêu đề không thuộc tuần '+week+' theo lịch Tiếng Việt 35 tuần. Cần đối chiếu nội dung trước khi sửa.',references:identified.length?identified:references,week};
  return {status:'REFERENCE',message:'Tham chiếu tuần '+week+': nội dung viết là '+entry.writing.join('; ')+'. Danh sách kèm theo là bài đọc của tuần; các phân môn khác và đáp án từng câu cần kiểm tra riêng.',references,week};
 }
 if(named.length===1)return {status:'REFERENCE',message:'Tên bài có căn cứ trong sách. Chưa xác nhận nội dung từng câu hỏi hoặc tuần dạy.',references:named,week:week||undefined};
 return {status:'UNCONFIRMED',message:number?'Có số bài nhưng chưa xác nhận tên và nội dung.'+(subject==='Tiếng Việt'?' Cần phân biệt tập một, tập hai.':''):'Chưa ghép được tiêu đề với bài trong sách; không tự đổi thứ tự hoặc đáp án.',references:numbered,week:week||undefined};
}
