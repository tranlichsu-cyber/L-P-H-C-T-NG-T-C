import {useAuth} from '../context/AuthContext';
import {useEffect,useState} from 'react';
import {WorksheetService} from '../services/worksheets/WorksheetService';
import {groupForStudent} from '../services/worksheets/groups';
import {emptyWorksheetState,type WorksheetState,type RoomWorksheet,type WorksheetResponse} from '../services/worksheets/content';
export function useWorksheetState(roomId:string|null){
 const {currentUser}=useAuth(),owner=currentUser?.uid||'local';
 const [value,setValue]=useState<{owner:string;roomId:string|null;state:WorksheetState;error:string}>({owner:'',roomId:null,state:emptyWorksheetState(),error:''});
 useEffect(()=>{if(!roomId)return;return WorksheetService.subscribeState(roomId,state=>setValue({owner,roomId,state,error:''}),()=>setValue({owner,roomId,state:emptyWorksheetState(),error:'Chưa đồng bộ được phiếu bài tập. Em hãy tải lại trang hoặc kiểm tra kết nối.'}));},[roomId,owner]);
 return value.roomId===roomId&&value.owner===owner?value:{owner,roomId,state:emptyWorksheetState(),error:''};
}
export function useWorksheet(roomId:string|null,id:string|null,studentId:string|null=null){
 const {currentUser}=useAuth();
 const key=JSON.stringify([currentUser?.uid||'local',roomId,id,studentId]);
 const [value,setValue]=useState<{key:string;sheet:RoomWorksheet|null;responses:WorksheetResponse[];error:string}>({key:'',sheet:null,responses:[],error:''});
 useEffect(()=>{if(!roomId||!id)return;
  let active=true,stopResponses=()=>{},responseKey:string|undefined;
  const base=()=>({key,sheet:null,responses:[] as WorksheetResponse[],error:''});
  const fail=()=>{if(active)setValue(v=>({...(v.key===key?v:base()),responses:[],error:'Chưa tải được phiếu hoặc bài làm. Vui lòng tải lại trang và kiểm tra kết nối.'}));};
  const stopSheet=WorksheetService.subscribeSheet(roomId,id,sheet=>{
   if(!active)return;
   setValue(v=>({...(v.key===key?v:base()),sheet}));
   const group=sheet?.kind==='GROUP'&&studentId?groupForStudent(sheet,studentId):undefined;
   const responseStudent=group?.leaderId||studentId;
   const nextKey=!sheet||(studentId&&sheet.kind==='GROUP'&&!group)?'none':responseStudent||'all';
   if(nextKey===responseKey)return;stopResponses();responseKey=nextKey;
   setValue(v=>({...v,key,responses:[]}));
   if(nextKey!=='none')stopResponses=WorksheetService.subscribeResponses(roomId,id,responseStudent,responses=>{if(active&&responseKey===nextKey)setValue(v=>({...v,key,responses}));},fail);
  },fail);
  return()=>{active=false;stopSheet();stopResponses();};
 },[roomId,id,studentId,key]);
 return value.key===key?value:{key,sheet:null,responses:[],error:''};
}
