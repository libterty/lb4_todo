// repositories/todo.repository.ts
import {Getter, inject} from '@loopback/core';
import {
  DefaultCrudRepository,
  Filter,
  HasManyRepositoryFactory,
  IsolationLevel,
  Options,
  repository,
} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {TodoCreateDTO, TodoQueryDTO} from '../dtos';
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
