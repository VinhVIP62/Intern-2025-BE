import { Request } from 'express';

import { Sub } from '@modules/auth/types';

// passport attaches the return value of the strategy's validate function to request.user
export interface AuthenticatedRequest extends Request {
	user: Sub;
}

export interface CustomRequest extends Partial<AuthenticatedRequest> {
	user?: Sub;
}
