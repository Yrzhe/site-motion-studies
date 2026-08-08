import { IconChevron, IconThink } from './chatIcons';
import { Shimmer } from './Shimmer';
import { ROW_H, THINK_LINE, THINK_SLIDE, THINK_TAIL, cd, clamp01, fmtSec, lerp } from './chatScript';

/* 推理过程：回复之前的那一段自言自语。

   这一块和别的块最大的区别是**它不是给人读完的**。真实推理长得多，
   产品里没有一家把它整段摊开 —— 都只露一点，跑完收成一行。
   所以运动设计的问题不是「怎么把它展示出来」，是「怎么表示它很长且还在长」。

   三条运动规则：
   · 缝隙  跑的时候只露两行，新的一条从下面进来，旧的从上沿淡出。
           窗口高度恒定 —— 一段不知道多长的东西，不该顶着下面的内容一直推。
           上沿的淡出是关键：截断说明「上面还有」，硬切说明「只有这些」。
   · 低一档 字比正文小、比正文淡。它不是答案，是答案的来料。
           走一条左侧竖轨，与工具卡的实心底完全不同的一种记号。
   · 收束  跑完塌成一行「思考了 3.5 秒」。耗时是这块唯一值得留下的数字 ——
           事后没人回看想了什么，只在意想了多久。点开可以看全。
*/

const LINE_H = 22;
const SLIT = 2; // 跑的时候露几行
const COLLAPSE = 520;
const LINE_IN = 300;
type Props = {
  lines: string[];
  start: number;
  T: number;
  expand: number | null; // null = 跟脚本走
  onToggle: () => void;
};
export const ThinkBlock = ({
  lines,
  start,
  T,
  expand,
  onToggle
}: Props) => {
  const e = T - start;
  const spent = lines.length * THINK_LINE + THINK_TAIL;
  const thinking = e < spent;

  /* 收起是连续量，不是布尔 —— 跑完之后从「露两行」平滑走到「露零行」，
     中途拖时间轴到任何一刻都要能定格在那个中间态。 */
  const collapse = cd((e - spent) / COLLAPSE);
  const autoRows = lerp(SLIT, 0, collapse);
  const rows = Math.max(autoRows, (expand ?? 0) * lines.length);
  const boxH = ROW_H + rows * LINE_H;

  // 超出缝隙的每一条都把整列往上推一行，临界阻尼磨掉阶跃
  let scroll = 0;
  for (let i = SLIT; i < lines.length; i++) scroll += cd((e - i * THINK_LINE) / THINK_SLIDE);
  // 展开到缝隙以上时把这段位移还回去，否则展开后看到的是被推走的中段
  const beyond = clamp01((rows - SLIT) / Math.max(1, lines.length - SLIT));
  const shift = lerp(-scroll * LINE_H, 0, beyond);
  return <div role="button" tabIndex={0} aria-expanded={rows > SLIT} onClick={onToggle} onKeyDown={ev => {
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      onToggle();
    }
  }} className="relative w-full cursor-pointer select-none overflow-hidden rounded-[10px]" style={{
    height: boxH
  }}>
      
      {/* 标题行常驻。跑的时候是「思考中」，跑完换成耗时 —— 同一行换语义。 */}
      <div className="flex items-center gap-2 pr-9" style={{
      height: ROW_H
    }}>
        <span className="shrink-0 text-[#8b8676]">
          <IconThink />
        </span>
        <span className="shrink-0 text-[12.5px]">
          {thinking ? <Shimmer text="思考中" t={T} active /> : <span className="text-[#8b8676]">思考了 {fmtSec(spent)}</span>}
        </span>
      </div>

      {/* 左侧竖轨：标出这一段属于另一个层级，不是回复本身 */}
      <span className="pointer-events-none absolute left-[6px] w-px bg-[#e2ded2]" style={{
      top: ROW_H - 2,
      height: Math.max(0, rows * LINE_H - 4),
      opacity: clamp01(rows * 2)
    }} />
      

      {/* 缝隙本身是一个独立的裁剪窗，上沿正好压在标题行下面。
          只靠淡出不够 —— 半透明的字还是会压进「思考中」那一行，两行叠在一起。
          硬裁 + 淡出叠着用：裁剪保证不互相污染，淡出让上沿不是一刀切。 */}
      <div className="absolute inset-x-0 overflow-hidden" style={{
      top: ROW_H,
      height: Math.max(0, rows * LINE_H)
    }}>
        {lines.map((l, i) => {
        const at = i * THINK_LINE;
        const top = i * LINE_H + shift;
        const bottom = top + LINE_H;

        /* 可见度全由几何决定：滑出上沿的淡出，尚未进入下沿的淡入。
           跟工具组同一条规则 —— 这两块东西的「窗口」是同一种东西。 */
        let vis = clamp01((e - at) / LINE_IN);
        if (top < 0) vis = Math.min(vis, clamp01(1 + top / LINE_H));
        if (bottom > rows * LINE_H) vis = Math.min(vis, clamp01((rows * LINE_H - top) / LINE_H));
        return <div key={i} className="absolute inset-x-0 flex items-center pl-[18px] pr-2" style={{
          top: 0,
          height: LINE_H,
          transform: `translateY(${top}px)`,
          opacity: vis,
          willChange: 'transform, opacity'
        }}>
              <span className="truncate text-[12.5px] leading-[22px] text-[#a09a89]">{l}</span>
            </div>;
      })}
      </div>

      <div className="pointer-events-none absolute right-1 top-0 flex items-center text-[#b0ab9b]" style={{
      height: ROW_H,
      opacity: thinking ? 0 : 1,
      transition: 'opacity 260ms ease'
    }}>
        
        <IconChevron turn={clamp01(rows / lines.length)} />
      </div>
    </div>;
};