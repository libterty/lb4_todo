import {TodoStatus} from '../models';

export class TodoQueryDTO {
  title?: string;
  status?: TodoStatus;
  limit?: number;
  offset?: number;
  order?: 'ASC' | 'DESC';
}
