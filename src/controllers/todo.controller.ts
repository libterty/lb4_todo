// controllers/todo.controller.ts
import {repository} from '@loopback/repository';
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
import {TodoCreateDTO, TodoQueryDTO, TodoUpdateDTO} from '../dtos';
import {Item, Todo, TodoStatus, TodoWithRelations} from '../models';
import {ItemRepository, TodoRepository} from '../repositories';

export class TodoController {
  constructor(
    @repository(TodoRepository)
    public todoRepository: TodoRepository,
    @repository(ItemRepository)
    public itemRepository: ItemRepository,
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
    return this.todoRepository.createOne(todo);
  }

  @get('/todos')
  @response(200, {
    description: 'Array of Todo model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Todo, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.query.string('title') title?: string,
    @param.query.string('status') status?: TodoStatus,
  ): Promise<TodoWithRelations[]> {
    return this.todoRepository.findAll({
      title,
      status,
    } as TodoQueryDTO);
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
    return this.todoRepository.findOneTodo(id);
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
    await this.todoRepository.updateById(id, todo);
    return this.todoRepository.findById(id);
  }

  @del('/todos/{id}')
  @response(204, {
    description: 'Todo DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.todoRepository.deleteById(id);
  }

  @post('/todos/{id}/items')
  @response(200, {
    description: 'Item model instance',
    content: {'application/json': {schema: getModelSchemaRef(Item)}},
  })
  async createItem(
    @param.path.number('id') id: number,
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
    return this.todoRepository.items(id).create(item);
  }
}
