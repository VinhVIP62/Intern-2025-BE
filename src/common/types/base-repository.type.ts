export interface IBaseRepository<T> {
	create(data: Partial<T>): Promise<T>;
	update(id: string, data: Partial<T>): Promise<T>;
	delete(id: string): Promise<T | null>;
	findOneById(id: string): Promise<T | null>;
	findOneBy(where: Partial<T>): Promise<T | null>;
	find(where: Partial<T>): Promise<T[]>;
}
