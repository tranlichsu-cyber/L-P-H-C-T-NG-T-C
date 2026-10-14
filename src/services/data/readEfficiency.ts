// Memory only: no private classroom records are persisted on a shared device.
export function createReadCache<T>(ttlMs:number,now:()=>number=Date.now){
 const values=new Map<string,{value:T;expires:number}>(),pending=new Map<string,Promise<T>>();let generation=0;
 return {
  async read(key:string,load:()=>Promise<T>,refresh=false):Promise<T>{
   const cached=values.get(key);if(!refresh&&cached&&cached.expires>now())return structuredClone(cached.value);
   let request=pending.get(key);
   if(!request){const version=generation;request=Promise.resolve().then(load).then(value=>{if(version===generation)values.set(key,{value:structuredClone(value),expires:now()+ttlMs});return value;});pending.set(key,request);const current=request;void request.finally(()=>{if(pending.get(key)===current)pending.delete(key);}).catch(()=>{});}
   return structuredClone(await request);
  },
  clear(){generation++;values.clear();pending.clear();}
 };
}
export function createSharedSubscriptions<T>(){
 type Consumer={next:(value:T)=>void;error:(error:Error)=>void};
 type Entry={listeners:Set<Consumer>;stop:()=>void;hasValue:boolean;value?:T;lastError?:Error};
 const entries=new Map<string,Entry>();
 return (key:string,start:(next:(value:T)=>void,error:(error:Error)=>void)=>()=>void,next:(value:T)=>void,error:(error:Error)=>void=()=>{})=>{
  let entry=entries.get(key);const consumer={next,error};
  if(!entry){entry={listeners:new Set([consumer]),stop:()=>{},hasValue:false};entries.set(key,entry);const target=entry;
   try{target.stop=start(value=>{target.hasValue=true;target.lastError=undefined;target.value=value;for(const listener of [...target.listeners])listener.next(value);},err=>{target.hasValue=false;target.lastError=err;for(const listener of [...target.listeners])listener.error(err);});}catch(err){entries.delete(key);throw err;}
  }else{entry.listeners.add(consumer);if(entry.lastError)error(entry.lastError);else if(entry.hasValue)next(entry.value as T);}
  const current=entry;return()=>{current.listeners.delete(consumer);if(!current.listeners.size){current.stop();if(entries.get(key)===current)entries.delete(key);}};
 };
}
