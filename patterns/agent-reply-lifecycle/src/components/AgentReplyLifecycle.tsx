import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ApprovalCard } from './ApprovalCard';
import { ArtifactCards } from './ArtifactCards';
import { BrowserView } from './BrowserView';
import { CiteChip } from './CiteChip';
import { DiffView } from './DiffView';
import { GenerateView } from './GenerateView';
import { PlanList } from './PlanList';
import { SubagentFanout } from './SubagentFanout';
import { ThinkBlock } from './ThinkBlock';
import { IconArrowUp } from './chatIcons';
import { ToolGroup } from './ToolGroup';
import { BLOCKS, BUBBLE_IN, type Cite, browserNav, browserPhase, diffPhase, fanJoin, generatePhase, PLAN_AT, PLAN_STEPS, planAppear, scriptedPlanExpand, FOLLOW_MARGIN, OMEGA, GAP, SCROLL_UP, SEND_DUR, TIMING, TOTAL, HEIGHT_FOLLOW, cd, clamp01, easeOutQuint, fmtSec, scriptedExpand, splitWords, toolEnds, toolStarts, wordSchedule } from './chatScript';

/* 聊天窗高度不写死 —— 写死 780px 后，加上标题与内边距就超过了常见笔记本的
   浏览器可视高度，于是页面自己滚起来，聊天窗顶部被推到视口之外。
   人看到的是窗口中段，消息确实在窗顶，但那个窗顶他根本看不见。
   改为占满可用高度并实测，占位公式用实测值。 */
const CHAT_MAX_H = 700; // 横版窗口高，宽高比接近 16:10
/* 聊天框本身就是一台电脑的窗口：横版。
   但内容列必须居中限宽 —— 桌面版 ChatGPT / Claude 都是这样，
   一行字横跨 1100px 眼睛跟不住，读一行要转头。 */
const CHAT_W = 1120; // 聊天窗宽（16:10 的横版窗口）
const COLUMN_W = 720; // 窗内的内容列宽
const CHAT_PAD = 16;
/* 计划浮层遮住滚动区底部,内容要多留这么多才不会被永久压在它下面。
   取折叠态高度 + 间距;展开是用户主动触发的临时状态,盖住一点可以接受。 */
const PLAN_CLEARANCE = 48;

/* 让一整块内容的「布局高度」也随时间长出来，而不只是淡入。

   产物卡片原本只做 opacity + transform —— 那两者都不影响布局，
   于是内容高度在出现的那一帧直接阶跃 +170px。占位块已经压到地板时
   补偿不了，视图就被顶一下。实测那一下是 32px。
   子视图(browser / 生成预览)没有这个毛病，因为它们的高度本来就是动画的。 */
const GrowIn = ({
  start,
  dur,
  T,
  children
}: {
  start: number;
  dur: number;
  T: number;
  children: ReactNode;
}) => {
  const inner = useRef<HTMLDivElement>(null);
  const [h, setH] = useState(0);
  useLayoutEffect(() => {
    if (inner.current) setH(inner.current.offsetHeight);
  });
  const p = cd((T - start) / dur);
  return <div className="overflow-hidden" style={{
    height: h * p
  }}>
      <div ref={inner}>{children}</div>
    </div>;
}; // 滚动容器自身的上下内边距，占位高度必须把它扣掉

const easeOutCubic = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);

/* 流式文本：按词，不按字。按字出，行尾换行时整段重排，视觉上一直在抽搐。

   动画交给 CSS —— 每个词是一个 [data-stream-word] 的 span，
   React 只在词数变化时新挂载 span，浏览器在合成层上放动画，
   逐帧的 JS 里不做任何事。这是 Streamdown / FlowToken 那一批的共识做法，
   也是它比「每帧算 opacity」顺的原因：动画不再绑在 React 的渲染节奏上。

   没有光标。基准里没有任何一家用竖杠 —— 淡入本身就说明了「还在出字」。 */
