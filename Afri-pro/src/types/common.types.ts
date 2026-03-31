export interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

export type Theme = 'light' | 'dark';
