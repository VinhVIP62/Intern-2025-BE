import { PartialType, OmitType } from 'nestjs/mapped-types';
import { CreateUserDto } from './createUser.dto';

export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['username'] as const)) {}
