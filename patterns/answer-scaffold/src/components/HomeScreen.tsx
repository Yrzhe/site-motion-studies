import { AirlineMark, DotSun, IconBattery, IconMic, IconMoon, IconNav, IconSignal, IconWifi } from './phoneIcons';
import { PHOTO_AVATAR, PHOTO_NIGHT } from './photos';

/* 主页：原片第一帧。所有元素照着那一帧建，不照记忆。

   读出来的东西：
   · 屏幕自己有一层虹彩壁纸 —— 上方偏冷蓝，中段偏右一团暖桃色，下方转淡紫。
     它不是纯色背景，卡片的半透明白全靠它才有东西可透。
   · 状态栏 9:41 + 信号/wifi/电池
   · 三个胶囊：28° 天气（左上一个小黄点）· 一个带紫晕的黑色球体 · 红底人像
   · 问候两行，日期在上，字重不粗，行距紧
   · 航班卡分上下两段，中间一条极淡的分隔线；下段有一条虚线弧，左端一个实心点
   · 历史条：左文字右照片，照片压到卡的右边缘，上面盖一个圆形导航钮
   · 输入条 + 一个独立的麦克风圆钮

   照片位先用占位块。原片那两张（人像、东京塔）不能直接用，
   等这一版结构定了再用 lovart 生成同调子的替换进来。
*/

export const SCREEN_W = 390;
export const SCREEN_H = 844;

/* 屏幕壁纸。原片 1.2 / 7.6 / 10.3 / 14.0 四个时刻各取样一次，四次读数一致：

     顶 (228,238,247) → 中 (214,213,227) → 底 (200,206,219)

   也就是**一路往下变暗**的冷蓝到淡紫，右侧中段偏一点紫，左侧中段偏中性灰。
   全片没有暖色 —— 顶部最亮、底部最深这一点很要紧：卡片是半透明白，
   越往下背景越深，卡片才越浮得起来；底部压白就全糊在一起了。 */
/* 壁纸是**两张**，不是一张。

   逐帧取样才看出来：主页那张是虹彩的 —— 上方冷蓝，v≈0.40 起从中间往右压过一条
   暖桃带（237,221,201），最右转紫粉（186,166,209），v≈0.54 整条横过一层
   偏饱和的长春花蓝（161,180,235），底部收成中性浅灰（226,229,232）。
   进入回答态之后这些全退掉，只剩一层冷调、往下变暗的场（14.0s：底 197,201,214）。

   也就是说「界面被 agent 接管」的时候，背景自己先褪了色。这是原片的一个节拍，
   不是渲染差异 —— 之前我把两张按一张建，主页就变得寡淡。

   两张都是纯 gradient，没有一个 `filter: blur()`。
   之前那版用 4 个 blur(34px) 的色团逐帧位移：实测把页面上所有 filter 去掉，
   主循环从 16.6ms/帧 掉到 8.3ms/帧 —— **一半的帧预算花在看不见的背景漂移上**。
   radial-gradient 的边缘本来就是软的，不需要再 blur 一次。 */
const WALL_HOME = [
  'radial-gradient(40% 14% at 100% 46%, rgba(166,136,208,1) 0%, rgba(166,136,208,0) 74%)',
  'radial-gradient(46% 14% at 84% 38%, rgba(250,204,168,1) 0%, rgba(250,204,168,0) 78%)',
  'radial-gradient(34% 11% at 92% 31%, rgba(238,238,212,0.8) 0%, rgba(238,238,212,0) 76%)',
  'radial-gradient(38% 10% at 52% 45%, rgba(250,222,198,0.8) 0%, rgba(250,222,198,0) 76%)',
  'radial-gradient(78% 17% at 78% 56%, rgba(136,174,247,0.95) 0%, rgba(136,174,247,0) 72%)',
  'radial-gradient(44% 26% at 0% 48%, rgba(154,189,246,0.85) 0%, rgba(154,189,246,0) 76%)',
  'linear-gradient(180deg,#eaf3fd 0%,#e5eef8 20%,#e1eaf5 32%,#e3e6ed 62%,#d9dce3 84%,#d2d5dc 100%)',
].join(',');

