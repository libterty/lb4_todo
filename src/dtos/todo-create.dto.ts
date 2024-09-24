import {TodoStatus} from '../models';

export class TodoCreateDTO {
  title: string;
  subtitle?: string;
  status?: TodoStatus;
}
