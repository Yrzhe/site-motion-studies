# Agent Reply Lifecycle

一次 AI 对话回复的完整生命周期，做成一段 35 秒的可拖动动效：

推理 → 说话 → 分派并行子任务 → 调工具 → 浏览网页 → 失败重试 → 停下等审批
→ 生成图像 → 写文件前摊开 diff → 交付产物。全程有一块常驻的计划面板，
随时可以打断。

原创，不复刻任何具体产品。

## 打开

```bash
open demo/index.html          # 单文件，无运行时依赖，双击即可
```

改动源码后重新构建：

```bash
npm install
npm run dev                   # 本地开发
npm run build                 # 产出 demo/index.html
```

## 它想解决什么

Agent 产品的界面难点不在「显示状态」，在**一次回复里会发生十几件性质不同的事**：
有的要读完（正文），有的只需瞥一眼（推理），有的必须一直看得见（计划），
有的得停下来等人（审批）。把它们平铺成一条消息流，读者会淹掉。

这件作品的答案是一条贯穿的规矩：**静止态安静，要看的时候再展开**。
工具组折叠时只显示最新一条，推理跑完塌成一行耗时，引用静止时只是个灰数字。
每一处的「展开」都不是布尔开关，是一个连续量。

## 八个机制

### 1. 临界阻尼阶跃 —— 全片唯一一条曲线

位移、高度、展开度、开窗，全部走同一个函数。单调、无过冲：

```js
const OMEGA = 5.2;
const cdRaw = (p) => 1 - (1 + OMEGA * p) * Math.exp(-OMEGA * p);
const CD_NORM = cdRaw(1);
const cd = (t) => cdRaw(Math.min(1, Math.max(0, t))) / CD_NORM;
```

**不变量**：不要换成带回弹的 spring。这里所有动的东西都在文字附近，
过冲会让整列字上下弹，读起来像卡顿。ω 越小越从容，5.2 是读得清又不拖沓的位置。

### 2. 一个高度同时做成四件事

发消息之后的滚动行为通常要写四套逻辑：消息顶到最上、回复在下方生长、
视图先不动、之后跟随。这里它们是**同一个占位块的高度**：

```js
const h = Math.max(FOLLOW_MARGIN, chatH - roundH - CHAT_PAD * 2 - PLAN_CLEARANCE)
        * cd((T - BUBBLE_IN) / SCROLL_UP);
// FOLLOW_MARGIN 96 · CHAT_PAD 16 · PLAN_CLEARANCE 48 · BUBBLE_IN 380 · SCROLL_UP 620
```

发出瞬间它撑满窗口，粘底滚动于是把用户消息顶到第一行；回复在下方空白里生长，
它随之收缩，视图纹丝不动；收到只剩 96px 就不再收缩，此后每长一行滚一行，
最新输出永远停在距窗底 96px 的那条线上。

**不变量**：量高、写高、滚到底三件事必须在**同一帧**里按顺序做完。
走 ResizeObserver → setState 会慢一帧，内容长高那一帧粘底先把视图拽一下、
下一帧占位块才补偿回来 —— 那一拽一补就是「弹来弹去」。

```js
const chatH = el.clientHeight, roundH = round.offsetHeight;
spacer.style.height = `${h}px`;
if (pinned) el.scrollTop = el.scrollHeight;
```

### 3. 运行时折叠：可见度由几何决定，不写 stagger

工具组折叠时只占一行，内容随执行持续替换；展开时整组历史铺开。
换条与展开是同一个位移的两端：

```js
let scroll = 0;
for (let i = 1; i < rowStarts.length; i++) scroll += cd((T - rowStarts[i]) / SLIDE_DUR);
const boxH   = lerp(ROW_H, shown * ROW_H, expand);
const shiftY = lerp(-scroll * ROW_H, 0, expand);
const squeeze = (1 - expand) * Math.max(0, latest - i) * ACCORDION;  // 手风琴
const top = i * ROW_H + shiftY - squeeze;
```

每一行的透明度不手写，直接从它相对可视带的位置推出来：

```js
let vis = 1;
if (top < 0)        vis = clamp01(1 + top / ROW_H);
if (top + ROW_H > boxH) vis = Math.min(vis, clamp01((boxH - top) / ROW_H));
```

**不变量**：不要在这上面再叠一层人造 stagger。展开时上方各行本来就依次进入视口，
那个先后顺序是位移自带的。ROW_H 32 · SLIDE_DUR 420 · ACCORDION 6。

### 4. 推理缝隙：表示「它很长而且还在长」

推理不是给人读完的，真实推理长得多。问题不是怎么展示，是怎么表示它没展示完。

