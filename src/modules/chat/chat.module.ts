import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatController } from '@modules/chat/controllers/chat.controller';
import { ChatService } from '@modules/chat/providers/chat.service';
import { Message, MessageSchema } from '@modules/chat/entities/message.schema';
import { IMessageRepository } from '@modules/chat/repositories/interface/message.repository';
import { MessageRepositoryImpl } from '@modules/chat/repositories/impl/message.repository.impl';
import { MessageMapper } from './mapper/message.mapper';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: Message.name,
				schema: MessageSchema,
			},
		]),
	],
	providers: [
		ChatService,
		{
			provide: IMessageRepository,
			useClass: MessageRepositoryImpl,
		},
		MessageMapper,
	],
	controllers: [ChatController],
	exports: [ChatService, IMessageRepository, MessageMapper],
})
export class ChatModule {}
