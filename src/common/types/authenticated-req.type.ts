import { Sub } from '@modules/auth/types';
import { Request } from 'express';

// passport attaches the return value of the strategy's validate function to request.user
export interface AuthenticatedRequest extends Request {
	user: Sub;
}
