import { forwardRef, Module } from '@nestjs/common';
import { verificationService } from './providers/verification.service';
import { UserModule } from '@modules/user/user.module';
import { RedisModule } from '../../modules/redis/redis.module';

@Module({
	imports: [RedisModule, forwardRef(() => UserModule)],
	providers: [verificationService],
	exports: [verificationService],
})
export class VerificationModule {}
