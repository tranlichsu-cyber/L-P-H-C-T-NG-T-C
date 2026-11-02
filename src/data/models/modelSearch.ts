import type { LearningModelItem } from './modelsCatalog';

export function normalizeModelSearch(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').toLowerCase().trim();
}

export function filterLearningModels(
  items: LearningModelItem[],
  filters: { subject: string; grade: number; query: string; status: string },
): LearningModelItem[] {
  const terms = normalizeModelSearch(filters.query).split(/\s+/).filter(Boolean);
  return items.filter(item => {
    const text = normalizeModelSearch([item.title, item.lessonName, item.lessonCode, item.subject, ...item.tags].join(' '));
    return (filters.subject === 'ALL' || item.subject === filters.subject)
      && (filters.grade === 0 || item.grade === filters.grade)
      && (filters.status === 'ALL' || item.status === filters.status)
      && terms.every(term => text.includes(term));
  });
}
