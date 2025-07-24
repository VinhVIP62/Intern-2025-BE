import { IBaseEntity } from './base-entity.type';

/**
 * for each property in type T, adds an optional property TPopulated?: unknown to the type
 */
export type WithPopulated<T> = T & {
	[K in keyof T as `${string & K}Populated`]?: unknown;
};

export type QuerriableType<T> = {
	[P in keyof T]?: T[P] extends Array<infer U> | ReadonlyArray<infer U> ? T[P] | U : T[P];
} & Partial<IBaseEntity>;
