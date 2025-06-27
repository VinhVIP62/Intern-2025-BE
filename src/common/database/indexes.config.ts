import { Connection } from 'mongoose';

export interface IndexConfig {
	collection: string;
	indexes: Array<{
		keys: Record<string, 1 | -1 | 'text' | '2dsphere'>;
		options?: {
			unique?: boolean;
			sparse?: boolean;
			background?: boolean;
			expireAfterSeconds?: number;
			partialFilterExpression?: Record<string, any>;
			name?: string;
		};
	}>;
}

export const INDEX_CONFIGS: IndexConfig[] = [
	// User Collection Indexes
	{
		collection: 'users',
		indexes: [
			{
				keys: { username: 1 },
				options: { unique: true, name: 'username_unique' },
			},
			{
				keys: { email: 1 },
				options: { unique: true, sparse: true, name: 'email_unique' },
			},
			{
				keys: { roles: 1 },
				options: { name: 'roles_index' },
			},
			{
				keys: { createdAt: -1 },
				options: { name: 'created_at_desc' },
			},
			{
				keys: { updatedAt: -1 },
				options: { name: 'updated_at_desc' },
			},
			// Compound index for user search
			{
				keys: { username: 1, roles: 1, createdAt: -1 },
				options: { name: 'user_search_compound' },
			},
		],
	},

	// Post Collection Indexes
	{
		collection: 'posts',
		indexes: [
			{
				keys: { authorId: 1 },
				options: { name: 'author_id_index' },
			},
			{
				keys: { createdAt: -1 },
				options: { name: 'post_created_at_desc' },
			},
			{
				keys: { updatedAt: -1 },
				options: { name: 'post_updated_at_desc' },
			},
			{
				keys: { isPublished: 1, createdAt: -1 },
				options: { name: 'published_posts_compound' },
			},
			{
				keys: { tags: 1 },
				options: { name: 'tags_index' },
			},
			// Text index for content search
			{
				keys: { title: 'text', content: 'text' },
				options: { name: 'post_text_search' },
			},
			// Compound index for author's posts
			{
				keys: { authorId: 1, createdAt: -1 },
				options: { name: 'author_posts_compound' },
			},
		],
	},

	// Comment Collection Indexes
	{
		collection: 'comments',
		indexes: [
			{
				keys: { postId: 1 },
				options: { name: 'comment_post_id' },
			},
			{
				keys: { authorId: 1 },
				options: { name: 'comment_author_id' },
			},
			{
				keys: { createdAt: -1 },
				options: { name: 'comment_created_at_desc' },
			},
			{
				keys: { parentId: 1 },
				options: { name: 'comment_parent_id' },
			},
			// Compound index for post comments
			{
				keys: { postId: 1, createdAt: -1 },
				options: { name: 'post_comments_compound' },
			},
		],
	},

	// Notification Collection Indexes
	{
		collection: 'notifications',
		indexes: [
			{
				keys: { userId: 1 },
				options: { name: 'notification_user_id' },
			},
			{
				keys: { isRead: 1 },
				options: { name: 'notification_read_status' },
			},
			{
				keys: { createdAt: -1 },
				options: { name: 'notification_created_at_desc' },
			},
			{
				keys: { type: 1 },
				options: { name: 'notification_type' },
			},
			// Compound index for user notifications
			{
				keys: { userId: 1, isRead: 1, createdAt: -1 },
				options: { name: 'user_notifications_compound' },
			},
			// TTL index for auto-delete old notifications
			{
				keys: { createdAt: 1 },
				options: {
					expireAfterSeconds: 30 * 24 * 60 * 60, // 30 days
					name: 'notification_ttl',
				},
			},
		],
	},

	// Friend Request Collection Indexes
	{
		collection: 'friendrequests',
		indexes: [
			{
				keys: { senderId: 1 },
				options: { name: 'friend_request_sender' },
			},
			{
				keys: { receiverId: 1 },
				options: { name: 'friend_request_receiver' },
			},
			{
				keys: { status: 1 },
				options: { name: 'friend_request_status' },
			},
			{
				keys: { createdAt: -1 },
				options: { name: 'friend_request_created_at' },
			},
			// Compound index for pending requests
			{
				keys: { receiverId: 1, status: 1, createdAt: -1 },
				options: { name: 'pending_friend_requests' },
			},
			// Unique compound index to prevent duplicate requests
			{
				keys: { senderId: 1, receiverId: 1 },
				options: {
					unique: true,
					name: 'friend_request_unique_pair',
				},
			},
		],
	},

	// Event Collection Indexes
	{
		collection: 'events',
		indexes: [
			{
				keys: { organizerId: 1 },
				options: { name: 'event_organizer' },
			},
			{
				keys: { startDate: 1 },
				options: { name: 'event_start_date' },
			},
			{
				keys: { endDate: 1 },
				options: { name: 'event_end_date' },
			},
			{
				keys: { status: 1 },
				options: { name: 'event_status' },
			},
			{
				keys: { location: '2dsphere' },
				options: { name: 'event_location_geo' },
			},
			// Compound index for upcoming events
			{
				keys: { startDate: 1, status: 1 },
				options: { name: 'upcoming_events' },
			},
			// Text search for events
			{
				keys: { title: 'text', description: 'text' },
				options: { name: 'event_text_search' },
			},
		],
	},

	// Achievement Collection Indexes
	{
		collection: 'achievements',
		indexes: [
			{
				keys: { userId: 1 },
				options: { name: 'achievement_user' },
			},
			{
				keys: { type: 1 },
				options: { name: 'achievement_type' },
			},
			{
				keys: { earnedAt: -1 },
				options: { name: 'achievement_earned_at' },
			},
			// Compound index for user achievements
			{
				keys: { userId: 1, type: 1 },
				options: { name: 'user_achievement_compound' },
			},
		],
	},

	// Group Collection Indexes
	{
		collection: 'groups',
		indexes: [
			{
				keys: { name: 1 },
				options: { name: 'group_name' },
			},
			{
				keys: { ownerId: 1 },
				options: { name: 'group_owner' },
			},
			{
				keys: { createdAt: -1 },
				options: { name: 'group_created_at' },
			},
			{
				keys: { isPublic: 1 },
				options: { name: 'group_visibility' },
			},
			// Text search for groups
			{
				keys: { name: 'text', description: 'text' },
				options: { name: 'group_text_search' },
			},
		],
	},
];

