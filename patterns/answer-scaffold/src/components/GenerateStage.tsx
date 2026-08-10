import { SCREEN_H, SCREEN_W } from './HomeScreen';
import {
  FRAME,
  FRAME_ARC_AT,
  FRAME_ARC_DUR,
  FRAME_DOT_AT,
  FRAME_DUR,
  FRAME_H_AT,
  FRAME_V_AT,
  GRID_AT,
  GRID_DUR,
  GRID_PITCH,
  ORB_AT,
  ORB_DUR,
  STATUS_AT,
  STATUS_SWAP_AT,
  STATUS_TEXT,
  cd,
  clamp01,
  pct,
} from './scaffoldScript';

/* 生成态：等待被画成了一个「取景框」。

   顺序是有意义的，反过来就散了：
   点阵 → 两条横线左右展开 → 两条竖线上下展开 → 四个交点亮起 → 补四个圆角。
   前四步说的是「这块地方被占住了」，最后一步说的是「它会是一张卡片」。
   小球和百分比要等框立起来才进 —— 先有容器，再有内容。

   点阵不是装饰性噪点：参考线正好压在它的行列上，四个交点就是点阵的交点。
   也就是说框不是画上去的，是从这层网格里「挑」出来的。
*/

const RADIUS = FRAME.r;

/* 点阵与十字标记跟时间无关，建一次 */
const MARKS: { x: number; y: number }[] = [];
for (let x = FRAME.x % GRID_PITCH; x < SCREEN_W + GRID_PITCH; x += GRID_PITCH) {
  for (let y = FRAME.y % GRID_PITCH; y < SCREEN_H + GRID_PITCH; y += GRID_PITCH) {
    MARKS.push({ x, y });
  }
}

const GRID = (
  <svg
    className="absolute inset-0"
    width={SCREEN_W}
    height={SCREEN_H}
    fill="none"
    stroke="#ffffff"
    strokeWidth="1"
    strokeLinecap="round"
  >
    {MARKS.map((m, i) => (
      <path key={i} d={`M${m.x - 4} ${m.y}h8M${m.x} ${m.y - 4}v8`} opacity={0.5} />
    ))}
  </svg>
);

/* 点阵单独抽出来：第五段两个子任务在生成时它会再回来一次 ——
   有东西在算，网格就在。顶部收掉，别爬到上下文条上去。 */
export const BlueprintGrid = ({ p }: { p: number }) => {
  if (p <= 0.002) return null;
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        opacity: p * 0.8,
        maskImage: 'linear-gradient(180deg, transparent 12%, #000 24%, #000 78%, transparent 96%)',
        WebkitMaskImage: 'linear-gradient(180deg, transparent 12%, #000 24%, #000 78%, transparent 96%)',
      }}
    >
      {GRID}
    </div>
  );
};

const L = FRAME.x;
const R = FRAME.x + FRAME.w;
const TOP = FRAME.y;
const BOT = FRAME.y + FRAME.h;
const OVER = GRID_PITCH;   // 参考线越过框各一格 —— 这样它才读作「基准线」，不是「边框」

const Orb = ({ p }: { p: number }) => {
  if (p <= 0.001) return null;
  const d = 54;
  return (
    <span
      className="pointer-events-none absolute rounded-full"
      style={{
        left: SCREEN_W / 2 - d / 2,
        top: FRAME.y + FRAME.h / 2 - d / 2,
        width: d,
        height: d,
        opacity: p,
        transform: `scale(${0.6 + 0.4 * p})`,
        background: 'radial-gradient(circle at 36% 30%, #ffffff 0%, #f6f8fc 40%, #e2e7f0 72%, #ccd3e2 100%)',
        boxShadow: '0 8px 20px rgba(88,98,130,0.16), inset -2px -3px 9px rgba(150,160,186,0.28)',
      }}
    />
  );
};

