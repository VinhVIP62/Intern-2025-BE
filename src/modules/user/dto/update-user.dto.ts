import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-uer.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
