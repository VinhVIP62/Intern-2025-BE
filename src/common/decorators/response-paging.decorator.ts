import { SetMetadata } from '@nestjs/common';

export const RESPONSE_PAGING_META = 'response_paging';

export const ResponsePaging = (message?: string) =>
	SetMetadata(RESPONSE_PAGING_META, message || 'common.response.paginate.success');
