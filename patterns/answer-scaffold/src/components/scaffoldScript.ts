/* ────────────────────────────────────────────────────────────
   还原 @glebich「Gen UI thinking」屏幕里的内容 —— 时刻表与缓动

   已建：
   · 主页（原片第一帧；注意 t=0 那一帧是循环的尾巴，真正的起点没有历史条）
   · 航班卡展开：触点 → 溶解 → 长大 → 照片长出 → 连接点 → 点阵盘 → chips
   · 输入态：卡片收成上下文条 → 键盘升起 → agent 提问 → 打字 → 发送

   时刻全部从原片量出来（转场用 12fps 逐帧读的）：
   · 5.15–5.80s  航班号胶囊旁边一次原地的点按涟漪：盘 → 只剩一圈 → 圈扩大淡出
   · 5.76–5.93s  胶囊行 / 问候 / 输入条同时淡出，卡片开始长大
   · 5.85–6.00s  「Your flight today」标题落下，卡片展开到位
   · 6.00–6.20s  照片从一小块模糊放大变清晰
   · 6.20–6.60s  chips 从下方错峰浮上来，点阵盘同时淡入

   原片在主页上停了 5.1 秒什么都没发生，那是给观众看构图的。
   这里压到 2.6 秒 —— 演示可以拖时间轴，不需要留那么久。
   ──────────────────────────────────────────────────────────── */

export const HOME_HOLD = 2600;

/* 触点：这次交互的发起者。**它是一次原地的点按涟漪，不是一颗会走的圆点。**
   原片 5.15–5.80 逐帧看：先长出一枚半透明蓝盘（CSS 中心 188,598，就在航班号
   胶囊旁边），填充抽掉只剩一圈，圈再扩大淡出。位置从头到尾不动。

   我第一版做成了「从卡片右上走到卡底中央」，还给它编了个理由说
   「它停下的位置就是后来那个连接点的位置」—— 理由是自己想的，原片没有这回事。
   会走的圆点读作「有人在拖」，原地涟漪读作「有人点了一下」。 */
export const TOUCH_AT = HOME_HOLD;
export const TAP = { x: 188, y: 598 };
export const TAP_IN = 240;
export const TAP_DRAIN = 260;
export const TAP_OUT = 360;
export const TOUCH_END = TOUCH_AT + TAP_IN + TAP_DRAIN + TAP_OUT;

export const DISSOLVE_AT = TOUCH_END - 60;
export const DISSOLVE_DUR = 260;
export const GROW_AT = TOUCH_END;
export const GROW_DUR = 440;
export const TITLE_AT = GROW_AT + 140;
export const TITLE_DUR = 320;

/* 照片是「长出来」的：先一小块模糊，再放大变清晰。
   淡入读作「图早就在，只是刚显示」；放大去焦读作「刚生成好」。
   全片的口气是后者。 */
export const PHOTO_AT = GROW_AT + 340;
export const PHOTO_DUR = 300;

export const LINK_AT = PHOTO_AT + 220;
export const LINK_DUR = 260;

export const DISC_AT = LINK_AT + 120;
export const DISC_DUR = 460;
export const CHIP_AT = DISC_AT + 80;
export const CHIP_STEP = 90;
export const CHIP_DUR = 420;

export const SEG2_END = 8600;

/* ────────────────────────────────────────────────────────────
   第三段：收起卡片 → 起键盘 → agent 提问 → 打字 → 发送

   原片 10.30–18.10s，逐帧量的：
   · 10.30–10.55  chips、点阵盘中间的加号、卡片标题一起退
   · 10.50–10.80  卡片就地缩到 0.60 并丢掉照片那一段；「Flight from」那行也收掉，
                  只剩「New York to Tokyo」+ 航班号 + 时刻条，顶部压一道渐隐
   · 10.50–10.85  键盘整块从屏幕下方升上来；输入条先退，再在键盘上方重新淡入
   · 10.85–12.30  agent 那句话逐词流入（「Amelia,」是深色，其余偏蓝灰）
   · 14.10–15.35  用户逐字打「Best places to visit」；第一个字符落下的同时
                  麦克风换成深色发送钮
   · 17.60        按下发送

   注意顺序：**键盘先起，agent 那句话后到**。反过来做就成了「先问再给键盘」，
   而原片是「界面先进入输入态，agent 才开口」。

   打完到按发送，原片空了 2.3 秒。这里压到 1.2 秒 —— 同主页那 5.1 秒的处理。
   ──────────────────────────────────────────────────────────── */

