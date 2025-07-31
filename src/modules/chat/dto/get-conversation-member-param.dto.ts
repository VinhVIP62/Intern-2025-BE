import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class GetConversationMembersParamDto {
  @ApiProperty({ description: 'ID của cuộc trò chuyện (conversation)', example: '664b1d0fa1a98d5f6721aa01' })
  @IsMongoId()
  conversationId: string;
}
