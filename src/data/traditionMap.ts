export const traditionMapSource={
 image:'https://storage-vnportal.vnpt.vn/gov-tnn/1/FileQuanTriTinTuc/image.639239801848581878.jpg',
 url:'https://thainguyen.gov.vn/dieu-kien-tu-nhien/dieu-kien-tu-nhien-xa-hoi-tinh-thai-nguyen-291164',
 title:'Cổng thông tin điện tử tỉnh Thái Nguyên • Điều kiện tự nhiên, xã hội • 02/09/2026',
 checked:'13/10/2026',
};
export type MapTheme='Lịch sử'|'Văn hóa'|'Thiên nhiên';
export interface TraditionMapPlace {
 id:string; name:string; region:string; x:number; y:number; theme:MapTheme;
 title:string; story:string; culture:string; task:string; keywords:string[];
 sources:{title:string;url:string}[];
 sites?:TraditionMapSite[];
 image?:{url:string;caption:string};
 question:{text:string;options:string[];correct:number;explanation:string};
}
export const traditionMapPlaces:TraditionMapPlace[]=[
 {id:'song-cong',name:'Phường Sông Công',region:'Khu vực thành phố Sông Công trước sắp xếp',x:52.2,y:88.9,theme:'Văn hóa',title:'Sông Công – quê hương gần gũi',
 story:'Phường Sông Công được thành lập từ ba phường Thắng Lợi, Phố Cò và Cải Đan. Những tên gọi quen thuộc giúp em nối câu chuyện của quê hương trước đây với địa chỉ hành chính hiện nay.',
 culture:'Quảng trường, công viên và các hoạt động văn nghệ, thể thao là nơi cộng đồng cùng sinh hoạt. Không gian đi bộ tại Quảng trường 1/7 góp phần tạo thêm một điểm gặp gỡ văn hóa của người dân.',task:'Em hãy kể một việc mình có thể làm để giữ công viên hoặc quảng trường sạch, đẹp.',keywords:['Sông Công'],
 sources:[{title:'UBND phường Sông Công: Giới thiệu khái quát (27/08/2025)',url:'https://songcong.thainguyen.gov.vn/ubnd/gioi-thieu-khai-quat-ve-phuong-song-cong-tinh-thai-nguyen-70767'},{title:'Cổng thông tin tỉnh: Phố đi bộ Sông Công (2026)',url:'https://thainguyen.gov.vn/tin-kinh-te/pho-di-bo-song-cong-danh-thuc-nhip-song-do-thi-ve-dem-296528'}],
 question:{text:'Phường Sông Công được thành lập từ nhóm phường nào?',options:['Thắng Lợi, Phố Cò, Cải Đan','Tân Cương, Ba Bể, Nghĩa Tá','Phú Đình, Thần Sa, Vạn Phú','Phan Đình Phùng, Bắc Kạn, Đức Xuân'],correct:0,explanation:'Ba phường Thắng Lợi, Phố Cò và Cải Đan được sắp xếp thành phường Sông Công.'}},
 {id:'phan-dinh-phung',name:'Phường Phan Đình Phùng',region:'Khu vực thành phố Thái Nguyên trước sắp xếp',x:51.4,y:79.5,theme:'Văn hóa',title:'Một chuyến thăm bảo tàng',story:'Bảo tàng Văn hóa các dân tộc Việt Nam ở phường Phan Đình Phùng giới thiệu đời sống và truyền thống của cộng đồng 54 dân tộc Việt Nam. Trang phục, đồ dùng và không gian kiến trúc mở ra nhiều câu chuyện về con người.',culture:'Quan sát hiện vật giúp em nhận ra sự phong phú của văn hóa và biết tôn trọng sự khác biệt. Mỗi đồ vật được gìn giữ trong bảo tàng đều có một câu chuyện cần được lắng nghe.',task:'Chọn một hiện vật em muốn tìm hiểu và đặt một câu hỏi cho người hướng dẫn.',keywords:['Bảo tàng','Quảng trường Võ Nguyên Giáp'],sources:[{title:'Cổng thông tin tỉnh: Phát triển văn hóa Việt Nam (2026)',url:'https://thainguyen.gov.vn/tin-hoat-dong-cua-tinh/thai-nguyen-trien-khai-thuc-hien-nghi-quyet-cua-chinh-phu-ve-phat-trien-van-hoa-viet-nam-259919'}],question:{text:'Bảo tàng Văn hóa các dân tộc Việt Nam giới thiệu văn hóa của bao nhiêu dân tộc?',options:['15 dân tộc','54 dân tộc','77 dân tộc','92 dân tộc'],correct:1,explanation:'Bảo tàng giới thiệu giá trị văn hóa truyền thống của cộng đồng 54 dân tộc Việt Nam.'}},
 {id:'tan-cuong',name:'Xã Tân Cương',region:'Vùng chè Tân Cương và một phần khu vực Sông Công trước sắp xếp',x:45,y:84.5,theme:'Văn hóa',title:'Hương trà và câu chuyện Bá Vân',story:'Tân Cương nổi tiếng với tri thức trồng, chế biến chè và văn hóa thưởng trà. Em có thể tìm hiểu cách người dân chăm sóc cây chè, hái chè và gìn giữ nghề truyền thống.',culture:'Di tích Căng Bá Vân trước đây thuộc xã Bình Sơn, nay thuộc xã Tân Cương. Đây là nơi gắn với cuộc đấu tranh kiên cường của những chiến sĩ cách mạng bị giam cầm.',task:'Em hãy nêu một câu hỏi muốn hỏi nghệ nhân làm chè hoặc người hướng dẫn tại Căng Bá Vân.',keywords:['Tân Cương','Bá Vân'],sources:[{title:'UBND xã Tân Cương: Hành trình thăm Căng Bá Vân (2026)',url:'https://tancuong.thainguyen.gov.vn/chuyen-oi-so/sinh-hoat-chuyen-de-chuong-trinh-hanh-trinh-tham-dia-chi-do-tai-di-tich-lich-su-quoc-gia-cang-ba-van-263638'},{title:'Cổng thông tin tỉnh: Hương sắc trà xuân (2026)',url:'https://thainguyen.gov.vn/tin-anh/khai-mac-le-hoi-truyen-thong-huong-sac-tra-xuan-vung-che-dac-san-tan-cuong-xuan-binh-ngo-nam-2026-249372'}],question:{text:'Theo địa chỉ hiện nay, Căng Bá Vân thuộc xã nào?',options:['Ba Bể','Phú Đình','Tân Cương','Thần Sa'],correct:2,explanation:'Trang thông tin xã Tân Cương xác nhận Căng Bá Vân thuộc xã Bình Sơn trước đây, nay là xã Tân Cương.'}},
 {id:'van-phu',name:'Xã Vạn Phú',region:'Khu vực huyện Đại Từ trước sắp xếp',x:28.2,y:82.4,theme:'Lịch sử',title:'Núi Văn – Núi Võ và lòng biết ơn',story:'Núi Văn – Núi Võ và đền thờ Lưu Nhân Chú là những địa điểm gắn với truyền thống yêu nước của quê hương Vạn Phú. Lưu Nhân Chú là người có nhiều đóng góp trong cuộc khởi nghĩa Lam Sơn.',culture:'Lễ hội Núi Văn – Núi Võ diễn ra vào mùng 4 tháng Giêng âm lịch để tưởng nhớ, tri ân Lưu Nhân Chú. Phần lễ và các hoạt động dân gian cùng nhắc nhở thế hệ sau về đạo lý uống nước nhớ nguồn.',task:'Em hãy nói một lời giới thiệu ngắn về nhân vật được tưởng nhớ tại lễ hội.',keywords:['Núi Văn','Lưu Nhân Chú'],sources:[{title:'Cổng thông tin tỉnh: Lễ hội Núi Văn – Núi Võ (2026)',url:'https://thainguyen.gov.vn/tin-hoat-dong-cua-don-vi/khai-hoi-dinh-den-chua-cau-muoi-va-le-hoi-nui-van-nui-vo-xuan-binh-ngo-2026-248403'}],question:{text:'Lễ hội Núi Văn – Núi Võ tưởng nhớ nhân vật nào?',options:['Dương Tự Minh','Lý Bí','Đội Cấn','Lưu Nhân Chú'],correct:3,explanation:'Lễ hội tại Vạn Phú tri ân công lao của Lưu Nhân Chú, người tham gia khởi nghĩa Lam Sơn.'}},
 {id:'phu-dinh',name:'Xã Phú Đình',region:'Khu vực huyện Định Hóa trước sắp xếp',x:16.8,y:65.3,theme:'Lịch sử',title:'Khuôn Tát – tìm về chiến khu',story:'Xóm Khuôn Tát thuộc xã Phú Đình, gắn với quần thể di tích ATK Định Hóa. Khi tìm hiểu di tích, em được nghe những câu chuyện về cuộc sống và hoạt động trong thời kỳ kháng chiến.',culture:'Những ngôi nhà sàn truyền thống và đời sống của đồng bào Tày, Dao góp phần tạo nên bản sắc nơi đây. Du lịch cộng đồng kết nối việc tìm hiểu lịch sử với trân trọng thiên nhiên và văn hóa.',task:'Khi thăm di tích, em cần làm gì để thể hiện sự tôn trọng?',keywords:['Khuôn Tát','ATK Định Hóa'],sources:[{title:'Cổng thông tin tỉnh: Điểm du lịch cộng đồng Khuôn Tát (28/09/2026)',url:'https://thainguyen.gov.vn/di-tich-danh-lam-thang-canh/diem-du-lich-cong-dong-xom-khuon-tat-296605'}],question:{text:'Xóm Khuôn Tát hiện thuộc xã nào?',options:['Phú Đình','Vạn Phú','Ba Bể','Tân Cương'],correct:0,explanation:'Nguồn của Cổng thông tin tỉnh xác định Khuôn Tát thuộc xã Phú Đình.'}},
 {id:'phu-luong',name:'Xã Phú Lương',region:'Khu vực huyện Phú Lương trước sắp xếp',x:36,y:72.2,theme:'Lịch sử',title:'Đền Đuổm và lễ hội đầu xuân',story:'Đền Đuổm ở xóm Đuổm, xã Phú Lương gắn với danh tướng Dương Tự Minh. Câu chuyện về ông giúp em tìm hiểu truyền thống bảo vệ quê hương và lòng biết ơn người có công.',culture:'Lễ hội đền Đuổm mở vào mùng 6 tháng Giêng âm lịch. Nghi thức rước đất, rước nước gửi gắm ước mong mưa thuận gió hòa, mùa màng tốt tươi.',task:'Em hãy giải thích vì sao đất và nước lại quan trọng với người làm nông.',keywords:['Đuổm','Dương Tự Minh'],sources:[{title:'Cổng thông tin tỉnh: Khai hội đền Đuổm (22/02/2026)',url:'https://thainguyen.gov.vn/thoi-su/khai-hoi-den-duom-xuan-binh-ngo-2026-248479'},{title:'Cổng thông tin tỉnh: Lễ hội đền Đuổm – điểm hẹn đầu xuân',url:'https://thainguyen.gov.vn/tin-anh/le-hoi-den-duom-diem-hen-tam-linh-dau-xuan-248502'}],question:{text:'Đền Đuổm gắn với danh tướng nào?',options:['Lưu Nhân Chú','Dương Tự Minh','Lý Bí','Lương Ngọc Quyến'],correct:1,explanation:'Đền Đuổm gắn với danh tướng Dương Tự Minh, được Nhân dân tưởng nhớ tại lễ hội.'}},
 {id:'than-sa',name:'Xã Thần Sa',region:'Khu vực huyện Võ Nhai trước sắp xếp',x:60,y:63.5,theme:'Lịch sử',title:'Dấu chân con người thời tiền sử',story:'Hang Phiêng Tung và mái đá Ngườm tại xã Thần Sa lưu giữ dấu tích của con người thời đại đồ đá cũ. Công cụ đá và các tầng văn hóa giúp nhà khảo cổ tìm hiểu cuộc sống rất xa xưa.',culture:'Di sản khảo cổ là một phần ký ức của quê hương. Giữ nguyên hiện vật và nơi phát hiện giúp các nhà nghiên cứu hiểu được câu chuyện lịch sử.',task:'Nếu nhìn thấy một mảnh đá có vẻ là hiện vật, em nên làm gì?',keywords:['Thần Sa','Ngườm','Phiêng Tung'],sources:[{title:'Cổng thông tin tỉnh: Khu di tích khảo cổ học Thần Sa (09/09/2026)',url:'https://thainguyen.gov.vn/di-tich-danh-lam-thang-canh/khu-di-tich-khao-co-hoc-than-sa-292920'}],question:{text:'Hai di chỉ nào gắn với Thần Sa?',options:['Đền Đuổm và Núi Võ','Căng Bá Vân và Nà Pậu','Phiêng Tung và mái đá Ngườm','Bảo tàng và Quảng trường 1/7'],correct:2,explanation:'Hang Phiêng Tung và mái đá Ngườm là hai di chỉ khảo cổ tiêu biểu tại Thần Sa.'}},
 {id:'nghia-ta',name:'Xã Nghĩa Tá',region:'Khu vực huyện Chợ Đồn, tỉnh Bắc Kạn trước sắp xếp',x:16.8,y:49.7,theme:'Lịch sử',title:'Nà Pậu – một địa chỉ về nguồn',story:'Di tích Nà Pậu ở thôn Thành Công, xã Nghĩa Tá thuộc quần thể ATK Chợ Đồn. Nơi đây gắn với Chủ tịch Hồ Chí Minh trong thời kỳ kháng chiến chống thực dân Pháp.',culture:'Các hoạt động dâng hương, báo công và về nguồn góp phần giáo dục lòng biết ơn. Khi đọc tư liệu cũ ghi Bắc Kạn, em cần nhớ rằng địa điểm này hiện thuộc tỉnh Thái Nguyên sau sáp nhập.',task:'Em hãy viết một câu thể hiện lòng biết ơn khi tìm hiểu địa chỉ đỏ.',keywords:['Nà Pậu','ATK Chợ Đồn','Chợ Đồn'],sources:[{title:'UBND xã Nghĩa Tá: Dâng hương tại Nà Pậu (28/08/2026)',url:'https://nghiata.thainguyen.gov.vn/hoat-dong-dang-uy/xa-nghia-ta-to-chuc-le-dang-huong-bao-cong-tai-khu-di-tich-lich-su-quoc-gia-na-pau-290530'},{title:'UBND xã Nghĩa Tá: Di tích Nà Pậu (01/01/2026)',url:'https://nghiata.thainguyen.gov.vn/hoat-dong-ubnd/dong-chi-hoang-duy-chinh-tham-va-dang-huong-tai-di-tich-lich-su-na-pau-233944'}],question:{text:'Di tích Nà Pậu hiện thuộc xã nào?',options:['Thần Sa','Vạn Phú','Tân Cương','Nghĩa Tá'],correct:3,explanation:'Di tích Nà Pậu ở thôn Thành Công, xã Nghĩa Tá, tỉnh Thái Nguyên.'}},
 {id:'ba-be',name:'Xã Ba Bể',region:'Khu vực huyện Ba Bể, tỉnh Bắc Kạn trước sắp xếp',x:27.6,y:22.9,theme:'Thiên nhiên',title:'Miền hồ xanh và văn hóa cộng đồng',story:'Hồ Ba Bể nằm giữa núi rừng, là một hồ nước ngọt tự nhiên nổi tiếng. Sau sáp nhập, em có thể khám phá miền hồ này trong hành trình tìm hiểu tỉnh Thái Nguyên.',culture:'Lễ hội Lồng Tồng tại thôn Bó Lù, xã Ba Bể là dịp cộng đồng gặp gỡ đầu xuân. Cảnh quan hồ và các hoạt động văn hóa cùng tạo nên nét đặc sắc của miền đất này.',task:'Nêu hai việc em cần làm để giữ hồ và đường làng sạch đẹp.',keywords:['Ba Bể'],sources:[{title:'Cổng thông tin tỉnh: Xã Ba Bể sẵn sàng cho mùa du lịch 2026',url:'https://thainguyen.gov.vn/di-va-den-thai-nguyen/xa-ba-be-san-sang-cho-mua-du-lich-2026-tinh-thai-nguyen-262959'},{title:'Hội Nhà báo tỉnh: Lễ hội Lồng Tồng tại Bó Lù (2026)',url:'https://hoinhabao.thainguyen.gov.vn/vi/news/chinh-tri-thoi-su/thong-nhat-ke-hoach-to-chuc-hoi-bao-xuan-binh-ngo-2026-cung-le-hoi-long-tong-ba-be-4318.html'}],question:{text:'Hồ Ba Bể là loại hồ nào?',options:['Hồ nước ngọt tự nhiên','Hồ nước mặn ven biển','Bể bơi nhân tạo','Hồ chứa trong nhà máy'],correct:0,explanation:'Ba Bể là hồ nước ngọt tự nhiên giữa núi rừng.'}},
];

