import DOMPurify from 'dompurify';
import {validateQrBank,type QrBank,type QrQuestion} from './content';
import {prepareQrImage} from './imageUpload';
export const QR_WORD_TEMPLATE='/templates/mau-bo-cau-hoi-qr-v1.docx';
export const QR_WORD_EXAMPLE='/templates/bo-mau-qr-toan4-10cau-v1.docx';
export type WordRows={label:string;text:string;images?:string[];unsupported?:boolean}[][];
const key=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/gi,'d').toLowerCase().replace(/[:.]/g,'').replace(/\s+/g,' ').trim();
export function bankFromWordRows(tables:WordRows,uid:string):QrBank{
 const now=new Date().toISOString(),bank:QrBank={id:crypto.randomUUID(),teacherId:uid,title:'',subject:'',grade:'',createdAt:now,updatedAt:now,questions:[]};
 for(const rows of tables){const values=new Map<string,string>(),images:string[]=[];let question=false;
  for(const row of rows){const label=key(row.label);if(values.has(label))throw new Error(`Trường “${row.label}” bị lặp trong cùng một bảng.`);values.set(label,row.text.trim());if(label==='cau hoi')question=true;if(row.unsupported)throw new Error('Có ảnh, công thức hoặc đối tượng Word không đọc được. Hãy chuyển thành ảnh PNG/JPG và chèn vào ô Ảnh.');if(row.images?.length){if(!['anh','cau hoi'].includes(label))throw new Error('Ảnh cần đặt trong ô Ảnh hoặc Câu hỏi, không đặt trong đáp án.');images.push(...row.images);}}
  if(!question){if([...values.keys()].some(k=>!['ten bo cau hoi','mon hoc','khoi lop'].includes(k)))throw new Error('Có bảng không đúng mẫu. Giữ nguyên tên các trường, đặc biệt là dòng Câu hỏi.');for(const [label,field] of [['ten bo cau hoi','title'],['mon hoc','subject'],['khoi lop','grade']] as const){const value=values.get(label);if(value!==undefined){if(bank[field])throw new Error(`Thông tin “${label}” bị lặp. Chỉ giữ một bảng thông tin bộ.`);bank[field]=value;}}continue;}
  if(bank.questions.length>=80)throw new Error('Tối đa 80 câu hỏi trong một file.');
  const allowed=['cau hoi','a','b','c','d','dap an dung','diem dung','diem tru','giai thich','anh','mo ta anh','video'];
  for(const label of values.keys())if(!allowed.includes(label))throw new Error(`Câu ${bank.questions.length+1}: trường “${label}” không đúng mẫu. Hãy giữ nguyên tên ở cột trái.`);
  const options=['a','b','c','d'].map(k=>values.get(k)||'');while(options.length&&options.at(-1)==='')options.pop();
  const optional=(s:string)=>{const v=values.get(s)||'';return /^\[.*\]$/.test(v)?'':v;};
  const imageLink=optional('anh');if(images.length>1||(images.length&&imageLink))throw new Error(`Câu ${bank.questions.length+1}: chỉ dùng một ảnh, chọn ảnh chèn trong Word hoặc liên kết ảnh.`);
  const points=(name:string,fallback:number)=>{const value=values.get(name)||'';if(!value)return fallback;if(!/^\d+(?:[.,]\d{1,2})?$/.test(value))throw new Error(`Câu ${bank.questions.length+1}: điểm phải là số từ 0 đến 100.`);return Number(value.replace(',','.'));};
  const q:QrQuestion={id:crypto.randomUUID(),type:'MULTIPLE_CHOICE',content:values.get('cau hoi')||'',options,correctAnswer:(values.get('dap an dung')||'').toUpperCase(),correctPoints:points('diem dung',10),wrongPenalty:points('diem tru',0),explanation:values.get('giai thich')||''};
  const imageUrl=images[0]||imageLink,videoUrl=optional('video'),imageAlt=values.get('mo ta anh')||'';if(imageUrl||videoUrl||imageAlt)q.media={...(imageUrl?{imageUrl}:{}),...(videoUrl?{videoUrl}:{}),...(imageAlt?{imageAlt}:{})};bank.questions.push(q);
 }
 if(!bank.questions.length)throw new Error('Chưa thấy bảng Câu hỏi. Hãy tải mẫu Word của kho QR và điền vào cột bên phải.');
 validateQrBank(bank);return bank;
}
function checkZip(buffer:ArrayBuffer){
 const v=new DataView(buffer);let end=-1;for(let p=v.byteLength-22;p>=Math.max(0,v.byteLength-65557);p--)if(v.getUint32(p,true)===0x06054b50){end=p;break;}
 if(end<0)throw new Error('File không phải Word .docx hợp lệ.');const count=v.getUint16(end+10,true),start=v.getUint32(end+16,true);if(count>1500||start>=end)throw new Error('File Word quá phức tạp. Hãy dùng file mẫu và giảm số ảnh.');
 let offset=start,total=0;for(let i=0;i<count;i++){if(offset+46>end||v.getUint32(offset,true)!==0x02014b50)throw new Error('Cấu trúc file Word bị lỗi. Hãy lưu lại file bằng Word.');const size=v.getUint32(offset+24,true);total+=size;if(size>12*1024*1024||total>32*1024*1024)throw new Error('Nội dung giải nén quá lớn. Hãy thu nhỏ ảnh hoặc chia bộ câu hỏi.');if(v.getUint16(offset+8,true)&1)throw new Error('Không đọc được file Word đặt mật khẩu.');offset+=46+v.getUint16(offset+28,true)+v.getUint16(offset+30,true)+v.getUint16(offset+32,true);}
}
export async function readQrWord(file:File,uid:string):Promise<QrBank>{
 if(!/\.docx$/i.test(file.name))throw new Error('Chọn file .docx từ mẫu QR. File .doc cũ cần lưu lại thành .docx.');if(file.size>8*1024*1024)throw new Error('File Word tối đa 8 MB. Hãy thu nhỏ ảnh hoặc chia bộ câu hỏi.');
 const buffer=await file.arrayBuffer();checkZip(buffer);const mammoth=await import('mammoth');let result;
 try{result=await mammoth.convertToHtml({arrayBuffer:buffer},{externalFileAccess:false,includeEmbeddedStyleMap:false,convertImage:mammoth.images.imgElement(async img=>{const raw=await img.readAsArrayBuffer();if(raw.byteLength>6*1024*1024)throw new Error('Ảnh trong Word quá lớn (tối đa 6 MB/ảnh).');const src=await prepareQrImage(new File([raw],'image',{type:img.contentType}));return {src};})});}catch(e){throw new Error(e instanceof Error?`Không đọc được Word: ${e.message}`:'Không đọc được Word. Hãy lưu lại file theo mẫu .docx.');}
 // Never insert document HTML into the live page or load its external resources.
 const clean=DOMPurify.sanitize(result.value,{ALLOWED_TAGS:['table','tbody','thead','tr','td','th','p','br','img','a','strong','em'],ALLOWED_ATTR:['src','href']});
 const document=new DOMParser().parseFromString(clean,'text/html'),tables:WordRows=[];
 if(Array.from(document.querySelectorAll('img')).some(img=>!img.closest('td,th')))throw new Error('Hãy đặt ảnh vào ô Ảnh trong bảng câu hỏi, không để ngoài bảng.');
 for(const table of Array.from(document.querySelectorAll('table'))){if(table.parentElement?.closest('table'))throw new Error('Không đặt bảng lồng trong bảng. Hãy dùng đúng hai cột của mẫu.');const rows=[];
  for(const row of Array.from(table.querySelectorAll('tr'))){const cells=Array.from(row.children).filter(c=>['TD','TH'].includes(c.tagName));if(cells.length!==2)throw new Error('Mỗi dòng trong bảng cần đúng hai cột như file mẫu.');const cell=cells[1],copy=cell.cloneNode(true) as Element;copy.querySelectorAll('br').forEach(b=>b.replaceWith('\n'));copy.querySelectorAll('p').forEach(p=>p.append('\n'));
   let text=copy.textContent?.trim()||'';const label=cells[0].textContent||'';
   if(['anh','video'].includes(key(label))){const links=Array.from(cell.querySelectorAll('a')).map(a=>a.getAttribute('href')||'').filter(Boolean);if(links.length===1&&(!text||!/^https:\/\//i.test(text)))text=links[0];}
   rows.push({label,text,images:Array.from(cell.querySelectorAll('img')).map(img=>img.getAttribute('src')||'')});
  }tables.push(rows);
 }
 if(result.messages.some(m=>m.type==='warning'&&/image|omml|math|object|oleObject|video/i.test(m.message)))throw new Error('Word có ảnh, công thức hoặc đối tượng nhúng chưa đọc được. Hãy dùng ảnh JPG/PNG trong ô Ảnh và liên kết trong ô Video.');
 return bankFromWordRows(tables,uid);
}
