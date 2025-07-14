import { Module } from '@nestjs/common';
import { EventController } from './controllers/event.controller';
import { EventService } from './providers/event.service';
import { MongooseModule } from '@nestjs/mongoose';
import { EventSchema } from './entities/event.schema';
import { IEventRepository } from './repositories/event.repository';
import { EventRepositoryImpl } from './repositories/event.repository.impl';
import { IProfileRepository } from '@modules/user/repositories/profile.repository';
import { ProfileRepositoryImpl } from '@modules/user/repositories/profile.repository.impl';
import { IEventMemberRepository } from './repositories/eventmember.repository';
import { EventMemberRepository } from './repositories/eventmember.repository.impl';
import { EventMember, EventMemberSchema } from './entities/eventmember.schema';
import { EventMapper } from './mapper/event.mapper';
import { SharedModule } from 'src/shared/shared.module';
import { SearchModule } from '@modules/search/search.module';

@Module({
	imports: [
		SharedModule,
		MongooseModule.forFeature([
			{ name: Event.name, schema: EventSchema },
			{ name: EventMember.name, schema: EventMemberSchema },
		]),
		SearchModule,
	],
	controllers: [EventController],
	providers: [
		EventService,
		{
			provide: IProfileRepository,
			useClass: ProfileRepositoryImpl,
		},
		{
			provide: IEventMemberRepository,
			useClass: EventMemberRepository,
		},
		{
			provide: IEventRepository,
			useClass: EventRepositoryImpl,
		},
		EventMapper,
	],
	exports: [EventModule],
})
export class EventModule {}
