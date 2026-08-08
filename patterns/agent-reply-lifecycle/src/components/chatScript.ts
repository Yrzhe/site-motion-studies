/* ────────────────────────────────────────────────────────────
   会话脚本 —— 一次真实的 agent 任务

   结构不是「一条回复」，是交替：
     说一段话 → 一组工具 → 再说一段 → 再一组工具 → 收尾 → 交付产物

   每一组工具折叠时只显示最新一条；组跑完后折叠成一行汇总。
   ──────────────────────────────────────────────────────────── */

export const ROW_H = 32;
export const SLIDE_DUR = 420; // 换条时整列上滚的时长（原 300 太急，读不清就换走了）
export const OMEGA = 5.2; // 临界阻尼系数（位移、高度共用）——越小越从容
export const SHIMMER_PERIOD = 1500;
export const WORD_BASE = 34; // 每词基础间隔
export const WORD_PER_CHAR = 11; // 每字追加
export const WORD_FADE = 260; // 必须显著大于词间隔，让相邻词的淡入重叠成一道波
export const WORD_RISE = 4;
export const HEIGHT_FOLLOW = 260; // 文本容器追随实测内容高的时长（换行不跳）

/* 最新输出与窗底之间保留的留白。跟随滚动时输出停在这条线上，不贴到窗底 ——
   贴底会让人觉得字要被切掉了，留一段呼吸才读得下去。 */
export const FOLLOW_MARGIN = 96;

export type ToolKind = 'read' | 'bash' | 'write' | 'render' | 'browse' | 'image';
/* browse 类型带一个 page —— 有它才吐 browser 小窗。
   页面内容不用截图，用色块和字条画一个可信的缩略：
   小窗要传达的是「它正在看这一页」，不是让人读那一页。 */
export type Page = {
  site: string;
  url: string;
  title: string;
  accent: string;
  rows: number[]; // 正文字条的相对宽度 0..1
};
/* fail.at ∈ (0,1)：在自身时长的这个位置失败，随后自动重试并成功。
   真实 agent 一定会失败，全程顺利的演示是不可信的。 */
export type Tool = {
  kind: ToolKind;
  verb: string;
  arg: string;
  dur: number;
  page?: Page;
  fail?: {at: number;reason: string;};
  diff?: DiffFile;
};

/* diff 预览:Cursor / Claude Code 的核心 —— 写文件之前先把改动摊开。
   行数刻意少:这里要的是「看清改了什么性质的东西」,不是通读全文。 */
export type DiffLine = {kind: ' ' | '+' | '-';text: string;};
export type DiffFile = {path: string;add: number;del: number;lines: DiffLine[];};

export type ToolPhase = 'pending' | 'running' | 'error' | 'retry' | 'done';

const ERROR_SPAN = 0.2; // 报错停留占自身时长的比例

export function toolPhase(tool: Tool, start: number, T: number): ToolPhase {
  if (T < start) return 'pending';
  const e = (T - start) / tool.dur;
  if (!tool.fail) return e < 1 ? 'running' : 'done';
  if (e < tool.fail.at) return 'running';
  if (e < tool.fail.at + ERROR_SPAN) return 'error';
  return e < 1 ? 'retry' : 'done';
}

/* 行内引用：正文里写 [1]、[2]。

   引用直接指向那一页本身，不再另抄一份站名和颜色 —— 这两条引用指的
   正是刚才 browser 小窗里出现过的那两页，两处必须是同一个对象。

   静止态只有一个中性小上标数字。翻了 Cohere / Cursor / Grok / Elicit，
   没有一家在正文里放带品牌色的彩色 pill：脚注不该比它注解的那句话响。
   品牌色留到 hover —— 那时它才在传信息（见 CiteChip）。 */
export type Cite = { n: number; page: Page };

/* 页面定义提到外面：工具组的 browse 和正文里的引用共用同一个对象。 */
const PAGE_FRAMER: Page = {
  site: 'framer.com',
  url: 'https://framer.com/pricing',
  title: 'Pricing',
  accent: '#0b6cff',
  rows: [0.92, 0.74, 0.86, 0.52]
};
const PAGE_LINEAR: Page = {
  site: 'linear.app',
  url: 'https://linear.app/pricing',
  title: 'Plans',
  accent: '#5b5bd6',
  rows: [0.88, 0.62, 0.94, 0.7, 0.44]
};

