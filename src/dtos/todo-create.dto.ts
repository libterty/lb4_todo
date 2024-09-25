import {TodoStatus} from '../models';
import {ItemCreateDTO} from './item-create.dto';

export class TodoCreateDTO {
  title: string;
  subtitle?: string;
  status?: TodoStatus;
  items?: ItemCreateDTO;
}
