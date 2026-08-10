import { GREET_LINES, GREET_WORD_IN, cd, clamp01, greetWordAt } from './scaffoldScript';

/* agent 开口那句。逐词流入，只动透明度和一点模糊 —— 不做位移。

   位移会让每个词自己「飞进来」，读起来是八个独立的动画；
   只去焦的话，整句像是从纸里慢慢显影出来的一段话。

   「Amelia,」是深墨，其余偏蓝灰。原片两种颜色，称呼重、问题轻 ——
   它先叫你的名字，再问你要什么。
*/

const TOP = 312;
const FS = 22;
const LH = 26;

export const AgentGreeting = ({ T, fade = 0 }: { T: number; fade?: number }) => {
  let gi = 0;
  const f = clamp01(fade);
  if (f > 0.995) return null;
  return (
    <div
      className="pointer-events-none absolute inset-x-0 text-center"
      style={{ top: TOP, fontSize: FS, lineHeight: `${LH}px`, letterSpacing: '-0.015em', opacity: 1 - f }}
    >
      {GREET_LINES.map((line, li) => (
        <div key={li} style={{ height: LH }}>
          {line.map((word) => {
            const i = gi++;
            const p = cd((T - greetWordAt(i)) / GREET_WORD_IN);
            return (
              <span
                key={word.w}
                className="inline-block"
                style={{
                  opacity: clamp01(p),
                  // 落定之后把滤镜撤掉，别留一层永久的模糊层在那儿每帧重绘
                  filter: p > 0.995 ? undefined : `blur(${(1 - p) * 3}px)`,
                  color: word.em ? '#1c1d26' : '#6c7590',
                  fontWeight: word.em ? 500 : 400,
                  whiteSpace: 'pre',
                }}
              >
                {word.w}{' '}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};
