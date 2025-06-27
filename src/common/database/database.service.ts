import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { IndexManager } from './indexes.config';

@Injectable()
export class DatabaseService implements OnModuleInit {
	private indexManager: IndexManager;

	constructor(@InjectConnection() private readonly connection: Connection) {
		this.indexManager = new IndexManager(this.connection);
	}

	async onModuleInit() {
		// Tự động tạo indexes khi ứng dụng khởi động
		await this.createIndexes();
	}

	/**
	 * Tạo tất cả indexes được định nghĩa
	 */
	async createIndexes(): Promise<void> {
		await this.indexManager.createAllIndexes();
	}
}
