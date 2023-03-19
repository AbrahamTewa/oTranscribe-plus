declare module 'local-storage-manager' {
  const localStorageManager: LocalStorageManager;

  export default localStorageManager;
}

type LocalStorageManager = {
  getArray(): Array<{key: string}>;
  getItem(item: string): string;
  onFull(): void;
  onSaveFailure(): void;
  getItemMetadata(key: string): {
    timestamp: string;
    value: string,
  };
  removeItem(key: string): void;
  setItem(key: string, value: string | null): void;
}