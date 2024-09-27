import {
  injectable,
  Interceptor,
  InvocationContext,
  InvocationResult,
  Provider,
  ValueOrPromise,
} from '@loopback/core';
import {HttpErrors, Response, RestBindings} from '@loopback/rest';
import {ApplicationError} from '../errors/application-error';

@injectable({tags: {key: ErrorInterceptor.BINDING_KEY}})
export class ErrorInterceptor implements Provider<Interceptor> {
  static readonly BINDING_KEY = `interceptors.${ErrorInterceptor.name}`;

  value() {
    return async (
      ctx: InvocationContext,
      next: () => ValueOrPromise<InvocationResult>,
    ) => {
      try {
        return await next();
      } catch (err) {
        const response = await ctx.get<Response>(RestBindings.Http.RESPONSE);

        if (err instanceof ApplicationError) {
          const errObj = {
            error: {
              name: err.name,
              message: err.message,
              details: err.details,
            },
          };
          response.status(err.statusCode).json(errObj);
          return errObj;
        } else if (err instanceof HttpErrors.HttpError) {
          // Handle standard HttpErrors
          response.status(err.statusCode).json({
            error: {
              name: err.name,
              message: err.message,
              details: err.details,
            },
          });
        } else {
          // For unexpected errors, log them and return a generic error
          console.error('Unexpected error:', err);
          response.status(500).json({
            error: {
              name: 'InternalServerError',
              message: 'An unexpected error occurred',
            },
          });
        }
      }
    };
  }
}
