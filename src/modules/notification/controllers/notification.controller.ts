import { Controller, Get, MessageEvent, Req, Sse } from '@nestjs/common';
import { Observable } from 'rxjs';

import { AuthenticatedRequest } from '@common/types/data';

import { NotificationService } from '../providers';

@Controller()
export class NotificationController {
	constructor(private readonly notificationService: NotificationService) {}

	@Sse('sse')
	sse(@Req() req: AuthenticatedRequest): Observable<MessageEvent> {
		const uid = req.user.id;
		return this.notificationService.subscribe(uid);
	}

	@Get()
	getOwnNotifications() {}
}
