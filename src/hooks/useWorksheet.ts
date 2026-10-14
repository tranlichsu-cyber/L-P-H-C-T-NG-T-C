import {useEffect,useState} from 'react';
import {WorksheetService} from '../services/worksheets/WorksheetService';
import {emptyWorksheetState,type WorksheetState,type RoomWorksheet,type WorksheetResponse} from '../services/worksheets/content';
export function useWorksheetState(roomId:string|null){
 const [value,setValue]=useState<{roomId:string|null;state:WorksheetState;error:string}>({roomId:null,state:emptyWorksheetState(),error:''});
 useEffect(()=>{if(!roomId)return;return WorksheetService.subscribeState(roomId,state=>setValue({roomId,state,error:''}),()=>setValue({roomId,state:emptyWorksheetState(),error:'Chưa đồng bộ được phiếu bài tập. Em hãy tải lại trang hoặc kiểm tra kết nối.'}));},[roomId]);
 return value.roomId===roomId?value:{roomId,state:emptyWorksheetState(),error:''};
}
export function useWorksheet(roomId:string|null,id:string|null,studentId:string|null=null){
 const key=[roomId,id,studentId].join(':');
 const [value,setValue]=useState<{key:string;sheet:RoomWorksheet|null;responses:WorksheetResponse[];error:string}>({key:'',sheet:null,responses:[],error:''});
 useEffect(()=>{if(!roomId||!id)return;
  let active=true;const base=()=>({key,sheet:null,responses:[] as WorksheetResponse[],error:''});
  const fail=()=>{if(active)setValue(v=>({...(v.key===key?v:base()),error:'Chưa tải được phiếu hoặc bài làm. Vui lòng tải lại trang và kiểm tra kết nối.'}));};
  const a=WorksheetService.subscribeSheet(roomId,id,sheet=>{if(active)setValue(v=>({...(v.key===key?v:base()),sheet}));},fail);
  const b=WorksheetService.subscribeResponses(roomId,id,studentId,responses=>{if(active)setValue(v=>({...(v.key===key?v:base()),responses}));},fail);
  return()=>{active=false;a();b();};
 },[roomId,id,studentId,key]);
 return value.key===key?value:{key,sheet:null,responses:[],error:''};
}
