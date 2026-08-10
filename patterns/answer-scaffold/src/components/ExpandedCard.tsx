import { AirlineMark, IconMoon } from './phoneIcons';
import { PHOTO_CITY } from './photos';
import { CARD, PHOTO_AT, PHOTO_DUR, TITLE_AT, TITLE_DUR, cd, clamp01, lerp } from './scaffoldScript';

/* 展开后的航班卡。

   和主页那张的区别不只是变大：**信息重排了**。
   主页是「22:30 / JFK」两行；展开后是「JFK / 22:30 / New York」三行，
   中间还多了 8h 10m。同一件事，给的深度不同 —— 这是展开该有的意义，
   否则只是把同一张卡放大。

   照片不是淡入的，是从一小块模糊放大变清晰的（原片 6.00→6.20s）。
   淡入读作「图早就在」，放大去焦读作「刚生成好」。
*/

export const CARD_W = 358;
export const PHOTO_H = 176;

/* 卡片自己的高度是可以算出来的 —— 外面要靠它做缩放后的占位补偿，
   不能等浏览器量完再说，否则就不是 f(T) 的纯函数了。
   184 = 照片段（176+8）· 184 = 文本段 90 + 时刻条 94 · 27 = 「Flight from」那行 */
export const cardHeight = (grow: number, collapse: number) => {
  const g = clamp01(grow);
  const c = clamp01(collapse);
  return 184 * g * (1 - c) + 184 + lerp(27, 0, c) + lerp(24, 0, c);
};

export const ExpandedCard = ({ T, grow, collapse = 0 }: { T: number; grow: number; collapse?: number }) => {
  const g = clamp01(grow);
  const c = clamp01(collapse);
  const title = cd((T - TITLE_AT) / TITLE_DUR);
  const ph = cd((T - PHOTO_AT) / PHOTO_DUR);

  return (
    <div style={{ width: CARD_W }}>
      {/* 标题落在卡外面 —— 它说的是「这一屏是什么」，不属于卡片 */}
      <div
        className="overflow-hidden text-center text-[12px] text-[#8b8b92]"
        style={{
          height: lerp(24, 0, c),
          opacity: title * (1 - c),
          transform: `translateY(${(1 - title) * -6}px)`,
        }}
      >
        {CARD.title}
      </div>

      <div
        className="overflow-hidden rounded-[30px]"
        style={{
          background: 'rgba(255,255,255,0.62)',
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.7), 0 14px 40px rgba(40,44,60,0.08)',
          backdropFilter: 'blur(24px) saturate(1.2)',
        }}
      >
        {/* 照片：容器高度随 grow 长开，图本身再从小放大去焦 */}
        <div className="px-[8px] pt-[8px]" style={{ height: (PHOTO_H + 8) * g * (1 - c), overflow: 'hidden' }}>
          {/* 照片没来之前这里是浅色的空位，不是黑块 ——
              黑块会读作「图挂了」，浅色才读作「还没生成」 */}
          <div
            className="overflow-hidden rounded-[24px]"
            style={{ height: PHOTO_H, background: `rgba(${lerp(244, 14, ph)},${lerp(246, 20, ph)},${lerp(250, 32, ph)},1)` }}
          >
            <div
              className="h-full w-full bg-cover bg-center"
              style={{
                backgroundImage: `url(${PHOTO_CITY})`,
                opacity: clamp01(ph * 1.6),
                transform: `scale(${lerp(0.82, 1, ph)})`,
                filter: `blur(${lerp(9, 0, ph)}px)`,
              }}
            />
          </div>
        </div>

        <div className="flex items-start gap-3 px-[18px] pb-[14px] pt-[16px]">
          <div className="min-w-0 flex-1">
            {/* 收成上下文条时「Flight from」整行收掉，只留航线本身 ——
                这一行是给完整卡片用的引导语，压缩之后它就是废字 */}
            <div className="text-[21px] leading-[1.28] tracking-[-0.02em] text-[#17171a]">
              <span className="block overflow-hidden" style={{ height: lerp(27, 0, c), opacity: 1 - c }}>
                {CARD.from}
              </span>
              <span className="block">{CARD.route}</span>
            </div>
            <span
              className="mt-[11px] inline-flex items-center gap-[6px] rounded-full px-[9px] py-[4px] text-[11.5px] text-[#5f5f68]"
              style={{ background: 'rgba(255,255,255,0.85)' }}
            >
              <IconMoon />
              {CARD.code}
            </span>
          </div>
          <span className="relative mt-[2px] flex shrink-0">
            <span className="relative z-10 grid h-[36px] w-[36px] place-items-center rounded-full bg-white shadow-[0_1px_3px_rgba(40,44,60,0.12)]">
              <AirlineMark />
            </span>
            <span className="-ml-[12px] grid h-[38px] w-[38px] place-items-center rounded-full bg-[#3d63d9] text-[13.5px] font-medium text-white shadow-[0_1px_3px_rgba(40,44,60,0.16)]">
              A6
            </span>
          </span>
        </div>

        {/* 更白的一段：三列。左右各三行（代码 / 时刻 / 城市），中间是弧与时长。 */}
        <div
          className="mx-[8px] mb-[8px] flex items-center rounded-[26px] px-[16px] py-[14px]"
          style={{ background: 'rgba(255,255,255,0.78)' }}
        >
          <span className="shrink-0">
            <span className="block text-[12.5px] text-[#8b8b92]">{CARD.dep.iata}</span>
            <span className="mt-[2px] block text-[21px] font-medium leading-none tracking-[-0.02em] text-[#17171a]">
              {CARD.dep.time}
            </span>
            <span className="mt-[5px] block text-[12.5px] text-[#3f3f47]">{CARD.dep.city}</span>
          </span>

          <span className="mx-[10px] flex-1">
            <svg width="100%" height="20" viewBox="0 0 140 20" fill="none" preserveAspectRatio="none">
              <path
                d="M5 14C34 3 106 2 135 12"
                stroke="#9a9aa2"
                strokeWidth="1.1"
                strokeDasharray="2.6 3.6"
                strokeLinecap="round"
              />
              <circle cx="5" cy="14" r="3.2" fill="#54545c" />
              <circle cx="135" cy="12" r="2.6" fill="#b3b3ba" />
            </svg>
            <span className="mt-[6px] block text-center text-[11.5px] text-[#8b8b92]">{CARD.dur}</span>
          </span>

          <span className="shrink-0 text-right">
            <span className="block text-[12.5px] text-[#8b8b92]">{CARD.arr.iata}</span>
            <span className="mt-[2px] block text-[21px] font-medium leading-none tracking-[-0.02em] text-[#17171a]">
              {CARD.arr.time}
            </span>
            <span className="mt-[5px] block text-[12.5px] text-[#3f3f47]">{CARD.arr.city}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
