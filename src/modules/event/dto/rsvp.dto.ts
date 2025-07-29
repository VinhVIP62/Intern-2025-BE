import { RSVP } from '@common/enum/event/event.member.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RSVPDto {
	@ApiProperty({ enum: RSVP })
	@IsString()
	state: RSVP;
}
