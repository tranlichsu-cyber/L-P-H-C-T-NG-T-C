import {collection,doc,getDocs,query,where,setDoc,deleteDoc} from 'firebase/firestore';
import {auth,db,isFirebaseConfigured} from '../firebase/firebase';
export const materialKinds={HISTORY:'Tư liệu lịch sử',CULTURE:'Văn hóa',IMAGE:'Hình ảnh',VIDEO:'Video'};
export type MaterialKind=keyof typeof materialKinds;
export interface TraditionMaterial {id:string;teacherId:string;kind:MaterialKind;title:string;text:string;mediaUrl:string;source:string;sourceUrl:string;published:boolean;updatedAt:string;}
export function safeHttps(value:string){try{const url=new URL(value);return url.protocol==='https:' && !url.username && !url.password;}catch{return false;}}
export function youtubeEmbed(value:string):string|null {try{const u=new URL(value);let id='';if(u.hostname==='youtu.be')id=u.pathname.slice(1);else if(['youtube.com','www.youtube.com','m.youtube.com'].includes(u.hostname))id=u.searchParams.get('v') || u.pathname.match(/^\/(?:shorts|embed)\/([^/]+)/)?.[1] || '';return /^[\w-]{11}$/.test(id)?`https://www.youtube-nocookie.com/embed/${id}`:null;}catch{return null;}}
export function validateMaterial(item:Pick<TraditionMaterial,'kind'|'title'|'text'|'mediaUrl'|'sourceUrl'>){
 if(!(item.kind in materialKinds))throw new Error('Loại tư liệu không hợp lệ.');
 if(!item.title.trim() || item.title.length>200)throw new Error('Tiêu đề cần 1–200 ký tự.');
 if(item.text.length>30000)throw new Error('Nội dung tối đa 30.000 ký tự.');
 if(['HISTORY','CULTURE'].includes(item.kind) && !item.text.trim())throw new Error('Hãy nhập nội dung tư liệu.');
 if(item.sourceUrl && !safeHttps(item.sourceUrl))throw new Error('Liên kết nguồn cần bắt đầu bằng https://.');
 const image=/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(item.mediaUrl) && item.mediaUrl.length<=700000;
 if(item.kind==='IMAGE' && !image && !safeHttps(item.mediaUrl))throw new Error('Hãy chọn ảnh hoặc nhập liên kết ảnh https://.');
 if(item.kind==='VIDEO' && !safeHttps(item.mediaUrl))throw new Error('Hãy nhập liên kết video https://.');
 if(!['IMAGE','VIDEO'].includes(item.kind) && item.mediaUrl)throw new Error('Tư liệu văn bản không cần liên kết ảnh/video.');
}
const key='tradition-materials';
export class TraditionMaterials {
 static async list(publicOnly=true):Promise<TraditionMaterial[]>{if(isFirebaseConfigured && db){const snap=await getDocs(query(collection(db,'traditionMaterials'),publicOnly?where('published','==',true):where('teacherId','==',auth?.currentUser?.uid || '')));return snap.docs.map(d=>({...d.data(),id:d.id} as TraditionMaterial)).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt));}return (JSON.parse(localStorage.getItem(key)||'[]') as TraditionMaterial[]).filter(i=>!publicOnly || i.published);}
 static async save(input:Omit<TraditionMaterial,'teacherId'|'published'|'updatedAt'>){validateMaterial(input);const item:TraditionMaterial={...input,title:input.title.trim(),text:input.text.trim(),teacherId:auth?.currentUser?.uid || 'mock-teacher',published:true,updatedAt:new Date().toISOString()};if(isFirebaseConfigured && db)await setDoc(doc(db,'traditionMaterials',item.id),item);else localStorage.setItem(key,JSON.stringify([item,...(await this.list(false)).filter(i=>i.id!==item.id)]));}
 static async remove(id:string){if(isFirebaseConfigured && db)await deleteDoc(doc(db,'traditionMaterials',id));else localStorage.setItem(key,JSON.stringify((await this.list(false)).filter(i=>i.id!==id)));}
}
export async function uploadMaterialImage(file:File):Promise<string>{
 if(!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size>8*1024*1024)throw new Error('Chọn ảnh JPG/PNG/WebP, tối đa 8 MB.');
 const bitmap=await createImageBitmap(file);try{const ratio=Math.min(1,1200/Math.max(bitmap.width,bitmap.height));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*ratio));canvas.height=Math.max(1,Math.round(bitmap.height*ratio));const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Không đọc được ảnh.');ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);const data=canvas.toDataURL('image/jpeg',0.72);if(data.length>700000)throw new Error('Ảnh còn quá lớn. Hãy chọn ảnh nhỏ hơn.');return data;}finally{bitmap.close();}
}
