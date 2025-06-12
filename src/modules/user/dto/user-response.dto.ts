/* eslint-disable prettier/prettier */
import { Exclude, Expose } from 'class-transformer';

export class ResponseUserDto {
    @Expose()
    id: string;

    @Expose()
    username: string;

    @Exclude()
    password: string;

    @Expose()
    createdAt?: Date;

    @Expose()
    updatedAt?: Date;
}
