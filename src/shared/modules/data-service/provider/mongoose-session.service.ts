import { Injectable, Scope } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ClientSession, Connection } from 'mongoose';

import { CustomRequestCtx } from '@shared/modules/request-ctx/types';

import { ISessionService } from './session.service';

@Injectable({ scope: Scope.REQUEST })
export class MongooseSessionService implements ISessionService<ClientSession> {
	constructor(@InjectConnection() private readonly connection: Connection) {}

	get(): ClientSession | null {
		const req = CustomRequestCtx.get().req;
		return req.db.mongoose.session;
	}

	set(session: ClientSession | null): void {
		const req = CustomRequestCtx.get().req;
		req.db.mongoose.session = session;
	}

	async start(): Promise<ClientSession> {
		let session = this.get();
		if (session) return session;
		session = await this.connection.startSession();
		session.startTransaction();
		this.set(session);
		return session;
	}

	async commit(): Promise<void> {
		const session = this.get();
		if (session) await session.commitTransaction();
	}

	async abort(): Promise<void> {
		const session = this.get();
		if (session) await session.abortTransaction();
	}

	async end(): Promise<void> {
		const session = this.get();
		if (session) {
			await session.endSession();
			this.set(null);
		}
	}
}
