import {TodoStatus} from '../models';

export class TodoQueryDTO {
  title?: string;
  status?: TodoStatus;
}
