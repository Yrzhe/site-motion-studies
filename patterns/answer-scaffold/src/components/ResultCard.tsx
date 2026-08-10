import { AirlineMark } from './phoneIcons';
import { PHOTO_AVATAR, PHOTO_FUJI } from './photos';
import { AVA_AT, AVA_DUR, CARD2, CARD2_AT, CARD2_DUR, FRAME, PHOTO2_AT, PHOTO2_DUR, cd, clamp01, lerp } from './scaffoldScript';

/* 生成出来的卡片。位置和尺寸就是取景框那一格 —— 一模一样，不差一像素，
   否则前面那套「先占位再填」就白做了。

   照片是**长出来的**：先低饱和、去焦、略放大，再收清晰。
   不是淡入 —— 淡入读作「图早就在」，去焦收敛读作「刚算出来」。全片一致。

   右上角那簇头像骑在卡角上：一个半透明圆盘里挤着三个小圆
   （人像 / 航司 / 另一个协作方）。它说的是「这张卡是谁凑出来的」。
*/

const PAD = 24;

export const ResultCard = ({ T, shrink = 0 }: { T: number; shrink?: number }) => {
  const g = cd((T - CARD2_AT) / CARD2_DUR);
  if (g <= 0.001) return null;
  /* 让位给两个子结果：就地缩到 0.77 并往上收 46。
     原片量的：卡片从 286–596 变成 234–481，宽 214→165。 */
  const k = clamp01(shrink);
  const ph = cd((T - PHOTO2_AT) / PHOTO2_DUR);
  const ava = cd((T - AVA_AT) / AVA_DUR);

  const title = cd((T - CARD2_AT - 180) / 420);
  const sub = cd((T - CARD2_AT - 300) / 420);
  const cta = cd((T - CARD2_AT - 420) / 420);

  return (
    <div
      className="pointer-events-none absolute"
      style={{
        left: FRAME.x,
        top: FRAME.y,
        width: FRAME.w,
        height: FRAME.h,
        transform: `translateY(${-46 * k}px) scale(${lerp(1, 0.77, k)})`,
        transformOrigin: 'top center',
      }}
    >
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          borderRadius: FRAME.r,
          opacity: clamp01(g * 1.4),
          transform: `scale(${lerp(0.94, 1, g)})`,
          background: '#1b3247',
          boxShadow: `0 ${18 * g}px ${44 * g}px rgba(34,40,60,${0.14 * g})`,
        }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${PHOTO_FUJI})`,
            /* 透明度跟着卡片一起来，去焦和饱和度才用 ph ——
               否则卡片先亮成一块灰板，照片才姗姗来迟，读作「加载失败」 */
            opacity: clamp01(g * 1.3),
            transform: `scale(${lerp(1.1, 1, ph)})`,
            filter: `blur(${lerp(11, 0, ph)}px) saturate(${lerp(0.25, 1, ph)})`,
          }}
        />
        {/* 底部压一道暗，白字才站得住。照片本身下三分之一已经偏暗，这层只是收口 */}
        <div
          className="absolute inset-x-0 bottom-0"
          style={{ height: '52%', background: 'linear-gradient(180deg, rgba(14,28,44,0) 0%, rgba(14,28,44,0.42) 56%, rgba(14,28,44,0.68) 100%)' }}
        />

        {/* 153 / 256 都是从卡顶量的：原片标题首行顶边 y=439、按钮顶边 y=542，卡顶 286 */}
        <div className="absolute inset-x-0" style={{ top: 153, paddingLeft: PAD, paddingRight: PAD }}>
          <div
            style={{
              fontSize: 22,
              lineHeight: '23px',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: '#fff',
              opacity: title,
              transform: `translateY(${(1 - title) * 8}px)`,
            }}
          >
            {CARD2.title.map((l) => (
              <div key={l}>{l}</div>
            ))}
          </div>
          <div
            className="mt-[13px]"
            style={{
              fontSize: 15.5,
              lineHeight: '19px',
              color: 'rgba(255,255,255,0.86)',
              opacity: sub,
              transform: `translateY(${(1 - sub) * 8}px)`,
            }}
          >
            {CARD2.sub.map((l) => (
              <div key={l}>{l}</div>
            ))}
          </div>
        </div>

        <div
          className="absolute grid place-items-center rounded-full bg-white"
          style={{
            left: PAD + 2,
            right: PAD + 2,
            top: 256,
            height: 29,
            fontSize: 13.5,
            fontWeight: 600,
            color: '#1b1c25',
            opacity: cta,
            transform: `translateY(${(1 - cta) * 10}px)`,
          }}
        >
          {CARD2.cta}
        </div>
      </div>

      {/* 头像簇：骑在卡片右上角上，半个在卡里半个在卡外 */}
      <span
        className="absolute rounded-full"
        style={{
          left: FRAME.w - 44,
          top: -22,
          width: 67,
          height: 67,
          opacity: ava,
          transform: `scale(${lerp(0.7, 1, ava)})`,
          background: 'rgba(228,236,246,0.72)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <span
          className="absolute block rounded-full bg-cover bg-center"
          style={{ left: 13, top: 12, width: 26, height: 26, backgroundImage: `url(${PHOTO_AVATAR})`, boxShadow: '0 0 0 2px rgba(214,58,58,0.9)' }}
        />
        <span className="absolute grid place-items-center rounded-full bg-white" style={{ left: 38, top: 15, width: 22, height: 22 }}>
          <AirlineMark size={13} />
        </span>
        <span
          className="absolute block rounded-full"
          style={{
            left: 22,
            top: 36,
            width: 23,
            height: 23,
            background: 'radial-gradient(circle at 38% 32%, #6f6ba8 0%, #3a3670 60%, #241f4a 100%)',
          }}
        />
      </span>
    </div>
  );
};
