/* eslint-disable prettier/prettier */
import { IsNotEmpty, MinLength, Matches } from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty({ message: 'Username is required' })
    username: string;

    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
        message: 'Password must include at least one letter and one number',
    })
    password: string;
}
