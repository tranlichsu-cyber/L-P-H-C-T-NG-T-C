import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {decode} from './apply-curriculum-corrections.mjs';

const root='projects/lop-hoc-tuong-tac-a62a5/databases/(default)/documents';
const subject='Tập làm văn';
const plain=doc=>decode({mapValue:{fields:doc.fields||{}}});
export function deletionPlan(publicDocs,sourceGroups){
 const documents=[],summary={publicCopies:0,sourceQuizzes:0,sourceQuestions:0,retainedPublicCopies:0,retainedSourceQuizzes:0,titles:[]};
 const add=doc=>{if(!doc.updateTime||!doc.name.startsWith(root+'/'))throw Error('Invalid document precondition.');documents.push(doc);};
 for(const doc of publicDocs){
  const value=plain(doc);
  if(value.subject!==subject||!Array.isArray(value.questions))throw Error('Unexpected public document.');
  if(value.questions.length!==5){summary.retainedPublicCopies++;continue;}
  if(!/^selfPracticeQuizzes\/[^/]+$/.test(doc.name.slice(root.length+1)))throw Error('Invalid public path.');
  add(doc);summary.publicCopies++;summary.titles.push({source:'selfPracticeQuizzes',title:value.title});
 }
 for(const {doc,questions} of sourceGroups){
  const value=plain(doc);
  if(value.subject!==subject||!/^quizzes\/[^/]+$/.test(doc.name.slice(root.length+1)))throw Error('Unexpected source document.');
  if(questions.length!==5){summary.retainedSourceQuizzes++;continue;}
  if(value.questionCount!==5)throw Error('Question count metadata differs; stop for review.');
  for(const question of questions){if(!question.name.startsWith(doc.name+'/questions/')||question.name.slice(doc.name.length+11).includes('/'))throw Error('Unexpected question path.');add(question);summary.sourceQuestions++;}
  add(doc);summary.sourceQuizzes++;summary.titles.push({source:'quizzes',title:value.title});
 }
 if(documents.length>500||new Set(documents.map(doc=>doc.name)).size!==documents.length)throw Error('Unsafe atomic write count.');
 return {version:'remove-five-writing-20261016',documents,summary};
}
async function main(){
 const mode=process.argv[2],file=process.argv[3];
 if(!['prepare','apply'].includes(mode)||!file)throw Error('Expected prepare/apply and backup path.');
 const token=execFileSync('gcloud',['auth','print-access-token'],{encoding:'utf8'}).trim();
 const headers={'Content-Type':'application/json',Authorization:'Bearer '+token};
 async function request(path,body){const response=await fetch('https://firestore.googleapis.com/v1/'+path,{method:body?'POST':'GET',headers,...(body?{body:JSON.stringify(body)}:{})});if(!response.ok)throw Error('Firestore request failed: '+response.status);return response.json();}
 if(mode==='prepare'){
  const query=async collection=>(await request(root+':runQuery',{structuredQuery:{from:[{collectionId:collection}],where:{fieldFilter:{field:{fieldPath:'subject'},op:'EQUAL',value:{stringValue:subject}}}}})).filter(row=>row.document).map(row=>row.document);
  const publicDocs=await query('selfPracticeQuizzes'),sources=await query('quizzes'),groups=[];
  for(const doc of sources){
   // Count actual questions, never infer deletion from stale metadata alone.
   const questions=[];let pageToken;
   do{const page=await request(doc.name+'/questions?pageSize=300'+(pageToken?'&pageToken='+encodeURIComponent(pageToken):''));questions.push(...(page.documents||[]));pageToken=page.nextPageToken;}while(pageToken);
   groups.push({doc,questions});
  }
  const plan=deletionPlan(publicDocs,groups);await fs.writeFile(file,JSON.stringify(plan,null,2)+'\n');console.log(JSON.stringify(plan.summary));return;
 }
 const plan=JSON.parse(await fs.readFile(file,'utf8'));
 if(plan.version!=='remove-five-writing-20261016')throw Error('Wrong deletion plan.');
 // Rebuild the plan from the saved exact documents before committing.
 const publicDocs=plan.documents.filter(doc=>doc.name.startsWith(root+'/selfPracticeQuizzes/'));
 const sourceGroups=plan.documents.filter(doc=>/^quizzes\/[^/]+$/.test(doc.name.slice(root.length+1))).map(doc=>({doc,questions:plan.documents.filter(q=>q.name.startsWith(doc.name+'/questions/'))}));
 const checked=deletionPlan(publicDocs,sourceGroups);
 if(checked.documents.length!==plan.documents.length)throw Error('Backup contains unexpected documents.');
 for(const group of sourceGroups){
  const current=await request(group.doc.name+'/questions?pageSize=300');
  const expected=new Map(group.questions.map(doc=>[doc.name,doc.updateTime]));
  if(current.nextPageToken||current.documents?.length!==5||current.documents.some(doc=>expected.get(doc.name)!==doc.updateTime))throw Error('Source questions changed since backup; no deletion committed.');
 }
 const writes=checked.documents.map(doc=>({delete:doc.name,currentDocument:{updateTime:doc.updateTime}}));
 if(writes.length){
  const result=await request(root+':commit',{writes});if(result.writeResults?.length!==writes.length)throw Error('Unexpected delete result.');
  for(const doc of checked.documents){const response=await fetch('https://firestore.googleapis.com/v1/'+doc.name,{headers});if(response.status!==404)throw Error('Deletion verification failed: '+response.status);}
 }
 const result={verified:true,...plan.summary,deletedDocuments:writes.length};
 await fs.writeFile(file+'.result.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(error=>{console.error(error.message);process.exitCode=1;});
