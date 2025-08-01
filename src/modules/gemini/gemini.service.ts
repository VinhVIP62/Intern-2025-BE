import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';

//define data type for gemini response
export interface classifiedSearchQuery {
	entityType: 'user' | 'post' | 'event' | 'unknown'; // Loại thực thể được tìm kiếm
	usernames: string[]; // Các tên người dùng hoặc cụm từ liên quan đến userId/authorId
	activities: string[]; // Các từ chỉ hành động (ví dụ: "chạy", "học", "hòa nhạc")
	nouns: string[]; // Các danh từ chỉ đối tượng hoặc chủ đề (ví dụ: "marathon", "AI", "ảnh")
	locations: string[]; // Các địa điểm (ví dụ: "Sài Gòn", "công viên")
	others: string[]; // Các từ khác không thuộc các danh mục trên
	events: string[]; // Các từ liên quan đến sự kiện (ví dụ: "sự kiện", "hòa nhạc")
	posts: string[]; // Các từ liên quan đến bài viết (ví dụ: "bài viết", "ảnh")
	filters: {
		username?: string; // Tên người dùng để tìm kiếm (cho user, post)
		contentKeywords?: string[]; // Từ khóa tìm trong nội dung bài đăng/mô tả sự kiện
		eventName?: string; // Tên sự kiện (cho event)
		location?: string; // Địa điểm (cho event)
		dateRange?: {
			startDate?: string; // Ngày bắt đầu (ISO string, ví dụ: "2025-07-17")
			endDate?: string; // Ngày kết thúc (ISO string, ví dụ: "2025-07-17")
		};
		privacy?: 'public' | 'friends' | 'private'; // Cài đặt quyền riêng tư (cho post)
	};
	originalQuery: string; // Truy vấn gốc của người dùng
	searchApiCall: {
		endpoint: string; // API endpoint để tìm kiếm (ví dụ: "/posts/search")
		params: Record<string, string>; // Tham số tìm kiếm (ví dụ: { q: "marathon", location: "Sài Gòn"
	};
}

@Injectable()
export class GeminiService {
	private readonly logger = new Logger(GeminiService.name);
	private readonly genAI: GoogleGenerativeAI;
	private readonly model;

	constructor() {
		const apiKey = process.env.GEMINI_API_KEY;
		if (!apiKey) {
			throw new Error('GEMINI_API_KEY is not set in environment variables.');
		}
		this.genAI = new GoogleGenerativeAI(apiKey);
		this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' }); // 'gemini-pro' thường tốt hơn cho các tác vụ suy luận phức tạp
	}

