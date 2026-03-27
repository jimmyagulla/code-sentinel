import React, { type ReactElement, type ReactNode } from 'react';
import { useWebviewHostMessageHandler } from '../contexts/WebviewHostMessageProvider';

type ThemeMessage = {
  type: 'theme';
  dark: boolean;
};

export function ThemeProvider(props: { children: ReactNode }): ReactElement {
  const { children } = props;

  useWebviewHostMessageHandler('theme', (data) => {
    const msg = data as ThemeMessage;
    if (msg.type === 'theme' && typeof msg.dark === 'boolean') {
      document.documentElement.classList.toggle('dark', msg.dark);
    }
  });

  return <>{children}</>;
}
