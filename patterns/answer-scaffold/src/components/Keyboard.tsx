import type { ReactNode } from 'react';
import { SCREEN_H } from './HomeScreen';
import { clamp01 } from './scaffoldScript';

/* iOS 键盘。所有尺寸都是在原片 14.0s 那一帧上按像素扫出来的
   （逐行取一条在字形上方的扫描线，量每个键的左右边界），不是目测：

   · 行顶 590 / 642 / 695 / 746，键高 40，行距 52.9
   · 键宽 32、缝 6.5、列距 38.5；第一行左边距 6、右边距 5
   · 第三行 shift 与 backspace 宽 43，与字母之间的缝是 15 不是 6
   · 第四行 ABC 86 / space 187 / return 86

   颜色也是取样的：白键 (242,244,247)、灰键 (160,165,187)、字母墨近乎纯黑。
   灰键比想象的深不少 —— 做浅了整块键盘就飘着。

   没有数字行、没有地球键 —— 原片就是这么简化的，别自己补回来。

   升起是**整块位移**：原片 10.53 那一帧只有第一行露在屏幕下边缘。
   键面是静态的，所以整棵子树提到模块层只建一次 ——
   每帧重建四十个键会让主时间轴掉帧，那才是「不顺滑」的真正来源。
*/

const KB_TOP = 590;
const KEY_W = 32;
const PITCH = 38.5;
const KEY_H = 40;
const ROW_Y = [0, 52, 105, 156];
const KB_H = 196;

const LIGHT = 'rgba(246,248,251,0.96)';
const DARK = 'rgba(158,165,188,0.95)';

const Key = ({
  x,
  y,
  w,
  h = KEY_H,
  tone = 'light',
  size = 19.5,
  children,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  tone?: 'light' | 'dark';
  size?: number;
  children: ReactNode;
}) => (
  <span
    className="absolute grid place-items-center rounded-[5px] leading-none"
    style={{
      left: x,
      top: y,
      width: w,
      height: h,
      fontSize: size,
      color: '#0b0b10',
      background: tone === 'dark' ? DARK : LIGHT,
      boxShadow: '0 1px 1.5px rgba(40,44,60,0.22)',
    }}
  >
    {children}
  </span>
);

const IconShift = () => (
  <svg width="18" height="17" viewBox="0 0 18 17" fill="none" stroke="#20222c" strokeWidth="1.5" strokeLinejoin="round">
    <path d="M9 1.9 16 8.7h-3.8v5.4H5.8V8.7H2L9 1.9Z" />
  </svg>
);

const IconDelete = () => (
  <svg width="21" height="16" viewBox="0 0 21 16" fill="none" stroke="#20222c" strokeWidth="1.4" strokeLinejoin="round">
    <path d="M6.9 1.5h11.6a1.1 1.1 0 0 1 1.1 1.1v10.8a1.1 1.1 0 0 1-1.1 1.1H6.9L1.2 8 6.9 1.5Z" />
    <path d="m10.2 5.6 4.6 4.8M14.8 5.6l-4.6 4.8" strokeLinecap="round" />
  </svg>
);

/* 键面本身跟时间无关，建一次就够 */
const FACE = (
  <>
    {'qwertyuiop'.split('').map((k, i) => (
      <Key key={k} x={6 + i * PITCH} y={ROW_Y[0]} w={KEY_W}>
        {k}
      </Key>
    ))}
    {'asdfghjkl'.split('').map((k, i) => (
      <Key key={k} x={25 + i * PITCH} y={ROW_Y[1]} w={KEY_W}>
        {k}
      </Key>
    ))}
    <Key x={6} y={ROW_Y[2]} w={43} tone="dark">
      <IconShift />
    </Key>
    {'zxcvbnm'.split('').map((k, i) => (
      <Key key={k} x={64 + i * PITCH} y={ROW_Y[2]} w={KEY_W}>
        {k}
      </Key>
    ))}
    <Key x={343} y={ROW_Y[2]} w={43} tone="dark">
      <IconDelete />
    </Key>
    <Key x={10} y={ROW_Y[3]} w={86} tone="dark" size={13}>
      ABC
    </Key>
    <Key x={102} y={ROW_Y[3]} w={187} size={13}>
      space
    </Key>
    <Key x={295} y={ROW_Y[3]} w={86} tone="dark" size={13}>
      return
    </Key>
  </>
);

export const Keyboard = ({ rise }: { rise: number }) => {
  const p = clamp01(rise);
  if (p <= 0.001) return null;
  return (
    <div
      className="pointer-events-none absolute inset-x-0"
      style={{
        top: KB_TOP,
        height: KB_H,
        /* 位移用 translate3d 交给合成器，别让浏览器每帧重排 */
        transform: `translate3d(0,${(1 - p) * (SCREEN_H - KB_TOP)}px,0)`,
        willChange: 'transform',
      }}
    >
      {FACE}
    </div>
  );
};
