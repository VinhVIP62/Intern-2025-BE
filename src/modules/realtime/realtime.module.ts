import { Module } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { SocketEventService } from './socket-event.service';

@Module({
	providers: [RealtimeGateway, SocketEventService],
	exports: [SocketEventService], // để module khác dùng push message
})
export class RealtimeModule {}
