// repositories/todo.repository.ts
import {Getter, inject} from '@loopback/core';
import {
  DefaultCrudRepository,
  Filter,
  HasManyRepositoryFactory,
  Options,
  repository,
} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {TodoQueryDTO} from '../dtos';
import {Item, Todo, TodoStatus, TodoWithRelations} from '../models';
import {ItemRepository} from './item.repository';

export class TodoRepository extends DefaultCrudRepository<
  Todo,
  typeof Todo.prototype.id
> {
  public readonly items: HasManyRepositoryFactory<
    Item,
    typeof Todo.prototype.id
  >;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
    @repository.getter('ItemRepository')
    protected itemRepositoryGetter: Getter<ItemRepository>,
  ) {
    super(Todo, dataSource);
    this.items = this.createHasManyRepositoryFactoryFor(
      'items',
      itemRepositoryGetter,
    );
    this.registerInclusionResolver('items', this.items.inclusionResolver);
  }

  async findAll(
    dto: TodoQueryDTO,
    options?: Options,
  ): Promise<TodoWithRelations[]> {
    const filter: Filter<Todo> = {
      where: {
        title: !!dto.title
          ? {
              like: '%' + dto.title + '%',
            }
          : undefined,
        status: dto.status,
        deletedAt: {
          eq: null,
        },
      },
      include: [{relation: 'items'}],
    };
    return super.find(filter, options);
  }

  async findOneTodo(
    id: typeof Todo.prototype.id,
  ): Promise<TodoWithRelations | null> {
    return super.findOne({
      where: {
        id,
      },
      include: [{relation: 'items'}],
    });
  }

  async deleteById(id: typeof Todo.prototype.id): Promise<void> {
    await super.updateById(id, {
      status: TodoStatus.DELETED,
      deletedAt: new Date().toISOString(),
    });
  }
}
