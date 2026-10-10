import React, { useState } from 'react';
interface Props { options: string[]; value: string; disabled?: boolean; onChange: (answer: string) => void; }
export const OrderingAnswer: React.FC<Props> = ({ options, value, disabled, onChange }) => {
  const [order, setOrder] = useState(() => value ? value.split(' → ') : [...options].reverse());
  const move = (index: number, offset: number) => {
    const next = [...order];
    [next[index], next[index + offset]] = [next[index + offset], next[index]];
    setOrder(next);
    onChange('');
  };
  return <section className="space-y-3"><p className="font-bold text-slate-700">Dùng nút ↑ ↓ để xếp các mục, rồi xác nhận thứ tự.</p>{order.map((item, index) => <div key={item} className="p-3 bg-white border border-sky-200 rounded-xl flex items-center gap-3"><span className="font-bold text-sky-700">{index + 1}.</span><span className="flex-1 text-slate-900">{item}</span><button type="button" disabled={disabled || index === 0} onClick={() => move(index, -1)} aria-label={'Đưa ' + item + ' lên'} className="px-3 py-2 bg-sky-100 rounded-lg text-sky-900 disabled:opacity-30">↑</button><button type="button" disabled={disabled || index === order.length - 1} onClick={() => move(index, 1)} aria-label={'Đưa ' + item + ' xuống'} className="px-3 py-2 bg-sky-100 rounded-lg text-sky-900 disabled:opacity-30">↓</button></div>)}<button type="button" disabled={disabled || order.length < 2} onClick={() => onChange(order.join(' → '))} className="px-4 py-3 bg-sky-700 text-white rounded-xl disabled:opacity-40">{value ? 'Đã xác nhận thứ tự' : 'Xác nhận thứ tự'}</button></section>;
};
