// repositories/item.repository.ts
import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  Filter,
  Options,
  repository,
} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {ItemQueryDTO, ItemUpdateDTO} from '../dtos';
import {Item, Todo} from '../models';
import {TodoRepository} from './todo.repository';

export class ItemRepository extends DefaultCrudRepository<
  Item,
  typeof Item.prototype.id
> {
  public readonly todo: BelongsToAccessor<Todo, typeof Item.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
    @repository.getter('TodoRepository')
    protected todoRepositoryGetter: Getter<TodoRepository>,
  ) {
    super(Item, dataSource);
    this.todo = this.createBelongsToAccessorFor('todo', todoRepositoryGetter);
    this.registerInclusionResolver('todo', this.todo.inclusionResolver);
  }

  async findAll(dto: ItemQueryDTO, options?: Options): Promise<Item[]> {
    const filter: Filter<Item> = {
      where: {
        todoId: dto.todoId,
        description: !!dto.description
          ? {
              like: '%' + dto.description + '%',
            }
          : undefined,
        isCompleted: dto.isCompleted,
      },
    };
    return super.find(filter, options);
  }

  async findOneItem(
    todoId: typeof Todo.prototype.id,
    id: typeof Item.prototype.id,
  ): Promise<Item | null> {
    return super.findOne({
      where: {
        id,
        todoId,
      },
    });
  }

  async updateOneItem(
    todoId: typeof Todo.prototype.id,
    id: typeof Item.prototype.id,
    item: ItemUpdateDTO,
  ): Promise<void> {
    await super.updateAll({
      ...item,
      completedAt: !!item.isCompleted ? new Date().toISOString() : undefined,
    }, {
      id,
      todoId,
    });
  }
}
