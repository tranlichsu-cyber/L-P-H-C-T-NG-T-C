import content from '../../data/mindmaps/grade4.json';
import {curriculumText, grade4Curriculum} from './grade4';
export const lessonMaps = content.maps;
export type LessonMap = typeof lessonMaps[number];
export const mapSubjects = ['Toán','Tiếng Việt','Khoa học','Lịch sử và Địa lí'];
export const languageSections = ['Đọc hiểu','Luyện từ và câu','Tập làm văn'];
export const mapBookTitle = (id:string) => grade4Curriculum.books[id as keyof typeof grade4Curriculum.books].title;
export function filterLessonMaps(subject:string,section:string,book:string,search:string){
 const term=curriculumText(search);
 return lessonMaps.filter(m=>(!subject||m.subject===subject)&&(!section||m.section===section)&&(!book||m.book===book)&&(!term||curriculumText([m.title,m.subject,m.section,m.number?`Bài ${m.number}`:'',m.week?`Tuần ${m.week}`:'',mapBookTitle(m.book)].join(' ')).includes(term)));
}
