import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const project='lop-hoc-tuong-tac-a62a5';
const documentRoot=`projects/${project}/databases/(default)/documents`;
export const stable=value=>JSON.stringify(value,(_key,item)=>item&&typeof item==='object'&&!Array.isArray(item)?Object.fromEntries(Object.entries(item).sort(([a],[b])=>a.localeCompare(b))):item);
export function decode(value){
 if('mapValue'in value)return Object.fromEntries(Object.entries(value.mapValue.fields||{}).map(([key,item])=>[key,decode(item)]));
 if('arrayValue'in value)return (value.arrayValue.values||[]).map(decode);
 if('integerValue'in value)return Number(value.integerValue);
 if('doubleValue'in value)return value.doubleValue;
 if('nullValue'in value)return null;
 return Object.values(value)[0];
}
export function encode(value){
 if(value===null)return {nullValue:null};
 if(Array.isArray(value))return {arrayValue:{values:value.map(encode)}};
 if(typeof value==='object')return {mapValue:{fields:Object.fromEntries(Object.entries(value).map(([key,item])=>[key,encode(item)]))}};
 if(typeof value==='boolean')return {booleanValue:value};
 if(typeof value==='number')return Number.isInteger(value)?{integerValue:String(value)}:{doubleValue:value};
 if(typeof value==='string')return {stringValue:value};
 throw Error('Unsupported correction value.');
}
const plain=doc=>decode({mapValue:{fields:doc.fields||{}}});
const same=(a,b)=>stable(a)===stable(b);
const normalizeQuestion=q=>({id:q.id,type:q.type,content:(q.content||'').trim(),...(q.options?{options:q.options.map(option=>option.trim())}:{}),correctAnswer:(q.correctAnswer||'').trim(),explanation:q.explanation||'',caseInsensitive:q.caseInsensitive??true,trimWhitespace:q.trimWhitespace??true});
const editableQuestionFields=new Set(['content','options','correctAnswer','explanation','caseInsensitive','trimWhitespace']);
function validateQuestion(q){
 if(!q.content?.trim()||!q.correctAnswer?.trim())throw Error('Missing question content or answer.');
 if(q.type==='MULTIPLE_CHOICE'&&(q.options?.length!==4||new Set(q.options).size!==4||q.options.some(option=>!option.trim())||(!q.options.includes(q.correctAnswer)&&!/^[A-D]$/i.test(q.correctAnswer))))throw Error('Invalid multiple-choice correction.');
 if(q.type==='TRUE_FALSE'&&!['Đúng','Sai'].includes(q.correctAnswer))throw Error('Invalid true/false correction.');
}
export async function prepareCorrections(plan,readDocument,now=new Date().toISOString()){
 if(plan.version!=='curriculum-20261015-v1'||!plan.quizzes?.length)throw Error('Unexpected correction plan.');
 const writes=[],rollback=[],summary={publicQuizzes:0,sourceQuestions:0,alreadyCorrectSources:0,missingSources:[]};
 const visited=new Set();
 function queue(doc,values){
  if(visited.has(doc.name))throw Error('Duplicate write target.');visited.add(doc.name);
  if(!doc.updateTime)throw Error('Missing concurrency precondition.');
  const keys=Object.keys(values);
  writes.push({update:{name:doc.name,fields:Object.fromEntries(keys.map(key=>[key,encode(values[key])]))},updateMask:{fieldPaths:keys},currentDocument:{updateTime:doc.updateTime}});
  rollback.push({name:doc.name,fieldPaths:keys,fields:Object.fromEntries(keys.filter(key=>doc.fields[key]!==undefined).map(key=>[key,doc.fields[key]]))});
 }
 for(const quiz of plan.quizzes){
  const doc=await readDocument(`selfPracticeQuizzes/${quiz.id}`);
  if(!doc)throw Error('Published quiz missing: '+quiz.title);
  const current=plain(doc);
  if(current.published!==true||current.grade!==quiz.grade||current.subject!==quiz.subject||current.title!==quiz.title||!same(current.questions,quiz.expectedQuestions))throw Error('Published quiz changed after review: '+quiz.title);
  if(!current.teacherId||!quiz.id.startsWith(current.teacherId+'_'))throw Error('Cannot establish source quiz ownership.');
  const sourceId=quiz.id.slice(current.teacherId.length+1);
  if(!sourceId||sourceId.includes('/'))throw Error('Invalid source quiz ID.');
  const source=await readDocument(`quizzes/${sourceId}`);
  if(source&&plain(source).teacherId!==current.teacherId)throw Error('Source quiz ownership differs from publication.');
  const updated=current.questions.map(q=>({...q}));
  for(const change of quiz.questions){
   const index=updated.findIndex(q=>q.id===change.id);
   if(index<0||!same(updated[index],change.before))throw Error('Question baseline mismatch.');
   if(!change.reasons?.length||!change.sources?.length||Object.keys(change.changes).some(key=>!editableQuestionFields.has(key)))throw Error('Correction needs a reviewed reason and source, and may only change learning content.');
   const next={...updated[index],...change.changes};validateQuestion(next);updated[index]=next;
   if(!source){summary.missingSources.push({quizId:quiz.id,questionId:change.id,reason:'Source quiz no longer exists; public copy only.'});continue;}
   if(!change.id||change.id.includes('/'))throw Error('Invalid source question ID.');
   const sourceQuestion=await readDocument(`quizzes/${sourceId}/questions/${change.id}`);
   if(!sourceQuestion){summary.missingSources.push({quizId:quiz.id,questionId:change.id,reason:'Source question no longer exists; public copy only.'});continue;}
   const sourceValue={...plain(sourceQuestion),id:change.id};
   if(same(normalizeQuestion(sourceValue),normalizeQuestion(next))){summary.alreadyCorrectSources++;continue;}
   if(!same(normalizeQuestion(sourceValue),normalizeQuestion(change.before)))throw Error('Source question changed after publication: '+quiz.title+' / '+change.id);
   queue(sourceQuestion,change.changes);summary.sourceQuestions++;
  }
  queue(doc,{questions:updated,updatedAt:now});summary.publicQuizzes++;
 }
 if(writes.length>500)throw Error('Too many writes for one atomic commit.');
 return {writes,rollback,summary};
}
async function main(){
 const mode=process.argv[2];if(!['validate','apply'].includes(mode))throw Error('Choose validate or apply.');
 const plan=JSON.parse(await fs.readFile('data-migrations/curriculum-20261015.json','utf8'));
 const token=execFileSync('gcloud',['auth','print-access-token'],{encoding:'utf8'}).trim();
 const headers={'Content-Type':'application/json',Authorization:'Bearer '+token};
 const readDocument=async relative=>{const response=await fetch('https://firestore.googleapis.com/v1/'+documentRoot+'/'+relative.split('/').map(encodeURIComponent).join('/'),{headers});if(response.status===404)return null;if(!response.ok)throw Error('Read failed ('+response.status+'); no corrections committed.');return response.json();};
 const prepared=await prepareCorrections(plan,readDocument);
 await fs.mkdir('audit-snapshots',{recursive:true});
 await fs.writeFile('audit-snapshots/curriculum-correction-summary.json',JSON.stringify({version:plan.version,mode,...prepared.summary,writeCount:prepared.writes.length},null,2)+'\n');
 // Preserve only the previously public, modified learning fields for rollback; no student/user documents.
 await fs.writeFile('audit-snapshots/curriculum-correction-rollback.json',JSON.stringify({version:plan.version,documents:prepared.rollback},null,2)+'\n');
 console.log('Validated correction plan:',JSON.stringify(prepared.summary),'writes:',prepared.writes.length);
 if(mode==='validate')return;
 const response=await fetch(`https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents:commit`,{method:'POST',headers,body:JSON.stringify({writes:prepared.writes})});
 if(!response.ok)throw Error('Atomic correction commit failed ('+response.status+'); original data remains unchanged.');
 const result=await response.json();if(result.writeResults?.length!==prepared.writes.length)throw Error('Unexpected write result count; inspect commit before repeating.');
 // Verify precisely the fields written; never touch or regrade student work.
 for(const write of prepared.writes){const relative=write.update.name.slice(documentRoot.length+1);const actual=await readDocument(relative);const values=plain(actual);for(const [key,value]of Object.entries(write.update.fields))if(!same(values[key],decode(value)))throw Error('Post-write verification failed: '+relative+' / '+key);}
 await fs.writeFile('audit-snapshots/curriculum-correction-result.json',JSON.stringify({version:plan.version,verified:true,commitTime:result.commitTime,...prepared.summary,writeCount:prepared.writes.length},null,2)+'\n');
 console.log('All correction writes verified. Student submissions and scores were not accessed.');
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(error=>{console.error('::error::'+String(error.message).replace(/%/g,'%25').replace(/\r/g,'%0D').replace(/\n/g,'%0A'));process.exitCode=1;});