export class IndexManager {
	constructor(private connection: Connection) {}

	/**
	 * Tạo tất cả indexes được định nghĩa
	 */
	async createAllIndexes(): Promise<void> {
		console.log('🔧 Creating database indexes...');

		// for (const config of INDEX_CONFIGS) {
		// 	try {
		// 		const collection = this.connection.collection(config.collection);

		// 		for (const indexConfig of config.indexes) {
		// 			const indexName = indexConfig.options?.name || this.generateIndexName(indexConfig.keys);

		// 			console.log(`📝 Creating index: ${indexName} on collection: ${config.collection}`);

		// 			await collection.createIndex(indexConfig.keys, {
		// 				...indexConfig.options,
		// 				background: true, // Tạo index trong background để không block operations
		// 			});

		// 			console.log(`✅ Index created: ${indexName}`);
		// 		}
		// 	} catch (error) {
		// 		console.error(`❌ Error creating indexes for collection ${config.collection}:`, error);
		// 	}
		// }

		console.log('🎉 All indexes created successfully!');
	}

	/**
	 * Xóa tất cả indexes (trừ _id index)
	 */
	async dropAllIndexes(): Promise<void> {
		console.log('🗑️ Dropping all indexes...');

		// for (const config of INDEX_CONFIGS) {
		// 	try {
		// 		const collection = this.connection.collection(config.collection);
		// 		await collection.dropIndexes();
		// 		console.log(`✅ Dropped indexes for collection: ${config.collection}`);
		// 	} catch (error) {
		// 		console.error(`❌ Error dropping indexes for collection ${config.collection}:`, error);
		// 	}
		// }
	}

	/**
	 * Lấy thông tin về tất cả indexes
	 */
	async getIndexInfo(): Promise<Record<string, any[]>> {
		const indexInfo: Record<string, any[]> = {};

		// for (const config of INDEX_CONFIGS) {
		// 	try {
		// 		const collection = this.connection.collection(config.collection);
		// 		const indexes = await collection.indexes();
		// 		indexInfo[config.collection] = indexes;
		// 	} catch (error) {
		// 		console.error(`❌ Error getting index info for collection ${config.collection}:`, error);
		// 		indexInfo[config.collection] = [];
		// 	}
		// }

		return indexInfo;
	}

	/**
	 * Kiểm tra performance của indexes
	 */
	async analyzeIndexPerformance(): Promise<void> {
		console.log('📊 Analyzing index performance...');

		// for (const config of INDEX_CONFIGS) {
		// 	try {
		// 		const collection = this.connection.collection(config.collection);

		// 		// Sử dụng explain() để analyze query performance
		// 		const explainResult = await collection.find({}).explain('executionStats');

		// 		console.log(`📈 Collection: ${config.collection}`);
		// 		console.log(`   - Documents scanned: ${explainResult.executionStats.totalDocsExamined}`);
		// 		console.log(`   - Indexes used: ${explainResult.executionStats.totalKeysExamined}`);
		// 		console.log(`   - Execution time: ${explainResult.executionStats.executionTimeMillis}ms`);
		// 	} catch (error) {
		// 		console.error(`❌ Error analyzing performance for collection ${config.collection}:`, error);
		// 	}
		// }
	}

	private generateIndexName(keys: Record<string, any>): string {
		return Object.entries(keys)
			.map(([key, value]) => `${key}_${value}`)
			.join('_');
	}
}
