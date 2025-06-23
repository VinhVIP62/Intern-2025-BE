import { Otp } from '../entities/otp.schema';

export abstract class IOtpRepository {
	abstract create(email: string, otp: string): Promise<Otp>;
	abstract deleteById(id: string): Promise<void>;
	abstract findByEmail(email: string): Promise<Otp | null>;
	abstract deleteByEmail(email: string): Promise<void>;
}
