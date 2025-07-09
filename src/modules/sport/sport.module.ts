import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Sport, SportSchema } from './entities/sport.schema';
import { SportController } from './controllers/sport.controller';
import { SportService } from './providers/sport.service';
import { ISportRepository } from './repositories/sport.repository';
import { SportRepositoryImpl } from './repositories/sport.repository.impl';

@Module({
	imports: [MongooseModule.forFeature([{ name: Sport.name, schema: SportSchema }])],
	controllers: [SportController],
	providers: [
		SportService,
		{
			provide: ISportRepository,
			useClass: SportRepositoryImpl,
		},
	],
	exports: [SportService],
})
export class SportModule {}