const WALL_CHAT = [
  'radial-gradient(58% 38% at 92% 46%, rgba(180,188,236,0.66) 0%, rgba(180,188,236,0) 72%)',
  'radial-gradient(56% 40% at 14% 15%, rgba(198,218,248,0.72) 0%, rgba(198,218,248,0) 74%)',
  'radial-gradient(44% 30% at 2% 52%, rgba(236,232,229,0.58) 0%, rgba(236,232,229,0) 72%)',
  'radial-gradient(54% 36% at 46% 80%, rgba(196,193,224,0.52) 0%, rgba(196,193,224,0) 74%)',
  'linear-gradient(180deg,#e9f1fa 0%,#dfe4ef 32%,#d6d5e3 62%,#c8ceda 100%)',
].join(',');

/* 发送之后屏幕下半压进来一层暖紫，而且不退回去（原片 18.5s 起到结尾都是）。
   取样：底 (197,201,214) → (172,171,211)，右下 (203,189,194) 明显偏暖。
   生成这件事在背景上留了痕迹 —— 这是第三个状态，不是过场。 */
const WALL_GEN = [
  'radial-gradient(92% 32% at 46% 104%, rgba(120,110,196,0.44) 0%, rgba(120,110,196,0) 72%)',
  'radial-gradient(46% 24% at 98% 80%, rgba(232,166,166,0.42) 0%, rgba(232,166,166,0) 74%)',
].join(',');

export const Wallpaper = ({ wash, gen }: { wash: number; gen: number }) => (
  <>
    <div className="absolute inset-0" style={{ background: WALL_CHAT }} />
    <div className="absolute inset-0" style={{ background: WALL_HOME, opacity: 1 - wash }} />
    {gen > 0.002 && <div className="absolute inset-0" style={{ background: WALL_GEN, opacity: gen }} />}
  </>
);

/* 状态栏全程都在 —— 它是系统的，不属于任何一屏，
   所以它不跟着主页一起退。 */
export const StatusBar = ({ dark = false }: { dark?: boolean }) => (
  <div
    className="flex items-center justify-between px-[26px] pt-[14px]"
    style={{ color: dark ? '#ffffff' : '#1a1a1c' }}
  >
    <span className="text-[15px] font-semibold tracking-[-0.01em]">9:41</span>
    <span className="flex items-center gap-[5px]">
      <IconSignal />
      <IconWifi />
      <IconBattery />
    </span>
  </div>
);

/* 那颗球不是「黑球」，是一颗行星：
   深色星空底 + 一道从左下贯到右上的亮弧（左下洋红、右上蓝白）+ 左上一颗小卫星 + 星点。
   我第一版做成了「黑球右下角发紫」，方向和构造都不对 —— 那道弧才是它的主角。 */
const Orb = ({ size = 54 }: { size?: number }) => (
  <span className="relative block shrink-0" style={{ width: size, height: size }}>
  {/* 弧的亮端会溢出球体、把右上的轮廓照亮一圈。
      这一层不能裁剪，所以单独放在球外面 —— 球里那层还是裁的。 */}
  <span
    className="pointer-events-none absolute rounded-full"
    style={{
      right: -size * 0.13,
      top: -size * 0.1,
      width: size * 0.6,
      height: size * 0.6,
      background: 'radial-gradient(closest-side, rgba(206,226,255,0.75) 0%, rgba(150,120,255,0.3) 42%, transparent 78%)',
      filter: `blur(${size * 0.11}px)`,
    }}
  />
  <span
    className="relative block h-full w-full overflow-hidden rounded-full"
    style={{ background: 'radial-gradient(circle at 46% 40%, #191a2a 0%, #0a0a14 62%, #05050c 100%)' }}
  >
    {/* 星点：位置写死，不随机 —— 随机会让每次渲染都不一样，没法逐帧对比 */}
    {[
      [22, 16], [70, 22], [34, 78], [82, 62], [14, 54], [58, 12], [46, 88], [88, 38],
    ].map(([x, y], i) => (
      <span
        key={i}
        className="absolute rounded-full bg-white"
        style={{ left: `${x}%`, top: `${y}%`, width: 1.2, height: 1.2, opacity: 0.5 + (i % 3) * 0.16 }}
      />
    ))}

    {/* 亮弧：一条斜向的高光带，两端颜色不同。旋转 -34° 贴着球面走 */}
    <span
      className="absolute inset-[-30%]"
      style={{
        transform: 'rotate(-34deg)',
        background:
          'linear-gradient(90deg, transparent 10%, rgba(232,60,170,0.85) 20%, rgba(158,86,255,0.9) 32%, rgba(226,238,255,1) 52%, rgba(150,180,255,0.55) 68%, transparent 86%)',
        maskImage: 'linear-gradient(180deg, transparent 44%, #000 48.5%, #000 51.5%, transparent 56%)',
        WebkitMaskImage: 'linear-gradient(180deg, transparent 44%, #000 48.5%, #000 51.5%, transparent 56%)',
        filter: 'blur(1.1px)',
      }}
    />

    {/* 左上那颗小卫星 */}
    <span
      className="absolute rounded-full"
      style={{
        left: '30%',
        top: '16%',
        width: size * 0.2,
        height: size * 0.2,
        background: 'radial-gradient(circle at 34% 30%, #d8d8e2 0%, #9a9aa8 58%, #6a6a78 100%)',
      }}
    />

    {/* 边缘一点点冷光，让球有体积；右上补一道更亮的轮廓，接住溢出的那道弧 */}
    <span
      className="absolute inset-0 rounded-full"
      style={{ boxShadow: 'inset -3px -4px 10px rgba(90,120,220,0.28), inset -1px 2px 3px rgba(214,232,255,0.45)' }}
    />
    </span>
  </span>
);

