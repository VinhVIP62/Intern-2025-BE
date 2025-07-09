export type Payload = {
	email?: string;
	phoneNumber?: string;
	sub: {
		id: string;
		roles: string[];
	};
};
export type PasswordChangePayload = {
	sub: {
		userId: string;
		account: string; // email or phone
	};
	purpose: 'password-change';
	otpVerified: true; // confirms OTP was validated
};
