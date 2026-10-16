import type {WorksheetDraft,WorksheetResponse} from './content';
export type Point=[number,number];
export type Strokes=Point[][];
export interface BoardAnswer {v:1;text:string;strokes:Strokes}
export const understandingLevels=['Em đã hiểu bài','Em còn phân vân','Em cần thầy/cô giúp'] as const;
export function parseBoardAnswer(value:string):BoardAnswer|null{
 try{
  if(value.length>10000)return null;
  const b=JSON.parse(value);
  if(b?.v!==1||typeof b.text!=='string'||b.text.length>1000||!Array.isArray(b.strokes)||b.strokes.length>32)return null;
  let points=0;
  for(const stroke of b.strokes){if(!Array.isArray(stroke)||!stroke.length)return null;for(const p of stroke){if(!Array.isArray(p)||p.length!==2||p.some(n=>typeof n!=='number'||!Number.isFinite(n)||n<0||n>1))return null;points++;}}
  if(points>480)return null;
  return {v:1,text:b.text,strokes:b.strokes};
 }catch{return null;}
}
export function boardValue(text:string,strokes:Strokes){return text.trim()||strokes.length?JSON.stringify({v:1,text,strokes}):'';}
const escape=(text:string)=>text.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function activityDraft(kind:'BOARD'|'EXIT',title:string,prompts:string[]):WorksheetDraft{
 if(prompts.length!==(kind==='BOARD'?1:3)||prompts.some(p=>!p.trim()||p.length>1000))throw Error('Bảng con cần một nhiệm vụ; vé ra cửa cần ba câu ngắn.');
 return {kind,title:title.trim(),fileName:kind==='BOARD'?'bang-con':'ve-ra-cua',html:'<p>'+escape(kind==='BOARD'?'Em gõ chữ hoặc vẽ câu trả lời. Tự kiểm tra trước khi nộp bảng.':'Em trả lời ba câu ngắn để thầy/cô biết cách hỗ trợ em ở tiết sau.')+'</p><ol>'+prompts.map(p=>'<li>'+escape(p)+'</li>').join('')+'</ol>'+(kind==='EXIT'?'<p>'+understandingLevels.map(escape).join(' • ')+'</p>':''),questions:prompts.map((label,i)=>({id:'answer-'+(i+1),label:label.trim()}))};
}
export function exitSummary(responses:WorksheetResponse[]){return understandingLevels.map(level=>({level,count:responses.filter(work=>work.answers['answer-3']===level).length}));}
export function validateActivityAnswers(kind:WorksheetDraft['kind'],answers:Record<string,string>){
 if(kind==='BOARD'){const board=parseBoardAnswer(answers['answer-1']);if(!board||(!board.text.trim()&&!board.strokes.length))throw Error('Em hãy gõ câu trả lời hoặc vẽ vào bảng con.');}
 if(kind==='EXIT'&&!understandingLevels.some(level=>level===answers['answer-3']))throw Error('Em hãy chọn mức độ hiểu bài của mình.');
}
