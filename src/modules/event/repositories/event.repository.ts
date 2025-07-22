export interface IEventRepository {
	findManyByIds(ids: string[]): Promise<any[]>;
}

export const IEventRepository = Symbol('IEventRepository');
