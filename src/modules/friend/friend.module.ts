import { Module } from '@nestjs/common';
import { FriendController } from './controllers/friend.controller';
import { FriendService } from './providers/friend.service';
import { MongooseModule } from '@nestjs/mongoose';
import { FriendReqSchema } from './entities/friend-req.schema';
import { FriendReq } from './entities/friend-req.schema';
import { friendRepository } from './repositories';
import { FriendGateway } from './gateway/friend.gateway';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IEnvVars } from '@configs/config';
import { JwtAccessConfig } from '@configs/index';
import { NotificationModule } from '../notification/notification.module';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: FriendReq.name, schema: FriendReqSchema }]),
		JwtModule,
		NotificationModule,
	],
	controllers: [FriendController],
	providers: [
		FriendService,
		friendRepository,
		FriendGateway,
		{
			inject: [ConfigService],
			provide: 'JWT_ACCESS_TOKEN',
			useFactory: (configService: ConfigService<IEnvVars>) => {
				const config = JwtAccessConfig(configService);
				return new JwtService(config);
			},
		},
	],
	exports: [FriendService, friendRepository],
})
export class FriendModule {}
