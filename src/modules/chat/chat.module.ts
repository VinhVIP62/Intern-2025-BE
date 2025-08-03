import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from '@modules/user/user.module';
import { FriendModule } from '@modules/friend/friend.module';
import { LoggerModule } from '@common/logger/logger.module';
import { FileModule } from '@modules/file/file.module';
import { Conversation, ConversationSchema } from './entities/conversation.schema';
import { Message, MessageSchema } from './entities/message.schema';
import { ConversationController } from './controllers/conversation.controller';
import { MessageController } from './controllers/message.controller';
import { MessageService } from './providers/message.service';
import { ConversationService } from './providers/conversation.service';
import { IMessageRepository } from './repositories/message.repository';
import { MessageRepositoryImpl } from './repositories/message.repository.impl';
import { IConversationRepository } from './repositories/conversation.repository';
import { ConversationRepositoryImpl } from './repositories/conversation.repository.impl';
import { RealtimeModule } from '@modules/realtime/realtime.module';
import { BlockModule } from '@modules/block/block.module';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Conversation.name, schema: ConversationSchema }]),
		MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
		UserModule,
		FriendModule,
		LoggerModule,
		FileModule,
		RealtimeModule,
		BlockModule,
	],
	controllers: [ConversationController, MessageController],
	providers: [
		MessageService,
		ConversationService,
		{
			provide: IMessageRepository,
			useClass: MessageRepositoryImpl,
		},
		{
			provide: IConversationRepository,
			useClass: ConversationRepositoryImpl,
		},
	],
	exports: [MessageService, ConversationService],
})
export class ChatModule {}
