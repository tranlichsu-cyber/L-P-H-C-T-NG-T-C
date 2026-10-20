import {Link} from 'react-router-dom';
import {BookOpen,Printer} from 'lucide-react';
import {IllustratedMindMap,type VisualLessonMap} from '../components/learning/IllustratedMindMap';

const diagram:VisualLessonMap={id:'northern-nature',title:'Khai thác tự nhiên ở vùng Trung du và miền núi phía Bắc',subject:'Lịch sử và Địa lí',number:5,branches:[
 {title:'Làm ruộng bậc thang',art:'terraces',items:[],groups:[{title:'Vai trò',items:['Tạo bậc phẳng trên sườn núi để trồng lúa nước.','Đảm bảo lương thực; hạn chế phá rừng làm nương.','Tạo cảnh quan đẹp, phát triển du lịch.']},{title:'Ví dụ tiêu biểu',items:['Mù Cang Chải, Sa Pa — Lào Cai.','Hoàng Su Phì — Tuyên Quang.']}]},
 {title:'Xây dựng thủy điện',art:'dam',items:[],groups:[{title:'Vai trò',items:['Phát điện cho sinh hoạt, sản xuất.','Góp phần điều tiết nước, giảm lũ.']},{title:'Sông → nhà máy',items:['Sông Đà → Hòa Bình, Sơn La.','Sông Chảy → Thác Bà.','Sông Gâm → Tuyên Quang.']}]},
 {title:'Khai thác khoáng sản',art:'minerals',items:[],groups:[{title:'Vai trò',items:['Cung cấp nguyên liệu, nhiên liệu cho công nghiệp.']},{title:'Phân bố tiêu biểu',items:['Sắt — Thái Nguyên.','A-pa-tít — Lào Cai.','Đồng — Sơn La.','Bô-xít — Cao Bằng.']}]},
]};
const review = [
 ['Vì sao người dân làm ruộng bậc thang?', 'Để tạo các bậc phẳng trên sườn núi trồng lúa nước, đảm bảo lương thực; đồng thời hạn chế phá rừng làm nương rẫy và phát triển du lịch.'],
 ['Nhà máy thủy điện Thác Bà nằm trên sông nào?', 'Nhà máy thủy điện Thác Bà nằm trên sông Chảy.'],
 ['A-pa-tít được khai thác ở đâu và dùng để làm gì?', 'A-pa-tít được khai thác ở Lào Cai, dùng để sản xuất phân lân.'],
 ['Khi khai thác tự nhiên, chúng ta cần chú ý điều gì?', 'Cần khai thác hợp lí, tiết kiệm, gắn với bảo vệ rừng, đất và nguồn nước.'],
];
export function NorthernNaturePage(){
 return <div className="mindmap-page min-h-screen bg-sky-50 text-slate-900"><header className="border-b bg-white p-4 print:hidden"><nav className="mx-auto flex max-w-[1440px] flex-wrap gap-4 font-bold" aria-label="Điều hướng bài học"><Link className="p-2 text-sky-800 underline" to="/">Trang chủ</Link><Link className="p-2 text-sky-800 underline" to="/tu-luyen">Tự luyện</Link><Link className="p-2 text-sky-800 underline" to="/hoc-lieu/so-do-tu-duy/historygeo-5">Sơ đồ tổng hợp Bài 5</Link><button className="ml-auto flex items-center gap-2 rounded-xl border px-4 py-2" onClick={()=>window.print()}><Printer size={18}/>In / Lưu PDF</button></nav></header>
 <main className="mx-auto max-w-[1440px] space-y-6 p-4 sm:p-8">
 <section className="rounded-3xl bg-sky-900 p-6 text-white sm:p-9 print:bg-white print:text-black"><p className="flex items-center gap-2 font-bold"><BookOpen aria-hidden="true"/>Lịch sử và Địa lí • Lớp 4 • Bài 5</p><h1 className="mt-4 text-2xl font-black leading-snug sm:text-4xl">Một số cách thức khai thác tự nhiên ở vùng Trung du và miền núi phía Bắc</h1><p className="mt-4 text-lg">Sơ đồ kiến thức trong bài “Dân cư và hoạt động sản xuất ở vùng Trung du và miền núi phía Bắc”.</p><p className="mt-3">Em đọc ba nhánh dưới đây, ghi nhớ vai trò và nơi phân bố, rồi thử trả lời câu hỏi cuối bài.</p></section>
 <IllustratedMindMap map={diagram} source="SGK Lịch sử và Địa lí 4, trang 25–27, bản cập nhật 2026" tagline="Khai thác hợp lí, tiết kiệm; bảo vệ rừng, đất và nguồn nước."/>
 <section className="rounded-3xl border bg-white p-5 sm:p-7"><h2 className="text-2xl font-black text-sky-950">Em thử nhớ lại nhé!</h2><p className="mb-4 mt-2">Em tự trả lời trước, sau đó bấm vào từng câu để xem gợi ý.</p>{review.map(([q,a],i)=><details key={q} className="border-t py-4"><summary className="cursor-pointer py-2 font-bold text-sky-900">{i+1}. {q}</summary><p className="mt-3 rounded-xl bg-sky-50 p-4 leading-relaxed">{a}</p></details>)}</section>
 <footer className="rounded-2xl border bg-white p-5 text-sm leading-relaxed text-slate-700"><p className="font-bold">Nguồn học liệu</p><p>SGK Lịch sử và Địa lí 4 — Kết nối tri thức với cuộc sống, bản cập nhật thầy/cô cung cấp dùng từ năm 2026; Bài 5, mục 2, trang 25–27. Nội dung được biên soạn lại để học sinh ôn tập.</p><p className="mt-2">Các địa điểm là ví dụ tiêu biểu, không phải toàn bộ nơi phân bố. Tên sau mũi tên là tên nhà máy thủy điện. Địa danh sử dụng theo bản sách này: Mù Cang Chải và Sa Pa thuộc tỉnh Lào Cai; Hoàng Su Phì thuộc tỉnh Tuyên Quang. Giữ nguyên tên riêng của các nhà máy thủy điện.</p></footer>
 </main></div>;
}