/* 钟表指针：一根斜针 + 中心实心点 + 一根水平针。原片没有表盘圈 —— 
   我第一版补了个圈，那是自己加的东西。 */
const ClockHands = () => (
  <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
    <path d="M9.5 7.5 19 19" stroke="#96969f" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M20 20h16" stroke="#17171a" strokeWidth="2" strokeLinecap="round" />
    <circle cx="19.6" cy="19.6" r="3" fill="#17171a" />
  </svg>
);

/* 三个东西一行：正圆的天气、描边胶囊（指针 + 行星）、圆形头像。
   前两个**只有细描边、没有填充** —— 壁纸直接透过去。
   我第一版给它们填了半透明白，整行就浮在上面，不是嵌在壁纸里。 */
const HAIRLINE = '1px solid rgba(30,32,44,0.16)';

const PillRow = () => (
  <div className="mt-[16px] flex items-center gap-[12px] px-[24px]">
    <span
      className="flex h-[62px] w-[62px] shrink-0 flex-col items-center justify-center gap-[4px] rounded-full"
      style={{ border: HAIRLINE }}
    >
      <DotSun />
      <span className="text-[19px] leading-none tracking-[-0.02em] text-[#25252a]">28°</span>
    </span>

    <span
      className="flex h-[62px] items-center justify-between rounded-full pl-[8px] pr-[3px]"
      style={{ border: HAIRLINE, width: 138 }}
    >
      <ClockHands />
      <Orb size={56} />
    </span>

    <span
      className="ml-auto block h-[52px] w-[52px] shrink-0 rounded-full bg-cover bg-center"
      style={{ backgroundImage: `url(${PHOTO_AVATAR})` }}
    />
  </div>
);

const Greeting = () => (
  <div className="mt-[96px] px-[26px]">
    <div className="text-[13px] text-[#8b8b92]">Wed, Apr 23</div>
    <div className="mt-[6px] text-[29px] leading-[1.22] tracking-[-0.025em] text-[#17171a]">
      Good morning,
      <br />
      Amelia
    </div>
  </div>
);

/* 航班卡。两段式：上段是「哪一趟」，下段是「几点到几点」。
   中间那条分隔极淡 —— 它分的是两种信息，不是两张卡。 */
