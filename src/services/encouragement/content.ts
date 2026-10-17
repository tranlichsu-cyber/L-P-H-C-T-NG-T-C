export const encouragementKinds={
 EFFORT:{icon:'🌱',label:'Kiên trì cố gắng',hint:'Em tiếp tục thử khi gặp bài khó.'},
 PROGRESS:{icon:'🌈',label:'Tiến bộ từng ngày',hint:'Em đã làm tốt hơn so với chính mình.'},
 TEAMWORK:{icon:'🤝',label:'Hợp tác tốt',hint:'Em lắng nghe và cùng hoàn thành nhiệm vụ.'},
 KINDNESS:{icon:'💛',label:'Biết giúp bạn',hint:'Em chia sẻ, hướng dẫn hoặc động viên bạn.'},
 DILIGENCE:{icon:'📚',label:'Chăm chỉ',hint:'Em chủ động học và hoàn thành việc được giao.'},
 COURAGE:{icon:'🎤',label:'Mạnh dạn chia sẻ',hint:'Em tự tin nêu ý kiến hoặc đặt câu hỏi.'},
} as const;
export type EncouragementKind=keyof typeof encouragementKinds;
export interface EncouragementBadge {id:string;reason:string;awardedAt:string}
export interface StudentEncouragement {studentId:string;studentName:string;teacherId:string;updatedAt:string;badges:Partial<Record<EncouragementKind,EncouragementBadge>>}
export function validateEncouragement(kind:string,reason:string|null){if(!Object.hasOwn(encouragementKinds,kind))throw Error('Loại huy hiệu không hợp lệ.');if(reason!==null&&(!reason.trim()||reason.trim().length>300))throw Error('Lời ghi nhận cần từ 1 đến 300 ký tự.');}
