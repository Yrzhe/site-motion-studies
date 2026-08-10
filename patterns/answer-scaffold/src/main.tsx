import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AnswerScaffold } from './components/AnswerScaffold';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AnswerScaffold />
  </StrictMode>
);
