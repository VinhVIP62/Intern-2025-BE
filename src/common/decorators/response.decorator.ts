import { SetMetadata } from '@nestjs/common';

export const RESPONSE_MESSAGE_KEY = 'response_message';

export const Response = (message?: string) => SetMetadata(RESPONSE_MESSAGE_KEY, message);
