import type {LiveQuestionPublic,MockRoomData} from '../realtime/types';
import {gameAcceptsAnswer} from '../realtime/gamePolicy';
export type CardChoice='A'|'B'|'C'|'D';
export function cardPayload(classId:string,studentId:string){return JSON.stringify(['SCQR1',classId,studentId]);}
export function parseCard(raw:string):{classId:string;studentId:string}|null{
 try{const a:unknown=JSON.parse(raw);if(Array.isArray(a)&&a.length===3&&a[0]==='SCQR1'&&a.slice(1).every(s=>typeof s==='string'&&s.length>0&&s.length<=200&&!s.includes('/')))return {classId:a[1],studentId:a[2]};}catch{/* Ignore unrelated QR codes. */}return null;
}
// jsQR returns canonical corners even when the printed card is rotated.
// Print A at top, B at right, C below and D at left; selected letter faces up.
export function cardChoice(topLeft:{x:number;y:number},topRight:{x:number;y:number}):CardChoice|null{
 const angle=Math.atan2(topRight.y-topLeft.y,topRight.x-topLeft.x)*180/Math.PI;
 const quarter=Math.round(angle/90);if(Math.abs(angle-quarter*90)>22)return null;
 return (['A','D','C','B'] as const)[(quarter%4+4)%4];
}
export function qrQuestionSupported(q:Pick<LiveQuestionPublic,'type'|'options'>|undefined){return !!q&&q.type==='MULTIPLE_CHOICE'&&!!q.options&&q.options.length>=2&&q.options.length<=4;}
export function canScanQuestion(room:MockRoomData,q:LiveQuestionPublic|undefined){return qrQuestionSupported(q)&&q?.status==='OPEN'&&room.activeQuestionId===q.id&&room.status==='ACTIVE'&&gameAcceptsAnswer(room.activeGame,q.id);}
export function qrAnswer(q:LiveQuestionPublic,choice:CardChoice){if(!/^[A-D]$/.test(choice)||!qrQuestionSupported(q)||choice.charCodeAt(0)-65>=q.options!.length)throw new Error('Lựa chọn không có trong câu hỏi.');return choice;}
