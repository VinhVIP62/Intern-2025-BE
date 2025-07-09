import { PaginatedResponse } from '@common/dto/paginated-response.dto';

export function isPaginatedResponse<T>(response: unknown): response is PaginatedResponse<T> {
	if (typeof response === 'object' && response !== null) {
		const res = response as Record<string, unknown>;

		return Array.isArray(res['items']) && typeof res['meta'] === 'object' && res['meta'] !== null;
	}

	return false;
}
