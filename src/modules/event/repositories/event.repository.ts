export interface IEventRepository {
	findManyByIds(ids: string[]): Promise<any[]>;
	create(event: any): Promise<any>;
	findAll(query: any, options: any): Promise<{ events: any[]; total: number }>;
	findById(id: string): Promise<any>;
	updateById(id: string, update: any): Promise<any>;
	deleteById(id: string): Promise<any>;
}

export const IEventRepository = Symbol('IEventRepository');
