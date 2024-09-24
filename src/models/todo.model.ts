// models/todo.model.ts
import {Entity, hasMany, model, property} from '@loopback/repository';
import {Item, ItemWithRelations} from './item.model';

@model()
export class Todo extends Entity {
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
  title: string;

  @property({
    type: 'boolean',
    default: false,
  })
  isComplete?: boolean;

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

  @property({
    type: 'date',
    default: null,
  })
  deletedAt?: string | null;

  @hasMany(() => Item)
  items: Item[];

  constructor(data?: Partial<Todo>) {
    super(data);
  }
}

export interface TodoRelations {
  items?: ItemWithRelations[];
}

export type TodoWithRelations = Todo & TodoRelations;
