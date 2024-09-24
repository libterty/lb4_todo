import {TodoStatus} from '../models';

export class TodoUpdateDTO {
  id: number;
  title?: string;
  subTitle?: string;
  status?: TodoStatus;
}
