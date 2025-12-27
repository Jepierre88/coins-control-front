export interface ActionResponseEntity<T> {
  success: boolean;
  message: string;
  data?: T;
}