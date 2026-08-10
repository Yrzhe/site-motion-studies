import { useEffect, useRef, useState } from 'react';
import { AgentGreeting } from './AgentGreeting';
import { ChatComposer } from './ChatComposer';
import { CARD_W, ExpandedCard, cardHeight } from './ExpandedCard';
import { BlueprintGrid, GenerateStage } from './GenerateStage';
import { ChildTiles } from './ChildTiles';
import { DetailPage } from './DetailPage';
import { ResultCard } from './ResultCard';
import { RouteMap } from './RouteMap';
import { Composer, FlightCard, HistoryRow, HomeChrome, SCREEN_H, SCREEN_W, StatusBar, Wallpaper } from './HomeScreen';
import { Keyboard } from './Keyboard';
import { SuggestCloud } from './SuggestCloud';
import {
  CHIPS_OUT_AT,
  CHIPS_OUT_DUR,
  COLLAPSE_AT,
  COLLAPSE_DUR,
  COMP_IN_AT,
  COMP_IN_DUR,
  COMP_OUT_AT,
  COMP_OUT_DUR,
  DISSOLVE_AT,
  DISSOLVE_DUR,
  GROW_AT,
  GROW_DUR,
  CARD2_AT,
  CHIPS2,
  FILL_AT,
  FILL_DUR,
  FORK_AT,
  HISTORY_AT,
  HISTORY_DUR,
  HOME_AT,
  HOME_DUR,
  MAP_AT,
  OPEN_AT,
  OPEN_DUR,
  SHRINK_AT,
  SHRINK_DUR,
  SLOT_AT,
  FRAME,
  KB_AT,
  KB_DOWN_AT,
  KB_DOWN_DUR,
  KB_DUR,
  LINK2_AT,
  SEND_AT,
  WIRE_OUT_AT,
  WIRE_OUT_DUR,
  TOTAL,
  TAP,
  TAP_DRAIN,
  TAP_IN,
  TAP_OUT,
  TOUCH_AT,
  TYPE_AT,
  cd,
  clamp01,
  fmtSec,
  lerp,
} from './scaffoldScript';

/* 还原 @glebich「Gen UI thinking」屏幕里的内容。

   已建三段：主页 → 航班卡展开 → 输入态（收卡、起键盘、提问、打字、发送）。
   所有东西都是 f(T) 的纯函数，拖时间轴到任何一刻都能定格。
*/

/* 点按涟漪：原地三拍 —— 盘长出来 → 填充抽掉只剩一圈 → 圈扩大淡出。
   三拍合起来才读作「按下去又松开」；只做一个淡入淡出的圆点读作「有东西闪了一下」。 */
const TouchDot = ({ T }: { T: number }) => {
  const inP = cd((T - TOUCH_AT) / TAP_IN);
  const drain = cd((T - TOUCH_AT - TAP_IN) / TAP_DRAIN);
  const out = cd((T - TOUCH_AT - TAP_IN - TAP_DRAIN) / TAP_OUT);
  const a = clamp01(inP) * (1 - clamp01(out));
  if (a <= 0.001) return null;
  const d = lerp(44, 58, out);
  return (
    <span
      className="pointer-events-none absolute rounded-full"
      style={{
        left: TAP.x,
        top: TAP.y,
        width: d,
        height: d,
        transform: `translate(-50%,-50%) scale(${lerp(0.55, 1, inP)})`,
        background: `rgba(148,180,236,${0.5 * (1 - drain)})`,
        boxShadow: `inset 0 0 0 1.4px rgba(120,158,224,${0.75 * drain})`,
        opacity: a,
      }}
    />
  );
};

/* 卡片收起后的缩放。原片 14.0s 那一帧：卡片宽 202 原生 px 对屏宽 358 = 0.564，
   展开态是 358/390 = 0.918，相除得 0.61。缩放原点在顶边中央 ——
   卡片是「往上收」，不是「往中间收」。 */
const COMPACT = 0.6;

/* 这几块跟 T 无关。提成常量元素之后 React 每帧比对到同一个引用就直接跳过整棵子树 ——
   否则行星球体、键盘、状态栏都会跟着主时间轴一帧一帧重建。 */
const STATUS = <StatusBar />;
const STATUS_DARK = <StatusBar dark />;
const CHROME = <HomeChrome />;
const HOME_CARD = <FlightCard />;
const HOME_COMPOSER = <Composer />;
const HOME_HISTORY = <HistoryRow />;

