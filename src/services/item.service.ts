// src/services/item.service.ts
import {BindingScope, Getter, injectable} from '@loopback/core';
import {Filter, Options, repository} from '@loopback/repository';
import {ItemCreateDTO, ItemQueryDTO, ItemUpdateDTO} from '../dtos';
import {ApplicationError} from '../errors';
import {Item, Todo} from '../models';
import {ItemRepository, TodoRepository} from '../repositories';

@injectable({scope: BindingScope.TRANSIENT})
export class ItemService {
  constructor(
    @repository(ItemRepository)
    public itemRepository: ItemRepository,
    @repository.getter(TodoRepository)
    protected todoRepositoryGetter: Getter<TodoRepository>,
  ) {}

  async create(dto: ItemCreateDTO & { todoId: typeof Todo.prototype.id, }): Promise<Item> {
    const todoRepo = await this.todoRepositoryGetter();
    const todo = await todoRepo.findById(dto.todoId);
    if (!todo) {
      throw ApplicationError.notFound();
    }
    const { todoId, ...item } = dto;
    const newItem = await this.itemRepository.create(
      {
        ...item,
        todoId,
        completedAt: item.isCompleted ? new Date().toISOString() : undefined,
      }
    );
    return newItem;
  }

  async findAll(dto: ItemQueryDTO, options?: Options): Promise<Item[]> {
    const filter: Filter<Item> = {
      where: {
        todoId: dto.todoId,
        description: dto.description
          ? {like: `%${dto.description}%`}
          : undefined,
        isCompleted: dto.isCompleted,
      },
    };
    return this.itemRepository.find(filter, options);
  }

  async findOneItem(
    todoId: typeof Todo.prototype.id,
    id: typeof Item.prototype.id,
  ): Promise<Item | null> {
    return this.itemRepository.findOne({
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
    const existingItem = await this.findOneItem(todoId, id);
    if (!existingItem) {
      throw ApplicationError.notFound();
    }
    const updateData = {
      ...item,
      completedAt: item.isCompleted ? new Date().toISOString() : undefined,
    };
    await this.itemRepository.updateAll(updateData, {id, todoId});
  }

  async deleteById(
    todoId: typeof Todo.prototype.id,
    id: typeof Item.prototype.id,
  ): Promise<void> {
    const existingItem = await this.findOneItem(todoId, id);
    if (!existingItem) {
      throw ApplicationError.notFound();
    }
    await this.itemRepository.deleteAll({
      id,
      todoId,
    })
  }
}
