import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initThemeColorObserver } from './utils/themeColor';

// Initialize theme color observer for mobile browser top bar
initThemeColorObserver();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
