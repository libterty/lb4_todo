export class TodoCursorPagingRODTO<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}
