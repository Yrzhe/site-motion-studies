/* 屏幕里用到的图标，全部手画 SVG，stroke 用 currentColor。不用 emoji。 */

export const IconSignal = () => (
  <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor">
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={i * 4.4} y={11 - (4 + i * 2.3)} width="3" height={4 + i * 2.3} rx="1" />
    ))}
  </svg>
);

export const IconWifi = () => (
  <svg width="15" height="11" viewBox="0 0 15 11" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <path d="M1 3.6a9.4 9.4 0 0 1 13 0" />
    <path d="M3.6 6.3a5.8 5.8 0 0 1 7.8 0" />
    <path d="M6.2 8.9a2.2 2.2 0 0 1 2.6 0" />
  </svg>
);

export const IconBattery = () => (
  <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
    <rect x="0.6" y="0.6" width="21" height="10.8" rx="3.2" stroke="currentColor" strokeOpacity="0.35" />
    <rect x="2.2" y="2.2" width="17.8" height="7.6" rx="2" fill="currentColor" />
    <path d="M23 4.2v3.6a2 2 0 0 0 0-3.6Z" fill="currentColor" fillOpacity="0.4" />
  </svg>
);

/* 夜航：航班号 chip 左边那弯月 */
export const IconMoon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
    <path d="M9 6.4A4.2 4.2 0 0 1 3.6 1 4.5 4.5 0 1 0 9 6.4Z" />
  </svg>
);

/* 历史条右侧圆钮里的导航箭头 */
export const IconNav = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M14 2 2.6 6.9c-.6.3-.5 1.1.1 1.3l4.4 1.4 1.4 4.4c.2.6 1 .7 1.3.1L14 2Z" />
  </svg>
);

export const IconMic = () => (
  <svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
    <rect x="6.1" y="1.6" width="4.8" height="8" rx="2.4" />
    <path d="M3.6 7.6a4.9 4.9 0 0 0 9.8 0M8.5 12.5v2.6" />
  </svg>
);

/* 天气胶囊左上角那个小太阳 —— 一个实心圆点，原片就这么简单 */
export const DotSun = () => (
  <span className="block h-[8px] w-[8px] rounded-full" style={{ background: '#f5b93d' }} />
);

/* 输入条左端的加号：比直觉宽（占钮径的 0.4）、也比直觉细。
   没有圆底衬 —— 圆底是外面那层按钮画的 */
export const IconPlus = () => (
  <svg width="21" height="21" viewBox="0 0 21 21" fill="none" stroke="#41434e" strokeWidth="1.4" strokeLinecap="round">
    <path d="M10.5 1.4v18.2M1.4 10.5h18.2" />
  </svg>
);

/* 发送：一个右向尖角。原片里它是深藏青圆钮上的白色 chevron，不是纸飞机。 */
export const IconSend = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="m5 2.4 4.6 4.6L5 11.6" />
  </svg>
);

/* 航司后掠尾翼：藏青实心翼面 + 左下一条红沿。主页与展开卡共用。 */
export const AirlineMark = ({ size = 21 }: { size?: number }) => (
  <svg width={size} height={size * 0.81} viewBox="0 0 22 18" fill="none">
    <path d="M3 13.4C7.4 8.2 12.4 3.6 17.8 0.6l2.6 5.8c-3.9 3.6-9.8 6.2-17.4 7Z" fill="#1f2f63" />
    <path d="M3.4 15.8c4.7-.5 9.4-1.8 13.8-3.8l-1.6 3.4c-3.6 1.1-7.6 1.8-11.6 2Z" fill="#cc1f2f" />
  </svg>
);
