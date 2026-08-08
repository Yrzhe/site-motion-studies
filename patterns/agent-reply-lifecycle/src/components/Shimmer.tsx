import { SHIMMER_PERIOD } from './chatScript';

/* 高光扫过动词本身 —— 不在旁边转 spinner。
   把「正在进行」和「在做什么」绑在同一个物体上。

   工具行、思考块、子任务分派都用它，所以单独一个文件：
   三处如果各写一份，改一次节奏就得改三个地方，迟早对不上。 */
export const Shimmer = ({
  text,
  t,
  active
}: {
  text: string;
  t: number;
  active: boolean;
}) => {
  if (!active) return <span>{text}</span>;
  const p = t % SHIMMER_PERIOD / SHIMMER_PERIOD * 100;
  return <span style={{
    backgroundImage: 'linear-gradient(100deg,#8b8676 0%,#8b8676 38%,#1c1b18 47%,#1c1b18 53%,#8b8676 62%,#8b8676 100%)',
    backgroundSize: '320% 100%',
    backgroundPosition: `${120 - p * 2.4}% 0`,
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent'
  }}>
      
      {text}
    </span>;
};