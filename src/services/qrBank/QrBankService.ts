import {collection,doc,getDoc,getDocs,query,where,setDoc,deleteDoc} from 'firebase/firestore';
import {auth,db,isFirebaseConfigured} from '../firebase/firebase';
import {createReadCache} from '../data/readEfficiency';
import {validateQrBank,type QrBank} from './content';
const cache=createReadCache<QrBank[]>(120000);
const storage=(uid:string)=>`qr-question-banks-v1-${uid}`;
const sortBanks=(items:QrBank[])=>items.sort((a,b)=>(typeof b.updatedAt==='string'?b.updatedAt:'').localeCompare(typeof a.updatedAt==='string'?a.updatedAt:''));
const readLocal=(uid:string):QrBank[]=>{try{return sortBanks(JSON.parse(localStorage.getItem(storage(uid))||'[]') as QrBank[]);}catch{return [];}};
const writeLocal=(uid:string,items:QrBank[])=>{try{localStorage.setItem(storage(uid),JSON.stringify(items));}catch{/* Ignore storage limits */}};
const isQuotaErr=(e:unknown)=>{const m=String((e as {message?:string;code?:string})?.message||(e as {code?:string})?.code||e||'').toLowerCase();return m.includes('quota')||m.includes('resource-exhausted')||m.includes('resource_exhausted')||m.includes('429');};
export class QrBankService{
 static async list(uid:string,refresh=false):Promise<QrBank[]>{
  if(!uid)return [];
  if(isFirebaseConfigured&&auth?.currentUser?.uid!==uid)throw new Error('Cần đăng nhập đúng tài khoản giáo viên.');
  return cache.read(uid,async()=>{
   if(isFirebaseConfigured&&db){
    if(auth?.currentUser?.uid!==uid)throw new Error('Cần đăng nhập đúng tài khoản giáo viên.');
    try{
     const snap=await getDocs(query(collection(db,'qrQuestionSets'),where('teacherId','==',uid)));
     const cloud=sortBanks(snap.docs.map(d=>({...d.data(),id:d.id} as QrBank)));
     const localOnly=readLocal(uid).filter(l=>!cloud.some(c=>c.id===l.id));
     const merged=sortBanks([...cloud,...localOnly]);
     writeLocal(uid,merged);
     return merged;
    }catch(e){
     if(isQuotaErr(e)||readLocal(uid).length>0)return readLocal(uid);
     return [];
    }
   }
   return readLocal(uid);
  },refresh);
 }
 static async get(uid:string,id:string):Promise<QrBank|null>{
  if(isFirebaseConfigured&&db){
   if(auth?.currentUser?.uid!==uid)throw new Error('Cần đăng nhập tài khoản giáo viên.');
   try{
    const snap=await getDoc(doc(db,'qrQuestionSets',id));
    if(snap.exists()){
     const bank={...snap.data(),id:snap.id} as QrBank;
     if(bank.teacherId!==uid)throw new Error('Thầy/cô không có quyền sửa bộ câu hỏi này.');
     return bank;
    }
   }catch(e){
    if(e instanceof Error&&e.message.includes('không có quyền'))throw e;
   }
   return readLocal(uid).find(b=>b.id===id)||null;
  }
  return (await this.list(uid)).find(b=>b.id===id)||null;
 }
 static async save(uid:string,bank:QrBank){
  if(!uid||bank.teacherId!==uid)throw new Error('Chỉ lưu bộ câu hỏi của tài khoản hiện tại.');validateQrBank(bank);
  const clean=JSON.parse(JSON.stringify({...bank,title:bank.title.trim(),subject:bank.subject.trim(),grade:bank.grade.trim(),updatedAt:new Date().toISOString()})) as QrBank;
  if(isFirebaseConfigured&&db){
   if(auth?.currentUser?.uid!==uid||auth.currentUser.isAnonymous)throw new Error('Cần đăng nhập tài khoản giáo viên.');
   const items=readLocal(uid);
   writeLocal(uid,[clean,...items.filter(b=>b.id!==bank.id)]);
   try{
    await setDoc(doc(db,'qrQuestionSets',bank.id),clean);
   }catch(e){
    if(!isQuotaErr(e))throw e;
   }
  }else{
   const items=await this.list(uid);
   localStorage.setItem(storage(uid),JSON.stringify([clean,...items.filter(b=>b.id!==bank.id)]));
  }
  cache.clear();return clean;
 }
 static async remove(uid:string,id:string){
  if(isFirebaseConfigured&&db){
   if(auth?.currentUser?.uid!==uid)throw new Error('Cần đăng nhập tài khoản giáo viên.');
   writeLocal(uid,readLocal(uid).filter(b=>b.id!==id));
   try{
    await deleteDoc(doc(db,'qrQuestionSets',id));
   }catch(e){
    if(!isQuotaErr(e))throw e;
   }
  }else{
   localStorage.setItem(storage(uid),JSON.stringify((await this.list(uid)).filter(b=>b.id!==id)));
  }
  cache.clear();
 }
}
