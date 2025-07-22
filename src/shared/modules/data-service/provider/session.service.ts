export interface ISessionService<T> {
	start(): Promise<T>;
	get(): T | null;
	commit(): Promise<void>;
	abort(): Promise<void>;
	end(): Promise<void>;
}

export const ISessionServiceToken = Symbol('ISessionService');
