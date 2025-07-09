import { Injectable, ExecutionContext } from '@nestjs/common';
import {
	ThrottlerGuard as BaseThrottlerGuard,
	ThrottlerStorage,
	ThrottlerModuleOptions,
} from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class ThrottlerGuard extends BaseThrottlerGuard {
	constructor(
		protected readonly options: ThrottlerModuleOptions,
		protected readonly storageService: ThrottlerStorage,
		protected readonly reflector: Reflector,
	) {
		super(options, storageService, reflector);
	}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		if (isPublic) return true;

		return super.canActivate(context);
	}
}
