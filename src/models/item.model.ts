// models/item.model.ts
import {belongsTo, Entity, model, property} from '@loopback/repository';
import {Todo, TodoWithRelations} from './todo.model';

@model()
export class Item extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
  })
  description: string;

  @property({
    type: 'date',
    default: () => new Date(),
  })
  createdAt?: string;

  @property({
    type: 'date',
    default: () => new Date(),
  })
  updatedAt?: string;

  @belongsTo(() => Todo)
  todoId: number;

  constructor(data?: Partial<Item>) {
    super(data);
  }
}

export interface ItemRelations {
  todo?: TodoWithRelations;
}

export type ItemWithRelations = Item & ItemRelations;
