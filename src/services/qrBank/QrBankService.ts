import {collection,doc,getDoc,getDocs,query,where,setDoc,deleteDoc} from 'firebase/firestore';
import {auth,db,isFirebaseConfigured} from '../firebase/firebase';
import {createReadCache} from '../data/readEfficiency';
import {validateQrBank,type QrBank} from './content';
const cache=createReadCache<QrBank[]>(120000);
const storage=(uid:string)=>`qr-question-banks-v1-${uid}`;
export class QrBankService{
 static async list(uid:string,refresh=false):Promise<QrBank[]>{
  if(!uid)return [];
  if(isFirebaseConfigured&&auth?.currentUser?.uid!==uid)throw new Error('Cần đăng nhập đúng tài khoản giáo viên.');
  return cache.read(uid,async()=>{if(isFirebaseConfigured&&db){if(auth?.currentUser?.uid!==uid)throw new Error('Cần đăng nhập đúng tài khoản giáo viên.');const snap=await getDocs(query(collection(db,'qrQuestionSets'),where('teacherId','==',uid)));return snap.docs.map(d=>({...d.data(),id:d.id} as QrBank)).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt));}return JSON.parse(localStorage.getItem(storage(uid))||'[]') as QrBank[];},refresh);
 }
 static async get(uid:string,id:string):Promise<QrBank|null>{
  if(isFirebaseConfigured&&db){if(auth?.currentUser?.uid!==uid)throw new Error('Cần đăng nhập tài khoản giáo viên.');const snap=await getDoc(doc(db,'qrQuestionSets',id));if(!snap.exists())return null;const bank={...snap.data(),id:snap.id} as QrBank;if(bank.teacherId!==uid)throw new Error('Thầy/cô không có quyền sửa bộ câu hỏi này.');return bank;}return (await this.list(uid)).find(b=>b.id===id)||null;
 }
 static async save(uid:string,bank:QrBank){
  if(!uid||bank.teacherId!==uid)throw new Error('Chỉ lưu bộ câu hỏi của tài khoản hiện tại.');validateQrBank(bank);
  const clean=JSON.parse(JSON.stringify({...bank,title:bank.title.trim(),subject:bank.subject.trim(),grade:bank.grade.trim(),updatedAt:new Date().toISOString()})) as QrBank;
  if(isFirebaseConfigured&&db){if(auth?.currentUser?.uid!==uid||auth.currentUser.isAnonymous)throw new Error('Cần đăng nhập tài khoản giáo viên.');await setDoc(doc(db,'qrQuestionSets',bank.id),clean);}else{const items=await this.list(uid);localStorage.setItem(storage(uid),JSON.stringify([clean,...items.filter(b=>b.id!==bank.id)]));}cache.clear();return clean;
 }
 static async remove(uid:string,id:string){if(isFirebaseConfigured&&db){if(auth?.currentUser?.uid!==uid)throw new Error('Cần đăng nhập tài khoản giáo viên.');await deleteDoc(doc(db,'qrQuestionSets',id));}else localStorage.setItem(storage(uid),JSON.stringify((await this.list(uid)).filter(b=>b.id!==id)));cache.clear();}
}
