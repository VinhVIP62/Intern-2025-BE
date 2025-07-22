import { Module } from '@nestjs/common';

import { MongooseSessionService } from './provider/mongoose-session.service';
import { ISessionServiceToken } from './provider/session.service';

@Module({
	providers: [{ provide: ISessionServiceToken, useClass: MongooseSessionService }],
	exports: [ISessionServiceToken],
})
export class DataServiceModule {}
