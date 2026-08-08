import { useMemo } from 'react';
import { clamp01, lerp } from './chatScript';

/* agent 正在生成图像时，从工具组下方吐出来的预览窗。

   不做「模糊淡入」—— 那是加载动画，不是生成过程。
   做的是分辨率逐级细分：2 → 4 → 8 → 16 列，每一级都是完整的一张图，
   只是越来越细。这是扩散出图给人的真实直觉：先有构图，后有细节。

   四条运动规则：
   · 细分  每跨一级，整格重新取色；级与级之间靠 blur 抹掉硬跳变
   · 定稿  72% 之后淡入一张连续渐变盖住网格 —— 最高一级只有 16 列，
           停在那儿仍是马赛克，读作「卡住了」而不是「画完了」
   · 去焦  blur 14 → 0，跟着进度走，最后一级才真正锐利
   · 流光  进度 82% 之后一道高光斜扫而过 —— 它是「定稿」的信号，不是装饰
   · 收窗  与 browser 小窗同一条临界阻尼曲线，两种子视图手感一致
*/

const W = 320;
const H = 200; // 与 browser 小窗同宽同高，两种子视图并置时不打架
const BAR = 20;
const COLS = 16;
const ROWS = 10;

/* 目标图：暖色调封面，中心偏右上一团高光。
   用函数生成而不是放一张图 —— 逐级取色需要能在任意坐标采样。 */
function sample(u: number, v: number) {
  const t = clamp01(u * 0.55 + v * 0.45);
  const d = Math.hypot(u - 0.68, v - 0.3);
  const glow = Math.pow(Math.max(0, 1 - d / 0.55), 2);
  const r = Math.round(lerp(38, 148, t) + glow * 92);
  const g = Math.round(lerp(35, 140, t) + glow * 66);
  const b = Math.round(lerp(30, 124, t) + glow * 34);
  return `rgb(${Math.min(255, r)} ${Math.min(255, g)} ${Math.min(255, b)})`;
}
const LEVELS = [2, 4, 8, 16];
const levelAt = (p: number) => LEVELS[Math.min(LEVELS.length - 1, Math.floor(clamp01(p) * LEVELS.length))];
const easeOutCubic = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
export const GenerateView = ({
  open,
  p,
  name
}: {
  open: number;
  p: number;
  name: string;
}) => {
  const o = clamp01(open);
  const level = levelAt(p);

  /* 只在跨级时重算 —— 每帧算 160 个格子的颜色是白费的 */
  const cells = useMemo(() => {
    const rows = Math.max(1, Math.round(level * ROWS / COLS));
    return Array.from({
      length: COLS * ROWS
    }, (_, i) => {
      const cx = i % COLS;
      const cy = Math.floor(i / COLS);
      // 落在哪个大块里，就取那个大块中心的颜色
      const bx = Math.floor(cx * level / COLS);
      const by = Math.floor(cy * rows / ROWS);
      return sample((bx + 0.5) / level, (by + 0.5) / rows);
    });
  }, [level]);
  if (o <= 0.001) return null;
  const contentIn = clamp01((o - 0.35) / 0.5);
  const blur = lerp(14, 0, easeOutCubic(p));
  // 流光：定稿的信号。82% 之后斜扫一遍就没了
  const sweep = clamp01((p - 0.82) / 0.18);
  const done = p >= 1;
  return <div className="overflow-hidden rounded-[10px] bg-[#141310] ring-1 ring-[#1c1b18]/[0.08]" style={{
    width: W,
    height: (H + BAR) * o,
    opacity: Math.min(1, o * 1.6)
  }}>
      
      <div style={{
      width: W,
      height: H + BAR,
      opacity: contentIn
    }}>
        <div className="relative overflow-hidden" style={{
        width: W,
        height: H
      }}>
          <div className="grid h-full w-full" style={{
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
          filter: `blur(${blur}px)`,
          transform: 'scale(1.06)' // 撑掉 blur 在边缘吃出来的透明圈
        }}>
            
            {cells.map((c, i) => <span key={i} style={{
            background: c
          }} />)}
          </div>

          {/* 定稿层：与 sample() 同一套参数的连续版本 ——
           对角渐变 + (0.68, 0.30) 处的暖色高光，半径 0.55 */}
          <div className="absolute inset-0" style={{
          opacity: clamp01((p - 0.72) / 0.24),
          background: 'radial-gradient(circle at 68% 30%, rgba(255,214,150,0.62) 0%, rgba(255,214,150,0.18) 34%, transparent 56%),' + 'linear-gradient(132deg, rgb(38,35,30) 0%, rgb(96,90,79) 52%, rgb(148,140,124) 100%)'
        }} />
          

          {sweep > 0 && sweep < 1 && <div className="pointer-events-none absolute inset-y-[-20%] w-[38%]" style={{
          left: `${lerp(-40, 118, sweep)}%`,
          transform: 'skewX(-14deg)',
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 35%, rgba(255,255,255,0.28) 50%, rgba(255,255,255,0.05) 65%, transparent 100%)'
        }} />}
        </div>

        <div className="flex items-center gap-2 px-2.5 font-mono text-[10px] text-white/45" style={{
        height: BAR
      }}>
          
          <span className="truncate">{name}</span>
          <span className="ml-auto tabular-nums">
            {done ? '完成' : `${Math.round(clamp01(p) * 100)}%`}
          </span>
          <span className="block h-[3px] w-10 shrink-0 overflow-hidden rounded-full bg-white/12">
            <span className="block h-full rounded-full bg-white/55" style={{
            width: `${clamp01(p) * 100}%`
          }} />
            
          </span>
        </div>
      </div>
    </div>;
};