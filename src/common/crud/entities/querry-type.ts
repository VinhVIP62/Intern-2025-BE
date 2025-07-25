import { IBaseEntity } from './base-entity.type';

/**
 * for each property in type T, adds an optional property TPopulated?: unknown to the type
 */
export type WithPopulated<T> = T & {
	[K in keyof T as `${string & K}Populated`]?: unknown;
};

type ExpandArray<T> = T extends Array<infer U> | ReadonlyArray<infer U> ? T | U : T;

export type QuerriableType<T> = {
	[P in keyof T]?: ExpandArray<T[P]>;
} & Partial<IBaseEntity>;
