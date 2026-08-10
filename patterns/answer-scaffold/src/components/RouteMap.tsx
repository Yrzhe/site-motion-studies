import { SCREEN_H, SCREEN_W } from './HomeScreen';
import { PHOTO_NIGHT } from './photos';
import { MAP_AT, MAP_DUR, MAP_UI_AT, ROUTE_AT, cd, clamp01, lerp } from './scaffoldScript';

/* 路线图。详情页收成顶部一枚缩略图，底下铺开一张近乎全黑的地图。

   这一屏在全片里的位置：前面每一步都在「生成」，到这里生成结束、开始**用**。
   所以它不再有蓝图、没有进度、没有小球 —— 只有结果本身和两个站点。
   深色延续详情页，但语气又变了一次：详情页是看，地图是走。

   地图本身照原片的构造建：极暗的底 + 细路网 + 四团斜纹圆斑（街区）
   + 当前位置的白点与同心圈 + 目的地的红点 + 一圈很小的全大写地名。
   路网是手写的折线常量 —— 它要的是「像一张地图」，不是一张真地图。
*/

const ROADS = [
  'M46 132 L200 378 L252 556 L236 844',
  'M200 378 L128 216 L104 128',
  'M200 378 L286 292 L340 246',
  'M200 378 L292 396 L390 372',
  'M200 378 L104 476 L28 516',
  'M0 288 L128 216 L232 168 L318 190',
  'M292 396 L268 520 L300 660 L390 706',
  'M28 516 L120 592 L236 640',
];

/* 四团斜纹圆斑：街区。用 pattern 铺，不用几百个节点 */
const BLOBS = [
  { cx: 272, cy: 184, r: 44 },
  { cx: 120, cy: 542, r: 38 },
  { cx: 310, cy: 538, r: 40 },
  { cx: 58, cy: 214, r: 26 },
];

const PLACES = [
  { x: 128, y: 216, r: 6, fill: '#fff', label: 'TOKYO\nSKYTREE', lx: 6, ly: 12 },
  { x: 292, y: 396, r: 2.6, fill: '#c9cdd6', label: 'TOKYO TOWER', lx: 8, ly: 3 },
  { x: 64, y: 490, r: 2.6, fill: '#c9cdd6', label: 'UENO PARK', lx: 8, ly: 3 },
];

const MAP_BG = 'radial-gradient(120% 70% at 50% 34%, #0c1417 0%, #070b0d 46%, #04070a 100%)';

const IconBookmark = () => (
  <svg width="17" height="19" viewBox="0 0 17 19" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round">
    <path d="M2.4 2.2h12.2v14.6L8.5 12.6 2.4 16.8V2.2Z" />
  </svg>
);

const IconCorner = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#e6e8ee" strokeWidth="1.5" strokeLinecap="round">
    <path d="M11 4H5v6" />
  </svg>
);

const Compass = () => (
  <span
    className="absolute grid place-items-center rounded-[16px]"
    style={{
      left: 302,
      top: 600,
      width: 52,
      height: 56,
      background: 'rgba(34,38,44,0.72)',
      boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.14)',
      backdropFilter: 'blur(10px)',
    }}
  >
    <svg width="20" height="22" viewBox="0 0 20 22" fill="none">
      <path d="M10 2 16 19 10 15.4 4 19 10 2Z" fill="#ffffff" />
      <path d="M10 2 13 10.5 10 9V2Z" fill="#e2504a" />
    </svg>
  </span>
);

const STOPS = [
  { name: 'Senso-ji Temple', time: '30 min', done: true },
  { name: 'Shibuya Crossing', time: '1h 20 min', done: false },
];

