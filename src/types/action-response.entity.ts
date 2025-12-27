export interface ActionResponseEntity<T> {
  success: boolean;
  message: string;
  statusCode?: number;
  data?: T;
}