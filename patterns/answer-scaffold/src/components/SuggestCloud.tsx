import { CHIPS, CHIP_DUR, CHIP_STEP, DISC_DUR, LINK_AT, LINK_DUR, cd, clamp01, lerp } from './scaffoldScript';

/* 卡片下方那一团：连接点 → 点阵盘 → 建议 chips。

   顺序不能乱，它讲的是因果：
   触点落在卡底 → 从那儿垂下一小截连接线 → 连接头处炸开一个点阵盘 →
   chips 从盘的两侧浮出来。倒过来做就只是「底下出现了一些按钮」。

   点阵盘是同心环排布的**白点**，中间疏、外圈密，中心一个深色加号。
   原片取样：底色 213，点心 226–239 —— 点比底亮，不是灰点。
   它不是装饰性的粒子 —— 它是「这里还能加更多」那个入口的形。

   chips 比屏幕宽，两侧被裁掉；最后一行向下淡出。
   原片就是这样：要说的是「建议还有很多」，不是「这里有四条建议」。
*/

const RINGS = [26, 34, 42, 50, 58, 66, 74, 82];

/* 盘心跟 chips 第一行齐平，不是压在三行的正中间。
   原片 7.6s：盘中央那个加号在 CSS y=703，第一行 chip 的字心在 727 —— 差 24。
   我原来把盘放在整块的几何中心，结果盘沉在 chips 下面，
   读作「chips 上面浮着一个盘」，而不是「chips 从盘里散出来」。 */
const DISC_UP = -75;

/* 这盘有五百个点，而且它们的相对位置和明暗**从头到尾不变** ——
   变的只是外层那一个 transform / opacity。
   所以整张 svg 提到模块层只建一次；每帧重建五百个 <circle>
   会让主时间轴掉帧，那就是「动效不顺滑」的来源，不是缓动曲线的问题。 */
const DISC_SVG = (
  <svg width="180" height="180" viewBox="-90 -90 180 180" fill="none">
    {RINGS.map((r, ri) => {
      const n = Math.round(r * 1.15);   // 半径越大点越多，密度才均匀
      return Array.from({ length: n }, (_, i) => {
        const th = (i / n) * Math.PI * 2;
        // 外圈更密也更淡，形成一层向外散开的雾
        const o = lerp(0.86, 0.2, ri / (RINGS.length - 1));
        return <circle key={`${ri}-${i}`} cx={Math.cos(th) * r} cy={Math.sin(th) * r} r={1.05} fill="#ffffff" opacity={o} />;
      });
    })}
  </svg>
);

