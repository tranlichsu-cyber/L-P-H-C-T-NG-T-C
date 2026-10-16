import {useEffect,useState} from 'react';
import {collection,onSnapshot,query,where} from 'firebase/firestore';
import {useAuth} from '../context/AuthContext';
import {auth,db,isFirebaseConfigured} from '../services/firebase/firebase';
import {StudentAccessService,type StudentWork} from '../services/selfPractice/studentAccess';

export function useSelfPracticeScores(classId:string|undefined){
 const {currentUser}=useAuth();
 const uid=currentUser?.uid||auth?.currentUser?.uid||'mock-teacher';
 const key=uid+':'+classId;
 const [state,setState]=useState<{key:string;works:StudentWork[];error:string;loading:boolean}>({key:'',works:[],error:'',loading:true});
 useEffect(()=>{
  let active=true;
  const success=(works:StudentWork[])=>{if(active)setState({key,works,error:'',loading:false});};
  const fail=()=>{if(active)setState({key,works:[],error:'Chưa tải được điểm tự luyện.',loading:false});};
  if(!classId)return;
  if(isFirebaseConfigured&&db){
   const stop=onSnapshot(query(collection(db,'selfPracticeWork'),where('teacherId','==',uid),where('classId','==',classId)),snapshot=>success(snapshot.docs.map(d=>d.data() as StudentWork)),fail);
   return()=>{active=false;stop();};
  }
  const load=()=>{void StudentAccessService.listWork().then(success,fail);};
  load();window.addEventListener('self-practice-work-updated',load);window.addEventListener('storage',load);
  return()=>{active=false;window.removeEventListener('self-practice-work-updated',load);window.removeEventListener('storage',load);};
 },[key,classId,uid]);
 return state.key===key?state:{works:[],error:'',loading:true};
}
