import {Provider} from '@loopback/core';
import {plainToClass} from 'class-transformer';
import {PlainToClassFunction} from '../types';

export class ClassTransformerProvider implements Provider<PlainToClassFunction> {
  value(): PlainToClassFunction {
    return plainToClass;
  }
}