/* 计划：先摊开要走的步骤，跑的时候逐条勾掉。
   步骤的完成时刻用绝对 ms（相对会话起点），因为它要跨越后面好几个块 ——
   计划的价值正在于它比执行先出现、比执行晚结束。 */
export type PlanStep = {label: string;doneAt: number;};

/* 计划不进消息流 —— 它跨越整场,放进流里就会随着输出滚走,
   而「还剩几步」恰恰是任何时刻都该看得见的东西。
   真实产品(Manus 的任务面板、Claude Code 的 todo)都常驻在输入框上方。 */
/* 计划是想完之后才有的东西 —— 挂在推理块收起的那一刻出现。
   doneAt 对齐到真正让那一步成立的那次调用结束时刻（见下方 TIMING 推导）。 */
export const PLAN_AT = 4800;
export const PLAN_STEPS: PlanStep[] = [
{ label: '读日程、纪要与讨论', doneAt: 8700 },
{ label: '对标同类产品定价', doneAt: 17400 },
{ label: '生成 PPT 与封面', doneAt: 27950 },
{ label: '补一份会议纪要', doneAt: 30150 }];


/* 计划面板的自动演示：出现 → 摊开 → 停一会儿 → 收成一行。
   四段共用同一条临界阻尼曲线，中间没有一处是布尔跳变 ——
   之前 expand 直接给 0/1，高度、箭头、当前步文字在同一帧里一起硬切。
   点击也走同一个量，只是目标值由用户给（见主组件的追随器）。 */
export const PLAN_IN = 300;       // 面板落位
export const PLAN_OPEN_AT = 260;  // 落位之后再开始摊开，两件事不挤在一起
export const PLAN_OPEN = 560;
export const PLAN_HOLD = 1760;
export const PLAN_FOLD = 620;     // 收比展开慢一点：收起是「我知道了」，不必急

export const planAppear = (T: number) => cd((T - PLAN_AT) / PLAN_IN);

export function scriptedPlanExpand(T: number) {
  const e = T - PLAN_AT;
  const up = cd((e - PLAN_OPEN_AT) / PLAN_OPEN);
  const down = cd((e - PLAN_OPEN_AT - PLAN_OPEN - PLAN_HOLD) / PLAN_FOLD);
  return clamp01(up - down);
}

/* 审批：agent 停下来等人。risk 决定摩擦大小。 */
export type Approval = {
  title: string;
  action: string;
  detail: string;
  risk: 'low' | 'high';
  decideAt: number; // 脚本自动做决定的时刻（相对本块起点）
};

/* 推理：回复之前的自言自语。一条 = 一个念头，不再往下拆词 ——
   逐词流式是给人读的节奏，推理不是拿来读的，是拿来瞥的。 */
export const THINK_LINE = 620; // 一条念头到下一条
export const THINK_SLIDE = 380; // 超出缝隙时整列上推
export const THINK_TAIL = 420; // 最后一条留一拍再收

export const THOUGHTS = [
'用户要两份产物：PPT 和纪要。先确认是同一批素材。',
'日程里有场次和时长，纪要里是结论 —— 两边都要读。',
'PPT 页数没说。三场各三页加首尾，12 页比较稳。',
'重叠部分：纪要写全文，PPT 只留结论。',
'定价那场多半要对标同类产品，手上没数据，得去查。'];


/* 子任务并行：一件事拆成几件同时做。
   每条道从块起点同时开始 —— 起点相同是「并行」唯一说得清的定义，
   所以 lane 只带自己的时长，不带自己的起点。 */
export type Lane = {kind: ToolKind;verb: string;arg: string;result: string;dur: number;};
export type Fanout = {title: string;doneTitle: string;lanes: Lane[];};

export const FAN_FORK = 300; // 竖轨长出来
export const FAN_STUB = 90; // 相邻横杈之间的错开
export const FAN_JOIN_HOLD = 320; // 最慢那条跑完到合流之间的停顿
export const FAN_JOIN_DUR = 460;
export const FAN_TAIL = 360; // 合流之后停一拍再进下一块

export type Block =
{type: 'think';lines: string[];dur: number;} |
{type: 'text';text: string;dur: number;cites?: Cite[];} |
{type: 'approval';approval: Approval;dur: number;} |
{type: 'fanout';fanout: Fanout;dur: number;} |
{type: 'tools';title: string;tools: Tool[];} |
{type: 'artifacts';dur: number;};

