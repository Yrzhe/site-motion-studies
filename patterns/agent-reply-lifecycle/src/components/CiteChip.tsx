import type { Cite } from './chatScript';

/* 行内引用标记。

   静止态刻意做到几乎看不见：一个中性灰的小上标数字，没有色块、没有品牌色。
   翻过 Cohere（正文全清、句末排来源行）、Cursor（等宽中性 token）、
   Grok（纯中性上标数字）、Elicit（灰色作者名），没有一家在正文里放彩色 pill——
   脚注比它注解的那句话还抢眼，阅读顺序就反了。原来那个 6px 品牌色方块
   还是个假 favicon：那个尺寸分辨不出蓝和紫，它不传信息，只占宽度。

   信息留到 hover 才给，这跟本作品别处是同一条规矩（折叠只看最新一条、
   思考收成一行）：静止态安静，要看的时候再展开。

   而这里展开的东西有个别处没有的机会 —— 这两条引用指的正是刚才 browser
   小窗里出现过的那两页，读者已经见过。所以卡片不做一张通用来源卡，
   而是把小窗的三个零件原样搬过来：accent 方块 + 站名、页面标题、
   地址栏样式的 url。它读作「这句结论来自刚才那一页」，不是「这里有个链接」。
*/

const RISE = 3.5;   // 上标抬起的距离。再多会顶到上一行

export const CiteChip = ({ cite }: { cite: Cite }) => {
  const { page } = cite;
  return (
    <span
      data-stream-word
      data-cite
      className="group relative mx-[1.5px] inline-flex items-center justify-center rounded-[4px] bg-[#efece4] px-[3px] font-mono text-[9.5px] leading-[13px] text-[#6f6a5c] transition-colors duration-200"
      style={{
        minWidth: 13,
        height: 13,
        transform: `translateY(-${RISE}px)`,
        // hover 时才染上站点色 —— 颜色在这时候是信息，不是装饰。
        // 底色的透明版预先算好，省得在 CSS 里做 color-mix
        ['--cite-accent' as string]: page.accent,
        ['--cite-tint' as string]: `${page.accent}16`,
      }}
    >
      {cite.n}

      {/* 悬浮卡：绝对定位，不参与布局，所以句子不会被推开 */}
      <span
        className="pointer-events-none absolute bottom-[calc(100%+7px)] left-1/2 z-10 w-[212px] -translate-x-1/2 translate-y-[5px] rounded-[10px] bg-white p-2.5 text-left opacity-0 shadow-[0_6px_20px_rgba(28,27,24,0.1)] ring-1 ring-[#1c1b18]/[0.08] transition-[opacity,transform] duration-200 ease-[cubic-bezier(.22,1,.36,1)] group-hover:translate-y-0 group-hover:opacity-100"
        style={{ whiteSpace: 'normal' }}
      >
        {/* 以下三行与 BrowserView 的零件一一对应，尺寸按比例缩小 */}
        <span className="flex items-center gap-1.5">
          <span
            className="block h-[10px] w-[10px] shrink-0 rounded-[2.5px]"
            style={{ background: page.accent }}
          />
          <span className="text-[9.5px] font-medium tracking-wide text-[#1c1b18]">
            {page.site}
          </span>
        </span>

        <span className="mt-1 block text-[13px] font-medium leading-tight tracking-tight text-[#1c1b18]">
          {page.title}
        </span>

        <span className="mt-1.5 block truncate rounded-full bg-[#f8f7f3] px-2 py-[3px] font-mono text-[9.5px] leading-[13px] text-[#8b8676] ring-1 ring-[#1c1b18]/[0.05]">
          {page.url}
        </span>
      </span>
    </span>
  );
};
