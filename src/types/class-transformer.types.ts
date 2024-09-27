import {ClassConstructor, ClassTransformOptions} from 'class-transformer';

export type PlainToClassFunction = <T, V>(cls: ClassConstructor<T>, plain: V, options?: ClassTransformOptions) => T;
