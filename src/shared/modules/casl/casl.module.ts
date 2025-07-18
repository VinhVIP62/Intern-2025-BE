import { Module } from '@nestjs/common';

import { CaslAbilityFactory } from './provider/casl-ability.factory';
import { CaslFilterFactory } from './provider/casl-filter.factory';

@Module({
	providers: [CaslAbilityFactory, CaslFilterFactory],
	exports: [CaslAbilityFactory, CaslFilterFactory],
})
export class CaslModule {}
