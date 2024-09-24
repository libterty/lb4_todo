// controllers/item.controller.ts
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
import {ItemCreateDTO, ItemUpdateDTO} from '../dtos';
import {Item} from '../models';
import {ItemRepository} from '../repositories';

export class ItemController {
  constructor(
    @repository(ItemRepository)
    public itemRepository: ItemRepository,
  ) {}

  @post('/todos/{todoId}/items')
  @response(201, {
    description: 'Item model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Item, {includeRelations: false}),
      },
    },
  })
  async create(
    @param.path.number('todoId') todoId: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Item, {
            title: 'NewItem',
            exclude: ['id', 'createdAt', 'updatedAt'],
          }),
        },
      },
    })
    dto: ItemCreateDTO,
  ): Promise<Item> {
    return this.itemRepository.create({
      ...dto,
      todoId,
    });
  }

  @get('/todos/{todoId}/items')
  @response(200, {
    description: 'Array of Item model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Item, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.path.number('todoId') todoId: number,
    @param.query.string('description') description?: string,
  ): Promise<Item[]> {
    return this.itemRepository.findAll({
      description: description,
      todoId,
    });
  }

  @get('/todos/{todoId}/items/{id}')
  @response(200, {
    description: 'Item model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Item, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('todoId') todoId: number,
    @param.path.number('id') id: number,
  ): Promise<Item | null> {
    return this.itemRepository.findOneItem(todoId, id);
  }

  @patch('/todos/{todoId}/items/{id}')
  @response(200, {
    description: 'Item model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Item, {includeRelations: true}),
      },
    },
  })
  async updateById(
    @param.path.number('todoId') todoId: number,
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Item, {partial: true}),
        },
      },
    })
    item: ItemUpdateDTO,
  ): Promise<Item | null> {
    await this.itemRepository.updateOneItem(todoId, id, item);
    return this.itemRepository.findOneItem(todoId, id);
  }

  @del('/items/{id}')
  @response(204, {
    description: 'Item DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.itemRepository.deleteById(id);
  }
}