做法是一个**高度恒定**的裁剪窗，只露两行，念头逐条从下方进来、从上沿淡出。
窗口不长高，下面的内容就不会被一段不知道多长的东西一直往下推。

```js
const collapse = cd((e - spent) / 520);         // 跑完之后从露两行走到露零行
const rows = Math.max(lerp(SLIT, 0, collapse), userExpand * lines.length);
// 缝隙是独立的裁剪容器，上沿正好压在标题行下面
<div style={{ position:'absolute', top: ROW_H, height: rows * LINE_H, overflow:'hidden' }}>
```

**不变量**：硬裁 + 淡出必须叠着用。只做淡出的话，半透明的字仍会压在
标题行上；只做硬裁的话，一刀切读作「只有这些」，软边才读作「上面还有」。
跑完塌成一行「思考了 3.5s」—— 事后没人回看想了什么，只在意想了多久。

### 5. 并行分叉：证明「同时」

三行叠在一起，人默认读成先后。所以这一块的运动全部用来证明并行：

- **分叉** 一条竖轨从标题行长下来，三个横杈依次伸出，三条道才出现。
  先有分叉再有道，顺序本身就在说它们是从同一处派出去的。
- **参差** 三条同时开始但时长不同（1150 / 2050 / 1500ms）。
  同步推进会被眼睛读成一个物体在动 —— 真实的并行永远是参差的。
- **掉队** 先跑完的立刻把进度底撤掉（380ms）并暗到 0.5，只剩最慢那条亮着。
  这不是修饰：并行的成本就是最慢那条决定总时长，两条暗的陪着一条亮的，
  把这件事直接摆出来了。
- **合流** 三条道向标题行收拢并消失，塌成一行汇总。收拢点相同才读作「并成一条」。

```js
const join = cd((T - start - slowest - FAN_JOIN_HOLD) / FAN_JOIN_DUR);  // 320 / 460
const open = Math.max(1 - join, userExpand);
const top  = lerp(ROW_H - LANE_H, ROW_H + i * LANE_H, open);  // 收拢点相同
```

**不变量**：每条道的起点必须相同 —— 起点相同是「并行」唯一说得清的定义，
所以数据结构里 lane 只带自己的时长，不带自己的起点。

### 6. 流式出字：动画交给 CSS，逐帧 JS 里什么都不做

每个词一个 `<span data-stream-word>`，React 只在词数变化时新挂载 span，
浏览器在合成层上放动画。已落定的词零开销。

```css
@keyframes stream-word-in {
  from { opacity: 0; filter: blur(2.5px); }
  to   { opacity: 1; filter: blur(0);     }
}
[data-stream-word] {
  display: inline-block;
  white-space: pre;
  animation: stream-word-in 620ms cubic-bezier(0.33, 1, 0.68, 1) both;
}
```

分词：中文逐字，西文整词，标点粘前一块，**空白必须保留**。
逐字而不是两字一块 —— 单位越小，同一时刻在过渡的单位越多，前沿越像一条连续软边。

```js
const raw = text.match(/\[\d+\]|[A-Za-z0-9][A-Za-z0-9._+-]*|[一-龥]|\s+|[^\s]/g) ?? [];
// 每词时刻按字数加权后缩放到该段时长，纯函数，可拖到任意时刻定格
const gaps = words.map(w => 34 + w.replace(/\s/g,'').length * 11);
```

**不变量**：
- 揭示动画里**不要放位移**。translateY 会让每个字从下面跳上来，几十个字就是几十次跳。
- 620ms 不能照抄常见的 150ms。中文字间隔约 76ms，620ms 意味着任一时刻有八个字
  同时在过渡，八个不同透明度的字排在一起才是一条扫过去的渐变边。
- `inline-block` 会吃掉尾随空格，必须配 `white-space: pre`，否则
  「上周有 3 场评审」会渲染成「上周有3场评审」—— 那是在改原文。
- 不要竖杠光标。淡入本身就说明了还在出字。

### 7. 常驻计划面板：展开度是连续量，不是布尔

计划跨越整场会话，比第一次工具调用先出现、比最后一次晚结束，所以它不进消息流 ——
放进去会随输出滚走，而「还剩几步」恰恰是任何时刻都该看得见的。它浮在输入框上方。

脚本演示与用户点击共用一个量，走两段式追随器：

```js
const target = manual ?? scriptedExpand(T);
const next = manual === null
  ? target                                              // 脚本段读精确值，拖时间轴能定格
  : v + (target - v) * (1 - Math.exp(-OMEGA * dt / 1000));  // 点击后阻尼追随
```

