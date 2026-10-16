import {validateGroups,type ActivityGroup,type GroupAccess} from './groups';
export interface WorksheetQuestion {id:string;label:string}
export interface WorksheetDraft {title:string;html:string;questions:WorksheetQuestion[];fileName:string;kind?:'BOARD'|'EXIT'|'GROUP';groups?:ActivityGroup[];groupAccess?:Record<string,GroupAccess>;durationMinutes?:number}
export interface RoomWorksheet extends WorksheetDraft {id:string;roomId:string;status:'OPEN'|'CLOSED';createdAt:string;deadlineAt?:number;returnedUids?:string[]}
export interface WorksheetResponse {studentId:string;studentName:string;authUid:string;answers:Record<string,string>;submittedAt:string}
export interface WorksheetState {worksheetId:string|null;projectedStudentId:string|null;projectedWorksheetId:string|null;showStudentName:boolean}
export const emptyWorksheetState=():WorksheetState=>({worksheetId:null,projectedStudentId:null,projectedWorksheetId:null,showStudentName:true});
export function detectWorksheetQuestions(text:string):WorksheetQuestion[]{
 const labels=text.split(/\n/).map(s=>s.trim()).filter(s=>/^(?:câu|bài)\s*\d+\s*[:.)–-]|^\d{1,2}[.)]\s+\S/i.test(s));
 return (labels.length?labels:['Bài làm của em']).map((label,i)=>({id:'answer-'+(i+1),label:label.slice(0,1000)}));
}
export function validateWorksheet(draft:WorksheetDraft){
 if(draft.kind!==undefined&&!['BOARD','EXIT','GROUP'].includes(draft.kind))throw new Error('Loại hoạt động không hợp lệ.');
 if(draft.kind&&(draft.questions.length!==(draft.kind==='EXIT'?3:1)||draft.questions.some((q,i)=>q.id!=='answer-'+(i+1))))throw new Error('Các ô trả lời của hoạt động không hợp lệ.');
 if(draft.durationMinutes!==undefined&&(draft.kind!=='GROUP'||!Number.isInteger(draft.durationMinutes)||draft.durationMinutes<0||draft.durationMinutes>60))throw new Error('Thời gian nhóm cần từ 0 đến 60 phút.');
 if(draft.kind==='GROUP')validateGroups(draft.groups!,draft.groupAccess!);
 if(!draft.title.trim()||draft.title.length>200)throw new Error('Tên phiếu cần từ 1 đến 200 ký tự.');
 if(!draft.html.trim()||new TextEncoder().encode(draft.html).length>450000)throw new Error('Nội dung phiếu quá lớn. Thầy/cô hãy giảm kích thước hình ảnh hoặc chia thành nhiều phiếu.');
 if(!draft.questions.length||draft.questions.length>40)throw new Error('Mỗi phiếu cần từ 1 đến 40 ô trả lời.');
 if(new Set(draft.questions.map(q=>q.id)).size!==draft.questions.length||draft.questions.some(q=>!/^answer-\d+$/.test(q.id)||!q.label.trim()||q.label.length>1000))throw new Error('Các ô trả lời cần mã riêng và nội dung câu hỏi.');
}
export function validateWorksheetAnswers(questions:WorksheetQuestion[],answers:Record<string,string>){
 if(Object.keys(answers).some(id=>!questions.some(q=>q.id===id))||questions.some(q=>typeof answers[q.id]!=='string'||!answers[q.id].trim()||answers[q.id].length>10000)||Object.values(answers).reduce((n,a)=>n+a.length,0)>40000)throw new Error('Em hãy điền đủ các ô trả lời. Mỗi ô tối đa 10.000 ký tự và cả bài tối đa 40.000 ký tự.');
}
export interface WorksheetReview {comment:string;score:number|null;questionComments:Record<string,string>;updatedAt:string;returnedAt:string|null}
export function validateWorksheetReview(review:WorksheetReview,questions:WorksheetQuestion[]){
 if(typeof review.comment!=='string'||review.comment.length>5000)throw new Error('Nhận xét chung tối đa 5.000 ký tự.');
 if(review.score!==null&&(!Number.isFinite(review.score)||review.score<0||review.score>10))throw new Error('Điểm cần từ 0 đến 10 hoặc để trống.');
 if(Object.entries(review.questionComments).some(([id,text])=>!questions.some(q=>q.id===id)||typeof text!=='string'||text.length>2000))throw new Error('Nhận xét từng câu tối đa 2.000 ký tự và phải thuộc phiếu.');
 if(!review.comment.trim()&&review.score===null&&!Object.values(review.questionComments).some(s=>s.trim()))throw new Error('Hãy nhập nhận xét hoặc điểm trước khi lưu.');
}
