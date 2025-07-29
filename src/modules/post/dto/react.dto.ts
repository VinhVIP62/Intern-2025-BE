import { IsEnum } from 'class-validator';
import { ReactType } from '@common/enum/post/react.type.enum';

export class ReactDto {
	@IsEnum(ReactType)
	type: ReactType;
}
