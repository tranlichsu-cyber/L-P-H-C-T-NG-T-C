import {collection,getDocs,query,where,or,type Firestore,type Query} from 'firebase/firestore';
async function readUnion(requests:Query[],fallback?:Query[]){
 let snapshots;
 try{snapshots=await Promise.all(requests.map(q=>getDocs(q)));}
 catch(error){
  // Older deployments can require an index for a union; never retry quota or permission failures.
  if(!fallback||(error as {code?:string}).code!=='failed-precondition')throw error;
  snapshots=await Promise.all(fallback.map(q=>getDocs(q)));
 }
 return {docs:[...new Map(snapshots.flatMap(s=>s.docs).map(d=>[d.id,d])).values()]};
}
export async function loadVisibleClasses(firestore:Firestore,uid:string,isAdmin:boolean){
 const base=collection(firestore,'classes');if(isAdmin)return readUnion([base]);
 const owned=where('teacherId','==',uid),shared=where('coTeacherIds','array-contains',uid);
 return readUnion([query(base,or(owned,shared))],[query(base,owned),query(base,shared)]);
}
export async function loadVisibleQuizzes(firestore:Firestore,uid:string,isAdmin:boolean,teamIds:string[]){
 const base=collection(firestore,'quizzes');if(isAdmin)return readUnion([base]);
 const owned=where('teacherId','==',uid),school=where('visibility','==','SCHOOL');
 const clauses=[owned,school],requests:Query[]=[],fallback=[query(base,owned),query(base,school)];
 const teams=[...new Set(teamIds)];
 if(teams.length&&teams.length<=28)clauses.push(where('teamId','in',teams));
 requests.push(query(base,or(...clauses)));
 for(let i=0;i<teams.length;i+=30){const q=query(base,where('teamId','in',teams.slice(i,i+30)));fallback.push(q);if(teams.length>28)requests.push(q);}
 return readUnion(requests,fallback);
}