export const RouteMap = ({ T, out }: { T: number; out: number }) => {
  const p = cd((T - MAP_AT) / MAP_DUR);
  const gone = clamp01(out);
  if (p <= 0.001 || gone >= 0.999) return null;

  const ui = cd((T - MAP_UI_AT) / 480);
  const route = cd((T - ROUTE_AT) / 900);

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ background: MAP_BG, opacity: clamp01(p * 1.6) * (1 - gone), borderRadius: 46 }}
    >
      {/* 详情页那张照片收成顶部一枚缩略图，一半在屏幕外 ——
          它是「你从哪儿来」的存根，不是一个新元素 */}
      <span
        className="absolute overflow-hidden bg-cover bg-center"
        style={{
          left: 163,
          top: lerp(-120, -46, p),
          width: 64,
          height: 150,
          borderRadius: 18,
          backgroundImage: `url(${PHOTO_NIGHT})`,
          opacity: p,
        }}
      />

      <svg className="absolute inset-0" width={SCREEN_W} height={SCREEN_H} fill="none">
        <defs>
          <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="#5b6470" strokeWidth="1.6" />
          </pattern>
        </defs>

        {BLOBS.map((b, i) => (
          <circle key={i} cx={b.cx} cy={b.cy} r={b.r} fill="url(#hatch)" opacity={0.55 * p} />
        ))}

        {/* 路网：整体淡入，不逐条描 —— 地图是本来就在的，不是被生成出来的 */}
        {ROADS.map((d, i) => (
          <path key={i} d={d} stroke="#8d949f" strokeWidth={i === 0 ? 1.5 : 1} opacity={(i === 0 ? 0.7 : 0.46) * p} />
        ))}

        {/* 走过的那一段更亮 —— 路线是叠在路网之上的一层，不是路网本身 */}
        <path
          d="M128 216 L200 378 L232 478"
          stroke="#ffffff"
          strokeWidth="1.4"
          opacity={0.72}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - route}
        />

        {/* 当前位置：白点 + 三圈很淡的同心环 */}
        {[26, 40, 55].map((r, i) => (
          <circle key={r} cx={200} cy={378} r={r * lerp(0.7, 1, p)} stroke="#c8cfda" strokeWidth="0.8" opacity={(0.2 - i * 0.05) * p} />
        ))}
        <circle cx={200} cy={378} r={16 * p} fill="#ffffff" opacity={0.12} />
        <circle cx={200} cy={378} r={6.5 * p} fill="#ffffff" />

        {PLACES.map((s) => (
          <circle key={s.label} cx={s.x} cy={s.y} r={s.r * p} fill={s.fill} />
        ))}

        {/* 目的地：全片唯一的红 */}
        <circle cx={232} cy={478} r={4.4 * route} fill="#e2504a" />
      </svg>

      {PLACES.map((s) => (
        <span
          key={s.label}
          className="absolute whitespace-pre uppercase leading-[11px]"
          style={{ left: s.x + s.lx, top: s.y + s.ly, fontSize: 7.5, letterSpacing: '0.12em', color: '#9aa2ae', opacity: p * 0.9 }}
        >
          {s.label}
        </span>
      ))}
      <span
        className="absolute uppercase"
        style={{ left: 44, top: 158, fontSize: 8, letterSpacing: '0.2em', color: '#8f97a3', opacity: p * 0.8, transform: 'rotate(-90deg)', transformOrigin: 'left top' }}
      >
        ASAKUSA
      </span>
      <span
        className="absolute uppercase"
        style={{ left: 214, top: 486, fontSize: 8, letterSpacing: '0.18em', color: '#b9c0ca', opacity: route * 0.95, transform: 'rotate(72deg)', transformOrigin: 'left top' }}
      >
        SENSO-JI TEMPLE
      </span>

      <Compass />

      {/* 底部：左边一块收藏，右边两站的清单 */}
      <div className="absolute" style={{ left: 26, top: 676, opacity: ui, transform: `translateY(${(1 - ui) * 14}px)` }}>
        <span
          className="relative grid h-[124px] w-[124px] place-items-center rounded-[26px]"
          style={{ background: 'rgba(30,34,40,0.74)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.13)', backdropFilter: 'blur(12px)' }}
        >
          <IconBookmark />
          <span
            className="absolute bottom-[-8px] left-[-8px] grid h-[54px] w-[54px] place-items-center rounded-[20px]"
            style={{ background: 'rgba(214,218,226,0.9)' }}
          >
            <span className="text-[#2a2e36]">
              <IconCorner />
            </span>
          </span>
        </span>
      </div>

      <div
        className="absolute rounded-[26px] px-[18px] py-[16px]"
        style={{
          left: 164,
          top: 676,
          width: 200,
          height: 124,
          background: 'rgba(30,34,40,0.74)',
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.13)',
          backdropFilter: 'blur(12px)',
          opacity: ui,
          transform: `translateY(${(1 - ui) * 14}px)`,
        }}
      >
        {STOPS.map((s, i) => (
          <div key={s.name} className="relative flex items-start gap-[10px]" style={{ marginTop: i ? 22 : 0 }}>
            <span className="mt-[4px] block shrink-0" style={{ width: 8, height: 8 }}>
              {s.done ? (
                <span className="block h-[8px] w-[8px] rounded-full bg-[#e2504a]" />
              ) : (
                <span className="block h-[8px] w-[8px] rounded-full" style={{ boxShadow: 'inset 0 0 0 1.4px #9aa2ae' }} />
              )}
            </span>
            <span className="min-w-0">
              <span className="block whitespace-nowrap text-[13.5px] font-semibold leading-none text-white">{s.name}</span>
              <span className="mt-[5px] block text-[11.5px] leading-none text-[#8f97a3]">{s.time}</span>
            </span>
            {i === 0 && (
              <span className="absolute left-[3.5px] top-[14px] block w-px" style={{ height: 20, background: 'rgba(154,162,174,0.5)' }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
