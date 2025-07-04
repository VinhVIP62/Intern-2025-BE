/**
 * for each property in type T, adds an optional property TPopulated?: unknown to the type
 */
export type WithPopulated<T> = T & {
	[K in keyof T as `${string & K}Populated`]?: unknown;
};