自动演示拆成四拍：落位 300 → 摊开 560 → 停 1760 → 收 620。落位与摊开分开，
不然读起来就是凭空冒出一整块。折叠那一行的空白处显示当前步骤 ——
折叠是它绝大多数时间的形态，只给一个计数等于让折叠态没用。

### 8. 引用：静止是脚注，hover 才是来源

正文里的 `[1]` 渲染成 13×13 的中性灰上标数字，抬 3.5px。没有色块、没有品牌色。

翻过 Cohere、Cursor、Grok、Elicit 的做法：**没有一家在正文里放带品牌色的 pill**。
脚注比它注解的那句话还抢眼，阅读顺序就反了。品牌色留到 hover，那时它才在传信息。

hover 浮出的卡片不是一张通用来源卡，而是把这段会话前面那个 browser 小窗的
三个零件原样缩小（accent 方块 + 站名 / 页面标题 / 地址栏样式的 url）。
引用指向的正是读者刚才见过的那一页，卡片长成同一个东西，它才读作
「这句结论来自刚才那一页」而不是「这里有个链接」。

数据上引用直接持有 Page 对象，不另抄一份站名和颜色 —— 两处必须是同一个对象。

**不变量**：悬浮卡必须绝对定位，不能挤开句子。流式容器在出字期间要裁剪
（高度带过渡，不裁的话新换的行会提前冒出来），**最后一个词落定时放开**裁剪，
否则卡片会被切掉。这个条件绑在词数上（`visible >= words.length`），
不要用「时长 + 偏移」去逼近 —— 逐词时刻表按字数加权缩放后，
最后一个词的落点和 `start + dur` 并不重合。

## 时刻表

整场 35.3s，全部由 `chatScript.ts` 推导，没有第二份手写数值。

| 块 | 起 (ms) | 时长 |
|---|---|---|
| 发出 + 上滚 | 0 | 1000 |
| 推理 | 1000 | 3520 |
| 说话 1 | 4740 | 1500 |
| 分派子任务 | 6460 | 3190 |
| 说话 2 | 9870 | 1900 |
| 查资料（含失败重试 + browser 小窗） | 11990 | 5400 |
| 说话 3（含引用） | 17610 | 2500 |
| 审批 | 20330 | 2600 |
| 生成产物（图像预览 + diff） | 23150 | 7000 |
| 说话 4 | 30370 | 1650 |
| 产物卡片 | 32240 | 900 |

计划面板 4800ms 出现，四个步骤分别在 8700 / 17400 / 27950 / 30150 勾掉 ——
对齐到真正让那一步成立的那次调用结束时刻。

## 目录

```text
src/
  main.tsx
  index.css                    # 揭示动画 / 产物错峰 / 滚动条
  components/
    AgentReplyLifecycle.tsx    # 主组件：时钟、占位块、粘底、时间轴
    chatScript.ts              # 全部时刻与数据，纯函数，无 React
    chatIcons.tsx              # 14px stroke 1.5 的图标集，不用 emoji
    ThinkBlock.tsx             # 推理缝隙
    SubagentFanout.tsx         # 并行分叉
    ToolGroup.tsx              # 运行时折叠
    PlanList.tsx               # 常驻计划面板
    CiteChip.tsx               # 引用上标 + 悬浮卡
    BrowserView.tsx            # 浏览器小窗
    GenerateView.tsx           # 图像生成预览（分辨率逐级细分）
    DiffView.tsx               # 写文件前的 diff
    ApprovalCard.tsx           # 停下来等人
    ArtifactCards.tsx          # 产物卡片，可用鼠标滚
    Shimmer.tsx                # 高光扫过动词本身，不转 spinner
demo/index.html                # 构建产物，单文件无依赖
```

## 移植说明

**可以随便改的**：配色、文案、图标、字号、每个块的时长、脚本内容（`BLOCKS` 数组）、
块的种类和顺序。时刻表由 `TIMING` 从 `BLOCKS` 推导，加减块不需要改别处。

**不要改的**：`cd()` 的形状（换成回弹曲线整片会开始抖）、几何决定可见度的写法
（改回手写 stagger 就对不齐）、占位块三件事的同帧顺序、流式动画里不加位移、
`white-space: pre`、并行各道起点相同。

**接到真实数据上**：`T` 现在来自一个 rAF 时钟。接真实流的话，把 `T` 换成
「本次回复已经过去的毫秒数」，把 `BLOCKS` 换成事件流即可 ——
所有组件都是 `f(状态, T)` 的纯函数，没有内部动画状态。

## License

MIT。原创实现，不含任何第三方站点的资源。
