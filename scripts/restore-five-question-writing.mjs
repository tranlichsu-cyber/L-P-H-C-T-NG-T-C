import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {stable} from './apply-curriculum-corrections.mjs';
import {deletionPlan} from './remove-five-question-writing.mjs';

const root='projects/lop-hoc-tuong-tac-a62a5/databases/(default)/documents';
export function validateRecovery(backup){
 if(backup.version!=='remove-five-writing-20261016'||!Array.isArray(backup.documents))throw Error('Unexpected recovery format.');
 const publicDocs=backup.documents.filter(doc=>doc.name.startsWith(root+'/selfPracticeQuizzes/'));
 const groups=backup.documents.filter(doc=>/^quizzes\/[^/]+$/.test(doc.name.slice(root.length+1))).map(doc=>({doc,questions:backup.documents.filter(q=>q.name.startsWith(doc.name+'/questions/'))}));
 const checked=deletionPlan(publicDocs,groups);
 if(checked.documents.length!==backup.documents.length||checked.summary.publicCopies!==53||checked.summary.sourceQuizzes!==35||checked.summary.sourceQuestions!==175)throw Error('Recovery does not match the verified deletion (53 public copies, 35 quizzes, 175 questions).');
 return checked.documents;
}
export async function prepareRestore(documents,read){
 const writes=[];
 for(const doc of documents){
  const current=await read(doc.name);
  if(current){if(stable(current.fields)!==stable(doc.fields))throw Error('An existing document differs from backup; stopped without overwriting.');continue;}
  writes.push({update:{name:doc.name,fields:doc.fields},currentDocument:{exists:false}});
 }
 return writes;
}
async function main(){
 const file=process.argv[2];if(!file)throw Error('Missing recovery file.');
 const documents=validateRecovery(JSON.parse(await fs.readFile(file,'utf8')));
 const token=execFileSync('gcloud',['auth','print-access-token'],{encoding:'utf8'}).trim();
 const headers={'Content-Type':'application/json',Authorization:'Bearer '+token};
 const read=async name=>{const response=await fetch('https://firestore.googleapis.com/v1/'+name,{headers});if(response.status===404)return null;if(!response.ok)throw Error('Recovery read failed: '+response.status);return response.json();};
 const writes=await prepareRestore(documents,read);
 if(writes.length){
  const response=await fetch('https://firestore.googleapis.com/v1/'+root+':commit',{method:'POST',headers,body:JSON.stringify({writes})});
  if(!response.ok)throw Error('Atomic recovery failed: '+response.status);
  const result=await response.json();if(result.writeResults?.length!==writes.length)throw Error('Unexpected recovery result count.');
 }
 for(const doc of documents){const actual=await read(doc.name);if(!actual||stable(actual.fields)!==stable(doc.fields))throw Error('Recovery verification failed.');}
 const result={verified:true,recoveryRun:'38908158068',publicCopies:53,sourceQuizzes:35,sourceQuestions:175,restoredDocuments:writes.length,alreadyIdentical:documents.length-writes.length};
 await fs.writeFile(file+'.restored.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(error=>{console.error(error.message);process.exitCode=1;});
