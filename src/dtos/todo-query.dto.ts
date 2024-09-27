import {Transform} from 'class-transformer';
import {TodoStatus} from '../models/todo.model';

export class TodoQueryDTO {
  title?: string;
  status?: TodoStatus;

  @Transform(({value}) => (value && value > 0 ? value : 10))
  limit?: number;

  @Transform(({value}) => (value && value >= 0 ? value : 0))
  offset?: number;

  @Transform(({value}) => (['ASC', 'DESC'].includes(value) ? value : 'ASC'))
  order?: 'ASC' | 'DESC';
}
