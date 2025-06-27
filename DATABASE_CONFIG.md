# Database Configuration - Connection Pooling & Timeout

## Tổng quan

Dự án đã được cấu hình với connection pooling và timeout settings cho MongoDB để tối ưu hiệu suất và độ tin cậy.

## Cấu hình Connection Pooling

### Các thông số chính:

- **maxPoolSize**: Số lượng kết nối tối đa trong pool (mặc định: 10)
- **minPoolSize**: Số lượng kết nối tối thiểu trong pool (mặc định: 2)
- **maxIdleTimeMS**: Thời gian tối đa kết nối không hoạt động trước khi đóng (mặc định: 30000ms)
- **waitQueueTimeoutMS**: Thời gian chờ tối đa trong queue (mặc định: 2500ms)
- **maxConnecting**: Số lượng kết nối tối đa đang được thiết lập đồng thời (mặc định: 2)

## Cấu hình Timeout

### Các thông số timeout:

- **serverSelectionTimeoutMS**: Timeout cho việc chọn server (mặc định: 5000ms)
- **socketTimeoutMS**: Timeout cho socket operations (mặc định: 45000ms)
- **connectTimeoutMS**: Timeout cho việc kết nối (mặc định: 10000ms)
- **heartbeatFrequencyMS**: Tần suất heartbeat (mặc định: 10000ms)

## Biến môi trường

Thêm các biến sau vào file `.env` để tùy chỉnh cấu hình:

```env
# Database Connection Pooling
DB_MAX_POOL_SIZE=10
DB_MIN_POOL_SIZE=2
DB_MAX_IDLE_TIME_MS=30000
DB_WAIT_QUEUE_TIMEOUT_MS=2500
DB_MAX_CONNECTING=2

# Database Timeout Settings
DB_SERVER_SELECTION_TIMEOUT_MS=5000
DB_SOCKET_TIMEOUT_MS=45000
DB_CONNECT_TIMEOUT_MS=10000
DB_HEARTBEAT_FREQUENCY_MS=10000
```

## Các tính năng bổ sung

### 1. Write Concern

- **w**: 'majority' - Đảm bảo write được ghi vào majority của replica set
- **j**: true - Đảm bảo write được ghi vào journal
- **wtimeout**: 10000ms - Timeout cho write operations

### 2. Read Preference

- **readPreference**: 'primaryPreferred' - Ưu tiên đọc từ primary, fallback về secondary

### 3. Retry Logic

- **retryWrites**: true - Tự động retry write operations
- **retryReads**: true - Tự động retry read operations

### 4. Compression

- **compressors**: ['zlib'] - Nén dữ liệu truyền tải
- **zlibCompressionLevel**: 6 - Mức độ nén

### 5. Buffer Configuration

- **bufferMaxEntries**: 0 - Tắt mongoose buffering
- **bufferCommands**: false - Tắt mongoose command buffering

## Khuyến nghị cho Production

### Development Environment:

```env
DB_MAX_POOL_SIZE=5
DB_MIN_POOL_SIZE=1
DB_SOCKET_TIMEOUT_MS=30000
```

### Production Environment:

```env
DB_MAX_POOL_SIZE=20
DB_MIN_POOL_SIZE=5
DB_SOCKET_TIMEOUT_MS=60000
DB_CONNECT_TIMEOUT_MS=15000
```

## Monitoring

Để monitor connection pool, bạn có thể sử dụng:

```typescript
// Trong service của bạn
import { Connection } from 'mongoose';

@Injectable()
export class DatabaseService {
	constructor(@InjectConnection() private connection: Connection) {}

	getPoolStats() {
		return this.connection.db.admin().command({ serverStatus: 1 });
	}
}
```

## Troubleshooting

### Lỗi thường gặp:

1. **Connection timeout**: Tăng `DB_CONNECT_TIMEOUT_MS`
2. **Socket timeout**: Tăng `DB_SOCKET_TIMEOUT_MS`
3. **Pool exhausted**: Tăng `DB_MAX_POOL_SIZE`
4. **Slow queries**: Kiểm tra indexes và query optimization

### Logging

Để debug connection issues, thêm logging:

```typescript
// Trong database.config.ts
connectionFactory: connection => {
	connection.on('connected', () => {
		console.log('MongoDB connected');
	});

	connection.on('error', err => {
		console.error('MongoDB connection error:', err);
	});

	connection.on('disconnected', () => {
		console.log('MongoDB disconnected');
	});

	// ... existing configuration
};
```