export const thinkDur = (lines: string[]) => lines.length * THINK_LINE + THINK_TAIL;
export const fanDur = (f: Fanout) =>
Math.max(...f.lanes.map((l) => l.dur)) + FAN_JOIN_HOLD + FAN_JOIN_DUR + FAN_TAIL;

/* 合流进度：最慢那条跑完、再停一拍，才开始收拢。
   不能按块的总时长算 —— 合流等的是最慢的那条，那才是并行的真实成本。 */
export function fanJoin(f: Fanout, start: number, T: number) {
  const slowest = Math.max(...f.lanes.map((l) => l.dur));
  return cd((T - start - slowest - FAN_JOIN_HOLD) / FAN_JOIN_DUR);
}

const CONTEXT_FANOUT: Fanout = {
  title: '分派子任务',
  doneTitle: '读取上下文',
  lanes: [
  { kind: 'read', verb: 'Reading', arg: '~/calendar.ics', result: '3 events', dur: 1150 },
  { kind: 'read', verb: 'Reading', arg: '~/meetings/07/*.md', result: '4 files · 3 relevant', dur: 2050 },
  { kind: 'bash', verb: 'Fetching', arg: '#design 07/20–07/26', result: '41 messages', dur: 1500 }]

};

/* 动词 + 等宽参数的二段式，沿用业界既有说法 */
export const BLOCKS: Block[] = [
{ type: 'think', lines: THOUGHTS, dur: thinkDur(THOUGHTS) },
{ type: 'text', text: '好，我先看一下你的日程、上周的纪要，还有当时的讨论。', dur: 1500 },
/* 三处上下文互不依赖 —— 串行读没有理由，真实 agent 这里就是并发的。
   把它做成分派，也让「读取上下文」这一步从最平淡的一段变成有看头的一段。 */
{ type: 'fanout', fanout: CONTEXT_FANOUT, dur: fanDur(CONTEXT_FANOUT) },
{ type: 'text', text: '三场都看完了。定价那场要求对标同类产品，我去查一下。', dur: 1900 },
{
  type: 'tools',
  title: '查资料',
  tools: [
  { kind: 'bash', verb: 'Searching', arg: 'saas pricing 2026 对标', dur: 900 },
  {
    kind: 'browse',
    verb: 'Browsing',
    arg: 'framer.com/pricing',
    dur: 1500,
    page: PAGE_FRAMER
  },
  {
    kind: 'browse',
    verb: 'Browsing',
    arg: 'linear.app/pricing',
    dur: 2200,
    fail: { at: 0.34, reason: '429 Too Many Requests' },
    page: PAGE_LINEAR
  },
  { kind: 'read', verb: 'Comparing', arg: '3 sources', dur: 800 }]

},
{
  type: 'text',
  text: '查到了，同类普遍落在每月 20 美元这一档[1][2]。我把结论整理成 PPT，再补一份纪要。',
  dur: 2500,
  cites: [{ n: 1, page: PAGE_FRAMER }, { n: 2, page: PAGE_LINEAR }]
},
{
  type: 'approval',
  dur: 2600,
  approval: {
    title: '要覆盖已有文件吗',
    action: 'write notes.docx',
    detail: '~/meetings/2026-07/notes.docx 已存在，将被整份替换',
    risk: 'high',
    decideAt: 1700
  }
},
{
  type: 'tools',
  title: '生成产物',
  tools: [
  { kind: 'bash', verb: 'Running', arg: 'python build_deck.py', dur: 1100 },
  { kind: 'render', verb: 'Rendering', arg: '12 slides', dur: 1300 },
  { kind: 'image', verb: 'Generating', arg: 'cover.png', dur: 2400 },
  {
    kind: 'write',
    verb: 'Writing',
    arg: 'notes.docx',
    dur: 2200,
    diff: {
      path: '~/meetings/2026-07/notes.docx',
      add: 6,
      del: 2,
      lines: [
      { kind: ' ', text: '# 会议纪要 · 2026 年 7 月第四周' },
      { kind: '-', text: '本周评审情况待补充。' },
      { kind: '-', text: 'TODO: 汇总三场结论' },
      { kind: '+', text: '本周共三场评审，参与 9 人，累计 4 小时 20 分。' },
      { kind: '+', text: '' },
      { kind: '+', text: '## 一、定价结构评审（07/22）' },
      { kind: '+', text: '结论：订阅制改为充值制，ARPU 目标每月 20 美元。' },
      { kind: '+', text: '分歧：余额是否过期，未拍板。' },
      { kind: ' ', text: '' },
      { kind: '+', text: '## 二、上线节奏评审（07/24）' }]

    }
  }]

},
{ type: 'text', text: '做完了。PPT 12 页，纪要 4 页，另外导了一张封面图，都在下面。', dur: 1650 },
{ type: 'artifacts', dur: 900 }];


