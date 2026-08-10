import { IconMic, IconPlus, IconSend } from './phoneIcons';
import { QUERY, SEND_AT, SEND_SWAP_DUR, TYPE_AT, TYPE_END, cd, clamp01, lastCharIn, lerp, typedCount } from './scaffoldScript';

/* 键盘态的输入条。和主页那条不是同一个东西：

   主页是「一颗胶囊 + 一个麦克风钮」；这里是「一个加号钮 + 裸文字 + 一个右钮」，
   中间**没有胶囊底**，字直接压在壁纸上。

   原片 14.0s 那一帧取样出来的（这一版是照像素改的，不是照印象）：
   · 行心 549，两颗钮心 x=42 / x=348，钮径都是 50 —— 发送钮不比麦克风大
   · 钮底只是很淡的一层白：底色 212 上盖出 225，也就是白 α≈0.32，**没有描边圈**
   · 加号本身比想象的宽（20px）也比想象的细
   · 正文墨是 (39,42,62) 的深蓝灰，不是近黑；光标反而近纯黑
   · 发送钮是 (16,23,41) 的深藏青，不是中性黑，也没有外发光

   麦克风换发送不是两颗钮交叉淡入淡出 —— 原片 14.25 那一帧是**一颗灰盘**，
   说明是同一颗钮的底色在变。交叉淡入会在中点同时半透明，读作「糊了一下」。
*/

const ROW_TOP = 522;
const ROW_H = 54;
const BTN = 50;

export const ChatComposer = ({ T, show }: { T: number; show: number }) => {
  const a = clamp01(show);
  if (a <= 0.001) return null;

  const n = typedCount(T);
  const typed = QUERY.slice(0, n);
  const lastIn = lastCharIn(T);

  const swap = cd((T - TYPE_AT) / SEND_SWAP_DUR);
  /* 按下去那一下：一个很短的回弹，不是缩到底 */
  const press = 1 - 0.12 * Math.sin(Math.PI * clamp01((T - SEND_AT) / 220));
  /* 光标打完就撤，原片打完那一帧就没有了。中途不闪 —— 闪烁在这种慢镜里读作抖动 */
  const caret = 1 - cd((T - TYPE_END) / 140);

  /* 光标直接写在下面，不抽成组件 —— 在 render 里定义组件等于每帧换一个
     组件类型，React 会把这个节点卸载重挂一次，看上去就是在闪。 */
  const caretStyle = { height: 19, opacity: caret };

  return (
    <div className="pointer-events-none absolute inset-x-0" style={{ top: ROW_TOP, height: ROW_H, opacity: a }}>
      <span
        className="absolute grid place-items-center rounded-full"
        style={{
          left: 42 - BTN / 2,
          top: (ROW_H - BTN) / 2,
          width: BTN,
          height: BTN,
          background: 'rgba(255,255,255,0.32)',
        }}
      >
        <IconPlus />
      </span>

      <span className="absolute flex items-center" style={{ left: 84, top: 0, height: ROW_H, fontSize: 14.5 }}>
        {n === 0 ? (
          <>
            <span className="block w-[1.6px] rounded-[1px] bg-[#14141c]" style={caretStyle} />
            <span className="text-[#7d818e]">Type a message...</span>
          </>
        ) : (
          <>
            <span className="tracking-[-0.005em] text-[#2a2d40]" style={{ whiteSpace: 'pre' }}>
              {typed.slice(0, -1)}
              <span style={{ opacity: lastIn }}>{typed.slice(-1)}</span>
            </span>
            <span className="block w-[1.6px] rounded-[1px] bg-[#14141c]" style={caretStyle} />
          </>
        )}
      </span>

      {/* 同一颗钮：底色从半透明白推到深藏青，麦克风退、chevron 进 */}
      <span
        className="absolute grid place-items-center rounded-full"
        style={{
          left: 348 - BTN / 2,
          top: (ROW_H - BTN) / 2,
          width: BTN,
          height: BTN,
          background: `rgba(${lerp(255, 16, swap)},${lerp(255, 23, swap)},${lerp(255, 41, swap)},${lerp(0.32, 1, swap)})`,
          transform: `scale(${press})`,
        }}
      >
        <span className="absolute text-[#4a4a52]" style={{ opacity: 1 - swap }}>
          <IconMic />
        </span>
        <span className="absolute" style={{ opacity: swap }}>
          <IconSend />
        </span>
      </span>
    </div>
  );
};