const DotDisc = ({ p, fade, out }: { p: number; fade: number; out: number }) => {
  const a = clamp01(p);
  if (a <= 0.001) return null;
  /* 进入输入态之后，这个盘不退场 —— 它变淡、变大、往下沉一点，
     顶上压一道渐隐，只剩下半圈托在那句话下面。
     它一直是「agent 在这儿」的那个形，不是刚才那一步的装饰。 */
  return (
    <div
      className="pointer-events-none absolute left-1/2 top-1/2"
      style={{
        transform: `translate3d(-50%,-50%,0) translateY(${DISC_UP + fade * 18}px) scale(${lerp(0.72, 1, a) * lerp(1, 1.18, fade)})`,
        opacity: a * lerp(1, 0.62, fade) * (1 - out),
        willChange: 'transform, opacity',
        maskImage: fade > 0.01 ? `linear-gradient(180deg, rgba(0,0,0,${lerp(1, 0, fade)}) 30%, #000 62%)` : undefined,
        WebkitMaskImage: fade > 0.01 ? `linear-gradient(180deg, rgba(0,0,0,${lerp(1, 0, fade)}) 30%, #000 62%)` : undefined,
      }}
    >
      {DISC_SVG}
      <span
        className="absolute left-1/2 top-1/2 block"
        style={{ transform: 'translate(-50%,-50%)', opacity: 1 - fade }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 3.5v13M3.5 10h13" stroke="#4b4b53" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      </span>
    </div>
  );
};

/* base 是这一团的起点；盘比连接点晚 120，chips 再晚 80 —— 三段的相对节拍
   在第二段和第四段是同一套，所以参数化的是起点，不是每一段各写一遍。
   linkLen 让那截线能拉长去够下面新生成的卡片。 */
export const SuggestCloud = ({
  T,
  width,
  fade = 0,
  base = LINK_AT,
  chips = CHIPS,
  linkLen = 34,
  discOut = 0,
}: {
  T: number;
  width: number;
  fade?: number;
  base?: number;
  chips?: typeof CHIPS;
  linkLen?: number;
  /* 第四段里这盘要彻底退掉，只留那截连接线去够新卡片 */
  discOut?: number;
}) => {
  const link = cd((T - base) / LINK_DUR);
  const disc = cd((T - base - 120) / DISC_DUR);
  const f = clamp01(fade);

  return (
    <div className="relative" style={{ width }}>
      {/* 连接点：白圆头骑在卡片底边上，再往下垂一截线。
          顺序是「先有头、后有线」—— 头是触点落地的位置，线是从它牵出去的。 */}
      <div className="relative mx-auto flex flex-col items-center" style={{ height: linkLen }}>
        <span
          className="block rounded-full bg-white"
          style={{
            width: 17,
            height: 17,
            marginTop: -8.5,
            transform: `scale(${cd((T - base) / 260)})`,
            boxShadow: '0 1px 4px rgba(40,44,60,0.18)',
          }}
        />
        <span
          className="block w-px bg-white"
          style={{ height: linkLen * link, marginTop: -1, opacity: link * 0.6 }}
        />
      </div>

      {/* 盘与 chips 同处一层：盘在中间，chips 从两侧压上来 */}
      <div className="relative" style={{ height: 210 }}>
        <DotDisc p={disc} fade={f} out={clamp01(discOut)} />

        {/* 最后一行往下淡出，用的是**遮罩**不是盖一层浅色。
            盖浅色要跟背景同色才不露馅，而背景是会变的 ——
            之前那层 #f0f1f6 在壁纸变深之后就成了一块亮方块，
            底边还留一道 38 灰阶的硬边。遮罩对任何背景都成立。 */}
        <div
          className="absolute inset-0"
          style={{
            maskImage: 'linear-gradient(180deg,#000 58%,transparent 90%)',
            WebkitMaskImage: 'linear-gradient(180deg,#000 58%,transparent 90%)',
          }}
        >
        {/* 退干净了就整个不渲染。六颗 chip 各带一层 backdrop-filter，
            即使 opacity 归零它们仍然每帧参与合成 —— 这是白付的钱。 */}
        {f < 0.995 && [0, 1, 2].map((row) => (
          <div
            key={row}
            className="absolute flex w-full items-center justify-between"
            style={{ top: row * 56 + 8, left: 0 }}
          >
            {(['l', 'r'] as const).map((side) => {
              const idx = chips.findIndex((c) => c.row === row && c.side === side);
              if (idx < 0) return <span key={side} />;
              const c = chips[idx];
              const p = cd((T - base - 200 - idx * CHIP_STEP) / CHIP_DUR);
              // 最后一行本来就该淡出去 —— 它是「还有更多」的省略号
              const rowFade = row === 2 ? 0.2 : 1;
              return (
                <span
                  key={side}
                  className="whitespace-nowrap rounded-full px-[16px] py-[11px] text-[13.5px] text-[#33333a]"
                  style={{
                    background: 'rgba(255,255,255,0.72)',
                    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.6)',
                    backdropFilter: 'blur(10px)',
                    opacity: p * rowFade * (1 - f),
                    transform: `translate(${side === 'l' ? -34 : 34}px, ${(1 - p) * 16}px)`,
                  }}
                >
                  {c.text}
                </span>
              );
            })}
          </div>
        ))}
        </div>
      </div>
    </div>
  );
};
