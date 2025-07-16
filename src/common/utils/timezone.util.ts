import moment from 'moment-timezone';

export function convertDateToVietnamTimezone(date: Date): string {
	return moment(date).tz('Asia/Ho_Chi_Minh').format();
}
