import fs from 'node:fs/promises';import ts from 'typescript';
await fs.mkdir('functions/lib/shared',{recursive:true});
for(const [source,target] of [['src/services/practice/grading.ts','grading.mjs'],['src/services/rewards/content.ts','rewards.mjs'],['src/data/traditionQuizzes.ts','tradition.mjs']]){
 const result=ts.transpileModule(await fs.readFile(source,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}});await fs.writeFile('functions/lib/shared/'+target,result.outputText);
}
for(const name of ['index.mjs','points.mjs'])await fs.copyFile('functions/src/'+name,'functions/lib/'+name);
console.log('Built automatic reward function with shared canonical grading and wallet policy.');
