import { IconCheck, IconChevron, PixelGrid } from './chatIcons';
import { ROW_H, cd, clamp01, lerp, type PlanStep } from './chatScript';

/* 计划清单：先摊开要走的步骤，跑的时候逐条勾掉。

   它跨越整场会话 —— 比第一次工具调用先出现，比最后一次晚结束。
   所以它不属于任何一个工具组，是一块独立的、一直在那儿的东西。

   三条运动规则：
   · 勾掉  图标原地换成对勾，整行褪到 0.4 —— 做完的事该退到背景里，
           但不能消失，否则读者会怀疑自己记错了
   · 折叠  只留一行摘要「计划 · 2/4」，与工具组共用同一套位移机制
   · 进度条 一条极细的底边，宽度即完成比例，不用数字二次说明
*/

const DONE_FADE = 0.4;
/* 收起时各步骤额外向摘要行挤压的距离，展开时释放。与工具组同一个常数含义。 */
const ACCORDION = 5;
type Props = {
  steps: PlanStep[];
  T: number;
  expand: number;
  onToggle: () => void;
};
export const PlanList = ({
  steps,
  T,
  expand,
  onToggle
}: Props) => {
  const doneCount = steps.filter(s => T >= s.doneAt).length;
  const allDone = doneCount === steps.length;
  // 折叠时那一行右边全是空的 —— 把「此刻在做哪一步」放进去，
  // 折叠态才真的有信息量，而不只是个计数。展开后下面就列着，头上不必重复。
  const current = allDone ? null : steps[doneCount];
  const rows = steps.length + 1; // 摘要行 + 各步骤

  const boxH = lerp(ROW_H, rows * ROW_H, expand);
  const progress = doneCount / steps.length;
  return <div role="button" tabIndex={0} aria-expanded={expand > 0.5} onClick={onToggle} onKeyDown={e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  }} className="relative w-full cursor-pointer select-none overflow-hidden rounded-[10px] bg-white shadow-[0_2px_14px_rgba(28,27,24,0.07)] ring-1 ring-[#1c1b18]/[0.08] transition-colors hover:bg-[#faf9f6]" style={{
    height: boxH
  }}>
      
      {/* 摘要行常驻在顶部，不随展开滚走 —— 它是这块东西的标题 */}
      <div className="flex items-center gap-2 pl-3 pr-[76px]" style={{
      height: ROW_H
    }}>
        <span className={allDone ? 'shrink-0 text-[#3f8f63]' : 'shrink-0 text-[#8b8676]'}>
          {allDone ? <IconCheck /> : <PixelGrid t={T} />}
        </span>
        <span className="shrink-0 text-[12.5px] text-[#1c1b18]">计划</span>
        <span className="shrink-0 rounded-[5px] bg-[#efece4] px-1.5 py-[1px] font-mono text-[11px] text-[#6f6a5c]">
          {doneCount}/{steps.length}
        </span>
        {/* 当前步比面板收得快 —— 展开到一半它就让位了，
            不会和正在露出来的第一行同时占着视线。 */}
        {current && <span className="truncate text-[12px] text-[#8b8676]" style={{
        opacity: clamp01(1 - expand * 2.4)
      }}>
            {current.label}
          </span>}
      </div>

      {steps.map((s, i) => {
      const done = T >= s.doneAt;
      const just = clamp01((T - s.doneAt) / 320); // 刚勾掉的那一下
      /* 收起时各步骤额外向摘要行方向挤压，展开时这段压缩释放。
         纯裁剪的话，行只是被一条边扫过去，读作「盖子在推」；
         带上这一点压缩才读作「叠着的东西被拉开」。与工具组同一个机制。 */
      const top = (i + 1) * ROW_H - (1 - expand) * (i + 1) * ACCORDION;
      const vis = clamp01((boxH - top) / ROW_H);
      return <div key={i} className="absolute inset-x-0 flex items-center gap-2 pl-3 pr-4" style={{
        top: 0,
        height: ROW_H,
        transform: `translateY(${top}px)`,
        opacity: vis * (done ? lerp(1, DONE_FADE, just) : 1)
      }}>
            
            <span className="grid h-[14px] w-[14px] shrink-0 place-items-center" style={{
          color: done ? '#3f8f63' : '#c2bcac',
          transition: 'color 220ms ease'
        }}>
              
              {done ? <IconCheck /> : <span className="block h-[9px] w-[9px] rounded-full ring-1 ring-current" />}
            </span>
            <span className="truncate text-[12.5px] text-[#1c1b18]" style={{
          textDecoration: done ? 'line-through' : 'none'
        }}>
              
              {s.label}
            </span>
          </div>;
    })}

      <div className="pointer-events-none absolute right-3 top-0 flex items-center gap-2 text-[#8b8676]" style={{
      height: ROW_H
    }}>
        {/* 这块面板在窗口底部、向上展开，所以箭头方向与流里的工具组相反：
            收起时朝上（还能往上展开），展开时朝下（可以收回去）。 */}
        <IconChevron turn={1 - expand} />
      </div>

      {/* 极细的底边即进度，不再用数字二次说明 */}
      <span className="pointer-events-none absolute bottom-0 left-0 h-[2px] bg-[#3f8f63]/35" style={{
      width: `${cd(progress) * 100}%`,
      transition: 'width 420ms cubic-bezier(.22,1,.36,1)'
    }} />
      
    </div>;
};