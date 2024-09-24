// models/todo.model.ts
import {Entity, hasMany, model, property} from '@loopback/repository';
import {Item, ItemWithRelations} from './item.model';

export enum TodoStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED'
}

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
    type: 'string',
  })
  subtitle?: string;

  @property({
    type: 'string',
    required: true,
    default: TodoStatus.ACTIVE,
  })
  status: TodoStatus;

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
