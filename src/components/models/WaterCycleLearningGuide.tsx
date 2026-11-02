import { useState } from 'react';

const tasks = [
  ['Dự đoán · 2 phút', 'Nước trong vũng nước sau cơn mưa đi đâu khi trời nắng? Trao đổi với bạn trước khi mở mô hình.'],
  ['Khám phá · 5 phút', 'Quan sát biển, mây, mưa và nước dưới đất. Chọn mục “Các quá trình” để đọc giải thích; tìm nơi nước chuyển từ lỏng sang khí và từ khí sang lỏng.'],
  ['Giải thích · 3 phút', 'Kể lại hành trình một giọt nước bằng các từ: bay hơi, ngưng tụ, mưa, dòng chảy hoặc thấm vào đất.'],
  ['Vận dụng · 3 phút', 'Nước vẫn tuần hoàn, vì sao chúng ta còn phải tiết kiệm và bảo vệ nguồn nước? Nêu một việc em sẽ làm.'],
  ['Tự đánh giá · 2 phút', 'Làm mục “Thử tài trắc nghiệm”, đọc giải thích và quay lại quá trình em chưa hiểu.'],
];

export function WaterCycleLearningGuide() {
  const [completed, setCompleted] = useState<number[]>([]);
  return <section aria-labelledby="water-learning-title" className="rounded-3xl border border-sky-700 bg-slate-900 p-5 sm:p-7 space-y-5">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="text-sky-300 text-sm font-bold">KHOA HỌC 4 · HOẠT ĐỘNG GỢI Ý 15 PHÚT</p>
        <h2 id="water-learning-title" className="mt-2 text-xl font-bold">Theo dấu một giọt nước</h2>
        <p className="mt-2 text-slate-200 leading-relaxed">Em mô tả được các quá trình chính của vòng tuần hoàn nước, nhận biết bay hơi và ngưng tụ, đề xuất một việc bảo vệ nguồn nước.</p></div>
      <a href="/models/phieu-vong-tuan-hoan-nuoc.html" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-xl bg-sky-600 px-4 font-bold hover:bg-sky-500">Mở phiếu học tập để in</a>
    </div>
    <ol className="grid gap-3 md:grid-cols-2">
      {tasks.map(([title, task], index) => <li key={title} className="rounded-2xl border border-slate-600 p-4">
        <h3 className="font-bold text-sky-200">{index + 1}. {title}</h3><p className="mt-2 leading-relaxed text-slate-200">{task}</p>
        <label className="mt-3 flex min-h-11 cursor-pointer items-center gap-3 text-sm">
          <input type="checkbox" checked={completed.includes(index)} onChange={e => setCompleted(prev => e.target.checked ? [...prev, index] : prev.filter(i => i !== index))} className="h-5 w-5 accent-sky-500" />Em đã thực hiện bước này
        </label>
      </li>)}
    </ol>
    <p role="status" className="text-sm text-sky-200">Đã đánh dấu {completed.length}/{tasks.length} bước. Dấu chọn chỉ dùng trong lần học này, không phải điểm đánh giá.</p>
    <details className="rounded-2xl bg-slate-950 p-4 border border-slate-600">
      <summary className="cursor-pointer font-bold min-h-11 content-center">Dành cho giáo viên: tổ chức và đánh giá</summary>
      <div className="mt-3 space-y-3 leading-relaxed text-slate-200">
        <p>Học sinh làm việc theo cặp: một em thao tác, một em ghi hoặc trình bày; đổi vai khi quan sát quá trình tiếp theo. Có thể dùng phần văn bản khi thiết bị không chạy được 3D.</p>
        <p>Minh chứng: sơ đồ có mũi tên và tên quá trình, lời giải thích một hiện tượng đời sống, một hành động bảo vệ nước. Học sinh có thể nói, vẽ hoặc viết.</p>
        <p>Tiêu chí: gọi đúng tên quá trình; phân biệt bay hơi với ngưng tụ; liên hệ được việc bảo vệ nước. Dùng câu hỏi gợi mở nếu học sinh còn nhầm, không đánh giá chỉ bằng số lượt bấm hoặc huy hiệu.</p>
        <p>Lưu ý: hơi nước không nhìn thấy bằng mắt thường; mây chứa các giọt nước nhỏ hoặc tinh thể băng. Các hạt, tốc độ và đường đi trên mô hình là minh họa; nước không chỉ đi theo một đường cố định.</p>
        <p>Đối chiếu yêu cầu cần đạt và bộ sách đang sử dụng trước khi đưa vào kế hoạch bài dạy; đây là hoạt động gợi ý, chưa phải xác nhận ánh xạ chương trình.</p>
      </div>
    </details>
    <p className="text-sm text-slate-300">Nguồn khoa học tham khảo: <a className="underline text-sky-300" href="https://www.usgs.gov/water-science-school/water-cycle" target="_blank" rel="noopener noreferrer">USGS Water Science School — Water cycle</a>. Nội dung hướng dẫn được diễn đạt phù hợp với hoạt động tiểu học.</p>
  </section>;
}
