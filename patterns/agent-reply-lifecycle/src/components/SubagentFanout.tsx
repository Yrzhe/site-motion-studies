import { IconBranch, IconCheck, IconChevron, TOOL_ICON } from './chatIcons';
import { Shimmer } from './Shimmer';
import { FAN_FORK, FAN_STUB, ROW_H, cd, clamp01, fmtSec, lerp, type Fanout } from './chatScript';

/* 子任务并行：一件事拆成几件同时做。

   难点在于「同时」不是靠三行叠在一起就能读出来的 —— 三行叠着，
   人默认读成先后。所以这一块的运动全在证明并行：

   · 分叉  一条竖轨从标题行长下来，三个横杈依次伸出，三条道才出现。
           先有分叉再有道，顺序本身就在说「它们是从同一处派出去的」。
   · 参差  三条进度条同时在走但走得不一样快，谁先完谁后完是错开的。
           如果三条同步推进，眼睛会把它们读成一个物体在动 ——
           真实的并行永远是参差的，整齐反而假。
   · 掉队  先跑完的立刻暗到一半，只剩最慢那条还亮着。
           这不是修饰：并行的代价就是最慢的那条决定总时长，
           两条暗的陪着一条亮的，把这件事直接摆出来了。
   · 合流  全部完成后三条道向标题行收拢并消失，塌成一行汇总。
           收拢的方向是「并成一条」，不是「盖上盖子」—— 与工具组的折叠有别。
*/

const LANE_H = 30;
const RAIL_X = 18;
const TEXT_X = 30;
const DIM = 0.5;
type Props = {
  fan: Fanout;
  start: number;
  join: number; // 合流进度 0..1
  T: number;
  expand: number | null; // 用户点开后接管
  onToggle: () => void;
};
export const SubagentFanout = ({
  fan,
  start,
  join,
  T,
  expand,
  onToggle
}: Props) => {
  const e = T - start;
  const slowest = Math.max(...fan.lanes.map(l => l.dur));
  const allDone = e >= slowest;
  const open = Math.max(1 - join, expand ?? 0);
  const boxH = ROW_H + fan.lanes.length * LANE_H * open;
  const fork = cd(e / FAN_FORK);
  const lastCenter = ROW_H + (fan.lanes.length - 1) * LANE_H + LANE_H / 2;
  return <div role="button" tabIndex={0} aria-expanded={open > 0.5} onClick={onToggle} onKeyDown={ev => {
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      onToggle();
    }
  }} className="relative w-full cursor-pointer select-none overflow-hidden rounded-[10px] bg-[#faf9f6] transition-colors hover:bg-[#f6f4ef]" style={{
    height: boxH,
    boxShadow: 'inset 0 0 0 1px rgba(28,27,24,0.07)'
  }}>
      
      {/* 标题行：跑的时候说在派什么，跑完换成汇总。同一行换语义。 */}
      <div className="flex items-center gap-2 pl-3 pr-[92px]" style={{
      height: ROW_H
    }}>
        <span className="shrink-0" style={{
        color: allDone ? '#3f8f63' : '#8b8676',
        transition: 'color 220ms ease'
      }}>
          
          {allDone ? <IconCheck /> : <IconBranch />}
        </span>
        <span className="shrink-0 text-[12.5px] text-[#1c1b18]">
          {allDone ? fan.doneTitle : <Shimmer text={fan.title} t={T} active />}
        </span>
        <span className="shrink-0 rounded-[5px] bg-[#efece4] px-1.5 py-[1px] font-mono text-[11px] text-[#6f6a5c]">
          {allDone ? `${fan.lanes.length} 个子任务 · ${fmtSec(slowest)}` : `${fan.lanes.length} 个并行`}
        </span>
      </div>

      {/* 竖轨：从标题行长到最后一条道。它就是「一进三出」那一竖。 */}
      <span className="pointer-events-none absolute w-px bg-[#d3cdbc]" style={{
      left: RAIL_X,
      top: ROW_H - 6,
      height: Math.max(0, (lastCenter - ROW_H + 6) * fork * open),
      opacity: open
    }} />
      

      {fan.lanes.map((l, i) => {
      const p = clamp01(e / l.dur);
      const done = e >= l.dur;
      // 横杈依次伸出，道跟着杈出现 —— 分叉先于内容
      const stub = cd((e - FAN_STUB * i) / (FAN_STUB * 1.6));
      /* 收起时三条道一起收进标题行 —— 收拢点相同才读作「并成一条」 */
      const top = lerp(ROW_H - LANE_H, ROW_H + i * LANE_H, open);
      const vis = open * stub * (done ? DIM : 1);
      const Icon = done ? IconCheck : TOOL_ICON[l.kind];
      return <div key={i} className="absolute inset-x-0" style={{
        top: 0,
        height: LANE_H,
        transform: `translateY(${top}px)`,
        opacity: vis,
        willChange: 'transform, opacity'
      }}>
            
            {/* 横杈 */}
            <span className="pointer-events-none absolute top-1/2 h-px bg-[#d3cdbc]" style={{
          left: RAIL_X,
          width: (TEXT_X - RAIL_X - 4) * stub
        }} />
            
            {/* 进度底：走在文字后面，不另占一行。一条道跑到哪儿，底就铺到哪儿。
                跑完就把底撤掉 —— 三条铺满的底一样重，眼睛反而找不到还在跑的那条。
                撤掉之后卡里只剩一条底在长，掉队那件事就不用解释了。 */}
            <span className="pointer-events-none absolute inset-y-[3px] block rounded-[6px]" style={{
          left: TEXT_X - 4,
          right: 8,
          opacity: 1 - clamp01((e - l.dur) / 380)
        }}>
              
              <span className="block h-full rounded-[6px] bg-[#efece4]" style={{
            width: `${p * 100}%`
          }} />
              
            </span>

            <div className="relative flex items-center gap-2 pr-3" style={{
          height: LANE_H,
          paddingLeft: TEXT_X
        }}>
              
              <span className="shrink-0" style={{
            color: done ? '#3f8f63' : '#8b8676',
            transition: 'color 200ms ease'
          }}>
                
                <Icon />
              </span>
              <span className="shrink-0 text-[12.5px] text-[#1c1b18]">{l.verb}</span>
              {/* 跑的时候显示入参，跑完换成结果 —— 变暗那一下正好盖住这次替换 */}
              <span className="truncate font-mono text-[11px] text-[#6f6a5c]">
                {done ? l.result : l.arg}
              </span>
            </div>
          </div>;
    })}

      <div className="pointer-events-none absolute right-3 top-0 flex items-center gap-2 text-[#8b8676]" style={{
      height: ROW_H
    }}>
        
        {!allDone && <span className="font-mono text-[11px] tabular-nums">{fmtSec(Math.max(0, e))}</span>}
        <span className="rounded-full bg-[#efece4] px-1.5 font-mono text-[10.5px] tabular-nums">
          {fan.lanes.filter(l => e >= l.dur).length}
        </span>
        <IconChevron turn={open} />
      </div>
    </div>;
};