export interface TraditionMapSite {
 id:string; title:string; address:string; theme:MapTheme;
 story:string; culture:string; task:string; keywords:string[];
 sources:TraditionMapPlace['sources']; question:TraditionMapPlace['question'];
 image?:{url:string;caption:string};
}

// Local destinations are grouped by their verified current administrative area.
const localDestinations:Record<string,TraditionMapSite[]>={
 "song-cong": [
  {
   "id": "quang-truong-1-7",
   "title": "Quảng trường 1/7 và Phố đi bộ Sông Công",
   "address": "Phường Sông Công, tỉnh Thái Nguyên",
   "theme": "Văn hóa",
   "story": "Quảng trường 1/7 là một không gian sinh hoạt cộng đồng của Sông Công. Ngày 18/9/2026, địa phương khai trương phố đi bộ tại khu vực quảng trường, phố Nguyễn Khuyến và một số vị trí trên các tuyến đường lân cận.",
   "culture": "Các hoạt động văn nghệ, giới thiệu sản phẩm địa phương và giao lưu cộng đồng góp phần làm phong phú đời sống văn hóa. Đây là nơi em có thể quan sát sự thay đổi của quê hương hôm nay.",
   "task": "Em hãy giới thiệu quảng trường trong hai câu và nêu một việc giúp giữ nơi công cộng sạch đẹp.",
   "keywords": [
    "Quảng trường 1/7",
    "Phố đi bộ Sông Công"
   ],
   "sources": [
    {
     "title": "Cổng thông tin tỉnh: Khai trương Phố đi bộ Sông Công (18/09/2026)",
     "url": "https://thainguyen.gov.vn/tin-hoat-dong-cua-don-vi/khai-truong-pho-di-bo-song-cong-295033"
    }
   ],
   "question": {
    "text": "Không gian nào gắn với Phố đi bộ Sông Công được khai trương năm 2026?",
    "options": [
     "Quảng trường 1/7",
     "Mái đá Ngườm",
     "Di tích Nà Pậu",
     "Hồ Ba Bể"
    ],
    "correct": 0,
    "explanation": "Phố đi bộ Sông Công được bố trí tại khu vực Quảng trường 1/7 và một số tuyến phố lân cận."
   }
  }
 ],
 "tan-cuong": [
  {
   "id": "cang-ba-van",
   "title": "Căng Bá Vân – câu chuyện về lòng kiên trung",
   "address": "Xã Tân Cương, tỉnh Thái Nguyên; trước đây thuộc xã Bình Sơn, thành phố Sông Công",
   "theme": "Lịch sử",
   "story": "Căng Bá Vân từng là nơi thực dân Pháp giam giữ những chiến sĩ cách mạng. Dù bị giam cầm, họ vẫn tổ chức đấu tranh và giữ vững ý chí. Di tích ngày nay giúp thế hệ sau tìm hiểu tinh thần yêu nước của cha ông.",
   "culture": "Hoạt động về nguồn tại Căng Bá Vân thể hiện lòng biết ơn người đi trước. Khi đọc tư liệu cũ ghi Bình Sơn, Sông Công, em cần đối chiếu: địa chỉ hiện nay là xã Tân Cương.",
   "task": "Em hãy nói một lời giới thiệu về ý nghĩa của di tích, rồi nêu một cách thể hiện sự tôn trọng khi tham quan.",
   "keywords": [
    "Căng Bá Vân",
    "Bá Vân"
   ],
   "sources": [
    {
     "title": "UBND xã Tân Cương: Hành trình thăm Căng Bá Vân (11/05/2026)",
     "url": "https://tancuong.thainguyen.gov.vn/chuyen-oi-so/sinh-hoat-chuyen-de-chuong-trinh-hanh-trinh-tham-dia-chi-do-tai-di-tich-lich-su-quoc-gia-cang-ba-van-263638"
    }
   ],
   "question": {
    "text": "Căng Bá Vân giúp em tìm hiểu điều gì?",
    "options": [
     "Cách chế biến chè",
     "Cuộc đấu tranh của các chiến sĩ cách mạng",
     "Quá trình hình thành hồ Ba Bể",
     "Nghề dệt mành cọ"
    ],
    "correct": 1,
    "explanation": "Di tích gắn với cuộc đấu tranh kiên cường của các chiến sĩ cách mạng bị giam cầm."
   }
  },
  {
   "id": "ho-ghenh-che",
   "title": "Hồ Ghềnh Chè – giữ màu xanh quê hương",
   "address": "Xã Tân Cương, tỉnh Thái Nguyên; khu vực Bình Sơn, Sông Công trước sắp xếp",
   "theme": "Thiên nhiên",
   "story": "Hồ Ghềnh Chè có mặt nước xanh, cảnh quan đồi và cây cối xung quanh. Điểm du lịch cộng đồng tại đây kết nối việc khám phá thiên nhiên với đời sống của người dân địa phương.",
   "culture": "Du khách có thể tìm hiểu vùng chè và các sản phẩm địa phương. Giá trị của cảnh quan gắn với việc giữ sạch nước hồ, bảo vệ cây xanh và tôn trọng cuộc sống của cộng đồng.",
   "task": "Em hãy kể hai việc giúp bảo vệ hồ. Khi tham quan, em đi cùng người lớn và làm theo hướng dẫn an toàn.",
   "keywords": [
    "Ghềnh Chè"
   ],
   "sources": [
    {
     "title": "Cổng thông tin tỉnh: Điểm du lịch cộng đồng hồ Ghềnh Chè (28/09/2026)",
     "url": "https://thainguyen.gov.vn/di-tich-danh-lam-thang-canh/diem-du-lich-cong-dong-ho-ghenh-che-296618"
    }
   ],
   "question": {
    "text": "Việc nào giúp gìn giữ cảnh quan hồ Ghềnh Chè?",
    "options": [
     "Bẻ cành cây làm đồ chơi",
     "Vứt túi nhựa xuống hồ",
     "Bỏ rác đúng nơi quy định",
     "Viết tên lên thân cây"
    ],
    "correct": 2,
    "explanation": "Bỏ rác đúng nơi quy định giúp giữ nước hồ và cảnh quan sạch đẹp."
   },
   "image": {
    "url": "https://storage-vnportal.vnpt.vn/gov-tnn/1/FileQuanTriTinTuc/image.639261826364017138.jpg",
    "caption": "Hồ Ghềnh Chè • Ảnh trong bài của Cổng thông tin tỉnh ngày 28/09/2026."
   }
  },
  {
   "id": "khong-gian-tra",
   "title": "Không gian văn hóa trà Tân Cương",
   "address": "Xã Tân Cương, tỉnh Thái Nguyên",
   "theme": "Văn hóa",
   "story": "Không gian văn hóa trà Tân Cương giới thiệu cây chè và nghề làm chè của quê hương. Qua những câu chuyện về trồng, hái và chế biến chè, em hiểu rằng một sản phẩm quen thuộc chứa đựng nhiều tri thức và công sức.",
   "culture": "Lễ hội Hương sắc trà xuân có hoạt động diễn diễu cây chè cổ, thi hái chè, sao chè và trao đổi về văn hóa thưởng trà. Nghề truyền thống được gìn giữ nhờ sự tiếp nối giữa các thế hệ.",
   "task": "Em hãy đặt ba câu hỏi muốn hỏi người làm chè, trong đó có một câu về cách chăm sóc cây chè.",
   "keywords": [
    "Không gian văn hóa trà",
    "Tân Cương"
   ],
   "sources": [
    {
     "title": "Cổng thông tin tỉnh: Lễ hội Hương sắc trà xuân Tân Cương (2026)",
     "url": "https://thainguyen.gov.vn/tin-anh/khai-mac-le-hoi-truyen-thong-huong-sac-tra-xuan-vung-che-dac-san-tan-cuong-xuan-binh-ngo-nam-2026-249372"
    }
   ],
   "question": {
    "text": "Hoạt động nào gắn với nghề truyền thống ở Tân Cương?",
    "options": [
     "Khai quật mái đá Ngườm",
     "Làm muối biển",
     "Đánh bắt cá ngoài khơi",
     "Hái chè và sao chè"
    ],
    "correct": 3,
    "explanation": "Hái chè, sao chè và văn hóa thưởng trà là những hoạt động gắn với vùng chè Tân Cương."
   }
  },
  {
   "id": "thai-hai",
   "title": "Làng nhà sàn Thái Hải – tìm hiểu văn hóa Tày, Nùng",
   "address": "Xã Tân Cương, tỉnh Thái Nguyên",
   "theme": "Văn hóa",
   "story": "Khu bảo tồn Làng nhà sàn dân tộc sinh thái Thái Hải lưu giữ những ngôi nhà sàn Tày, Nùng được chuyển đến từ Định Hóa. Không gian làng và đời sống cộng đồng giúp em tìm hiểu văn hóa qua những điều cụ thể.",
   "culture": "Bảo tồn văn hóa không chỉ là giữ một ngôi nhà. Đó còn là trân trọng cách sinh hoạt, tri thức và sự tiếp nối truyền thống trong cộng đồng. Em có thể lắng nghe người giới thiệu để hiểu ý nghĩa của đồ dùng, nếp nhà.",
   "task": "Chọn một chi tiết em thích ở nhà sàn và hỏi người hướng dẫn về công dụng của chi tiết đó.",
   "keywords": [
    "Thái Hải",
    "Nhà sàn"
   ],
   "sources": [
    {
     "title": "Cổng thông tin tỉnh: Làng nhà sàn Thái Hải (28/09/2026)",
     "url": "https://thainguyen.gov.vn/di-tich-danh-lam-thang-canh/khu-bao-ton-lang-nha-san-dan-toc-sinh-thai-thai-hai-295795"
    },
    {
     "title": "Cổng thông tin tỉnh: Các điểm du lịch tại xã Tân Cương (21/07/2026)",
     "url": "https://thainguyen.gov.vn/di-va-den-thai-nguyen/tan-cuong-can-khai-thac-hieu-qua-tiem-nang-loi-the-dua-du-lich-tro-thanh-nganh-kinh-te-quan-trong-281238"
    }
   ],
   "question": {
    "text": "Những ngôi nhà sàn được bảo tồn tại Thái Hải gắn với văn hóa nào?",
    "options": [
     "Tày, Nùng",
     "Chăm, Khmer",
     "Ê Đê, Gia Rai",
     "Mạ, Cơ Ho"
    ],
    "correct": 0,
    "explanation": "Nguồn của Cổng thông tin tỉnh giới thiệu các ngôi nhà sàn Tày, Nùng tại Thái Hải."
   },
   "image": {
    "url": "https://storage-vnportal.vnpt.vn/gov-tnn/1/FileQuanTriTinTuc/image.639257551871919922.jpg",
    "caption": "Một góc bản làng Thái Hải • Ảnh trong bài của Cổng thông tin tỉnh ngày 28/09/2026."
   }
  }
 ]
};
for(const place of traditionMapPlaces){if(localDestinations[place.id])place.sites=localDestinations[place.id];}
traditionMapPlaces.push({
 "id": "ba-xuyen",
 "name": "Phường Bá Xuyên",
 "region": "Khu vực thành phố Sông Công trước sắp xếp",
 "x": 46.8,
 "y": 87.5,
 "theme": "Lịch sử",
 "title": "Bá Xuyên – tìm hiểu một di tích gần gũi",
 "story": "Phường Bá Xuyên thuộc khu vực Sông Công trước sắp xếp. Chùa Bá Xuyên là một địa chỉ để học sinh tìm hiểu lịch sử và việc gìn giữ truyền thống tại địa phương.",
 "culture": "Những hoạt động chuẩn bị Hội chùa năm 2026, như dọn vệ sinh và chỉnh trang cảnh quan, thể hiện sự chung tay của cộng đồng trong bảo vệ di tích.",
 "task": "Em hãy chọn thẻ Chùa Bá Xuyên bên trên để tìm hiểu câu chuyện và thử trả lời câu hỏi.",
 "keywords": [
  "Bá Xuyên"
 ],
 "sources": [
  {
   "title": "Sở VHTTDL: Bàn giao công trình tôn tạo Chùa Bá Xuyên (18/10/2023)",
   "url": "https://sovhttdl.thainguyen.gov.vn/quy-hoach-ke-hoach-dau-tu-va-du-an/ban-giao-dua-vao-su-dung-cong-trinh-tu-sua-ton-tao-di-tich-lich-su-chua-ba-xuyen-tp-song-cong-193052"
  },
  {
   "title": "UBND phường Bá Xuyên: Chuẩn bị Hội chùa năm 2026 (13/02/2026)",
   "url": "https://baxuyen.thainguyen.gov.vn/tin-noi-bat/tich-cuc-trien-khai-cong-tac-chuan-bi-cho-hoi-chua-ba-xuyen-nam-2026-248006"
  }
 ],
 "question": {
  "text": "Chùa Bá Xuyên hiện thuộc phường nào?",
  "options": [
   "Phan Đình Phùng",
   "Sông Công",
   "Bá Xuyên",
   "Bắc Kạn"
  ],
  "correct": 2,
  "explanation": "Nguồn của UBND phường Bá Xuyên về Hội chùa năm 2026 xác nhận khu vực quản lý hiện nay là phường Bá Xuyên."
 },
 "sites": [
  {
   "id": "chua-ba-xuyen",
   "title": "Chùa Bá Xuyên – di tích và nếp sống văn minh",
   "address": "Phường Bá Xuyên, tỉnh Thái Nguyên",
   "theme": "Lịch sử",
   "story": "Chùa Bá Xuyên là di tích lịch sử cấp tỉnh, gắn với những sự kiện và nhân vật hoạt động ở Căng Bá Vân trong thời kỳ 1943–1945. Công trình được tu sửa, tôn tạo và bàn giao đưa vào sử dụng năm 2023.",
   "culture": "Hội chùa là dịp cộng đồng gìn giữ truyền thống. Việc cùng dọn vệ sinh, bảo vệ cảnh quan và tổ chức sinh hoạt trang nghiêm thể hiện trách nhiệm của người dân với di tích.",
   "task": "Em hãy chọn một việc nên làm khi đến di tích và giải thích vì sao.",
   "keywords": [
    "Chùa Bá Xuyên"
   ],
   "sources": [
    {
     "title": "Sở VHTTDL: Bàn giao công trình tôn tạo Chùa Bá Xuyên (18/10/2023)",
     "url": "https://sovhttdl.thainguyen.gov.vn/quy-hoach-ke-hoach-dau-tu-va-du-an/ban-giao-dua-vao-su-dung-cong-trinh-tu-sua-ton-tao-di-tich-lich-su-chua-ba-xuyen-tp-song-cong-193052"
    },
    {
     "title": "UBND phường Bá Xuyên: Chuẩn bị Hội chùa năm 2026 (13/02/2026)",
     "url": "https://baxuyen.thainguyen.gov.vn/tin-noi-bat/tich-cuc-trien-khai-cong-tac-chuan-bi-cho-hoi-chua-ba-xuyen-nam-2026-248006"
    }
   ],
   "question": {
    "text": "Chùa Bá Xuyên gắn với các sự kiện và nhân vật lịch sử hoạt động ở địa điểm nào?",
    "options": [
     "Hồ Ba Bể",
     "Căng Bá Vân",
     "Mái đá Ngườm",
     "Núi Văn – Núi Võ"
    ],
    "correct": 1,
    "explanation": "Nguồn của Sở VHTTDL ghi nhận mối liên hệ giữa Chùa Bá Xuyên và các hoạt động ở Căng Bá Vân thời kỳ 1943–1945."
   },
   "image": {
    "url": "https://storage-vnportal.vnpt.vn/gov-tnn/11216/ConvertFiles/documents/2474098/13374704/85.%20Di%20t%C3%ADch%20l%E1%BB%8Bch%20s%E1%BB%AD%20c%E1%BA%A5p%20t%E1%BB%89nh%20Ch%C3%B9a%20B%C3%A1%20Xuy%C3%AAn%20sau%20khi%20%C4%91%C6%B0%E1%BB%A3c%20tu%20s%E1%BB%ADa%2C%20t%C3%B4n%20t%E1%BA%A1o%20n%C4%83m%202023_8ZTJRO84.jpg",
    "caption": "Chùa Bá Xuyên sau tu sửa, tôn tạo năm 2023 • Nguồn ảnh: Sở VHTTDL Thái Nguyên."
   }
  }
 ]
});
export const normalizeMapText=(value:string)=>value.normalize('NFD').replace(/\p{Diacritic}/gu,'').replace(/[đĐ]/g,'d').toLowerCase();
export function matchingMapSites(place:TraditionMapPlace,search:string,theme:MapTheme|'Tất cả'){
 return (place.sites||[]).filter(site=>(theme==='Tất cả'||site.theme===theme)&&normalizeMapText(site.title+' '+site.address+' '+place.region+' '+site.keywords.join(' ')).includes(normalizeMapText(search)));
}
export function matchesMapPlace(place:TraditionMapPlace,search:string,theme:MapTheme|'Tất cả'){
 return ((theme==='Tất cả'||place.theme===theme)&&normalizeMapText(place.name+' '+place.region+' '+place.title+' '+place.keywords.join(' ')).includes(normalizeMapText(search)))||matchingMapSites(place,search,theme).length>0;
}
