import { IconAlert, IconCheck, IconChevron, IconRetry, TOOL_ICON } from './chatIcons';
import { Shimmer } from './Shimmer';
import { ROW_H, SLIDE_DUR, cd, clamp01, fmtSec, lerp, toolPhase, type Tool } from './chatScript';

/* 收起时上方各行额外向最新一条挤压的距离。
   展开时这段压缩释放，读作「手风琴拉开」而不是「一块布往下掉」。 */
const ACCORDION = 6;
type Props = {
  title: string;
  tools: Tool[];
  starts: number[];
  ends: number[];
  groupEnd: number;
  T: number;
  expand: number; // 0..1
  onToggle: () => void;
};

/* 运行时折叠：折叠只占一行，内容随执行持续替换；展开时整组历史铺开。
   换条与展开是同一个位移的两端，共用一条曲线。 */
export const ToolGroup = ({
  title,
  tools,
  starts,
  ends,
  groupEnd,
  T,
  expand,
  onToggle
}: Props) => {
  const finished = T >= groupEnd;
  const rowStarts = [...starts, groupEnd];
  const shown = rowStarts.filter(s => T >= s).length || 1;

  // 连续化的滚动位置：每有新行开始就上滚一行，临界阻尼磨掉阶跃
  let scroll = 0;
  for (let i = 1; i < rowStarts.length; i++) scroll += cd((T - rowStarts[i]) / SLIDE_DUR);

  /* 任一行处于报错时整卡描边偏红，恢复即回正 ——
     状态不该只体现在那一行的图标上，折叠时那一行可能根本看不见。 */
  const erring = tools.some((t, i) => toolPhase(t, starts[i], T) === 'error');
  const boxH = lerp(ROW_H, shown * ROW_H, expand);
  const shiftY = lerp(-scroll * ROW_H, 0, expand);
  const latest = shown - 1;
  const elapsed = Math.min(T, groupEnd) - starts[0];
  return <div role="button" tabIndex={0} aria-expanded={expand > 0.5} onClick={onToggle} onKeyDown={e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  }} className="relative w-full cursor-pointer select-none overflow-hidden rounded-[10px] transition-colors hover:bg-[#f6f4ef]" style={{
    height: boxH,
    background: erring ? '#fdf6f4' : '#faf9f6',
    boxShadow: `inset 0 0 0 1px ${erring ? 'rgba(178,74,52,0.22)' : 'rgba(28,27,24,0.07)'}`,
    transition: 'background 240ms ease, box-shadow 240ms ease'
  }}>
      
      {rowStarts.map((st, i) => {
      const isSummary = i === tools.length;
      const appeared = T >= st;
      const phase = isSummary ? 'done' : toolPhase(tools[i], starts[i], T);
      const running = !isSummary && (phase === 'running' || phase === 'retry');

      // 收起时把上方各行往最新一条方向再挤一点，展开时释放
      const squeeze = (1 - expand) * Math.max(0, latest - i) * ACCORDION;
      const top = i * ROW_H + shiftY - squeeze;
      const bottom = top + ROW_H;

      /* 可见度完全由几何决定：滑出上沿的行淡出，尚未进入下沿的行淡入。
         不再手写 stagger —— 展开时上方各行本来就依次进入视口，
         那个先后顺序是位移自带的，不该再叠一层人造节奏。 */
      let vis = 1;
      if (top < 0) vis = clamp01(1 + top / ROW_H);
      if (bottom > boxH) vis = Math.min(vis, clamp01((boxH - top) / ROW_H));
      if (!appeared) vis = 0;

      /* 图标原地替换，不整行闪 —— 换的是这一行的状态，不是这一行本身 */
      const Icon = isSummary ? IconCheck : phase === 'error' ? IconAlert : phase === 'retry' ? IconRetry : TOOL_ICON[tools[i].kind];
      return <div key={i} style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: ROW_H,
        transform: `translateY(${top}px)`,
        opacity: vis,
        willChange: 'transform, opacity'
      }} className="flex items-center gap-2 pl-3 pr-[104px]">
            
            <span className="shrink-0" style={{
          color: isSummary ? '#3f8f63' : phase === 'error' ? '#b24a34' : '#8b8676',
          transition: 'color 200ms ease'
        }}>
              
              <Icon />
            </span>
            <span className="shrink-0 text-[12.5px] text-[#1c1b18]">
              {isSummary ? title : phase === 'error' ? '失败，重试中' : <Shimmer text={tools[i].verb} t={T} active={running} />}
            </span>
            <span className="truncate rounded-[5px] px-1.5 py-[1px] font-mono text-[11px]" style={{
          background: phase === 'error' ? '#f7e6e1' : '#efece4',
          color: phase === 'error' ? '#8f3a27' : '#6f6a5c',
          transition: 'background 200ms ease, color 200ms ease'
        }}>
              
              {isSummary ? `${tools.length} 次调用 · ${fmtSec(groupEnd - starts[0])}` : phase === 'error' ? tools[i].fail!.reason : tools[i].arg}
            </span>
          </div>;
    })}

      {/* 右侧固定：耗时 + 计数 + 折叠箭头。不随列滚动。 */}
      <div className="pointer-events-none absolute right-3 top-0 flex items-center gap-2 text-[#8b8676]" style={{
      height: ROW_H
    }}>
        
        {!finished && <span className="font-mono text-[11px] tabular-nums">{fmtSec(elapsed)}</span>}
        <span className="rounded-full bg-[#efece4] px-1.5 font-mono text-[10.5px] tabular-nums">
          {starts.filter(s => T >= s).length}
        </span>
        <IconChevron turn={expand} />
      </div>
    </div>;
};