export const GenerateStage = ({ T, out }: { T: number; out: number }) => {
  const grid = cd((T - GRID_AT) / GRID_DUR);
  const hLine = cd((T - FRAME_H_AT) / FRAME_DUR);
  const vLine = cd((T - FRAME_V_AT) / FRAME_DUR);
  const dot = cd((T - FRAME_DOT_AT) / 260);
  const arc = cd((T - FRAME_ARC_AT) / FRAME_ARC_DUR);
  const orb = cd((T - ORB_AT) / ORB_DUR);
  const gone = clamp01(out);

  if (grid <= 0.001) return null;

  const value = pct(T);
  const swap = cd((T - STATUS_SWAP_AT) / 260);
  const status = cd((T - STATUS_AT) / 320);

  /* 圆角只画四个角的弧 —— 直边留给参考线，两者合起来才是一张卡的轮廓。
     四段弧写成一条 path，省掉四个节点。 */
  const arcs = [
    `M${L} ${TOP + RADIUS}A${RADIUS} ${RADIUS} 0 0 1 ${L + RADIUS} ${TOP}`,
    `M${R - RADIUS} ${TOP}A${RADIUS} ${RADIUS} 0 0 1 ${R} ${TOP + RADIUS}`,
    `M${R} ${BOT - RADIUS}A${RADIUS} ${RADIUS} 0 0 1 ${R - RADIUS} ${BOT}`,
    `M${L + RADIUS} ${BOT}A${RADIUS} ${RADIUS} 0 0 1 ${L} ${BOT - RADIUS}`,
  ].join('');

  return (
    <div className="pointer-events-none absolute inset-0" style={{ opacity: 1 - gone }}>
      <BlueprintGrid p={grid} />

      <svg className="absolute inset-0" width={SCREEN_W} height={SCREEN_H} fill="none">
        {/* 两条横线：从中心往两边展开 */}
        {[TOP, BOT].map((y) => (
          <line
            key={y}
            x1={SCREEN_W / 2 + (L - OVER - SCREEN_W / 2) * hLine}
            x2={SCREEN_W / 2 + (R + OVER - SCREEN_W / 2) * hLine}
            y1={y}
            y2={y}
            stroke="#ffffff"
            strokeWidth="1"
            opacity={hLine * 0.62}
          />
        ))}
        {/* 两条竖线：从中心往上下展开 */}
        {[L, R].map((x) => (
          <line
            key={x}
            x1={x}
            x2={x}
            y1={(TOP + BOT) / 2 + (TOP - OVER - (TOP + BOT) / 2) * vLine}
            y2={(TOP + BOT) / 2 + (BOT + OVER - (TOP + BOT) / 2) * vLine}
            stroke="#ffffff"
            strokeWidth="1"
            opacity={vLine * 0.62}
          />
        ))}
        {/* 四个交点：点阵上原本的「+」被换成实心亮点 */}
        {[[L, TOP], [R, TOP], [L, BOT], [R, BOT]].map(([x, y]) => (
          <g key={`${x}-${y}`} opacity={dot}>
            <circle cx={x} cy={y} r={7 * dot} fill="#ffffff" opacity={0.28} />
            <circle cx={x} cy={y} r={3.1 * dot} fill="#ffffff" />
          </g>
        ))}
        {/* 四个圆角 */}
        <path d={arcs} stroke="#ffffff" strokeWidth="1.2" opacity={arc * 0.55} strokeLinecap="round" />
      </svg>

      <Orb p={orb} />

      {/* 百分比压在小球下方，跟着框走 */}
      <div
        className="absolute inset-x-0 text-center tabular-nums"
        style={{
          top: FRAME.y + FRAME.h / 2 + 60,
          fontSize: 15,
          color: '#7b7f8c',
          opacity: orb,
        }}
      >
        {value}%
      </div>

      {/* 状态文案在屏幕底部，不在框里 —— 它说的是「系统在干什么」，
          不是「这张卡在长什么」。两句交叉淡入。 */}
      <div className="absolute inset-x-0" style={{ top: 726, height: 18, opacity: status }}>
        {STATUS_TEXT.map((s, i) => (
          <div
            key={s}
            className="absolute inset-x-0 text-center"
            style={{ fontSize: 13, color: '#6c7181', opacity: i === 0 ? 1 - swap : swap }}
          >
            {s}
          </div>
        ))}
      </div>
    </div>
  );
};