const S3 = SEG2_END;

export const CHIPS_OUT_AT = S3;
export const CHIPS_OUT_DUR = 250;

export const COLLAPSE_AT = S3 + 200;
export const COLLAPSE_DUR = 300;

export const KB_AT = S3 + 200;
export const KB_DUR = 360;

export const COMP_OUT_AT = S3;
export const COMP_OUT_DUR = 200;
export const COMP_IN_AT = S3 + 300;
export const COMP_IN_DUR = 320;

export const GREET_AT = S3 + 550;
export const GREET_DUR = 1450;
export const GREET_WORD_IN = 420;

export const TYPE_AT = S3 + 3800;
export const CHAR_MS = 62;
export const SEND_SWAP_DUR = 260;

export const QUERY = 'Best places to visit';
export const TYPE_END = TYPE_AT + QUERY.length * CHAR_MS;

export const SEND_AT = 14800;
export const SEND_DUR = 260;

export const SEG3_END = 15400;

/* ────────────────────────────────────────────────────────────
   第四段：发送 → 溶解 → 蓝图取景框 + 小球 + 进度 → 卡片显影

   原片 17.60–23.20s。这一段的立意：**先把要生成的东西「占位」，再往里填**。
   不是转圈等待，是在屏幕上画出一个取景框，说「结果会长这么大、在这儿」，
   然后进度爬完，卡片就从那个框里显影出来。等待因此是有形状的。

   逐帧量的：
   · 17.60–17.90  键盘落下，输入条退；发送钮只剩一圈细描边
   · 18.10–18.55  蓝图出现：一层 53.5px 的「+」点阵，两横两竖四条参考线
                  沿着点阵的行列画出来，四个交点变成实心亮点，再补四个圆角
   · 18.80–21.00  框中央一颗小球；球下方百分比；屏幕底部状态文案
                  百分比不是线性的：1→4→8→11 磨了 1.2 秒，然后 11→67→92
                  只用了 1 秒。原片就是这条曲线 —— 先慢后跳才像在算东西
   · 20.25        状态文案换成「Balancing your day」
   · 21.20–22.20  卡片在框里显影：照片从去焦低饱和长到清晰；线框同时退场
   · 22.20–22.60  卡片右上角浮出头像簇；下方连接点 → 点阵盘 → 新一批 chips

   取景框的位置就是卡片最后的位置，尺寸也一样（214×321，屏幕 x 88，y 280）——
   框和结果必须严丝合缝，差一点点就露馅了。
   ──────────────────────────────────────────────────────────── */

export const KB_DOWN_AT = SEND_AT + 100;
export const KB_DOWN_DUR = 380;

export const GRID_AT = SEND_AT + 400;
export const GRID_DUR = 420;
export const FRAME_H_AT = SEND_AT + 500;      // 两条横线先左右展开
export const FRAME_V_AT = SEND_AT + 680;      // 两条竖线后上下展开
export const FRAME_DUR = 380;
export const FRAME_DOT_AT = SEND_AT + 940;    // 四个交点亮起
export const FRAME_ARC_AT = SEND_AT + 1040;   // 再补圆角
export const FRAME_ARC_DUR = 420;

export const ORB_AT = SEND_AT + 1100;
export const ORB_DUR = 460;

