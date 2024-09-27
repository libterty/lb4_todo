import {BindingScope, Getter, inject, injectable} from '@loopback/core';
import {Filter, IsolationLevel, juggler, repository} from '@loopback/repository';
import {TodoCreateDTO, TodoCursorPagingRODTO, TodoQueryDTO} from '../dtos';
import {ApplicationError} from '../errors';
import {Item, Todo, TodoStatus} from '../models';
import {ItemRepository, TodoRepository} from '../repositories';

@injectable({scope: BindingScope.TRANSIENT})
export class TodoService {
  constructor(
    @inject('datasources.db') private dataSource: juggler.DataSource,
    @repository(TodoRepository)
    public todoRepository: TodoRepository,
    @repository.getter(ItemRepository)
    public itemRepositoryGetter: Getter<ItemRepository>,
  ) {}

  async create(dto: TodoCreateDTO): Promise<Todo> {
    const transaction = await this.dataSource.beginTransaction({
      isolationLevel: IsolationLevel.READ_COMMITTED,
    });

    try {
      const {items, ...todoData} = dto;
      if (!todoData.title) {
        throw ApplicationError.badRequest('Title is required');
      }
      const todo = await this.todoRepository.create(todoData, {transaction});
      if (Array.isArray(items) && items.length > 0) {
        const itemRepository = await this.itemRepositoryGetter();
        const newItems = await Promise.all(
          items.map(item =>
            itemRepository.create(
              {
                ...item,
                completedAt: item.isCompleted ? new Date().toISOString() : undefined,
                todoId: todo.id,
              } as Item,
              {transaction},
            ),
          ),
        );
        todo.items = newItems;
      }
      await transaction.commit();
      return todo;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async findAll(query: TodoQueryDTO): Promise<TodoCursorPagingRODTO<Todo>> {
    const filter: Filter<Todo> = {
      where: {
        title: query.title ? {like: `%${query.title}%`} : undefined,
        status: query.status,
        deletedAt: {
          eq: null,
        }
      },
      limit: query.limit,
      offset: query.offset,
      order: ['id ' + query.order],
      include: [{relation: 'items'}],
    };
    const [todos, count] = await Promise.all([
      this.todoRepository.find(filter),
      this.todoRepository.count(filter.where),
    ]);
    return {
      data: todos,
      total: count.count,
      limit: query.limit as number,
      offset: query.offset as number,
    };
  }

  async findById(id: number): Promise<Todo> {
    const todo = await this.todoRepository.findById(id, {
      include: [{relation: 'items'}],
    });
    if (!todo) {
      throw ApplicationError.notFound();
    }
    return todo;
  }

  async updateById(id: number, todoData: Partial<Todo>): Promise<void> {
    const existingTodo = await this.todoRepository.findById(id);
    if (!existingTodo) {
      throw ApplicationError.notFound();
    }
    await this.todoRepository.updateById(id, todoData);
  }

  async deleteById(id: typeof Todo.prototype.id,): Promise<void> {
    const existingTodo = await this.todoRepository.findById(id);
    if (!existingTodo) {
      throw ApplicationError.notFound();
    }
    await this.todoRepository.updateById(id, {
      status: TodoStatus.DELETED,
      deletedAt:new Date().toISOString(),
    });
  }
}
