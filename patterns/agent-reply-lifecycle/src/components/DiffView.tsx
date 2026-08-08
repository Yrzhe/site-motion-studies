import { clamp01, lerp, type DiffFile } from './chatScript';

/* 写文件之前先把改动摊开 —— Cursor / Claude Code 的核心动作。

   三条运动规则：
   · 逐行揭示  行按写入顺序一条条出现，不是整块淡入 ——
               diff 本来就是顺序产生的，一次性铺开会丢掉「正在写」这件事
   · 底色先行  每行的绿/红底比文字早 90ms 到位，
               于是眼睛先看到「这行是加还是删」，再去读内容
   · 高度跟随  容器高度随已揭示的行数长，与聊天窗一样不许跳
*/

const LINE_H = 17;
const HEAD_H = 26;
const MAX_LINES = 10;
const LINE_STEP = 0.075; // 每行占总进度的比例

const TONE = {
  '+': {
    bg: '#eef6ef',
    bar: '#3f8f63',
    fg: '#2c6b4a'
  },
  '-': {
    bg: '#fbf0ed',
    bar: '#b24a34',
    fg: '#8f3a27'
  },
  ' ': {
    bg: 'transparent',
    bar: 'transparent',
    fg: '#8b8676'
  }
} as const;
export const DiffView = ({
  open,
  file,
  p
}: {
  open: number;
  file?: DiffFile;
  p: number;
}) => {
  if (!file || open <= 0.001) return null;
  const o = clamp01(open);
  const contentIn = clamp01((o - 0.35) / 0.5);
  const shown = file.lines.slice(0, MAX_LINES);
  const revealed = shown.filter((_l, i) => p >= i * LINE_STEP).length;
  const bodyH = revealed * LINE_H;
  return <div className="overflow-hidden rounded-[10px] bg-white ring-1 ring-[#1c1b18]/[0.08]" style={{
    width: 420,
    height: (HEAD_H + bodyH + 8) * o,
    opacity: Math.min(1, o * 1.6)
  }}>
      
      <div style={{
      opacity: contentIn
    }}>
        <div className="flex items-center gap-2 border-b border-[#efece4] bg-[#faf9f6] px-2.5" style={{
        height: HEAD_H
      }}>
          
          <span className="truncate font-mono text-[10px] text-[#6f6a5c]">{file.path}</span>
          <span className="ml-auto shrink-0 font-mono text-[10px] text-[#3f8f63]">+{file.add}</span>
          <span className="shrink-0 font-mono text-[10px] text-[#b24a34]">−{file.del}</span>
        </div>

        <div className="py-1">
          {shown.map((l, i) => {
          const at = i * LINE_STEP;
          // 底色先行 90ms：先让人看到这行是加还是删，再读内容
          const bg = clamp01((p - at) / 0.05);
          const fg = clamp01((p - at - 0.03) / 0.06);
          const tone = TONE[l.kind];
          return <div key={i} className="flex items-center gap-1.5 px-2.5 font-mono text-[10.5px] leading-[17px]" style={{
            height: LINE_H,
            background: bg > 0 ? tone.bg : 'transparent',
            opacity: bg
          }}>
                
                <span className="block h-[11px] w-[2px] shrink-0 rounded-full" style={{
              background: tone.bar,
              opacity: lerp(0, 1, bg)
            }} />
                
                <span className="w-[7px] shrink-0" style={{
              color: tone.fg,
              opacity: fg
            }}>
                  {l.kind === ' ' ? '' : l.kind}
                </span>
                <span className="truncate" style={{
              color: tone.fg,
              opacity: fg
            }}>
                  {l.text || ' '}
                </span>
              </div>;
        })}
        </div>
      </div>
    </div>;
};