/* browser 小窗的显示区间：从该组第一条 browse 开始，到最后一条 browse 结束再留一拍。
   连续两条 browse 之间不关窗再开 —— 那是同一次浏览换了个地址。 */
export const BROWSER_TAIL = 420;

export function browserPhase(blockIndex: number, T: number): {open: number;page?: Page;} {
  const b = BLOCKS[blockIndex];
  if (b.type !== 'tools') return { open: 0 };
  const starts = toolStarts(blockIndex);
  const idx = b.tools.map((t, i) => t.kind === 'browse' ? i : -1).filter((i) => i >= 0);
  if (!idx.length) return { open: 0 };
  const from = starts[idx[0]];
  const last = idx[idx.length - 1];
  const to = starts[last] + b.tools[last].dur;

  let open = cd((T - from) / 380);
  if (T > to) open = Math.min(open, 1 - cd((T - to - BROWSER_TAIL) / 300));

  let page: Page | undefined;
  for (const i of idx) if (T >= starts[i]) page = b.tools[i].page;
  return { open: Math.max(0, open), page: page ?? b.tools[idx[0]].page };
}

/* diff 预览：开窗区间。与 browser / 生成预览同一套开合曲线。 */
export function diffPhase(blockIndex: number, T: number): {open: number;file?: DiffFile;p: number;} {
  const b = BLOCKS[blockIndex];
  if (b.type !== 'tools') return { open: 0, p: 0 };
  const starts = toolStarts(blockIndex);
  const i = b.tools.findIndex((t) => t.diff);
  if (i < 0) return { open: 0, p: 0 };
  const from = starts[i];
  const to = from + b.tools[i].dur;
  let open = cd((T - from) / 380);
  if (T > to) open = Math.min(open, 1 - cd((T - to - BROWSER_TAIL) / 300));
  return { open: Math.max(0, open), file: b.tools[i].diff, p: clamp01((T - from) / b.tools[i].dur) };
}

/* 图像生成预览：开窗区间与进度。与 browser 小窗同一套开合曲线。 */
export function generatePhase(blockIndex: number, T: number): {open: number;p: number;name: string;} {
  const b = BLOCKS[blockIndex];
  if (b.type !== 'tools') return { open: 0, p: 0, name: '' };
  const starts = toolStarts(blockIndex);
  const i = b.tools.findIndex((t) => t.kind === 'image');
  if (i < 0) return { open: 0, p: 0, name: '' };
  const from = starts[i];
  const to = from + b.tools[i].dur;

  let open = cd((T - from) / 380);
  if (T > to) open = Math.min(open, 1 - cd((T - to - BROWSER_TAIL) / 300));
  return { open: Math.max(0, open), p: clamp01((T - from) / b.tools[i].dur), name: b.tools[i].arg };
}

/* 当前这一页是第几次导航 —— 用来给「换页推移」算进度 */
export function browserNav(blockIndex: number, T: number): {navIndex: number;navP: number;} {
  const b = BLOCKS[blockIndex];
  if (b.type !== 'tools') return { navIndex: 0, navP: 1 };
  const starts = toolStarts(blockIndex);
  const idx = b.tools.map((t, i) => t.kind === 'browse' ? i : -1).filter((i) => i >= 0);
  let navIndex = 0;
  let navP = 1;
  idx.forEach((i, k) => {
    if (T >= starts[i]) {
      navIndex = k;
      navP = clamp01((T - starts[i]) / 340);
    }
  });
  return { navIndex, navP };
}

