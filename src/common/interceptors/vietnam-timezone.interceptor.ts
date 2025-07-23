import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { convertDateToVietnamTimezone } from '../utils/timezone.util';
import { Types } from 'mongoose'; // Thêm dòng này

function convertDatesToVietnamTimezone(obj: any, processed = new WeakSet()): any {
	// Tránh vòng lặp vô hạn bằng cách kiểm tra object đã được xử lý chưa
	if (obj && typeof obj === 'object' && processed.has(obj)) {
		return obj;
	}

	if (obj instanceof Date) {
		return convertDateToVietnamTimezone(obj);
	}
	// Nếu là string dạng ISO date
	if (typeof obj === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(obj)) {
		return convertDateToVietnamTimezone(new Date(obj));
	}

	// Nếu là ObjectId của mongoose hoặc MongoDB
	if (
		(typeof obj === 'object' && obj !== null && typeof obj.toHexString === 'function') ||
		(typeof obj === 'object' && obj !== null && obj._bsontype === 'ObjectID')
	) {
		return obj.toString();
	}

	if (Array.isArray(obj)) {
		return obj.map(item => convertDatesToVietnamTimezone(item, processed));
	}

	if (obj && typeof obj === 'object') {
		// Đánh dấu object này đã được xử lý
		processed.add(obj);

		// Nếu là Mongoose document, chỉ lấy dữ liệu sạch
		if (obj.toJSON && typeof obj.toJSON === 'function') {
			return convertDatesToVietnamTimezone(obj.toJSON(), processed);
		}

		// Nếu có _doc (Mongoose document internal), chỉ xử lý _doc
		if (obj._doc && typeof obj._doc === 'object') {
			return convertDatesToVietnamTimezone(obj._doc, processed);
		}

		// Loại bỏ các field nội bộ của Mongoose
		const newObj: any = {};
		for (const key of Object.keys(obj)) {
			// Bỏ qua các field nội bộ của Mongoose
			if (key.startsWith('$') || (key.startsWith('_') && key !== '_id')) {
				continue;
			}
			newObj[key] = convertDatesToVietnamTimezone(obj[key], processed);
		}
		return newObj;
	}

	return obj;
}

@Injectable()
export class VietnamTimezoneInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		return next.handle().pipe(map(data => convertDatesToVietnamTimezone(data)));
	}
}
