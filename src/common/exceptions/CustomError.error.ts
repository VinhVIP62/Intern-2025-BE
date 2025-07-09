export class CustomError extends Error {
	constructor(
		public readonly key: string,
		public readonly args?: Record<string, any>,
	) {
		super(key);
	}
}