export const AnswerScaffold = () => {
  const [T, setT] = useState(0);
  const [playing, setPlaying] = useState(true);
  const tRef = useRef(0);
  const playRef = useRef(true);
  playRef.current = playing;

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
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const scrub = (v: number) => {
    tRef.current = v;
    setT(v);
    setPlaying(false);
  };

  /* 主页的三样东西（胶囊行 / 问候 / 输入条）一起退场，
     航班卡不退 —— 它是被点开的那一个，要接着长大。 */
  const homeOut = cd((T - DISSOLVE_AT) / DISSOLVE_DUR);
  const grow = cd((T - GROW_AT) / GROW_DUR);

  /* 第三段 */
  const chipsOut = cd((T - CHIPS_OUT_AT) / CHIPS_OUT_DUR);
  const collapse = cd((T - COLLAPSE_AT) / COLLAPSE_DUR);
  const kbRise = cd((T - KB_AT) / KB_DUR);
  const compShow = cd((T - COMP_IN_AT) / COMP_IN_DUR);
  const homeComposerOut = cd((T - COMP_OUT_AT) / COMP_OUT_DUR);

  /* 第四段：发送之后键盘落下、输入条退，蓝图立起来，卡片在框里显影 */
  const sendOut = cd((T - KB_DOWN_AT) / KB_DOWN_DUR);
  const wireOut = cd((T - WIRE_OUT_AT) / WIRE_OUT_DUR);
  /* 上下文条那截连接线要一路拉到新卡片的顶边 */
  const reach = cd((T - CARD2_AT + 260) / 620);

  /* 第五段：结果卡让位，分叉出两个子槽；两个子任务都还没落地时网格再亮一次 */
  const shrink = cd((T - SHRINK_AT) / SHRINK_DUR);
  const bothDone = cd((T - Math.max(...FILL_AT) - FILL_DUR * 0.5) / 520);
  const gridBack = clamp01(cd((T - FORK_AT) / 520) - bothDone);

  /* 第六段：点开的那张长满全屏；底色一翻，状态栏也跟着反色 */
  const open = cd((T - OPEN_AT) / OPEN_DUR);

  /* 第七段：地图铺开，然后整屏退回主页 —— 这一段会把前面所有层一起收掉。
     back 是「回到主页」的进度：它反向抵消掉前面每一层的退场值。 */
  const back = cd((T - HOME_AT) / HOME_DUR);
  const history = cd((T - HISTORY_AT) / HISTORY_DUR);
  const mapOn = cd((T - MAP_AT) / 400);
  /* 地图铺开之后前六段的东西全部让位；back 一起来，地图自己也退 */
  const stageOut = clamp01(mapOn + back);

  const s = lerp(1, COMPACT, collapse);
  const groupH = cardHeight(grow, collapse);

  const segs = [
    { label: '主页', at: 0 },
    { label: '触点', at: TOUCH_AT },
    { label: '展开', at: GROW_AT },
    { label: '建议', at: GROW_AT + 900 },
    { label: '输入', at: KB_AT },
    { label: '打字', at: TYPE_AT },
    { label: '发送', at: SEND_AT - 300 },
    { label: '蓝图', at: SEND_AT + 500 },
    { label: '生成', at: SEND_AT + 1200 },
    { label: '出卡', at: CARD2_AT },
    { label: '分叉', at: SLOT_AT - 200 },
    { label: '子结果', at: FILL_AT[1] - 200 },
    { label: '详情', at: OPEN_AT },
    { label: '路线', at: MAP_AT },
    { label: '收尾', at: HOME_AT },
  ];
  /* 每一格的宽度按它自己的时长分配 —— 这条分段栏本身就是时间轴，
     不是十二个等宽的按钮。等宽会撒谎（主页停 2.6 秒和触点走 0.86 秒一样宽），
     而且格子一多标签就被挤到换行。 */
  const segW = segs.map((s2, i) => (i + 1 < segs.length ? segs[i + 1].at : TOTAL) - s2.at);
  let segIndex = 0;
  for (let i = 0; i < segs.length; i++) if (T >= segs[i].at) segIndex = i;

  return (
    <div
      style={{ fontFamily: "'Inter', 'Noto Sans SC', ui-sans-serif, system-ui, sans-serif" }}
      className="flex min-h-screen w-full items-center justify-center bg-[#e9e8e4] p-6"
    >
      {/* 控件比手机宽：十二格分段栏各留 38px 最小宽度才不至于把标签挤到换行。
          手机自己还是 390，居中放在这一列里。 */}
      <div className="flex flex-col items-center gap-5" style={{ width: 520, maxWidth: '100%' }}>
        <div
          className="relative overflow-hidden"
          style={{
            width: SCREEN_W,
            height: SCREEN_H,
            borderRadius: 46,
            boxShadow: '0 1px 2px rgba(28,30,40,.06), 0 24px 60px rgba(28,30,40,.14)',
          }}
        >
          <Wallpaper wash={clamp01(homeOut - back)} gen={clamp01(sendOut - back)} />

          {/* 主页态。状态栏不在里面 —— 它全程都在。
              退干净之后整层不渲染：里面有三处 backdrop-filter，
              透明度归零它们照样每帧参与合成。 */}
          {clamp01(homeOut - back) < 0.995 && (
            <div className="absolute inset-0 flex flex-col pt-[32px]" style={{ opacity: clamp01(1 - homeOut + back) }}>
              {CHROME}
              <div className="mt-auto flex flex-col gap-[12px] px-[16px] pb-[22px]">
                <div style={{ opacity: clamp01(1 - grow + back) }}>
                  {HOME_CARD}
                </div>
                {/* 历史条：整段会话最后塌成的这一行。t=0 那一帧上已经有它了 —— 循环闭合 */}
                {history > 0.002 && (
                  <div style={{ opacity: history, transform: `translateY(${(1 - history) * 14}px)` }}>
                    {HOME_HISTORY}
                  </div>
                )}
                <div style={{ opacity: clamp01(1 - homeComposerOut + back) }}>
                  {HOME_COMPOSER}
                </div>
              </div>
            </div>
          )}

          {/* 回答态：卡片从主页那张的位置长到这里，之后再收成顶部的上下文条 */}
          {grow > 0.001 && stageOut < 0.995 && (
            <div
              className="absolute inset-x-0 flex flex-col items-center"
              style={{
                top: lerp(430, 96, grow) - collapse * 36,
                opacity: clamp01(grow * 1.5) * (1 - stageOut),
              }}
            >
              {/* 收起时顶部压一道渐隐 —— 卡片是「滑到系统栏底下去了」，
                  不是整张一起变淡 */}
              <div
                style={{
                  width: CARD_W,
                  transform: `scale(${s})`,
                  transformOrigin: 'top center',
                  maskImage: `linear-gradient(180deg, rgba(0,0,0,${lerp(1, 0.12, collapse)}) 0%, #000 ${lerp(0.1, 72, collapse)}%)`,
                  WebkitMaskImage: `linear-gradient(180deg, rgba(0,0,0,${lerp(1, 0.12, collapse)}) 0%, #000 ${lerp(0.1, 72, collapse)}%)`,
                }}
              >
                <ExpandedCard T={T} grow={grow} collapse={collapse} />
              </div>
              {/* transform 不改布局，缩掉的那部分高度要自己补回来 */}
              <div style={{ marginTop: -groupH * (1 - s) }}>
                <SuggestCloud T={T} width={SCREEN_W} fade={chipsOut} discOut={sendOut} linkLen={lerp(34, FRAME.y - 178, reach)} />
              </div>
            </div>
          )}

          <AgentGreeting T={T} fade={sendOut} />
          <ChatComposer T={T} show={clamp01(compShow - sendOut)} />
          <Keyboard rise={clamp01(kbRise - sendOut)} />

          <GenerateStage T={T} out={clamp01(wireOut + stageOut)} />
          <BlueprintGrid p={clamp01(gridBack - stageOut)} />
          <div style={{ opacity: 1 - stageOut }}>
            <ResultCard T={T} shrink={shrink} />
            <ChildTiles T={T} />
          </div>

          {/* 第二团要等结果卡落定才出现；提前挂上的话它底部那道渐变会一直亮在屏幕下沿 */}
          {T > LINK2_AT - 200 && shrink < 0.995 && stageOut < 0.995 && (
            <div className="pointer-events-none absolute inset-x-0" style={{ top: FRAME.y + FRAME.h }}>
              <SuggestCloud T={T} width={SCREEN_W} base={LINK2_AT} chips={CHIPS2} fade={shrink} discOut={shrink} linkLen={lerp(34, 0, shrink)} />
            </div>
          )}

          <DetailPage T={T} fade={clamp01(mapOn + back)} />
          <RouteMap T={T} out={back} />

          <div className="absolute inset-x-0 top-0">
            {STATUS}
            <div className="absolute inset-0" style={{ opacity: clamp01(clamp01(open * 1.6) - back * 1.6) }}>
              {STATUS_DARK}
            </div>
          </div>

          <TouchDot T={T} />
        </div>

        <div className="flex w-full gap-1">
          {segs.map((s2, i) => (
            <button
              key={i}
              onClick={() => scrub(s2.at)}
              aria-pressed={i === segIndex}
              title={`${s2.label} · ${fmtSec(s2.at)} 起 · ${segW[i]}ms`}
              style={{ flexGrow: segW[i], flexBasis: 0, minWidth: 38 }}
              className={[
                'h-7 overflow-hidden whitespace-nowrap rounded-md px-1 text-[11px] transition-colors',
                i === segIndex ? 'bg-[#1c1b18] text-[#f4f3ef]' : 'bg-[#dedcd6] text-[#7d7869] hover:bg-[#d5d2ca]',
              ].join(' ')}
            >
              {s2.label}
            </button>
          ))}
        </div>

        <div className="flex w-full items-center gap-3">
          <button
            onClick={() => setPlaying((p) => !p)}
            className="shrink-0 rounded-lg px-3.5 py-1.5 text-[12.5px] text-[#6f6a5c] ring-1 ring-[#1c1b18]/10 transition-colors hover:text-[#1c1b18]"
          >
            {playing ? '暂停' : '播放'}
          </button>
          <input
            type="range"
            min={0}
            max={TOTAL}
            step={1}
            value={Math.round(T)}
            onChange={(e) => scrub(Number(e.target.value))}
            className="flex-1 accent-[#1c1b18]"
            aria-label="时间轴"
          />
          <span className="w-[92px] shrink-0 text-right font-mono text-[12px] tabular-nums text-[#9a9486]">
            {fmtSec(T)} / {fmtSec(TOTAL)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AnswerScaffold;
