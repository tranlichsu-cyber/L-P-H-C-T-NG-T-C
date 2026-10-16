import {boardValue,parseBoardAnswer} from '../../services/worksheets/activities';
import {DrawingPad} from './DrawingPad';
export function BoardAnswerEditor({value,onChange,locked}:{value:string;onChange:(value:string)=>void;locked:boolean}){
 const board=parseBoardAnswer(value)||{v:1 as const,text:'',strokes:[]};
 const points=board.strokes.reduce((n,s)=>n+s.length,0);
 return <div className="space-y-3"><label className="block font-bold">Câu trả lời trên bảng con<textarea aria-label="Câu trả lời trên bảng con" maxLength={1000} rows={3} readOnly={locked} value={board.text} onChange={e=>onChange(boardValue(e.target.value,board.strokes))} placeholder="Em gõ đáp án hoặc dùng bảng vẽ bên dưới…" className="mt-2 w-full rounded-xl border-2 border-sky-200 p-3 text-lg font-normal"/></label><p className="text-sm">Dùng chuột, ngón tay hoặc bút cảm ứng để vẽ. Em có thể chỉ gõ chữ hoặc chỉ vẽ.</p><DrawingPad strokes={board.strokes} disabled={locked} onChange={strokes=>onChange(boardValue(board.text,strokes))}/>{!locked&&<div className="flex flex-wrap gap-3"><button type="button" disabled={!board.strokes.length} onClick={()=>onChange(boardValue(board.text,board.strokes.slice(0,-1)))} className="min-h-11 rounded-xl border px-4 font-bold disabled:opacity-40">Lùi một nét</button><button type="button" disabled={!board.strokes.length} onClick={()=>onChange(boardValue(board.text,[]))} className="min-h-11 rounded-xl border px-4 font-bold disabled:opacity-40">Xóa nét vẽ</button></div>}{(points>=480||board.strokes.length>=32)&&<p role="status" className="text-amber-900">Bảng vẽ đã đầy. Em lùi hoặc xóa bớt nét để tiếp tục, hoặc bổ sung bằng chữ.</p>}</div>;
}
export function ActivityAnswer({value,board=false}:{value:string;board?:boolean}){
 value=typeof value==='string'?value:'Bài làm chưa đúng định dạng';
 const parsed=board?parseBoardAnswer(value):null;
 return parsed?<div className="space-y-3">{parsed.text&&<p className="whitespace-pre-wrap break-words leading-relaxed">{parsed.text}</p>}{parsed.strokes.length>0&&<DrawingPad strokes={parsed.strokes} label="Hình vẽ học sinh đã nộp"/>}</div>:<p className="whitespace-pre-wrap break-words leading-relaxed">{value||'Chưa trả lời'}</p>;
}
