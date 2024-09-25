// repositories/todo.repository.ts
import {Getter, inject} from '@loopback/core';
import {
  DefaultCrudRepository,
  Filter,
  HasManyRepositoryFactory,
  IsolationLevel,
  Options,
  repository,
  Where,
} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {TodoCreateDTO, TodoCursorPagingRODTO, TodoQueryDTO} from '../dtos';
import {Item, Todo, TodoStatus, TodoWithRelations} from '../models';
import {ItemRepository} from './item.repository';

type ExtendedWhere<T extends object> = Where<T> & {
  id?: {
    gt?: string;
    lt?: string;
  };
};

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

  async createOne(dto: TodoCreateDTO) {
    const transaction = await this.dataSource.beginTransaction(
      IsolationLevel.READ_COMMITTED,
    );
    try {
      const {items, ...rest} = dto;

      // Create the todo
      const todo = await this.create(rest, {transaction});

      // Create the items
      const itemRepository = await this.itemRepositoryGetter();
      if (Array.isArray(items) && items.length > 0) {
        const newItems = await Promise.all(
          items.map(item =>
            itemRepository.create(
              {
                ...item,
                completedAt: !!item.isCompleted
                  ? new Date().toISOString()
                  : undefined,
                todoId: todo.id,
              },
              {transaction},
            ),
          ),
        );
        // Attach items to todo
        todo.items = newItems;
      }

      await transaction.commit();
      return todo;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async findAll(
    dto: TodoQueryDTO,
    options?: Options,
  ): Promise<TodoCursorPagingRODTO<TodoWithRelations>> {
    const limit = dto.limit && dto.limit > 0 ? dto.limit : 10;
    const offset = dto.offset && dto.offset >= 0 ? dto.offset : 0;
    const order = dto.order || 'ASC';

    const baseWhere: Where<Todo> = {
      title: dto.title ? {like: `%${dto.title}%`} : undefined,
      status: dto.status,
      deletedAt: {eq: null},
    };

    // 獲取總數
    const count = await this.count(baseWhere);

    const filter: Filter<Todo> = {
      where: baseWhere,
      include: [{relation: 'items'}],
      limit: limit,
      offset: offset,
      order: ['id ' + order],
    };

    const todos = await super.find(filter, options);

    return {
      data: todos,
      total: count.count,
      limit: limit,
      offset: offset,
    };
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
