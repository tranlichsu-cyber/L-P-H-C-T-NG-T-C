import type {RoomWorksheet,WorksheetResponse} from './content';
import type {MockRoomData} from '../realtime/types';
import {parseBoardAnswer} from './activities';
export type ReturnFilter='ALL'|'WAITING'|'RETURNED';
const normalize=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/\s+/g,' ').trim();
export const isReturned=(sheet:RoomWorksheet,work:WorksheetResponse)=>!!sheet.returnedUids?.includes(work.authUid);
export function matchesResponse(sheet:RoomWorksheet,work:WorksheetResponse,query:string,filter:ReturnFilter,participants:MockRoomData['participants']){
 const group=sheet.kind==='GROUP'?sheet.groups?.find(g=>g.leaderId===work.studentId):undefined;
 const names=[work.studentName,group?.name||'',...(group?.memberIds.map(id=>participants[id]?.name||'')||[])].join(' ');
 return normalize(names).includes(normalize(query))&&(filter==='ALL'||isReturned(sheet,work)===(filter==='RETURNED'));
}
export function worksheetReport(sheet:RoomWorksheet,responses:WorksheetResponse[],participants:MockRoomData['participants']){
 const rows:(string|number)[][]=[['Hoạt động',sheet.title],['Loại',({BOARD:'Bảng con',EXIT:'Vé ra cửa',GROUP:'Hoạt động nhóm'} as Record<string,string>)[sheet.kind||'']||'Phiếu Word'],['Lưu ý','Trạng thái trả bài không đồng nghĩa với đã chấm điểm. Báo cáo không tải nhận xét hoặc điểm riêng. Bảng con chỉ xuất phần chữ, hình vẽ xem trên website. Danh sách cá nhân dựa trên các em hiện có trong phòng.'],[],['Nhóm / học sinh','Đại diện','Thành viên','Trạng thái','Thời gian nộp',...sheet.questions.map(q=>q.label)]];
 const name=(id:string)=>participants[id]?.name||responses.find(w=>w.studentId===id)?.studentName||id;
 const entries=sheet.kind==='GROUP'?(sheet.groups||[]).map(g=>({id:g.leaderId,label:g.name,leader:name(g.leaderId),members:g.memberIds.map(name).join(', ')})):[...new Set([...Object.keys(participants),...responses.map(w=>w.studentId)])].map(id=>({id,label:name(id),leader:'',members:''}));
 for(const entry of entries){const work=responses.find(w=>w.studentId===entry.id);rows.push([entry.label,entry.leader,entry.members,!work?'Chưa nộp':isReturned(sheet,work)?'Đã trả bài':'Chờ trả bài',work?new Date(work.submittedAt).toLocaleString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh'}):'',...sheet.questions.map(q=>{const answer=work?.answers[q.id]||'';if(sheet.kind!=='BOARD'||!answer)return answer;const board=parseBoardAnswer(answer);return board?board.text+(board.strokes.length?'\n[Có hình vẽ: xem bài trên website]':''):'[Nội dung bảng con: xem trên website]';})]);}
 return rows;
}
export async function downloadWorksheetReport(sheet:RoomWorksheet,responses:WorksheetResponse[],participants:MockRoomData['participants']){
 const XLSX=await import('xlsx');const workbook=XLSX.utils.book_new();const page=XLSX.utils.aoa_to_sheet(worksheetReport(sheet,responses,participants));
 page['!cols']=[{wch:25},{wch:25},{wch:45},{wch:18},{wch:23},...sheet.questions.map(()=>({wch:65}))];
 XLSX.utils.book_append_sheet(workbook,page,'Bao_cao');XLSX.writeFile(workbook,'Bao_cao_'+sheet.id.replace(/[^a-zA-Z0-9_-]/g,'_').slice(0,80)+'.xlsx');
}