	async classifyAndExtractQuery(query: string): Promise<classifiedSearchQuery> {
		const prompt = `You are an expert API assistant specializing in social media search functionality for a platform similar to Facebook, using a MongoDB-based backend with predefined schemas for Post and Event. Your task is to classify a user query and extract specific arrays for username, activity, noun, location, other words, event-related terms, and post-related terms to support efficient search operations. Additionally, provide guidance for generating a valid access token using OAuth 2.0 for the platform's API.

**Schemas**:
1. **Post Schema**:
   - Fields: \`_id\` (ObjectId), \`title\` (string), \`username\` (string), \`content\` (string), \`images\` (string[], default: []), \`imagesIds\` (string[]), \`likeCount\` (number, default: 0), \`privacy\` (string, enum: ['public', 'private', 'friends']), \`shareCount\` (number, default: 0), \`createdAt\` (Date), \`updatedAt\` (Date).
   - Indexes: \`{ userId: 1, createdAt: -1 }\` (for user-specific posts, newest first), \`{ createdAt: -1 }\` (for all posts, newest first).
2. **Event Schema**:
   - Fields: \`_id\` (ObjectId), \`authorId\` (string, required), \`title\` (string, required), \`description\` (string, required), \`startDate\` (Date, required), \`endDate\` (Date, required), \`location\` (string, required), \`images\` (Image[], default: []), \`userJoin\` (number, default: 0), \`createdAt\` (Date), \`updatedAt\` (Date).
   - Collection: 'events'.
   - Indexes: Assume queries often filter by \`startDate\`, \`location\`, or \`title\`.

**Task**:
1. **Token Generation**:
   - Provide a step-by-step guide to generate a valid access token using OAuth 2.0 for the platform's API (assume a REST API similar to Facebook Graph API).
   - Include error handling for invalid or expired tokens.
2. **Query Classification**:
   - Classify the user query into one of the following entity types: 'post', 'event', or 'unknown' based on implied intent, even if the query does not explicitly mention "post" or "event."
   - For 'post', the query likely targets content (e.g., \`title\`, \`content\`, or \`images\`) or filters by \`username\`, \`privacy\`, or \`createdAt\`.
   - For 'event', the query likely targets events by \`title\`, \`description\`, \`location\`, \`startDate\`, or \`endDate\`.
   - For 'unknown', the query is ambiguous and does not match Post or Event criteria.
3. **Parameter Extraction**:
   - Extract specific arrays for the following:
     - \`usernames\`: Array of potential usernames or user-related terms (e.g., "John Smith" from \`username\` or \`authorId\`).
     - \`activities\`: Array of action-related terms (e.g., "chạy", "học", "hòa nhạc").
     - \`nouns\`: Array of noun phrases describing objects or topics (e.g., "marathon", "AI", "ảnh").
     - \`locations\`: Array of location-related terms (e.g., "Sài Gòn", "công viên").
     - \`others\`: Array of other meaningful terms not fitting the above categories.
     - \`events\`: Array of terms specifically related to events (e.g., "sự kiện", "hòa nhạc", "marathon").
     - \`posts\`: Array of terms specifically related to posts (e.g., "bài viết", "ảnh", "tin tức").
   - Extract filters matching schema fields:

4. **Output Format**:
   - Return a JSON object with:
     - \`entityType\`: string ('post' | 'event' | 'unknown')
     - \`usernames\`: string[] (potential usernames or user-related terms)
     - \`activities\`: string[] (action-related terms)
     - \`nouns\`: string[] (noun phrases for objects or topics)
     - \`locations\`: string[] (location-related terms)
     - \`others\`: string[] (other meaningful terms)
     - \`events\`: string[] (event-related terms)
     - \`posts\`: string[] (post-related terms)
     - \`filters\`: object (specific filters matching schema fields, e.g., \`contentKeywords\`, \`username\`, \`privacy\` for Post; \`eventName\`, \`location\`, \`dateRange\` for Event)
     - \`originalQuery\`: string (exact input query)
     - \`searchApiCall\`: object (suggested API endpoint and parameters, leveraging schema indexes)
   - Ensure the JSON is valid, with no backticks or "json" label surrounding it.
5. **Sample Code**:
   - Provide Python code snippets for generating the token and performing the search using the extracted parameters.
   - Include error handling for API requests and utilize the indexes for efficient querying.
6. **Date Handling**:
   - Use the current date (2025-07-17) as a reference for \`dateRange\`. For example, "tối nay" maps to "2025-07-17", "cuối tuần này" maps to "2025-07-19" to "2025-07-20".

**Examples**:
Query: "buổi hòa nhạc ở công viên tối nay"
Output: { "entityType": "event", "usernames": [], "activities": ["hòa nhạc"], "nouns": ["công viên"], "locations": ["công viên"], "others": [], "events": ["hòa nhạc", "tối nay"], "posts": [], "filters": { "eventName": "hòa nhạc", "location": "công viên", "dateRange": { "startDate": "2025-07-17", "endDate": "2025-07-17" } }, "originalQuery": "buổi hòa nhạc ở công viên tối nay", "searchApiCall": { "endpoint": "/events/search", "params": { "q": "hòa nhạc", "location": "công viên", "startDate": "2025-07-17", "endDate": "2025-07-17" } } }

Query: "ảnh du lịch Đà Lạt công khai"
Output: { "entityType": "post", "usernames": [], "activities": ["du lịch"], "nouns": ["ảnh", "Đà Lạt"], "locations": ["Đà Lạt"], "others": ["công khai"], "events": [], "posts": ["ảnh", "du lịch"], "filters": { "contentKeywords": ["du lịch", "Đà Lạt"], "privacy": "public" }, "originalQuery": "ảnh du lịch Đà Lạt công khai", "searchApiCall": { "endpoint": "/posts/search", "params": { "q": "du lịch Đà Lạt", "privacy": "public", "sort": "createdAt:desc" } } }

Query: "bài viết của John Smith về AI"
Output: { "entityType": "post", "usernames": ["John Smith"], "activities": [], "nouns": ["AI", "bài viết"], "locations": [], "others": ["về"], "events": [], "posts": ["bài viết", "AI"], "filters": { "username": "John Smith", "contentKeywords": ["AI"] }, "originalQuery": "bài viết của John Smith về AI", "searchApiCall": { "endpoint": "/posts/search", "params": { "userId": "John Smith", "q": "AI", "sort": "createdAt:desc" } } }

Query: "sự kiện chạy marathon ở Sài Gòn cuối tuần này"
Output: { "entityType": "event", "usernames": [], "activities": ["chạy"], "nouns": ["marathon", "sự kiện"], "locations": ["Sài Gòn"], "others": ["cuối tuần này"], "events": ["sự kiện", "marathon"], "posts": [], "filters": { "eventName": "marathon", "location": "Sài Gòn", "dateRange": { "startDate": "2025-07-19", "endDate": "2025-07-20" } }, "originalQuery": "sự kiện chạy marathon ở Sài Gòn cuối tuần này", "searchApiCall": { "endpoint": "/events/search", "params": { "q": "marathon", "location": "Sài Gòn", "startDate": "2025-07-19", "endDate": "2025-07-20" } } }

Query: "cách học NestJS hiệu quả"
Output: { "entityType": "post", "usernames": [], "activities": ["học"], "nouns": ["NestJS"], "locations": [], "others": ["cách", "hiệu quả"], "events": [], "posts": ["NestJS"], "filters": { "contentKeywords": ["NestJS", "học"] }, "originalQuery": "cách học NestJS hiệu quả", "searchApiCall": { "endpoint": "/posts/search", "params": { "q": "NestJS học", "sort": "createdAt:desc" } } }

Query: "một số thứ ngẫu nhiên"
Output: { "entityType": "unknown", "usernames": [], "activities": [], "nouns": ["thứ"], "locations": [], "others": ["một số", "ngẫu nhiên"], "events": [], "posts": [], "filters": {}, "originalQuery": "một số thứ ngẫu nhiên", "searchApiCall": { "endpoint": "/search", "params": { "q": "ngẫu nhiên" } } }

**Query**: "${query}"
**Output**:`;

		try {
			const result = await this.model.generateContent(prompt);
			const response = await result.response;
			let rawText = response.text();

			let jsonString: string | null = null;

			const jsonMatch = rawText.match(/```(?:json\n)?([\s\S]*?)```/);

			if (jsonMatch && jsonMatch[1]) {
				jsonString = jsonMatch[1].trim();
			} else {
				const plainJsonMatch = rawText.match(/\{[\s\S]*\}/);
				if (plainJsonMatch && plainJsonMatch[0]) {
					jsonString = plainJsonMatch[0].trim();
				}
			}

			if (!jsonString) {
				this.logger.error(
					`Could not extract JSON from Gemini response for query "${query}". Raw text: "${rawText}"`,
				);
				return {
					entityType: 'unknown',
					usernames: [],
					activities: [],
					nouns: [],
					locations: [],
					others: [],
					events: [],
					posts: [],
					filters: {},
					originalQuery: query,
					searchApiCall: {
						endpoint: '',
						params: {},
					},
				};
			}

			try {
				const parsedResult: classifiedSearchQuery = JSON.parse(jsonString);
				this.logger.log(`Classified query "${query}": ${JSON.stringify(parsedResult)}`);
				return parsedResult;
			} catch (jsonError) {
				this.logger.error(
					`Failed to parse JSON from Gemini for query "${query}". Extracted JSON text: "${jsonString}"`,
					jsonError.stack,
				);
				return {
					entityType: 'unknown',
					usernames: [],
					activities: [],
					nouns: [],
					locations: [],
					others: [],
					events: [],
					posts: [],
					filters: {},
					originalQuery: query,
					searchApiCall: {
						endpoint: '',
						params: {},
					},
				};
			}
		} catch (error) {
			this.logger.error(
				`Error calling Gemini API for classification: ${error.message}`,
				error.stack,
			);
			throw new Error('Failed to classify search query using Gemini API.');
		}
	}
}
