import { RSVP } from '@common/enum/event.member.enum';
import { ApiProperty } from '@nestjs/swagger';

export class RSVPDto {
	@ApiProperty({ enum: RSVP, enumName: 'RSVP' })
	state: RSVP;
}
