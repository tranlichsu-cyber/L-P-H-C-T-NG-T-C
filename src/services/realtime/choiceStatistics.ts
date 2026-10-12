// Students submit option text; older submissions may contain A/B/C/D keys.
export function choiceIndex(options: string[], answer: string | undefined, type: string): number {
 if(typeof answer !== 'string')return -1;
 const normalized=(value:string)=>value.trim().normalize('NFC').toLocaleLowerCase('vi-VN');
 const exact=options.findIndex(option=>normalized(option)===normalized(answer));
 if(exact!==-1)return exact;
 if(type==='MULTIPLE_CHOICE' && /^[A-D]$/i.test(answer.trim())){
  const index=answer.trim().toUpperCase().charCodeAt(0)-65;
  return index<options.length?index:-1;
 }
 return -1;
}
export function countChoices(options: string[], submissions: {answer:string}[], type:string): number[] {
 const counts=options.map(()=>0);
 submissions.forEach(sub=>{const index=choiceIndex(options,sub.answer,type);if(index>=0)counts[index]++;});
 return counts;
}
