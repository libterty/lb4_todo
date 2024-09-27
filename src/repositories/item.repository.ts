// repositories/item.repository.ts
import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  repository,
} from '@loopback/repository';
import {DbDataSource} from '../datasources';
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
}
