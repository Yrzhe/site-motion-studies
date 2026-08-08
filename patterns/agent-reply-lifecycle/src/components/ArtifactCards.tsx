import { memo, useState, type ReactNode } from 'react';
import { IconDoc, IconDownload, IconImage, IconLayers } from './chatIcons';
import { DOC_PARAGRAPHS, SLIDES } from './chatScript';

/* 视口矮一些 —— 产物是「瞥一眼确认做对了」，不是在这里通读。
   同排等高靠把视口高度写死成同一个值，不靠 items-stretch 拉伸：
   拉伸的话内容一多就会一高一矮。 */
const VIEWPORT = 132;
const Shell = ({
  icon,
  name,
  meta,
  hint,
  delay,
  children
}: {
  icon: ReactNode;
  name: string;
  meta: string;
  hint: string;
  delay: number;
  children: ReactNode;
}) => <div data-artifact style={{
  flex: '1 0 220px',
  ['--artifact-delay' as string]: `${delay}ms`
}} className="min-w-0 overflow-hidden rounded-[10px] bg-white ring-1 ring-[#1c1b18]/[0.08]">
  
    <div className="flex items-center gap-1.5 border-b border-[#efece4] px-2.5 py-1.5">
      <span className="shrink-0 text-[#8b8676]">{icon}</span>
      <span className="truncate font-mono text-[11px] text-[#1c1b18]">{name}</span>
      <span className="shrink-0 rounded-[4px] bg-[#f4f2ec] px-1 font-mono text-[10px] text-[#8b8676]">{meta}</span>
      <span className="ml-auto shrink-0 text-[10px] text-[#c2bcac]">{hint}</span>
      <button aria-label={`下载 ${name}`} onClick={e => e.stopPropagation()} className="shrink-0 text-[#c2bcac] transition-colors hover:text-[#1c1b18]">
      
        <IconDownload />
      </button>
    </div>
    {children}
  </div>;

/* PPT：小窗内纵向滚动逐页翻。scroll-snap 让每页停稳 ——
   幻灯片没有「半页」这种状态。 */
const DeckCard = () => {
  const [page, setPage] = useState(1);
  return <Shell icon={<IconLayers />} name="deck.pptx" meta={`${page}/${SLIDES.length}`} hint="滚动翻页" delay={0}>
      <div onScroll={e => setPage(Math.min(SLIDES.length, Math.round(e.currentTarget.scrollTop / VIEWPORT) + 1))} className="no-scrollbar overflow-y-auto overscroll-contain" style={{
      height: VIEWPORT,
      scrollSnapType: 'y mandatory'
    }}>
        
        {SLIDES.map(s => <div key={s.n} style={{
        height: VIEWPORT,
        scrollSnapAlign: 'start'
      }} className="flex flex-col justify-center gap-1 bg-[#fbfaf7] px-4">
          
            <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#b0ab9b]">{s.kicker}</div>
            <div className="text-[14px] font-medium leading-tight tracking-tight text-[#1c1b18]">{s.title}</div>
            <div className="text-[10.5px] leading-relaxed text-[#6f6a5c]">{s.body}</div>
            <div className="mt-0.5 h-px w-6 bg-[#ded9cb]" />
          </div>)}
      </div>
    </Shell>;
};

/* 文档：不 snap —— 文档没有页的概念，停在段落中间是正常的阅读状态。
   这是它和 PPT 的关键区别，两种滚动手感不该做成一样。 */
const DocCard = () => {
  const [pct, setPct] = useState(0);
  return <Shell icon={<IconDoc />} name="notes.docx" meta={`${Math.round(pct * 100)}%`} hint="滚动阅读" delay={90}>
      <div onScroll={e => {
      const el = e.currentTarget;
      const max = el.scrollHeight - el.clientHeight;
      setPct(max > 0 ? el.scrollTop / max : 0);
    }} className="no-scrollbar overflow-y-auto overscroll-contain px-3 py-2" style={{
      height: VIEWPORT
    }}>
        
        {DOC_PARAGRAPHS.map((b, i) => b.h ? <div key={i} className={`text-[11px] font-medium text-[#1c1b18] ${i === 0 ? '' : 'mt-2.5'}`}>
              {b.h}
            </div> : <p key={i} className="mt-1 text-[10.5px] leading-[1.7] text-[#5c5849]">
              {b.p}
            </p>)}
      </div>
    </Shell>;
};

/* 封面图：没有内部滚动。留它在这排，等高才是被证明的而不是凑巧的。 */
const CoverCard = () => <Shell icon={<IconImage />} name="cover.png" meta="1600×900" hint="预览" delay={180}>
    <div style={{
    height: VIEWPORT
  }} className="flex flex-col justify-end gap-1 bg-[linear-gradient(135deg,#2a2720_0%,#4a453a_45%,#8d8778_100%)] px-4 pb-3">
    
      <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/50">2026 · 07</div>
      <div className="text-[15px] font-medium leading-tight tracking-tight text-white">上周评审复盘</div>
      <div className="h-px w-8 bg-white/25" />
    </div>
  </Shell>;

/* 一行排开；这一行放不下就左右滚。
   flex: 1 0 220px —— 三张时正好铺满 720 的内容列（各自 grow 到约 236），
   第四张开始自然溢出成横向滚动，不用为「几张」写分支。
   基数取 250 时三张会溢出 22px，切口太小，看着像渲染错误而不是「右边还有」。 */
export const ArtifactCards = memo(() => <div className="no-scrollbar -mx-1 flex gap-2.5 overflow-x-auto overscroll-x-contain px-1 pb-1">
    <DeckCard />
    <DocCard />
    <CoverCard />
  </div>);
ArtifactCards.displayName = 'ArtifactCards';