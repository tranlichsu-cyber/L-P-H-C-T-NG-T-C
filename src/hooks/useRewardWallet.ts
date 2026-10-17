import {useEffect,useState} from 'react';
import {useAuth} from '../context/AuthContext';
import {RewardService} from '../services/rewards/RewardService';
import type {RewardIdentity,RewardWallet} from '../services/rewards/content';
export function useRewardWallet(identity:RewardIdentity){
 const {currentUser}=useAuth(),key=JSON.stringify([currentUser?.uid||'local',identity]);
 const {classId,studentId,roomId='',accessCode='',teacher=false}=identity;
 const [state,setState]=useState<{key:string;wallet:RewardWallet|null;error:string;loading:boolean}>({key:'',wallet:null,error:'',loading:true});
 useEffect(()=>RewardService.subscribe({classId,studentId,roomId,accessCode,teacher},wallet=>setState({key,wallet,error:'',loading:false}),()=>setState({key,wallet:null,error:'Chưa tải được huy hiệu. Em kiểm tra lại phiên vào lớp hoặc mã học sinh.',loading:false})),[key,classId,studentId,roomId,accessCode,teacher]);
 return state.key===key?state:{key,wallet:null,error:'',loading:true};
}