export const FlightCard = () => (
  <div
    className="overflow-hidden rounded-[26px]"
    style={{
      background: 'rgba(255,255,255,0.5)',
      boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.62), 0 10px 30px rgba(40,44,60,0.05)',
      backdropFilter: 'blur(24px) saturate(1.2)',
    }}
  >
    <div className="flex items-start gap-3 px-[18px] pb-[14px] pt-[16px]">
      <div className="min-w-0 flex-1">
        <div className="text-[19px] leading-[1.3] tracking-[-0.02em] text-[#17171a]">
          Flight from
          <br />
          New York to Tokyo
        </div>
        <span
          className="mt-[10px] inline-flex items-center gap-[6px] rounded-full px-[9px] py-[4px] text-[11.5px] text-[#5f5f68]"
          style={{ background: 'rgba(255,255,255,0.8)' }}
        >
          <IconMoon />
          FY8722
        </span>
      </div>
      {/* 航司 + 舱位：两个圆叠在一起，后一个压前一个 */}
      <span className="relative mt-[2px] flex shrink-0">
        <span className="relative z-10 grid h-[33px] w-[33px] place-items-center rounded-full bg-white shadow-[0_1px_3px_rgba(40,44,60,0.12)]">
          <AirlineMark />
        </span>
        <span className="-ml-[11px] grid h-[35px] w-[35px] place-items-center rounded-full bg-[#3d63d9] text-[13px] font-medium text-white shadow-[0_1px_3px_rgba(40,44,60,0.16)]">
          A6
        </span>
      </span>
    </div>

    <div
      className="flex items-center px-[18px] pb-[16px] pt-[14px]"
      style={{ background: 'rgba(255,255,255,0.72)', boxShadow: '0 -1px 0 rgba(255,255,255,0.5)' }}
    >
      <span className="shrink-0">
        <span className="block text-[19px] leading-none tracking-[-0.02em] text-[#17171a]">22:30</span>
        <span className="mt-[5px] block text-[12px] text-[#8b8b92]">JFK</span>
      </span>

      {/* 虚线弧：左端一个实心点，向右微微上拱 */}
      <span className="mx-[14px] flex-1">
        <svg width="100%" height="26" viewBox="0 0 140 26" fill="none" preserveAspectRatio="none">
          <path
            d="M6 19C36 4 104 3 134 16"
            stroke="#9a9aa2"
            strokeWidth="1.1"
            strokeDasharray="2.6 3.6"
            strokeLinecap="round"
          />
          <circle cx="6" cy="19" r="3.2" fill="#6f6f78" />
          <circle cx="134" cy="16" r="2.6" fill="#b3b3ba" />
        </svg>
      </span>

      <span className="shrink-0 text-right">
        <span className="block text-[19px] leading-none tracking-[-0.02em] text-[#17171a]">06:20</span>
        <span className="mt-[5px] block text-[12px] text-[#8b8b92]">HND</span>
      </span>
    </div>
  </div>
);

/* 历史条：一次做完的会话塌成的一行。左边字，右边照片顶到卡的右边缘。 */
export const HistoryRow = () => (
  <div
    className="relative flex h-[80px] items-center overflow-hidden rounded-[22px]"
    style={{
      background: 'rgba(255,255,255,0.46)',
      boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.6)',
      backdropFilter: 'blur(24px) saturate(1.2)',
    }}
  >
    <div className="relative z-10 min-w-0 flex-1 px-[18px]">
      <div className="text-[11.5px] text-[#7c7c85]">Best places to visit</div>
      <div className="mt-[3px] text-[15px] tracking-[-0.01em] text-[#17171a]">First day in Tokyo</div>
    </div>
    {/* 照片顶到卡的右边缘，左侧用一道透明渐变化开 —— 原片没有硬边 */}
    <div
      className="absolute inset-y-0 right-0 w-[52%] bg-cover bg-center"
      style={{
        backgroundImage: `url(${PHOTO_NIGHT})`,
        WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, #000 26%, #000 100%)',
        maskImage: 'linear-gradient(90deg, transparent 0%, #000 26%, #000 100%)',
      }}
    />
    <span className="absolute right-[16px] z-10 grid h-[42px] w-[42px] place-items-center rounded-full text-white"
      style={{ background: 'rgba(30,36,42,0.32)', backdropFilter: 'blur(6px)' }}>
      <IconNav />
    </span>
  </div>
);

export const Composer = () => (
  <div className="flex items-center gap-[10px]">
    <div
      className="flex h-[54px] flex-1 items-center rounded-[27px] px-[20px] text-[14.5px] text-[#8b8b92]"
      style={{ background: 'rgba(255,255,255,0.5)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.62)', backdropFilter: 'blur(20px)' }}
    >
      Type a message
    </div>
    <div
      className="grid h-[54px] w-[54px] shrink-0 place-items-center rounded-full text-[#4a4a52]"
      style={{ background: 'rgba(255,255,255,0.5)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.62)', backdropFilter: 'blur(20px)' }}
    >
      <IconMic />
    </div>
  </div>
);

export const HomeChrome = () => (
  <>
    <PillRow />
    <Greeting />
  </>
);