export const BUBBLE_IN = 380; // ① 气泡落位
export const SCROLL_UP = 620; // ② 整体上滚
export const SEND_DUR = BUBBLE_IN + SCROLL_UP;
export const GAP = 220; // 块与块之间的呼吸
export const AUTO_EXPAND_AT_GROUP = 0; // 脚本里自动演示展开的那一组
export const AUTO_EXPAND_DUR = 680;
export const AUTO_HELD_DUR = 1300;
export const TAIL_DUR = 2200; // 产物出现后的停留，够鼠标去滚小窗

/* ── 时刻表：每个块的开始/结束（绝对 ms） */
export type BlockTiming = {start: number;end: number;groupIndex: number;};

export const TIMING: BlockTiming[] = (() => {
  const out: BlockTiming[] = [];
  let t = SEND_DUR;
  let g = 0;
  for (const b of BLOCKS) {
    const dur = b.type === 'tools' ? b.tools.reduce((a, x) => a + x.dur, 0) : b.dur;
    out.push({ start: t, end: t + dur, groupIndex: b.type === 'tools' ? g++ : -1 });
    t += dur + GAP;
  }
  return out;
})();

/* 自动展开演示：挂在指定那一组跑完之后 */
export const AUTO_EXPAND_START = (() => {
  const i = BLOCKS.findIndex((b, k) => b.type === 'tools' && TIMING[k].groupIndex === AUTO_EXPAND_AT_GROUP);
  return i < 0 ? 0 : TIMING[i].end;
})();

export const TOTAL =
TIMING[TIMING.length - 1].end + TAIL_DUR;

/* 单条工具的绝对开始时刻 */
export function toolStarts(blockIndex: number): number[] {
  const b = BLOCKS[blockIndex];
  if (b.type !== 'tools') return [];
  const out: number[] = [];
  let t = TIMING[blockIndex].start;
  for (const tool of b.tools) {
    out.push(t);
    t += tool.dur;
  }
  return out;
}

export function toolEnds(blockIndex: number): number[] {
  const b = BLOCKS[blockIndex];
  if (b.type !== 'tools') return [];
  const starts = toolStarts(blockIndex);
  return b.tools.map((tool, i) => starts[i] + tool.dur);
}

/* 脚本驱动的展开程度（0..1）。用户点击会接管，见主组件。 */
export function scriptedExpand(groupIndex: number, T: number): number {
  if (groupIndex !== AUTO_EXPAND_AT_GROUP) return 0;
  const a = AUTO_EXPAND_START;
  const b = a + AUTO_EXPAND_DUR;
  const c = b + AUTO_HELD_DUR;
  const d = c + AUTO_EXPAND_DUR;
  if (T < a) return 0;
  if (T < b) return cd((T - a) / AUTO_EXPAND_DUR);
  if (T < c) return 1;
  if (T < d) return 1 - cd((T - c) / AUTO_EXPAND_DUR);
  return 0;
}

// ── easing
export const clamp01 = (t: number) => t < 0 ? 0 : t > 1 ? 1 : t;
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeOutQuint = (t: number) => 1 - Math.pow(1 - clamp01(t), 5);

/* 临界阻尼阶跃：单调、无过冲。位移与高度共用 ——
   过冲会让整列文字上下弹，读起来像卡顿。 */
const cdRaw = (p: number) => 1 - (1 + OMEGA * p) * Math.exp(-OMEGA * p);
const CD_NORM = cdRaw(1);
export function cd(t: number) {
  return cdRaw(clamp01(t)) / CD_NORM;
}

/* 分词：中文逐字，西文整词，标点粘前一块。

   逐字而不是两字一块 —— 单位越小，同一时刻在过渡的单位越多，
   前沿越像一条连续的软边。两字一块时只有三四个单位同时在动，
   看着就是一格格蹦。西文仍整词，拆开会破坏词形。
   空白必须保留并粘在前一块上 —— 每个词渲染成 inline-block，
   丢掉空格会让「上周有 3 场评审」变成「上周有3场评审」，那是在改原文。 */
export function splitWords(text: string): string[] {
  const raw = text.match(/\[\d+\]|[A-Za-z0-9][A-Za-z0-9._+-]*|[一-龥]|\s+|[^\s]/g) ?? [];
  const out: string[] = [];
  for (const tk of raw) {
    const isSpace = /^\s+$/.test(tk);
    const isPunct = /^[，。、；：？！）】」』…—·,.;:?!)\]}"']+$/.test(tk);
    // 标点不能粘到引用标记上 —— [2]。 会让它不再匹配引用正则，chip 就渲染不出来
    const prevIsCite = out.length > 0 && /^\[\d+\]$/.test(out[out.length - 1]);
    if ((isSpace || isPunct) && out.length && !prevIsCite) {
      out[out.length - 1] += tk;
      continue;
    }
    if (isSpace) continue; // 段首空白丢弃
    out.push(tk);
  }
  return out;
}

