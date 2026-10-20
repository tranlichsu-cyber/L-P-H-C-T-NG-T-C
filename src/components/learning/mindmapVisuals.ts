import {BookOpen,CheckCheck,Clock,FlaskConical,Gem,Heart,Landmark,Leaf,Lightbulb,ListChecks,MapPin,MessageCircle,Mountain,PencilLine,Ruler,Scale,Shapes,ShieldCheck,Sun,Users,Waves,Zap} from 'lucide-react';
import {curriculumText} from '../../services/curriculum/grade4';
export const branchPalette=[
 {line:'#079c65',ink:'#065f46',wash:'#effdf4'},
 {line:'#0784e8',ink:'#075985',wash:'#eff9ff'},
 {line:'#f18b12',ink:'#9a4505',wash:'#fff8e7'},
 {line:'#a34fe0',ink:'#6b21a8',wash:'#fbf2ff'},
];
export type MapArt='terraces'|'dam'|'minerals'|'reading'|'math'|'plants'|'writing'|'heritage'|'water'|'air'|'sound'|'heat'|'food'|'animals'|'fungi'|'geography';
export const artPositions:Record<MapArt,[number,number]>={terraces:[0,0],dam:[100/3,0],minerals:[200/3,0],reading:[100,0],math:[0,100],plants:[100/3,100],writing:[200/3,100],heritage:[100,100],water:[0,0],air:[100/3,0],sound:[200/3,0],heat:[100,0],food:[0,100],animals:[100/3,100],fungi:[200/3,100],geography:[100,100]};
export function mapArt(subject:string,section:string,title:string):MapArt{
 const s=curriculumText(title);
 if(/\bruong\b|bac thang|khai thac tu nhien/.test(s))return 'terraces';
 if(/thuy dien|nha may dien/.test(s))return 'dam';
 if(/khoang san|khai thac mo/.test(s))return 'minerals';
 if(subject==='Toán')return 'math';
 if(section==='Tập làm văn'||section==='Luyện từ và câu')return 'writing';
 if(subject==='Tiếng Việt')return /co cay|khu vuon|cai cay|mua xuan/.test(s)?'plants':'reading';
 if(subject==='Khoa học'){
  if(/nam|moc/.test(s))return 'fungi';
  if(/dinh duong|thuc pham|an uong|suc khoe/.test(s))return 'food';
  if(/dong vat|vat nuoi/.test(s))return 'animals';
  if(/am thanh|tieng on|nguon am|nhac/.test(s))return 'sound';
  if(/nhiet|dan nhiet/.test(s))return 'heat';
  if(/khong khi|\bgio\b/.test(s)||title.toLowerCase().includes('bão'))return 'air';
  if(/nuoc|chuyen the|chat/.test(s))return 'water';
  return 'plants';
 }
 if(/ban do|luoc do|vi tri|dia hinh|thien nhien|song|dan cu/.test(s))return 'geography';
 return 'heritage';
}
export function lessonArt(subject:string,section:string,title:string,branchTitle?:string):MapArt{
 return mapArt(subject,section,branchTitle?title+' '+branchTitle:title);
}
export const scienceArt=new Set<MapArt>(['water','air','sound','heat','food','animals','fungi','geography']);
export function branchIcon(title:string,subject:string){
 const s=curriculumText(title);
 if(/phan bo|vi tri|dia diem|noi chon|dia phuong/.test(s))return MapPin;
 if(/thuy dien|dien/.test(s))return Zap;
 if(/khoang san|khai thac mo|mo quang/.test(s)&&subject==='Lịch sử và Địa lí')return Gem;
 if(/ruong|dia hinh|vung cao/.test(s))return Mountain;
 if(/nhan vat|dan cu|con nguoi|hai nguoi|cong dong/.test(s))return Users;
 if(/nuoc|song|bien|am thanh/.test(s))return Waves;
 if(/an toan|bao ve|phong tranh|bao ton/.test(s))return ShieldCheck;
 if(/thong diep|tinh cam|bai hoc|yeu thuong/.test(s))return Heart;
 if(/quy tac|cach tinh|trinh tu|ke hoach|sap xep/.test(s))return ListChecks;
 if(/vi du|van dung|thuc hanh/.test(s))return Lightbulb;
 if(/kiem tra|sua|gin giu/.test(s))return CheckCheck;
 if(/thoi gian|mua|dau moc/.test(s))return Clock;
 if(/so sanh|khoi luong/.test(s))return Scale;
 if(/do luong|don vi|goc/.test(s))return Ruler;
 if(/hinh|phan so|so va/.test(s))return Shapes;
 if(/cay|thuc vat|moi truong|rung/.test(s))return Leaf;
 if(/anh sang|nhiet/.test(s))return Sun;
 if(/lich su|di tich|di san/.test(s))return Landmark;
 if(/tu|cau|loi|dau/.test(s))return MessageCircle;
 return subject==='Toán'?Shapes:subject==='Khoa học'?FlaskConical:subject==='Lịch sử và Địa lí'?Landmark:subject==='Tiếng Việt'?PencilLine:BookOpen;
}
const writingTitles=['Đoạn văn & ý kiến của em','Đoạn văn nêu ý kiến','Sửa đoạn văn & báo cáo nhóm','Báo cáo thảo luận nhóm','Thuật lại một sự việc','Thuật sự việc & kể chuyện','Mở bài, kết bài & dàn ý kể chuyện','Viết và sửa bài kể chuyện','Ôn tập giữa học kì I','Đoạn văn tưởng tượng','Viết và sửa đoạn tưởng tượng','Hướng dẫn một công việc','Viết đơn','Miêu tả con vật','Đoạn tả con vật & dàn ý','Viết và sửa bài tả con vật','Viết thư','Ôn tập cuối học kì I','Tình cảm với người gần gũi','Tình cảm với người & nhân vật','Tình cảm với nhân vật','Hướng dẫn dùng sản phẩm','Kể lại một câu chuyện','Sửa bài kể chuyện & nêu ý kiến','Sửa đoạn văn & dàn ý sự việc','Thuật lại một sự việc','Ôn tập giữa học kì II','Miêu tả cây cối','Quan sát & tả cây','Mở bài, kết bài & dàn ý tả cây','Viết và sửa bài tả cây','Đoạn văn tưởng tượng','Tưởng tượng & viết thư','Viết thư & giấy mời','Ôn tập cuối năm'];
const shortTitles:Record<string,string>={
 'science-2':'Nước chuyển thể & vòng tuần hoàn',
 'science-3':'Bảo vệ nguồn nước & làm sạch nước',
 'science-4':'Không khí quanh ta',
 'science-5':'Vai trò của không khí & giữ không khí sạch',
 'historygeo-1':'Phương tiện học Lịch sử & Địa lí',
 'historygeo-3':'Lịch sử & văn hóa địa phương em',
 'historygeo-4':'Thiên nhiên Trung du & miền núi phía Bắc',
 'historygeo-5':'Dân cư & sản xuất ở Trung du, miền núi phía Bắc',
 'historygeo-6':'Văn hóa Trung du & miền núi phía Bắc',
 'historygeo-9':'Dân cư & sản xuất ở Đồng bằng Bắc Bộ',
 'historygeo-10':'Văn hóa Đồng bằng Bắc Bộ',
 'historygeo-15':'Thiên nhiên Bắc Trung Bộ & Nam Trung Bộ',
 'historygeo-16':'Dân cư & sản xuất ở Bắc Trung Bộ, Nam Trung Bộ',
 'historygeo-17':'Văn hóa Bắc Trung Bộ & Nam Trung Bộ',
 'historygeo-18':'Truyền thống yêu nước ở Bắc Trung Bộ, Nam Trung Bộ',
 'historygeo-23':'Dân cư & sản xuất ở Nam Bộ',
 'historygeo-24':'Văn hóa & truyền thống yêu nước Nam Bộ',
 'tv2-25':'Khu bảo tồn Ngô-rông-gô-rô',
};
export function centralTitle(map:{id:string;title:string;week?:number|null}){
 if(map.id.startsWith('writing-')&&map.week)return writingTitles[map.week-1]||map.title;
 return shortTitles[map.id]||map.title;
}
