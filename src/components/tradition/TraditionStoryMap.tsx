import {useState} from 'react';
import {MapPinned} from 'lucide-react';
import {CommuneMap} from './CommuneMap';
import {heritageCatalog} from '../../data/heritageCatalog';
import {traditionMapPlaces,normalizeMapText,type TraditionMapPlace} from '../../data/traditionMap';
import {type TraditionMaterial} from '../../services/tradition/TraditionMaterials';
import {MaterialCard} from './MaterialCard';
const normalize=normalizeMapText;
function PlaceStory({place,materials}:{place:TraditionMapPlace;materials:TraditionMaterial[]}){
 const [answer,setAnswer]=useState<number|null>(null);
 const related=materials.filter(m=>place.keywords.some(word=>normalize(m.title).includes(normalize(word))));
 return <article id="map-place-story" tabIndex={-1} className="rounded-2xl border-2 border-sky-100 bg-white p-4 space-y-4" aria-label={'Câu chuyện '+place.name}>
  <div><p className="font-bold text-sky-700 text-sm">{place.name} • {place.theme}</p><h3 className="font-black text-xl mt-1">{place.title}</h3><p className="text-sm text-slate-600 mt-2">{place.region}</p></div>
  {place.image && <figure><img src={place.image.url} alt={place.image.caption} loading="lazy" referrerPolicy="no-referrer" className="w-full rounded-xl max-h-60 object-contain bg-slate-50"/><figcaption className="text-xs text-slate-600 mt-2">{place.image.caption}</figcaption></figure>}
  <p className="leading-7">{place.story}</p><div className="bg-emerald-50 rounded-xl p-3"><h4 className="font-bold text-emerald-900">Nét văn hóa quê hương</h4><p className="mt-2 leading-7">{place.culture}</p></div>
  <div className="bg-amber-50 p-3 rounded-xl"><h4 className="font-bold">Em thử làm hướng dẫn viên</h4><p className="mt-2 leading-7">{place.task}</p></div>
  <fieldset className="border rounded-xl p-3"><legend className="font-bold px-1">Một câu hỏi khám phá</legend><p className="font-semibold mb-3">{place.question.text}</p><div className="space-y-2">{place.question.options.map((option,index)=><label key={option} className={`flex gap-2 cursor-pointer min-h-12 items-center rounded-xl border-2 px-3 py-2 ${answer===index?'bg-sky-50 border-sky-700':'border-slate-200'}`}><input type="radio" name={'map-question-'+place.id} checked={answer===index} onChange={()=>setAnswer(index)}/><span>{String.fromCharCode(65+index)}. {option}</span></label>)}</div>{answer!==null && <p role="status" className={`mt-3 rounded-xl p-3 ${answer===place.question.correct?'bg-emerald-50 text-emerald-900':'bg-amber-50 text-amber-950'}`}>{answer===place.question.correct?'Đúng rồi! ':'Em thử lại nhé. '}{place.question.explanation}</p>}</fieldset>
  {related.length>0 && <details><summary className="font-bold cursor-pointer py-3 text-sky-800">Tư liệu, hình ảnh và video liên quan ({related.length})</summary><div className="space-y-3 mt-3">{related.map(item=><MaterialCard key={item.id} item={item} compact/>)}</div></details>}
  <details><summary className="text-sm font-semibold cursor-pointer py-2">Nguồn thông tin đã đối chiếu</summary><ul className="mt-2 space-y-2 text-sm">{place.sources.map(source=><li key={source.url}><a className="underline text-sky-800" href={source.url} target="_blank" rel="noopener noreferrer">{source.title} ↗</a></li>)}</ul></details>
 </article>;
}
function AreaStory({place,materials,initialSiteId}:{place:TraditionMapPlace;materials:TraditionMaterial[];initialSiteId:string}){
 const [siteId,setSiteId]=useState(initialSiteId);
 const active=place.sites?.find(site=>site.id===siteId);
 const story=active?{...place,...active,id:place.id+'-'+active.id,name:active.address,sites:undefined}:place;
 return <div className="min-w-0 space-y-3">{place.sites?.length && <section className="bg-amber-50 border border-amber-200 rounded-2xl p-3"><h3 className="font-bold">Chọn địa điểm tại {place.name}</h3><div className="flex flex-wrap gap-2 mt-3"><button aria-pressed={!active} onClick={()=>setSiteId('')} className={`min-h-11 border-2 rounded-xl px-3 py-2 text-sm font-bold ${!active?'bg-sky-700 text-white border-sky-700':'bg-white border-sky-100'}`}>Tổng quan khu vực</button>{place.sites.map(site=><button key={site.id} aria-pressed={siteId===site.id} onClick={()=>setSiteId(site.id)} className={`min-h-11 border-2 rounded-xl px-3 py-2 text-sm font-bold ${siteId===site.id?'bg-sky-700 text-white border-sky-700':'bg-white border-sky-100 hover:bg-sky-50'}`}>{site.title}</button>)}</div></section>}
 <PlaceStory key={story.id} place={story} materials={materials}/></div>;
}
export function TraditionStoryMap({
 materials,
 selectedPlaceName,
 onSelectPlace,
 onOpenCatalog,
}:{
 materials:TraditionMaterial[];
 selectedPlaceName?:string;
 onSelectPlace?:(name:string)=>void;
 onOpenCatalog?:()=>void;
}){
 const [internalSelectedName,setInternalSelectedName]=useState('');
 const selectedName=selectedPlaceName!==undefined?selectedPlaceName:internalSelectedName;
 const selected=traditionMapPlaces.find(p=>normalize(p.name)===normalize(selectedName));
 const records=heritageCatalog.filter(r=>normalize(r.commune)===normalize(selectedName));
 const pick=(name:string)=>{
  if(onSelectPlace){
   onSelectPlace(name);
  }else{
   setInternalSelectedName(name);
  }
  if(window.innerWidth<1024)requestAnimationFrame(()=>{const story=document.getElementById('map-place-story');story?.scrollIntoView({block:'start'});story?.focus({preventScroll:true});});
 };
 return <section id="tradition-map" className="scroll-mt-4 space-y-4" aria-labelledby="tradition-map-title">
 <div className="bg-sky-100 rounded-2xl p-4"><h2 id="tradition-map-title" className="font-black text-2xl text-sky-950 flex items-center gap-2"><MapPinned aria-hidden="true"/>Bản đồ khám phá quê hương</h2><p className="mt-2 leading-7">Thái Nguyên sau sáp nhập • 92 xã, phường. Em chỉ vào từng khối để xem tên và thông tin ngắn; nhấp hoặc chạm để mở câu chuyện.</p></div>
 <div className="grid lg:grid-cols-2 gap-4 items-start"><CommuneMap selected={selectedName} onSelect={pick}/>
 {selected?<AreaStory key={selected.id} place={selected} materials={materials} initialSiteId=""/>:<article id="map-place-story" tabIndex={-1} className="rounded-2xl border-2 border-sky-100 bg-white p-4 space-y-4" aria-label={selectedName?'Thông tin '+selectedName:'Hướng dẫn khám phá'}><h3 className="font-black text-xl">{selectedName||'Em tự khám phá quê hương'}</h3><p>{selectedName?'Địa phương thuộc tỉnh Thái Nguyên.':'Em hãy tìm một xã hoặc phường trên bản đồ rồi nhấp vào khối đó. Có thể phóng to để chọn các vùng nhỏ.'}</p>{records.length?records.map(r=><section key={r.id} className="rounded-xl bg-amber-50 p-3"><h4 className="font-bold">{r.name}</h4><p className="text-sm my-2">{r.address}, tỉnh Thái Nguyên.</p><p className="leading-7">{r.summary}</p><a className="inline-block mt-2 underline text-sky-800 text-sm" href={r.sourceUrl} target="_blank" rel="noopener noreferrer">Đọc nguồn thông tin ↗</a></section>):selectedName&&<p className="bg-sky-50 rounded-xl p-3">Tư liệu di tích và văn hóa của địa phương này đang được bổ sung. Em có thể khám phá các vùng khác hoặc {onOpenCatalog?<button type="button" onClick={onOpenCatalog} className="underline text-sky-800 font-bold">chuyển sang tra cứu di tích</button>:<a href="#heritage-catalog" className="underline text-sky-800 font-bold">chuyển sang tra cứu di tích</a>}.</p>}</article>}</div>
 </section>;
}
