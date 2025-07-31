import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as admin from 'firebase-admin';
import { z } from 'zod';
import { AppLoggerService } from '@common/logger/logger.service';
import { UserDeviceService } from './user-device.service';

// Validate cấu trúc của firebase service account bằng zod
const ServiceAccountSchema = z.object({
	project_id: z.string(),
	client_email: z.string(),
	private_key: z.string(),
});

@Injectable()
export class FirebaseService {
	constructor(
		private readonly logger: AppLoggerService,
		private readonly userDeviceService: UserDeviceService,
	) {
		try {
			const serviceAccountPath = join(__dirname, '../../../../firebase-service-account.json'); // hoặc dùng biến môi trường
			const fileContent = readFileSync(serviceAccountPath, 'utf8');
			const parsed = ServiceAccountSchema.parse(JSON.parse(fileContent)); // zod đảm bảo kiểu an toàn

			admin.initializeApp({
				credential: admin.credential.cert(parsed as admin.ServiceAccount),
			});

			this.logger.log('Firebase Admin initialized', FirebaseService.name);
		} catch (err) {
			this.logger.error(
				'Firebase Admin init failed',
				err instanceof Error ? err.message : String(err),
				err instanceof Error ? err.stack : undefined,
			);
			throw err;
		}
	}

	async sendNotificationToUser(
		userId: string,
		title: string,
		body: string,
		data?: {
			actor?: {
				_id: string;
				fullName: string;
				avatarUrl?: string;
			};
			type?: string;
			metaRef?: string;
			metaModel?: string;
		},
	): Promise<
		{
			token: string;
			notification: {
				actor?: {
					_id: string;
					fullName: string;
					avatarUrl?: string;
				};
				type?: string;
				title: string;
				content: string;
				metaRef?: string;
				metaModel?: string;
				isRead: boolean;
				createdAt: string;
			};
			messageId: string;
		}[]
	> {
		try {
			const devices = await this.userDeviceService.getActiveDevices(userId);
			const tokens = devices.map(d => d.token);

			const responses: {
				token: string;
				notification: {
					actor?: {
						_id: string;
						fullName: string;
						avatarUrl?: string;
					};
					type?: string;
					title: string;
					content: string;
					metaRef?: string;
					metaModel?: string;
					isRead: boolean;
					createdAt: string;
				};
				messageId: string;
			}[] = [];

			for (const token of tokens) {
				try {
					const message = {
						notification: { title, body },
						token,
						data: Object.fromEntries(
							Object.entries({
								type: data?.type,
								metaRef: data?.metaRef,
								metaModel: data?.metaModel,
							}).filter(([, value]) => value !== undefined),
						) as { [key: string]: string },
					};

					const messageId = await admin.messaging().send(message);
					this.logger.log(`Push sent to token ${token}: ${messageId}`, FirebaseService.name);

					responses.push({
						token,
						messageId,
						notification: {
							actor: data?.actor,
							type: data?.type,
							title,
							content: body,
							metaRef: data?.metaRef,
							metaModel: data?.metaModel,
							isRead: false,
							createdAt: new Date().toISOString(),
						},
					});
				} catch (err) {
					this.logger.warn(
						`Push failed to token ${token} - ${err instanceof Error ? err.message : String(err)}`,
						FirebaseService.name,
					);

					const firebaseError = err as { errorInfo?: { code?: string } };
					if (firebaseError.errorInfo?.code === 'messaging/invalid-registration-token') {
						await this.userDeviceService.deactivateDeviceToken(token);
					}
				}
			}

			return responses;
		} catch (err) {
			this.logger.error(
				`Gửi push notification đến user ${userId} thất bại - ${err instanceof Error ? err.message : String(err)}`,
				FirebaseService.name,
				err instanceof Error ? err.stack : undefined,
			);
			throw err;
		}
	}
}
