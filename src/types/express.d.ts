import { AccessUser } from '@modules/auth/types/access-user.type';

declare global {
	namespace Express {
		// Mở rộng kiểu User mặc định
		interface User extends AccessUser {}

		// Cập nhật luôn request.user (tùy chọn)
		interface Request {
			user?: User | null;
		}
	}
}