export const PCT_AT = SEND_AT + 1200;
/* 进度曲线：先磨后跳。线性的进度条读作「假的」，这条读作「它真的在算」。 */
const PCT_KEYS: [number, number][] = [
  [0, 0], [100, 1], [400, 4], [800, 8], [1200, 11], [1700, 67], [2200, 92], [2450, 100],
];
export const PCT_END = PCT_AT + 2450;

export const STATUS_AT = SEND_AT + 600;
export const STATUS_SWAP_AT = SEND_AT + 2650;
export const STATUS_TEXT = ['Reviewing your itinerary', 'Balancing your day'];

export const CARD2_AT = SEND_AT + 3600;
export const CARD2_DUR = 720;
export const PHOTO2_AT = SEND_AT + 3660;
export const PHOTO2_DUR = 700;
export const WIRE_OUT_AT = SEND_AT + 3600;
export const WIRE_OUT_DUR = 440;
export const AVA_AT = SEND_AT + 4100;
export const AVA_DUR = 400;
export const LINK2_AT = SEND_AT + 4500;

export const SEG4_END = 20600;

/* ────────────────────────────────────────────────────────────
   第五段：结果卡让位 → 分叉出两个空槽 → 两个子结果**错开**落地

   原片 25.20–36.00s。这一段把第四段那套「先占位再填」推广成两份：
   结果卡缩到 0.77 往上让，从它底下的连接点分叉出两条曲线，
   各自垂到一个空槽（下面标着 NATURE / NIGHTLIFE），
   然后右边那个先填上，**隔了三秒**左边才填。

   错开是这一段的全部意思。两个同时落地就只是「出了两张图」；
   一前一后、后到的那个还转着圈，才读作「两个子任务各跑各的」。
   等待的形状在这里第二次出现，而且是并行的。

   逐帧量的（CSS 坐标，屏幕 390×844）：
   · 槽 131×153，左 x=47 右 x=212，顶 591 底 744，圆角 28
   · 标签在槽下方 y≈757，全大写、字距放开、灰
   · 空槽只比背景亮 7 个灰阶（半透明白 α≈0.18）+ 一圈很淡的外发光
   · 填好之后：左上是照片，右上角一个 ↗ 小圆钮，左下压白色标题
   · 还没填的那个中间转着一段圆弧
   · 蓝图那层「+」点阵在这一段**回来了** —— 有东西在生成，网格就在

   原片这一段有 5 秒是纯等待，压掉大半，只留 1.8 秒的错开。
   ──────────────────────────────────────────────────────────── */

const S5 = SEG4_END;

export const SHRINK_AT = S5 + 200;
export const SHRINK_DUR = 520;
export const FORK_AT = S5 + 500;
export const FORK_DUR = 620;
export const SLOT_AT = S5 + 900;
export const SLOT_DUR = 460;
/* 右边先到，左边晚 1.8 秒 —— 数组按 [左, 右] 排，跟屏幕上的顺序一致 */
export const FILL_AT = [S5 + 4000, S5 + 2200];
export const FILL_DUR = 900;

export const SEG5_END = 26400;

/* ────────────────────────────────────────────────────────────
   第六段：点开 NIGHTLIFE 那张 → 满屏深色详情页

   原片 36.00–41.50s。**全片唯一一次翻深色**，连状态栏都跟着反色。
   前面五段都在浅色里谈「怎么算出来的」；这一段不谈过程，只给内容 ——
   底色一翻，语气就从「系统在工作」切到「你在看一个地方」。

   转场是同一张瓦片长满全屏（共享元素），不是推入一个新页面：
   你点的那一块**变成了**你看的这一屏。跟第二段航班卡展开是同一句话。

   逐帧量的（CSS）：
   · 照片铺满，底部压一道很重的暗，让白字站住
   · VIEW SPOT 是个小胶囊（约 93×25，x=28，y=570），不是裸文字
   · 标题 34px 粗白，y≈616；描述两行 15px，y≈665
   · 底部三个控件几乎顶到屏幕两边：圆 `‹` / 胶囊「Route」/ 圆 `+`
     深色半透明面 + 一道极细的亮描边，行心 y≈786
   ──────────────────────────────────────────────────────────── */

