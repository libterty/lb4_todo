// repositories/todo.repository.ts
import {Getter, inject} from '@loopback/core';
import {
  DefaultCrudRepository,
  HasManyRepositoryFactory,
  repository,
  Where,
} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Item, Todo} from '../models';
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
}
