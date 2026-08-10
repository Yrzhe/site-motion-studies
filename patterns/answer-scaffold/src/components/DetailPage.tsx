import { SCREEN_H, SCREEN_W } from './HomeScreen';
import { PHOTO_NIGHT_FULL } from './photos';
import { DETAIL, DETAIL_AT, DETAIL_STEP, OPEN_AT, OPEN_DUR, SLOT, cd, clamp01, lerp } from './scaffoldScript';

/* 详情页。全片唯一一次翻深色 —— 连状态栏都反色。

   前面五段都在浅色里谈「这东西是怎么算出来的」：取景框、进度、分叉、错开。
   这一段不谈过程，只给内容。底色一翻，语气就从「系统在工作」
   切到「你在看一个地方」。深色不是风格选择，是话题切换的标点。

   转场是**同一张瓦片长满全屏**，不是推入一个新页面：
   你点的那一块变成了你看的这一屏。跟第二段航班卡展开是同一句话，
   全片的空间逻辑因此是连续的 —— 没有任何东西凭空出现过。
*/

const TILE = { x: SLOT.x[1], y: SLOT.y, w: SLOT.w, h: SLOT.h, r: SLOT.r };

const IconBack = () => (
  <svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.6 3.4 5.4 8.5l5.2 5.1" />
  </svg>
);

const IconRoute = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round">
    <path d="M14.4 1.6 1.9 7.2c-.5.2-.5.9 0 1.1l5 1.9 1.9 5c.2.5.9.5 1.1 0l4.5-13.6Z" />
  </svg>
);

const IconPlus = () => (
  <svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round">
    <path d="M8.5 1.8v13.4M1.8 8.5h13.4" />
  </svg>
);

const SURFACE = {
  background: 'rgba(38,40,46,0.62)',
  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.16)',
  backdropFilter: 'blur(14px)',
};

export const DetailPage = ({ T, fade = 0 }: { T: number; fade?: number }) => {
  const open = cd((T - OPEN_AT) / OPEN_DUR);
  const f = clamp01(fade);
  if (open <= 0.001 || f >= 0.999) return null;

  /* 瓦片那一格 → 整块屏幕。位置、尺寸、圆角一起走，中间任何一帧都是一个合法的矩形 */
  const x = lerp(TILE.x, 0, open);
  const y = lerp(TILE.y, 0, open);
  const w = lerp(TILE.w, SCREEN_W, open);
  const h = lerp(TILE.h, SCREEN_H, open);
  const r = lerp(TILE.r, 46, open);

  const at = (i: number) => cd((T - DETAIL_AT - i * DETAIL_STEP) / 420);
  const rise = (p: number) => `translateY(${(1 - p) * 12}px)`;

  return (
    <div className="pointer-events-none absolute overflow-hidden" style={{ left: x, top: y, width: w, height: h, borderRadius: r, opacity: 1 - f }}>
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${PHOTO_NIGHT_FULL})` }} />
      {/* 底下压得比结果卡重得多 —— 这一屏的字更大、更多，也更该被看清 */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{ height: '58%', background: 'linear-gradient(180deg, rgba(8,10,14,0) 0%, rgba(8,10,14,0.62) 46%, rgba(8,10,14,0.9) 100%)' }}
      />
      {/* 顶部一点点暗，状态栏的白字才不至于压在霓虹上 */}
      <div
        className="absolute inset-x-0 top-0"
        style={{ height: 120, background: 'linear-gradient(180deg, rgba(8,10,14,0.5) 0%, rgba(8,10,14,0) 100%)', opacity: open }}
      />

      {/* 文字层不能放在正在放大的那个盒子里 —— 它的坐标系还没到位，
          中途会把标题摆到屏幕中间去。所以这一层反向抵消掉外层的位移与缩放，
          始终按整屏 390×844 排版。 */}
      <div
        className="absolute left-0 top-0"
        style={{
          width: SCREEN_W,
          height: SCREEN_H,
          transform: `translate(${-x}px, ${-y}px)`,
          opacity: clamp01(open * 2 - 1),
        }}
      >
        <span
          className="absolute inline-flex items-center rounded-full px-[10px] py-[6px] text-[10px] uppercase tracking-[0.11em] text-white/90"
          style={{ left: 28, top: 570, opacity: at(0), transform: rise(at(0)), ...SURFACE }}
        >
          {DETAIL.kicker}
        </span>

        <div
          className="absolute font-bold tracking-[-0.02em] text-white"
          style={{ left: 28, top: 610, fontSize: 34, lineHeight: '38px', opacity: at(1), transform: rise(at(1)) }}
        >
          {DETAIL.title}
        </div>

        <div
          className="absolute leading-[21px] text-white/70"
          style={{ left: 28, top: 660, fontSize: 15, opacity: at(2), transform: rise(at(2)) }}
        >
          {DETAIL.body.map((l) => (
            <div key={l}>{l}</div>
          ))}
        </div>

        {/* 三个控件几乎顶到屏幕两边 —— 这一屏是内容，边距让给图 */}
        <div
          className="absolute flex items-center gap-[10px]"
          style={{ left: 12, right: 12, top: 753, opacity: at(3), transform: rise(at(3)) }}
        >
          <span className="grid h-[66px] w-[66px] shrink-0 place-items-center rounded-full" style={SURFACE}>
            <IconBack />
          </span>
          <span
            className="flex h-[66px] flex-1 items-center justify-center gap-[9px] rounded-full text-[15px] text-white"
            style={SURFACE}
          >
            <IconRoute />
            {DETAIL.cta}
          </span>
          <span className="grid h-[66px] w-[66px] shrink-0 place-items-center rounded-full" style={SURFACE}>
            <IconPlus />
          </span>
        </div>
      </div>
    </div>
  );
};
