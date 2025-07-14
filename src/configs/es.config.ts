import { ConfigService } from '@nestjs/config';

export const esConfig = (configService: ConfigService) => ({
	node: configService.get<string>('es_node') as string,
	auth: {
		apiKey: configService.get<string>('es_api_key') as string,
	},
	headers: {
		accept: 'application/vnd.elasticsearch+json; compatible-with=8',
		'content-type': 'application/vnd.elasticsearch+json; compatible-with=8',
	},
});
