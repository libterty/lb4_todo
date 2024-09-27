import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import 'reflect-metadata';
import {DbDataSource} from './datasources';
import {ErrorInterceptor} from './interceptors';
import {ClassTransformerProvider} from './providers';
import {MySequence} from './sequence';
import {ItemService, TodoService} from './services';

export {ApplicationConfig};

export class Loopback4TodoApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Register ErrorInterceptor
    this.interceptor(ErrorInterceptor);

    // Set up the custom sequence
    this.sequence(MySequence);

    // In the constructor of your application class:
    this.dataSource(DbDataSource);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };

    this.bind('providers.ClassTransformerProvider').toProvider(ClassTransformerProvider);

    this.service(TodoService);
    this.service(ItemService);
  }
}
