import {useMemo} from 'react';
import {sanitizeWorksheetHtml} from '../../services/worksheets/wordImport';
export function WordDocument({html}:{html:string}){
 const clean=useMemo(()=>sanitizeWorksheetHtml(html),[html]);
 return <div aria-label="Nội dung phiếu Word" className="worksheet-document bg-white text-slate-900 rounded-xl p-4 sm:p-6 overflow-x-auto select-text" dangerouslySetInnerHTML={{__html:clean}}/>;
}
