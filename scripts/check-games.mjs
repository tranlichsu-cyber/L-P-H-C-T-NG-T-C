import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import ts from 'typescript';
const compile=s=>ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const load=s=>import('data:text/javascript;base64,'+Buffer.from(s).toString('base64'));
const policy=await load(compile(await fs.readFile('src/services/realtime/gamePolicy.ts','utf8')));
const {buildInitialGameSession}=await load(compile(await fs.readFile('src/services/realtime/gameHelpers.ts','utf8')));
const people=Array.from({length:5},(_,i)=>({studentId:'s'+i,name:'Em '+i}));
assert.throws(()=>buildInitialGameSession('r','TEAM_RACE',{teamCount:4},['q1'],people.slice(0,2)));
assert.throws(()=>buildInitialGameSession('r','QUICK_ANSWER',{},[],people));
const doors=buildInitialGameSession('r','MYSTERY_DOOR',{doorCount:9},['q1','q2','q1'],people).doors;assert.equal(doors.length,2);assert.equal(new Set(doors.map(d=>d.questionId)).size,2);
const boxes=buildInitialGameSession('r','KNOWLEDGE_BOX',{boxCount:12},['q1','q2','q3'],people).boxes;assert(!boxes.some(b=>b.type==='BONUS_POINTS'));assert.equal(new Set(boxes.filter(b=>b.type==='QUESTION').map(b=>b.questionId)).size,3);
const unlimited=policy.openGameRound(buildInitialGameSession('r','QUICK_ANSWER',{timerSeconds:0},['q1'],people),'q1',1000);assert.equal(unlimited.roundDeadlineAt,0);assert(policy.gameAcceptsAnswer(unlimited,'q1',1e9));assert(!policy.gameAcceptsAnswer(unlimited,'q2'));
const timed=policy.openGameRound({...unlimited,settings:{timerSeconds:30}},'q1',1000);assert.equal(timed.roundDeadlineAt,31000);const paused=policy.toggleGamePause({...timed,status:'RUNNING'},11000);assert.equal(paused.roundPausedRemainingMs,20000);assert(!policy.gameAcceptsAnswer(paused,'q1',12000));const resumed=policy.toggleGamePause(paused,100000);assert.equal(resumed.roundDeadlineAt,120000);assert(policy.gameAcceptsAnswer(resumed,'q1',119999));assert(!policy.gameAcceptsAnswer(resumed,'q1',120000));
for(let n=1;n<=40;n++)for(let i=0;i<n;i++){const rotation=policy.wheelStopRotation(21.3,i,n);const angle=((1.5*Math.PI-rotation)%(2*Math.PI)+2*Math.PI)%(2*Math.PI);assert.equal(Math.floor(angle/(2*Math.PI/n)),i);assert(rotation>21.3+Math.PI*8);}
const teams={a:{id:'a',name:'A',memberIds:['s0','s1','s2'],displayOrder:0},b:{id:'b',name:'B',memberIds:['s3','s4'],displayOrder:1}};
const submissions=['s0','s1','s3'].map(studentId=>({questionId:'q1',studentId,isCorrect:true}));const result=policy.teamResults(teams,[...submissions,submissions[0]]);assert.equal(result[0].score,67);assert.equal(result[1].score,50);assert.equal(result[0].correct,2);assert.equal(policy.teamResults(teams,[{questionId:'q1',studentId:'s0'}])[0].possible,0);
// Exercise actual mock service methods, rather than a second implementation of the game lifecycle.
let database={rooms:{r:{id:'r',status:'ACTIVE',teacherId:'teacher',participants:Object.fromEntries(people.map(p=>[p.studentId,p])),liveQuestions:{q1:{id:'q1',status:'READY'},q2:{id:'q2',status:'READY'}},submissions:{},scores:{},scoreEvents:{}}},privateQuestions:{}};
globalThis.__gameFixture={...policy,buildInitialGameSession,loadMockDatabase:()=>structuredClone(database),saveMockDatabase:value=>{database=structuredClone(value)},eventBus:{publish:()=>{}},getRoomById:()=>{},getRoomByCode:()=>{}};
const serviceSource=compile(await fs.readFile('src/services/realtime/MockRealtimeService.ts','utf8')).replace(/^import .*;\n/gm,'');
const {MockRealtimeService}=await load('const {openGameRound,toggleGamePause,gameAcceptsAnswer,buildInitialGameSession,loadMockDatabase,saveMockDatabase,eventBus,getRoomById,getRoomByCode}=globalThis.__gameFixture;\n'+serviceSource);
const service=new MockRealtimeService();service.createGameSession('r','QUICK_ANSWER',{timerSeconds:0},['q1','q2']);service.startGameSession('r');service.openQuestion('r','q1');assert.equal(database.rooms.r.activeGame.roundDeadlineAt,0);
const deadlineBefore=database.rooms.r.activeGame.roundDeadlineAt;service.openQuestion('r','q1');assert.equal(database.rooms.r.activeGame.roundDeadlineAt,deadlineBefore);
service.pauseGameSession('r');assert.equal(service.openQuestion('r','q2'),false);assert.equal(service.submitAnswer({roomId:'r',questionId:'q1',studentId:'s0',answer:'A'}).success,false);service.pauseGameSession('r');assert(service.submitAnswer({roomId:'r',questionId:'q1',studentId:'s0',answer:'A'}).success);
service.openQuestion('r','q2');assert.equal(database.rooms.r.liveQuestions.q1.status,'CLOSED');service.finishGameSession('r');assert.equal(database.rooms.r.liveQuestions.q2.status,'CLOSED');assert(!service.submitAnswer({roomId:'r',questionId:'q2',studentId:'s1',answer:'A'}).success);
service.addManualScore('r','s0','Em 0',10,'Phát biểu','wheel-once');service.addManualScore('r','s0','Em 0',10,'Phát biểu','wheel-once');assert.equal(database.rooms.r.scores.s0.score,10);assert.equal(Object.keys(database.rooms.r.scoreEvents).length,1);
console.log('PASS games: unique doors/questions, symbolic gifts, team fairness, exact wheel alignment, unlimited/deadline/pause/resume, actual mock lifecycle and idempotent oral reward');
