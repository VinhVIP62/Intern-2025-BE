import { Module } from '@nestjs/common';
import { SocketUserService } from './socket.user.service';
import { RealtimeGateway } from './gateway';
import { ChatModule } from '@modules/chat/chat.module';
import { ChatService } from '@modules/chat/providers/chat.service';
import { MessageMapper } from '@modules/chat/mapper/message.mapper';

@Module({
	imports: [ChatModule],
	providers: [SocketUserService, RealtimeGateway, ChatService, MessageMapper],
	exports: [SocketUserService, RealtimeGateway],
})
export class SocketModule {}
