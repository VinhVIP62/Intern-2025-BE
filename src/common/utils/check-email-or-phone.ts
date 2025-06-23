import { isEmail } from 'validator';

export function isEmailOrPhone(input: string) {
	const phoneRegex = /^0\d{9}$/;
	if (isEmail(input)) return 'email';
	if (phoneRegex.test(input)) return 'phone';
	return 'invalid';
}
