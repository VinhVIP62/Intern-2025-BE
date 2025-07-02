import { IsEnum } from 'class-validator';
import { ReactType } from '@common/enum/react.type.enum';

export class ReactDto {
	@IsEnum(ReactType)
	type: ReactType;
}
