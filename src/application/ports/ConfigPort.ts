export interface DisposableLike {
  dispose(): void;
}

export interface ConfigPort {
  get<T>(key: string): T | undefined;
  onDidChange(callback: () => void): DisposableLike;
}
