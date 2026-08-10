import { PHOTO_NATURE, PHOTO_NIGHT } from './photos';
import {
  FILL_AT,
  FILL_DUR,
  FORK_AT,
  FORK_DUR,
  SLOT,
  SLOT_AT,
  SLOT_DUR,
  TILES,
  cd,
  clamp01,
  lerp,
} from './scaffoldScript';

/* 两个子任务。

   结构上是第四段那套「先占位再填」的并行版：先分叉出两条线、各垂一个空槽，
   再一前一后填进去。**错开是这一段的全部意思** ——
   两个同时落地就只是「出了两张图」；一前一后、后到的那个还转着圈，
   才读作「两个子任务各跑各的，谁先算完谁先回来」。

   分叉那两条线是三次贝塞尔：从主干竖直出发，向外拱开，再**竖直落进**槽顶。
   直线连过去会读成「两个箭头指向下面」，弧线才读作「同一股东西分成了两支」。
   线上各有一个小亮点，停在弧的中点。
*/

const PHOTOS = [PHOTO_NATURE, PHOTO_NIGHT];

const CX = SLOT.x.map((x) => x + SLOT.w / 2);   // 111.5 / 277.5
const TRUNK_TOP = 486;
const SPLIT = 522;

/* 曲线中点（三次贝塞尔 t=0.5 的闭式解），小亮点停在这儿 */
const mid = (x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number) => ({
  x: (x0 + 3 * x1 + 3 * x2 + x3) / 8,
  y: (y0 + 3 * y1 + 3 * y2 + y3) / 8,
});

const BRANCH = CX.map((cx) => ({
  d: `M195 ${SPLIT}C195 ${SPLIT + 36} ${cx} ${SPLIT + 34} ${cx} ${SLOT.y}`,
  dot: mid(195, SPLIT, 195, SPLIT + 36, cx, SPLIT + 34, cx, SLOT.y),
}));

const IconOpen = () => (
  <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 8 8 3M3.6 3H8v4.4" />
  </svg>
);

/* 还没填的槽里转一段圆弧。转速慢，读作「在算」不是「卡住了」。 */
const Spinner = ({ T, p }: { T: number; p: number }) => (
  <span
    className="absolute left-1/2 top-1/2 block"
    style={{ transform: `translate(-50%,-50%) rotate(${(T / 1400) * 360}deg)`, opacity: p * 0.5 }}
  >
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M11 1.6a9.4 9.4 0 0 1 8.1 4.7" stroke="#8d92a3" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="11" cy="11" r="9.4" stroke="#8d92a3" strokeWidth="1.5" opacity="0.22" />
    </svg>
  </span>
);

export const ChildTiles = ({ T }: { T: number }) => {
  const fork = cd((T - FORK_AT) / FORK_DUR);
  const slot = cd((T - SLOT_AT) / SLOT_DUR);
  if (fork <= 0.001) return null;

  return (
    <div className="pointer-events-none absolute inset-0">
      <svg className="absolute inset-0" width={390} height={844} fill="none">
        <path
          d={`M195 ${TRUNK_TOP}V${SPLIT}`}
          stroke="#ffffff"
          strokeWidth="1.4"
          opacity={0.8 * clamp01(fork * 3)}
        />
        {BRANCH.map((b, i) => (
          <path
            key={i}
            d={b.d}
            stroke="#ffffff"
            strokeWidth="1.4"
            opacity={0.8}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - clamp01(fork * 1.35 - 0.25)}
          />
        ))}
        {BRANCH.map((b, i) => (
          <circle key={i} cx={b.dot.x} cy={b.dot.y} r={2.4} fill="#ffffff" opacity={clamp01(fork * 2 - 1)} />
        ))}
      </svg>

      {TILES.map((tile, i) => {
        const fill = cd((T - FILL_AT[i]) / FILL_DUR);
        const x = SLOT.x[i];
        return (
          <div key={tile.label} className="absolute" style={{ left: x, top: SLOT.y, width: SLOT.w, opacity: slot }}>
            <div
              className="relative overflow-hidden"
              style={{
                height: SLOT.h,
                borderRadius: SLOT.r,
                transform: `scale(${lerp(0.88, 1, slot)})`,
                /* 空槽只比背景亮 8 个灰阶（原片量的），能看见靠的是外面那圈光晕
                   和一道内描边 —— 不是靠把它涂白 */
                background: 'rgba(255,255,255,0.22)',
                boxShadow: '0 0 34px 12px rgba(255,255,255,0.42), inset 0 0 0 1px rgba(255,255,255,0.36)',
              }}
            >
              <Spinner T={T} p={slot * (1 - clamp01(fill * 2))} />

              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${PHOTOS[i]})`,
                  opacity: clamp01(fill * 1.4),
                  transform: `scale(${lerp(1.12, 1, fill)})`,
                  filter: `blur(${lerp(9, 0, fill)}px) saturate(${lerp(0.3, 1, fill)})`,
                }}
              />
              <div
                className="absolute inset-x-0 bottom-0"
                style={{
                  height: '62%',
                  opacity: fill,
                  background: 'linear-gradient(180deg, rgba(12,22,36,0) 0%, rgba(12,22,36,0.44) 60%, rgba(12,22,36,0.7) 100%)',
                }}
              />

              <div
                className="absolute bottom-[11px] left-[11px] font-semibold leading-[15px] tracking-[-0.01em] text-white"
                style={{ fontSize: 13, opacity: cd((T - FILL_AT[i] - 220) / 460) }}
              >
                {tile.title.map((l) => (
                  <div key={l}>{l}</div>
                ))}
              </div>

              {/* 右上角那颗 ↗ ：填好之后才出现，说明「这个可以点开」 */}
              <span
                className="absolute right-[9px] top-[9px] grid place-items-center rounded-full"
                style={{
                  width: 22,
                  height: 22,
                  background: 'rgba(255,255,255,0.26)',
                  backdropFilter: 'blur(6px)',
                  opacity: cd((T - FILL_AT[i] - 340) / 400),
                }}
              >
                <IconOpen />
              </span>
            </div>

            <div
              className="mt-[11px] text-center uppercase"
              style={{ fontSize: 10.5, letterSpacing: '0.09em', color: '#7c8090', opacity: slot }}
            >
              {tile.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};