const S6 = SEG5_END;

export const OPEN_AT = S6 + 200;
export const OPEN_DUR = 460;
export const DETAIL_AT = OPEN_AT + 240;
export const DETAIL_STEP = 110;

export const SEG6_END = 30400;

/* ────────────────────────────────────────────────────────────
   第七段：路线图 → 退回主页，整段会话塌成一行历史条

   原片 41.50–49.40s。两件事：

   1) 详情页收成顶部一枚缩略图，底下铺开一张近乎全黑的地图。
      前面每一步都在「生成」，到这里生成结束、开始**用** ——
      所以这一屏没有蓝图、没有进度、没有小球，只有结果本身和两个站点。
      深色延续详情页，但语气再变一次：详情页是看，地图是走。

   2) 退回主页，多出一行历史条「Best places to visit / First day in Tokyo」。
      **这一行就是 t=0 那一帧上已经有的那条。** 第一段的笔记里写过
      「t=0 是循环的尾巴，真正的起点没有历史条」—— 到这里接上，片子闭环了。
      一整段十来步的生成，最后只剩一行；下一次循环从那行的左边重新开始。
   ──────────────────────────────────────────────────────────── */

const S7 = SEG6_END;

export const MAP_AT = S7 + 200;
export const MAP_DUR = 620;
export const MAP_UI_AT = S7 + 700;
export const ROUTE_AT = S7 + 900;

export const HOME_AT = S7 + 4000;
export const HOME_DUR = 620;
export const HISTORY_AT = S7 + 4520;
export const HISTORY_DUR = 520;

export const SEG7_END = 36400;
export const TOTAL = SEG7_END;

export const DETAIL = {
  kicker: 'VIEW SPOT',
  title: 'Tokyo at night',
  body: ['Neon streets, quiet temples, and the', 'city that never fully sleeps.'],
  cta: 'Route',
};

export const SLOT = { w: 131, h: 153, y: 591, r: 28, x: [47, 212] };

export const TILES = [
  { label: 'NATURE', title: ['Nature', 'around', 'Tokyo'] },
  { label: 'NIGHTLIFE', title: ['Tokyo at', 'night'] },
];

/* 取景框 = 卡片最后的位置。点阵的行列都对齐到它的四条边。 */
export const FRAME = { x: 88, y: 280, w: 214, h: 321, r: 26 };
export const GRID_PITCH = 53.5;

export const CARD2 = {
  title: ['Best places', 'in Tokyo'],
  sub: ['A relaxed route for', 'your first day'],
  cta: 'Open',
};

export const CHIPS2: { text: string; side: 'l' | 'r'; row: number }[] = [
  { text: 'New places with soul', side: 'l', row: 0 },
  { text: 'Nearby food spots', side: 'r', row: 0 },
  { text: 'Update my data', side: 'l', row: 1 },
  { text: 'Great spots in Tokyo', side: 'r', row: 1 },
  { text: 'Tokyo beyond the guidebook', side: 'l', row: 2 },
  { text: 'Where locals eat', side: 'r', row: 2 },
];

export function pct(T: number) {
  const e = T - PCT_AT;
  if (e <= 0) return 0;
  for (let i = 1; i < PCT_KEYS.length; i++) {
    const [t1, v1] = PCT_KEYS[i];
    if (e < t1) {
      const [t0, v0] = PCT_KEYS[i - 1];
      return Math.round(v0 + ((v1 - v0) * (e - t0)) / (t1 - t0));
    }
  }
  return 100;
}

/* agent 那句话。「Amelia,」用深墨，其余偏蓝灰 —— 原片就是两种颜色，
   称呼是重音，问题本身反而轻。 */
