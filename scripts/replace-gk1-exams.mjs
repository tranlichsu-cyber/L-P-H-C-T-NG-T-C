import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {encode,decode,stable} from './apply-curriculum-corrections.mjs';
const root='projects/lop-hoc-tuong-tac-a62a5/databases/(default)/documents';
const plain=doc=>decode({mapValue:{fields:doc.fields||{}}});
export function replacementPlan(documents,manifest,now=new Date().toISOString()){
 if(manifest.version!=='gk1-grade4-20261016'||manifest.exams?.length!==2)throw Error('Unexpected exam manifest.');
 if(documents.length>100)throw Error('Too many old exams; review scope first.');
 const owners=new Set(documents.map(doc=>plain(doc).teacherId));
 if(owners.size!==1||![...owners][0])throw Error('Cannot establish one exam owner; review scope first.');
 const teacherId=[...owners][0];
 const replacements=manifest.exams.map(exam=>{
  if(exam.grade!=='Khối 4'||exam.category!=='EXAM'||!['Toán','Tiếng Việt'].includes(exam.subject)||!exam.questions.length)throw Error('Unexpected new exam.');
  if(Math.abs(exam.questions.reduce((sum,q)=>sum+q.points,0)-10)>.0001)throw Error('Exam must total ten points.');
  const id=teacherId+'_'+exam.id;
  return {name:root+'/selfPracticeQuizzes/'+id,fields:Object.fromEntries(Object.entries({...exam,id,teacherId,published:true,updatedAt:now,sourceSha256:manifest.sourceSha256}).map(([key,value])=>[key,encode(value)]))};
 });
 if(new Set(replacements.map(doc=>doc.name)).size!==2)throw Error('Duplicate replacement IDs.');
 const old=documents.filter(doc=>!replacements.some(next=>next.name===doc.name));
 for(const doc of documents){const value=plain(doc);if(!/^selfPracticeQuizzes\/[^/]+$/.test(doc.name.slice(root.length+1))||!doc.name.startsWith(root+'/')||value.category!=='EXAM'||!doc.updateTime)throw Error('Invalid old exam document.');if(!/(?:^|\D)4(?:\D|$)/.test(value.grade||''))throw Error('Other grades found; stop before deleting.');}
 if(documents.some(doc=>replacements.some(next=>next.name===doc.name)))throw Error('Replacement exams already exist; do not repeat replacement.');
 return {version:manifest.version,old,replacements,summary:{oldExams:old.length,newExams:replacements.length,oldTitles:old.map(doc=>plain(doc).title),newTitles:manifest.exams.map(exam=>exam.title)}};
}
async function main(){
 const mode=process.argv[2],file=process.argv[3];if(!['prepare','apply'].includes(mode)||!file)throw Error('Expected prepare/apply and backup path.');
 const manifest=JSON.parse(await fs.readFile('src/data/exams/gk1-grade4-2026.json','utf8'));
 const token=execFileSync('gcloud',['auth','print-access-token'],{encoding:'utf8'}).trim(),headers={'Content-Type':'application/json',Authorization:'Bearer '+token};
 const request=async(path,body)=>{const response=await fetch('https://firestore.googleapis.com/v1/'+path,{method:body?'POST':'GET',headers,...(body?{body:JSON.stringify(body)}:{})});if(!response.ok)throw Error('Firestore request failed: '+response.status);return response.json();};
 if(mode==='prepare'){
  const rows=await request(root+':runQuery',{structuredQuery:{from:[{collectionId:'selfPracticeQuizzes'}],where:{fieldFilter:{field:{fieldPath:'category'},op:'EQUAL',value:{stringValue:'EXAM'}}}}});
  const plan=replacementPlan(rows.filter(row=>row.document).map(row=>row.document),manifest);
  await fs.writeFile(file,JSON.stringify(plan,null,2)+'\n');await fs.writeFile(file+'.summary.json',JSON.stringify(plan.summary,null,2)+'\n');console.log(JSON.stringify(plan.summary));return;
 }
 const saved=JSON.parse(await fs.readFile(file,'utf8'));
 const plan=replacementPlan(saved.old,manifest,decode(saved.replacements[0].fields.updatedAt));
 if(stable(plan.replacements)!==stable(saved.replacements))throw Error('Saved replacement differs from reviewed manifest.');
 const writes=[...plan.replacements.map(update=>({update,currentDocument:{exists:false}})),...plan.old.map(doc=>({delete:doc.name,currentDocument:{updateTime:doc.updateTime}}))];
 const result=await request(root+':commit',{writes});if(result.writeResults?.length!==writes.length)throw Error('Unexpected write result count.');
 for(const doc of plan.replacements){const actual=await request(doc.name);if(stable(actual.fields)!==stable(doc.fields))throw Error('New exam verification failed.');}
 for(const doc of plan.old){const response=await fetch('https://firestore.googleapis.com/v1/'+doc.name,{headers});if(response.status!==404)throw Error('Old exam deletion verification failed.');}
 const verified={verified:true,...plan.summary,commitTime:result.commitTime,studentHistoryUnchanged:true};await fs.writeFile(file+'.result.json',JSON.stringify(verified,null,2)+'\n');console.log(JSON.stringify(verified));
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(error=>{console.error(error.message);process.exitCode=1;});
