// controllers/todo.controller.ts
import {inject} from '@loopback/core';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  requestBody,
  response,
} from '@loopback/rest';
import {
  TodoCreateDTO,
  TodoCursorPagingRODTO,
  TodoQueryDTO,
  TodoUpdateDTO,
} from '../dtos';
import {Item, Todo, TodoStatus, TodoWithRelations} from '../models';
import {ItemService, TodoService} from '../services';
import {PlainToClassFunction} from '../types';

export class TodoController {
  constructor(
    @inject('services.TodoService')
    public todoService: TodoService,
    @inject('services.ItemService')
    public itemService: ItemService,
    @inject('providers.ClassTransformerProvider')
    private plainToClass: PlainToClassFunction,
  ) {}

  @post('/todos')
  @response(201, {
    description: 'Todo model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Todo, {includeRelations: false}),
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            title: 'NewTodo',
            properties: {
              ...getModelSchemaRef(Todo, {
                title: 'NewTodo',
                exclude: ['id', 'createdAt', 'updatedAt', 'deletedAt'],
              }).definitions.NewTodo.properties,
              items: {
                type: 'array',
                items: getModelSchemaRef(Item, {
                  title: 'NewItem',
                }),
              },
            },
          },
        },
      },
    })
    todo: TodoCreateDTO,
  ): Promise<Todo> {
    return this.todoService.create(todo);
  }

  @get('/todos')
  @response(200, {
    description: 'Array of Todo model instances with cursor-based pagination',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: getModelSchemaRef(Todo, {includeRelations: true}),
            },
            total: {
              type: 'number',
            },
            limit: {
              type: 'number',
            },
            offset: {
              type: 'number',
            },
          },
        },
      },
    },
  })
  async find(
    @param.query.string('title') title?: string,
    @param.query.string('status') status?: TodoStatus,
    @param.query.number('limit') limit?: number,
    @param.query.number('offset') offset?: number,
    @param.query.string('order') order?: 'ASC' | 'DESC',
  ): Promise<TodoCursorPagingRODTO<TodoWithRelations>> {
    const dto = this.plainToClass(TodoQueryDTO, {
      title,
      status,
      limit,
      offset,
      order,
    });
    return this.todoService.findAll(dto);
  }

  @get('/todos/{id}')
  @response(200, {
    description: 'Todo model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Todo, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
  ): Promise<TodoWithRelations | null> {
    return this.todoService.findById(id);
  }

  @patch('/todos/{id}')
  @response(200, {
    description: 'Todo model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Todo, {includeRelations: true}),
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Todo, {partial: true}),
        },
      },
    })
    todo: TodoUpdateDTO,
  ): Promise<TodoWithRelations> {
    await this.todoService.updateById(id, todo);
    return this.todoService.findById(id);
  }

  @del('/todos/{id}')
  @response(204, {
    description: 'Todo DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.todoService.deleteById(id);
  }

  @post('/todos/{id}/items')
  @response(200, {
    description: 'Item model instance',
    content: {'application/json': {schema: getModelSchemaRef(Item)}},
  })
  async createItem(
    @param.path.number('id') todoId: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Item, {
            title: 'NewItem',
            exclude: ['id', 'todoId'],
          }),
        },
      },
    })
    item: Omit<Item, 'id'>,
  ): Promise<Item> {
    return this.itemService.create({
      ...item,
      todoId,
    });
  }
}
