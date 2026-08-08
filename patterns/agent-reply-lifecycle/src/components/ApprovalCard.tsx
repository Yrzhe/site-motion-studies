import { IconAlert, IconCheck } from './chatIcons';
import { cd, clamp01, lerp, type Approval } from './chatScript';

/* 审批卡：全场唯一一个「停下来等人」的时刻。

   前面所有东西都在自顾自地往下走，只有这里流断了。
   所以它必须在视觉上和别的块不一样，否则读者不会意识到该他动了：
   · 描边比别处重，且在等待期间做极缓的呼吸（1.9s 一轮，幅度很小）
   · 高风险动作的按钮是实心深色，低风险才是描边 —— 摩擦要与风险相称

   决定之后卡片收缩成一行历史：「已批准 · write notes.docx」。
   不消失。决定要留痕 —— 事后回看这条会话，得知道是谁在哪一步点了同意。
*/

const FULL_H = 128;
const ROW_H = 32;
type Props = {
  a: Approval;
  T: number;
  start: number;
  decided: 'approve' | 'skip' | null;
  onDecide: (d: 'approve' | 'skip') => void;
};
export const ApprovalCard = ({
  a,
  T,
  start,
  decided,
  onDecide
}: Props) => {
  const e = T - start;
  // 脚本会自动做决定；用户先点了就以用户的为准
  const auto = e >= a.decideAt ? 'approve' : null;
  const choice = decided ?? auto;
  const settle = choice ? cd((e - (decided ? 0 : a.decideAt)) / 380) : 0;
  const h = lerp(FULL_H, ROW_H, settle);
  const bodyOut = clamp01(1 - settle * 1.8);
  // 等待期间的呼吸：幅度小到几乎看不出在动，但停不下来
  const breathe = choice ? 0 : (Math.sin(T / 1900 * Math.PI * 2) * 0.5 + 0.5) * 0.1;
  return <div className="relative w-full overflow-hidden rounded-[10px] bg-white" style={{
    height: h,
    boxShadow: `inset 0 0 0 1px rgba(28,27,24,${0.14 + breathe})`,
    transition: 'box-shadow 200ms ease'
  }}>
      
      {/* 收缩后的那一行历史 */}
      <div className="absolute inset-x-0 top-0 flex items-center gap-2 pl-3 pr-3" style={{
      height: ROW_H,
      opacity: settle
    }}>
        
        <span className="shrink-0 text-[#3f8f63]">
          <IconCheck />
        </span>
        <span className="shrink-0 text-[12.5px] text-[#1c1b18]">
          {choice === 'skip' ? '已跳过' : '已批准'}
        </span>
        <span className="truncate rounded-[5px] bg-[#efece4] px-1.5 py-[1px] font-mono text-[11px] text-[#6f6a5c]">
          {a.action}
        </span>
      </div>

      {/* 等待期的完整卡片 */}
      <div className="absolute inset-x-0 top-0 p-3" style={{
      opacity: bodyOut
    }}>
        <div className="flex items-center gap-1.5">
          {a.risk === 'high' && <span className="shrink-0 text-[#b24a34]">
              <IconAlert />
            </span>}
          <span className="text-[12.5px] font-medium text-[#1c1b18]">{a.title}</span>
          {a.risk === 'high' && <span className="rounded-[4px] bg-[#f7e6e1] px-1.5 py-[1px] font-mono text-[10px] text-[#8f3a27]">
              不可撤销
            </span>}
        </div>

        <div className="mt-1.5 truncate rounded-[5px] bg-[#f4f2ec] px-2 py-1 font-mono text-[11px] text-[#6f6a5c]">
          {a.action}
        </div>
        <div className="mt-1 text-[11.5px] leading-[1.6] text-[#8b8676]">{a.detail}</div>

        <div className="mt-2.5 flex gap-2">
          <button onClick={ev => {
          ev.stopPropagation();
          onDecide('approve');
        }} className="rounded-[7px] bg-[#1c1b18] px-3 py-[5px] text-[12px] text-[#f6f5f2] transition-opacity hover:opacity-85">
            
            执行
          </button>
          <button onClick={ev => {
          ev.stopPropagation();
          onDecide('skip');
        }} className="rounded-[7px] px-3 py-[5px] text-[12px] text-[#6f6a5c] ring-1 ring-[#1c1b18]/10 transition-colors hover:text-[#1c1b18]">
            
            跳过
          </button>
        </div>
      </div>
    </div>;
};