import {useEffect,useRef,useState} from 'react';
import {QrCardsPrintButton} from './QrCardsPrintButton';
import {QRCodeSVG} from 'qrcode.react';
import jsQR from 'jsqr';
import type {MockRoomData} from '../../services/realtime/types';
import {parseCard,cardChoice,canScanQuestion,qrQuestionSupported,type CardChoice} from '../../services/qr/cards';
import {activeRealtimeService} from '../../services/realtime/realtimeServiceSwitch';
import './qrCards.css';
const button='rounded-xl bg-indigo-700 px-4 py-3 font-bold text-white disabled:opacity-40';
type Detected={studentId:string;name:string;choice:CardChoice};
export default function QrCardsPanel({room,onClose}:{room:MockRoomData;onClose:()=>void}){
 const scannerUrl=`${location.origin}/teacher/qr-cards/${encodeURIComponent(room.id)}/scan`;
 const q=room.activeQuestionId?room.liveQuestions[room.activeQuestionId]:undefined;
 return <section className="space-y-4 rounded-2xl border-2 border-indigo-200 bg-white p-4 text-slate-900">
 <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-black">Giơ thẻ QR • {room.className}</h2><button className={button} onClick={onClose}>Đóng màn quét</button></div>
 <p>Mỗi em giữ đúng thẻ mang tên mình, xoay cạnh có đáp án A, B, C hoặc D lên trên. Giữ thẻ thẳng, không che mã. Giáo viên quét từng nhóm nhỏ, kiểm tra rồi gửi kết quả.</p>
 <QrCardsPrintButton classId={room.classId} className={room.className} roster={room.roster}/>
 <details className="rounded-xl bg-indigo-50 p-3"><summary className="cursor-pointer font-bold">Mở màn quét trên điện thoại</summary><p className="my-3">Dùng camera điện thoại mở mã này, đăng nhập cùng tài khoản giáo viên. Giữ máy tính ở màn chiếu. Đây là đường dẫn điều khiển, không đưa cho học sinh.</p><QRCodeSVG value={scannerUrl} size={160} marginSize={4}/><a className="mt-3 block break-all underline" href={scannerUrl}>{scannerUrl}</a></details>
 <div className="rounded-xl bg-sky-50 p-4"><strong>Câu đang chiếu: {q?.content||'Chưa chọn câu hỏi'}</strong><ol className="mt-2 space-y-1">{q?.options?.map((o,i)=><li key={i}>{String.fromCharCode(65+i)}. {o}</li>)}</ol><p className="mt-3 font-bold">{!qrQuestionSupported(q)?'Thẻ QR dùng cho câu trắc nghiệm có 2–4 lựa chọn.':canScanQuestion(room,q)?'Đang nhận đáp án':'Chưa mở nhận đáp án, đang tạm dừng hoặc đã hết giờ.'}</p></div>
 <Scanner key={q?.id||'none'} room={room}/>

 </section>;
}
function Scanner({room}:{room:MockRoomData}){
 const video=useRef<HTMLVideoElement>(null),stream=useRef<MediaStream|null>(null),generation=useRef(0),latest=useRef(room);
 useEffect(()=>{latest.current=room;},[room]);
 const [running,setRunning]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[pending,setPending]=useState<Record<string,Detected>>({}),[busy,setBusy]=useState(false);
 const busyRef=useRef(false),seen=useRef(new Map<string,{choice:CardChoice;count:number;at:number}>());
 const q=room.activeQuestionId?room.liveQuestions[room.activeQuestionId]:undefined;
 const enabled=canScanQuestion(room,q);
 function stop(){generation.current++;stream.current?.getTracks().forEach(t=>t.stop());stream.current=null;if(video.current)video.current.srcObject=null;setRunning(false);}
 useEffect(()=>{const hide=()=>{if(document.hidden)stop();};document.addEventListener('visibilitychange',hide);return()=>{generation.current++;stream.current?.getTracks().forEach(t=>t.stop());document.removeEventListener('visibilitychange',hide);};},[]);
 useEffect(()=>{if(!enabled&&running)stop();},[enabled,running]);
 useEffect(()=>{if(!running)return;let cancelled=false,timer:ReturnType<typeof setTimeout>;const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d',{willReadFrequently:true})!;
 const tick=()=>{if(cancelled)return;try{const v=video.current,r=latest.current,question=r.activeQuestionId?r.liveQuestions[r.activeQuestionId]:undefined;
 if(v&&v.readyState>=2&&canScanQuestion(r,question)&&!busyRef.current){canvas.width=Math.min(v.videoWidth,1280);canvas.height=Math.round(v.videoHeight*canvas.width/v.videoWidth);ctx.drawImage(v,0,0,canvas.width,canvas.height);
 // Overlapping tiles help jsQR separate several neighbouring symbols.
 const cols=canvas.width>=canvas.height?3:2,rows=cols===3?2:3;
 const regions=[{x:0,y:0,w:canvas.width,h:canvas.height}];
 const tw=Math.floor(canvas.width*1.4/cols),th=Math.floor(canvas.height*1.4/rows);
 for(let row=0;row<rows;row++)for(let col=0;col<cols;col++)regions.push({x:Math.round((canvas.width-tw)*col/(cols-1)),y:Math.round((canvas.height-th)*row/(rows-1)),w:tw,h:th});
 for(const region of regions){const pixels=ctx.getImageData(region.x,region.y,region.w,region.h),code=jsQR(pixels.data,pixels.width,pixels.height,{inversionAttempts:'dontInvert'});if(!code)continue;
 const shift=(p:{x:number;y:number})=>({x:p.x+region.x,y:p.y+region.y});
 const tl=shift(code.location.topLeftCorner),tr=shift(code.location.topRightCorner),bl=shift(code.location.bottomLeftCorner),br=shift(code.location.bottomRightCorner);
 const card=parseCard(code.data),choice=cardChoice(tl,tr),student=card&&r.roster.find(p=>p.studentId===card.studentId);
 if(card&&card.classId===r.classId&&student&&choice){const id=student.studentId,now=Date.now(),prev=seen.current.get(id),count=prev?.choice===choice&&now-prev.at<1800?prev.count+1:1;seen.current.set(id,{choice,count,at:now});
 if(count>=2&&!r.submissions[`${question!.id}_${id}`]&&choice.charCodeAt(0)-65<question!.options!.length)setPending(p=>({...p,[id]:{studentId:id,name:student.name,choice}}));
 }else if(card&&card.classId!==r.classId)setNotice('Bỏ qua thẻ của lớp khác.');
 // Mask this symbol so the same frame can reveal additional cards.
 const xs=[tl.x,tr.x,bl.x,br.x],ys=[tl.y,tr.y,bl.y,br.y];ctx.fillStyle='white';ctx.fillRect(Math.min(...xs)-3,Math.min(...ys)-3,Math.max(...xs)-Math.min(...xs)+6,Math.max(...ys)-Math.min(...ys)+6);
 }
 }}catch{setError('Không đọc được khung hình. Hãy dừng rồi mở lại camera.');}timer=setTimeout(tick,400);};tick();return()=>{cancelled=true;clearTimeout(timer);};},[running]);
 async function start(){setError('');if(!navigator.mediaDevices?.getUserMedia){setError('Camera cần trình duyệt hỗ trợ và kết nối HTTPS. Hãy mở bằng Safari hoặc Chrome trên điện thoại.');return;}const token=++generation.current;try{const media=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1920},height:{ideal:1080}},audio:false});if(token!==generation.current){media.getTracks().forEach(t=>t.stop());return;}stream.current=media;if(video.current){video.current.srcObject=media;await video.current.play();}if(token===generation.current)setRunning(true);}catch{stream.current?.getTracks().forEach(t=>t.stop());stream.current=null;setError('Chưa mở được camera. Hãy cấp quyền camera cho website, đóng ứng dụng đang dùng camera rồi thử lại.');}}
 async function save(){if(busyRef.current)return;busyRef.current=true;setBusy(true);setError('');let sent=0;try{for(const item of items){const r=latest.current;if(!q||r.activeQuestionId!==q.id||!canScanQuestion(r,r.liveQuestions[q.id]))throw new Error('Câu hỏi đã đổi hoặc đóng. Các đáp án còn lại chưa được gửi.');const result=await activeRealtimeService.submitQrAnswer(r.id,q.id,item.studentId,item.choice);if(!result.success)throw new Error(result.error||'Chưa gửi được đáp án.');sent++;setPending(p=>{const next={...p};delete next[item.studentId];return next;});}setNotice(`Đã gửi ${sent} đáp án. Kết quả tự cập nhật trên máy tính.`);}catch(e){setError(e instanceof Error?e.message:'Mất kết nối. Hãy kiểm tra và thử gửi lại.');}finally{busyRef.current=false;setBusy(false);}}
 const items=Object.values(pending).filter(p=>!room.submissions[`${q?.id}_${p.studentId}`]);
 const submissions=Object.values(room.submissions).filter(s=>s.questionId===q?.id);
 return <div className="space-y-3"><div className="flex flex-wrap gap-2"><button className={button} disabled={running||!enabled} onClick={()=>void start()}>Mở camera sau</button><button className={button} disabled={!running} onClick={stop}>Dừng camera</button></div><video ref={video} playsInline muted className="max-h-[50vh] w-full rounded-xl bg-slate-950" aria-label="Camera quét thẻ học sinh"/><p className="text-sm">Giữ điện thoại thẳng, không xoay ngang khi quét. Quét lần lượt từng em hoặc nhóm 2–4 em ở gần; nếu chưa nhận, đưa camera gần hơn. Hình camera chỉ xử lý trên thiết bị.</p>{error&&<p role="alert" className="rounded-xl bg-rose-50 p-3 text-rose-900">{error}</p>}{notice&&<p role="status">{notice}</p>}
 <h3 className="font-black">Kiểm tra trước khi gửi ({items.length})</h3><ul className="space-y-2">{items.map(p=><li key={p.studentId} className="flex items-center justify-between gap-2 rounded-xl bg-amber-50 p-3"><strong>{p.name}: {p.choice}</strong><button disabled={busy} className="underline" onClick={()=>{seen.current.delete(p.studentId);setPending(old=>{const next={...old};delete next[p.studentId];return next;});}}>Bỏ kết quả này</button></li>)}</ul><button className={button} disabled={busy||!enabled||!items.length} onClick={()=>void save()}>{busy?'Đang gửi…':'Gửi các đáp án đã kiểm tra'}</button><p>Mỗi em chỉ ghi nhận đáp án đầu tiên cho một câu. Đáp án đã gửi bằng điện thoại hoặc thẻ sẽ không bị quét ghi đè.</p>
 <details open><summary className="font-bold">Đã nhận {submissions.length}/{room.roster.length} em</summary><ul className="mt-2 grid gap-2 sm:grid-cols-2">{room.roster.map(p=>{const s=submissions.find(s=>s.studentId===p.studentId);return <li key={p.studentId} className={s?'text-emerald-800':'text-slate-500'}>{p.name}: {s?s.answer:'Chưa nhận'}</li>;})}</ul></details></div>;
}
