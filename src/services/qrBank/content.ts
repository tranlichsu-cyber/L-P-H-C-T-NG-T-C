import type {Question} from '../../types';
export interface QrMedia {imageUrl?:string;imageAlt?:string;videoUrl?:string}
export interface QrQuestion extends Question {type:'MULTIPLE_CHOICE';options:string[];media?:QrMedia}
export interface QrBank {id:string;teacherId:string;title:string;subject:string;grade:string;questions:QrQuestion[];createdAt:string;updatedAt:string}
export function youtubeId(value:string):string|null{
 try{const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password)return null;const host=u.hostname.toLowerCase();let id='';if(host==='youtu.be')id=u.pathname.slice(1);else if(['youtube.com','www.youtube.com','m.youtube.com','www.youtube-nocookie.com'].includes(host)){id=u.searchParams.get('v')||u.pathname.match(/^\/(?:embed|shorts)\/([^/]+)\/?$/)?.[1]||'';}return /^[\w-]{11}$/.test(id)?id:null;}catch{return null;}
}
export function safeImage(value:string){if(/^data:image\/(?:webp|png|jpeg);base64,[a-z\d+/=]+$/i.test(value))return value.length<=120000;try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&value.length<=3000;}catch{return false;}}
export function videoSource(value:string):{kind:'youtube'|'file';url:string}|null{
 const id=youtubeId(value);if(id)return {kind:'youtube',url:`https://www.youtube-nocookie.com/embed/${id}?rel=0`};
 try{const u=new URL(value);if(u.protocol==='https:'&&!u.username&&!u.password&&value.length<=3000&&/\.(mp4|webm)$/i.test(u.pathname))return {kind:'file',url:u.href};}catch{/* Invalid links stay out of media elements. */}return null;
}
export function validateQrBank(bank:QrBank){
 if(!bank.title.trim()||bank.title.length>200||!bank.subject.trim()||bank.subject.length>100||!bank.grade.trim()||bank.grade.length>30)throw new Error('Nhập tên bộ câu hỏi, môn học và khối lớp đúng giới hạn.');
 if(!bank.questions.length||bank.questions.length>80)throw new Error('Mỗi bộ cần từ 1 đến 80 câu hỏi.');
 const ids=new Set<string>();
 bank.questions.forEach((q,i)=>{const at=`Câu ${i+1}: `;if(!q.id||q.id.includes('/')||ids.has(q.id))throw new Error(at+'Mã câu hỏi không hợp lệ hoặc bị trùng.');ids.add(q.id);
 if(q.type!=='MULTIPLE_CHOICE'||!q.content.trim()||q.content.length>5000)throw new Error(at+'Nhập nội dung câu hỏi (tối đa 5.000 ký tự).');
 if(!Array.isArray(q.options)||q.options.length<2||q.options.length>4||q.options.some(o=>!o.trim()||o.length>2000)||new Set(q.options.map(o=>o.trim().toLocaleLowerCase('vi-VN'))).size!==q.options.length)throw new Error(at+'Cần 2–4 lựa chọn khác nhau, không để trống.');
 if(!/^[A-D]$/.test(q.correctAnswer)||q.correctAnswer.charCodeAt(0)-65>=q.options.length)throw new Error(at+'Chọn đáp án đúng trong các lựa chọn.');
 if((q.explanation||'').length>5000)throw new Error(at+'Phần giải thích quá dài.');
 for(const n of [q.correctPoints??10,q.wrongPenalty??0])if(!Number.isFinite(n)||n<0||n>100)throw new Error(at+'Điểm phải từ 0 đến 100.');
 if(q.media?.imageUrl&&!safeImage(q.media.imageUrl))throw new Error(at+'Ảnh cần là liên kết HTTPS hoặc ảnh đã tải lên hợp lệ.');
 if((q.media?.imageAlt||'').length>300)throw new Error(at+'Mô tả ảnh tối đa 300 ký tự.');
 if(q.media?.videoUrl&&!videoSource(q.media.videoUrl))throw new Error(at+'Dùng liên kết YouTube hoặc video HTTPS dạng .mp4 / .webm.');
 });
 if(new TextEncoder().encode(JSON.stringify(bank)).length>800000)throw new Error('Bộ câu hỏi có quá nhiều ảnh. Hãy dùng liên kết ảnh hoặc tách thành các bộ nhỏ hơn.');
}
export function newQrQuestion():QrQuestion{return {id:crypto.randomUUID(),type:'MULTIPLE_CHOICE',content:'',options:['','','',''],correctAnswer:'A',correctPoints:10,wrongPenalty:0};}
