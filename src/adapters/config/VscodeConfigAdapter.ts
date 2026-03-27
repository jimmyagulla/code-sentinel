import * as vscode from 'vscode';
import type { ConfigPort, DisposableLike } from '../../application/ports/ConfigPort';

export class VscodeConfigAdapter implements ConfigPort {
  private readonly section = 'codesentinel';

  get<T>(key: string): T | undefined {
    const config = vscode.workspace.getConfiguration(this.section);
    const sub = key.startsWith(`${this.section}.`) ? key.slice(this.section.length + 1) : key;
    return config.get<T>(sub) as T | undefined;
  }

  onDidChange(callback: () => void): DisposableLike {
    return vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(this.section)) {
        callback();
      }
    });
  }
}
