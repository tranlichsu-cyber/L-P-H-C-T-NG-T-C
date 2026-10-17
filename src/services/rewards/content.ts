export const POINTS_PER_BADGE=20;
export const avatars={starter:{name:'Cú mèo ham học',price:0,color:'#38bdf8',kind:'owl'},cat:{name:'Mèo tinh nghịch',price:3,color:'#fbbf24',kind:'cat'},bunny:{name:'Thỏ vui vẻ',price:4,color:'#f9a8d4',kind:'bunny'},panda:{name:'Gấu trúc dễ thương',price:5,color:'#a7f3d0',kind:'panda'},robot:{name:'Robot tò mò',price:6,color:'#a5b4fc',kind:'robot'},fox:{name:'Cáo khám phá',price:7,color:'#fb923c',kind:'fox'},astro:{name:'Phi hành gia nhí',price:8,color:'#c4b5fd',kind:'astro'}} as const;
export type AvatarId=keyof typeof avatars;
export interface RewardIdentity {classId:string;studentId:string;roomId?:string;accessCode?:string;teacher?:boolean}
export interface RewardWallet {classId:string;studentId:string;studentName:string;teacherId:string;totalPoints:number;earnedBadges:number;spentBadges:number;ownedAvatars:AvatarId[];equippedAvatar:AvatarId;updatedAt:string;currentPoints?:number;livePoints?:number;practicePoints?:number;checkedAt?:string;lastClaimedAt?:string;unavailableAttempts?:number;pendingAttempts?:number}
export function creditWallet(previous:RewardWallet|undefined,identity:{classId:string;studentId:string;studentName:string;teacherId:string},points:number):RewardWallet{
 if(!Number.isFinite(points)||points<0||points>1e9)throw Error('Tổng điểm chưa hợp lệ.');
 const totalPoints=Math.max(previous?.totalPoints||0,Math.round(points*100)/100);
 return {...previous,...identity,totalPoints,earnedBadges:Math.floor(totalPoints/POINTS_PER_BADGE),spentBadges:previous?.spentBadges||0,ownedAvatars:previous?.ownedAvatars||['starter'],equippedAvatar:previous?.equippedAvatar||'starter',updatedAt:new Date().toISOString()};
}
export function selectAvatar(wallet:RewardWallet,id:AvatarId):RewardWallet{
 if(!Object.hasOwn(avatars,id))throw Error('Avatar không hợp lệ.');
 const owned=wallet.ownedAvatars.includes(id),price=owned?0:avatars[id].price;
 if(wallet.earnedBadges-wallet.spentBadges<price)throw Error('Em chưa đủ huy hiệu để đổi avatar này.');
 return {...wallet,spentBadges:wallet.spentBadges+price,ownedAvatars:owned?wallet.ownedAvatars:[...wallet.ownedAvatars,id],equippedAvatar:id,updatedAt:new Date().toISOString()};
}
