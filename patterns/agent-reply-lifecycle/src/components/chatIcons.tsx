import type { ReactElement } from 'react';
import type { ToolKind } from './chatScript';

/* 14px · stroke 1.5 · 统一视觉重量。不用 emoji。 */
const S = {
  width: 14,
  height: 14,
  viewBox: '0 0 14 14',
  fill: 'none' as const
};
const k = {
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const
};
export const IconDoc = () => <svg {...S}>
    <path d="M3.4 1.9h4.3L11 5.2v6.9H3.4z" {...k} />
    <path d="M7.6 2v3.2h3.2M5.4 8.4h3.4M5.4 10h2.2" {...k} />
  </svg>;
export const IconTerminal = () => <svg {...S}>
    <rect x="1.8" y="2.6" width="10.4" height="8.8" rx="1.6" {...k} />
    <path d="m4.4 5.8 1.8 1.6-1.8 1.6M7.8 9.2h2" {...k} />
  </svg>;
export const IconPencil = () => <svg {...S}>
    <path d="M9.4 2.4 11.6 4.6 5.4 10.8l-2.9.7.7-2.9z" {...k} />
    <path d="m8.2 3.6 2.2 2.2" {...k} />
  </svg>;
export const IconLayers = () => <svg {...S}>
    <path d="M7 1.9 12.2 4.6 7 7.3 1.8 4.6z" {...k} />
    <path d="m1.8 7.4 5.2 2.7 5.2-2.7M1.8 10.1l5.2 2.7 5.2-2.7" {...k} />
  </svg>;
export const IconCheck = () => <svg {...S}>
    <path d="m2.6 7.4 2.8 2.8 6-6.4" {...k} />
  </svg>;
export const IconChevron = ({
  turn = 0
}: {
  turn?: number;
}) => <svg {...S} style={{
  transform: `rotate(${turn * 180}deg)`
}}>
    <path d="m3.6 5.4 3.4 3.4 3.4-3.4" {...k} />
  </svg>;
export const IconArrowUp = () => <svg {...S}>
    <path d="M7 11.4V2.8M3.4 6.2 7 2.6l3.6 3.6" {...k} />
  </svg>;
export const IconDownload = () => <svg {...S}>
    <path d="M7 2.4v6.8M4.2 6.6 7 9.4l2.8-2.8M2.6 11.4h8.8" {...k} />
  </svg>;

/* thinking / 组进行中的指示器：3×3 像素网格逐格呼吸。
   与工具图标同尺寸同位 —— 换行滚动时左列纹丝不动。 */
export const PixelGrid = ({
  t
}: {
  t: number;
}) => <svg {...S}>
    {Array.from({
    length: 9
  }, (_, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const phase = ((t - (col + row) * 110) % 1100 + 1100) / 1100 % 1;
    const w = Math.sin(phase * Math.PI * 2) * 0.5 + 0.5;
    return <rect key={i} x={1.4 + col * 4.2} y={1.4 + row * 4.2} width="3" height="3" rx="0.7" fill="currentColor" opacity={0.22 + w * 0.78} />;
  })}
  </svg>;
export const IconGlobe = () => <svg {...S}>
    <circle cx="7" cy="7" r="5.2" {...k} />
    <path d="M1.8 7h10.4M7 1.8c1.5 1.6 2.2 3.4 2.2 5.2S8.5 10.6 7 12.2C5.5 10.6 4.8 8.8 4.8 7S5.5 3.4 7 1.8Z" {...k} />
  
  </svg>;
export const IconImage = () => <svg {...S}>
    <rect x="1.9" y="2.6" width="10.2" height="8.8" rx="1.6" {...k} />
    <circle cx="5.2" cy="5.9" r="1.1" {...k} />
    <path d="m2.4 10 3-2.8 2.3 2 1.9-1.6 2 2.2" {...k} />
  </svg>;
export const IconAlert = () => <svg {...S}>
    <path d="M7 2.4 12.6 11.6H1.4z" {...k} />
    <path d="M7 5.9v2.6M7 10.1v.1" {...k} />
  </svg>;
export const IconRetry = () => <svg {...S}>
    <path d="M11.6 7a4.6 4.6 0 1 1-1.5-3.4" {...k} />
    <path d="M10.4 1.7v2.4H8" {...k} />
  </svg>;

/* 推理：一条折线。不用灯泡也不用大脑 —— 那两个都在说「聪明」，
   这里要说的是「走了一条路」，折线本身就是路径。 */
export const IconThink = () => <svg {...S}>
    <path d="M1.9 9.8 5 5.6l2.4 2.6 4.7-4.6" {...k} />
  </svg>;

/* 分派：一进三出。图标就是这一块的结构图。 */
export const IconBranch = () => <svg {...S}>
    <path d="M1.9 7h3.3M5.2 3.3v7.4M5.2 3.3h4.4M5.2 7h4.4M5.2 10.7h4.4" {...k} />
  </svg>;
export const TOOL_ICON: Record<ToolKind, () => ReactElement> = {
  browse: IconGlobe,
  image: IconImage,
  read: IconDoc,
  bash: IconTerminal,
  write: IconPencil,
  render: IconLayers
};