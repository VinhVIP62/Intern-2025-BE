import { HttpException, HttpStatus } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

export class HttpExceptionError extends HttpException {
	constructor(
		private readonly i18n: I18nService,
		private readonly lang: string,
		private readonly key: string,
		private readonly args?: Record<string, any>,
		status: HttpStatus = HttpStatus.BAD_REQUEST,
	) {
		super('', status);
	}

	async getResponse() {
		const message = await this.i18n.translate(`response.${this.key}`, {
			lang: this.lang,
			args: this.args,
		});

		return {
			statusCode: this.getStatus(),
			message,
			error: HttpStatus[this.getStatus()],
		};
	}
}