/* 每词出现时刻，按字数加权后缩放到该段时长 —— 纯函数，可拖到任意时刻定格 */
export function wordSchedule(words: string[], duration: number): number[] {
  const gaps = words.map((w) => WORD_BASE + w.replace(/\s/g, '').length * WORD_PER_CHAR);
  const total = gaps.reduce((a, b) => a + b, 0) || 1;
  const scale = duration / total;
  const at: number[] = [];
  let acc = 0;
  for (const g of gaps) {
    at.push(acc * scale);
    acc += g;
  }
  return at;
}

export const fmtSec = (ms: number) => `${Math.max(0, ms / 1000).toFixed(1)}s`;

/* ── 产物内容 ── */
export const SLIDES = [
{ n: 1, kicker: '2026 · 07', title: '上周评审复盘', body: '3 场评审 · 12 项决议 · 4 个待办' },
{ n: 2, kicker: '概览', title: '三场评审在讨论什么', body: '定价结构 · 上线节奏 · 数据口径' },
{ n: 3, kicker: '评审一', title: '定价结构', body: '从订阅改为充值，ARPU 目标 $20/月' },
{ n: 4, kicker: '评审一', title: '争议点', body: '充值余额过期规则未定，留到下轮' },
{ n: 5, kicker: '评审二', title: '上线节奏', body: '白名单先行，waitlist 分三批放量' },
{ n: 6, kicker: '评审二', title: '风险', body: '第二批放量与大促撞车，建议错开一周' },
{ n: 7, kicker: '评审三', title: '数据口径', body: 'DAU 统一按自然日去重，历史数据回算' },
{ n: 8, kicker: '评审三', title: '回算范围', body: 'W14–W17，影响 4 张看板' },
{ n: 9, kicker: '决议', title: '已拍板的 8 项', body: '定价 3 项 · 节奏 3 项 · 口径 2 项' },
{ n: 10, kicker: '决议', title: '悬而未决的 4 项', body: '余额过期 · 放量窗口 · 归因窗口 · 退款' },
{ n: 11, kicker: '待办', title: '下周要交付的', body: '口径回算 · 白名单名单 · 定价文案' },
{ n: 12, kicker: '结尾', title: '下次评审', body: '08 / 07 周五 · 议题以悬而未决四项为主' }];


export const DOC_PARAGRAPHS = [
{ h: '会议纪要 · 2026 年 7 月第四周', p: '' },
{ h: '', p: '本周共三场评审，参与 9 人，累计 4 小时 20 分。以下按场次记录结论与分歧，未达成一致的条目单列在末尾。' },
{ h: '一、定价结构评审（07/22）', p: '' },
{ h: '', p: '结论：订阅制改为充值制。理由是当前用量分布长尾明显，订阅对轻度用户不划算、对重度用户又亏，充值能把两端都接住。ARPU 目标定在每月 20 美元，作为放量前的验证线。' },
{ h: '', p: '分歧：充值余额是否过期。市场侧希望设 12 个月有效期以改善现金流预期，产品侧认为余额过期会显著伤害信任，尤其在早期用户里。本条未拍板，留到下轮。' },
{ h: '二、上线节奏评审（07/24）', p: '' },
{ h: '', p: '结论：白名单先行，waitlist 分三批放量，每批间隔一周，每批规模按前一批的留存表现决定，不预先定死。' },
{ h: '', p: '风险：第二批放量窗口与大促重合，支持侧人力会被占用。建议整体后移一周，代价是首月数据样本变小。' },
{ h: '三、数据口径评审（07/25）', p: '' },
{ h: '', p: '结论：DAU 统一按自然日去重口径，跨时区用户归属其注册时区。历史数据回算范围 W14 至 W17，影响 4 张看板，回算期间看板挂「口径调整中」标记。' },
{ h: '四、悬而未决', p: '' },
{ h: '', p: '余额过期规则、第二批放量窗口、归因窗口长度、退款政策。以上四项列为下次评审的主议题，时间定在 8 月 7 日周五。' }];