const CITE_RE = /^\[(\d+)\]$/;
const StreamText = ({
  text,
  start,
  dur,
  T,
  cites
}: {
  text: string;
  start: number;
  dur: number;
  T: number;
  cites?: Cite[];
}) => {
  const words = useMemo(() => splitWords(text), [text]);
  const sched = useMemo(() => wordSchedule(words, dur), [words, dur]);
  const inner = useRef<HTMLDivElement>(null);
  const [h, setH] = useState<number | 'auto'>('auto');
  let visible = 0;
  while (visible < words.length && T >= start + sched[visible]) visible++;

  // 只在词数变化时重建，T 每帧变化不触发任何 DOM 工作
  const rendered = useMemo(() => words.slice(0, visible).map((w, i) => {
    /* 行内引用 chip：结论就地标出处，不必翻到末尾。
       它跟正文用同一条揭示动画 —— 它是句子的一部分，不是浮在上面的注记。 */
    const m = w.match(CITE_RE);
    const c = m && cites?.find(x => x.n === +m[1]);
    if (c) return <CiteChip key={i} cite={c} />;
    return <span key={i} data-stream-word>
            {w}
          </span>;
  }), [words, visible, cites]);

  // 只在词数变化时量一次，避免每帧读布局
  useLayoutEffect(() => {
    if (inner.current) setH(inner.current.scrollHeight);
  }, [visible]);
  /* 出字期间必须裁剪 —— 高度带 260ms 过渡，不裁的话新换的一行会提前冒出来。
     出完最后一个词就放开：引用的悬浮卡浮在这段文字上方，裁着就被切掉。
     条件绑在词数上，不另外写一个延时常数 —— 那个数一定会和 dur 对不齐。 */
  const settled = visible >= words.length;
  return <div style={{
    height: h,
    overflow: settled ? 'visible' : 'hidden',
    transition: `height ${HEIGHT_FOLLOW}ms cubic-bezier(.22,1,.36,1)`
  }}>
      <div ref={inner} className="text-[13.5px] leading-[1.8] text-[#1c1b18]">
        {rendered}
      </div>
    </div>;
};
export const AgentReplyLifecycle = () => {
  const [rawT, setT] = useState(0);
  /* 打断：停在哪一刻,渲染就一直读那一刻。
     时钟本身不回退,恢复时从原处继续 —— 打断是「不再往下」,不是「重来」。 */
  const [stopAt, setStopAt] = useState<number | null>(null);
  const T = stopAt ?? rawT;
  const [playing, setPlaying] = useState(true);
  const [composer, setComposer] = useState('');
  const groupCount = BLOCKS.filter(b => b.type === 'tools').length;
  const [manual, setManual] = useState<(number | null)[]>(() => Array(groupCount).fill(null));
  /* 计划的展开度是一个连续量：脚本段读精确值（拖时间轴要能定格），
     用户点击后改为临界阻尼追随目标值。与工具组同一套追随器。 */
  const [planVal, setPlanVal] = useState(0);
  const planValRef = useRef(0);
  const planManualRef = useRef<number | null>(null);
  /* 推理块与分派块各自只有一个，不必进 groupIndex 那套数组 —— 各给一个开关就够 */
  const [thinkOpen, setThinkOpen] = useState<number | null>(null);
  const [fanOpen, setFanOpen] = useState<number | null>(null);
  const [decided, setDecided] = useState<'approve' | 'skip' | null>(null);
  const [expandVals, setExpandVals] = useState<number[]>(() => Array(groupCount).fill(0));
  const tRef = useRef(0);
  const playRef = useRef(true);
  const manualRef = useRef(manual);
  const valsRef = useRef(expandVals);
  const scrollRef = useRef<HTMLDivElement>(null);
  const roundRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef(true);
  const spacerRef = useRef<HTMLDivElement>(null);
  playRef.current = playing;
  manualRef.current = manual;
  valsRef.current = expandVals;
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      if (playRef.current) {
        tRef.current = (tRef.current + dt) % TOTAL;
        setT(tRef.current);
      }

      // 每组的展开值：脚本段用精确值（拖时间轴要能定格），
      // 手动点击用临界阻尼追随（不然点一下会硬跳）
      const cur = valsRef.current;
      const next = cur.map((v, i) => {
        const m = manualRef.current[i];
        const target = m ?? scriptedExpand(i, tRef.current);
        if (m === null) return target;
        return v + (target - v) * (1 - Math.exp(-OMEGA * dt / 1000));
      });
      if (next.some((v, i) => Math.abs(v - cur[i]) > 0.0005)) setExpandVals(next);

      // 计划面板：同样的两段式 —— 脚本给精确值，手动给阻尼追随
      const pm = planManualRef.current;
      const pTarget = pm ?? scriptedPlanExpand(tRef.current);
      const pNext = pm === null ? pTarget : planValRef.current + (pTarget - planValRef.current) * (1 - Math.exp(-OMEGA * dt / 1000));
      if (Math.abs(pNext - planValRef.current) > 0.0005) setPlanVal(pNext);
      planValRef.current = pNext;

      /* 占位块 + 粘底：量高、写高、滚到底，三件事必须在同一帧里按顺序做完。
          之前占位高度走 ResizeObserver → setState → 下一帧才生效，慢了一帧：
         内容长高的那一帧 scrollHeight 先变大，粘底把视图拽一下，
         下一帧占位块才补偿回来 —— 那一拽一补就是「弹来弹去」。
         改成命令式后两者在同一帧抵消，视图纹丝不动。 */

      const el = scrollRef.current;
      const round = roundRef.current;
      const spacer = spacerRef.current;
      if (el && round && spacer) {
        const chatH = el.clientHeight;
        const roundH = round.offsetHeight;
        const grow = cd((tRef.current - BUBBLE_IN) / SCROLL_UP);
        const h = Math.max(FOLLOW_MARGIN, chatH - roundH - CHAT_PAD * 2 - PLAN_CLEARANCE) * grow;
        spacer.style.height = `${h}px`;
        if (pinnedRef.current) el.scrollTop = el.scrollHeight;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  const scrub = (v: number) => {
    tRef.current = v;
    setT(v);
    setPlaying(false);
    setManual(Array(groupCount).fill(null));
    planManualRef.current = null;
    setThinkOpen(null);
    setFanOpen(null);
    setDecided(null);
    setStopAt(null);
    pinnedRef.current = true;
  };
  const onChatScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    pinnedRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
  };

  // 时间轴分段由脚本推导，不另手写一份 —— 两份数值一定会打架
  const segs = [{
    label: '发出',
    start: 0,
    dur: BUBBLE_IN,
    kind: 'send' as const
  }, {
    label: '上滚',
    start: BUBBLE_IN,
    dur: SCROLL_UP,
    kind: 'scrollup' as const
  }, ...BLOCKS.map((b, i) => ({
    label: b.type === 'text' ? `说话 ${BLOCKS.slice(0, i + 1).filter(x => x.type === 'text').length}` : b.type === 'tools' ? `组 ${TIMING[i].groupIndex + 1}` : b.type === 'think' ? '推理' : b.type === 'fanout' ? '分派' : b.type === 'approval' ? '审批' : '产物',
    start: TIMING[i].start,
    dur: TIMING[i].end - TIMING[i].start + GAP,
    kind: b.type
  }))];
  let segIndex = 0;
  for (let i = 0; i < segs.length; i++) if (T >= segs[i].start) segIndex = i;
  const sendP = easeOutQuint(T / BUBBLE_IN);
  // 发出那 400ms 里让占位块一起长出来，滚动才是连续的而不是硬跳一格

  return <div style={{
    fontFamily: "'Inter', 'Noto Sans SC', ui-sans-serif, system-ui, sans-serif"
  }} className="flex min-h-screen w-full items-center justify-center bg-[#f6f5f2] p-6 sm:p-8">
      
      <div className="flex w-full flex-col items-center gap-6" style={{
      maxWidth: CHAT_W
    }}>
        {/* 显式高度，不靠父级拉伸 —— 窄屏时父级不再提供高度，靠 h-full 会得到 0 或溢出。
             减去的 300px 是标题 + 输入条 + 下方时间轴与规则面板 + 页面留白。 */}
        <div className="flex w-full min-h-0 flex-col" style={{
        height: `min(${CHAT_MAX_H}px, calc(100dvh - 300px))`
      }}>
          
        <header className="mb-4">
          <h1 className="text-[15px] font-medium tracking-tight text-[#1c1b18]">Agent Reply Lifecycle</h1>
          <p className="mt-0.5 text-[12.5px] text-[#8b8676]">
            说话与工具组交替；折叠只看最新一条；产物小窗可直接用鼠标滚。
          </p>
        </header>

        <div className="flex min-h-0 flex-1 flex-col rounded-[18px] bg-white ring-1 ring-[#1c1b18]/[0.08]">
          {/* 固定高度、可滚动 —— 会话是有边界的容器 */}
          {/* 滚动区与计划浮层同处一个 relative 容器 ——
                 计划浮在内容之上，它的边框之外仍是透明的，底下的对话看得见。
                 之前把它和输入框做成一整块灰底，那一整条就把聊天区切掉了。 */}
          <div className="relative min-h-0 flex-1">
          <div ref={scrollRef} onScroll={onChatScroll} className="no-scrollbar absolute inset-0 overflow-y-auto overscroll-contain px-5" style={{
              paddingTop: CHAT_PAD,
              paddingBottom: CHAT_PAD + PLAN_CLEARANCE
            }}>
                
            {/* 贴底：内容不足一屏时压在底部，新消息从下方长出。
                     顶对齐会在下方留一大片空白，真实聊天应用没有那样的。 */}
            <div className="mx-auto flex min-h-full flex-col justify-end" style={{
                maxWidth: COLUMN_W
              }}>
            {/* 去掉历史后，用户消息就是会话第一条，「最上面」不再有歧义。
                       ref 直接从气泡上沿量起。 */}
            <div ref={roundRef}>
            <div className="flex justify-end">
              <div style={{
                      opacity: clamp01(T / (BUBBLE_IN * 0.55)),
                      transform: `translateY(${(1 - sendP) * 16}px)`
                    }} className="max-w-[78%] rounded-[16px] rounded-br-[5px] bg-[#1c1b18] px-3.5 py-2 text-[13px] leading-[1.55] text-[#f6f5f2]">
                        
                把上周三场评审整理成一份 PPT，再补一份会议纪要
              </div>
            </div>

            <div className="mt-3 flex flex-col gap-2.5">
              {BLOCKS.map((b, i) => {
                      if (T < TIMING[i].start) return null;
                      const appear = clamp01((T - TIMING[i].start) / 260);
                      const style = {
                        opacity: appear,
                        transform: `translateY(${(1 - appear) * 8}px)`,
                        maxWidth: '86%'
                      };
                      if (b.type === 'think') {
                        return <div key={i} style={style}>
                      <ThinkBlock lines={b.lines} start={TIMING[i].start} T={T} expand={thinkOpen} onToggle={() => setThinkOpen(v => (v ?? 0) > 0.5 ? 0 : 1)} />
                              
                    </div>;
                      }
                      if (b.type === 'text') {
                        return <div key={i} style={style}>
                      <StreamText text={b.text} start={TIMING[i].start} dur={b.dur} T={T} cites={b.cites} />
                    </div>;
                      }
                      if (b.type === 'fanout') {
                        return <div key={i} style={style}>
                      <SubagentFanout fan={b.fanout} start={TIMING[i].start} join={fanJoin(b.fanout, TIMING[i].start, T)} T={T} expand={fanOpen} onToggle={() => setFanOpen(v => (v ?? 0) > 0.5 ? 0 : 1)} />
                              
                    </div>;
                      }
                      if (b.type === 'approval') {
                        return <div key={i} style={style}>
                      <ApprovalCard a={b.approval} T={T} start={TIMING[i].start} decided={decided} onDecide={setDecided} />
                              
                    </div>;
                      }
                      if (b.type === 'tools') {
                        const g = TIMING[i].groupIndex;
                        const {
                          open,
                          page
                        } = browserPhase(i, T);
                        const {
                          navIndex,
                          navP
                        } = browserNav(i, T);
                        const gen = generatePhase(i, T);
                        const dv = diffPhase(i, T);
                        const pages = b.tools.filter(t => t.kind === 'browse').map(t => t.page!);
                        return <div key={i} style={style} className="flex flex-col gap-2">
                      <ToolGroup title={b.title} tools={b.tools} starts={toolStarts(i)} ends={toolEnds(i)} groupEnd={TIMING[i].end} T={T} expand={expandVals[g] ?? 0} onToggle={() => setManual(m => {
                            const n = [...m];
                            n[g] = (expandVals[g] ?? 0) > 0.5 ? 0 : 1;
                            return n;
                          })} />
                              
                      <BrowserView open={open} page={page} prev={navIndex > 0 ? pages[navIndex - 1] : undefined} navP={navP} />
                              
                      <GenerateView open={gen.open} p={gen.p} name={gen.name} />
                      <DiffView open={dv.open} file={dv.file} p={dv.p} />
                    </div>;
                      }
                      return <div key={i} style={{
                        maxWidth: '100%'
                      }}>
                    <GrowIn start={TIMING[i].start} dur={520} T={T}>
                      <ArtifactCards />
                    </GrowIn>
                  </div>;
                    })}
            </div>
            </div>

            {/* 底部占位块 —— 这一个东西同时做成了三件事：
                       · 发出瞬间它撑满窗口，粘底滚动于是把用户消息顶到最上一行
                       · 回复在下方空白里生长，它随之收缩，视图纹丝不动
                       · 收到只剩 FOLLOW_MARGIN 时不再收缩，此后每长一行就滚一行，
                         最新输出始终停在距窗底 FOLLOW_MARGIN 的那条线上，不贴底
                       所以「顶到最上」「先不滚」「之后跟随」不是三套逻辑，是同一个高度。 */}
            <div ref={spacerRef} aria-hidden style={{
                  height: 0
                }} />
            </div>
          </div>

          {/* 落位与摊开分成两拍：先作为一行落下来，再展开。
              两件事挤在同一帧里做，读起来就是「凭空冒出一大块」。 */}
          {T >= PLAN_AT && <div className="pointer-events-none absolute inset-x-0 bottom-1.5 px-5" style={{
            opacity: planAppear(T),
            transform: `translateY(${(1 - planAppear(T)) * 10}px)`
          }}>
              <div className="pointer-events-auto mx-auto" style={{
                maxWidth: COLUMN_W
              }}>
                <PlanList steps={PLAN_STEPS} T={T} expand={planVal} onToggle={() => {
                  planManualRef.current = planValRef.current > 0.5 ? 0 : 1;
                }} />

              </div>
            </div>}
          </div>

          {/* 输入框在最下面，与聊天区、计划是上下关系，不做成另一个色带区 */}
          <div className="px-5 pb-3 pt-0.5">
            <div className="mx-auto flex items-end gap-2 rounded-[14px] bg-white px-3 py-2 ring-1 ring-[#1c1b18]/[0.1]" style={{
              maxWidth: COLUMN_W
            }}>
                
              <input value={composer} onChange={e => setComposer(e.target.value)} placeholder={stopAt !== null ? '已停止' : '继续提问'} className="min-w-0 flex-1 bg-transparent py-[3px] text-[13px] text-[#1c1b18] outline-none placeholder:text-[#b0ab9b]" />
                
              {/* 输出中这个键是刹车，停下之后才是发送 —— 同一个位置换语义 */}
              <button onClick={() => {
                if (stopAt !== null) {
                  setStopAt(null);
                  setPlaying(true);
                } else {
                  setStopAt(tRef.current);
                  setPlaying(false);
                }
              }} aria-label={stopAt !== null ? '继续' : '停止'} className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#1c1b18] text-[#f6f5f2] transition-opacity hover:opacity-85">
                  
                {stopAt !== null ? <IconArrowUp /> : <span className="block h-[9px] w-[9px] rounded-[2px] bg-current" />}
              </button>
            </div>
          </div>
        </div>

        </div>

        <div className="w-full min-w-0">
        {/* ── 时间轴 ── */}
        <div className="flex gap-1">
          {segs.map((s, i) => <button key={i} onClick={() => scrub(s.start)} aria-pressed={i === segIndex} title={`${s.label} · ${s.dur}ms`} style={{
            flexGrow: s.dur,
            flexBasis: 0,
            minWidth: 44
          }} className={['h-7 overflow-hidden whitespace-nowrap rounded-md px-1 text-[11px] transition-colors', i === segIndex ? 'bg-[#1c1b18] text-[#f6f5f2]' : s.kind === 'tools' ? 'bg-[#e7e3d9] text-[#6f6a5c] hover:bg-[#ddd8ca]' : 'bg-[#f0ede4] text-[#8b8676] hover:bg-[#e7e3d9]'].join(' ')}>
              
              {s.label}
            </button>)}
        </div>

        <div className="mt-3 flex items-center gap-3">
          <button onClick={() => setPlaying(p => !p)} className="shrink-0 rounded-lg px-3.5 py-1.5 text-[12.5px] text-[#6f6a5c] ring-1 ring-[#1c1b18]/10 transition-colors hover:text-[#1c1b18]">
              
            {playing ? '暂停' : '播放'}
          </button>
          <input type="range" min={0} max={TOTAL} step={1} value={Math.round(T)} onChange={e => scrub(Number(e.target.value))} className="flex-1 accent-[#1c1b18]" aria-label="时间轴" />
            
          <span className="w-24 shrink-0 text-right font-mono text-[12px] tabular-nums text-[#8b8676]">
            {fmtSec(T)} / {fmtSec(TOTAL)}
          </span>
        </div>

        </div>
      </div>
    </div>;
};
export default AgentReplyLifecycle;