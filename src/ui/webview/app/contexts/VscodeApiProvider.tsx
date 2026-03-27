import React, { createContext, useContext, useState, type ReactElement, type ReactNode } from 'react';
import { acquireVsCodeApi } from '../vscodeApi';
import type { VsCodeApi } from '../vscode';

const VscodeApiContext = createContext<VsCodeApi | null>(null);

export function VscodeApiProvider(props: { children: ReactNode }): ReactElement {
  const { children } = props;
  const [api] = useState(() => acquireVsCodeApi());

  return <VscodeApiContext.Provider value={api}>{children}</VscodeApiContext.Provider>;
}

export function useVscodeApi(): VsCodeApi {
  const api = useContext(VscodeApiContext);
  if (api === null) {
    throw new Error('useVscodeApi must be used within VscodeApiProvider');
  }
  return api;
}
