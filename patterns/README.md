# Patterns

Reusable, brand-neutral patterns promoted from individual website studies.

A pattern should be useful without knowing the original site. Keep patterns
small, documented, and implemented from scratch.

## Index

| Pattern | 讲的是什么 |
|---|---|
| [`agent-reply-lifecycle`](agent-reply-lifecycle/) | 一次 AI 回复的完整生命周期：推理缝隙、并行分派、运行时折叠、常驻计划面板、流式出字、引用上标 |

## 一个 pattern 该长什么样

- `README.md` 讲清每个机制的**问题 / 做法 / 不变量**，带真实数字与公式。
- `demo/index.html` 是单文件、无运行时依赖的构建产物，双击即看。
- 源码进 `src/`，从零实现，不含任何被研究站点的资源。
- 有构建步骤的，把 `package.json` 与配置一并提交，任何人 `npm run build`
  都能重新产出同一个 demo。

