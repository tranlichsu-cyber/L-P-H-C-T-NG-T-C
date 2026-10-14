export const historyTopics={SITE:'Di tích lịch sử',PERSON:'Nhân vật lịch sử',EVENT:'Sự kiện lịch sử'};
export type HistoryTopic=keyof typeof historyTopics;
export interface ArticleSection {title:string;paragraphs:string[]}

export function parseArticle(text:string):ArticleSection[]{
 const sections:ArticleSection[]=[];
 for(const block of text.replace(/\r\n?/g,'\n').split(/\n\s*\n/).map(s=>s.trim()).filter(Boolean)){
  // Old heritage entries put a heading and its first paragraph in the same block.
  for(const part of block.split(/\n(?=#{1,3}\s)/)){
   const match=part.match(/^#{1,3}\s+([^\n]+)(?:\n([\s\S]*))?$/);
   if(match){sections.push({title:match[1].trim(),paragraphs:match[2]?.trim()?[match[2].trim()]:[]});}
   else {if(!sections.length)sections.push({title:'Mở đầu',paragraphs:[]});sections.at(-1)!.paragraphs.push(part);}
  }
 }
 return sections;
}
export function inferHistoryTopic(title:string):HistoryTopic{
 if(/di tích|đền|chùa|đình|lán|hang |mái đá|ATK|căng |Núi Văn|Núi Võ/i.test(title))return 'SITE';
 if(/Lý Bí|Lý Nam Đế|Dương Tự Minh|Lưu Nhân Chú|Đỗ Cận|Đội Cấn|Lương Ngọc Quyến|Lý Tự Trọng|Hồ Đề|Hồ Chí Minh|Võ Nguyên Giáp/i.test(title))return 'PERSON';
 return 'EVENT';
}
export function presentationTemplate(topic:HistoryTopic):string{
 const core={SITE:['Vị trí và tên gọi','Bối cảnh hình thành','Nhân vật và sự kiện gắn với di tích','Không gian, công trình và dấu tích','Giá trị lịch sử và bảo tồn'],PERSON:['Tên gọi, quê hương và thời đại','Cuộc đời và quá trình hoạt động','Đóng góp và những dấu mốc','Nhân vật trong ký ức địa phương'],EVENT:['Thời gian, địa điểm và bối cảnh','Nguyên nhân và lực lượng tham gia','Diễn biến theo trình tự thời gian','Kết quả và ý nghĩa lịch sử']}[topic];
 return ['Mở đầu',...core,'Kết luận','Câu hỏi tìm hiểu'].map(title=>'# '+title+'\n\n').join('\n');
}
