import {useState} from 'react';
import {createPortal} from 'react-dom';
import {QRCodeSVG} from 'qrcode.react';
import {cardPayload} from '../../services/qr/cards';
import './qrCards.css';
const button='rounded-xl bg-indigo-700 px-4 py-3 font-bold text-white disabled:opacity-40';
export function QrCardsPrintButton({classId,className,roster}:{classId:string;className:string;roster:{studentId:string;name:string}[]}){
 const [print,setPrint]=useState(false);
 return <><button className={button} disabled={!roster.length} onClick={()=>setPrint(true)}>Xem và in thẻ của lớp ({roster.length})</button>
{print&&createPortal(<div className="qr-print-root"><div className="qr-print-toolbar"><button className={button} onClick={()=>window.print()}>In thẻ / Lưu PDF</button><button className={button} onClick={()=>setPrint(false)}>Đóng bản in</button><p>In khổ A4, tỉ lệ 100%, đen trắng; cắt theo khung. Dùng lại cho cùng học sinh của cùng lớp. Không dùng mã thẻ để đăng nhập.</p></div><div className="qr-sheets">{Array.from({length:Math.ceil(roster.length/2)},(_,page)=><div className="qr-sheet" key={page}>{roster.slice(page*2,page*2+2).map((p,i)=><article className="qr-paper-card" key={p.studentId}><header><strong>{page*2+i+1}. {p.name}</strong><span>{className}</span></header><div className="qr-card-code"><b className="qr-letter qr-a">A</b><b className="qr-letter qr-b">B</b><b className="qr-letter qr-c">C</b><b className="qr-letter qr-d">D</b><QRCodeSVG value={cardPayload(classId,p.studentId)} size={320} marginSize={4} level="M"/></div><p>Đưa chữ em chọn lên trên ↑ • Hướng mã về phía giáo viên</p></article>)}</div>)}</div></div>,document.body)}</>;
}