export type GreetWord = { w: string; em?: boolean };
export const GREET_LINES: GreetWord[][] = [
  [{ w: 'Amelia,', em: true }, { w: 'you' }, { w: 'just' }, { w: 'landed' }],
  [{ w: 'in' }, { w: 'Tokyo.' }, { w: 'What’s' }, { w: 'first?' }],
];

/* 逐词的落点按字符数加权 —— 长词多占一点时间，读起来才像在说话，
   不是均分的节拍器。 */
const GREET_FLAT = GREET_LINES.flat();
const GREET_CH = GREET_FLAT.reduce((s, x) => s + x.w.length + 1, 0);
export function greetWordAt(i: number) {
  let c = 0;
  for (let k = 0; k < i; k++) c += GREET_FLAT[k].w.length + 1;
  return GREET_AT + (c / GREET_CH) * GREET_DUR;
}

/* 打字不是节拍器。原片逐帧数过：14.15 两个字符、14.25 三个、14.35 五个、
   14.45 六个 —— 词间明显停一下，词内成串地出。
   所以每个字符给一个权重，再归一化回同样的总时长；权重写死不随机，
   否则每次渲染的时间轴都不一样，就没法逐帧对比了。 */
const CHAR_W = QUERY.split('').map((ch, i) =>
  ch === ' ' ? 1.55 : i > 0 && QUERY[i - 1] === ' ' ? 1.15 : 0.78 + 0.34 * (((i * 7) % 5) / 4)
);
const CHAR_SUM = CHAR_W.reduce((a, b) => a + b, 0);
const CHAR_AT: number[] = [];
{
  let acc = 0;
  for (const w of CHAR_W) {
    acc += w;
    CHAR_AT.push(TYPE_AT + (acc / CHAR_SUM) * (QUERY.length * CHAR_MS));
  }
}

export const CHAR_IN = 110;

export function typedCount(T: number) {
  let n = 0;
  for (let i = 0; i < CHAR_AT.length; i++) if (T >= CHAR_AT[i]) n = i + 1;
  return n;
}

/* 最新那个字符的显影进度。字符的**盒子**是瞬间占位的（光标该跳就跳，
   真输入框就是这样），只有字形自己去焦淡入 —— 两者混在一起才会读成「抖」。 */
export function lastCharIn(T: number) {
  const n = typedCount(T);
  return n === 0 ? 0 : cd((T - CHAR_AT[n - 1]) / CHAR_IN);
}

// ── 数据
export const CARD = {
  title: 'Your flight today',
  from: 'Flight from',
  route: 'New York to Tokyo',
  code: 'FY8722',
  dep: { iata: 'JFK', time: '22:30', city: 'New York' },
  arr: { iata: 'HND', time: '06:20', city: 'Tokyo' },
  dur: '8 h 10m',
};

/* chips 比屏幕宽，两侧都被裁掉 —— 原片就是这样。
   它要说的是「建议还有很多」，不是「这里有四条建议」。 */
export const CHIPS: { text: string; side: 'l' | 'r'; row: number }[] = [
  { text: 'Ramen spots nearby', side: 'l', row: 0 },
  { text: 'Hotel check-in', side: 'r', row: 0 },
  { text: 'Local etiquette tips for Japan', side: 'l', row: 1 },
  { text: 'Help me beat jet lag', side: 'r', row: 1 },
  { text: 'Best time to sleep tonight', side: 'l', row: 2 },
  { text: 'Trains from HND', side: 'r', row: 2 },
];

// ── 缓动
export const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* 临界阻尼阶跃：单调、无过冲。位移、尺寸、透明度共用一条。 */
const OMEGA = 5.4;
const cdRaw = (p: number) => 1 - (1 + OMEGA * p) * Math.exp(-OMEGA * p);
const CD_NORM = cdRaw(1);
export const cd = (t: number) => cdRaw(clamp01(t)) / CD_NORM;

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);

export const fmtSec = (ms: number) => `${Math.max(0, ms / 1000).toFixed(1)}s`;
