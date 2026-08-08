import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AgentReplyLifecycle } from './components/AgentReplyLifecycle';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AgentReplyLifecycle />
  </StrictMode>
);
