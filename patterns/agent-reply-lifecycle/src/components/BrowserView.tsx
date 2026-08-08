import { clamp01, lerp, type Page } from './chatScript';

/* agent 正在浏览时，从工具组下方吐出来的小窗。

   它要传达的只有一件事：「它此刻在看这一页」。
   所以页面用色块和字条画一个可信的缩略，不做可读的正文 ——
   真去渲染网页会把注意力从「agent 在干活」引到「这页写了什么」。

   三条运动规则：
   · 开窗   高度 0 → 190，临界阻尼，内容延后 120ms 才淡入（先有框，再有内容）
   · 换页   新页自右推入、旧页左移淡出；地址栏文字同时上滚替换
   · 加载条 每次导航从 0 走到满，走完即隐 —— 它是导航的进度，不是装饰
*/

/* 16:10 —— 一台笔记本的屏幕比例。
   原本宽度跟着工具组走(619×190 = 3.26:1)，那个比例不像任何一块屏幕，
   小窗就读作「一条横幅」而不是「一个浏览器窗口」。
   高度沿用 190 附近，宽度按比例反推。 */
const H = 200;
const W = 320;
const NAV_SHIFT = 22; // 旧页左移的百分比，不做整屏平移，太重

const Chrome = ({
  page,
  navP
}: {
  page: Page;
  navP: number;
}) => <div className="flex items-center gap-2 border-b border-[#eceae3] bg-[#f8f7f3] px-2.5 py-1.5">
    <div className="flex shrink-0 gap-1">
      {['#e5e1d6', '#e5e1d6', '#e5e1d6'].map((c, i) => <span key={i} className="block h-[6px] w-[6px] rounded-full" style={{
      background: c
    }} />)}
    </div>
    <div className="relative min-w-0 flex-1 overflow-hidden rounded-full bg-white px-2 py-[3px] ring-1 ring-[#1c1b18]/[0.06]">
      {/* 加载条：导航的进度，走完即隐 */}
      <span className="absolute inset-y-0 left-0 bg-[#1c1b18]/[0.05]" style={{
      width: `${navP * 100}%`,
      opacity: navP < 1 ? 1 : 0
    }} />
    
      <span className="relative block truncate font-mono text-[10px] leading-[14px] text-[#6f6a5c]">
        {page.url}
      </span>
    </div>
  </div>;
const PageBody = ({
  page
}: {
  page: Page;
}) => <div className="flex h-full flex-col gap-2 bg-white px-4 py-3">
    <div className="flex items-center gap-1.5">
      <span className="block h-3 w-3 rounded-[3px]" style={{
      background: page.accent
    }} />
      <span className="text-[9.5px] font-medium tracking-wide text-[#1c1b18]">{page.site}</span>
      <span className="ml-auto flex gap-2">
        {[16, 22, 18].map((w, i) => <span key={i} className="block h-[4px] rounded-full bg-[#eceae3]" style={{
        width: w
      }} />)}
      </span>
    </div>

    <div className="mt-1 text-[16px] font-medium leading-tight tracking-tight text-[#1c1b18]">
      {page.title}
    </div>

    <div className="flex flex-col gap-[5px]">
      {page.rows.map((w, i) => <span key={i} className="block h-[5px] rounded-full bg-[#eeece5]" style={{
      width: `${w * 100}%`
    }} />)}
    </div>

    <div className="mt-auto flex gap-1.5">
      <span className="block h-6 flex-1 rounded-[5px]" style={{
      background: `${page.accent}14`,
      boxShadow: `inset 0 0 0 1px ${page.accent}33`
    }} />
    
      <span className="block h-6 flex-1 rounded-[5px] bg-[#f4f2ec]" />
      <span className="block h-6 flex-1 rounded-[5px] bg-[#f4f2ec]" />
    </div>
  </div>;
type Props = {
  open: number;
  page?: Page;
  prev?: Page;
  navP: number;
};
export const BrowserView = ({
  open,
  page,
  prev,
  navP
}: Props) => {
  if (!page || open <= 0.001) return null;
  const o = clamp01(open);
  // 内容延后：先有框，再有内容。框还没撑开就把网页塞进去会挤成一团
  const contentIn = clamp01((o - 0.35) / 0.5);
  return <div className="overflow-hidden rounded-[10px] ring-1 ring-[#1c1b18]/[0.08]" style={{
    width: W,
    height: H * o,
    opacity: Math.min(1, o * 1.6)
  }}>
      
      <div style={{
      width: W,
      height: H
    }} className="flex flex-col">
        <div style={{
        opacity: contentIn
      }}>
          <Chrome page={page} navP={navP} />
        </div>
        <div className="relative min-h-0 flex-1 overflow-hidden">
          {prev && navP < 1 && <div className="absolute inset-0" style={{
          transform: `translateX(${-NAV_SHIFT * navP}%)`,
          opacity: (1 - navP) * contentIn
        }}>
            
              <PageBody page={prev} />
            </div>}
          <div className="absolute inset-0" style={{
          transform: `translateX(${lerp(100, 0, navP)}%)`,
          opacity: contentIn
        }}>
            
            <PageBody page={page} />
          </div>
        </div>
      </div>
    </div>;
};