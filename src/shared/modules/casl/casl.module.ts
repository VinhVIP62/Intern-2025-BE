import { Module } from '@nestjs/common';

import { CaslAbilityFactory } from './casl-ability.factory';
import { CaslFilterFactory } from './casl-filter.factory';

@Module({
	providers: [CaslAbilityFactory, CaslFilterFactory],
	exports: [CaslAbilityFactory, CaslFilterFactory],
})
export class CaslModule {}
