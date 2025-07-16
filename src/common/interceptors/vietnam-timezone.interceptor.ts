import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { convertDateToVietnamTimezone } from '../utils/timezone.util';
import { Types } from 'mongoose'; // Thêm dòng này

function convertDatesToVietnamTimezone(obj: any): any {
	if (obj instanceof Date) {
		return convertDateToVietnamTimezone(obj);
	}
	// Nếu là ObjectId của mongoose hoặc MongoDB
	if (
		(typeof obj === 'object' && obj !== null && typeof obj.toHexString === 'function') ||
		(typeof obj === 'object' && obj !== null && obj._bsontype === 'ObjectID')
	) {
		return obj.toString();
	}
	if (Array.isArray(obj)) {
		return obj.map(item => convertDatesToVietnamTimezone(item));
	}
	if (obj && typeof obj === 'object') {
		const newObj: any = {};
		for (const key of Object.keys(obj)) {
			newObj[key] = convertDatesToVietnamTimezone(obj[key]);
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
