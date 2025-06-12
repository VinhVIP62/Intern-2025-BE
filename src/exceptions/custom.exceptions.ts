/* eslint-disable prettier/prettier */
import { HttpException, HttpStatus } from '@nestjs/common';

export class BadRequestException extends HttpException {
    constructor(message: string = 'Bad Request') {
        super(message, HttpStatus.BAD_REQUEST);
    }
}

export class NotFoundException extends HttpException {
    constructor(message: string = 'Resource Not Found') {
        super(message, HttpStatus.NOT_FOUND);
    }
}
