import { createRoot } from 'react-dom/client';
import React from 'react';
import { App } from './App';
import { ThemeProvider } from './providers/ThemeProvider';
import { VscodeApiProvider } from './contexts/VscodeApiProvider';
import { WebviewHostMessageProvider } from './contexts/WebviewHostMessageProvider';

const el = document.getElementById('root');
if (el) {
  createRoot(el).render(
    <VscodeApiProvider>
      <WebviewHostMessageProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </WebviewHostMessageProvider>
    </VscodeApiProvider>
  );
}
