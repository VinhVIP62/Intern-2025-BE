import { Module } from '@nestjs/common';
import { FirebaseService } from './providers/firebase.service';
import { LoggerModule } from '@common/logger/logger.module';
import { UserDevice, UserDeviceSchema } from './entities/user-device.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { UserDeviceService } from './providers/user-device.service';
import { UserDeviceRepositoryImpl } from './repositories/user-device.repository.impl';
import { UserDeviceController } from './controllers/user-device.controller';
import { IUserDeviceRepository } from './repositories/user-device.repository';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: UserDevice.name, schema: UserDeviceSchema }]),
		LoggerModule,
	],
	controllers: [UserDeviceController],
	providers: [
		FirebaseService,
		UserDeviceService,
		{
			provide: IUserDeviceRepository,
			useClass: UserDeviceRepositoryImpl,
		},
	],
	exports: [FirebaseService, UserDeviceService],
})
export class FirebaseModule {}
