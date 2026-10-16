import type {WorksheetDraft} from './content';
export interface ActivityGroup {id:string;name:string;memberIds:string[];leaderId:string}
export interface GroupAccess {studentId:string;leaderId:string}
export interface GroupParticipant {name:string;mockAuthUid?:string}
export function distributeGroups(studentIds:string[],count:number):ActivityGroup[]{
 if(!Number.isInteger(count)||count<1||count>10||count>studentIds.length||new Set(studentIds).size!==studentIds.length)throw Error('Số nhóm cần từ 1 đến 10, không nhiều hơn số học sinh đã vào phòng.');
 const shuffled=[...studentIds];for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
 return Array.from({length:count},(_,i)=>{const memberIds=shuffled.filter((_,j)=>j%count===i);return {id:'group-'+(i+1),name:'Nhóm '+(i+1),memberIds,leaderId:memberIds[0]};});
}
export function validateGroups(groups:ActivityGroup[],access:Record<string,GroupAccess>){
 if(!Array.isArray(groups)||!groups.length||groups.length>10||!access||typeof access!=='object')throw Error('Danh sách nhóm không hợp lệ.');
 const members=new Set<string>(),ids=new Set<string>();
 for(const group of groups){
  if(!/^group-\d+$/.test(group.id)||ids.has(group.id)||!group.name.trim()||group.name.length>60||!group.memberIds.length||group.memberIds.length>60||!group.memberIds.includes(group.leaderId))throw Error('Mỗi nhóm cần thành viên và một đại diện thuộc nhóm.');
  ids.add(group.id);for(const sid of group.memberIds){if(!sid||sid.includes('/')||members.has(sid))throw Error('Mỗi học sinh chỉ thuộc một nhóm.');members.add(sid);}
 }
 if(members.size>60||Object.keys(access).length!==members.size)throw Error('Tối đa 60 học sinh và cần đủ phiên đăng nhập cho từng thành viên.');
 const seen=new Set<string>();for(const [uid,value] of Object.entries(access)){const group=groups.find(g=>g.memberIds.includes(value.studentId));if(!uid||!group||seen.has(value.studentId)||value.leaderId!==group.leaderId)throw Error('Quyền xem bài của nhóm không khớp thành viên.');seen.add(value.studentId);}
}
export function groupDraft(title:string,prompt:string,groups:ActivityGroup[],participants:Record<string,GroupParticipant>,durationMinutes=0):WorksheetDraft{
 if(!prompt.trim()||prompt.length>1000)throw Error('Nhiệm vụ nhóm cần từ 1 đến 1.000 ký tự.');
 const groupAccess:Record<string,GroupAccess>={};
 for(const group of groups)for(const sid of group.memberIds){const p=participants[sid];if(!p?.mockAuthUid||groupAccess[p.mockAuthUid])throw Error('Thành viên cần vào phòng bằng phiên riêng. Thầy/cô kiểm tra lại các em đã chọn đúng tên.');groupAccess[p.mockAuthUid]={studentId:sid,leaderId:group.leaderId};}
 validateGroups(groups,groupAccess);
 return {kind:'GROUP',durationMinutes,title:title.trim(),html:'<p>Thảo luận cùng nhóm. Chỉ người đại diện nhập và nộp bài chung. Thành viên xem bài sau khi nhóm nộp và nhận xét khi thầy/cô trả bài.</p><p>'+prompt.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]!))+'</p>',fileName:'hoat-dong-nhom',questions:[{id:'answer-1',label:prompt.trim()}],groups,groupAccess};
}
export const groupForStudent=(sheet:Pick<WorksheetDraft,'groups'>,studentId:string)=>sheet.groups?.find(group=>group.memberIds.includes(studentId));
export const groupReviewMembers=(sheet:WorksheetDraft,leaderId:string)=>sheet.kind==='GROUP'?(sheet.groups?.find(group=>group.leaderId===leaderId)?.memberIds||[]):[leaderId];
