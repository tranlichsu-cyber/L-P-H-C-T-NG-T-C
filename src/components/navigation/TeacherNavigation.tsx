import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  idle: string;
  active: string;
}

export function TeacherNavigation({ items }: { items: NavItem[] }) {
  const { pathname } = useLocation();
  const rail = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const [openedFor, setOpenedFor] = useState<string | null>(() => pathname === '/teacher' ? pathname : null);
  const expanded = openedFor === pathname;
  const close = () => { setOpenedFor(null); toggle.current?.focus(); };
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const active = (path: string) => pathname === path || (path !== '/teacher' && pathname.startsWith(path + '/'));

  useEffect(() => {
    const node = rail.current;
    if (!node || !expanded) return;
    const update = () => {
      setCanLeft(node.scrollLeft > 2);
      setCanRight(node.scrollLeft + node.clientWidth < node.scrollWidth - 2);
    };
    const reveal = () => {
      const selected = node.querySelector<HTMLElement>('[aria-current="page"]');
      if (selected) {
        const delta = selected.getBoundingClientRect().left - node.getBoundingClientRect().left
          - (node.clientWidth - selected.offsetWidth) / 2;
        node.scrollLeft += delta;
      }
    };
    reveal();
    update();
    node.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(() => { reveal(); update(); });
    observer.observe(node);
    if (node.firstElementChild) observer.observe(node.firstElementChild);
    return () => {
      node.removeEventListener('scroll', update);
      observer.disconnect();
    };
  }, [pathname, items.length, expanded]);

  const scroll = (direction: number) => {
    const node = rail.current;
    if (node) node.scrollBy({
      left: direction * node.clientWidth * .75,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  };
  const arrow = 'flex h-10 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-sky-600 disabled:opacity-25';

  return (
    <div className="border-t border-slate-100 bg-white" onKeyDown={event => { if (event.key === 'Escape' && expanded) { event.preventDefault(); close(); } }}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8">
        <button ref={toggle} type="button" aria-expanded={expanded} aria-controls="teacher-menu-panel" onClick={() => expanded ? close() : setOpenedFor(pathname)} className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-bold text-indigo-700 hover:bg-indigo-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
          {expanded ? <X className="h-4 w-4" aria-hidden="true" /> : <Menu className="h-4 w-4" aria-hidden="true" />}
          {expanded ? 'Ẩn menu' : 'Menu chức năng'}
        </button>
        <span className="min-w-0 truncate text-sm font-semibold text-slate-600">{items.find(item => active(item.path))?.label || 'Khu vực giáo viên'}</span>
      </div>
      <div id="teacher-menu-panel" hidden={!expanded}>
      <div className="mx-auto flex max-w-7xl min-w-0 items-center gap-1 px-2 sm:px-5 lg:px-7">
        <button type="button" className={arrow} disabled={!canLeft} onClick={() => scroll(-1)} aria-label="Cuộn menu sang trái" aria-controls="teacher-navigation">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <nav id="teacher-navigation" ref={rail} aria-label="Điều hướng giáo viên" className="min-w-0 flex-1 overflow-x-auto overscroll-x-contain py-2 [scrollbar-width:thin]">
          <div className="flex w-max items-center gap-2 px-1">
            {items.map(item => {
              const Icon = item.icon;
              const isActive = active(item.path);
              return (
                <Link key={item.path} to={item.path} onClick={event => { if (!event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && event.button === 0) close(); }} aria-current={isActive ? 'page' : undefined} className={`inline-flex h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl border px-3 text-sm leading-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${isActive ? item.active + ' font-extrabold' : item.idle + ' font-bold hover:brightness-95'}`}>
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
        <button type="button" className={arrow} disabled={!canRight} onClick={() => scroll(1)} aria-label="Cuộn menu sang phải" aria-controls="teacher-navigation">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      </div>
    </div>
  );
}
